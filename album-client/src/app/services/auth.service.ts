import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface User {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users: User[] = []; // In-memory user store
  private currentUserSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor() {}

  register(username: string, password: string): boolean {
    // Check if user already exists
    const userExists = this.users.some((user) => user.username === username);
    if (userExists) {
      return false; // Registration failed
    }
    // Add new user
    this.users.push({ username, password });
    return true; // Registration successful
  }

  login(username: string, password: string): boolean {
    const user = this.users.find((user) => user.username === username && user.password === password);
    if (user) {
      this.currentUserSubject.next(username);
      return true;
    }
    return false;
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
