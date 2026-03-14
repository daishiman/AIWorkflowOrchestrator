# Chat Edit custom instruction 展開不具合是正 - タスク指示書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-CHAT-EDIT-CUSTOM-INSTRUCTION-BUG-001        |
| 分類       | 改善（不具合修正）                                   |
| 優先度     | 中                                                   |
| ステータス | 未実施                                               |
| 発見元     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 |
| 発見日     | 2026-03-14                                           |

## 1. なぜこのタスクが必要か（Why）

`EditCommand.type = custom` で `instruction` が prompt に正しく展開されない経路が残っている可能性がある。未展開のまま送信されるとユーザー意図が失われるため、経路を閉じる必要がある。

## 2. 何を達成するか（What）

custom コマンド実行時に `instruction` が必ず prompt へ反映される状態を保証する。

## 3. どのように実行するか（How）

- `apps/desktop/src/main/services/chat-edit/prompts.ts` の custom テンプレート展開を点検する。
- `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` の `buildPrompt()` 経路で未展開ケースを除去する。
- custom コマンド専用の単体テストを追加する。

## 4. 実行手順

1. custom 経路の prompt 生成フローをトレースし、展開漏れ条件を再現する。
2. prompt テンプレートと `buildPrompt()` の分岐を修正し、`instruction` 展開を必須化する。
3. custom コマンドの成功系/異常系テストを追加する。
4. 既存 command type への回帰がないことを確認する。

## 5. 完了条件チェックリスト

- [ ] custom 実行時に prompt 文字列へ instruction が埋め込まれる。
- [ ] instruction 未指定時のエラーハンドリング方針が明確化される。
- [ ] 回帰テストで custom 経路が緑化される。

## 6. 検証方法

- `ChatEditService` 単体テスト: custom + instruction あり/なし。
- prompts 単体テスト: 置換対象変数の期待値比較。
- 既存 command type の回帰テスト。

## 7. リスクと対策

- リスク: 既存 command type の prompt 生成ロジックへ副作用が及ぶ可能性。
- 対策: custom 経路のみを最小差分で修正し、他 type の回帰テストを同時実行する。

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`

## 9. 備考

完了時は `task-workflow-backlog.md` の状態更新と、苦戦箇所があれば `lessons-learned-current.md` へ追記する。
