# Phase 11 手動テスト計画

## 環境

- 実行日: 2026-03-06
- 画面: `/advanced/skill-management-panel`
- Browser: Playwright Chromium (headless)
- Viewport: desktop 1440x900 / mobile 390x844
- Theme: light / dark

## 実施順

1. mixed state
2. imported empty
3. no-result
4. error alert
5. dialog open
6. import success
7. keyboard
8. dark mode
9. nullish metadata

## Apple UI/UX review 観点

- hierarchy: heading > search > state feedback > sections が明快か
- motion / flow: row CTA から dialog、成功後 imported への視線移動が自然か
- legibility: light / dark / mobile で contrast が保たれているか
- cognitive load: error / success が重複せず 1 面で理解できるか
