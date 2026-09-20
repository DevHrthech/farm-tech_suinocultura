import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { Profile } from '../../core/models/profile.model';
import { Topbar } from '../../shared/topbar/topbar';
import {
  roleLabel as getRoleLabel,
  userInitials as getUserInitials,
} from '../../core/utils/display.util';

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, Topbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private authService = inject(AuthService);

  profile = signal<Profile | null>(null);
  loading = signal(true);
  error = signal('');

  avatarPreview = signal<string | null>(null);
  avatarError = signal('');

  personalForm = this.fb.group({
    nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
  });
  personalSubmitting = signal(false);
  personalError = signal('');
  personalSuccess = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);
  passwordSubmitting = signal(false);
  passwordError = signal('');
  passwordSuccess = signal(false);
  currentPasswordError = signal('');
  newPasswordError = signal('');
  confirmPasswordError = signal('');

  passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchValidator }
  );

  constructor() {
    this.passwordForm.get('currentPassword')?.valueChanges.subscribe(() => this.updateCurrentPasswordError());
    this.passwordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.updateNewPasswordError();
      this.updateConfirmPasswordError();
    });
    this.passwordForm.get('confirmPassword')?.valueChanges.subscribe(() => this.updateConfirmPasswordError());
  }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.avatarPreview.set(profile.avatarUrl);
        this.personalForm.patchValue({ nomeCompleto: profile.nomeCompleto });
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar perfil.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  roleLabel(role: string): string {
    return getRoleLabel(role);
  }

  userInitials(name: string): string {
    return getUserInitials(name);
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.avatarError.set('');

    if (!file.type.startsWith('image/')) {
      this.avatarError.set('Selecione um arquivo de imagem válido.');
      input.value = '';
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      this.avatarError.set('A imagem deve ter no máximo 3MB.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeAvatar(): void {
    this.avatarPreview.set(null);
    this.avatarError.set('');
  }

  cancelPersonalInfo(): void {
    const profile = this.profile();
    if (!profile) return;
    this.personalForm.patchValue({ nomeCompleto: profile.nomeCompleto });
    this.avatarPreview.set(profile.avatarUrl);
    this.avatarError.set('');
    this.personalError.set('');
  }

  savePersonalInfo(): void {
    if (this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }

    this.personalSubmitting.set(true);
    this.personalError.set('');
    this.personalSuccess.set(false);

    const value = this.personalForm.getRawValue();
    this.profileService
      .updateProfile({ nomeCompleto: value.nomeCompleto!, avatarUrl: this.avatarPreview() })
      .subscribe({
        next: (profile) => {
          this.profile.set(profile);
          this.personalSubmitting.set(false);
          this.personalSuccess.set(true);

          const currentUser = this.authService.currentUser();
          if (currentUser) {
            this.authService.updateCurrentUser({
              ...currentUser,
              nomeCompleto: profile.nomeCompleto,
              avatarUrl: profile.avatarUrl,
            });
          }

          setTimeout(() => this.personalSuccess.set(false), 4000);
        },
        error: (err) => {
          this.personalError.set('Erro ao salvar alterações. Tente novamente.');
          this.personalSubmitting.set(false);
          console.error(err);
        },
      });
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.set(!this.showCurrentPassword());
  }

  toggleNewPassword(): void {
    this.showNewPassword.set(!this.showNewPassword());
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (!newPassword || !confirmPassword) return null;
    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  private updateCurrentPasswordError(): void {
    const control = this.passwordForm.get('currentPassword');
    this.currentPasswordError.set(control?.hasError('required') && control.touched ? 'Senha atual é obrigatória' : '');
  }

  private updateNewPasswordError(): void {
    const control = this.passwordForm.get('newPassword');
    if (control?.hasError('required')) {
      this.newPasswordError.set('Nova senha é obrigatória');
    } else if (control?.hasError('minlength')) {
      this.newPasswordError.set('A nova senha deve ter pelo menos 6 caracteres');
    } else {
      this.newPasswordError.set('');
    }
  }

  private updateConfirmPasswordError(): void {
    const control = this.passwordForm.get('confirmPassword');
    if (control?.hasError('required')) {
      this.confirmPasswordError.set('Confirmação de senha é obrigatória');
    } else if (this.passwordForm.hasError('passwordMismatch') && control?.touched) {
      this.confirmPasswordError.set('As senhas não coincidem');
    } else {
      this.confirmPasswordError.set('');
    }
  }

  onCurrentPasswordBlur(): void {
    this.passwordForm.get('currentPassword')?.markAsTouched();
    this.updateCurrentPasswordError();
  }

  onConfirmPasswordBlur(): void {
    this.passwordForm.get('confirmPassword')?.markAsTouched();
    this.updateConfirmPasswordError();
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.updateCurrentPasswordError();
      this.updateNewPasswordError();
      this.updateConfirmPasswordError();
      return;
    }

    this.passwordSubmitting.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    const value = this.passwordForm.getRawValue();
    this.profileService
      .changePassword({ currentPassword: value.currentPassword!, newPassword: value.newPassword! })
      .subscribe({
        next: () => {
          this.passwordSubmitting.set(false);
          this.passwordSuccess.set(true);
          this.passwordForm.reset();
          this.currentPasswordError.set('');
          this.newPasswordError.set('');
          this.confirmPasswordError.set('');
          setTimeout(() => this.passwordSuccess.set(false), 4000);
        },
        error: (err) => {
          this.passwordSubmitting.set(false);
          if (err.status === 403) {
            this.passwordError.set('Senha atual incorreta.');
          } else {
            this.passwordError.set('Erro ao atualizar senha. Tente novamente.');
          }
          console.error(err);
        },
      });
  }
}
