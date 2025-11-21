import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Report } from '../../models/models';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
    startDate = '';
    endDate = '';
    report: Report | null = null;
    selectedInvoice: any | null = null;

    constructor(private dataService: DataService, private router: Router, private translationService: TranslationService) { }

    ngOnInit() {
        // Set default dates (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        this.endDate = end.toISOString().split('T')[0];
        this.startDate = start.toISOString().split('T')[0];

        this.generateReport();
    }

    generateReport() {
        if (!this.startDate || !this.endDate) {
            alert(this.translationService.translate('ERROR_SELECT_DATE'));
            return;
        }

        if (this.startDate > this.endDate) {
            alert(this.translationService.translate('ERROR_DATE_RANGE'));
            return;
        }

        this.report = this.dataService.getReportData(this.startDate, this.endDate);
    }

    exportJSON() {
        if (!this.report) return;

        const dataStr = JSON.stringify(this.report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${this.startDate}-to-${this.endDate}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    printReport() {
        window.print();
    }

    viewInvoice(invoice: any) {
        this.selectedInvoice = invoice;
    }

    closeModal() {
        this.selectedInvoice = null;
    }

    printInvoiceItem(invoice: any) {
        this.selectedInvoice = invoice;
        setTimeout(() => {
            window.print();
        }, 100);
    }

    goBack() {
        this.router.navigate(['/dashboard']);
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
}
