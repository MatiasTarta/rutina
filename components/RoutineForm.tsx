import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRoutinesStore } from '@/stores/routinesStore';
import { Routine } from '@/types';
import { ThemedText } from './themed-text';

const colorOptions = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#10b981', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface RoutineFormProps {
  routineId?: string;
  isEdit?: boolean;
}

export function RoutineForm({ routineId, isEdit }: RoutineFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { routines, addRoutine, updateRoutine } = useRoutinesStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<Routine['frequency']>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [preferredTime, setPreferredTime] = useState('');
  const [duration, setDuration] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && routineId) {
      loadRoutine();
    }
  }, [routineId]);

  const loadRoutine = () => {
    const routine = routines.find((r) => r.id === routineId);
    if (routine) {
      setName(routine.name);
      setDescription(routine.description || '');
      setFrequency(routine.frequency);
      setSelectedDays(routine.daysOfWeek || []);
      setPreferredTime(routine.preferredTime || '');
      setDuration(routine.duration?.toString() || '');
      setColor(routine.color || colorOptions[0]);
    }
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (isEdit && routineId) {
        await updateRoutine(routineId, {
          name: name.trim(),
          description: description.trim() || undefined,
          frequency,
          daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
          preferredTime: preferredTime || undefined,
          duration: duration ? parseInt(duration) : undefined,
          color,
        });
      } else {
        await addRoutine({
          name: name.trim(),
          description: description.trim() || undefined,
          frequency,
          daysOfWeek: frequency === 'weekly' ? selectedDays : undefined,
          preferredTime: preferredTime || undefined,
          duration: duration ? parseInt(duration) : undefined,
          color,
          isActive: true,
          startDate: new Date().toISOString().split('T')[0],
        });
      }
      router.back();
    } catch (error) {
      console.error('Failed to save routine:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{isEdit ? 'Edit Routine' : 'New Routine'}</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ color: colors.icon }}>Cancel</ThemedText>
        </Pressable>
      </View>

      <View style={styles.form}>
        {/* Name */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Name</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Morning Run"
            placeholderTextColor={colors.icon}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Description (optional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.card, color: colors.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add details..."
            placeholderTextColor={colors.icon}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Color */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Color</ThemedText>
          <View style={styles.colorGrid}>
            {colorOptions.map((c) => {
              const isSelected = color === c;
              const checkColor = colorScheme === 'dark' ? colors.buttonTextDark : colors.buttonText;
              return (
                <Pressable
                  key={c}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    isSelected && { ...styles.colorSelected, borderColor: checkColor },
                  ]}
                  onPress={() => setColor(c)}>
                  {isSelected && (
                    <View style={[styles.colorCheck, { backgroundColor: checkColor }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Frequency */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Frequency</ThemedText>
          <View style={styles.frequencyButtons}>
            {(['daily', 'weekly', 'custom'] as Routine['frequency'][]).map((f) => {
              const isSelected = frequency === f;
              const bgColor = isSelected ? colors.tint : colors.card;
              const textColor = isSelected && colorScheme === 'dark'
                ? colors.buttonTextDark
                : isSelected
                  ? colors.buttonText
                  : colors.text;
              return (
                <Pressable
                  key={f}
                  style={[
                    styles.frequencyButton,
                    {
                      backgroundColor: bgColor,
                    },
                  ]}
                  onPress={() => setFrequency(f)}>
                  <ThemedText
                    style={{
                      color: textColor,
                      textTransform: 'capitalize',
                    }}>
                    {f}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Days of Week (only for weekly) */}
        {frequency === 'weekly' && (
          <View style={styles.field}>
            <ThemedText type="defaultSemiBold">Select Days</ThemedText>
            <View style={styles.daysGrid}>
              {daysOfWeek.map((day, index) => {
                const isSelected = selectedDays.includes(index);
                const bgColor = isSelected ? colors.tint : colors.card;
                const textColor = isSelected && colorScheme === 'dark'
                  ? colors.buttonTextDark
                  : isSelected
                    ? colors.buttonText
                    : colors.text;
                return (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: bgColor,
                      },
                    ]}
                    onPress={() => toggleDay(index)}>
                    <ThemedText
                      style={{
                        color: textColor,
                        fontSize: 12,
                      }}>
                      {day}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* Preferred Time */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Preferred Time (optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={preferredTime}
            onChangeText={setPreferredTime}
            placeholder="HH:MM"
            placeholderTextColor={colors.icon}
          />
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Duration (minutes, optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={duration}
            onChangeText={setDuration}
            placeholder="30"
            placeholderTextColor={colors.icon}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[styles.saveButton, { backgroundColor: colors.tint, opacity: loading ? 0.5 : 1 }]}
        onPress={handleSave}
        disabled={loading || !name.trim()}>
        <ThemedText style={[styles.saveButtonText, { color: colorScheme === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>
          {loading ? 'Saving...' : isEdit ? 'Update Routine' : 'Create Routine'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}
export function isRoutineScheduledForDate(routine: { isActive: any; startDate: string | number | Date; frequency: string; daysOfWeek: number[]; }, date: Date) {
  const dayOfWeek = date.getDay();

  if (!routine.isActive) return false;

  // opcional: respetar startDate
  if (new Date(date) < new Date(routine.startDate)) return false;

  if (routine.frequency === 'daily') {
    return true;
  }

  if (routine.frequency === 'weekly') {
    return routine.daysOfWeek?.includes(dayOfWeek);
  }

  return false;
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  field: {
    gap: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  colorCheck: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -6,
    marginTop: -6,
  },
  frequencyButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  dayButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
