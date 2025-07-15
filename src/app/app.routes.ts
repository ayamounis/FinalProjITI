import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Component } from '@angular/core';
import { RegisterComponent } from './register/register.component';
import { HomeComponent } from './home/home.component';
import { authGuard } from './auth.guard';
import { LoginRegisterComponent } from './login-register/login-register.component';

export const routes: Routes = [
    { path: "", redirectTo: 'auth', pathMatch: 'full' },
    // { path: "login", component: LoginComponent, title: 'Login Page' },
    // { path: "register", component: RegisterComponent, title: "Register Page" },
       { path: 'auth', component: LoginRegisterComponent, title: "Login/Register Page" },
  {path:'products', loadComponent: () => import('./products/products.component').then(m => m.ProductsComponent)},
   {path:'cart',loadComponent: () => import('./cart/cart.component').then(m => m.CartComponent)},
  { path: "home",canActivate: [authGuard] ,component: HomeComponent, title: "Home Page" },
    { path: "**", redirectTo: 'home', pathMatch: 'full' },


];
