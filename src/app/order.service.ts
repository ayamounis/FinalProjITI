import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthService } from './auth.service';

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

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://print-on-demand.runasp.net/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);

    if (error.status === 401) {
      return throwError(() => new Error('Authentication failed. Please login again.'));
    } else if (error.status === 403) {
      return throwError(() => new Error('Access forbidden. You don\'t have permission to perform this action.'));
    } else if (error.status === 404) {
      return throwError(() => new Error('Resource not found.'));
    } else if (error.status === 0) {
      return throwError(() => new Error('Network error. Please check your connection.'));
    }

    return throwError(() => new Error(error.error?.message || 'An unexpected error occurred'));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Orders`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/Orders/${orderId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  updateOrderStatus(orderId: number, status: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/Orders/${orderId}`, 
      { status }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  addPaymentToOrder(orderId: number, paymentData: {
    amount: number;
    method: number;
    transactionId: string;
  }): Observable<Payment> {
    return this.http.post<Payment>(
      `${this.apiUrl}/Orders/${orderId}/Payments`,
      paymentData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getPayment(orderId: number, paymentId: number): Observable<Payment> {
    return this.http.get<Payment>(
      `${this.apiUrl}/Orders/${orderId}/Payments/${paymentId}`, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Orders`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}