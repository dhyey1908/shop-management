import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { Product } from '../../models/models';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../services/translation.service';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    templateUrl: './products.component.html',
    styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    showForm = false;
    editMode = false;

    currentProduct: Product = this.getEmptyProduct();

    constructor(private dataService: DataService, private router: Router, private translationService: TranslationService) { }

    ngOnInit() {
        this.dataService.products$.subscribe(products => {
            this.products = products;
        });
    }

    getEmptyProduct(): Product {
        return {
            id: Date.now().toString(),
            name: '',
            price: 0,
            category: ''
        };
    }

    addNew() {
        this.editMode = false;
        this.currentProduct = this.getEmptyProduct();
        this.showForm = true;
    }

    editProduct(product: Product) {
        this.editMode = true;
        this.currentProduct = { ...product };
        this.showForm = true;
    }

    async deleteProduct(product: Product) {
        if (confirm(`${this.translationService.translate('CONFIRM_DELETE_PRODUCT')} "${product.name}"?`)) {
            await this.dataService.deleteProduct(product.id);
        }
    }

    async saveProduct() {
        if (!this.currentProduct.name || this.currentProduct.price <= 0) {
            alert(this.translationService.translate('ERROR_REQUIRED_FIELDS'));
            return;
        }

        if (this.editMode) {
            await this.dataService.updateProduct(this.currentProduct);
        } else {
            await this.dataService.addProduct(this.currentProduct);
        }

        this.showForm = false;
        this.currentProduct = this.getEmptyProduct();
    }

    cancel() {
        this.showForm = false;
        this.currentProduct = this.getEmptyProduct();
    }

    formatCurrency(amount: number): string {
        return '₹ ' + amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    goBack() {
        this.router.navigate(['/dashboard']);
    }
}
