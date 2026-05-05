import { getDatabase } from './client';

export async function insertRoutine(routine: {
    id: string;
    name: string;
    description?: string;
    frequency: string;
    daysOfWeek?: number[];
    preferredTime?: string;
    duration?: number;
    color?: string;
    isActive: boolean;
    startDate: string;
}) {
    const db = await getDatabase();

    const now = new Date().toISOString();

    const routines = await db.getAllAsync('SELECT * FROM routines');
    console.log(routines);

    await db.runAsync(
        `
    INSERT INTO routines (
      id,
      name,
      description,
      frequency,
      days_of_week,
      preferred_time,
      duration,
      color,
      is_active,
      start_date,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
        [
            routine.id,
            routine.name,
            routine.description || null,
            routine.frequency,
            routine.daysOfWeek ? JSON.stringify(routine.daysOfWeek) : null,
            routine.preferredTime || null,
            routine.duration || null,
            routine.color || null,
            routine.isActive ? 1 : 0,
            routine.startDate,
            now,
            now,
        ]
    );
}