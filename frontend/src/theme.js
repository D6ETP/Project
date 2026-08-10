import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B3C5D', // Deep Blue
      light: '#328CC1', // Light Blue
      dark: '#06263B', // Darker Blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#D9B310', // Golden Orange/Yellow highlight
      light: '#FFD700',
      dark: '#A6880B',
      contrastText: '#000000',
    },
    success: {
      main: '#2e7d32', // Green for success states
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none', // Modern look, no all-caps buttons
    },
  },
  shape: {
    borderRadius: 12, // Modern rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
        },
        containedPrimary: {
          boxShadow: '0 4px 14px 0 rgba(11, 60, 93, 0.39)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

export default theme;
