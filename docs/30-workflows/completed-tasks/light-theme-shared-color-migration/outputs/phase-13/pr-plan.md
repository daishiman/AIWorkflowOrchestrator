# Phase 13 成果物: pr-plan

## メタ情報

| 項目                 | 内容                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------- |
| workflow             | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/`                                         |
| branch               | `docs/task-fix-light-theme-shared-color-migration-specs-20260312`                                               |
| base                 | `main`                                                                                                          |
| implementation-guide | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-12/implementation-guide.md` |
| screenshots          | `docs/30-workflows/completed-tasks/light-theme-shared-color-migration/outputs/phase-11/screenshots/`            |

## 実行方針

1. `origin/main` と local `main` の同期を確認する。
2. feature branch を `main` へ fast-forward し、stash restore 後の競合を解消する。
3. current diff を `completed-tasks/light-theme-shared-color-migration` 正本へ寄せ直す。
4. `github-issue-manager` で未同期仕様書がないことを再確認する。
5. PR本文は `.github/pull_request_template.md` の見出し順を守り、`implementation-guide.md` の要点を `## その他` に必ず反映する。
6. UI変更ありとして、Phase 11 screenshot を PR本文と PRコメントへ添付する。

## 検証計画

| 種別               | 実施内容                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 履歴確認           | `.zsh_history` で `pnpm typecheck` / `pnpm lint` / `pnpm test --testTimeout=900000` / `pnpm --filter @repo/shared build` / `pnpm --filter @repo/desktop build` の直前実行を確認 |
| workflow validator | `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide`                                                 |
| 未タスク/Issue     | `verify-unassigned-links` / `audit-unassigned-tasks --diff-from HEAD` / `sync_new_issues.js --check`                                                                            |

## PR下書き方針

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タイトル候補 | `fix(light-theme): shared color migration の completed workflow 移管と PR 同期` |
| 関連Issue    | `#1156` を親 task として参照し、follow-up は body に補足する                    |
| 変更タイプ   | bug fix / documentation / test                                                  |
| 手動テスト   | Phase 11 screenshot 8件と Apple UI/UX review を根拠に記載                       |

## 補足

- merge 後の再適用差分は `AuthView` / `package.json` / workflow root path sync が中心で、ユーザーが直前に実行した全量コマンドの再実行は必須ではない前提で進める。
- PR作成後は `implementation-guide.md` 全文コメント、スクリーンショットギャラリーコメント、CI確認結果を Phase 13 成果物へ追記する。
