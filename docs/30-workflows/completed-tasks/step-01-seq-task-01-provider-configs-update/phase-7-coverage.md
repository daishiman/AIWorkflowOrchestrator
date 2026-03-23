# Phase 7: カバレッジ確認 — PROVIDER_CONFIGS モデル定義 + inferProviderId 更新

## メタ情報

| 項目       | 値                      |
| ---------- | ----------------------- |
| Phase番号  | 7                       |
| 機能名     | provider-configs-update |
| タスクID   | TASK-LLM-MOD-01         |
| 作成日     | 2026-03-23              |
| 依存 Phase | Phase 6（テスト拡充）   |

## 目的

Phase 6 で拡充したテストにより、`apps/desktop/src/main/handlers/llm.ts` のカバレッジが基準値（Line: 80%、Branch: 60%、Function: 80%）を達成していることを公式に確認する。未達の場合は Phase 6 に戻る。

## 実行タスク

### Task 7-1: カバレッジ計測実行

以下のコマンドを実行し、カバレッジレポートを取得する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts --coverage --reporter=verbose
```

### Task 7-2: カバレッジ数値の記録

計測結果から `llm.ts` のカバレッジ数値を記録する。

| 指標              | 基準値 | 実測値           | 判定      |
| ----------------- | ------ | ---------------- | --------- |
| Line Coverage     | ≥ 80%  | （実測値を記録） | PASS/FAIL |
| Branch Coverage   | ≥ 60%  | （実測値を記録） | PASS/FAIL |
| Function Coverage | ≥ 80%  | （実測値を記録） | PASS/FAIL |

### Task 7-3: 未カバー箇所の確認

カバレッジレポートで未カバーの行・分岐を確認し、以下の観点で評価する：

- `PROVIDER_CONFIGS` データ定義部分: テスト T-01〜T-06, T-09〜T-13 でカバー済みか
- `inferProviderId` の全パターン（gpt-, o3, o4, claude-, gemini-, grok-, `/`を含む）: テスト T-07〜T-08 でカバー済みか
- `handleGetProviders` の API キー有無による `isAvailable` 分岐: 既存テストでカバー済みか

### Task 7-4: 判定とフロー制御

**全指標 PASS の場合**: Phase 8 に進む

**いずれかの指標 FAIL の場合**:

1. 未カバー箇所を特定する（Task 7-3 の結果を使用）
2. Phase 6 に戻り、追加テストケースを設計・実装する
3. Phase 7 を再実行する

**最大反復回数**: 3回。3回反復しても基準未達の場合は Phase 2 に戻り、テスト戦略を見直す。

### Task 7-5: 全テスト PASS 確認

カバレッジ確認と並行して、テスト全数の PASS を確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
```

期待する結果: 全テスト PASS（FAIL が 0 件）

## 参照資料

| 資料名             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/phase-6-test-expansion.md` |
| コード品質ルール   | `.claude/rules/02-code-quality.md`（カバレッジ基準）                                      |

## 成果物

| 成果物             | パス                                                                                               | 形式     |
| ------------------ | -------------------------------------------------------------------------------------------------- | -------- |
| カバレッジ確認記録 | `docs/30-workflows/step-01-seq-task-01-provider-configs-update/outputs/phase-7/coverage-report.md` | Markdown |

## 完了条件

- [ ] `pnpm vitest run --coverage` を実行し、カバレッジレポートを取得した
- [ ] `llm.ts` の Line Coverage が 80% 以上である
- [ ] `llm.ts` の Branch Coverage が 60% 以上である
- [ ] `llm.ts` の Function Coverage が 80% 以上である
- [ ] 全テスト PASS（FAIL が 0 件）を確認した
- [ ] カバレッジ未達の場合は Phase 6 に戻りテストを追加した

## 統合テスト連携

Phase 7 では以下の統合テストを実施し、handlers ディレクトリ全体のテストが影響を受けていないことを確認する：

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/
```

期待する結果: 全テスト PASS（既存テストを含む）

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                       | 仕様参照先                                   |
| -------------- | ------------------------------ | -------------------------------------------- |
| アーキテクチャ | Main Process のデータ定義変更  | `aiworkflow-requirements: architecture-*.md` |
| API設計        | IPC レスポンス形式への影響確認 | `aiworkflow-requirements: api-*.md`          |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次の Phase

カバレッジ基準達成の場合: Phase 8（`phase-8-refactoring.md`）
カバレッジ基準未達の場合: Phase 6 に戻る
