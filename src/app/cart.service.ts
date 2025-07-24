import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CartItem {
  cartItemId: number;
  customProductId: number;
  quantity: number;
  addedAt: string;
  customProduct: {
    customProductId: number;
    customName: string;
    customDescription: string;
    customImageUrl: string;
    price: number;
    createdAt: string;
    productTemplateId: number;
    userId: string;
  };
}

export interface AddToCartRequest {
  customProductId: number;
  quantity: number;
}

export interface CheckoutResponse {
  orderId: number;
  totalAmount: number;
  status: number;
  orderDate: string;
  shippingAddress: string;
  orderItems: any[];
  payments: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://print-on-demand.runasp.net/api/Cart';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHttpOptions() {
    const token = this.authService.getToken();
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  addToCart(item: AddToCartRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, item, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}`, { cartItemId, quantity }, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartItemId}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  checkout(shippingAddress: string): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(
      `${this.apiUrl}/Checkout`,
      JSON.stringify(shippingAddress),
      this.getHttpOptions()
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('CartService Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 0) {
      // CORS أو network error
      errorMessage = 'Connection failed. Please check if the server is running and CORS is configured properly.';
    } else if (error.status === 401) {
      errorMessage = 'Authentication required. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden.';
    } else if (error.status === 404) {
      errorMessage = 'Cart service not found. Please check the API endpoint.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}