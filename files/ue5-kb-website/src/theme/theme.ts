import { createTheme, type ThemeOptions } from '@mui/material/styles';

const commonTheme: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.05em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.7,
    },
    // fontFamilyMonospace: '"JetBrains Mono", "Fira Code", Consolas, monospace',
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
};

export const darkTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Sky blue
      light: '#7dd3fc',
      dark: '#0284c7',
    },
    secondary: {
      main: '#a78bfa', // Purple
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
    success: {
      main: '#4ade80', // Green
    },
    warning: {
      main: '#fbbf24', // Gold
    },
    error: {
      main: '#f87171', // Red
    },
    background: {
      default: '#0f172a', // Deep slate
      paper: '#1e293b', // Slate card
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
  },
});

export const lightTheme = createTheme({
  ...commonTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#0284c7', // Sky blue
      light: '#38bdf8',
      dark: '#075985',
    },
    secondary: {
      main: '#7c3aed', // Purple
      light: '#a78bfa',
      dark: '#5b21b6',
    },
    success: {
      main: '#16a34a', // Green
    },
    warning: {
      main: '#d97706', // Gold
    },
    error: {
      main: '#dc2626', // Red
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
  },
});
