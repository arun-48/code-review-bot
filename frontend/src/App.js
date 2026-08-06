// src/App.js
import { useState }                     from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme }   from '@mui/material/styles'
import CssBaseline                       from '@mui/material/CssBaseline'
import { Toaster }                       from 'react-hot-toast'
import Navbar                            from './components/Navbar'
import HomePage                          from './pages/HomePage'
import HistoryPage                       from './pages/HistoryPage'
import ReviewDetailPage from './pages/ReviewDetailPage'

const getTheme = (mode) => createTheme({
    palette: {
        mode,
        ...(mode === 'dark' ? {
            primary:   { main: '#A8C7FA' },
            secondary: { main: '#D0BCFF' },
            error:     { main: '#F28B82' },
            warning:   { main: '#FBC02D' },
            success:   { main: '#81C995' },
            background: {
                default: '#131314',
                paper:   '#1E1F20'
            },
            text: {
                primary:   '#E3E3E3',
                secondary: '#9AA0A6'
            },
            divider: 'rgba(255,255,255,0.08)'
        } : {
            primary:   { main: '#1A73E8' },
            secondary: { main: '#7E57C2' },
            error:     { main: '#D93025' },
            warning:   { main: '#EA8600' },
            success:   { main: '#188038' },
            background: {
                default: '#F8F9FA',
                paper:   '#FFFFFF'
            },
            text: {
                primary:   '#202124',
                secondary: '#5F6368'
            },
            divider: 'rgba(0,0,0,0.08)'
        })
    },
    typography: {
        fontFamily: "'Google Sans', 'Roboto', sans-serif",
        h5: { fontWeight: 700 },
        h6: { fontWeight: 600 },
        subtitle1: { fontWeight: 500 }
    },
    shape: { borderRadius: 12 },
    components: {
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                body: {
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? '#131314' : '#F8F9FA'
                }
            })
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: 'none',
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? '#1E1F20' : '#FFFFFF',
                    border: theme.palette.mode === 'dark'
                        ? '1px solid rgba(255,255,255,0.08)'
                        : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 2px 8px rgba(0,0,0,0.3)'
                        : '0 2px 8px rgba(0,0,0,0.08)',
                    '&:hover': {
                        boxShadow: theme.palette.mode === 'dark'
                            ? '0 4px 16px rgba(0,0,0,0.4)'
                            : '0 4px 16px rgba(0,0,0,0.12)'
                    }
                })
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundImage: 'none',
                    backgroundColor:
                        theme.palette.mode === 'dark'
                            ? '#1E1F20' : '#FFFFFF'
                })
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontFamily: "'Google Sans', sans-serif",
                    borderRadius: 20
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: "'Google Sans', sans-serif",
                    fontWeight: 500,
                    borderRadius: 6
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontFamily: "'Google Sans', sans-serif",
                    fontWeight: 500,
                    fontSize: '14px'
                }
            }
        }
    }
})

const getSavedMode = () =>
    localStorage.getItem('themeMode') || 'dark'

function App() {
    const [mode, setMode] = useState(getSavedMode)

    const toggleTheme = () => {
        const newMode = mode === 'dark' ? 'light' : 'dark'
        setMode(newMode)
        localStorage.setItem('themeMode', newMode)
    }

    return (
        <ThemeProvider theme={getTheme(mode)}>
            <CssBaseline />
            <BrowserRouter>
                <Navbar toggleTheme={toggleTheme} />
                <Routes>
                    <Route path="/"
                        element={<HomePage />}
                    />
                    <Route path="/history"
                        element={<HistoryPage />}
                    />
                    <Route path="/reviews/:reviewId" 
                    element={<ReviewDetailPage />} 
                    />
                </Routes>
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: mode === 'dark'
                                ? '#1E1F20' : '#FFFFFF',
                            color: mode === 'dark'
                                ? '#E3E3E3' : '#202124',
                            border: mode === 'dark'
                                ? '1px solid rgba(255,255,255,0.08)'
                                : '1px solid rgba(0,0,0,0.08)',
                            fontFamily: 'Google Sans'
                        }
                    }}
                />
            </BrowserRouter>
        </ThemeProvider>
    )
}

export default App