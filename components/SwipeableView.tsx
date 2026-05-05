import { usePathname, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS } from 'react-native-reanimated';

const TABS = ['index', 'week', 'calendar', 'habits'] as const;
type TabName = typeof TABS[number];

interface SwipeableViewProps {
  children: React.ReactNode;
}

export function SwipeableView({ children }: SwipeableViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();

  const getIndexFromPath = useCallback(() => {
    const currentTab = pathname.split('/').pop() || 'index';
    return Math.max(0, TABS.indexOf(currentTab as TabName));
  }, [pathname]);

  const [currentIndex, setCurrentIndex] = useState(getIndexFromPath());

  // 🔒 lock para evitar múltiples ejecuciones
  const isSwipingRef = useRef(false);

  useEffect(() => {
    const newIndex = getIndexFromPath();
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [pathname]);

  const navigateToTab = useCallback((index: number) => {
    if (index >= 0 && index < TABS.length) {
      setCurrentIndex(index);
      router.replace(`/(tabs)/${TABS[index]}` as any);
    }
  }, []);

  const handleSwipe = useCallback((direction: 'left' | 'right') => {
    if (isSwipingRef.current) return;

    isSwipingRef.current = true;

    if (direction === 'left' && currentIndex < TABS.length - 1) {
      navigateToTab(currentIndex + 1);
    }

    if (direction === 'right' && currentIndex > 0) {
      navigateToTab(currentIndex - 1);
    }

    // liberar lock después de un tiempo
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 300);
  }, [currentIndex]);

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      const threshold = 60;

      if (event.translationX < -threshold) {
        runOnJS(handleSwipe)('left');
      } else if (event.translationX > threshold) {
        runOnJS(handleSwipe)('right');
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
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