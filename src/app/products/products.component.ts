import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../product.service';
import { Product } from '../product';
import { PLATFORM_ID } from '@angular/core';
import { AuthService } from '../auth.service';
import { CartService, AddToCartRequest } from '../cart.service';
import { CustomProductService, CreateCustomProductRequest } from '../custom-product.service';
import { CategoryService } from '../category.service';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];

  selectedCategory: number = 0;
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTerm: string = '';

  isLoadingProducts: boolean = false;
  addingToCart: { [key: number]: boolean } = {};

  errorMessage: string = '';

  categories: any[] = [];

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private cartService: CartService,
    private customProductService: CustomProductService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.categories = this.categoryService.getCategories();

      this.route.queryParams.subscribe(params => {
        const categoryFromUrl = +params['category'];
        if (categoryFromUrl) {
          this.selectedCategory = categoryFromUrl;
        }
        this.loadProducts();
      });
    }
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    this.errorMessage = '';

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters(); // ✅ هنا فلترة بعد الـ API
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
      const categoryMatch = this.selectedCategory === 0 || product.category === +this.selectedCategory;
      const priceMatch = product.basePrice >= this.minPrice && product.basePrice <= this.maxPrice;
      const searchMatch = this.searchTerm === '' ||
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
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

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  addToCart(product: Product): void {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.showErrorMessage('Please login to add items to cart.');
      this.router.navigate(['/login']);
      return;
    }

    this.addingToCart[product.productTemplateId] = true;

    const customProductRequest: CreateCustomProductRequest = {
      customName: product.name,
      customDescription: product.description,
      customImageUrl: product.imageUrl,
      price: product.basePrice,
      productTemplateId: product.productTemplateId
    };

    this.customProductService.createCustomProduct(customProductRequest).subscribe({
      next: (customProduct) => {
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

  isAddingToCart(productId: number): boolean {
    return this.addingToCart[productId] || false;
  }

  showSuccessMessage(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    }
  }

  showErrorMessage(message: string): void {
    if (isPlatformBrowser(this.platformId)) {
      alert(message);
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  retryLoadProducts(): void {
    this.loadProducts();
  }
}
