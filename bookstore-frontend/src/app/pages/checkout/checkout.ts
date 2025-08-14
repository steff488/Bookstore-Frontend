import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../material/material-module';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Navbar } from '../../components/navbar/navbar';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { BookService } from '../../services/book-service/book.service';
import { AuthorService } from '../../services/author-service/author.service';

interface orderItemWithDetails {
  id: number;
  bookId: number;
  bookTitle: string;
  authorName: string;
  price: number;
  quantity: number;
  coverImageUrl: string;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    Navbar,
  ],
})
export class Checkout implements OnInit {
  orderItems: orderItemWithDetails[] = [];

  shippingFormGroup!: FormGroup;
  paymentFormGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private cartItemService: CartItemService,
    private bookService: BookService,
    private authorService: AuthorService
  ) {}

  ngOnInit() {
    const userId = 1;
    this.loadAuthorsIntoCache();
    this.loadCartItems(userId);

    this.createhippingFormGorup();
    this.createPaymentFormGroup();
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
                      const item: orderItemWithDetails = {
                        id: cartItem.id,
                        bookId: book.id,
                        bookTitle: book.title,
                        authorName: author.name,
                        price: book.price,
                        quantity: cartItem.quantity,
                        coverImageUrl: book.coverImageUrl,
                      };

                      this.orderItems.push(item);
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

  private createhippingFormGorup() {
    this.shippingFormGroup = this.formBuilder.group({
      county: ['', Validators.required],
      town: ['', Validators.required],
      address: ['', Validators.required],
      postalCode: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
    });
  }

  private createPaymentFormGroup() {
    this.paymentFormGroup = this.formBuilder.group({
      // Add later
    });
  }

  onPhoneNumberInput(event: any) {
    // Remove any non-digit characters
    const value = event.target.value.replace(/[^0-9]/g, '');
    this.shippingFormGroup.get('phoneNumber')?.setValue(value);
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
