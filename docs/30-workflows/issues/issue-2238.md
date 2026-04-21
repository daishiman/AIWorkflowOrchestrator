# [#2238] [TASK-CI-FUTURE-012] Codecov PR コメント自動投稿

## メタ情報

```yaml
task_id: TASK-CI-FUTURE-012
task_name: Codecov PR コメント自動投稿
category: CI改善 / 機能追加
target_feature: GitHub Actions CI / Codecov
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-CI-FUTURE-007 Phase 12 未タスク検出（将来の改善候補）
created_date: 2026-04-16
dependencies:
  - TASK-CI-FUTURE-007（backend codecov upload 完了が前提）
spec_path: docs/30-workflows/unassigned-task/TASK-CI-FUTURE-012-codecov-pr-comment.md
```

## 概要

TASK-CI-FUTURE-007 にて `@repo/backend` の Codecov カバレッジアップロードを main push 時のみ実施する設計を選択した。この設計はCI実行時間を最小化できるが、PRレビュー時にカバレッジ変化が Codecov PR コメントとして表示されない問題がある。

PR マージ前にカバレッジ劣化を自動検知できるよう、`@repo/backend` の PR 時カバレッジ収集と Codecov PR コメント自動投稿を有効化する。

## 現状の問題

- `test-web` ジョブのカバレッジ収集は `push` の main ブランチのみに制限されている
- PR 時に `VITEST_SHARDED_COVERAGE` が有効化されず、Codecov へのアップロードが行われない
- PR マージ後に初めてカバレッジ劣化が発覚するリスクがある

## 主な変更対象

- `.github/workflows/ci.yml` — PR 時の backend coverage 収集条件追加
- `codecov.yml` — PR コメント設定（`comment` セクション）有効化 + `after_n_builds: 2` 設定

## 苦戦箇所（TASK-CI-FUTURE-007 から引き継いだ知見）

| 症状                                    | 原因                                                          | 対応                                                |
| --------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| シャード別アーティファクト名が衝突      | PR ごとに同名を使用すると `if-no-files-found: error` が誤発火 | `${{ github.run_id }}` をアーティファクト名に含める |
| `coverage` ジョブが PR でスキップされる | `if:` 条件が main push のみになっている                       | `github.event_name == 'pull_request'` を OR で追加  |
| PR コメントが 1 シャード分で早期投稿    | `after_n_builds` 未設定でシャード数 < 2 の時点で投稿          | `codecov.yml` に `after_n_builds: 2` を追加         |
| Codecov がコメントを投稿できない        | `pull-requests: write` 権限が未付与                           | `ci.yml` の `permissions` ブロックに追加            |

## 参照

- 仕様書: `docs/30-workflows/unassigned-task/TASK-CI-FUTURE-012-codecov-pr-comment.md`
- 前提タスク: `docs/30-workflows/task-ci-future-007-backend-codecov-upload/`
- 関連 Issue: #2186 (TASK-CI-FUTURE-007, CLOSED)
