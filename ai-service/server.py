# server.py
import os
import re
import time
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from reviewer        import AIReviewer
from rules           import RuleBasedDetector
from gemini_reviewer import GeminiReviewer
from schemas         import (
    CodeReviewRequest,
    CodeReviewResponse,
    DetectLanguageRequest
)

load_dotenv()

app = FastAPI(
    title="AI Code Review Bot",
    description="CodeT5 + Rules + Gemini",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

MODEL_PATH      = os.path.join(os.path.dirname(__file__), "model")
ai_reviewer     = AIReviewer(model_path=MODEL_PATH)
rule_detector   = RuleBasedDetector()
gemini_reviewer = GeminiReviewer()


@app.on_event("startup")
async def startup_event():
    print("\n" + "="*45)
    print("  AI Code Review Bot v2.0 Starting...")
    print("="*45)
    ai_reviewer.load()
    gemini_reviewer.load()
    print("="*45)
    print("  Server ready!")
    print("="*45 + "\n")


@app.get("/health")
def health_check():
    return {
        "status"       : "running",
        "model_loaded" : ai_reviewer.loaded,
        "gemini_loaded": gemini_reviewer.loaded,
        "model_path"   : MODEL_PATH
    }


@app.post("/review", response_model=CodeReviewResponse)
def review_code(request: CodeReviewRequest):

    start_time = time.time()

    if not request.code or not request.code.strip():
        raise HTTPException(
            status_code=400,
            detail="Code cannot be empty"
        )

    print(f"\n📝 Reviewing: {request.filename}")
    print(f"   Language : {request.language}")
    print(f"   Length   : {len(request.code)} chars")

    # ── Layer 1: Rules ──
    print("🔍 Layer 1: Rule-based detection...")
    rule_results = rule_detector.analyze(request.code)
    bugs         = rule_results["bugs"]
    security     = rule_results["security"]
    style        = rule_results["style"]
    performance  = rule_results["performance"]

    # ── Layer 2: CodeT5 ──
    print("🤖 Layer 2: CodeT5 review...")
    ai_review = ai_reviewer.generate_review_with_lines(
        code  =request.code,
        issues=security + bugs
    )

    # ── Score ──
    score  = 100
    score -= len(security)    * 15
    score -= len(bugs)        * 10
    score -= len(performance) * 5
    score -= len(style)       * 3
    score  = max(0, min(100, score))

    # ── Status ──
    if score >= 80:
        status = "good"
    elif score >= 50:
        status = "needs_improvement"
    else:
        status = "poor"

    # ── Summary ──
    total = len(bugs) + len(security) + len(style) + len(performance)
    summary = (
        f"Found {total} issue(s): "
        f"{len(security)} security, "
        f"{len(bugs)} bug(s), "
        f"{len(performance)} performance, "
        f"{len(style)} style. "
        f"Score: {score}/100."
    )

    # ── Layer 3: Gemini ──
    print("✨ Layer 3: Gemini explanation...")
    gemini_result  = gemini_reviewer.explain_issues(
        code     =request.code,
        bugs     =bugs,
        security =security,
        ai_review=ai_review
    )
    final_review   = gemini_result["ai_review"]
    updated_issues = gemini_result.get("updated_issues", bugs + security)

    updated_security = [i for i in updated_issues if i.category == 'security']
    updated_bugs     = [i for i in updated_issues if i.category == 'bug']

    elapsed = time.time() - start_time
    print(f"✅ Done in {elapsed:.2f}s | Score: {score}/100")

    return CodeReviewResponse(
        filename   =request.filename,
        language   =request.language,
        score      =score,
        ai_review  =final_review,
        bugs       =updated_bugs,
        security   =updated_security,
        style      =style,
        performance=performance,
        summary    =summary,
        status     =status,
        diff       =None
    )


def _detect_language(code: str):
    # C++ — check first (shares syntax with Java)
    if (re.search(r'#include\s*<', code) or
        re.search(r'\bcout\s*<<', code) or
        re.search(r'\bprintf\s*\(', code) or
        re.search(r'\bscanf\s*\(', code) or
        re.search(r'\bint\s+main\s*\(\s*\)', code) or
        re.search(r'std::', code) or
        re.search(r'using\s+namespace', code)):
        return 'cpp'

    # Python
    if (re.search(r'\bdef \w+\s*\(', code) or
        re.search(r'\bprint\s*\(', code) or
        re.search(r'\belif\b', code) or
        (re.search(r'import \w+', code) and
         'import java' not in code) or
        re.search(r':\s*$', code, re.MULTILINE)):
        return 'python'

    # Java
    if (re.search(r'public\s+class\b', code) or
        re.search(r'System\.out\.', code) or
        re.search(r'public\s+static\s+void\s+main', code) or
        re.search(r'import\s+java\.', code)):
        return 'java'

    # JavaScript
    if (re.search(r'\bconsole\.log\b', code) or
        re.search(r'\bconst\b|\blet\b', code) or
        re.search(r'=>\s*[\{\(]', code) or
        re.search(r'\brequire\s*\(', code) or
        re.search(r'\bdocument\.', code)):
        return 'javascript'

    # Unsupported
    if re.search(r'\bfn\s+\w+\b|\blet\s+mut\b|\bprintln!\b', code):
        return 'rust'
    if re.search(r'\bfun\b.*\(|\bval\b|\bprintln\b', code):
        return 'kotlin'
    if re.search(r'\bpackage\s+main\b|\bfmt\.Print', code):
        return 'go'
    if re.search(r'\$\w+\s*=|\becho\b', code):
        return 'php'
    if re.search(r'\bConsole\.Write\b|\bnamespace\b', code):
        return 'csharp'
    if re.search(r'\bputs\b|\battr_accessor\b', code):
        return 'ruby'

    return None


@app.post("/detect-language")
def detect_language_endpoint(request: DetectLanguageRequest):
    code = request.code.strip()
    if not code:
        return {"language": "unknown", "confident": False}

    detected = _detect_language(code)
    print(f"🔍 Detected: {detected}")

    return {
        "language" : detected or "unknown",
        "confident": detected is not None
    }