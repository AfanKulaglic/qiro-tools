# Claude Code — setup za NOVI projekt (auto-zapisivanje + automatski permission)

> Ovaj fajl objašnjava kako da svaki novi projekt dobije:
> 1. **Auto-zapisivanje svakog mog prompta** u `PROMPTS-LOG.md` (bez API ključa — samo tekst poruka).
> 2. **Automatski permission** (Claude ništa ne pita prije nego nešto uradi).
>
> Kako iskoristiti: kad počneš novi projekt, samo mi daj ovaj fajl da pročitam i reci
> "napravi isto za ovaj projekt: <PUTANJA_DO_PROJEKTA>". Ja ću sve postaviti sam.

---

## Šta mi treba od tebe (samo 1 stvar)
- **Puna putanja do projekta**, npr. `E:\MojProjekt\sajt` ili `C:\Users\afank\Code\app`.

To je sve. Ostalo radim ja.

---

## ŠTA JA NAPRAVIM (referenca — ovako izgleda gotov setup)

### A) Auto-zapisivanje promptova

**1. Skripta `<PROJEKT>/.claude/log-prompt.py`** (zapisuje svaki prompt; NE dira API ključ):

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Auto-log: upisuje svaki korisnikov prompt u PROMPTS-LOG.md."""
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
logfile = os.path.join(root, "PROMPTS-LOG.md")
ts = datetime.now().strftime("%Y-%m-%d %H:%M")
header = "" if os.path.exists(logfile) else "# Log promptova (auto-generisano hookom)\n\n"
body = prompt.replace("\n", "\n  ")
with open(logfile, "a", encoding="utf-8") as f:
    f.write(f"{header}- **[{ts}]** {body}\n")
sys.exit(0)
```

**2. Hook koji je poziva** — `UserPromptSubmit`.

> ⚠️ VAŽNA LEKCIJA (zašto je ranije bilo prazno):
> Ako Claude pokrećeš iz DRUGOG foldera (npr. `C:\Users\afank\.local\bin`), a hook je
> upisan u **projektni** `.claude/settings.local.json`, hook se NIKAD ne učita i log ostane prazan.
> Zato hook stavljamo u **korisnički** `~/.claude/settings.json` (`C:\Users\afank\.claude\settings.json`)
> — tada radi bez obzira odakle pokreneš Claude.

U `C:\Users\afank\.claude\settings.json`, unutar `"hooks"`, dodaje se:

```json
"UserPromptSubmit": [
  {
    "hooks": [
      { "type": "command", "command": "python \"<PUTANJA>/.claude/log-prompt.py\"" }
    ]
  }
]
```

> Napomena: ako više projekata treba log istovremeno, skripta sama bira `PROMPTS-LOG.md`
> relativno svom položaju, pa je najčišće da svaki projekt ima svoju skriptu i svoj hook unos.

### B) Automatski permission (Claude ništa ne pita)

Tri načina (od najlakšeg):

1. **Pri pokretanju (za tu sesiju):**
   ```
   claude --dangerously-skip-permissions
   ```
2. **Unutar sesije:** komanda `/permissions` → izaberi **bypassPermissions**
   (ili kruži kroz modove s `Shift+Tab`).
3. **TRAJNO (preporučeno za solo lokalni rad):** u `C:\Users\afank\.claude\settings.json` dodati:
   ```json
   "defaultMode": "bypassPermissions"
   ```
   Tada Claude NIKAD ne traži dozvolu, u svim projektima.

> ⚠️ U bypass modu Claude izvršava SVE bez pitanja — uključujući brisanje fajlova i git operacije.
> Ok za lokalni rad; oprez ako je projekt povezan s nečim važnim/dijeljenim.

> Alternativa ako ne želiš pun bypass: u `"permissions": { "allow": [...] }` se nabroje
> dozvoljene komande (npr. `"Bash(npm run *)"`, `"Bash(git *)"`), pa pita samo za ostalo.

---

## ČEK-LISTA koju ja prođem za novi projekt
- [ ] Kreiram `<PROJEKT>/.claude/log-prompt.py`
- [ ] Dodam `UserPromptSubmit` hook u `~/.claude/settings.json` (s putanjom tog projekta)
- [ ] Validiram da je `settings.json` ispravan JSON
- [ ] Testiram hook (ubacim probni prompt, provjerim da se upisao, pa obrišem test redak)
- [ ] (Opcionalno) Postavim `"defaultMode": "bypassPermissions"` za automatski permission
- [ ] (Preporuka) Dodam `<PROJEKT>/CLAUDE.md` s pravilom "ažuriraj STANJE.md nakon svake promjene"

---

## Brza rečenica koju mi pošalji
> "Pročitaj `CLAUDE-SETUP-NOVI-PROJEKT.md` s desktopa i napravi auto-zapisivanje i automatski
> permission za ovaj projekt: `<PUTANJA>`."
