# [#1757] [TASK-RT-05-PR13] multi_select Phase 13 PR作成・CI確認

## メタ情報

```yaml
issue_number: 1757
title: [TASK-RT-05-PR13] multi_select Phase 13 PR作成・CI確認
state: OPEN
priority: 中
scale: -
category: release
status: pending
created_date: 2026-03-30
updated_date: 2026-03-30
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1757
dependencies: []
```

| 項目       | 内容    |
| ---------- | ------- |
| 優先度     | 中      |
| 規模       | -       |
| ステータス | pending |

---

## 概要

TASK-RT-05（multi_select-user-input-kind）のコード実装は完了しており、main ブランチへのマージ準備が整っている。しかし Phase 13（PR作成・CI確認）が最小限の記述しかない状態で停止しており、PR 作成手続きが未完了のままである。

## 背景

worktree が detached HEAD 状態のため、通常の PR 作成フロー（`gh pr create`）を適用する前にブランチ切り出しが必要になるという固有の問題がある。

## 依存タスク（先行完了必須）

| タスクID              | 関係     | 補足                                   |
| --------------------- | -------- | -------------------------------------- |
| TASK-RT-05-PHASE11    | 先行必須 | Phase 11 証跡取得が未完了ならブロック  |
| TASK-RT-05-TEST-RERUN | 先行必須 | テスト再実行 PASS が未確認ならブロック |

## 最終ゴール

- GitHub 上に TASK-RT-05-multi-select の PR が作成された状態
- CI/CD の全ジョブが GREEN
- レビュワーが指定され、TASK-RT-05 の Issue が PR にリンクされている
- PR 本文に multi_select 実装の概要・受入条件・テスト証跡リンクが含まれる

## 受入条件

| 条件              | 内容                                         |
| ----------------- | -------------------------------------------- |
| PR 作成           | GitHub 上に PR が作成されている              |
| PR ベースブランチ | `main` ブランチを対象としている              |
| PR 本文           | 概要・受入条件・テスト証跡リンクが含まれる   |
| CI/CD             | 全チェックが PASS                            |
| レビュワー        | 1名以上指定されている                        |
| Issue リンク      | TASK-RT-05 の Issue が PR にリンクされている |

## 苦戦箇所と知見

### 苦戦箇所1: worktree detached HEAD 状態からのPR作成

- **問題**: worktree が detached HEAD 状態のため、`gh pr create` を実行してもエラーになる
- **解決策**: PR 作成前に `git checkout -b feature/task-rt-05-multi-select` を実行してブランチを切り出す

```bash
git checkout -b feature/task-rt-05-multi-select
git push -u origin feature/task-rt-05-multi-select
```

### 苦戦箇所2: 前提タスク完了確認の忘れ防止

- **問題**: Phase 11 証跡取得とテスト再実行が未完了の状態でPR作成を開始するとテスト証跡リンクを含められない
- **解決策**: Phase 1 を必須フェーズとして設け、前提タスクの完了確認を PR 作成前の強制チェックポイントとする

## 推奨アプローチ

`/ai:diff-to-pr` スキルを使うことを強く推奨する。ただし **detached HEAD 状態の場合は先にブランチを切り出すこと**。

## 関連情報

- 親タスク: TASK-RT-05 (multi_select-user-input-kind)
- 前提: TASK-RT-05-PHASE11（#1755）、TASK-RT-05-TEST-RERUN（#1756）
- 仕様書: `docs/30-workflows/unassigned-task/task-rt-05-pr13-preparation.md`
