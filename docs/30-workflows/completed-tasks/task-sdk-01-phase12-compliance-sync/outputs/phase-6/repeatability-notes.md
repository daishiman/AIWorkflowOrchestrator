# Phase 6 Repeatability Notes

- `generate-index.js --regenerate` を再実行しても parent `index.md` の Phase 12/13 status は変化しない
- `validate-phase-output.js` は placeholder 補助成果物が揃っている限り warning 0 を維持する
- `audit-unassigned-tasks --target-file` は repo baseline を保持したまま `currentViolations.total = 0` を返す
