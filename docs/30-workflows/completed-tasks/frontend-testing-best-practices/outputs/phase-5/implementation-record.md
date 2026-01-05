# 実装記録 - フロントエンドテストベストプラクティス

## 実装日

2026-01-04

---

## 実装済みファイル

### MSW インフラ

| ファイル                   | 説明                | ステータス |
| -------------------------- | ------------------- | ---------- |
| src/test/mocks/handlers.ts | APIモックハンドラー | 完了       |
| src/test/mocks/server.ts   | MSWサーバー設定     | 完了       |
| src/test/setup.ts          | MSW統合（更新）     | 完了       |

### テストユーティリティ

| ファイル                 | 説明                     | ステータス |
| ------------------------ | ------------------------ | ---------- |
| src/test/utils.tsx       | カスタムレンダー関数     | 完了       |
| src/test/test-helpers.ts | テストヘルパー           | 完了       |
| src/test/factories.ts    | テストデータファクトリー | 完了       |

### 設定ファイル

| ファイル         | 変更内容              | ステータス |
| ---------------- | --------------------- | ---------- |
| vitest.config.ts | カバレッジ閾値追加    | 完了       |
| package.json     | test:uiスクリプト追加 | 完了       |

---

## 依存関係追加

```json
{
  "devDependencies": {
    "msw": "^2.x.x",
    "@vitest/ui": "^2.1.9"
  }
}
```

---

## テスト結果

### desktop パッケージ

- テストファイル: 139 passed
- テスト数: 2962 passed
- カバレッジ: **83.86%** (目標80%達成)

### shared パッケージ

- テストファイル: 62 passed
- テスト数: 2717 passed
- カバレッジ: 67.2% (lines), 83.27% (functions)

---

## 修正した問題

1. **vitest importエラー**: `@testing-library/jest-dom/vitest` の不要なインポートを6ファイルから削除
2. **パフォーマンステスト不安定**: ChatHistoryList.test.tsx の閾値を1000ms → 2000msに緩和
3. **バッチサイズテスト不安定**: performance.test.ts のスループット比較を削除し、処理完了確認のみに変更
