# Phase 13: PR作成

## メタ情報

| 項目       | 値                          |
| ---------- | --------------------------- |
| Phase      | 13                          |
| 機能名     | task-rt-05-test-rerun-ac4   |
| 前提Phase  | Phase 12                    |
| 後続Phase  | なし                        |
| ステータス | blocked（ユーザー承認待ち） |
| 作成日     | 2026-03-31                  |

## 目的

**PR作成はユーザーの明示的な承認後のみ実施する。自動実行禁止。**

Phase 1〜12 が全て完了した後、ユーザーの承認を得て PR を作成する。

## 実行タスク

- Phase 1 要件定義、Phase 2 設計、Phase 5 実装、Phase 6 テスト拡充、Phase 7 カバレッジ、Phase 8 リファクタリング、Phase 9 品質保証、Phase 10 最終レビュー、Phase 11 手動テスト、Phase 12 ドキュメント更新の成果物を確認し、PR 事前条件を棚卸しする
- `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を準備する
- ユーザー承認未取得の間は `blocked` を維持し、push / PR create を実行しない

### タスク1: PR 作成前チェック

**目的**: PR 作成に必要な条件が揃っていることを確認する

**チェックリスト**:

- [ ] Phase 1〜12 が全て `completed` または `na` である
- [ ] Phase 11 の `outputs/phase-11/manual-test-result.md` が存在し、close-out 入力として参照済みである
- [ ] `outputs/phase-9/quality-report.md` が PASS 状態である
- [ ] TASK-RT-05 の `outputs/phase-9/quality-report.md` が PASS 状態に更新されている
- [ ] TASK-RT-05 の `outputs/phase-10/final-review-result.md` の AC-4 が PASS に更新されている
- [ ] `pnpm typecheck` が PASS している
- [ ] `pnpm lint` が PASS または既知警告として記録されている
- [ ] ユーザーの明示的な PR 作成承認がある

### タスク2: PR 作成

**目的**: 変更内容を PR としてリモートに公開する

**PR 内容**:

```
タイトル: [TASK-RT-05-TEST-RERUN] multi_select Phase 9/10 テスト再実行・AC-4 既存kind非破壊確認 (#1756)

本文:
## 概要

TASK-RT-05（multi_select-user-input-kind）の Phase 9/10 環境ブロックを解消し、
テスト再実行と関連ドキュメント更新を完了した。

## 変更内容

- `outputs/phase-9/quality-report.md` を「PASS」状態に更新（AC-4）
- `outputs/phase-10/final-review-result.md` の AC-4 を「PASS」に更新（AC-5）
- TASK-RT-05-TEST-RERUN タスク仕様書を新規作成

## テスト結果

- Engine テスト: N 件 PASS
- Renderer テスト: N 件 PASS
- 既存 4 kind 回帰: PASS
- typecheck: PASS
- lint: PASS

## 関連 Issue

Close #1756
```

**実行コマンド**:

```bash
# ブランチ push
git push -u origin feat/task-rt-05-test-rerun-ac4-spec

# PR 作成
gh pr create \
  --title "[TASK-RT-05-TEST-RERUN] multi_select Phase 9/10 テスト再実行・AC-4 既存kind非破壊確認 (#1756)" \
  --body "..." \
  --base main
```

## 参照資料

| 資料名                | パス                                                                           | 内容                 |
| --------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Phase 1 要件定義      | `phase-1-requirements.md`                                                      | AC と scope の根拠   |
| Phase 2 設計          | `phase-2-design.md`                                                            | rerun と update 計画 |
| Phase 5 実装          | `phase-5-implementation.md`                                                    | 環境再構築結果       |
| Phase 6 テスト拡充    | `phase-6-test-expansion.md`                                                    | AC-3 事前確認        |
| Phase 7 カバレッジ    | `phase-7-coverage-check.md`                                                    | AC 対応表            |
| Phase 8 N/A 根拠      | `phase-8-refactoring.md`                                                       | no-op 判定           |
| Phase 9 品質保証      | `phase-9-quality-assurance.md`                                                 | test rerun の記録    |
| Phase 10 最終レビュー | `phase-10-final-review.md`                                                     | 親 workflow 更新根拠 |
| Phase 11 成果物       | `outputs/phase-11/manual-test-result.md`                                       | close-out 入力       |
| Phase 12 完了確認     | `phase-12-documentation.md`                                                    | 完了条件             |
| review-gate           | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | PR 作成ゲート        |

## 成果物

| 成果物           | パス                                     | 内容              |
| ---------------- | ---------------------------------------- | ----------------- |
| PR 作成仕様      | `phase-13-pr-creation.md`                | PR 作成手順と条件 |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | 事前確認の要約    |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | approval 用要約   |
| PR 結果          | `outputs/phase-13/pr-result.md`          | PR URL と確認結果 |

## 完了条件

- [ ] ユーザーの明示的な PR 作成承認がある（自動実行禁止）
- [ ] PR 作成前チェックリストが全項目 PASS している
- [ ] `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` が作成されている
- [ ] PR が作成され URL が記録されている
- [ ] `outputs/phase-13/pr-result.md` に PR URL が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- ユーザー承認未取得の間は `artifacts.json` の Phase 13 ステータスを `blocked` のまま維持する
- `outputs/phase-13/local-check-result.md` と `outputs/phase-13/change-summary.md` を準備する
- `outputs/phase-13/pr-result.md` を作成し、PR URL と CI 状態を記録する
- ユーザー承認後にのみ `artifacts.json` の Phase 13 ステータスを `completed` に更新する
- **PR 作成はユーザーの明示承認後のみ実行すること**
