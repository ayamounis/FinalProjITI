import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface PaymentIntentRequest {
  orderId: number;
}

export interface CheckoutSessionRequest {
  orderId: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
}

export interface WebhookEvent {
  type: string;
  data: any;
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

  // إنشاء Payment Intent للدفع المباشر
  createPaymentIntent(request: PaymentIntentRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/Payments/CreatePaymentIntent`, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  // إنشاء Checkout Session للإعادة توجيه إلى صفحة الدفع
  createCheckoutSession(request: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.http.post<CheckoutSessionResponse>(`${this.apiUrl}/Payments/CreateCheckoutSession`, 
      request, 
      { headers: this.getHeaders() }
    );
  }

  // معالجة Stripe Webhook (للاستخدام الداخلي فقط)
  handleStripeWebhook(event: WebhookEvent): Observable<any> {
    return this.http.post(`${this.apiUrl}/Payments/StripeWebhook`, 
      event, 
      { headers: this.getHeaders() }
    );
  }

  // التحقق من حالة الدفع
  checkPaymentStatus(orderId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Orders/${orderId}`, {
      headers: this.getHeaders()
    });
  }
}