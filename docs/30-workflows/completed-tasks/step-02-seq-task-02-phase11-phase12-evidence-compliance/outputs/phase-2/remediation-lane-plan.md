# Remediation Lane Plan

| Lane   | 順序      | 対象                                     | 目的                                                         |
| ------ | --------- | ---------------------------------------- | ------------------------------------------------------------ |
| Lane A | 先行      | parent Phase 11 spec / outputs           | TC-ID、review board PNG、metadata、non-visual 判定を固定する |
| Lane B | Lane A 後 | parent Phase 12 spec / outputs           | implementation guide と 6成果物の役割差分を固定する          |
| Lane C | 最後      | corrective workflow outputs / validators | 是正内容を Phase 1〜12 成果物と validator 結果へ反映する     |

## 破棄判断

- runtime code は非対象
- parent workflow の Phase 11 / 12 契約は patch ではなく責務ごと再定義する
