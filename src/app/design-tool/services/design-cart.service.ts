import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DesignAuthService } from './design-auth.service';
import { AddToCartRequest, CartItemResponse } from '../models/cart.model';

@Injectable({ providedIn: 'root' })
export class DesignCartService {
  private http = inject(HttpClient);
  private auth = inject(DesignAuthService);
  private api = environment.apiUrl;

  addToCart(data: AddToCartRequest): Observable<CartItemResponse> {
    const token = this.auth.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<CartItemResponse>(`${this.api}/Cart`, data, { headers });
  }
}
