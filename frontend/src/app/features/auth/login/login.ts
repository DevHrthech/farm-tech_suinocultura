import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  emailError = signal('');
  passwordError = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.form.get('email')?.valueChanges.subscribe(() => this.updateEmailError());
    this.form.get('password')?.valueChanges.subscribe(() => this.updatePasswordError());
  }

  private updateEmailError(): void {
    const emailControl = this.form.get('email');
    if (emailControl?.hasError('required')) {
      this.emailError.set('Email é obrigatório');
    } else if (emailControl?.hasError('email')) {
      this.emailError.set('Email inválido');
    } else {
      this.emailError.set('');
    }
  }

  private updatePasswordError(): void {
    const passwordControl = this.form.get('password');
    if (passwordControl?.hasError('required')) {
      this.passwordError.set('Senha é obrigatória');
    } else if (passwordControl?.hasError('minlength')) {
      this.passwordError.set('Senha deve ter pelo menos 6 caracteres');
    } else {
      this.passwordError.set('');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.updateEmailError();
      this.updatePasswordError();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.value).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/courses']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Credenciais inválidas');
        console.error('Erro de login:', err);
      },
    });
  }
}
