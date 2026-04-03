# Phase 11 Manual Test Result

## 実施概要

| 項目       | 値                                |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| ステータス | PASS                              |
| 目的       | Layer別グルーピング UI の手動検証 |
| 撮影方法   | current_build_vite_playwright     |

## テスト結果

| MT-ID | TC-ID | 期待結果                                              | 実測結果 | 証跡                                                            |
| ----- | ----- | ----------------------------------------------------- | -------- | --------------------------------------------------------------- |
| MT-1  | TC-01 | Layer1〜Layer4 のグループが表示される                 | PASS     | `outputs/phase-11/screenshots/TC-01-layer-grouped-light.png`    |
| MT-2  | TC-02 | Layer1〜Layer4 のグループが dark テーマでも表示される | PASS     | `outputs/phase-11/screenshots/TC-02-layer-grouped-dark.png`     |
| MT-3  | TC-03 | Layer3 が折りたたまれ、再クリックで再展開される       | PASS     | `outputs/phase-11/screenshots/TC-03-layer3-collapsed-light.png` |
| MT-4  | TC-04 | error アイコンとバッジが表示される                    | PASS     | `outputs/phase-11/screenshots/TC-04-error-badge-light.png`      |
| MT-5  | TC-05 | dark テーマで色が崩れない                             | PASS     | `outputs/phase-11/screenshots/TC-05-error-badge-dark.png`       |
| MT-6  | TC-06 | reverify 後もグルーピングが更新される                 | PASS     | `outputs/phase-11/screenshots/TC-06-empty-checks-light.png`     |

## スクリーンショットエビデンス

- `outputs/phase-11/screenshots/TC-01-layer-grouped-light.png`
- `outputs/phase-11/screenshots/TC-02-layer-grouped-dark.png`
- `outputs/phase-11/screenshots/TC-03-layer3-collapsed-light.png`
- `outputs/phase-11/screenshots/TC-04-error-badge-light.png`
- `outputs/phase-11/screenshots/TC-05-error-badge-dark.png`
- `outputs/phase-11/screenshots/TC-06-empty-checks-light.png`

## 補足

- TC-06 は reverify を実行したうえで empty state を記録した。
- manual test は screenshot と component test の両方で裏取りしている。
