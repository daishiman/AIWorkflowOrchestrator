# Phase 4: Red テスト計画

## メタ情報

| 項目           | 値                                                                      |
| -------------- | ----------------------------------------------------------------------- |
| タスク ID      | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001                             |
| Phase          | 4 - テスト作成                                                          |
| 作成日         | 2026-03-07                                                              |
| テストファイル | `apps/desktop/src/renderer/components/settings/ApiKeysSection.test.tsx` |

## テストケース一覧

| テスト ID    | Gap ID | 異常ケース                                           | テストファイル          | ステータス |
| ------------ | ------ | ---------------------------------------------------- | ----------------------- | ---------- |
| GAP-TEST-01  | GAP-01 | result.data が undefined                             | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-01b | GAP-01 | result.data が null                                  | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-02  | GAP-02 | providers が空配列（全4プロバイダー未登録表示）      | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-03  | GAP-03 | provider フィールド欠損                              | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-03b | GAP-03 | status フィールド欠損                                | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-03c | GAP-03 | 正常/malformed 混在（null, undefined, 数値, 文字列） | ApiKeysSection.test.tsx | Green      |
| GAP-TEST-04  | GAP-04 | apiKey.list() reject                                 | ApiKeysSection.test.tsx | Green      |

## フィクスチャ設計

### FIXTURE_DATA_UNDEFINED

```typescript
// GAP-TEST-01: result.data が undefined のケース
// contextBridge 経由で structured clone の制約により data フィールドが欠落する可能性
const FIXTURE_DATA_UNDEFINED = {
  success: true,
  data: undefined,
};
```

### FIXTURE_DATA_NULL

```typescript
// GAP-TEST-01b: result.data が null のケース
// Main Process 側でデータ取得失敗時に null を返す可能性
const FIXTURE_DATA_NULL = {
  success: true,
  data: null,
};
```

### FIXTURE_EMPTY_PROVIDERS

```typescript
// GAP-TEST-02: providers が空配列のケース
// 全プロバイダーが未登録の状態
const FIXTURE_EMPTY_PROVIDERS = {
  success: true,
  data: {
    providers: [],
  },
};
```

### FIXTURE_MALFORMED_ELEMENT

```typescript
// GAP-TEST-03, 03b, 03c: malformed な要素を含むケース
const FIXTURE_MALFORMED_ELEMENT = {
  success: true,
  data: {
    providers: [
      { provider: "openai", status: "active" }, // 正常
      null, // GAP-TEST-03c: null 要素
      undefined, // GAP-TEST-03c: undefined 要素
      { status: "active" }, // GAP-TEST-03: provider フィールド欠損
      { provider: "anthropic" }, // GAP-TEST-03b: status フィールド欠損
      42, // GAP-TEST-03c: 数値
      "invalid-string", // GAP-TEST-03c: 文字列
    ],
  },
};
```

### FIXTURE_REJECTION

```typescript
// GAP-TEST-04: apiKey.list() が reject するケース
// ネットワークエラーや IPC 通信失敗
const FIXTURE_REJECTION = new Error("IPC channel disconnected");
```

## テスト設計方針

### 各テストの期待動作

| テスト ID    | 入力                           | 期待動作                                                                        |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------- |
| GAP-TEST-01  | data: undefined                | クラッシュせず、全4プロバイダーが「未登録」状態で表示される                     |
| GAP-TEST-01b | data: null                     | クラッシュせず、全4プロバイダーが「未登録」状態で表示される                     |
| GAP-TEST-02  | providers: []                  | 全4プロバイダー（OpenAI, Anthropic, Google, Azure）が「未登録」状態で表示される |
| GAP-TEST-03  | provider フィールド欠損        | 該当要素がフィルタされ、正常な要素のみ表示される                                |
| GAP-TEST-03b | status フィールド欠損          | 該当要素がフィルタされ、正常な要素のみ表示される                                |
| GAP-TEST-03c | null/undefined/数値/文字列混在 | malformed 要素が全てフィルタされ、正常な要素のみ表示される                      |
| GAP-TEST-04  | Promise.reject                 | エラーメッセージが表示され、クラッシュしない                                    |

### カバレッジ対象

- **Line Coverage**: normalizeProviders 関数内の全分岐パス
- **Branch Coverage**: Array.isArray チェック、型ガード、フィルタ条件の true/false 両方
- **Function Coverage**: normalizeProviders、エラーハンドラ
