import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login-register',
  imports: [CommonModule, LoginComponent, RegisterComponent],
  standalone: true,
  templateUrl: './login-register.component.html',
  styleUrl: './login-register.component.css'
})
export class LoginRegisterComponent {
  activeTab: 'login' | 'register' = 'login';
  

  switchTab(tab: 'login' | 'register') {
    console.log('Switching to tab:', tab);

    this.activeTab = tab;
  }
}
