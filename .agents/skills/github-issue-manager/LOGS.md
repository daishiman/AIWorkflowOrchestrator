# Skill Usage Logs

このファイルにはスキルの使用記録が追記されます。

---


## [2026-02-25T01:32:16.500Z]
- Agent: unknown
- Phase: unknown
- Result: success
- Notes: UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001 issue #901 created after dual-pass verification
---

## [2026-04-19]
- Agent: github-issue-manager skill 更新エージェント
- Phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 12 由来（後続 wave）
- Result: success
- Source: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/skill-feedback-report.md` §5
- Scope: `.claude/skills/github-issue-manager/` のみ（`.agents/` ミラーは後続 wave）
- 実施内容:
  - PROPOSAL-GIM-01: SKILL.md Part 5「CLOSED Issue 仕様書存続モード（spec-from-closed-issue）」を追加。
    必須メタ情報 `issue_status` / `issue_closed_reason` / `spec_purpose` を定義し、
    `task-specification-creator` の `phase-template-phase1.md` とのフォーマット互換性を明記。
    使用例として TASK-EVALS-CONSUMER-AUDIT-001（Issue #2279 CLOSED 維持）を記載。
  - PROPOSAL-GIM-02: `scripts/select_issue.js` に `--include-closed-spec` フラグと
    `--help` / `-h` を追加。フラグ有効時は仕様書メタ情報 `issue_status: CLOSED` または
    `spec_purpose` を持つタスクを選択対象に含める。デフォルトは後方互換（従来挙動維持）。
    未知オプションは stderr 警告、実行時例外は stderr にメッセージ出力して exit(1)。
  - PROPOSAL-GIM-03: SKILL.md Part 5 末尾に「Issue reopen せず台帳整合を取る運用」節を追加。
    `scripts/relink_issues.js` 冒頭コメントブロックに Phase 12 close-out 時の
    台帳整合ユースケースを明記。
- 確認:
  - `node scripts/select_issue.js --help` で新フラグが表示されることを確認
  - SKILL.md 行数 500 行未満を維持
---
