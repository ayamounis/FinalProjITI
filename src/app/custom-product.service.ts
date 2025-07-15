import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface CreateCustomProductRequest {
  customName: string;
  customDescription: string;
  customImageUrl: string;
  price: number;
  productTemplateId: number;
}

export interface CustomProduct {
  customProductId: number;
  customName: string;
  customDescription: string;
  customImageUrl: string;
  price: number;
  createdAt: string;
  productTemplateId: number;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomProductService {
  private apiUrl = 'https://print-on-demand.runasp.net/api/Products/Custom';

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

  createCustomProduct(request: CreateCustomProductRequest): Observable<CustomProduct> {
    console.log('Request body:', request);
    return this.http.post<CustomProduct>(`${this.apiUrl}`, request, this.getHttpOptions())
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any): Observable<never> {
    console.error('CustomProductService Error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.status === 401) {
      errorMessage = 'Authentication required. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'Access forbidden.';
    } else if (error.status === 404) {
      errorMessage = 'Service not found. Please check the API endpoint.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}