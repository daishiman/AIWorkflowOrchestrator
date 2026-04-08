# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 6                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

Phase 5 の実装に対して、fail path・境界値・エッジケースを網羅するテストを追加し、回帰ガードを強化する。

## 実行タスク

- fail pathテスト追加: unknown variant が public seam 経由で拒否されるケースの実行時検証
- 境界値テスト追加: union 型の各バリアントを明示的にテスト
- 回帰ガード強化: 将来の union 型拡張に備えたテスト構造の整備
- テスト品質確認: 全テストが PASS していることを確認

## 参照資料

| 資料名         | パス                                                                                              | 説明                 |
| -------------- | ------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 5 実装   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | 拡充対象の実装       |
| Phase 4 テスト | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | 拡充対象のテスト     |
| Phase 4 設計書 | `outputs/phase-4/test-design.md`                                                                  | 拡充すべき TC の定義 |

## 実行手順

### ステップ1: fail path テストの追加

`executeAsync()` の public seam に未知バリアントが到達した場合のエラースロー動作を確認する：

```typescript
// TC-09: unknown variant の実行時エラー検証
it("should throw when an unknown variant reaches executeAsync", async () => {
  // module-local assertNever は直接 import せず、executeAsync の戻り値経路で確認する
  // 注: このテストは public seam に未知バリアントを流し込む smoke test
});
```

### ステップ2: 各バリアントを明示的にテスト

switch の各 case が正しく動作することを個別に確認する：

| TC ID | バリアント                              | テスト内容                      |
| ----- | --------------------------------------- | ------------------------------- |
| TC-10 | RuntimeSkillCreatorTerminalHandoff      | terminal-handoff パスの処理確認 |
| TC-11 | RuntimeSkillCreatorExecuteErrorResponse | error パスの処理確認            |
| TC-12 | SkillExecuteResult (success)            | success パスの処理確認          |

### ステップ3: 全テスト実行確認

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

期待結果: 全テスト PASS（T-01〜T-06 + TC-07〜TC-12）

### ステップ4: テスト拡充サマリー作成

`outputs/phase-6/test-expansion.md` に追加テストの一覧・設計根拠を記録する。

## 統合テスト連携

| 連携項目     | 内容                                   |
| ------------ | -------------------------------------- |
| 全テスト確認 | 拡充後も全テストが PASS することを確認 |

## 成果物

| 成果物         | パス                                                                                              | 説明                  |
| -------------- | ------------------------------------------------------------------------------------------------- | --------------------- |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | TC-09〜TC-12 追加済み |
| 拡充サマリー   | `outputs/phase-6/test-expansion.md`                                                               | 追加テスト一覧        |

## 完了条件

- [ ] fail path テスト（TC-09）が追加されている
- [ ] 各バリアントを明示的にテストする TC-10〜TC-12 が追加されている
- [ ] 全テスト（T-01〜T-06 + TC-07〜TC-12）が PASS
- [ ] テスト拡充サマリーが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 6
```
