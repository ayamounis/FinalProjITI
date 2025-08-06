import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-google-auth-handler',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="handler-container">
      <div class="handler-content">
        <div class="auth-section">
          <div class="auth-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22,4 12,14.01 9,11.01"></polyline>
            </svg>
          </div>

          <div class="auth-header">
            <h1>🔐 Google Authentication</h1>
            <p class="auth-message">Please complete the Google authentication process.</p>
          </div>

          <div class="auth-instructions">
            <div class="instruction-card">
              <h3>Step 1: Sign in with Google</h3>
              <p>Click the button below to start the Google authentication process.</p>
              <button class="btn btn-primary" (click)="startGoogleAuth()">
                <span>🔑</span>
                Sign in with Google
              </button>
            </div>

            <div class="instruction-card">
              <h3>Step 2: Complete Authentication</h3>
              <p>After Google authentication, you'll be redirected to a page with a token in the URL.</p>
              <p><strong>Copy the entire URL</strong> from your browser's address bar.</p>
            </div>

            <div class="instruction-card">
              <h3>Step 3: Paste Token</h3>
              <p>Paste the URL here to complete the authentication:</p>
              <div class="token-input">
                <input 
                  type="text" 
                  [(ngModel)]="tokenUrl" 
                  placeholder="Paste the URL with token here..."
                  class="form-control"
                >
                <button class="btn btn-success" (click)="processToken()" [disabled]="!tokenUrl">
                  <span>✅</span>
                  Complete Authentication
                </button>
              </div>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-secondary" (click)="goBack()">
              <span>⬅️</span>
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .handler-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .handler-content {
      max-width: 800px;
      width: 100%;
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .auth-section {
      padding: 40px;
      text-align: center;
    }

    .auth-icon {
      margin-bottom: 30px;
      color: #10b981;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 15px;
    }

    .auth-message {
      font-size: 1.1rem;
      color: #6b7280;
      margin-bottom: 30px;
    }

    .auth-instructions {
      margin-bottom: 40px;
    }

    .instruction-card {
      background: #f8fafc;
      border-radius: 16px;
      padding: 25px;
      margin-bottom: 20px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    .instruction-card h3 {
      font-size: 1.2rem;
      color: #1f2937;
      margin-bottom: 10px;
    }

    .instruction-card p {
      color: #6b7280;
      margin-bottom: 15px;
      line-height: 1.5;
    }

    .token-input {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      justify-content: center;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .btn-success:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
      background: white;
      color: #667eea;
      border: 2px solid #667eea;
    }

    .btn-secondary:hover {
      background: #667eea;
      color: white;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .actions {
      margin-top: 30px;
    }

    @media (max-width: 768px) {
      .auth-section {
        padding: 30px 20px;
      }
      
      .auth-header h1 {
        font-size: 1.8rem;
      }
      
      .instruction-card {
        padding: 20px;
      }
    }
  `]
})
export class GoogleAuthHandlerComponent implements OnInit {
  tokenUrl: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if we have a token in the URL already
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.processTokenFromUrl(params['token']);
      }
    });
  }

  startGoogleAuth(): void {
    const googleAuthUrl = 'https://print-on-demand.runasp.net/api/ExternalAuth/signin?provider=Google';
    window.open(googleAuthUrl, '_blank');
  }

  processToken(): void {
    if (!this.tokenUrl) {
      alert('Please paste the URL with the token.');
      return;
    }

    try {
      // Extract token from URL
      const url = new URL(this.tokenUrl);
      const token = url.searchParams.get('token');
      
      if (token) {
        this.processTokenFromUrl(token);
      } else {
        alert('No token found in the URL. Please make sure you copied the correct URL.');
      }
    } catch (error) {
      alert('Invalid URL format. Please make sure you copied the complete URL.');
    }
  }

  private processTokenFromUrl(token: string): void {
    console.log('Processing token:', token);
    
    try {
      // Handle external authentication
      this.authService.handleExternalAuth(token);
      console.log('Authentication successful, navigating to home...');
      
      // Navigate to home page
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Error during authentication:', error);
      alert('Authentication failed. Please try again.');
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
} 