# Phase 9: 品質保証

## 目的

targeted test、type、spec parity の 3 系統で品質を保証する。

## チェック項目

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- SkillCreatorService
```

追加で以下を確認する。

- `artifacts.json` と `outputs/artifacts.json` の一致
- `index.md` と各 phase の成果物名一致

## 成果物

| 成果物              | パス                                     |
| ------------------- | ---------------------------------------- |
| quality gate report | `outputs/phase-9/quality-gate-report.md` |

## 完了条件

- [ ] typecheck 方針が記録されている
- [ ] targeted test 方針が記録されている
- [ ] spec parity 確認が含まれている
