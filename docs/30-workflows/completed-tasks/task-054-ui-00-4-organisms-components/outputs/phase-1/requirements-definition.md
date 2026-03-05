# Phase 1 要件定義書

## 1. 目的

TASK-UI-00-ORGANISMS の実装対象を CardGrid / MasterDetailLayout / SearchFilterList の3コンポーネントに固定し、FR/NFRを定義する。

## 2. SubAgent 分担（関心ごと分離）

| SubAgent          | 担当                    | 出力                     |
| ----------------- | ----------------------- | ------------------------ |
| SubAgent-REQ-UI   | UI機能要件分解          | 本書（FR）               |
| SubAgent-REQ-A11Y | a11y / keyboard要件分解 | `acceptance-criteria.md` |
| SubAgent-REQ-TEST | テスト・非機能要件分解  | `scope-definition.md`    |

## 3. 機能要件（FR）

### 3.1 CardGrid<T>

| 要件ID   | 要件                                                                       |
| -------- | -------------------------------------------------------------------------- |
| FR-CG-01 | `items` と `renderCard` を受け取り、ジェネリクス型安全でカードを描画する。 |
| FR-CG-02 | `isLoading=true` のとき `SkeletonCard` を `skeletonCount` 件表示する。     |
| FR-CG-03 | `items.length===0 && !isLoading` のとき `EmptyState` を表示する。          |
| FR-CG-04 | `role="grid"` / `role="gridcell"` を付与し、矢印キー移動を提供する。       |
| FR-CG-05 | desktop/tablet は auto-fill グリッド、mobile は1カラムで表示する。         |
| FR-CG-06 | カード出現時に 50ms スタッガー遅延を適用する。                             |

### 3.2 MasterDetailLayout

| 要件ID    | 要件                                                                 |
| --------- | -------------------------------------------------------------------- |
| FR-MDL-01 | master/detail を受け取り、desktop で左右分割表示する。               |
| FR-MDL-02 | `masterWidth`（既定380px）を master パネル幅に反映する。             |
| FR-MDL-03 | tablet/mobile では detail を `SlideInPanel` でオーバーレイ表示する。 |
| FR-MDL-04 | mobile は detail をフルスクリーン幅で表示する。                      |
| FR-MDL-05 | master に `role="navigation"`、detail に `role="main"` を付与する。  |
| FR-MDL-06 | tablet/mobile で detail 開時に close ボタンへフォーカス移動する。    |

### 3.3 SearchFilterList<T>

| 要件ID    | 要件                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| FR-SFL-01 | `SearchBar` と `FilterChip` により検索+フィルターを提供する。                    |
| FR-SFL-02 | 検索クエリと複数フィルターは AND 条件（積集合）で適用する。                      |
| FR-SFL-03 | `sortFn` 指定時にフィルター後結果へソートを適用する。                            |
| FR-SFL-04 | 結果件数を `N件 / 全M件` 形式で表示し `aria-live="polite"` で通知する。          |
| FR-SFL-05 | `viewMode=list/grid` を切替し、grid時は CardGrid を使用する。                    |
| FR-SFL-06 | データ空と検索結果空で `EmptyState` の mood（welcoming/encouraging）を切替する。 |

## 4. 非機能要件（NFR）

| 要件ID | 要件                                                                                   |
| ------ | -------------------------------------------------------------------------------------- |
| NFR-01 | P31対策: Zustand store直接参照は禁止。props駆動 + 局所 `useState/useMemo` を使用する。 |
| NFR-02 | P39対策: コンポーネントテストは `fireEvent` を標準にする。                             |
| NFR-03 | P40対策: テスト実行は `cd apps/desktop && pnpm vitest run` を標準にする。              |
| NFR-04 | WCAG 2.1 AA 目標（role/aria/keyboard/focus）を満たす。                                 |
| NFR-05 | テーマ3種（kanagawa-dragon/light/dark）で表示破綻がない。                              |
| NFR-06 | desktop/tablet/mobile の3ブレークポイントで表示要件を満たす。                          |

## 5. 依存契約（Atoms / Molecules）

| 依存先         | レイヤー | 利用契約                                             |
| -------------- | -------- | ---------------------------------------------------- |
| `SkeletonCard` | Atom     | CardGridのloading表示に使用。                        |
| `EmptyState`   | Atom     | CardGrid空状態、SearchFilterList空状態に使用。       |
| `FilterChip`   | Atom     | SearchFilterListフィルター選択に使用。               |
| `SearchBar`    | Molecule | SearchFilterList検索入力に使用。                     |
| `SlideInPanel` | Molecule | MasterDetailLayoutのtablet/mobile detail表示に使用。 |

## 6. 引き継ぎ（Phase 2）

- props契約を型として確定する。
- 各要件ID（FR-CG/FR-MDL/FR-SFL）を設計要素とテストIDに1:1で紐付ける。
- 非対象（仮想スクロール、サーバーサイド検索、IPC追加）は設計段階でも除外維持する。
