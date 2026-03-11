# Phase 8 責務境界チェック

| 層           | 確認項目                                                | 結果 |
| ------------ | ------------------------------------------------------- | ---- |
| Renderer     | 表示/interaction のみを担当し、永続化を持ち込んでいない | PASS |
| Renderer     | store selector は個別参照のみ                           | PASS |
| Preload      | channel 公開面が allowlist 経由                         | PASS |
| Main handler | validation / sender 検証 / service 委譲に留まる         | PASS |
| Service      | store 読み書きのみを担当                                | PASS |
| Shared       | channel 名の重複定義がない                              | PASS |

## コメント

- `notification:clear` は互換レイヤに残るが、058e UI 境界からは切り離せている
- hidden delete button が keyboard 導線へ混ざらないことを renderer test で確認済み
