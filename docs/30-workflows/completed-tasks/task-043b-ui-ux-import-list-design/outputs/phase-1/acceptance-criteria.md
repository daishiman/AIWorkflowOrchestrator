# Phase 1 受け入れ基準

| AC    | 条件                                                                      | 検証方法                            |
| ----- | ------------------------------------------------------------------------- | ----------------------------------- |
| AC-01 | imported / available の 2 セクションが同時表示される                      | unit / screenshot `TC-11-01`        |
| AC-02 | 両セクション 0 件かつ検索なしでは global empty state を出す               | unit                                |
| AC-03 | 片方のみ 0 件では inline empty state を出す                               | unit / screenshot `TC-11-02`        |
| AC-04 | 検索結果が両方 0 件なら global no-result state を出す                     | unit / screenshot `TC-11-03`        |
| AC-05 | `追加する` で dialog を開き、confirm で import が走る                     | integration / screenshot `TC-11-05` |
| AC-06 | success 後に imported 側へ移動し、`role="status"` と focus return を行う  | integration / screenshot `TC-11-06` |
| AC-07 | import failure 時は dialog を開いたまま `role="alert"` を出す             | integration / screenshot `TC-11-04` |
| AC-08 | keyboard のみで open / cancel / confirm / close / focus return が成立する | integration / screenshot `TC-11-07` |
| AC-09 | dark mode でも contrast と focus visible が維持される                     | screenshot `TC-11-08`               |
| AC-10 | `description` 欠損や配列 nullish でも表示と検索が継続する                 | unit / screenshot `TC-11-09`        |

## 判定ルール

- PASS: AC-01〜10 をすべて満たす。
- MINOR: 文言や証跡メモだけが不足し、挙動自体は成立している。
- MAJOR: 2 セクション、dialog、success / error、focus 契約のいずれかが欠ける。
