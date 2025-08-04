import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdminService } from '../admin.service';
import {
  AdminUser,
  AdminUserUpdate,
  AdminProductTemplate,
  AdminProductTemplateCreate,
  AdminProductTemplateUpdate,
  AdminAnalytics,
} from '../interfaces/admin.interface';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  // Data arrays
  users: AdminUser[] = [];
  templates: AdminProductTemplate[] = [];
  analytics: AdminAnalytics | null = null;

  // UI state
  activeTab: 'users' | 'templates' | 'analytics' = 'users';
  isLoading: boolean = false;
  showUserModal: boolean = false;
  showTemplateModal: boolean = false;
  isEditing: boolean = false;

  // Selected items
  selectedUser: AdminUser | null = null;
  selectedTemplate: AdminProductTemplate | null = null;

  // Forms
  userForm: FormGroup;
  templateForm: FormGroup;

  // Search and filter
  userSearchTerm: string = '';
  templateSearchTerm: string = '';

  // Pagination
  currentUserPage: number = 1;
  currentTemplatePage: number = 1;
  itemsPerPage: number = 10;

  // Categories for templates
  categories = [
    { id: 1, name: 'Clothing' },
    { id: 2, name: 'Home & Kitchen' },
    { id: 3, name: 'Bags & Accessories' },
    { id: 4, name: 'Stationery' },
    { id: 5, name: 'Electronics' },
  ];

  // Math object for template
  Math = Math;
  Number = Number;

  constructor(private adminService: AdminService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.templateForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      category: [1, Validators.required],
      imageUrl: ['', Validators.required],
      elements: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadTemplates();
    this.loadAnalytics();
  }

  // Tab switching
  switchTab(tab: 'users' | 'templates' | 'analytics'): void {
    this.activeTab = tab;
    // Reset pagination when switching tabs
    this.currentUserPage = 1;
    this.currentTemplatePage = 1;

    // Ensure analytics are calculated when switching to analytics tab
    if (tab === 'analytics' && !this.analytics) {
      this.calculateAnalyticsFromData();
    }
  }

  // User Management
  loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
        // Calculate analytics after users are loaded
        this.calculateAnalyticsFromData();
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      },
    });
  }

  openUserModal(user?: AdminUser): void {
    this.isEditing = !!user;
    this.selectedUser = user || null;

    if (user) {
      this.userForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    } else {
      this.userForm.reset();
    }

    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.selectedUser = null;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.valid && this.selectedUser) {
      const userData: AdminUserUpdate = this.userForm.value;

      this.adminService.updateUser(this.selectedUser.id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeUserModal();
        },
        error: (error) => {
          console.error('Error updating user:', error);
        },
      });
    }
  }

  deleteUser(user: AdminUser): void {
    if (
      confirm(
        `Are you sure you want to delete user ${user.firstName} ${user.lastName}?`
      )
    ) {
      this.adminService.deleteUser(user.id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        },
      });
    }
  }

  // Template Management
  loadTemplates(): void {
    this.isLoading = true;
    this.adminService.getAllTemplates().subscribe({
      next: (templates) => {
        this.templates = templates;
        this.isLoading = false;
        // Calculate analytics after templates are loaded
        this.calculateAnalyticsFromData();
      },
      error: (error) => {
        console.error('Error loading templates:', error);
        this.isLoading = false;
      },
    });
  }

  openTemplateModal(template?: AdminProductTemplate): void {
    this.isEditing = !!template;
    this.selectedTemplate = template || null;

    if (template) {
      this.templateForm.patchValue({
        name: template.name,
        description: template.description,
        basePrice: template.basePrice,
        category: template.category,
        imageUrl: template.imageUrl,
        elements: template.elements,
      });
    } else {
      this.templateForm.reset();
    }

    this.showTemplateModal = true;
  }

  closeTemplateModal(): void {
    this.showTemplateModal = false;
    this.selectedTemplate = null;
    this.templateForm.reset();
  }

  saveTemplate(): void {
    if (this.templateForm.valid) {
      const templateData = this.templateForm.value;

      if (this.isEditing && this.selectedTemplate) {
        this.adminService
          .updateTemplate(this.selectedTemplate.productTemplateId, templateData)
          .subscribe({
            next: () => {
              this.loadTemplates();
              this.closeTemplateModal();
            },
            error: (error) => {
              console.error('Error updating template:', error);
            },
          });
      } else {
        this.adminService.createTemplate(templateData).subscribe({
          next: () => {
            this.loadTemplates();
            this.closeTemplateModal();
          },
          error: (error) => {
            console.error('Error creating template:', error);
          },
        });
      }
    }
  }

  deleteTemplate(template: AdminProductTemplate): void {
    if (
      confirm(`Are you sure you want to delete template "${template.name}"?`)
    ) {
      this.adminService.deleteTemplate(template.productTemplateId).subscribe({
        next: () => {
          this.loadTemplates();
        },
        error: (error) => {
          console.error('Error deleting template:', error);
        },
      });
    }
  }

  // Analytics Management
  loadAnalytics(): void {
    this.isLoading = true;
    this.adminService.getAnalytics().subscribe({
      next: (analytics) => {
        this.analytics = analytics;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        // Fallback to calculating from existing data
        this.calculateAnalyticsFromData();
        this.isLoading = false;
      },
    });
  }

  private calculateAnalyticsFromData(): void {
    // Fallback method to calculate basic analytics from existing data
    const totalUsers = this.users.length;
    const totalSellers = this.users.filter(
      (user) =>
        user.userName.toLowerCase().includes('seller') ||
        user.email.toLowerCase().includes('seller')
    ).length;

    // Mock revenue calculation (in real app, this would come from orders)
    const totalRevenue =
      this.templates.reduce((sum, template) => sum + template.basePrice, 0) *
      0.1; // 10% commission

    this.analytics = {
      totalUsers,
      totalSellers,
      totalRevenue,
      totalOrders: Math.floor(totalRevenue / 50), // Mock order count
      monthlyStats: [],
      recentActivity: [],
    };
  }

  // Filtering
  get filteredUsers(): AdminUser[] {
    if (!this.userSearchTerm) return this.users;
    return this.users.filter(
      (user) =>
        user.firstName
          .toLowerCase()
          .includes(this.userSearchTerm.toLowerCase()) ||
        user.lastName
          .toLowerCase()
          .includes(this.userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.userSearchTerm.toLowerCase())
    );
  }

  get filteredTemplates(): AdminProductTemplate[] {
    if (!this.templateSearchTerm) return this.templates;
    return this.templates.filter(
      (template) =>
        template.name
          .toLowerCase()
          .includes(this.templateSearchTerm.toLowerCase()) ||
        template.description
          .toLowerCase()
          .includes(this.templateSearchTerm.toLowerCase())
    );
  }

  // Pagination methods
  get paginatedUsers(): AdminUser[] {
    const startIndex = (this.currentUserPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  get paginatedTemplates(): AdminProductTemplate[] {
    const startIndex = (this.currentTemplatePage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTemplates.slice(startIndex, endIndex);
  }

  get totalUserPages(): number {
    return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  get totalTemplatePages(): number {
    return Math.ceil(this.filteredTemplates.length / this.itemsPerPage);
  }

  // Pagination navigation
  goToUserPage(page: number): void {
    if (page >= 1 && page <= this.totalUserPages) {
      this.currentUserPage = page;
    }
  }

  goToTemplatePage(page: number): void {
    if (page >= 1 && page <= this.totalTemplatePages) {
      this.currentTemplatePage = page;
    }
  }

  getVisibleUserPages(): (number | string)[] {
    return this.getVisiblePages(this.currentUserPage, this.totalUserPages);
  }

  getVisibleTemplatePages(): (number | string)[] {
    return this.getVisiblePages(
      this.currentTemplatePage,
      this.totalTemplatePages
    );
  }

  private getVisiblePages(
    currentPage: number,
    totalPages: number
  ): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  }

  // Helper methods
  getCategoryName(categoryId: number): string {
    const category = this.categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  // Chart calculation methods
  getUserGrowthPercentage(): number {
    const totalUsers = this.analytics?.totalUsers || 0;
    const maxUsers = this.getMaxUsers();
    return maxUsers > 0 ? Math.min((totalUsers / maxUsers) * 100, 100) : 0;
  }

  getMaxUsers(): number {
    return Math.max(this.analytics?.totalUsers || 0, 100);
  }

  getSellerGrowthPercentage(): number {
    const totalSellers = this.analytics?.totalSellers || 0;
    const maxSellers = this.getMaxSellers();
    return maxSellers > 0
      ? Math.min((totalSellers / maxSellers) * 100, 100)
      : 0;
  }

  getMaxSellers(): number {
    return Math.max(this.analytics?.totalSellers || 0, 50);
  }

  getRevenueGrowthPercentage(): number {
    const totalRevenue = this.analytics?.totalRevenue || 0;
    const maxRevenue = this.getMaxRevenue();
    return maxRevenue > 0
      ? Math.min((totalRevenue / maxRevenue) * 100, 100)
      : 0;
  }

  getMaxRevenue(): number {
    const currentRevenue = this.analytics?.totalRevenue || 0;
    return Math.max(currentRevenue, 1000);
  }

  // Bar Chart Methods
  getMaxCountValue(): number {
    const users = this.analytics?.totalUsers || 0;
    const sellers = this.analytics?.totalSellers || 0;
    const orders = this.analytics?.totalOrders || 0;
    return Math.max(users, sellers, orders, 50); // Increased minimum scale
  }

  getMaxRevenueValue(): number {
    const revenue = this.analytics?.totalRevenue || 0;
    return Math.max(revenue, 50); // Increased minimum scale for revenue
  }

  getUserBarHeight(): number {
    const users = this.analytics?.totalUsers || 0;
    const maxValue = this.getMaxCountValue();
    return maxValue > 0 ? Math.min((users / maxValue) * 100, 100) : 0;
  }

  getSellerBarHeight(): number {
    const sellers = this.analytics?.totalSellers || 0;
    const maxValue = this.getMaxCountValue();
    return maxValue > 0 ? Math.min((sellers / maxValue) * 100, 100) : 0;
  }

  getRevenueBarHeight(): number {
    const revenue = this.analytics?.totalRevenue || 0;
    const maxValue = this.getMaxRevenueValue();
    return maxValue > 0 ? Math.min((revenue / maxValue) * 100, 100) : 0;
  }

  getOrdersBarHeight(): number {
    const orders = this.analytics?.totalOrders || 0;
    const maxValue = this.getMaxCountValue();
    return maxValue > 0 ? Math.min((orders / maxValue) * 100, 100) : 0;
  }

  // Pixel-based bar height methods
  getUserBarHeightPx(): number {
    const users = this.analytics?.totalUsers || 0;
    const maxValue = this.getMaxCountValue();
    const maxHeight = 250; // Maximum height in pixels
    return maxValue > 0 ? Math.max((users / maxValue) * maxHeight, 4) : 4;
  }

  getSellerBarHeightPx(): number {
    const sellers = this.analytics?.totalSellers || 0;
    const maxValue = this.getMaxCountValue();
    const maxHeight = 250; // Maximum height in pixels
    return maxValue > 0 ? Math.max((sellers / maxValue) * maxHeight, 4) : 4;
  }

  getRevenueBarHeightPx(): number {
    const revenue = this.analytics?.totalRevenue || 0;
    const maxValue = this.getMaxRevenueValue();
    const maxHeight = 250; // Maximum height in pixels
    return maxValue > 0 ? Math.max((revenue / maxValue) * maxHeight, 4) : 4;
  }

  getOrdersBarHeightPx(): number {
    const orders = this.analytics?.totalOrders || 0;
    const maxValue = this.getMaxCountValue();
    const maxHeight = 250; // Maximum height in pixels
    return maxValue > 0 ? Math.max((orders / maxValue) * maxHeight, 4) : 4;
  }

  // Pie Chart Methods
  getTotalPieValue(): number {
    const users = this.analytics?.totalUsers || 0;
    const sellers = this.analytics?.totalSellers || 0;
    const revenue = this.analytics?.totalRevenue || 0;
    return users + sellers + revenue;
  }

  getUserPercentage(): number {
    const total = this.getTotalPieValue();
    const users = this.analytics?.totalUsers || 0;
    return total > 0 ? Math.round((users / total) * 100) : 0;
  }

  getSellerPercentage(): number {
    const total = this.getTotalPieValue();
    const sellers = this.analytics?.totalSellers || 0;
    return total > 0 ? Math.round((sellers / total) * 100) : 0;
  }

  getRevenuePercentage(): number {
    const total = this.getTotalPieValue();
    const revenue = this.analytics?.totalRevenue || 0;
    return total > 0 ? Math.round((revenue / total) * 100) : 0;
  }

  getPieSegmentTransform(startAngle: number, percentage: number): string {
    const angle = (percentage / 100) * 360;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;

    const x1 = Math.cos(startRad);
    const y1 = Math.sin(startRad);
    const x2 = Math.cos(endRad);
    const y2 = Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `rotate(${startAngle}deg)`;
  }
}
