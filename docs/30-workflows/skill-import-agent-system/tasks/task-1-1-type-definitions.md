---
id: TASK-1-1
tier: 1
title: 共通型定義の作成
phase: 1
depends_on: []
parallel_with: []
blocks: [TASK-2A, TASK-2B, TASK-2C]
status: pending
priority: high
estimated_complexity: small
tags: [backend, shared, types]
---

# 共通型定義の作成

## 概要

スキルインポート機能で使用する全ての型定義を `packages/shared` に作成する。
この型定義は Main Process / Renderer Process の両方で使用される。

## 入力

- specification.md の型定義セクション（5.1）
- 既存の型定義パターン（`packages/shared/src/types/`）

## 出力

- `packages/shared/src/types/skill.ts` - 全型定義
- `packages/shared/src/index.ts` への型エクスポート追加

## 実装詳細

### 作成する型定義

```typescript
// スキルメタデータ
export interface SkillMetadata {
  name: string;
  description: string;
  allowedTools?: string[];
  path: string;
  updatedAt: Date;
  agents: SkillSubResource[];
  references: SkillSubResource[];
  scripts: SkillSubResource[];
  assets: SkillSubResource[];
  schemas: SkillSubResource[];
  indexes: SkillSubResource[];
  otherFiles: SkillOtherFile[];
}

// サブリソース
export interface SkillSubResource {
  filename: string;
  relativePath: string;
  description?: string;
  size: number;
}

// その他ファイル
export interface SkillOtherFile {
  filename: string;
  type: "evals" | "logs" | "package" | "other";
  size: number;
}

// インポート済みスキル
export interface ImportedSkill extends SkillMetadata {
  importedAt: Date;
  status: "active" | "disabled";
  content?: string;
}

// 実行リクエスト/レスポンス
export interface SkillExecutionRequest {
  skillName: string;
  prompt: string;
  workingDirectory?: string;
}

export interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: string;
}

// 実行ステータス
export type SkillExecutionStatus =
  | "idle"
  | "running"
  | "permission_pending"
  | "completed"
  | "cancelled"
  | "error";

// ストリーミングメッセージ（Discriminated Union）
export type SkillStreamMessage =
  | {
      executionId: string;
      type: "assistant";
      content: AssistantMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_use";
      content: ToolUseMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "tool_result";
      content: ToolResultMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "status";
      content: StatusMessageContent;
      timestamp: number;
    }
  | {
      executionId: string;
      type: "error";
      content: ErrorMessageContent;
      timestamp: number;
    };

// 各メッセージコンテンツ型
export interface AssistantMessageContent {
  text: string;
  isPartial?: boolean;
}

export interface ToolUseMessageContent {
  toolName: string;
  args: Record<string, unknown>;
  toolUseId: string;
}

export interface ToolResultMessageContent {
  toolUseId: string;
  success: boolean;
  result?: unknown;
  error?: string;
}

export interface StatusMessageContent {
  status: "started" | "tool_executing" | "tool_completed" | "completed";
  detail?: string;
}

export interface ErrorMessageContent {
  code: "sdk_error" | "permission_denied" | "timeout" | "network" | "unknown";
  message: string;
  retryable: boolean;
}

// 権限確認
export interface PermissionRequest {
  executionId: string;
  requestId: string;
  toolName: string;
  args: Record<string, unknown>;
  reason?: string;
}

export interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean;
  rejectReason?: string;
}
```

## ファイル

| 操作 | パス                                 |
| ---- | ------------------------------------ |
| 作成 | `packages/shared/src/types/skill.ts` |
| 修正 | `packages/shared/src/index.ts`       |

## 依存パッケージ

なし（TypeScript標準型のみ使用）

## 完了条件

- [ ] `packages/shared/src/types/skill.ts` が作成されている
- [ ] 全ての型定義が仕様書通りに実装されている
- [ ] `packages/shared/src/index.ts` に型エクスポートが追加されている
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] TypeScript の strict モードでコンパイルエラーがない

## テスト要件

- 型定義の静的解析のみ（ランタイムテスト不要）
- 他パッケージからのインポート確認

## 参考資料

- [specification.md - 5.1 型定義](../specification.md)
- 既存型定義: `packages/shared/src/types/chat.ts`
