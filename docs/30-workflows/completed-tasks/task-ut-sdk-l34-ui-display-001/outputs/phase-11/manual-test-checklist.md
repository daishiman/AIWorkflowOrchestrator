# Phase 11 Manual Test Checklist

## 対応表

| MT-ID | TC-ID | カテゴリ         | 対応内容                                        | 結果 | 備考                                 |
| ----- | ----- | ---------------- | ----------------------------------------------- | ---- | ------------------------------------ |
| MT-1  | TC-01 | UI表示           | Layer別グルーピングが正しく表示される           | PASS | light で全 Layer を確認              |
| MT-2  | TC-02 | UI表示           | Layer別グルーピングが dark テーマでも表示される | PASS | dark で全 Layer を確認               |
| MT-3  | TC-03 | インタラクション | Layer3 の折りたたみと再展開ができる             | PASS | Layer 3 を collapse / reopen         |
| MT-4  | TC-04 | severity         | errorアイコン・バッジが正しく表示される         | PASS | Layer 4 の error badge を確認        |
| MT-5  | TC-05 | テーマ           | darkテーマでのバッジ色が正しい                  | PASS | dark theme で視認性を確認            |
| MT-6  | TC-06 | reverify         | 再検証後もグルーピングが正しく更新される        | PASS | reverify 実行後の empty state を確認 |

## 証跡

- `outputs/phase-11/screenshots/TC-01-layer-grouped-light.png`
- `outputs/phase-11/screenshots/TC-02-layer-grouped-dark.png`
- `outputs/phase-11/screenshots/TC-03-layer3-collapsed-light.png`
- `outputs/phase-11/screenshots/TC-04-error-badge-light.png`
- `outputs/phase-11/screenshots/TC-05-error-badge-dark.png`
- `outputs/phase-11/screenshots/TC-06-empty-checks-light.png`
