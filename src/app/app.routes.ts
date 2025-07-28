import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Component } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth.guard';
import { LoginRegisterComponent } from './login-register/login-register.component';
import { SellerProfileComponent } from './seller-profile/seller-profile.component';
import { DesignToolComponent } from './design-tool/components/design-tool.component';

export const routes: Routes = [
  { path: "", redirectTo: 'login', pathMatch: 'full' },
  { path: "login", component: LoginComponent, title: 'Login Page' },
  { path: "register", component: RegisterComponent, title: "Register Page" },
  { path: "home", component: HomeComponent, title: "Home Page" },
  
  // Lazy loaded routes
  { path: 'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent) },
  { path: 'chat', loadComponent: () => import('./chat-window/chat-window.component').then(m => m.ChatWindowComponent) },
  { path: 'cart', canActivate: [authGuard], loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'paymentsuccess', canActivate: [authGuard], loadComponent: () => import('./payment-success/payment-success.component').then(m => m.PaymentSuccessComponent) },
  { path: 'profile', loadComponent: () => import('./seller-profile/seller-profile.component').then(m => m.SellerProfileComponent) },
  
  // Design tool route 
  { path: 'design', loadComponent: () => import('./design-tool/components/design-tool.component').then(m => m.DesignToolComponent) },
  
  { path: "**", redirectTo: 'home', pathMatch: 'full' }
];