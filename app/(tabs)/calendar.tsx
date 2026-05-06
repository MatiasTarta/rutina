import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeableView } from '@/components/SwipeableView';
import { ThemedText } from '@/components/themed-text';
import { Colors, getContrastColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useRoutinesStore } from '@/stores/routinesStore';
import { useTasksStore } from '@/stores/tasksStore';
import { formatDate, isToday } from '@/utils/helpers';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isTablet } = useResponsive();

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
        <View style={[styles.header, isTablet && styles.headerWide]}>
          <Pressable onPress={goToPreviousMonth} style={[styles.navButton, isTablet && styles.navButtonWide]}>
            <ThemedText style={[styles.navButtonText, isTablet && styles.navButtonTextWide]}> {'<'} </ThemedText>
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={[styles.monthTitle, isTablet && styles.monthTitleWide]}>
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </ThemedText>
          </View>
          <Pressable onPress={goToNextMonth} style={[styles.navButton, isTablet && styles.navButtonWide]}>
            <ThemedText style={[styles.navButtonText, isTablet && styles.navButtonTextWide]}> {'>'} </ThemedText>
          </Pressable>
        </View>

        {/* Day names header */}
        <View style={[styles.dayNamesRow, isTablet && styles.dayNamesRowWide]}>
          {DAY_NAMES.map((day) => (
            <View key={day} style={styles.dayNameCell}>
              <ThemedText style={[styles.dayNameText, { color: colors.icon }, isTablet && styles.dayNameTextWide]}>{day}</ThemedText>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={[styles.calendarGrid, isTablet && styles.calendarGridWide]}>
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
                  isTablet && styles.dayCellWide,
                ]}
                onPress={() => setSelectedDate(day)}>
                <View style={[styles.dayNumberContainer, isTodayDate && { backgroundColor: colors.tint }, isTablet && styles.dayNumberContainerWide]}>
                  <Text style={[styles.dayNumber, { color: isTodayDate ? colors.background : colors.text }, isTablet && styles.dayNumberWide]}>
                    {day.getDate()}
                  </Text>
                </View>
                {taskCount > 0 && (
                  <View style={styles.dotsContainer}>
                    {Array.from({ length: Math.min(taskCount, 3) }).map((_, i) => (
                      <View
                        key={i}
                        style={[styles.dot, isTablet && styles.dotWide, { backgroundColor: colors.tint }]}
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
          <View style={[styles.selectedDateSection, { borderTopColor: colors.cardBorder }, isTablet && styles.selectedDateSectionWide]}>
            <View style={styles.selectedDateHeader}>
              <ThemedText type="subtitle" style={[styles.selectedDateTitle, isTablet && styles.selectedDateTitleWide]}>
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>
              {!isToday(selectedDate) && (
                <Pressable onPress={goToToday}>
                  <ThemedText style={[styles.todayButton, { color: colors.tint }, isTablet && styles.todayButtonWide]}>Today</ThemedText>
                </Pressable>
              )}
            </View>

            {selectedDateTasks.length === 0 ? (
              <ThemedText style={[styles.emptyStateText, { color: colors.icon }]}>No tasks for this day</ThemedText>
            ) : (
              selectedDateTasks.map((task) => (
                <View
                  key={task.id}
                  style={[styles.taskItem, { backgroundColor: colors.card }, isTablet && styles.taskItemWide]}>
                  <View style={styles.taskInfo}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={[task.status === 'completed' && styles.completedText, isTablet && styles.taskTitleWide]}>
                      {task.title}
                    </ThemedText>
                    {task.dueTime && (
                      <ThemedText style={[styles.taskTime, { color: colors.icon }, isTablet && styles.taskTimeWide]}>
                        {task.dueTime}
                      </ThemedText>
                    )}
                  </View>
                  <View
                    style={[
                      styles.priorityBadge,
                      isTablet && styles.priorityBadgeWide,
                      { backgroundColor: colors[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as keyof typeof colors] },
                    ]}>
                    <Text style={[styles.priorityText, { color: getContrastColor(colors[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}` as keyof typeof colors]) === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>
                      {task.priority}
                    </Text>
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
  headerWide: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 16,
  },
  monthTitleWide: {
    fontSize: 22,
  },
  navButton: {
    padding: 8,
  },
  navButtonWide: {
    padding: 12,
  },
  navButtonText: {
    fontSize: 18,
  },
  navButtonTextWide: {
    fontSize: 24,
  },
  dayNamesRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  dayNamesRowWide: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 12,
  },
  dayNameTextWide: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  calendarGridWide: {
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCellWide: {
    paddingVertical: 8,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberContainerWide: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dayNumber: {
    fontSize: 14,
  },
  dayNumberWide: {
    fontSize: 16,
    fontWeight: '600',
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
  dotWide: {
    width: 6,
    height: 6,
  },
  selectedDateSection: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
  },
  selectedDateSectionWide: {
    padding: 24,
    borderTopWidth: 2,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 16,
  },
  selectedDateTitleWide: {
    fontSize: 20,
  },
  todayButton: {
    fontSize: 12,
  },
  todayButtonWide: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyStateText: {
    fontSize: 14,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  taskItemWide: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitleWide: {
    fontSize: 16,
  },
  taskTime: {
    fontSize: 12,
  },
  taskTimeWide: {
    fontSize: 14,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeWide: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});