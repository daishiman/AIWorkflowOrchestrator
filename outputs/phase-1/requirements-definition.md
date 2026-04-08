# Phase 1: 要件定義書 — UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001

## タスク概要

`SkillLifecyclePanel.tsx` からテキストエリアを削除し、ウィザード遷移ボタンへ置き換える。

## 現状分析（Step 0 P50チェック結果）

| 対象                                       | 状態                              |
| ------------------------------------------ | --------------------------------- |
| `skill-lifecycle-request-input` textarea   | PR #2036で削除済み                |
| `skill-lifecycle-open-wizard-button`       | PR #2036で追加済み                |
| `skill-lifecycle-execution-input` textarea | 行1793に残存（本タスクで削除）    |
| `executionPrompt` state                    | 行438-440に残存（本タスクで削除） |

## 受け入れ基準

| AC番号 | 基準                                                          | 状態           |
| ------ | ------------------------------------------------------------- | -------------- |
| AC-1   | `skill-lifecycle-request-input` textarea が削除               | 完了済み       |
| AC-2   | `skill-lifecycle-execution-input` textarea が削除             | 本タスクで実施 |
| AC-3   | `data-testid="skill-lifecycle-open-wizard-button"` ボタン追加 | 完了済み       |
| AC-4   | `executionPrompt` state がコード上に残らない                  | 本タスクで実施 |
| AC-5   | 既存テストファイル6本が全てPASS                               | 本タスクで実施 |
| AC-6   | Phase 9 QA基準                                                | 本タスクで実施 |
| AC-7   | SkillCreateWizard本体実装なし                                 | スコープ外     |
| AC-8   | IPCチャンネル変更なし                                         | スコープ外     |

## スコープ

**含む:**

- `SkillLifecyclePanel.tsx` の `skill-lifecycle-execution-input` textarea削除
- `executionPrompt` state・ハンドラの削除
- `canExecuteSkill`・`handleExecute`・`handlePlanImprovement` の更新
- 既存テストファイル6本への `skill-lifecycle-execution-input` 非存在テスト追加

**含まない:**

- `SkillCreateWizard` 本体の実装
- IPCチャンネルの変更
