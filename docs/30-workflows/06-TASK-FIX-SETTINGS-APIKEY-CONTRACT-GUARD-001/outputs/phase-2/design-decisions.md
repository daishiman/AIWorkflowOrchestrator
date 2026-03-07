# Phase 2 成果物: 設計判断

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスク名 | 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| 作成日   | 2026-03-07                                     |

## 設計判断一覧

### DD-01: normalizeProviders の配置

| 項目   | 内容                                                                                                                                                                                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断   | `normalizeProviders` 関数を `ApiKeysSection/index.tsx` 内に配置する。共通 util 化しない                                                                                                 |
| 根拠   | 現時点で `ApiKeysSection` のみが providers の正規化を必要とする。YAGNI 原則に従い、過度な抽象化を回避する。将来的に他コンポーネントでも同様の正規化が必要になった場合に共通化を検討する |
| 代替案 | `packages/shared/src/utils/normalize.ts` に配置 -- 現時点で使用箇所が1つのため却下                                                                                                      |

### DD-02: ProviderStatus の必須チェック対象フィールド

| 項目   | 内容                                                                                                                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断   | `ProviderStatus` の必須チェック対象は `provider`（string）と `status`（string）のみ                                                                                                                   |
| 根拠   | `displayName` / `lastValidatedAt` は表示用フィールドであり、欠損しても UI がクラッシュしない。`provider` と `status` はリスト表示・状態判定のコアフィールドであり、欠損すると意味のない行が表示される |
| 代替案 | 全フィールドチェック -- 過剰な検証によりバリデーション関数の複雑性が増すため却下                                                                                                                      |

### DD-03: Main 側バリデーション失敗時のレスポンス戦略

| 項目   | 内容                                                                                                                                                                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断   | `providers` が非配列の場合、エラーレスポンスではなく空配列で正常レスポンスを返す                                                                                                                                                               |
| 根拠   | P48 準拠: Renderer 側で安全に処理可能な shape を保証する。エラーレスポンスにすると Renderer 側のエラーハンドリングパスが増え、GAP-04 の try-catch と責務が重複する。空配列は「プロバイダーなし」として GAP-02 のフィードバック表示で処理される |
| 代替案 | `{ success: false, error: { code: 'VALIDATION_ERROR' } }` -- Renderer 側のエラーパスが増加するため却下                                                                                                                                         |

### DD-04: profileHandlers のパターン変更範囲

| 項目   | 内容                                                                                                                                                       |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 判断   | `profileHandlers.ts` の変更は `identities ?? []` を `Array.isArray(identities) ? identities : []` に変更するのみ。他のフィールドや他の処理には手を加えない |
| 根拠   | スコープ境界を守り、profileHandlers の他の機能に影響を与えない。GAP-06 の目的はパターン統一であり、profileHandlers 全体の防御強化は別タスク                |
| 代替案 | profileHandlers 全体の防御パターン見直し -- 本タスクのスコープを超えるため却下                                                                             |

## 3層設計の詳細

### 層 1: Renderer 層（ApiKeysSection/index.tsx）

#### normalizeProviders 関数

```typescript
function normalizeProviders(data: unknown): ProviderStatus[] {
  if (data == null || typeof data !== "object") return [];
  const raw = (data as Record<string, unknown>).providers;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is ProviderStatus =>
      item != null &&
      typeof (item as Record<string, unknown>).provider === "string" &&
      typeof (item as Record<string, unknown>).status === "string",
  );
}
```

**設計ポイント:**

| ポイント                   | 説明                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `data == null`             | GAP-01: `undefined` と `null` の両方を吸収（loose equality）                           |
| `typeof data !== "object"` | GAP-01: プリミティブ値の場合も安全にフォールバック                                     |
| `!Array.isArray(raw)`      | 既存 DEF-01 との一貫性: `providers` が非配列の場合は空配列                             |
| type predicate フィルタ    | GAP-03: `provider` と `status` が string であることを検証し、TypeScript の型推論に反映 |
| non-null assertion 不使用  | P48 準拠: `!` を使わず実行時検証のみで安全性を保証                                     |

#### fetchProviders 関数の変更

```typescript
// GAP-04: try-catch でラップ
try {
  const result = await window.electronAPI.apiKey.list();
  // GAP-01 + GAP-03: normalizeProviders で一括正規化
  const providers = normalizeProviders(result?.data);
  setProviders(providers);
  // GAP-02: 空配列判定
  if (providers.length === 0) {
    setEmptyMessage("プロバイダーが登録されていません");
  }
} catch (error) {
  // GAP-04: rejection 時のエラーハンドリング
  setError("API キー情報の取得に失敗しました");
}
```

### 層 2: Main Process 層（apiKeyHandlers.ts）

#### apiKey:list ハンドラの変更

```typescript
// GAP-05: providers 配列バリデーション
const providers = Array.isArray(result.providers) ? result.providers : [];
return {
  success: true,
  data: {
    providers,
    registeredCount: providers.length,
    totalCount,
  },
};
```

**設計ポイント:**

| ポイント                   | 説明                                                        |
| -------------------------- | ----------------------------------------------------------- |
| `Array.isArray` チェック   | Renderer 側と同じ防御パターンを Main 側にも配置（多層防御） |
| 空配列フォールバック       | DD-03: エラーではなく空配列で正常レスポンスを返す           |
| `registeredCount` の再計算 | 正規化後の配列長を使用し、count と配列の不整合を防止        |

### 層 3: profileHandlers パターン統一（profileHandlers.ts）

```typescript
// GAP-06: 変更前
const safeIdentities = identities ?? [];

// GAP-06: 変更後
const safeIdentities = Array.isArray(identities) ? identities : [];
```

**設計ポイント:**

| ポイント                 | 説明                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------ |
| `Array.isArray` パターン | `?? []` は `null`/`undefined` のみ防御。`Array.isArray` は非配列値（文字列、数値、オブジェクト）も防御 |
| 最小変更                 | DD-04: この1箇所のみ変更。他のフィールドには手を加えない                                               |
