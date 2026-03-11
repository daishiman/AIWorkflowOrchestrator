# task-specification-creator 準拠台帳

| 観点                 | 反映先                      | 確認内容                                                                                       |
| -------------------- | --------------------------- | ---------------------------------------------------------------------------------------------- |
| create workflow 順序 | index.md, phase-1..3        | Phase 1-3 を先行設計し、その後に後続 Phase を配置した                                          |
| 必須セクション       | phase-1..13                 | `メタ情報 / 目的 / 実行タスク / 参照資料 / 成果物 / 完了条件` を全 Phase に記載した            |
| 品質基準             | index.md, phase-1..13       | 曖昧表現を避け、成果物パスと完了条件を検証可能な形に固定した                                   |
| review gate          | phase-3, phase-10           | PASS / MINOR / MAJOR / CRITICAL の戻り先を記載した                                             |
| Phase 11 ガイド      | phase-11                    | screenshot plan、matrix、issues を成果物へ固定した                                             |
| Phase 12 ガイド      | phase-12                    | implementation-guide、documentation-changelog、unassigned detection、skill feedback を固定した |
| Phase 12 実体確認    | phase-12                    | Part 1/2、unassigned、skill feedback、documentation changelog の必須成果物を固定した           |
| Phase 12 同期ルール  | phase-12                    | `task-workflow.md` / `lessons-learned.md` / `LOGS.md` / `SKILL.md` の同期を明記した            |
| spec update workflow | phase-12, index.md          | `spec_created` の扱い、Step 1-A/B/C、`.claude` 正本 root を明記した                            |
| artifact naming      | phase-1..13, artifacts.json | `outputs/phase-N/*.md` 命名に統一した                                                          |
| canonical root       | index.md, phase-12          | スキル参照は `.claude/skills/...` を正本として明記した                                         |
| validator 対応       | index.md                    | `validate-phase-output.js` と `verify-all-specs.js` の実行経路を明記した                       |
