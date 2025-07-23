import { CommonModule, JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  RegisterForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
    email: new FormControl(null, [Validators.required, Validators.email]),
    password: new FormControl(null, [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{6,}$/)]),
    rePassword: new FormControl(null, [Validators.required]),
    firstName : new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
    lastName: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
    phoneNumber: new FormControl(null, [Validators.required]),
    role : new FormControl(null, [Validators.required, this.roleValidator ]), //Custom Validation
    storeName: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(11)]),
    description : new FormControl(null, [Validators.minLength(0), Validators.maxLength(100)]),
    address: new FormControl(null, []),
  }, {
    validators: this.passwordMatchRePassword //Custom Validtion
  });
  apiError: string = ''
  _authService = inject(AuthService)
  _router = inject(Router) 
  //--------------Get---------------------------
  get username() {
    return this.RegisterForm.get('username');
  }
  get email() {
    return this.RegisterForm.get("email")
  }
  get phoneNumber() {
    return this.RegisterForm.get('phoneNumber')
  }

  ////////////////
  @Output() switchToLogin = new EventEmitter<void>();
  switchToLoginPage() {
    this.switchToLogin.emit();
  }
  register() {
    console.log(this.RegisterForm.value);
    if (this.RegisterForm.valid) {
      //Api Call
      this._authService.register(this.RegisterForm.value).subscribe({
        next: (res) => {
          console.log(res);
          // localStorage.setItem('token', res.token);
          // this._authService.saveUser(); //Save User Data in Service
          // this._router.navigate(['/login']) //Programmatic Router
          this.apiError = res.message;
           this.switchToLogin.emit();

        },
        error: (err) => {
          console.log(err);
          this.apiError = err.error.message;

        }
      })
    }
    else {
      this.RegisterForm.markAllAsTouched();
    }
  }




  passwordMatchRePassword(form: any) {
    const password = form.get('password')?.value
    const rePassword = form.get("rePassword")?.value
    if (password != rePassword) {
      form.get("rePassword")?.setErrors({ misMatch: true })
    }
    else {
      form.get('rePassword')?.setErrors(null)
    }
    return null;
  }

 roleValidator(control: AbstractControl): ValidationErrors | null {
  const validRoles = ['Seller', 'User'];
  return validRoles.includes(control.value) ? null : { invalidRole: true };
}

ngOnInit() {
  this.RegisterForm.get('role')?.valueChanges.subscribe(role => {
    const storeName = this.RegisterForm.get('storeName');
    const description = this.RegisterForm.get('description');

    if (role === 'Seller') {
      storeName?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(11)]);
      description?.setValidators([Validators.maxLength(100)]);
    } else {
      storeName?.clearValidators();
      description?.clearValidators();

      storeName?.setValue(null);
      description?.setValue(null);
    }

    storeName?.updateValueAndValidity();
    description?.updateValueAndValidity();
  });
}
}
