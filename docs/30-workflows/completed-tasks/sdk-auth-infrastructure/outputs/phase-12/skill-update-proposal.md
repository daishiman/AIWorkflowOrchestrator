# Claude Agent SDK スキル更新提案

## 概要

TASK-FIX-16-1（SDK認証キー管理基盤）の実装に伴い、`claude-agent-sdk` スキルへの更新が必要な箇所を特定し、提案をまとめる。

---

## 確認結果サマリー

| 確認項目               | 現状                                            | 更新必要 |
| ---------------------- | ----------------------------------------------- | -------- |
| SDK統合パターン        | AuthKeyService統合パターンが未記載              | Yes      |
| apiKey オプション      | 環境変数のみ記載、apiKey引数なし                | Yes      |
| 認証エラーハンドリング | 401/403、AUTHENTICATION_ERROR 未記載            | Yes      |
| Electron統合           | SafeStorage言及あり、AuthKeyServiceパターンなし | Yes      |

---

## 1. SDK統合パターン

### 現状

`SKILL.md` の「SkillExecutor Pattern」セクション（L175-200付近）に、基本的なSkillExecutorインターフェースが記載されているが、AuthKeyService との統合パターンが含まれていない。

### 提案: SkillExecutor Pattern セクションに追記

```markdown
### AuthKeyService 統合パターン（TASK-FIX-16-1）

SkillExecutor は AuthKeyService を使用して SDK 認証キーを管理する。

\`\`\`typescript
interface IAuthKeyService {
getKey(): Promise<string | null>;
setKey(key: string): Promise<void>;
deleteKey(): Promise<void>;
hasKey(): Promise<boolean>;
}

// コンストラクタでの注入
class SkillExecutor {
constructor(
mainWindow: BrowserWindow,
permissionStore?: IPermissionStore,
authKeyService?: IAuthKeyService, // TASK-FIX-16-1
) {
this.authKeyService = authKeyService ?? null;
}
}
\`\`\`

📖 実装参照: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
```

---

## 2. apiKey オプション

### 現状

`query-api.md` の「認証設定」セクション（L245-276）では環境変数とプロバイダー設定のみが記載されており、`query()` への直接 apiKey 渡しパターンがない。

### 提案: query-api.md「認証設定」セクションに追記

```markdown
### プログラマティック API キー設定

環境変数を使用せず、API キーをプログラムから渡す場合:

\`\`\`typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

// AuthKeyService から取得したキーを渡す
const apiKey = await authKeyService.getKey();

const conversation = query({
prompt: "Your prompt here",
options: {
apiKey, // 直接指定
tools: ["Read", "Edit"],
},
});
\`\`\`

**優先順位**:

1. `options.apiKey`（明示指定）
2. `ANTHROPIC_API_KEY` 環境変数（フォールバック）

**注意**: Main Process でのみ API キーを扱い、Renderer には渡さないこと。
```

---

## 3. 認証エラーハンドリング

### 現状

`error-handling.md` では一般的なエラー処理パターンが記載されているが、認証固有のエラー（401/403、キー未設定）については触れられていない。

### 提案: error-handling.md に新セクション追加

```markdown
---

## 認証エラーハンドリング

### エラーコード

| HTTP ステータス | 意味         | リトライ可否 |
| --------------- | ------------ | ------------ |
| 401             | 認証失敗     | 不可         |
| 403             | アクセス拒否 | 不可         |
| -               | キー未設定   | 不可         |

### SkillExecutor での認証エラーコード

\`\`\`typescript
type SkillExecutionErrorCode =
| "AUTHENTICATION_ERROR" // キー未設定または無効
| ... ;
\`\`\`

### 実装パターン

\`\`\`typescript
private async getApiKey(): Promise<string> {
// AuthKeyService 経由で取得
if (this.authKeyService) {
const key = await this.authKeyService.getKey();
if (key) return key;
}

// 環境変数フォールバック
const envKey = process.env.ANTHROPIC_API_KEY;
if (envKey) return envKey;

// キー未設定エラー
throw {
code: "AUTHENTICATION_ERROR",
message: "Anthropic API Key is not configured. Please set it in Settings.",
};
}
\`\`\`

### Renderer での表示

認証エラーは以下のようにユーザーフレンドリーなメッセージで表示:

- **コード**: `AUTHENTICATION_ERROR`
- **メッセージ**: 「API キーが設定されていません。設定画面から設定してください。」
- **アクション**: 設定画面へのリンクを表示
```

---

## 4. Electron統合（Main Process での認証キー管理）

### 現状

`electron-ipc.md` の「セキュリティベストプラクティス」セクションに「SafeStorageで暗号化保存」と記載があるが、AuthKeyService の実装パターンは記載されていない。

### 提案: electron-ipc.md に新セクション追加

```markdown
---

## 認証キー管理（Main Process）

### AuthKeyService パターン

Main Process で API キーを安全に管理するサービス。Electron SafeStorage を使用して暗号化保存。

\`\`\`typescript
// apps/desktop/src/main/services/auth/AuthKeyService.ts

import { safeStorage } from "electron";
import Store from "electron-store";

export class AuthKeyService implements IAuthKeyService {
private store: Store<{ anthropic_api_key?: string }>;

async getKey(): Promise<string | null> {
const encrypted = this.store.get("anthropic_api_key");
if (!encrypted) return null;

    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Encryption not available");
    }

    return safeStorage.decryptString(Buffer.from(encrypted, "base64"));

}

async setKey(key: string): Promise<void> {
const encrypted = safeStorage.encryptString(key).toString("base64");
this.store.set("anthropic_api_key", encrypted);
}

async deleteKey(): Promise<void> {
this.store.delete("anthropic_api_key");
}

async hasKey(): Promise<boolean> {
return this.store.has("anthropic_api_key");
}
}
\`\`\`

### IPC チャネル

| チャネル            | 方向            | 用途         |
| ------------------- | --------------- | ------------ |
| `auth:setApiKey`    | Renderer → Main | キー設定     |
| `auth:hasApiKey`    | Renderer → Main | キー存在確認 |
| `auth:deleteApiKey` | Renderer → Main | キー削除     |

**セキュリティ原則**:

- `getKey()` は IPC 経由で公開しない（Main Process 内でのみ使用）
- Renderer には `hasKey()` で存在確認のみ許可
- キーの平文は Renderer に送信しない

📖 実装参照:

- `apps/desktop/src/main/services/auth/AuthKeyService.ts`
- `apps/desktop/src/main/ipc/authKeyHandlers.ts`
- `apps/desktop/src/preload/authKeyApi.ts`
```

---

## 5. SKILL.md への成果物追加

### 提案: 「関連ドキュメント」セクションに追記

```markdown
### TASK-FIX-16-1 SDK認証キー管理基盤成果物

| ドキュメント | パス                                                                                 | 説明                     |
| ------------ | ------------------------------------------------------------------------------------ | ------------------------ |
| 実装ガイド   | `docs/30-workflows/sdk-auth-infrastructure/outputs/phase-12/implementation-guide.md` | 認証キー管理の概念と実装 |
| IPC仕様      | `docs/30-workflows/sdk-auth-infrastructure/outputs/phase-12/ipc-documentation.md`    | authKey IPC チャネル仕様 |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`          | IAuthKeyService 型定義   |
```

### 提案: 「実装ファイル」セクションに追記

```markdown
### TASK-FIX-16-1 実装ファイル

| ファイル        | パス                                                    | 説明                         |
| --------------- | ------------------------------------------------------- | ---------------------------- |
| AuthKeyService  | `apps/desktop/src/main/services/auth/AuthKeyService.ts` | SafeStorage ベースのキー管理 |
| authKeyHandlers | `apps/desktop/src/main/ipc/authKeyHandlers.ts`          | IPC ハンドラー               |
| authKeyApi      | `apps/desktop/src/preload/authKeyApi.ts`                | Preload API 定義             |
| SkillExecutor   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | AuthKeyService 統合（更新）  |
```

---

## 6. 変更履歴への追記

### 提案: SKILL.md「変更履歴」セクションに追記

```markdown
| Version | Date       | Changes                                                                                             |
| ------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 2.10.0  | 2026-02-08 | TASK-FIX-16-1 SDK認証キー管理基盤追加（AuthKeyService統合、apiKeyオプション、AUTHENTICATION_ERROR） |
```

---

## 実装優先度

| 更新箇所            | 優先度 | 理由                                    |
| ------------------- | ------ | --------------------------------------- |
| SKILL.md 成果物追加 | High   | 他の開発者が実装を参照できるようにする  |
| query-api.md apiKey | High   | SDK 使用時の基本パターン                |
| error-handling.md   | Medium | 認証エラーの正しい処理方法を示す        |
| electron-ipc.md     | Medium | Main Process でのセキュアな実装パターン |

---

## 次のアクション

1. 本提案のレビュー（担当者 TBD）
2. 承認後、各ドキュメントへの反映
3. SKILL.md 変更履歴の更新

---

## 参照

- 実装ファイル: `/apps/desktop/src/main/services/skill/SkillExecutor.ts`
- SKILL.md: `/.claude/skills/claude-agent-sdk/SKILL.md`
- query-api.md: `/.claude/skills/claude-agent-sdk/references/query-api.md`
- error-handling.md: `/.claude/skills/claude-agent-sdk/references/error-handling.md`
- electron-ipc.md: `/.claude/skills/claude-agent-sdk/references/electron-ipc.md`
