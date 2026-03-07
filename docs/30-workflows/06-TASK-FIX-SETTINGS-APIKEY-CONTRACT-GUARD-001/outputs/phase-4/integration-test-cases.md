# Phase 4: 統合テストケース設計

## メタ情報

| 項目           | 値                                                                      |
| -------------- | ----------------------------------------------------------------------- |
| タスク ID      | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                             |
| Phase          | 4 - テスト作成                                                          |
| 作成日         | 2026-03-07                                                              |
| テストファイル | `apps/desktop/src/renderer/components/settings/ApiKeysSection.test.tsx` |

## テストデータファクトリ設計

### createMockProviderList()

テスト間でプロバイダーリストの生成ロジックを共有するためのファクトリ関数。

```typescript
/**
 * テスト用プロバイダーリスト生成ファクトリ
 *
 * @param overrides - デフォルト値を上書きするオプション
 * @returns mockされた apiKey.list() の戻り値
 */
function createMockProviderList(
  overrides?: Partial<{
    success: boolean;
    data: unknown;
  }>,
): { success: boolean; data: unknown } {
  const defaults = {
    success: true,
    data: {
      providers: [
        { provider: "openai", status: "active" },
        { provider: "anthropic", status: "active" },
        { provider: "google", status: "inactive" },
        { provider: "azure", status: "inactive" },
      ],
    },
  };

  return { ...defaults, ...overrides };
}
```

### 使用例

```typescript
// 正常系
const normalResult = createMockProviderList();

// data が undefined のケース
const undefinedDataResult = createMockProviderList({ data: undefined });

// data が null のケース
const nullDataResult = createMockProviderList({ data: null });

// 空配列のケース
const emptyResult = createMockProviderList({ data: { providers: [] } });

// malformed 要素混在のケース
const malformedResult = createMockProviderList({
  data: {
    providers: [
      { provider: "openai", status: "active" },
      null,
      { status: "active" }, // provider 欠損
    ],
  },
});
```

## テスト間独立性の設計

### beforeEach によるモックリセット

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

### 設計原則

| 原則         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 状態分離     | 各テストケースは `beforeEach` で `vi.clearAllMocks()` を実行し、前のテストの副作用を排除する |
| モック独立性 | `window.electronAPI.apiKey.list` のモック戻り値は各テスト内で個別に設定する                  |
| DOM 分離     | `@testing-library/react` の `render` は各テストで独立した DOM ツリーを生成する               |
| 非同期処理   | `waitFor` / `findByText` を使用し、非同期データフェッチ完了後にアサーションを実行する        |

### テスト実行順序への非依存

- 各テストは他のテストの実行結果に依存しない（P9 準拠）
- モジュールスコープの変数はテスト間で共有しない
- ファクトリ関数 `createMockProviderList()` は純粋関数として設計し、内部状態を持たない

## テストカバレッジ目標

| 指標              | 目標値   | 根拠                     |
| ----------------- | -------- | ------------------------ |
| Line Coverage     | 90% 以上 | コード品質ルール推奨基準 |
| Branch Coverage   | 70% 以上 | コード品質ルール推奨基準 |
| Function Coverage | 90% 以上 | コード品質ルール推奨基準 |

## テストケースと Gap ID の対応マトリクス

| テストケース                 | GAP-01 | GAP-02 | GAP-03 | GAP-04 |
| ---------------------------- | ------ | ------ | ------ | ------ |
| GAP-TEST-01 (data undefined) | x      |        |        |        |
| GAP-TEST-01b (data null)     | x      |        |        |        |
| GAP-TEST-02 (空配列)         |        | x      |        |        |
| GAP-TEST-03 (provider 欠損)  |        |        | x      |        |
| GAP-TEST-03b (status 欠損)   |        |        | x      |        |
| GAP-TEST-03c (混在)          |        |        | x      |        |
| GAP-TEST-04 (reject)         |        |        |        | x      |
