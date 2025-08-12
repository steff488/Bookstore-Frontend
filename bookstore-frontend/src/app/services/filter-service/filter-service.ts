import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookFilters } from '../../models/bookFilters';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filters = new BehaviorSubject<BookFilters>({
    categoryIds: [],
    minPrice: undefined,
    maxPrice: undefined,
    maxPages: undefined,
    minRating: undefined,
  });
  currentFilters = this.filters.asObservable();

  setFilters(filters: BookFilters) {
    this.filters.next(filters);
  }
}
