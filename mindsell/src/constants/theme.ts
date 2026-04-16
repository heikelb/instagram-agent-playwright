export const COLORS = {
  // Backgrounds
  background: '#0A0906',
  surface: '#141210',
  surfaceElevated: '#1E1B16',
  surfaceHighlight: '#262118',

  // Text
  text: '#F0EAE0',
  textSecondary: 'rgba(240, 234, 224, 0.60)',
  textMuted: 'rgba(240, 234, 224, 0.35)',

  // Accents
  gold: '#E8A87C',
  goldDim: 'rgba(232, 168, 124, 0.20)',
  jade: '#A8D5B5',
  jadeDim: 'rgba(168, 213, 181, 0.20)',
  violet: '#D4A8E8',
  violetDim: 'rgba(212, 168, 232, 0.20)',
  blue: '#7EB8D4',
  blueDim: 'rgba(126, 184, 212, 0.20)',

  // UI
  border: 'rgba(240, 234, 224, 0.08)',
  borderStrong: 'rgba(240, 234, 224, 0.15)',
  overlay: 'rgba(10, 9, 6, 0.85)',
  scrim: 'rgba(10, 9, 6, 0.50)',
} as const;

export const FONTS = {
  heading: 'CormorantGaramond_600SemiBold',
  headingLight: 'CormorantGaramond_300Light',
  headingItalic: 'CormorantGaramond_400Regular_Italic',
  headingMediumItalic: 'CormorantGaramond_500Medium_Italic',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  mono: 'DMMono_400Regular',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;
