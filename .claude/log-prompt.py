#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Auto-log: upisuje svaki korisnikov prompt u PROMPTS-LOG.md.
Pokreće ga Claude Code UserPromptSubmit hook (vidi ~/.claude/settings.json).
Garantuje zapis bez oslanjanja na asistenta."""
import json, sys, os
from datetime import datetime

try:
    raw = sys.stdin.buffer.read().decode("utf-8", errors="replace")
    data = json.loads(raw)
except Exception:
    sys.exit(0)  # nikad ne blokiraj prompt

prompt = (data.get("prompt") or "").strip()
if not prompt:
    sys.exit(0)

root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# Loguj SAMO ako je Claude pokrenut iz ovog projekta (ili podfoldera).
# Tako se promptovi iz drugih projekata ne upisuju ovdje.
cwd = os.path.abspath(data.get("cwd") or "")
try:
    same = os.path.commonpath([os.path.normcase(cwd), os.path.normcase(root)]) == os.path.normcase(root)
except ValueError:
    same = False  # različiti drive-ovi (npr. C: vs E:)
if not same:
    sys.exit(0)
logfile = os.path.join(root, "PROMPTS-LOG.md")
ts = datetime.now().strftime("%Y-%m-%d %H:%M")

if not os.path.exists(logfile):
    header = "# Qiro — log promptova (auto-generisano hookom)\n\n"
else:
    header = ""

# višelinijske promptove uvuci kao blockquote radi čitljivosti
body = prompt.replace("\n", "\n  ")
with open(logfile, "a", encoding="utf-8") as f:
    f.write(f"{header}- **[{ts}]** {body}\n")

sys.exit(0)
