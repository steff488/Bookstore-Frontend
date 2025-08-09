import { Component, ElementRef, HostListener, viewChild } from '@angular/core';
import { BookService } from '../../services/book-service/book.service';
import { Book } from '../../models/book';
import { CategoryService } from '../../services/category-service/category.service';
import { Category } from '../../models/category';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { FavoriteItem } from '../../models/favoriteItem';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { SidebarContent } from '../../components/sidebar/sidebar-content';
import { PageEvent } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    Navbar,
    SidebarContent,
  ],
})
export class BookList {
  userId!: number;

  books!: Observable<Book[]>;
  categories!: Observable<Category[]>;

  allBooks: Book[] = [];
  numberOfBooks = 0;
  pageSize = 25;
  currentPage = 0;

  favoriteItems: FavoriteItem[] = [];
  cartItems: CartItem[] = [];

  sideNavOpened = false;
  scrollY = 0;
  isScrolledToTop = true;

  toolbar = viewChild<ElementRef>('toolbar');
  isSticky = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY = window.pageYOffset;
    this.isScrolledToTop = window.scrollY === 0;

    const myToolbar = this.toolbar();
    if (myToolbar) {
      const rect = myToolbar.nativeElement.getBoundingClientRect();
      this.isSticky = Math.abs(rect.top - 64) < 1;
    }

    if (!this.isSticky) {
      this.sideNavOpened = false;
    }
  }

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private favoriteItemService: FavoriteItemService,
    private cartItemService: CartItemService
  ) {}

  // Repeat books as there aren't enougn in the database to require scrolling
  ngOnInit(): void {
    // const urserIdStr = localStorage.getItem('userId');
    const userIdStr = 1;
    if (!userIdStr) {
      console.error('book-list: UserId not found in localStorage');
      return;
    }

    this.userId = Number(userIdStr);

    this.books = this.bookService.getBooks();
    this.categories = this.categoryService.getCategories();

    this.bookService.getBooks().subscribe((books) => {
      this.allBooks = books;
      this.numberOfBooks = books.length;
      this.updatePagedBooks();
    });

    this.favoriteItemService.getAllByUserId(this.userId).subscribe({
      next: (items) => {
        this.favoriteItems = items;
      },
      error: (err) => console.error('Failed to load favorites:', err),
    });

    this.cartItemService.getAllByUserId(this.userId).subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => console.error('Failed to load cart items:', err),
    });
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedBooks();
  }

  updatePagedBooks() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paged = this.allBooks.slice(startIndex, endIndex);
    this.books = of(paged);
  }

  // Checks is a book is a favorite for a certain userId
  // (favoriteItems contain only books related to the passed userId)
  isBookFavorite(bookId: number): boolean {
    return this.favoriteItems.some((item) => item.bookId === bookId);
  }

  isBookInCart(bookId: number): boolean {
    return this.cartItems.some((item) => item.bookId === bookId);
  }

  getFavoriteButtonText(bookId: number): string {
    return this.isBookFavorite(bookId)
      ? 'Remove from favorites'
      : 'Add to favorites';
  }

  getCartButtonText(bookId: number): string {
    return 'Add to cart';
  }

  toggleFavorite(bookId: number): void {
    if (this.isBookFavorite(bookId)) {
      this.removeFromFavorites(bookId);
    } else {
      this.addToFavorites(bookId);
    }
  }

  private addToFavorites(bookId: number): void {
    const favoriteItem: FavoriteItem = {
      bookId: bookId,
      userId: this.userId,
    };

    this.favoriteItemService.createFavoriteItem(favoriteItem).subscribe({
      next: (newFavorite) => {
        this.favoriteItems = [...this.favoriteItems, newFavorite];
        console.log('Book added to favorites');
      },
      error: (err) => console.error('Failed to add to favorites:', err),
    });
  }

  private removeFromFavorites(bookId: number): void {
    const favoriteItem = this.favoriteItems.find(
      (item) => item.bookId === bookId && item.userId === this.userId
    );

    if (!favoriteItem?.id) return;

    this.favoriteItemService.deleteFavoriteItem(favoriteItem.id).subscribe({
      next: () => {
        this.favoriteItems = this.favoriteItems.filter(
          (item) => item.id !== favoriteItem.id
        );
        console.log('Removed from favorites');
      },
      error: (err) => console.error('Failed to remove favorite:', err),
    });
  }

  addToCart(bookId: number): void {
    // Check if item already exists in cart
    const existingCartItem = this.cartItems.find(
      (item) => item.bookId === bookId
    );

    if (existingCartItem) {
      // Item exists, increment quantity
      this.updateCartQuantity(
        existingCartItem.id!,
        existingCartItem.quantity + 1
      );
    } else {
      // Item doesn't exist, add new item
      this.createNewCartItem(bookId);
    }
  }

  private createNewCartItem(bookId: number): void {
    const cartItem: CartItem = {
      bookId: bookId,
      userId: this.userId,
      quantity: 1,
    };

    this.cartItemService.createCartItem(cartItem).subscribe({
      next: (newCartItem) => {
        this.cartItems = [...this.cartItems, newCartItem];
        console.log('Book added to cart');
      },
      error: (err) => console.error('Failed to add to cart:', err),
    });
  }

  private updateCartQuantity(cartItemId: number, newQuantity: number): void {
    const existingItem = this.cartItems.find((item) => item.id === cartItemId);

    if (!existingItem) return;

    const updatedCartItem: CartItem = {
      ...existingItem,
      quantity: newQuantity,
    };

    this.cartItemService.updateCartItem(cartItemId, updatedCartItem).subscribe({
      next: (updatedItem) => {
        this.cartItems = this.cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        console.log(`Cart quantity updated to ${newQuantity}`);
      },
      error: (err) => console.error('Failed to update cart quantity:', err),
    });
  }
}
