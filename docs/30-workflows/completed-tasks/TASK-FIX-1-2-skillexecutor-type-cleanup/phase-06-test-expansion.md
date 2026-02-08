# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 6                                       |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP |
| 機能名   | skillexecutor-type-cleanup              |
| 作成日   | 2026-02-07                              |
| 分類     | リファクタリング                        |

## 目的

Phase 5で実装した型統一リファクタリングに対してテストを拡充し、カバレッジ目標を達成する。リファクタリングタスクのため、既存機能の回帰がないことを重点的に検証する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- 回帰テスト拡充: 型変更による既存機能への影響がないことを検証
- 境界値テスト追加: 共有型のエッジケーステスト
- 統合テスト拡充: IPC経由での型整合性テスト

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 結合テストカバレッジ基準

| 指標              | 目標 |
| ----------------- | ---- |
| 型変更箇所のAPI   | 100% |
| skillName使用箇所 | 100% |
| error型使用箇所   | 100% |
| 正常系シナリオ    | 100% |
| 異常系シナリオ    | 80%+ |

## 参照資料

| 資料名             | パス                                                    | 説明             |
| ------------------ | ------------------------------------------------------- | ---------------- |
| Phase 4 テスト仕様 | `outputs/phase-4/test-specification.md`                 | テスト設計       |
| Phase 5 実装結果   | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 更新済みファイル |
| 共有型定義         | `packages/shared/src/types/skill-execution.ts`          | 統一先の型定義   |

## 実行手順

### ステップ1: カバレッジ測定

```bash
# カバレッジ測定
pnpm --filter @repo/desktop test:coverage -- --grep "SkillExecutor"

# カバレッジレポート確認
open coverage/lcov-report/index.html
```

### ステップ2: ギャップ分析

以下の観点で不足領域を特定:

1. **型変更箇所の網羅性**
   - ExecutionState の全状態値がテストされているか
   - skillName を使用する全パスがテストされているか
   - error型の全パターンがテストされているか

2. **分岐カバレッジ**
   - if/else分岐が全てカバーされているか
   - switch文の全caseがテストされているか

3. **関数カバレッジ**
   - public/privateメソッドが全てテストされているか

### ステップ3: 追加テスト作成

#### 3.1 ExecutionState 拡充テスト

```typescript
describe("ExecutionState 完全テスト", () => {
  it.each(["idle", "running", "completed", "error"])(
    "状態 %s が正しく処理される",
    (state) => {
      // 各状態での動作検証
    },
  );

  it("不正な状態値を拒否する", () => {
    // 型安全性テスト
  });
});
```

#### 3.2 skillName 拡充テスト

```typescript
describe("skillName プロパティ", () => {
  it("空文字列のskillNameを適切に処理する", () => {});
  it("特殊文字を含むskillNameを処理する", () => {});
  it("長いskillNameを処理する", () => {});
});
```

#### 3.3 error型 拡充テスト

```typescript
describe("error型 構造テスト", () => {
  it.each([
    [SkillExecutionErrorCode.SKILL_NOT_FOUND, "スキルが見つかりません"],
    [SkillExecutionErrorCode.EXECUTION_FAILED, "実行に失敗しました"],
    [SkillExecutionErrorCode.TIMEOUT, "タイムアウトしました"],
  ])('エラーコード %s でメッセージ "%s" を返す', (code, message) => {
    // エラーレスポンスの検証
  });
});
```

#### 3.4 SkillStreamMessage 拡充テスト

```typescript
describe("SkillStreamMessage type値", () => {
  it.each(["output", "error", "progress", "status"])(
    "type %s のメッセージを正しく処理する",
    (type) => {
      // ストリームメッセージの検証
    },
  );
});
```

### ステップ4: 統合テスト拡充

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test:integration
```

**追加する統合テストケース**:

| テストケース                   | 検証内容                     |
| ------------------------------ | ---------------------------- |
| IPC経由でのスキル実行          | Renderer→Main→Rendererの往復 |
| エラーレスポンスの伝播         | 共有型error構造の正確な伝播  |
| ストリーミングメッセージの受信 | type値の正確なマッピング     |

### ステップ5: カバレッジ再測定

```bash
# 再測定
pnpm --filter @repo/desktop test:coverage -- --grep "SkillExecutor"

# 基準達成確認
# Line: 80%+, Branch: 60%+, Function: 80%+
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）:

| テストカテゴリ     | 検証項目                        | 目標 |
| ------------------ | ------------------------------- | ---- |
| 型整合性テスト     | 共有型を使用したIPC通信         | 100% |
| データフローテスト | skillName→実行→レスポンスの往復 | 100% |
| エラーハンドリング | 共有型error構造でのエラー伝播   | 80%+ |
| 状態遷移テスト     | ExecutionState全状態の遷移      | 100% |

## 成果物

| 成果物             | パス                                                                            | 説明               |
| ------------------ | ------------------------------------------------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                                            | カバレッジ分析結果 |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`                                           | 統合テスト実行結果 |
| 追加テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.extended.test.ts` | 拡充テストコード   |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 6つの対象型すべてに対する網羅的テストが存在する
- [ ] ExecutionState の全状態値がテストされている
- [ ] skillName の境界値テストが追加されている
- [ ] error型の全エラーコードがテストされている
- [ ] SkillStreamMessage の全type値がテストされている
- [ ] 統合テストで型整合性が確認されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. [ ] 参照資料の確認（Phase 4/5成果物）
2. [ ] 現状カバレッジ測定
3. [ ] ギャップ分析・不足領域特定
4. [ ] ExecutionState 拡充テスト作成
5. [ ] skillName 境界値テスト作成
6. [ ] error型 網羅テスト作成
7. [ ] SkillStreamMessage type値テスト作成
8. [ ] ExecutionInfo 追加テスト作成
9. [ ] SkillExecutionErrorCode 追加テスト作成
10. [ ] 統合テスト拡充
11. [ ] カバレッジ再測定・基準達成確認
12. [ ] カバレッジレポート作成
13. [ ] 完了条件の検証

## 次のPhase

Phase 7: テストカバレッジ確認
