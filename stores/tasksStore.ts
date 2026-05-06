import { getDatabase } from '@/database/client';
import { CreateTaskInput, Task, UpdateTaskInput } from '@/types';
import { formatDate, nowISO } from '@/utils/helpers';
import { create } from 'zustand';

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
  tasks: [] as Task[],
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

      const results = await db.getAllAsync<any>(query, params);

      const tasks = results.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        dueDate: t.due_date,
        dueTime: t.due_time,
        duration: t.duration,
        status: t.status,
        priority: t.priority,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      set({ tasks, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchTaskById: async (id: string) => {
    try {
      const db = await getDatabase();
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );

      if (!result) return null;

      return {
        id: result.id,
        title: result.title,
        description: result.description,
        dueDate: result.due_date,
        dueTime: result.due_time,
        duration: result.duration,
        status: result.status,
        priority: result.priority,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      };
    } catch (error) {
      console.error('Failed to fetch task:', error);
      return null;
    }
  },

  addTask: async (data) => {
    const now = new Date().toISOString();

    const task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const db = await getDatabase();

      await db.runAsync(
        `INSERT INTO tasks (
        id,
        title,
        description,
        due_date,
        due_time,
        duration,
        status,
        priority,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.title,
          task.description ?? null,
          task.dueDate,
          task.dueTime ?? null,
          task.duration ?? null,
          task.status,
          task.priority,
          task.createdAt,
          task.updatedAt,
        ]
      );

      // actualizar estado (UI)
      set((state) => ({
        tasks: [task, ...state.tasks],
      }));

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