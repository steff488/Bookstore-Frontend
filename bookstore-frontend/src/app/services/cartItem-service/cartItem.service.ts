import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../../models/cartItem';

@Injectable({
  providedIn: 'root',
})
export class CartItemService {
  private apiUrl = 'http://localhost:8080/api/cartItems';

  constructor(private http: HttpClient) {}

  // 1. Create cartItem
  createCartItem(cartItem: CartItem): Observable<CartItem> {
    return this.http.post<CartItem>(this.apiUrl, cartItem);
  }

  // 2. Get all cartItems
  getCartItems(): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(this.apiUrl);
  }

  // 3. Get cartItem by id
  getCartItemById(id: number): Observable<CartItem> {
    return this.http.get<CartItem>(`${this.apiUrl}/${id}`);
  }

  // 4. Update an cartItem
  updateCartItem(id: number, cartItem: CartItem): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.apiUrl}/${id}`, cartItem);
  }

  // 5. Delete an cartItem
  deleteCartItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 6. Get cartItem by userId
  getAllByUserId(userId: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.apiUrl}?userId=${userId}`);
  }
}
