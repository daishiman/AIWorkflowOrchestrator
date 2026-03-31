# TASK-P0-08 Documentation Changelog

## コード変更

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
  - session repository 配線
  - phase boundary checkpoint 保存
  - repository 経由の list/detail/resume/delete
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.session-persistence.test.ts`
  - persistence regression test 4件追加

## 仕様変更

- `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-details.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.agents/skills/aiworkflow-requirements/*` mirror sync

## 成果物修正

- Phase 11: false positive な「完了」表現を除去し、screenshot gap を明記
- Phase 12: implementation guide / system spec summary / compliance / feedback / unassigned を current facts に更新
- follow-up `UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001` を backlog 前提の記述へ同期

## 実行検証

| コマンド                                                                                | 結果            |
| --------------------------------------------------------------------------------------- | --------------- |
| `pnpm --dir apps/desktop exec vitest run ...session-persistence... ...sessionResume...` | PASS (35 tests) |
| `pnpm exec tsc -p apps/desktop/tsconfig.json --noEmit`                                  | PASS            |

## 未完了

- `outputs/phase-11/screenshots/` の実画像取得
