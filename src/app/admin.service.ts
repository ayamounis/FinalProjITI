import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AdminUser,
  AdminUserUpdate,
  AdminProductTemplate,
  AdminProductTemplateCreate,
  AdminProductTemplateUpdate,
} from './interfaces/admin.interface';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'https://print-on-demand.runasp.net/api/Admin';

  constructor(private http: HttpClient) {}

  // User Management
  getAllUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.baseUrl}/Users`);
  }

  getUserById(id: string): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.baseUrl}/Users/${id}`);
  }

  updateUser(id: string, userData: AdminUserUpdate): Observable<any> {
    return this.http.put(`${this.baseUrl}/Users/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Users/${id}`);
  }

  // Product Template Management
  getAllTemplates(): Observable<AdminProductTemplate[]> {
    return this.http.get<AdminProductTemplate[]>(`${this.baseUrl}/Templates`);
  }

  getTemplateById(id: number): Observable<AdminProductTemplate> {
    return this.http.get<AdminProductTemplate>(
      `${this.baseUrl}/Templates/${id}`
    );
  }

  createTemplate(
    templateData: AdminProductTemplateCreate
  ): Observable<AdminProductTemplate> {
    return this.http.post<AdminProductTemplate>(
      `${this.baseUrl}/Templates`,
      templateData
    );
  }

  updateTemplate(
    id: number,
    templateData: AdminProductTemplateUpdate
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/Templates/${id}`, templateData);
  }

  deleteTemplate(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Templates/${id}`);
  }
}
