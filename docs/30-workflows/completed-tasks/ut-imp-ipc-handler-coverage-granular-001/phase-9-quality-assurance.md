# Phase 9: 品質保証 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 9（品質保証）                            |
| 機能名   | IPCハンドラ単位カバレッジ測定基盤構築    |
| タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
| 作成日   | 2026-02-28                               |
| Issue    | #854                                     |

## 目的

Phase 8（リファクタリング）完了後のコードが、定義された全ての品質基準を満たすことを体系的に検証する。Lint・型チェック・テスト成功・カバレッジ基準・既存テスト回帰なしの5つの品質ゲートを全て通過させる。

## 背景

Phase 5-7 で機能実装とカバレッジ基準を達成し、Phase 8 でコード品質を改善した。本Phaseでは最終レビュー（Phase 10）に進む前に、プロジェクト標準の全品質基準を体系的に確認する。個別のPhaseで確認した品質指標を統合的に再検証し、Phase 8 のリファクタリングで回帰が発生していないことを保証する。

## 実行タスク

### タスク1: Lintチェック

- **目的**: コードスタイルと潜在的問題の検出
- **実行手順**:
  1. プロダクションコードの Lint 実行:
     ```bash
     cd apps/desktop && pnpm lint
     ```
  2. Lint エラーがある場合は修正（ESLint の自動修正可能なものは `--fix` で対応）
  3. 修正後に再度 Lint を実行してクリアを確認
- **期待される成果物**: Lint クリアの確認結果

### タスク2: 型チェック

- **目的**: TypeScript strict モードでの型安全性を検証する
- **実行手順**:
  1. 型チェックの実行:
     ```bash
     pnpm typecheck
     ```
  2. 確認事項:
     - `any` 型が使用されていないこと
     - `@ts-ignore` / `@ts-expect-error` が使用されていないこと
     - 型アサーション（`as`）がバリデーション目的以外で使用されていないこと
  3. 型エラーがある場合は修正し、再実行してクリアを確認
- **期待される成果物**: TypeCheck クリアの確認結果

### タスク3: 全テスト実行

- **目的**: 新規テストと既存テストの全てが成功することを確認する
- **実行手順**:
  1. 集計スクリプトのテスト実行:
     ```bash
     cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts
     ```
  2. 既存IPCハンドラテストの回帰確認:
     ```bash
     cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
     ```
  3. テスト失敗がある場合は原因を特定し修正
  4. 全テストPASSを確認
- **期待される成果物**: テスト実行結果（全PASS）

### タスク4: カバレッジ基準確認

- **目的**: カバレッジがプロジェクト基準を満たすことを確認する
- **実行手順**:
  1. カバレッジ付きテスト実行:
     ```bash
     cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'
     ```
  2. 以下の基準を満たすことを確認:

     | 指標              | 最低基準 | 推奨基準 |
     | ----------------- | -------- | -------- |
     | Line Coverage     | 80%      | 90%      |
     | Branch Coverage   | 60%      | 70%      |
     | Function Coverage | 80%      | 90%      |

  3. 基準未達の場合はPhase 6に戻り、テストを追加

- **期待される成果物**: カバレッジレポート

### タスク5: 品質サマリーレポート作成

- **目的**: 全品質ゲートの結果を1つのレポートに統合する
- **実行手順**:
  1. 以下のテンプレートで品質レポートを作成:

     ```markdown
     # 品質保証レポート

     ## メタ情報

     | 項目     | 内容                                     |
     | -------- | ---------------------------------------- |
     | タスクID | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001 |
     | 検証日   | YYYY-MM-DD                               |

     ## 品質ゲート結果

     | #   | 品質ゲート        | 結果      | 備考 |
     | --- | ----------------- | --------- | ---- |
     | 1   | Lint              | PASS/FAIL |      |
     | 2   | TypeCheck         | PASS/FAIL |      |
     | 3   | 新規テスト        | PASS/FAIL |      |
     | 4   | 既存テスト回帰    | PASS/FAIL |      |
     | 5   | Line Coverage     | XX%       |      |
     | 6   | Branch Coverage   | XX%       |      |
     | 7   | Function Coverage | XX%       |      |

     ## 総合判定

     **結果**: PASS / FAIL（理由: ）
     ```

  2. 全ゲートがPASSであることを確認
  3. FAILがある場合は原因を記載し、該当Phaseに戻る

- **期待される成果物**: `outputs/phase-9/quality-report.md`

## 参照資料

| 参照資料                   | パス                                                                        | 内容                       |
| -------------------------- | --------------------------------------------------------------------------- | -------------------------- |
| Phase 5 実装仕様           | `phase-5-implementation.md`                                                 | 実装タスク・完了条件の基準 |
| Phase 7 成果物             | `outputs/phase-7/coverage-report.md`                                        | カバレッジ達成状況         |
| Phase 8 成果物             | `outputs/phase-8/refactoring-log.md`                                        | リファクタリング内容       |
| リファクタリング済みコード | `apps/desktop/scripts/coverage-by-handler.ts`                               | 検証対象コード             |
| リファクタリング済みテスト | `apps/desktop/scripts/coverage-by-handler.test.ts`                          | 検証対象テスト             |
| 品質ルール                 | `.claude/rules/02-code-quality.md`                                          | コード品質基準             |
| カバレッジ基準             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | カバレッジ閾値の定義       |
| 既存テスト                 | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                 | 回帰確認対象               |

## 統合テスト連携

### 品質ゲート実行順序

品質ゲートは以下の順序で実行する。前段のゲートが FAIL の場合、修正後に再度同じゲートから実行する。

```
Lint → TypeCheck → テスト実行 → カバレッジ確認 → レポート作成
```

### 品質項目確認テーブル

| 確認事項                                 | 実行コマンド                                                                                                                            | 期待結果        |
| ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| ESLint エラー・警告なし                  | `cd apps/desktop && pnpm lint`                                                                                                          | exit code 0     |
| TypeScript コンパイルエラーなし          | `pnpm typecheck`                                                                                                                        | exit code 0     |
| 集計スクリプトテスト全PASS               | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts`                                                                | 全テストPASS    |
| 既存ハンドラテスト回帰なし               | `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts`                                                       | 全テストPASS    |
| Line Coverage 80%以上                    | `cd apps/desktop && pnpm vitest run scripts/coverage-by-handler.test.ts --coverage --coverage.include='scripts/coverage-by-handler.ts'` | Lines ≥ 80%     |
| Branch Coverage 60%以上                  | 同上                                                                                                                                    | Branches ≥ 60%  |
| Function Coverage 80%以上                | 同上                                                                                                                                    | Functions ≥ 80% |
| `any` 型不使用                           | `grep -rn "any" apps/desktop/scripts/coverage-by-handler.ts`                                                                            | 該当なし        |
| `@ts-ignore` / `@ts-expect-error` 不使用 | `grep -rn "ts-ignore\|ts-expect-error" apps/desktop/scripts/coverage-by-handler.ts`                                                     | 該当なし        |

## 多角的チェック観点

| 観点                 | チェック項目                                                                            |
| -------------------- | --------------------------------------------------------------------------------------- |
| 品質基準の網羅性     | 全5つの品質ゲート（Lint、型チェック、テスト、回帰、カバレッジ）を漏れなく確認しているか |
| 既存テストへの影響   | Phase 8のリファクタリングが既存のskillHandlers.test.tsに回帰を起こしていないか          |
| カバレッジの維持     | Phase 7で達成したカバレッジがPhase 8のリファクタリング後も維持されているか              |
| P40対策確認          | テスト実行コマンドが `cd apps/desktop` でパッケージディレクトリから実行されているか     |
| コーディング規約準拠 | boolean変数の `is`/`has` プレフィックス、未使用importの排除を確認しているか             |

## 成果物

| 成果物       | パス                                | 説明                         |
| ------------ | ----------------------------------- | ---------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全品質ゲートの結果と総合判定 |

## 完了条件

- [ ] `pnpm lint` が PASS している
- [ ] `pnpm typecheck` が PASS している
- [ ] `coverage-by-handler.test.ts` の全テストが PASS している
- [ ] `skillHandlers.test.ts` の全テストが PASS している（回帰なし）
- [ ] Line Coverage が 80% 以上を達成している
- [ ] Branch Coverage が 60% 以上を達成している
- [ ] Function Coverage が 80% 以上を達成している
- [ ] `any` 型が使用されていない
- [ ] `@ts-ignore` / `@ts-expect-error` が使用されていない
- [ ] 品質レポート（`quality-report.md`）が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

→ [Phase 10: 最終レビューゲート](./phase-10-final-review.md)
