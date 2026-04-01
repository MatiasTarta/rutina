import { useState } from 'react';
import { StyleSheet, View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from './themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface FloatingActionButtonProps {
  onAddTask?: () => void;
  onAddRoutine?: () => void;
}

export function FloatingActionButton({ onAddTask, onAddRoutine }: FloatingActionButtonProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleAddTask = () => {
    setIsOpen(false);
    if (onAddTask) {
      onAddTask();
    } else {
      router.push({ pathname: '/modal', params: { type: 'task' } });
    }
  };

  const handleAddRoutine = () => {
    setIsOpen(false);
    if (onAddRoutine) {
      onAddRoutine();
    } else {
      router.push({ pathname: '/modal', params: { type: 'routine' } });
    }
  };

  return (
    <View style={styles.container}>
      {/* Menu items */}
      {isOpen && (
        <>
          <Pressable
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={handleAddRoutine}>
            <ThemedText style={styles.menuText}>New Routine</ThemedText>
            <View style={[styles.iconContainer, { backgroundColor: colors.secondary }]}>
              <ThemedText style={styles.icon}>🔁</ThemedText>
            </View>
          </Pressable>
          <Pressable
            style={[styles.menuItem, { backgroundColor: colors.card }]}
            onPress={handleAddTask}>
            <ThemedText style={styles.menuText}>New Task</ThemedText>
            <View style={[styles.iconContainer, { backgroundColor: colors.success }]}>
              <ThemedText style={styles.icon}>✓</ThemedText>
            </View>
          </Pressable>
        </>
      )}

      {/* Main button */}
      <Pressable
        style={[
          styles.mainButton,
          { backgroundColor: isOpen ? colors.error : colors.tint },
        ]}
        onPress={toggleMenu}>
        <ThemedText style={styles.mainIcon}>{isOpen ? '✕' : '+'}</ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'flex-end',
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  mainIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
  },
});
