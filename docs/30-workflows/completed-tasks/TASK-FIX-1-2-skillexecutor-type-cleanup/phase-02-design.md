# Phase 2: 設計

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 2                                         |
| 機能名   | skillexecutor-type-cleanup                |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 分類     | リファクタリング                          |
| 作成日   | 2026-02-07                                |

## 目的

Phase 1 で特定した要件を実現可能な構造に落とし込み、型統合の具体的な設計を行う。

## 実行タスク

- アーキテクチャ設計: 型統合後のモジュール構造設計
- 型統合設計: 各重複型の統合方針の詳細設計
- 影響範囲分析: 変更による影響を受けるファイルの特定

## 参照資料

| 資料名     | パス                                         | 説明          |
| ---------- | -------------------------------------------- | ------------- |
| 要件定義書 | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| skill.ts   | `packages/shared/src/types/skill.ts`         | 正本型定義    |

## 実行手順

### ステップ1: 型統合設計

#### 1.1 同一構造型の統合（削除のみ）

以下の型は正本と完全一致のため、ローカル定義を削除して import に置換する。

| ローカル型              | 正本の型                | 変更内容         |
| ----------------------- | ----------------------- | ---------------- |
| ExecutionState (L31-36) | ExecutionState (L519)   | 削除、import追加 |
| ExecutionInfo (L84-90)  | ExecutionInfo (L529)    | 削除、import追加 |
| SkillExecutionErrorCode | SkillExecutionErrorCode | 削除、import追加 |
| SkillExecutionError     | SkillExecutionError     | 削除、import追加 |
| ExecutionContext        | ExecutionContext        | 削除、import追加 |

#### 1.2 差異のある型の統合設計

##### SkillExecutionRequest の統合

**現状の差異:**

```typescript
// SkillExecutor.ts (ローカル)
interface SkillExecutionRequest {
  prompt: string;
  skillId: string; // ← 正本は skillName
  timeout?: number; // ← 正本にはない
  sessionId?: string; // ← 正本にはない
  retryConfig?: Partial<RetryConfig>; // ← 正本にはない
}

// skill.ts (正本)
interface SkillExecutionRequest {
  skillName: string;
  prompt: string;
  workingDirectory?: string;
}
```

**統合設計:**

```typescript
// 正本 (skill.ts) を拡張
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;

  /** 実行タイムアウト（ミリ秒） */
  timeout?: number;

  /** セッションID（会話継続用） */
  sessionId?: string;

  /** リトライ設定 */
  retryConfig?: Partial<RetryConfig>;
}
```

**マイグレーション方針:**

- SkillExecutor.ts 内の `skillId` 参照を `skillName` に変更
- 呼び出し元の修正（該当箇所の特定が必要）

##### SkillExecutionResponse の統合

**現状の差異:**

```typescript
// SkillExecutor.ts (ローカル)
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError; // ← 構造体
}

// skill.ts (正本)
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: string; // ← 単純文字列
}
```

**統合設計:**

正本を SkillExecutor 版に合わせて更新（より詳細なエラー情報を持たせる）:

```typescript
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラー情報（失敗時） */
  error?: SkillExecutionError;
}
```

##### SkillStreamMessage の統合

**現状の差異:**

```typescript
// SkillExecutor.ts (ローカル) - 単純型
interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: 'text' | 'tool_use' | 'error' | 'complete' | 'retry';
  content: string;
  timestamp: number;
  isComplete: boolean;
}

// skill.ts (正本) - Discriminated Union
type SkillStreamMessage =
  | { type: 'assistant'; content: AssistantMessageContent; ... }
  | { type: 'tool_use'; content: ToolUseMessageContent; ... }
  | { type: 'tool_result'; content: ToolResultMessageContent; ... }
  | { type: 'status'; content: StatusMessageContent; ... }
  | { type: 'error'; content: ErrorMessageContent; ... }
```

**統合設計:**

正本の Discriminated Union を採用（型安全性向上）。SkillExecutor.ts を正本型に移行する。

追加として、SkillExecutor が必要とする type 値 ('text', 'complete', 'retry') を正本に追加:

```typescript
// skill.ts に追加
| (BaseStreamMessage & { type: 'text'; content: AssistantMessageContent })
| (BaseStreamMessage & { type: 'complete'; content: StatusMessageContent })
| (BaseStreamMessage & { type: 'retry'; content: StatusMessageContent })
```

または、SkillExecutor 側のロジックを正本の type 値に合わせて変更する（推奨）。

**マッピング設計:**

| SkillExecutor (旧) | skill.ts (正本) | 変換ロジック                     |
| ------------------ | --------------- | -------------------------------- |
| 'text'             | 'assistant'     | type 名変更、content 構造変換    |
| 'tool_use'         | 'tool_use'      | 一致（content 構造変換のみ）     |
| 'error'            | 'error'         | 一致（content 構造変換のみ）     |
| 'complete'         | 'status'        | type 名変更、status: 'completed' |
| 'retry'            | 'status'        | type 名変更、status: 追加        |

### ステップ2: 影響範囲分析

#### 2.1 直接影響ファイル

| ファイル                                              | 変更内容                                              |
| ----------------------------------------------------- | ----------------------------------------------------- |
| apps/desktop/src/main/services/skill/SkillExecutor.ts | ローカル型削除、import追加、型参照変更                |
| packages/shared/src/types/skill.ts                    | SkillExecutionRequest拡張、SkillExecutionResponse更新 |

#### 2.2 間接影響ファイル（型参照元）

以下のファイルで型参照の確認が必要:

- `apps/desktop/src/main/ipc/*.ts` - IPC ハンドラ
- `apps/desktop/src/renderer/**/*.ts` - Renderer 側の型参照
- `apps/desktop/src/preload/*.ts` - Preload 層の型参照
- テストファイル（`*.test.ts`, `*.spec.ts`）

### ステップ3: 正本型への追加設計

#### 3.1 RetryConfig 関連型の移行

SkillExecutor 固有の以下の型を正本に移行:

```typescript
// packages/shared/src/types/skill.ts に追加

/** リトライ可能なエラーの分類 */
export type RetryableErrorType =
  | "network"
  | "rate_limit"
  | "server_error"
  | "timeout";

/** リトライ設定 */
export interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries: number;
  /** 基本待機時間（ミリ秒）（デフォルト: 1000） */
  baseDelayMs: number;
  /** 最大待機時間（ミリ秒）（デフォルト: 30000） */
  maxDelayMs: number;
  /** Jitter範囲 0-1（デフォルト: 0.2） */
  jitterFactor: number;
  /** バックオフ倍率（デフォルト: 2） */
  backoffMultiplier: number;
}

/** リトライ判定結果 */
export interface RetryableErrorResult {
  retryable: boolean;
  errorType?: RetryableErrorType;
  retryAfterMs?: number;
}
```

#### 3.2 SkillMetadata の統合

現在 SkillExecutor.ts と skill.ts に異なる `SkillMetadata` 定義が存在:

- **SkillExecutor版**: `Omit<Skill, 'lastModified'>` を拡張
- **正本版**: 完全に異なる構造（スキルメタデータ用）

**統合設計:**

- SkillExecutor 版を `SkillExecutorMetadata` にリネームして正本に追加
- または、Skill 型を直接使用するようリファクタリング

```typescript
// packages/shared/src/types/skill.ts に追加
/** SkillExecutor用メタデータ（Skillから lastModified を除外） */
export type SkillExecutorMetadata = Omit<Skill, "lastModified">;
```

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント                | 契約定義                                           |
| --------------------------- | -------------------------------------------------- |
| SkillExecutor → IPC Handler | SkillExecutionRequest/Response の型一致            |
| IPC Handler → Renderer      | SkillStreamMessage の型一致（Discriminated Union） |
| Renderer → Store/Component  | 型の再 export 経路の整合性                         |

## アーキテクチャ層別設計（AIが判断）

| 層                         | 設計観点                              | 仕様参照先                    |
| -------------------------- | ------------------------------------- | ----------------------------- |
| フロントエンド（Renderer） | SkillStreamMessage のハンドリング変更 | `ui-ux-*.md`                  |
| バックエンド（Main）       | SkillExecutor.ts の型 import 変更     | `architecture-*.md`           |
| IPC通信                    | チャンネルの型定義整合性              | `api-*.md`, `interfaces-*.md` |
| Shared                     | 正本型の拡張・追加                    | -                             |

## 設計図

### モジュール依存関係（変更後）

```
packages/shared/src/types/skill.ts (正本)
  ├─ ExecutionState
  ├─ ExecutionInfo
  ├─ ExecutionContext
  ├─ SkillExecutionRequest (拡張)
  ├─ SkillExecutionResponse (更新)
  ├─ SkillExecutionErrorCode
  ├─ SkillExecutionError
  ├─ SkillStreamMessage (Discriminated Union)
  ├─ RetryConfig (新規)
  ├─ RetryableErrorType (新規)
  ├─ RetryableErrorResult (新規)
  └─ SkillExecutorMetadata (新規)
        │
        ↓ import
apps/desktop/src/main/services/skill/SkillExecutor.ts
  └─ ローカル型定義なし（全て import）
```

### 変更ファイル一覧

| 優先度 | ファイル                           | 変更種別 | 変更内容                             |
| ------ | ---------------------------------- | -------- | ------------------------------------ |
| 1      | packages/shared/src/types/skill.ts | 更新     | 型拡張・追加（RetryConfig等）        |
| 2      | apps/desktop/.../SkillExecutor.ts  | 更新     | ローカル型削除、import変更、参照更新 |
| 3      | 間接影響ファイル                   | 確認     | 必要に応じて型参照の修正             |

## 成果物

| 成果物         | パス                                     | 説明           |
| -------------- | ---------------------------------------- | -------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造   |
| 型統合設計     | `outputs/phase-2/type-integration.md`    | 型統合詳細設計 |

## 完了条件

- [x] アーキテクチャが定義されている
- [x] 型統合設計が作成されている（差異解決方針）
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [x] 影響範囲が特定されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
