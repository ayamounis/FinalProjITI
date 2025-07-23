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

export interface CreateOrderRequest {
  totalAmount: number;
  status: number;
  orderDate: string;
  shippingAddress: string;
  orderItems: {
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    customProductId: number; // تأكد من إرسال ID بدلاً من الكائن كامل
  }[];
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
    
    if (error.status === 405) {
      return throwError(() => new Error('Method not allowed. Please check the API endpoint configuration.'));
    } else if (error.status === 401) {
      return throwError(() => new Error('Authentication failed. Please login again.'));
    } else if (error.status === 403) {
      return throwError(() => new Error('Access forbidden. You don\'t have permission to perform this action.'));
    } else if (error.status === 404) {
      return throwError(() => new Error('API endpoint not found. Please check the server configuration.'));
    } else if (error.status === 0) {
      return throwError(() => new Error('Network error. Please check your connection and CORS configuration.'));
    }
    
    return throwError(() => new Error(error.error?.message || 'An unexpected error occurred'));
  }

  // إنشاء طلب جديد - تجربة endpoints مختلفة
  createOrder(orderData: CreateOrderRequest): Observable<Order> {
    console.log('Creating order with data:', orderData);
    
    // تنظيف البيانات قبل الإرسال
    const cleanOrderData = {
      ...orderData,
      orderItems: orderData.orderItems.map(item => ({
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        customProductId: item.customProductId
      }))
    };

    return this.http.post<Order>(`${this.apiUrl}/Orders`, cleanOrderData, {
      headers: this.getHeaders()
    }).pipe(
      retry(1), // إعادة المحاولة مرة واحدة
      catchError(this.handleError.bind(this))
    );
  }

  // طريقة بديلة لإنشاء الطلب
  createOrderAlternative(orderData: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/Order/Create`, orderData, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // الحصول على جميع الطلبات للمستخدم
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Orders`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // الحصول على طلب محدد
  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/Orders/${orderId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // تحديث حالة الطلب
  updateOrderStatus(orderId: number, status: number): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/Orders/${orderId}`, 
      { status }, 
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // إضافة دفعة للطلب
  addPaymentToOrder(orderId: number, paymentData: any): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/Orders/${orderId}/Payments`,
      paymentData,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // الحصول على دفعة محددة
  getPayment(orderId: number, paymentId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/Orders/${orderId}/Payments/${paymentId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  // للتحقق من صحة الـ API
  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Orders/test`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }
}