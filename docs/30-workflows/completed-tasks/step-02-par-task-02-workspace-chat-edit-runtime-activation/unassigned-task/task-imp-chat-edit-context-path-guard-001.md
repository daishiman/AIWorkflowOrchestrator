# Chat Edit context path workspace guard - タスク指示書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-CHAT-EDIT-CONTEXT-PATH-GUARD-001            |
| 分類       | 改善（セキュリティ）                                 |
| 優先度     | 中                                                   |
| ステータス | 未実施                                               |
| 発見元     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 |
| 発見日     | 2026-03-14                                           |

## 1. なぜこのタスクが必要か（Why）

`read/write` には workspacePath ガードがある一方、`send-with-context` の `contexts[*].filePath` 側には越境検証がない。仕様境界を揃えないと機密流出リスクが残る。

## 2. 何を達成するか（What）

LLM へ渡す context の filePath も workspace 境界内に制限し、越境データ流入を防止する。

## 3. どのように実行するか（How）

- `chatEditHandlers.ts` の `send-with-context` で `contexts[*].filePath` を検証する。
- `workspacePath` 未指定時の挙動を明文化する。
- 失敗時は `PERMISSION_DENIED` を返し、guidance を設定する。

## 4. 実行手順

1. `send-with-context` の path 受け取り〜送信までの経路を確認する。
2. `isWithinWorkspace()` 再利用で contexts 配列の全要素を検証する。
3. エラーコードと sanitize メッセージを統一する。
4. セキュリティ回帰テストを追加する。

## 5. 完了条件チェックリスト

- [ ] workspace 外 path を含む request が拒否される。
- [ ] 正常 path は既存挙動を維持する。
- [ ] エラーが sanitize 方針に従う。

## 6. 検証方法

- workspace 内/外 path の境界テスト。
- path traversal と組み合わせたセキュリティテスト。
- `workspacePath` 未指定時の挙動確認。

## 7. リスクと対策

- リスク: workspacePath の取得元不統一で誤判定が起きる可能性。
- 対策: read/write と同一バリデータを共有し、契約を1箇所に集約する。

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`

## 9. 備考

完了時は `task-workflow-backlog.md` と `security-electron-ipc-core.md` を同時更新する。
