import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { Author } from '../../models/author';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private apiUrl = `${environment.apiUrl}/api/authors`;

  private authorBehaviorSubject = new BehaviorSubject<Author[]>([]);
  authors = this.authorBehaviorSubject.asObservable();

  constructor(private http: HttpClient) {}

  // 1. Create author
  createAuthor(author: Author): Observable<Author> {
    return this.http.post<Author>(this.apiUrl, author);
  }

  // 2. Get all authors
  getAuthors(): Observable<Author[]> {
    // Return cached authors if possible
    if (this.authorBehaviorSubject.value.length > 0) {
      return this.authorBehaviorSubject;
    }
    // Otherwise, fetch from API and cache
    return this.http
      .get<Author[]>(this.apiUrl)
      .pipe(tap((authors) => this.authorBehaviorSubject.next(authors)));
  }

  // 3. Get author by id
  getAuthorById(id: number): Observable<Author | undefined> {
    // Try to get author from cache first
    if (this.authorBehaviorSubject.value.length > 0) {
      const author = this.authorBehaviorSubject.value.find((a) => a.id === id);
      return of(author);
    }
    // If not cached, get it from the API and cache
    return this.http.get<Author>(`${this.apiUrl}/${id}`).pipe(
      tap((fetchedAuthor) => {
        this.authorBehaviorSubject.next([
          ...this.authorBehaviorSubject.value,
          fetchedAuthor,
        ]);
      })
    );
  }

  // 4. Update an author
  updateAuthor(id: number, author: Author): Observable<Author> {
    return this.http.put<Author>(`${this.apiUrl}/${id}`, author);
  }

  // 5. Delete an author
  deleteAuthor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
