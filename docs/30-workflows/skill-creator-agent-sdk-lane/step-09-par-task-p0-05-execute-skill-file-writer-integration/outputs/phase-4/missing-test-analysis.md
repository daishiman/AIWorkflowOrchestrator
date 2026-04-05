# Phase 4: 不足テスト分析（Current Facts 反映）

## 結論

旧ドキュメントで「`E-11` が正常系の主テスト」として扱われていた点が最大の不整合だった。
現行の persist-integration では、正常系は `F-01/F-02` に分離され、`E-11` は PATH_TRAVERSAL のエラーパターンになっている。

## 修正方針

- 正常系の参照は `F-01/F-02` に統一する
- `E-11〜E-16` のような旧レンジ表現は、用途に応じて以下に置換する
  - 基本フロー: `F-01〜F-06`
  - persist エラーパターン: `E-10〜E-16`
  - PATH_TRAVERSAL/rollback/回帰ガード: `E-21〜E-29`

## 追加/網羅の観点（persist-integration）

| 観点                              | テスト           |
| --------------------------------- | ---------------- |
| PATH_TRAVERSAL 入力バリエーション | E-21, E-22, E-23 |
| rollback                          | E-24, E-25       |
| executeResult の回帰ガード        | E-26, E-27       |
| parse null / DI 未注入の回帰      | E-28, E-29       |
