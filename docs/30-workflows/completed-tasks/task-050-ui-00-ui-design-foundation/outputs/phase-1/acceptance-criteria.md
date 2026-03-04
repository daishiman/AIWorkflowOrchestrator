# Phase 1 受け入れ基準

## 1. 判定可能な受け入れ基準

| AC ID     | 条件                                                                        | 検証方法                     | TC ID             |
| --------- | --------------------------------------------------------------------------- | ---------------------------- | ----------------- |
| AC-UI-001 | `tokens.css` で `light`/`dark` がApple HIG色定義になっている                | ソース確認 + テーマ描画      | TC-UI-00-101      |
| AC-UI-002 | Atoms 7種が実装・テスト済み                                                 | 単体テスト                   | TC-UI-00-102      |
| AC-UI-003 | Molecules 5種が実装・テスト済み                                             | 単体テスト                   | TC-UI-00-103      |
| AC-UI-004 | Organisms 3種が実装・テスト済み                                             | 単体テスト                   | TC-UI-00-104      |
| AC-UI-005 | `renderWithTheme` で3テーマ描画検証ができる                                 | テストヘルパー実行           | TC-UI-00-105      |
| AC-UI-006 | Search/Tab/Panel/Dialog でARIA/キーボード操作が成立する                     | a11yテスト                   | TC-UI-00-106      |
| AC-UI-007 | `SearchFilterList` で検索 AND フィルター積集合が成立する                    | 統合寄りコンポーネントテスト | TC-UI-00-107      |
| AC-UI-008 | `pnpm --filter @repo/desktop typecheck` が通る                              | 型検証                       | TC-UI-00-108      |
| AC-UI-009 | 対象コンポーネント範囲のカバレッジ閾値を満たす                              | coverage実行                 | TC-UI-00-109      |
| AC-UI-010 | スクリーンショット5枚で視覚差分（desktop/mobile, panel/dialog）を確認できる | Phase 11手動検証             | TC-UI-00-301〜305 |

## 2. Phase 4への引き渡し（Red対象）

- `SearchBar`, `CodeViewer`, `TabSwitcher`, `SlideInPanel`, `ConfirmDialog`
- `CardGrid`, `MasterDetailLayout`, `SearchFilterList`
- 3テーマ描画/ARIA/フィルタリング/キーボード動作

## 3. 完了判定

- 上記ACをすべて `Pass` にできるテストと証跡が存在すること
