import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';
import { cwd } from 'node:process';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup 
  // = new FormGroup({
  //   username: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
  //   password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,}$/)]),
  //   rememberMe: new FormControl(false)
  // });
  apiError: string = ''
  _authService = inject(AuthService)
  _notificationService = inject(NotificationService)
  _router = inject(Router) 
  _fb = inject(FormBuilder)
    //--------------Get---------------------------
  get email() {
    return this.loginForm.get('email');
  }

  constructor() {
    this.loginForm = this._fb.group({
      email : ['', [Validators.required, Validators.email]],
      password : ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,}$/)]],
    });

  }

  ngOnInit(): void {
    // Check if we have a token in the URL (Google Sign-In callback)
    if (typeof window !== 'undefined') {
      this.handleGoogleCallback();
    }
  }
   ////////////////
  login() {
    console.log(this.loginForm.value);
    if (this.loginForm.valid) {
      //Api Call
      this._authService.login(this.loginForm.value).subscribe({
        next: (res) => {
          console.log(res);
          localStorage.setItem('token', res.token);
          this._authService.saveUser(); //Save User Data in Service
          this._router.navigate(['/home']) //Programmatic Router
        },
        error: (err) => {
  console.log(err); // دايمًا اطبعيه الأول للتأكد
  if (typeof err.error === 'string') {
    this.apiError = err.error; // مجرد رسالة نصية
  } else if (err.error?.message) {
    this.apiError = err.error.message;
  } else {
    this.apiError = 'Something went wrong. Please try again later.';
  }
}
      })
    }
    else {
      this.loginForm.markAllAsTouched();
    }
  }

  signInWithGoogle(): void {
    // Redirect to the Google Sign-In URL
    window.location.href = 'https://print-on-demand.runasp.net/api/ExternalAuth/signin?provider=Google';
  }

  private handleGoogleCallback(): void {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if we have a token in the URL fragment
    const fragment = window.location.hash;
    if (fragment && fragment.includes('token=')) {
      // Extract token from the fragment
      const tokenMatch = fragment.match(/token=([^&#]+)/);
      if (tokenMatch && tokenMatch[1]) {
        const token = tokenMatch[1];
        console.log('Token extracted from login page:', token);
        
        // Save the token
        this._authService.setToken(token);
        
        // Clear the URL fragment
        window.location.hash = '';
        
        // Show success notification
        this._notificationService.showSuccess(
          'Welcome back!',
          'You have been successfully signed in with Google.',
          5000
        );
        
        // Redirect to home page
        setTimeout(() => {
          this._router.navigate(['/home']);
        }, 1000);
      }
    }
  }

} 

