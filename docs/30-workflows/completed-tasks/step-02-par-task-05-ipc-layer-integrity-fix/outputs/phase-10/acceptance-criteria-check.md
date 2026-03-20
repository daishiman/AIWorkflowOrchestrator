# Phase 10 受入基準最終照合

## 判定

AC-1〜AC-8 すべて PASS

## チェック結果

| AC   | 判定 | 根拠                                                                                                    |
| ---- | ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | PASS | `apps/desktop/src/main/ipc/skillHandlers.ts` に `ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, ...)` を追加 |
| AC-2 | PASS | `unregisterSkillHandlers()` に `ipcMain.removeHandler(IPC_CHANNELS.SKILL_UPDATE)` を追加                |
| AC-3 | PASS | `skillAPI.getDetail()` が `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_DETAIL, { skillId })` を呼ぶ         |
| AC-4 | PASS | `skillAPI.update()` が `safeInvokeUnwrap(IPC_CHANNELS.SKILL_UPDATE, { skillName, updates })` を呼ぶ     |
| AC-5 | PASS | Main / Preload の両方で P42 3段バリデーションを確認                                                     |
| AC-6 | PASS | `outputs/phase-10/ipc-contract-review.md` を参照                                                        |
| AC-7 | PASS | この turn の vitest で 8ファイル / 421テスト PASS                                                       |
| AC-8 | PASS | `packages/shared/src/ipc/channels.ts` を同期し、desktop/shared parity test を追加                       |

## 実測コマンド

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.update.test.ts \
  src/main/ipc/__tests__/skillHandlers.contract.test.ts \
  src/main/ipc/__tests__/skillHandlers.validation.test.ts \
  src/preload/__tests__/skill-api.getDetail-update.test.ts \
  src/preload/__tests__/skill-api.test.ts \
  src/preload/__tests__/skill-api.contract.test.ts \
  src/preload/__tests__/channels.skill-import.test.ts \
  src/preload/__tests__/channels.ipc-consolidation.test.ts \
  --reporter=verbose
```

## 補足

- `@repo/desktop` に `lint` script は存在しないため、lint は N/A
- 受入基準とは別に、`SkillService.updateSkill()` の業務ロジックは follow-up に残している
- 再監査で Main / Preload の横断 contract / validation suite を追加し、AC-7 の根拠を 8ファイル / 421テストへ強化した
