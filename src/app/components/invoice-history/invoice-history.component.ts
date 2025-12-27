import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Invoice } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';
import { GujaratiInputDirective } from '../../directives/gujarati-input.directive';

@Component({
    selector: 'app-invoice-history',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, GujaratiInputDirective],
    templateUrl: './invoice-history.component.html',
    styleUrl: './invoice-history.component.css'
})
export class InvoiceHistoryComponent implements OnInit {
    invoices: Invoice[] = [];
    filteredInvoices: Invoice[] = [];
    searchTerm = '';
    selectedInvoice: Invoice | null = null;

    constructor(
        private dataService: DataService,
        private router: Router,
        private translationService: TranslationService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.loadInvoices();
    }

    async loadInvoices() {
        this.dataService.invoices$.subscribe(invoices => {
            this.invoices = invoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber);
            this.filteredInvoices = this.invoices;
        });

        this.dataService.settings$.subscribe(settings => {
            if (settings) {
                this.shopName = settings.shopName;
                this.shopPhone = settings.phone || '';
            }
        });
    }

    shopName = '';
    shopPhone = '';

    getTotalItemCount(): number {
        if (!this.selectedInvoice) return 0;
        return this.selectedInvoice.items
            .filter(item => item.productName)
            .reduce((sum, item) => sum + item.quantity, 0);
    }

    getEmptyRows(): number[] {
        return [];
    }

    async search() {
        if (!this.searchTerm.trim()) {
            this.filteredInvoices = this.invoices;
            return;
        }

        this.filteredInvoices = await this.dataService.searchInvoices(this.searchTerm);
        this.filteredInvoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber);
    }

    async viewInvoice(invoice: Invoice) {
        this.selectedInvoice = invoice;
    }

    closeModal() {
        this.selectedInvoice = null;
    }

    printInvoice() {
        window.print();
    }

    printInvoiceItem(invoice: Invoice) {
        this.selectedInvoice = invoice;
        setTimeout(() => {
            window.print();
        }, 100);
    }

    async markAsPaid(invoice: Invoice) {
        if (await this.notificationService.confirm(`${this.translationService.translate('CONFIRM_MARK_PAID')} #${invoice.invoiceNumber} ${this.translationService.translate('AS_PAID')}`)) {
            const updatedInvoice: Invoice = { ...invoice, status: 'Paid' };
            await this.dataService.saveInvoice(updatedInvoice);
            this.notificationService.showSuccess(this.translationService.translate('SUCCESS_INVOICE_PAID'));

            if (this.selectedInvoice && this.selectedInvoice.invoiceNumber === invoice.invoiceNumber) {
                this.selectedInvoice = updatedInvoice;
            }
        }
    }

    editInvoice(invoice: Invoice) {
        // Navigate to billing page with invoice data for editing
        this.router.navigate(['/billing'], {
            state: { editInvoice: invoice, returnUrl: '/invoice-history' }
        });
    }

    formatCurrency(amount: number): string {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    formatDate(date: string): string {
        if (!date) return '';
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
