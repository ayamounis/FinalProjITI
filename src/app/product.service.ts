import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'https://print-on-demand.runasp.net/api/Products/PublicTemplates';

  constructor(private http: HttpClient) {}
  
   private mockProducts: Product[] = [
    {
      productTemplateId: 1,
      name: 'Classic Cotton T-Shirt',
      description: 'High-quality cotton t-shirt perfect for everyday wear',
      basePrice: 150,
      category: 1,
      imageUrl: 'https://images.pexels.com/photos/1020585/pexels-photo-1020585.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      sellerProfileId: 101
    },
    {
      productTemplateId: 2,
      name: 'Custom Coffee Mug',
      description: 'Ceramic coffee mug with customizable design',
      basePrice: 80,
      category: 2,
      imageUrl: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-16T14:20:00Z',
      sellerProfileId: 102
    },
    {
      productTemplateId: 3,
      name: 'Canvas Tote Bag',
      description: 'Eco-friendly shopping bag with printing capabilities',
      basePrice: 120,
      category: 3,
      imageUrl: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-17T09:15:00Z',
      sellerProfileId: 103
    },
    {
      productTemplateId: 4,
      name: 'Winter Hoodie',
      description: 'Warm and comfortable hoodie with high-quality printing',
      basePrice: 280,
      category: 1,
      imageUrl: 'https://images.pexels.com/photos/1639729/pexels-photo-1639729.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-18T16:45:00Z',
      sellerProfileId: 104
    },
    {
      productTemplateId: 5,
      name: 'Notebook',
      description: 'Hardcover notebook with customizable cover',
      basePrice: 60,
      category: 4,
      imageUrl: 'https://images.pexels.com/photos/159751/book-address-book-learning-learn-159751.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-19T11:30:00Z',
      sellerProfileId: 105
    },
    {
      productTemplateId: 6,
      name: 'Polo Shirt',
      description: 'Elegant polo shirt suitable for formal occasions',
      basePrice: 200,
      category: 1,
      imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-20T13:25:00Z',
      sellerProfileId: 106
    },
    {
      productTemplateId: 7,
      name: 'Sports Water Bottle',
      description: 'Stainless steel water bottle with custom printing',
      basePrice: 95,
      category: 5,
      imageUrl: 'https://images.pexels.com/photos/1616401/pexels-photo-1616401.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-21T08:15:00Z',
      sellerProfileId: 107
    },
    {
      productTemplateId: 8,
      name: 'Baseball Cap',
      description: 'Adjustable baseball cap with embroidery options',
      basePrice: 110,
      category: 5,
      imageUrl: 'https://images.pexels.com/photos/1124466/pexels-photo-1124466.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-22T12:30:00Z',
      sellerProfileId: 108
    },
    {
      productTemplateId: 9,
      name: 'Desk Mousepad',
      description: 'Large desk mousepad with custom design printing',
      basePrice: 45,
      category: 5,
      imageUrl: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-23T15:45:00Z',
      sellerProfileId: 109
    },
    {
      productTemplateId: 10,
      name: 'Phone Case',
      description: 'Protective phone case with personalized printing',
      basePrice: 85,
      category: 5,
      imageUrl: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-24T09:20:00Z',
      sellerProfileId: 110
    },
    {
      productTemplateId: 11,
      name: 'Laptop Sleeve',
      description: 'Protective laptop sleeve with custom artwork',
      basePrice: 140,
      category: 3,
      imageUrl: 'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-25T14:10:00Z',
      sellerProfileId: 111
    },
    {
      productTemplateId: 12,
      name: 'Ceramic Plate',
      description: 'Decorative ceramic plate with custom designs',
      basePrice: 70,
      category: 2,
      imageUrl: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=500&h=400',
      isActive: true,
      createdAt: '2024-01-26T11:55:00Z',
      sellerProfileId: 112
    }
  ];

  getAllProducts(): Observable<Product[]> {
    console.log('ProductService: Attempting to fetch from:', this.apiUrl);

    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError(error => {
        console.error('API Error:', error);
        console.log('Using mock data instead');
        return of(this.mockProducts);
      })
    );
    
  }

  // Additional methods for filtering
  getProductsByCategory(category: number): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.category === category));
  }

  getProductsByPriceRange(minPrice: number, maxPrice: number): Observable<Product[]> {
    return of(this.mockProducts.filter(p => p.basePrice >= minPrice && p.basePrice <= maxPrice));
  }
}