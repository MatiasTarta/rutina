import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Breakpoints (similar to common responsive design breakpoints)
const BREAKPOINTS = {
  xs: 0,      // Extra small phones (< 375px)
  sm: 375,    // Small phones (iPhone 12 mini, etc.)
  md: 414,    // Medium phones (most modern phones)
  lg: 768,    // Tablets (iPad, etc.)
  xl: 1024,   // Large tablets / small desktop
};

export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState<ScreenSize>(getScreenSize(SCREEN_WIDTH));
  const [isLandscape, setIsLandscape] = useState(SCREEN_WIDTH > SCREEN_HEIGHT);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      setScreenSize(getScreenSize(width));
      setIsLandscape(width > height);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const isSmallPhone = screenSize === 'xs' || screenSize === 'sm';
  const isTablet = screenSize === 'lg' || screenSize === 'xl';

  return {
    screenSize,
    isLandscape,
    isSmallPhone,
    isTablet,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  };
};

function getScreenSize(width: number): ScreenSize {
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

// Responsive scaling functions
export const scale = (size: number): number => {
  const baseWidth = 375; // Base iPhone width
  const scale = SCREEN_WIDTH / baseWidth;
  // Clamp scale between 0.9 and 1.2 to avoid extreme sizes
  const clampedScale = Math.min(Math.max(scale, 0.9), 1.2);
  return Math.round(size * clampedScale);
};

export const scaleFont = (size: number): number => {
  const baseWidth = 375;
  const scale = SCREEN_WIDTH / baseWidth;
  // Font scaling is more conservative
  const fontScale = 1 + (scale - 1) * 0.5;
  return Math.round(size * fontScale);
};

export const scaleHorizontal = (size: number): number => {
  const baseWidth = 375;
  const scale = SCREEN_WIDTH / baseWidth;
  return Math.round(size * scale);
};

export const scaleVertical = (size: number): number => {
  const baseHeight = 812; // Base iPhone height
  const scale = SCREEN_HEIGHT / baseHeight;
  return Math.round(size * scale);
};
