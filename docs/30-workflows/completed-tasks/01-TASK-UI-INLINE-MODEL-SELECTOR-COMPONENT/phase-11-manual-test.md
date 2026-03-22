# Phase 11: 手動テスト

## メタ情報

| 項目          | 内容                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 11                                                                                                                       |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                     |
| 作成日        | 2026-03-22                                                                                                               |
| 担当          | Codex                                                                                                                    |
| ステータス    | 完了（BLOCKED 記録済み）                                                                                                 |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-10-final-review.md` |

## 目的

shared component 単体で確認できる契約と、consumer surface 未統合のため現時点では確認できない視覚検証を切り分け、Phase 11 の blocker を明文化する。

## 実行タスク

- shared component 単体で確認できる contract を棚卸しする
- live surface の有無を確認し、visual blocker を記録する
- compile / vitest の実行結果を Phase 11 証跡へ反映する
- Task02/03 へ引き継ぐ screenshot plan を作成する

### シナリオ1: Store fallback と provider hydrate の確認

| 項目     | 内容                                                                               |
| -------- | ---------------------------------------------------------------------------------- |
| 目的     | `providers` prop 未指定時に store 経由で provider 一覧を取得できることを確認する   |
| 実施結果 | PASS                                                                               |
| 根拠     | `InlineModelSelector.test.tsx` に mount-time `fetchProviders` 呼び出し test を追加 |

### シナリオ2: provider 切替時の default model 選択と health refresh

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 目的     | provider click 時に default model が即時反映され、health refresh が走ることを確認する |
| 実施結果 | PASS                                                                                  |
| 根拠     | provider click contract と `useCheckLLMHealth` 呼び出し test を追加                   |

### シナリオ3: ChatView 上の live 視覚確認

| 項目     | 内容                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| 目的     | 実画面で dropdown 表示、compact 表示、current selection を視覚確認する                                           |
| 実施結果 | BLOCKED                                                                                                          |
| 根拠     | Task01 は shared component 作成のみ。ChatView mount は Task02 未実装のため current branch に live surface がない |

### シナリオ4: WorkspaceChatPanel 上の live 視覚確認

| 項目     | 内容                                                                                  |
| -------- | ------------------------------------------------------------------------------------- |
| 目的     | Workspace 側 surface で compact selector の視覚確認を行う                             |
| 実施結果 | BLOCKED                                                                               |
| 根拠     | WorkspaceChatPanel mount は Task03 未実装のため current branch に live surface がない |

### 補助確認

| 項目                 | 結果    | 備考                                                     |
| -------------------- | ------- | -------------------------------------------------------- |
| TypeScript compile   | PASS    | `pnpm exec tsc -p tsconfig.json --noEmit --pretty false` |
| targeted vitest 実行 | BLOCKED | `esbuild` の platform mismatch により起動前に停止        |

## 参照資料

### 前Phase成果物

| 資料名                | パス                                                                                                                     |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 10 最終レビュー | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-10-final-review.md` |

### 補助成果物

| 資料名           | パス                                                                                                                                      |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| manual checklist | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/manual-test-checklist.md` |
| manual result    | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/manual-test-result.md`    |
| screenshot plan  | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/screenshot-plan.json`     |

## 実行手順

1. shared component 単体で確認できる contract を test と実装の両面から確認する。
2. live surface の有無を確認し、mount 未完了の consumer task を blocker として記録する。
3. compile / test command の結果を blocker 含めて Phase 11 成果物へ反映する。

## 統合テスト連携

- shared component 単体で確認できる部分は `InlineModelSelector.test.tsx` と compile を証跡にする
- ChatView / WorkspaceChatPanel の live screenshot は consumer task 側で引き継ぐ

## 成果物

| 成果物                        | パス                                                                                                                                      | 説明                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 11 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-11-manual-test.md`                   | 手動テストと blocker 記録    |
| manual checklist              | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/manual-test-checklist.md` | 実施項目の棚卸し             |
| manual result                 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/manual-test-result.md`    | PASS/BLOCKED と証跡          |
| screenshot plan               | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/outputs/phase-11/screenshot-plan.json`     | Task02/03 へ引き継ぐ撮影計画 |

## 完了条件

- [x] shared component 単体で確認できる contract を記録した
- [x] live surface 不在による blocker を明記した
- [x] Phase 11 補助成果物 3 件を作成した
- [x] compile / test 環境差分を blocker として残した

## 次のPhase

- Phase 12: ドキュメント（`phase-12-documentation.md`）
