import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

 private categories = [
    { id: 0, name: 'All Categories' }, 
    { id: 1, name: 'Shirts', image: 'img/Category/Clothes.png', description: 'Unique custom T-Shirts & Apparel' },
    { id: 2, name: 'Pants', image: 'img/Category/pants.jpg', description: 'Custom Pants & Trousers' },
    { id: 3, name: 'Hoodies', image: 'img/Category/hoodie.jpg', description: 'Stylish Custom Hoodies' },
    { id: 4, name: 'Mugs', image: 'img/Category/mug.jpg', description: 'Personalized Mugs' },
    { id: 5, name: 'Phone Cases', image: 'img/Category/coverr.png', description: 'Cool Phone Accessories' }
  ];

  constructor() { }

  getCategories() {
    return this.categories;
  }}
