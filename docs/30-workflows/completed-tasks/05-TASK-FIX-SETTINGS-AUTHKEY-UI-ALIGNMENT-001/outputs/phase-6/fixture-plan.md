# Phase 6: テストフィクスチャ設計

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 6 - テスト拡充                             |
| タスクID   | TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| 機能名     | Settings AuthKey UI Alignment              |
| 作成日     | 2026-03-06                                 |
| ステータス | 完了                                       |

## 目的

テストコードで使用するモック・フィクスチャの共通化設計を記録する。

## 共通モックオブジェクト

### mockAuthKeyAPI

AuthKeySection が依存する Preload API のモック定義。

```typescript
const mockAuthKeyAPI = {
  getKey: vi.fn().mockResolvedValue({ success: true, data: "" }),
  setKey: vi.fn().mockResolvedValue({ success: true }),
  removeKey: vi.fn().mockResolvedValue({ success: true }),
  validateKey: vi
    .fn()
    .mockResolvedValue({ success: true, data: { valid: true } }),
};
```

**使用箇所:**

- `AuthKeySection.test.tsx` -- 全13テストケース
- `SettingsView.test.tsx` -- AuthKeySection 連携テスト（6件）

### mockAuthModeStatus

認証モード状態のモック定義。

```typescript
const mockAuthModeStatus = {
  currentMode: "authkey" as const,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
```

**バリエーション:**

| バリエーション名    | currentMode | isAuthenticated | 用途                   |
| ------------------- | ----------- | --------------- | ---------------------- |
| defaultStatus       | `authkey`   | `false`         | 初期状態テスト         |
| authenticatedStatus | `authkey`   | `true`          | 認証済み状態テスト     |
| oauthModeStatus     | `oauth`     | `false`         | OAuth モード表示テスト |
| loadingStatus       | `authkey`   | `false`         | ローディング表示テスト |
| errorStatus         | `authkey`   | `false`         | エラー表示テスト       |

### mockSettingsStore

SettingsView が依存する Zustand Store のモック定義。

```typescript
const mockSettingsStore = {
  authMode: "authkey",
  setAuthMode: vi.fn(),
  apiKey: "",
  setApiKey: vi.fn(),
  isLoading: false,
  error: null,
};
```

## フィクスチャ共通化の方針

### 現状の構造

各テストファイル内で `beforeEach` にてモックを初期化。テストファイル数が2ファイルと限定的であるため、現時点では共通フィクスチャファイルへの抽出は見送り。

### 共通化の閾値

以下の条件を満たした場合に `__fixtures__/` ディレクトリへ抽出を検討:

1. 同一モック定義を使用するテストファイルが **3ファイル以上** に増加
2. モック定義の変更が **複数ファイルに波及** する事象が発生
3. AuthKeySection 関連コンポーネントが **追加** される場合

### beforeEach リセットパターン

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  mockAuthKeyAPI.getKey.mockResolvedValue({ success: true, data: "" });
  mockAuthModeStatus.currentMode = "authkey";
  mockAuthModeStatus.isAuthenticated = false;
  mockAuthModeStatus.error = null;
});
```

P9（モジュールスコープ変数のテスト間リーク）対策として、全テストで `beforeEach` によるリセットを実施。

## 結論

現時点のテスト規模（2ファイル・41テスト）では、ファイル内でのモック定義で十分管理可能。将来的な拡張時の共通化閾値を明確化した。
