# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Phase      | 9                                                                                              |
| Phase名    | 品質検証                                                                                       |
| タスクID   | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001                                                     |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング） |
| 後続Phase  | Phase 10（最終レビュー）                                                                       |
| ステータス | not_started                                                                                    |
| 作成日     | 2026-03-13                                                                                     |
| 機能名     | main-chat-settings-runtime-sync                                                                |

## 目的

同期設計が UX / security / state 整合を満たすか確認する。

## 実行タスク

- 品質確認: UX、state 整合、guidance、disabled state の品質観点を確認する
- 欠陥整理: drift / stale state / misleading UI の検出観点を整理する

## 参照資料

| 参照資料        | パス                                                                     | 内容                                      |
| --------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| Phase 5（実装） | `phase-5-implementation.md`                                              | 実配線後の品質観点を確認する              |
| ChatView        | `apps/desktop/src/renderer/views/ChatView/index.tsx`                     | main chat UX の品質観点を確認する         |
| SettingsView    | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                 | settings guidance と表示 drift を確認する |
| AuthKeySection  | `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` | Anthropic auth key 表示品質を確認する     |

## 統合テスト連携

UI drift、silent fallback、misleading health 表示を横断観点で確認する。

## 成果物

| 成果物            | パス                              | 内容                         |
| ----------------- | --------------------------------- | ---------------------------- |
| QA チェックリスト | `outputs/phase-9/qa-checklist.md` | 品質観点と確認項目を整理する |

## 完了条件

- [ ] misleading UI と stale state の検出観点が含まれている

## 次のPhase

- [Phase 10（最終レビュー）](./phase-10-final-review.md) に進む
