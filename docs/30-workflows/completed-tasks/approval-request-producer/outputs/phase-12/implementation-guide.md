# Implementation Guide

## Part 1: まず何をするのか

この変更は、「危険そうな操作を見つけたら、実行を止めるだけで終わらず、ユーザーに知らせる」ためのものです。たとえば、熱いフライパンに手を出しそうなときに、横から「待って」と声をかけてもらえると安心です。

今回の `approval-request-producer` は、その「待って」の合図をアプリの中で送る役割です。`HooksFactory.createPreToolUseHook()` が危険な Bash コマンドを見つけたら、Main プロセスから Renderer へ approval リクエストを送ります。これで、ユーザーは何が起きたのかを画面上で確認できます。

### この機能で大事なこと

| 何が大事か         | 理由                                 | 例                                       |
| ------------------ | ------------------------------------ | ---------------------------------------- |
| 先に止める         | 危険な操作を実行させないため         | `rm -rf` などを先に止める                |
| 先に知らせる       | なぜ止まったかをユーザーが知れるため | 「危険なコマンドが止められた」と表示する |
| 1回ごとに識別する  | どの操作への返事かを間違えないため   | `operationId` を毎回新しく作る           |
| 実行全体と紐づける | どの会話・実行の出来事か分かるため   | `sessionId` を `executionId` で持つ      |

## Part 2: 技術詳細

### 公開されるペイロード

```ts
export interface ApprovalRequestPayload {
  sessionId: string;
  operationId: string;
  operationType: "dangerous_bash_command" | "external_send";
  description: string;
  destination?: string;
}
```

### 主な呼び出し経路

```ts
// apps/desktop/src/main/services/agent/HooksFactory.ts
const operationId = uuidv4();
pushApprovalRequest(this.mainWindow, {
  sessionId: this.sessionId,
  operationId,
  operationType: "dangerous_bash_command",
  description: `Dangerous command blocked: ${pattern}`,
});

return {
  proceed: false,
  message: `Dangerous command blocked: ${pattern}`,
};
```

### current contract

- `HooksFactory` は dangerous Bash パターンを `DANGEROUS_PATTERNS.BASH_COMMANDS` で検出する
- マッチしたら `pushApprovalRequest()` を 1 回だけ送る
- `mainWindow` が破棄済みなら `approvalHandlers.ts` 側のガードで送信を止める
- `operationId` は `uuidv4()` で毎回新規生成する
- `approvalHandlers.push.test.ts` は producer の regression-only テストとして維持する

### エラーハンドリングとエッジケース

- 安全なコマンドでは `pushApprovalRequest()` を呼ばない
- 複数の危険パターンがあっても最初のマッチで止める
- `return { proceed: false }` は維持し、追加通知の有無と実行ブロックを分離する
- `sessionId` は実行単位のラベルなので、同じ実行ではぶれない

### 設定・定数

| 項目           | 内容                               |
| -------------- | ---------------------------------- |
| 検出ルール     | `DANGEROUS_PATTERNS.BASH_COMMANDS` |
| IPC チャンネル | `IPC_CHANNELS.APPROVAL_REQUEST`    |
| 操作種別       | `dangerous_bash_command`           |
| 相関 ID        | `sessionId` / `operationId`        |

### テスト観点

| テスト                          | 目的                                 |
| ------------------------------- | ------------------------------------ |
| `HooksFactory.producer.test.ts` | producer の単体確認                  |
| `HooksFactory.test.ts`          | dangerous command ブロックの回帰確認 |
| `approvalHandlers.push.test.ts` | Main → Preload → Renderer の回帰確認 |
