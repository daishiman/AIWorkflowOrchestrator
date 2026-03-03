# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 6                                    |
| 機能名 | phase12-two-workflow-evidence-bundle |
| 作成日 | 2026-03-03                           |

## 目的

Phase 5 の実装に対してエッジケース・異常系・境界値テストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- エッジケーステスト追加: 1workflow のみの場合と 3workflow 以上の場合のテストを作成する
- 異常系テスト追加: 証跡ファイル欠損時の挙動を検証するテストを作成する
- 境界値テスト追加: チェックリスト項目の最大数やファイル名の長さ制限を検証するテストを作成する
- カバレッジギャップ分析: Phase 5 実装の未カバー箇所を特定し、追加テストを作成する

## 参照資料

| 資料名               | パス                                                                                                                | 説明                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 要件定義書           | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-1/requirements-definition.md` | Phase 1 成果物           |
| 設計書               | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-2/architecture-design.md`     | Phase 2 成果物           |
| テスト仕様書         | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-specification.md`      | Phase 4 成果物           |
| テストケース         | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-4/test-cases.md`              | Phase 4 成果物           |
| 実装サマリー         | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-5/implementation-summary.md`  | Phase 5 成果物           |
| 検証ユーティリティ   | `.claude/skills/task-specification-creator/scripts/evidence-bundle-validator.ts`                                    | Phase 5 で実装した関数群 |
| テストカバレッジ基準 | `.claude/skills/task-specification-creator/references/coverage-standards.md`                                        | カバレッジ目標値         |

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 実行手順

### ステップ 1: カバレッジ測定

Phase 5 完了時点のカバレッジを測定する:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts --coverage
```

### ステップ 2: ギャップ分析

測定結果から以下を特定する:

- 未到達の行（Line Coverage の不足箇所）
- 未到達の分岐（Branch Coverage の不足箇所）
- 未呼出の関数（Function Coverage の不足箇所）

### ステップ 3: エッジケーステスト追加

以下のテストケースを追加する:

| テストケース ID | テストケース名                                     | テストファイル                     | 検証内容                                                                                                                            |
| --------------- | -------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| T6-01           | 1workflow のみの結果で証跡テンプレートが生成できる | `evidence-bundle-template.test.ts` | `aiworkflow-requirements` の結果のみで、`task-specification-creator` の結果がない場合、テンプレートの該当セクションが空で生成される |
| T6-02           | 3workflow 以上の結果で証跡テンプレートが生成できる | `evidence-bundle-template.test.ts` | 仮想的な 3 つ目の workflow 結果を追加した場合、テンプレートに 3 つ目のセクションが追加される                                        |
| T6-03           | workflow 名が空文字列の場合にエラーを返す          | `evidence-bundle-template.test.ts` | `workflowName: ""` の入力で `parseWorkflowResult` がエラーを返す                                                                    |

### ステップ 4: 異常系テスト追加

以下のテストケースを追加する:

| テストケース ID | テストケース名                                                           | テストファイル                       | 検証内容                                                                              |
| --------------- | ------------------------------------------------------------------------ | ------------------------------------ | ------------------------------------------------------------------------------------- |
| T6-04           | verify-all-specs の出力が不正 JSON の場合にエラーを返す                  | `evidence-bundle-template.test.ts`   | `parseWorkflowResult` に不正 JSON 文字列を渡した場合、パースエラーを返す              |
| T6-05           | チェックリストに存在しない taskId が含まれる場合にエラーを返す           | `evidence-bundle-checklist.test.ts`  | `taskId: "task99"` を含む入力で `validateChecklist` がエラーを返す                    |
| T6-06           | スクリーンショットパスにディレクトリトラバーサルが含まれる場合に拒否する | `evidence-bundle-screenshot.test.ts` | `filePath: "../../etc/passwd"` の入力で `verifyScreenshot` がセキュリティエラーを返す |
| T6-07           | currentViolations が負数の場合にエラーを返す                             | `evidence-bundle-violations.test.ts` | `currentViolations: -1` の入力で `evaluateViolations` がバリデーションエラーを返す    |
| T6-08           | チェックリストが空配列の場合に incomplete を返す                         | `evidence-bundle-checklist.test.ts`  | 空配列 `[]` の入力で `validateChecklist` が `incomplete` を返す                       |

### ステップ 5: 境界値テスト追加

以下のテストケースを追加する:

| テストケース ID | テストケース名                                       | テストファイル                       | 検証内容                                                                                   |
| --------------- | ---------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------ |
| T6-09           | チェックリスト項目が 100 件の場合に正常処理される    | `evidence-bundle-checklist.test.ts`  | 100 件の `ChecklistItem` を渡した場合、`validateChecklist` が正常に全項目を検証する        |
| T6-10           | ファイル名が 255 文字の場合に正常処理される          | `evidence-bundle-screenshot.test.ts` | 255 文字のファイル名パスを渡した場合、`verifyScreenshot` が正常に処理する                  |
| T6-11           | ファイル名が 256 文字以上の場合にエラーを返す        | `evidence-bundle-screenshot.test.ts` | 256 文字以上のファイル名パスを渡した場合、`verifyScreenshot` がエラーを返す                |
| T6-12           | currentViolations=0 かつ baseline=0 で合格判定になる | `evidence-bundle-violations.test.ts` | 両方 0 の場合でも合格判定が正しく動作する                                                  |
| T6-13           | violations 配列が 1000 件の場合に正常処理される      | `evidence-bundle-template.test.ts`   | `violations` 配列に 1000 件のエントリを含む入力で `parseWorkflowResult` が正常にパースする |

### ステップ 6: カバレッジ再測定

追加テスト後のカバレッジを再測定する:

```bash
cd .claude/skills/task-specification-creator && pnpm vitest run scripts/__tests__/evidence-bundle-*.test.ts --coverage
```

## 統合テスト連携【必須】

テスト拡充後、統合テストのカバレッジ向上を確認する:

| テストカテゴリ       | 検証項目                                                         | 目標 |
| -------------------- | ---------------------------------------------------------------- | ---- |
| スクリプト連携テスト | エッジケース入力での `verify-all-specs` → テンプレート生成フロー | 100% |
| エラーハンドリング   | 不正入力・ファイル欠損時のエラー伝播                             | 80%+ |
| 境界値テスト         | 極端な入力サイズでの各関数の挙動                                 | 100% |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                       | 仕様参照先                                   |
| ------------------ | ------------------------------ | -------------------------------------------- |
| セキュリティ       | パストラバーサル検証のため適用 | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | 異常系テスト設計のため適用     | `aiworkflow-requirements: error-handling.md` |
| データ整合性       | 境界値での整合性確認のため適用 | Phase 2 設計書                               |

## 成果物

| 成果物             | パス                                                                                                         | 説明                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-6/coverage-report.md`  | カバレッジ分析結果                     |
| 統合テスト結果     | `docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle/outputs/phase-6/integration-test.md` | 統合テスト実行結果                     |
| テストファイル     | `.claude/skills/task-specification-creator/scripts/__tests__/evidence-bundle-*.test.ts`                      | 追加テストコード（既存ファイルに追記） |

## 完了条件

- [ ] エッジケーステスト 3 件（T6-01 〜 T6-03）が作成され、全て PASS している
- [ ] 異常系テスト 5 件（T6-04 〜 T6-08）が作成され、全て PASS している
- [ ] 境界値テスト 5 件（T6-09 〜 T6-13）が作成され、全て PASS している
- [ ] ユニットテストカバレッジ基準を達成している（Line 80%+, Branch 60%+, Function 80%+）
- [ ] カバレッジレポート（`outputs/phase-6/coverage-report.md`）が作成されている
- [ ] 統合テスト結果（`outputs/phase-6/integration-test.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認（Phase 4-5 成果物、カバレッジ基準）
2. カバレッジ測定（Phase 5 完了時点）
3. ギャップ分析
4. エッジケーステスト追加（T6-01 〜 T6-03）
5. 異常系テスト追加（T6-04 〜 T6-08）
6. 境界値テスト追加（T6-09 〜 T6-13）
7. カバレッジ再測定
8. 統合テスト連携の実施
9. 成果物の作成・配置（coverage-report.md、integration-test.md）
10. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --phase 6
```

## 次のPhase

Phase 7: テストカバレッジ確認
