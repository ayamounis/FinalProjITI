import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);

  getNotifications() {
    return this.notifications.asObservable();
  }

  showSuccess(title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  showError(title: string, message: string, duration: number = 5000) {
    const notification: Notification = {
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration
    };

    const currentNotifications = this.notifications.value;
    this.notifications.next([...currentNotifications, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }
  }

  removeNotification(id: string) {
    const currentNotifications = this.notifications.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications.next(filteredNotifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 