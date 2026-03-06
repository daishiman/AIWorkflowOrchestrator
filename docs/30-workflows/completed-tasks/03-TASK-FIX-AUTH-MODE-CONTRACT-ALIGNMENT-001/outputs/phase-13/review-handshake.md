# Phase 13 Review Handshake

## 方針

- `phase-13-pr-creation.md` の原仕様は「commit / push / PR は手動承認後」としていた。
- 2026-03-06 の本ターンでユーザーから PR 作成の明示指示があったため、この Phase 13 では commit / push / PR 作成 / CI 確認まで実行する。
- マージは引き続き GitHub UI でユーザーが手動実行する。

## 実行前確認

| 項目               | 判定 | 補足                                                                                      |
| ------------------ | ---- | ----------------------------------------------------------------------------------------- |
| 現在ブランチ       | OK   | `docs/task-fix-auth-mode-contract-alignment-001-specs-20260306`                           |
| `origin/main` 差分 | OK   | `git rev-list --left-right --count HEAD...origin/main` = `0 0`                            |
| 既存PR             | OK   | `gh pr list --head <current-branch>` = 0件                                                |
| full suite 再実行  | 省略 | ユーザーが直前に実行済みで、本ターン追加差分は主に workflow / spec / PR準備文書           |
| Issue同期          | 実施 | `task-imp-phase12-task-investigate-five-minute-card-sync-validator-001.md` -> Issue #1013 |

## 実行手順

1. Phase 13 成果物を出力する。
2. `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-13-pr-creation.md` を completed 状態へ同期する。
3. 残差分を `git add -A` で全ステージする。
4. Conventional Commit で commit する。
5. branch を `origin` へ push する。
6. `.github/pull_request_template.md` 準拠の本文で PR を作成する。
7. `implementation-guide.md` 全文コメントを投稿し、`gh api repos/.../issues/<PR>/comments` で存在確認する。
8. Phase 11 スクリーンショットギャラリーを別コメントで投稿する。
9. `gh pr checks` で CI を確認し、結果を記録する。

## 実行結果

| 項目        | 値           |
| ----------- | ------------ |
| コミットSHA | 作成後に追記 |
| PR URL      | 作成後に追記 |
| CI結果      | 確認後に追記 |

## 申し送り

- PR本文 `## その他` には [implementation-guide.md](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260306-075818-wt1/docs/30-workflows/completed-tasks/03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001/outputs/phase-12/implementation-guide.md) の反映元と 3 要点を必ず残す。
- UI/UX 変更があるため、PR本文の `## スクリーンショット` は削除せず、画像 URL を埋める。
- `implementation-guide.md` の全文コメントはサマリー不可。Part 1 / Part 2 を両方含める。
