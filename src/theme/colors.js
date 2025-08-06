//theme/colors.js
// Cafe POS System - Modern Dark Theme

export const Palette = {
  /* Brand Colors - Modern Dark with Coffee Accents */
  primary: '#FF6B35',        // Vibrant orange (coffee/energy)
  primaryLight: '#FF8A5C',   // Lighter orange
  primaryDark: '#E55A2E',    // Darker orange
  primaryXLight: 'rgba(255, 107, 53, 0.15)',
  primaryXXLight: 'rgba(255, 107, 53, 0.08)',
  primaryXXXL: 'rgba(255, 107, 53, 0.03)',
  
  secondary: '#4ECDC4',      // Teal/mint green (fresh/modern)
  secondaryLight: '#6DD5CD', // Lighter teal
  secondaryDark: '#3BA99F',  // Darker teal
  secondaryXLight: 'rgba(78, 205, 196, 0.15)',
  secondaryXXLight: 'rgba(78, 205, 196, 0.08)',
  secondaryXXXL: 'rgba(78, 205, 196, 0.03)',

  /* Accent Colors */
  accent: '#FFD93D',         // Golden yellow (warmth/premium)
  accentLight: '#FFE066',    // Lighter yellow
  accentDark: '#E6C335',     // Darker yellow

  /* Dark Theme Base */
  background: '#0F0F0F',     // Pure dark background
  backgroundElevated: '#1A1A1A', // Slightly elevated surfaces
  backgroundCard: '#252525', // Card backgrounds
  
  /* UI Colors */
  iconLight: '#FFFFFF',
  iconDark: '#B0B0B0',
  surface: '#1E1E1E',        // Main surface color
  surfaceVariant: '#2A2A2A', // Variant surface
  
  /* Status Colors - Dark Theme Optimized */
  success: '#00E676',        // Bright green
  warning: '#FFAB00',        // Amber
  error: '#FF5252',          // Bright red
  info: '#40C4FF',           // Light blue
  
  /* Order Status - High Contrast */
  brewing: '#FF6B35',        // Primary orange - brewing
  ready: '#00E676',          // Bright green - ready
  cancelled: '#757575',      // Gray - cancelled
  completed: '#B39DDB',      // Light purple - completed

  /* Text Colors - Dark Theme */
  text: '#FFFFFF',           // Primary text
  textSecondary: '#B0B0B0',  // Secondary text
  textMuted: '#757575',      // Muted text
  textDisabled: '#424242',   // Disabled text
  textOnPrimary: '#000000',  // Text on primary color
  textOnSecondary: '#000000', // Text on secondary color
  
  /* Borders & Dividers */
  border: '#333333',         // Subtle borders
  borderLight: '#424242',    // Light borders
  divider: '#2A2A2A',        // Dividers
  
  /* Shadows & Overlays */
  shadow: 'rgba(0, 0, 0, 0.5)',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.8)',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  /* Glass Effect */
  glass: 'rgba(30, 30, 30, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const AdminPalette = {
  /* Primary Colors - Vibrant Orange */
  primary:        '#FF6B35',            // Vibrant orange
  primaryLight:   '#FF8A5C',            // Light orange
  primaryDark:    '#E55A2E',            // Dark orange
  primaryXLight:  'rgba(255, 107, 53, 0.15)',
  primaryXXLight: 'rgba(255, 107, 53, 0.08)',

  /* Secondary Colors - Modern Teal */
  secondary:      '#4ECDC4',            // Teal
  secondaryLight: '#6DD5CD',            // Light teal
  secondaryDark:  '#3BA99F',            // Dark teal
  
  /* Accent - Golden */
  accent:         '#FFD93D',            // Golden yellow
  accentLight:    '#FFE066',            // Light golden
  accentDark:     '#E6C335',            // Dark golden

  /* Status Colors - High Visibility */
  success:        '#00E676',            // Material green
  warning:        '#FFAB00',            // Material amber
  error:          '#FF5252',            // Material red
  info:           '#40C4FF',            // Material light blue
  
  /* Order Status Colors */
  orderPending:   '#FFAB00',            // Amber - pending
  orderBrewing:   '#FF6B35',            // Orange - brewing
  orderReady:     '#00E676',            // Green - ready
  orderServed:    '#B39DDB',            // Purple - served
  orderCancelled: '#FF5252',            // Red - cancelled

  /* Dark Theme Backgrounds */
  bg:             '#0F0F0F',            // Main background
  bgElevated:     '#1A1A1A',            // Elevated background
  bgCard:         '#252525',            // Card background
  bgNavigation:   '#1E1E1E',            // Navigation background
  bgModal:        '#2A2A2A',            // Modal background
  bgInput:        '#333333',            // Input background
  bgButton:       '#3A3A3A',            // Button background
  
  /* Surface Colors */
  surface:        '#1E1E1E',            // Main surface
  surfaceVariant: '#2A2A2A',            // Variant surface
  surfaceContainer: '#333333',          // Container surface
  surfaceContainerHigh: '#3A3A3A',      // High elevation
  surfaceContainerHighest: '#424242',   // Highest elevation

  /* Text Colors - Dark Optimized */
  text:           '#FFFFFF',            // Primary text
  textSecondary:  '#E0E0E0',            // Secondary text
  textMuted:      '#B0B0B0',            // Muted text
  textDisabled:   '#757575',            // Disabled text
  textFaded:      '#616161',            // Faded text
  textOnPrimary:  '#000000',            // Text on primary
  textOnSecondary: '#000000',           // Text on secondary
  textOnSurface:  '#FFFFFF',            // Text on surface
  textSuccess:    '#00E676',            // Success text
  textWarning:    '#FFAB00',            // Warning text
  textError:      '#FF5252',            // Error text

  /* Borders & Outlines */
  border:         '#333333',            // Default border
  borderLight:    '#424242',            // Light border
  borderDark:     '#212121',            // Dark border
  outline:        '#616161',            // Outline color
  outlineVariant: '#424242',            // Outline variant

  /* Interactive States */
  hover:          'rgba(255, 255, 255, 0.08)', // Hover overlay
  pressed:        'rgba(255, 255, 255, 0.12)', // Pressed overlay
  focused:        'rgba(255, 107, 53, 0.3)',   // Focus overlay
  selected:       'rgba(255, 107, 53, 0.15)',  // Selected state
  disabled:       'rgba(255, 255, 255, 0.12)', // Disabled overlay

  /* Shadows - Enhanced for Dark */
  shadow:         'rgba(0, 0, 0, 0.5)',
  shadowLight:    'rgba(0, 0, 0, 0.3)',
  shadowMedium:   'rgba(0, 0, 0, 0.6)',
  shadowDark:     'rgba(0, 0, 0, 0.8)',
  shadowColored:  'rgba(255, 107, 53, 0.3)',

  /* Glass Morphism Effects */
  glass:          'rgba(30, 30, 30, 0.8)',
  glassBorder:    'rgba(255, 255, 255, 0.1)',
  glassHighlight: 'rgba(255, 255, 255, 0.05)',

  /* Data Visualization - Dark Theme */
  chart1:         '#FF6B35',            // Orange
  chart2:         '#4ECDC4',            // Teal
  chart3:         '#FFD93D',            // Yellow
  chart4:         '#00E676',            // Green
  chart5:         '#FF5252',            // Red
  chart6:         '#40C4FF',            // Blue
  chart7:         '#B39DDB',            // Purple
  chart8:         '#FFAB00',            // Amber

  /* Payment Method Colors */
  cashPayment:    '#00E676',            // Green
  cardPayment:    '#40C4FF',            // Blue
  upiPayment:     '#FFAB00',            // Amber
  walletPayment:  '#B39DDB',            // Purple
  
  /* Table Status Colors */
  tableEmpty:     '#424242',            // Gray
  tableOccupied:  '#FF6B35',            // Orange
  tableReserved:  '#4ECDC4',            // Teal
  tableDirty:     '#FF5252',            // Red
  tableServing:   '#FFD93D',            // Yellow

  /* Kitchen Priority Colors */
  kitchenUrgent:  '#FF5252',            // Red - urgent
  kitchenHigh:    '#FFAB00',            // Amber - high
  kitchenNormal:  '#FF6B35',            // Orange - normal
  kitchenLow:     '#4ECDC4',            // Teal - low

  /* Inventory Status */
  stockGood:      '#00E676',            // Green - good stock
  stockMedium:    '#FFD93D',            // Yellow - medium stock
  stockLow:       '#FFAB00',            // Amber - low stock
  stockCritical:  '#FF5252',            // Red - critical
  stockOut:       '#757575',            // Gray - out of stock
  stockExpiring:  '#B39DDB',            // Purple - expiring

  /* Special States */
  premium:        '#FFD93D',            // Golden - premium
  discount:       '#00E676',            // Green - discount
  loyalty:        '#B39DDB',            // Purple - loyalty
  featured:       '#FF6B35',            // Orange - featured
  trending:       '#4ECDC4',            // Teal - trending
  newItem:        '#40C4FF',            // Blue - new
};

// Time-based theme variants (for different shifts)
export const ShiftThemes = {
  morning: {
    accent: '#FFD93D',       // Golden - warm morning
    secondary: '#4ECDC4',    // Fresh teal
    brightness: 0.9,         // Slightly brighter
  },
  
  afternoon: {
    accent: '#FF6B35',       // Standard orange
    secondary: '#4ECDC4',    // Standard teal
    brightness: 1.0,         // Normal brightness
  },
  
  evening: {
    accent: '#B39DDB',       // Purple - calm evening
    secondary: '#40C4FF',    // Blue
    brightness: 0.8,         // Dimmer for evening
  },
  
  night: {
    accent: '#757575',       // Muted gray
    secondary: '#424242',    // Dark gray
    brightness: 0.7,         // Dimmer for night shift
  }
};

// Component-specific dark theme colors
export const ComponentColors = {
  // POS Screen
  pos: {
    background: AdminPalette.bg,
    menuCard: AdminPalette.bgCard,
    selectedItem: AdminPalette.selected,
    addButton: AdminPalette.primary,
    cartSection: AdminPalette.bgElevated,
    totalSection: AdminPalette.surfaceContainerHigh,
  },
  
  // Navigation
  navigation: {
    background: AdminPalette.bgNavigation,
    activeTab: AdminPalette.primary,
    inactiveTab: AdminPalette.textMuted,
    indicator: AdminPalette.primary,
  },
  
  // Order Cards
  orderCard: {
    background: AdminPalette.bgCard,
    border: AdminPalette.border,
    shadow: AdminPalette.shadow,
    urgent: AdminPalette.kitchenUrgent,
    normal: AdminPalette.kitchenNormal,
  },
  
  // Kitchen Display
  kitchen: {
    background: AdminPalette.bg,
    orderCard: AdminPalette.bgCard,
    urgentGlow: AdminPalette.shadowColored,
    completedOverlay: AdminPalette.success,
  },
  
  // Input Fields
  input: {
    background: AdminPalette.bgInput,
    border: AdminPalette.border,
    focusBorder: AdminPalette.primary,
    placeholder: AdminPalette.textMuted,
    text: AdminPalette.text,
  },
  
  // Buttons
  button: {
    primary: AdminPalette.primary,
    secondary: AdminPalette.secondary,
    success: AdminPalette.success,
    warning: AdminPalette.warning,
    danger: AdminPalette.error,
    ghost: 'transparent',
    disabled: AdminPalette.bgButton,
  },
  
  // Modal/Dialog
  modal: {
    background: AdminPalette.bgModal,
    overlay: AdminPalette.overlay,
    border: AdminPalette.border,
    shadow: AdminPalette.shadowDark,
  }
};

// Gradient definitions for modern effects
export const Gradients = {
  primary: `linear-gradient(135deg, ${AdminPalette.primary} 0%, ${AdminPalette.primaryLight} 100%)`,
  secondary: `linear-gradient(135deg, ${AdminPalette.secondary} 0%, ${AdminPalette.secondaryLight} 100%)`,
  success: `linear-gradient(135deg, ${AdminPalette.success} 0%, #4CAF50 100%)`,
  warning: `linear-gradient(135deg, ${AdminPalette.warning} 0%, #FFC107 100%)`,
  error: `linear-gradient(135deg, ${AdminPalette.error} 0%, #F44336 100%)`,
  dark: `linear-gradient(135deg, ${AdminPalette.bg} 0%, ${AdminPalette.bgElevated} 100%)`,
  glass: `linear-gradient(135deg, ${AdminPalette.glass} 0%, rgba(42, 42, 42, 0.6) 100%)`,
};

export default {
  Palette,
  AdminPalette,
  ShiftThemes,
  ComponentColors,
  Gradients
};