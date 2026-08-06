# gemini_reviewer.py
import os
import re
from google import genai

class GeminiReviewer:

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client  = None
        self.loaded  = False

    def load(self):
        if not self.api_key:
            print("⚠️  No GEMINI_API_KEY found!")
            return
        try:
            self.client = genai.Client(api_key=self.api_key)
            self.loaded = True
            print("✅ Gemini API connected!")
        except Exception as e:
            print(f"⚠️  Gemini failed: {e}")

    def explain_issues(
        self,
        code     : str,
        bugs     : list,
        security : list,
        ai_review: str
    ) -> dict:

        if not self.loaded:
            return {
                "ai_review"     : ai_review,
                "updated_issues": bugs + security,
                "diff"          : None
            }

        all_issues = security + bugs
        lines      = code.split('\n')
        updated    = list(all_issues)

        # ── Fix each issue individually ──
        for i, issue in enumerate(updated):
            line_num  = issue.line or 0
            line_code = lines[line_num - 1].strip() \
                if 0 < line_num <= len(lines) else ""

            if not line_code:
                continue

            print(f"  🔧 Fixing issue {i+1}/{len(updated)}: {issue.description[:40]}")

            fix = self._generate_fix(
                issue_type  =issue.description,
                line_num    =line_num,
                code_snippet=line_code,
                full_code   =code
            )

            if fix:
                issue.fixed_code = fix

        # ── Generate overall summary ──
        summary = self._generate_summary(code, updated)

        return {
            "ai_review"     : summary,
            "updated_issues": updated,
            "diff"          : None
        }

    def _generate_fix(
        self,
        issue_type  : str,
        line_num    : int,
        code_snippet: str,
        full_code   : str
    ) -> str:
        """Generate contextual fix for a single issue"""

        prompt = f"""You are a senior Java developer.

Issue detected: {issue_type}
Line {line_num}: `{code_snippet}`

Full code context:
```java
{full_code[:1500]}
```

Generate a fix for this exact line.

STRICT RULES:
1. Use ONLY variable names that exist in the snippet: `{code_snippet}`
2. Do NOT invent names like: arr, index, value, obj, object, method()
3. Write compilable Java — include braces and semicolons
4. Keep fix minimal — only change what's needed
5. Return ONLY the fixed code, no explanation

Examples of what I mean:
- If snippet is: emp.getName().toUpperCase()
  Fix must use: emp, getName()
  Good: if (emp != null && emp.getName() != null) {{ emp.getName().toUpperCase(); }}

- If snippet is: String userName = null;
  Fix must use: userName
  Good: String userName = "DefaultUser";

- If snippet is: System.out.println(numbers[5]);
  Fix must use: numbers, 5
  Good: if (numbers != null && numbers.length > 5) {{ System.out.println(numbers[5]); }}

- If snippet is: System.out.println(totalUsers / activeUsers);
  Fix must use: totalUsers, activeUsers
  Good: if (activeUsers != 0) {{ System.out.println(totalUsers / activeUsers); }}

- If snippet is: if (emp.getSalary() > 50000)
  Issue is magic number, fix must use: emp, getSalary(), meaningful name
  Good: private static final int BONUS_ELIGIBILITY_SALARY = 50000;
        if (emp.getSalary() > BONUS_ELIGIBILITY_SALARY)

Now generate fix for: `{code_snippet}`
Return ONLY the Java code:"""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            fix = response.text.strip()
            fix = re.sub(r'```java\n?', '', fix)
            fix = re.sub(r'```\n?',     '', fix)
            fix = fix.strip()

            # Validate — reject generic placeholders
            if self._is_generic(fix, code_snippet):
                print(f"    ⚠️ Generic fix rejected")
                return None

            return fix

        except Exception as e:
            print(f"    ⚠️ Fix generation failed: {e}")
            return None

    def _generate_summary(self, code: str, issues: list) -> str:
        """Generate overall code quality summary"""

        if not issues:
            return "No critical issues detected. Code looks clean."

        issue_list = '\n'.join([
            f"- {i.description} (Line {i.line}, {i.severity})"
            for i in issues
        ])

        prompt = f"""You are a senior code reviewer.

Code submitted for review has these issues:
{issue_list}

Write a 3-4 sentence professional summary:
1. Overall code quality assessment
2. Most critical risk and why
3. Top recommendation

Be direct and specific. No generic advice."""

        try:
            response = self.client.models.generate_content(
                model="gemini-2.5-flash-lite",
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"⚠️  Summary generation failed: {e}")
            total = len(issues)
            critical = sum(1 for i in issues if i.severity == 'critical')
            return (
                f"Found {total} issue(s), {critical} critical. "
                f"Priority: fix security vulnerabilities first, "
                f"then address runtime crash risks."
            )

    def _is_generic(self, fix: str, snippet: str) -> bool:
        """Reject fix if it uses placeholder names not in snippet"""
        generic_names = [
            'object', 'getValue()', r'\barr\b', r'\bindex\b',
            r'\bvalue\b', 'method()', r'\bobj\b', 'placeholder',
            'getField()', 'myObject', 'someVariable'
        ]

        # Extract real variable names from snippet
        real_vars = set(re.findall(r'\b[a-z][a-zA-Z0-9]+\b', snippet))

        for pattern in generic_names:
            match = re.search(pattern, fix)
            if match:
                # Check if matched word is actually in snippet
                matched = match.group()
                if matched not in real_vars:
                    return True

        return False