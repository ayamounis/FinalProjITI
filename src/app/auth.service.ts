
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth } from './auth';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode'; 

interface DecodedToken {
  role?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: BehaviorSubject<string> = new BehaviorSubject('');
  userRole: BehaviorSubject<string> = new BehaviorSubject('');
  _httpClient = inject(HttpClient);
  _PlatformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this._PlatformId)) {
      if (localStorage.getItem('token')) {
        const token = localStorage.getItem('token')!;
        this.userData.next(token);
        this.extractUserRole(token); 
      }
    }
  }

  register(info: Auth): Observable<any> {
    return this._httpClient.post(`https://print-on-demand.runasp.net/api/Account/Register`, info);
  }

  login(info: Auth): Observable<any> {
    return this._httpClient.post(`https://print-on-demand.runasp.net/api/Account/Login`, info);
  }

  saveUser() {
    const token = localStorage.getItem('token')!;
    this.userData.next(token);
    this.extractUserRole(token); 
    console.log(this.userData.value, "userData");
  }

  logout() {
    localStorage.removeItem('token');
    this.userData.next('');
    this.userRole.next(''); 
  }

 
  private extractUserRole(token: string): void {
    try {
      const decodedToken: DecodedToken = jwtDecode(token);
      const role = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '';
      this.userRole.next(role);
    } catch (error) {
      console.error('Error decoding token:', error);
      this.userRole.next('');
    }
  }

  
  getToken(): string {
    if (isPlatformBrowser(this._PlatformId)) {
      return this.userData.value || localStorage.getItem('token') || '';
    }
    return '';
  }

  isLoggedIn(): boolean {
    return this.getToken() !== '';
  }

  setToken(token: string): void {
    if (isPlatformBrowser(this._PlatformId)) {
      localStorage.setItem('token', token);
      this.userData.next(token);
      this.extractUserRole(token); 
    }
  }

  
  getUserRole(): string {
    return this.userRole.value;
  }

 
  isSeller(): boolean {
    return this.getUserRole().toLowerCase() === 'seller';
  }

 
  isUser(): boolean {
    return this.getUserRole().toLowerCase() === 'user';
  }
}