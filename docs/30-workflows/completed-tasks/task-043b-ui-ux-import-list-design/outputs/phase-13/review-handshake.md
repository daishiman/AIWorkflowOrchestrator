# Phase 13 Review Handshake

## 方針

- `/.claude/commands/ai/diff-to-pr.md` に従い、remote main 同期、品質確認、commit、push、PR 作成、補足コメント、CI 確認まで実行する。
- ユーザーが直前に full suite を実行済みで、main 取り込み後の追加差分は runtime 変更を含まないため、同一コマンドの再実行は省略可能と判断する。
- PR マージは引き続き GitHub UI でユーザーが手動実行する。

## 実行前確認

| 項目               | 判定 | 補足                                                                    |
| ------------------ | ---- | ----------------------------------------------------------------------- |
| 現在ブランチ       | OK   | `task/task-043b-ui-ux-import-list-design-specs`                         |
| `origin/main` 同期 | OK   | branch へ `main` merge 済み、unmerged なし                              |
| 既存 PR            | OK   | `gh pr list --head task/task-043b-ui-ux-import-list-design-specs` = 0件 |
| full suite 再実行  | 省略 | ユーザー実行済み、merge 後の追加差分は docs / workflow / PR 準備中心    |
| Issue 同期         | OK   | `sync_new_issues.js --dry-run` で未同期 0 件                            |

## 実行手順

1. Phase 13 成果物を出力する。
2. `artifacts.json` / `outputs/artifacts.json` / `index.md` / `phase-13-pr-creation.md` を completed 状態へ同期する。
3. 残差分を `git add -A` で全ステージする。
4. Conventional Commit で commit する。
5. branch を `origin` へ push する。
6. `.github/pull_request_template.md` 準拠の本文で PR を作成する。
7. `implementation-guide.md` 全文コメントを投稿し、Issue comments API で存在確認する。
8. Phase 11 スクリーンショットギャラリーをコメントで投稿する。
9. `gh pr checks` で CI を確認し、結果を記録する。

## 申し送り

- PR 本文 `## その他` には `outputs/phase-12/implementation-guide.md` の反映元と 3 要点を必ず残す。
- UI/UX 変更があるため、PR 本文の `## スクリーンショット` は削除せず、png の raw URL を埋める。
- `implementation-guide.md` の全文コメントは要約不可。Part 1 / Part 2 をそのまま含める。
- reviewer 向け説明は imported / available / dialog / focus / error の 5 観点に寄せる。
