import type { TagInfo } from '../types/content';

export const tagColors: Record<string, string> = {
  // System tags
  'GAS': '#38bdf8',
  'Animation': '#a78bfa',
  'Combat': '#f87171',
  'Input': '#4ade80',
  'AI': '#fbbf24',
  'Camera': '#22d3ee',
  'Data': '#fb923c',
  'Collision': '#ef4444',
  'Movement': '#10b981',

  // Component tags
  'Timer': '#8b5cf6',
  'Delegates': '#ec4899',
  'TMap': '#06b6d4',
  'TArray': '#14b8a6',
  'Interfaces': '#6366f1',
  'Component': '#3b82f6',

  // Pattern tags
  'Observer': '#f59e0b',
  'Data-Driven': '#84cc16',
  'State Machine': '#eab308',
  'Singleton': '#a855f7',

  // Combat tags
  'Hit Detection': '#dc2626',
  'Parry': '#f97316',
  'Combo': '#ea580c',
  'Montage': '#c026d3',
  'Ability': '#0ea5e9',

  // Macro tags
  'Macros': '#a855f7',

  // Architecture tags
  'Character': '#16a34a',
  'Lifecycle': '#059669',
  'Framework': '#2563eb',
  'ASC': '#7c3aed',
  'Architecture': '#0891b2',
};

export const getTagColor = (tag: string): string => {
  return tagColors[tag] || '#64748b'; // Default gray
};

export const allTags: TagInfo[] = Object.entries(tagColors).map(([name, color]) => ({
  name,
  color,
}));
