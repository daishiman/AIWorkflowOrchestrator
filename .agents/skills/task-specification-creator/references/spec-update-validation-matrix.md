# Spec Update Validation Matrix

## command matrix

| command | pass 条件 |
| --- | --- |
| `node ../skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator` | error 0 |
| `node ../skill-creator/scripts/validate_all.js .claude/skills/task-specification-creator` | error 0 |
| `node scripts/validate-phase-output.js docs/30-workflows/{{FEATURE_NAME}}` | error 0 |
| `node scripts/verify-all-specs.js --workflow docs/30-workflows/{{FEATURE_NAME}} --json` | error 0。warning は根拠付きで 0 へ寄せる |
| `node scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/{{FEATURE_NAME}}` | Part 1 / Part 2 全項目 PASS |
| `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator` | diff 0 |

## report rule

| 指標 | 記録先 |
| --- | --- |
| validator summary | `quality-report.md` |
| current / baseline | `documentation-changelog.md` |
| root parity | `manual-test-result.md` |
| unresolved blocker | `discovered-issues.md` |

## warning の扱い

- `current` に関わる warning は原則解消する。
- legacy baseline は note として残す。
- root drift と dependency orphan は warning でも blocker 扱いにする。
