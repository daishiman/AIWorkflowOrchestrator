# アーキテクチャ設計書: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| 作成日       | 2026-02-07                               |
| Phase        | 2 (設計)                                 |
| ドキュメント | アーキテクチャ設計書                     |

---

## 1. 概要

### 1.1 設計目的

認証キー管理基盤のアーキテクチャを定義し、既存の Electron 3 プロセスモデルに準拠した安全な実装パターンを確立する。

### 1.2 設計原則

| 原則                        | 適用                                    |
| --------------------------- | --------------------------------------- |
| 最小権限 (Least Privilege)  | 認証キーは Main Process のみでアクセス  |
| 多層防御 (Defense in Depth) | safeStorage + electron-store の二重保護 |
| 単一責務 (SRP)              | AuthKeyService は認証キー管理のみを担当 |
| 依存性逆転 (DIP)            | IAuthKeyService インターフェースに依存  |
| 関心の分離 (SoC)            | Storage / Service / IPC Handler を分離  |

---

## 2. レイヤー構成

### 2.1 全体アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     Settings UI                         │ │
│  │  (キー入力フォーム - 別タスクで実装)                    │ │
│  │  window.electronAPI.authKey.set(key)                    │ │
│  │  window.electronAPI.authKey.exists()                    │ │
│  │  window.electronAPI.authKey.validate(key)               │ │
│  │  window.electronAPI.authKey.delete()                    │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │ IPC (auth-key:*)
                         │ contextBridge
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Preload Bridge                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  contextBridge.exposeInMainWorld('electronAPI', {      │ │
│  │    authKey: {                                          │ │
│  │      set: (key) => ipcRenderer.invoke('auth-key:set',  │ │
│  │                                       { key }),        │ │
│  │      exists: () => ipcRenderer.invoke('auth-key:exists'),│ │
│  │      validate: (key) => ipcRenderer.invoke(            │ │
│  │                         'auth-key:validate', { key }), │ │
│  │      delete: () => ipcRenderer.invoke('auth-key:delete')│ │
│  │    }                                                   │ │
│  │  })                                                    │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 AuthKeyHandlers (IPC Layer)             │ │
│  │  - registerAuthKeyHandlers(authKeyService)              │ │
│  │  - auth-key:set / exists / validate / delete            │ │
│  │  - validateIpcSender() による sender 検証               │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               AuthKeyService (Service Layer)            │ │
│  │  implements IAuthKeyService                             │ │
│  │  - setKey() / getKey() / hasKey()                       │ │
│  │  - validateKey() / deleteKey()                          │ │
│  │  - キーキャッシュ管理                                   │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│           ┌────────────┴────────────┐                       │
│           ▼                         ▼                        │
│  ┌─────────────────┐     ┌─────────────────────┐            │
│  │  safeStorage    │     │   electron-store    │            │
│  │  (暗号化/復号)  │     │   (永続化)          │            │
│  │  Electron API   │     │   "auth-key-store"  │            │
│  └─────────────────┘     └─────────────────────┘            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               SkillExecutor (Consumer)                  │ │
│  │  - constructor(mainWindow, permissionStore?,            │ │
│  │                authKeyService?)                         │ │
│  │  - callSDKQuery() で authKeyService.getKey() を呼出     │ │
│  │  - query({ apiKey, ... }) で SDK に認証キーを渡す       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 依存方向

```
Renderer → Preload (contextBridge) → Main (IPC Handlers → Service → Storage)
                                         ↑
                                    SkillExecutor
```

- 依存は常に上位層から下位層への一方向
- SkillExecutor は IAuthKeyService インターフェースに依存（DIP）

---

## 3. ディレクトリ構造

```
apps/desktop/src/main/
├── infrastructure/
│   ├── secureStorage.ts          # 既存（リフレッシュトークン用）
│   └── authKeyStorage.ts         # 新規: 認証キー暗号化/永続化
├── services/
│   ├── auth/
│   │   ├── AuthKeyService.ts     # 新規: IAuthKeyService 実装
│   │   ├── IAuthKeyService.ts    # 新規: インターフェース定義
│   │   └── __tests__/
│   │       └── AuthKeyService.test.ts
│   └── skill/
│       └── SkillExecutor.ts      # 修正: AuthKeyService 統合
├── ipc/
│   ├── authHandlers.ts           # 既存（OAuth認証用）
│   └── authKeyHandlers.ts        # 新規: 認証キーIPC
└── preload/
    └── index.ts                  # 拡張: authKey API 追加

packages/shared/src/
├── ipc/
│   └── channels.ts               # 拡張: AUTH_KEY_CHANNELS 追加
└── types/
    └── auth-key.ts               # 新規: 認証キー関連型定義
```

---

## 4. コンポーネント詳細

### 4.1 AuthKeyStorage (Infrastructure Layer)

**責務**: 認証キーの暗号化/復号と永続化

**ファイル**: `apps/desktop/src/main/infrastructure/authKeyStorage.ts`

```typescript
/**
 * 認証キーストレージ
 *
 * safeStorage API を使用して認証キーを暗号化し、
 * electron-store で永続化する。
 *
 * @see secureStorage.ts パターンを踏襲
 */

interface AuthKeyStorageConfig {
  storeName?: string; // デフォルト: "auth-key-store"
}

interface IAuthKeyStorage {
  store(key: string): Promise<void>;
  retrieve(): Promise<string | null>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}

function createAuthKeyStorage(config?: AuthKeyStorageConfig): IAuthKeyStorage;
```

**設計ポイント**:

- 遅延初期化パターン（テスト対応）
- `safeStorage.isEncryptionAvailable()` チェック
- 暗号化不可時の環境別フォールバック

### 4.2 AuthKeyService (Service Layer)

**責務**: 認証キーのビジネスロジック

**ファイル**: `apps/desktop/src/main/services/auth/AuthKeyService.ts`

```typescript
/**
 * 認証キー管理サービス
 *
 * IAuthKeyService インターフェースを実装し、
 * 認証キーの設定・取得・検証・削除を提供する。
 */

class AuthKeyService implements IAuthKeyService {
  private storage: IAuthKeyStorage;
  private cachedKey: string | null = null;

  constructor(storage?: IAuthKeyStorage);

  async setKey(key: string): Promise<void>;
  async getKey(): Promise<string | null>;
  async hasKey(): Promise<boolean>;
  async validateKey(key: string): Promise<boolean>;
  async deleteKey(): Promise<void>;

  // キャッシュクリア（テスト用）
  clearCache(): void;
}
```

**設計ポイント**:

- メモリキャッシュによるパフォーマンス最適化
- 環境変数フォールバック（`ANTHROPIC_API_KEY`）
- Anthropic API を使用したキー検証

### 4.3 AuthKeyHandlers (IPC Layer)

**責務**: IPC ハンドラーの登録と sender 検証

**ファイル**: `apps/desktop/src/main/ipc/authKeyHandlers.ts`

```typescript
/**
 * 認証キーIPC ハンドラー
 *
 * Renderer からの認証キー操作リクエストを処理する。
 * 全ハンドラーで sender 検証を実施。
 */

function registerAuthKeyHandlers(authKeyService: IAuthKeyService): void {
  // auth-key:set
  // auth-key:exists
  // auth-key:validate
  // auth-key:delete
}

function unregisterAuthKeyHandlers(): void;
```

**設計ポイント**:

- `validateIpcSender()` による全ハンドラーでの sender 検証
- 認証キーを IPC レスポンスに含めない
- エラーメッセージのサニタイズ

### 4.4 SkillExecutor 統合

**責務**: SDK 呼び出し時の認証キー取得

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts` (修正)

```typescript
class SkillExecutor {
  private mainWindow: BrowserWindow;
  private permissionResolver: PermissionResolver;
  private permissionStore: IPermissionStore | null;
  private authKeyService: IAuthKeyService | null; // 新規追加

  constructor(
    mainWindow: BrowserWindow,
    permissionStore?: IPermissionStore,
    authKeyService?: IAuthKeyService, // 新規追加（オプション）
  ) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
    this.permissionStore = permissionStore ?? new PermissionStore();
    this.authKeyService = authKeyService ?? null;
  }

  private async callSDKQuery(
    prompt: string,
    options: SDKQueryOptions,
  ): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
    // 認証キーを取得
    const apiKey = await this.getApiKey();

    const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;

    const conversation = query({
      prompt,
      options: {
        apiKey, // 認証キーを渡す
        tools: options.tools,
        permissionMode: options.permissionMode,
        signal: options.signal,
      },
    });

    return {
      stream: () => conversation.stream(),
    };
  }

  private async getApiKey(): Promise<string> {
    // AuthKeyService 経由で取得
    if (this.authKeyService) {
      const key = await this.authKeyService.getKey();
      if (key) {
        return key;
      }
    }

    // 環境変数フォールバック
    const envKey = process.env.ANTHROPIC_API_KEY;
    if (envKey) {
      return envKey;
    }

    // キー未設定エラー
    throw new AuthKeyNotSetError(
      "Anthropic API Key is not configured. Please set it in Settings.",
    );
  }
}
```

---

## 5. データフロー

### 5.1 認証キー設定フロー

```
1. Renderer: window.electronAPI.authKey.set(key)
        │
        ▼
2. Preload: ipcRenderer.invoke('auth-key:set', { key })
        │
        ▼
3. Main (AuthKeyHandlers):
   - validateIpcSender(event.sender)
   - authKeyService.setKey(key)
        │
        ▼
4. Main (AuthKeyService):
   - バリデーション（空文字・長さチェック）
   - storage.store(key)
   - キャッシュ更新
        │
        ▼
5. Main (AuthKeyStorage):
   - safeStorage.encryptString(key)
   - store.set('encryptedAuthKey', base64Encoded)
        │
        ▼
6. Response: { success: true }
```

### 5.2 スキル実行時の認証キー使用フロー

```
1. SkillExecutor.execute(request, skill)
        │
        ▼
2. SkillExecutor.executeWithRetry()
        │
        ▼
3. SkillExecutor.callSDKQuery()
        │
        ▼
4. SkillExecutor.getApiKey()
        │
        ├─── AuthKeyService.getKey()
        │         │
        │         ├─── キャッシュ確認
        │         │
        │         └─── (キャッシュなし) storage.retrieve()
        │                   │
        │                   └─── safeStorage.decryptString()
        │
        └─── (AuthKeyService なし) process.env.ANTHROPIC_API_KEY
        │
        ▼
5. query({ apiKey, prompt, options })
```

---

## 6. セキュリティ設計

### 6.1 認証キーの保護

| 保護対象 | 手法                                   |
| -------- | -------------------------------------- |
| 保存時   | safeStorage による OS レベル暗号化     |
| 転送時   | IPC 経由（プロセス間通信、暗号化不要） |
| メモリ上 | キャッシュは必要時のみ保持             |
| ログ出力 | `[REDACTED]` に置換                    |

### 6.2 IPC セキュリティ

```typescript
// 全ハンドラーで sender 検証
ipcMain.handle(AUTH_KEY_CHANNELS.SET, async (event, { key }) => {
  const validation = validateIpcSender(event.sender);
  if (!validation.valid) {
    throw new Error(validation.reason);
  }
  // ...
});
```

### 6.3 Renderer への非公開

- `auth-key:get` チャンネルは存在しない（キー取得 API を公開しない）
- `auth-key:exists` のレスポンスにはキーの値を含めない
- エラーメッセージにはキーの値を含めない

---

## 7. エラーハンドリング

### 7.1 エラー階層

```
AppError (抽象クラス)
└── InfrastructureError
    └── ExternalServiceError
        ├── AuthKeyNotSetError (code: 3001)
        └── AuthKeyInvalidError (code: 3002)
```

### 7.2 エラーコード設計

| エラークラス        | コード | 意味           | リトライ可能 |
| ------------------- | ------ | -------------- | ------------ |
| AuthKeyNotSetError  | 3001   | 認証キー未設定 | false        |
| AuthKeyInvalidError | 3002   | 認証キー無効   | false        |

---

## 8. テスト設計

### 8.1 ユニットテスト

| 対象クラス      | テスト内容                                 |
| --------------- | ------------------------------------------ |
| AuthKeyStorage  | 暗号化/復号、永続化、フォールバック        |
| AuthKeyService  | setKey/getKey/hasKey/validateKey/deleteKey |
| AuthKeyHandlers | sender 検証、レスポンス形式                |

### 8.2 統合テスト

| シナリオ                  | 内容                                 |
| ------------------------- | ------------------------------------ |
| キー設定→スキル実行       | IPC → Service → SkillExecutor の連携 |
| キー未設定→スキル実行失敗 | AuthKeyNotSetError の伝播確認        |
| 環境変数フォールバック    | ANTHROPIC_API_KEY 使用時の動作確認   |

---

## 9. 後方互換性

### 9.1 SkillExecutor コンストラクタ

```typescript
// 既存の呼び出し（引き続き動作）
const executor = new SkillExecutor(mainWindow);
const executor = new SkillExecutor(mainWindow, permissionStore);

// 新しい呼び出し
const executor = new SkillExecutor(mainWindow, permissionStore, authKeyService);
```

### 9.2 環境変数フォールバック

`ANTHROPIC_API_KEY` 環境変数が設定されている場合、AuthKeyService が未設定でも動作する。これにより、既存の開発環境設定との互換性を維持。

---

## 10. 将来拡張ポイント

| 拡張項目             | 対応方針                                      |
| -------------------- | --------------------------------------------- |
| 複数プロバイダー対応 | IAuthKeyService を IProviderKeyService に拡張 |
| キーローテーション   | AuthKeyService にローテーションメソッド追加   |
| 監査ログ             | setKey/deleteKey 呼び出し時にログ記録         |
| キー有効期限         | メタデータとして有効期限を保存                |
