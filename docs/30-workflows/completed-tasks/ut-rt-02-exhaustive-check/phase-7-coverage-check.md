# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 7                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

`RuntimeSkillCreatorFacade.ts` の変更箇所（`executeAsync()` 関数と `classifyExecuteResult()` helper）のカバレッジを計測し、Branch Coverage が基準を満たすことを確認する。

> **[Feedback BEFORE-QUIT-002 / Feedback 5]**: Phase 7 では coverage の対象範囲を明示し、変更したファイル/ブロック以外を対象外として書く。広域指定ではなく変更関数の line/branch カバレッジを実測値で記録する。

## 実行タスク

- 対象範囲明示: `executeAsync()` 関数と `classifyExecuteResult()` helper のカバレッジを対象とする（全ファイル一律指定を避ける）
- カバレッジ計測: 指定ファイル・関数のみに絞ったカバレッジレポートを取得
- 基準達成確認: Line 80%+ / Branch 60%+ / Function 80%+ の基準確認
- 変更ブロック実測: `executeAsync()` 内 switch 文と `classifyExecuteResult()` の line/branch 実測値を記録

## 参照資料

| 資料名         | パス                                                                                              | 説明                     |
| -------------- | ------------------------------------------------------------------------------------------------- | ------------------------ |
| テストファイル | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` | カバレッジ計測対象テスト |
| 実装ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             | カバレッジ計測対象       |

## 実行手順

### ステップ1: カバレッジ計測（対象絞り込み）

```bash
# 変更ファイルのみを対象としたカバレッジ計測
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.include="src/main/services/runtime/RuntimeSkillCreatorFacade.ts" \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

### ステップ2: 変更ブロックの実測値記録

`executeAsync()` 関数と `classifyExecuteResult()` helper に絞ったカバレッジを記録する：

| 測定対象                  | 指標            | 実測値     | 基準     | 判定 |
| ------------------------- | --------------- | ---------- | -------- | ---- |
| executeAsync() 関数       | Line Coverage   | （実測値） | 80%+     | -    |
| executeAsync() 関数       | Branch Coverage | （実測値） | 60%+     | -    |
| `classifyExecuteResult()` | Branch Coverage | （実測値） | 100%推奨 | -    |
| `switch(outcome)`         | Branch Coverage | （実測値） | 100%推奨 | -    |
| assertNever 行            | Line Coverage   | （実測値） | -        | -    |

### ステップ3: カバレッジレポート作成

`outputs/phase-7/coverage-report.md` に以下を記録する：

- 計測対象ファイル・関数の明示
- 各指標の実測値
- 基準未達の場合は Phase 6 へ戻り追加テストを作成

```bash
# カバレッジレポートの詳細出力
pnpm --filter @repo/desktop exec vitest run \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/main/services/runtime/RuntimeSkillCreatorFacade.ts" \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## 統合テスト連携

| 判定項目                         | 基準      | 結果       |
| -------------------------------- | --------- | ---------- |
| ユニットテスト Line              | 80%+      | （実測値） |
| ユニットテスト Branch            | 60%+      | （実測値） |
| ユニットテスト Function          | 80%+      | （実測値） |
| executeAsync() Branch            | 100% 推奨 | （実測値） |
| `classifyExecuteResult()` Branch | 100% 推奨 | （実測値） |

## 成果物

| 成果物             | パス                                 | 説明                              |
| ------------------ | ------------------------------------ | --------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 変更ブロックの line/branch 実測値 |

## 完了条件

- [ ] カバレッジ計測対象が `executeAsync()` 関数に絞り込まれている（全ファイル一律指定ではない）
- [ ] Line Coverage 実測値が記録されている
- [ ] Branch Coverage 実測値が記録されている（helper と switch 文の全 case が対象）
- [ ] Function Coverage 実測値が記録されている
- [ ] 各基準（Line 80%+, Branch 60%+, Function 80%+）を達成している
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成されている
- [ ] 基準未達の場合は Phase 6 へ戻り追加テストを作成済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 7
```
