import { getDatabase } from './client';
import { generateId, nowISO, formatDate, addDays } from '@/utils/helpers';

const SAMPLE_ROUTINES = [
  {
    name: 'Morning Meditation',
    description: 'Start the day with 10 minutes of mindfulness',
    icon: '🧘',
    color: '#8b5cf6',
    frequency: 'daily' as const,
    preferredTime: '07:00',
    duration: 10,
  },
  {
    name: 'Exercise',
    description: 'Workout or physical activity',
    icon: '💪',
    color: '#f97316',
    frequency: 'daily' as const,
    preferredTime: '08:00',
    duration: 30,
  },
  {
    name: 'Read',
    description: 'Read a book or article',
    icon: '📚',
    color: '#3b82f6',
    frequency: 'daily' as const,
    preferredTime: '21:00',
    duration: 20,
  },
  {
    name: 'Weekly Review',
    description: 'Review goals and plan the week ahead',
    icon: '📝',
    color: '#10b981',
    frequency: 'weekly' as const,
    daysOfWeek: [1], // Monday
    preferredTime: '09:00',
    duration: 60,
  },
  {
    name: 'Meal Prep',
    description: 'Prepare meals for the week',
    icon: '🍱',
    color: '#eab308',
    frequency: 'weekly' as const,
    daysOfWeek: [0], // Sunday
    preferredTime: '15:00',
    duration: 90,
  },
  {
    name: 'Clean Workspace',
    description: 'Tidy up desk and organize',
    icon: '🧹',
    color: '#ec4899',
    frequency: 'weekly' as const,
    daysOfWeek: [5], // Friday
    preferredTime: '17:00',
    duration: 15,
  },
];

const SAMPLE_TASKS = [
  {
    title: 'Complete project proposal',
    description: 'Finish the Q2 project proposal document',
    priority: 'high' as const,
    dueTime: '14:00',
    duration: 60,
  },
  {
    title: 'Team standup meeting',
    description: 'Daily sync with the development team',
    priority: 'medium' as const,
    dueTime: '10:00',
    duration: 30,
  },
  {
    title: 'Review pull requests',
    description: 'Check pending PRs from the team',
    priority: 'medium' as const,
    dueTime: '16:00',
    duration: 45,
  },
  {
    title: 'Update documentation',
    description: 'Refresh the API docs with new endpoints',
    priority: 'low' as const,
    dueTime: '17:00',
    duration: 30,
  },
  {
    title: 'Call insurance company',
    description: 'Follow up on claim status',
    priority: 'high' as const,
    dueTime: '11:00',
    duration: 15,
  },
  {
    title: 'Grocery shopping',
    description: 'Buy ingredients for meal prep',
    priority: 'medium' as const,
    dueTime: '18:00',
    duration: 45,
  },
  {
    title: 'Reply to emails',
    description: 'Clear inbox backlog',
    priority: 'low' as const,
    dueTime: '12:00',
    duration: 20,
  },
];

const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getRandomElement = <T>(array: T[]): T => {
  return array[getRandomInt(0, array.length - 1)];
};

export const seedDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  // Check if already seeded
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM routines'
  );

  if (result && result.count > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding database with sample data...');

  const today = new Date();
  const startTime = nowISO();

  // Insert routines
  const routineIds: string[] = [];
  for (const routineData of SAMPLE_ROUTINES) {
    const id = generateId();
    routineIds.push(id);

    await db.runAsync(
      `INSERT INTO routines (id, name, description, icon, color, frequency, days_of_week, preferred_time, duration, is_active, start_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
      [
        id,
        routineData.name,
        routineData.description,
        routineData.icon,
        routineData.color,
        routineData.frequency,
        routineData.daysOfWeek ? JSON.stringify(routineData.daysOfWeek) : null,
        routineData.preferredTime,
        routineData.duration,
        formatDate(addDays(today, -30)), // Started 30 days ago
        startTime,
        startTime,
      ]
    );
  }

  // Insert tasks (some for today, some for past/future days)
  const taskIds: string[] = [];
  for (let i = 0; i < SAMPLE_TASKS.length; i++) {
    const id = generateId();
    taskIds.push(id);
    const taskData = SAMPLE_TASKS[i];

    // Distribute tasks across different days
    const dayOffset = getRandomInt(-5, 3);
    const dueDate = formatDate(addDays(today, dayOffset));

    const statusRoll = Math.random();
    const status: 'pending' | 'in_progress' | 'completed' | 'cancelled' =
      statusRoll < 0.3 ? 'completed' :
      statusRoll < 0.5 ? 'in_progress' :
      statusRoll < 0.8 ? 'pending' : 'cancelled';

    await db.runAsync(
      `INSERT INTO tasks (id, title, description, due_date, due_time, duration, status, priority, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        taskData.title,
        taskData.description,
        dueDate,
        taskData.dueTime,
        taskData.duration,
        status,
        taskData.priority,
        startTime,
        startTime,
      ]
    );
  }

  // Insert routine completions for past days
  for (const routineId of routineIds) {
    // Get routine frequency
    const routine = await db.getFirstAsync<{ frequency: string; days_of_week: string }>(
      'SELECT frequency, days_of_week FROM routines WHERE id = ?',
      [routineId]
    );

    if (!routine) continue;

    const isWeekly = routine.frequency === 'weekly';
    const routineDays = routine.days_of_week ? JSON.parse(routine.days_of_week) as number[] : null;

    // Generate completions for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = addDays(today, -i);
      const dayOfWeek = date.getDay();

      // Skip if weekly routine and not the right day
      if (isWeekly && routineDays && !routineDays.includes(dayOfWeek)) {
        continue;
      }

      // 70% completion rate
      if (Math.random() > 0.3) {
        const completionDate = formatDate(date);

        // Check if completion already exists
        const existing = await db.getFirstAsync<{ id: string }>(
          'SELECT id FROM routine_completions WHERE routine_id = ? AND date = ?',
          [routineId, completionDate]
        );

        if (!existing) {
          await db.runAsync(
            `INSERT INTO routine_completions (id, routine_id, date, completed_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              generateId(),
              routineId,
              completionDate,
              nowISO(),
              startTime,
              startTime,
            ]
          );
        }
      }
    }
  }

  console.log('Database seeded successfully!');
  console.log(`  - ${SAMPLE_ROUTINES.length} routines created`);
  console.log(`  - ${SAMPLE_TASKS.length} tasks created`);
  console.log(`  - Routine completions generated for past 30 days`);
};
