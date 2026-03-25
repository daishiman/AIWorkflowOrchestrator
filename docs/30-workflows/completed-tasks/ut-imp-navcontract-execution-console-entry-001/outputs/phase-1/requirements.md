# Phase 1: 要件定義 — 成果物

## タスク情報

- タスクID: UT-IMP-NAVCONTRACT-EXECUTION-CONSOLE-ENTRY-001
- 作成日: 2026-03-24

## P50チェック結果

| チェック項目                                  | 結果                          |
| --------------------------------------------- | ----------------------------- |
| ViewType に executionConsole が存在するか     | 存在する（store/types.ts:20） |
| DockViewType に executionConsole が存在するか | **未追加**（ブロッカー）      |
| NAV_SECTIONS に executionConsole が存在するか | **未追加**（ブロッカー）      |
| IconName に play-circle が存在するか          | **未追加**（前提条件）        |
| NAV_SHORTCUT_TO_VIEW に登録されているか       | **未登録**                    |

## 機能要件

| ID    | 要件                                                             | 優先度 |
| ----- | ---------------------------------------------------------------- | ------ |
| FR-01 | DockViewType union に "executionConsole" を追加する              | 必須   |
| FR-02 | NAV_SECTIONS の sub セクションに実行コンソールエントリを追加する | 必須   |
| FR-03 | NAV_SHORTCUT_TO_VIEW に Cmd+9 → executionConsole を登録する      | 必須   |
| FR-04 | IconName に "play-circle" を追加し Lucide PlayCircle と紐付ける  | 必須   |
| FR-05 | 既存テストの期待値を更新する                                     | 必須   |

## 非機能要件

| ID     | 要件                                                   | 優先度 |
| ------ | ------------------------------------------------------ | ------ |
| NFR-01 | pnpm --filter @repo/desktop typecheck が PASS すること | 必須   |
| NFR-02 | 既存の navContract テストが全て PASS すること          | 必須   |
| NFR-03 | P32 準拠: ViewType と DockViewType の型整合を維持      | 必須   |

## 受入基準

- AC-1: grep "executionConsole" navContract.ts が 3 件以上ヒット
- AC-2: pnpm --filter @repo/desktop typecheck PASS
- AC-3: GlobalNavStrip に実行コンソールの nav item が表示される
- AC-4: 全テスト PASS
