# Phase 7 Uncovered Risks

- repo 全体の baseline unassigned violations 377 件は今回 task の current FAIL 判定には使わないが、資産健全性として残る
- docs-heavy follow-up に code hardening が追加された場合、source workflow narrative を同ターンで戻さないと証跡が stale になりうる
- `esbuild` mismatch blocker は環境依存のため、ローカル差異で test 実行可否が変わる可能性がある
