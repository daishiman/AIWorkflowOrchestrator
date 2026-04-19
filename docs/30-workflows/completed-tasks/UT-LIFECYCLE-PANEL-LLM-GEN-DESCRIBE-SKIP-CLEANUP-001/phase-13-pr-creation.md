# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 13                                                             |
| 機能名     | UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001           |
| タスク名   | SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ |
| 前提Phase  | Phase 12                                                       |
| 後続Phase  | -                                                              |
| 作成日     | 2026-04-18                                                     |
| ステータス | blocked                                                        |

## 目的

提出準備だけを完了し、ユーザー承認があるまで PR 作成は実行しない。

## 背景

`SkillLifecyclePanel.llm-generation.test.tsx` の `describe.skip` クリーンアップが全Phase完了した後、差分整理と PR 下書き材料だけを準備する。
本Phaseは `phase13_blocked` 前提で運用し、ユーザーの明示承認がある場合のみ次waveで PR 作成へ進む。

## SubAgentチーム編成

| SubAgent   | 関心ごと         | 主担当                             |
| ---------- | ---------------- | ---------------------------------- |
| SubAgent-A | 差分整理責務     | 変更ファイル一覧・差分サマリー作成 |
| SubAgent-B | PR記述責務       | PRタイトル・説明テンプレート作成   |
| SubAgent-C | 承認条件確認責務 | ユーザー明示承認の有無確認         |
| SubAgent-D | 統合監査         | 矛盾・漏れ・整合・依存判定         |

## 実行タスク

- 提出差分整理: レビューに必要な差分説明を整理する
- 承認条件確認: ユーザー明示承認がある場合だけ次waveの PR 作成候補にする
- 引き継ぎ記録: 次担当者が迷わない引き継ぎ情報を固定する

## 参照資料

| 参照資料                 | パス                                              | 説明            |
| ------------------------ | ------------------------------------------------- | --------------- |
| 要件定義書               | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物  |
| 受け入れ基準             | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物  |
| 変更ファイル一覧         | `outputs/phase-5/changed-files.md`                | Phase 5 成果物  |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`             | Phase 8 成果物  |
| 品質レポート             | `outputs/phase-9/quality-report.md`               | Phase 9 成果物  |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`          | Phase 11 成果物 |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`        | Phase 12 成果物 |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`   | Phase 12 成果物 |
| 是正計画                 | `outputs/phase-10/corrective-action-plan.md`      | Phase 10 成果物 |
| 出荷準備チェックリスト   | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`       | Phase 11 成果物 |
| 検出課題一覧             | `outputs/phase-11/discovered-issues.md`           | Phase 11 成果物 |
| スクリーンショット計画   | `outputs/phase-11/screenshot-plan.json`           | Phase 11 成果物 |
| 仕様更新サマリー         | `outputs/phase-12/spec-update-summary.md`         | Phase 12 成果物 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`     | Phase 12 成果物 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`       | Phase 12 成果物 |
| Task2実行ログ            | `outputs/phase-12/phase12-task2-step-log.md`      | Phase 12 成果物 |

## 実行手順

1. 差分要約とレビュー観点を整理する。
2. 承認条件チェックでユーザー明示承認の有無を確認する。
3. 承認がない場合はPR作成を実行せず保留記録のみ残す。
4. 承認がある場合のみ、次waveで `/ai:diff-to-pr` スキル実行可と記録する。

### PR作成スキルの実行方法

```bash
# /ai:diff-to-pr スキルを使ってPR作成
# ユーザーの明示承認後のみ実行すること

# ブランチ確認
git branch --show-current
git status

# 差分確認
git diff main --stat
git diff main -- \
  apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# /ai:diff-to-pr スキル実行（承認後）
# スキルを呼び出す: /ai:diff-to-pr
```

## PRタイトルテンプレート

```
test(skill): SkillLifecyclePanel LLM生成テスト describe.skip クリーンアップ (#2236)
```

## PR説明テンプレート

```markdown
## 概要

SkillLifecyclePanel.llm-generation.test.tsx に存在した 12件の `describe.skip` を削除・昇格・記録の3分類で処理し、
廃止済み API（planSkill / detectMode）依存のモック宣言を整理した。

## 変更内容

- `describe.skip` → 削除 / 修正 / 別途Issue化 で処理
- 廃止済み API（`planSkill` / `detectMode`）のモック宣言を除去
- 不要な import 文を除去

## 変更ファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx`

## テスト結果

- Vitest: 全件 PASS
- TypeScript: エラー 0 件
- ESLint: エラー・警告 0 件
- `describe.skip` 残存数: 0 件

## 関連 Issue

Closes #2236

## 依存タスク

- UT-W2-03A-LLM-GENERATION-TEST-CLEANUP-001（完了済み）
```

## 多角的チェック観点

| 観点     | 確認内容                                             |
| -------- | ---------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                   |
| 漏れ     | 要件から成果物への未反映項目がないか確認する         |
| 整合性   | PRタイトル・説明がタスク内容と一致しているか確認する |
| 依存関係 | 依存Phaseとの入力出力が整合しているか確認する        |

## 成果物

| 成果物           | パス                                     | 説明             |
| ---------------- | ---------------------------------------- | ---------------- |
| PR準備メモ       | `outputs/phase-13/pr-preparation.md`     | 提出準備情報     |
| 引き継ぎサマリー | `outputs/phase-13/handoff-summary.md`    | 引き継ぎ情報     |
| 承認チェック     | `outputs/phase-13/approval-checklist.md` | ユーザー承認確認 |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] PRタイトル・説明テンプレートが作成されていることを確認
- [ ] PR作成は未実行のまま `blocked` と記録されていることを確認
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-LIFECYCLE-PANEL-LLM-GEN-DESCRIBE-SKIP-CLEANUP-001
```

## PR作成制約

- ユーザーの明示承認がある場合だけ `/ai:diff-to-pr` スキルを実行してPR作成へ進む。
- 明示承認がない場合は `outputs/phase-13/pr-preparation.md` の作成と `blocked` 記録で終了する。

## 次のPhase

Phase -: -（全Phase完了）
