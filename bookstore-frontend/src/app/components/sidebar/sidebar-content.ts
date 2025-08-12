import { Component } from '@angular/core';
import { MaterialModule } from '../../material/material-module';
import { BookService } from '../../services/book-service/book.service';
import { Book } from '../../models/book';
import { Category } from '../../models/category';
import { BookFilters } from '../../models/bookFilters';
import { Observable } from 'rxjs';
import { CategoryService } from '../../services/category-service/category.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../services/filter-service/filter-service';

@Component({
  selector: 'app-sidebar-content',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './sidebar-content.html',
  styleUrl: './sidebar-content.css',
})
export class SidebarContent {
  categories!: Observable<Category[]>;

  // Data to set the default falues for the filters
  priceRange: [number, number] = [0, 0];
  maxPages: number = 0;
  minPages: number = 0;

  // FILTERS
  selectedCategoriesFilter?: number[];
  priceRangeFilter: [number, number] = [0, 0];
  maxPagesFilter: number = 0;
  minRatingFilter: number = 0;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private filterService: FilterService
  ) {}

  ngOnInit(): void {
    this.bookService.getBooks().subscribe((books: Book[]) => {
      const prices = books.map((book) => book.price);
      const minPrice = Math.round(Math.min(...prices)) - 1;
      const maxPrice = Math.round(Math.max(...prices)) + 1;
      const noPages = books.map((book) => book.pageCount);

      this.priceRange = [minPrice, maxPrice];
      this.maxPages = Math.max(...noPages);
      this.minPages = Math.min(...noPages);
    });

    this.categories = this.categoryService.getCategories();
  }

  applyFilters() {
    const filters: BookFilters = {
      categoryIds: this.selectedCategoriesFilter,
      minPrice: this.priceRangeFilter[0],
      maxPrice: this.priceRangeFilter[1],
      maxPages: this.maxPagesFilter,
      minRating: this.minRatingFilter,
    };

    this.filterService.setFilters(filters);
  }
}
