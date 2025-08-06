import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-content">
        <div class="spinner"></div>
        <h2>Processing your sign-in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }
    
    .callback-content {
      text-align: center;
      padding: 40px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      max-width: 400px;
    }
    
    .spinner {
      width: 60px;
      height: 60px;
      border: 5px solid #f3f4f6;
      border-top-color: #10b981;
      border-radius: 50%;
      margin: 0 auto 20px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    h2 {
      color: #1f2937;
      margin-bottom: 10px;
    }
    
    p {
      color: #6b7280;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return;
    
    console.log('Auth callback component initialized');
    console.log('Current URL:', window.location.href);
    
    // Try multiple methods to extract token
    let token = this.extractTokenFromUrl();
    
    if (token) {
      console.log('Token extracted successfully:', token.substring(0, 50) + '...');
      // Save the token
      this.authService.setToken(token);
      
      // Show success notification
      this.notificationService.showSuccess(
        'Welcome back!',
        'You have been successfully signed in with Google.',
        5000
      );
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1500);
    } else {
      console.error('No token found in URL');
      // Redirect to login page if no token found
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
    }
  }

  private extractTokenFromUrl(): string | null {
    // Check if we're in browser environment
    if (typeof window === 'undefined') return null;
    
    console.log('Extracting token from URL...');
    
    // Method 1: Try to get from URL fragment (hash)
    const fragment = window.location.hash;
    console.log('Fragment:', fragment);
    if (fragment) {
      const params = new URLSearchParams(fragment.substring(1));
      const token = params.get('token');
      if (token) {
        console.log('Token found in fragment');
        return token;
      }
    }

    // Method 2: Try to get from query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      console.log('Token found in query params');
      return token;
    }

    // Method 3: Try to extract from the full URL using regex
    const url = window.location.href;
    console.log('Full URL:', url);
    const tokenMatch = url.match(/[?&]token=([^&#]+)/);
    if (tokenMatch && tokenMatch[1]) {
      console.log('Token found in URL regex match');
      return tokenMatch[1];
    }

    // Method 4: Try to extract from hash fragment using regex
    const hashMatch = url.match(/#.*token=([^&#]+)/);
    if (hashMatch && hashMatch[1]) {
      console.log('Token found in hash regex match');
      return hashMatch[1];
    }

    console.log('No token found in any method');
    return null;
  }
} 