# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| Phase名    | テスト作成                                                    |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                    |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 3（設計レビュー） |
| 後続Phase  | Phase 5（実装）                                               |
| ステータス | not_started                                                   |
| 作成日     | 2026-03-13                                                    |
| 機能名     | main-chat-settings-runtime-sync                               |

## 目的

selector / prompt / settings / health の回帰テスト仕様を作る。

## 実行タスク

- テスト観点整理: selected config、system prompt、health、RAG state、access capability 切替のケースを整理する
- ケース作成: Renderer / Main / IPC の層ごとにケースを定義する
- 欠落洗い出し: screenshot と integration の不足点を列挙する

## 参照資料

| 参照資料                | パス                                                                           | 内容                           |
| ----------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| Phase 1（要件定義）     | `phase-1-requirements.md`                                                      | 依存する前提成果物を確認する   |
| Phase 2（設計）         | `phase-2-design.md`                                                            | 依存する前提成果物を確認する   |
| Phase 3（設計レビュー） | `phase-3-design-review.md`                                                     | 依存する前提成果物を確認する   |
| ChatView tests          | `apps/desktop/src/renderer/views/ChatView/ChatView.test.tsx`                   | main chat 既存テストを確認する |
| LLMSelectorPanel tests  | `apps/desktop/src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx` | selector 既存テストを確認する  |
| SettingsView tests      | `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`           | settings 既存テストを確認する  |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、既存テストを確認し、Main Chat / Settings / Selector / System Prompt の runtime 同期 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

テスト作成 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

Main / Renderer / IPC の三層で selected config、system prompt、health、RAG state を検証対象に含める。

## 成果物

| 成果物           | パス                             | 内容                           |
| ---------------- | -------------------------------- | ------------------------------ |
| テストマトリクス | `outputs/phase-4/test-matrix.md` | 主要ケースと責務境界を整理する |

## 完了条件

- [ ] 主要ケースが selector / prompt / settings / health を含んでいる

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md) に進む
