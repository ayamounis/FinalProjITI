import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../category.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  categories: any[] = [];
  steps = [
    { title: 'Choose Product', description: 'Select the product you want to customize.' },
    { title: 'Customize', description: 'Use our design tool to create your custom print.' },
    { title: 'Place Order', description: 'Add to cart and place your order.' }
  ];

  constructor(
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.categories = this.categoryService.getCategories();
  }
}
