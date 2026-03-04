# Phase 3 設計レビュー結果

## レビュー対象

- `outputs/phase-2/architecture-design.md`
- `outputs/phase-2/ipc-contract-design.md`
- `outputs/phase-2/test-strategy.md`

## 指摘結果

| 区分   | 内容                                                                | 対応                            |
| ------ | ------------------------------------------------------------------- | ------------------------------- |
| MUST   | `AUTHENTICATION_ERROR` のコード伝搬が Main/Preload で欠落しないこと | Phase 5で `errorCode` 追加      |
| MUST   | preflight 導線が `auth-key:exists` 未提供時に壊れないこと           | Optional chainingで後方互換維持 |
| SHOULD | 誘導メッセージを複数箇所で重複定義しないこと                        | 共通ユーティリティ化            |
| SHOULD | `auth-key:exists` と実行時判定ロジック差異のリスク記録              | Phase 9 リスク台帳で追跡        |

## 結論

- 設計は実装着手可能
- MUST 2件は実装時に必須反映
