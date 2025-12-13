import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Settings } from '../../models/models';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
    settings: Settings = {
        shopName: '',
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

    currentLang: string = 'en';

    constructor(
        private dataService: DataService,
        private router: Router,
        private translationService: TranslationService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.currentLang = this.translationService.getCurrentLanguage();
        this.dataService.settings$.subscribe(settings => {
            if (settings) {
                this.settings = { ...settings };
            }
        });
    }

    async saveSettings() {
        if (!this.settings.shopName) {
            this.notificationService.showError(this.translationService.translate('ERROR_SHOP_NAME'));
            return;
        }

        await this.dataService.updateSettings(this.settings);
        this.notificationService.showSuccess(this.translationService.translate('SUCCESS_SETTINGS_SAVED'));
    }

    async changeLanguage() {
        this.translationService.setLanguage(this.currentLang);
        this.settings.language = this.currentLang;
        await this.dataService.updateSettings(this.settings);
    }

    async uploadLogo() {
        const result = await this.dataService.uploadLogo();
        if (result.success && result.path) {
            this.settings.logo = result.path;
        } else if (result.error) {
            this.notificationService.showError(result.error);
        }
    }

    async backup() {
        const result = await this.dataService.backupData();
        if (result.success) {
            this.notificationService.showSuccess(this.translationService.translate('SUCCESS_BACKUP'));
        } else {
            this.notificationService.showError(result.error || this.translationService.translate('ERROR_BACKUP'));
        }
    }

    async restore() {
        if (await this.notificationService.confirm(this.translationService.translate('CONFIRM_RESTORE_DATA'))) {
            const result = await this.dataService.restoreData();
            if (result.success) {
                this.notificationService.showSuccess(this.translationService.translate('SUCCESS_RESTORE'));
                location.reload();
            } else {
                this.notificationService.showError(result.error || this.translationService.translate('ERROR_RESTORE'));
            }
        }
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
