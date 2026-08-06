# schemas.py
from pydantic import BaseModel
from typing import List, Optional

class CodeReviewRequest(BaseModel):
    code        : str
    language    : str = "java"
    filename    : Optional[str] = "code.java"
    context     : Optional[str] = None

class BugItem(BaseModel):
    line         : Optional[int] = None
    severity     : str
    category     : str
    description  : str
    suggestion   : str
    original_code: Optional[str] = None  # ← buggy line
    fixed_code   : Optional[str] = None  # ← fixed line

class CodeReviewResponse(BaseModel):
    filename    : str
    language    : str
    score       : int
    ai_review   : str
    bugs        : List[BugItem]
    security    : List[BugItem]
    style       : List[BugItem]
    performance : List[BugItem]
    summary     : str
    status      : str
    diff        : Optional[str] = None  # ← full before/after diff

class DetectLanguageRequest(BaseModel):
    code: str
