# 🎯 Quick Reference - New Features

## Customer Management

### Access
Dashboard → Click "Customers" button (green icon)

### Add Customer
1. Click "Add Customer"
2. Enter Name * (required)
3. Enter Phone * (required)
4. Optionally: Email, Address, GST Number
5. Click "Save"

### Edit/Delete Customer
- Click **Edit** to modify
- Click **Delete** to remove (with confirmation)

---

## Searchable Dropdown Component

### How to Use
```html
<app-searchable-dropdown
  [options]="dropdownOptions"
  [placeholder]="'Search customer...'"
  [label]="'Customer'"
  [(ngModel)]="selectedCustomerId"
  (selectionChange)="onCustomerSelected($event)">
</app-searchable-dropdown>
```

### Prepare Options
```typescript
dropdownOptions: DropdownOption[] = [
  { 
    value: 'customer-id-1', 
    label: 'John Doe',
    subtitle: '+91 98765 43210' // Optional
  }
];
```

---

## Date Format (dd/mm/yyyy)

### Already Applied To:
- Customer list (Created Date)
- Invoice list (Invoice Date)
- Reports (Date ranges)

### Use in Your Component:
```typescript
formatDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
```

---

## Invoice Filtering

### Simple Search
```typescript
const invoices = await this.dataService.searchInvoices('search term');
```

### Advanced Filter
```typescript
const filter: InvoiceFilter = {
  searchTerm: 'John',
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  customerId: 'customer-123',
  minAmount: 100,
  maxAmount: 5000
};

const invoices = await this.dataService.filterInvoices(filter);
```

---

## Discount Types

### In Settings
- **Default Discount Type**: 'percentage' | 'fixed'
- Set your preferred default

### In Invoice
- `discountType`: 'percentage' or 'fixed'
- `discountValue`: The value entered by user
- `discount`: Calculated discount amount

### Example:
```typescript
// Fixed
discountType: 'fixed'
discountValue: 50
discount: 50  // ₹50

// Percentage
discountType: 'percentage'
discountValue: 10
discount: calculated  // 10% of subtotal
```

---

## Smart Print Invoice

### Current Status: Foundation Ready

The invoice model now supports:
- Conditional fields (hide if zero)
- Customer details
- Notes section

### Next Implementation:
Update print template to conditionally show/hide:
```html
<div *ngIf="invoice.discount > 0">
  <span>Discount{{ invoice.discountType === 'percentage' ? ' (' + invoice.discountValue + '%)' : '' }}:</span>
  <span>{{ formatCurrency(invoice.discount) }}</span>
</div>

<div *ngIf="invoice.tax > 0">
  <span>Tax ({{ invoice.taxPercentage }}%):</span>
  <span>{{ formatCurrency(invoice.tax) }}</span>
</div>
```

---

## Data Storage

### File Locations
```
~/.config/shop-management/data/
├── customers.json          ← Customer records
├── products.json           ← Product inventory
├── settings.json           ← Shop configuration
└── invoices/
    ├── 1001.json          ← Individual invoices
    ├── 1002.json
    └── ...
```

### Customer JSON Example
```json
{
  "id": "1637498237123",
  "name": "John Doe",
  "phone": "+91 98765 43210",
  "email": "john@example.com",
  "address": "123 Main St, City",
  "gstNumber": "GST123456",
  "createdDate": "2025-11-21"
}
```

### Invoice JSON Example (Enhanced)
```json
{
  "invoiceNumber": 1001,
  "customerId": "1637498237123",
  "customerName": "John Doe",
  "customerPhone": "+91 98765 43210",
  "customerAddress": "123 Main St, City",
  "customerGST": "GST123456",
  "date": "2025-11-21",
  "items": [...],
  "subtotal": 1000,
  "discount": 100,
  "discountType": "fixed",
  "discountValue": 100,
  "tax": 162,
  "taxPercentage": 18,
  "grandTotal": 1062,
  "notes": "Thank you for your business"
}
```

---

## Routes

### New Route Added
`/customers` → CustomersComponent

### All Routes
- `/dashboard` → Dashboard
- `/billing` → Create Invoice
- `/products` → Product Management
- **/customers** → Customer Management (NEW)
- `/invoice-history` → Invoice List
- `/reports` → Sales Reports
- `/settings` → Configuration

---

## API Methods Added

### Data Service
```typescript
// Customers
await this.dataService.loadCustomers();
await this.dataService.addCustomer(customer);
await this.dataService.updateCustomer(customer);
await this.dataService.deleteCustomer(customerId);
const customer = this.dataService.getCustomerById(id);

// Invoices
await this.dataService.filterInvoices(filter);
```

### Electron Service
```typescript
// Customers
await this.electronService.getCustomers();
await this.electronService.saveCustomers(customers);

// Invoices
await this.electronService.filterInvoices(filter);
```

---

## Dashboard Updates

### New Quick Action
- **Customers** button with green gradient icon
- Navigate to customer management

### Dashboard Summary
- Shows `totalCustomers` count (in data model)
- Can be displayed in UI as needed

---

## Reports Enhancement

### Top Customer
Reports now include:
```typescript
{
  topProduct: 'Item A',      // Existing
  topCustomer: 'John Doe'    // NEW
}
```

---

## Settings Enhancement

### New Fields
- `defaultDiscountType`: 'percentage' | 'fixed'
- `phone`: Shop phone number
- `email`: Shop email

### Default Values
```typescript
{
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
}
```

---

## Command Reference

### Build & Run
```bash
# Build Angular
npm run build

# Run in Electron
npm run electron

# Dev mode (build + run)
npm run electron:dev

# Build installers
npm run electron:build:linux
npm run electron:build:win
```

---

## Keyboard Shortcuts

### In Searchable Dropdown
- Type to search
- Arrow keys to navigate
- Enter to select
- Esc to close

---

## Best Practices

### Customer Selection
1. Use searchable dropdown for better UX
2. Show customer phone in subtitle
3. Auto-fill invoice details from customer

### Date Display
- **Input**: Use `type="date"` (ISO format)
- **Display**: Use `formatDate()` helper (dd/mm/yyyy)

### Discount Handling
- Always store both `discountType` and `discountValue`
- Calculate actual `discount` amount
- Display type indicator in UI

### Filtering
- Use advanced filter for complex queries
- Use simple search for quick lookups
- Cache filter results for better performance

---

## ⚡ Pro Tips

1. **Customer Linking**: When creating invoice, store full customer details for historical accuracy

2. **Print Invoice**: Implement conditional rendering to hide zero-value fields

3. **Search Performance**: Filter API works on backend, faster than client-side filtering

4. **Data Backup**: Use existing backup/restore in Settings for all data including customers

5. **Validation**: Phone number is required for customers - ensures contact information

---

**🎯 Everything is ready to use! Start from the Customers module to test the new features!**
