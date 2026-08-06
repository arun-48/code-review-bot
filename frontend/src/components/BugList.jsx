// src/components/BugList.jsx
import { useTheme } from '@mui/material/styles'
import Card         from '@mui/material/Card'
import CardContent  from '@mui/material/CardContent'
import Typography   from '@mui/material/Typography'
import Box          from '@mui/material/Box'
import Chip         from '@mui/material/Chip'

function BugCard({ item, color }) {
    const theme  = useTheme()
    const isDark = theme.palette.mode === 'dark'

    return (
        <Card sx={{
            mb: 1.5,
            backgroundColor: isDark ? '#242628' : '#F8F9FA',
            border: isDark
                ? '1px solid rgba(255,255,255,0.06)'
                : '1px solid rgba(0,0,0,0.06)',
            borderLeft: `3px solid ${color}`,
            boxShadow: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: isDark ? '#2A2C2E' : '#E8EAED',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transform: 'translateY(-1px)'
            }
        }}>
            <CardContent sx={{ p: '12px 16px !important' }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1, mb: 0.75,
                    flexWrap: 'wrap'
                }}>
                    <Typography
                        component="a"
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                            `What is ${item.description} in Java? cause and fix`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            fontSize: '14px',
                            fontFamily: "'Google Sans', sans-serif",
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        {item.description}
                    </Typography>
                    <Chip
                        label={item.severity?.toUpperCase() || 'INFO'}
                        size="small"
                        sx={{
                            background: `${color}22`,
                            color: color,
                            fontSize: '10px',
                            fontWeight: 700,
                            height: 18,
                            borderRadius: 1
                        }}
                    />
                    <Chip
                        label={item.category?.toUpperCase() || 'ISSUE'}
                        size="small"
                        sx={{
                            background: isDark
                                ? 'rgba(168,199,250,0.12)'
                                : 'rgba(26,115,232,0.1)',
                            color: isDark ? '#A8C7FA' : '#1A73E8',
                            fontSize: '10px',
                            fontWeight: 600,
                            height: 18,
                            borderRadius: 1
                        }}
                    />
                    {item.line && (
                        <Chip
                            label={`Line ${item.line}`}
                            size="small"
                            sx={{
                                background: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.06)',
                                color: theme.palette.text.secondary,
                                fontSize: '10px',
                                fontFamily: 'JetBrains Mono',
                                height: 18,
                                borderRadius: 1
                            }}
                        />
                    )}
                </Box>
                <Typography sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '12px',
                    lineHeight: 1.5
                }}>
                    💡 {item.suggestion}
                </Typography>
            </CardContent>
        </Card>
    )
}

function BugList({ title, items, color, icon }) {
    if (!items || items.length === 0) return null

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1, mb: 1.5
            }}>
                <Typography sx={{ fontSize: '15px' }}>
                    {icon}
                </Typography>
                <Typography sx={{
                    color: color,
                    fontWeight: 600,
                    fontSize: '13px',
                    fontFamily: "'Google Sans', sans-serif"
                }}>
                    {title}
                </Typography>
                <Box sx={{
                    background: `${color}22`,
                    color: color,
                    borderRadius: 10,
                    px: 1, py: 0.1,
                    fontSize: '11px',
                    fontWeight: 700
                }}>
                    {items.length}
                </Box>
            </Box>
            {items.map((item, i) => (
                <BugCard key={i} item={item} color={color} />
            ))}
        </Box>
    )
}

export default BugList