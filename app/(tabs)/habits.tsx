import { useEffect } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SwipeableView } from '@/components/SwipeableView';
import { useRoutinesStore } from '@/stores/routinesStore';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { routines, fetchRoutines, toggleCompletion, getStreak, isCompletedOnDate } = useRoutinesStore();

  useEffect(() => {
    fetchRoutines();
  }, []);

  const today = new Date();

  const handleToggle = async (routineId: string) => {
    await toggleCompletion(routineId, today);
  };

  const activeRoutines = routines.filter((r) => r.isActive);
  const dailyRoutines = activeRoutines.filter((r) => r.frequency === 'daily');
  const weeklyRoutines = activeRoutines.filter((r) => r.frequency === 'weekly');

  const renderRoutineCard = (routine: typeof routines[0]) => {
    const streak = getStreak(routine.id);
    const isCompleted = isCompletedOnDate(routine.id, today);
    const daysAbbrev = routine.daysOfWeek?.map((d) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d]).join(' ');

    return (
      <Pressable
        key={routine.id}
        style={[styles.routineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => handleToggle(routine.id)}>
        <View style={styles.routineHeader}>
          <View style={styles.routineInfo}>
            <View style={styles.routineTitleRow}>
              {routine.color && (
                <View style={[styles.colorIndicator, { backgroundColor: routine.color }]} />
              )}
              <ThemedText
                type="defaultSemiBold"
                style={isCompleted && styles.completedText}>
                {routine.name}
              </ThemedText>
            </View>
            {routine.description && (
              <ThemedText style={{ color: colors.icon, fontSize: 12, marginTop: 2 }}>
                {routine.description}
              </ThemedText>
            )}
            {routine.frequency === 'weekly' && routine.daysOfWeek && (
              <ThemedText style={{ color: colors.icon, fontSize: 11, marginTop: 4 }}>
                {daysAbbrev}
              </ThemedText>
            )}
          </View>
          <View style={[styles.checkbox, { borderColor: routine.color || colors.tint }]}>
            {isCompleted && (
              <View style={[styles.checkboxFilled, { backgroundColor: routine.color || colors.success }]} />
            )}
          </View>
        </View>

        <View style={styles.routineFooter}>
          <View style={styles.streakContainer}>
            <Text style={[styles.streakEmoji, { color: colors.streakGold }]}>🔥</Text>
            <ThemedText style={{ color: colors.streakGold, fontWeight: '600' }}>
              {streak} day{streak !== 1 ? 's' : ''}
            </ThemedText>
          </View>
          {routine.preferredTime && (
            <ThemedText style={{ color: colors.icon, fontSize: 12 }}>
              {routine.preferredTime}
            </ThemedText>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SwipeableView>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <ThemedText type="title">Habits</ThemedText>
            <ThemedText style={{ color: colors.icon }}>
              {activeRoutines.length} active routine{activeRoutines.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>

        {routines.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle" style={{ textAlign: 'center', marginBottom: 8 }}>
              No habits yet
            </ThemedText>
            <ThemedText style={{ color: colors.icon, textAlign: 'center' }}>
              Add your first habit to start tracking your progress
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {dailyRoutines.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle">Daily</ThemedText>
                {dailyRoutines.map(renderRoutineCard)}
              </View>
            )}

            {weeklyRoutines.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle">Weekly</ThemedText>
                {weeklyRoutines.map(renderRoutineCard)}
              </View>
            )}

            {activeRoutines.filter((r) => r.frequency === 'custom').length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle">Custom</ThemedText>
                {activeRoutines
                  .filter((r) => r.frequency === 'custom')
                  .map(renderRoutineCard)}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
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
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  routineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineInfo: {
    flex: 1,
  },
  routineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakEmoji: {
    fontSize: 14,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});