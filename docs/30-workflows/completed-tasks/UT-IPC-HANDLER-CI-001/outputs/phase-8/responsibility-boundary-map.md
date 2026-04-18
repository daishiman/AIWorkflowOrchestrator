# 責務境界マップ

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 8                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## describe / it ブロックと対応する要件・チャンネルの対応表

| describe       | it           | 要件 ID      | 責務                                       |
| -------------- | ------------ | ------------ | ------------------------------------------ |
| 正常系         | REG-SNAP-01  | REG-SNAP-01  | 19チャンネル一覧をスナップショット固定     |
| 正常系         | REG-DEDUP-01 | REG-DEDUP-01 | 重複チャンネルなしを検証                   |
| 正常系         | REG-COUNT-01 | REG-COUNT-01 | 総数19件を検証                             |
| 境界値・異常系 | REG-EDGE-01  | REG-DEDUP-01 | 重複検出ロジックの動作証明（フィクスチャ） |
| 境界値・異常系 | REG-EDGE-02  | REG-SNAP-01  | spy 範囲（handle のみ）の正確性確認        |
| 境界値・異常系 | REG-EDGE-03  | -            | beforeEach リセットによるテスト間独立性    |

## 責務分離の確認

- 正常系 `describe` の `beforeEach` で `registerRuntimeSkillCreatorHandlers` を呼び出す（正常系のみ）
- 異常系 `describe` は独立しており、正常系 `beforeEach` の影響を受けない
- 外側 `beforeEach` で `handles = []` リセット → 全テストで独立性を保証
