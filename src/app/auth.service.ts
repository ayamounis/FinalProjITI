import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Auth } from './auth';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userData: BehaviorSubject<string> = new BehaviorSubject('');
  _httpClient = inject(HttpClient)
  _PlatformId = inject(PLATFORM_ID);
  constructor() {
    if(isPlatformBrowser(this._PlatformId)) {
        if (localStorage.getItem('token')) {
      this.userData.next(localStorage.getItem('token')!);
    }
   }}


  register(info:Auth):Observable<any>
  {
    return this._httpClient.post(`https://print-on-demand.runasp.net/api/Account/Register
`, info)
  }

  saveUser()
  {
    const token = localStorage.getItem('token')!;
    this.userData.next(token);
    console.log(this.userData.value, "userData");
  }

  logout() {
    localStorage.removeItem('token');
    this.userData.next('');
  }

    login(info:Auth):Observable<any>
  {
    return this._httpClient.post(`https://print-on-demand.runasp.net/api/Account/Login
`, info)
  }
}
