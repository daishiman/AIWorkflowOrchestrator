# Phase 8 Output: 文書圧縮サマリー

## 圧縮前後の比較

| 観点                      | 圧縮前                       | 圧縮後                          |
| ------------------------- | ---------------------------- | ------------------------------- |
| merge policy の記述場所   | Phase 2, 3, 5 に分散         | Phase 2 を正本、他は参照        |
| built-in vs custom の説明 | 各 phase に個別説明          | Phase 2 に一本化                |
| EVALS 方針                | 「schema 変更なし」が 4 箇所 | Phase 2 G4 の1箇所に集約        |
| bootstrap 手順            | Phase 5 と README に二重記述 | setup-merge-drivers.sh に一本化 |

## 削減した判断負荷

- 「built-in か custom か」を各 phase で確認する必要がなくなった
- 「EVALS を本 wave で変えるのか」の曖昧さが Phase 2 で解消済み
- bootstrap 手順は 1 スクリプトを実行するだけ

## 残った意図的な重複

- Phase 9 と Phase 11 両方に validator コマンドを記載（実測証跡として必要）
