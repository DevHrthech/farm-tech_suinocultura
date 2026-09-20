import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { InstructorRequestService } from '../../core/services/instructor-request.service';
import { DashboardData } from '../../core/models/dashboard.model';
import { InstructorRequest } from '../../core/models/instructor-request.model';
import { Topbar } from '../../shared/topbar/topbar';
import {
  categoryIcon as getCategoryIcon,
  categoryColor as getCategoryColor,
  timeAgo as getTimeAgo,
} from '../../core/utils/display.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Topbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  data = signal<DashboardData | null>(null);
  loading = signal(true);
  error = signal('');

  instructorRequest = signal<InstructorRequest | null>(null);
  requestSubmitting = signal(false);

  firstName = computed(() => {
    const name = this.authService.currentUser()?.nomeCompleto ?? '';
    return name.trim().split(/\s+/)[0] ?? '';
  });

  isAluno = computed(() => this.authService.currentUser()?.role === 'aluno');

  constructor(
    private dashboardService: DashboardService,
    public authService: AuthService,
    private instructorRequestService: InstructorRequestService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar o painel. Verifique se o backend está rodando.');
        this.loading.set(false);
        console.error(err);
      },
    });

    if (this.isAluno()) {
      this.instructorRequestService.getMine().subscribe({
        next: (request) => this.instructorRequest.set(request),
        error: (err) => console.error(err),
      });
    }
  }

  requestToBecomeInstructor(): void {
    this.requestSubmitting.set(true);
    this.instructorRequestService.create().subscribe({
      next: (request) => {
        this.instructorRequest.set(request);
        this.requestSubmitting.set(false);
      },
      error: (err) => {
        this.requestSubmitting.set(false);
        console.error(err);
      },
    });
  }

  categoryIcon(category: string): string {
    return getCategoryIcon(category);
  }

  categoryColor(category: string): string {
    return getCategoryColor(category);
  }

  timeAgo(date: string): string {
    return getTimeAgo(date);
  }
}
