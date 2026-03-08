# SkillExecutor 型統一リファクタリング

## 概要

TASK-FIX-1-2で実施したSkillExecutor内の重複型定義を@repo/sharedに統一するリファクタリングの記録。

## 実装内容

### 統一された型（5型）

| 型名 | 移行前 | 移行後 |
|------|--------|--------|
| ExecutionState | SkillExecutor.ts L31-36 | @repo/shared/types/skill.ts |
| ExecutionInfo | SkillExecutor.ts L84-90 | @repo/shared/types/skill.ts |
| SkillExecutionErrorCode | SkillExecutor.ts L110-120 | @repo/shared/types/skill.ts |
| SkillExecutionError | SkillExecutor.ts L122-127 | @repo/shared/types/skill.ts |
| ExecutionContext | SkillExecutor.ts L129-137 | @repo/shared/types/skill.ts |

### 残存型（意図的に残した型）

| 型名 | 残存理由 |
|------|----------|
| SkillExecutionRequest | skillId（ローカル）vs skillName（正本）の差異 |
| SkillExecutionResponse | error型の構造差（構造体 vs 文字列） |
| SkillStreamMessage | Discriminated Union構造の差異 |
| RetryableErrorType等 | SkillExecutor固有のリトライ機構用 |

## 苦戦した箇所と解決策

### 1. 型の差異の特定

**課題**: ローカル型と正本型の差異を正確に特定する作業が煩雑

**解決策**:
- 型を1つずつ比較し、フィールド名・型・オプショナル性を表形式で整理
- 完全一致 vs 差異ありを明確に分類

**教訓**: 型移行前に「型比較表」を作成することで、移行対象を明確化できる

### 2. packages/shared/index.ts のエクスポート漏れ

**課題**: 型を@repo/sharedに追加しても、index.tsでエクスポートしないとimportできない

**解決策**:
- 型追加時は必ずindex.tsのexport文も同時に更新
- `pnpm --filter @repo/desktop typecheck` で即座に検証

**教訓**: 共有型追加時のチェックリスト:
1. types/skill.ts に型定義を追加
2. index.ts に export を追加
3. typecheck で検証

### 3. テストの互換性確認

**課題**: 型移行後に既存テストが失敗しないか確認が必要

**解決策**:
- 型移行専用のテストファイル（SkillExecutor.type-migration.test.ts）を作成
- 型の構造的互換性を検証するテストを追加

**教訓**: リファクタリング時は「移行テスト」を別ファイルで作成すると、回帰検証が容易

## 関連タスク

| タスクID | 内容 | ステータス |
|----------|------|----------|
| TASK-FIX-1-2 | 5型の統一（本タスク） | 完了 |
| TASK-FIX-1-3 | SkillExecutionRequest/Response統一 | 未着手 |
| TASK-FIX-1-4 | SkillStreamMessage Discriminated Union移行 | 未着手 |
| TASK-FIX-1-5 | SkillMetadata統一 | 未着手 |

## 参照

- 実装ガイド: `docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup/outputs/phase-12/implementation-guide.md`
- テストファイル: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`

## 変更履歴

| 日付 | 変更内容 |
|------|----------|
| 2026-02-08 | 初版作成（TASK-FIX-1-2完了） |
