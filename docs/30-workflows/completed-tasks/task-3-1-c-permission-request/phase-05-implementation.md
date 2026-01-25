# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 5                           |
| Phase名    | 実装                        |
| 前提Phase  | Phase 4                     |
| 後続Phase  | Phase 6                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

TDD Green フェーズとして、Phase 4 で作成したテストを通す最小限の実装を行う。

## 背景

失敗するテストが作成された。
本 Phase では、これらのテストを通す実装を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: IPC チャネル定義追加

**目的**: スキル権限関連の IPC チャネルを定義する

**実行手順**:

1. `packages/shared/src/ipc/channels.ts` を開く
2. SKILL_CHANNELS に権限関連チャネルを追加する

**実装コード**:

```typescript
// packages/shared/src/ipc/channels.ts

export const SKILL_CHANNELS = {
  SKILL_LIST: "skill:list",
  SKILL_IMPORT: "skill:import",
  SKILL_REMOVE: "skill:remove",
  SKILL_EXECUTE: "skill:execute",
  SKILL_ABORT: "skill:abort",
  SKILL_STREAM: "skill:stream",
  // 追加
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];
```

**期待される成果物**:

- `packages/shared/src/ipc/channels.ts` の更新

---

### タスク2: PermissionResolver インポート追加

**目的**: SkillExecutor に PermissionResolver を統合する

**実行手順**:

1. `SkillExecutor.ts` を開く
2. PermissionResolver をインポートする
3. コンストラクタでインスタンス化する

**実装コード**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

import { SKILL_CHANNELS } from "../../../shared/ipc/channels";
import { PermissionResolver } from "./PermissionResolver";
import { v4 as uuidv4 } from "uuid";

export class SkillExecutor {
  private mainWindow: BrowserWindow;
  private activeExecutions: Map<string, AbortController> = new Map();
  private permissionResolver: PermissionResolver;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.permissionResolver = new PermissionResolver();
  }

  // ... 既存コード ...
}
```

**期待される成果物**:

- SkillExecutor への PermissionResolver 統合

---

### タスク3: sanitizeArgs メソッド実装

**目的**: 引数サニタイズメソッドを実装する

**実行手順**:

1. sanitizeArgs メソッドを追加する
2. 機密キー除去ロジックを実装する
3. 長文省略ロジックを実装する

**実装コード**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts に追加

private sanitizeArgs(args: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = [
    "password",
    "secret",
    "token",
    "key",
    "credential",
    "apikey",
  ];

  for (const [key, value] of Object.entries(args)) {
    // 機密キーの除去
    if (sensitiveKeys.some((k) => key.toLowerCase().includes(k))) {
      sanitized[key] = "[REDACTED]";
      continue;
    }

    // 長文の省略
    if (typeof value === "string" && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + "... (省略)";
      continue;
    }

    // オブジェクトの再帰処理
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = this.sanitizeArgs(value as Record<string, unknown>);
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}
```

**期待される成果物**:

- sanitizeArgs メソッドの実装

---

### タスク4: getPermissionReason メソッド実装

**目的**: 権限リクエスト理由生成メソッドを実装する

**実行手順**:

1. getPermissionReason メソッドを追加する
2. 各ツールタイプの理由フォーマットを実装する

**実装コード**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts に追加

private getPermissionReason(
  toolName: string,
  args: Record<string, unknown>,
): string {
  switch (toolName) {
    case "Bash": {
      const command = (args.command as string) || "";
      return `コマンドを実行: ${command.substring(0, 100)}`;
    }
    case "Write": {
      const path = (args.file_path as string) || (args.path as string) || "";
      return `ファイルを作成: ${path}`;
    }
    case "Edit": {
      const path = (args.file_path as string) || (args.path as string) || "";
      return `ファイルを編集: ${path}`;
    }
    case "Read": {
      const path = (args.file_path as string) || (args.path as string) || "";
      return `ファイルを読み取り: ${path}`;
    }
    case "Glob": {
      const pattern = (args.pattern as string) || "";
      return `ファイルを検索: ${pattern}`;
    }
    case "Grep": {
      const pattern = (args.pattern as string) || "";
      return `テキストを検索: ${pattern}`;
    }
    case "Task": {
      const desc = (args.description as string) || "";
      return `サブタスクを実行: ${desc.substring(0, 50)}`;
    }
    default:
      return `${toolName} を実行`;
  }
}
```

**期待される成果物**:

- getPermissionReason メソッドの実装

---

### タスク5: PermissionRequest Hook 実装

**目的**: createHooks メソッドに PermissionRequest を追加する

**実行手順**:

1. createHooks メソッドを修正する
2. PermissionRequest ハンドラを追加する
3. 権限リクエスト送信ロジックを実装する
4. 応答待機・処理ロジックを実装する

**実装コード**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts の createHooks を修正

private createHooks(executionId: string) {
  return {
    PreToolUse: async (input, _toolUseId, _context) => {
      // ... 既存のコード ...
    },

    PostToolUse: async (input, toolUseId, _context) => {
      // ... 既存のコード ...
    },

    PermissionRequest: async (
      input: { toolName: string; args: Record<string, unknown> },
      toolUseId: string,
      context: { signal: AbortSignal },
    ) => {
      const requestId = uuidv4();

      // 権限確認待機中を通知
      this.sendStream({
        executionId,
        type: "status",
        content: {
          status: "tool_executing",
          detail: `${input.toolName} の実行に権限が必要です`,
        },
        timestamp: Date.now(),
      });

      // Renderer に権限リクエストを送信
      this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_PERMISSION_REQUEST, {
        executionId,
        requestId,
        toolName: input.toolName,
        args: this.sanitizeArgs(input.args),
        reason: this.getPermissionReason(input.toolName, input.args),
      });

      try {
        // ユーザー応答を待機
        const response = await this.permissionResolver.waitForResponse(
          requestId,
          context.signal,
          30000, // 30秒タイムアウト
        );

        if (response.approved) {
          this.sendStream({
            executionId,
            type: "status",
            content: {
              status: "tool_executing",
              detail: `${input.toolName} の実行が許可されました`,
            },
            timestamp: Date.now(),
          });
          return { proceed: true };
        } else {
          this.sendStream({
            executionId,
            type: "status",
            content: {
              status: "tool_completed",
              detail: `${input.toolName} の実行が拒否されました`,
            },
            timestamp: Date.now(),
          });
          return {
            proceed: false,
            message: response.rejectReason || "ユーザーにより拒否されました",
          };
        }
      } catch (error) {
        // タイムアウトまたはキャンセル
        return {
          proceed: false,
          message: "権限確認がタイムアウトしました",
        };
      }
    },
  };
}
```

**期待される成果物**:

- PermissionRequest Hook の実装

---

### タスク6: handlePermissionResponse メソッド実装

**目的**: 権限応答処理メソッドを実装する

**実行手順**:

1. handlePermissionResponse メソッドを追加する
2. PermissionResolver.resolve を呼び出す

**実装コード**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts に追加

handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string,
): void {
  this.permissionResolver.resolve(requestId, {
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

**期待される成果物**:

- handlePermissionResponse メソッドの実装

---

### タスク7: テスト通過確認（Green 状態）

**目的**: Phase 4 で作成したテストが通ることを確認する

**実行手順**:

1. テストを実行する
2. 全てのテストが通過することを確認する

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
```

**期待される結果**:

- 全てのテストが PASS となる

---

## 参照資料

| 参照資料                 | パス                                                                            | 内容                         |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------- |
| Phase 2 設計             | `outputs/phase-02/`                                                             | 設計成果物                   |
| Phase 4 テスト           | `outputs/phase-04/`                                                             | テストコード                 |
| セキュリティパターン定義 | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 引数サニタイズ・セキュリティ |

---

## 成果物

| 成果物               | パス                                                    | 内容                   |
| -------------------- | ------------------------------------------------------- | ---------------------- |
| IPC チャネル定義更新 | `packages/shared/src/ipc/channels.ts`                   | 権限チャネル追加       |
| SkillExecutor 更新   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | PermissionRequest 実装 |
| テスト実行結果       | `outputs/phase-05/test-results.md`                      | Green 状態の確認結果   |

---

## 統合テスト連携（Phase 1〜11は必須）

本 Phase では単体テストの Green 確認のみ。統合テストは Phase 6 で追加する。

---

## 完了条件

- [ ] IPC チャネル定義が追加されている
- [ ] PermissionResolver が SkillExecutor に統合されている
- [ ] sanitizeArgs メソッドが実装されている
- [ ] getPermissionReason メソッドが実装されている
- [ ] PermissionRequest Hook が実装されている
- [ ] handlePermissionResponse メソッドが実装されている
- [ ] 全てのテストが通過する（Green 状態）
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
pnpm --filter @repo/desktop test -- --run src/main/services/skill/__tests__/SkillExecutor.permission.test.ts
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-06-test-expansion.md`
