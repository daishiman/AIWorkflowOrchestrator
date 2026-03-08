# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 7                         |
| タスクID | TASK-10A-F                |
| 機能名   | store-driven-lifecycle-ui |
| 作成日   | 2026-03-08                |

## 目的

Phase 4-6 で作成・拡充したテストのカバレッジを測定し、品質要件の基準を満たしているか判定する。未達の場合は Phase 6 へ差し戻す。

## 実行タスク

- カバレッジ測定の実行: 対象ファイルの v8 カバレッジを計測する
- 対象ファイルごとのカバレッジ結果記録: Line / Branch / Function の実測値を記録する
- 基準値との照合と判定: PASS / NEAR / FAIL を決定する
- 未達の場合の差し戻し整理: 不足箇所を特定し、Phase 6 へ戻す条件を明文化する

## 参照資料

| 資料名             | パス                                                                                    | 説明                 |
| ------------------ | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md` | テスト拡充結果       |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`             | カバレッジ基準値     |
| 既知の落とし穴     | `.claude/rules/06-known-pitfalls.md`                                                    | P41（v8 カバレッジ） |

### 前 Phase 成果物

| 資料名         | パス                                                                                    | 用途                 |
| -------------- | --------------------------------------------------------------------------------------- | -------------------- |
| Phase 4 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-4-test-creation.md`  | テスト設計を参照     |
| Phase 5 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-5-implementation.md` | 実装結果を参照       |
| Phase 6 成果物 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md` | テスト拡充結果を参照 |

## 実行手順

### ステップ 1: カバレッジ測定の実行

以下のコマンドでカバレッジを測定する:

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/__tests__/ src/renderer/components/skill/hooks/
```

**P41 注意**: Vitest の v8 カバレッジプロバイダは、インライン arrow function を独立した関数としてカウントする。カバレッジが低く見える場合は、インラインコールバックの実行テストを追加する。

### ステップ 2: 対象ファイルごとのカバレッジ記録

以下のテーブルに測定結果を記録する:

#### SkillCreateWizard.tsx

| 指標              | 最低基準 | 推奨基準 | 実測値  | 判定      |
| ----------------- | -------- | -------- | ------- | --------- |
| Line Coverage     | 80%      | 90%      | \_\_\_% | PASS/FAIL |
| Branch Coverage   | 60%      | 70%      | \_\_\_% | PASS/FAIL |
| Function Coverage | 80%      | 90%      | \_\_\_% | PASS/FAIL |

#### SkillAnalysisView.tsx

| 指標              | 最低基準 | 推奨基準 | 実測値  | 判定      |
| ----------------- | -------- | -------- | ------- | --------- |
| Line Coverage     | 80%      | 90%      | \_\_\_% | PASS/FAIL |
| Branch Coverage   | 60%      | 70%      | \_\_\_% | PASS/FAIL |
| Function Coverage | 80%      | 90%      | \_\_\_% | PASS/FAIL |

#### hooks/useSkillAnalysis.ts

| 指標              | 最低基準 | 推奨基準 | 実測値  | 判定      |
| ----------------- | -------- | -------- | ------- | --------- |
| Line Coverage     | 80%      | 90%      | \_\_\_% | PASS/FAIL |
| Branch Coverage   | 60%      | 70%      | \_\_\_% | PASS/FAIL |
| Function Coverage | 80%      | 90%      | \_\_\_% | PASS/FAIL |

#### SkillManagementPanel.tsx

| 指標              | 最低基準 | 推奨基準 | 実測値  | 判定      |
| ----------------- | -------- | -------- | ------- | --------- |
| Line Coverage     | 80%      | 90%      | \_\_\_% | PASS/FAIL |
| Branch Coverage   | 60%      | 70%      | \_\_\_% | PASS/FAIL |
| Function Coverage | 80%      | 90%      | \_\_\_% | PASS/FAIL |

### ステップ 3: 総合カバレッジ判定

#### 判定基準

| 判定 | 条件                                                        | 次アクション           |
| ---- | ----------------------------------------------------------- | ---------------------- |
| PASS | 全ファイルで Line >= 80%, Branch >= 60%, Function >= 80%    | Phase 8 へ             |
| NEAR | 1 ファイルのみ 1 指標が基準の 5% 以内で未達                 | Phase 6 へ（限定追加） |
| FAIL | 2 ファイル以上で基準未達、または 1 指標が基準の 5% 超で未達 | Phase 6 へ（全面追加） |

#### 総合判定結果

| 項目           | 結果（記入）   |
| -------------- | -------------- |
| 総合判定       | PASS/NEAR/FAIL |
| 未達ファイル数 | \_\_\_         |
| 未達指標       | \_\_\_         |

### ステップ 4: 未達の場合の差し戻し

#### 4-A: 未カバー箇所の特定

カバレッジレポートの HTML 出力を確認し、未カバー行・ブランチを特定する:

```bash
cd apps/desktop && pnpm vitest run --coverage --reporter=html src/renderer/components/skill/__tests__/
```

#### 4-B: 追加テスト案の作成

以下のテーブルに未カバー箇所と必要なテスト案を記録する:

| 未カバーファイル | 未カバー行/ブランチ | 追加テスト案         |
| ---------------- | ------------------- | -------------------- |
| （記入）         | L** - L**           | （テスト内容を記入） |

#### 4-C: Phase 6 への差し戻し

未達の場合、Phase 6 のステップ 7 に戻り、上記テーブルの追加テスト案を実装する。差し戻し後、再度 Phase 7 を実行する。

**差し戻し上限**: 3 回まで。3 回差し戻し後もカバレッジ基準未達の場合、未達理由を記録して Phase 8 に進む。

### ステップ 5: テスト件数の最終カウント

以下のコマンドでテスト件数を正確にカウントする:

```bash
cd apps/desktop && grep -c "it(" src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx src/renderer/components/skill/__tests__/SkillAnalysisView.store-integration.test.tsx src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx
```

**P37 対策**: Phase 4 で想定したテスト数ではなく、実際の `grep -c "it("` の結果を記録する。

| テストファイル                               | テスト件数（記入） |
| -------------------------------------------- | ------------------ |
| SkillCreateWizard.test.tsx                   | \_\_\_             |
| SkillCreateWizard.store-integration.test.tsx | \_\_\_             |
| SkillAnalysisView.test.tsx                   | \_\_\_             |
| SkillAnalysisView.store-integration.test.tsx | \_\_\_             |
| useSkillAnalysis.test.ts                     | \_\_\_             |
| SkillManagementPanel.integration.test.tsx    | \_\_\_             |
| **合計**                                     | **\_\_\_**         |

## 統合テスト連携

Phase 7 完了時点で、TASK-10A-G への引き渡し準備が完了する:

| 引き渡し項目            | 状態        | 検証テスト                   |
| ----------------------- | ----------- | ---------------------------- |
| Store action 経由の統一 | Phase 5完了 | TC-CW-01〜02, TC-AV-01〜06   |
| 状態遷移の網羅          | Phase 6完了 | TC-AV-07〜08, TC-CW-S01〜S03 |
| 回帰テスト観点          | Phase 6完了 | TC-RT-01〜05                 |
| カバレッジ基準達成      | Phase 7完了 | ステップ 2 の各テーブル      |

## 多角的チェック観点

| 観点              | 確認事項                                                            |
| ----------------- | ------------------------------------------------------------------- |
| Line Coverage     | 全対象ファイルで 80% 以上                                           |
| Branch Coverage   | 全対象ファイルで 60% 以上                                           |
| Function Coverage | 全対象ファイルで 80% 以上                                           |
| P41 対策          | インライン arrow function のカバレッジを確認                        |
| P37 対策          | テスト件数を `grep -c "it("` で実測（Phase 4 想定値を使い回さない） |
| テスト全 PASS     | `pnpm vitest run` で全テストが PASS                                 |
| 差し戻し上限      | 差し戻しが 3 回以内                                                 |

## 成果物

| 成果物                     | パス                                        | 説明                         |
| -------------------------- | ------------------------------------------- | ---------------------------- |
| カバレッジレポート（HTML） | `apps/desktop/coverage/` 配下               | v8 カバレッジプロバイダ出力  |
| カバレッジ結果記録         | 本仕様書ステップ 2 のテーブル（実測値記入） | ファイルごとのカバレッジ実績 |
| テスト件数記録             | 本仕様書ステップ 5 のテーブル（実測値記入） | 実際のテスト件数             |

## 完了条件

- [ ] カバレッジ測定が実行されている
- [ ] 全対象ファイルで Line Coverage >= 80%（推奨 90%）
- [ ] 全対象ファイルで Branch Coverage >= 60%（推奨 70%）
- [ ] 全対象ファイルで Function Coverage >= 80%（推奨 90%）
- [ ] カバレッジ結果がステップ 2 のテーブルに記入されている
- [ ] テスト件数がステップ 5 のテーブルに `grep -c "it("` で実測した値で記入されている
- [ ] 総合判定が PASS（または差し戻し 3 回後の NEAR/FAIL で理由記録済み）
- [ ] 全テストが PASS している（`pnpm vitest run` 実行結果で確認）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS

## 次の Phase

Phase 8: リファクタリング（`docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-8-refactoring.md`）

**カバレッジ未達の場合**: Phase 6 へ差し戻し（`docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-6-test-expansion.md` ステップ 7）
