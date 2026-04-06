# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 11                                                           |
| タスクID   | TASK-SDK-04-U1-F1                                            |
| 機能名     | task-sdk-04-u1-f1-verification-review-single-select          |
| タスク名   | verification_review request を single_select kind に変更する |
| 前提Phase  | Phase 10                                                     |
| 後続Phase  | Phase 12                                                     |
| 作成日     | 2026-04-06                                                   |
| ステータス | pending                                                      |

## 目的

自動テストで検証済みの内容を最終確認する。

## 参照資料

| 資料名           | パス                                                                   | 説明             |
| ---------------- | ---------------------------------------------------------------------- | ---------------- |
| 品質レポート     | `outputs/phase-9/quality-report.md`                                    | Phase 9 成果物   |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                              | Phase 10 成果物  |
| テスト対象       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | 変更対象ファイル |

## 多角的チェック観点（AIが判断）

| 判定項目               | 結果           | 根拠                                  |
| ---------------------- | -------------- | ------------------------------------- |
| UI/UX 変更あり         | **No**         | Renderer コンポーネント変更なし       |
| スクリーンショット必要 | **不要**       | Main Process のみの変更               |
| 手動テスト種別         | **NON_VISUAL** | 自動テスト結果 + 既知制限リストで代替 |

**[Feedback BEFORE-QUIT-001 対応]**: 本タスクは Main Process 内の関数変更のみであり、
実地 UI 操作は不要。自動テスト結果を証跡とし、`manual-test-result.md` に記録する。

## 実行タスク

- NON_VISUAL テスト確認: 自動テスト結果を証跡として記録する
- 発見課題確認: 自動テスト・typecheck・lint 結果から課題を確認する

## サブタスク管理

- Lane A: 自動テスト結果を証跡化する
- Lane B: typecheck / lint / NON_VISUAL 判定を確認する
- Lane C: A/B の結果を統合して manual-test-result と discovered-issues を作成する
- A/B は並列、C は直列

## テストケース

| No  | カテゴリ   | テスト項目                                                   | 検証方法   | 期待結果  |
| --- | ---------- | ------------------------------------------------------------ | ---------- | --------- |
| 1   | 機能テスト | `createVerificationReviewRequest()` の kind が single_select | 自動テスト | AC-1 PASS |
| 2   | 機能テスト | options に approve/improve/reject が含まれる                 | 自動テスト | AC-2 PASS |
| 3   | 機能テスト | 不正 selectedOptionId がバリデーションエラーになる           | 自動テスト | AC-3 PASS |
| 4   | 回帰テスト | 既存テスト全件 PASS                                          | 自動テスト | AC-4 PASS |
| 5   | 型チェック | typecheck エラーなし                                         | typecheck  | Error 0件 |

## 実行コマンド（証跡用）

```bash
# 証跡の主ソース: 自動テスト
pnpm exec vitest run \
  apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts \
  --reporter=verbose

# typecheck
pnpm --filter @repo/desktop typecheck
```

## スクリーンショット方針

**NON_VISUAL**: 本タスクは Renderer UI 変更を含まないため、スクリーンショット撮影は不要。
`screenshots/` ディレクトリは作成しない。

理由: `createVerificationReviewRequest()` は Main Process の関数であり、
renderer の表示は既存の single_select handling が担う（変更なし）。

## 統合テスト連携

| テスト項目 | 確認内容  | 期待結果 | 実行結果   |
| ---------- | --------- | -------- | ---------- |
| 自動テスト | 全件 PASS | PASS     | {{RESULT}} |
| typecheck  | Error 0件 | PASS     | {{RESULT}} |

## 成果物

| 成果物       | パス                                     | 必須 | 説明                                                      |
| ------------ | ---------------------------------------- | ---- | --------------------------------------------------------- |
| テスト結果   | `outputs/phase-11/manual-test-result.md` | 必須 | NON_VISUAL 証跡（自動テスト件数・結果・スクショ不要理由） |
| 発見課題一覧 | `outputs/phase-11/discovered-issues.md`  | 必須 | 発見した課題（0件でも出力）                               |

**スクリーンショット**: 不要（NON_VISUAL タスク）

## 完了条件

- [ ] 全テストケースが自動テストで確認済み
- [ ] `manual-test-result.md` に「証跡の主ソース（自動テスト件数）」と「スクリーンショット不要の理由」を明記した
- [ ] `discovered-issues.md` を作成した（0件でも出力）
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-sdk-04-u1-f1-verification-review-single-select --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
