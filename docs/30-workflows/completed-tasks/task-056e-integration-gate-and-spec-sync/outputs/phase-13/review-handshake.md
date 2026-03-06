# Phase 13 Review Handshake

## 方針

- `/.claude/commands/ai/diff-to-pr.md` に従い、main 同期済みの現ブランチ差分を commit・push・PR 作成まで進める。
- ユーザーが本ブランチで full suite を直前実行済みであり、その後の追加差分は docs / workflow / Phase 13 整備中心のため、同一コマンドの再実行は省略する。
- PR 本文には `.github/pull_request_template.md` の見出し順を維持し、`## その他` に `implementation-guide.md` 反映元と Part 1 / Part 2 要点を必ず入れる。
- 今回は product UI 実装変更がないため、PR 本文の `## スクリーンショット` は削除する。Phase 11 screenshot は workflow 証跡として維持し、PR コメントへのギャラリー投稿も省略する。

## 実行前確認

| 項目               | 判定 | 補足                                                          |
| ------------------ | ---- | ------------------------------------------------------------- |
| 現在ブランチ       | OK   | `task/task-ui-01-e-integration-gate-spec-sync-spec`           |
| `origin/main` 同期 | OK   | local `main` は `origin/main` と一致、branch 側も取り込み済み |
| 既存 PR            | OK   | `gh pr status` で current branch の PR なし                   |
| full suite 再実行  | 省略 | ユーザー実行済み、追加差分は docs / workflow / PR 材料中心    |
| Issue 同期         | OK   | `sync_new_issues.js --dry-run` で未同期 0 件                  |

## 実行手順

1. Phase 13 成果物を `outputs/phase-13/` に出力する。
2. `phase-13-pr-creation.md` / `artifacts.json` / `outputs/artifacts.json` / `index.md` を Phase 13 completed へ同期する。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` など docs 系検証を再実行する。
4. 差分を commit して branch を push する。
5. PR 本文をテンプレート準拠で作成し、PR を作成する。
6. 実装詳細コメントと `implementation-guide.md` 全文コメントを投稿し、存在確認する。
7. `gh pr checks` で CI 状態を確認する。

## 申し送り

- `TARGET_WORKFLOW_DIR` は `docs/30-workflows/completed-tasks/task-056e-integration-gate-and-spec-sync` を採用する。
- 関連 Issue セクションは「なし（未同期タスク仕様書 0 件）」で埋める。
- `implementation-guide.md` の全文コメントは `## 📖 実装ガイド（全文）` 見出しを含める。
