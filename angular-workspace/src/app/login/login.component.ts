import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { hasAccessToken, signInWithPassword } from '../auth-session';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitting = false;
  hasAnonKey = !!environment.auth.anonKey?.trim();

  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _toastrService: ToastrService,
  ) {
    if (hasAccessToken()) {
      void this._router.navigateByUrl('/');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSubmitting) {
      return;
    }

    if (!this.email.trim() || !this.password) {
      this._toastrService.error('Email and password are required');
      return;
    }

    this.isSubmitting = true;

    try {
      await signInWithPassword(this.email.trim(), this.password);
      const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') || '/';
      await this._router.navigateByUrl(returnUrl);
      this._toastrService.success('Signed in');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not sign in with Supabase';
      this._toastrService.error(message);
    } finally {
      this.isSubmitting = false;
    }
  }
}
