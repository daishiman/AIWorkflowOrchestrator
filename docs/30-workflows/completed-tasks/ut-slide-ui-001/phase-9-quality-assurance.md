# Phase 9: 品質保証

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 9                            |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

Lint、型チェック、全テスト実行により、リファクタリング後のコード品質が基準を満たしていることを検証する。全ての検証項目でエラーゼロを確認する。

## 実行タスク

| #   | タスク名                 | 目的                                   |
| --- | ------------------------ | -------------------------------------- |
| 1   | ESLint 実行              | コーディング規約違反の検出と修正       |
| 2   | TypeScript 型チェック    | strict モードでの型安全性検証          |
| 3   | 全テスト実行             | テスト PASS とカバレッジ基準の充足確認 |
| 4   | 修正・再検証             | 検出された問題の修正と再検証サイクル   |
| 5   | 共有パッケージビルド確認 | @repo/shared のビルド成功確認          |

- 品質保証: lint、typecheck、test、coverage、shared build の5系統をまとめて閉じる。

## 参照資料

| 資料                                                          | 用途                                   |
| ------------------------------------------------------------- | -------------------------------------- |
| `docs/30-workflows/ut-slide-ui-001/phase-5-implementation.md` | 実装差分と対象ファイルの確認           |
| `apps/desktop/src/renderer/slide/`                            | 検証対象ディレクトリ                   |
| `.claude/rules/02-code-quality.md`                            | カバレッジ基準定義                     |
| `.claude/rules/07-git-and-tooling.md`                         | コミット前チェックリスト               |
| `docs/30-workflows/ut-slide-ui-001/outputs/phase-8/`          | リファクタリング結果（Phase 8 成果物） |

## 実行手順

### Task 1: ESLint 実行

1. `pnpm --filter @repo/desktop lint` を実行する
2. error が検出された場合は修正する
3. warning が検出された場合も可能な限り修正する
4. 修正後に再度 `pnpm --filter @repo/desktop lint` を実行し、error / warning がゼロであることを確認する
5. 特に以下を重点確認する:
   - 未使用の import（`no-unused-imports`）
   - any 型の使用（`@typescript-eslint/no-explicit-any`）
   - React Hooks の依存配列（`react-hooks/exhaustive-deps`）

### Task 2: TypeScript 型チェック

1. `pnpm --filter @repo/desktop typecheck` を実行する
2. strict モードでエラーがゼロであることを確認する
3. エラーがある場合は修正する
4. 特に以下を重点確認する:
   - `as` 型アサーションの不適切な使用（P19/P49対策）
   - non-null assertion `!` の残存（P48対策）
   - `@ts-ignore` / `@ts-expect-error` の不正使用
5. 修正後に再度 `pnpm --filter @repo/desktop typecheck` を実行し、エラーゼロを確認する

### Task 3: 全テスト実行

1. `cd apps/desktop && pnpm vitest run src/renderer/slide/` で slide 関連テストを実行する
2. 全テスト PASS を確認する
3. カバレッジオプション付きで実行する: `cd apps/desktop && pnpm vitest run --coverage src/renderer/slide/`
4. カバレッジ基準を確認する:
   - Line Coverage: 80% 以上
   - Branch Coverage: 60% 以上
   - Function Coverage: 80% 以上
5. 基準未達の場合は Phase 6 に戻る判断を行う

### Task 4: 修正・再検証

1. Task 1-3 で検出された問題を修正する
2. 修正後に Task 1-3 を再実行する
3. 全ての検証項目でエラーゼロかつ基準充足を確認するまで繰り返す
4. 修正内容を記録する（quality-verification-report.md に記載）

### Task 5: 共有パッケージビルド確認

1. `pnpm --filter @repo/shared build` を実行する
2. ビルドが成功することを確認する
3. slide コンポーネントが `@repo/shared` の型を参照している場合、型整合性を確認する
4. ビルドエラーがある場合は修正する

## 統合テスト連携

- Phase 8 のリファクタリング結果が品質基準を満たしていることを本 Phase で最終確認する
- カバレッジ基準未達の場合は Phase 6（テスト拡充）に戻る
- lint / typecheck のエラーがリファクタリング起因の場合は Phase 8 の修正漏れとして対処する

## 多角的チェック観点

| 観点              | 確認内容                          | 判定基準                      |
| ----------------- | --------------------------------- | ----------------------------- |
| ESLint            | error / warning がゼロか          | `pnpm lint` でエラーゼロ      |
| TypeScript        | strict モードでエラーゼロか       | `pnpm typecheck` でエラーゼロ |
| テスト PASS       | 全テストが PASS しているか        | 失敗テストがゼロ              |
| Line Coverage     | 80% 以上か                        | 80% 以上                      |
| Branch Coverage   | 60% 以上か                        | 60% 以上                      |
| Function Coverage | 80% 以上か                        | 80% 以上                      |
| 未使用 import     | 未使用の import が残っていないか  | ESLint で検出ゼロ             |
| any 型            | any 型が使用されていないか        | ESLint で検出ゼロ             |
| 共有ビルド        | @repo/shared のビルドが成功するか | ビルドエラーゼロ              |

## 成果物

| ファイル                                         | 説明                                            |
| ------------------------------------------------ | ----------------------------------------------- |
| `outputs/phase-9/quality-verification-report.md` | 品質検証結果レポート（lint/type/test/coverage） |

## 完了条件

- [ ] Task 1: ESLint で error / warning がゼロである
- [ ] Task 2: TypeScript strict モードでエラーがゼロである
- [ ] Task 3: 全テスト PASS かつカバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）充足
- [ ] Task 4: 検出された問題が全て修正済みである
- [ ] Task 5: `pnpm --filter @repo/shared build` が成功する
- [ ] quality-verification-report.md が作成されている

## サブタスク管理

- [ ] Task 1: ESLint 実行
- [ ] Task 2: TypeScript 型チェック
- [ ] Task 3: 全テスト実行
- [ ] Task 4: 修正・再検証
- [ ] Task 5: 共有パッケージビルド確認

## タスク100%実行確認

- [ ] 全 Task が完了している
- [ ] 完了条件が全てチェック済みである
- [ ] 成果物が全て生成されている
- [ ] lint / typecheck / test の全てでエラーゼロが確認されている
- [ ] カバレッジ基準が充足されている

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）に進む。
