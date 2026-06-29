export const colors = {
  // Nearish brand palette (matches web CSS variables)
  darker_pink: '#FD7979',
  medium_pink: '#FDACAC',
  bg_pink: '#FAE1DF',
  lightest_pink: '#FDF0EF',
  medium_dark_pink: '#FDD2D1',
  glow: 'rgba(253, 121, 121, 0.3)',

  // Semantic aliases
  primary: '#FD7979',
  primaryLight: '#FDACAC',
  background: '#FDF0EF',
  surface: '#FFFFFF',
  surfaceAlt: '#FAE1DF',
  border: '#FDD2D1',
  text: '#1a1a2e',
  textSecondary: '#6b7280',
  textLight: '#FFFFFF',
  error: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  disabled: '#d1d5db',

  // Overlays & tints (derived from brand palette)
  primaryTint05: 'rgba(253, 121, 121, 0.05)',
  primaryTint08: 'rgba(253, 121, 121, 0.08)',
  primaryTint10: 'rgba(253, 121, 121, 0.1)',
  primaryTint12: 'rgba(253, 121, 121, 0.12)',
  primaryTint20: 'rgba(253, 121, 121, 0.2)',
  primaryLightTint18: 'rgba(253, 172, 172, 0.18)',
  primaryLightTint20: 'rgba(253, 172, 172, 0.2)',
  surfaceOverlay70: 'rgba(255, 255, 255, 0.7)',
  surfaceOverlay88: 'rgba(255, 255, 255, 0.88)',
  surfaceOverlay92: 'rgba(255, 255, 255, 0.92)',
  backgroundOverlay97: 'rgba(253, 240, 239, 0.97)',
  textSecondaryTint10: 'rgba(107, 114, 128, 0.1)',

  // External brand
  googleBlue: '#4285F4',
  shadow: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const typography = {
  // Sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  // Weights
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
