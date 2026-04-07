import { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { SwipeableView } from '@/components/SwipeableView';
import { useTasksStore } from '@/stores/tasksStore';
import { useRoutinesStore } from '@/stores/routinesStore';
import { Colors, getContrastColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatDate } from '@/utils/helpers';

export default function TodayScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [refreshing, setRefreshing] = useState(false);

  const { tasks, fetchTasks, setTaskStatus } = useTasksStore();
  const { routines, fetchRoutines, fetchCompletions, toggleCompletion, isCompletedOnDate } = useRoutinesStore();

  const loadData = useCallback(async () => {
    try {
      const today = new Date();
      await Promise.all([
        fetchTasks(today, today),
        fetchRoutines(true),
        fetchCompletions(undefined, today, today),
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, [fetchTasks, fetchRoutines, fetchCompletions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const today = new Date();
  const todayStr = formatDate(today);

  const todayTasks = tasks.filter((task) => task.dueDate === todayStr);
  const todayRoutines = routines.filter((routine) => {
    if (!routine.isActive) return false;
    if (routine.frequency === 'daily') return true;
    if (routine.frequency === 'weekly' && routine.daysOfWeek) {
      return routine.daysOfWeek.includes(today.getDay());
    }
    return false;
  });

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    await setTaskStatus(taskId, newStatus);
  };

  const handleRoutineToggle = async (routineId: string) => {
    await toggleCompletion(routineId, today);
  };

  const handleAddTask = () => {
    router.push({ pathname: '/modal', params: { type: 'task' } });
  };

  const handleAddRoutine = () => {
    router.push({ pathname: '/modal', params: { type: 'routine' } });
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SwipeableView>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <ThemedText type="title">Today</ThemedText>
              <ThemedText type="default" style={{ color: colors.icon }}>
                {formatDisplayDate(today)}
              </ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={[styles.quickAction, { backgroundColor: colors.success }]}
              onPress={handleAddTask}>
              <Text style={[styles.quickActionIcon, { color: getContrastColor(colors.success) === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>+</Text>
              <ThemedText style={[styles.quickActionText, { color: getContrastColor(colors.success) === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>Task</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.quickAction, { backgroundColor: colors.secondary }]}
              onPress={handleAddRoutine}>
              <Text style={[styles.quickActionIcon, { color: getContrastColor(colors.secondary) === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>+</Text>
              <ThemedText style={[styles.quickActionText, { color: getContrastColor(colors.secondary) === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>Routine</ThemedText>
            </Pressable>
          </View>

          {/* Tasks Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Tasks</ThemedText>
            {todayTasks.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={{ color: colors.icon }}>No tasks for today</ThemedText>
                <Pressable onPress={handleAddTask} style={styles.emptyAction}>
                  <ThemedText style={{ color: colors.tint }}>Add a task</ThemedText>
                </Pressable>
              </ThemedView>
            ) : (
              todayTasks.map((task) => (
                <Pressable
                  key={task.id}
                  style={[styles.taskItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => handleTaskToggle(task.id, task.status)}>
                  <View style={[styles.checkbox, { borderColor: colors.tint }]}>
                    {task.status === 'completed' && (
                      <View style={[styles.checkboxFilled, { backgroundColor: colors.success }]} />
                    )}
                  </View>
                  <View style={styles.taskContent}>
                    <ThemedText
                      type="defaultSemiBold"
                      style={task.status === 'completed' && styles.completedText}>
                      {task.title}
                    </ThemedText>
                    {task.dueTime && (
                      <ThemedText style={{ color: colors.icon, fontSize: 12 }}>{task.dueTime}</ThemedText>
                    )}
                  </View>
                  {(() => {
                    const priorityColor = colors[`priority${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`];
                    const textColor = getContrastColor(priorityColor) === 'dark' ? colors.buttonTextDark : colors.buttonText;
                    return (
                      <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                        <Text style={[styles.priorityText, { color: textColor }]}>{task.priority.charAt(0)}</Text>
                      </View>
                    );
                  })()}
                </Pressable>
              ))
            )}
          </View>

          {/* Routines Section */}
          <View style={styles.section}>
            <ThemedText type="subtitle">Routines</ThemedText>
            {todayRoutines.length === 0 ? (
              <ThemedView style={styles.emptyState}>
                <ThemedText style={{ color: colors.icon }}>No routines scheduled today</ThemedText>
                <Pressable onPress={handleAddRoutine} style={styles.emptyAction}>
                  <ThemedText style={{ color: colors.tint }}>Add a routine</ThemedText>
                </Pressable>
              </ThemedView>
            ) : (
              todayRoutines.map((routine) => {
                const isCompleted = isCompletedOnDate(routine.id, today);
                return (
                  <Pressable
                    key={routine.id}
                    style={[styles.routineItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                    onPress={() => handleRoutineToggle(routine.id)}>
                    <View style={[styles.checkbox, { borderColor: routine.color || colors.tint }]}>
                      {isCompleted && (
                        <View style={[styles.checkboxFilled, { backgroundColor: routine.color || colors.success }]} />
                      )}
                    </View>
                    <View style={styles.routineContent}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={isCompleted && styles.completedText}>
                        {routine.name}
                      </ThemedText>
                      {routine.preferredTime && (
                        <ThemedText style={{ color: colors.icon, fontSize: 12 }}>{routine.preferredTime}</ThemedText>
                      )}
                    </View>
                    {routine.color && (
                      <View style={[styles.colorDot, { backgroundColor: routine.color }]} />
                    )}
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button */}
        <FloatingActionButton onAddTask={handleAddTask} onAddRoutine={handleAddRoutine} />
      </SafeAreaView>
    </SwipeableView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 18,
    fontWeight: '300',
  },
  quickActionText: {
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyAction: {
    marginTop: 8,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFilled: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  taskContent: {
    flex: 1,
  },
  routineContent: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
