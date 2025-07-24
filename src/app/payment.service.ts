import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CheckoutSessionRequest {
  orderId: number;
}

export interface CheckoutSessionResponse {
  sessionId?: string;
  sessionUrl?: string;
  url?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'https://print-on-demand.runasp.net/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
  createCheckoutSession(request: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(
      `${this.apiUrl}/Payments/CreateCheckoutSession`,
      request,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError)
    );
  }

  checkPaymentStatus(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Orders/${orderId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('PaymentService Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication required. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden.';
    } else if (error.status === 404) {
      errorMessage = 'Payment service not found.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}