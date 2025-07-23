
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SellerProfileService } from '../seller-profile.service';
import { AuthService } from '../auth.service';
import { SellerProfile } from '../seller-profile';
import { UpdateSellerProfile } from '../update-seller-profile';
import { ProductTemplate } from '../product-template';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.css'
})
export class SellerProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private sellerProfileService = inject(SellerProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);

  profileForm: FormGroup;
  sellerProfile: SellerProfile | null = null;
  products: ProductTemplate[] = [];
  loading = false;
  productsLoading = false;
  updateLoading = false;
  error: string | null = null;
  showErrorImage = false; 
  successMessage: string | null = null;

  constructor() {
    this.profileForm = this.fb.group({
      storeName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      address: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[+]?[0-9\\s\\-\\(\\)]{10,}$')]]
    });
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
    this.loadProducts();
  }

  loadProfile(): void {
    this.loading = true;
    this.error = null;
    this.showErrorImage = false; 

    this.sellerProfileService.getSellerProfile()
      .pipe(
        catchError(error => {
          if (error.status === 401) {
            this.error = 'Session expired. Please log in again.';
            this.showErrorImage = false; 
            setTimeout(() => {
              this.authService.logout();
              this.router.navigate(['/login']);
            }, 2000);
          } else {
            this.showErrorImage = true; 
            this.error = null; 
          }
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(profile => {
        if (profile) {
          this.sellerProfile = profile;
          this.showErrorImage = false; 
          this.profileForm.patchValue({
            storeName: profile.storeName ?? '',
            description: profile.description ?? '',
            address: profile.address ?? '',
            phoneNumber: profile.phoneNumber ?? ''
          });
        }
      });
  }

  loadProducts(): void {
    this.productsLoading = true;

    this.sellerProfileService.getSellerProducts()
      .pipe(
        catchError(error => {
          console.error('Error loading products:', error);
          return of([]);
        }),
        finalize(() => this.productsLoading = false)
      )
      .subscribe(products => {
        this.products = products;
      });
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.updateLoading) {
      this.updateLoading = true;
      this.error = null;
      this.showErrorImage = false;
      this.successMessage = null;

      const updateData: UpdateSellerProfile = this.profileForm.value;

      this.sellerProfileService.updateSellerProfile(updateData)
        .pipe(
          catchError(error => {
            if (error.status === 401) {
              this.error = 'Session expired. Please log in again.';
              this.showErrorImage = false;
              setTimeout(() => {
                this.authService.logout();
                this.router.navigate(['/login']);
              }, 2000);
            } else {
              this.showErrorImage = true; 
              this.error = null;
            }
            return of(null);
          }),
          finalize(() => this.updateLoading = false)
        )
        .subscribe(result => {
          if (result !== null) {
            this.successMessage = 'Profile updated successfully.';
            this.sellerProfile = result;
            this.showErrorImage = false;

           
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 1500);
          }
        });
    }
  }

  
  retryLoadProfile(): void {
    this.loadProfile();
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/add-product']);
  }

  navigateToEditProduct(productId: number): void {
    this.router.navigate(['/edit-product', productId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isFormControlInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    return !!(control?.invalid && control?.touched);
  }

  getFormControlError(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (control?.errors?.['required']) {
      switch (controlName) {
        case 'storeName': return 'Store name is required.';
        case 'description': return 'Description is required.';
        case 'address': return 'Address is required.';
        case 'phoneNumber': return 'Phone number is required.';
        default: return 'This field is required.';
      }
    }
    if (control?.errors?.['minlength']) {
      return controlName === 'storeName'
        ? 'Store name must be at least 2 characters.'
        : 'Description must be at least 10 characters.';
    }
    if (control?.errors?.['pattern']) {
      return 'Invalid phone number format.';
    }
    return '';
  }
}