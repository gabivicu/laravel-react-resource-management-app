/**
 * Custom MUI Theme - "Obsidian" Design System
 * A sophisticated dark theme with warm amber accents
 */
import { createTheme, alpha, type Theme, type ThemeOptions } from '@mui/material/styles';

// ============================================
// DESIGN TOKENS
// ============================================

// Color Palette - Obsidian with Amber
const palette = {
  // Primary - Warm Amber
  primary: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107', // Main
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  // Secondary - Cool Slate
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B', // Main
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  // Semantic Colors
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#0F172A',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
  // Neutral Grays
  grey: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Typography Scale
const typography = {
  fontFamily: '"DM Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontFamilyMono: '"JetBrains Mono", "Fira Code", monospace',
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.25,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0.01em',
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none' as const,
    letterSpacing: '0.02em',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.03em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
};

// Spacing scale (base 8px)
const spacing = 8;

// Border radius tokens
const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 9999,
};

// Shadows - Soft, layered shadows
const createShadows = (mode: 'light' | 'dark') => {
  const shadowColor = mode === 'dark' ? '0, 0, 0' : '15, 23, 42';
  const ambientOpacity = mode === 'dark' ? 0.2 : 0.08;
  const directOpacity = mode === 'dark' ? 0.25 : 0.12;

  return [
    'none',
    `0 1px 2px rgba(${shadowColor}, ${ambientOpacity})`,
    `0 2px 4px rgba(${shadowColor}, ${ambientOpacity}), 0 1px 2px rgba(${shadowColor}, ${directOpacity})`,
    `0 4px 8px rgba(${shadowColor}, ${ambientOpacity}), 0 2px 4px rgba(${shadowColor}, ${directOpacity})`,
    `0 8px 16px rgba(${shadowColor}, ${ambientOpacity}), 0 4px 8px rgba(${shadowColor}, ${directOpacity})`,
    `0 12px 24px rgba(${shadowColor}, ${ambientOpacity}), 0 6px 12px rgba(${shadowColor}, ${directOpacity})`,
    `0 16px 32px rgba(${shadowColor}, ${ambientOpacity}), 0 8px 16px rgba(${shadowColor}, ${directOpacity})`,
    `0 20px 40px rgba(${shadowColor}, ${ambientOpacity}), 0 10px 20px rgba(${shadowColor}, ${directOpacity})`,
    `0 24px 48px rgba(${shadowColor}, ${ambientOpacity}), 0 12px 24px rgba(${shadowColor}, ${directOpacity})`,
    `0 32px 64px rgba(${shadowColor}, ${ambientOpacity}), 0 16px 32px rgba(${shadowColor}, ${directOpacity})`,
    `0 40px 80px rgba(${shadowColor}, ${ambientOpacity}), 0 20px 40px rgba(${shadowColor}, ${directOpacity})`,
    `0 48px 96px rgba(${shadowColor}, ${ambientOpacity}), 0 24px 48px rgba(${shadowColor}, ${directOpacity})`,
    ...Array(13).fill(`0 48px 96px rgba(${shadowColor}, ${ambientOpacity}), 0 24px 48px rgba(${shadowColor}, ${directOpacity})`),
  ] as const;
};

// Transition tokens
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
};

// ============================================
// DARK THEME
// ============================================

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: palette.primary[500],
      light: palette.primary[300],
      dark: palette.primary[700],
      contrastText: '#0F172A',
    },
    secondary: {
      main: palette.secondary[400],
      light: palette.secondary[300],
      dark: palette.secondary[600],
      contrastText: '#FFFFFF',
    },
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    grey: palette.grey,
    background: {
      default: '#0C0F14',
      paper: '#151921',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
    divider: alpha('#94A3B8', 0.12),
    action: {
      active: '#F8FAFC',
      hover: alpha('#F8FAFC', 0.08),
      selected: alpha('#FFC107', 0.16),
      disabled: '#475569',
      disabledBackground: alpha('#475569', 0.24),
      focus: alpha('#FFC107', 0.12),
    },
  },
  typography: {
    ...typography,
    allVariants: {
      color: '#F8FAFC',
    },
  },
  spacing,
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: createShadows('dark') as Theme['shadows'],
  transitions: {
    duration: transitions.duration,
    easing: transitions.easing,
  },
};

// ============================================
// LIGHT THEME
// ============================================

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: palette.primary[600],
      light: palette.primary[400],
      dark: palette.primary[800],
      contrastText: '#0F172A',
    },
    secondary: {
      main: palette.secondary[600],
      light: palette.secondary[400],
      dark: palette.secondary[800],
      contrastText: '#FFFFFF',
    },
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    grey: palette.grey,
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      disabled: '#9CA3AF',
    },
    divider: alpha('#0F172A', 0.08),
    action: {
      active: '#0F172A',
      hover: alpha('#0F172A', 0.04),
      selected: alpha('#FFC107', 0.12),
      disabled: '#9CA3AF',
      disabledBackground: alpha('#9CA3AF', 0.24),
      focus: alpha('#FFC107', 0.12),
    },
  },
  typography: {
    ...typography,
    allVariants: {
      color: '#0F172A',
    },
  },
  spacing,
  shape: {
    borderRadius: borderRadius.md,
  },
  shadows: createShadows('light') as Theme['shadows'],
  transitions: {
    duration: transitions.duration,
    easing: transitions.easing,
  },
};

// ============================================
// COMPONENT OVERRIDES
// ============================================

const getComponentOverrides = (theme: Theme): ThemeOptions['components'] => ({
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        scrollbarColor: `${alpha(theme.palette.text.primary, 0.2)} transparent`,
        '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
          borderRadius: 8,
          backgroundColor: alpha(theme.palette.text.primary, 0.2),
          '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.3),
          },
        },
        '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
          backgroundColor: 'transparent',
        },
      },
      // Date picker native styling for dark theme
      ...(theme.palette.mode === 'dark' && {
        'input[type="date"], input[type="datetime-local"], input[type="time"]': {
          colorScheme: 'dark',
          '&::-webkit-calendar-picker-indicator': {
            filter: 'invert(1) brightness(0.8)',
            cursor: 'pointer',
            borderRadius: borderRadius.sm,
            padding: 4,
            marginLeft: 8,
            opacity: 0.8,
            transition: `all ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
            '&:hover': {
              opacity: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
              filter: 'invert(1) brightness(1)',
            },
          },
          '&::-webkit-datetime-edit': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-fields-wrapper': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-text': {
            color: theme.palette.text.secondary,
            padding: '0 2px',
          },
          '&::-webkit-datetime-edit-month-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-day-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-year-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-inner-spin-button': {
            display: 'none',
          },
        },
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        padding: '10px 20px',
        transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
        '&:hover': {
          transform: 'translateY(-1px)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      contained: {
        boxShadow: theme.shadows[2],
        '&:hover': {
          boxShadow: theme.shadows[4],
        },
      },
      containedPrimary: {
        background: `linear-gradient(135deg, ${palette.primary[500]} 0%, ${palette.primary[600]} 100%)`,
        '&:hover': {
          background: `linear-gradient(135deg, ${palette.primary[400]} 0%, ${palette.primary[500]} 100%)`,
        },
      },
      outlined: {
        borderWidth: 1.5,
        '&:hover': {
          borderWidth: 1.5,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      },
      text: {
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      },
      sizeLarge: {
        padding: '14px 28px',
        fontSize: '1rem',
      },
      sizeSmall: {
        padding: '6px 14px',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          transform: 'scale(1.05)',
        },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        boxShadow: theme.shadows[4],
        '&:hover': {
          boxShadow: theme.shadows[6],
        },
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        borderRadius: borderRadius.lg,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
        transition: `all ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
        '&:hover': {
          borderColor: alpha(theme.palette.primary.main, 0.3),
          boxShadow: theme.shadows[4],
        },
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: 24,
        '&:last-child': {
          paddingBottom: 24,
        },
      },
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: 24,
        paddingBottom: 16,
      },
      title: {
        fontSize: '1.125rem',
        fontWeight: 600,
      },
    },
  },
  MuiPaper: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      rounded: {
        borderRadius: borderRadius.lg,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.md,
          transition: `all ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
          },
        },
        // Date picker input styling
        '& input[type="date"]': {
          colorScheme: theme.palette.mode,
          '&::-webkit-calendar-picker-indicator': {
            filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none',
            cursor: 'pointer',
            borderRadius: borderRadius.sm,
            padding: 4,
            marginLeft: 8,
            opacity: 0.7,
            transition: `all ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
            '&:hover': {
              opacity: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            },
          },
          '&::-webkit-datetime-edit': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-fields-wrapper': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-text': {
            color: theme.palette.text.secondary,
            padding: '0 2px',
          },
          '&::-webkit-datetime-edit-month-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-day-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-datetime-edit-year-field': {
            color: theme.palette.text.primary,
          },
          '&::-webkit-inner-spin-button': {
            display: 'none',
          },
        },
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.text.primary, 0.2),
          transition: `border-color ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: alpha(theme.palette.text.primary, 0.4),
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderWidth: 2,
        },
      },
      input: {
        padding: '14px 16px',
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        fontWeight: 500,
        '&.Mui-focused': {
          color: theme.palette.primary.main,
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        fontWeight: 500,
        transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
      },
      filled: {
        '&:hover': {
          transform: 'scale(1.02)',
        },
      },
      outlined: {
        borderWidth: 1.5,
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        fontSize: '0.875rem',
      },
    },
  },
  MuiAvatarGroup: {
    styleOverrides: {
      root: {
        '& .MuiAvatar-root': {
          borderWidth: 2,
          borderColor: theme.palette.background.paper,
        },
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
    styleOverrides: {
      tooltip: {
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha('#F8FAFC', 0.9)
          : alpha('#0F172A', 0.9),
        color: theme.palette.mode === 'dark' ? '#0F172A' : '#F8FAFC',
        fontSize: '0.8125rem',
        fontWeight: 500,
        padding: '8px 12px',
        borderRadius: borderRadius.sm,
        backdropFilter: 'blur(8px)',
      },
      arrow: {
        color: theme.palette.mode === 'dark' 
          ? alpha('#F8FAFC', 0.9)
          : alpha('#0F172A', 0.9),
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.xl,
        boxShadow: theme.shadows[10],
      },
      paperFullScreen: {
        borderRadius: 0,
      },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
        fontWeight: 600,
        padding: '24px 24px 16px',
      },
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: '16px 24px',
      },
    },
  },
  MuiDialogActions: {
    styleOverrides: {
      root: {
        padding: '16px 24px 24px',
        gap: 12,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.lg,
        marginTop: 8,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[6],
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        margin: '4px 8px',
        padding: '10px 12px',
        transition: `all ${transitions.duration.shorter}ms ${transitions.easing.easeOut}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
        },
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        transition: `all ${transitions.duration.shorter}ms ${transitions.easing.easeOut}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
        },
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 40,
        color: theme.palette.text.secondary,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 48,
      },
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.9375rem',
        minHeight: 48,
        padding: '12px 20px',
        transition: `color ${transitions.duration.short}ms ${transitions.easing.easeOut}`,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.pill,
        height: 8,
        backgroundColor: alpha(theme.palette.primary.main, 0.15),
      },
      bar: {
        borderRadius: borderRadius.pill,
      },
    },
  },
  MuiCircularProgress: {
    styleOverrides: {
      root: {
        animationDuration: '1s',
      },
    },
  },
  MuiSkeleton: {
    defaultProps: {
      animation: 'wave',
    },
    styleOverrides: {
      root: {
        borderRadius: borderRadius.sm,
        backgroundColor: alpha(theme.palette.text.primary, 0.08),
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.md,
        padding: '12px 16px',
      },
      standardSuccess: {
        backgroundColor: alpha(theme.palette.success.main, 0.12),
        color: theme.palette.success.main,
      },
      standardError: {
        backgroundColor: alpha(theme.palette.error.main, 0.12),
        color: theme.palette.error.main,
      },
      standardWarning: {
        backgroundColor: alpha(theme.palette.warning.main, 0.12),
        color: theme.palette.warning.main,
      },
      standardInfo: {
        backgroundColor: alpha(theme.palette.info.main, 0.12),
        color: theme.palette.info.main,
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        fontWeight: 600,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        border: 'none',
        boxShadow: theme.shadows[8],
      },
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        backgroundImage: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: theme.palette.divider,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: alpha(theme.palette.text.primary, 0.03),
        '& .MuiTableCell-root': {
          fontWeight: 600,
          fontSize: '0.8125rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: theme.palette.text.secondary,
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        transition: `background-color ${transitions.duration.shorter}ms ${transitions.easing.easeOut}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderColor: theme.palette.divider,
        padding: '16px 20px',
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        width: 52,
        height: 28,
        padding: 0,
      },
      switchBase: {
        padding: 2,
        '&.Mui-checked': {
          transform: 'translateX(24px)',
          '& + .MuiSwitch-track': {
            backgroundColor: theme.palette.primary.main,
            opacity: 1,
          },
        },
      },
      thumb: {
        width: 24,
        height: 24,
        backgroundColor: '#FFFFFF',
        boxShadow: theme.shadows[2],
      },
      track: {
        borderRadius: 14,
        backgroundColor: alpha(theme.palette.text.primary, 0.2),
        opacity: 1,
      },
    },
  },
  MuiCheckbox: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.xs,
        transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
        '&:hover': {
          transform: 'scale(1.05)',
        },
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        height: 6,
      },
      thumb: {
        width: 18,
        height: 18,
        '&:hover, &.Mui-focusVisible': {
          boxShadow: `0 0 0 8px ${alpha(theme.palette.primary.main, 0.16)}`,
        },
      },
      track: {
        borderRadius: borderRadius.pill,
      },
      rail: {
        borderRadius: borderRadius.pill,
        opacity: 0.3,
      },
    },
  },
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.lg,
        marginTop: 8,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[6],
      },
      option: {
        borderRadius: borderRadius.sm,
        margin: '4px 8px',
        padding: '10px 12px',
        transition: `all ${transitions.duration.shorter}ms ${transitions.easing.easeOut}`,
        '&[aria-selected="true"]': {
          backgroundColor: alpha(theme.palette.primary.main, 0.12),
        },
        '&.Mui-focused': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        color: theme.palette.text.secondary,
      },
    },
  },
  MuiPagination: {
    styleOverrides: {
      root: {
        '& .MuiPaginationItem-root': {
          borderRadius: borderRadius.md,
          fontWeight: 500,
          transition: `all ${transitions.duration.short}ms ${transitions.easing.spring}`,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        },
      },
    },
  },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: alpha('#000000', 0.7),
        backdropFilter: 'blur(4px)',
      },
    },
  },
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiPaper-root': {
          borderRadius: borderRadius.md,
        },
      },
    },
  },
  MuiAccordion: {
    defaultProps: {
      disableGutters: true,
      elevation: 0,
    },
    styleOverrides: {
      root: {
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: borderRadius.md,
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        padding: '0 20px',
        minHeight: 56,
        '&.Mui-expanded': {
          minHeight: 56,
        },
      },
      content: {
        margin: '16px 0',
        '&.Mui-expanded': {
          margin: '16px 0',
        },
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: '0 20px 20px',
      },
    },
  },
});

// ============================================
// THEME CREATION
// ============================================

// Create base themes
const baseDarkTheme = createTheme(darkThemeOptions);
const baseLightTheme = createTheme(lightThemeOptions);

// Apply component overrides
export const darkTheme = createTheme(baseDarkTheme, {
  components: getComponentOverrides(baseDarkTheme),
});

export const lightTheme = createTheme(baseLightTheme, {
  components: getComponentOverrides(baseLightTheme),
});

// Export default theme (dark)
export const theme = darkTheme;

// Export design tokens for direct use
export const tokens = {
  palette,
  typography,
  spacing,
  borderRadius,
  transitions,
};

export default theme;
