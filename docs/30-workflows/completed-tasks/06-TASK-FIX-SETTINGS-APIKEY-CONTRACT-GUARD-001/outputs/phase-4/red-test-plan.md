# Phase 4: Red テスト計画

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスク ID  | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase      | 4 - テスト作成                              |
| 作成日     | 2026-03-07                                  |
| 更新日     | 2026-03-08                                  |
| ステータス | 全テスト Green（実装済み）                  |

## テスト結果サマリ

| テストファイル                     | テスト数 | 結果         |
| ---------------------------------- | -------- | ------------ |
| ApiKeysSection.test.tsx            | 46       | ALL PASS     |
| apiKeyHandlers.list.test.ts        | 7        | ALL PASS     |
| profileHandlers.identities.test.ts | 6        | ALL PASS     |
| **合計**                           | **59**   | **ALL PASS** |

## テストケース一覧

### Renderer 層: ApiKeysSection.test.tsx

#### 既存防御テスト（RED シリーズ）

| テスト ID | 異常ケース                             | ステータス |
| --------- | -------------------------------------- | ---------- |
| RED-01    | window.electronAPI が undefined        | Green      |
| RED-01b   | window.electronAPI.apiKey が undefined | Green      |
| RED-02    | apiKey.list() が undefined を返す      | Green      |
| RED-02b   | apiKey.list() が null を返す           | Green      |
| RED-03    | result.data.providers が配列でない     | Green      |
| RED-03b   | result.data.providers が undefined     | Green      |

#### 新規防御テスト（GAP シリーズ）

| テスト ID    | Gap ID | 異常ケース                                           | ステータス |
| ------------ | ------ | ---------------------------------------------------- | ---------- |
| GAP-TEST-01  | GAP-01 | result.data が undefined                             | Green      |
| GAP-TEST-01b | GAP-01 | result.data が null                                  | Green      |
| GAP-TEST-02  | GAP-02 | providers が空配列（全4プロバイダー未登録表示）      | Green      |
| GAP-TEST-03  | GAP-03 | provider フィールド欠損                              | Green      |
| GAP-TEST-03b | GAP-03 | status フィールド欠損                                | Green      |
| GAP-TEST-03c | GAP-03 | 正常/malformed 混在（null, undefined, 数値, 文字列） | Green      |
| GAP-TEST-04  | GAP-04 | apiKey.list() reject                                 | Green      |

### Main 層: apiKeyHandlers.list.test.ts（GAP-05）

| テスト ID    | Gap ID | 異常ケース                                          | ステータス |
| ------------ | ------ | --------------------------------------------------- | ---------- |
| GAP-TEST-05a | GAP-05 | providers が null -> 空配列フォールバック           | Green      |
| GAP-TEST-05b | GAP-05 | providers が undefined -> 空配列フォールバック      | Green      |
| GAP-TEST-05c | GAP-05 | providers が非配列（文字列）-> 空配列フォールバック | Green      |
| GAP-TEST-05d | GAP-05 | listProviders が null -> 空配列フォールバック       | Green      |
| GAP-TEST-05e | GAP-05 | 正常配列 -> registeredCount 再計算                  | Green      |
| GAP-TEST-05f | GAP-05 | status 欠損 -> registered にカウントされない        | Green      |
| GAP-TEST-05g | GAP-05 | listProviders 例外 -> エラーレスポンス              | Green      |

### Main 層: profileHandlers.identities.test.ts（GAP-06）

| テスト ID    | Gap ID | 異常ケース                                               | ステータス |
| ------------ | ------ | -------------------------------------------------------- | ---------- |
| GAP-TEST-06a | GAP-06 | GET_PROVIDERS: identities が null -> 空配列              | Green      |
| GAP-TEST-06b | GAP-06 | GET_PROVIDERS: identities が undefined -> 空配列         | Green      |
| GAP-TEST-06c | GAP-06 | GET_PROVIDERS: identities が非配列 -> 空配列             | Green      |
| GAP-TEST-06d | GAP-06 | GET_PROVIDERS: identities が正常配列 -> プロバイダー一覧 | Green      |
| GAP-TEST-06e | GAP-06 | UNLINK: identities が null -> エラー                     | Green      |
| GAP-TEST-06f | GAP-06 | UNLINK: identities が undefined -> エラー                | Green      |

## フィクスチャ設計

### Renderer 層フィクスチャ

#### FIXTURE_DATA_UNDEFINED（GAP-01）

```typescript
// contextBridge 経由で structured clone の制約により data フィールドが欠落する可能性
const FIXTURE_DATA_UNDEFINED = {
  success: true,
  data: undefined,
};
```

#### FIXTURE_DATA_NULL（GAP-01）

```typescript
// Main Process 側でデータ取得失敗時に null を返す可能性
const FIXTURE_DATA_NULL = {
  success: true,
  data: null,
};
```

#### FIXTURE_EMPTY_PROVIDERS（GAP-02）

```typescript
// 全プロバイダーが未登録の状態
const FIXTURE_EMPTY_PROVIDERS = {
  success: true,
  data: {
    providers: [],
  },
};
```

#### FIXTURE_MALFORMED_ELEMENT（GAP-03）

```typescript
// malformed な要素を含むケース
const FIXTURE_MALFORMED_ELEMENT = {
  success: true,
  data: {
    providers: [
      { provider: "openai", status: "active" }, // 正常
      null, // null 要素
      undefined, // undefined 要素
      { status: "active" }, // provider フィールド欠損
      { provider: "anthropic" }, // status フィールド欠損
      42, // 数値
      "invalid-string", // 文字列
    ],
  },
};
```

#### FIXTURE_REJECTION（GAP-04）

```typescript
// ネットワークエラーや IPC 通信失敗
const FIXTURE_REJECTION = new Error("IPC channel disconnected");
```

### Main 層フィクスチャ（GAP-05）

```typescript
// apiKeyHandlers 用: listProviders の戻り値パターン
const FIXTURE_PROVIDERS_NULL = null;
const FIXTURE_PROVIDERS_UNDEFINED = undefined;
const FIXTURE_PROVIDERS_STRING = "not-an-array"; // 非配列
const FIXTURE_PROVIDERS_NORMAL = [
  { provider: "openai", status: "active" },
  { provider: "anthropic", status: "inactive" },
];
const FIXTURE_PROVIDERS_NO_STATUS = [
  { provider: "openai" }, // status 欠損
];
```

### Main 層フィクスチャ（GAP-06）

```typescript
// profileHandlers 用: user.identities のパターン
const FIXTURE_IDENTITIES_NULL = { identities: null };
const FIXTURE_IDENTITIES_UNDEFINED = { identities: undefined };
const FIXTURE_IDENTITIES_NON_ARRAY = { identities: "string-value" };
const FIXTURE_IDENTITIES_NORMAL = {
  identities: [
    { identity_id: "1", provider: "google" },
    { identity_id: "2", provider: "github" },
  ],
};
```

## 各テストの期待動作

### Renderer 層

| テスト ID    | 入力                           | 期待動作                                                                        |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| GAP-TEST-01  | data: undefined                | クラッシュせず、全4プロバイダーが「未登録」状態で表示される                     |
| GAP-TEST-01b | data: null                     | クラッシュせず、全4プロバイダーが「未登録」状態で表示される                     |
| GAP-TEST-02  | providers: []                  | 全4プロバイダー（OpenAI, Anthropic, Google, Azure）が「未登録」状態で表示される |
| GAP-TEST-03  | provider フィールド欠損        | 該当要素がフィルタされ、正常な要素のみ表示される                                |
| GAP-TEST-03b | status フィールド欠損          | 該当要素がフィルタされ、正常な要素のみ表示される                                |
| GAP-TEST-03c | null/undefined/数値/文字列混在 | malformed 要素が全てフィルタされ、正常な要素のみ表示される                      |
| GAP-TEST-04  | Promise.reject                 | エラーメッセージが表示され、クラッシュしない                                    |

### Main 層（GAP-05: apiKeyHandlers）

| テスト ID    | 入力                     | 期待動作                                    |
| ------------ | ------------------------ | ------------------------------------------- |
| GAP-TEST-05a | providers: null          | 空配列にフォールバック、registeredCount = 0 |
| GAP-TEST-05b | providers: undefined     | 空配列にフォールバック、registeredCount = 0 |
| GAP-TEST-05c | providers: "string"      | 空配列にフォールバック、registeredCount = 0 |
| GAP-TEST-05d | listProviders が null    | 空配列にフォールバック                      |
| GAP-TEST-05e | 正常配列                 | registeredCount が active status の数と一致 |
| GAP-TEST-05f | status 欠損要素          | registered にカウントされない               |
| GAP-TEST-05g | listProviders が例外送出 | エラーレスポンス（success: false）          |

### Main 層（GAP-06: profileHandlers）

| テスト ID    | 入力                  | 期待動作                           |
| ------------ | --------------------- | ---------------------------------- |
| GAP-TEST-06a | identities: null      | 空配列にフォールバック             |
| GAP-TEST-06b | identities: undefined | 空配列にフォールバック             |
| GAP-TEST-06c | identities: "string"  | 空配列にフォールバック             |
| GAP-TEST-06d | 正常配列              | プロバイダー一覧が正しく返却される |
| GAP-TEST-06e | UNLINK 時 null        | エラーレスポンス                   |
| GAP-TEST-06f | UNLINK 時 undefined   | エラーレスポンス                   |

## Gap ID とテストの対応マトリクス

| Gap ID | テスト ID                               | 対象レイヤー | テストファイル                     |
| ------ | --------------------------------------- | ------------ | ---------------------------------- |
| GAP-01 | GAP-TEST-01, GAP-TEST-01b               | Renderer     | ApiKeysSection.test.tsx            |
| GAP-02 | GAP-TEST-02                             | Renderer     | ApiKeysSection.test.tsx            |
| GAP-03 | GAP-TEST-03, GAP-TEST-03b, GAP-TEST-03c | Renderer     | ApiKeysSection.test.tsx            |
| GAP-04 | GAP-TEST-04                             | Renderer     | ApiKeysSection.test.tsx            |
| GAP-05 | GAP-TEST-05a ~ GAP-TEST-05g             | Main         | apiKeyHandlers.list.test.ts        |
| GAP-06 | GAP-TEST-06a ~ GAP-TEST-06f             | Main         | profileHandlers.identities.test.ts |

## カバレッジ対象

- **Line Coverage**: normalizeProviders 相当のインラインフィルタ、Array.isArray バリデーション全分岐
- **Branch Coverage**: 型ガード条件（true/false 両方）、フォールバック分岐
- **Function Coverage**: type predicate、エラーハンドラ、registeredCount 再計算ロジック
