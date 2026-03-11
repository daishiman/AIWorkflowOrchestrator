# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 6                              |
| Phase名      | テスト拡充                     |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 5                        |
| 後続Phase    | Phase 7                        |
| 担当SubAgent | SubAgent-D                     |

## 目的

Phase 5 で Green になった実装へ回帰観点と境界条件を追加し、timeline 化で壊れやすい箇所を補強する。

## 実行タスク

- 回帰ケース追加: 既存 HistorySearchView の search / append / reset 回帰を追加する
- 境界ケース追加: invalid timestamp、empty metadata、duplicate append、trim query を追加する
- UI詳細ケース追加: sticky header、accordion toggle、zero state copy を追加する
- 統合ケース追加: ChatHistoryView link、file open link、skill detail 表示を追加する

## 参照資料

| 参照資料          | パス                                                                | 内容           |
| ----------------- | ------------------------------------------------------------------- | -------------- |
| Phase 4 成果物    | `outputs/phase-4/`                                                  | 初期 test 設計 |
| Phase 5 成果物    | `outputs/phase-5/`                                                  | 実装結果       |
| 現行 slice test   | `apps/desktop/src/renderer/store/slices/historySearchSlice.test.ts` | 回帰基点       |
| 現行 handler test | `apps/desktop/src/main/ipc/__tests__/historySearchHandlers.test.ts` | IPC 回帰基点   |

### システム仕様（aiworkflow-requirements）

| 参照資料 | パス                                                                        | 内容                               |
| -------- | --------------------------------------------------------------------------- | ---------------------------------- |
| quality  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | 回帰 test 基準                     |
| lessons  | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`      | push dedupe、filter 継承の再発防止 |

## 実行手順

### ステップ1: 壊れやすい境界を列挙

timestamp 正規化、append 順序、observer 発火、accordion 切替、query trim の境界を一覧化する。

### ステップ2: 回帰ケースを追加

既存の happy path に加え、境界ケースと導線ケースを test matrix に追記する。

### ステップ3: 実行順序を固定

slice、hook、component、integration の順で test を追加し、fail source を切り分けやすくする。

## 統合テスト連携

- 既存 056c 系 test を壊さない回帰群として維持する
- store、IPC、preload、view の 4 層を横断したケースを追加対象へ含める
- Phase 11 の手動導線と同じ TC を自動 test にも一部反映する

## 成果物

| 成果物                | パス                                            | 説明                |
| --------------------- | ----------------------------------------------- | ------------------- |
| 回帰拡充計画          | `outputs/phase-6/regression-expansion-plan.md`  | 追加ケース一覧      |
| hook/component matrix | `outputs/phase-6/hook-component-test-matrix.md` | hook と UI の試験表 |
| edge case plan        | `outputs/phase-6/edge-case-test-plan.md`        | 境界条件一覧        |

## 完了条件

- [x] 回帰、境界、導線の追加ケースが整理されている
- [x] 既存 test と新規 test の責務境界が明記されている
- [x] unstable になりやすいケースへ対策が付いている
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク           | 結果      | 備考                                        |
| ---------------- | --------- | ------------------------------------------- |
| 回帰ケース追加   | completed | search / append / reset を更新              |
| 境界ケース追加   | completed | invalid timestamp / duplicate / trim を追加 |
| UI詳細ケース追加 | completed | accordion / zero state / sticky を追加      |
| 統合ケース追加   | completed | file open 導線まで確認                      |

### 発見事項

- 良かった点: timeline 化で壊れやすい箇所を hook 単位で独立検証できた
- 問題点: visual polish は自動 test だけでは判断できない
- 改善提案: mobile sticky の visual regression 追加を検討

### 次Phaseへの引き継ぎ事項

- Phase 7 では task-scope coverage で定量評価し、視覚品質は Phase 11 に委譲する

## 次のPhase

Phase 7: テストカバレッジ確認へ進む。
