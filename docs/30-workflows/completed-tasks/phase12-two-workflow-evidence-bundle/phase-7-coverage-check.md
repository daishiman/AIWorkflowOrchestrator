# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 7                                    |
| 機能名 | phase12-two-workflow-evidence-bundle |
| 作成日 | 2026-03-03                           |

## 目的

Phase 6 で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。未達の場合は Phase 6 へ差し戻す。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測を行い、数値を記録する
- 基準充足判定: カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の充足を判定する
- 差し戻し判断: 未達の場合、Phase 6 への差し戻しを決定する

## 参照資料

| 資料名               | パス                                                                                                               | 説明                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| 実装サマリー         | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-5/implementation-summary.md` | Phase 5 成果物           |
| カバレッジレポート   | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-6/coverage-report.md`        | Phase 6 成果物           |
| 統合テスト結果       | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-6/integration-test.md`       | Phase 6 成果物           |
| 検証ユーティリティ   | `.claude/skills/task-specification-creator/scripts/evidence-bundle-validator.ts`                                   | Phase 5 で実装した関数群 |
| テストカバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`                                       | カバレッジ目標値の正本   |

## 実行手順

### ステップ 1: カバレッジ再測定

全テストを実行し、カバレッジレポートを生成する:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts --coverage
```

### ステップ 2: テスト数の実測確認

テスト数を実際のテスト実行結果から取得する（推定値・概算値は使用しない）:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts --reporter=verbose 2>&1 | grep -c "✓\|×"
```

取得した数値を成果物に記録し、Phase 4 のテストケース設計数（14 件）と Phase 6 の追加数（13 件）の合計と照合する。差異がある場合は差分の理由を明記する。

### ステップ 3: カバレッジ基準充足判定

以下の基準で合否を判定する:

| 判定項目          | 基準 | 結果（実測値を記入） | 判定 |
| ----------------- | ---- | -------------------- | ---- |
| Line Coverage     | 80%+ | \_\_%                | ○/×  |
| Branch Coverage   | 60%+ | \_\_%                | ○/×  |
| Function Coverage | 80%+ | \_\_%                | ○/×  |

### ステップ 4: 未達の場合の対応

カバレッジが基準未達の場合、以下の手順で Phase 6 に差し戻す:

1. 未カバー箇所を特定する（カバレッジレポートの Uncovered Lines セクションを確認）
2. 差し戻し理由を `outputs/phase-7/coverage-report.md` に記録する
3. Phase 6 に戻り、不足テストを追加する
4. 再度 Phase 7 を実行する

| 条件             | 戻り先  | 理由              |
| ---------------- | ------- | ----------------- |
| カバレッジ未達成 | Phase 6 | テスト追加が必要  |
| 全基準達成       | Phase 8 | 次の Phase へ進行 |

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                               | 基準 | 結果（実測値を記入） |
| -------------------------------------- | ---- | -------------------- |
| ユニットテスト Line Coverage           | 80%+ | \_\_%                |
| ユニットテスト Branch Coverage         | 60%+ | \_\_%                |
| ユニットテスト Function Coverage       | 80%+ | \_\_%                |
| スクリプト連携テスト（正常系シナリオ） | 100% | \_\_%                |
| スクリプト連携テスト（異常系シナリオ） | 80%+ | \_\_%                |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                     | 仕様参照先                                                                   |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| データ整合性       | カバレッジ数値の正確性確認   | `.claude/skills/task-specification-creator/references/coverage-standards.md` |
| エラーハンドリング | 異常系テストのカバレッジ確認 | `aiworkflow-requirements: error-handling.md`                                 |

## 成果物

| 成果物             | パス                                                                                                        | 説明             |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ---------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-7/coverage-report.md` | 再測定結果と判定 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成している（Line 80%+, Branch 60%+, Function 80%+）
- [ ] テスト数が実測値で記録されている（推定値ではない）
- [ ] テスト実行コマンドとタイムスタンプが成果物に記録されている
- [ ] Phase 4 設計テスト数（14 件）+ Phase 6 追加テスト数（13 件）との照合結果が記録されている
- [ ] 全テストが PASS している
- [ ] カバレッジレポート（`outputs/phase-7/coverage-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 5-6 成果物、カバレッジ基準）
2. カバレッジ再測定
3. テスト数の実測確認
4. カバレッジ基準充足判定
5. 未達の場合の差し戻し対応（該当する場合のみ）
6. 成果物の作成・配置（coverage-report.md）
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --phase 7
```

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
