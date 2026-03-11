# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 |
| Phase      | 9                                         |
| Phase名    | 品質検証                                  |
| ステータス | completed                                 |
| 前提Phase  | Phase 8                                   |
| 後続Phase  | Phase 10                                  |

## 目的

token 設計と実装が light theme 品質改善に寄与しているかを評価する。

## 実行タスク

- タスク1: contrast 目標との整合を確認する
- タスク2: token 契約の再利用性を確認する
- タスク3: shared migration task への前提引き渡しを確認する

## 参照資料

| 参照資料             | パス                                                                                                  | 説明                        |
| -------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------- |
| Token role matrix    | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-2/token-role-matrix.md` | 品質評価基準                |
| Phase 5 成果物       | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-5/`                     | 実装差分                    |
| Coverage report      | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-7/coverage-report.md`   | テスト充足状況              |
| UI design principles | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                        | contrast / hierarchy の基準 |
| Lessons learned      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                | 再発防止観点                |

## 統合テスト連携

| 観点                     | 連携内容                                           |
| ------------------------ | -------------------------------------------------- |
| Quality gate             | Phase 10 の AC 判定に渡す品質結果を整理する        |
| Shared migration handoff | component 移行 task が参照する前提条件を明文化する |
| Evidence                 | 手動テスト前に確認すべき代表画面を Phase 11 へ渡す |

## 成果物

| 成果物         | パス                                                                                               |
| -------------- | -------------------------------------------------------------------------------------------------- |
| quality-report | `docs/30-workflows/completed-tasks/light-theme-token-foundation/outputs/phase-9/quality-report.md` |

## 完了条件

- [x] token 品質改善の説明が可能
- [x] shared migration task の入力条件が整っている

## 次Phase

Phase 10: 最終レビュー
