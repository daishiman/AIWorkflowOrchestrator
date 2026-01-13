# Claude Agent SDK統合 - 統合テスト設計

## 1. 概要

本ドキュメントでは、Claude Agent SDK統合機能の統合テストシナリオを定義する。
コンポーネント間の連携とエンドツーエンドのデータフローを検証する。

---

## 2. 統合テストカテゴリ

| カテゴリ           | 検証内容                                     | テストファイル          |
| ------------------ | -------------------------------------------- | ----------------------- |
| IPC接続テスト      | agent:\*チャネルのエンドポイント疎通         | `*.integration.test.ts` |
| データフローテスト | Renderer→Main→SDK→Main→Rendererの往復        | `*.flow.test.ts`        |
| エラーハンドリング | SDK障害時のエラー伝播・Renderer表示          | `*.error.test.ts`       |
| Permission連携     | agent:permission→Dialog→agent:permission:res | `*.permission.test.ts`  |
| キャンセル処理     | AbortSignal伝播・キャンセル通知              | `*.cancel.test.ts`      |

---

## 3. IPC接続テスト

### 3.1 テストシナリオ

```
シナリオ: IPC通信の確立
  Given: Electronアプリが起動している
  When: Rendererがagent:startを呼び出す
  Then: Main Processがリクエストを受信する
  And: executionIdが返却される
```

### 3.2 テストケース

| ID      | シナリオ名             | 検証内容                          |
| ------- | ---------------------- | --------------------------------- |
| IPC-001 | agent:start疎通        | リクエスト送信→executionId受信    |
| IPC-002 | agent:stop疎通         | 停止リクエスト→結果受信           |
| IPC-003 | agent:stream受信       | Main→Renderer方向のメッセージ受信 |
| IPC-004 | agent:status受信       | ステータス変更通知の受信          |
| IPC-005 | agent:permission双方向 | リクエスト受信→応答送信           |

---

## 4. データフローテスト

### 4.1 正常フロー

```
シナリオ: 正常なクエリ実行フロー
  Given: エージェント実行が開始されている
  When: SDKがストリーミングメッセージを生成する
  Then: 各メッセージがagent:stream経由でRendererに送信される
  And: 完了時にagent:statusでcompletedが通知される
```

### 4.2 テストケース

| ID     | シナリオ名                   | データフロー                               |
| ------ | ---------------------------- | ------------------------------------------ |
| DF-001 | プロンプト→SDK→レスポンス    | Renderer → Main → SDK → Main → Renderer    |
| DF-002 | 複数メッセージストリーミング | SDK → Main(複数回) → Renderer(複数回)      |
| DF-003 | ツール使用→結果表示          | SDK(tool_use) → Main → Renderer → 結果表示 |

---

## 5. エラーハンドリングテスト

### 5.1 エラー伝播フロー

```
シナリオ: SDK例外のエラー伝播
  Given: エージェント実行中
  When: SDKが例外をスローする
  Then: agent:streamでerrorタイプのメッセージが送信される
  And: agent:statusでerrorステータスが通知される
  And: ExecutionManagerから実行が削除される
```

### 5.2 テストケース

| ID      | シナリオ名           | エラー種別                     |
| ------- | -------------------- | ------------------------------ |
| ERR-001 | SDK初期化エラー      | 接続失敗、認証エラー           |
| ERR-002 | ストリーミングエラー | ネットワーク切断、タイムアウト |
| ERR-003 | バリデーションエラー | 無効なリクエストパラメータ     |
| ERR-004 | Permission拒否       | ユーザーによるツール使用拒否   |

---

## 6. Permission連携テスト

### 6.1 Permission確認フロー

```
シナリオ: Permission確認ダイアログ連携
  Given: エージェントがツール使用を試みる
  When: PermissionRequest Hookが発火する
  Then: agent:permissionでRendererにリクエストが送信される
  And: ユーザーがダイアログで応答する
  And: agent:permission:resで応答がMainに返送される
  And: SDKの実行が継続または中断される
```

### 6.2 テストケース

| ID       | シナリオ名           | ユーザー応答         | 期待結果         |
| -------- | -------------------- | -------------------- | ---------------- |
| PERM-001 | 許可応答             | approved: true       | ツール実行継続   |
| PERM-002 | 拒否応答             | approved: false      | ツール実行中断   |
| PERM-003 | 記憶チェック付き許可 | rememberChoice: true | 次回から自動許可 |
| PERM-004 | タイムアウト         | 応答なし             | デフォルト拒否   |

---

## 7. キャンセル処理テスト

### 7.1 キャンセルフロー

```
シナリオ: 実行中のキャンセル
  Given: エージェントが実行中
  When: ユーザーがagent:stopを呼び出す
  Then: AbortControllerがabort()される
  And: SDKの実行が中断される
  And: agent:statusでcancelledが通知される
  And: ExecutionManagerから実行が削除される
```

### 7.2 テストケース

| ID      | シナリオ名                 | キャンセルタイミング | 期待結果                |
| ------- | -------------------------- | -------------------- | ----------------------- |
| CAN-001 | 実行中キャンセル           | ストリーミング中     | 即時中断、cancelled通知 |
| CAN-002 | Permission待機中キャンセル | ダイアログ表示中     | Promise reject、中断    |
| CAN-003 | 全実行キャンセル           | 複数実行中           | 全実行が中断            |

---

## 8. テストデータ

### 8.1 モックリクエスト

```typescript
const mockRequest: AgentExecutionRequest = {
  executionId: "test-exec-id",
  skillId: "test-skill",
  skillPath: "/path/to/skill",
  prompt: "Test prompt",
  workingDirectory: "/test/dir",
  tools: ["Read", "Edit", "Write", "Bash"],
  permissionMode: "default",
};
```

### 8.2 モックストリームメッセージ

```typescript
const mockMessages = [
  { type: "assistant", message: "Hello" },
  { type: "tool_use", toolName: "Read", args: { path: "/file.txt" } },
  { type: "result", toolName: "Read", result: "file content" },
  { type: "assistant", message: "Done" },
];
```

---

## 9. 統合テスト実行

### 9.1 実行コマンド

```bash
# 統合テストのみ実行
pnpm --filter @repo/desktop test -- --grep "integration"

# 特定カテゴリのみ
pnpm --filter @repo/desktop test -- --grep "IPC"
pnpm --filter @repo/desktop test -- --grep "Permission"
```

### 9.2 カバレッジ確認

```bash
pnpm --filter @repo/desktop test:coverage
```

---

## 10. 統合ポイント契約

| 統合ポイント               | 方向          | 契約型                |
| -------------------------- | ------------- | --------------------- |
| Renderer → Main (start)    | invoke        | AgentExecutionRequest |
| Main → SDK (query)         | API call      | Options (SDK型)       |
| SDK → Main (stream)        | AsyncIterator | SDKMessage (SDK型)    |
| Main → Renderer (stream)   | send          | AgentStreamMessage    |
| Main → Renderer (status)   | send          | AgentExecutionStatus  |
| Main → Renderer (perm)     | send          | PermissionRequest     |
| Renderer → Main (perm res) | invoke        | PermissionResponse    |

---

作成日: 2026-01-12
Phase: 4
ステータス: 完了
