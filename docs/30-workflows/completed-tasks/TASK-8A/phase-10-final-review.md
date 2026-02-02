# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 10                 |
| Phase名    | 最終レビューゲート |
| 前提Phase  | Phase 9            |
| 後続Phase  | Phase 11           |
| ステータス | 未実施             |
| 作成日     | 2026-02-01         |
| 機能名     | TASK-8A 単体テスト |

## 目的

全Phaseの成果物を総合的に検証し、Phase 11（手動テスト）への進行可否を判定する。

## 背景

最終レビューゲートでは、受け入れ基準（Phase 1で定義）をすべて満たしていること、品質基準への準拠、テストの完全性を包括的に検証する。

## 実行タスク

### Task 1: 受け入れ基準の総合検証

**目的**: Phase 1で定義した受け入れ基準がすべて達成されていることを確認する。

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を読み込む
2. 以下の基準を1つずつ検証する：

| 受け入れ基準              | 検証方法                                       | 結果 |
| ------------------------- | ---------------------------------------------- | ---- |
| 44テストケース実装        | `vitest run --reporter=verbose` の出力カウント | ?    |
| 全テスト通過（0件失敗）   | テスト実行結果の `FAIL` 件数                   | ?    |
| Line Coverage 80%以上     | `outputs/phase-7/coverage-report.md` の値      | ?    |
| Branch Coverage 60%以上   | `outputs/phase-7/coverage-report.md` の値      | ?    |
| Function Coverage 80%以上 | `outputs/phase-7/coverage-report.md` の値      | ?    |
| テスト実行時間10秒以内    | `outputs/phase-9/quality-report.md` の値       | ?    |
| `any` 型不使用            | `outputs/phase-9/quality-report.md` の結果     | ?    |
| 既存テスト互換性          | 全テスト実行時に既存テスト失敗がないこと       | ?    |

3. 結果を `outputs/phase-10/final-review-result.md` に出力する

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

### Task 2: 成果物整合性検証

**目的**: 全Phaseの成果物が正しく生成・更新されていることを確認する。

**実行手順**:

1. `artifacts.json` を読み込み、各Phaseの成果物リストを確認する
2. 以下のファイルが存在することを確認する：

| Phase | 成果物                                      | 存在確認 |
| ----- | ------------------------------------------- | -------- |
| 1     | `outputs/phase-1/existing-test-audit.md`    | ?        |
| 1     | `outputs/phase-1/gap-analysis.md`           | ?        |
| 1     | `outputs/phase-1/acceptance-criteria.md`    | ?        |
| 1     | `outputs/phase-1/module-analysis.md`        | ?        |
| 2     | `outputs/phase-2/test-design.md`            | ?        |
| 2     | `outputs/phase-2/mock-strategy.md`          | ?        |
| 2     | `outputs/phase-2/fixture-design.md`         | ?        |
| 2     | `outputs/phase-2/test-helper-design.md`     | ?        |
| 3     | `outputs/phase-3/design-review-result.md`   | ?        |
| 4     | `outputs/phase-4/test-specification.md`     | ?        |
| 5     | `outputs/phase-5/implementation-summary.md` | ?        |
| 6     | `outputs/phase-6/preliminary-coverage.md`   | ?        |
| 6     | `outputs/phase-6/coverage-report.md`        | ?        |
| 7     | `outputs/phase-7/coverage-report.md`        | ?        |
| 8     | `outputs/phase-8/refactoring-log.md`        | ?        |
| 9     | `outputs/phase-9/quality-report.md`         | ?        |

3. テストコード成果物が存在することを確認する：

| テストファイル                                                              | 存在確認 |
| --------------------------------------------------------------------------- | -------- |
| `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`       | ?        |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | ?        |
| `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts`      | ?        |
| `apps/desktop/src/main/services/skill/__tests__/PermissionResolver.test.ts` | ?        |
| `apps/desktop/src/renderer/store/slices/__tests__/skillSlice.test.ts`       | ?        |

4. 結果を `outputs/phase-10/final-review-result.md` に追記する

### Task 3: レビュー判定

**目的**: 最終レビュー結果に基づきPASS/MINOR/MAJOR/CRITICALの判定を行う。

**実行手順**:

1. Task 1, Task 2の結果を集約する
2. 以下の基準で判定する：

| 判定     | 条件                               | アクション           |
| -------- | ---------------------------------- | -------------------- |
| PASS     | 全受け入れ基準達成・全成果物存在   | Phase 11へ進行       |
| MINOR    | 軽微な品質問題のみ（Lint警告等）   | 修正後Phase 11へ進行 |
| MAJOR    | カバレッジ未達またはテスト失敗あり | 該当Phaseへ差し戻し  |
| CRITICAL | 根本的な設計問題                   | Phase 1へ差し戻し    |

3. 判定結果と差し戻し先（該当する場合）を `outputs/phase-10/final-review-result.md` に記載する

## 参照資料

| 参照資料             | パス                                        | 説明           |
| -------------------- | ------------------------------------------- | -------------- |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`    | 定量的基準     |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`        | カバレッジ結果 |
| 品質レポート         | `outputs/phase-9/quality-report.md`         | 品質検証結果   |
| artifacts.json       | `artifacts.json`                            | 成果物追跡     |
| 既存テスト監査結果   | `outputs/phase-1/existing-test-audit.md`    | Phase 1 成果物 |
| ギャップ分析         | `outputs/phase-1/gap-analysis.md`           | Phase 1 成果物 |
| モジュール分析       | `outputs/phase-1/module-analysis.md`        | Phase 1 成果物 |
| テスト設計書         | `outputs/phase-2/test-design.md`            | Phase 2 成果物 |
| モック戦略           | `outputs/phase-2/mock-strategy.md`          | Phase 2 成果物 |
| フィクスチャ設計     | `outputs/phase-2/fixture-design.md`         | Phase 2 成果物 |
| テストヘルパー設計   | `outputs/phase-2/test-helper-design.md`     | Phase 2 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md` | Phase 5 成果物 |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`        | Phase 8 成果物 |

## 成果物

| 成果物           | パス                                      | 説明                                |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR/CRITICAL判定と詳細 |

## 統合テスト連携

- 最終レビューで単体テストの品質が確認された後、統合テスト（TASK-8B）の前提条件が満たされたことを記録する
- TASK-8B/8Cの開始条件として、TASK-8Aの最終レビュー PASS が必要かどうかを確認する

## 完了条件

- [ ] 全受け入れ基準が検証されている
- [ ] 全成果物の存在が確認されている
- [ ] PASS/MINOR/MAJOR/CRITICALの判定が下されている
- [ ] MAJORまたはCRITICALの場合、差し戻し先と修正内容が具体的に記載されている
- [ ] 最終レビュー結果が `outputs/phase-10/` に生成されている

## Phase末端アクション【必須】

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow "docs/30-workflows/skill-import-agent-system/TASK-8A" \
  --phase 10 \
  --artifacts "outputs/phase-10/final-review-result.md:最終レビュー結果"
```

## 依存関係

| 項目      | 内容     |
| --------- | -------- |
| 前提Phase | Phase 9  |
| 後続Phase | Phase 11 |

## 次のPhase

→ [phase-11-manual-testing.md](phase-11-manual-testing.md)
