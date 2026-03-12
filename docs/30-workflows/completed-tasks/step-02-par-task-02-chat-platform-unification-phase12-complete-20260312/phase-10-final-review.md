# Phase 10: 最終レビュー

## メタ情報

| 項目       | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| Phase      | 10                                                             |
| Phase名    | 最終レビュー                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                        |
| タスク名   | 会話基盤・セッション統合                                       |
| 前提Phase  | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) |
| 後続Phase  | [phase-11-manual-test.md](./phase-11-manual-test.md)           |
| ステータス | completed                                                      |
| 作成日     | 2026-03-12                                                     |

## 目的

Task02 が Task03 の基盤として十分か、追加の独自チャット実装を不要にできるか判定する。

## 実行タスク

- common platform review: 3 モードが同一基盤に乗る説明が成立しているかを確認する
- Task03 review: Task03 が独自 session / streaming 実装を増やさずに済むかを確認する
- archive split review: current workflow と completed archive の関係が明確かを確認する
- follow-up review: revive / handoff の未タスク化が必要かを確認する

## 参照資料

| 参照資料           | パス                                         | 内容         |
| ------------------ | -------------------------------------------- | ------------ |
| requirements       | `outputs/phase-1/requirements-definition.md` | 要件正本     |
| session model      | `outputs/phase-2/session-model.md`           | session 契約 |
| implementation log | `outputs/phase-5/implementation-log.md`      | 実装差分     |
| quality report     | `outputs/phase-9/quality-report.md`          | 品質判定     |
| quality issues     | `outputs/phase-9/quality-issues.md`          | 懸念一覧     |
| design review      | `outputs/phase-3/design-review-result.md`    | 初期判定     |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                         | 内容           |
| --------------------- | ---------------------------------------------------------------------------- | -------------- |
| task-workflow         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 台帳判定       |
| lessons learned       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | 再利用知見     |
| arch-state-management | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | ownership 正本 |

## 統合テスト連携

| 観点       | 連携内容                                         |
| ---------- | ------------------------------------------------ |
| final gate | Phase 11 のシナリオへ最終論点を引き継ぐ          |
| follow-up  | Phase 12 の未タスク検出へ pending 論点を引き継ぐ |

## 成果物

| 成果物           | パス                                        | 説明           |
| ---------------- | ------------------------------------------- | -------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`   | Go / Hold 判定 |
| レビュー論点一覧 | `outputs/phase-10/final-review-findings.md` | 残論点         |

## 完了条件

- [x] Task03 で別基盤を作る必要がないか判定されている
- [x] current/archive split の扱いがレビュー結果に含まれている
- [x] follow-up 未タスクの要否が判定されている
- [x] Phase 11 に持ち込む論点が整理されている
