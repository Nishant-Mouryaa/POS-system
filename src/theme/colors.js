// theme/colors.js
// Cafe POS System - Bright Professional Theme

export const Palette = {
  /* Brand Colors - Professional Blue */
  primary: '#2563EB',        // Vibrant blue (trust/professional)
  primaryLight: '#3B82F6',   // Lighter blue
  primaryDark: '#1D4ED8',    // Darker blue
  primaryXLight: 'rgba(37, 99, 235, 0.15)',
  primaryXXLight: 'rgba(37, 99, 235, 0.08)',
  primaryXXXL: 'rgba(37, 99, 235, 0.03)',
  
  secondary: '#10B981',      // Emerald green (growth/fresh)
  secondaryLight: '#34D399', // Lighter green
  secondaryDark: '#059669',  // Darker green
  secondaryXLight: 'rgba(16, 185, 129, 0.15)',
  secondaryXXLight: 'rgba(16, 185, 129, 0.08)',
  secondaryXXXL: 'rgba(16, 185, 129, 0.03)',

  /* Accent Colors */
  accent: '#F59E0B',         // Amber (attention/energy)
  accentLight: '#FBBF24',    // Lighter amber
  accentDark: '#D97706',     // Darker amber

  /* Light Theme Base */
  background: '#F9FAFB',     // Light gray background
  backgroundElevated: '#FFFFFF', // White elevated surfaces
  backgroundCard: '#FFFFFF', // Card backgrounds
  
  /* UI Colors */
  iconLight: '#FFFFFF',
  iconDark: '#6B7280',
  surface: '#FFFFFF',        // Main surface color
  surfaceVariant: '#F3F4F6', // Variant surface
  
  /* Status Colors - High Contrast */
  success: '#10B981',        // Emerald green
  warning: '#F59E0B',        // Amber
  error: '#EF4444',          // Bright red
  info: '#3B82F6',           // Blue
  
  /* Order Status */
  brewing: '#F59E0B',        // Amber - brewing
  ready: '#10B981',          // Green - ready
  cancelled: '#9CA3AF',      // Gray - cancelled
  completed: '#8B5CF6',      // Purple - completed

  /* Text Colors */
  text: '#111827',           // Primary text (almost black)
  textSecondary: '#4B5563',  // Secondary text
  textMuted: '#6B7280',      // Muted text
  textDisabled: '#9CA3AF',   // Disabled text
  textOnPrimary: '#FFFFFF',  // Text on primary color
  textOnSecondary: '#FFFFFF', // Text on secondary color
  
  /* Borders & Dividers */
  border: '#E5E7EB',         // Subtle borders
  borderLight: '#D1D5DB',    // Light borders
  divider: '#F3F4F6',        // Dividers
  
  /* Shadows & Overlays */
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  /* Glass Effect */
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(209, 213, 219, 0.5)',
};

export const AdminPalette = {
  /* Primary Colors - Professional Blue */
  primary: '#2563EB',
  primaryLight: '#3B82F6',
  primaryDark: '#1D4ED8',
  primaryXLight: 'rgba(37, 99, 235, 0.15)',
  primaryXXLight: 'rgba(37, 99, 235, 0.08)',

  /* Secondary Colors - Emerald Green */
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  /* Accent - Amber */
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  /* Status Colors */
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  /* Order Status Colors */
  orderPending: '#F59E0B',
  orderBrewing: '#F59E0B',
  orderReady: '#10B981',
  orderServed: '#8B5CF6',
  orderCancelled: '#EF4444',

  /* Light Theme Backgrounds */
  bg: '#F9FAFB',
  bgElevated: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgNavigation: '#FFFFFF',
  bgModal: '#FFFFFF',
  bgInput: '#FFFFFF',
  bgButton: '#F3F4F6',
  
  /* Surface Colors */
  surface: '#FFFFFF',
  surfaceVariant: '#F3F4F6',
  surfaceContainer: '#E5E7EB',
  surfaceContainerHigh: '#D1D5DB',
  surfaceContainerHighest: '#9CA3AF',

  /* Text Colors */
  text: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textDisabled: '#9CA3AF',
  textFaded: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  textOnSurface: '#111827',
  textSuccess: '#10B981',
  textWarning: '#F59E0B',
  textError: '#EF4444',

  /* Borders & Outlines */
  border: '#E5E7EB',
  borderLight: '#D1D5DB',
  borderDark: '#9CA3AF',
  outline: '#D1D5DB',
  outlineVariant: '#E5E7EB',

  /* Interactive States */
  hover: 'rgba(0, 0, 0, 0.05)',
  pressed: 'rgba(0, 0, 0, 0.1)',
  focused: 'rgba(37, 99, 235, 0.2)',
  selected: 'rgba(37, 99, 235, 0.1)',
  disabled: 'rgba(0, 0, 0, 0.05)',

  /* Shadows */
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  shadowColored: 'rgba(37, 99, 235, 0.2)',

  /* Glass Morphism */
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(209, 213, 219, 0.5)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',

  /* Data Visualization */
  chart1: '#2563EB',        // Blue
  chart2: '#10B981',        // Green
  chart3: '#F59E0B',        // Amber
  chart4: '#8B5CF6',        // Purple
  chart5: '#EF4444',        // Red
  chart6: '#3B82F6',        // Light blue
  chart7: '#EC4899',        // Pink
  chart8: '#14B8A6',        // Teal

  /* Payment Method Colors */
  cashPayment: '#10B981',   // Green
  cardPayment: '#2563EB',   // Blue
  upiPayment: '#8B5CF6',    // Purple
  walletPayment: '#F59E0B', // Amber
  
  /* Table Status Colors */
  tableEmpty: '#E5E7EB',    // Gray
  tableOccupied: '#F59E0B', // Amber
  tableReserved: '#8B5CF6', // Purple
  tableDirty: '#EF4444',    // Red
  tableServing: '#10B981',  // Green

  /* Kitchen Priority Colors */
  kitchenUrgent: '#EF4444', // Red
  kitchenHigh: '#F59E0B',   // Amber
  kitchenNormal: '#3B82F6', // Blue
  kitchenLow: '#10B981',    // Green

  /* Inventory Status */
  stockGood: '#10B981',
  stockMedium: '#F59E0B',
  stockLow: '#EF4444',
  stockCritical: '#EF4444',
  stockOut: '#9CA3AF',
  stockExpiring: '#8B5CF6',

  /* Special States */
  premium: '#F59E0B',
  discount: '#10B981',
  loyalty: '#8B5CF6',
  featured: '#2563EB',
  trending: '#EC4899',
  newItem: '#3B82F6'
};

// Time-based theme variants
export const ShiftThemes = {
  morning: {
    accent: '#F59E0B',       // Amber - morning
    secondary: '#10B981',    // Green
    brightness: 1.0,
  },
  afternoon: {
    accent: '#2563EB',       // Blue - afternoon
    secondary: '#8B5CF6',    // Purple
    brightness: 1.0,
  },
  evening: {
    accent: '#8B5CF6',       // Purple - evening
    secondary: '#EC4899',    // Pink
    brightness: 0.9,
  },
  night: {
    accent: '#3B82F6',       // Light blue - night
    secondary: '#10B981',    // Green
    brightness: 0.8,
  }
};

// Component-specific colors
export const ComponentColors = {
  pos: {
    background: AdminPalette.bg,
    menuCard: AdminPalette.bgCard,
    selectedItem: AdminPalette.selected,
    addButton: AdminPalette.primary,
    cartSection: AdminPalette.surfaceVariant,
    totalSection: AdminPalette.surfaceContainer,
  },
  navigation: {
    background: AdminPalette.bgNavigation,
    activeTab: AdminPalette.primary,
    inactiveTab: AdminPalette.textMuted,
    indicator: AdminPalette.primary,
  },
  orderCard: {
    background: AdminPalette.bgCard,
    border: AdminPalette.border,
    shadow: AdminPalette.shadow,
    urgent: AdminPalette.kitchenUrgent,
    normal: AdminPalette.kitchenNormal,
  },
  kitchen: {
    background: AdminPalette.bg,
    orderCard: AdminPalette.bgCard,
    urgentGlow: AdminPalette.shadowColored,
    completedOverlay: AdminPalette.success,
  },
  input: {
    background: AdminPalette.bgInput,
    border: AdminPalette.border,
    focusBorder: AdminPalette.primary,
    placeholder: AdminPalette.textMuted,
    text: AdminPalette.text,
  },
  button: {
    primary: AdminPalette.primary,
    secondary: AdminPalette.secondary,
    success: AdminPalette.success,
    warning: AdminPalette.warning,
    danger: AdminPalette.error,
    ghost: 'transparent',
    disabled: AdminPalette.bgButton,
  },
  modal: {
    background: AdminPalette.bgModal,
    overlay: AdminPalette.overlay,
    border: AdminPalette.border,
    shadow: AdminPalette.shadowDark,
  }
};

// Gradient definitions
export const Gradients = {
  primary: `linear-gradient(135deg, ${AdminPalette.primary} 0%, ${AdminPalette.primaryLight} 100%)`,
  secondary: `linear-gradient(135deg, ${AdminPalette.secondary} 0%, ${AdminPalette.secondaryLight} 100%)`,
  success: `linear-gradient(135deg, ${AdminPalette.success} 0%, #34D399 100%)`,
  warning: `linear-gradient(135deg, ${AdminPalette.warning} 0%, #FBBF24 100%)`,
  error: `linear-gradient(135deg, ${AdminPalette.error} 0%, #F87171 100%)`,
  light: `linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)`,
  glass: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 244, 246, 0.8) 100%)`,
};

export default {
  Palette,
  AdminPalette,
  ShiftThemes,
  ComponentColors,
  Gradients
};