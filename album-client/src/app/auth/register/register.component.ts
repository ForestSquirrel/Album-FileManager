import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    MatButtonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrls:  ['./register.component.scss'],
})
export class RegisterComponent {
  username = '';
  password = '';
  repeatPassword = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  showPassword: boolean = false;
  showRepeatPassword: boolean = false;

  togglePasswordVisibility(field: string): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'repeatPassword') {
      this.showRepeatPassword = !this.showRepeatPassword;
    }
  }

  isLoading = false;

  onSubmit(): void {
    if (this.password !== this.repeatPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    this.isLoading = true;
    this.authService
      .register(this.username, this.password)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          // Automatically log in after registration
          this.authService.login(this.username, this.password).subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: (error) => {
          this.errorMessage = error.error.message || 'An error occurred';
        },
      });
  }
}
