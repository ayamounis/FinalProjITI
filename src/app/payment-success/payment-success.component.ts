import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { OrderService, Order } from '../order.service';
import { CartService } from '../cart.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      const sessionId = params['session_id'];

      if (orderId) {
        this.loadOrderDetails(parseInt(orderId));
      } else if (sessionId) {
        this.handleStripeCallback(sessionId);
      } else {
        this.showError('Order information not found.');
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderDetails(orderId: number): void {
    this.orderService.getOrder(orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
          this.clearCart();
        },
        error: () => this.showError('Failed to load order details.')
      });
  }

 handleStripeCallback(sessionId: string): void {
  const orderId = localStorage.getItem('latest_order_id');

  if (!orderId) {
    this.showError('Order ID not found in local storage.');
    return;
  }

  const parsedOrderId = parseInt(orderId);

  this.orderService.addPaymentToOrder(parsedOrderId, {
    amount: 0,
    method: 0,
    transactionId: sessionId
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: () => {
      this.loadOrderDetails(parsedOrderId);
    },
    error: () => this.showError('Failed to record payment.')
  });
}
  clearCart(): void {
    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Cart cleared successfully'),
        error: (error) => console.error('Error clearing cart:', error)
      });
  }

  showError(message: string): void {
    this.errorMessage = message;
    this.hasError = true;
    this.isLoading = false;
  }

  formatPrice(price: number): string {
    return price.toFixed(2);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderStatus(status: number): string {
    const statuses = {
      0: 'Pending',
      1: 'Processing',
      2: 'Shipped',
      3: 'Delivered',
      4: 'Cancelled'
    };
    return statuses[status as keyof typeof statuses] || 'Unknown';
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }

  goToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/products']);
  }
}
