# SDK Session Bridge 実装ガイド

## 目的

`TASK-SDK-SC-01` で定義した SDK Session Bridge の設計意図、責務境界、利用手順を 1 つの実装ガイドにまとめる。

## 全体像

```text
Renderer UI
  ├─ start-session を invoke
  ├─ question-received を受信して質問 UI を表示
  ├─ answer を invoke
  └─ session-complete / session-error を受信

Main IPC Bridge (ipcMain.handle 両チャネル)
  ├─ IPC ハンドラーの登録・解除
  ├─ 送信元 sender.id 検証（assertSender）
  ├─ 多重セッション拒否（hasActiveSession）
  ├─ ウィンドウ閉鎖時セッション中断（handleWindowClosed）
  └─ Renderer ↔ SDK セッションの中継

SDK Session
  ├─ createSdkMcpServer + tool で AskUserQuestion を MCP カスタムツールとして登録
  ├─ query() API を起動（mcpServers オプションで注入）
  ├─ AskUserQuestion tool handler が Renderer 回答を Promise で待機
  ├─ abort(message, { silent }) でセッションを静的・通知付きで中断
  └─ 30 秒タイムアウトとエラー通知を管理
```

## シーケンス

```
Renderer          IpcBridge              SdkSession                SDK
   |                  |                      |                       |
   |--invoke(start)-->|                      |                       |
   |                  |--new SdkSession----->|                       |
   |                  |  startSession()----->|                       |
   |                  |                      |--createSdkMcpServer-->|
   |                  |                      |--query(prompt,mcpServers)-->|
   |                  |                      |                       |
   |                  |                      |<--AskUserQuestion call-|
   |                  |<-emitQuestionReceived-|                       |
   |<-send(question)--|                      |                       |
   |                  |                      |  (wait pendingAnswer) |
   |--invoke(answer)->|                      |                       |
   |                  |--sendAnswer()------->|                       |
   |                  |                      |--resolve(answerText)->|
   |                  |                      |<--tool result---------|
   |                  |                      |<--session complete----|
   |                  |<-onComplete(result)---|                       |
   |<-send(complete)--|                      |                       |
```

## アーキテクチャ変更点（初期設計比較）

| 項目                 | 初期設計                                 | 最終実装                                                        |
| -------------------- | ---------------------------------------- | --------------------------------------------------------------- |
| AskUserQuestion 検出 | メッセージストリームの tool_use スキャン | `createSdkMcpServer` + `tool()` でカスタム MCP ツールとして登録 |
| ANSWER チャネル      | `ipcMain.on` / `ipcRenderer.send`        | `ipcMain.handle` / `ipcRenderer.invoke`                         |
| セッション中断       | なし                                     | `abort(message, { silent })` メソッド                           |
| 多重セッション       | 未定義                                   | `hasActiveSession()` で拒否・警告                               |
| 送信元検証           | なし                                     | `assertSender()` で sender.id を検証                            |
| ウィンドウ閉鎖       | なし                                     | `handleWindowClosed` でセッションを silent abort                |

## 責務境界

- `SkillCreatorSdkSession`: SDK セッション開始・MCP ツール登録・回答待機・完了/失敗通知・abort
- `SkillCreatorIpcBridge`: Electron IPC 登録解除・sender 検証・多重セッション拒否・ウィンドウ閉鎖連携
- `SkillCreatorWorkflowEngine`: 既存 workflow state owner として維持（Session Bridge とは責務分離）

## Renderer 側の利用例

```typescript
// セッション開始（invoke = 戻り値あり）
await window.electronAPI.skillCreatorSession.startSession(
  "REST API クライアントスキルを作りたい",
);

// Main → Renderer イベント受信
window.electronAPI.skillCreatorSession.onQuestion((question) => {
  renderQuestionForm(question);
});

// 回答送信（invoke）
await window.electronAPI.skillCreatorSession.answer({ toolCallId, value });

// 完了 / エラー受信
window.electronAPI.skillCreatorSession.onComplete(({ result }) =>
  showResult(result),
);
window.electronAPI.skillCreatorSession.onError(({ error }) => showError(error));
```

## 重要な制約

- API キーや秘密情報を renderer ログに出力しない
- 30 秒タイムアウトを超えた場合は `session-error` に遷移する
- IPC チャネル名は `skill-creator:` 名前空間で固定する
- テスト数: 19 件（SdkSession 7 件 + IpcBridge 12 件）

## 参照

- [Phase 12 本文](../../phase-12-documentation.md)
- [Phase 2 設計](../../phase-2-design.md)
