# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | TASK-SC-ABORT-SIGNAL-CREATE-SKILL-001 |
| 作成日 | 2026-04-19                            |

## 目的

typecheck、targeted test、Abort 契約、artifact parity をまとめて確認する。

## 実行タスク

1. 型チェックを実行する
2. targeted test を実行する
3. artifact parity と NON_VISUAL 方針を確認する

## 参照資料

| 資料      | パス                                        | 用途            |
| --------- | ------------------------------------------- | --------------- |
| Phase 7   | `phase-7-coverage-check.md`                 | coverage 引継ぎ |
| artifacts | `artifacts.json` / `outputs/artifacts.json` | parity          |

## 実行手順

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test:run -- \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts \
  apps/desktop/src/main/services/skill/__tests__/SkillCreatorService-cancel.test.ts
```

## 統合テスト連携

- Phase 10 はこのコマンド結果を final review に集約する
- Phase 11 は NON_VISUAL evidence へ転記する

## 成果物

- `outputs/phase-9/quality-report.md`
- `outputs/phase-9/command-log.md`
- `outputs/phase-9/mirror-parity-summary.md`

## 完了条件

- [ ] typecheck と targeted test の確認手順がある
- [ ] artifacts parity を品質観点に含めている
- [ ] NON_VISUAL 方針を Phase 11 へ渡せる
