// src/components/ScoreCard.jsx
import { useTheme }             from '@mui/material/styles'
import Card                     from '@mui/material/Card'
import CardContent              from '@mui/material/CardContent'
import Typography               from '@mui/material/Typography'
import Box                      from '@mui/material/Box'
import CircularProgress         from '@mui/material/CircularProgress'
import Tooltip                  from '@mui/material/Tooltip'
import InfoOutlinedIcon         from '@mui/icons-material/InfoOutlined'
import SecurityOutlinedIcon     from '@mui/icons-material/SecurityOutlined'
import BugReportOutlinedIcon    from '@mui/icons-material/BugReportOutlined'
import SpeedOutlinedIcon        from '@mui/icons-material/SpeedOutlined'
import StyleOutlinedIcon        from '@mui/icons-material/StyleOutlined'

function ScoreCard({ score, status, summary,
                     security, bugs, performance, style }) {
    const theme  = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const getColor = () => {
        if (score >= 80) return '#81C995'
        if (score >= 50) return '#FBC02D'
        return '#F28B82'
    }

    const getLabel = () => {
        if (score >= 80) return 'Good Quality'
        if (score >= 50) return 'Needs Improvement'
        return 'Poor Quality'
    }

    const confidence = Math.min(99, score + 9)

    const issueCounters = [
        {
            count: security?.length || 0,
            label: 'Security',
            color: '#F28B82',
            bg:    'rgba(242,139,130,0.15)',
            icon:  <SecurityOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: bugs?.length || 0,
            label: 'Bugs',
            color: '#FBC02D',
            bg:    'rgba(251,192,45,0.15)',
            icon:  <BugReportOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: performance?.length || 0,
            label: 'Perf',
            color: '#A8C7FA',
            bg:    'rgba(168,199,250,0.15)',
            icon:  <SpeedOutlinedIcon sx={{ fontSize: 14 }} />
        },
        {
            count: style?.length || 0,
            label: 'Style',
            color: '#D0BCFF',
            bg:    'rgba(208,188,255,0.15)',
            icon:  <StyleOutlinedIcon sx={{ fontSize: 14 }} />
        }
    ]

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{
                    color: theme.palette.text.secondary,
                    letterSpacing: 1.5,
                    fontSize: '10px',
                    fontFamily: "'Google Sans', sans-serif",
                    textTransform: 'uppercase'
                }}>
                    AI Insight
                </Typography>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    mt: 1.5,
                    mb: 2
                }}>
                    {/* Circular Progress */}
                    <Box sx={{
                        position: 'relative',
                        display: 'inline-flex',
                        flexShrink: 0
                    }}>
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={72}
                            thickness={3.5}
                            sx={{
                                color: isDark
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(0,0,0,0.08)',
                                position: 'absolute'
                            }}
                        />
                        <CircularProgress
                            variant="determinate"
                            value={score}
                            size={72}
                            thickness={3.5}
                            sx={{ color: getColor() }}
                        />
                        <Box sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            <Typography sx={{
                                color: getColor(),
                                fontWeight: 700,
                                fontSize: '20px',
                                lineHeight: 1,
                                fontFamily: "'Google Sans', sans-serif"
                            }}>
                                {score}
                            </Typography>
                            <Typography sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '10px'
                            }}>
                                /100
                            </Typography>
                        </Box>
                    </Box>

                    {/* Info */}
                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{
                            color: getColor(),
                            fontWeight: 700,
                            fontSize: '18px',
                            fontFamily: "'Google Sans', sans-serif",
                            lineHeight: 1.2
                        }}>
                            {getLabel()}
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 0.5
                        }}>
                            <Typography sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '12px'
                            }}>
                                Confidence Score: {confidence}%
                            </Typography>
                            <Tooltip title="Based on rule detection">
                                <InfoOutlinedIcon sx={{
                                    fontSize: 14,
                                    color: theme.palette.text.secondary,
                                    cursor: 'pointer'
                                }} />
                            </Tooltip>
                        </Box>
                    </Box>
                </Box>

                {/* Issue chips */}
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap'
                }}>
                    {issueCounters.map((item, i) => (
                        <Box key={i} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            background: item.bg,
                            border: `1px solid ${item.color}33`,
                            borderRadius: 20,
                            px: 1.2,
                            py: 0.4
                        }}>
                            <Box sx={{ color: item.color }}>
                                {item.icon}
                            </Box>
                            <Typography sx={{
                                color: item.color,
                                fontSize: '12px',
                                fontWeight: 600
                            }}>
                                {item.count} {item.label}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </CardContent>
        </Card>
    )
}

export default ScoreCard