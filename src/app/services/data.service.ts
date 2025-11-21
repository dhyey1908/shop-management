import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronService } from './electron.service';
import { Product, Invoice, Settings, DashboardSummary, Customer, InvoiceFilter } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private productsSubject = new BehaviorSubject<Product[]>([]);
    private customersSubject = new BehaviorSubject<Customer[]>([]);
    private settingsSubject = new BehaviorSubject<Settings | null>(null);
    private invoicesSubject = new BehaviorSubject<Invoice[]>([]);

    products$ = this.productsSubject.asObservable();
    customers$ = this.customersSubject.asObservable();
    settings$ = this.settingsSubject.asObservable();
    invoices$ = this.invoicesSubject.asObservable();

    constructor(private electronService: ElectronService) {
        this.loadInitialData();
    }

    private async loadInitialData() {
        await this.loadProducts();
        await this.loadCustomers();
        await this.loadSettings();
        await this.loadInvoices();
    }

    // Products
    async loadProducts() {
        const products = await this.electronService.getProducts();
        this.productsSubject.next(products);
    }

    async addProduct(product: Product) {
        const products = this.productsSubject.value;
        products.push(product);
        await this.electronService.saveProducts(products);
        this.productsSubject.next([...products]);
    }

    async updateProduct(product: Product) {
        const products = this.productsSubject.value;
        const index = products.findIndex(p => p.id === product.id);
        if (index >= 0) {
            products[index] = product;
            await this.electronService.saveProducts(products);
            this.productsSubject.next([...products]);
        }
    }

    async deleteProduct(productId: string) {
        const products = this.productsSubject.value;
        const filtered = products.filter(p => p.id !== productId);
        await this.electronService.saveProducts(filtered);
        this.productsSubject.next(filtered);
    }

    getProductById(id: string): Product | undefined {
        return this.productsSubject.value.find(p => p.id === id);
    }


    // Customers
    async loadCustomers() {
        const customers = await this.electronService.getCustomers();
        this.customersSubject.next(customers);
    }

    async addCustomer(customer: Customer) {
        const customers = this.customersSubject.value;
        customers.push(customer);
        await this.electronService.saveCustomers(customers);
        this.customersSubject.next([...customers]);
    }

    async updateCustomer(customer: Customer) {
        const customers = this.customersSubject.value;
        const index = customers.findIndex(c => c.id === customer.id);
        if (index >= 0) {
            customers[index] = customer;
            await this.electronService.saveCustomers(customers);
            this.customersSubject.next([...customers]);
        }
    }

    async deleteCustomer(customerId: string) {
        const customers = this.customersSubject.value;
        const filtered = customers.filter(c => c.id !== customerId);
        await this.electronService.saveCustomers(filtered);
        this.customersSubject.next(filtered);
    }

    getCustomerById(id: string): Customer | undefined {
        return this.customersSubject.value.find(c => c.id === id);
    }

    // Settings
    async loadSettings() {
        const settings = await this.electronService.getSettings();
        this.settingsSubject.next(settings);
    }

    async updateSettings(settings: Settings) {
        await this.electronService.saveSettings(settings);
        this.settingsSubject.next(settings);
    }

    getSettings(): Settings | null {
        return this.settingsSubject.value;
    }

    async getNextInvoiceNumber(): Promise<number> {
        const settings = this.settingsSubject.value;
        if (settings) {
            return settings.currentInvoiceNumber;
        }
        return 1001;
    }

    async incrementInvoiceNumber() {
        const settings = this.settingsSubject.value;
        if (settings) {
            settings.currentInvoiceNumber++;
            await this.updateSettings(settings);
        }
    }

    // Invoices
    async loadInvoices() {
        const invoices = await this.electronService.getAllInvoices();
        this.invoicesSubject.next(invoices);
    }

    async saveInvoice(invoice: Invoice) {
        await this.electronService.saveInvoice(invoice);

        // Update invoice list
        const invoices = this.invoicesSubject.value;
        const index = invoices.findIndex(inv => inv.invoiceNumber === invoice.invoiceNumber);
        if (index >= 0) {
            invoices[index] = invoice;
        } else {
            invoices.push(invoice);
            // Increment invoice number only for new invoices
            await this.incrementInvoiceNumber();
        }
        this.invoicesSubject.next([...invoices]);
    }

    async getInvoice(invoiceNumber: number): Promise<Invoice | null> {
        return await this.electronService.getInvoice(invoiceNumber);
    }

    async searchInvoices(searchTerm: string): Promise<Invoice[]> {
        if (!searchTerm.trim()) {
            return this.invoicesSubject.value;
        }
        return await this.electronService.searchInvoices(searchTerm);
    }

    async filterInvoices(filter: InvoiceFilter): Promise<Invoice[]> {
        return await this.electronService.filterInvoices(filter);
    }

    getDashboardSummary(): DashboardSummary {
        const invoices = this.invoicesSubject.value;
        const today = new Date().toISOString().split('T')[0];

        const todayInvoices = invoices.filter(inv => inv.date === today);
        const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

        return {
            totalInvoices: invoices.length,
            totalSales: invoices.reduce((sum, inv) => sum + inv.grandTotal, 0),
            todayInvoices: todayInvoices.length,
            todaySales: todaySales,
            totalCustomers: this.customersSubject.value.length
        };
    }

    // Reports
    getReportData(startDate: string, endDate: string) {
        const invoices = this.invoicesSubject.value.filter(inv =>
            inv.date >= startDate && inv.date <= endDate
        );

        const totalSales = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

        // Find top product
        const productSales: { [key: string]: number } = {};
        invoices.forEach(inv => {
            inv.items.forEach(item => {
                productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
            });
        });

        let topProduct = '';
        let maxQuantity = 0;
        for (const [product, quantity] of Object.entries(productSales)) {
            if (quantity > maxQuantity) {
                maxQuantity = quantity;
                topProduct = product;
            }
        }

        // Find top customer
        const customerSales: { [key: string]: number } = {};
        invoices.forEach(inv => {
            customerSales[inv.customerName] = (customerSales[inv.customerName] || 0) + inv.grandTotal;
        });

        let topCustomer = '';
        let maxSales = 0;
        for (const [customer, sales] of Object.entries(customerSales)) {
            if (sales > maxSales) {
                maxSales = sales;
                topCustomer = customer;
            }
        }

        return {
            startDate,
            endDate,
            totalSales,
            totalInvoices: invoices.length,
            topProduct,
            topCustomer,
            invoices
        };
    }

    // Backup & Restore
    async backupData() {
        return await this.electronService.backupData();
    }

    async restoreData() {
        const result = await this.electronService.restoreData();
        if (result.success) {
            // Reload all data
            await this.loadInitialData();
        }
        return result;
    }

    async uploadLogo() {
        return await this.electronService.uploadLogo();
    }
}
