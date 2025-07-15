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

  // إضافة منتج إلى السلة
  addToCart(item: AddToCartRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}`, item, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // جلب محتويات السلة
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // تحديث كمية المنتج في السلة
  updateCartItem(cartItemId: number, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}`, { cartItemId, quantity }, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // حذف منتج من السلة
  removeFromCart(cartItemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cartItemId}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  // مسح السلة بالكامل
  clearCart(): Observable<any> {
    return this.http.delete(`${this.apiUrl}`, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('CartService Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication required. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden.';
    } else if (error.status === 404) {
      errorMessage = 'Cart service not found. Please check the API endpoint.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}