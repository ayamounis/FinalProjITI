import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

 private categories = [
    { id: 0, name: 'All Categories', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', description: 'Explore all our custom products' }, 
    { id: 1, name: 'Shirts', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop', description: 'Unique custom T-Shirts & Apparel' },
    { id: 2, name: 'Pants', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop', description: 'Custom Pants & Trousers' },
    { id: 3, name: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop', description: 'Stylish Custom Hoodies' },
    { id: 4, name: 'Mugs', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop', description: 'Personalized Mugs' },
    { id: 5, name: 'Phone Cases', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop', description: 'Cool Phone Accessories' }
  ];

  constructor() { }

  getCategories() {
    return this.categories;
  }}
