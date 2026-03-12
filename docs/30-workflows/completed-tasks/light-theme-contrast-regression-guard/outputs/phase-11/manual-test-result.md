# Phase 11 手動テスト結果

## メタ情報

| 項目          | 値                         |
| ------------- | -------------------------- |
| 実施日        | 2026-03-12 JST             |
| レビュー視点  | Apple UI/UX engineer       |
| source        | current build static serve |
| audit summary | `current=0`, `baseline=64` |

## TC 結果

| TC-ID    | 画面                    | 結果                    | Apple UI/UX 所見                                                                                   | 証跡                                               | issue分類           |
| -------- | ----------------------- | ----------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------- |
| TC-11-01 | Settings light          | PASS with baseline note | 情報階層は読みやすいが、ThemeSelector の淡い chip と補助テキストは light shell で弱く見える        | `screenshots/TC-11-01-settings-light.png`          | baseline backlog    |
| TC-11-02 | Dashboard light         | PASS                    | hero card、3枚の action card、timeline の視線誘導が安定し、light / dark 比較でも hierarchy が明確  | `screenshots/TC-11-02-dashboard-light.png`         | none                |
| TC-11-03 | Auth light              | PASS with baseline note | panel の輪郭は十分だが helper text が背景に対して薄く、CTA 群より先に情報が沈む                    | `screenshots/TC-11-03-auth-light.png`              | baseline backlog    |
| TC-11-04 | WorkspaceSearch light   | PASS with baseline note | light 指定にもかかわらず dark surface が全面に残り、contrast regression guard の検知対象として明確 | `screenshots/TC-11-04-workspace-search-light.png`  | baseline backlog    |
| TC-11-05 | Dashboard dark baseline | PASS                    | light 側の readability 改善比較用として有効。dark theme の materiality が維持されている            | `screenshots/TC-11-05-dashboard-dark-baseline.png` | comparison baseline |

## 総合所見

- current build から 5 ケースを再撮影でき、selector-based capture は運用可能。
- 今回差分由来の current issue は未検出。
- baseline backlog は ThemeSelector / AuthView / WorkspaceSearchPanel に集中している。
