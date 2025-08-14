import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { FavoriteItem } from '../../models/favoriteItem';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { Navbar } from '../../components/navbar/navbar';
import { AuthorService } from '../../services/author-service/author.service';
import { BookService } from '../../services/book-service/book.service';

interface FavoriteItemWithDetails {
  id: number;
  userId: number;
  bookId: number;
  bookTitle: string;
  authorName: string;
  price: number;
  coverImageUrl: string;
}

@Component({
  selector: 'app-favorite',
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Favorites {
  userId!: number;

  favoriteItems: FavoriteItemWithDetails[] = [];

  constructor(
    private favoriteItemService: FavoriteItemService,
    private bookService: BookService,
    private authorService: AuthorService
  ) {}

  ngOnInit(): void {
    // const urserIdStr = localStorage.getItem('userId');
    const userIdStr = 1;
    if (!userIdStr) {
      console.error('book-list: UserId not found in localStorage');
      return;
    }

    this.userId = Number(userIdStr);

    this.loadAuthorsIntoCache();
    this.loadFavoriteItems(this.userId);
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
  loadFavoriteItems(userId: number): void {
    this.favoriteItemService.getAllByUserId(userId).subscribe({
      next: (favoriteItems) => {
        console.log('Favorite items loaded:', favoriteItems.length);

        // Load book for each favoriteItem
        favoriteItems.forEach((favoriteItem) => {
          this.bookService.getBookById(favoriteItem.bookId).subscribe({
            next: (book) => {
              // Load author for this book (from cache)
              this.authorService
                .getAuthorById(Number(book.authorId))
                .subscribe({
                  next: (author) => {
                    if (favoriteItem.id && author) {
                      const item: FavoriteItemWithDetails = {
                        id: favoriteItem.id,
                        userId: this.userId,
                        bookId: book.id,
                        bookTitle: book.title,
                        authorName: author.name,
                        price: book.price,
                        coverImageUrl: book.coverImageUrl,
                      };

                      this.favoriteItems.push(item);
                    } else {
                      console.error('Missing favorite item id or author data', {
                        cartItemId: favoriteItem.id,
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
      error: (err) => console.error('Failed to load favorite items:', err),
    });
  }

  removeFromFavorites(favoriteItemId: number): void {
    this.favoriteItemService.deleteFavoriteItem(favoriteItemId).subscribe({
      next: () => {
        this.favoriteItems = this.favoriteItems.filter(
          (item) => item.id !== favoriteItemId
        );

        console.log('Removed from favorites');
      },
      error: (err) => console.error('Failed to remove from favorites:', err),
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
