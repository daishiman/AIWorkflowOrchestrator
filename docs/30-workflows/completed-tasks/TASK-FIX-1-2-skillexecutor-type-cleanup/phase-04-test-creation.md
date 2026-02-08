# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 4                                       |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP |
| 機能名   | skillexecutor-type-cleanup              |
| 作成日   | 2026-02-07                              |
| 分類     | リファクタリング                        |

## 目的

SkillExecutor.ts のローカル型定義を @repo/shared の共有型に統一した後も、既存の動作が維持されることを検証するテストを作成する（Red状態）。

## 対象型定義

| #   | 型名                    | 対応方針                     |
| --- | ----------------------- | ---------------------------- |
| 1   | ExecutionState          | 値同一 → 単純削除+import     |
| 2   | SkillExecutionRequest   | skillId → skillName 変更必要 |
| 3   | SkillExecutionResponse  | error型の差異対応必要        |
| 4   | ExecutionInfo           | 値同一 → 単純削除+import     |
| 5   | SkillStreamMessage      | type値の差異対応必要         |
| 6   | SkillExecutionErrorCode | 値同一 → 単純削除+import     |

## 実行タスク

- 型互換性テスト作成: ローカル型と共有型の互換性検証テスト
- SkillExecutor機能テスト: 型変更後も既存機能が正常動作するテスト
- 境界値テスト: エラーケース・エッジケースのテスト追加

## 参照資料

| 資料名               | パス                                                    | 説明                 |
| -------------------- | ------------------------------------------------------- | -------------------- |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`            | 要件定義書           |
| Phase 2 設計         | `outputs/phase-2/architecture-design.md`                | アーキテクチャ設計   |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-result.md`               | 設計レビュー結果     |
| SkillExecutor本体    | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | リファクタリング対象 |
| 共有型定義           | `packages/shared/src/types/skill-execution.ts`          | 統一先の型定義       |

## 実行手順

### ステップ1: 既存テストの確認

現在のSkillExecutor関連テストを確認し、テストカバレッジの現状を把握する。

```bash
# 既存テストの確認
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"
```

### ステップ2: 型互換性テストの作成

ローカル型を共有型に置き換えた際に互換性が維持されることを検証するテストを作成する。

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts`

```typescript
// テストケース例
describe("SkillExecutor 型マイグレーション", () => {
  describe("ExecutionState", () => {
    it("共有型のExecutionStateが全ての必要な状態を含む", () => {
      // Red: 共有型importに切り替え前は失敗
    });
  });

  describe("SkillExecutionRequest", () => {
    it("skillNameプロパティで正しくリクエストを処理できる", () => {
      // Red: skillId → skillName 変更前は失敗
    });
  });

  describe("SkillExecutionResponse", () => {
    it("共有型のerror構造で正しくエラーを返す", () => {
      // Red: error型の差異対応前は失敗
    });
  });

  describe("SkillStreamMessage", () => {
    it("共有型のtype値で正しくストリームメッセージを処理できる", () => {
      // Red: type値の差異対応前は失敗
    });
  });
});
```

### ステップ3: 機能回帰テストの作成

型変更後も既存機能が正常動作することを確認するテストを作成する。

**テストケース**:

1. スキル実行の正常系
2. スキル実行のエラー系
3. ストリーミングメッセージの送受信
4. 実行状態の遷移

### ステップ4: 境界値・エッジケーステストの追加

- null/undefined 引数の処理
- 空文字列の skillName
- 不正な ExecutionState 値
- エラーレスポンスのバリエーション

## 統合テスト連携【必須】

IPC経由でのSkillExecutor呼び出しテストを設計する:

| シナリオカテゴリ   | 検証内容                                           | テストファイル             |
| ------------------ | -------------------------------------------------- | -------------------------- |
| IPC通信テスト      | Renderer→Main間でのスキル実行リクエスト/レスポンス | `*.ipc.test.ts`            |
| 型整合性テスト     | 共有型を使用したIPC通信の型安全性                  | `*.type-migration.test.ts` |
| エラーハンドリング | 型不一致時のエラー処理                             | `*.error.test.ts`          |

## アーキテクチャ層別テスト

| 層           | テスト観点                      | テストファイル配置                                            |
| ------------ | ------------------------------- | ------------------------------------------------------------- |
| Main Process | SkillExecutorサービスの型互換性 | `apps/desktop/src/main/services/skill/__tests__/*.test.ts`    |
| Shared       | 共有型定義の完全性              | `packages/shared/src/types/__tests__/skill-execution.test.ts` |
| IPC通信      | 型を使用したMain-Renderer連携   | `apps/desktop/src/main/ipc/__tests__/*.ipc.test.ts`           |

## 成果物

| 成果物           | パス                                                                                  | 説明                     |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------ |
| テスト仕様書     | `outputs/phase-4/test-specification.md`                                               | テスト設計               |
| テストケース一覧 | `outputs/phase-4/test-cases.md`                                                       | ケース一覧               |
| 型互換性テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.type-migration.test.ts` | 型マイグレーションテスト |

## 完了条件

- [ ] 6つの対象型それぞれに対する互換性テストが存在する
- [ ] ExecutionState の状態値テストが作成されている
- [ ] SkillExecutionRequest の skillName プロパティテストが作成されている
- [ ] SkillExecutionResponse の error 型テストが作成されている
- [ ] ExecutionInfo の互換性テストが作成されている
- [ ] SkillStreamMessage の type 値テストが作成されている
- [ ] SkillExecutionErrorCode の互換性テストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test -- --grep "SkillExecutor"

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] 失敗理由が「共有型未使用」または「型不一致」であること
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. [ ] 参照資料の確認（既存テスト・型定義の把握）
2. [ ] ExecutionState 互換性テスト作成
3. [ ] SkillExecutionRequest テスト作成（skillName対応）
4. [ ] SkillExecutionResponse テスト作成（error型対応）
5. [ ] ExecutionInfo 互換性テスト作成
6. [ ] SkillStreamMessage テスト作成（type値対応）
7. [ ] SkillExecutionErrorCode 互換性テスト作成
8. [ ] 境界値・エッジケーステスト作成
9. [ ] テスト仕様書・ケース一覧の作成
10. [ ] 完了条件の検証

## 次のPhase

Phase 5: 実装（TDD: Green）
