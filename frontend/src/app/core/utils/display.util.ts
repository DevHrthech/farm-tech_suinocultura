const CATEGORY_STYLES: Record<string, { icon: string; color: string }> = {
  maternidade: { icon: 'child_care', color: '#e07a5f' },
  manejo: { icon: 'handyman', color: '#3d8bfd' },
  nutricao: { icon: 'grass', color: '#1e7a4c' },
  'nutrição': { icon: 'grass', color: '#1e7a4c' },
  reproducao: { icon: 'biotech', color: '#8854d0' },
  'reprodução': { icon: 'biotech', color: '#8854d0' },
  sanidade: { icon: 'health_and_safety', color: '#0f9b8e' },
  'bem-estar animal': { icon: 'favorite', color: '#d6822e' },
};

const DEFAULT_CATEGORY_STYLE = { icon: 'school', color: '#1c5c3d' };

export function categoryIcon(category: string | null | undefined): string {
  const key = (category ?? '').trim().toLowerCase();
  return CATEGORY_STYLES[key]?.icon ?? DEFAULT_CATEGORY_STYLE.icon;
}

export function categoryColor(category: string | null | undefined): string {
  const key = (category ?? '').trim().toLowerCase();
  return CATEGORY_STYLES[key]?.color ?? DEFAULT_CATEGORY_STYLE.color;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  instrutor: 'Instrutor',
  aluno: 'Aluno',
};

export function roleLabel(role: string | null | undefined): string {
  const value = role ?? '';
  return ROLE_LABELS[value] ?? (value ? value.charAt(0).toUpperCase() + value.slice(1) : '');
}

export function userInitials(name: string | null | undefined): string {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes < 1) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `há ${diffHours}h`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'ontem';
  if (diffDays < 30) return `há ${diffDays} dias`;

  const diffMonths = Math.round(diffDays / 30);
  if (diffMonths < 12) return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;

  const diffYears = Math.round(diffMonths / 12);
  return `há ${diffYears} ${diffYears === 1 ? 'ano' : 'anos'}`;
}
