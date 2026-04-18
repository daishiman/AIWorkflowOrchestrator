# Phase 13: PR作成

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 12                               |
| 後続Phase  | -                                      |
| 作成日     | 2026-04-15                             |
| ステータス | blocked                                |

## 目的

commit / push / PR 作成はユーザー承認後のみ実施する。
本 Phase では blocked 状態のまま、
PR 作成に必要なメタ情報と補助成果物を整理する。

## 実行タスク

- 変更サマリーを整理する
- blocked 理由を明文化する
- PR 作成情報（ブランチ名・タイトル・本文テンプレート）を記録する
- ローカル確認結果を「未実行 / blocked」の事実として記録する
- commit / push / PR は実行しない

## PR 作成情報（ユーザー承認後に使用）

### ブランチ名

```text
docs/TASK-SW-STREAM-002-phase12-docs
```

### PR タイトル

```text
docs(skill-creator): TASK-SW-STREAM-002 Phase12-13 成果物ドキュメント追加
```

### PR 本文テンプレート

```markdown
## Summary

- TASK-SW-STREAM-002 の workflow を close-out / current facts として再整備
- Phase 11 の NON_VISUAL 証跡束と Phase 12 narrative を同期
- Phase 13 は blocked のまま PR 情報だけを記録

## Test plan

- [ ] `node .agents/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/p02-par-STREAM-002`
- [ ] `node .agents/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/p02-par-STREAM-002`
- [ ] `node .agents/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/p02-par-STREAM-002`

## Related

- Depends on: TASK-SW-STREAM-001
```

## 実行手順

### 1. blocked 状態の記録

- `outputs/phase-13/pr-info.md` に PR 作成情報を記録する
- `outputs/phase-13/local-check-result.md` に「未実行 / blocked」の事実を記録する
- `outputs/phase-13/change-summary.md` に本 workflow の要約を記録する

### 2. ユーザー承認後のみ実施するコマンド

```bash
git checkout -b docs/TASK-SW-STREAM-002-phase12-docs
git add docs/30-workflows/p02-par-STREAM-002/
git commit -m "docs(skill-creator): TASK-SW-STREAM-002 Phase12-13 成果物ドキュメント追加"
git push -u origin docs/TASK-SW-STREAM-002-phase12-docs
gh pr create --title "docs(skill-creator): TASK-SW-STREAM-002 Phase12-13 成果物ドキュメント追加"
```

## 禁止事項

- commit（ユーザー承認なしに実行禁止）
- push（ユーザー承認なしに実行禁止）
- PR 作成（ユーザー承認なしに実行禁止）

## 参照資料

| 資料名                | パス                                          | 説明               |
| --------------------- | --------------------------------------------- | ------------------ |
| Phase 2 設計          | `outputs/phase-2/design.md`                   | 設計根拠           |
| Phase 5 実装          | `outputs/phase-5/implementation-summary.md`   | current facts      |
| Phase 6 テスト拡充    | `outputs/phase-6/test-expansion-record.md`    | follow-up 根拠     |
| Phase 7 カバレッジ    | `outputs/phase-7/coverage-report.md`          | 品質根拠           |
| Phase 8 リファクタ    | `outputs/phase-8/refactoring-log.md`          | no-op 判断根拠     |
| Phase 9 品質保証      | `outputs/phase-9/quality-report.md`           | close-out 品質判定 |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`     | ゲート判定         |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`      | NON_VISUAL 証跡    |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md` | Phase 12 成果物    |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`    | Phase 12 成果物    |
| change summary        | `outputs/phase-13/change-summary.md`          | blocked 要約       |
| local check result    | `outputs/phase-13/local-check-result.md`      | blocked 記録       |
| PR情報                | `outputs/phase-13/pr-info.md`                 | PR メタ情報        |

## 成果物

| 成果物           | パス                                     | 説明         |
| ---------------- | ---------------------------------------- | ------------ |
| PR情報           | `outputs/phase-13/pr-info.md`            | PR メタ情報  |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | blocked 記録 |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更要約     |

## 完了条件

- [x] 変更サマリーを記録した
- [x] PR タイトル・ブランチ名・本文テンプレートを記録した
- [x] blocked 状態を記録した
- [x] commit / push / PR を実行していない
- [x] 本Phase内の全タスクを100%実行完了（blocked gate）

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] ユーザーの許可なしに commit / push / PR を実行していない
- [x] 実行記録を残した

## タスク完了

Phase 13 は **blocked**。ユーザー承認後にのみ別途 PR 作成へ進む。
