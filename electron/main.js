const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Data directory path
const dataDir = path.join(app.getPath('userData'), 'data');
const invoicesDir = path.join(dataDir, 'invoices');

// Ensure data directories exist
function ensureDataDirectories() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  // Initialize default files if they don't exist
  const productsFile = path.join(dataDir, 'products.json');
  const customersFile = path.join(dataDir, 'customers.json');
  const settingsFile = path.join(dataDir, 'settings.json');

  if (!fs.existsSync(productsFile)) {
    fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(customersFile)) {
    fs.writeFileSync(customersFile, JSON.stringify([], null, 2));
  }

  if (!fs.existsSync(settingsFile)) {
    const defaultSettings = {
      shopName: 'My Shop',
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
    fs.writeFileSync(settingsFile, JSON.stringify(defaultSettings, null, 2));
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

app.whenReady().then(() => {
  ensureDataDirectories();
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
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write JSON file
ipcMain.handle('write-json', async (event, filename, data) => {
  try {
    const filePath = path.join(dataDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Read invoice
ipcMain.handle('read-invoice', async (event, invoiceNumber) => {
  try {
    const filePath = path.join(invoicesDir, `${invoiceNumber}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return { success: true, data: JSON.parse(data) };
    }
    return { success: false, error: 'Invoice not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Write invoice
ipcMain.handle('write-invoice', async (event, invoiceNumber, data) => {
  try {
    const filePath = path.join(invoicesDir, `${invoiceNumber}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Get all invoices
ipcMain.handle('get-all-invoices', async () => {
  try {
    const files = fs.readdirSync(invoicesDir);
    const invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const data = fs.readFileSync(filePath, 'utf8');
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
    const files = fs.readdirSync(invoicesDir);
    const invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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
      if (!fs.existsSync(backupPath)) {
        fs.mkdirSync(backupPath, { recursive: true });
      }

      // Copy files
      copyFolderSync(dataDir, backupPath);

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
      copyFolderSync(restorePath, dataDir);

      return { success: true };
    }

    return { success: false, error: 'Restore cancelled' };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Helper function to copy folder
function copyFolderSync(from, to) {
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  const files = fs.readdirSync(from);

  files.forEach(file => {
    const fromPath = path.join(from, file);
    const toPath = path.join(to, file);

    if (fs.statSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
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
      fs.copyFileSync(sourcePath, destPath);

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
    const files = fs.readdirSync(invoicesDir);
    let invoices = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(invoicesDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
