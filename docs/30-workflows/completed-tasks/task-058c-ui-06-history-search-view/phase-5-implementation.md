# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 5                              |
| Phase名      | 実装                           |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 4                        |
| 後続Phase    | Phase 6                        |
| 担当SubAgent | SubAgent-B, SubAgent-C         |

## 目的

Phase 4 の失敗 test を Green へ進める実装順序を固定し、UI、Store、IPC、shared types の変更を安全な単位へ分割する。

## 実行タスク

- 実装順序策定: shared types、slice、hooks、view、tests の順序を固定する
- 変更ファイル整理: 触るファイルと触らないファイルを列挙する
- ロールバック条件定義: filter 廃止や stats 扱い変更で戻す条件を定義する
- 導入境界整理: timeline 化と shared type 追加を分けて記録する

## 参照資料

| 参照資料      | パス                                                           | 内容                 |
| ------------- | -------------------------------------------------------------- | -------------------- |
| Phase 4 仕様  | `phase-4-test-creation.md`                                     | 実装の入力           |
| 現行 view     | `apps/desktop/src/renderer/views/HistorySearchView/index.tsx`  | UI差分               |
| 現行 store    | `apps/desktop/src/renderer/store/slices/historySearchSlice.ts` | state 差分           |
| store exports | `apps/desktop/src/renderer/store/index.ts`                     | selector export 差分 |
| shared types  | `packages/shared/src/types/index.ts`                           | export 追加箇所      |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                            | 内容                      |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------- |
| directory structure | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`      | 配置規約                  |
| state 管理          | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state 境界                |
| UI実装正本          | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | 現行実装差分              |
| API実装状況         | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`            | Step 1-B の実装状況表     |
| Preload security    | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`    | expose 面の変更境界       |
| 会話履歴I/F         | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | Chat 詳細導線の data 契約 |
| security            | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`    | IPC 変更境界              |

## 実行手順

### ステップ1: 変更ファイルを固定

`views/HistorySearchView/`, `store/slices/historySearchSlice.ts`, `store/index.ts`, `main/ipc/historySearchHandlers.ts`, `preload/channels.ts`, `packages/shared/src/types/` の変更可否を表へまとめる。

### ステップ2: 実装順序を定義

shared types → slice → hooks → UI components → navigation link → tests の順で変更する方針を記載する。

### ステップ3: ロールバック条件を定義

ChatHistoryView 導線が壊れた場合、observer 追補が不安定な場合、search response と型がずれた場合の戻し先を明記する。

## 統合テスト連携

- shared → preload → main → renderer の順で契約差分を当てる
- `historySearchSlice.test.ts` と `historySearchHandlers.test.ts` を実装途中の防波堤にする
- ChatHistoryView と EditorView への遷移が regression test で観測できるようにする

## 成果物

| 成果物                 | パス                                          | 説明               |
| ---------------------- | --------------------------------------------- | ------------------ |
| 実装計画               | `outputs/phase-5/implementation-plan.md`      | 実装順序           |
| 変更計画               | `outputs/phase-5/change-plan.md`              | ファイル別変更内容 |
| 変更ファイル一覧       | `outputs/phase-5/affected-files-list.md`      | touch 範囲         |
| ブランチ反映マトリクス | `outputs/phase-5/branch-reflection-matrix.md` | 変更と成果物の対応 |

## TDD検証

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/HistorySearchView/HistorySearchView.test.tsx \
  src/renderer/store/slices/historySearchSlice.test.ts \
  src/main/ipc/__tests__/historySearchHandlers.test.ts
```

- [x] Green 状態へ進む最小実装単位が定義されている
- [x] renderer 直実装前に shared type と state 契約を固定している

## 完了条件

- [x] shared types、slice、UI の実装順序が固定されている
- [x] 変更対象ファイルと非対象ファイルが分離されている
- [x] ロールバック条件が具体的に定義されている
- [x] Phase 6 が参照する regression 観点が記録されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク               | 結果      | 備考                                                     |
| -------------------- | --------- | -------------------------------------------------------- |
| 実装順序策定         | completed | `implementation-plan.md` に反映                          |
| 変更ファイル整理     | completed | `affected-files-list.md` に反映                          |
| ロールバック条件定義 | completed | `implementation-plan.md` と `rollback-review.md` に反映  |
| 導入境界整理         | completed | `change-plan.md` と `branch-reflection-matrix.md` に反映 |

### 発見事項

- 良かった点: shared/preload → store → UI の順で大きな手戻りなく進められた
- 問題点: file deep-open は追加 state が必要だった
- 改善提案: 次回は editor open intent を共通パターン化したい

### 次Phaseへの引き継ぎ事項

- Phase 6 では trim、dedupe、observer、navigation の回帰を厚くする

## 次のPhase

Phase 6: テスト拡充へ進む。
