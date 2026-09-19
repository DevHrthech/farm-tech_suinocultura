import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
  roleLabel as getRoleLabel,
  userInitials as getUserInitials,
} from '../../core/utils/display.util';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(public authService: AuthService) {}

  userInitials = computed(() => getUserInitials(this.authService.currentUser()?.nomeCompleto));
  roleLabel = computed(() => getRoleLabel(this.authService.currentUser()?.role));

  logout(): void {
    this.authService.logout();
  }
}
