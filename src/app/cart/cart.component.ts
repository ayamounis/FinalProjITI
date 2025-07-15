import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../cart.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoading: boolean = false;
  updatingItems: { [key: number]: boolean } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    if (this.isLoggedIn()) {
      this.loadCartItems();
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  loadCartItems(): void {
    this.isLoading = true;
    this.cartService.getCartItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (items) => {
          this.cartItems = items || [];
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading cart items:', error);
          this.isLoading = false;
          
          // Handle authentication errors
          if (error.message.includes('Authentication')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

 
  onQuantityChange(item: CartItem, event: Event): void {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    
    if (newQuantity && newQuantity > 0) {
      this.updateQuantity(item, newQuantity);
    }
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.updatingItems[item.cartItemId] = true;
    
    this.cartService.updateCartItem(item.cartItemId, newQuantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          item.quantity = newQuantity;
          this.updatingItems[item.cartItemId] = false;
        },
        error: (error) => {
          console.error('Error updating cart item:', error);
          this.updatingItems[item.cartItemId] = false;
          
          // Handle authentication errors
          if (error.message.includes('Authentication')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  removeItem(item: CartItem): void {
    // إضافة تأكيد قبل الحذف
    if (!confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }

    this.updatingItems[item.cartItemId] = true;
    
    this.cartService.removeFromCart(item.cartItemId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(cartItem => cartItem.cartItemId !== item.cartItemId);
          this.updatingItems[item.cartItemId] = false;
        },
        error: (error) => {
          console.error('Error removing cart item:', error);
          this.updatingItems[item.cartItemId] = false;
          
          // Handle authentication errors
          if (error.message.includes('Authentication')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }

    this.cartService.clearCart()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.cartItems = [];
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          
          // Handle authentication errors
          if (error.message.includes('Authentication')) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }
}