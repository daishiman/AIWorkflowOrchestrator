# UT-IMP-SAFETY-GOV-PUSH-REQUEST-PRODUCER-001: approval request producer を production 接続

## メタ情報

| 項目       | 値                                                                        |
| ---------- | ------------------------------------------------------------------------- |
| ステータス | 未着手                                                                    |
| 優先度     | 高                                                                        |
| 起票日     | 2026-03-31                                                                |
| 起票元     | safety-gov-production-integration Phase 12 / unassigned-task-detection.md |
| 関連タスク | UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001                              |
| Issue番号  | #1803                                                                     |

## 1. なぜこのタスクが必要か（Why）

`pushApprovalRequest()` の IPC 輸送経路（Main → Preload → Renderer）は
`safety-gov-production-integration` タスクで実装済みだが、
production ランタイムでこの関数を呼び出す producer が存在しない。

そのため Approval Sheet が実ランタイムで自動表示されず、
UT-8（承認フロー E2E）が構造確認止まりになっている。
production での動作保証には、実ランタイムイベントと連動した
push 発火ポイントの接続が必須である。

## 2. 何を達成するか（What）

approval request を発火すべき runtime producer を特定し、
`pushApprovalRequest(mainWindow, payload)` を production パスで呼び出す。

### 受入基準

- approval request を発火すべき runtime イベントを特定し実装する
- producer から `pushApprovalRequest(mainWindow, payload)` を呼ぶ
- session / operation の相関 ID を current runtime contract に揃える
- Main → Preload → Renderer の実発火テストを追加する
- Phase 11 手動テストを NON_VISUAL から runtime evidence 付きへ再評価する

### 影響ファイル（予定）

| ファイル                                                            | 変更内容       |
| ------------------------------------------------------------------- | -------------- |
| `apps/desktop/src/main/ipc/approvalHandlers.ts`                     | producer 接続  |
| `apps/desktop/src/main/ipc/index.ts`                                | IPC 登録確認   |
| `apps/desktop/src/main/ipc/__tests__/approvalHandlers.push.test.ts` | 発火テスト追加 |

## 3. どのように実行するか（How）

1. approval request を発火すべき runtime イベントを特定する
   - Claude CLI 実行開始イベント、またはツール呼び出しイベントを調査する
2. producer から `pushApprovalRequest(mainWindow, payload)` を呼ぶ
   ```typescript
   // Main process: approval event producer
   pushApprovalRequest(mainWindow, {
     sessionId: currentSession.id,
     operationId: operation.id,
     tool: operation.toolName,
   });
   ```
3. session / operation の相関 ID を current runtime contract に揃える
4. 統合テストで Main → Preload → Renderer の実発火を検証する

## 4. 苦戦箇所の記録（safety-gov-production-integration より）

### 輸送経路は実装済みだが producer が未接続

- **問題**: IPC チャンネルの型定義・ハンドラー・preload API は揃っているが、
  実際にそれを呼ぶトリガーが Main プロセス側に存在しない
- **解決方法（未解決）**: runtime producer を Claude CLI 実行フックと接続する必要がある
- **教訓**: 「配線が通った」と「production で動く」は別の達成基準。
  Phase 11 テストで実発火ログを必須エビデンスとして定義すべき
