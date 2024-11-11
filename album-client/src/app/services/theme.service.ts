import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class ThemeService {
  private themeKey = 'selectedTheme';

  setTheme(theme: string): void {
    document.body.className = ''; // Remove existing theme classes
    document.body.classList.add(theme); // Add new theme class
    localStorage.setItem(this.themeKey, theme); // Persist the theme
  }

  getStoredTheme(): string | null {
    return localStorage.getItem(this.themeKey);
  }
}
