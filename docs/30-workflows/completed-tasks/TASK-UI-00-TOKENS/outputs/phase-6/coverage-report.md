# Phase 6: テスト拡充 — カバレッジレポート

## 測定情報

| 項目         | 値                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 測定日時     | 2026-02-22 16:06                                                                                    |
| 測定コマンド | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx --coverage` |

## カバレッジ結果（Phase 6 拡充後）

| ファイル              | Line | Branch | Function | Statement | 基準充足 |
| --------------------- | ---- | ------ | -------- | --------- | -------- |
| `renderWithTheme.tsx` | 100% | 100%   | 100%     | 100%      | ✅       |

## テストケース数

| Phase   | テストケース数 | 内訳                                                         |
| ------- | -------------- | ------------------------------------------------------------ |
| Phase 4 | 9              | 3テーマ×2テスト + デフォルト + RenderResult + クリーンアップ |
| Phase 6 | 19             | 境界値5 + WCAG 8 + テーマカラーマップ6                       |
| 合計    | 28             |                                                              |

## Phase 6 追加テスト内訳

### Task 2: 境界値テスト（5ケース）

| ID     | テストケース名                                      | 結果 |
| ------ | --------------------------------------------------- | ---- |
| TC-6-1 | options 未指定で renderWithTheme を呼び出す         | PASS |
| TC-6-2 | 空オブジェクト `{}` を options に渡す               | PASS |
| TC-6-3 | container オプションを渡してレンダリングする        | PASS |
| TC-6-4 | 連続して異なるテーマで renderWithTheme を呼び出す   | PASS |
| TC-6-5 | wrapper オプション付きで renderWithTheme を呼び出す | PASS |

### Task 3: WCAG AA コントラスト比テスト（8ケース）

| テーマ          | テストケース                                          | コントラスト比 | 基準  | 結果 |
| --------------- | ----------------------------------------------------- | -------------- | ----- | ---- |
| light           | text-primary on bg-primary                            | 21:1           | 4.5:1 | PASS |
| light           | text-secondary on bg-primary (UI components)          | ≈3.44:1        | 3:1   | PASS |
| light           | text-muted on bg-primary (documented as low contrast) | ≈2.5:1         | <4.5  | PASS |
| light           | status-primary on bg-primary (UI components)          | ≈3.9:1         | 3:1   | PASS |
| dark            | text-primary on bg-primary                            | 21:1           | 4.5:1 | PASS |
| dark            | text-secondary on bg-primary                          | ≈5.4:1         | 4.5:1 | PASS |
| dark            | status-primary on bg-primary (UI components)          | ≈3.1:1         | 3:1   | PASS |
| kanagawa-dragon | text-primary on bg-primary                            | ≈10.3:1        | 4.5:1 | PASS |

### Task 4: テーマカラーマップ整合性テスト（6ケース）

| テーマ          | テスト内容                           | 結果 |
| --------------- | ------------------------------------ | ---- |
| kanagawa-dragon | data-theme設定 + レンダリング正常    | PASS |
| kanagawa-dragon | status color変数参照要素レンダリング | PASS |
| light           | data-theme設定 + レンダリング正常    | PASS |
| light           | status color変数参照要素レンダリング | PASS |
| dark            | data-theme設定 + レンダリング正常    | PASS |
| dark            | status color変数参照要素レンダリング | PASS |

## ゲート判定

判定: **PASS**

全テスト28件PASS、カバレッジ100%（全指標で推奨基準90%を超過達成）。

## 注記

- light テーマの `--text-secondary`（Apple HIG `secondaryLabel`: `rgba(60, 60, 67, 0.6)`）は WCAG AA 通常テキスト基準 4.5:1 を満たさない（≈3.44:1）が、UIコンポーネント/大テキスト基準 3:1 は満たす。Apple HIG の設計意図に従い、小テキスト（<18px）での使用を制限する。
- `--text-muted`（tertiaryLabel: 30% opacity）は WCAG AA 4.5:1 を満たさないことをテストで文書化済み。装飾的テキスト・補足情報にのみ使用する制約。
