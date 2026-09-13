import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
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
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal('');
  nomeCompletoError = signal('');
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group(
      {
        nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.form.get('nomeCompleto')?.valueChanges.subscribe(() => this.updateNomeCompletoError());
    this.form.get('email')?.valueChanges.subscribe(() => this.updateEmailError());
    this.form.get('password')?.valueChanges.subscribe(() => this.updatePasswordError());
    this.form.get('confirmPassword')?.valueChanges.subscribe(() => this.updateConfirmPasswordError());
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private updateNomeCompletoError(): void {
    const control = this.form.get('nomeCompleto');
    if (control?.hasError('required')) {
      this.nomeCompletoError.set('Nome completo é obrigatório');
    } else if (control?.hasError('minlength')) {
      this.nomeCompletoError.set('Nome completo deve ter pelo menos 3 caracteres');
    } else {
      this.nomeCompletoError.set('');
    }
  }

  private updateEmailError(): void {
    const control = this.form.get('email');
    if (control?.hasError('required')) {
      this.emailError.set('Email é obrigatório');
    } else if (control?.hasError('email')) {
      this.emailError.set('Email inválido');
    } else {
      this.emailError.set('');
    }
  }

  private updatePasswordError(): void {
    const control = this.form.get('password');
    if (control?.hasError('required')) {
      this.passwordError.set('Senha é obrigatória');
    } else if (control?.hasError('minlength')) {
      this.passwordError.set('Senha deve ter pelo menos 6 caracteres');
    } else {
      this.passwordError.set('');
    }
  }

  private updateConfirmPasswordError(): void {
    const control = this.form.get('confirmPassword');
    if (control?.hasError('required')) {
      this.confirmPasswordError.set('Confirmação de senha é obrigatória');
    } else if (this.form.hasError('passwordMismatch') && control?.touched) {
      this.confirmPasswordError.set('As senhas não coincidem');
    } else {
      this.confirmPasswordError.set('');
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.updateNomeCompletoError();
      this.updateEmailError();
      this.updatePasswordError();
      this.updateConfirmPasswordError();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formValue = this.form.getRawValue();
    const data: RegisterRequest = {
      nomeCompleto: formValue.nomeCompleto,
      email: formValue.email,
      password: formValue.password,
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/courses']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 409) {
          this.error.set('Este email já está cadastrado');
        } else {
          this.error.set('Erro ao criar conta. Tente novamente.');
        }
        console.error('Erro no registro:', err);
      },
    });
  }
}
