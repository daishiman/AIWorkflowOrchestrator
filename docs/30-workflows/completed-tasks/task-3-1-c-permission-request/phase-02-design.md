# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 前提Phase  | Phase 1                     |
| 後続Phase  | Phase 3                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

Phase 1 で定義した要件に基づき、PermissionRequest Hook の詳細設計を行う。

## 背景

要件定義が完了し、機能・非機能・インターフェース仕様が明確化された。
本 Phase では、これらの要件を満たすアーキテクチャと詳細設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: クラス設計

**目的**: SkillExecutor クラスへの PermissionRequest Hook 追加設計を行う

**実行手順**:

1. 既存の SkillExecutor クラス構造を確認する（TASK-3-1-A, TASK-3-1-B）
2. PermissionResolver との統合方法を設計する
3. createHooks メソッドへの PermissionRequest 追加を設計する

**期待される成果物**:

- クラス設計図

**クラス設計**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, AbortController>;
  private permissionResolver: PermissionResolver; // 追加

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.activeExecutions = new Map();
    this.permissionResolver = new PermissionResolver(); // 追加
  }

  // 既存メソッド
  async execute(
    request: SkillExecutionRequest,
    skill: SkillMetadata,
  ): Promise<SkillExecutionResponse>;
  abort(executionId: string): boolean;
  private buildPrompt(
    userPrompt: string,
    skill: SkillMetadata,
  ): Promise<string>;
  private buildContextInfo(skill: SkillMetadata): string;
  private handleStreamMessage(
    executionId: string,
    message: unknown,
  ): Promise<void>;
  private convertToStreamMessage(
    executionId: string,
    message: unknown,
  ): SkillStreamMessage | null;
  private sendStream(message: SkillStreamMessage): void;

  // TASK-3-1-B で追加されたメソッド
  private createHooks(executionId: string): Hooks;
  private categorizeError(error: unknown): ErrorCategory;
  private isRetryable(error: unknown): boolean;

  // 本タスクで追加するメソッド
  handlePermissionResponse(
    requestId: string,
    approved: boolean,
    rememberChoice?: boolean,
    rejectReason?: string,
  ): void;
  private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>;
  private getPermissionReason(
    toolName: string,
    args: Record<string, unknown>,
  ): string;
}
```

---

### タスク2: PermissionRequest Hook 詳細設計

**目的**: PermissionRequest Hook の処理フローを詳細設計する

**実行手順**:

1. SDK から渡される入力パラメータを確認する
2. Renderer への送信データ形式を設計する
3. 応答待機と結果返却のフローを設計する

**期待される成果物**:

- Hook 処理フロー図

**処理フロー**:

```
PermissionRequest Hook 呼び出し
        ↓
requestId 生成（uuid v4）
        ↓
ステータス通知（tool_executing: 権限待機中）
        ↓
引数サニタイズ（sanitizeArgs）
        ↓
理由生成（getPermissionReason）
        ↓
Renderer へ IPC 送信（skill:permission:request）
        ↓
PermissionResolver.waitForResponse(requestId, signal, 30000)
        ↓
    ┌───────────────────────────────────────┐
    │         ユーザー応答待機               │
    │  - 承認: approved = true              │
    │  - 拒否: approved = false             │
    │  - タイムアウト: 30秒                 │
    │  - キャンセル: AbortSignal            │
    └───────────────────────────────────────┘
        ↓
    [承認]         [拒否/タイムアウト]
      ↓                    ↓
ステータス通知          ステータス通知
（許可されました）       （拒否されました）
      ↓                    ↓
return { proceed: true }  return { proceed: false, message: ... }
```

**Hook シグネチャ**:

```typescript
PermissionRequest: async (
  input: { toolName: string; args: Record<string, unknown> },
  toolUseId: string,
  context: { signal: AbortSignal },
) => Promise<{ proceed: true } | { proceed: false; message: string }>;
```

---

### タスク3: 引数サニタイズ設計

**目的**: 機密情報を除去する sanitizeArgs メソッドを設計する

**実行手順**:

1. サニタイズ対象の引数パターンを定義する
2. 省略処理のロジックを設計する
3. セキュリティ考慮事項を確認する

**期待される成果物**:

- サニタイズ仕様書

**サニタイズルール**:

| ルール             | 対象                    | 処理                       |
| ------------------ | ----------------------- | -------------------------- |
| 長文省略           | 500文字超の文字列       | 先頭500文字 + "... (省略)" |
| 機密キー除去       | password, secret, token | 値を "[REDACTED]" に置換   |
| ネストオブジェクト | オブジェクト型の値      | 再帰的にサニタイズ         |
| 配列               | 配列型の値              | 各要素をサニタイズ         |

**実装設計**:

```typescript
private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = ['password', 'secret', 'token', 'key', 'credential', 'apiKey'];

  for (const [key, value] of Object.entries(args)) {
    // 機密キーの除去
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // 長文の省略
    if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '... (省略)';
      continue;
    }

    // オブジェクトの再帰処理
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = this.sanitizeArgs(value as Record<string, unknown>);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}
```

---

### タスク4: 権限理由生成設計

**目的**: ツール別の人間可読な理由メッセージを設計する

**実行手順**:

1. 対応ツール一覧を定義する
2. 各ツールの理由フォーマットを設計する
3. デフォルトメッセージを設計する

**期待される成果物**:

- 理由メッセージ仕様書

**ツール別理由フォーマット**:

| ツール名   | 理由フォーマット                         | 例                               |
| ---------- | ---------------------------------------- | -------------------------------- |
| Bash       | `コマンドを実行: {command(100文字まで)}` | コマンドを実行: npm install      |
| Write      | `ファイルを作成: {file_path}`            | ファイルを作成: src/index.ts     |
| Edit       | `ファイルを編集: {file_path}`            | ファイルを編集: src/utils.ts     |
| Read       | `ファイルを読み取り: {file_path}`        | ファイルを読み取り: package.json |
| Glob       | `ファイルを検索: {pattern}`              | ファイルを検索: \*_/_.ts         |
| Grep       | `テキストを検索: {pattern}`              | テキストを検索: TODO             |
| Task       | `サブタスクを実行: {description}`        | サブタスクを実行: 依存関係を調査 |
| デフォルト | `{toolName} を実行`                      | WebSearch を実行                 |

**実装設計**:

```typescript
private getPermissionReason(toolName: string, args: Record<string, unknown>): string {
  switch (toolName) {
    case 'Bash': {
      const command = (args.command as string) || '';
      return `コマンドを実行: ${command.substring(0, 100)}`;
    }
    case 'Write': {
      const path = (args.file_path as string) || (args.path as string) || '';
      return `ファイルを作成: ${path}`;
    }
    case 'Edit': {
      const path = (args.file_path as string) || (args.path as string) || '';
      return `ファイルを編集: ${path}`;
    }
    case 'Read': {
      const path = (args.file_path as string) || (args.path as string) || '';
      return `ファイルを読み取り: ${path}`;
    }
    case 'Glob': {
      const pattern = (args.pattern as string) || '';
      return `ファイルを検索: ${pattern}`;
    }
    case 'Grep': {
      const pattern = (args.pattern as string) || '';
      return `テキストを検索: ${pattern}`;
    }
    case 'Task': {
      const desc = (args.description as string) || '';
      return `サブタスクを実行: ${desc.substring(0, 50)}`;
    }
    default:
      return `${toolName} を実行`;
  }
}
```

---

### タスク5: IPC チャネル定義設計

**目的**: スキル権限関連の IPC チャネルを設計する

**実行手順**:

1. 既存の SKILL_CHANNELS を確認する
2. 権限関連チャネルを追加設計する
3. 型定義を設計する

**期待される成果物**:

- IPC チャネル定義追加仕様

**追加チャネル定義**:

```typescript
// packages/shared/src/ipc/channels.ts

export const SKILL_CHANNELS = {
  // 既存チャネル
  SKILL_LIST: "skill:list",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_EXECUTE: "skill:execute",
  SKILL_ABORT: "skill:abort",
  SKILL_STREAM: "skill:stream",

  // 追加チャネル
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];
```

---

## 参照資料

| 参照資料                   | パス                                                                                | 内容                         |
| -------------------------- | ----------------------------------------------------------------------------------- | ---------------------------- |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`         | PermissionRequest型、IPC定義 |
| セキュリティパターン定義   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`     | 引数サニタイズ・セキュリティ |
| TASK-3-1-B 仕様            | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-b-hooks.md`             | Hooks 実装仕様               |
| TASK-3-2 仕様              | `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md` | PermissionResolver 仕様      |
| Phase 1 成果物             | `outputs/phase-01/`                                                                 | 要件定義成果物               |

---

## 成果物

| 成果物               | パス                                  | 内容                         |
| -------------------- | ------------------------------------- | ---------------------------- |
| クラス設計書         | `outputs/phase-02/class-design.md`    | SkillExecutor 拡張設計       |
| Hook 処理フロー図    | `outputs/phase-02/hook-flow.md`       | PermissionRequest 処理フロー |
| サニタイズ仕様書     | `outputs/phase-02/sanitize-spec.md`   | 引数サニタイズルール         |
| 理由メッセージ仕様書 | `outputs/phase-02/reason-messages.md` | ツール別理由フォーマット     |
| IPC チャネル追加仕様 | `outputs/phase-02/ipc-channels.md`    | 権限チャネル定義             |

---

## 統合テスト連携（Phase 1〜11は必須）

本 Phase では設計のみのため、統合テスト追加は不要。
Phase 4 以降で統合テストを設計・実装する。

---

## 完了条件

- [ ] SkillExecutor クラス拡張設計が完了している
- [ ] PermissionRequest Hook の処理フローが設計されている
- [ ] 引数サニタイズのルールが定義されている
- [ ] ツール別理由メッセージが設計されている
- [ ] IPC チャネル追加定義が完了している
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-03-design-review.md`
