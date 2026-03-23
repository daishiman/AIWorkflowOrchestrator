# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| Phase名    | 実装                                           |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 1-4                                      |
| 後続Phase  | Phase 6（テスト拡充）                          |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

Task01 に必要な変更対象ファイル、実装順序、影響範囲を実装者向けに定義する。

## 実行タスク

- `ViewType` と route owner の更新方針を定義する
- shared `openExecutionConsole()` action の配置を定義する
- App Shell / Chat / Workspace / Skill Creator の wiring 更新順を定義する

## 参照資料

- 依存Phase: Phase 4
- task 設計: `phase-4-test-creation.md`
- root pack: `../../phase-5-implementation.md`
- root UX: `../../ui-ux-realization.md`

## 変更対象ファイル一覧

| ファイル                                                               | 変更種別 | 目的                    |
| ---------------------------------------------------------------------- | -------- | ----------------------- |
| `apps/desktop/src/renderer/store/types.ts`                             | 修正     | route type 追加         |
| `apps/desktop/src/renderer/App.tsx`                                    | 修正     | render view 追加        |
| `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`              | 修正     | fallback 除去           |
| `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`       | 修正     | secondary action wiring |
| `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx` | 修正     | shared open action 統合 |
| `apps/desktop/src/renderer/utils/runtimeAccess.ts`                     | 修正     | launcher helper 正規化  |
| `apps/desktop/src/renderer/views/ExecutionConsoleView/index.tsx`       | 新規     | route 先 surface        |

## 実行手順

### ステップ1: route owner を先に実装する

`ViewType` と `App.tsx` を先に整え、遷移先不在の状態をなくす。

### ステップ2: shared action を実装する

各 surface 固有 handler ではなく shared action を経由させる。

### ステップ3: CTA wiring を surface ごとに反映する

App Shell → Chat → Workspace → Skill Creator の順で接続する。

## 統合テスト連携

実装後は route / CTA / label の既存テストを先に実行し、回帰なしを確認する。

## 成果物

| 成果物   | パス                                     | 説明           |
| -------- | ---------------------------------------- | -------------- |
| 実装計画 | `outputs/phase-5/implementation-plan.md` | 実装順序       |
| 変更範囲 | `outputs/phase-5/file-change-scope.md`   | file ownership |

## 完了条件

- [ ] route 先不在を解消する順序が定義されている
- [ ] shared action の配置先が定義されている
- [ ] file ownership が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 6（テスト拡充）](./phase-6-test-expansion.md)
