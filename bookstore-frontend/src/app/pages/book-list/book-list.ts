import { Component, HostListener } from '@angular/core';
import { BookService } from '../../services/book-service/book.service';
import { Book } from '../../models/book';
import { CategoryService } from '../../services/category-service/category.service';
import { Category } from '../../models/category';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { FavoriteItem } from '../../models/favoriteItem';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-book-list',
  templateUrl: './book-list.html',
  styleUrl: './book-list.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, Navbar],
})
export class BookList {
  books!: Observable<Book[]>;
  categories!: Observable<Category[]>;

  favoriteItems: FavoriteItem[] = [];
  cartItems: CartItem[] = [];

  sideNavOpened = false;
  scrollY = 0;
  isScrolledToTop = true;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY = window.pageYOffset;
    this.isScrolledToTop = window.scrollY === 0;
  }

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private favoriteItemService: FavoriteItemService,
    private cartItemService: CartItemService
  ) {}

  // Repeat books as there aren't enougn in the database to require scrolling
  ngOnInit(): void {
    this.books = this.bookService.getBooks().pipe(
      map((books) => {
        let repeatedBooks: Book[] = [];
        for (let i = 0; i < 10; i++) {
          repeatedBooks = repeatedBooks.concat(books);
        }
        return repeatedBooks;
      })
    );
    this.categories = this.categoryService.getCategories();

    this.favoriteItemService.getFavoriteItems().subscribe({
      next: (items) => {
        this.favoriteItems = items;
      },
      error: (err) => console.error('Failed to load favorites:', err),
    });

    this.cartItemService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
      },
      error: (err) => console.error('Failed to load cart items:', err),
    });
  }

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
      userId: 1,
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
      (item) => item.bookId === bookId && item.userId === 1
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
      (item) => item.bookId === bookId && item.userId === 1
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
      userId: 1,
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

  private removeFromCart(bookId: number): void {
    const cartItem = this.cartItems.find(
      (item) => item.bookId === bookId && item.userId === 1
    );

    if (!cartItem?.id) return;

    this.cartItemService.deleteCartItem(cartItem.id).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item.id !== cartItem.id
        );
        console.log('Removed from cart');
      },
      error: (err) => console.error('Failed to remove from cart:', err),
    });
  }
}
