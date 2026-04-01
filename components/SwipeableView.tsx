import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, Directions } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';
import { useRouter, usePathname } from 'expo-router';

const TABS = ['index', 'week', 'calendar', 'habits'] as const;
type TabName = typeof TABS[number];

interface SwipeableViewProps {
  children: React.ReactNode;
}

export function SwipeableView({ children }: SwipeableViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const getCurrentTabIndex = () => {
    const currentTab = pathname.split('/').pop() || 'index';
    return TABS.indexOf(currentTab as TabName);
  };

  const navigateToTab = (index: number) => {
    if (index >= 0 && index < TABS.length) {
      const tab = TABS[index];
      router.replace(`/(tabs)/${tab}`);
    }
  };

  const swipeLeft = Gesture.Fling()
    .direction(Directions.LEFT)
    .onEnd(() => {
      const currentIndex = getCurrentTabIndex();
      if (currentIndex < TABS.length - 1) {
        runOnJS(navigateToTab)(currentIndex + 1);
      }
    });

  const swipeRight = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(() => {
      const currentIndex = getCurrentTabIndex();
      if (currentIndex > 0) {
        runOnJS(navigateToTab)(currentIndex - 1);
      }
    });

  const combinedGestures = Gesture.Exclusive(swipeLeft, swipeRight);

  return (
    <GestureDetector gesture={combinedGestures}>
      <Animated.View style={[styles.container, { width }]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
