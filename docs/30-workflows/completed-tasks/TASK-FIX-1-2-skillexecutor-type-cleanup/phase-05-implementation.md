# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 5                                       |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP |
| 機能名   | skillexecutor-type-cleanup              |
| 作成日   | 2026-02-07                              |
| 分類     | リファクタリング                        |

## 目的

Phase 4で作成したテストを通すために、SkillExecutor.ts のローカル型定義6つを削除し、@repo/shared の共有型に統一する最小限の実装を行う。

## 対象型定義と実装方針

| #   | 型名                    | 実装方針                                      |
| --- | ----------------------- | --------------------------------------------- |
| 1   | ExecutionState          | ローカル定義を削除し、@repo/shared からimport |
| 2   | SkillExecutionRequest   | skillId → skillName への参照変更を実施        |
| 3   | SkillExecutionResponse  | error型を共有型の構造に合わせて修正           |
| 4   | ExecutionInfo           | ローカル定義を削除し、@repo/shared からimport |
| 5   | SkillStreamMessage      | type値を共有型の値に合わせて修正              |
| 6   | SkillExecutionErrorCode | ローカル定義を削除し、@repo/shared からimport |

## 実行タスク

- ローカル型削除: SkillExecutor.ts 内の6つのローカル型定義を削除
- 共有型import追加: @repo/shared から対応する型をimport
- 型差異対応: skillId→skillName、error型、type値の差異を解消
- 型安全性確保: TypeScriptの型システムで整合性を検証

## 参照資料

| 資料名               | パス                                                    | 説明                 |
| -------------------- | ------------------------------------------------------- | -------------------- |
| Phase 4 テスト仕様   | `outputs/phase-4/test-specification.md`                 | テスト設計           |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md`                         | ケース一覧           |
| SkillExecutor本体    | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | リファクタリング対象 |
| 共有型定義           | `packages/shared/src/types/skill-execution.ts`          | 統一先の型定義       |

## 実行手順

### ステップ1: 共有型のimport追加

```typescript
// Before
type ExecutionState = "idle" | "running" | "completed" | "error";
type SkillExecutionRequest = { skillId: string /* ... */ };
// ... 他のローカル型定義

// After
import {
  ExecutionState,
  SkillExecutionRequest,
  SkillExecutionResponse,
  ExecutionInfo,
  SkillStreamMessage,
  SkillExecutionErrorCode,
} from "@repo/shared/types/skill-execution";
```

### ステップ2: ローカル型定義の削除

SkillExecutor.ts 内の以下のローカル型定義を削除:

1. `type ExecutionState = ...`
2. `type SkillExecutionRequest = ...`
3. `type SkillExecutionResponse = ...`
4. `type ExecutionInfo = ...`
5. `type SkillStreamMessage = ...`
6. `type SkillExecutionErrorCode = ...`

### ステップ3: skillId → skillName の変更対応

```typescript
// Before
interface SkillExecutionRequest {
  skillId: string;
  // ...
}

// After（共有型を使用）
// 共有型では skillName を使用
// コード内の参照を更新
async execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse> {
  const { skillName, ...rest } = request; // skillId → skillName
  // ...
}
```

### ステップ4: error型の差異対応

```typescript
// Before（ローカル型）
interface SkillExecutionResponse {
  error?: string;
}

// After（共有型を使用）
// 共有型の error 構造に合わせる
interface SkillExecutionResponse {
  error?: {
    code: SkillExecutionErrorCode;
    message: string;
  };
}
```

### ステップ5: SkillStreamMessage の type値対応

```typescript
// Before（ローカル型）
type SkillStreamMessage = {
  type: "output" | "error" | "progress";
  // ...
};

// After（共有型を使用）
// 共有型の type 値に合わせる
// 必要に応じて値のマッピングを実装
```

### ステップ6: 型チェックの実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# テスト実行
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

## 統合テスト連携【必須】

IPC経由でのSkillExecutor呼び出しが共有型で正しく動作することを確認:

| 実装項目       | 内容                                     |
| -------------- | ---------------------------------------- |
| 型import更新   | IPC ハンドラで共有型を使用               |
| リクエスト変換 | skillId → skillName の変換（必要な場合） |
| レスポンス変換 | error型を共有型の構造に変換              |

## アーキテクチャ層別実装

| 層           | 実装観点                            | 実装ファイル配置                        |
| ------------ | ----------------------------------- | --------------------------------------- |
| Main Process | SkillExecutorの型参照を共有型に変更 | `apps/desktop/src/main/services/skill/` |
| Shared       | 型定義の追加・更新（必要な場合）    | `packages/shared/src/types/`            |
| IPC通信      | チャンネルハンドラの型参照更新      | `apps/desktop/src/main/ipc/`            |

## 成果物

| 成果物                | パス                                                    | 説明                       |
| --------------------- | ------------------------------------------------------- | -------------------------- |
| 更新済みSkillExecutor | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | ローカル型削除後のファイル |
| 更新済みIPCハンドラ   | `apps/desktop/src/main/ipc/skill-handlers.ts`           | 共有型参照に更新           |

## 完了条件

- [ ] 6つのローカル型定義がすべて削除されている
- [ ] @repo/shared からの型importが追加されている
- [ ] skillId → skillName の参照変更が完了している
- [ ] error型が共有型の構造に合わせて修正されている
- [ ] SkillStreamMessage の type値が共有型に合わせて修正されている
- [ ] すべてのテストが成功状態（Green）
- [ ] 型チェック（pnpm typecheck）が通過している
- [ ] 既存機能に影響がないことが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"

# 型チェック
pnpm --filter @repo/desktop typecheck

# 確認項目
# - [ ] Phase 4で作成したテストが全て成功することを確認（Green状態）
# - [ ] 型エラーがないことを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. [ ] 参照資料の確認（Phase 4テスト・共有型定義）
2. [ ] 共有型のimport追加
3. [ ] ExecutionState ローカル定義削除
4. [ ] SkillExecutionRequest 削除 + skillId→skillName対応
5. [ ] SkillExecutionResponse 削除 + error型対応
6. [ ] ExecutionInfo ローカル定義削除
7. [ ] SkillStreamMessage 削除 + type値対応
8. [ ] SkillExecutionErrorCode ローカル定義削除
9. [ ] 型チェック実行・エラー解消
10. [ ] テスト実行・全テスト成功確認
11. [ ] 完了条件の検証

## 次のPhase

Phase 6: テスト拡充
