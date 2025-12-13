import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Invoice } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-pending-bills',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './pending-bills.component.html',
  styleUrl: './pending-bills.component.css'
})
export class PendingBillsComponent implements OnInit {
  pendingInvoices: Invoice[] = [];

  constructor(
    private dataService: DataService,
    private router: Router,
    private translationService: TranslationService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.dataService.invoices$.subscribe(invoices => {
      this.pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
    });
  }

  async markAsPaid(invoice: Invoice) {
    if (await this.notificationService.confirm(`${this.translationService.translate('CONFIRM_MARK_PAID')} #${invoice.invoiceNumber} ${this.translationService.translate('AS_PAID')}`)) {
      const updatedInvoice: Invoice = { ...invoice, status: 'Paid' };
      await this.dataService.saveInvoice(updatedInvoice);
      this.notificationService.showSuccess(this.translationService.translate('SUCCESS_INVOICE_PAID'));
    }
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
