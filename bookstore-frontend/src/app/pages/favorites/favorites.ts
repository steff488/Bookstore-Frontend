import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material/material-module';
import { FavoriteItemService } from '../../services/favoriteItem-service/favorite-item.service';
import { FavoriteItem } from '../../models/favoriteItem';
import { CartItemService } from '../../services/cartItem-service/cartItem.service';
import { CartItem } from '../../models/cartItem';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, Navbar],
})
export class Favorites {
  userId!: number;

  favoriteItems: FavoriteItem[] = [];
  cartItems: CartItem[] = [];

  constructor(
    private favoriteItemService: FavoriteItemService,
    private cartItemService: CartItemService
  ) {}

  ngOnInit(): void {
    // const urserIdStr = localStorage.getItem('userId');
    const userIdStr = 1;
    if (!userIdStr) {
      console.error('book-list: UserId not found in localStorage');
      return;
    }

    this.userId = Number(userIdStr);

    // Load automatically instead of using Observable to make it easier to remove from favorites
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

  removeFromFavorites(bookId: number): void {
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
