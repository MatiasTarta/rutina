import { getDatabase } from '@/database/client';
import { CreateRoutineInput, Routine, RoutineCompletion, UpdateRoutineInput } from '@/types';
import { formatDate, generateId, nowISO } from '@/utils/helpers';
import { create } from 'zustand';
interface RoutinesState {
  routines: Routine[];
  completions: RoutineCompletion[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchRoutines: (activeOnly?: boolean) => Promise<void>;
  fetchCompletions: (routineId?: string, startDate?: Date, endDate?: Date) => Promise<void>;
  addRoutine: (input: CreateRoutineInput) => Promise<Routine>;
  updateRoutine: (id: string, input: UpdateRoutineInput) => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;
  toggleCompletion: (routineId: string, date: Date) => Promise<boolean>;
  isCompletedOnDate: (routineId: string, date: Date) => boolean;
  getStreak: (routineId: string) => number;
}

export const useRoutinesStore = create<RoutinesState>((set, get) => ({
  routines: [],
  completions: [],
  loading: false,
  error: null,

  fetchRoutines: async (activeOnly: boolean = false) => {
    set({ loading: true, error: null });
    try {
      const db = await getDatabase();

      let query = 'SELECT * FROM routines';
      if (activeOnly) {
        query += ' WHERE is_active = 1';
      }
      query += ' ORDER BY created_at DESC';

      const results = await db.getAllAsync<Routine>(query);

      const routines = results.map((r: any) => ({
        ...r,
        daysOfWeek: r.days_of_week ? JSON.parse(r.days_of_week) : undefined,
      }));

      set({ routines, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCompletions: async (routineId?: string, startDate?: Date, endDate?: Date) => {
    try {
      const db = await getDatabase();

      let query = 'SELECT * FROM routine_completions';
      const params: (string | number)[] = [];
      const conditions: string[] = [];

      if (routineId) {
        conditions.push('routine_id = ?');
        params.push(routineId);
      }

      if (startDate && endDate) {
        conditions.push('date BETWEEN ? AND ?');
        params.push(formatDate(startDate), formatDate(endDate));
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY date DESC';

      const results = await db.getAllAsync<RoutineCompletion>(query, params);
      set({ completions: results as RoutineCompletion[] });
    } catch (error) {
      console.error('Failed to fetch completions:', error);
    }
  },

  addRoutine: async (data) => {
    const now = nowISO();
    const routine: Routine = {
      ...data,
      id: crypto.randomUUID(),
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const db = await getDatabase();
      await db.runAsync(
        `INSERT INTO routines (id, name, description, icon, color, frequency, days_of_week, preferred_time, duration, is_active, start_date, end_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          routine.id,
          routine.name,
          routine.description ?? null,
          routine.icon ?? null,
          routine.color ?? null,
          routine.frequency,
          routine.daysOfWeek ? JSON.stringify(routine.daysOfWeek) : null,
          routine.preferredTime ?? null,
          routine.duration ?? null,
          routine.isActive ? 1 : 0,
          routine.startDate,
          routine.endDate ?? null,
          routine.createdAt,
          routine.updatedAt,
        ]
      );

      set((state) => ({ routines: [routine, ...state.routines] }));
      return routine;
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateRoutine: async (id: string, input: UpdateRoutineInput) => {
    const updatedAt = nowISO();

    try {
      const db = await getDatabase();

      const updateFields: string[] = [];
      const values: (string | number | null)[] = [];

      if (input.name !== undefined) {
        updateFields.push('name = ?');
        values.push(input.name);
      }
      if (input.description !== undefined) {
        updateFields.push('description = ?');
        values.push(input.description ?? null);
      }
      if (input.icon !== undefined) {
        updateFields.push('icon = ?');
        values.push(input.icon ?? null);
      }
      if (input.color !== undefined) {
        updateFields.push('color = ?');
        values.push(input.color ?? null);
      }
      if (input.frequency !== undefined) {
        updateFields.push('frequency = ?');
        values.push(input.frequency);
      }
      if (input.daysOfWeek !== undefined) {
        updateFields.push('days_of_week = ?');
        values.push(input.daysOfWeek ? JSON.stringify(input.daysOfWeek) : null);
      }
      if (input.preferredTime !== undefined) {
        updateFields.push('preferred_time = ?');
        values.push(input.preferredTime ?? null);
      }
      if (input.duration !== undefined) {
        updateFields.push('duration = ?');
        values.push(input.duration ?? null);
      }
      if (input.isActive !== undefined) {
        updateFields.push('is_active = ?');
        values.push(input.isActive ? 1 : 0);
      }
      if (input.endDate !== undefined) {
        updateFields.push('end_date = ?');
        values.push(input.endDate ?? null);
      }

      updateFields.push('updated_at = ?');
      values.push(updatedAt);
      values.push(id);

      await db.runAsync(
        `UPDATE routines SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      set((state) => ({
        routines: state.routines.map((r) =>
          r.id === id ? { ...r, ...input, updatedAt } : r
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteRoutine: async (id: string) => {
    try {
      const db = await getDatabase();
      // Delete completions first
      await db.runAsync('DELETE FROM routine_completions WHERE routine_id = ?', [id]);
      await db.runAsync('DELETE FROM routines WHERE id = ?', [id]);

      set((state) => ({
        routines: state.routines.filter((r) => r.id !== id),
        completions: state.completions.filter((c) => c.routineId !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  toggleCompletion: async (routineId: string, date: Date) => {
    const dateStr = formatDate(date);
    const state = get();
    const existing = state.completions.find(
      (c) => c.routineId === routineId && c.date === dateStr
    );

    try {
      const db = await getDatabase();

      if (existing) {
        // Remove completion
        await db.runAsync(
          'DELETE FROM routine_completions WHERE routine_id = ? AND date = ?',
          [routineId, dateStr]
        );
        set((s) => ({
          completions: s.completions.filter((c) => c.id !== existing.id),
        }));
        return false;
      } else {
        // Add completion
        const completion: RoutineCompletion = {
          id: generateId(),
          routineId,
          date: dateStr,
          completedAt: nowISO(),
          createdAt: nowISO(),
          updatedAt: nowISO(),
        };

        await db.runAsync(
          `INSERT INTO routine_completions (id, routine_id, date, completed_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [completion.id, completion.routineId, completion.date, completion.completedAt, completion.createdAt, completion.updatedAt]
        );

        set((s) => ({
          completions: [...s.completions, completion],
        }));
        return true;
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  isCompletedOnDate: (routineId: string, date: Date) => {
    const dateStr = formatDate(date);
    return get().completions.some(
      (c) => c.routineId === routineId && c.date === dateStr
    );
  },

  getStreak: (routineId: string) => {
    const completions = get().completions
      .filter((c) => c.routineId === routineId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (completions.length === 0) return 0;

    const routine = get().routines.find((r) => r.id === routineId);
    if (!routine) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const completion of completions) {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }

    return streak;
  },
}));