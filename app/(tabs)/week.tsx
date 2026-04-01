import { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SwipeableView } from '@/components/SwipeableView';
import { useTasksStore } from '@/stores/tasksStore';
import { useRoutinesStore } from '@/stores/routinesStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate, getStartOfWeek, addDays, isToday, isSameDay } from '@/utils/helpers';

export default function WeekScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { tasks, fetchTasks } = useTasksStore();
  const { routines, completions, fetchRoutines, fetchCompletions, isCompletedOnDate } = useRoutinesStore();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));

  useEffect(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    fetchTasks(currentWeekStart, weekEnd);
    fetchRoutines(true);
    fetchCompletions(undefined, currentWeekStart, weekEnd);
  }, [currentWeekStart]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = formatDate(date);
    return tasks.filter((task) => task.dueDate === dateStr);
  };

  const getRoutinesForDay = (date: Date) => {
    return routines.filter((routine) => {
      if (!routine.isActive) return false;
      if (routine.frequency === 'daily') return true;
      if (routine.frequency === 'weekly' && routine.daysOfWeek) {
        return routine.daysOfWeek.includes(date.getDay());
      }
      return false;
    });
  };

  const formatWeekRange = () => {
    const start = currentWeekStart;
    const end = addDays(currentWeekStart, 6);
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    const startDay = start.getDate();
    const endDay = end.getDate();
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <SwipeableView>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header with week navigation */}
        <View style={styles.header}>
          <Pressable onPress={goToPreviousWeek} style={styles.navButton}>
            <ThemedText>{'<'}</ThemedText>
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText type="title">{formatWeekRange()}</ThemedText>
            {!isSameDay(currentWeekStart, getStartOfWeek(new Date())) && (
              <Pressable onPress={goToThisWeek}>
                <ThemedText style={{ color: colors.tint, fontSize: 12 }}>Today</ThemedText>
              </Pressable>
            )}
          </View>
          <Pressable onPress={goToNextWeek} style={styles.navButton}>
            <ThemedText>{'>'}</ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const dayRoutines = getRoutinesForDay(day);
            const isTodayDate = isToday(day);

            return (
              <View
                key={formatDate(day)}
                style={[styles.dayColumn, isTodayDate && { backgroundColor: colors.card }]}>
                <View style={[styles.dayHeader, isTodayDate && { borderBottomColor: colors.tint }]}>
                  <ThemedText type="defaultSemiBold" style={isTodayDate && { color: colors.tint }}>
                    {dayNames[day.getDay()]}
                  </ThemedText>
                  <View style={[styles.dayNumber, isTodayDate && { backgroundColor: colors.tint }]}>
                    <Text style={[styles.dayNumberText, isTodayDate && { color: colors.background }]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </View>

                {/* Tasks */}
                {dayTasks.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 12, marginBottom: 4 }}>
                      Tasks
                    </ThemedText>
                    {dayTasks.map((task) => (
                      <View
                        key={task.id}
                        style={[styles.taskItem, { borderLeftColor: colors[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] }]}>
                        <ThemedText
                          type="default"
                          style={task.status === 'completed' && styles.completedText}>
                          {task.title}
                        </ThemedText>
                        {task.dueTime && (
                          <ThemedText style={{ color: colors.icon, fontSize: 11 }}>
                            {task.dueTime}
                          </ThemedText>
                        )}
                      </View>
                    ))}
                  </View>
                )}

                {/* Routines */}
                {dayRoutines.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={{ fontSize: 12, marginBottom: 4 }}>
                      Routines
                    </ThemedText>
                    {dayRoutines.map((routine) => {
                      const isCompleted = isCompletedOnDate(routine.id, day);
                      return (
                        <View
                          key={routine.id}
                          style={[styles.routineItem, { opacity: isCompleted ? 0.6 : 1 }]}>
                          <View
                            style={[
                              styles.routineDot,
                              { backgroundColor: routine.color || colors.tint },
                            ]}
                          />
                          <ThemedText type="default" style={isCompleted && styles.completedText}>
                            {routine.name}
                          </ThemedText>
                          {isCompleted && <Text style={{ color: colors.success }}> ✓</Text>}
                        </View>
                      );
                    })}
                  </View>
                )}

                {dayTasks.length === 0 && dayRoutines.length === 0 && (
                  <ThemedText style={{ color: colors.icon, fontSize: 12, textAlign: 'center', padding: 8 }}>
                    -
                  </ThemedText>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </SwipeableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerCenter: {
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  dayColumn: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 8,
  },
  taskItem: {
    paddingVertical: 4,
    paddingLeft: 8,
    borderLeftWidth: 3,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
  },
  routineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});