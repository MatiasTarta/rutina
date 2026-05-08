import { useCallback, useEffect, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { SwipeableView } from '@/components/SwipeableView';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { Colors } from '@/constants/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useResponsive } from '@/hooks/useResponsive';

import { useRoutinesStore } from '@/stores/routinesStore';

export default function HabitsScreen() {
  const colorScheme = useColorScheme();

  const colors = Colors[colorScheme ?? 'light'];

  const { isTablet } = useResponsive();

  const {
    routines,
    fetchRoutines,
    toggleCompletion,
    getStreak,
    isCompletedOnDate,
  } = useRoutinesStore();

  // =========================
  // FETCH ONLY ONCE
  // =========================
  useEffect(() => {
    fetchRoutines();
  }, []);

  // =========================
  // TODAY MEMOIZED
  // =========================
  const today = useMemo(() => new Date(), []);

  // =========================
  // TOGGLE
  // =========================
  const handleToggle = useCallback(
    async (routineId: string) => {
      await toggleCompletion(routineId, today);
    },
    [toggleCompletion, today]
  );

  // =========================
  // MEMOIZED ROUTINES
  // =========================
  const activeRoutines = useMemo(() => {
    return routines.filter((r) => r.isActive);
  }, [routines]);

  const dailyRoutines = useMemo(() => {
    return activeRoutines.filter(
      (r) => r.frequency === 'daily'
    );
  }, [activeRoutines]);

  const weeklyRoutines = useMemo(() => {
    return activeRoutines.filter(
      (r) => r.frequency === 'weekly'
    );
  }, [activeRoutines]);

  const customRoutines = useMemo(() => {
    return activeRoutines.filter(
      (r) => r.frequency === 'custom'
    );
  }, [activeRoutines]);

  // =========================
  // MEMOIZED CARD RENDER
  // =========================
  const renderRoutineCard = useCallback(
    (routine: typeof routines[0]) => {
      const streak = getStreak(routine.id);

      const isCompleted = isCompletedOnDate(
        routine.id,
        today
      );

      const daysAbbrev = routine.daysOfWeek
        ?.map(
          (d) =>
            ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d]
        )
        .join(' ');

      return (
        <Pressable
          key={routine.id}
          style={[
            styles.routineCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
            isTablet && styles.routineCardWide,
          ]}
          onPress={() => handleToggle(routine.id)}>

          <View style={styles.routineHeader}>
            <View style={styles.routineInfo}>

              <View style={styles.routineTitleRow}>
                {routine.color && (
                  <View
                    style={[
                      styles.colorIndicator,
                      isTablet &&
                      styles.colorIndicatorWide,
                      {
                        backgroundColor:
                          routine.color,
                      },
                    ]}
                  />
                )}

                <ThemedText
                  type="defaultSemiBold"
                  style={[
                    isCompleted &&
                    styles.completedText,
                    isTablet &&
                    styles.routineNameWide,
                  ]}>
                  {routine.name}
                </ThemedText>
              </View>

              {routine.description && (
                <ThemedText
                  style={[
                    styles.routineDescription,
                    {
                      color: colors.icon,
                    },
                    isTablet &&
                    styles.routineDescriptionWide,
                  ]}>
                  {routine.description}
                </ThemedText>
              )}

              {routine.frequency === 'weekly' &&
                routine.daysOfWeek && (
                  <ThemedText
                    style={[
                      styles.routineDays,
                      {
                        color: colors.icon,
                      },
                      isTablet &&
                      styles.routineDaysWide,
                    ]}>
                    {daysAbbrev}
                  </ThemedText>
                )}
            </View>

            <View
              style={[
                styles.checkbox,
                isTablet && styles.checkboxWide,
                {
                  borderColor:
                    routine.color ||
                    colors.tint,
                },
              ]}>

              {isCompleted && (
                <View
                  style={[
                    styles.checkboxFilled,
                    isTablet &&
                    styles.checkboxFilledWide,
                    {
                      backgroundColor:
                        routine.color ||
                        colors.success,
                    },
                  ]}
                />
              )}
            </View>
          </View>

          <View style={styles.routineFooter}>
            <View style={styles.streakContainer}>
              <Text
                style={[
                  styles.streakEmoji,
                  isTablet &&
                  styles.streakEmojiWide,
                  {
                    color: colors.streakGold,
                  },
                ]}>
                🔥
              </Text>

              <ThemedText
                style={[
                  styles.streakText,
                  {
                    color: colors.streakGold,
                  },
                  isTablet &&
                  styles.streakTextWide,
                ]}>
                {streak} day
                {streak !== 1 ? 's' : ''}
              </ThemedText>
            </View>

            {routine.preferredTime && (
              <ThemedText
                style={[
                  styles.preferredTime,
                  {
                    color: colors.icon,
                  },
                  isTablet &&
                  styles.preferredTimeWide,
                ]}>
                {routine.preferredTime}
              </ThemedText>
            )}
          </View>
        </Pressable>
      );
    },
    [
      colors,
      isTablet,
      today,
      handleToggle,
      getStreak,
      isCompletedOnDate,
    ]
  );

  return (
    <SwipeableView>
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}>

        <ScrollView
          style={styles.scrollView}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isTablet &&
            styles.scrollContentWide,
          ]}>

          {/* HEADER */}
          <View style={styles.header}>
            <ThemedText
              type="title"
              style={[
                styles.titleText,
                isTablet &&
                styles.titleTextWide,
              ]}>
              Habits
            </ThemedText>

            <ThemedText
              style={[
                styles.subtitleText,
                {
                  color: colors.icon,
                },
                isTablet &&
                styles.subtitleTextWide,
              ]}>
              {activeRoutines.length} active
              routine
              {activeRoutines.length !== 1
                ? 's'
                : ''}
            </ThemedText>
          </View>

          {/* EMPTY STATE */}
          {routines.length === 0 ? (
            <ThemedView
              style={[
                styles.emptyState,
                isTablet &&
                styles.emptyStateWide,
              ]}>

              <ThemedText
                type="subtitle"
                style={[
                  styles.emptyStateTitle,
                  {
                    textAlign: 'center',
                    marginBottom: 8,
                  },
                ]}>
                No habits yet
              </ThemedText>

              <ThemedText
                style={[
                  styles.emptyStateText,
                  {
                    color: colors.icon,
                    textAlign: 'center',
                  },
                ]}>
                Add your first habit to
                start tracking your
                progress
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {/* DAILY */}
              {dailyRoutines.length > 0 && (
                <View
                  style={[
                    styles.section,
                    isTablet &&
                    styles.sectionWide,
                  ]}>

                  <ThemedText
                    type="subtitle"
                    style={[
                      styles.sectionTitle,
                      isTablet &&
                      styles.sectionTitleWide,
                    ]}>
                    Daily
                  </ThemedText>

                  <View
                    style={[
                      styles.cardsGrid,
                      isTablet &&
                      styles.cardsGridWide,
                    ]}>
                    {dailyRoutines.map(
                      renderRoutineCard
                    )}
                  </View>
                </View>
              )}

              {/* WEEKLY */}
              {weeklyRoutines.length > 0 && (
                <View
                  style={[
                    styles.section,
                    isTablet &&
                    styles.sectionWide,
                  ]}>

                  <ThemedText
                    type="subtitle"
                    style={[
                      styles.sectionTitle,
                      isTablet &&
                      styles.sectionTitleWide,
                    ]}>
                    Weekly
                  </ThemedText>

                  <View
                    style={[
                      styles.cardsGrid,
                      isTablet &&
                      styles.cardsGridWide,
                    ]}>
                    {weeklyRoutines.map(
                      renderRoutineCard
                    )}
                  </View>
                </View>
              )}

              {/* CUSTOM */}
              {customRoutines.length > 0 && (
                <View
                  style={[
                    styles.section,
                    isTablet &&
                    styles.sectionWide,
                  ]}>

                  <ThemedText
                    type="subtitle"
                    style={[
                      styles.sectionTitle,
                      isTablet &&
                      styles.sectionTitleWide,
                    ]}>
                    Custom
                  </ThemedText>

                  <View
                    style={[
                      styles.cardsGrid,
                      isTablet &&
                      styles.cardsGridWide,
                    ]}>
                    {customRoutines.map(
                      renderRoutineCard
                    )}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>
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
  },

  scrollContentWide: {
    padding: 24,
    maxWidth: 900,
    alignSelf: 'center',
  },

  header: {
    marginBottom: 24,
  },

  titleText: {
    fontSize: 28,
  },

  titleTextWide: {
    fontSize: 36,
  },

  subtitleText: {
    fontSize: 14,
  },

  subtitleTextWide: {
    fontSize: 16,
  },

  section: {
    marginBottom: 24,
    gap: 12,
  },

  sectionWide: {
    marginBottom: 32,
    gap: 16,
  },

  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },

  sectionTitleWide: {
    fontSize: 20,
    marginBottom: 12,
  },

  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },

  emptyStateWide: {
    padding: 48,
    borderRadius: 16,
  },

  emptyStateTitle: {
    fontSize: 16,
  },

  emptyStateText: {
    fontSize: 14,
  },

  cardsGrid: {
    gap: 12,
  },

  cardsGridWide: {
    gap: 16,
  },

  routineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },

  routineCardWide: {
    padding: 20,
    borderRadius: 16,
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

  colorIndicatorWide: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },

  routineNameWide: {
    fontSize: 16,
  },

  routineDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  routineDescriptionWide: {
    fontSize: 14,
    marginTop: 4,
  },

  routineDays: {
    fontSize: 11,
    marginTop: 4,
  },

  routineDaysWide: {
    fontSize: 13,
    marginTop: 6,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxWide: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
  },

  checkboxFilled: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  checkboxFilledWide: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  routineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(128, 128, 128, 0.2)',
  },

  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  streakEmoji: {
    fontSize: 14,
  },

  streakEmojiWide: {
    fontSize: 16,
  },

  streakText: {
    fontSize: 14,
  },

  streakTextWide: {
    fontSize: 16,
  },

  preferredTime: {
    fontSize: 12,
  },

  preferredTimeWide: {
    fontSize: 14,
  },

  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});