# Phase 11 成果物: manual-test-plan

## 目的

ライトテーマ token 基盤変更が代表4画面に反映されているかを、Apple UI/UX 観点で視覚検証する。

## 実施環境

| 項目           | 値                                                                      |
| -------------- | ----------------------------------------------------------------------- |
| 実施日         | 2026-03-11                                                              |
| viewport       | 1440x900                                                                |
| capture base   | `http://127.0.0.1:4173`                                                 |
| capture script | `apps/desktop/scripts/capture-light-theme-token-foundation-phase11.mjs` |

## テストケース

| TC-ID    | 画面                       | 目的                                         | 優先度 |
| -------- | -------------------------- | -------------------------------------------- | ------ |
| TC-11-01 | Dashboard（light）         | 白背景と黒文字の基準、一貫した情報階層を確認 | A      |
| TC-11-02 | Settings（light）          | 補助テキストと境界線の視認性を確認           | A      |
| TC-11-03 | Auth shell（light）        | 本文と背景の分離を確認                       | A      |
| TC-11-04 | AgentView（light）         | card群/ボタン/補助文の token 適用を確認      | A      |
| TC-11-05 | Dashboard（dark baseline） | light 改善の比較基準を確保                   | B      |

## 実行手順

1. `pnpm --filter @repo/desktop exec vite --config vite.e2e.config.ts --host 127.0.0.1 --port 4173 --strictPort`
2. `pnpm --filter @repo/desktop exec node scripts/capture-light-theme-token-foundation-phase11.mjs`
3. `outputs/phase-11/screenshots/*.png` と `phase11-capture-metadata.json` を確認
4. Apple UI/UX 観点（階層・可読性・コントラスト・余白）でレビュー

## Apple UI/UX チェック項目

- 背景階層: 白背景が崩れず、カードや区切りで情報階層が見分けられるか
- 可読性: secondary/tertiary text が背景に埋もれないか
- 一貫性: CTA / border / status が token 契約どおりか
- 情報設計: 見出し、本文、補助文の階層差があるか
