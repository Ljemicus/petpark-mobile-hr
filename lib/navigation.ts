import type { User } from './domain-types';

export type DashboardLink = {
  label: string;
  route: string;
  icon:
    | 'home-outline'
    | 'shield-checkmark-outline'
    | 'cut-outline'
    | 'paw-outline'
    | 'school-outline'
    | 'heart-outline';
};

export const DASHBOARD_LINKS: DashboardLink[] = [
  { label: 'Owner', route: '/dashboard/owner', icon: 'home-outline' },
  { label: 'Sitter', route: '/dashboard/sitter', icon: 'shield-checkmark-outline' },
  { label: 'Groomer', route: '/dashboard/groomer', icon: 'cut-outline' },
  { label: 'Breeder', route: '/dashboard/breeder', icon: 'paw-outline' },
  { label: 'Trainer', route: '/dashboard/trainer', icon: 'school-outline' },
  { label: 'Rescue', route: '/dashboard/rescue', icon: 'heart-outline' },
];

export function getPrimaryDashboardRoute(user?: User | null) {
  if (!user) return '/login';
  if (user.role === 'sitter') return '/dashboard/sitter';
  if (user.role === 'oboje') return '/dashboard/sitter';
  return '/dashboard/owner';
}
