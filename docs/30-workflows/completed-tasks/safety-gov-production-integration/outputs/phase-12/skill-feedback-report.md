# Skill Feedback Report

## task-specification-creator への提案

- NON_VISUAL task では `manual-test-checklist.md` / `manual-test-result.md` を正本と見なせる一方、validator が `outputs/phase-11/screenshots` を警告し続けやすい。guide と validator の判定条件を同じルールにそろえるべき。
- Phase 12 canonical 成果物名が `implementation-guide.md` など固定でも、分割ファイルだけ存在したケースを明確に FAIL へ寄せた方が drift を減らせる。

## aiworkflow-requirements への提案

- `spec_created` workflow に後から実装差分が乗った場合、completed ledger / backlog / workflow root がドリフトしやすい。中間状態の扱いを運用ルールに追加した方がよい。
- follow-up workflow の code 先行着地時は、manual evidence の有無と ledger 反映の順序を same-wave sync として固定した方が再発しにくい。
