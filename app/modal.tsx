import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { TaskForm } from '@/components/TaskForm';
import { RoutineForm } from '@/components/RoutineForm';

export default function ModalScreen() {
  const { type, id } = useLocalSearchParams<{ type: 'task' | 'routine'; id?: string }>();
  const isEdit = !!id;

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <View style={styles.content}>
        {type === 'task' ? (
          <TaskForm taskId={id} isEdit={isEdit} />
        ) : (
          <RoutineForm routineId={id} isEdit={isEdit} />
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
});
