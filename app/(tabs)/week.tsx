import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeableView } from '@/components/SwipeableView';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/useResponsive';
import { useRoutinesStore } from '@/stores/routinesStore';
import { useTasksStore } from '@/stores/tasksStore';
import { addDays, formatDate, getStartOfWeek, isSameDay, isToday } from '@/utils/helpers';

type TaskPriority = 'low' | 'medium' | 'high';

const priorityToColorKey: Record<TaskPriority, keyof typeof Colors.light> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

export default function WeekScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { isTablet } = useResponsive();

  const { tasks, fetchTasks } = useTasksStore();
  const { routines, fetchRoutines, isCompletedOnDate } = useRoutinesStore();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));

  useEffect(() => {
    const weekEnd = addDays(currentWeekStart, 6);
    fetchTasks(currentWeekStart, weekEnd);
    fetchRoutines(true);
  }, [currentWeekStart, fetchTasks, fetchRoutines]);

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
        <View style={[styles.header, isTablet && styles.headerWide]}>
          <Pressable onPress={goToPreviousWeek} style={[styles.navButton, isTablet && styles.navButtonWide]}>
            <ThemedText style={[styles.navButtonText, isTablet && styles.navButtonTextWide]}> {'<'} </ThemedText>
          </Pressable>
          <View style={styles.headerCenter}>
            <ThemedText type="title" style={[styles.weekRange, isTablet && styles.weekRangeWide]}>
              {formatWeekRange()}
            </ThemedText>
            {!isSameDay(currentWeekStart, getStartOfWeek(new Date())) && (
              <Pressable onPress={goToThisWeek}>
                <ThemedText style={[styles.todayButton, { color: colors.tint }, isTablet && styles.todayButtonWide]}>Today</ThemedText>
              </Pressable>
            )}
          </View>
          <Pressable onPress={goToNextWeek} style={[styles.navButton, isTablet && styles.navButtonWide]}>
            <ThemedText style={[styles.navButtonText, isTablet && styles.navButtonTextWide]}> {'>'} </ThemedText>
          </Pressable>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, isTablet && styles.scrollContentWide]}>
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const dayRoutines = getRoutinesForDay(day);
            const isTodayDate = isToday(day);

            return (
              <View
                key={formatDate(day)}
                style={[styles.dayColumn, isTodayDate && { backgroundColor: colors.card }, isTablet && styles.dayColumnWide]}>
                <View style={[styles.dayHeader, isTodayDate && { borderBottomColor: colors.tint }]}>
                  <ThemedText type="defaultSemiBold" style={[styles.dayName, isTodayDate && { color: colors.tint }, isTablet && styles.dayNameWide]}>
                    {dayNames[day.getDay()]}
                  </ThemedText>
                  <View style={[styles.dayNumber, isTodayDate && { backgroundColor: colors.tint }, isTablet && styles.dayNumberWide]}>
                    <Text style={[styles.dayNumberText, isTodayDate && { color: colors.background }, isTablet && styles.dayNumberTextWide]}>
                      {day.getDate()}
                    </Text>
                  </View>
                </View>

                {/* Tasks */}
                {dayTasks.length > 0 && (
                  <View style={styles.section}>
                    <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, isTablet && styles.sectionLabelWide]}>
                      Tasks
                    </ThemedText>
                    {dayTasks.map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.taskItem,
                          {
                            borderLeftColor:
                              colors[
                              priorityToColorKey[task.priority as keyof typeof priorityToColorKey]
                              ] ?? colors.tint,
                          },
                          isTablet && styles.taskItemWide,
                        ]}>
                        <ThemedText
                          type="default"
                          style={[task.status === 'completed' && styles.completedText, isTablet && styles.taskTitleWide]}>
                          {task.title}
                        </ThemedText>
                        {task.dueTime && (
                          <ThemedText style={[styles.taskTime, { color: colors.icon }, isTablet && styles.taskTimeWide]}>
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
                    <ThemedText type="defaultSemiBold" style={[styles.sectionLabel, isTablet && styles.sectionLabelWide]}>
                      Routines
                    </ThemedText>
                    {dayRoutines.map((routine) => {
                      const isCompleted = isCompletedOnDate(routine.id, day);
                      return (
                        <View
                          key={routine.id}
                          style={[styles.routineItem, { opacity: isCompleted ? 0.6 : 1 }, isTablet && styles.routineItemWide]}>
                          <View
                            style={[
                              styles.routineDot,
                              isTablet && styles.routineDotWide,
                              { backgroundColor: routine.color || colors.tint },
                            ]}
                          />
                          <ThemedText type="default" style={[isCompleted && styles.completedText, isTablet && styles.routineNameWide]}>
                            {routine.name}
                          </ThemedText>
                          {isCompleted && <Text style={[styles.completedIcon, { color: colors.success }, isTablet && styles.completedIconWide]}> ✓</Text>}
                        </View>
                      );
                    })}
                  </View>
                )}

                {dayTasks.length === 0 && dayRoutines.length === 0 && (
                  <ThemedText style={[styles.emptyDay, { color: colors.icon }, isTablet && styles.emptyDayWide]}>
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
  headerWide: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  weekRange: {
    fontSize: 16,
  },
  weekRangeWide: {
    fontSize: 20,
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
  todayButton: {
    fontSize: 12,
  },
  todayButtonWide: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  scrollContentWide: {
    padding: 24,
    gap: 12,
    maxWidth: 1200,
    alignSelf: 'center',
  },
  dayColumn: {
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  dayColumnWide: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  dayName: {
    fontSize: 14,
  },
  dayNameWide: {
    fontSize: 16,
  },
  dayNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberWide: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayNumberTextWide: {
    fontSize: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  sectionLabelWide: {
    fontSize: 14,
    marginBottom: 6,
  },
  taskItem: {
    paddingVertical: 4,
    paddingLeft: 8,
    borderLeftWidth: 3,
  },
  taskItemWide: {
    paddingVertical: 6,
    paddingLeft: 12,
    borderLeftWidth: 4,
    marginBottom: 4,
  },
  taskTitleWide: {
    fontSize: 14,
  },
  taskTime: {
    fontSize: 11,
  },
  taskTimeWide: {
    fontSize: 13,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 6,
  },
  routineItemWide: {
    paddingVertical: 4,
    gap: 8,
    marginBottom: 4,
  },
  routineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routineDotWide: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  routineNameWide: {
    fontSize: 14,
  },
  completedIcon: {
    fontSize: 12,
  },
  completedIconWide: {
    fontSize: 14,
  },
  emptyDay: {
    fontSize: 12,
    textAlign: 'center',
    padding: 8,
  },
  emptyDayWide: {
    fontSize: 14,
    padding: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});