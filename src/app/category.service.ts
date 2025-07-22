import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private categories = [
    { id: 1, name: 'Clothes', image: 'img/Category/Clothes.png', description: 'Unique custom T-Shirts' },
    { id: 2, name: 'Mugs', image: 'img/Category/mug.jpg', description: 'Personalized Mugs' },
    { id: 3, name: 'Bags', image: 'img/Category/bag.jpg', description: 'Stylish Custom Bags' },
    { id: 4, name: 'Caps', image: 'img/Category/cap.png', description: 'Creative Custom Caps' },
    { id: 5, name: 'Accessories', image: 'img/Category/coverr.png', description: 'Cool Accessories' }
  ];

  constructor() { }

  getCategories() {
    return this.categories;
  }}
