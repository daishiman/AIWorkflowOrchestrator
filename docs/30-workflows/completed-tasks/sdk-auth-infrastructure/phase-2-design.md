# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| 前提Phase  | Phase 1 (要件定義)                       |
| 後続Phase  | Phase 3 (設計レビューゲート)             |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-07                               |
| タスクID   | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名   | Claude Agent SDK用認証キー管理基盤の構築 |

---

## 目的

認証キー管理基盤のアーキテクチャ設計・インターフェース設計・型定義を行う。

## 背景

Phase 1で定義した要件を実現するための技術設計を行う。
既存の `secureStorage.ts` パターンを参考に、認証キー専用の管理サービスを設計する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: type-safety-patterns

**パス**: `.claude/skills/type-safety-patterns/SKILL.md`

**Trigger条件**:

- TypeScript型安全パターンの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### スキル2: electron-ipc-design

**パス**: `.claude/skills/electron-ipc-design/SKILL.md`

**Trigger条件**:

- Electron IPC ハンドラーの設計が必要な場合

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- `outputs/phase-2/ipc-specification.md`

---

## 参照資料

| 参照資料          | パス                                                                                             | 内容                     |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------ |
| 要件定義書        | `outputs/phase-1/requirements-definition.md`                                                     | 機能要件・非機能要件     |
| 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                                         | テスト可能な受け入れ条件 |
| 既存SecureStorage | `apps/desktop/src/main/infrastructure/secureStorage.ts`                                          | 参考実装パターン         |
| タスク指示書      | `docs/30-workflows/skill-import-agent-system/tasks/01c-task-fix-16-1-sdk-auth-infrastructure.md` | 実装仕様詳細             |

### システム仕様（プロジェクトルール）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                    | 内容                 |
| -------------------- | --------------------------------------- | -------------------- |
| アーキテクチャルール | `.claude/rules/01-architecture.md`      | レイヤー依存方向     |
| セキュリティルール   | `.claude/rules/04-electron-security.md` | IPC セキュリティ原則 |
| 状態管理ルール       | `.claude/rules/03-state-management.md`  | リスナー管理         |

### システム仕様（aiworkflow-requirements）

> 以下の仕様書から既存パターンを抽出し、設計に反映してください。

| 参照資料             | パス                                                                                 | 内容                                           |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------- |
| セキュリティ原則     | `.claude/skills/aiworkflow-requirements/references/security-principles.md`           | safeStorage暗号化→Base64→electron-store フロー |
| IPC セキュリティ     | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`         | sender検証、ホワイトリスト方式                 |
| 認証インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`               | AuthSession型、AuthErrorCode型定義             |
| 認証IPC設計          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                  | withValidationラッパー必須（L159-169）         |
| Electronサービス構造 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`        | Facadeパターン、SkillExecutor構成              |
| IPC永続化パターン    | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`          | registerAllIpcHandlers登録手順                 |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`         | Desktop機能追加手順（L305-314）                |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                | エラーコード範囲、Result型パターン             |
| SkillExecutor仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | execute()メソッド、型定義                      |

---

## 成果物

| 成果物             | パス                                     | 内容                           |
| ------------------ | ---------------------------------------- | ------------------------------ |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | レイヤー構成・依存関係         |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型・インターフェース |
| IPC仕様            | `outputs/phase-2/ipc-specification.md`   | IPCチャンネル・ハンドラー設計  |

---

## 設計指針

### ディレクトリ構造

```
apps/desktop/src/main/
├── infrastructure/
│   ├── secureStorage.ts          # 既存（リフレッシュトークン用）
│   └── authKeyStorage.ts         # 新規（認証キー用）
├── services/
│   └── skill/
│       └── SkillExecutor.ts      # 修正対象
├── ipc/
│   └── authKeyHandlers.ts        # 新規（認証キーIPC）
└── preload/
    └── index.ts                  # 拡張（認証キーAPI追加）
```

### IAuthKeyService インターフェース

```typescript
/**
 * 認証キー管理サービスのインターフェース
 */
interface IAuthKeyService {
  /**
   * 認証キーを暗号化して保存
   * @param key - Anthropic API Key
   */
  setKey(key: string): Promise<void>;

  /**
   * 認証キーを取得（復号済み）
   * @returns 認証キー または null（未設定時）
   */
  getKey(): Promise<string | null>;

  /**
   * 認証キーの存在確認
   * @returns キーが設定されているか
   */
  hasKey(): Promise<boolean>;

  /**
   * 認証キーをAnthropicAPIで検証
   * @param key - 検証対象のキー
   * @returns 有効なキーか
   */
  validateKey(key: string): Promise<boolean>;

  /**
   * 認証キーを削除
   */
  deleteKey(): Promise<void>;
}
```

### IPCチャンネル定義

```typescript
// packages/shared/src/constants/ipcChannels.ts に追加
export const AUTH_KEY_CHANNELS = {
  SET: "auth-key:set",
  GET_EXISTS: "auth-key:exists",
  VALIDATE: "auth-key:validate",
  DELETE: "auth-key:delete",
} as const;
```

### SkillExecutor 統合設計

```typescript
// SkillExecutor.ts の修正
class SkillExecutor {
  private authKeyService: IAuthKeyService;

  constructor(authKeyService: IAuthKeyService) {
    this.authKeyService = authKeyService;
  }

  private async callSDKQuery(
    prompt: string,
    options: SDKQueryOptions,
  ): Promise<{ stream: () => AsyncIterable<SDKMessage> }> {
    // 認証キーを取得
    const apiKey = await this.authKeyService.getKey();
    if (!apiKey) {
      throw new AuthKeyNotSetError(
        "Anthropic API Key is not configured. Please set it in Settings.",
      );
    }

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
}
```

### エラー型定義

```typescript
/**
 * 認証キー未設定エラー
 */
class AuthKeyNotSetError extends Error {
  readonly code = 3001; // External Service Error 範囲
  readonly isRetryable = false;

  constructor(message: string) {
    super(message);
    this.name = "AuthKeyNotSetError";
  }
}

/**
 * 認証キー無効エラー
 */
class AuthKeyInvalidError extends Error {
  readonly code = 3002;
  readonly isRetryable = false;

  constructor(message: string) {
    super(message);
    this.name = "AuthKeyInvalidError";
  }
}
```

### 依存関係図

```
┌─────────────────────────────────────────────────────────────┐
│                      Renderer Process                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                     Settings UI                         │ │
│  │  (キー入力フォーム - 別タスクで実装)                    │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │ IPC (auth-key:*)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Preload Bridge                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  window.electronAPI.authKey.set(key)                   │ │
│  │  window.electronAPI.authKey.exists()                   │ │
│  │  window.electronAPI.authKey.validate(key)              │ │
│  │  window.electronAPI.authKey.delete()                   │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                 AuthKeyHandlers                         │ │
│  │  - auth-key:set                                         │ │
│  │  - auth-key:exists                                      │ │
│  │  - auth-key:validate                                    │ │
│  │  - auth-key:delete                                      │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               AuthKeyService                            │ │
│  │  - setKey() / getKey() / hasKey()                       │ │
│  │  - validateKey() / deleteKey()                          │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│           ┌────────────┴────────────┐                       │
│           ▼                         ▼                        │
│  ┌─────────────────┐     ┌─────────────────────┐            │
│  │  safeStorage    │     │   electron-store    │            │
│  │  (暗号化/復号)  │     │   (永続化)          │            │
│  └─────────────────┘     └─────────────────────┘            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               SkillExecutor                             │ │
│  │  - callSDKQuery() で AuthKeyService.getKey() を呼出    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 統合テスト連携（Phase 1〜11は必須）

### Phase 2での必須アクション

- [ ] 統合ポイント/契約（IPC・スキーマ）を設計に反映
- [ ] AuthKeyService と SkillExecutor のインターフェース契約を定義
- [ ] エラーハンドリングの統合パターンを設計

---

## 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] IAuthKeyService インターフェースが設計されている
- [ ] 型定義（エラー型含む）が設計されている
- [ ] IPC チャンネル・ハンドラーが設計されている
- [ ] SkillExecutor との統合設計が完了している
- [ ] 既存 secureStorage.ts パターンとの一貫性が確認されている
- [ ] 統合テスト観点の契約が定義されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 使用スキル

- type-safety-patterns: {{result}}
- electron-ipc-design: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/sdk-auth-infrastructure/phase-3-design-review.md`
