# UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001: `verify-all-specs` の blocked phase 判定整合

## メタ情報

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| タスクID | UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001                          |
| 分類     | 改善                                                               |
| 優先度   | 中                                                                 |
| 発見元   | TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 Phase 12 再監査（2026-03-20） |

## 目的

`verify-all-specs.js` が Phase 13 `blocked` を workflow 文脈に応じて扱えず、`outputs/verification-report.md` で `PR作成 ✅ 問題なし` と誤記録する問題を是正する。

## 対応方針

- `verify-all-specs.js` に blocked phase の許容条件を追加する
- `outputs/verification-report.md` のサマリーと Phase 別結果で blocked を表現できるようにする
- `artifacts.json.status=blocked` と verification report の結果が矛盾しないことを確認する

## 完了条件

- Phase 13 が `blocked` の workflow で verification report が blocked を明示する
- completed workflow の既存結果を壊さない
- Task04 の `outputs/verification-report.md` が手修正なしで整合する

## 検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route
```
