# Phase 7: カバレッジ確認 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                    |
| --------- | --------------------- |
| Phase番号 | 7                     |
| 機能名    | schema-extension      |
| タスクID  | TASK-LLM-MOD-05       |
| 作成日    | 2026-03-23            |
| 依存Phase | Phase 6（テスト拡充） |

## 目的

Phase 5 の実装と Phase 6 のテスト拡充を受け、変更対象ファイルのカバレッジが基準を満たしているかを数値で確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

### Task 7-1: カバレッジ計測

以下のコマンドを実行し、カバレッジレポートを確認する:

```bash
# packages/shared のスキーマテスト
pnpm --filter @repo/shared exec vitest run --coverage --reporter=verbose \
  src/types/llm/schemas/__tests__/provider.test.ts

# apps/desktop のハンドラーテスト
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=verbose \
  src/main/handlers/__tests__/llm.test.ts
```

### Task 7-2: カバレッジ基準との照合

| メトリクス        | 最低基準 | 推奨基準 | 対象ファイル                                     |
| ----------------- | -------- | -------- | ------------------------------------------------ |
| Line Coverage     | 80%      | 90%      | `provider.ts`、`llm.ts` の変更箇所               |
| Branch Coverage   | 60%      | 70%      | `LLMModelSchema` の optional 分岐                |
| Function Coverage | 80%      | 90%      | `handleGetProviders()`、`LLMModelSchema.parse()` |

**変更箇所の絞り込み:**

- `provider.ts`: `LLMModelSchema` の `description` フィールド（L35）— スキーマ変更なしのため既存カバレッジが維持される
- `llm.ts`: `PROVIDER_CONFIGS` 型定義と各モデルエントリ — 型定義は実行時コードではないため Line Coverage への影響は最小

### Task 7-3: カバレッジ結果の評価

| 判定 | 条件                               | 対応                         |
| ---- | ---------------------------------- | ---------------------------- |
| PASS | 全メトリクスが最低基準を満たす     | Phase 8 へ移行               |
| 未達 | いずれかのメトリクスが最低基準未満 | Phase 6 に戻り追加テスト実装 |

**本タスクに関する注記:**

- `PROVIDER_CONFIGS` の変更は型定義と値の追加のみであり、`handleGetProviders()` の実行パス変更はない
- Phase 4 の既存テストで `handleGetProviders()` がカバーされていれば、追加変更後もカバレッジは維持される
- スキーマ変更なし（`LLMModelSchema` 既存）のため `provider.ts` のカバレッジは変動しない

## 参照資料

| 資料                                                               | 用途               |
| ------------------------------------------------------------------ | ------------------ |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts` | カバレッジ計測対象 |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`             | カバレッジ計測対象 |
| `.claude/rules/02-code-quality.md`（カバレッジ基準）               | 判定基準の参照     |

## 成果物

| 成果物             | パス                                | 備考                           |
| ------------------ | ----------------------------------- | ------------------------------ |
| カバレッジレポート | 本ファイル内（Task 7-2 の結果記録） | vitest --coverage の出力を転記 |

## 統合テスト連携

カバレッジ基準をPASSした後、Phase 8（リファクタリング）でコード品質を改善する。リファクタリングによりカバレッジが低下しないことを Phase 9 で再確認する。

## 完了条件

- [ ] `vitest run --coverage` を実行してレポートを確認した
- [ ] 変更対象ファイルの Line / Branch / Function Coverage が最低基準を満たしていることを確認した
- [ ] 未達の場合は Phase 6 に戻る判断を記録した
- [ ] PASS の場合は数値を本ファイルの成果物欄に記録した

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)（カバレッジ基準PASS後）
[Phase 6: テスト拡充](./phase-6-test-expansion.md)（カバレッジ基準未達の場合）
