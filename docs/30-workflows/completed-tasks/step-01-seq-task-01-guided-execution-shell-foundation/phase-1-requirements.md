# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 1                                              |
| Phase名    | 要件定義                                       |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | なし                                           |
| 後続Phase  | Phase 2（設計）                                |
| ステータス | spec_created                                   |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

front naming、route、shared launcher、mainline entry の current gap を棚卸しし、実行コンソール foundation の要件を定義する。

## 実行タスク

- label inventory: `terminal` を front に露出している箇所を列挙する
- route inventory: `ViewType`、`App.tsx`、surface handler の current path を列挙する
- CTA drift inventory: no-op / `agent` 代替 / 未配線 CTA を列挙する
- AC 定義: naming、route、shared action、no-op 排除の受入基準を定義する

## 参照資料

| 参照資料        | パス                                                                                    | 内容                     |
| --------------- | --------------------------------------------------------------------------------------- | ------------------------ |
| root index      | `docs/30-workflows/guided-execution-console-realization/index.md`                       | pack 方針                |
| root UX         | `docs/30-workflows/guided-execution-console-realization/ui-ux-realization.md`           | front naming と CTA 契約 |
| store types     | `apps/desktop/src/renderer/store/types.ts`                                              | `ViewType` 現状          |
| App             | `apps/desktop/src/renderer/App.tsx`                                                     | view routing 現状        |
| ChatPanel       | `apps/desktop/src/renderer/components/chat/ChatPanel.tsx`                               | current fallback 現状    |
| guidance banner | `apps/desktop/src/renderer/views/ChatView/LLMGuidanceBanner.tsx`                        | guidance action 現状     |
| workspace panel | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                  | workspace entry 現状     |
| unassigned      | `docs/30-workflows/unassigned-task/ut-viewtype-terminal-addition.md`                    | route GAP                |
| unassigned      | `docs/30-workflows/unassigned-task/UT-IMP-CHAT-WORKSPACE-GUIDANCE-OPEN-TERMINAL-001.md` | CTA GAP                  |

## 実行手順

### ステップ1: P50チェック

```bash
git log --oneline -10 -- apps/desktop/src/renderer/store/types.ts
git log --oneline -10 -- apps/desktop/src/renderer/App.tsx
rg -n "terminal|open-terminal|setCurrentView\\(\"agent\"\\)|setCurrentView\\(\"terminal\"\\)" apps/desktop/src/renderer -S
```

### ステップ2: front label を棚卸しする

`terminal`、`terminal を開く`、`agent` 代替、`実行コンソール` を分けて列挙する。

### ステップ3: route と CTA の current drift を記録する

どの surface が `openExecutionConsole()` の正本になるべきかを定めるため、未配線と代替遷移を記録する。

## 統合テスト連携

Task01 は route / CTA / label の整合を主に扱う。Phase 4 以降では `renderView`、button click、shared dispatcher を統合テスト対象に含める。

## 成果物

| 成果物          | パス                                         | 説明                            |
| --------------- | -------------------------------------------- | ------------------------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md` | Task01 の FR/NFR/AC             |
| スコープ定義    | `outputs/phase-1/scope-definition.md`        | Task01 の対象 / 非対象          |
| spec 抽出マップ | `outputs/phase-1/spec-extraction-map.md`     | code anchor と system spec 対応 |

## 完了条件

- [ ] front naming の current drift が列挙されている
- [ ] route / CTA の current drift が列挙されている
- [ ] AC-1〜AC-4 が検証可能な文章で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
