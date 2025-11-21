export interface Customer {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    gstNumber?: string;
    createdDate: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
}

export interface InvoiceItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    invoiceNumber: number;
    customerId: string;
    customerName: string;
    customerPhone?: string;
    customerAddress?: string;
    customerGST?: string;
    date: string;
    items: InvoiceItem[];
    subtotal: number;
    discount: number;
    discountType: 'percentage' | 'fixed'; // New: percentage or fixed amount
    discountValue: number; // The actual discount value entered
    tax: number;
    taxPercentage: number;
    grandTotal: number;
    status: 'Paid' | 'Pending';
    notes?: string;
}

export interface Settings {
    shopName: string;
    address: string;
    gstNumber: string;
    logo: string;
    taxPercentage: number;
    defaultDiscount: number;
    defaultDiscountType: 'percentage' | 'fixed';
    invoiceStartNumber: number;
    currentInvoiceNumber: number;
    phone?: string;
    email?: string;
}

export interface DashboardSummary {
    totalInvoices: number;
    totalSales: number;
    todayInvoices: number;
    todaySales: number;
    totalCustomers: number;
}

export interface Report {
    startDate: string;
    endDate: string;
    totalSales: number;
    totalInvoices: number;
    topProduct: string;
    topCustomer: string;
    invoices: Invoice[];
}

export interface InvoiceFilter {
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
    customerId?: string;
    minAmount?: number;
    maxAmount?: number;
}
