# Phase 4: モック戦略

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001          |
| Phase      | 4                                                                  |
| 作成日     | 2026-03-20                                                         |
| 依存成果物 | outputs/phase-4/test-matrix.md, outputs/phase-2/contract-matrix.md |

## 概要

本ドキュメントは test-matrix.md に定義した CA / CB / CC / S テストケースを実装するために必要なモック戦略を定義する。IPC レスポンスの envelope 形式は P60 対策として統一形式を採用する。

---

## モック対象一覧

| モック対象          | インターフェース              | 担当 concern  | 使用テスト                 |
| ------------------- | ----------------------------- | ------------- | -------------------------- |
| `IAuthKeyService`   | `getKey(): string \| null`    | Concern A     | CA-1 〜 CA-5               |
| `IAuthModeService`  | `getMode(): AuthMode`         | Concern A     | CA-1 〜 CA-5               |
| `IAuthModeService`  | `getStatus(): AuthModeStatus` | Concern A + B | CA-1 〜 CA-5, CB-1 〜 CB-5 |
| IPC Main → Renderer | `response envelope`           | Concern A + B | S-1 〜 S-4                 |
| Zustand Store       | `capability slice`            | Concern B + C | CB-1 〜 CB-5, CC-1 〜 CC-5 |

---

## IAuthKeyService モック

### モック値パターン

| パターン名      | `getKey()` 戻り値          | 想定するテストケース                         |
| --------------- | -------------------------- | -------------------------------------------- |
| `validKey`      | `"sk-ant-api03-valid-key"` | CA-1, CA-3, CA-5                             |
| `nullKey`       | `null`                     | CA-2, CA-4                                   |
| `emptyKey`      | `""`                       | P42 対応：空文字列は null 同等として扱う     |
| `whitespaceKey` | `"   "`                    | P42 対応：スペースのみは null 同等として扱う |

### モック実装例

```typescript
// Vitest モック
const mockAuthKeyService: IAuthKeyService = {
  getKey: vi.fn(),
};

// CA-1 用セットアップ（API key 有効）
mockAuthKeyService.getKey.mockResolvedValue("sk-ant-api03-valid-key");

// CA-2 / CA-4 用セットアップ（API key 無効）
mockAuthKeyService.getKey.mockResolvedValue(null);

// P42 準拠：空文字列バリデーション確認
mockAuthKeyService.getKey.mockResolvedValue("");
// RuntimePolicyResolver 側で trim() === "" と等価に扱うことを検証

// P42 準拠：スペースのみバリデーション確認
mockAuthKeyService.getKey.mockResolvedValue("   ");
// RuntimePolicyResolver 側で .trim() === "" チェックが機能することを検証
```

---

## IAuthModeService モック

### getMode() モック値パターン

| パターン名     | `getMode()` 戻り値 | 想定するテストケース   |
| -------------- | ------------------ | ---------------------- |
| `apiKey`       | `"api-key"`        | CA-1, CA-3, CA-4, CA-5 |
| `subscription` | `"subscription"`   | CA-2                   |

### getStatus() モック値パターン（AuthModeStatus DTO）

各組み合わせで P60 対応の IPC response envelope 形式を使用する。

#### パターン 1: API key 有効 / subscription 無効（CA-1 対応）

```typescript
const mockStatusApiKeyValid: AuthModeStatus = {
  mode: "api-key",
  isValid: true,
  hasCredentials: true,
  message: "API キーが有効です",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "integratedRuntime",
  uiState: "ready",
};
```

#### パターン 2: API key 無効 / subscription 有効（CA-2 対応）

```typescript
const mockStatusSubscriptionValid: AuthModeStatus = {
  mode: "subscription",
  isValid: true,
  hasCredentials: true,
  message: "サブスクリプションが有効です",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "terminalSurface",
  uiState: "ready",
};
```

#### パターン 3: API key 有効 / subscription 有効（CA-3 対応）

```typescript
const mockStatusBoth: AuthModeStatus = {
  mode: "api-key",
  isValid: true,
  hasCredentials: true,
  message: "両方有効です",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "both",
  uiState: "ready",
};
```

#### パターン 4: API key 無効 / subscription 無効（CA-4 対応）

```typescript
const mockStatusNone: AuthModeStatus = {
  mode: "api-key",
  isValid: false,
  hasCredentials: false,
  message: "認証情報がありません",
  errorCode: "NO_CREDENTIALS",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "none",
  uiState: "blocked",
  blockedReason: "API キーが設定されていません",
  blockedAction: {
    label: "設定を開く",
    targetRoute: "/settings/api-key",
  },
};
```

#### パターン 5: API key timeout / subscription 有効（CA-5 対応）

```typescript
const mockStatusTimeout: AuthModeStatus = {
  mode: "api-key",
  isValid: false,
  hasCredentials: true,
  message: "接続がタイムアウトしました",
  errorCode: "CONNECTION_TIMEOUT",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "terminalSurface",
  uiState: "ready",
  blockedReason: "integratedRuntime は接続タイムアウトのため利用できません",
};
```

#### パターン 6: none / unavailable（CB-5, CC-5 対応）

```typescript
const mockStatusUnavailable: AuthModeStatus = {
  mode: "api-key",
  isValid: false,
  hasCredentials: false,
  message: "このデバイスでは利用できません",
  errorCode: "DEVICE_UNSUPPORTED",
  lastCheckedAt: Date.now(),
  // 新規フィールド
  capability: "none",
  uiState: "unavailable",
  blockedReason: "このデバイスではどちらの実行環境も利用できません",
  // blockedAction は undefined（解決 action なし）
};
```

---

## IPC Main → Renderer レスポンス envelope モック

### envelope 形式（P60 対応）

IPC response は必ず以下の統一 envelope 形式を使用する。P60 の教訓に従い、Phase 4（テスト設計）と Phase 5（実装）でアサーション形式の乖離が発生しないよう、envelope 形式をここで明示する。

```typescript
// 成功レスポンス形式
interface IpcSuccessResponse<T> {
  success: true;
  data: T;
}

// エラーレスポンス形式
interface IpcErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IpcResponse<T> = IpcSuccessResponse<T> | IpcErrorResponse;
```

### IPC モック値パターン

| パターン名          | `response` 形式                                                           | 想定するテストケース                    |
| ------------------- | ------------------------------------------------------------------------- | --------------------------------------- |
| `successWithStatus` | `{ success: true, data: AuthModeStatus }`                                 | S-1 capability 再計算後の正常レスポンス |
| `successWithBoth`   | `{ success: true, data: mockStatusBoth }`                                 | S-1 API key 設定後のレスポンス          |
| `errorValidation`   | `{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }` | P60 対応テスト用                        |
| `errorConnection`   | `{ success: false, error: { code: "CONNECTION_ERROR", message: "..." } }` | S-3 capability 劣化時のエラーレスポンス |

### IPC モック実装例

```typescript
// S-1 用: auth:status 更新後の成功レスポンス
const mockIpcResponse: IpcResponse<AuthModeStatus> = {
  success: true,
  data: {
    ...mockStatusApiKeyValid,
    capability: "integratedRuntime",
    uiState: "ready",
  },
};

// アサーション例（P60 準拠: フラット形式ではなく envelope 形式）
// ❌ 不正（P60 違反）
// expect(result).toEqual({ code: "VALIDATION_ERROR", message: "..." });

// ✅ 正解（envelope 形式）
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: expect.any(String) },
});
```

---

## Zustand Store モック（capability slice）

### Zustand Store モック値パターン

| パターン名             | capability            | uiState         | 想定するテストケース |
| ---------------------- | --------------------- | --------------- | -------------------- |
| `storeIntegratedReady` | `"integratedRuntime"` | `"ready"`       | CB-1, CC-1           |
| `storeTerminalReady`   | `"terminalSurface"`   | `"ready"`       | CB-2, CC-2           |
| `storeBothReady`       | `"both"`              | `"ready"`       | CB-3, CC-3           |
| `storeNoneBlocked`     | `"none"`              | `"blocked"`     | CB-4, CC-4           |
| `storeNoneUnavailable` | `"none"`              | `"unavailable"` | CB-5, CC-5           |

### Zustand Store モック実装例

```typescript
// P31 / P48 対応: 個別セレクタベースのモック
// useShallow が必要な派生セレクタにはラッパーを適用する

const createMockCapabilitySlice = (
  capability: Capability,
  uiState: UiState,
  blockedReason?: string,
  blockedAction?: BlockedAction,
) => ({
  capability,
  uiState,
  blockedReason,
  blockedAction,
  // アクション
  setCapability: vi.fn(),
  setUiState: vi.fn(),
});

// CB-1 / CC-1 用セットアップ
const mockStoreIntegratedReady = createMockCapabilitySlice(
  "integratedRuntime",
  "ready",
);

// CB-4 / CC-4 用セットアップ
const mockStoreNoneBlocked = createMockCapabilitySlice(
  "none",
  "blocked",
  "API キーが設定されていません",
  { label: "設定を開く", targetRoute: "/settings/api-key" },
);

// CB-5 / CC-5 用セットアップ
const mockStoreNoneUnavailable = createMockCapabilitySlice(
  "none",
  "unavailable",
  "このデバイスでは利用できません",
  undefined, // blockedAction なし
);
```

---

## モック管理方針

### beforeEach リセット

全テストで `beforeEach` を使用してモックをリセットし、テスト間の状態リークを防止する（P9 対応）。

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // 各テストの冒頭で必要なモック値を再設定する
});
```

### モック共有の禁止

- モック定義はテストファイルごとに独立して記述する（P9 対応）
- 共通のモックファクトリ関数は `__tests__/helpers/mock-factory.ts` に配置してインポートする
- テスト間でモックインスタンスを共有しない

### DI パターン対応（P21, P35 対応）

新規サービスを DI で追加した場合、影響範囲のテストファイルを事前に調査する。

```bash
# 影響範囲の調査コマンド例
grep -rn "RuntimePolicyResolver" apps/desktop/src/**/*.test.ts
```

---

## 参照

- `outputs/phase-4/test-matrix.md` - テストケース定義
- `outputs/phase-2/contract-matrix.md` - capability x state x CTA 全組み合わせテーブル
- `.claude/rules/06-known-pitfalls.md` - P9（テスト間リーク）, P21（DI 追加時モック修正）, P42（.trim() バリデーション）, P60（IPC レスポンス形式）
