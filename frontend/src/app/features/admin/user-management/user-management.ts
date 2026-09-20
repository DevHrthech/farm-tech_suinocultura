import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { InstructorRequestService } from '../../../core/services/instructor-request.service';
import { AdminUser } from '../../../core/models/user-admin.model';
import { InstructorRequest } from '../../../core/models/instructor-request.model';
import { Topbar } from '../../../shared/topbar/topbar';
import { ROLES } from '../../../core/models/user-admin.model';
import {
  roleLabel as getRoleLabel,
  userInitials as getUserInitials,
  timeAgo as getTimeAgo,
} from '../../../core/utils/display.util';

type Tab = 'users' | 'requests';

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

  activeTab = signal<Tab>('users');
  requests = signal<InstructorRequest[]>([]);
  requestsLoading = signal(true);
  requestsError = signal('');
  reviewingId = signal<string | null>(null);

  pendingCount = computed(() => this.requests().filter((r) => r.status === 'pending').length);

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private instructorRequestService: InstructorRequestService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const tab = this.activatedRoute.snapshot.queryParamMap.get('tab');
    if (tab === 'requests') {
      this.activeTab.set('requests');
    }

    this.loadUsers();
    this.loadRequests();
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
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

  loadRequests(): void {
    this.requestsLoading.set(true);
    this.instructorRequestService.list().subscribe({
      next: (requests) => {
        this.requests.set(requests);
        this.requestsLoading.set(false);
      },
      error: (err) => {
        this.requestsError.set('Erro ao carregar solicitações.');
        this.requestsLoading.set(false);
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

  timeAgo(date: string): string {
    return getTimeAgo(date);
  }

  statusLabel(status: string): string {
    if (status === 'approved') return 'Aprovado';
    if (status === 'rejected') return 'Recusado';
    return 'Pendente';
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

  approveRequest(request: InstructorRequest): void {
    this.reviewingId.set(request.id);
    this.requestsError.set('');

    this.instructorRequestService.approve(request.id).subscribe({
      next: () => {
        this.reviewingId.set(null);
        this.loadRequests();
        this.loadUsers();
      },
      error: (err) => {
        this.requestsError.set('Erro ao aprovar solicitação.');
        this.reviewingId.set(null);
        console.error(err);
      },
    });
  }

  rejectRequest(request: InstructorRequest): void {
    this.reviewingId.set(request.id);
    this.requestsError.set('');

    this.instructorRequestService.reject(request.id).subscribe({
      next: () => {
        this.reviewingId.set(null);
        this.loadRequests();
      },
      error: (err) => {
        this.requestsError.set('Erro ao recusar solicitação.');
        this.reviewingId.set(null);
        console.error(err);
      },
    });
  }
}
