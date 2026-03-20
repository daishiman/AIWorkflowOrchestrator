# Phase 11 Manual Test Checklist

## visual evidence

- [x] `TC-11-01` review 状態を撮影した
- [x] `TC-11-02` improve_ready 状態を撮影した
- [x] `TC-11-03` reuse_ready 状態を撮影した
- [x] `TC-11-04` review board 全体を撮影した
- [x] `phase11-capture-metadata.json` を生成した
- [x] `screenshot-coverage.md` を更新した

## walkthrough

- [x] `interfaces-agent-sdk-integration.md` の 9 値テーブルを確認した
- [x] `arch-state-management-core.md` の配置ルールを確認した
- [x] `packages/shared/src/types/skill.ts` と renderer 実装の 9 値整合を確認した
- [x] `LOGS.md` / `SKILL.md` / `task-workflow-completed-skill-lifecycle-ui.md` の完了記録を確認した

## validators

- [x] targeted tests を実行した
- [x] `validate-phase11-screenshot-coverage.js` の PASS を再取得した
- [x] `validate-phase-output.js --phase 11` の PASS を再取得した
- [x] `.claude` / `.agents` parity diff 0 を確認した
