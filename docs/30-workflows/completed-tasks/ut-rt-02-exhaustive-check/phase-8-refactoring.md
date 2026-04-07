# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 8                         |
| 機能名 | ut-rt-02-exhaustive-check |
| 作成日 | 2026-04-07                |

## 目的

動作を変えずにコード品質を改善する。switch 化に伴うコードスメルを除去し、プロジェクト慣習に沿った実装に整える。

> **[Feedback RT-03]**: 変更内容を `対象/Before/After/理由` テーブル形式で記録する。

## 実行タスク

- コードスメル検出: switch 化後のコードで重複・不整合を確認
- 命名改善: 変数名・コメントがプロジェクト慣習に従っているか確認
- helper配置: assertNever が module-local helper として閉じているか確認
- Before/After記録: 変更内容をテーブル形式で記録

## 参照資料

| 資料名         | パス                                                                  | 説明                 |
| -------------- | --------------------------------------------------------------------- | -------------------- |
| 実装ファイル   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | リファクタリング対象 |
| Phase 2 設計書 | `outputs/phase-2/design.md`                                           | 設計意図の確認       |

## 実行手順

### ステップ1: コードスメル検出

```bash
# ESLint でコードスメルを検出
pnpm --filter @repo/desktop lint src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 型チェック
pnpm --filter @repo/desktop typecheck
```

確認項目：

- 不要な型アサーション（`as`）がないか
- 冗長な条件式がないか
- `assertNever` が module-local helper として閉じているか

### ステップ2: 変更内容の Before/After 記録

`outputs/phase-8/refactoring-record.md` に以下の形式で記録する：

| 対象                         | Before                         | After                                                   | 理由                               |
| ---------------------------- | ------------------------------ | ------------------------------------------------------- | ---------------------------------- |
| executeAsync() 分岐          | `if (!result.success) { ... }` | `classifyExecuteResult() + switch(outcome)`             | raw union と処理分岐の責務分離     |
| assertNever 配置             | （新規）                       | `RuntimeSkillCreatorFacade.ts` 内の module-local helper | 共有ユーティリティを増やさず局所化 |
| （その他の変更があれば追記） | -                              | -                                                       | -                                  |

### ステップ3: テスト継続成功確認

```bash
# リファクタリング後も全テストが PASS することを確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## 統合テスト連携

```bash
# リファクタリング後の型チェック・lint・テスト実行
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
```

## 成果物

| 成果物               | パス                                    | 説明                      |
| -------------------- | --------------------------------------- | ------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | Before/After/理由テーブル |

## 完了条件

- [ ] ESLint エラー 0 件（対象ファイル）
- [ ] TypeScript 型チェックエラー 0 件
- [ ] 全テストが継続 PASS
- [ ] 変更内容が `対象/Before/After/理由` テーブル形式で記録されている
- [ ] `assertNever` が module-local helper として最適化されている（重複 import なし）
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ut-rt-02-exhaustive-check --phase 8
```
