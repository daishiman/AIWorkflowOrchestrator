# Phase 9: 品質検証

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 9                                                      |
| Phase名    | 品質検証                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                |
| タスク名   | 会話基盤・セッション統合                               |
| 機能名     | chat-platform-unification                              |
| 前提Phase  | [phase-8-refactoring.md](./phase-8-refactoring.md)     |
| 後続Phase  | [phase-10-final-review.md](./phase-10-final-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

Task02 の基盤設計が UX、IPC 安全性、状態整合性、仕様抽出容易性の観点で妥当か確認する。

## 品質観点

- 応答途中の視覚フィードバック
- 会話履歴の破損防止
- IPC タイムアウトや中断時の安全性
- Workspace 文脈漏洩防止
- aiworkflow-requirements から根拠を逆引きできること

## 実行タスク

- Task 9-1: UX を監査する
- Task 9-2: security 契約を監査する
- Task 9-3: state integrity を監査する
- Task 9-4: spec extraction を監査する

## 参照資料

| 参照資料                     | パス                                                                                                                 | 内容               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------ |
| リファクタリングログ         | `outputs/phase-8/refactoring-log.md`                                                                                 | 最終構造           |
| adapter 境界監査             | `outputs/phase-8/adapter-boundary-audit.md`                                                                          | 境界整理結果       |
| 技術負債更新                 | `outputs/phase-8/technical-debt-update.md`                                                                           | 残課題             |
| 実装ログ                     | `outputs/phase-5/implementation-log.md`                                                                              | 実装正本           |
| Task01 spec extraction audit | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-9/spec-extraction-audit.md` | 抽出導線監査の前例 |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容               |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------ |
| llm-streaming           | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`           | stream UX / abort  |
| interfaces-chat-history | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | session integrity  |
| llm-workspace-chat-edit | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` | workspace boundary |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPC safety         |
| arch-state-management   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`   | ownership          |

## 実行手順

1. UX / security / state / extraction の 4 軸で品質監査する。
2. timeout / abort / context leak / history corruption のリスクを整理する。
3. aiworkflow-requirements の入口だけで今回必要な根拠へ到達できるか監査する。

## 統合テスト連携

| 観点       | 連携内容                                                           |
| ---------- | ------------------------------------------------------------------ |
| UX         | stream 中の partial feedback と retry 導線を手動テストへ引き継ぐ   |
| Security   | timeout / cancel / context leak を最終レビュー観点へ引き継ぐ       |
| Extraction | spec extraction audit の結果を Phase 12 system spec 更新へ引き継ぐ |

## 成果物

| 成果物               | パス                                         | 説明                    |
| -------------------- | -------------------------------------------- | ----------------------- |
| 品質レポート         | `outputs/phase-9/quality-report.md`          | 品質要約                |
| セキュリティ契約監査 | `outputs/phase-9/security-contract-audit.md` | timeout / leak / cancel |
| 仕様抽出監査         | `outputs/phase-9/spec-extraction-audit.md`   | aiworkflow 導線監査     |

## 完了条件

- [x] 重大な会話状態不整合がない
- [x] セキュリティ観点の懸念が整理済み
- [x] aiworkflow-requirements から必要仕様を引けるか判定されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-8-refactoring.md](./phase-8-refactoring.md)
- 後続: [phase-10-final-review.md](./phase-10-final-review.md)

## サブタスク管理

- [x] UX 監査
- [x] security 契約監査
- [x] extraction audit
- [x] 品質レポート作成

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] extraction audit が Phase 12 改善対象を指せる
- [x] timeout / history / context leak の懸念が整理されている

## 次のPhase

Phase 10: [phase-10-final-review.md](./phase-10-final-review.md)
