# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| Phase      | 5                                                                                    |
| Phase名    | 実装                                                                                 |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                           |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー）、Phase 4（テスト作成） |
| 後続Phase  | Phase 6（テスト拡充）                                                                |
| ステータス | not_started                                                                          |
| 作成日     | 2026-03-13                                                                           |
| 機能名     | main-chat-settings-runtime-sync                                                      |

## 目的

実装順序と変更境界を具体化する。

## 実行タスク

- Main 側整理: selected config / health / prompt authority の集約順序を定義する
- Renderer 側整理: ChatView / selector / Settings の handoff 順序を定義する
- 失敗系整理: fail-fast / guidance / disabled state の反映順序を定義する

## 参照資料

| 参照資料              | パス                                                     | 内容                                                         |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| Phase 2（設計）       | `phase-2-design.md`                                      | 実装順序の元になる設計を確認する                             |
| Phase 4（テスト作成） | `phase-4-test-creation.md`                               | 先に満たすべきテスト仕様を確認する                           |
| aiHandlers            | `apps/desktop/src/main/ipc/aiHandlers.ts`                | `AI_CHAT` / `AI_CHECK_CONNECTION` の current path を確認する |
| llmConfigProvider     | `apps/desktop/src/main/ipc/llmConfigProvider.ts`         | selected config authority を確認する                         |
| SettingsView          | `apps/desktop/src/renderer/views/SettingsView/index.tsx` | settings 側の影響範囲を確認する                              |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、テスト仕様を確認し、Main Chat / Settings / Selector / System Prompt の runtime 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

実装 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

selected config、system prompt、health / RAG state の反映順序が test matrix と一致するように整理する。

## 成果物

| 成果物   | パス                                     | 内容                                           |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 変更順序、影響範囲、ロールバック観点を整理する |

## 完了条件

- [ ] Main / Renderer / IPC の変更順序が定義されている

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md) に進む
