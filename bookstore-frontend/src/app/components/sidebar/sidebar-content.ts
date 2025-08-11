import { Component } from '@angular/core';
import { MaterialModule } from '../../material/material-module';
import { BookService } from '../../services/book-service/book.service';
import { Book } from '../../models/book';
import { Category } from '../../models/category';
import { Observable } from 'rxjs';
import { CategoryService } from '../../services/category-service/category.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar-content',
  imports: [MaterialModule, CommonModule],
  templateUrl: './sidebar-content.html',
  styleUrl: './sidebar-content.css',
})

export class SidebarContent {
  minPrice: number = 0;
  maxPrice: number = 0;

  minNumberOfPages: number = 0;
  maxNumberOfPages: number = 0;

  categories!: Observable<Category[]>;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((books: Book[]) => {
      const prices = books.map((book) => book.price);
      const noPages = books.map((book) => book.pageCount);

      this.minPrice = Math.min(...prices);
      this.maxPrice = Math.max(...prices);
      this.minPrice = Math.round(this.minPrice) - 1;
      this.maxPrice = Math.round(this.maxPrice) + 1;

      this.minNumberOfPages = Math.min(...noPages);
      this.maxNumberOfPages = Math.max(...noPages);
    });

    this.categories = this.categoryService.getCategories();
  }
}
