import { create } from 'zustand';
import { getDatabase } from '@/database/client';
import { Task, CreateTaskInput, UpdateTaskInput } from '@/types';
import { generateId, nowISO, formatDate } from '@/utils/helpers';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTasks: (startDate?: Date, endDate?: Date) => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task | null>;
  addTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  setTaskStatus: (id: string, status: Task['status']) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (startDate?: Date, endDate?: Date) => {
    set({ loading: true, error: null });
    try {
      const db = await getDatabase();

      let query = 'SELECT * FROM tasks';
      const params: (string | number)[] = [];

      if (startDate && endDate) {
        query += ' WHERE due_date BETWEEN ? AND ?';
        params.push(formatDate(startDate), formatDate(endDate));
      }

      query += ' ORDER BY due_date ASC, due_time ASC';

      const results = await db.getAllAsync<Task>(query, params);
      set({ tasks: results as Task[], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTaskById: async (id: string) => {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
      return result as Task | null;
    } catch (error) {
      console.error('Failed to fetch task:', error);
      return null;
    }
  },

  addTask: async (input: CreateTaskInput) => {
    const task: Task = {
      ...input,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };

    try {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO tasks (id, title, description, due_date, due_time, duration, status, priority, category_id, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.title,
          task.description ?? null,
          task.dueDate,
          task.dueTime ?? null,
          task.duration ?? null,
          task.status,
          task.priority,
          task.categoryId ?? null,
          task.tags ? JSON.stringify(task.tags) : null,
          task.createdAt,
          task.updatedAt,
        ]
      );

      set((state) => ({ tasks: [...state.tasks, task] }));
      return task;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateTask: async (id: string, input: UpdateTaskInput) => {
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    Object.entries(input).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase to snake_case
        updates.push(`${dbKey} = ?`);
        values.push(value as string | number | null);
      }
    });

    if (updates.length === 0) return;

    const updatedAt = nowISO();
    updates.push('updated_at = ?');
    values.push(updatedAt);
    values.push(id);

    try {
      const db = await getDatabase();
      await db.runAsync(
        `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, ...input, updatedAt } : t
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    try {
      const db = await getDatabase();
      await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);

      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setTaskStatus: async (id: string, status: Task['status']) => {
    await get().updateTask(id, { status });
  },
}));