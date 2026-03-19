# UT-CONV-DB-002 Conversation DB schema versioning 導入

## メタ情報

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| タスクID       | UT-CONV-DB-002                                                                             |
| タイトル       | Conversation DB schema versioning 導入                                                     |
| ステータス     | 未実施                                                                                     |
| 優先度         | 高                                                                                         |
| 発見元         | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 Phase 12                                           |
| 発見日         | 2026-03-19                                                                                 |
| 関連タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                                                    |
| 関連仕様リンク | docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md |
| 担当想定       | Desktop / Persistence                                                                      |

## 1. なぜこのタスクが必要か（Why）

今後 Conversation DB のテーブルや index を拡張すると、既存データとの互換性管理が必要になる。  
versioning と migration 方針がないまま変更すると、起動失敗や silent corruption の温床になる。

## 2. 何を達成するか（What）

Conversation DB に schema version 管理と migration 実行の仕組みを導入し、安全に将来拡張できる状態を作る。

## 3. どのように実行するか（How）

- schema version の保存場所を決める
- migration を順次実行できる構造へ整理する
- rollback 不可時の安全策を定義する

## 4. 実行手順

1. 現行 schema を version 1 として定義する。
2. PRAGMA user_version または専用 metadata table を採用する。
3. migration runner を追加する。
4. upgrade path と failure path をテストする。

## 5. 完了条件チェックリスト

- 新旧 schema の version 判定ができる
- migration が多段で実行できる
- failure 時に破壊的更新を避けられる

## 6. 検証方法

- pnpm test -- conversationDatabase
- pnpm test -- conversationRepository

## 7. リスクと対策

- migration 失敗時の復旧戦略が不足する: destructive update を避ける順序を明文化する
- 開発中 schema 変更で version 管理が形骸化する: 変更時に version 更新を必須化する

## 8. 参照情報

- docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md
- docs/30-workflows/conversation-db-robustness/outputs/phase-12/system-spec-update-summary.md

## 9. 備考

今回の robustness 対応では単一 schema 前提で十分だったが、次の拡張前に着手すべき優先度が高い。
