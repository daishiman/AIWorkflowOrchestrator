# SubAgent Plan

> P50パターン該当: 検証・補完モード。既存実装の監査・設計・将来実装を lane で分離する。

## Lane 分離

| Lane | 担当                      | 入力                                                | 出力                             |
| ---- | ------------------------- | --------------------------------------------------- | -------------------------------- |
| A    | skill 準拠監査            | task-specification-creator, aiworkflow-requirements | 必須セクション、必要参照         |
| B    | surface / screenshot 設計 | hot spot table, quick-reference                     | screenshot matrix                |
| C    | audit / baseline 設計     | grep result, task-workflow, lessons                 | audit spec, evidence policy      |
| D    | future Codex 実装         | Phase 4 以降の spec                                 | helper / validator / docs bridge |

## 並列条件

1. Lane A が終わるまで Lane B/C は最終確定しない
2. Lane B と Lane C は Phase 2 では並列可
3. Lane D は Phase 3 PASS 後にのみ開放する
