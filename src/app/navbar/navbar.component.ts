import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isSeller: boolean = false;
  userRole: string = '';
  
  // Services injection
  private authService = inject(AuthService);
  private _router = inject(Router);
  
  // Subscriptions
  private authSubscription: Subscription = new Subscription();
  private roleSubscription: Subscription = new Subscription();

  constructor() {
    // يمكنك إضافة أي initialization logic هنا إذا لزم الأمر
  }

  ngOnInit(): void {
    // الاشتراك في تغييرات حالة تسجيل الدخول
    this.authSubscription = this.authService.userData.subscribe({
      next: (token) => {
        this.isLoggedIn = !!token;
        console.log(token, "Welcome in Our Website");
      },
      error: (err) => {
        console.log(err);
        this.isLoggedIn = false;
      }
    });

    // الاشتراك في تغييرات دور المستخدم
    this.roleSubscription = this.authService.userRole.subscribe({
      next: (role) => {
        this.userRole = role;
        this.isSeller = role.toLowerCase() === 'seller';
      },
      error: (err) => {
        console.log('Role subscription error:', err);
        this.userRole = '';
        this.isSeller = false;
      }
    });

    // Log current user data
    console.log(this.authService.userData.value, "Hello Welcome in Our Website");
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout(); // Logout
    this._router.navigate(['/auth']); // Redirect to Login Page
  }
}