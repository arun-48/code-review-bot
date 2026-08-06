// src/components/ReviewResults.jsx
import { useState }     from 'react'
import { useTheme }     from '@mui/material/styles'
import Box              from '@mui/material/Box'
import Card             from '@mui/material/Card'
import CardContent      from '@mui/material/CardContent'
import Typography       from '@mui/material/Typography'
import Tabs             from '@mui/material/Tabs'
import Tab              from '@mui/material/Tab'
import Chip             from '@mui/material/Chip'
import ScoreCard        from './ScoreCard'
import BugList          from './BugList'

function TabPanel({ value, index, children }) {
    return value === index
        ? <Box sx={{ pt: 2 }}>{children}</Box>
        : null
}

function ReviewResults({ result }) {
    const [tabValue, setTabValue] = useState(0)
    const theme  = useTheme()
    const isDark = theme.palette.mode === 'dark'

    if (!result) return null

    const aiReview    = result.aiReview   || result.ai_review   || ''
    const bugs        = result.bugs        || []
    const security    = result.security    || []
    const style       = result.style       || []
    const performance = result.performance || []
    const score       = result.score       || 0
    const status      = result.status      || ''
    const summary     = result.summary     || ''

    const allIssues = [...security, ...bugs, ...performance, ...style]

    const cleanCode = (code) => {
        if (!code) return ''
        return code
            .split('\n')
            .filter(line => !line.trim().startsWith('//'))
            .join('\n')
            .trim()
    }

    const codeBoxStyle = (type) => ({
        background: isDark
            ? type === 'bug'
                ? 'rgba(242,139,130,0.08)'
                : 'rgba(129,201,149,0.08)'
            : type === 'bug'
                ? 'rgba(217,48,37,0.06)'
                : 'rgba(24,128,56,0.06)',
        color: isDark
            ? type === 'bug' ? '#F28B82' : '#81C995'
            : type === 'bug' ? '#D93025' : '#188038',
        p: 1.5,
        borderRadius: 1.5,
        fontSize: '11px',
        fontFamily: 'JetBrains Mono',
        overflow: 'auto',
        border: isDark
            ? type === 'bug'
                ? '1px solid rgba(242,139,130,0.2)'
                : '1px solid rgba(129,201,149,0.2)'
            : type === 'bug'
                ? '1px solid rgba(217,48,37,0.15)'
                : '1px solid rgba(24,128,56,0.15)',
        margin: 0,
        minHeight: 60,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
    })

    const impactMap = {
        'SQL Injection vulnerability detected':
            'Attackers can bypass authentication, steal all database records, or delete your entire database with a single crafted input.',
        'Hardcoded password detected':
            'Anyone with source code access can steal database credentials. Exposes your entire database to unauthorized access.',
        'Potential NullPointerException — variable assigned null':
            'Application crashes at runtime when this method is called, creating a poor user experience and potential data loss.',
        'Potential NullPointerException — chained method call':
            'Application crashes unexpectedly if any object in the chain returns null, which is difficult to debug.',
        'Direct array access — possible ArrayIndexOutOfBoundsException':
            'Runtime crash when the array has fewer elements than expected, causing unexpected application termination.',
        'Potential division by zero':
            'Application crashes with ArithmeticException when divisor is zero, halting all execution.',
        'Empty catch block silently swallows exception':
            'Errors are hidden completely, making bugs nearly impossible to diagnose. Silent failures corrupt data undetected.',
        'Resource may not be closed — potential resource leak':
            'File handles or connections are never released. Over time this exhausts system resources and crashes the server.',
        'Potential infinite loop — no break or return found':
            'CPU usage hits 100%, application freezes, and the only recovery is a server restart.',
        'String comparison with == instead of .equals()':
            'Comparisons return false even for identical strings, causing authentication bypasses or logic errors.',
        'String concatenation with += is inefficient in loops':
            'Creates a new String object on every iteration, causing O(n²) memory allocation and severe slowdowns.',
        'Calling size() on every loop iteration is inefficient':
            'Repeated method calls add unnecessary overhead. For large collections this compounds performance degradation.',
        'Nested loops detected — O(n²) complexity':
            'Processing time grows quadratically. For 1000 items → 1,000,000 operations. Application becomes unusable at scale.',
        'Weak hashing algorithm detected (MD5/SHA1)':
            'MD5/SHA1 are cryptographically broken. Passwords can be cracked in seconds using rainbow tables.',
        'printStackTrace() exposes internal stack trace':
            'Reveals internal class structure and file paths to attackers, aiding targeted attacks on your system.',
    }

    return (
        <Box sx={{ p: 2 }}>

            <ScoreCard
                score={score}
                status={status}
                summary={summary}
                security={security}
                bugs={bugs}
                performance={performance}
                style={style}
            />

            {allIssues.length > 0 && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            fontSize: '15px',
                            mb: 2,
                            fontFamily: "'Google Sans', sans-serif"
                        }}>
                            Issues Found
                        </Typography>
                        <BugList title="Security Issues"
                            items={security} color="#F28B82" icon="🔐" />
                        <BugList title="Bugs"
                            items={bugs} color="#FBC02D" icon="🐛" />
                        <BugList title="Performance"
                            items={performance} color="#A8C7FA" icon="⚡" />
                        <BugList title="Style"
                            items={style} color="#D0BCFF" icon="🎨" />
                    </CardContent>
                </Card>
            )}

            {(aiReview || allIssues.length > 0) && (
                <Card sx={{ mb: 2 }}>
                    <CardContent sx={{ p: 0 }}>
                        <Tabs
                            value={tabValue}
                            onChange={(e, v) => setTabValue(v)}
                            sx={{
                                px: 2,
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                '& .MuiTabs-indicator': {
                                    backgroundColor: theme.palette.primary.main,
                                    height: 2,
                                    borderRadius: 1
                                }
                            }}
                        >
                            {['Summary', 'Impact', 'Fix'].map((label, i) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    sx={{
                                        color: tabValue === i
                                            ? theme.palette.primary.main
                                            : theme.palette.text.secondary,
                                        fontSize: '13px'
                                    }}
                                />
                            ))}
                        </Tabs>

                        <Box sx={{ p: 2 }}>

                            {/* Tab 0 — Summary */}
                            <TabPanel value={tabValue} index={0}>
                                <Box>
                                    <Box sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1, mb: 2
                                    }}>
                                        <Typography sx={{ fontSize: '15px' }}>
                                            {score >= 80 ? '✅' : score >= 50 ? '⚠️' : '❌'}
                                        </Typography>
                                        <Typography sx={{
                                            color: score >= 80
                                                ? '#81C995'
                                                : score >= 50
                                                    ? '#FBC02D'
                                                    : '#F28B82',
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            fontFamily: "'Google Sans', sans-serif"
                                        }}>
                                            {[...security, ...bugs].length === 0
                                                ? 'No critical issues detected'
                                                : `${[...security, ...bugs].length} critical issue${[...security, ...bugs].length > 1 ? 's' : ''} detected`
                                            }
                                        </Typography>
                                    </Box>

                                    {[...security, ...bugs].length > 0 && (
                                        <Box sx={{
                                            background: isDark
                                                ? 'rgba(255,255,255,0.03)'
                                                : 'rgba(0,0,0,0.02)',
                                            borderRadius: 2,
                                            p: 2
                                        }}>
                                            <Typography sx={{
                                                color: theme.palette.text.secondary,
                                                fontSize: '12px',
                                                mb: 1.5,
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                letterSpacing: 1
                                            }}>
                                                Critical Issues Detected:
                                            </Typography>
                                            {Object.values(
                                                [...security, ...bugs].reduce((g, issue) => {
                                                    const key = issue.description
                                                    if (!g[key]) g[key] = { ...issue, lines: [] }
                                                    if (issue.line) g[key].lines.push(issue.line)
                                                    return g
                                                }, {})
                                            ).map((issue, idx) => {
                                                const emoji = issue.category === 'security'
                                                    ? '🔐' : '🐛'

                                                return (
                                                    <Box key={idx} sx={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: 1, mb: 1
                                                    }}>
                                                        <Typography sx={{
                                                            fontSize: '13px',
                                                            flexShrink: 0
                                                        }}>•</Typography>
                                                        <Box sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.8,
                                                            flexWrap: 'wrap'
                                                        }}>
                                                            <Typography sx={{ fontSize: '12px' }}>
                                                                {emoji}
                                                            </Typography>
                                                            <Typography
                                                                component="a"
                                                                href={`https://www.google.com/search?q=${encodeURIComponent(
                                                                    `What is ${issue.description} in Java? cause and fix`
                                                                )}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                sx={{
                                                                    color: theme.palette.primary.main,
                                                                    fontSize: '13px',
                                                                    fontWeight: 600,
                                                                    fontFamily: "'Google Sans', sans-serif",
                                                                    textDecoration: 'none',
                                                                    '&:hover': { textDecoration: 'underline' }
                                                                }}
                                                            >
                                                                {issue.description}
                                                            </Typography>
                                                            {issue.lines.length > 0 && (
                                                                <Typography sx={{
                                                                    color: theme.palette.text.secondary,
                                                                    fontSize: '11px',
                                                                    fontFamily: 'JetBrains Mono'
                                                                }}>
                                                                    (Line{issue.lines.length > 1 ? 's' : ''}: {issue.lines.join(', ')})
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                )
                                            })}
                                        </Box>
                                    )}
                                </Box>
                            </TabPanel>

                            {/* Tab 1 — Impact */}
                            <TabPanel value={tabValue} index={1}>
                                {allIssues.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <Typography sx={{
                                            color: '#81C995', fontWeight: 600
                                        }}>
                                            🎉 No issues — no impact!
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        {Object.values(
                                            allIssues.reduce((g, issue) => {
                                                const key = issue.description
                                                if (!g[key]) g[key] = { ...issue }
                                                return g
                                            }, {})
                                        ).map((issue, idx, arr) => {
                                            const color = issue.severity === 'critical'
                                                ? '#F28B82'
                                                : issue.severity === 'warning'
                                                    ? '#FBC02D' : '#D0BCFF'
                                            const impact = impactMap[issue.description]
                                                || `This issue can cause ${issue.severity === 'critical' ? 'critical failures' : 'unexpected behavior'} in production.`

                                            return (
                                                <Box key={idx} sx={{
                                                    py: 1.5,
                                                    borderBottom: idx < arr.length - 1
                                                        ? `1px solid ${theme.palette.divider}`
                                                        : 'none'
                                                }}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1, mb: 0.5
                                                    }}>
                                                        <Box sx={{
                                                            width: 8, height: 8,
                                                            borderRadius: '50%',
                                                            background: color,
                                                            flexShrink: 0
                                                        }} />
                                                        <Typography sx={{
                                                            color: color,
                                                            fontWeight: 700,
                                                            fontSize: '13px',
                                                            fontFamily: "'Google Sans', sans-serif"
                                                        }}>
                                                            {issue.description}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        gap: 1, ml: 2.5
                                                    }}>
                                                        <Typography sx={{
                                                            color: theme.palette.text.secondary,
                                                            fontSize: '13px'
                                                        }}>→</Typography>
                                                        <Typography sx={{
                                                            color: theme.palette.text.secondary,
                                                            fontSize: '13px',
                                                            lineHeight: 1.6
                                                        }}>
                                                            {impact}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                )}
                            </TabPanel>

                            {/* Tab 2 — Fix */}
                            <TabPanel value={tabValue} index={2}>
                                {allIssues.length > 0 ? (
                                    <Box sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 3
                                    }}>
                                        {allIssues.map((issue, idx) => {
                                            const origCode = issue.original_code || issue.originalCode || null
                                            const fixCode  = issue.fixed_code    || issue.fixedCode    || null
                                            return (
                                                <Box key={idx}>
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1, mb: 1.5
                                                    }}>
                                                        <Typography sx={{
                                                            color: theme.palette.text.primary,
                                                            fontWeight: 600,
                                                            fontSize: '13px',
                                                            fontFamily: "'Google Sans', sans-serif"
                                                        }}>
                                                            {issue.description}
                                                        </Typography>
                                                        {issue.line && (
                                                            <Chip
                                                                label={`Line ${issue.line}`}
                                                                size="small"
                                                                sx={{
                                                                    background: isDark
                                                                        ? 'rgba(255,255,255,0.06)'
                                                                        : 'rgba(0,0,0,0.06)',
                                                                    color: theme.palette.text.secondary,
                                                                    fontSize: '10px',
                                                                    fontFamily: 'JetBrains Mono',
                                                                    height: 18
                                                                }}
                                                            />
                                                        )}
                                                    </Box>
                                                    <Box sx={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '1fr 1fr',
                                                        gap: 1.5
                                                    }}>
                                                        <Box>
                                                            <Typography sx={{
                                                                color: isDark ? '#F28B82' : '#D93025',
                                                                fontSize: '11px',
                                                                fontWeight: 600, mb: 0.5
                                                            }}>
                                                                ❌ Current Code
                                                            </Typography>
                                                            <Box component="pre" sx={codeBoxStyle('bug')}>
                                                                {cleanCode(origCode) || 'No original code'}
                                                            </Box>
                                                        </Box>
                                                        <Box>
                                                            <Typography sx={{
                                                                color: isDark ? '#81C995' : '#188038',
                                                                fontSize: '11px',
                                                                fontWeight: 600, mb: 0.5
                                                            }}>
                                                                ✅ Suggested Fix
                                                            </Typography>
                                                            <Box component="pre" sx={codeBoxStyle('fix')}>
                                                                {cleanCode(fixCode) || 'No fix available'}
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    {idx < allIssues.length - 1 && (
                                                        <Box sx={{
                                                            borderBottom: `1px solid ${theme.palette.divider}`,
                                                            mt: 2
                                                        }} />
                                                    )}
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                ) : (
                                    <Typography sx={{
                                        color: theme.palette.text.secondary
                                    }}>
                                        No fixes available
                                    </Typography>
                                )}
                            </TabPanel>

                        </Box>
                    </CardContent>
                </Card>
            )}

            {score === 100 && (
                <Card sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h5">🎉</Typography>
                    <Typography sx={{
                        color: '#81C995',
                        fontWeight: 600, mt: 1
                    }}>
                        Perfect code! No issues found.
                    </Typography>
                </Card>
            )}
        </Box>
    )
}

export default ReviewResults