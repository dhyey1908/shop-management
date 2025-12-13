import { Injectable } from '@angular/core';
import { Product, Invoice, Settings, Customer, InvoiceFilter } from '../models/models';

declare global {
    interface Window {
        electronAPI: {
            readJson: (filename: string) => Promise<any>;
            writeJson: (filename: string, data: any) => Promise<any>;
            readInvoice: (invoiceNumber: number) => Promise<any>;
            writeInvoice: (invoiceNumber: number, data: any) => Promise<any>;
            getAllInvoices: () => Promise<any>;
            searchInvoices: (searchTerm: string) => Promise<any>;
            filterInvoices: (filter: any) => Promise<any>;
            backupData: () => Promise<any>;
            restoreData: () => Promise<any>;
            getDataPath: () => Promise<any>;
            uploadLogo: () => Promise<any>;
        };
    }
}

@Injectable({
    providedIn: 'root'
})
export class ElectronService {
    isElectron = false;

    constructor() {
        this.isElectron = !!(window && window.electronAPI);
    }

    // Products
    async getProducts(): Promise<Product[]> {
        if (!this.isElectron) {
            return this.getMockProducts();
        }

        const result = await window.electronAPI.readJson('products.json');
        if (result.success) {
            return result.data;
        }
        return [];
    }

    async saveProducts(products: Product[]): Promise<boolean> {
        if (!this.isElectron) {
            localStorage.setItem('products', JSON.stringify(products));
            return true;
        }

        const result = await window.electronAPI.writeJson('products.json', products);
        return result.success;
    }

    // Customers
    async getCustomers(): Promise<Customer[]> {
        if (!this.isElectron) {
            return this.getMockCustomers();
        }

        const result = await window.electronAPI.readJson('customers.json');
        if (result.success) {
            return result.data;
        }
        return [];
    }

    async saveCustomers(customers: Customer[]): Promise<boolean> {
        if (!this.isElectron) {
            localStorage.setItem('customers', JSON.stringify(customers));
            return true;
        }

        const result = await window.electronAPI.writeJson('customers.json', customers);
        return result.success;
    }

    // Settings
    async getSettings(): Promise<Settings> {
        if (!this.isElectron) {
            return this.getMockSettings();
        }

        const result = await window.electronAPI.readJson('settings.json');
        if (result.success) {
            return result.data;
        }
        return this.getDefaultSettings();
    }

    async saveSettings(settings: Settings): Promise<boolean> {
        if (!this.isElectron) {
            localStorage.setItem('settings', JSON.stringify(settings));
            return true;
        }

        const result = await window.electronAPI.writeJson('settings.json', settings);
        return result.success;
    }

    // Invoices
    async getInvoice(invoiceNumber: number): Promise<Invoice | null> {
        if (!this.isElectron) {
            const invoices = this.getMockInvoices();
            return invoices.find(inv => inv.invoiceNumber === invoiceNumber) || null;
        }

        const result = await window.electronAPI.readInvoice(invoiceNumber);
        if (result.success) {
            return result.data;
        }
        return null;
    }

    async saveInvoice(invoice: Invoice): Promise<boolean> {
        if (!this.isElectron) {
            const invoices = this.getMockInvoices();
            const index = invoices.findIndex(inv => inv.invoiceNumber === invoice.invoiceNumber);
            if (index >= 0) {
                invoices[index] = invoice;
            } else {
                invoices.push(invoice);
            }
            localStorage.setItem('invoices', JSON.stringify(invoices));
            return true;
        }

        const result = await window.electronAPI.writeInvoice(invoice.invoiceNumber, invoice);
        return result.success;
    }

    async getAllInvoices(): Promise<Invoice[]> {
        if (!this.isElectron) {
            return this.getMockInvoices();
        }

        const result = await window.electronAPI.getAllInvoices();
        if (result.success) {
            return result.data;
        }
        return [];
    }

    async searchInvoices(searchTerm: string): Promise<Invoice[]> {
        if (!this.isElectron) {
            const invoices = this.getMockInvoices();
            return invoices.filter(inv =>
                inv.invoiceNumber.toString().includes(searchTerm) ||
                inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.date.includes(searchTerm)
            );
        }

        const result = await window.electronAPI.searchInvoices(searchTerm);
        if (result.success) {
            return result.data;
        }
        return [];
    }

    async filterInvoices(filter: InvoiceFilter): Promise<Invoice[]> {
        if (!this.isElectron) {
            let invoices = this.getMockInvoices();

            if (filter.searchTerm) {
                const searchLower = filter.searchTerm.toLowerCase();
                invoices = invoices.filter(inv =>
                    inv.invoiceNumber.toString().includes(searchLower) ||
                    inv.customerName.toLowerCase().includes(searchLower)
                );
            }

            if (filter.startDate) {
                invoices = invoices.filter(inv => inv.date >= filter.startDate!);
            }

            if (filter.endDate) {
                invoices = invoices.filter(inv => inv.date <= filter.endDate!);
            }

            return invoices;
        }

        const result = await window.electronAPI.filterInvoices(filter);
        if (result.success) {
            return result.data;
        }
        return [];
    }

    // Backup & Restore
    async backupData(): Promise<{ success: boolean; path?: string; error?: string }> {
        if (!this.isElectron) {
            return { success: false, error: 'Backup only available in desktop app' };
        }

        return await window.electronAPI.backupData();
    }

    async restoreData(): Promise<{ success: boolean; error?: string }> {
        if (!this.isElectron) {
            return { success: false, error: 'Restore only available in desktop app' };
        }

        return await window.electronAPI.restoreData();
    }

    // Logo upload
    async uploadLogo(): Promise<{ success: boolean; path?: string; error?: string }> {
        if (!this.isElectron) {
            return { success: false, error: 'Logo upload only available in desktop app' };
        }

        return await window.electronAPI.uploadLogo();
    }

    // Mock data for browser development
    private getMockProducts(): Product[] {
        const stored = localStorage.getItem('products');
        if (stored) {
            return JSON.parse(stored);
        }

        const mockProducts: Product[] = [
            { id: '1', name: 'Item A', price: 50, category: 'General' },
            { id: '2', name: 'Item B', price: 80, category: 'Drinks' },
            { id: '3', name: 'Item C', price: 40, category: 'Snacks' }
        ];
        localStorage.setItem('products', JSON.stringify(mockProducts));
        return mockProducts;
    }

    private getMockInvoices(): Invoice[] {
        const stored = localStorage.getItem('invoices');
        if (stored) {
            return JSON.parse(stored);
        }

        const mockInvoices: Invoice[] = [
            {
                invoiceNumber: 1001,
                customerId: 'mock1',
                customerName: 'Ramesh',
                customerPhone: '',
                date: '2025-11-22',
                items: [
                    { productId: '1', productName: 'Item A', quantity: 2, price: 50, total: 100 }
                ],
                subtotal: 100,
                discount: 0,
                discountType: 'fixed',
                discountValue: 0,
                tax: 0,
                taxPercentage: 0,
                grandTotal: 100,
                status: 'Paid'
            },
            {
                invoiceNumber: 1002,
                customerId: 'mock2',
                customerName: 'Meera',
                customerPhone: '',
                date: '2025-11-22',
                items: [
                    { productId: '2', productName: 'Item B', quantity: 1, price: 80, total: 80 }
                ],
                subtotal: 80,
                discount: 0,
                discountType: 'fixed',
                discountValue: 0,
                tax: 0,
                taxPercentage: 0,
                grandTotal: 80,
                status: 'Paid'
            }
        ];
        localStorage.setItem('invoices', JSON.stringify(mockInvoices));
        return mockInvoices;
    }

    private getMockSettings(): Settings {
        const stored = localStorage.getItem('settings');
        if (stored) {
            return JSON.parse(stored);
        }

        const settings = this.getDefaultSettings();
        localStorage.setItem('settings', JSON.stringify(settings));
        return settings;
    }

    private getDefaultSettings(): Settings {
        return {
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
    }

    private getMockCustomers(): Customer[] {
        const stored = localStorage.getItem('customers');
        if (stored) {
            return JSON.parse(stored);
        }

        const mockCustomers: Customer[] = [];
        localStorage.setItem('customers', JSON.stringify(mockCustomers));
        return mockCustomers;
    }
}
