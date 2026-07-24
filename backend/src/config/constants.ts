/**
 * Default categories seeded for every new user so they don't start with an
 * empty app. Colors are hex codes consumed by the frontend charts.
 */
export const DEFAULT_CATEGORIES = [
  { name: 'Food', color: '#F97316', icon: 'utensils' },
  { name: 'Transportation', color: '#3B82F6', icon: 'car' },
  { name: 'Housing', color: '#8B5CF6', icon: 'home' },
  { name: 'Entertainment', color: '#EC4899', icon: 'clapperboard' },
  { name: 'Health', color: '#10B981', icon: 'heart-pulse' },
  { name: 'Other', color: '#6B7280', icon: 'ellipsis' },
] as const;
