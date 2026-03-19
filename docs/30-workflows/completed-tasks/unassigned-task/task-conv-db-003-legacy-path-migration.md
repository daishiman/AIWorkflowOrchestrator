# UT-CONV-DB-003 legacy conversation DB path migration

## メタ情報

| 項目           | 内容                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| タスクID       | UT-CONV-DB-003                                                                             |
| タイトル       | legacy conversation DB path migration                                                      |
| ステータス     | 未実施                                                                                     |
| 優先度         | 中                                                                                         |
| 発見元         | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 Phase 12                                           |
| 発見日         | 2026-03-19                                                                                 |
| 関連タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                                                    |
| 関連仕様リンク | docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md |
| 担当想定       | Desktop / Data Migration                                                                   |

## 1. なぜこのタスクが必要か（Why）

旧実装では ~/.claude/conversations.db 前提の利用者が存在する可能性がある。  
新実装は app.getPath("userData") 配下を正本とするため、既存データの引き継ぎ導線が必要である。

## 2. 何を達成するか（What）

既存ユーザーの会話履歴を失わず、新しい保存先へ安全に移行できる状態を作る。

## 3. どのように実行するか（How）

- legacy path の存在確認を行う
- 新 path に未作成の場合のみ移行を検討する
- 競合時の優先順位と保全方針を明確化する

## 4. 実行手順

1. legacy path の検知条件を定義する。
2. 新 path に DB が無い場合の one-shot migration を設計する。
3. 移行ログと失敗時の fallback を定義する。
4. 重複・破損・権限不足の edge case を検証する。

## 5. 完了条件チェックリスト

- 旧 path から新 path へ安全に移行できる
- 既存新 path がある場合は破壊しない
- 失敗時にデータ保全が優先される

## 6. 検証方法

- pnpm test -- conversationDatabase
- pnpm test -- main/index

## 7. リスクと対策

- 意図しない上書きでデータを壊す: 既存新 path がある場合は skip を優先する
- 複数端末 / 複数 path の想定漏れが出る: path 判定条件と migration 条件を先に固定する

## 8. 参照情報

- docs/30-workflows/conversation-db-robustness/outputs/phase-12/unassigned-task-detection.md
- docs/30-workflows/conversation-db-robustness/outputs/phase-12/system-spec-update-summary.md

## 9. 備考

今回タスクでは保存先を Electron 標準へ寄せることを優先し、利用者データ移行は独立課題として切り出した。
