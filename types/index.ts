// Base entity with common fields
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Routine - recurring habits
export interface Routine extends BaseEntity {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6 for Sun-Sat
  preferredTime?: string; // HH:mm format
  duration?: number; // Duration in minutes
  isActive: boolean;
  startDate: string; // ISO date
  endDate?: string; // ISO date
}

// Task - one-time to-dos
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  dueDate: string; // ISO date (YYYY-MM-DD)
  dueTime?: string; // HH:mm format
  duration?: number; // Estimated duration in minutes
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  categoryId?: string;
  tags?: string[];
}

// RoutineCompletion - tracks when routines are completed
export interface RoutineCompletion extends BaseEntity {
  routineId: string;
  date: string; // ISO date (YYYY-MM-DD)
  completedAt: string; // ISO timestamp
  notes?: string;
}

// Category - for organizing tasks
export interface Category extends BaseEntity {
  name: string;
  color: string;
  icon?: string;
}

// App settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultView: 'day' | 'week' | 'calendar' | 'habits';
  weekStartsOn: number; // 0-6 for Sun-Sat
}

// Priority colors for UI
export const priorityColors: Record<Task['priority'], string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
};

// Form types for creating/editing
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;

export type CreateRoutineInput = Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateRoutineInput = Partial<Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>>;