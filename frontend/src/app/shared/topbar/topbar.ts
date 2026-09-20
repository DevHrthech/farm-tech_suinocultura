import { Component, OnInit, computed, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProfileService } from '../../core/services/profile.service';
import { AppNotification } from '../../core/models/notification.model';
import {
  roleLabel as getRoleLabel,
  userInitials as getUserInitials,
  timeAgo as getTimeAgo,
} from '../../core/utils/display.util';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar implements OnInit {
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  bellOpen = signal(false);

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {}

  userInitials = computed(() => getUserInitials(this.authService.currentUser()?.nomeCompleto));
  roleLabel = computed(() => getRoleLabel(this.authService.currentUser()?.role));

  ngOnInit(): void {
    this.notificationService.list().subscribe({
      next: (response) => {
        this.notifications.set(response.notifications);
        this.unreadCount.set(response.unreadCount);

        const hasApproval = response.notifications.some(
          (n) => n.type === 'instructor_request_approved' && !n.read
        );
        if (hasApproval) {
          this.syncCurrentUserRole();
        }
      },
      error: (err) => console.error(err),
    });
  }

  private syncCurrentUserRole(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
          this.authService.updateCurrentUser({
            ...currentUser,
            role: profile.role,
            nomeCompleto: profile.nomeCompleto,
            avatarUrl: profile.avatarUrl,
          });
        }
      },
      error: (err) => console.error(err),
    });
  }

  timeAgo(date: string): string {
    return getTimeAgo(date);
  }

  parseLink(link: string): { path: string; queryParams: Record<string, string> } {
    const [path, query] = link.split('?');
    const queryParams: Record<string, string> = {};
    if (query) {
      new URLSearchParams(query).forEach((value, key) => {
        queryParams[key] = value;
      });
    }
    return { path, queryParams };
  }

  toggleBell(event: Event): void {
    event.stopPropagation();
    const opening = !this.bellOpen();
    this.bellOpen.set(opening);

    if (opening && this.unreadCount() > 0) {
      this.unreadCount.set(0);
      this.notificationService.markAllRead().subscribe({ error: (err) => console.error(err) });
    }
  }

  closeBell(): void {
    this.bellOpen.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.bellOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
