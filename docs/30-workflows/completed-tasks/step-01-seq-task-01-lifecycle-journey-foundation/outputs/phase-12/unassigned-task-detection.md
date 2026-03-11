# 未タスク検出結果

## 今回差分の判定

- 新規未タスク件数: 0
- `verify-unassigned-links`: 213 / 213（missing 0）
- `audit-unassigned-tasks --json --diff-from HEAD`: `currentViolations=0`, `baselineViolations=133`

## legacy baseline の継続監視

- repo 全体の参考値: `formatViolations=91`, `namingViolations=5`, `misplacedFiles=37`
- 上記は今回差分の不合格ではなく、`docs/30-workflows/unassigned-task/` 配下に継続している legacy backlog

## 既存 backlog 参照

- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-format-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-unassigned-task-legacy-normalization-001.md`
- `docs/30-workflows/unassigned-task/task-imp-phase12-unassigned-baseline-remediation-002.md`

## 判定理由

- Phase 11 で検出した 2 件は既存 visual debt の記録に留まり、Task01 の acceptance を崩さない。
- Task02-05 を進める上で blocker になる新規 gap は見つからなかった。
- 今回タスク由来の未タスクは 0 件だが、指定ディレクトリ全体の legacy baseline は別 backlog として継続管理する。
