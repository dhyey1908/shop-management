import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../services/data.service';
import { DashboardSummary } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { FontSizeService, FontSize } from '../../services/font-size.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule, TranslatePipe],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    summary: DashboardSummary = {
        totalInvoices: 0,
        totalSales: 0,
        todayInvoices: 0,
        todaySales: 0,
        totalCustomers: 0
    };

    shopName = 'શ્રીનાથ એજન્સી';
    logo = 'logo.png';
    currentFontSize: FontSize = 'medium';

    constructor(
        private dataService: DataService,
        private router: Router,
        private fontSizeService: FontSizeService
    ) { }

    ngOnInit() {
        this.loadData();

        // Subscribe to settings for shop name and logo
        this.dataService.settings$.subscribe(settings => {
            if (settings) {
                this.shopName = settings.shopName;
                this.logo = settings.logo || 'logo.png';
            }
        });

        // Subscribe to font size changes
        this.fontSizeService.currentSize$.subscribe(size => {
            this.currentFontSize = size;
        });
    }

    loadData() {
        this.dataService.invoices$.subscribe(() => {
            this.summary = this.dataService.getDashboardSummary();
        });
    }

    navigateTo(route: string) {
        this.router.navigate([route]);
    }

    formatCurrency(amount: number): string {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    increaseFontSize() {
        this.fontSizeService.increaseFontSize();
    }

    decreaseFontSize() {
        this.fontSizeService.decreaseFontSize();
    }

    getFontSizeLabel(): string {
        const labels: Record<FontSize, string> = {
            'small': 'FONT_SMALL',
            'medium': 'FONT_MEDIUM',
            'large': 'FONT_LARGE',
            'extra-large': 'FONT_EXTRA_LARGE'
        };
        return labels[this.currentFontSize];
    }
}
