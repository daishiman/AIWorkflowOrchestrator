# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目     | 値                                        |
| -------- | ----------------------------------------- |
| Phase    | 8                                         |
| タスクID | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名 | SkillExecutor内の重複型定義を共有型に統一 |
| 機能名   | skillexecutor-type-cleanup                |
| 分類     | リファクタリング                          |
| 作成日   | 2026-02-07                                |

## 目的

SkillExecutor.ts 内のローカル型定義6つを削除し、@repo/shared の共有型に統一することで、動作を変えずにコード品質を改善する。

## 実行タスク

- ローカル型定義の削除: SkillExecutor.ts 内の重複する6つのローカル型定義を削除
- 共有型への参照更新: @repo/shared からの import 文を追加・更新
- 型互換性確認: 既存コードが共有型と互換性を保っていることを確認
- コードスメル検出: 型アサーション（`as any`, `as unknown`）の不要な増加がないことを確認

## 参照資料

| 資料名             | パス                                            | 説明                 |
| ------------------ | ----------------------------------------------- | -------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`    | Phase 1成果物        |
| 設計書             | `outputs/phase-2/architecture-design.md`        | Phase 2成果物        |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`       | Phase 3成果物        |
| テスト仕様書       | `outputs/phase-4/test-specification.md`         | Phase 4成果物        |
| 実装完了コード     | `outputs/phase-5/implementation-complete.md`    | Phase 5成果物        |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`            | Phase 7成果物        |
| 共有型定義         | `packages/shared/src/types/`                    | 統一先の共有型       |
| SkillExecutor実装  | `apps/desktop/src/main/skills/SkillExecutor.ts` | リファクタリング対象 |

## 実行手順

### ステップ1: 現状の型使用状況確認

リファクタリング前の型使用状況を確認する。

```bash
# SkillExecutor.ts 内のローカル型定義を確認
grep -n "^type\|^interface\|^export type\|^export interface" apps/desktop/src/main/skills/SkillExecutor.ts

# 共有型の定義を確認
ls packages/shared/src/types/
```

### ステップ2: ローカル型定義の削除

以下の6つのローカル型定義を削除対象として特定し、削除する:

1. 各ローカル型定義を特定
2. 対応する共有型が `@repo/shared` に存在することを確認
3. ローカル型定義を削除
4. `import` 文を共有型に更新

### ステップ3: 型互換性の確認

```bash
# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# 型アサーションの増加がないことを確認
git diff --stat | grep "as any\|as unknown" | wc -l
```

### ステップ4: コード品質確認

```bash
# ESLint実行
pnpm --filter @repo/desktop lint

# Prettier実行
pnpm --filter @repo/desktop format:check
```

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm --filter @repo/desktop test
pnpm --filter @repo/desktop test:integration
```

## 品質基準（本タスク固有）

| 項目       | 基準                              | 確認方法                         |
| ---------- | --------------------------------- | -------------------------------- |
| 型安全性   | `as any`, `as unknown` の増加なし | `git diff` で差分確認            |
| コード品質 | ESLint/Prettier 通過              | `pnpm lint && pnpm format:check` |
| テスト成功 | 全テスト PASS                     | `pnpm test`                      |
| 動作互換性 | 既存機能に影響なし                | 手動テスト / E2Eテスト           |

## SOLID原則適用チェックリスト

- [ ] 単一責務原則（SRP）: 型定義が適切なモジュールに配置されている
- [ ] 開放閉鎖原則（OCP）: 型拡張が容易な設計になっている
- [ ] リスコフの置換原則（LSP）: 共有型が期待どおりに動作する
- [ ] インターフェース分離原則（ISP）: 必要最小限の型のみ import している
- [ ] 依存性逆転原則（DIP）: 具象型ではなく抽象型に依存している

## 成果物

| 成果物               | パス                                     | 説明                      |
| -------------------- | ---------------------------------------- | ------------------------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`     | 変更内容の記録            |
| 型変更差分           | `outputs/phase-8/type-migration-diff.md` | ローカル→共有型の変更差分 |
| テスト実行結果       | `outputs/phase-8/test-results.md`        | リファクタ後のテスト結果  |

## 完了条件

- [ ] SkillExecutor.ts 内の6つのローカル型定義が削除されている
- [ ] @repo/shared からの import に置き換わっている
- [ ] `as any`, `as unknown` の型アサーションが増加していない
- [ ] TypeScript型チェックが通過している
- [ ] ESLint/Prettierが通過している
- [ ] 全ユニットテストが成功している
- [ ] 統合テストが継続成功している
- [ ] 動作に変更がないことが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
# - [ ] カバレッジが維持されていることを確認
```

## サブタスク管理

Phase実行開始時に、以下のサブタスクを順次実行すること:

1. 参照資料の確認
2. ローカル型定義の特定と削除
3. 共有型への import 更新
4. 型チェック・Lint実行
5. テスト実行と結果確認
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに完了を記録すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-FIX-1-2-skillexecutor-type-cleanup --phase 8
```

## 次のPhase

Phase 9: 品質保証
