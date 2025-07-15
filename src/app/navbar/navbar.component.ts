import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isLoggedIn: boolean = false;
  _authService = inject(AuthService);
  _router = inject(Router);

  constructor() {
    this._authService.userData.subscribe({
      next: (res) => {
        this.isLoggedIn = res ? true : false;
        console.log(res, "Welcome in Our Website");
      },
      error: (err) => {
        console.log(err);
      }
    })
    console.log(this._authService.userData.value, "Hello Welcome in Our Website");


  }
  logout() {
    this._authService.logout(); //Logout
    this._router.navigate(['/auth']); //Redirect to Login Page
  }
}