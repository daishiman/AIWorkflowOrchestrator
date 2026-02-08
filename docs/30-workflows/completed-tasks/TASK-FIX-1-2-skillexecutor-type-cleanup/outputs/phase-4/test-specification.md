# Phase 4: テスト仕様書

## テスト対象

TASK-FIX-1-2: SkillExecutor.ts のローカル型定義を @repo/shared に統一

## テストファイル

- `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`

## テスト目的

SkillExecutor.ts 内のローカル型定義が @repo/shared の共有型と構造的に互換であることを検証する。

## テスト対象型

| 型名                    | SkillExecutor.ts 行番号 | @repo/shared 行番号 | 説明                             |
| ----------------------- | ----------------------- | ------------------- | -------------------------------- |
| ExecutionState          | L31-36                  | L519-524            | 実行状態のユニオン型             |
| ExecutionInfo           | L84-90                  | L529-544            | 実行情報インターフェース         |
| SkillExecutionErrorCode | L110-120                | L549-558            | エラーコードのユニオン型         |
| SkillExecutionError     | L122-127                | L563-572            | エラー情報インターフェース       |
| ExecutionContext        | L129-137                | L577-595            | 実行コンテキストインターフェース |

## テスト戦略

### 1. 型の値網羅テスト（ユニオン型）

ExecutionState と SkillExecutionErrorCode について、全ての値が定義通りに存在することを確認。

### 2. 構造一致テスト（インターフェース）

ExecutionInfo、SkillExecutionError、ExecutionContext について:

- 必須プロパティの存在確認
- オプショナルプロパティの扱い確認
- 各プロパティの型確認

### 3. 統合テスト

- ExecutionContext から ExecutionInfo への変換が正しく行われることを確認
- ExecutionState の遷移パターンの検証

## 検証方法

```typescript
// 型の値が有効であることを TypeScript の型システムと実行時チェックで確認
const validStates: ExecutionState[] = [
  "pending",
  "running",
  "completed",
  "aborted",
  "error",
];

// 構造の検証
const executionInfo: ExecutionInfo = {
  id: "test-id",
  skillId: "test-skill-id",
  state: "pending",
  startedAt: Date.now(),
};
expect(executionInfo).toHaveProperty("id");
```

## 成功基準

- [ ] 全てのテストが PASS
- [ ] 型チェックが通過
- [ ] カバレッジ基準を満たす

## 作成日

2026-02-07
