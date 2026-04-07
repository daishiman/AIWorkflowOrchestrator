# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 8                                                            |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 7                                                      |
| 後続Phase  | Phase 9                                                      |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

TDD Refactor フェーズとして、動作を変えずにコード品質を改善する。
小規模タスクのため、重大なリファクタリング対象がない場合は「リファクタリング不要」と明記して完了する。

## 参照資料

| 資料名             | パス                                                                   | 説明             |
| ------------------ | ---------------------------------------------------------------------- | ---------------- |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`                            | Phase 5 成果物   |
| 変更ファイル一覧   | `outputs/phase-5/changed-files.md`                                     | Phase 5 成果物   |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`                                   | Phase 7 成果物   |
| テスト対象         | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 変更対象ファイル |

## 実行タスク

- コードスメル確認: `createVerificationReviewRequest()` 変更後のコードに重複・命名問題がないか確認する
- Before/After 記録: 変更した場合は対象/Before/After/理由テーブルで記録する（Feedback RT-03）
- テスト継続確認: リファクタリング後もテストが全件 PASS であることを確認する

## リファクタリング候補

| 候補                     | 判断       | 理由                                                                         |
| ------------------------ | ---------- | ---------------------------------------------------------------------------- |
| options 配列の定数化     | 任意       | 3選択肢は `createVerificationReviewRequest()` 専用のため定数化の優先度は低い |
| label 文字列の i18n 対応 | スコープ外 | 本タスクのスコープ外（将来の改善候補）                                       |

## 実行手順

### 1. コードレビュー

```bash
# 変更後のコードを確認
grep -A 20 "createVerificationReviewRequest" \
  apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts
```

### 2. リファクタリング実施（該当時）

**[Feedback RT-03 対応]** 変更がある場合は以下テーブルで記録する:

| 対象                                                   | Before | After | 理由 |
| ------------------------------------------------------ | ------ | ----- | ---- |
| （変更なしの場合は「リファクタリング対象なし」と記載） | -      | -     | -    |

### 3. テスト継続確認

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## サブタスク管理

- Lane A: コードスメルを確認する
- Lane B: リファクタリング要否を判断する
- Lane C: A/B の結果を統合して回帰確認を行う
- A/B は並列、C は直列

## 多角的チェック観点（AIが判断）

| 観点       | 確認内容                                                           |
| ---------- | ------------------------------------------------------------------ |
| 簡潔性     | options 配列の定数化など、不要な抽象化を増やしていないか           |
| 回帰安全性 | リファクタリング後もテスト全件 PASS を維持できるか                 |
| 変更最小化 | 変更なしの場合は「リファクタリング対象なし」を明記して完了できるか |
| 記録整合   | Before/After テーブルが変更有無に応じて適切に記録されるか          |

## 統合テスト連携

```bash
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts
```

## 成果物

| 成果物                   | パス                                    | 説明                                        |
| ------------------------ | --------------------------------------- | ------------------------------------------- |
| リファクタリングレポート | `outputs/phase-8/refactoring-report.md` | Before/After テーブルまたは「対象なし」記録 |

## 完了条件

- [ ] リファクタリング対象の有無を判断した
- [ ] 変更がある場合、Before/After/理由テーブルで記録した
- [ ] 変更がない場合、「リファクタリング対象なし」と明記した
- [ ] テスト全件 PASS を確認した
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 8
```

## 次のPhase

Phase 9: 品質保証
