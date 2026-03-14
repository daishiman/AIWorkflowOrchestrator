# Chat Edit concurrent request guard - タスク指示書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| タスクID   | TASK-IMP-CHAT-EDIT-CONCURRENT-REQUEST-GUARD-001      |
| 分類       | 改善（安定性）                                       |
| 優先度     | 低                                                   |
| ステータス | 未実施                                               |
| 発見元     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12 |
| 発見日     | 2026-03-14                                           |

## 1. なぜこのタスクが必要か（Why）

`chat-edit:send-with-context` の IPC 連打時に Main 側で同時リクエスト制御がなく、競合と状態破損のリスクが残る。

## 2. 何を達成するか（What）

同一ワークスペース/同一セッションの多重実行を抑止し、予測可能な実行順序を保証する。

## 3. どのように実行するか（How）

- `chatEditHandlers.ts` にリクエストガード（Map/Lock）を追加する。
- ガード時は専用 error code を返すか、直前要求を cancel する方針を定義する。
- Renderer 側 UI と error handling を同期する。

## 4. 実行手順

1. 同時実行時の現行挙動を再現し、競合ポイントを特定する。
2. ガード方式（fail-fast または cancel）を決定し handler に実装する。
3. エラーコードと UI 表示を追加してユーザー向け導線を整える。
4. 連打ケースのテストを追加して回帰を防止する。

## 5. 完了条件チェックリスト

- [ ] 同時2要求で挙動が一意に定義される（拒否 or 先行キャンセル）。
- [ ] 二重実行で state が破損しない。
- [ ] エラーコードとガイダンスが UI に表示される。

## 6. 検証方法

- 連打・同時実行ケースの統合テスト。
- ガード発火時の error assertion テスト。
- 単発実行で既存成功経路が維持されることの確認。

## 7. リスクと対策

- リスク: ガード粒度を粗くすると必要な並列性まで失う。
- 対策: まずは最小スコープ（workspace/session）で導入し、必要に応じて粒度を再調整する。

## 8. 参照情報

- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md`

## 9. 備考

初版は fail-fast 方式で導入し、運用で要望が出た場合に cancel 方式を検討する。
