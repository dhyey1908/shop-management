# Shop Management - Cross-Platform Desktop App

A complete billing and shop management desktop application built with **Electron**, **Angular**, **Node.js**, and **JSON** storage. Runs on **Windows** and **Linux**.

## Features

### ✅ Billing System
- Create invoices with customer details
- Add multiple items with quantity and price
- Auto-calculation of subtotal, tax, discount, and grand total
- Save invoices as individual JSON files
- Print invoices
- View invoice history with search functionality

### ✅ Product Management
- Add, edit, and delete products
- Track stock levels automatically
- Low-stock alerts on dashboard
- Categorize products
- Real-time stock updates after billing

### ✅ Reports & Analytics
- Daily sales summary on dashboard
- Date range-based reports  
- Total sales and invoice count
- Top-selling product analytics
- Export reports as JSON
- Print-friendly report view

### ✅ Settings
- Configure shop name, address, and GST number
- Upload shop logo
- Set tax percentage and default discount
- Customize invoice numbering
- Backup and restore data functionality

### ✅ Dashboard
- Today's sales overview
- Total invoices and revenue
- Low-stock item alerts
- Quick access to all features

## Technology Stack

- **Frontend**: Angular 19
- **Desktop Framework**: Electron 28
- **Runtime**: Node.js
- **Storage**: JSON files (local)
- **Styling**: Modern CSS with premium design

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. **Clone or navigate to the project**
   ```bash
   cd /home/dhyey/Desktop/shop_management/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   
   **Option 1: Browser mode (for development)**
   ```bash
   npm start
   ```
   This will open the app in your browser at `http://localhost:4200`

   **Option 2: Electron mode**
   ```bash
   npm run electron:dev
   ```
   This will build the Angular app and launch it in Electron window

4. **Build for production**

   **For Windows:**
   ```bash
   npm run electron:build:win
   ```
   This creates an installer in `dist-electron/` folder

   **For Linux:**
   ```bash
   npm run electron:build:linux
   ```
   This creates AppImage and .deb files in `dist-electron/` folder

   **For both platforms:**
   ```bash
   npm run electron:build
   ```

## Data Storage

All data is stored locally in JSON files:

- **Location**: `~/.config/shop-management/` (Linux) or `%APPDATA%/shop-management/` (Windows)
- **Files**:
  - `data/products.json` - Product inventory
  - `data/settings.json` - App settings
  - `data/invoices/{invoiceNumber}.json` - Individual invoices

## Usage Guide

### Creating an Invoice
1. Click "New Invoice" from dashboard
2. Enter customer name
3. Add items by selecting products and quantity
4. Review auto-calculated totals
5. Adjust discount if needed
6. Save or print the invoice

### Managing Products
1. Navigate to Products
2. Click "Add Product"
3. Fill in product details (name, price, stock, category)
4. Save the product
5. Edit or delete products as needed

### Viewing Reports
1. Go to Reports
2. Select date range
3. Click "Generate" to see sales analytics
4. Export as JSON or print the report

### Configuring Settings
1. Open Settings
2. Update shop information
3. Upload logo (optional)
4. Set tax and discount defaults
5. Configure invoice numbering
6. Use Backup/Restore for data management

## Backup & Restore

### Creating Backup
1. Go to Settings → Data Management
2. Click "Backup" button
3. Choose location to save backup folder

### Restoring Data
1. Go to Settings → Data Management
2. Click "Restore" button
3. Select the backup folder location
4. Confirm restoration (will overwrite existing data)

## Keyboard Shortcuts

- **Ctrl+P / Cmd+P**: Print current invoice/report
- **Enter**: Search in invoice history
- **Esc**: Close modals

## Project Structure

```
frontend/
├── electron/              # Electron main process
│   ├── main.js           # Main Electron file
│   ├── preload.js        # Preload script for IPC
│   └── icons/            # App icons
├── src/
│   ├── app/
│   │   ├── components/   # Angular components
│   │   │   ├── dashboard/
│   │   │   ├── billing/
│   │   │   ├── products/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── invoice-history/
│   │   ├── services/     # Services
│   │   │   ├── electron.service.ts
│   │   │   └── data.service.ts
│   │   ├── models/       # TypeScript interfaces
│   │   └── app.routes.ts # Routing configuration
│   └── styles.css        # Global styles
└── package.json
```

## Features Breakdown

| Feature | Status |
|---------|--------|
| Create Invoice | ✅ |
| Auto-calculation | ✅ |
| Print Invoice | ✅ |
| Invoice Search | ✅ |
| Product CRUD | ✅ |
| Stock Management | ✅ |
| Low Stock Alerts | ✅ |
| Dashboard Analytics | ✅ |
| Date Range Reports | ✅ |
| Export JSON | ✅ |
| Settings Management | ✅ |
| Backup/Restore | ✅ |
| Cross-platform | ✅ |

## Browser Development Mode

The app includes mock data support for browser-based development:
- Uses localStorage when running in browser
- Automatically switches to Electron API when running as desktop app
- No code changes needed between modes

## Troubleshooting

### App won't start
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be v18+)

### Data not saving in browser mode
- Data is stored in localStorage
- Clear browser cache if you encounter issues

### Electron build fails
- Ensure you have built the Angular app first
- Try building Angular separately: `npm run build`
- Then run electron-builder

## License

MIT License - Free to use for personal and commercial projects

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the usage guide
3. Ensure all dependencies are up to date

## Future Enhancements

Potential features for future versions:
- PDF export for invoices and reports
- Multi-currency support
- User authentication
- Cloud backup option
- Barcode scanning
- Customer management module

---

**Built with ❤️ using Electron + Angular**
