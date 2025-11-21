import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Customer } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './customers.component.html',
    styleUrl: './customers.component.css'
})
export class CustomersComponent implements OnInit {
    customers: Customer[] = [];
    showForm = false;
    editMode = false;

    currentCustomer: Customer = this.getEmptyCustomer();

    constructor(private dataService: DataService, private router: Router, private translationService: TranslationService) { }

    ngOnInit() {
        this.dataService.customers$.subscribe(customers => {
            this.customers = customers;
        });
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
    }

    async deleteCustomer(customer: Customer) {
        if (confirm(`${this.translationService.translate('CONFIRM_DELETE_CUSTOMER')} "${customer.name}"?`)) {
            await this.dataService.deleteCustomer(customer.id);
        }
    }

    async saveCustomer() {
        if (!this.currentCustomer.name) {
            alert(this.translationService.translate('ERROR_NAME_REQUIRED'));
            return;
        }

        if (this.editMode) {
            await this.dataService.updateCustomer(this.currentCustomer);
        } else {
            await this.dataService.addCustomer(this.currentCustomer);
        }

        this.showForm = false;
        this.currentCustomer = this.getEmptyCustomer();
    }

    cancel() {
        this.showForm = false;
        this.currentCustomer = this.getEmptyCustomer();
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }

    formatDate(date: string): string {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
