# rules.py
import re
from schemas import BugItem

class RuleBasedDetector:

    def analyze(self, code: str) -> dict:
        bugs        = []
        security    = []
        style       = []
        performance = []

        lines = code.split('\n')

        for i, line in enumerate(lines, 1):
            s = line.strip()

            # ════════════════════════════════
            # 🔐 SECURITY
            # ════════════════════════════════

            # SQL Injection — single line
            if re.search(
                r'(SELECT|INSERT|UPDATE|DELETE).*["\'].*\+',
                line, re.IGNORECASE
            ):
                security.append(BugItem(
                    line=i, severity="critical", category="security",
                    description="SQL Injection vulnerability detected",
                    suggestion="Use PreparedStatement with parameterized queries",
                    original_code=s,
                    fixed_code='PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id=?");\nps.setString(1, userId);\nResultSet rs = ps.executeQuery();'
                ))

            # SQL Injection — concat with variable after WHERE/VALUES
            if re.search(r'(WHERE|VALUES)\s*.*["\'].*\+', line, re.IGNORECASE):
                if not any(b.line == i and 'SQL' in b.description for b in security):
                    security.append(BugItem(
                        line=i, severity="critical", category="security",
                        description="SQL Injection vulnerability detected",
                        suggestion="Use PreparedStatement with parameterized queries",
                        original_code=s,
                        fixed_code='PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id=?");\nps.setString(1, userId);\nResultSet rs = ps.executeQuery();'
                    ))

            # SQL Injection — string + variable pattern near SQL
            if re.search(r'["\'].*\+\s*\w+\s*\+\s*["\']', line):
                context = '\n'.join(lines[max(0,i-3):min(i+3,len(lines))])
                if re.search(r'(SELECT|INSERT|UPDATE|DELETE|WHERE)', context, re.IGNORECASE):
                    if not any(b.line == i and 'SQL' in b.description for b in security):
                        security.append(BugItem(
                            line=i, severity="critical", category="security",
                            description="SQL Injection vulnerability detected",
                            suggestion="Use PreparedStatement with parameterized queries",
                            original_code=s,
                            fixed_code='PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id=?");\nps.setString(1, userId);\nResultSet rs = ps.executeQuery();'
                        ))

            # Hardcoded password
            if re.search(
                r'(password|passwd|pwd|secret|api_key|apikey|token)\s*=\s*["\'][^"\']+["\']',
                line, re.IGNORECASE
            ):
                security.append(BugItem(
                    line=i, severity="critical", category="security",
                    description="Hardcoded password detected",
                    suggestion="Use environment variables or secrets manager",
                    original_code=s,
                    fixed_code='String password = System.getenv("DB_PASSWORD");'
                ))

            # Weak hashing algorithm
            if re.search(r'(MD5|SHA1|SHA-1)\s*[(\.]', line, re.IGNORECASE):
                security.append(BugItem(
                    line=i, severity="critical", category="security",
                    description="Weak hashing algorithm detected (MD5/SHA1)",
                    suggestion="Use SHA-256 or bcrypt for secure hashing",
                    original_code=s,
                    fixed_code='MessageDigest md = MessageDigest.getInstance("SHA-256");'
                ))

            # printStackTrace exposes internals
            if re.search(r'\.printStackTrace\(\)', line):
                security.append(BugItem(
                    line=i, severity="warning", category="security",
                    description="printStackTrace() exposes internal stack trace",
                    suggestion="Use a logger instead of printStackTrace()",
                    original_code=s,
                    fixed_code='logger.error("Error occurred", e);'
                ))

            # ════════════════════════════════
            # 🐛 BUGS
            # ════════════════════════════════

            # Null assigned then method called
            if re.search(r'=\s*null\s*;', line):
                var_match = re.search(r'(\w+)\s*=\s*null', line)
                if var_match:
                    var_name = var_match.group(1)
                    ahead = '\n'.join(lines[i:min(i+6, len(lines))])
                    if re.search(rf'\b{var_name}\s*\.\s*\w+\s*\(', ahead):
                        bugs.append(BugItem(
                            line=i, severity="critical", category="bug",
                            description="Potential NullPointerException — variable assigned null",
                            suggestion=f"Check {var_name} for null before calling methods",
                            original_code=s,
                            fixed_code=f'if ({var_name} != null) {{\n    {var_name}.method();\n}}'
                        ))

            # Chained method call NPE risk
            if re.search(r'\.get\w*\(\)\.', line):
                bugs.append(BugItem(
                    line=i, severity="warning", category="bug",
                    description="Potential NullPointerException — chained method call",
                    suggestion="Add null check before chaining methods",
                    original_code=s,
                    fixed_code='if (object != null && object.getValue() != null) {\n    // safe to chain\n}'
                ))

            # Direct array access with literal index
            if re.search(r'\w+\[\d+\]', line):
                bugs.append(BugItem(
                    line=i, severity="warning", category="bug",
                    description="Direct array access — possible ArrayIndexOutOfBoundsException",
                    suggestion="Check array length before accessing index",
                    original_code=s,
                    fixed_code='if (arr != null && index < arr.length) {\n    value = arr[index];\n}'
                ))

            # Division by zero risk
            if re.search(r'/\s*(\w+)', line):
                divisor = re.search(r'/\s*(\w+)', line)
                if divisor:
                    div_var = divisor.group(1)
                    all_code = '\n'.join(lines)
                    if re.search(
                        rf'\b{div_var}\s*=\s*0\b', all_code
                    ) or div_var in ['activeUsers', 'count', 'size',
                                     'total', 'n', 'denominator',
                                     'divisor', 'length']:
                        bugs.append(BugItem(
                            line=i, severity="critical", category="bug",
                            description="Potential division by zero",
                            suggestion=f"Check that {div_var} is not zero before dividing",
                            original_code=s,
                            fixed_code=f'if ({div_var} != 0) {{\n    result = dividend / {div_var};\n}}'
                        ))

            # Empty catch block
            if re.search(r'catch\s*\(.*\)\s*\{?\s*\}', line):
                bugs.append(BugItem(
                    line=i, severity="warning", category="bug",
                    description="Empty catch block silently swallows exception",
                    suggestion="Log the error or rethrow it",
                    original_code=s,
                    fixed_code='} catch (Exception e) {\n    logger.error("Error occurred: ", e);\n}'
                ))

            # Resource leak — unclosed streams
            if re.search(
                r'new\s+(FileInputStream|FileOutputStream|BufferedReader|'
                r'BufferedWriter|FileReader|FileWriter|Socket|'
                r'ServerSocket|HttpURLConnection)\s*\(',
                line
            ):
                context_before = '\n'.join(lines[max(0,i-3):i])
                if 'try' not in context_before and 'try-with' not in context_before:
                    bugs.append(BugItem(
                        line=i, severity="warning", category="bug",
                        description="Resource may not be closed — potential resource leak",
                        suggestion="Use try-with-resources statement",
                        original_code=s,
                        fixed_code='try (FileInputStream fis = new FileInputStream(file)) {\n    // use resource here\n} // auto-closed'
                    ))

            # Infinite loop risk
            if re.search(r'while\s*\(\s*true\s*\)', line):
                ahead = '\n'.join(lines[i:min(i+15, len(lines))])
                if 'break' not in ahead and 'return' not in ahead:
                    bugs.append(BugItem(
                        line=i, severity="critical", category="bug",
                        description="Potential infinite loop — no break or return found",
                        suggestion="Add a break condition or return statement",
                        original_code=s,
                        fixed_code='while (true) {\n    // process\n    if (condition) break;\n}'
                    ))

            # String comparison with ==
            if re.search(r'(\w+)\s*==\s*"', line) or re.search(r'"\s*==\s*(\w+)', line):
                bugs.append(BugItem(
                    line=i, severity="critical", category="bug",
                    description="String comparison with == instead of .equals()",
                    suggestion="Use .equals() for string comparison in Java",
                    original_code=s,
                    fixed_code='if (str.equals("value")) {\n    // correct string comparison\n}'
                ))

            # ════════════════════════════════
            # ⚡ PERFORMANCE
            # ════════════════════════════════

            # String concatenation in loop
            if re.search(r'\+=\s*["\']', line):
                performance.append(BugItem(
                    line=i, severity="warning", category="performance",
                    description="String concatenation with += is inefficient in loops",
                    suggestion="Use StringBuilder for string building in loops",
                    original_code=s,
                    fixed_code='StringBuilder sb = new StringBuilder();\nsb.append(value);\nString result = sb.toString();'
                ))

            # size() called in loop condition
            if re.search(r'i\s*<\s*\w+\.size\(\)', line):
                performance.append(BugItem(
                    line=i, severity="warning", category="performance",
                    description="Calling size() on every loop iteration is inefficient",
                    suggestion="Cache the size() result before the loop",
                    original_code=s,
                    fixed_code='int size = list.size();\nfor (int i = 0; i < size; i++) {'
                ))

            # Nested loops O(n²) complexity
            if re.search(r'for\s*\(', line):
                inner_range = '\n'.join(lines[i:min(i+8, len(lines))])
                inner_count = len(re.findall(r'for\s*\(', inner_range))
                if inner_count >= 2:
                    performance.append(BugItem(
                        line=i, severity="warning", category="performance",
                        description="Nested loops detected — O(n²) complexity",
                        suggestion="Consider using HashMap or Set to reduce complexity to O(n)",
                        original_code=s,
                        fixed_code='// Use HashMap for O(n) lookup instead of nested O(n²) loops\nMap<Key, Value> map = new HashMap<>();'
                    ))

            # System.out.print with concatenation
            if re.search(r'System\.out\.print.*\+', line):
                performance.append(BugItem(
                    line=i, severity="info", category="performance",
                    description="String concatenation in print statement",
                    suggestion="Use String.format() or printf() for better performance",
                    original_code=s,
                    fixed_code='System.out.printf("Value: %s%n", value);'
                ))

            # ════════════════════════════════
            # 🎨 STYLE
            # ════════════════════════════════

            # Single letter variable name
            if re.search(r'\b(int|String|double|float|long|boolean|char)\s+[a-z]\s*[=;]', line):
                if not re.search(r'\b(for|while)\b', line):
                    style.append(BugItem(
                        line=i, severity="info", category="style",
                        description="Single-letter variable name reduces readability",
                        suggestion="Use descriptive variable names (e.g. 'count' instead of 'n')",
                        original_code=s,
                        fixed_code='// Use descriptive names:\n// int n → int userCount\n// String s → String userName'
                    ))

            # Magic number
            if re.search(r'\b(?!0\b|1\b)\d{2,}\b', line):
                if not re.search(
                    r'(final|static|import|//|ofSeconds|ofMinutes|ofMillis|'
                    r'ofHours|fontSize|height|width|px|ms)',
                    line, re.IGNORECASE
                ):
                    numbers = re.findall(r'\b(?!0\b|1\b)\d+\.?\d*\b', line)
                    if numbers:
                        n  = numbers[0]
                        ns = n.replace('.', '_')
                        style.append(BugItem(
                            line=i, severity="info", category="style",
                            description="Magic number detected",
                            suggestion="Extract to a named constant for clarity",
                            original_code=s,
                            fixed_code=f'private static final int CONSTANT_{ns} = {n};\n// Use CONSTANT_{ns} instead of {n}'
                        ))

        # ════════════════════════════════
        # 🔍 POST-LOOP: Multiline Analysis
        # ════════════════════════════════

        full = '\n'.join(lines)

        # SQL Injection — multiline string concat
        sql_blocks = re.finditer(
            r'(SELECT|INSERT|UPDATE|DELETE)[^;]{0,300}[\+\s]+\w+[^;]{0,100};',
            full, re.IGNORECASE | re.DOTALL
        )
        detected_sql_lines = set()
        for match in sql_blocks:
            line_num = full[:match.start()].count('\n') + 1
            if line_num not in detected_sql_lines:
                detected_sql_lines.add(line_num)
                snippet = lines[line_num - 1].strip()
                if not any(
                    b.line == line_num and 'SQL' in b.description
                    for b in security
                ):
                    security.append(BugItem(
                        line=line_num,
                        severity="critical",
                        category="security",
                        description="SQL Injection vulnerability detected",
                        suggestion="Use PreparedStatement with parameterized queries",
                        original_code=snippet,
                        fixed_code='PreparedStatement ps = conn.prepareStatement(\n    "SELECT * FROM employees WHERE id=?");\nps.setString(1, empId);\nResultSet rs = ps.executeQuery();'
                    ))

        # Integer Overflow — MAX_VALUE arithmetic
        overflow_matches = re.finditer(
            r'Integer\.MAX_VALUE\s*[\+\-\*]|'
            r'Integer\.MIN_VALUE\s*[\+\-\*]|'
            r'[\+\-\*]\s*Integer\.MAX_VALUE|'
            r'[\+\-\*]\s*Integer\.MIN_VALUE',
            full
        )
        detected_overflow_lines = set()
        for match in overflow_matches:
            line_num = full[:match.start()].count('\n') + 1
            if line_num not in detected_overflow_lines:
                detected_overflow_lines.add(line_num)
                snippet = lines[line_num - 1].strip()
                bugs.append(BugItem(
                    line=line_num,
                    severity="critical",
                    category="bug",
                    description="Integer overflow — value exceeds int range",
                    suggestion="Use long instead of int for large arithmetic",
                    original_code=snippet,
                    fixed_code='long total = (long) salary + bonus;'
                ))

        # ConcurrentModification — modifying collection while iterating
        for_each_matches = re.finditer(
            r'for\s*\(\s*\w+\s+(\w+)\s*:\s*(\w+)\s*\)',
            full
        )
        detected_concurrent_lines = set()
        for match in for_each_matches:
            collection_name = match.group(2)
            loop_start      = match.start()
            loop_block      = full[loop_start:loop_start + 500]
            line_num        = full[:loop_start].count('\n') + 1

            if line_num not in detected_concurrent_lines:
                if re.search(
                    rf'{collection_name}\s*\.\s*(remove|add|clear)\s*\(',
                    loop_block
                ):
                    detected_concurrent_lines.add(line_num)
                    snippet = lines[line_num - 1].strip()
                    bugs.append(BugItem(
                        line=line_num,
                        severity="critical",
                        category="bug",
                        description="ConcurrentModificationException risk — modifying collection while iterating",
                        suggestion="Use Iterator.remove() or collect items to remove separately",
                        original_code=snippet,
                        fixed_code='Iterator<String> it = employees.iterator();\nwhile (it.hasNext()) {\n    if (it.next().equals("John")) it.remove();\n}'
                    ))

        return {
            "bugs"       : bugs,
            "security"   : security,
            "style"      : style,
            "performance": performance
        }