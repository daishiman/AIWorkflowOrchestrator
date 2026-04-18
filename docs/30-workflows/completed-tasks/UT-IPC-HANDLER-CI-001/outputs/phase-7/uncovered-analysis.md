# 未到達コードパス分析

## メタ情報

| 項目   | 内容                  |
| ------ | --------------------- |
| Phase  | 7                     |
| タスク | UT-IPC-HANDLER-CI-001 |

## 未到達コードパス一覧

| 行範囲    | 内容                                            | 分類           | 根拠                                               |
| --------- | ----------------------------------------------- | -------------- | -------------------------------------------------- |
| L224-264  | `SKILL_CREATOR_PLAN` ハンドラ本体               | 意図的スキップ | 既存 `creatorHandlers.test.ts` がカバー            |
| L267-299  | `SKILL_CREATOR_GET_ADAPTER_STATUS` ハンドラ本体 | 意図的スキップ | `creatorHandlers.adapterStatus.test.ts` がカバー   |
| L302-334  | `SKILL_CREATOR_EXECUTE_PLAN` ハンドラ本体       | 意図的スキップ | `creatorHandlers.fire-and-forget.test.ts` がカバー |
| L337〜854 | その他ハンドラ本体                              | 意図的スキップ | 各 `creatorHandlers.*.test.ts` がカバー            |
| L859-884  | `unregisterRuntimeSkillCreatorHandlers()`       | 意図的スキップ | `ipc-double-registration.test.ts` がカバー         |

## 分類サマリー

| 分類                                     | 件数         |
| ---------------------------------------- | ------------ |
| 意図的スキップ（既存テストでカバー済み） | 全未到達パス |
| テスト不足による未到達                   | 0 件         |

## 結論

本テストはチャンネル登録の静的検証のみを責務とするため、ハンドラ本体の未到達は全て「意図的」に分類される。
