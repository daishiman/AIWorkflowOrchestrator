# Phase 11 Output: Manual Test Plan

## 実行方針

1. `vite.e2e.config.ts` を使って current worktree の renderer を `http://127.0.0.1:5173` で起動する
2. `screenshot-plan.json` に定義した 13 state を Playwright で撮影する
3. 各 png を Apple の UI/UX engineer 観点で目視確認し、`manual-test-result.md` と `discovered-issues.md` に記録する

## 代表画面と目的

| グループ | テストケース                      | 目的                                                   |
| -------- | --------------------------------- | ------------------------------------------------------ |
| Batch A  | TC-01, TC-02                      | shared selector control の light readability を検証    |
| Batch B  | TC-03, TC-04, TC-05, TC-06, TC-07 | settings authenticated surface と danger dialog を検証 |
| Batch C  | TC-08                             | auth entry の error readability を検証                 |
| Batch D  | TC-09, TC-10                      | workspace search panel の success/error surface を検証 |
| Batch E  | TC-11, TC-12, TC-13               | representative shell と theme smoke を検証             |

## 実行コマンド

```bash
cd apps/desktop
pnpm exec vite --config vite.e2e.config.ts --host 127.0.0.1

node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/completed-tasks/light-theme-shared-color-migration \
  --plan outputs/phase-11/screenshot-plan.json \
  --url http://127.0.0.1:5173 \
  --wait 1500
```

## 目視評価観点

- Typography: primary / secondary text の hierarchy が自然か
- Contrast: background / border / status color が light theme で十分に分離されるか
- Rhythm: card / section / modal の余白が 8px grid で乱れていないか
- Semantics: success / warning / error / inverse text が semantic token に一致して見えるか
