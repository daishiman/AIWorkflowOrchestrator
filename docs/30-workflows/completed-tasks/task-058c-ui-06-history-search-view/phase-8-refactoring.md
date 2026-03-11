# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-UI-06-HISTORY-SEARCH-VIEW |
| Phase        | 8                              |
| Phase名      | リファクタリング               |
| カテゴリ     | UI改善                         |
| ステータス   | completed                      |
| 前提Phase    | Phase 7                        |
| 後続Phase    | Phase 9                        |
| 担当SubAgent | SubAgent-B, SubAgent-C         |

## 目的

timeline 化に伴って増えた view ロジックを component、hook、selector 単位へ整理し、将来のカード追加や metadata 拡張に耐える構造へ整える。

## 実行タスク

- view 責務整理: `index.tsx` から group と card の責務を切り出す
- state shape 見直し: `historySearchSlice` の責務過多を点検する
- 再利用部品抽出: date group、empty state、sentinel の再利用性を確認する
- 文言整理: copy の重複を削減する

## 参照資料

| 参照資料       | パス                                     | 内容             |
| -------------- | ---------------------------------------- | ---------------- |
| Phase 1 成果物 | `outputs/phase-1/`                       | 要件と対象外境界 |
| Phase 2 成果物 | `outputs/phase-2/architecture-design.md` | 目標構造         |
| Phase 5 成果物 | `outputs/phase-5/`                       | 実装結果         |
| Phase 6 成果物 | `outputs/phase-6/`                       | 回帰拡充結果     |
| Phase 7 成果物 | `outputs/phase-7/gap-analysis.md`        | 改善候補         |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                            | 内容                   |
| ------------ | ------------------------------------------------------------------------------- | ---------------------- |
| architecture | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selector 境界          |
| UI基盤       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | component 責務の揃え方 |

## 実行手順

### ステップ1: 責務過多を洗い出す

view、hook、slice それぞれで 1 ファイルが抱えすぎているロジックを列挙する。

### ステップ2: 抽出方針を決める

timeline group、item card、observer hook、copy constants の切り出し案を整理する。

### ステップ3: 保守性観点で再確認

新しい card type を 1 種追加したときの変更面積を測り、構造を再点検する。

## 統合テスト連携

- refactor 前後で Phase 6-7 の regression / coverage が維持されることを条件にする
- observer、accordion、navigation link の試験を refactor 後にも継続させる
- shared type export と renderer component の依存方向が崩れていないかを確認する

## 成果物

| 成果物                     | パス                                            | 説明               |
| -------------------------- | ----------------------------------------------- | ------------------ |
| refactor plan              | `outputs/phase-8/refactor-plan.md`              | 責務整理方針       |
| component boundary cleanup | `outputs/phase-8/component-boundary-cleanup.md` | component 分割方針 |
| state shape review         | `outputs/phase-8/state-shape-review.md`         | slice 再確認       |

## TDD検証

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/views/HistorySearchView/HistorySearchView.test.tsx \
  src/renderer/store/slices/historySearchSlice.test.ts
```

- [x] Refactor 後も Green 状態を維持する
- [x] component / hook / slice の責務分離が test から見える

## 完了条件

- [x] view、hook、slice の責務分離方針が定義されている
- [x] card type 拡張に耐える構造になっている
- [x] copy と conditional 分岐の重複削減方針がある
- [x] 本Phase内の全タスクを100%実行完了

## Phase実行記録

### 実行タスク

| タスク             | 結果      | 備考                                    |
| ------------------ | --------- | --------------------------------------- |
| view 責務整理      | completed | page / component / hook 境界を整理      |
| state shape 見直し | completed | `state-shape-review.md` に反映          |
| 再利用部品抽出     | completed | search / empty / sentinel / card を分離 |
| 文言整理           | completed | `constants.ts` へ集約                   |

### 発見事項

- 良かった点: `index.tsx` の責務を目に見える単位で減らせた
- 問題点: visual レベルの polish は構造整理だけでは解決しない
- 改善提案: sticky header の重なりは後続微調整候補

### 次Phaseへの引き継ぎ事項

- Phase 9 では UI / 契約 / a11y を checklist で最終確認する

## 次のPhase

Phase 9: 品質保証へ進む。
