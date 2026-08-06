// src/pages/HistoryPage.jsx
import { useState, useEffect }  from 'react'
import { useTheme }             from '@mui/material/styles'
import { useNavigate }          from 'react-router-dom'
import { getHistory, clearHistory } from '../services/api'
import Box              from '@mui/material/Box'
import Card             from '@mui/material/Card'
import CardContent      from '@mui/material/CardContent'
import Typography       from '@mui/material/Typography'
import Chip             from '@mui/material/Chip'
import Grid             from '@mui/material/Grid'
import Button           from '@mui/material/Button'
import Dialog           from '@mui/material/Dialog'
import DialogTitle      from '@mui/material/DialogTitle'
import DialogContent    from '@mui/material/DialogContent'
import DialogActions    from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import InputBase        from '@mui/material/InputBase'
import SearchIcon            from '@mui/icons-material/Search'
import HistoryOutlinedIcon   from '@mui/icons-material/HistoryOutlined'
import TrendingUpIcon        from '@mui/icons-material/TrendingUp'
import SecurityOutlinedIcon  from '@mui/icons-material/SecurityOutlined'
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined'
import DeleteOutlineIcon     from '@mui/icons-material/DeleteOutline'
import toast from 'react-hot-toast'

function HistoryPage() {
    const navigate = useNavigate()
    const theme    = useTheme()
    const isDark   = theme.palette.mode === 'dark'

    const [history,     setHistory]     = useState([])
    const [loading,     setLoading]     = useState(true)
    const [search,      setSearch]      = useState('')
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [clearing,    setClearing]    = useState(false)

    useEffect(() => { loadHistory() }, [])

    const loadHistory = async () => {
        try {
            const data = await getHistory()
            setHistory(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleClearAll = async () => {
        try {
            setClearing(true)
            await clearHistory()
            setHistory([])
            setConfirmOpen(false)
            toast.success('All history cleared!')
        } catch (e) {
            console.error(e)
            toast.error('Failed to clear history')
        } finally {
            setClearing(false)
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return '#81C995'
        if (score >= 50) return '#FBC02D'
        return '#F28B82'
    }

    const formatDate = (d) => {
        if (!d) return 'Just now'
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const filtered = history.filter(h =>
        h.filename?.toLowerCase().includes(search.toLowerCase())
    )

    const avgScore = history.length
        ? Math.round(
            history.reduce((a, b) => a + b.score, 0) / history.length
          )
        : 0

    const totalSecurity = history.reduce(
        (a, b) => a + (b.securityCount || b.security_count || 0), 0)
    const totalBugs = history.reduce(
        (a, b) => a + (b.bugCount || b.bug_count || 0), 0)

    if (loading) return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 56px)',
            background: theme.palette.background.default
        }}>
            <CircularProgress sx={{ color: theme.palette.primary.main }} />
        </Box>
    )

    return (
        <Box sx={{
            background: theme.palette.background.default,
            minHeight: 'calc(100vh - 56px)',
            p: 3
        }}>

            {/* ── Header ── */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                {/* Left — title */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}>
                    <HistoryOutlinedIcon sx={{
                        color: theme.palette.primary.main,
                        fontSize: 24
                    }} />
                    <Typography sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: '20px',
                        fontFamily: "'Google Sans', sans-serif"
                    }}>
                        Review History
                    </Typography>
                    <Chip
                        label={history.length}
                        size="small"
                        sx={{
                            background: isDark
                                ? 'rgba(168,199,250,0.12)'
                                : 'rgba(26,115,232,0.1)',
                            color: theme.palette.primary.main,
                            fontWeight: 700
                        }}
                    />
                </Box>

                {/* Right — Search + Clear All */}
                <Box sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center'
                }}>
                    {/* Search */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        background: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 28,
                        px: 2, height: 40, width: 240
                    }}>
                        <SearchIcon sx={{
                            color: theme.palette.text.secondary,
                            fontSize: 18, mr: 1
                        }} />
                        <InputBase
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search reviews..."
                            sx={{
                                color: theme.palette.text.primary,
                                fontSize: '13px',
                                fontFamily: "'Google Sans', sans-serif"
                            }}
                        />
                    </Box>

                    {/* Clear All */}
                    {history.length > 0 && (
                        <Button
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => setConfirmOpen(true)}
                            size="small"
                            sx={{
                                color: '#F28B82',
                                border: '1px solid rgba(242,139,130,0.3)',
                                borderRadius: 2,
                                fontSize: '12px',
                                fontFamily: "'Google Sans', sans-serif",
                                px: 1.5,
                                '&:hover': {
                                    background: 'rgba(242,139,130,0.08)',
                                    border: '1px solid rgba(242,139,130,0.6)'
                                }
                            }}
                        >
                            Clear All
                        </Button>
                    )}
                </Box>
            </Box>

            {/* ── Confirm Dialog ── */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                PaperProps={{
                    sx: {
                        background: theme.palette.background.paper,
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        minWidth: 320
                    }
                }}
            >
                <DialogTitle sx={{
                    color: theme.palette.text.primary,
                    fontFamily: "'Google Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '16px',
                    pb: 1
                }}>
                    🗑️ Clear All History?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '13px',
                        lineHeight: 1.6
                    }}>
                        This will permanently delete all{' '}
                        <strong style={{ color: '#F28B82' }}>
                            {history.length} review{history.length > 1 ? 's' : ''}
                        </strong>{' '}
                        from the database. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2, gap: 1 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        size="small"
                        sx={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            fontSize: '12px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClearAll}
                        disabled={clearing}
                        size="small"
                        sx={{
                            background: 'rgba(242,139,130,0.15)',
                            color: '#F28B82',
                            border: '1px solid rgba(242,139,130,0.3)',
                            borderRadius: 2,
                            fontSize: '12px',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'rgba(242,139,130,0.25)'
                            }
                        }}
                    >
                        {clearing ? 'Clearing...' : 'Yes, Clear All'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Analytics ── */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                    {
                        label: 'Total Reviews',
                        value: history.length,
                        icon: <HistoryOutlinedIcon />,
                        color: theme.palette.primary.main
                    },
                    {
                        label: 'Average Score',
                        value: `${avgScore}/100`,
                        icon: <TrendingUpIcon />,
                        color: '#81C995'
                    },
                    {
                        label: 'Security Issues',
                        value: totalSecurity,
                        icon: <SecurityOutlinedIcon />,
                        color: '#F28B82'
                    },
                    {
                        label: 'Bugs Found',
                        value: totalBugs,
                        icon: <BugReportOutlinedIcon />,
                        color: '#FBC02D'
                    }
                ].map((item, i) => (
                    <Grid item xs={6} md={3} key={i}>
                        <Card>
                            <CardContent sx={{ p: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1, mb: 1
                                }}>
                                    <Box sx={{ color: item.color }}>
                                        {item.icon}
                                    </Box>
                                    <Typography sx={{
                                        color: theme.palette.text.secondary,
                                        fontSize: '12px'
                                    }}>
                                        {item.label}
                                    </Typography>
                                </Box>
                                <Typography sx={{
                                    color: item.color,
                                    fontWeight: 700,
                                    fontSize: '24px',
                                    fontFamily: "'Google Sans', sans-serif"
                                }}>
                                    {item.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* ── History Cards ── */}
            {filtered.length === 0 ? (
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    color: theme.palette.text.secondary
                }}>
                    <HistoryOutlinedIcon sx={{
                        fontSize: 56, mb: 2, opacity: 0.3
                    }} />
                    <Typography>No reviews yet</Typography>
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {filtered.map(item => (
                        <Grid item xs={12} sm={6} md={4} lg={3}
                            key={item.id}>
                            <Card
                                onClick={() => navigate(`/reviews/${item.id}`)}
                                sx={{
                                    height: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: isDark
                                            ? 'rgba(168,199,250,0.3)'
                                            : 'rgba(26,115,232,0.3)'
                                    }
                                }}
                            >
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 1.5
                                    }}>
                                        <Typography sx={{
                                            color: theme.palette.primary.main,
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            fontFamily: 'JetBrains Mono'
                                        }}>
                                            📄 {item.filename}
                                        </Typography>
                                        <Typography sx={{
                                            color: getScoreColor(item.score),
                                            fontWeight: 700,
                                            fontSize: '18px',
                                            fontFamily: "'Google Sans', sans-serif"
                                        }}>
                                            {item.score}
                                        </Typography>
                                    </Box>

                                    {/* Score bar */}
                                    <Box sx={{
                                        height: 3,
                                        background: isDark
                                            ? 'rgba(255,255,255,0.08)'
                                            : 'rgba(0,0,0,0.08)',
                                        borderRadius: 2,
                                        mb: 1.5,
                                        overflow: 'hidden'
                                    }}>
                                        <Box sx={{
                                            height: '100%',
                                            width: `${item.score}%`,
                                            background: getScoreColor(item.score),
                                            borderRadius: 2,
                                            transition: 'width 1s ease'
                                        }} />
                                    </Box>

                                    {/* Chips */}
                                    <Box sx={{
                                        display: 'flex',
                                        gap: 0.5,
                                        flexWrap: 'wrap',
                                        mb: 1.5
                                    }}>
                                        {(item.securityCount || item.security_count || 0) > 0 && (
                                            <Chip
                                                label={`🔐 ${item.securityCount || item.security_count}`}
                                                size="small"
                                                sx={{
                                                    background: 'rgba(242,139,130,0.12)',
                                                    color: '#F28B82',
                                                    fontSize: '10px',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                        {(item.bugCount || item.bug_count || 0) > 0 && (
                                            <Chip
                                                label={`🐛 ${item.bugCount || item.bug_count}`}
                                                size="small"
                                                sx={{
                                                    background: 'rgba(251,192,45,0.12)',
                                                    color: '#FBC02D',
                                                    fontSize: '10px',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                        {(item.securityCount || item.security_count || 0) === 0 &&
                                         (item.bugCount || item.bug_count || 0) === 0 && (
                                            <Chip
                                                label="✅ Clean"
                                                size="small"
                                                sx={{
                                                    background: 'rgba(129,201,149,0.12)',
                                                    color: '#81C995',
                                                    fontSize: '10px',
                                                    height: 20
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Typography sx={{
                                        color: isDark
                                            ? 'rgba(255,255,255,0.2)'
                                            : 'rgba(0,0,0,0.3)',
                                        fontSize: '11px'
                                    }}>
                                        🕐 {formatDate(item.reviewedAt)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

        </Box>
    )
}

export default HistoryPage