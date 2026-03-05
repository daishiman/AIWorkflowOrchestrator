# Phase 11 証跡一覧

- 保存先: `outputs/phase-11/screenshots/`
- 取得日: 2026-03-05
- 再取得時刻（1回目）: 2026-03-05 11:43 JST
- 再取得時刻（最終）: 2026-03-05 11:51 JST

| テストケース | 撮影ファイル                                                | 仕様照合結果 | 備考                 |
| ------------ | ----------------------------------------------------------- | ------------ | -------------------- |
| TC-055-301   | `screenshots/TC-055-301-organisms-default-desktop-dark.png` | 一致         | default dark desktop |
| TC-055-302   | `screenshots/TC-055-302-organisms-empty-desktop-light.png`  | 一致         | empty light desktop  |
| TC-055-303   | `screenshots/TC-055-303-organisms-loading-desktop-dark.png` | 一致         | loading dark desktop |
| TC-055-304   | `screenshots/TC-055-304-master-detail-mobile-dark.png`      | 一致         | mobile overlay       |
| TC-055-305   | `screenshots/TC-055-305-search-grid-mobile-dark.png`        | 一致         | mobile grid          |
| TC-055-306   | `screenshots/TC-055-306-search-filter-desktop-dark.png`     | 一致         | search/filter dark   |

## 検証メモ

- 必須優先度[A][B]の6ケースを撮影済み。
- TCと証跡の1:1対応を維持。
- `validate-phase11-screenshot-coverage.js --workflow ...task-055...` は expected 6 / covered 6（2026-03-05 11:52 JST）。
