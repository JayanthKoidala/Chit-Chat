import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Pleasant blue
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#00bcd4', // Cyan as secondary
        },
        background: {
            default: '#f0f2f5', // WhatsApp-like light gray background
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

export default theme;
