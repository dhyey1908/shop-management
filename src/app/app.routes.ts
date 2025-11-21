import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { BillingComponent } from './components/billing/billing.component';
import { ProductsComponent } from './components/products/products.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SettingsComponent } from './components/settings/settings.component';
import { InvoiceHistoryComponent } from './components/invoice-history/invoice-history.component';
import { CustomersComponent } from './components/customers/customers.component';
import { PendingBillsComponent } from './components/pending-bills/pending-bills.component';

export const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'billing', component: BillingComponent },
    { path: 'products', component: ProductsComponent },
    { path: 'customers', component: CustomersComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'invoice-history', component: InvoiceHistoryComponent },
    { path: 'pending-bills', component: PendingBillsComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '**', redirectTo: '/dashboard' }
];
