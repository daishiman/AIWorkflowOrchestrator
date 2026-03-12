# Phase 11 Manual Test Plan

## 対象環境

- Harness: `apps/desktop/src/renderer/phase11-onboarding-wizard.tsx`
- Capture: `pnpm --filter @repo/desktop screenshot:task-061-onboarding-wizard`
- Browser: Playwright Chromium headless

## 実施ケース

| ID | 目的 | 条件 |
| --- | --- | --- |
| TC-11-01 | 初回起動の desktop / light overlay を確認する | `surface=dashboard&theme=light&completed=false` |
| TC-11-02 | tablet / dark の Step 3 tool selection を確認する | Step 1-2 を進めた後に撮影 |
| TC-11-03 | mobile / kanagawa-dragon の Step 4 theme selection を確認する | Step 1-3 を進めた後に撮影 |
| TC-11-04 | settings rerun entry の見え方を確認する | `surface=settings&theme=dark&completed=true` |
| TC-11-05 | rerun button から dashboard overlay が再表示されることを確認する | TC-11-04 の画面で button click |
| TC-11-06 | keyboard / focus trap を確認する | `Shift+Tab`, `Tab`, `Escape` spot check |

## 判定基準

- overlay が中央に固定され、背景 dashboard を阻害しすぎない。
- mobile でも step chip と card が破綻しない。
- rerun section の文言と CTA が即読できる。
- `Shift+Tab` で `あとで` に戻り、`Tab` で名前入力へ循環し、`Escape` で閉じる。
