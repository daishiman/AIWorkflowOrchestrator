# Phase 6: テストデータ Fixture 計画

## タスク ID

06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001

## 計測日

2026-03-08

## Renderer 側テスト Fixture

### ApiKeysSection.test.tsx

#### モック構造

```typescript
const mockApiKeyApi = {
  list: vi.fn(),
  save: vi.fn(),
  validate: vi.fn(),
  delete: vi.fn(),
};
```

#### 再利用 Fixture データ

| Fixture 名                 | 用途                     | 値                                                    |
| -------------------------- | ------------------------ | ----------------------------------------------------- |
| `mockRegisteredProvider`   | 登録済みプロバイダー     | `{ provider: "openai", status: "registered", ... }`   |
| `mockUnregisteredProvider` | 未登録プロバイダー       | `{ provider: "anthropic", status: "not_registered" }` |
| `mockMalformedProvider`    | malformed 要素（GAP-03） | `{ status: "registered" }`（provider 欠損）           |
| `mockSuccessResult`        | 正常レスポンス           | `{ success: true, data: { providers: [...] } }`       |
| `mockNullDataResult`       | GAP-01b フォールバック   | `{ success: true, data: null }`                       |
| `mockUndefinedDataResult`  | GAP-01 フォールバック    | `{ success: true, data: undefined }`                  |
| `mockNonArrayProviders`    | RED-03 フォールバック    | `{ success: true, data: { providers: "not-array" } }` |

### 設計方針

- テストファイル内でインラインモック定義を使用（外部 fixture ファイル不要）
- 各テストの `beforeEach` で `vi.clearAllMocks()` によりモック状態をリセット
- `window.electronAPI` はテストごとに必要な形状のみ定義（最小権限原則に準拠）

## Main Process 側テスト Fixture

### apiKeyHandlers.list.test.ts

#### モック構造

```typescript
const mockApiKeyStorage = {
  listProviders: vi.fn(),
  saveKey: vi.fn(),
  validateKey: vi.fn(),
  deleteKey: vi.fn(),
};
```

#### 再利用 Fixture データ

| Fixture 名           | 用途                    | 値                                                    |
| -------------------- | ----------------------- | ----------------------------------------------------- |
| `normalProviders`    | 正常な providers 配列   | `[{ provider: "openai", status: "registered" }, ...]` |
| `nullProviders`      | GAP-05 null テスト      | `null`                                                |
| `undefinedProviders` | GAP-05 undefined テスト | `undefined`                                           |
| `stringProviders`    | GAP-05 非配列テスト     | `"not-an-array"`                                      |
| `partialProviders`   | status 欠損テスト       | `[{ provider: "openai" }]`（status なし）             |

### 設計方針

- `beforeEach` で `mockApiKeyStorage` の各メソッドをリセット
- IPC イベントオブジェクトは最小モック（`{ sender: { id: 1 } }`）で構成
- `validateIpcSender` はモジュールレベルでモック化
