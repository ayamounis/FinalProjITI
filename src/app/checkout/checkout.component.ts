import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService, CartItem } from '../cart.service';
import { AuthService } from '../auth.service';
import { OrderService, CreateOrderRequest } from '../order.service';
import { PaymentService } from '../payment.service';

export interface OrderItem {
  orderItemId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customProduct: {
    customProductId: number;
    customName: string;
    customDescription: string;
    customImageUrl: string;
    price: number;
    createdAt: string;
    productTemplateId: number;
    userId: string;
    elements: string;
  };
}

export interface Payment {
  paymentId: number;
  amount: number;
  status: number;
  method: number;
  paymentDate: string;
  transactionId: string;
}

export interface Order {
  orderId: number;
  totalAmount: number;
  status: number;
  orderDate: string;
  shippedDate: string;
  deliveredDate: string;
  shippingAddress: string;
  orderItems: OrderItem[];
  payments: Payment[];
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  checkoutForm: FormGroup;
  isProcessing: boolean = false;
  isLoadingCart: boolean = false;
  paymentMethod: string = 'stripe';
  currentOrder: Order | null = null;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private orderService: OrderService,
    private paymentService: PaymentService,
    public router: Router
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['stripe', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadCartItems(): void {
    this.isLoadingCart = true;
    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.cartItems = items || [];
          this.isLoadingCart = false;

          if (this.cartItems.length === 0) {
            alert('Your cart is empty!');
            this.router.navigate(['/cart']);
          }
        },
        error: (error) => {
          console.error('Error loading cart items:', error);
          this.isLoadingCart = false;
          this.handleError(error);
        }
      });
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.customProduct.price * item.quantity);
    }, 0);
  }

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)}`;
  }

  onPaymentMethodChange(method: string): void {
    this.paymentMethod = method;
    this.checkoutForm.patchValue({ paymentMethod: method });
  }

  async processOrder(): Promise<void> {
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    try {
      const orderData = this.prepareOrderData();
      console.log('Prepared order data:', orderData);
      
      const createdOrder = await this.createOrder(orderData);

      if (createdOrder) {
        this.currentOrder = createdOrder;
        console.log('Order created successfully:', createdOrder);

        if (this.paymentMethod === 'stripe') {
          await this.processStripePayment(createdOrder.orderId);
        } else {
          throw new Error('Unsupported payment method');
        }
      }
    } catch (error: any) {
      console.error('Error processing order:', error);
      this.isProcessing = false;
      this.errorMessage = error.message || 'An error occurred while processing your order.';
      
      // إذا كان الخطأ متعلق بالمصادقة، اعد توجيه للتسجيل
      if (error.message?.includes('Authentication') || error.message?.includes('login')) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    }
  }

  private prepareOrderData(): CreateOrderRequest {
    const formValue = this.checkoutForm.value;

    return {
      totalAmount: this.getTotalPrice(),
      status: 0, // Pending
      orderDate: new Date().toISOString(),
      shippingAddress: formValue.shippingAddress,
      orderItems: this.cartItems.map(item => ({
        quantity: item.quantity,
        unitPrice: item.customProduct.price,
        totalPrice: item.customProduct.price * item.quantity,
        customProductId: item.customProduct.customProductId // أرسل ID بدلاً من الكائن كامل
      }))
    };
  }

  private async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return new Promise((resolve, reject) => {
      // جرب الطريقة الأساسية أولاً
      this.orderService.createOrder(orderData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (order) => {
            console.log('Order created via main endpoint:', order);
            resolve(order);
          },
          error: (error) => {
            console.error('Main endpoint failed, trying alternative:', error);
            
            // جرب الطريقة البديلة
            this.orderService.createOrderAlternative(orderData)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (order) => {
                  console.log('Order created via alternative endpoint:', order);
                  resolve(order);
                },
                error: (alternativeError) => {
                  console.error('Alternative endpoint also failed:', alternativeError);
                  reject(alternativeError);
                }
              });
          }
        });
    });
  }

  private async processStripePayment(orderId: number): Promise<void> {
    try {
      const checkoutSession = await this.createStripeCheckoutSession(orderId);

      if (checkoutSession?.sessionUrl) {
        // تخزين order ID في localStorage
        localStorage.setItem('latest_order_id', orderId.toString());
        
        console.log('Redirecting to Stripe checkout:', checkoutSession.sessionUrl);
        window.location.href = checkoutSession.sessionUrl;
      } else {
        throw new Error('Stripe session creation failed - no session URL returned');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw error;
    }
  }

  private async createStripeCheckoutSession(orderId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paymentService.createCheckoutSession({ orderId })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (session) => {
            console.log('Stripe session created:', session);
            resolve(session);
          },
          error: (error) => {
            console.error('Failed to create Stripe session:', error);
            reject(error);
          }
        });
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.checkoutForm.controls).forEach(key => {
      const control = this.checkoutForm.get(key);
      control?.markAsTouched();
    });
  }

  private handleError(error: any): void {
    console.error('Checkout error:', error);
    this.errorMessage = error.message || 'An unexpected error occurred.';
    
    if (error.message?.includes('Authentication') || error.message?.includes('login')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
    }
    return '';
  }

  // دالة للتحقق من الاتصال بالـ API
  testApiConnection(): void {
    this.orderService.testConnection()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('API connection test successful:', response);
        },
        error: (error) => {
          console.error('API connection test failed:', error);
        }
      });
  }
}