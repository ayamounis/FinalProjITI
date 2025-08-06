import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Component } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { SellerProfileComponent } from './seller-profile/seller-profile.component';
import { DesignToolComponent } from './design-tool/components/design-tool.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login Page' },
  { path: 'register', component: RegisterComponent, title: 'Register Page' },
  { path: 'home', component: HomeComponent, title: 'Home Page' },
  { path: 'auth/callback', loadComponent: () => import('./auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent) },

  // Lazy loaded routes
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./chat-window/chat-window.component').then(
        (m) => m.ChatWindowComponent
      ),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./cart/cart.component').then((m) => m.CartComponent),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./checkout/checkout.component').then((m) => m.CheckoutComponent),
  },
  {
    path: 'payment-success',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./payment-success/payment-success.component').then(
        (m) => m.PaymentSuccessComponent
      ),
  },
  {
    path: 'payment-cancel',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./payment-cancel/payment-cancel.component').then(
        (m) => m.PaymentCancelComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./seller-profile/seller-profile.component').then(
        (m) => m.SellerProfileComponent
      ),
  },

  // Design tool route
  {
    path: 'design',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./design-tool/components/design-tool.component').then(
        (m) => m.DesignToolComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];
