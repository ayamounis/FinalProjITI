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
  showConfetti: boolean = false;

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

    // Handle URL parameters for Stripe redirect
    this.route.queryParams.subscribe(params => {
      const orderId = params['orderId'];
      const sessionId = params['session_id'];
      const paymentIntent = params['payment_intent'];
      const success = params['success'];

      console.log('Payment success params:', params);

      if (sessionId || paymentIntent) {
        // This is a Stripe redirect
        this.handleStripeCallback(sessionId || paymentIntent);
      } else if (orderId) {
        // Direct order ID access
        this.loadOrderDetails(parseInt(orderId));
      } else if (success === 'true') {
        // Generic success parameter
        this.handleGenericSuccess();
      } else {
        // If no specific parameters, show a generic success message
        this.handleGenericSuccess();
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
          this.triggerSuccessAnimation();
        },
        error: (error) => {
          console.error('Error loading order:', error);
          this.showError('Failed to load order details.');
        }
      });
  }

  handleStripeCallback(sessionId: string): void {
    console.log('Handling Stripe callback with session ID:', sessionId);
    
    const orderId = localStorage.getItem('latest_order_id');

    if (!orderId) {
      console.warn('No order ID found in localStorage');
      this.showError('Order ID not found. Please contact support.');
      return;
    }

    const parsedOrderId = parseInt(orderId);

    // First, try to update the order with payment information
    this.orderService.addPaymentToOrder(parsedOrderId, {
      amount: 0,
      method: 0,
      transactionId: sessionId
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        console.log('Payment recorded successfully');
        this.loadOrderDetails(parsedOrderId);
      },
      error: (error) => {
        console.error('Error recording payment:', error);
        // Even if payment recording fails, try to load order details
        this.loadOrderDetails(parsedOrderId);
      }
    });
  }

  handleGenericSuccess(): void {
    const orderId = localStorage.getItem('latest_order_id');
    
    if (orderId) {
      this.loadOrderDetails(parseInt(orderId));
    } else {
      // Show a generic success message for successful payment
      this.isLoading = false;
      this.order = {
        orderId: Math.floor(Math.random() * 1000000), // Generate a random order ID
        orderDate: new Date().toISOString(),
        totalAmount: 0,
        status: 1,
        orderItems: [],
        shippedDate: '',
        deliveredDate: '',
        shippingAddress: '',
        payments: []
      } as Order;
      this.triggerSuccessAnimation();
    }
  }

  clearCart(): void {
    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Cart cleared successfully');
          localStorage.removeItem('latest_order_id'); // Clean up
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          // Don't show error to user as this is not critical
        }
      });
  }

  triggerSuccessAnimation(): void {
    // Trigger confetti effect
    this.showConfetti = true;
    setTimeout(() => {
      this.showConfetti = false;
    }, 3000);
  }

  showError(message: string): void {
    console.error('Payment success error:', message);
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

  // Method to handle print receipt
  printReceipt(): void {
    if (this.order) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Order Receipt - #${this.order.orderId}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .order-info { margin-bottom: 20px; }
                .items { margin-bottom: 20px; }
                .total { font-weight: bold; font-size: 18px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Order Receipt</h1>
                <p>Order #${this.order.orderId}</p>
                <p>Date: ${this.formatDate(this.order.orderDate)}</p>
              </div>
              <div class="order-info">
                <h3>Order Details</h3>
                <p><strong>Status:</strong> ${this.getOrderStatus(this.order.status)}</p>
                <p><strong>Total Amount:</strong> $${this.formatPrice(this.order.totalAmount)}</p>
              </div>
              <div class="items">
                <h3>Items</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.order.orderItems?.map(item => `
                      <tr>
                        <td>${item.customProduct.customName}</td>
                        <td>${item.quantity}</td>
                        <td>$${this.formatPrice(item.totalPrice)}</td>
                      </tr>
                    `).join('') || ''}
                  </tbody>
                </table>
              </div>
              <div class="total">
                <p><strong>Total: $${this.formatPrice(this.order.totalAmount)}</strong></p>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  }
}
