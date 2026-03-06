# Phase 11: evidence matrix

## スクリーンショット証跡

| テストケース | 証跡パス                                        | 取得日                    | ファイル実在 | 内容一致 | non-visual 補足        |
| ------------ | ----------------------------------------------- | ------------------------- | ------------ | -------- | ---------------------- |
| TC-11-01     | `screenshots/TC-11-01-settings-initial.png`     | 2026-03-06T12:00:55+09:00 | OK           | OK       | `subscription valid`   |
| TC-11-02     | `screenshots/TC-11-02-api-key-missing.png`      | 2026-03-06T12:00:57+09:00 | OK           | OK       | `api-key` missing      |
| TC-11-03     | `screenshots/TC-11-03-subscription-missing.png` | 2026-03-06T12:00:58+09:00 | OK           | OK       | `subscription` missing |
| TC-11-04     | `screenshots/TC-11-04-mode-changed.png`         | 2026-03-06T12:00:59+09:00 | OK           | OK       | `changed` event 直後   |
| TC-11-05     | `screenshots/TC-11-05-restored-mode.png`        | 2026-03-06T12:01:01+09:00 | OK           | OK       | reload 後 restore      |

## S-1〜S-4 チェック

| #   | チェック項目   | 確認方法                                             | 結果                        |
| --- | -------------- | ---------------------------------------------------- | --------------------------- | --- |
| S-1 | ファイル実在   | `stat -f "%N                                         | %Sm"` で 5 ファイル存在確認 | OK  |
| S-2 | 取得日確認     | `phase11-capture-metadata.json` と `stat` を突合     | OK                          |
| S-3 | 取得日の合理性 | 2026-03-06 実行日かつ未来日付なし                    | OK                          |
| S-4 | 内容目視確認   | mode / message / errorCode / guidance の状態差を確認 | OK                          |

## 補助証跡

| 種別               | パス                                        | 用途                                |
| ------------------ | ------------------------------------------- | ----------------------------------- |
| capture metadata   | `screenshots/phase11-capture-metadata.json` | 取得時刻、visual diagnostics の記録 |
| visual diagnostics | `screenshots/phase11-capture-metadata.json` | selector / status card の矩形と色   |

## visual diagnostics 抜粋

- selector rect: `1342 x 46`
- status rect: `1342 x 38`
- selected button color: `rgb(0, 122, 255)`
- success status card color: `rgb(240, 253, 244)`
