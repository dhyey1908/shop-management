# 🚀 Quick Start Guide - Shop Management Desktop App

## ⚡ Running the App

### **Method 1: Browser Mode (Quick Testing)**
```bash
npm start
```
Open browser at: http://localhost:4200

### **Method 2: Desktop App (Recommended)**
```bash
# Linux
./start-app.sh

# Or manually
npm run electron:dev
```

### **Method 3: Production Build**
```bash
# For Linux
npm run electron:build:linux

# For Windows (if on Windows)
npm run electron:build:win

# The installer will be in: dist-electron/
```

## 📊 Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Run in browser (development) |
| `npm run electron:dev` | Run as desktop app (development) |
| `npm run electron:build` | Build for all platforms |
| `npm run electron:build:linux` | Build for Linux only |
| `npm run electron:build:win` | Build for Windows only |
| `./start-app.sh` | Quick start script (Linux) |

## 🎯 First Time Setup

1. **Start the app**
   ```bash
   ./start-app.sh
   ```

2. **Configure Settings**
   - Click "Settings" from dashboard
   - Enter your shop name and details
   - Set tax percentage (e.g., 18% for GST)
   - Click "Save Settings"

3. **Add Products**
   - Click "Products"
   - Add your inventory items
   - Set prices and stock levels

4. **Create Your First Invoice**
   - Click "New Invoice"
   - Enter customer name
   - Add items
   - Review totals
   - Save or Print

## 💾 Data Storage Location

Your data is stored locally at:
- **Linux**: `~/.config/shop-management/data/`
- **Windows**: `%APPDATA%/shop-management/data/`

Contains:
- `products.json` - Your product inventory
- `settings.json` - Shop configuration
- `invoices/` - Folder with all invoices

## 🔧 Troubleshooting

### App won't start?
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Need to reset data?
```bash
# Delete data folder
rm -rf ~/.config/shop-management/data/
# Restart the app to recreate with defaults
```

### Build errors?
```bash
# Clear Angular cache
npm run build -- --delete-output-path
```

## ✨ Key Features Demo

### Creating an Invoice
1. Dashboard → "New Invoice"
2. Enter customer name
3. Click "Add Item"
4. Select product and quantity
5. Repeat for more items
6. Discount automatically applied
7. Tax calculated automatically
8. "Save Invoice" or "Print"

### Managing Stock
- Products → Edit → Change stock count
- Or let billing auto-update stock
- Dashboard shows low stock alerts (≤5 items)

### Viewing Reports
- Reports → Select date range
- See total sales, invoice count
- Export as JSON
- Print for records

### Backup Data
- Settings → "Backup" button
- Choose folder location
- All data copied

## 🎨 Modern UI Features

- ✅ Gradient color scheme
- ✅ Smooth animations
- ✅ Responsive layout
- ✅ Print-friendly views
- ✅ Professional design
- ✅ Icon-based navigation

## 📱 Keyboard Shortcuts

- `Ctrl+P` / `Cmd+P` - Print invoice/report
- `Enter` - Submit forms/search
- `Esc` - Close modals

## 🔐 Data Security

- All data stored locally on your machine
- No internet connection required
- No external database or cloud
- Full control over your data

## 📈 Next Steps

1. ✅ Run the app
2. ✅ Configure shop settings
3. ✅ Add your products
4. ✅ Create test invoice
5. ✅ Try reports
6. ✅ Create backup

## 🆘 Need Help?

Check the main `README.md` for:
- Detailed feature documentation
- Project structure
- Advanced configuration
- Build instructions

---

**Happy Billing! 🎉**
