import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material-module';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { BookService } from '../../services/book-service/book.service';
import { Navbar } from '../../components/navbar/navbar';
import { AuthorService } from '../../services/author-service/author.service';
import { RouterModule } from '@angular/router';

interface CartItemWithDetails {
  id: number;
  bookId: number;
  bookTitle: string;
  authorName: string;
  price: number;
  quantity: number;
  coverImageUrl: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Cart implements OnInit {
  cartItems: CartItemWithDetails[] = [];
  total: number = 0;

  constructor(
    private cartItemService: CartItemService,
    private bookService: BookService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    const userId = 1;
    this.loadAuthorsIntoCache();
    this.loadCartItems(userId);
  }

  /*==================== LOAD AUTHORS INTO CACHE ====================*/
  loadAuthorsIntoCache(): void {
    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        console.log('Authors loaded into cache:', authors.length);
      },
      error: (err) => console.error('Failed to load authors into cache:', err),
    });
  }

  /*==================== LOAD CART ITEMS ====================*/
  loadCartItems(userId: number): void {
    this.cartItemService.getAllByUserId(userId).subscribe({
      next: (cartItems) => {
        console.log('Cart items loaded:', cartItems.length);

        // Load book for each cartItem
        cartItems.forEach((cartItem) => {
          this.bookService.getBookById(cartItem.bookId).subscribe({
            next: (book) => {
              // Load author for this book (from cache)
              this.authorService
                .getAuthorById(Number(book.authorId))
                .subscribe({
                  next: (author) => {
                    if (cartItem.id && author) {
                      const item: CartItemWithDetails = {
                        id: cartItem.id,
                        bookId: book.id,
                        bookTitle: book.title,
                        authorName: author.name,
                        price: book.price,
                        quantity: cartItem.quantity,
                        coverImageUrl: book.coverImageUrl,
                      };

                      this.cartItems.push(item);
                      this.computeTotal();
                    } else {
                      console.error('Missing cart item id or author data', {
                        cartItemId: cartItem.id,
                        author: author,
                      });
                    }
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

  /*==================== COMPUTE CART TOTAL ====================*/
  private computeTotal(): void {
    this.total = 0;

    this.cartItems.forEach((cartItem) => {
      this.total += cartItem.quantity * cartItem.price;
    });

    // Round to 2 decimal places
    this.total = Math.round(this.total * 100) / 100;
  }

  /*==================== REMOVE FROM CART ====================*/
  removeFromCart(cartItemId: number): void {
    this.cartItemService.deleteCartItem(cartItemId).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item.id !== cartItemId
        );

        // Recompute total
        this.computeTotal();

        console.log('Removed from cart');
      },
      error: (err) => console.error('Failed to remove from cart:', err),
    });
  }

  /*==================== DECREMENT CART ITEM QUANTITY ====================*/
  decrementCartItemQuantity(cartItemId: number): void {
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
      id: existingItem.id,
      bookId: existingItem.bookId,
      userId: 1,
      quantity: existingItem.quantity - 1,
    };

    this.cartItemService.updateCartItem(cartItemId, updatedItem).subscribe({
      next: () => {
        // Update the existing item
        existingItem.quantity = existingItem.quantity - 1;

        // Recompute total
        this.computeTotal();

        console.log('Decremented quantity to', existingItem.quantity);
      },
      error: (err) => console.error('Failed to decrement quantity:', err),
    });
  }

  /*==================== INCREMENT CART ITEM QUANTITY ====================*/
  incrementCartItemQuantity(cartItemId: number): void {
    const existingItem = this.cartItems.find((item) => item.id === cartItemId);

    if (!existingItem) {
      console.error('Cart item not found');
      return;
    }

    const updatedItem: CartItem = {
      id: existingItem.id,
      bookId: existingItem.bookId,
      userId: 1,
      quantity: existingItem.quantity + 1,
    };

    this.cartItemService.updateCartItem(cartItemId, updatedItem).subscribe({
      next: () => {
        // Update the existing item
        existingItem.quantity = existingItem.quantity + 1;

        // Recompute total
        this.computeTotal();

        console.log('Incremented quantity to', existingItem.quantity);
      },
      error: (err) => console.error('Failed to increment quantity:', err),
    });
  }

  // Fully AI generated function
  getOptimizedImageUrl(originalUrl: string): string {
    // Check if it's a Cloudinary URL
    if (originalUrl && originalUrl.includes('cloudinary.com')) {
      // Insert transformation parameters to resize to 256x390 (2x the display size for retina)
      return originalUrl.replace(
        '/upload/',
        '/upload/w_256,h_390,c_fill,f_auto,q_auto/'
      );
    }

    // Return original URL for local images
    return originalUrl;
  }
}
