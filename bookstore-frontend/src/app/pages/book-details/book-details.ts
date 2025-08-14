import { Component, numberAttribute, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Book } from '../../models/book';
import { BookService } from '../../services/book-service/book.service';
import { FavoriteItem } from '../../models/favoriteItem';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { CartItem } from '../../models/cartItem';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { Navbar } from '../../components/navbar/navbar';
import { AuthorService } from '../../services/author-service/author.service';
import { CategoryService } from '../../services/category-service/category.service';

interface BookWithDetails {
  id: number;
  title: string;
  authorName: string;
  categoryName: string;
  price: number;
  rating: number;
  pageCount: number;
  description: string;
  stock: number;
  coverImageUrl: string;
  publicationDate: string;
}

@Component({
  selector: 'app-book-details',
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
  standalone: true,
  imports: [CommonModule, MaterialModule, Navbar],
})
export class BookDetails implements OnInit {
  bookId!: number;
  book!: Book;
  bookWithDetails!: BookWithDetails;

  favoriteItems: FavoriteItem[] = [];
  cartItems: CartItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private bookService: BookService,
    private authorService: AuthorService,
    private categoryService: CategoryService,
    private favoriteItemService: FavoriteItemService,
    private cartItemService: CartItemService
  ) {}
  ngOnInit(): void {
    this.bookId = Number(this.route.snapshot.paramMap.get('id'));

    this.bookService.getBookById(this.bookId).subscribe({
      next: (book) => {
        this.book = book;

        // Initial bookWithDetails with placeholders
        this.bookWithDetails = {
          id: book.id,
          title: book.title,
          authorName: 'Loading...',
          categoryName: 'Loading...',
          price: book.price,
          rating: book.rating,
          pageCount: book.pageCount,
          description: book.description,
          stock: book.stock,
          coverImageUrl: book.coverImageUrl,
          publicationDate: book.publicationDate,
        };

        // Load author and category names
        this.loadAuthorName(book.authorId);
        this.loadCategoryName(book.categoryId);
      },
      error: (err) => console.error('Failed to load book:', err),
    });

    this.loadFavoritesAndCart();
  }

  // Load author name
  private loadAuthorName(authorId: number): void {
    this.authorService.getAuthorById(authorId).subscribe({
      next: (author) => {
        this.bookWithDetails.authorName = author?.name || 'Unknown Author';
      },
      error: (err) => {
        console.error('Failed to load author:', err);
        this.bookWithDetails.authorName = 'Unknown Author';
      },
    });
  }

  // Load category name
  private loadCategoryName(categoryId: number): void {
    this.categoryService.getCategoryById(categoryId).subscribe({
      next: (category) => {
        this.bookWithDetails.categoryName =
          category?.name || 'Unknown Category';
      },
      error: (err) => {
        console.error('Failed to load category:', err);
        this.bookWithDetails.categoryName = 'Unknown Category';
      },
    });
  }

  // Load favorites and cart
  private loadFavoritesAndCart(): void {
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

  getFavoriteIcon(bookId: number): string {
    return this.isBookFavorite(bookId) ? 'favorite' : 'favorite_border';
  }

  getCartIcon(bookId: number): string {
    return this.isBookInCart(bookId)
      ? 'remove_shopping_cart'
      : 'add_shopping_cart';
  }

  getFavoriteButtonText(bookId: number): string {
    return this.isBookFavorite(bookId)
      ? 'Remove from favorites'
      : 'Add to favorites';
  }

  getCartButtonText(bookId: number): string {
    return this.isBookInCart(bookId) ? 'Remove from cart' : 'Add to cart';
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

  toggleCart(bookId: number): void {
    if (this.isBookInCart(bookId)) {
      this.removeFromCart(bookId);
    } else {
      this.addToCart(bookId);
    }
  }

  private addToCart(bookId: number): void {
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

  // Dynamic rating UI
  getStarType(rating: number) {
    let starStates: ('star' | 'star_half' | 'star_outline')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        starStates.push('star'); // full
      } else if (rating >= i - 0.5) {
        starStates.push('star_half'); // half
      } else {
        starStates.push('star_outline'); // empty
      }
    }

    return starStates;
  }
}
