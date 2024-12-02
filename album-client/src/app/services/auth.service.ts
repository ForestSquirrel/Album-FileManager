import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '../shared/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  private currentUserIdSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');
    if (storedUsername) {
      this.currentUserSubject.next(storedUsername);
    }
    if (storedUserId) {
      this.currentUserIdSubject.next(storedUserId);
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(API_ENDPOINTS.LOGIN, { username, password })
      .pipe(
        tap((response) => {
          // Store the username and userId
          this.currentUserSubject.next(response.username);
          this.currentUserIdSubject.next(response.userId.toString());

          // Save to localStorage (optional)
          localStorage.setItem('username', response.username);
          localStorage.setItem('userId', response.userId.toString());
        })
      );
  }

  logout(): void {
    // Clear the stored username and userId
    this.currentUserSubject.next(null);
    this.currentUserIdSubject.next(null);

    // Remove from localStorage (if used)
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
  }

  getCurrentUser(): Observable<string | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserId(): Observable<string | null> {
    return this.currentUserIdSubject.asObservable();
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post<any>(API_ENDPOINTS.REGISTER, { username, password }).pipe(
      tap((response) => {
        // Store the username and userId
        this.currentUserSubject.next(response.username);
        this.currentUserIdSubject.next(response.userId.toString());
  
        // Save to localStorage (optional)
        localStorage.setItem('username', response.username);
        localStorage.setItem('userId', response.userId.toString());
      })
    );
  }
}
