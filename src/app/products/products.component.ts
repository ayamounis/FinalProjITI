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
  paginatedProducts: Product[] = []; // المنتجات المعروضة في الصفحة الحالية

  selectedCategory: number = 0;
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTerm: string = '';

  // Pagination properties - تم تغيير itemsPerPage من 6 إلى 4
  currentPage: number = 1;
  itemsPerPage: number = 4; // عدد المنتجات في كل صفحة (تم تغييره من 6 إلى 4)
  totalPages: number = 0;
  totalItems: number = 0;

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
        const pageFromUrl = +params['page'] || 1;
        
        if (categoryFromUrl) {
          this.selectedCategory = categoryFromUrl;
        }
        this.currentPage = pageFromUrl;
        
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
        this.applyFilters();
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

    // بعد الفلترة، حدث الـ pagination
    this.totalItems = this.filteredProducts.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    
    // تأكد إن الصفحة الحالية مش أكبر من العدد الكلي للصفحات
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
    
    this.updatePaginatedProducts();
    this.updateUrl();
  }

  updatePaginatedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  updateUrl(): void {
    const queryParams: any = {};
    
    if (this.selectedCategory !== 0) {
      queryParams.category = this.selectedCategory;
    }
    
    if (this.currentPage !== 1) {
      queryParams.page = this.currentPage;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedProducts();
      this.updateUrl();
      this.scrollToTop();
    }
  }

  goToFirstPage(): void {
    this.goToPage(1);
  }

  goToLastPage(): void {
    this.goToPage(this.totalPages);
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      // إذا كان العدد الكلي للصفحات أقل من أو يساوي الحد الأقصى المرئي
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // إذا كان العدد أكبر، اعرض نطاق حول الصفحة الحالية
      let startPage = Math.max(1, this.currentPage - 2);
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
      
      // تأكد من عرض العدد الصحيح من الصفحات
      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  scrollToTop(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Filter methods - محدثة عشان تعيد تعيين الصفحة للأولى
  onCategoryChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPriceChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCategory = 0;
    this.minPrice = 0;
    this.maxPrice = 1000;
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // باقي الدوال زي ما هي
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