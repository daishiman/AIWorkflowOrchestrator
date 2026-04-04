# Phase 4: テスト設計 — severity フィルタ

## テストケース一覧

| ID    | テスト内容                                              | 検証ポイント                               |
| ----- | ------------------------------------------------------- | ------------------------------------------ |
| SF-01 | デフォルトで severity フィルタが `all` に設定されている | フィルタバー表示、all が aria-checked=true |
| SF-02 | `all` 選択時に全 check が表示される                     | 全4件表示                                  |
| SF-03 | `warning+` 選択で info が非表示になる                   | info check が消え、warning/error のみ表示  |
| SF-04 | `error` 選択で warning/info が非表示になる              | error check のみ表示                       |
| SF-05 | フィルタ結果で空になった layer が非表示になる           | layer4(info only) が消える                 |
| SF-06 | フィルタボタンに件数が表示される                        | (4), (3), (1) のような件数表示             |
| SF-07 | reverify 後もフィルタ状態が維持される                   | warning+ 選択→reverify→依然 warning+       |
| SF-08 | Layer accordion の開閉がフィルタ切替で壊れない          | フィルタ切替後も accordion 操作可能        |

## テストデータ

4つの check を用意（各 layer に1つ、severity は error/warning/warning/info）:

- L1-001: layer1, error
- L2-001: layer2, warning
- L3-001: layer3, warning
- L4-001: layer4, info

これにより:

- `all`: 4件（4 layer すべて表示）
- `warning+`: 3件（layer4 が消える）
- `error`: 1件（layer1 のみ表示）
