# テスト仕様テンプレート

> 用途: テスト戦略、テストケース、カバレッジ目標、モック設計の仕様定義
> 参考: quality-requirements.md

---

## 概要

[機能/モジュール名]のテスト仕様を定義する。

---

## テスト戦略

### テストピラミッド

| テスト種別       | 割合 | ツール       | 実行タイミング |
| ---------------- | ---- | ------------ | -------------- |
| Unit Test        | 70%  | Vitest       | PR時           |
| Integration Test | 20%  | Vitest + MSW | PR時           |
| E2E Test         | 10%  | Playwright   | main merge時   |

### カバレッジ目標

| メトリクス        | 目標値 | 必須ライン |
| ----------------- | ------ | ---------- |
| Line Coverage     | 90%+   | 80%        |
| Branch Coverage   | 85%+   | 75%        |
| Function Coverage | 95%+   | 90%        |

---

## テストケース設計

### 正常系テスト

| テストID | テスト名 | 入力 | 期待結果 |
| -------- | -------- | ---- | -------- |
| TC-001   |          |      |          |

### 異常系テスト

| テストID | テスト名 | 入力 | 期待結果 |
| -------- | -------- | ---- | -------- |
| TC-E001  |          |      |          |

### 境界値テスト

| テストID | テスト名 | 境界条件 | 期待結果 |
| -------- | -------- | -------- | -------- |
| TC-B001  |          |          |          |

---

## モック設計

### 外部依存のモック

```typescript
// モック定義例
const mockService = {
  method: vi.fn().mockResolvedValue(expectedResult),
};
```

### MSWハンドラー

```typescript
// MSWハンドラー例
export const handlers = [
  http.get("/api/xxx", () => {
    return HttpResponse.json({ data: "mocked" });
  }),
];
```

---

## テストユーティリティ

### ファクトリー関数

```typescript
// テストデータファクトリー
export const createTestXxx = (overrides?: Partial<Xxx>): Xxx => ({
  id: "test-id",
  name: "test-name",
  ...overrides,
});
```

### カスタムマッチャー

```typescript
// カスタムマッチャー例
expect.extend({
  toBeValidXxx(received) {
    // 検証ロジック
  },
});
```

---

## テスト実行コマンド

```bash
# 全テスト実行
pnpm --filter @repo/xxx test

# 特定ファイルのみ
pnpm --filter @repo/xxx test -- path/to/test.spec.ts

# カバレッジ付き
pnpm --filter @repo/xxx test -- --coverage

# ウォッチモード
pnpm --filter @repo/xxx test -- --watch
```

---

## CI/CD統合

```yaml
# GitHub Actions設定例
- name: Run Tests
  run: pnpm --filter @repo/xxx test -- --coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

---

## 品質ゲート

| 項目                 | 基準 | 必須/推奨 |
| -------------------- | ---- | --------- |
| 全テストPASS         | 100% | 必須      |
| カバレッジ           | 80%+ | 必須      |
| 新規コードカバレッジ | 90%+ | 推奨      |

---

## 関連ドキュメント

| ドキュメント            | 説明          |
| ----------------------- | ------------- |
| quality-requirements.md | TDD実践ガイド |
| technology-devops.md    | CI/CD設定     |

---

## 変更履歴

| 日付       | バージョン | 変更内容 |
| ---------- | ---------- | -------- |
| YYYY-MM-DD | 1.0.0      | 初版作成 |
