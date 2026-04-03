# Phase 2: 設計

## 方針

今回の対処は、`OnboardingWizard` の意図した UI 変更を baseline と整合させたうえで、`dark-mode` の再現性を `colorScheme: "dark"` で固定する構成にする。

## 判定フロー

1. `git log --follow -- apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx` を確認する。
2. `git log -- apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` を確認する。
3. `51b3fc0c2` で UI と snapshots が同時更新されている場合は、UI 変更起因と判断する。
4. regression 起因なら `apps/desktop/src/renderer/` の関連 UI を修正する。

## baseline 更新設計

- 更新は `--update-snapshots` を使って `ui-ux-layer2` のみ実行する。
- 更新後は `git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` で 3 surface だけを確認する。
- 3 surface 以外が変わった場合は `git restore --source=HEAD -- <path>` で戻す。

## UI 修正設計

- regression 起因なら `error-display` / `loading-state` / `dark-mode` の該当コンポーネントだけ修正する。
- 修正後は `pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2` を再実行する。

## dark-mode 安定化

### 設定箇所

- `apps/desktop/playwright.config.ts:54`
- `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts:18`

### 設計意図

- `ui-ux-layer2` だけに `colorScheme: "dark"` を当てて、OS テーマ依存を切り離す。
- `maxDiffPixels` は `20 / 30 / 50` のまま維持し、200px の上限を超えない。

## 実施コマンド

```bash
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2
pnpm --filter @repo/desktop exec playwright test --project=ui-ux-layer2 --update-snapshots
git diff --name-only apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/
```

## 設計結論

baseline drift の根本原因は「意図した UI 変更と snapshot 再生成のタイミング差」であり、追加の UI バグ修正は不要。  
現行の対処は、dark-mode の固定を入れて再現性を上げつつ、既存 snapshots を基準として維持する。
