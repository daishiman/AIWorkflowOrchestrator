# UT-SAFETY-GOV-SESSION-LOG-SERVICE-INTEGRATION-001: Advanced Console を実セッションログへ接続

## メタ情報

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| ステータス | 未着手                                                                    |
| 優先度     | 高                                                                        |
| 起票日     | 2026-03-31                                                                |
| 起票元     | safety-gov-production-integration Phase 12 / unassigned-task-detection.md |
| 関連タスク | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001                              |
| Issue番号  | #1805                                                                     |

## 1. なぜこのタスクが必要か（Why）

`safety-gov-production-integration` タスクで Advanced Console の
`getTerminalLog()` / `getCopyCommand()` の IPC 配線は完了しているが、
Main 側の callback が空配列 / `null` を返す placeholder のままである。

画面には Advanced Console コンポーネントが表示されるものの、
実際の Claude CLI セッションログが表示されず、
ユーザーが操作ログを確認・コピーできない状態になっている。

## 2. 何を達成するか（What）

Advanced Console の `getTerminalLog()` / `getCopyCommand()` を
Claude CLI の実セッションログサービスへ接続する。

### 受入基準

- `sessionId` から実際のターミナルログと copy command を取得できる
- `sanitizeForApiKeys()` を通した値のみ返す（セキュリティ要件）
- セッション未存在時のエラー契約が定義されている
- 統合テストでセッションログ取得が検証されている

### 影響ファイル（予定）

| ファイル                                               | 変更内容                    |
| ------------------------------------------------------ | --------------------------- |
| `apps/desktop/src/main/ipc/index.ts`                   | セッションログサービス DI   |
| `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts` | placeholder 除去・実装      |
| `apps/desktop/src/main/claude-cli/ipc-handler.ts`      | セッションログ取得 API 実装 |

## 3. どのように実行するか（How）

1. Claude CLI セッションログを管理するサービスを特定する
   - `apps/desktop/src/main/claude-cli/` 配下のセッション管理コードを調査
2. `advancedConsoleHandlers.ts` の placeholder を実装に置き換える
   ```typescript
   // sessionId からログを取得する実装例
   const logs = await sessionLogService.getTerminalLog(sessionId);
   return sanitizeForApiKeys(logs);
   ```
3. セッション未存在時の適切なエラーレスポンスを定義する
4. `sanitizeForApiKeys()` フィルタリングを全レスポンスに適用する
5. 統合テストでセッションログ取得フローを検証する

## 4. 苦戦箇所の記録（safety-gov-production-integration より）

### placeholder 実装の継続的残存

- **問題**: IPC チャンネルの配線完了後も、実データを返す実装が後回しになりやすい。
  `[]` / `null` を返すコードは型チェックを通過するため、未実装に気づきにくい
- **解決方法（未解決）**: セッションログサービスとの DI 接続実装が必要
- **教訓**: placeholder 実装は `TODO: connect to real service` コメントと共に
  専用の lint ルールでフラグを立てる運用を検討すべき
