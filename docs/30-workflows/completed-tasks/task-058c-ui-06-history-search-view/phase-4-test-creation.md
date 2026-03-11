# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 4                              |
| Phase名      | テスト作成                     |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 3                        |
| 後続Phase    | Phase 5                        |
| 担当SubAgent | SubAgent-B, SubAgent-C         |

## 目的

058c の再設計要件を test first で固定し、UI、hook、slice、IPC 契約の失敗条件を先に定義する。

## 実行タスク

- UIテスト仕様作成: search bar、timeline group、accordion、zero state の失敗条件を定義する
- Hookテスト仕様作成: debounce、grouping、IntersectionObserver の試験条件を定義する
- Storeテスト仕様作成: `historySearchSlice` の state 遷移と selector 契約を定義する
- IPC契約試験作成: `history:search` / `history:get-stats` の request / response を定義する
- 手動試験草案作成: Phase 11 で使う TC-ID を先に確定する

## 参照資料

| 参照資料        | パス                                                                           | 内容           |
| --------------- | ------------------------------------------------------------------------------ | -------------- |
| Phase 1 成果物  | `outputs/phase-1/`                                                             | 要件と受入基準 |
| Phase 2 成果物  | `outputs/phase-2/`                                                             | 設計詳細       |
| Phase 2 仕様    | `phase-2-design.md`                                                            | 設計基準       |
| Phase 3 仕様    | `phase-3-design-review.md`                                                     | 監査結果       |
| 現行 view test  | `apps/desktop/src/renderer/views/HistorySearchView/HistorySearchView.test.tsx` | 既存回帰点     |
| 現行 slice test | `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts`            | state 回帰点   |
| 現行 IPC test   | `apps/desktop/src/main/ipc/__tests__/historySearchHandlers.test.ts`            | handler 回帰点 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                                 |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------ |
| 品質基準           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | coverage と test 戦略                |
| 履歴 UI            | `.claude/skills/aiworkflow-requirements/references/ui-history-design.md`                    | loading、error、a11y test 観点       |
| IPC                | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                       | response envelope test               |
| component test     | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | `fireEvent` / `userEvent` と環境選択 |
| accessibility test | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | keyboard / aria test 観点            |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IntersectionObserver mock 観点       |
| lessons            | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | unstable test の再発防止             |

## 実行手順

### ステップ1: UI失敗条件の列挙

timeline 不在、group label 誤り、accordion 非展開、zero state 不一致、link 誤遷移を失敗条件へ変換する。

### ステップ2: Hook と observer の試験定義

300ms debounce、`threshold: 0.1`、`rootMargin: 0px 0px 200px 0px`、query trim、loadMore の filter 継承を検証項目へ固定する。

### ステップ3: Slice と IPC の契約試験定義

`expandedItemId` 切替、append 動作、error surface、stats の要否、invoke response の失敗時処理を表へまとめる。

### ステップ4: manual test 草案作成

Phase 11 の TC-ID、期待結果、必要 screenshot を前倒しで定義する。

## 統合テスト連携

- component test: search bar、timeline group、item card、empty state を対象にする
- hook test: debounce、grouping、observer を対象にする
- store / IPC test: `historySearchSlice`、`historySearchHandlers`、preload channel を対象にする
- navigation test: ChatHistoryView / EditorView 導線の click 後挙動を対象にする

## 成果物

| 成果物                 | パス                                              | 説明                          |
| ---------------------- | ------------------------------------------------- | ----------------------------- |
| テスト仕様書           | `outputs/phase-4/test-specification.md`           | 全体 test 方針                |
| ケース一覧             | `outputs/phase-4/test-case-matrix.md`             | UI、hook、slice、IPC のケース |
| Store/IPC 契約試験計画 | `outputs/phase-4/store-ipc-contract-test-plan.md` | state と handler 試験         |
| 手動試験草案           | `outputs/phase-4/manual-test-draft.md`            | Phase 11 入力                 |

## TDD検証

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/HistorySearchView/HistorySearchView.test.tsx \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/__tests__/historySearchHandlers.test.ts \
  src/preload/channels.test.ts
```

- [x] Red 状態の failure 条件が先に定義されている
- [x] UI、hook、slice、IPC の失敗 test が分離されている

## 完了条件

- [x] UI、hook、slice、IPC の失敗条件が全て定義されている
- [x] debounce、observer、accordion の不安定点に test 手順がある
- [x] manual test の TC-ID が Phase 11 へ渡せる形で定義されている
- [x] 既存 test の置換と追加の境界が明記されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク              | 結果      | 備考                                                    |
| ------------------- | --------- | ------------------------------------------------------- |
| UIテスト仕様作成    | completed | `test-specification.md` と `test-case-matrix.md` に整理 |
| Hookテスト仕様作成  | completed | `test-case-matrix.md` に反映                            |
| Storeテスト仕様作成 | completed | `store-ipc-contract-test-plan.md` に反映                |
| IPC契約試験作成     | completed | trim / envelope 観点を固定                              |
| 手動試験草案作成    | completed | `manual-test-draft.md` に TC-ID を移送                  |

### 発見事項

- 良かった点: manual test と自動 test の境界を早期に分離できた
- 問題点: preload/types drift は test だけでは拾いきれない
- 改善提案: renderer / preload の型比較スクリプトを追加したい

### 次Phaseへの引き継ぎ事項

- Phase 5 では shared/preload 契約と slice を先に直し、その後 UI を差し替える

## 次のPhase

Phase 5: 実装へ進む。
