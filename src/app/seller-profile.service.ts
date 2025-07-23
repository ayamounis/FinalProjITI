import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { SellerProfile } from './seller-profile';
import { UpdateSellerProfile } from './update-seller-profile';
import { ProductTemplate } from './product-template';

@Injectable({
  providedIn: 'root'
})
export class SellerProfileService {
  private httpClient = inject(HttpClient);
  private authService = inject(AuthService);
  private baseUrl = 'https://print-on-demand.runasp.net/api';

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSellerProfile(): Observable<SellerProfile> {
    const headers = this.getAuthHeaders();
    return this.httpClient.get<SellerProfile>(
      `${this.baseUrl}/Sellers/Profile`,
      { headers }
    );
  }

  updateSellerProfile(updateData: UpdateSellerProfile): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.httpClient.put(
      `${this.baseUrl}/Sellers/Profile`,
      updateData,
      { headers }
    );
  }

  getSellerProducts(): Observable<ProductTemplate[]> {
    const headers = this.getAuthHeaders();
    return this.httpClient.get<ProductTemplate[]>(
      `${this.baseUrl}/Sellers/Products`,
      { headers }
    );
  }
}
