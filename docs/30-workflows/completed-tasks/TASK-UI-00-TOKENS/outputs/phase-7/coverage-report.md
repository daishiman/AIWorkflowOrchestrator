# Phase 7: カバレッジ確認レポート

## 測定情報

| 項目         | 値                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------- |
| 測定日時     | 2026-02-22 16:06                                                                                    |
| 測定コマンド | `cd apps/desktop && pnpm vitest run src/renderer/tests/helpers/renderWithTheme.test.tsx --coverage` |

## カバレッジ結果

| ファイル              | Line | Branch | Function | Statement | 基準充足 |
| --------------------- | ---- | ------ | -------- | --------- | -------- |
| `renderWithTheme.tsx` | 100% | 100%   | 100%     | 100%      | ✅       |

### 基準との比較

| 指標              | 最低基準 | 推奨基準 | 実績値 | 判定                |
| ----------------- | -------- | -------- | ------ | ------------------- |
| Line Coverage     | 80%      | 90%      | 100%   | ✅ 推奨基準超過達成 |
| Branch Coverage   | 60%      | 70%      | 100%   | ✅ 推奨基準超過達成 |
| Function Coverage | 80%      | 90%      | 100%   | ✅ 推奨基準超過達成 |

## テストケース数

| Phase   | テストケース数 |
| ------- | -------------- |
| Phase 4 | 9              |
| Phase 6 | 19             |
| 合計    | 28             |

## 未カバー行

なし（全行カバー済み）

## ゲート判定

判定: **PASS**

全3指標が推奨基準（90%）を超過達成。Phase 8（リファクタリング）へ進む。

## テスト実行ログ

```
✓ src/renderer/tests/helpers/renderWithTheme.test.tsx (28 tests) 273ms

 Test Files  1 passed (1)
      Tests  28 passed (28)
```

## 既存テスト影響

renderWithTheme テストの追加・修正による既存テストへの影響はなし。テスト間の状態汚染もなし（各 `describe` ブロックで `afterEach` による `data-theme` 属性のクリーンアップが実装済み）。
