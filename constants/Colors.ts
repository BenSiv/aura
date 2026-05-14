/**
 * Aura Design System - Premium Color Palette
 * Focused on high-contrast, modern "Dating" aesthetics with glassmorphism support.
 */

const tintColorLight = '#6366F1'; // Indigo 500
const tintColorDark = '#A5B4FC';  // Indigo 300

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F8FAFC',
    tint: tintColorLight,
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    surface: '#FFFFFF',
    border: '#E2E8F0',
    accent: '#FB7185', // Rose 400
    success: '#10B981',
    error: '#EF4444',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A', // Slate 900
    tint: tintColorDark,
    tabIconDefault: '#475569',
    tabIconSelected: tintColorDark,
    surface: '#1E293B', // Slate 800
    border: '#334155',
    accent: '#FDA4AF', // Rose 300
    success: '#34D399',
    error: '#F87171',
  },
};

export default Colors;
