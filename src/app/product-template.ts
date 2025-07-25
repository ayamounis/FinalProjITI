export interface ProductTemplate {
  productTemplateId: number;
  name: string;
  description: string;
  basePrice: number;
  category: number;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  sellerProfileId: number;
  elements: string;
}