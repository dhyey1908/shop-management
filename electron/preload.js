const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Read JSON file
    readJson: (filename) => ipcRenderer.invoke('read-json', filename),

    // Write JSON file
    writeJson: (filename, data) => ipcRenderer.invoke('write-json', filename, data),

    // Read invoice
    readInvoice: (invoiceNumber) => ipcRenderer.invoke('read-invoice', invoiceNumber),

    // Write invoice
    writeInvoice: (invoiceNumber, data) => ipcRenderer.invoke('write-invoice', invoiceNumber, data),

    // Get all invoices
    getAllInvoices: () => ipcRenderer.invoke('get-all-invoices'),

    // Search invoices
    searchInvoices: (searchTerm) => ipcRenderer.invoke('search-invoices', searchTerm),

    // Filter invoices with advanced criteria
    filterInvoices: (filter) => ipcRenderer.invoke('filter-invoices', filter),

    // Backup data
    backupData: () => ipcRenderer.invoke('backup-data'),

    // Restore data
    restoreData: () => ipcRenderer.invoke('restore-data'),

    // Get data path
    getDataPath: () => ipcRenderer.invoke('get-data-path'),

    // Upload logo
    uploadLogo: () => ipcRenderer.invoke('upload-logo')
});
