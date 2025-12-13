import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { SearchableDropdownComponent } from '../searchable-dropdown/searchable-dropdown.component';
import { Product, Invoice, InvoiceItem, Customer } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-billing',
    standalone: true,
    imports: [CommonModule, FormsModule, SearchableDropdownComponent, TranslatePipe],
    templateUrl: './billing.component.html',
    styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
    customers: Customer[] = [];
    customerOptions: any[] = [];
    selectedCustomerId = '';
    customerName = '';
    customerPhone = '';
    customerAddress = '';
    customerGST = '';

    date = '';
    invoiceNumber = 0;

    products: Product[] = [];
    productOptions: any[] = [];
    selectedProductId = '';
    quantity = 1;

    items: any[] = []; // Allow partial items during entry
    subtotal = 0;
    discountPercentage = 0;
    defaultDiscount = 0; // Store default discount
    discountAmount = 0;
    grandTotal = 0;
    paymentStatus: 'Paid' | 'Pending' = 'Pending';
    isEditMode = false;
    returnUrl = '/dashboard'; // Default return URL

    shopName = '';
    shopAddress = '';
    shopPhone = '';
    shopEmail = '';
    shopGST = '';

    constructor(
        private dataService: DataService,
        private router: Router,
        private translationService: TranslationService,
        private notificationService: NotificationService
    ) { }

    async ngOnInit() {
        this.date = new Date().toISOString().split('T')[0];
        this.invoiceNumber = await this.dataService.getNextInvoiceNumber();

        this.dataService.products$.subscribe(products => {
            this.products = products;
            this.productOptions = products.map(p => ({
                value: p.id,
                label: p.name,
                subtitle: `₹${p.price}`
            }));
        });

        this.dataService.customers$.subscribe(customers => {
            this.customers = customers;
            this.customerOptions = customers.map(c => ({
                value: c.id,
                label: c.name,
                subtitle: c.phone
            }));
        });

        this.dataService.settings$.subscribe(settings => {
            if (settings) {
                this.discountPercentage = settings.defaultDiscount;
                this.defaultDiscount = settings.defaultDiscount; // Store for reset
                this.shopName = settings.shopName;
                this.shopAddress = settings.address;
                this.shopPhone = settings.phone || '';
                this.shopEmail = settings.email || '';
                this.shopGST = settings.gstNumber || '';
            }
        });

        // Check if we're editing an existing invoice
        const navigation = this.router.getCurrentNavigation();
        const editInvoice = navigation?.extras?.state?.['editInvoice'] || history.state?.editInvoice;
        const returnUrl = navigation?.extras?.state?.['returnUrl'] || history.state?.returnUrl;

        if (returnUrl) {
            this.returnUrl = returnUrl;
        }

        if (editInvoice) {
            // Load invoice data for editing
            this.loadInvoiceForEdit(editInvoice);
        } else {
            // Start with one empty row for new invoice
            this.addNewItemRow();
        }
    }

    loadInvoiceForEdit(invoice: any) {
        // Enable edit mode
        this.isEditMode = true;

        // Set invoice number and date
        this.invoiceNumber = invoice.invoiceNumber;
        this.date = invoice.date;

        // Set customer information
        this.selectedCustomerId = invoice.customerId || '';
        this.customerName = invoice.customerName || '';
        this.customerPhone = invoice.customerPhone || '';
        this.customerAddress = invoice.customerAddress || '';
        this.customerGST = invoice.customerGST || '';

        // Set items
        this.items = invoice.items.map((item: any) => ({
            productId: item.productId || '',
            productName: item.productName || '',
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: item.total || 0
        }));

        // Set discount
        this.discountPercentage = invoice.discountValue || 0;

        // Set payment status
        this.paymentStatus = invoice.status || 'Paid';

        // Calculate totals
        this.calculateTotals();
    }

    onCustomerSelect(customerId: string) {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.customerName = customer.name;
            this.customerPhone = customer.phone || '';
            this.customerAddress = customer.address || '';
            this.customerGST = customer.gstNumber || '';
        }
    }

    goToAddCustomer() {
        this.router.navigate(['/customers'], {
            state: { returnUrl: '/billing' }
        });
    }

    addNewItemRow() {
        this.items.push({
            productId: '',
            productName: '',
            quantity: 1,
            price: 0,
            total: 0
        });
    }

    onProductSelect(index: number, productId: string) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.items[index].productId = product.id;
            this.items[index].productName = product.name;
            this.items[index].price = product.price;
            this.items[index].total = this.items[index].quantity * product.price;
            this.calculateTotals();
        }
    }

    removeItem(index: number) {
        if (this.items.length > 1) {
            this.items.splice(index, 1);
            this.calculateTotals();
        } else {
            // If it's the last item, just clear it
            this.items[0] = {
                productId: '',
                productName: '',
                quantity: 1,
                price: 0,
                total: 0
            };
            this.calculateTotals();
        }
    }

    updateQuantity(index: number, newQuantity: number) {
        if (newQuantity < 1) newQuantity = 1;
        this.items[index].quantity = newQuantity;
        this.items[index].total = this.items[index].quantity * this.items[index].price;
        this.calculateTotals();
    }

    updatePrice(index: number, newPrice: number) {
        if (newPrice < 0) newPrice = 0;
        this.items[index].price = newPrice;
        this.items[index].total = this.items[index].quantity * this.items[index].price;
        this.calculateTotals();
    }

    calculateTotals() {
        this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
        this.discountAmount = (this.subtotal * this.discountPercentage) / 100;
        this.grandTotal = this.subtotal - this.discountAmount;
    }

    onDiscountChange() {
        if (this.discountPercentage < 0) this.discountPercentage = 0;
        if (this.discountPercentage > 100) this.discountPercentage = 100;
        this.calculateTotals();
    }

    async saveInvoice(navigate: boolean = true): Promise<boolean> {
        if (!this.customerName.trim()) {
            this.notificationService.showError(this.translationService.translate('ERROR_CUSTOMER_NAME'));
            return false;
        }

        if (!this.date) {
            this.notificationService.showError(this.translationService.translate('ERROR_DATE_REQUIRED'));
            return false;
        }

        // Filter out items with no product selected
        const validItems = this.items.filter(item => item.productId && item.quantity > 0);

        if (validItems.length === 0) {
            this.notificationService.showError(this.translationService.translate('ERROR_ADD_ITEM'));
            return false;
        }

        const invoice: Invoice = {
            invoiceNumber: this.invoiceNumber,
            customerId: this.selectedCustomerId || 'walk-in',
            customerName: this.customerName,
            customerPhone: this.customerPhone,
            customerAddress: this.customerAddress,
            customerGST: this.customerGST,
            date: this.date,
            items: validItems,
            subtotal: this.subtotal,
            discount: this.discountAmount,
            discountType: 'percentage',
            discountValue: this.discountPercentage,
            tax: 0,
            taxPercentage: 0,
            grandTotal: this.grandTotal,
            status: this.paymentStatus
        };

        try {
            await this.dataService.saveInvoice(invoice);
            const successMessage = this.isEditMode ? 'SUCCESS_INVOICE_UPDATED' : 'SUCCESS_INVOICE_SAVED';
            this.notificationService.showSuccess(this.translationService.translate(successMessage));

            if (navigate) {
                if (this.isEditMode) {
                    // Navigate back to the page where user came from
                    this.router.navigate([this.returnUrl]);
                } else {
                    this.router.navigate(['/dashboard']);
                }
            }
            return true;
        } catch (error) {
            this.notificationService.showError(this.translationService.translate('ERROR_SAVING_INVOICE'));
            console.error(error);
            return false;
        }
    }

    async printInvoice() {
        const saved = await this.saveInvoice(false);
        if (saved) {
            // Use afterprint event to ensure we clear ONLY after the print dialog is closed
            // This prevents the form from clearing while the print preview is generating
            const cleanup = () => {
                this.resetForm();
                window.removeEventListener('afterprint', cleanup);
            };

            window.addEventListener('afterprint', cleanup);

            // Wait a bit for UI to update if needed, then print
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }

    async clearForm() {
        if (await this.notificationService.confirm(this.translationService.translate('CONFIRM_CLEAR_FORM'))) {
            this.resetForm();
        }
    }

    async resetForm() {
        this.selectedCustomerId = '';
        this.customerName = '';
        this.customerPhone = '';
        this.customerAddress = '';
        this.customerGST = '';
        this.items = [];
        this.paymentStatus = 'Pending';
        this.discountPercentage = this.defaultDiscount; // Reset to default discount
        this.addNewItemRow();
        this.calculateTotals();

        // Get next invoice number
        this.invoiceNumber = await this.dataService.getNextInvoiceNumber();
        // Reset date to today
        this.date = new Date().toISOString().split('T')[0];
        // Reset edit mode if we were editing
        this.isEditMode = false;
    }

    async goBack() {
        if (this.items.length > 1 || (this.items.length === 1 && this.items[0].productId) || this.selectedCustomerId) {
            if (!await this.notificationService.confirm(this.translationService.translate('CONFIRM_GO_BACK'))) {
                return;
            }
        }
        this.router.navigate(['/dashboard']);
    }

    formatCurrency(amount: number): string {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatDate(date: string): string {
        if (!date) return '';
        // Handle YYYY-MM-DD string directly to avoid timezone issues
        if (date.includes('-')) {
            const parts = date.split('-');
            if (parts.length === 3 && parts[0].length === 4) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
        }
        // Fallback for other formats
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    getTotalItemCount(): number {
        return this.items
            .filter(item => item.productName)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    getEmptyRows(): number[] {
        // Render only the actual item rows in the print template.
        // Previously this method used the total item quantity and forced a minimum
        // of 5 rows which caused extra blank rows to appear. Return an empty
        // array so no extra empty rows are rendered. If you want a minimum
        // number of rows for printing, change this method to use a configurable
        // min value instead.
        return [];
    }
}
