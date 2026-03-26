# Test Expansion Summary

## 追加する edge case

| ケース                | 意図                                                | 期待する扱い                                    |
| --------------------- | --------------------------------------------------- | ----------------------------------------------- |
| verify fail           | improve 提案へ自然に遷移できるか                    | gate は fail、UI は next action を提示する      |
| warning path          | hard fail と warning を分離できるか                 | warning は apply 可能、危険判定へ肥大化させない |
| apply partial success | 一部適用と skipped detail を説明できるか            | 成功・未適用理由・再試行導線を併記する          |
| provenance 欠落       | 表示に必要な一部情報が欠けても壊れないか            | fallback 表示で detail panel 自体は維持する     |
| terminal handoff      | integrated lane と manual lane の責務が混ざらないか | guidance を side panel に隔離する               |
| re-verify fail        | apply 後も再改善ループへ戻れるか                    | 同一文脈から再提案へ戻す                        |

## 補強方針

- Phase 4 の基本ケース ID を維持したまま edge case を枝番で追加する
- renderer の体験差分ではなく contract 境界の差分として整理する
- Task05 / Task07 / Task08 側の責務に踏み込むケースは docs QA へ送る
