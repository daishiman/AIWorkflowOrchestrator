# Phase 2 成果物: 設計判断

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-08                                     |
| 前提状況 | GAP-01〜06 の全防御が実装済み                  |

## 設計判断一覧

### DD-01: 正規化ロジックの配置（インライン方式）

| 項目   | 内容                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 判断   | 正規化ロジックを `ApiKeysSection/index.tsx` の `loadProviders` 関数内にインラインで配置する。独立した `normalizeProviders` 関数への抽出は行わない                              |
| 根拠   | 現時点で `ApiKeysSection` のみが providers の正規化を必要とする。YAGNI 原則に従い、過度な抽象化を回避。`loadProviders` 内の防御レイヤー1〜3 の構造で十分な可読性を確保している |
| 代替案 | `normalizeProviders` 関数を抽出 -- テスト容易性は向上するが、現時点では `loadProviders` の統合テストで GAP-01〜04 を検証できるため不要                                         |
| 実装例 | 下記コード参照                                                                                                                                                                 |

```typescript
// 実装済みコード（ApiKeysSection/index.tsx loadProviders 内）

// 防御レイヤー1: window.electronAPI の存在確認
const apiKeyApi = window.electronAPI?.apiKey;
if (!apiKeyApi?.list) {
  /* エラー表示 */ return;
}

// 防御レイヤー2: result shape の正規化
const result = await apiKeyApi.list();
if (result?.success && result?.data) {
  const rawProviders = Array.isArray(result.data.providers)
    ? result.data.providers
    : [];

  // 防御レイヤー3: 要素 shape の防御的フィルタ（P49 準拠）
  const providers = rawProviders.filter(
    (item): item is ProviderStatus =>
      item != null &&
      typeof item === "object" &&
      "provider" in item &&
      typeof item.provider === "string" &&
      "status" in item &&
      typeof item.status === "string",
  );
}
```

### DD-02: ProviderStatus の必須チェック対象フィールド

| 項目   | 内容                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断   | `ProviderStatus` の必須チェック対象は `provider`（string）と `status`（string）のみ                                                                                                     |
| 根拠   | `displayName` は `ALL_PROVIDERS` の `AI_PROVIDERS_META` からフォールバック取得可能。`lastValidatedAt` は `formatValidatedAt` 内で null 安全に処理される。コアフィールドのみの検証で十分 |
| 代替案 | 全フィールドチェック -- 過剰な検証によりバリデーション複雑性が増すため却下                                                                                                              |

### DD-03: Main 側バリデーション失敗時のレスポンス戦略（空配列正常レスポンス）

| 項目   | 内容                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 判断   | `providers` が非配列の場合、エラーレスポンスではなく空配列で正常レスポンスを返す                                                                                                                                               |
| 根拠   | P48 準拠: Renderer 側で安全に処理可能な shape を保証する。エラーレスポンスにすると Renderer 側のエラーハンドリングパスが増え GAP-04 の try-catch と責務が重複する。空配列は `ALL_PROVIDERS.map()` で未登録表示として処理される |
| 代替案 | `{ success: false, error: { code: 'VALIDATION_ERROR' } }` -- Renderer 側のエラーパスが増加するため却下                                                                                                                         |

```typescript
// 実装済みコード（apiKeyHandlers.ts apiKey:list ハンドラ内）
const providers = Array.isArray(result?.providers) ? result.providers : [];
const registeredCount = providers.filter(
  (p) => p?.status === "registered",
).length;

return {
  success: true,
  data: { providers, registeredCount, totalCount: providers.length },
};
```

### DD-04: profileHandlers のパターン変更範囲

| 項目     | 内容                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断     | `profileHandlers.ts` の `identities` 取得箇所は `Array.isArray` パターンのみに統一。他のフィールドや他の処理には手を加えない                |
| 根拠     | スコープ境界を守り、profileHandlers の他の機能に影響を与えない。GAP-06 の目的はパターン統一であり、profileHandlers 全体の防御強化は別タスク |
| 実装状況 | 3箇所全てで `Array.isArray(user.identities) ? user.identities : []` パターンが既に使用されており、追加変更は不要                            |

## 3層防御の設計概要

### 層 1: Renderer 層（ApiKeysSection/index.tsx）

| 防御ポイント                                      | 対応 GAP | 準拠 Pitfall |
| ------------------------------------------------- | -------- | ------------ |
| `window.electronAPI?.apiKey?.list` 存在チェック   | --       | --           |
| `result?.success && result?.data` チェック        | GAP-01   | P48          |
| `Array.isArray(result.data.providers)` ガード     | GAP-01   | P48          |
| type predicate フィルタ（`in` 演算子）            | GAP-03   | P49          |
| try-catch による rejection ハンドリング           | GAP-04   | --           |
| `ALL_PROVIDERS.map()` による常時4プロバイダー表示 | GAP-02   | --           |

### 層 2: Main Process 層（apiKeyHandlers.ts）

| 防御ポイント                                | 対応 GAP | 準拠 Pitfall |
| ------------------------------------------- | -------- | ------------ |
| `Array.isArray(result?.providers)` チェック | GAP-05   | P48          |
| `registeredCount` 正規化後の配列から再計算  | GAP-05   | --           |

### 層 3: profileHandlers パターン統一

| 防御ポイント                               | 対応 GAP | 準拠 Pitfall |
| ------------------------------------------ | -------- | ------------ |
| `Array.isArray(user.identities)` 3箇所統一 | GAP-06   | P48          |
