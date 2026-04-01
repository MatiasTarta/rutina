import { useEffect, useState } from 'react';
import { StyleSheet, View, Pressable, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SwipeableView } from '@/components/SwipeableView';
import { useTasksStore } from '@/stores/tasksStore';
import { useRoutinesStore } from '@/stores/routinesStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate, addDays, isToday } from '@/utils/helpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { tasks, fetchTasks } = useTasksStore();
  const { routines, fetchRoutines } = useRoutinesStore();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch tasks and routines for the current month view
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    fetchTasks(firstDay, lastDay);
    fetchRoutines(true);
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTaskCountForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return tasks.filter((task) => task.dueDate === dateStr).length;
  };

  const days = getDaysInMonth();
  const selectedDateTasks = selectedDate
    ? tasks.filter((task) => task.dueDate === formatDate(selectedDate))
    : [];

  return (
    <SwipeableView>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={goToPreviousMonth} style={styles.navButton}>
          <ThemedText>{'<'}</ThemedText>
        </Pressable>
        <View style={styles.headerCenter}>
          <ThemedText type="title">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </ThemedText>
        </View>
        <Pressable onPress={goToNextMonth} style={styles.navButton}>
          <ThemedText>{'>'}</ThemedText>
        </Pressable>
      </View>

      {/* Day names header */}
      <View style={styles.dayNamesRow}>
        {DAY_NAMES.map((day) => (
          <View key={day} style={styles.dayNameCell}>
            <ThemedText style={{ color: colors.icon, fontSize: 12 }}>{day}</ThemedText>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const taskCount = getTaskCountForDate(day);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && formatDate(day) === formatDate(selectedDate);

          return (
            <Pressable
              key={formatDate(day)}
              style={[
                styles.dayCell,
                isSelected && { backgroundColor: colors.card },
                isTodayDate && { backgroundColor: colors.card },
              ]}
              onPress={() => setSelectedDate(day)}>
              <View style={[styles.dayNumberContainer, isTodayDate && { backgroundColor: colors.tint }]}>
                <Text style={[styles.dayNumber, isTodayDate && { color: colors.background }]}>
                  {day.getDate()}
                </Text>
              </View>
              {taskCount > 0 && (
                <View style={styles.dotsContainer}>
                  {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                    <View
                      key={i}
                      style={[styles.dot, { backgroundColor: colors.tint }]}
                    />
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Selected date tasks */}
      {selectedDate && (
        <View style={[styles.selectedDateSection, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.selectedDateHeader}>
            <ThemedText type="subtitle">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </ThemedText>
            {!isToday(selectedDate) && (
              <Pressable onPress={goToToday}>
                <ThemedText style={{ color: colors.tint, fontSize: 12 }}>Today</ThemedText>
              </Pressable>
            )}
          </View>

          {selectedDateTasks.length === 0 ? (
            <ThemedText style={{ color: colors.icon }}>No tasks for this day</ThemedText>
          ) : (
            selectedDateTasks.map((task) => (
              <View
                key={task.id}
                style={[styles.taskItem, { backgroundColor: colors.card }]}>
                <View style={styles.taskInfo}>
                  <ThemedText
                    type="defaultSemiBold"
                    style={task.status === 'completed' && styles.completedText}>
                    {task.title}
                  </ThemedText>
                  {task.dueTime && (
                    <ThemedText style={{ color: colors.icon, fontSize: 12 }}>
                      {task.dueTime}
                    </ThemedText>
                  )}
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: colors[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`] },
                  ]}>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
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
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateSection: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskInfo: {
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});