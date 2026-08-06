# reviewer.py
import torch
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import os

class AIReviewer:
    """
    Layer 2 — Your fine-tuned CodeT5 model
    Generates human-style review comments
    """

    def __init__(self, model_path: str):
        self.device     = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )
        self.model_path = model_path
        self.model      = None
        self.tokenizer  = None
        self.loaded     = False

    def load(self):
        """Load model — local folder in dev, HF Hub in deployment"""
        model_source = self.model_path if os.path.exists(self.model_path) else "arun-48/codet5-review"
        print(f"📥 Loading model from: {model_source}")
        print(f"   Device: {self.device}")

        self.tokenizer = AutoTokenizer.from_pretrained(model_source)
        self.model     = AutoModelForSeq2SeqLM.from_pretrained(model_source)
        self.model     = self.model.to(self.device)
        self.model.eval()
        self.loaded    = True
        print("✅ Model loaded successfully!")

    def generate_review(self, code: str) -> str:
        """Generate AI review for given code"""
        if not self.loaded:
            return "Model not loaded"

        numbered_lines = []
        for i, line in enumerate(code.split('\n'), 1):
            numbered_lines.append(f"{i:3}: {line}")
        numbered_code = '\n'.join(numbered_lines)

        input_text = f"Review this code change:\n{numbered_code[:400]}"

        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=128,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2,
                length_penalty=1.0
            )

        review = self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        )

        return review if review else "Code reviewed — no major issues found."

    def generate_review_with_lines(
        self, code: str, issues: list
    ) -> str:
        """Generate review focusing on flagged lines"""
        if not self.loaded:
            return "Model not loaded"

        if not issues:
            return self.generate_review(code)

        lines      = code.split('\n')
        focus_text = ""

        for issue in issues[:3]:
            line_num = getattr(issue, 'line', None)
            if line_num and 0 < line_num <= len(lines):
                actual_line = lines[line_num - 1].strip()
                focus_text += (
                    f"Line {line_num}: {actual_line}\n"
                    f"Issue: {issue.description}\n\n"
                )

        if focus_text:
            input_text = (
                f"Review these specific code issues:\n"
                f"{focus_text[:400]}"
            )
        else:
            input_text = f"Review this code change:\n{code[:400]}"

        inputs = self.tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=128,
                num_beams=4,
                early_stopping=True,
                no_repeat_ngram_size=2,
                length_penalty=1.0
            )

        review = self.tokenizer.decode(
            outputs[0],
            skip_special_tokens=True
        )

        return review if review else "Code reviewed — no major issues found."