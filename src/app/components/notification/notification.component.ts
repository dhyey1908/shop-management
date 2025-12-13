import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification, ConfirmationDialog } from '../../services/notification.service';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="notifications-container">
            <div *ngFor="let notification of notifications" class="notification" [ngClass]="notification.type">
                <div class="notification-content">
                    <span class="icon" *ngIf="notification.type === 'success'">✓</span>
                    <span class="icon" *ngIf="notification.type === 'error'">✕</span>
                    <span class="icon" *ngIf="notification.type === 'info'">ℹ</span>
                    <span class="message">{{ notification.message }}</span>
                </div>
                <button class="close-btn" (click)="close(notification.id)">×</button>
            </div>
        </div>

        <div class="confirmation-overlay" *ngIf="confirmationDialog">
            <div class="confirmation-box">
                <p class="confirmation-message">{{ confirmationDialog.message }}</p>
                <div class="confirmation-actions">
                    <button class="btn-cancel" (click)="confirm(false)">Cancel</button>
                    <button class="btn-confirm" (click)="confirm(true)">Confirm</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .notifications-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none; /* Allow clicks to pass through container */
        }

        .notification {
            background: white;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            pointer-events: auto; /* Re-enable clicks for notifications */
            border-left: 4px solid #ccc;
        }

        .notification.success { border-left-color: #10b981; }
        .notification.error { border-left-color: #ef4444; }
        .notification.info { border-left-color: #3b82f6; }

        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .icon {
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            color: white;
        }

        .success .icon { background-color: #10b981; }
        .error .icon { background-color: #ef4444; }
        .info .icon { background-color: #3b82f6; }

        .message {
            color: #1f2937;
            font-size: 0.95rem;
        }

        .close-btn {
            background: none;
            border: none;
            color: #9ca3af;
            font-size: 1.25rem;
            cursor: pointer;
            padding: 0 0 0 12px;
            line-height: 1;
        }

        .close-btn:hover {
            color: #4b5563;
        }

        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        /* Confirmation Dialog */
        .confirmation-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.2s ease-out;
        }

        .confirmation-box {
            background: white;
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            width: 90%;
            max-width: 400px;
            animation: scaleIn 0.2s ease-out;
        }

        .confirmation-message {
            font-size: 1.1rem;
            color: #1f2937;
            margin-bottom: 24px;
            text-align: center;
        }

        .confirmation-actions {
            display: flex;
            justify-content: center;
            gap: 16px;
        }

        button {
            padding: 8px 24px;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
        }

        .btn-cancel {
            background-color: #f3f4f6;
            color: #4b5563;
        }

        .btn-cancel:hover {
            background-color: #e5e7eb;
        }

        .btn-confirm {
            background-color: #2563eb;
            color: white;
        }

        .btn-confirm:hover {
            background-color: #1d4ed8;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes scaleIn {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
    `]
})
export class NotificationComponent implements OnInit {
    notifications: Notification[] = [];
    confirmationDialog: ConfirmationDialog | null = null;

    constructor(private notificationService: NotificationService) { }

    ngOnInit() {
        this.notificationService.notifications$.subscribe(notifications => {
            this.notifications = notifications;
        });

        this.notificationService.confirmation$.subscribe(dialog => {
            this.confirmationDialog = dialog;
        });
    }

    close(id: number) {
        this.notificationService.removeNotification(id);
    }

    confirm(result: boolean) {
        if (this.confirmationDialog) {
            this.confirmationDialog.resolve(result);
        }
    }
}
