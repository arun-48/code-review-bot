// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'

function Navbar({ toggleTheme }) {
    const location = useLocation()
    const theme = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const tabValue = location.pathname === '/history' ? 1 : 0

    return (
        <Box sx={{
            background: isDark
                ? 'rgba(19,19,20,0.92)'
                : 'rgba(248,249,250,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${theme.palette.divider}`,
            px: 3,
            display: 'flex',
            alignItems: 'center',
            height: 56,
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            {/* Logo */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1, mr: 3
            }}>
                <SmartToyOutlinedIcon sx={{
                    color: theme.palette.primary.main,
                    fontSize: 22
                }} />
                <Typography sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: '15px',
                    fontFamily: "'Google Sans', sans-serif"
                }}>
                    AI Code Review Bot
                </Typography>
            </Box>

            {/* Tabs */}
            <Tabs
                value={tabValue}
                sx={{
                    minHeight: 56,
                    '& .MuiTabs-indicator': {
                        backgroundColor: theme.palette.primary.main,
                        height: 2,
                        borderRadius: 1
                    }
                }}
            >
                {['Review', 'History', 'Repository'].map((label, i) => (
                    <Tab
                        key={label}
                        label={label}
                        component={i < 2 ? Link : 'div'}
                        to={i === 0 ? '/' : i === 1 ? '/history' : undefined}
                        disabled={i === 2}
                        sx={{
                            color: tabValue === i
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                            minHeight: 56,
                            fontSize: '14px'
                        }}
                    />
                ))}
            </Tabs>

            <Box sx={{ flex: 1 }} />

            {/* Theme Toggle */}
            <Box
                onClick={toggleTheme}
                sx={{
                    position: 'relative',
                    width: 52,
                    height: 28,
                    borderRadius: 14,
                    background: isDark
                        ? 'linear-gradient(135deg, #1a73e8, #4a90d9)'
                        : 'linear-gradient(135deg, #e8a020, #f5c842)',
                    cursor: 'pointer',
                    transition: 'background 0.4s ease',
                    boxShadow: isDark
                        ? '0 2px 8px rgba(26,115,232,0.4)'
                        : '0 2px 8px rgba(232,160,32,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    px: '3px',
                    boxSizing: 'border-box',
                    '&:hover': {
                        opacity: 0.9,
                        transform: 'scale(1.05)',
                        transition: 'all 0.2s ease'
                    }
                }}
            >
                {/* Sliding thumb */}
                <Box sx={{
                    position: 'absolute',
                    top: '3px',
                    left: isDark ? '27px' : '3px',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: '#ffffff',
                    transition: 'left 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2
                }}>
                    {isDark
                        ? <DarkModeOutlinedIcon sx={{
                            fontSize: 13,
                            color: '#1a73e8'
                        }} />
                        : <LightModeOutlinedIcon sx={{
                            fontSize: 13,
                            color: '#e8a020'
                        }} />
                    }
                </Box>

                {/* Sun icon — left side background */}
                <Box sx={{
                    position: 'absolute',
                    left: 6,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isDark ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1
                }}>
                    <LightModeOutlinedIcon sx={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.8)'
                    }} />
                </Box>

                {/* Moon icon — right side background */}
                <Box sx={{
                    position: 'absolute',
                    right: 6,
                    display: 'flex',
                    alignItems: 'center',
                    opacity: isDark ? 0 : 1,
                    transition: 'opacity 0.3s ease',
                    zIndex: 1
                }}>
                    <DarkModeOutlinedIcon sx={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.8)'
                    }} />
                </Box>
            </Box>
        </Box>
    )
}

export default Navbar