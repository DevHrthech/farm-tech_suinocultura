import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminUser } from '../../../core/models/user-admin.model';
import { Topbar } from '../../../shared/topbar/topbar';
import { ROLES } from '../../../core/models/user-admin.model';
import { roleLabel as getRoleLabel, userInitials as getUserInitials } from '../../../core/utils/display.util';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './user-management.html',
  styleUrl: './user-management.css',
})
export class UserManagement implements OnInit {
  users = signal<AdminUser[]>([]);
  loading = signal(true);
  error = signal('');
  savingUserId = signal<string | null>(null);
  roles = ROLES;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.list().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar usuários.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  isSelf(user: AdminUser): boolean {
    return this.authService.currentUser()?.id === user.id;
  }

  roleLabel(role: string): string {
    return getRoleLabel(role);
  }

  userInitials(name: string): string {
    return getUserInitials(name);
  }

  onRoleChange(user: AdminUser, event: Event): void {
    const role = (event.target as HTMLSelectElement).value;
    if (role === user.role) return;

    this.savingUserId.set(user.id);
    this.error.set('');

    this.userService.updateRole(user.id, role).subscribe({
      next: (updated) => {
        this.users.update((list) => list.map((item) => (item.id === updated.id ? updated : item)));
        this.savingUserId.set(null);
      },
      error: (err) => {
        this.error.set(`Erro ao atualizar o papel de ${user.nomeCompleto}.`);
        this.savingUserId.set(null);
        console.error(err);
      },
    });
  }
}
