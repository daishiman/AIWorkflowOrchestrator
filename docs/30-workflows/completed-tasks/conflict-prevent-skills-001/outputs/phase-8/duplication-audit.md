# Phase 8 Output: 重複監査

## 重複削除済み

| 重複箇所                                                     | 対応                                                                                         |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| merge policy 説明が Phase 2 と Phase 5 の両方に記述          | Phase 2 の merge-policy-matrix.md を正本とし、Phase 5 は「Phase 2 設計に従い実装」と参照のみ |
| `merge=ours` の説明（custom driver 必要）が複数 phase に散在 | Phase 2 に集約し、他 phase は「Phase 2 参照」で統一                                          |
| validator コマンドが Phase 1 / Phase 9 に重複                | Phase 9 を実測ログの正本、Phase 1 はステップ定義として役割分離                               |

## wording 統一結果

| 用語               | 統一後の表記                                       |
| ------------------ | -------------------------------------------------- |
| built-in merge     | `merge=union`（Git 組み込み）                      |
| カスタム keep-ours | `merge=ours`（カスタムドライバー、bootstrap 必要） |
| 条件付き適用       | `consumer audit PASS 時のみ`                       |

## 参照名 drift なし確認

- Phase 4 の TC-4-01〜05 の名称は Phase 6/7/9/10 で変更なし
- outputs/phase-\* のパスは artifacts.json と一致
