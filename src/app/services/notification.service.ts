import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
    type: 'success' | 'error' | 'info';
    message: string;
    id: number;
}

export interface ConfirmationDialog {
    message: string;
    resolve: (result: boolean) => void;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    notifications$ = this.notificationsSubject.asObservable();

    private confirmationSubject = new BehaviorSubject<ConfirmationDialog | null>(null);
    confirmation$ = this.confirmationSubject.asObservable();

    constructor() { }

    showSuccess(message: string) {
        this.addNotification('success', message);
    }

    showError(message: string) {
        this.addNotification('error', message);
    }

    showInfo(message: string) {
        this.addNotification('info', message);
    }

    private addNotification(type: 'success' | 'error' | 'info', message: string) {
        const currentNotifications = this.notificationsSubject.value;
        const notification: Notification = {
            type,
            message,
            id: Date.now()
        };
        this.notificationsSubject.next([...currentNotifications, notification]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, 3000);
    }

    removeNotification(id: number) {
        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next(currentNotifications.filter(n => n.id !== id));
    }

    confirm(message: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.confirmationSubject.next({
                message,
                resolve: (result: boolean) => {
                    this.confirmationSubject.next(null);
                    resolve(result);
                }
            });
        });
    }
}
