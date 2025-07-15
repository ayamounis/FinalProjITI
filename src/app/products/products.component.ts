import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // إضافة هذا
import { ProductService } from '../product.service';
import { Product } from '../product';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { CartService, AddToCartRequest } from '../cart.service';
import { CustomProductService, CreateCustomProductRequest } from '../custom-product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // إضافة RouterModule هنا
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  
  // Filter properties
  selectedCategory: number = 0;
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTerm: string = '';
  
  // Loading states
  isLoadingProducts: boolean = false;
  addingToCart: { [key: number]: boolean } = {};
  
  // Error handling
  errorMessage: string = '';
  
  // Categories for dropdown
  categories = [
    { id: 0, name: 'All Categories' },
    { id: 1, name: 'Clothing' },
    { id: 2, name: 'Mugs' },
    { id: 3, name: 'Bags' },
    { id: 4, name: 'Stationery' },
    { id: 5, name: 'Accessories' }
  ];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private customProductService: CustomProductService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProducts();
    }
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.errorMessage = '';
    
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.filteredProducts = [...data];
        this.isLoadingProducts = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.errorMessage = 'Failed to load products. Please try again.';
        this.isLoadingProducts = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Category filter
      const categoryMatch = this.selectedCategory === 0 || product.category === +this.selectedCategory;
      
      // Price range filter
      const priceMatch = product.basePrice >= this.minPrice && product.basePrice <= this.maxPrice;
      
      // Search term filter
      const searchMatch = this.searchTerm === '' ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      // Only active products
      const activeMatch = product.isActive;
      
      return categoryMatch && priceMatch && searchMatch && activeMatch;
    });
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  onPriceChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory = 0;
    this.minPrice = 0;
    this.maxPrice = 1000;
    this.searchTerm = '';
    this.filteredProducts = [...this.products];
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  formatPrice(price: number): string {
    return `${price}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Add to cart functionality with better error handling
  addToCart(product: Product): void {
    // Check if user is logged in
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Check if token exists
    const token = this.authService.getToken();
    if (!token) {
      this.showErrorMessage('Please login to add items to cart.');
      this.router.navigate(['/login']);
      return;
    }

    // Set loading state for this specific product
    this.addingToCart[product.productTemplateId] = true;

    // First, create a custom product from the product template
    const customProductRequest: CreateCustomProductRequest = {
      customName: product.name,
      customDescription: product.description,
      customImageUrl: product.imageUrl,
      price: product.basePrice,
      productTemplateId: product.productTemplateId
    };

    this.customProductService.createCustomProduct(customProductRequest).subscribe({
      next: (customProduct) => {
        // Now add the custom product to cart
        const cartItem: AddToCartRequest = {
          customProductId: customProduct.customProductId,
          quantity: 1
        };

        this.cartService.addToCart(cartItem).subscribe({
          next: (response) => {
            console.log('Product added to cart successfully:', response);
            this.addingToCart[product.productTemplateId] = false;
            this.showSuccessMessage(`${product.name} added to cart successfully!`);
          },
          error: (error) => {
            console.error('Error adding product to cart:', error);
            this.addingToCart[product.productTemplateId] = false;
            
            if (error.message.includes('Authentication')) {
              this.showErrorMessage('Please login again to add items to cart.');
              this.authService.logout();
              this.router.navigate(['/login']);
            } else {
              this.showErrorMessage(error.message || 'Failed to add product to cart. Please try again.');
            }
          }
        });
      },
      error: (error) => {
        console.error('Error creating custom product:', error);
        this.addingToCart[product.productTemplateId] = false;
        
        if (error.message.includes('Authentication')) {
          this.showErrorMessage('Please login again to add items to cart.');
          this.authService.logout();
          this.router.navigate(['/login']);
        } else if (error.message.includes('not found')) {
          this.showErrorMessage('Product service is currently unavailable. Please try again later.');
        } else {
          this.showErrorMessage(error.message || 'Failed to prepare product for cart. Please try again.');
        }
      }
    });
  }

  // Check if product is being added to cart
  isAddingToCart(productId: number): boolean {
    return this.addingToCart[productId] || false;
  }

  // Success message (replace with proper toast service)
  showSuccessMessage(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      
      alert(message);
    }
  }

  // Error message (replace with proper toast service)
  showErrorMessage(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
     
      alert(message);
    }
  }

  // Navigate to login page
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // Retry loading products
  retryLoadProducts(): void {
    this.loadProducts();
  }
}