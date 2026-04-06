# Phase 7: テストカバレッジ確認

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 7                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 6                                                      |
| 後続Phase  | Phase 8                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

変更した関数・ブロックのカバレッジを測定し、品質基準を満たすことを確認する。

**[Feedback 7 対応]**: カバレッジ目標は変更した関数/ブロックに限定する。広域指定は避け、
`createVerificationReviewRequest()` 周辺の line/branch カバレッジの実測値を証跡に残す。

## 参照資料

| 資料名           | パス                                                                   | 説明             |
| ---------------- | ---------------------------------------------------------------------- | ---------------- |
| 拡張テストケース | `outputs/phase-6/expanded-test-cases.md`                               | Phase 6 成果物   |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md`                            | Phase 6 成果物   |
| テスト対象       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 変更対象ファイル |

## カバレッジ対象範囲

| 対象                                                      | 種別   | 目標 |
| --------------------------------------------------------- | ------ | ---- |
| `createVerificationReviewRequest()`                       | line   | 100% |
| `createVerificationReviewRequest()`                       | branch | 100% |
| `validateUserInputSubmission` の verification_review 分岐 | line   | 100% |
| `validateUserInputSubmission` の verification_review 分岐 | branch | 100% |

**対象外**: `SkillCreatorWorkflowEngine.ts` 内の上記以外の関数

## 実行タスク

- カバレッジ測定: 対象関数のカバレッジを測定する
- 未到達分析: カバレッジ未達箇所がある場合、Phase 6 に戻りテストを追加する
- カバレッジレポート作成: 実測値を記録する

## 実行手順

### 1. カバレッジ測定

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  --coverage \
  --coverage.include="apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts"
```

### 2. 実測値の記録

`outputs/phase-7/coverage-report.md` に以下を記録する:

- `createVerificationReviewRequest()` の line カバレッジ実測値
- `createVerificationReviewRequest()` の branch カバレッジ実測値
- `validateUserInputSubmission` の verification_review 分岐の実測値

## サブタスク管理

- Lane A: 対象関数のカバレッジ測定を実施する
- Lane B: 未達箇所の原因を分析する
- Lane C: A/B の結果を統合して coverage-report を作成する
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                                                      |
| ---------- | ----------------------------------------------------------------------------- |
| 測定対象   | `createVerificationReviewRequest()` と verification_review 分岐のみを測定する |
| 証跡厳密性 | 推定値ではなく実測値を `coverage-report.md` に残す                            |
| 到達性     | 未到達箇所があれば Phase 6 に戻して補強する                                   |
| 依存整合   | Phase 6 テストと Phase 8 リファクタリングに影響しない                         |

## 統合テスト連携

| 判定項目                                                 | 基準 | 結果       |
| -------------------------------------------------------- | ---- | ---------- |
| `createVerificationReviewRequest()` line coverage        | 100% | {{RESULT}} |
| `createVerificationReviewRequest()` branch coverage      | 100% | {{RESULT}} |
| `validateUserInputSubmission` verification_review branch | 100% | {{RESULT}} |

## 成果物

| 成果物             | パス                                 | 説明                          |
| ------------------ | ------------------------------------ | ----------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 変更関数の line/branch 実測値 |

## 完了条件

- [ ] `createVerificationReviewRequest()` の line/branch カバレッジが 100% であること
- [ ] `validateUserInputSubmission` の verification_review 分岐が 100% であること
- [ ] カバレッジレポートに実測値が記録されている（推定値・概算値は不可）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 7
```

## 次のPhase

Phase 8: リファクタリング
