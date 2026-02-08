# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| Phase      | 5                                        |
| Phase名    | 実装                                     |
| 前提Phase  | Phase 4 (テスト作成)                     |
| 後続Phase  | Phase 6 (テスト拡充)                     |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-07                               |
| 機能名     | Claude Agent SDK用認証キー管理基盤の構築 |

---

## 目的

TDD Green フェーズ：テストを通す最小限の実装を行う。

Phase 4で作成した失敗するテスト（Red状態）を成功させる（Green状態）実装を行う。

## 背景

Anthropic 認証キーをセキュアに管理し、SDK `query()` 呼び出し時に渡す基盤を構築する。
以下のコンポーネントを実装する：

1. **AuthKeyService** - 認証キー管理サービス（暗号化保存・復号・検証）
2. **SkillExecutor修正** - 認証キーを `query()` に渡す
3. **IPC ハンドラー** - 認証キーの設定・検証・削除
4. **Preload API 拡張** - 認証キー操作用ブリッジ

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: clean-code-practices

**パス**: `.claude/skills/clean-code-practices/SKILL.md`

**Trigger条件**:

- クリーンコードに従った実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `apps/desktop/src/main/services/auth/AuthKeyService.ts`（コード成果物）
- `apps/desktop/src/main/services/auth/types.ts`（コード成果物）
- `apps/desktop/src/main/services/auth/index.ts`（コード成果物）

---

### スキル2: secure-coding

**パス**: `.claude/skills/secure-coding/SKILL.md`

**Trigger条件**:

- セキュリティ要件を満たす実装が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 暗号化・復号処理のセキュリティを確認

**期待される成果物**:

- `outputs/phase-5/security-review.md`（セキュリティ確認記録）

---

## 参照資料

| 参照資料                  | パス                                                                        | 内容                |
| ------------------------- | --------------------------------------------------------------------------- | ------------------- |
| Phase 4 テスト仕様書      | `outputs/phase-4/test-specification.md`                                     | 期待動作            |
| AuthKeyServiceテスト      | `apps/desktop/src/main/services/auth/__tests__/AuthKeyService.test.ts`      | Redテスト           |
| SkillExecutor認証テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.auth.test.ts` | Redテスト           |
| 既存SecureStorageパターン | `apps/desktop/src/main/services/secureStorage.ts`                           | 実装パターン参照    |
| 既存StoreHandlersパターン | `apps/desktop/src/main/ipc/storeHandlers.ts`                                | IPC実装パターン参照 |

### システム仕様（プロジェクトルール）

> 実装前に必ず以下のプロジェクトルールを確認してください。

| 参照資料         | パス                                                        | 内容                 |
| ---------------- | ----------------------------------------------------------- | -------------------- |
| セキュリティ原則 | `.claude/rules/04-electron-security.md`                     | 認証セキュリティ原則 |
| IPC原則          | `.claude/rules/04-electron-security.md#IPCセキュリティ原則` | IPCセキュリティ      |
| アーキテクチャ   | `.claude/rules/01-architecture.md`                          | レイヤー依存方向     |

### システム仕様（aiworkflow-requirements）

> 以下のシステム仕様書から既存パターンを抽出し、実装に反映してください。

| 参照資料             | パス                                                                                 | 内容                                                    |
| -------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | safeStorage実装パターン（暗号化→Base64→electron-store） |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | safeInvokeラッパー、withValidation（必須）              |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | 既存認証型定義パターン                                  |
| 認証IPC設計          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                  | 認証IPCチャンネル設計、sender検証                       |
| Electronサービス構造 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Facadeパターン、サービス登録                            |
| IPC永続化パターン    | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`          | registerAllIpcHandlers への登録手順                     |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラーコード範囲（3000-3999: External Service Error）   |
| SkillExecutor仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | SkillExecutor型定義、修正箇所                           |

### 既存実装パターン参照（整合性確認必須）

> 以下の既存実装と命名規則・設計パターンを統一してください。

| 既存実装       | パス                                                    | 確認項目                         |
| -------------- | ------------------------------------------------------- | -------------------------------- |
| apiKeyStorage  | `apps/desktop/src/main/infrastructure/apiKeyStorage.ts` | Store名、暗号化パターン          |
| apiKeyHandlers | `apps/desktop/src/main/ipc/apiKeyHandlers.ts`           | チャンネル命名（`apiKey:*`形式） |
| secureStorage  | `apps/desktop/src/main/infrastructure/secureStorage.ts` | safeStorage使用パターン          |
| storeHandlers  | `apps/desktop/src/main/ipc/storeHandlers.ts`            | IPCハンドラー登録パターン        |

---

## 成果物

| 成果物             | パス                                                    | 内容                   |
| ------------------ | ------------------------------------------------------- | ---------------------- |
| AuthKeyService     | `apps/desktop/src/main/services/auth/AuthKeyService.ts` | 認証キー管理サービス   |
| 型定義             | `apps/desktop/src/main/services/auth/types.ts`          | 型・スキーマ定義       |
| エクスポート       | `apps/desktop/src/main/services/auth/index.ts`          | モジュールエクスポート |
| IPC ハンドラー     | `apps/desktop/src/main/ipc/authKeyHandlers.ts`          | 認証キーIPC ハンドラー |
| Preload API 拡張   | `apps/desktop/src/preload/authKeyApi.ts`                | Preload API            |
| IPC チャンネル追加 | `apps/desktop/src/preload/channels.ts`（更新）          | チャンネル定義追加     |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`             | 実装内容の概要         |

---

## 実装指針

### ファイル構成

```
apps/desktop/src/main/services/auth/
├── AuthKeyService.ts      # 認証キー管理サービス
├── types.ts               # 型定義
├── index.ts               # エクスポート
└── __tests__/
    ├── AuthKeyService.test.ts
    └── mocks.ts

apps/desktop/src/main/ipc/
├── authKeyHandlers.ts     # IPC ハンドラー
└── __tests__/
    └── authKeyHandlers.test.ts

apps/desktop/src/preload/
├── authKeyApi.ts          # Preload API
├── channels.ts            # チャンネル定義（更新）
└── index.ts               # エクスポート（更新）
```

### 1. AuthKeyService 実装

```typescript
// apps/desktop/src/main/services/auth/types.ts
export interface AuthKeyServiceResult<T> {
  success: boolean;
  data?: T;
  error?: AuthKeyError;
}

export interface AuthKeyError {
  code: AuthKeyErrorCode;
  message: string;
  details?: unknown;
}

export type AuthKeyErrorCode =
  | "VALIDATION_ERROR" // キー形式不正
  | "STORAGE_ERROR" // 保存・取得失敗
  | "ENCRYPTION_ERROR" // 暗号化・復号失敗
  | "NETWORK_ERROR" // API接続失敗
  | "AUTHENTICATION_ERROR" // キー無効
  | "UNKNOWN_ERROR"; // 不明なエラー

export interface AuthKeyValidationResult {
  isValid: boolean;
  message?: string;
}
```

```typescript
// apps/desktop/src/main/services/auth/AuthKeyService.ts
import { safeStorage } from "electron";
import Store from "electron-store";

interface AuthKeyStoreSchema {
  anthropicApiKey?: string;
}

const STORAGE_KEY = "auth.anthropic.apiKey";
const API_KEY_PATTERN = /^sk-ant-[a-zA-Z0-9-_]{40,}$/;

export class AuthKeyService {
  private store: Store<AuthKeyStoreSchema>;

  constructor() {
    this.store = new Store<AuthKeyStoreSchema>({
      name: "auth-keys",
      encryptionKey: "aiworkflow-auth-keys",
    });
  }

  /**
   * APIキーを暗号化して保存
   */
  async setApiKey(apiKey: string): Promise<AuthKeyServiceResult<void>> {
    // バリデーション
    if (!apiKey || apiKey.trim() === "") {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "APIキーは必須です" },
      };
    }

    if (!API_KEY_PATTERN.test(apiKey)) {
      return {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "APIキー形式が不正です" },
      };
    }

    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(apiKey);
        this.store.set(STORAGE_KEY, encrypted.toString("base64"));
      } else {
        console.warn("[AuthKeyService] 暗号化が利用不可、平文で保存");
        this.store.set(STORAGE_KEY, apiKey);
      }
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "STORAGE_ERROR",
          message: "キーの保存に失敗しました",
          details: error,
        },
      };
    }
  }

  /**
   * APIキーを復号して取得
   */
  async getApiKey(): Promise<AuthKeyServiceResult<string | null>> {
    try {
      const stored = this.store.get(STORAGE_KEY);
      if (!stored) {
        return { success: true, data: null };
      }

      if (safeStorage.isEncryptionAvailable()) {
        try {
          const encrypted = Buffer.from(stored, "base64");
          const decrypted = safeStorage.decryptString(encrypted);
          return { success: true, data: decrypted };
        } catch {
          // フォールバック
          return { success: true, data: stored };
        }
      }
      return { success: true, data: stored };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "STORAGE_ERROR",
          message: "キーの取得に失敗しました",
          details: error,
        },
      };
    }
  }

  /**
   * APIキーを削除
   */
  async deleteApiKey(): Promise<AuthKeyServiceResult<void>> {
    try {
      this.store.delete(STORAGE_KEY);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "STORAGE_ERROR",
          message: "キーの削除に失敗しました",
          details: error,
        },
      };
    }
  }

  /**
   * APIキーが設定されているか確認
   */
  async hasApiKey(): Promise<boolean> {
    const result = await this.getApiKey();
    return result.success && result.data !== null && result.data.length > 0;
  }

  /**
   * APIキーを検証（Anthropic APIへの接続確認）
   */
  async validateApiKey(): Promise<
    AuthKeyServiceResult<AuthKeyValidationResult>
  > {
    const keyResult = await this.getApiKey();
    if (!keyResult.success || !keyResult.data) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "APIキーが設定されていません",
        },
      };
    }

    try {
      // Anthropic SDK でキー検証
      const { Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic({ apiKey: keyResult.data });

      // 最小限のリクエストでキー有効性を確認
      await client.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1,
        messages: [{ role: "user", content: "test" }],
      });

      return { success: true, data: { isValid: true } };
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 401 || err.status === 403) {
        return {
          success: true,
          data: { isValid: false, message: "APIキーが無効です" },
        };
      }
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "API接続に失敗しました",
          details: error,
        },
      };
    }
  }
}
```

### 2. SkillExecutor 修正

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts への追加

import { AuthKeyService } from "../auth";

// コンストラクタ修正
private authKeyService: AuthKeyService;

constructor(mainWindow: BrowserWindow, permissionStore?: IPermissionStore) {
  // ...existing code...
  this.authKeyService = new AuthKeyService();
}

// callSDKQuery 修正
private async callSDKQuery(
  prompt: string,
  options: SDKQueryOptions,
): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
  // 認証キー取得
  const keyResult = await this.authKeyService.getApiKey();
  if (!keyResult.success || !keyResult.data) {
    throw new Error("AUTHENTICATION_ERROR: APIキーが設定されていません");
  }

  const { query } = (await import("@anthropic-ai/claude-agent-sdk")) as any;

  const conversation = query({
    prompt,
    apiKey: keyResult.data,  // 認証キーを渡す
    options: {
      tools: options.tools,
      permissionMode: options.permissionMode,
      signal: options.signal,
    },
  });

  return {
    stream: () => conversation.stream(),
  };
}
```

### 3. IPC ハンドラー実装

```typescript
// apps/desktop/src/main/ipc/authKeyHandlers.ts
import { ipcMain } from "electron";
import { IPC_CHANNELS } from "../../preload/channels";
import { AuthKeyService } from "../services/auth";

const authKeyService = new AuthKeyService();

export function registerAuthKeyHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.AUTH_KEY_SAVE, async (_event, { apiKey }) => {
    return authKeyService.setApiKey(apiKey);
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_KEY_DELETE, async () => {
    return authKeyService.deleteApiKey();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_KEY_VALIDATE, async () => {
    return authKeyService.validateApiKey();
  });

  ipcMain.handle(IPC_CHANNELS.AUTH_KEY_HAS, async () => {
    return { success: true, data: await authKeyService.hasApiKey() };
  });
}
```

### 4. Preload API 拡張

```typescript
// apps/desktop/src/preload/channels.ts への追加
export const IPC_CHANNELS = {
  // ...existing channels...
  AUTH_KEY_SAVE: "auth-key:save",
  AUTH_KEY_DELETE: "auth-key:delete",
  AUTH_KEY_VALIDATE: "auth-key:validate",
  AUTH_KEY_HAS: "auth-key:has",
} as const;

// ALLOWED_INVOKE_CHANNELS への追加
export const ALLOWED_INVOKE_CHANNELS = [
  // ...existing channels...
  IPC_CHANNELS.AUTH_KEY_SAVE,
  IPC_CHANNELS.AUTH_KEY_DELETE,
  IPC_CHANNELS.AUTH_KEY_VALIDATE,
  IPC_CHANNELS.AUTH_KEY_HAS,
];
```

```typescript
// apps/desktop/src/preload/authKeyApi.ts
import { ipcRenderer } from "electron";
import { IPC_CHANNELS, ALLOWED_INVOKE_CHANNELS } from "./channels";

function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

export interface AuthKeyAPI {
  save: (
    apiKey: string,
  ) => Promise<{ success: boolean; error?: { code: string; message: string } }>;
  delete: () => Promise<{
    success: boolean;
    error?: { code: string; message: string };
  }>;
  validate: () => Promise<{
    success: boolean;
    data?: { isValid: boolean; message?: string };
    error?: { code: string; message: string };
  }>;
  has: () => Promise<{ success: boolean; data: boolean }>;
}

export const authKeyAPI: AuthKeyAPI = {
  save: (apiKey: string) => safeInvoke(IPC_CHANNELS.AUTH_KEY_SAVE, { apiKey }),
  delete: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_DELETE),
  validate: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_VALIDATE),
  has: () => safeInvoke(IPC_CHANNELS.AUTH_KEY_HAS),
};
```

---

## セキュリティ考慮事項

### 必須要件

1. **暗号化**: `safeStorage` を使用してAPIキーを暗号化保存
2. **メモリ保護**: キーは必要時のみ復号し、使用後は参照を解放
3. **ログ除外**: APIキーはログ出力しない
4. **IPC検証**: チャンネル名はホワイトリストで管理
5. **エラーサニタイズ**: 内部エラー詳細はRendererに露出しない

### チェックリスト

- [ ] APIキーがログに出力されていない
- [ ] safeStorage 暗号化が適用されている
- [ ] IPC チャンネルがホワイトリストに登録されている
- [ ] エラーメッセージに機密情報が含まれていない

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- AuthKeyService
pnpm --filter @repo/desktop test -- SkillExecutor.auth
pnpm --filter @repo/desktop test -- authKeyHandlers
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] Phase 4のテストがすべて成功している（Green状態）
- [ ] AuthKeyServiceクラスが実装されている
- [ ] 型定義（types.ts）が実装されている
- [ ] IPC ハンドラーが実装・登録されている
- [ ] Preload API が拡張されている
- [ ] SkillExecutorが認証キーをquery()に渡している
- [ ] TypeScript型エラーがない
- [ ] ESLint警告がない
- [ ] セキュリティ要件を満たしている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- clean-code-practices: {{result}}
- secure-coding: {{result}}

### TDD状態

- Green状態確認: {{Yes/No}}
- 成功テスト数: {{数}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### セキュリティ確認

- [ ] APIキーログ除外確認
- [ ] 暗号化適用確認
- [ ] IPC ホワイトリスト登録確認

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-auth-infrastructure/phase-6-test-expansion.md`
