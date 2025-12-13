const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const fsPromises = require('fs').promises;

let mainWindow;

// Data directory path
const dataDir = path.join(app.getPath('userData'), 'data');
const invoicesDir = path.join(dataDir, 'invoices');

// Ensure data directories exist
async function ensureDataDirectories() {
  try {
    await fsPromises.mkdir(dataDir, { recursive: true });
    await fsPromises.mkdir(invoicesDir, { recursive: true });

    // Initialize default files if they don't exist
    const productsFile = path.join(dataDir, 'products.json');
    const customersFile = path.join(dataDir, 'customers.json');
    const settingsFile = path.join(dataDir, 'settings.json');

    try {
      await fsPromises.access(productsFile);
    } catch {
      await fsPromises.writeFile(productsFile, JSON.stringify([], null, 2));
    }

    try {
      await fsPromises.access(customersFile);
    } catch {
      await fsPromises.writeFile(customersFile, JSON.stringify([], null, 2));
    }

    try {
      await fsPromises.access(settingsFile);
    } catch {
      const defaultSettings = {
        shopName: 'શ્રીનાથ એજન્સી',
        address: '',
        gstNumber: '',
        logo: '',
        taxPercentage: 0,
        defaultDiscount: 0,
        defaultDiscountType: 'fixed',
        invoiceStartNumber: 1001,
        currentInvoiceNumber: 1001,
        phone: '',
        email: ''
      };
      await fsPromises.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data directories:', error);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icons', 'icon.png')
  });

  // Load the Angular app
  const indexPath = path.join(__dirname, '../dist/frontend/browser/index.html');

  if (fs.existsSync(indexPath)) {
    mainWindow.loadFile(indexPath);
  } else {
    // Development mode - load from ng serve
    mainWindow.loadURL('http://localhost:4200');
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await ensureDataDirectories();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for File Operations

// Read JSON file
ipcMain.handle('read-json', async (event, filename) => {
  try {
    const filePath = path.join(dataDir, filename);
    try {
      await fsPromises.access(filePath);
      const data = await fsPromises.readFile(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch {
      return { success: false, error: 'File not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write JSON file
ipcMain.handle('write-json', async (event, filename, data) => {
  try {
    const filePath = path.join(dataDir, filename);
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Read invoice
ipcMain.handle('read-invoice', async (event, invoiceNumber) => {
  try {
    const filePath = path.join(invoicesDir, `${invoiceNumber}.json`);
    try {
      await fsPromises.access(filePath);
      const data = await fsPromises.readFile(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    } catch {
      return { success: false, error: 'Invoice not found' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write invoice
ipcMain.handle('write-invoice', async (event, invoiceNumber, data) => {
  try {
    const filePath = path.join(invoicesDir, `${invoiceNumber}.json`);
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get all invoices
ipcMain.handle('get-all-invoices', async () => {
  try {
    const files = await fsPromises.readdir(invoicesDir);
    const invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const data = await fsPromises.readFile(filePath, 'utf8');
        invoices.push(JSON.parse(data));
      }
    }

    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Search invoices
ipcMain.handle('search-invoices', async (event, searchTerm) => {
  try {
    const files = await fsPromises.readdir(invoicesDir);
    const invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const fileContent = await fsPromises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Search in invoice number, customer name, or date
        const searchLower = searchTerm.toLowerCase();
        if (
          data.invoiceNumber.toString().includes(searchLower) ||
          data.customerName.toLowerCase().includes(searchLower) ||
          data.date.includes(searchTerm)
        ) {
          invoices.push(data);
        }
      }
    }

    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Backup data
ipcMain.handle('backup-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Backup Data',
      defaultPath: `shop-backup-${Date.now()}.zip`,
      filters: [{ name: 'Backup Files', extensions: ['zip'] }]
    });

    if (!result.canceled && result.filePath) {
      // Simple backup - copy data directory
      const backupPath = result.filePath.replace('.zip', '');

      // Create backup directory
      await fsPromises.mkdir(backupPath, { recursive: true });

      // Copy files
      await copyFolder(dataDir, backupPath);

      return { success: true, path: backupPath };
    }

    return { success: false, error: 'Backup cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Restore data
ipcMain.handle('restore-data', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Restore Data',
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const restorePath = result.filePaths[0];

      // Copy files back
      await copyFolder(restorePath, dataDir);

      return { success: true };
    }

    return { success: false, error: 'Restore cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper function to copy folder recursively
async function copyFolder(from, to) {
  await fsPromises.mkdir(to, { recursive: true });
  const files = await fsPromises.readdir(from);

  for (const file of files) {
    const fromPath = path.join(from, file);
    const toPath = path.join(to, file);
    const stat = await fsPromises.stat(fromPath);

    if (stat.isDirectory()) {
      await copyFolder(fromPath, toPath);
    } else {
      await fsPromises.copyFile(fromPath, toPath);
    }
  }
}

// Get data directory path
ipcMain.handle('get-data-path', async () => {
  return { success: true, path: dataDir };
});

// Upload logo
ipcMain.handle('upload-logo', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Logo',
      filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const sourcePath = result.filePaths[0];
      const ext = path.extname(sourcePath);
      const destPath = path.join(dataDir, `logo${ext}`);

      // Copy logo to data directory
      await fsPromises.copyFile(sourcePath, destPath);

      return { success: true, path: destPath };
    }

    return { success: false, error: 'Upload cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Filter invoices with advanced criteria
ipcMain.handle('filter-invoices', async (event, filter) => {
  try {
    const files = await fsPromises.readdir(invoicesDir);
    let invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const fileContent = await fsPromises.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        invoices.push(data);
      }
    }

    // Apply filters
    if (filter.searchTerm && filter.searchTerm.trim() !== '') {
      const searchLower = filter.searchTerm.toLowerCase();
      invoices = invoices.filter(inv =>
        inv.invoiceNumber.toString().includes(searchLower) ||
        inv.customerName.toLowerCase().includes(searchLower) ||
        inv.date.includes(filter.searchTerm) ||
        (inv.customerPhone && inv.customerPhone.includes(filter.searchTerm))
      );
    }

    if (filter.startDate) {
      invoices = invoices.filter(inv => inv.date >= filter.startDate);
    }

    if (filter.endDate) {
      invoices = invoices.filter(inv => inv.date <= filter.endDate);
    }

    if (filter.customerId) {
      invoices = invoices.filter(inv => inv.customerId === filter.customerId);
    }

    if (filter.minAmount !== undefined && filter.minAmount !== null) {
      invoices = invoices.filter(inv => inv.grandTotal >= filter.minAmount);
    }

    if (filter.maxAmount !== undefined && filter.maxAmount !== null) {
      invoices = invoices.filter(inv => inv.grandTotal <= filter.maxAmount);
    }

    return { success: true, data: invoices };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
