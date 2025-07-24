import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService, CartItem } from '../cart.service';
import { AuthService } from '../auth.service';
import { PaymentService } from '../payment.service';

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
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private authService: AuthService,
    private paymentService: PaymentService,
    public router: Router
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: ['', [Validators.required, Validators.minLength(10)]],
      paymentMethod: ['stripe', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  getTotalItems(): number {
    return this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => total + (item.customProduct.price * item.quantity), 0);
  }

  formatPrice(price: number): string {
    return `${price.toFixed(2)}`;
  }

  onPaymentMethodChange(method: string): void {
    this.paymentMethod = method;
    this.checkoutForm.patchValue({ paymentMethod: method });
  }

  // دي الميثود المحدثة - بتستعمل cart/checkout API
  async processOrder(): Promise<void> {
    if (this.checkoutForm.invalid || this.cartItems.length === 0) {
      this.markFormGroupTouched();
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';

    const shippingAddress = this.checkoutForm.value.shippingAddress;

    // استعمال cart/checkout API - دي بتفضي الكارت وتعمل أوردر أوتوماتيك
    this.cartService.checkout(shippingAddress)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          console.log('Order created via checkout:', order);
          // بعد ما الأوردر يتعمل، ننادي على stripe checkout
          this.initiateStripeCheckout(order.orderId);
        },
        error: (error) => {
          console.error('Checkout failed:', error);
          this.isProcessing = false;
          this.handleError(error);
        }
      });
  }

  private initiateStripeCheckout(orderId: number): void {
    this.paymentService.createCheckoutSession({ orderId })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (session) => {
          console.log('Checkout session created:', session);
          console.log('Session URL:', session.sessionUrl);
          
          // Handle both possible response formats
          const redirectUrl = session.sessionUrl || session.url;
          
          if (!redirectUrl) {
            console.error('No redirect URL returned from API');
            this.isProcessing = false;
            this.handleError(new Error('Payment session could not be created'));
            return;
          }
          
          localStorage.setItem('latest_order_id', orderId.toString());
          
          // إعادة التوجيه لصفحة Stripe
          console.log('Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        },
        error: (error) => {
          console.error('Failed to create Stripe session:', error);
          this.isProcessing = false;
          this.handleError(error);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.values(this.checkoutForm.controls).forEach(control => control.markAsTouched());
  }

  private handleError(error: any): void {
    this.errorMessage = error.message || 'An unexpected error occurred.';
    if (error.message?.includes('Authentication')) {
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
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}