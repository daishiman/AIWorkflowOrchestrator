# Phase 11 手動テスト結果

## 実施日

2026-04-03

## テスト環境

- OS: macOS 26.3.1
- Playwright: v1.58.2
- プロジェクト: ui-ux-layer2
- checklist: `outputs/phase-11/manual-test-checklist.md`
- screenshot plan: `outputs/phase-11/screenshot-plan.json`

## 視認確認チェックリスト

- [x] error-display のスクリーンショットが意図通りのエラー表示になっている
- [x] loading-state のスクリーンショットがローディング状態を正しく表現している
- [x] dark-mode のスクリーンショットがダークモードで正しく表示されている
- [x] OnboardingWizard の inert 属性による変化が適切に反映されている

## 各 surface の確認詳細

### TC-11-05 error-display

- `outputs/phase-11/screenshots/error-display.png` を確認した。
- サイドバー、本文カード、タイトルの配置が崩れておらず、暗色テーマのまま安定している。
- エラー表示のベースラインとして問題ない。

### TC-11-06 loading-state

- `outputs/phase-11/screenshots/loading-state.png` を確認した。
- 余白、カード幅、段組みが error-display と同じ shell 上で揃っている。
- レイアウトの飛びや欠けは見られない。

### TC-11-07 dark-mode

- `outputs/phase-11/screenshots/dark-mode.png` を確認した。
- 暗色背景、文字色、カードの輪郭が安定しており、OS テーマ由来の揺れは見えない。
- `colorScheme: "dark"` 固定の狙いに合致している。

## baseline 画像の確認

- baseline 画像は `apps/desktop/e2e/ui-ux/layer2-visual.spec.ts-snapshots/` にあり、更新済みの見た目と一致している。
- HTML レポートは `apps/desktop/playwright-report/index.html` を生成して確認した。

## 総合判定

PASS

## 特記事項

- 視認確認用の画像は `outputs/phase-11/screenshots/` に保存した。
- 変更対象の layout は 3 surface とも安定しており、追加の修正は不要。
