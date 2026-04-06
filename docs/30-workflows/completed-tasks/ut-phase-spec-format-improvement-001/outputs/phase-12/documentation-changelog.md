# Documentation Changelog

## 変更一覧

| 対象                                                                                                                      | 変更内容                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `task-specification-creator/SKILL.md` / `task-specification-creator/LOGS.md` / `phase12-task-spec-compliance-template.md` | Task/Step 分離、root evidence 強化、ledger parity の direct root evidence 化、docs-only 判定の補助を追加        |
| `task-workflow-completed.md` / `task-workflow-backlog.md`                                                                 | Phase 12 close-out / spec_created の current facts を更新、ledger parity の根拠を更新                           |
| `aiworkflow-requirements/SKILL.md` / `aiworkflow-requirements/LOGS.md`                                                    | same-wave sync と conflict marker cleanup を実施                                                                |
| `validate-phase-output.js`                                                                                                | docs-only 判定を index.md / artifacts.json の両方で照合する fail-closed に強化                                  |
| `phase-spec-template.md`                                                                                                  | Task/Step 分離ガイドライン、NON_VISUAL 分岐、Phase 12 分離構造、Phase 11 の `discovered-issues.md` 必須化を追加 |
| `unassigned-task-template.md`                                                                                             | 苦戦箇所の必須記載欄を追加                                                                                      |
| `phase-11-manual-test.md`                                                                                                 | docs-only / spec_created の evidence ルール、`discovered-issues.md` 必須化を明確化                              |
| `phase-12-documentation.md`                                                                                               | root evidence / ledger parity / same-wave sync を明記                                                           |
| `phase12-task-spec-compliance-check.md`                                                                                   | completed / backlog の ledger parity を root evidence に追加                                                    |
| `index.md`                                                                                                                | 全 Phase へのリンク一覧を追加                                                                                   |

## 検証結果

| コマンド                                                        | 結果                                        |
| --------------------------------------------------------------- | ------------------------------------------- |
| `verify-all-specs`                                              | PASS                                        |
| `validate-phase-output`                                         | PASS                                        |
| `verify-unassigned-links`                                       | PASS                                        |
| `validate-phase12-implementation-guide`                         | PASS                                        |
| `quick_validate.js (.claude/skills/task-specification-creator)` | FAIL（500 行超過のため）                    |
| `quick_validate.js (.claude/skills/aiworkflow-requirements)`    | FAIL（500 行超過と description 超過のため） |

## 補足

- 仕様書は `spec_created` のまま維持し、`completed` へ置き換えない。
- `outputs/artifacts.json` を root `artifacts.json` と同期した。
- Phase 11 の `discovered-issues.md` は 0 件でも必須出力とした。
- 周辺 skill の quick validate は既存課題として残っているため、別途スコープで対処する。
