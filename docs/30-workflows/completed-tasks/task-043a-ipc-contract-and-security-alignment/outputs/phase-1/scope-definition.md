# Phase 1 スコープ定義

## 対象（In Scope）

- `apps/desktop/src/main/ipc/skillHandlers.share.ts`
- `apps/desktop/src/main/ipc/__tests__/skillHandlers.share.test.ts`
- `apps/desktop/src/preload/__tests__/skill-api.contract.test.ts`
- `apps/desktop/scripts/capture-task-043a-phase11-screenshots.mjs`
- `docs/30-workflows/task-043a-ipc-contract-and-security-alignment/outputs/phase-*`

## 非対象（Out of Scope）

- 新規 IPC チャネル追加
- `skill:import` の公開 API 仕様変更
- Phase 13（コミット/PR作成）
- Renderer 大規模 UI リニューアル

## 境界条件

- Import 導線は `skill:import` を維持する
- share 導線（`skill:importFromSource`）は専用導線のみで使用する
- エラーコードは `ERR_1001/2004/5001` へ集約する
