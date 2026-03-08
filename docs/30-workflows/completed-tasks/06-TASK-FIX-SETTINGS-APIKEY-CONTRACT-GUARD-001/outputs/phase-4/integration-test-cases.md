# Phase 4: 統合テストケース設計

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスク ID  | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase      | 4 - テスト作成                              |
| 作成日     | 2026-03-07                                  |
| 更新日     | 2026-03-08                                  |
| ステータス | 全テスト Green（実装済み）                  |

## テストファイル構成

| テストファイル                     | 対象レイヤー | テスト数 | 目的                                  |
| ---------------------------------- | ------------ | -------- | ------------------------------------- |
| ApiKeysSection.test.tsx            | Renderer     | 46       | UI コンポーネントの防御的レンダリング |
| apiKeyHandlers.list.test.ts        | Main         | 7        | IPC ハンドラの配列バリデーション      |
| profileHandlers.identities.test.ts | Main         | 6        | identities パターン統一の検証         |

## テストデータファクトリ設計

### createMockProviderList()（Renderer 層）

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

// data が undefined のケース（GAP-01）
const undefinedDataResult = createMockProviderList({ data: undefined });

// data が null のケース（GAP-01）
const nullDataResult = createMockProviderList({ data: null });

// 空配列のケース（GAP-02）
const emptyResult = createMockProviderList({ data: { providers: [] } });

// malformed 要素混在のケース（GAP-03）
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

### Main 層テストのモック構成

#### apiKeyHandlers.list.test.ts（GAP-05）

```typescript
// モック対象: 外部サービスの listProviders メソッド
const mockListProviders = vi.fn();

// 各テストケースで戻り値を変更
mockListProviders.mockResolvedValue(null); // null フォールバック
mockListProviders.mockResolvedValue(undefined); // undefined フォールバック
mockListProviders.mockResolvedValue("not-array"); // 非配列フォールバック
mockListProviders.mockRejectedValue(new Error("...")); // 例外ケース
```

#### profileHandlers.identities.test.ts（GAP-06）

```typescript
// モック対象: Supabase auth.getUser() の戻り値
const mockGetUser = vi.fn();

// identities パターンを変更
mockGetUser.mockResolvedValue({
  data: { user: { identities: null } },
  error: null,
});
mockGetUser.mockResolvedValue({
  data: { user: { identities: undefined } },
  error: null,
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
| モック独立性 | モック戻り値は各テスト内で個別に設定する                                                     |
| DOM 分離     | `@testing-library/react` の `render` は各テストで独立した DOM ツリーを生成する               |
| 非同期処理   | `waitFor` / `findByText` を使用し、非同期データフェッチ完了後にアサーションを実行する        |

### テスト実行順序への非依存（P9 準拠）

- 各テストは他のテストの実行結果に依存しない
- モジュールスコープの変数はテスト間で共有しない
- ファクトリ関数 `createMockProviderList()` は純粋関数として設計し、内部状態を持たない
- Main 層テストでも各テストケースが独立してモックを設定

### happy-dom 環境での注意事項（P39 準拠）

- `userEvent.setup()` は使用しない（Symbol 操作エラーの回避）
- 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む
- テスト環境は `apps/desktop/vitest.config.ts` の設定に依存（P40 準拠）

## テストカバレッジ目標

| 指標              | 目標値   | 根拠                     |
| ----------------- | -------- | ------------------------ |
| Line Coverage     | 90% 以上 | コード品質ルール推奨基準 |
| Branch Coverage   | 70% 以上 | コード品質ルール推奨基準 |
| Function Coverage | 90% 以上 | コード品質ルール推奨基準 |

## テストケースと Gap ID の対応マトリクス

### Renderer 層（ApiKeysSection.test.tsx）

| テストケース                 | GAP-01 | GAP-02 | GAP-03 | GAP-04 |
| ---------------------------- | ------ | ------ | ------ | ------ |
| GAP-TEST-01 (data undefined) | x      |        |        |        |
| GAP-TEST-01b (data null)     | x      |        |        |        |
| GAP-TEST-02 (空配列)         |        | x      |        |        |
| GAP-TEST-03 (provider 欠損)  |        |        | x      |        |
| GAP-TEST-03b (status 欠損)   |        |        | x      |        |
| GAP-TEST-03c (混在)          |        |        | x      |        |
| GAP-TEST-04 (reject)         |        |        |        | x      |

### Main 層

| テストケース                         | GAP-05 | GAP-06 |
| ------------------------------------ | ------ | ------ |
| GAP-TEST-05a ~ 05g (apiKeyHandlers)  | x      |        |
| GAP-TEST-06a ~ 06f (profileHandlers) |        | x      |

## 多層防御テスト戦略

本タスクでは Renderer 層と Main 層の両方にバリデーションを配置する「多層防御」を採用している。テストもこれに対応して2層構成とした。

```
Main (GAP-05, GAP-06)        Renderer (GAP-01 ~ GAP-04)
  apiKeyHandlers.ts    --->    ApiKeysSection/index.tsx
  profileHandlers.ts           (type predicate フィルタ)
  (Array.isArray)
```

- Main 層でデータをサニタイズしても、Renderer 側で独立して防御する
- contextBridge 経由の structured clone で予期しない型変換が発生しても安全
- いずれか一方の防御が突破されても、もう一方で捕捉できる
