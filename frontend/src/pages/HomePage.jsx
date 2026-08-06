// src/pages/HomePage.jsx
import { useState }        from 'react'
import { useTheme }        from '@mui/material/styles'
import Editor              from '@monaco-editor/react'
import ReviewResults       from '../components/ReviewResults'
import { reviewCode, detectLanguage } from '../services/api'
import toast               from 'react-hot-toast'
import Box                 from '@mui/material/Box'
import Button              from '@mui/material/Button'
import Typography          from '@mui/material/Typography'
import CircularProgress    from '@mui/material/CircularProgress'
import Select              from '@mui/material/Select'
import MenuItem            from '@mui/material/MenuItem'
import InputBase           from '@mui/material/InputBase'
import SearchIcon          from '@mui/icons-material/Search'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'

const LANGUAGE_EXTENSIONS = {
    java      : 'Main.java',
    python    : 'main.py',
    javascript: 'main.js',
    cpp       : 'main.cpp'
}

const LANG_NAMES = {
    java      : 'Java',
    python    : 'Python',
    javascript: 'JavaScript',
    cpp       : 'C++',
    ruby      : 'Ruby',
    go        : 'Go',
    rust      : 'Rust',
    kotlin    : 'Kotlin',
    php       : 'PHP',
    csharp    : 'C#'
}

const SUPPORTED = Object.keys(LANGUAGE_EXTENSIONS)

function HomePage() {
    const [code,     setCode]     = useState('')
    const [language, setLanguage] = useState('java')
    const [filename, setFilename] = useState('Main.java')
    const [result,   setResult]   = useState(null)
    const [loading,  setLoading]  = useState(false)

    const theme  = useTheme()
    const isDark = theme.palette.mode === 'dark'

    const handleReview = async () => {
        if (!code.trim()) {
            toast.error('Please enter some code!')
            return
        }

        try {
            let detectedLang = 'unknown'
            let confident    = false

            try {
                toast.loading('Detecting language...', { id: 'detect' })
                const detection = await detectLanguage(code)

                if (typeof detection === 'string') {
                    detectedLang = detection
                    confident    = detection !== 'unknown'
                } else {
                    detectedLang = detection.language  || 'unknown'
                    confident    = detection.confident ?? detectedLang !== 'unknown'
                }
                toast.dismiss('detect')
            } catch {
                toast.dismiss('detect')
            }

            if (detectedLang && detectedLang !== 'unknown') {
                if (detectedLang !== language && SUPPORTED.includes(detectedLang)) {
                    toast(
                        `⚠️ This looks like ${LANG_NAMES[detectedLang]} but ${LANG_NAMES[language]} is selected. Please switch language.`,
                        {
                            duration: 5000,
                            icon: '⚠️',
                            style: {
                                background: isDark ? '#1E1F20' : '#FFFFFF',
                                color: isDark ? '#FBC02D' : '#EA8600',
                                border: '1px solid #FBC02D44',
                                fontFamily: "'Google Sans', sans-serif",
                                fontSize: '13px',
                                maxWidth: '440px'
                            }
                        }
                    )
                    return
                }

                if (!SUPPORTED.includes(detectedLang)) {
                    toast(
                        `🚫 ${LANG_NAMES[detectedLang] || detectedLang} is not supported. Supported: Java, Python, JavaScript, C++.`,
                        {
                            duration: 5000,
                            icon: '🚫',
                            style: {
                                background: isDark ? '#1E1F20' : '#FFFFFF',
                                color: isDark ? '#F28B82' : '#D93025',
                                border: '1px solid #F28B8244',
                                fontFamily: "'Google Sans', sans-serif",
                                fontSize: '13px',
                                maxWidth: '440px'
                            }
                        }
                    )
                    return
                }
            }

            setLoading(true)
            setResult(null)
            toast.loading('Analyzing code...', { id: 'review' })
            const data = await reviewCode(code, language, filename)
            setResult(data)
            toast.success('Review complete!', { id: 'review' })

        } catch (err) {
            console.error('Review failed:', err)
            toast.error('Failed! Check servers.', { id: 'review' })
        } finally {
            setLoading(false)
            toast.dismiss('detect')
        }
    }

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            height: 'calc(100vh - 56px)',
            background: theme.palette.background.default
        }}>
            {/* LEFT */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRight: `1px solid ${theme.palette.divider}`
            }}>
                {/* Toolbar */}
                <Box sx={{
                    background: isDark ? '#1A1D21' : '#FFFFFF',
                    px: 2, py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Box sx={{
                        background: isDark ? '#242628' : '#F1F3F4',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1.5,
                        px: 1.5, py: 0.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <Typography sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '12px'
                        }}>📄</Typography>
                        <InputBase
                            value={filename}
                            onChange={e => setFilename(e.target.value)}
                            sx={{
                                color: theme.palette.text.primary,
                                fontSize: '13px',
                                fontFamily: 'JetBrains Mono',
                                width: 120
                            }}
                        />
                    </Box>

                    <Select
                        value={language}
                        onChange={e => {
                            const lang = e.target.value
                            setLanguage(lang)
                            setFilename(LANGUAGE_EXTENSIONS[lang])
                        }}
                        size="small"
                        sx={{
                            background: isDark ? '#242628' : '#F1F3F4',
                            color: theme.palette.text.primary,
                            fontSize: '13px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1.5,
                            '& fieldset': { border: 'none' },
                            height: 32
                        }}
                    >
                        <MenuItem value="java">Java</MenuItem>
                        <MenuItem value="python">Python</MenuItem>
                        <MenuItem value="javascript">JavaScript</MenuItem>
                        <MenuItem value="cpp">C++</MenuItem>
                    </Select>

                    <Box sx={{ flex: 1 }} />

                    <Typography sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '11px',
                        fontFamily: 'JetBrains Mono'
                    }}>
                        Lines {code.split('\n').length} • {language.toUpperCase()}
                    </Typography>
                </Box>

                {/* Editor */}
                <Box sx={{ flex: 1 }}>
                    <Editor
                        height="100%"
                        language={language}
                        value={code}
                        onChange={setCode}
                        theme={isDark ? 'vs-dark' : 'vs'}
                        options={{
                            fontSize: 13,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            padding: { top: 16 },
                            fontFamily: 'JetBrains Mono',
                            cursorBlinking: 'smooth'
                        }}
                    />
                </Box>

                {/* Button bar */}
                <Box sx={{
                    background: isDark ? '#1A1D21' : '#FFFFFF',
                    p: 2,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2
                }}>
                    <Button
                        onClick={() => { setCode(''); setResult(null) }}
                        sx={{
                            color: theme.palette.text.secondary,
                            border: `1px solid ${theme.palette.divider}`,
                            px: 3
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleReview}
                        disabled={loading}
                        startIcon={loading
                            ? <CircularProgress size={16} color="inherit" />
                            : <SearchIcon />
                        }
                        sx={{
                            background: loading
                                ? theme.palette.action?.disabledBackground
                                : isDark
                                    ? 'linear-gradient(135deg, #A8C7FA, #D0BCFF)'
                                    : 'linear-gradient(135deg, #1A73E8, #7E57C2)',
                            color: isDark ? '#131314' : '#FFFFFF',
                            px: 4,
                            fontWeight: 700
                        }}
                    >
                        {loading ? 'Analyzing...' : 'Review Code'}
                    </Button>
                </Box>
            </Box>

            {/* RIGHT */}
            <Box sx={{
                overflow: 'auto',
                background: theme.palette.background.default
            }}>
                {!result && !loading && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2
                    }}>
                        <SmartToyOutlinedIcon sx={{
                            fontSize: 56,
                            color: theme.palette.divider
                        }} />
                        <Typography sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '15px',
                            fontFamily: "'Google Sans', sans-serif"
                        }}>
                            Paste your code and click Review
                        </Typography>
                        <Typography sx={{
                            color: isDark
                                ? 'rgba(255,255,255,0.2)'
                                : 'rgba(0,0,0,0.25)',
                            fontSize: '12px'
                        }}>
                            Powered by CodeT5 + Rules + Gemini
                        </Typography>
                    </Box>
                )}

                {loading && (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        gap: 2
                    }}>
                        <CircularProgress
                            size={48}
                            sx={{ color: theme.palette.primary.main }}
                        />
                        <Typography sx={{
                            color: theme.palette.primary.main,
                            fontSize: '15px',
                            fontFamily: "'Google Sans', sans-serif"
                        }}>
                            Analyzing your code...
                        </Typography>
                        <Typography sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '12px'
                        }}>
                            Running 3-layer AI analysis
                        </Typography>
                    </Box>
                )}

                {result && !loading && (
                    <ReviewResults result={result} />
                )}
            </Box>
        </Box>
    )
}

export default HomePage