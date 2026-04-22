# traceability-matrix.md — Phase 7 トレーサビリティマトリクス

> タスクID: UNASSIGNED-EVALS-SPEC-SNAKE-CASE-V1-DOCUMENT-001  
> 作成日: 2026-04-21  
> フェーズ: Phase 7（カバレッジ確認）

---

## AC vs 成果物マトリクス

| AC ID | 受入基準                                                            | 確認成果物                                                             | 判定 |
| ----- | ------------------------------------------------------------------- | ---------------------------------------------------------------------- | ---- |
| AC-1  | `levels` が静的オブジェクトとして定義され、未保持スキルの扱いも明記 | `evals-schema-spec.md` §3.4、`phase-6/dual-root-verification.md` SC-01 | PASS |
| AC-2  | `average_satisfaction` が型・意味・観測値ベースで定義               | `evals-schema-spec.md` §3.3、`phase-6/dual-root-verification.md` SC-02 | PASS |
| AC-3  | v1 固有フィールドと v2 の関係が比較対象として整理                   | `evals-schema-spec.md` §3.4.5、§3 対照テーブル修正                     | PASS |
| AC-4  | v1/v2 の関係が断定なし・両立スタイル                                | `evals-schema-spec.md` §3.1（変更なし）、§3.4.5 比較記述               | PASS |
| AC-5  | `.claude/skills` と `.agents/skills` の parity                      | `phase-6/dual-root-verification.md` SC-04（差分ゼロ確認）              | PASS |

## ゲート判定

全 AC が PASS → Phase 8 へ進む。差し戻しなし。
