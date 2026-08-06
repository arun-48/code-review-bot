# reviewer.py
import os

class AIReviewer:
    """Layer 2 — fine-tuned CodeT5 (optional in deployment)"""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model      = None
        self.tokenizer  = None
        self.device     = None
        self.loaded     = False

    def load(self):
        if os.getenv("DISABLE_CODET5", "false").lower() == "true":
            print("⏭️  CodeT5 disabled (deployment mode) — rules + Gemini only")
            self.loaded = False
            return

        import torch
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
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
        if not self.loaded:
            return "Model not loaded"

        import torch
        numbered = '\n'.join(f"{i:3}: {l}" for i, l in enumerate(code.split('\n'), 1))
        input_text = f"Review this code change:\n{numbered[:400]}"
        inputs = self.tokenizer(input_text, return_tensors="pt",
                                max_length=512, truncation=True, padding=True).to(self.device)
        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"], attention_mask=inputs["attention_mask"],
                max_length=128, num_beams=4, early_stopping=True,
                no_repeat_ngram_size=2, length_penalty=1.0)
        review = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return review if review else "Code reviewed — no major issues found."

    def generate_review_with_lines(self, code: str, issues: list) -> str:
        if not self.loaded:
            return "Model not loaded"

        import torch
        lines = code.split('\n')
        focus = ""
        for issue in issues[:3]:
            ln = getattr(issue, 'line', None)
            if ln and 0 < ln <= len(lines):
                focus += f"Line {ln}: {lines[ln-1].strip()}\nIssue: {issue.description}\n\n"
        input_text = (f"Review these specific code issues:\n{focus[:400]}"
                      if focus else f"Review this code change:\n{code[:400]}")
        inputs = self.tokenizer(input_text, return_tensors="pt",
                                max_length=512, truncation=True, padding=True).to(self.device)
        with torch.no_grad():
            outputs = self.model.generate(
                inputs["input_ids"], attention_mask=inputs["attention_mask"],
                max_length=128, num_beams=4, early_stopping=True,
                no_repeat_ngram_size=2, length_penalty=1.0)
        review = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        return review if review else "Code reviewed — no major issues found."