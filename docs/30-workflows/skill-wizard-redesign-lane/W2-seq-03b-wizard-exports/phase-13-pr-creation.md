# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 13                               |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 12                         |
| 後続Phase  | -                                |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                                      | 変更種別 | 概要                           |
| ----------------------------------------------------------------------------- | -------- | ------------------------------ |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | 変更     | エクスポート削除5件・追加4件   |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`          | 変更     | @deprecated JSDoc 追加（残留） |
| `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`         | 変更     | @deprecated JSDoc 追加（残留） |
| `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` | 新規     | エクスポート確認テスト追加     |

### 変更概要

1. `DescribeStep` / `DescribeStepProps` エクスポートを削除
2. `ConfigureStep` / `WizardOptions` / `ConfigureStepProps` エクスポートを削除
3. `GenerationMode` 型エクスポートを削除
4. `SkillInfoStep` / `SkillInfoStepProps` エクスポートを追加
5. `ConversationRoundStep` / `ConversationRoundStepProps` エクスポートを追加
6. `StepIndicator` / `GenerateStep` / `CompleteStep` エクスポートは維持

### レビュー観点

| 観点       | 確認内容                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| 機能要件   | 削除5件・追加4件・維持6件が正確に反映されているか                                 |
| 型安全性   | TypeScript 型チェックがエラー 0 件であるか                                        |
| 後方互換性 | 維持エクスポートの型シグネチャが変わっていないか                                  |
| ビルド     | `pnpm --filter @repo/desktop build` が成功するか                                  |
| 依存タスク | W1-par-02a/W1-par-02b/W1-par-02c の成果物（新コンポーネントファイル）が存在するか |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## PR タイトル案

```
feat(skill-wizard): wizard/index.ts エクスポート更新（W2-seq-03b）
```

## PR 本文テンプレート

```markdown
## 概要

`wizard/index.ts` から廃止コンポーネントのエクスポートを削除し、新コンポーネントを追加。

## 変更内容

**削除（5件）：**

- DescribeStep / DescribeStepProps
- ConfigureStep / WizardOptions / ConfigureStepProps
- GenerationMode 型

**追加（4件）：**

- SkillInfoStep / SkillInfoStepProps
- ConversationRoundStep / ConversationRoundStepProps

**維持（6件）：**

- StepIndicator / GenerateStep / CompleteStep（変更なし）

## 依存タスク

- W1-par-02a（SkillInfoStep）: 完了済み
- W1-par-02b（ConversationRoundStep）: 完了済み
- W1-par-02c（CompleteStep）: 完了済み

## テスト

- `pnpm --filter @repo/desktop typecheck` エラー 0 件
- `pnpm --filter @repo/desktop test` 全テスト Green
- `pnpm --filter @repo/desktop build` ビルド成功
```

## 参照資料

| 資料名                   | パス                                                     | 用途            |
| ------------------------ | -------------------------------------------------------- | --------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Phase 12 成果物 |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | Phase 12 成果物 |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 成果物 |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`                | Phase 10 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                 | Phase 11 成果物 |

## 実行手順

1. Phase 12 成果物を確認する。
2. 差分要約とレビュー観点を整理する。
3. 承認条件チェックでユーザー明示承認の有無を確認する。
4. 承認がない場合は `outputs/phase-13/pr-preparation.md` のみ作成して終了する。
5. 承認がある場合は `gh pr create` で PR を作成する。

## 成果物

| 成果物           | パス                                     | 説明                 |
| ---------------- | ---------------------------------------- | -------------------- |
| PR 準備メモ      | `outputs/phase-13/pr-preparation.md`     | 提出準備情報         |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | 後続への引き継ぎ情報 |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認     |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PR 準備メモが作成されていること
- [ ] 引き継ぎサマリーが作成されていること
- [ ] 承認チェックが記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 差分要約の整理
3. 承認条件チェック
4. PR 作成（承認時のみ）
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成で終了する。

## 次のPhase

Phase -: -
