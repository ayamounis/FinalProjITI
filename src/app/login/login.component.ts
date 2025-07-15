import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { cwd } from 'node:process';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup 
  // = new FormGroup({
  //   username: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
  //   password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,}$/)]),
  //   rememberMe: new FormControl(false)
  // });
  apiError: string = ''
  _authService = inject(AuthService)
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

} 

