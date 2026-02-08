# アーキテクチャ設計書

## タスク情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| タスクID | TASK-FIX-1-2                       |
| タスク名 | SkillExecutor 型定義クリーンアップ |
| 作成日   | 2026-02-07                         |
| Phase    | 2 - 設計                           |

---

## 1. 設計概要

### 1.1 設計目標

SkillExecutor.ts 内の重複型定義を `@repo/shared/types/skill.ts`（正本）に統合し、型の一元管理を実現する。

### 1.2 設計原則

1. **単一信頼源（Single Source of Truth）**: 型定義は正本のみで管理
2. **後方互換性**: 既存 API のシグネチャを維持
3. **最小変更**: 必要最小限の変更で目的を達成
4. **型安全性**: TypeScript strict モードでのコンパイルを保証

---

## 2. 現行アーキテクチャ

### 2.1 型定義の配置（変更前）

```
packages/shared/src/types/skill.ts  ← 正本
  ├── ExecutionState
  ├── ExecutionInfo
  ├── SkillExecutionErrorCode
  ├── SkillExecutionError
  ├── ExecutionContext
  ├── SkillExecutionRequest (skillName ベース)
  ├── SkillExecutionResponse (error: string)
  └── SkillStreamMessage (Discriminated Union)

apps/desktop/src/main/services/skill/SkillExecutor.ts  ← 重複
  ├── ExecutionState          ← 削除対象（完全一致）
  ├── ExecutionInfo           ← 削除対象（完全一致）
  ├── SkillExecutionErrorCode ← 削除対象（完全一致）
  ├── SkillExecutionError     ← 削除対象（完全一致）
  ├── ExecutionContext        ← 削除対象（完全一致）
  ├── SkillExecutionRequest   ← 統合対象（差異あり）
  ├── SkillExecutionResponse  ← 統合対象（差異あり）
  └── SkillStreamMessage      ← リネーム維持（大きな差異）
```

### 2.2 依存関係（変更前）

```
SkillExecutor.ts
  ├── import { Skill, SkillPermissionResponse, IPermissionStore } from "@repo/shared"
  ├── ローカル型定義（8個）
  └── ローカル専用型（RetryConfig, HooksStreamMessage 等）
```

---

## 3. 目標アーキテクチャ

### 3.1 型定義の配置（変更後）

```
packages/shared/src/types/skill.ts  ← 正本（拡張）
  ├── ExecutionState           ← 既存
  ├── ExecutionInfo            ← 既存
  ├── SkillExecutionErrorCode  ← 既存
  ├── SkillExecutionError      ← 既存
  ├── ExecutionContext         ← 既存
  ├── SkillExecutionRequest    ← 拡張（skillId, timeout, sessionId, retryConfig 追加）
  ├── SkillExecutionResponse   ← 拡張（error を union 型に）
  ├── SkillStreamMessage       ← 既存（Discriminated Union）
  └── RetryConfig              ← 新規追加

apps/desktop/src/main/services/skill/SkillExecutor.ts  ← クリーンアップ済み
  ├── SkillExecutorStreamMessage  ← リネーム（ローカル専用）
  ├── HooksStreamMessage          ← 維持（ローカル専用）
  └── その他ローカル専用型        ← 維持
```

### 3.2 依存関係（変更後）

```
SkillExecutor.ts
  ├── import {
  │     Skill,
  │     SkillPermissionResponse,
  │     IPermissionStore,
  │     ExecutionState,           ← 追加
  │     ExecutionInfo,            ← 追加
  │     SkillExecutionErrorCode,  ← 追加
  │     SkillExecutionError,      ← 追加
  │     ExecutionContext,         ← 追加
  │     SkillExecutionRequest,    ← 追加
  │     SkillExecutionResponse,   ← 追加
  │     RetryConfig,              ← 追加
  │   } from "@repo/shared"
  └── ローカル専用型（SkillExecutorStreamMessage, HooksStreamMessage 等）
```

---

## 4. 変更設計

### 4.1 完全一致型の削除（5型）

これらの型は正本と完全に一致しているため、単純に削除して import に置換する。

| 型名                    | 行番号   | 対応                         |
| ----------------------- | -------- | ---------------------------- |
| ExecutionState          | L31-36   | 削除 → `@repo/shared` import |
| ExecutionInfo           | L84-90   | 削除 → `@repo/shared` import |
| SkillExecutionErrorCode | L110-120 | 削除 → `@repo/shared` import |
| SkillExecutionError     | L122-127 | 削除 → `@repo/shared` import |
| ExecutionContext        | L129-137 | 削除 → `@repo/shared` import |

**変更箇所**:

- SkillExecutor.ts: 型定義削除、import 追加
- 影響を受けるコード: なし（型名が同一のため）

### 4.2 差異型の統合（2型）

#### 4.2.1 SkillExecutionRequest

**正本の拡張**:

```typescript
// packages/shared/src/types/skill.ts
export interface SkillExecutionRequest {
  /** 使用するスキル名 */
  skillName: string;

  /** スキルID（オプション、skillName の代替） */
  skillId?: string;

  /** ユーザープロンプト */
  prompt: string;

  /** 作業ディレクトリ（省略時はデフォルト） */
  workingDirectory?: string;

  /** タイムアウト（ミリ秒） */
  timeout?: number;

  /** セッションID */
  sessionId?: string;

  /** リトライ設定 */
  retryConfig?: Partial<RetryConfig>;
}
```

**SkillExecutor.ts の変更**:

- ローカル定義を削除
- `@repo/shared` から import
- 既存コードは `skillId` を使用しているため、動作は変更なし

#### 4.2.2 SkillExecutionResponse

**正本の拡張**:

```typescript
// packages/shared/src/types/skill.ts
export interface SkillExecutionResponse {
  /** 実行ID（UUID、Main側で生成） */
  executionId: string;

  /** 開始成功かどうか */
  success: boolean;

  /** エラー情報（失敗時） */
  error?: string | SkillExecutionError;
}
```

**SkillExecutor.ts の変更**:

- ローカル定義を削除
- `@repo/shared` から import
- 既存コードは `SkillExecutionError` を使用しているため、動作は変更なし

### 4.3 ローカル型のリネーム（1型）

#### 4.3.1 SkillStreamMessage → SkillExecutorStreamMessage

**理由**:

- 正本の `SkillStreamMessage` は Discriminated Union 形式
- SkillExecutor.ts の型は単純オブジェクト形式
- 設計思想が大きく異なるため、完全な統合は本タスクのスコープ外

**変更内容**:

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

// Before
export interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: SkillStreamMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

// After
export interface SkillExecutorStreamMessage {
  executionId: string;
  id: string;
  type: SkillExecutorStreamMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}
```

**影響箇所**:

- `sendStream()` メソッドのパラメータ型
- `convertToStreamMessage()` メソッドの戻り値型
- テストコードの型参照

---

## 5. 正本拡張詳細

### 5.1 RetryConfig 型の追加

```typescript
// packages/shared/src/types/skill.ts

/**
 * リトライ設定
 */
export interface RetryConfig {
  /** 最大リトライ回数 */
  maxRetries: number;

  /** 基本待機時間（ミリ秒） */
  baseDelayMs: number;

  /** 最大待機時間（ミリ秒） */
  maxDelayMs: number;

  /** Jitter範囲 0-1 */
  jitterFactor: number;

  /** バックオフ倍率 */
  backoffMultiplier: number;
}

/**
 * スキル実行設定定数（拡張）
 */
export const SKILL_EXECUTION_DEFAULTS = {
  /** デフォルトタイムアウト（ミリ秒） */
  DEFAULT_TIMEOUT: 30000,
  /** 最大同時実行数 */
  MAX_CONCURRENT_EXECUTIONS: 5,
  /** 最大リトライ回数 */
  MAX_RETRIES: 3,
  /** 初回リトライ待機時間（ミリ秒） */
  INITIAL_RETRY_DELAY: 1000,
  /** 最大リトライ待機時間（ミリ秒） */
  MAX_RETRY_DELAY: 4000,
  // 新規追加
  /** デフォルトリトライ設定 */
  DEFAULT_RETRY_CONFIG: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    jitterFactor: 0.2,
    backoffMultiplier: 2,
  } as RetryConfig,
} as const;
```

### 5.2 export の追加

```typescript
// packages/shared/src/index.ts

export type {
  // 既存
  Skill,
  SkillPermissionResponse,
  IPermissionStore,
  // 追加
  ExecutionState,
  ExecutionInfo,
  SkillExecutionErrorCode,
  SkillExecutionError,
  ExecutionContext,
  SkillExecutionRequest,
  SkillExecutionResponse,
  RetryConfig,
} from "./types/skill";

export { SKILL_EXECUTION_DEFAULTS } from "./types/skill";
```

---

## 6. 影響分析

### 6.1 コード変更マトリクス

| ファイル                                                               | 変更種別         | 変更内容                                                   |
| ---------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------- |
| `packages/shared/src/types/skill.ts`                                   | 拡張             | SkillExecutionRequest, SkillExecutionResponse, RetryConfig |
| `packages/shared/src/index.ts`                                         | 拡張             | export 追加                                                |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | リファクタリング | 型削除、import 追加、リネーム                              |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` | 追従             | import 更新、型参照更新                                    |

### 6.2 リスク評価

| リスク          | 発生確率 | 影響度 | 対策                        |
| --------------- | -------- | ------ | --------------------------- |
| import 解決失敗 | 低       | 中     | `@repo/shared` のビルド確認 |
| 型互換性エラー  | 低       | 高     | union 型で後方互換性維持    |
| テスト失敗      | 低       | 中     | 型変更に追従してテスト更新  |

---

## 7. 実装順序

### 7.1 実装フェーズ

1. **Phase 1: 正本拡張**
   - `packages/shared/src/types/skill.ts` に型追加・拡張
   - `packages/shared/src/index.ts` に export 追加
   - `pnpm --filter @repo/shared build` で確認

2. **Phase 2: SkillExecutor.ts クリーンアップ**
   - 完全一致型（5型）の削除
   - `@repo/shared` からの import 追加
   - SkillStreamMessage → SkillExecutorStreamMessage リネーム

3. **Phase 3: 差異型の統合**
   - SkillExecutionRequest のローカル定義削除
   - SkillExecutionResponse のローカル定義削除

4. **Phase 4: テスト更新**
   - テストコードの import 更新
   - 型参照の更新

### 7.2 ロールバック計画

各フェーズ完了後に `pnpm typecheck` と `pnpm test` を実行し、失敗した場合は該当フェーズの変更を revert する。

---

## 8. 設計決定記録

### 8.1 DDR-001: SkillStreamMessage の扱い

**決定**: SkillExecutor 専用型として維持し、`SkillExecutorStreamMessage` にリネーム

**理由**:

1. 正本の `SkillStreamMessage` は Discriminated Union 形式で、型別に異なる content 型を持つ
2. SkillExecutor.ts の型は単純オブジェクト形式で、content は常に string
3. 完全な統合は設計変更を伴い、本タスクのスコープを超える
4. リネームにより名前空間の衝突を回避

**代替案**:

- 案A: 正本に合わせて Discriminated Union に変更 → スコープ外として却下
- 案B: 両方を維持 → 名前衝突のリスクあり → 却下

### 8.2 DDR-002: SkillExecutionRequest の skillId vs skillName

**決定**: 正本に `skillId` をオプショナルプロパティとして追加

**理由**:

1. 正本は `skillName` を必須、SkillExecutor.ts は `skillId` を必須
2. 両方をオプショナルにすると型安全性が低下
3. `skillId` をオプショナル追加することで後方互換性を維持

**検討事項**:

- 将来的には `skillName` と `skillId` の使い分けを整理する必要あり
- 本タスクでは現状維持を優先

### 8.3 DDR-003: error 型の拡張方法

**決定**: union 型 `string | SkillExecutionError` を使用

**理由**:

1. 正本は `error?: string`、SkillExecutor.ts は `error?: SkillExecutionError`
2. union 型にすることで両方の使用パターンをサポート
3. 既存コードの変更が不要

---

## 9. 次ステップ

1. Phase 3（設計レビュー）で本設計書をレビュー
2. PASS 判定後、Phase 4（テスト作成）に進む
3. テストファースト で実装を進める
