// src/pages/ReviewDetailPage.jsx
import { useState, useEffect }   from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme }              from '@mui/material/styles'
import { getHistoryById, getHistory } from '../services/api'
import Editor                    from '@monaco-editor/react'
import Box                       from '@mui/material/Box'
import Card                      from '@mui/material/Card'
import CardContent               from '@mui/material/CardContent'
import Typography                from '@mui/material/Typography'
import Chip                      from '@mui/material/Chip'
import CircularProgress          from '@mui/material/CircularProgress'
import IconButton                from '@mui/material/IconButton'
import Button                    from '@mui/material/Button'
import Tooltip                   from '@mui/material/Tooltip'
import Divider                   from '@mui/material/Divider'
import ArrowBackIcon             from '@mui/icons-material/ArrowBack'
import ContentCopyIcon           from '@mui/icons-material/ContentCopy'
import TrendingUpIcon            from '@mui/icons-material/TrendingUp'
import TrendingDownIcon          from '@mui/icons-material/TrendingDown'
import RemoveIcon                from '@mui/icons-material/Remove'
import SecurityOutlinedIcon      from '@mui/icons-material/SecurityOutlined'
import BugReportOutlinedIcon     from '@mui/icons-material/BugReportOutlined'
import SpeedOutlinedIcon         from '@mui/icons-material/SpeedOutlined'
import StyleOutlinedIcon         from '@mui/icons-material/StyleOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import CodeOutlinedIcon          from '@mui/icons-material/CodeOutlined'
import SmartToyOutlinedIcon      from '@mui/icons-material/SmartToyOutlined'
import toast                     from 'react-hot-toast'

function ReviewDetailPage() {
    const { reviewId } = useParams()
    const navigate     = useNavigate()
    const theme        = useTheme()
    const isDark       = theme.palette.mode === 'dark'

    const [review,  setReview]  = useState(null)
    const [prev,    setPrev]    = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { loadReview() }, [reviewId]) // eslint-disable-line react-hooks/exhaustive-deps

    const loadReview = async () => {
        try {
            setLoading(true)
            const data = await getHistoryById(reviewId)
            setReview(data)

            const all = await getHistory()
            const sameFile = all
                .filter(r =>
                    r.filename === data.filename &&
                    r.id < data.id
                )
                .sort((a, b) => b.id - a.id)
            if (sameFile.length > 0) setPrev(sameFile[0])
        } catch (e) {
            console.error(e)
            toast.error('Failed to load review')
        } finally {
            setLoading(false)
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
            day: '2-digit', month: 'long',
            year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
    }

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied!')
    }

    const DiffChip = ({ curr, prev, label }) => {
        if (prev === undefined || prev === null) return null
        const d        = curr - prev
        const isScore  = label === 'Score'
        const improved = isScore ? d > 0 : d < 0
        const neutral  = d === 0
        const color    = neutral
            ? theme.palette.text.secondary
            : improved ? '#81C995' : '#F28B82'

        return (
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                background: neutral
                    ? isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.04)'
                    : improved
                        ? 'rgba(129,201,149,0.12)'
                        : 'rgba(242,139,130,0.12)',
                border: `1px solid ${color}33`,
                borderRadius: 20,
                px: 1.5, py: 0.5
            }}>
                {neutral
                    ? <RemoveIcon sx={{ fontSize: 14, color }} />
                    : improved
                        ? <TrendingUpIcon sx={{ fontSize: 14, color }} />
                        : <TrendingDownIcon sx={{ fontSize: 14, color }} />
                }
                <Typography sx={{
                    color,
                    fontSize: '12px',
                    fontWeight: 600
                }}>
                    {label}: {prev} → {curr}
                    {!neutral && ` (${d > 0 ? '+' : ''}${d})`}
                </Typography>
            </Box>
        )
    }

    const getIssueEmoji = (category, description) => {
        const d = (description || '').toLowerCase()
        const c = (category   || '').toLowerCase()
        if (c === 'security' || d.includes('inject') ||
            d.includes('password'))        return '🔐'
        if (d.includes('null') ||
            d.includes('nullpointer'))     return '💥'
        if (d.includes('leak') ||
            d.includes('resource'))        return '🚰'
        if (d.includes('array') ||
            d.includes('bounds'))          return '📏'
        if (d.includes('catch') ||
            d.includes('exception'))       return '⚠️'
        if (d.includes('magic') ||
            d.includes('number'))          return '🔢'
        if (d.includes('string') ||
            d.includes('concat'))          return '🔗'
        if (c === 'performance')           return '⚡'
        if (c === 'style')                 return '🎨'
        if (c === 'bug')                   return '🐛'
        return '⚠️'
    }

    const getIssueColor = (category, severity) => {
        if (category === 'security')    return '#F28B82'
        if (severity === 'critical')    return '#F28B82'
        if (category === 'bug')         return '#FBC02D'
        if (severity === 'warning')     return '#FBC02D'
        if (category === 'performance') return '#A8C7FA'
        return '#D0BCFF'
    }

    const getGoogleUrl = (description) => {
        const q = encodeURIComponent(
            `What is ${description} in Java? cause and fix`
        )
        return `https://www.google.com/search?q=${q}`
    }

    if (loading) return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 'calc(100vh - 56px)',
            background: theme.palette.background.default
        }}>
            <CircularProgress
                sx={{ color: theme.palette.primary.main }}
            />
        </Box>
    )

    if (!review) return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: 'calc(100vh - 56px)',
            background: theme.palette.background.default,
            gap: 2
        }}>
            <Typography sx={{
                color: theme.palette.text.secondary
            }}>
                Review not found
            </Typography>
            <Button onClick={() => navigate('/history')}>
                Back to History
            </Button>
        </Box>
    )

    const confidence = Math.min(99, review.score + 9)

    // Parse issues from DB
    let issues = []
    const issuesRaw = review.issuesJson || review.issues_json || null
    if (issuesRaw) {
        try { issues = JSON.parse(issuesRaw) }
        catch (e) { console.error('Failed to parse issues:', e) }
    }

    const issueCounters = [
        {
            count: review.securityCount || 0,
            label: 'Security',
            color: '#F28B82',
            bg:    'rgba(242,139,130,0.15)',
            icon:  <SecurityOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: review.bugCount || 0,
            label: 'Bugs',
            color: '#FBC02D',
            bg:    'rgba(251,192,45,0.15)',
            icon:  <BugReportOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: review.performanceCount || 0,
            label: 'Perf',
            color: '#A8C7FA',
            bg:    'rgba(168,199,250,0.15)',
            icon:  <SpeedOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: review.styleCount || 0,
            label: 'Style',
            color: '#D0BCFF',
            bg:    'rgba(208,188,255,0.15)',
            icon:  <StyleOutlinedIcon sx={{ fontSize: 14 }} />
        }
    ]

    return (
        <Box sx={{
            background: theme.palette.background.default,
            minHeight: 'calc(100vh - 56px)',
            p: 3,
            maxWidth: 1200,
            mx: 'auto'
        }}>

            {/* ── Header ── */}
            <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box>
                    {/* Back button */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1, mb: 1.5
                    }}>
                        <IconButton
                            onClick={() => navigate('/history')}
                            size="small"
                            sx={{
                                color: theme.palette.primary.main,
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': {
                                    background: isDark
                                        ? 'rgba(168,199,250,0.1)'
                                        : 'rgba(26,115,232,0.08)'
                                }
                            }}
                        >
                            <ArrowBackIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '13px'
                        }}>
                            Back to History
                        </Typography>
                    </Box>

                    {/* Title */}
                    <Typography sx={{
                        color: theme.palette.text.primary,
                        fontWeight: 700,
                        fontSize: '22px',
                        fontFamily: "'Google Sans', sans-serif",
                        mb: 1
                    }}>
                        📄 {review.filename}
                    </Typography>

                    {/* Meta chips */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'wrap',
                        alignItems: 'center'
                    }}>
                        <Chip
                            label={`REV-${reviewId}`}
                            size="small"
                            sx={{
                                background: isDark
                                    ? 'rgba(168,199,250,0.12)'
                                    : 'rgba(26,115,232,0.1)',
                                color: theme.palette.primary.main,
                                fontFamily: 'JetBrains Mono',
                                fontSize: '11px',
                                fontWeight: 600
                            }}
                        />
                        <Chip
                            icon={<CodeOutlinedIcon
                                sx={{ fontSize: '14px !important' }}
                            />}
                            label={review.language?.toUpperCase()
                                || 'JAVA'}
                            size="small"
                            sx={{
                                background: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.05)',
                                color: theme.palette.text.secondary,
                                fontSize: '11px'
                            }}
                        />
                        <Chip
                            icon={<CalendarTodayOutlinedIcon
                                sx={{ fontSize: '14px !important' }}
                            />}
                            label={formatDate(review.reviewedAt)}
                            size="small"
                            sx={{
                                background: isDark
                                    ? 'rgba(255,255,255,0.06)'
                                    : 'rgba(0,0,0,0.05)',
                                color: theme.palette.text.secondary,
                                fontSize: '11px'
                            }}
                        />
                        <Chip
                            icon={<SmartToyOutlinedIcon
                                sx={{ fontSize: '14px !important' }}
                            />}
                            label={`Confidence ${confidence}%`}
                            size="small"
                            sx={{
                                background: isDark
                                    ? 'rgba(129,201,149,0.12)'
                                    : 'rgba(24,128,56,0.08)',
                                color: '#81C995',
                                fontSize: '11px'
                            }}
                        />
                    </Box>
                </Box>

                {/* Action buttons */}
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'flex-start'
                }}>
                    <Tooltip title="Copy Review Link">
                        <Button
                            startIcon={<ContentCopyIcon />}
                            onClick={handleCopyLink}
                            size="small"
                            sx={{
                                color: theme.palette.text.secondary,
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 2,
                                fontSize: '12px'
                            }}
                        >
                            Copy Link
                        </Button>
                    </Tooltip>
                </Box>
            </Box>

            {/* ── AI Insight Card ── */}
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Typography sx={{
                        color: theme.palette.text.secondary,
                        letterSpacing: 1.5,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        fontFamily: "'Google Sans', sans-serif",
                        mb: 1.5
                    }}>
                        AI Insight
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2.5, mb: 2
                    }}>
                        {/* Score ring */}
                        <Box sx={{
                            position: 'relative',
                            display: 'inline-flex',
                            flexShrink: 0
                        }}>
                            <CircularProgress
                                variant="determinate"
                                value={100} size={72} thickness={3.5}
                                sx={{
                                    color: isDark
                                        ? 'rgba(255,255,255,0.08)'
                                        : 'rgba(0,0,0,0.08)',
                                    position: 'absolute'
                                }}
                            />
                            <CircularProgress
                                variant="determinate"
                                value={review.score}
                                size={72} thickness={3.5}
                                sx={{ color: getScoreColor(review.score) }}
                            />
                            <Box sx={{
                                position: 'absolute', inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column'
                            }}>
                                <Typography sx={{
                                    color: getScoreColor(review.score),
                                    fontWeight: 700, fontSize: '20px',
                                    lineHeight: 1,
                                    fontFamily: "'Google Sans', sans-serif"
                                }}>
                                    {review.score}
                                </Typography>
                                <Typography sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '10px'
                                }}>
                                    /100
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography sx={{
                                color: getScoreColor(review.score),
                                fontWeight: 700, fontSize: '18px',
                                fontFamily: "'Google Sans', sans-serif"
                            }}>
                                {review.score >= 80
                                    ? 'Good Quality'
                                    : review.score >= 50
                                        ? 'Needs Improvement'
                                        : 'Poor Quality'}
                            </Typography>
                            <Typography sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '12px', mt: 0.5
                            }}>
                                Confidence Score: {confidence}%
                            </Typography>
                        </Box>
                    </Box>

                    {/* Issue chips */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {issueCounters.map((item, i) => (
                            <Box key={i} sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                background: item.bg,
                                border: `1px solid ${item.color}33`,
                                borderRadius: 20,
                                px: 1.2, py: 0.4
                            }}>
                                <Box sx={{ color: item.color }}>
                                    {item.icon}
                                </Box>
                                <Typography sx={{
                                    color: item.color,
                                    fontSize: '12px', fontWeight: 600
                                }}>
                                    {item.count} {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* ── Review Evolution ── */}
            {prev && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Typography sx={{
                            color: theme.palette.text.secondary,
                            letterSpacing: 1.5, fontSize: '10px',
                            textTransform: 'uppercase',
                            fontFamily: "'Google Sans', sans-serif",
                            mb: 1.5
                        }}>
                            Review Evolution
                        </Typography>
                        <Typography sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600, fontSize: '15px',
                            fontFamily: "'Google Sans', sans-serif",
                            mb: 2
                        }}>
                            Progress since last review
                        </Typography>

                        <Box sx={{
                            display: 'flex', gap: 1.5, flexWrap: 'wrap'
                        }}>
                            <DiffChip curr={review.score}
                                prev={prev.score} label="Score" />
                            <DiffChip curr={review.securityCount || 0}
                                prev={prev.securityCount || 0}
                                label="Security" />
                            <DiffChip curr={review.bugCount || 0}
                                prev={prev.bugCount || 0} label="Bugs" />
                            <DiffChip curr={review.styleCount || 0}
                                prev={prev.styleCount || 0} label="Style" />
                            <DiffChip curr={review.performanceCount || 0}
                                prev={prev.performanceCount || 0}
                                label="Perf" />
                        </Box>

                        <Divider sx={{
                            my: 2, borderColor: theme.palette.divider
                        }} />

                        {/* Score comparison bar */}
                        <Box sx={{
                            display: 'flex', gap: 2, alignItems: 'center'
                        }}>
                            <Box sx={{
                                textAlign: 'center', p: 1.5,
                                background: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.03)',
                                borderRadius: 2, minWidth: 80
                            }}>
                                <Typography sx={{
                                    color: getScoreColor(prev.score),
                                    fontWeight: 700, fontSize: '22px',
                                    fontFamily: "'Google Sans', sans-serif"
                                }}>
                                    {prev.score}
                                </Typography>
                                <Typography sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '11px'
                                }}>
                                    Previous
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Box sx={{
                                    height: 6,
                                    background: isDark
                                        ? 'rgba(255,255,255,0.08)'
                                        : 'rgba(0,0,0,0.08)',
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <Box sx={{
                                        position: 'absolute', left: 0,
                                        height: '100%',
                                        width: `${prev.score}%`,
                                        background: getScoreColor(prev.score),
                                        borderRadius: 3, opacity: 0.4
                                    }} />
                                    <Box sx={{
                                        position: 'absolute', left: 0,
                                        height: '100%',
                                        width: `${review.score}%`,
                                        background: getScoreColor(review.score),
                                        borderRadius: 3,
                                        transition: 'width 1s ease'
                                    }} />
                                </Box>
                                <Typography sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '11px', textAlign: 'center',
                                    mt: 0.5
                                }}>
                                    {review.score > prev.score
                                        ? '↑ Improved'
                                        : review.score < prev.score
                                            ? '↓ Declined'
                                            : '→ No change'}
                                </Typography>
                            </Box>

                            <Box sx={{
                                textAlign: 'center', p: 1.5,
                                background: isDark
                                    ? 'rgba(255,255,255,0.04)'
                                    : 'rgba(0,0,0,0.03)',
                                borderRadius: 2, minWidth: 80
                            }}>
                                <Typography sx={{
                                    color: getScoreColor(review.score),
                                    fontWeight: 700, fontSize: '22px',
                                    fontFamily: "'Google Sans', sans-serif"
                                }}>
                                    {review.score}
                                </Typography>
                                <Typography sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '11px'
                                }}>
                                    Current
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            )}

           {/* ── Reviewed Code ── */}
{review.code && (
    <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 0 }}>
            <Box sx={{
                px: 2, py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <CodeOutlinedIcon sx={{
                    color: theme.palette.primary.main,
                    fontSize: 18
                }} />
                <Typography sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    fontSize: '14px',
                    fontFamily: "'Google Sans', sans-serif"
                }}>
                    Reviewed Code
                </Typography>
                <Chip
                    label={review.language?.toUpperCase() || 'JAVA'}
                    size="small"
                    sx={{
                        background: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                        color: theme.palette.text.secondary,
                        fontSize: '10px',
                        fontFamily: 'JetBrains Mono'
                    }}
                />

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Copy Button */}
                <Tooltip title="Copy Code">
                    <Button
                        startIcon={<ContentCopyIcon />}
                        size="small"
                        onClick={() => {
                            navigator.clipboard.writeText(review.code)
                            toast.success('Code copied!')
                        }}
                        sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '11px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            py: 0.3
                        }}
                    >
                        Copy
                    </Button>
                </Tooltip>
            </Box>

            <Editor
                height="300px"
                language={review.language || 'java'}
                value={review.code}
                theme={isDark ? 'vs-dark' : 'vs'}
                options={{
                    readOnly: true,
                    fontSize: 13,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    fontFamily: 'JetBrains Mono',
                    padding: { top: 12 }
                }}
            />
        </CardContent>
    </Card>
)}

            {/* ── Issues Found ── */}
            <Card sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Typography sx={{
                        color: theme.palette.text.secondary,
                        letterSpacing: 1.5, fontSize: '10px',
                        textTransform: 'uppercase',
                        fontFamily: "'Google Sans', sans-serif",
                        mb: 2
                    }}>
                        Issues Found
                    </Typography>

                    {issues.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography sx={{
                                fontSize: '32px', mb: 1
                            }}>
                                🎉
                            </Typography>
                            <Typography sx={{
                                color: '#81C995', fontWeight: 600
                            }}>
                                No issues found — clean code!
                            </Typography>
                            {review.summary && (
                                <Typography sx={{
                                    color: theme.palette.text.secondary,
                                    fontSize: '12px', mt: 1
                                }}>
                                    {review.summary}
                                </Typography>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            {Object.values(
                                issues.reduce((groups, issue) => {
                                    const key = issue.description
                                    if (!groups[key]) {
                                        groups[key] = { ...issue, lines: [] }
                                    }
                                    if (issue.line) {
                                        groups[key].lines.push(issue.line)
                                    }
                                    return groups
                                }, {})
                            ).map((issue, idx, arr) => {
                                const emoji = getIssueEmoji(
                                    issue.category, issue.description)
                                const color = getIssueColor(
                                    issue.category, issue.severity)

                                return (
                                    <Box key={idx} sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 1.5,
                                        py: 1.5,
                                        borderBottom: idx < arr.length - 1
                                            ? `1px solid ${theme.palette.divider}`
                                            : 'none'
                                    }}>
                                        {/* Emoji */}
                                        <Typography sx={{
                                            fontSize: '18px',
                                            flexShrink: 0, mt: 0.2
                                        }}>
                                            {emoji}
                                        </Typography>

                                        {/* Content */}
                                        <Box sx={{ flex: 1 }}>
                                            <Box sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                flexWrap: 'wrap',
                                                mb: 0.3
                                            }}>
                                                {/* Clickable title */}
                                                <Typography
                                                    component="a"
                                                    href={getGoogleUrl(
                                                        issue.description
                                                    )}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{
                                                        color: theme.palette
                                                            .primary.main,
                                                        fontWeight: 600,
                                                        fontSize: '13px',
                                                        fontFamily:
                                                            "'Google Sans', sans-serif",
                                                        textDecoration: 'none',
                                                        '&:hover': {
                                                            textDecoration: 'underline'
                                                        }
                                                    }}
                                                >
                                                    {issue.description}
                                                </Typography>

                                                {/* Severity chip */}
                                                <Chip
                                                    label={
                                                        issue.severity?.toUpperCase()
                                                        || 'INFO'
                                                    }
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
                                            </Box>

                                            {/* All line numbers grouped */}
                                            {issue.lines.length > 0 && (
                                                <Box sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 0.5,
                                                    flexWrap: 'wrap',
                                                    mb: 0.5
                                                }}>
                                                    <Typography sx={{
                                                        color: theme.palette
                                                            .text.secondary,
                                                        fontSize: '11px'
                                                    }}>
                                                        {issue.lines.length > 1
                                                            ? 'Lines:'
                                                            : 'Line:'}
                                                    </Typography>
                                                    {issue.lines.map((line, li) => (
                                                        <Chip
                                                            key={li}
                                                            label={line}
                                                            size="small"
                                                            sx={{
                                                                background: isDark
                                                                    ? 'rgba(255,255,255,0.06)'
                                                                    : 'rgba(0,0,0,0.06)',
                                                                color: theme.palette
                                                                    .text.secondary,
                                                                fontSize: '10px',
                                                                fontFamily: 'JetBrains Mono',
                                                                height: 18
                                                            }}
                                                        />
                                                    ))}
                                                    {issue.lines.length > 1 && (
                                                        <Typography sx={{
                                                            color: theme.palette
                                                                .text.secondary,
                                                            fontSize: '10px',
                                                            fontStyle: 'italic'
                                                        }}>
                                                            ({issue.lines.length} occurrences)
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}

                                            {/* Suggestion */}
                                            <Typography sx={{
                                                color: theme.palette
                                                    .text.secondary,
                                                fontSize: '12px',
                                                lineHeight: 1.5
                                            }}>
                                                💡 {issue.suggestion}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )
                            })}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ── AI Review Summary ── */}
            {review.aiReview && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1, mb: 2
                        }}>
                            <SmartToyOutlinedIcon sx={{
                                color: theme.palette.primary.main,
                                fontSize: 18
                            }} />
                            <Typography sx={{
                                color: theme.palette.text.primary,
                                fontWeight: 600, fontSize: '15px',
                                fontFamily: "'Google Sans', sans-serif"
                            }}>
                                AI Review
                            </Typography>
                        </Box>
                        <Typography
                            component="pre"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '13px', lineHeight: 1.8,
                                whiteSpace: 'pre-wrap',
                                fontFamily: "'Google Sans', sans-serif"
                            }}
                        >
                            {review.aiReview
                                .replace(/```java/g, '')
                                .replace(/```python/g, '')
                                .replace(/```javascript/g, '')
                                .replace(/```/g, '')
                                .trim()
                            }
                        </Typography>
                    </CardContent>
                </Card>
            )}

        </Box>
    )
}

export default ReviewDetailPage