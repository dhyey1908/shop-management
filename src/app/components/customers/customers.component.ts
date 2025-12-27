import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Customer } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';
import { NotificationService } from '../../services/notification.service';

import { GujaratiInputDirective } from '../../directives/gujarati-input.directive';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, GujaratiInputDirective],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
    customers: Customer[] = [];
    showForm = false;
    editMode = false;
    returnUrl = '/dashboard'; // Default return URL

    currentCustomer: Customer = this.getEmptyCustomer();

    constructor(
        private dataService: DataService,
        private router: Router,
        private translationService: TranslationService,
        private notificationService: NotificationService
    ) { }

    ngOnInit() {
        this.dataService.customers$.subscribe(customers => {
            this.customers = customers;
        });

        // Check if we have a return URL from navigation state
        const navigation = this.router.getCurrentNavigation();
        const returnUrl = navigation?.extras?.state?.['returnUrl'] || history.state?.returnUrl;

        if (returnUrl) {
            this.returnUrl = returnUrl;
        }
    }

    getEmptyCustomer(): Customer {
        return {
            id: Date.now().toString(),
            name: '',
            phone: '',
            email: '',
            address: '',
            gstNumber: '',
            createdDate: new Date().toISOString().split('T')[0]
        };
    }

    addNew() {
        this.editMode = false;
        this.currentCustomer = this.getEmptyCustomer();
        this.showForm = true;
    }

    editCustomer(customer: Customer) {
        this.editMode = true;
        this.currentCustomer = { ...customer };
        this.showForm = true;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async deleteCustomer(customer: Customer) {
        if (await this.notificationService.confirm(`${this.translationService.translate('CONFIRM_DELETE_CUSTOMER')} "${customer.name}"?`)) {
            await this.dataService.deleteCustomer(customer.id);
            this.notificationService.showSuccess(this.translationService.translate('SUCCESS_CUSTOMER_DELETED'));
        }
    }

    async saveCustomer() {
        if (!this.currentCustomer.name) {
            this.notificationService.showError(this.translationService.translate('ERROR_NAME_REQUIRED'));
            return;
        }

        if (this.editMode) {
            await this.dataService.updateCustomer(this.currentCustomer);
            this.notificationService.showSuccess(this.translationService.translate('SUCCESS_CUSTOMER_UPDATED'));
        } else {
            await this.dataService.addCustomer(this.currentCustomer);
            this.notificationService.showSuccess(this.translationService.translate('SUCCESS_CUSTOMER_ADDED'));
        }

        this.showForm = false;
        this.currentCustomer = this.getEmptyCustomer();
    }

    cancel() {
        this.showForm = false;
        this.currentCustomer = this.getEmptyCustomer();
    }

    goBack() {
        this.router.navigate([this.returnUrl]);
    }

    formatDate(date: string): string {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
