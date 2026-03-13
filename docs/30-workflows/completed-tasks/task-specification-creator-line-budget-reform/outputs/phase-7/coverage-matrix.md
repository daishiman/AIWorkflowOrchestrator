# Phase 7 Output: Coverage Matrix

## concern × command coverage

| concern                             | line budget | direct link               | archive                       | mirror     | dependency edge | validator           | 判定              |
| ----------------------------------- | ----------- | ------------------------- | ----------------------------- | ---------- | --------------- | ------------------- | ----------------- | ---- |
| C1 `SKILL.md`                       | `wc -l`     | `rg "references/"`        | N/A                           | `diff -qr` | dependency grep | `quick_validate.js` | PASS              |
| C2 `LOGS.md`                        | `wc -l`     | `rg "logs-archive-index"` | `logs-archive-index.md` audit | `diff -qr` | dependency grep | `validate_all.js`   | PASS              |
| C3 `patterns.md` family             | `wc -l`     | `rg "patterns-"`          | N/A                           | `diff -qr` | dependency grep | `validate_all.js`   | PASS              |
| C4 `phase-templates.md` family      | `wc -l`     | `rg "phase-template-"`    | N/A                           | `diff -qr` | dependency grep | `validate_all.js`   | PASS              |
| C5 `spec-update-workflow.md` family | `wc -l`     | `rg "spec-update-step"`   | N/A                           | `diff -qr` | dependency grep | `validate_all.js`   | PASS              |
| C6 `phase-11-12-guide.md` family    | `wc -l`     | `rg "phase-11-            | phase-12-"`                   | N/A        | `diff -qr`      | dependency grep     | `validate_all.js` | PASS |

## dependency edge coverage

| edge                                                 | 検証手段                    | 判定 |
| ---------------------------------------------------- | --------------------------- | ---- |
| `SKILL.md` → family files                            | `rg "references/" SKILL.md` | PASS |
| `LOGS.md` → `logs-archive-index.md`                  | archive grep                | PASS |
| `logs-archive-index.md` → monthly archive            | archive grep                | PASS |
| `patterns.md` → `patterns-*.md`                      | dependency grep             | PASS |
| `phase-templates.md` → `phase-template-*.md`         | dependency grep             | PASS |
| `spec-update-workflow.md` → `spec-update-step*.md`   | dependency grep             | PASS |
| `phase-11-12-guide.md` → `phase-11-*` / `phase-12-*` | dependency grep             | PASS |
| `.claude` → `.agents`                                | `diff -qr`、file set 比較   | PASS |

## coverage 判定

- command coverage: 必須 7 観点を 6 concern 全てに割り当てた
- dependency coverage: parent / child / archive / mirror の 8 edge を明示確認した
- blocker gap: 0
