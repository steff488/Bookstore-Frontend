import { Component, ElementRef, HostListener, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BookService } from '../../services/book-service/book.service';
import { CategoryService } from '../../services/category-service/category.service';
import { Category } from '../../models/category';
import { AuthorService } from '../../services/author-service/author.service';
import { BookFilters } from '../../models/bookFilters';
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
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { RouterModule } from '@angular/router';
import { SearchService } from '../../services/search-service/search.service';
import { FilterService } from '../../services/filter-service/filter-service';

interface BookWithDetails {
  id: number;
  title: string;
  authorName: string;
  categoryId: number;
  price: number;
  rating: number;
  pageCount: number;
  coverImageUrl: string;
}

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

  allBooksWithDetails: BookWithDetails[] = [];
  filteredBooksWithDetails: BookWithDetails[] = [];
  categories!: Observable<Category[]>;

  // For pagination - using the interface
  paginatedBooks!: Observable<BookWithDetails[]>;
  pageSize = 24;
  currentPage = 0;

  favoriteItems: FavoriteItem[] = [];
  cartItems: CartItem[] = [];

  sideNavOpened = false;
  scrollY = 0;
  isScrolledToTop = true;

  searchQuery = '';
  sortOption = 'noOrder';

  toolbar = viewChild<ElementRef>('toolbar');
  paginator = viewChild<MatPaginator>('paginator');
  isSticky = false;

  constructor(
    private bookService: BookService,
    private categoryService: CategoryService,
    private authorService: AuthorService,
    private favoriteItemService: FavoriteItemService,
    private cartItemService: CartItemService,
    private searchService: SearchService,
    private filterService: FilterService,
    private router: Router
  ) {}

  openBookDetails(bookId: number) {
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/books', bookId])
    );
    window.open(url, '_blank');
  }

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

  ngOnInit(): void {
    // const urserIdStr = localStorage.getItem('userId');
    const userIdStr = 1;
    if (!userIdStr) {
      console.error('book-list: UserId not found');
      return;
    }

    this.userId = Number(userIdStr);

    // Load categories
    this.categories = this.categoryService.getCategories();

    // Load authors into cache first, then load books
    this.loadAuthorsIntoCache();
    this.loadBooksWithDetails();

    // Load user's favorites and cart items
    this.loadUserData();

    this.filterService.currentFilters.subscribe((filters) => {
      this.applySearchAndFilters(this.searchQuery, filters);
    });

    this.searchService.currentSearchQuery.subscribe((searchQuery) => {
      this.applySearchAndFilters(searchQuery);
    });
  }

  // Load all authors into cache first
  loadAuthorsIntoCache(): void {
    this.authorService.getAuthors().subscribe({
      next: (authors) => {
        console.log('Authors loaded into cache:', authors.length);
      },
      error: (err) => console.error('Failed to load authors into cache:', err),
    });
  }

  // Load books and combine with author data
  loadBooksWithDetails(): void {
    this.bookService.getBooks().subscribe({
      next: (books) => {
        console.log('Books loaded:', books.length);

        // For each book, get the author and create BookWithDetails
        books.forEach((book) => {
          this.authorService.getAuthorById(Number(book.authorId)).subscribe({
            next: (author) => {
              if (author) {
                const bookWithDetails: BookWithDetails = {
                  id: book.id,
                  title: book.title,
                  authorName: author.name,
                  categoryId: Number(book.categoryId),
                  price: book.price,
                  rating: book.rating,
                  pageCount: book.pageCount,
                  coverImageUrl: book.coverImageUrl,
                };

                this.allBooksWithDetails.push(bookWithDetails);

                // Update filtered books and pagination
                if (this.allBooksWithDetails.length === books.length) {
                  this.filteredBooksWithDetails = [...this.allBooksWithDetails];
                  this.resetPagination();
                  console.log(
                    'All books with authors loaded:',
                    this.allBooksWithDetails.length
                  );
                }
              }
            },
            error: (err) => console.error('Failed to fetch author:', err),
          });
        });
      },
      error: (err) => console.error('Failed to load books:', err),
    });
  }

  // Load user favorites and cart items
  loadUserData(): void {
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

  applySearchAndFilters(searchQuery = '', filters?: BookFilters) {
    this.sideNavOpened = false;
    this.searchQuery = searchQuery;

    this.filteredBooksWithDetails = this.allBooksWithDetails.filter((book) => {
      let matchesSearch = true;
      let matchesCategory = true;
      let matchesPrice = true;
      let matchedPages = true;
      let matchesRating = true;

      if (searchQuery) {
        matchesSearch = book.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }

      if (filters) {
        if (filters.categoryIds?.length) {
          matchesCategory = filters.categoryIds.includes(book.categoryId);
        }

        if (filters.minPrice) {
          matchesPrice = matchesPrice && book.price >= filters.minPrice;
        }

        if (filters.maxPrice) {
          matchesPrice = matchesPrice && book.price <= filters.maxPrice;
        }

        if (filters.maxPages) {
          matchedPages = book.pageCount <= filters.maxPages;
        }

        if (filters.minRating) {
          matchesRating = book.rating >= filters.minRating;
        }
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPrice &&
        matchedPages &&
        matchesRating
      );
    });

    this.resetPagination();
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePagedBooks();
  }
  updatePagedBooks() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paged = this.filteredBooksWithDetails.slice(startIndex, endIndex);
    this.paginatedBooks = of(paged);
  }

  private resetPagination() {
    this.currentPage = 0;
    const paginator = this.paginator();
    if (paginator) {
      paginator.pageIndex = 0;
    }
    this.updatePagedBooks();
  }

  // Book interaction methods
  isBookFavorite(bookId: number): boolean {
    return this.favoriteItems.some((item) => item.bookId === bookId);
  }

  isBookInCart(bookId: number): boolean {
    return this.cartItems.some((item) => item.bookId === bookId);
  }

  getFavoriteButtonText(bookId: number): string {
    return this.isBookFavorite(bookId) ? 'favorite' : 'favorite_border';
  }

  getCartButtonText(bookId: number): string {
    return this.isBookInCart(bookId)
      ? 'remove_shopping_cart'
      : 'add_shopping_cart';
  }

  toggleFavorite(bookId: number): void {
    if (this.isBookFavorite(bookId)) {
      this.removeFromFavorites(bookId);
    } else {
      this.addToFavorites(bookId);
    }
  }

  toggleCart(bookId: number): void {
    if (this.isBookInCart(bookId)) {
      this.removeFromCart(bookId);
    } else {
      this.addToCart(bookId);
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

  removeFromCart(bookId: number) {
    const cartItem = this.cartItems.find(
      (item) => item.bookId === bookId && item.userId === this.userId
    );

    if (!cartItem?.id) return;

    this.cartItemService.deleteCartItem(cartItem.id).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(
          (item) => item.id !== cartItem.id
        );
        console.log('Removed from cart');
      },
      error: (err) => console.error('Failed to remove cart:', err),
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.bookService.searchBooks(this.searchQuery).subscribe((books) => {
        books.forEach((book, index) => {
          this.authorService.getAuthorById(Number(book.authorId)).subscribe({
            next: (author) => {
              if (author) {
                const bookWithDetails: BookWithDetails = {
                  id: book.id,
                  title: book.title,
                  authorName: author.name,
                  categoryId: Number(book.categoryId),
                  price: book.price,
                  pageCount: book.pageCount,
                  rating: book.rating,
                  coverImageUrl: book.coverImageUrl,
                };

                this.allBooksWithDetails.push(bookWithDetails);
                this.filteredBooksWithDetails = [...this.allBooksWithDetails];
                this.resetPagination();
              }
            },
          });
        });
      });
    } else {
      // If the search query is empty, reset
      this.filteredBooksWithDetails = [...this.allBooksWithDetails];
      this.resetPagination();
    }
  }

  applySort() {
    if (this.sortOption == 'noOrder') {
      this.filteredBooksWithDetails = [...this.allBooksWithDetails];
    } else {
      this.filteredBooksWithDetails.sort((a, b) => {
        if (this.sortOption == 'priceAsc') {
          return a.price - b.price;
        } else if (this.sortOption == 'priceDesc') {
          return b.price - a.price;
        }
        return 0;
      });
    }
    this.resetPagination();
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
