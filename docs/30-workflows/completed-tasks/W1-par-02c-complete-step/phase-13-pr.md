# Phase 13: PRレビュー・マージ

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 13                                        |
| Phase名    | PRレビュー・マージ                        |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 12: ドキュメント整備                |
| 次Phase    | -                                         |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

ユーザー承認待ちと W2-seq-03a 統合待ちの間は blocked を維持し、両方が解消した場合のみ、変更サマリと local check をまとめて PR を作成する。

## 実行タスク

### Task 1: 変更要約の準備

PR 作成前に変更点を整理する:

- 改修対象ファイル: `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
- 統合ファイル: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- 追加テストファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`
- Phase 12 成果物: `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md`
- 削除内容: 旧UIコンポーネント（テキスト・スキルパス表示・`generationMethod` 依存分岐・「閉じる」ボタン単体構成）
- 追加内容: CompleteHeader / QualityFeedback / NextActionCards / ExternalIntegrationChecklist / リカバリーフロー / generatedSkill コンテキスト

### Task 2: PR 実行条件の確認

- ユーザー承認がない限り commit / push / PR を実行しない
- W2-seq-03a（SkillCreateWizard）の完了後に統合テストを実施してから PR を作成することを推奨
- Phase 12 の `phase12-task-spec-compliance-check.md` が PASS であることを確認する
- Wave 1 の他タスク（W1-par-02a, W1-par-02b, W1-par-02d）の完了状況を PR 前提条件として記録する

### Task 3: マージ前チェックリスト

```bash
# 最終テスト
pnpm --filter @repo/desktop vitest run -- CompleteStep

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# Lint
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx

# フォーマット確認
pnpm --filter @repo/desktop prettier --check apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

### Task 4: PR 作成手順

`/ai:diff-to-pr` スキルを使用して PR を作成する。

PR 本文のテンプレート:

```
## Summary
- UT-SKILL-WIZARD-W1-par-02c: CompleteStep 完了画面を起点画面として再設計
- 旧: 「スキルが作成されました」 + 「閉じる」ボタンのみ
- 新: 完了ヘッダー / 👍👎フィードバック / ネクストアクション3カード / リカバリーフロー / 外部連携チェックリスト（設定ボタンなし）

## Changed files
- apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx（全面改修）
- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx（CompleteStep 接続）
- apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx（新規）

## Test plan
- [ ] 👍/👎フィードバックが正しく発火する
- [ ] リカバリーフローでStep 0に戻りプリフィルされる（W2-seq-03a統合後）
- [ ] ネクストアクション3カードが正しくレンダリングされる
- [ ] hasExternalIntegration=trueの時のみ外部連携チェックリストが表示される
- [ ] generatedSkill コンテキストを保持したまま、raw path を表示しない
- [ ] オプショナルPropsが未指定でもクラッシュしない
- [ ] Phase 12 の `phase12-task-spec-compliance-check.md` が PASS である
- [ ] `ui-ux-feature-components-reference.md` の CompleteStep 行が更新されている
- [ ] `ui-ux-feature-components-skill-analysis.md` の CompleteStep 行も current contract に同期されている
- [ ] 全自動テストがpass
- [ ] カバレッジ目標値達成（Statements 90%以上）
```

### Task 5: タスクディレクトリの完了時移動

PR マージ後、本タスク自体のディレクトリを以下に移動する:

- 移動元: `docs/30-workflows/W1-par-02c-complete-step/`
- 移動先: `docs/30-workflows/completed-tasks/`

## 参照資料

| 資料名               | パス                                                     | 説明                |
| -------------------- | -------------------------------------------------------- | ------------------- |
| 実装記録             | `outputs/phase-5/implementation-record.md`               | 変更内容            |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`                     | coverage 要約       |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`                     | 整理内容            |
| QAレポート           | `outputs/phase-9/qa-report.md`                           | 品質ゲート結果      |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`                | 判定                |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                 | evidence            |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | 直前成果物          |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Phase 12 の仕様同期 |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | Phase 12 の変更記録 |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | Phase 12 の未タスク |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | Phase 12 の改善記録 |
| 仕様準拠チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 の最終確認 |

## 成果物

| 成果物      | パス                                     | 説明             |
| ----------- | ---------------------------------------- | ---------------- |
| PR 作成記録 | `outputs/phase-13/pr-creation-record.md` | PR URL・変更要約 |

## 完了条件

- [ ] ユーザー承認待ちであることが明記されている
- [ ] W2-seq-03a 統合待ちであることが明記されている
- [ ] commit / push / PR を未実行であることが記録されている
- [ ] Wave 1 他タスク（W1-par-02a/W1-par-02b/W1-par-02d）の依存状況が記録されている
- [ ] マージ前チェックリストが全て通過している
- [ ] 承認後に必要な成果物が定義されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

- blocked: ユーザー承認待ち・W2-seq-03a統合後に実施
