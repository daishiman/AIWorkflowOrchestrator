# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 12                                                 |
| Phase 名   | ドキュメント                                       |
| タスクID   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| 前提 Phase | Phase 11                                           |
| 後続 Phase | Phase 13（PR作成）                                 |
| ステータス | completed                                          |
| 作成日     | 2026-03-19                                         |
| 機能名     | chat-workspace-guidance-action-wiring              |

## 目的

Task04 の close-out を current facts に同期し、workflow / unassigned / canonical spec / lessons / skill mirror を同一 wave で閉じる。

## 実行タスク

- implementation guide: shared guidance 実装と residual follow-up を actual code ベースで記録
- system spec sync: `.claude` 正本と `.agents` mirror に Task04 close-out を反映
- workflow sync: standalone task root、Phase 状態、parent/downstream path を正規化
- unassigned formalization: 4件の follow-up を Markdown / backlog / completed ledger / lessons へ同期
- compliance: required 6 artifacts、4条件、30思考法、エレガント検証を記録

## 参照資料

| 参照資料              | パス                                                                                                          | 用途                           |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Task index            | docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md                          | Task04 close-out 状態確認      |
| Phase 11 result       | outputs/phase-11/manual-test-result.md                                                                        | screenshot evidence の引き継ぎ |
| canonical workflow    | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | Task04 close-out 反映先        |
| task workflow backlog | .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md                                    | follow-up 反映先               |
| lessons               | .claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md               | Phase12 教訓反映先             |

## 成果物

| 成果物               | パス                                                   | 内容                                        |
| -------------------- | ------------------------------------------------------ | ------------------------------------------- |
| 実装ガイド           | outputs/phase-12/implementation-guide.md               | current implementation と follow-up handoff |
| 仕様同期サマリー     | outputs/phase-12/system-spec-update-summary.md         | code / workflow / canonical sync 実績       |
| 更新履歴             | outputs/phase-12/documentation-changelog.md            | 同ターン更新履歴と Step 結果                |
| 未タスク検出         | outputs/phase-12/unassigned-task-detection.md          | 4件の formalization 結果                    |
| skill feedback       | outputs/phase-12/skill-feedback-report.md              | skill / LOGS / lessons への反映要点         |
| Phase12 準拠チェック | outputs/phase-12/phase12-task-spec-compliance-check.md | required outputs / 4条件 / 30思考法         |

## 完了条件

- [x] required 6 artifacts が揃っている
- [x] workflow root / completed ledger / backlog / lessons / mirror parity が同期されている
- [x] unassigned 4件が Markdown 実体付きで formalize されている
- [x] 4条件（矛盾なし・漏れなし・整合性あり・依存関係整合）を PASS と判定した
- [x] 思考リセット後のエレガント検証を記録した
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-12/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` が同期済み
- [x] 前Phaseの screenshot evidence を確認した上で実行した

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md)
