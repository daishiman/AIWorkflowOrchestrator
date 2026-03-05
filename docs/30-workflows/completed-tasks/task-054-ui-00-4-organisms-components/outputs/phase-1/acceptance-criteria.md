# Phase 1 受け入れ基準（AC）

## 1. SubAgent 実行結果

| SubAgent          | 観点                     | 反映先                  |
| ----------------- | ------------------------ | ----------------------- |
| SubAgent-REQ-UI   | UI表示/状態遷移          | AC-CG / AC-MDL / AC-SFL |
| SubAgent-REQ-A11Y | role/aria/keyboard/focus | AC-A11Y-\*              |
| SubAgent-REQ-TEST | 検証可能性・実行条件     | AC-TEST-\*              |

## 2. CardGrid AC

| AC ID    | 受け入れ基準                                                              |
| -------- | ------------------------------------------------------------------------- |
| AC-CG-01 | items=3件で `renderCard` が3回呼ばれ、`role="gridcell"` が3要素存在する。 |
| AC-CG-02 | items=0, isLoading=false で EmptyState が表示される。                     |
| AC-CG-03 | isLoading=true で SkeletonCard が既定6件（指定時は指定件数）表示される。  |
| AC-CG-04 | `role="grid"` が付与され、矢印キーでフォーカス移動できる。                |
| AC-CG-05 | mobile（<768px）で `grid-template-columns: 1fr` が適用される。            |
| AC-CG-06 | 各カードに `transition-delay: index*50ms` が適用される。                  |

## 3. MasterDetailLayout AC

| AC ID     | 受け入れ基準                                                    |
| --------- | --------------------------------------------------------------- |
| AC-MDL-01 | desktop（>=1024px）で master/detail が同時表示される。          |
| AC-MDL-02 | `masterWidth="420px"` 指定時、master幅が420pxで描画される。     |
| AC-MDL-03 | isDetailOpen=false で desktop detail内容が非表示になる。        |
| AC-MDL-04 | tablet/mobile で detail が SlideInPanel として表示される。      |
| AC-MDL-05 | mobile で detail パネル幅が100vwとして表示される。              |
| AC-MDL-06 | master=`role="navigation"`、detail=`role="main"` が付与される。 |

## 4. SearchFilterList AC

| AC ID     | 受け入れ基準                                                           |
| --------- | ---------------------------------------------------------------------- |
| AC-SFL-01 | 検索クエリ入力で `searchPredicate` に一致する要素のみ表示される。      |
| AC-SFL-02 | 複数FilterChip選択時、AND条件で結果が絞り込まれる。                    |
| AC-SFL-03 | sortFn指定時、表示順がsortFn結果に一致する。                           |
| AC-SFL-04 | 件数表示が `N件 / 全M件` 形式で更新される。                            |
| AC-SFL-05 | items空時は EmptyState mood=welcoming が表示される。                   |
| AC-SFL-06 | items有り+結果0件時は EmptyState mood=encouraging が表示される。       |
| AC-SFL-07 | viewMode=list で `role="list"`、viewMode=gridで `role="grid"` が有効。 |
| AC-SFL-08 | 件数表示要素に `aria-live="polite"` が設定される。                     |

## 5. 共通 AC（a11y / responsive / theme / test）

| AC ID       | 受け入れ基準                                                               |
| ----------- | -------------------------------------------------------------------------- |
| AC-A11Y-01  | 主要コンテナに適切な role と aria-label が設定される。                     |
| AC-A11Y-02  | キーボードのみで主要操作（検索、フィルター、グリッド移動、閉じる）が可能。 |
| AC-RESP-01  | desktop/tablet/mobile の3条件で主要表示崩れがない。                        |
| AC-THEME-01 | kanagawa-dragon/light/dark の3テーマでレンダリングエラーがない。           |
| AC-TEST-01  | Red→Green→Refactorのテスト証跡が outputs/phase-4~8 に残る。                |
| AC-TEST-02  | テスト実行は常に `cd apps/desktop && pnpm vitest run` で実施される。       |
