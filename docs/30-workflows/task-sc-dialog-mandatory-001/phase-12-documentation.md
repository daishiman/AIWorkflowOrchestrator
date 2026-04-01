# Phase 12: ドキュメント整備（docs-heavy）

## メタ情報

| 項目          | 値                           |
| ------------- | ---------------------------- |
| Phase         | 12                           |
| 機能名        | task-sc-dialog-mandatory-001 |
| 作成日        | 2026-04-01                   |
| Phase 12 種別 | docs-heavy                   |

## 目的

変更内容を文書化し、システム仕様への反映と未タスク検出を行う。
6 つの成果物を作成し、今回の変更の記録・伝達・引き継ぎを完結させる。

## 実行タスク

1. implementation-guide.md の作成（実装内容の概要・変更箇所・動作確認方法）
2. system-spec-update-summary.md の作成（システム仕様への反映）
3. documentation-changelog.md の作成（変更した 3 ファイルのチェンジログ）
4. unassigned-task-detection.md の作成（今回の変更から派生する未タスクの検出）
5. skill-feedback-report.md の作成（skill-creator の使用フィードバック）
6. phase12-task-spec-compliance-check.md の作成（Phase 1〜13 仕様準拠チェック）

## 参照資料

| 資料名          | パス                                         | 説明                          |
| --------------- | -------------------------------------------- | ----------------------------- |
| Phase 5 成果物  | `outputs/phase-5/implementation-record.md`   | 実装内容の正本                |
| Phase 11 成果物 | `outputs/phase-11/manual-test-result.md`     | テスト結果（docs 反映に使用） |
| Phase 1 成果物  | `outputs/phase-1/requirements-definition.md` | 受入基準・タスク分類の正本    |

## 実行手順

### タスク1: implementation-guide.md の作成

実装内容の概要・変更箇所・動作確認方法を記述する。

**記述内容**:

- 問題の背景: `/skill-creator` 呼び出し時に対話なしでスキル生成が始まる問題
- 変更概要: SKILL.md / discover-problem.md / interview-user.md の 3 ファイルに対話強制の記述を追加
- 変更箇所の詳細:
  - SKILL.md: `## 必須：最初の実行ステップ` ブロック追加
  - discover-problem.md: 実行ゲートブロック追加
  - interview-user.md: problem-definition.json フォールバック変更
- 動作確認方法: Phase 11 のウォークスルー手順を参照

**配置先**: `outputs/phase-12/implementation-guide.md`

### タスク2: system-spec-update-summary.md の作成

skill-creator の仕様が変更された箇所をシステム仕様に反映する。

**記述内容**:

- 変更内容: 「最初のアクションは必ず AskUserQuestion」という強制フローの追加
- 影響範囲: skill-creator スキルのみ、既存 collaborative フローは不変
- システム仕様への反映箇所:
  - スキル一覧ドキュメントの skill-creator 説明欄
  - 対話フロー仕様書の冒頭ステップ記述
- 変更前の仕様: 「AskUserQuestion を推奨するが、詳細な要件があれば省略可」
- 変更後の仕様: 「最初のアクションは必ず AskUserQuestion（例外なし）」

**配置先**: `outputs/phase-12/system-spec-update-summary.md`

### タスク3: documentation-changelog.md の作成

変更した 3 ファイルのチェンジログを記述する。

**記述内容**:

| ファイル            | 変更種別 | 変更内容                                                                          |
| ------------------- | -------- | --------------------------------------------------------------------------------- |
| SKILL.md            | 追加     | `## 必須：最初の実行ステップ` ブロックを追加（AskUserQuestion の強制化）          |
| discover-problem.md | 追加     | ファイル冒頭に実行ゲートブロックを追加（Phase 0-0-1 質問の強制実行）              |
| interview-user.md   | 変更     | セクション 5.1 の `problem-definition.json` 欠損時処理を「AskUserQuestion」に変更 |

**配置先**: `outputs/phase-12/documentation-changelog.md`

### タスク4: unassigned-task-detection.md の作成

今回の変更から派生する未タスクを検出し記録する。

**検出内容**:

| ID             | タイトル                                         | 優先度 | 理由                                                                                                                         |
| -------------- | ------------------------------------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- |
| UNASSIGNED-001 | 自動化スクリプト対応（--skip-dialog フラグ追加） | 低     | 現在の変更で「例外なし」としているが、自動化スクリプトから呼ぶ場合に不便が生じる可能性がある（Phase 3 リスク評価で記録済み） |

**未タスク件数**: 1 件（低優先度）

**配置先**: `outputs/phase-12/unassigned-task-detection.md`

### タスク5: skill-feedback-report.md の作成

skill-creator スキルの使用フィードバックを記述する。

**記述内容**:

- 今回の変更で改善された点（対話強制による UX 改善）
- 残課題（自動化スクリプト対応は別タスクとして記録済み）
- skill-creator を使って本タスクを実施した経験からのフィードバック
  - Phase 1〜13 の仕様書フォーマットの使いやすさ
  - docs-only タスクにおける NON_VISUAL テスト種別の適切さ
  - docs-heavy Phase 12 の成果物量の妥当性

**配置先**: `outputs/phase-12/skill-feedback-report.md`

### タスク6: phase12-task-spec-compliance-check.md の作成

Phase 1〜13 仕様準拠チェックを実施する。

**チェック内容**:

| Phase      | 仕様準拠確認項目                                          | 判定 |
| ---------- | --------------------------------------------------------- | ---- |
| Phase 1    | メタ情報テーブル・受入基準・artifact 命名一覧が存在するか | ─    |
| Phase 2    | 設計サマリー・変更内容・影響範囲が明示されているか        | ─    |
| Phase 3    | 4 条件チェック・リスク評価・進行可否判定が存在するか      | ─    |
| Phase 4〜6 | TC-001〜TC-010 が定義され、AC トレーサビリティがあるか    | ─    |
| Phase 7    | AC-001〜AC-006 の全カバレッジが確認されているか           | ─    |
| Phase 8    | リファクタリング要否判定が記録されているか                | ─    |
| Phase 9    | 5 項目 QA チェックが全 PASS として記録されているか        | ─    |
| Phase 10   | 全 Phase 成果物のレビューと最終判定が記録されているか     | ─    |
| Phase 11   | 全テストシナリオの PASS/FAIL が記録されているか           | ─    |
| Phase 12   | 6 成果物がすべて作成されているか                          | ─    |
| Phase 13   | PR 情報・実行手順・ユーザー承認制約が記述されているか     | ─    |

**配置先**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 統合テスト連携

コード変更なし。本 Phase はドキュメント整備のみ。

## 多角的チェック観点

| 観点     | 判断     | 確認内容                                                         |
| -------- | -------- | ---------------------------------------------------------------- |
| 完全性   | **必須** | 6 成果物がすべて作成されているか                                 |
| 伝達性   | **必須** | 実装内容・変更箇所・未タスクが第三者に伝わる形で記述されているか |
| 引き継ぎ | **必須** | 将来の担当者が本ドキュメントを見て変更内容を再現できるか         |

## 完了条件

- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/system-spec-update-summary.md` が作成されている
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（未タスク 1 件記録済み）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] 6 成果物すべてが `outputs/phase-12/` に配置されている

## 成果物

| 成果物                                | 配置先            |
| ------------------------------------- | ----------------- |
| implementation-guide.md               | outputs/phase-12/ |
| system-spec-update-summary.md         | outputs/phase-12/ |
| documentation-changelog.md            | outputs/phase-12/ |
| unassigned-task-detection.md          | outputs/phase-12/ |
| skill-feedback-report.md              | outputs/phase-12/ |
| phase12-task-spec-compliance-check.md | outputs/phase-12/ |
