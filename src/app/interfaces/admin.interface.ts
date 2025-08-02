export interface AdminUser {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  phoneNumber: string;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: string | null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
}

export interface AdminUserUpdate {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdminProductTemplate {
  productTemplateId: number;
  name: string;
  description: string;
  basePrice: number;
  category: number;
  imageUrl: string;
  elements: string;
  isActive: boolean;
  createdAt: string;
  sellerProfileId: number;
}

export interface AdminProductTemplateCreate {
  name: string;
  description: string;
  basePrice: number;
  category: number;
  imageUrl: string;
  elements: string;
}

export interface AdminProductTemplateUpdate {
  name: string;
  description: string;
  basePrice: number;
  category: number;
  imageUrl: string;
  elements: string;
}
