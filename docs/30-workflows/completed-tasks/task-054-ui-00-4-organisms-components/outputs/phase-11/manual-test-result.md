# Phase 11 手動テスト結果

- 更新日: 2026-03-04 23:24 JST
- 実行環境: Playwright + Vite（`apps/desktop/vite.e2e.config.ts`）
- 対象画面: `/advanced/organisms-showcase`

## 実行ケース結果

| TC-ID | 観点                                       | 結果 | 証跡                                                                       |
| ----- | ------------------------------------------ | ---- | -------------------------------------------------------------------------- |
| TC-01 | default表示（dark/desktop）                | PASS | `outputs/phase-11/screenshots/TC-01-organisms-default-dark-desktop.png`    |
| TC-02 | 検索 + フィルタ反映（dark/desktop）        | PASS | `outputs/phase-11/screenshots/TC-02-search-filter-active-dark-desktop.png` |
| TC-03 | CardGrid loading skeleton（dark/desktop）  | PASS | `outputs/phase-11/screenshots/TC-03-cardgrid-loading-dark-desktop.png`     |
| TC-04 | CardGrid empty state（light/desktop）      | PASS | `outputs/phase-11/screenshots/TC-04-cardgrid-empty-light-desktop.png`      |
| TC-05 | MasterDetail mobile overlay（dark/mobile） | PASS | `outputs/phase-11/screenshots/TC-05-master-detail-mobile-dialog-dark.png`  |
| TC-06 | SearchFilterList grid（dark/mobile）       | PASS | `outputs/phase-11/screenshots/TC-06-search-grid-mobile-dark.png`           |

## Apple UI/UXエンジニア観点レビュー

### 視覚階層

- 見出し、セクション、コンテンツが上から下へ一貫した読み順で配置され、初見でも構造を把握しやすい。

### 可読性・コントラスト

- dark/light の両テーマで文字と背景の分離が維持され、empty/loading 状態でも情報欠落が誤解されにくい。

### 操作導線

- Master/Detail のモバイル表示は詳細パネルに集中できる構成。
- SearchFilterList は検索→フィルタ→結果件数の順で因果が明確。

### レスポンシブ

- desktop: 3 Organisms の比較検証が可能。
- mobile: オーバーレイ表示と縦並びカードが破綻なく成立。

## 実行コマンド

```bash
cd apps/desktop
pnpm run screenshot:organisms
```

## 総合判定

- **PASS**（重大課題なし）
