import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { BookService } from '../../services/book-service/book.service';
import { Book } from '../../models/book';
import { Navbar } from '../../components/navbar/navbar';
import { Author } from '../../models/author';
import { AuthorService } from '../../services/author-service/author.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Cart implements OnInit {
  cartItems: CartItem[] = [];
  books: Book[] = [];
  authors: Author[] = [];

  total: number = 0;

  constructor(
    private cartItemService: CartItemService,
    private bookService: BookService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    //const userId = Number(localStorage.getItem('userId'));
    const userId = 1;

    this.cartItemService.getAllByUserId(userId).subscribe({
      next: (cartItems) => {
        this.cartItems = cartItems;

        cartItems.forEach((cartItem) => {
          this.bookService.getBookById(cartItem.bookId).subscribe({
            next: (book) => {
              this.books.push(book);

              // Load author for this book
              this.authorService
                .getAuthorById(Number(book.authorId))
                .subscribe({
                  next: (author) => {
                    this.authors.push(author);
                    // Recompute total after each book is loaded
                    // (this is neccessary because of the async)
                    this.computeTotal();
                  },
                  error: (err) => console.error('Failed to fetch author:', err),
                });
            },
            error: (err) => console.error('Failed to fetch book:', err),
          });
        });
      },
      error: (err) => console.error('Failed to load cart items:', err),
    });
  }

  private computeTotal(): void {
    this.total = 0;

    // Go through each cart item
    this.cartItems.forEach((cartItem) => {
      // Find the matching book for this cart item
      const book = this.books.find((b) => b.id === cartItem.bookId);

      if (book) {
        this.total += cartItem.quantity * book.price;
      }
    });

    // Round to 2 decimal places
    this.total = Math.round(this.total * 100) / 100;
  }

  // Helper method to format total for display
  getFormattedTotal(): string {
    return this.total.toFixed(2);
  }

  // Helper method to find book by bookId
  getBookById(bookId: number): Book | null {
    const book = this.books.find((b) => b.id === bookId);
    return book || null;
  }

  // Helper method to find author by authorId
  getAuthorById(authorId: number): Author | null {
    const author = this.authors.find((a) => a.id === authorId);
    return author || null;
  }

  // Helper method to get author name for a book
  getAuthorNameForBook(bookId: number): string {
    const book = this.getBookById(bookId);
    if (!book) return 'Unknown Book';

    const author = this.getAuthorById(Number(book.authorId));
    return author ? author.name : 'Unknown Author';
  }

  removeFromCart(cartItemId: number): void {
    this.cartItemService.deleteCartItem(cartItemId).subscribe({
      next: () => {
        // Remove from cartItems array
        this.cartItems = this.cartItems.filter(
          (item) => item.id !== cartItemId
        );

        // Find the cart item that was removed to get its bookId
        const removedCartItem = this.cartItems.find(
          (item) => item.id === cartItemId
        );
        if (removedCartItem) {
          // Remove the corresponding book from books array
          this.books = this.books.filter(
            (book) => book.id !== removedCartItem.bookId
          );
        }

        // Recalculate total
        this.computeTotal();

        console.log('Removed from cart');
      },
      error: (err) => console.error('Failed to remove from cart:', err),
    });
  }

  decrementCartItemQuantity(cartItemId: number): void {
    // Find the current cart item
    const existingItem = this.cartItems.find((item) => item.id === cartItemId);

    if (!existingItem) {
      console.error('Cart item not found');
      return;
    }

    if (existingItem.quantity <= 1) {
      console.warn('Quantity is already at minimum');
      return;
    }

    const updatedItem: CartItem = {
      ...existingItem,
      quantity: existingItem.quantity - 1,
    };

    this.cartItemService.updateCartItem(cartItemId, updatedItem).subscribe({
      next: () => {
        // Update the cart item in the array
        this.cartItems = this.cartItems.map((item) =>
          item.id === cartItemId ? updatedItem : item
        );

        // Recalculate total
        this.computeTotal();

        console.log('Decremented quantity to', updatedItem.quantity);
      },
      error: (err) => console.error('Failed to decrement quantity:', err),
    });
  }

  incrementCartItemQuantity(cartItemId: number): void {
    // Find the current cart item
    const existingItem = this.cartItems.find((item) => item.id === cartItemId);

    if (!existingItem) {
      console.error('Cart item not found');
      return;
    }

    const updatedItem: CartItem = {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    };

    this.cartItemService.updateCartItem(cartItemId, updatedItem).subscribe({
      next: () => {
        // Update the cart item in the array
        this.cartItems = this.cartItems.map((item) =>
          item.id === cartItemId ? updatedItem : item
        );

        // Recalculate total
        this.computeTotal();

        console.log('Incremented quantity to', updatedItem.quantity);
      },
      error: (err) => console.error('Failed to increment quantity:', err),
    });
  }
}
