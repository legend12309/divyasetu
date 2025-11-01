// Indian warm color palette
export const colors = {
  // Primary colors
  primary: '#E89B34', // Warm golden orange
  primaryLight: '#F5B15A',
  primaryDark: '#D17A1A',
  
  // Background colors
  background: '#FFF9F3', // Warm cream
  backgroundSecondary: '#FFFFFF',
  
  // Accent colors
  accent1: '#FF6B35', // Vibrant orange
  accent2: '#FF8C42', // Bright orange
  accent3: '#FFA15A', // Soft orange
  
  // Text colors
  text: '#2D1B0E', // Rich brown
  textSecondary: '#6B4E3D', // Medium brown
  textLight: '#8B7355', // Light brown
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Gray scale
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',
  
  // Special colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Feature-specific colors
  grocery: '#4CAF50', // Green
  meals: '#FF6B35', // Orange
  chores: '#2196F3', // Blue
  budget: '#9C27B0', // Purple
  rituals: '#F59E0B', // Amber
};

export type ColorKey = keyof typeof colors;

