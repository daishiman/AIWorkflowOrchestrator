# Phase 1 スコープ定義

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 |
| Phase    | 1                                               |
| 作成日   | 2026-03-24                                      |

## スコープ内（対象）

### 設計対象

| 領域                     | 対象物                                               | 成果物種別 |
| ------------------------ | ---------------------------------------------------- | ---------- |
| Approval Sheet           | 承認 UI の契約定義（表示条件、表示内容、承認フロー） | 設計契約   |
| AI Disclosure            | セッション開始時の AI 利用開示バナー契約             | 設計契約   |
| External Send Disclosure | 外部送信可能性の開示契約                             | 設計契約   |
| Advanced Console         | opt-in detail layer の露出条件と境界定義             | 設計契約   |
| Manual Boundary          | no auto-send / no hidden parsing の enforcement 定義 | 設計契約   |
| Compliance Guard         | consumer auth 非流用、規約適合の禁止事項             | 設計契約   |

### 対象ファイル（変更候補）

| ファイル                                                                     | 変更種別 | 理由                        |
| ---------------------------------------------------------------------------- | -------- | --------------------------- |
| `apps/desktop/src/main/ipc/terminalHandlers.ts`                              | 修正     | open flow の明示条件追加    |
| `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`            | 修正     | lane authority 拡張         |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`        | 修正     | handoff / disclosure bundle |
| `apps/desktop/src/preload/index.ts`                                          | 修正     | exposed API boundary 制限   |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`             | 修正     | advanced console gate       |
| `apps/desktop/src/renderer/components/execution/ApprovalSheet.tsx`           | 新規     | approval UI コンポーネント  |
| `apps/desktop/src/renderer/components/execution/SessionDisclosureBanner.tsx` | 新規     | AI / send disclosure UI     |
| `apps/desktop/src/renderer/components/execution/AdvancedConsolePanel.tsx`    | 新規     | opt-in raw terminal UI      |

### 対象 State Machine 連携

Task02 で定義済みの Session State Machine との連携ポイント:

| State         | Approval               | Disclosure          | Advanced Console  |
| ------------- | ---------------------- | ------------------- | ----------------- |
| collapsed     | -                      | -                   | -                 |
| ready         | 実行前に approval 表示 | session open で開示 | 非表示（default） |
| handoff       | handoff 前に approval  | handoff 理由を開示  | opt-in で表示可能 |
| running       | -（実行中は変更不可）  | 表示維持            | opt-in で表示可能 |
| done          | -                      | 表示維持            | opt-in で表示可能 |
| aborted       | -                      | 表示維持            | opt-in で表示可能 |
| unavailable   | -                      | -                   | -                 |
| guidance-only | -                      | guidance 固有の開示 | -                 |

## スコープ外（非対象）

| 項目                             | 理由                                               |
| -------------------------------- | -------------------------------------------------- |
| プロダクションコードの実装       | 本タスクは設計タスクであり、実装は後続タスクで行う |
| コミット・PR の作成              | ユーザー明示指示があるまで実行禁止                 |
| Task01 の route / label 変更     | Task01 完了済み。route 構造は変更しない            |
| Task02 の state machine 変更     | Task02 完了済み。state 定義は変更しない            |
| claude.ai consumer 認証の統合    | 採用しない（compliance baseline で明示禁止）       |
| raw terminal を front 主役にする | design-audit-matrix で棄却済み                     |
| transcript の自動 chat 化        | manual boundary 違反のため対象外                   |
| LLM Provider 選択 UI の変更      | TASK-LLM-MOD 系タスクのスコープ                    |
| Skill Creator の runtime 変更    | TASK-SC 系タスクのスコープ                         |

## 前提条件

| 前提                                       | 出所     | 状態 |
| ------------------------------------------ | -------- | ---- |
| ViewType `executionConsole` が定義済み     | Task01   | 完了 |
| `openExecutionConsole()` が統一エントリ    | Task01   | 完了 |
| Session State Machine (8 state) が定義済み | Task02   | 完了 |
| Manual Share Rail (3操作) が定義済み       | Task02   | 完了 |
| RuntimePolicyResolver が 3 パターン分岐    | 既存実装 | 完了 |
| safeInvoke / safeOn ホワイトリストが稼働中 | 既存実装 | 完了 |
