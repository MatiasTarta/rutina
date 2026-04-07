/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

/**
 * Determines if a color is "light" or "dark" based on its hex value.
 * Used to decide whether to use light or dark text on top of it.
 */
export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? 'dark' : 'light';
}

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // App-specific colors
    primary: '#0a7ea4',
    secondary: '#6366f1',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    card: '#f5f5f5',
    cardBorder: '#e5e5e5',
    priorityLow: '#22c55e',
    priorityMedium: '#f59e0b',
    priorityHigh: '#ef4444',
    statusPending: '#687076',
    statusInProgress: '#0a7ea4',
    statusCompleted: '#22c55e',
    statusCancelled: '#ef4444',
    streakGold: '#fbbf24',
    buttonText: '#fff',
    buttonTextDark: '#11181C',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // App-specific colors
    primary: '#38bdf8',
    secondary: '#818cf8',
    success: '#4ade80',
    warning: '#fbbf24',
    error: '#f87171',
    card: '#1f2937',
    cardBorder: '#374151',
    priorityLow: '#4ade80',
    priorityMedium: '#fbbf24',
    priorityHigh: '#f87171',
    statusPending: '#9BA1A6',
    statusInProgress: '#38bdf8',
    statusCompleted: '#4ade80',
    statusCancelled: '#f87171',
    streakGold: '#fbbf24',
    buttonText: '#fff',
    buttonTextDark: '#151718',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
