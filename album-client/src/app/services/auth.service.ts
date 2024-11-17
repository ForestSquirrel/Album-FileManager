import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

import { API_ENDPOINTS } from '../shared/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {}

  register(username: string, password: string): Observable<any> {
    return this.http.post(API_ENDPOINTS.REGISTER, { username, password });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(API_ENDPOINTS.LOGIN, { username, password }).pipe(
      tap(() => {
        this.currentUserSubject.next(username);
      })
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<string | null> {
    return this.currentUserSubject.asObservable();
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
