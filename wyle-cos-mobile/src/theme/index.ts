// ─── Wyle Brand Theme ─────────────────────────────────────────────────────────
// Approved by Amrutha Veluthakal

export const Colors = {
  // Backgrounds
  background: '#000000',        // Jet Black
  surface: '#0D0D0D',
  surfaceElevated: '#1A1A1A',
  surfaceHigh: '#242424',

  // Brand
  sweetSalmon: '#FF9E8A',       // Quick questions
  crimson: '#DC143C',           // Warnings / errors
  yellow: '#E8FF00',            // CTA / Add to cart / Payments
  verdigris: '#40B0A6',         // Buddy positive / response
  salmon: '#FA8072',            // Buddy talking

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#555555',
  textInverse: '#000000',

  // Risk
  riskHigh: '#DC143C',
  riskMedium: '#E8FF00',
  riskLow: '#40B0A6',

  // Status
  success: '#40B0A6',
  warning: '#E8FF00',
  error: '#DC143C',
  info: '#FF9E8A',

  // UI
  border: '#2A2A2A',
  divider: '#1A1A1A',
  overlay: 'rgba(0,0,0,0.75)',
  transparent: 'transparent',
};

export const Typography = {
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    display: 42,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screen: 20,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: {
    shadowColor: Colors.verdigris,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  glowYellow: {
    shadowColor: Colors.yellow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};

export default { Colors, Typography, Spacing, Radius, Shadows };
