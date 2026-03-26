# Test Matrix

| 区分     | ケース                  | 期待結果                   |
| -------- | ----------------------- | -------------------------- |
| positive | valid manifest load     | 正規化済み manifest を返す |
| positive | cache hit               | 同じ参照を返す             |
| negative | unknown top-level field | reject                     |
| negative | schemaVersion mismatch  | reject                     |
| negative | missing entry hook      | reject                     |
| negative | invalid phase order     | reject                     |
| negative | missing resource file   | reject                     |
| negative | cache drift             | hash 変化で再読込          |
