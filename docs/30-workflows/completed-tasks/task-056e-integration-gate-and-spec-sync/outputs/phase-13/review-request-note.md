# Phase 13 レビュー依頼文

## レビュー観点

1. completed-tasks への移管後も、`task-056e-integration-gate-and-spec-sync` を正本として parent docs / system spec / skill docs / Phase 12 証跡の参照先が崩れていないか。
2. `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` に追加した教訓とテンプレート改善が、task-056e の実績値と矛盾していないか。
3. Phase 13 追加成果物が `.github/pull_request_template.md` と `/.claude/commands/ai/diff-to-pr.md` の要件を満たし、`implementation-guide.md` の Part 1 / Part 2 を PR 本文と PR コメントへ反映できる構成になっているか。
4. 本差分は UI/UX 実装変更ではなく docs / workflow / PR 導線整備であるため、PR 本文から `## スクリーンショット` を削除する判断が妥当か。
5. `UT-IMP-PHASE12-TASK-SPEC-RECHECK-ADOPTION-001` の扱いが「残差 backlog」として適切で、今回 PR に含める completed 側の参照と将来の採用強制改善が切り分けられているか。

## reviewer への補足

- user 実行済み full suite は PR 本文と `verification-command-summary.md` に反映する。
- 本ターンの追加検証は workflow / spec / Phase 13 出力整合を中心に行う。
- `implementation-guide.md` 全文コメントは要約せず Part 1 / Part 2 をそのまま投稿する。
