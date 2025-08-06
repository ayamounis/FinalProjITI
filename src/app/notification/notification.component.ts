import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notifications; track notification.id) {
        <div class="notification notification-{{ notification.type }}" [@slideIn]>
          <div class="notification-icon">
            @if (notification.type === 'success') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"></path>
                <circle cx="12" cy="12" r="10"></circle>
              </svg>
            } @else if (notification.type === 'error') {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            }
          </div>
          <div class="notification-content">
            <h4 class="notification-title">{{ notification.title }}</h4>
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <button class="notification-close" (click)="closeNotification(notification.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: white;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      min-width: 300px;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    .notification-success {
      border-left-color: #10b981;
      background: #10b981;
      color: #ffffff;
    }

    .notification-error {
      border-left-color: #ef4444;
    }

    .notification-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notification-success .notification-icon {
      color: #ffffff;
    }

    .notification-error .notification-icon {
      color: #ef4444;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
    }

    .notification-success .notification-title {
      color: #ffffff;
    }

    .notification-message {
      margin: 0;
      font-size: 14px;
      color: #6b7280;
      line-height: 1.4;
    }

    .notification-success .notification-message {
      color: #ffffff;
    }

    .notification-close {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .notification-success .notification-close {
      color: #ffffff;
    }

    .notification-close:hover {
      background: #f3f4f6;
      color: #6b7280;
    }

    .notification-success .notification-close:hover {
      background: #059669;
      color: #ffffff;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
      }

      .notification {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
} 