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

提出準備を完了し、ユーザー承認後のみ PR 作成へ進む。現時点では blocked のまま記録し、commit / push / PR 作成は行わない。

## PR 提出差分サマリー

### 変更ファイル

| ファイル                                                                      | 変更種別 | 概要                                            |
| ----------------------------------------------------------------------------- | -------- | ----------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | 変更     | `DescribeStep*` / inline `GenerationMode` 整理  |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`         | 変更     | `SkillInfoStepProps` を public type 化          |
| `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`          | 変更     | deprecated 注記追加 + `GenerationMode` 直接参照 |
| `apps/desktop/src/renderer/components/skill/__tests__/wizard-exports.test.ts` | 新規     | runtime + type export 契約テスト                |

### 変更概要

1. `DescribeStep` / `DescribeStepProps` の barrel export を削除
2. inline `GenerationMode` 定義を削除し、`GenerateStep.tsx` から再転送へ統一
3. `SkillInfoStepProps` を barrel から参照可能にする
4. 既存の `SkillInfoStep` / `ConversationRoundStep` / `GenerateStep` / `CompleteStep` export を維持する
5. deprecated `DescribeStep.tsx` の型依存を barrel から実装元へ寄せる

### レビュー観点

| 観点        | 確認内容                                                                     |
| ----------- | ---------------------------------------------------------------------------- |
| 機能要件    | 削除3件・追加2件・維持 export が正確に反映されているか                       |
| 型安全性    | TypeScript 型チェックがエラー 0 件であるか                                   |
| 後方互換性  | `GenerationMode` と `SkillInfoStepProps` の import contract が壊れていないか |
| local check | `typecheck` と targeted export test の結果が記録されているか                 |
| 依存タスク  | W1-par-02a/W1-par-02b/W1-par-02c の成果物が存在するか                        |

## 承認条件

**ユーザーの明示承認がある場合のみ PR 作成へ進む。**

承認がない場合は blocked 記録のみを残し、`outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` の更新で終了する。

## PR タイトル案

```
feat(skill-wizard): wizard/index.ts エクスポート更新（W2-seq-03b）
```

## PR 本文テンプレート

```markdown
## 概要

`wizard/index.ts` から廃止コンポーネントのエクスポートを削除し、新コンポーネントを追加。

## 変更内容

**削除（3件）：**

- DescribeStep / DescribeStepProps
- inline GenerationMode 定義

**追加（2件）：**

- SkillInfoStepProps
- GenerateStep 由来の GenerationMode 再転送

**維持（既存 export）：**

- SkillInfoStep / ConversationRoundStep / StepIndicator / GenerateStep / CompleteStep ほか

## 依存タスク

- W1-par-02a（SkillInfoStep）: 完了済み
- W1-par-02b（ConversationRoundStep）: 完了済み
- W1-par-02c（CompleteStep）: 完了済み

## テスト

- `pnpm --filter @repo/desktop typecheck` エラー 0 件
- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts --maxWorkers 1`
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
4. 承認がない場合は blocked 記録を更新して終了する。
5. 承認がある場合は `gh pr create` で PR を作成する。

## 成果物

| 成果物           | パス                                     | 説明                 |
| ---------------- | ---------------------------------------- | -------------------- |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 実行済み local check |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | PR 前の差分要約      |
| PR 情報          | `outputs/phase-13/pr-info.md`            | blocked placeholder  |
| PR 作成結果      | `outputs/phase-13/pr-creation-result.md` | blocked placeholder  |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `local-check-result.md` が current facts に更新されていること
- [ ] `change-summary.md` が current facts に更新されていること
- [ ] user approval 未取得のため blocked と記録されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 差分要約の整理
3. 承認条件チェック
4. blocked 記録更新
5. PR 作成（承認時のみ）

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## PR 作成制約

- ユーザーの明示承認がある場合だけ PR 作成へ進む。
- 明示承認がない場合は blocked 記録の更新で終了する。

## 次のPhase

Phase -: -
