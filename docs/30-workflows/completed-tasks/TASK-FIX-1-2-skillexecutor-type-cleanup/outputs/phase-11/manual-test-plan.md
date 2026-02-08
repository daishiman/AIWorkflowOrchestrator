# Phase 11: 手動テスト計画

## タスク情報

- **タスクID**: TASK-FIX-1-2
- **Phase**: 11 - 手動テスト
- **作成日**: 2026-02-08
- **タスク種別**: リファクタリング（内部変更のみ）

## テスト範囲

本タスクはリファクタリングタスク（SkillExecutor.ts のローカル型定義を @repo/shared に統一）であり、外部動作への影響はない。そのため、実際の E2E テストは不要であり、以下の観点での確認を行う。

## テスト項目

### 1. 型互換性確認

| ID     | テスト項目                                           | 確認方法                              | 期待結果             |
| ------ | ---------------------------------------------------- | ------------------------------------- | -------------------- |
| TC-1-1 | @repo/shared からの型インポートが正しいこと          | SkillExecutor.ts のインポート文を確認 | エラーなくインポート |
| TC-1-2 | ExecutionState 型が正しく使用されていること          | 型チェック（pnpm typecheck）          | 型エラーなし         |
| TC-1-3 | ExecutionInfo 型が正しく使用されていること           | 型チェック（pnpm typecheck）          | 型エラーなし         |
| TC-1-4 | SkillExecutionError 型が正しく使用されていること     | 型チェック（pnpm typecheck）          | 型エラーなし         |
| TC-1-5 | ExecutionContext 型が正しく使用されていること        | 型チェック（pnpm typecheck）          | 型エラーなし         |
| TC-1-6 | IPermissionStore インターフェースが正しいこと        | 型チェック（pnpm typecheck）          | 型エラーなし         |
| TC-1-7 | SkillPermissionResponse 型が正しく使用されていること | 型チェック（pnpm typecheck）          | 型エラーなし         |

### 2. 機能回帰確認

| ID     | テスト項目                                     | 確認方法                                        | 期待結果                    |
| ------ | ---------------------------------------------- | ----------------------------------------------- | --------------------------- |
| TC-2-1 | スキル実行の基本フローが動作すること           | SkillExecutor.test.ts の execute テスト         | 12 テスト全てパス           |
| TC-2-2 | エラーハンドリングが正常であること             | SkillExecutor.test.ts の categorizeError テスト | 5 テスト全てパス            |
| TC-2-3 | ストリーミングメッセージが正しく処理されること | SkillExecutor.integration.test.ts               | 3 テスト全てパス            |
| TC-2-4 | 権限リクエスト処理が正常であること             | SkillExecutor.permission.test.ts                | 90 テスト全てパス           |
| TC-2-5 | リトライ処理が正常であること                   | SkillExecutor.retry.test.ts                     | 70/72 パス（2件は既存問題） |
| TC-2-6 | 中断処理が正常であること                       | SkillExecutor.test.ts の abort テスト           | 5 テスト全てパス            |

### 3. 統合確認

| ID     | テスト項目               | 確認方法                             | 期待結果             |
| ------ | ------------------------ | ------------------------------------ | -------------------- |
| TC-3-1 | IPC 経由での型整合性     | SKILL_CHANNELS 定数の使用確認        | 正しく参照されている |
| TC-3-2 | Main-Renderer 間の通信型 | IPC メッセージ送信コードの確認       | 型エラーなし         |
| TC-3-3 | PermissionStore との連携 | SkillExecutor.permission.test.ts     | テスト全てパス       |
| TC-3-4 | 型移行テストの統合確認   | SkillExecutor.type-migration.test.ts | 13 テスト全てパス    |

## 確認対象ファイル

### 変更されたファイル

1. `apps/desktop/src/main/services/skill/SkillExecutor.ts`
   - ローカル型定義の削除（ExecutionState, ExecutionInfo, SkillExecutionError, ExecutionContext）
   - @repo/shared からの型インポートへ統一

2. `packages/shared/index.ts`
   - 型エクスポートの追加確認（TASK-FIX-1-1 で追加済み）

### テストファイル

1. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`
2. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts`
3. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.permission.test.ts`
4. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`
5. `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`

## テスト実行コマンド

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# 全テスト実行
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/

# 型移行テストのみ
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts
```

## テスト判定基準

| 基準              | 合格条件                            |
| ----------------- | ----------------------------------- |
| 型チェック        | エラー 0 件                         |
| テスト通過率      | 239/241 以上（既存問題 2 件を除く） |
| 型移行テスト      | 13/13 パス（100%）                  |
| any 型の増加      | 0 件                                |
| @ts-ignore の増加 | 0 件                                |

## 備考

- 本タスクはリファクタリング（内部変更）のため、UI への影響はなし
- 自動テスト（241 件）で機能の動作は確認済み
- 2 件のテスト失敗は既存のリトライテストのタイムアウト問題であり、今回の変更とは無関係
