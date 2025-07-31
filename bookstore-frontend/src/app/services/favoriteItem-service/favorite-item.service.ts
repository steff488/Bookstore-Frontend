import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FavoriteItem } from '../../models/favoriteItem';

@Injectable({
  providedIn: 'root',
})
export class FavoriteItemService {
  private apiUrl = 'http://localhost:8080/api/favoriteItems';

  constructor(private http: HttpClient) {}

  // 1. Create favoriteItem
  createFavoriteItem(favoriteItem: FavoriteItem): Observable<FavoriteItem> {
    return this.http.post<FavoriteItem>(this.apiUrl, favoriteItem);
  }

  // 2. Get all favoriteItems
  getFavoriteItems(): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(this.apiUrl);
  }

  // 3. Get favoriteItem by id
  getFavoriteItemById(id: number): Observable<FavoriteItem> {
    return this.http.get<FavoriteItem>(`${this.apiUrl}/${id}`);
  }

  // 4. Update an favoriteItem
  updateFavoriteItem(
    id: number,
    favoriteItem: FavoriteItem
  ): Observable<FavoriteItem> {
    return this.http.put<FavoriteItem>(`${this.apiUrl}/${id}`, favoriteItem);
  }

  // 5. Delete an favoriteItem
  deleteFavoriteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 6. Get favoriteItem by userId
  getAllByUserId(userId: number): Observable<FavoriteItem[]> {
    return this.http.get<FavoriteItem[]>(`${this.apiUrl}?userId=${userId}`);
  }
}
