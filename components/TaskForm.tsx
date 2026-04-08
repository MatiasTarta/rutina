import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Colors, getContrastColor } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTasksStore } from '@/stores/tasksStore';
import { Task, priorityColors } from '@/types';
import { ThemedText } from './themed-text';

interface TaskFormProps {
  taskId?: string;
  isEdit?: boolean;
}

export function TaskForm({ taskId, isEdit }: TaskFormProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { addTask, updateTask, fetchTaskById } = useTasksStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit && taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    const task = await fetchTaskById(taskId);
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate);
      setDueTime(task.dueTime || '');
      setPriority(task.priority);
      setDuration(task.duration?.toString() || '');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (isEdit && taskId) {
        await updateTask(taskId, {
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate,
          dueTime: dueTime || undefined,
          priority,
          duration: duration ? parseInt(duration) : undefined,
        });
      } else {
        await addTask({
          title: title.trim(),
          description: description.trim() || undefined,
          dueDate,
          dueTime: dueTime || undefined,
          priority,
          duration: duration ? parseInt(duration) : undefined,
          status: 'pending',
        });
      }
      router.back();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setLoading(false);
    }
  };

  const priorityOptions: Task['priority'][] = ['low', 'medium', 'high'];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">{isEdit ? 'Edit Task' : 'New Task'}</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ color: colors.icon }}>Cancel</ThemedText>
        </Pressable>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Title</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="What needs to be done?"
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
            numberOfLines={3}
          />
        </View>

        {/* Due Date */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Due Date</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.icon}
          />
        </View>

        {/* Due Time */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Time (optional)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
            value={dueTime}
            onChangeText={setDueTime}
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

        {/* Priority */}
        <View style={styles.field}>
          <ThemedText type="defaultSemiBold">Priority</ThemedText>
          <View style={styles.priorityButtons}>
            {priorityOptions.map((p) => (
              <Pressable
                key={p}
                style={[
                  styles.priorityButton,
                  {
                    backgroundColor: priority === p ? priorityColors[p] : colors.card,
                    borderColor: priority === p ? priorityColors[p] : colors.cardBorder,
                  },
                ]}
                onPress={() => setPriority(p)}>
                <ThemedText
                  style={{
                    color: priority === p
                      ? colorScheme === 'dark'
                        ? colors.buttonTextDark
                        : colors.buttonText
                      : colors.text,
                    textTransform: 'capitalize',
                  }}>
                  {p}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        style={[styles.saveButton, { backgroundColor: colors.tint, opacity: loading ? 0.5 : 1 }]}
        onPress={handleSave}
        disabled={loading || !title.trim()}>
        <ThemedText style={[styles.saveButtonText, { color: colorScheme === 'dark' ? colors.buttonTextDark : colors.buttonText }]}>
          {loading ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
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
    height: 80,
    textAlignVertical: 'top',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
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
