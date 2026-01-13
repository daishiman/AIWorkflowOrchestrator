# フォールバック設計書 - Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスクID   | AGENT-SDK-DEP-FIX                       |
| Phase      | 2 - 設計                                |
| 作成日     | 2026-01-13                              |
| ステータス | 完了                                    |
| ブランチ   | docs/task-spec-agent-sdk-dependency-fix |

---

## 概要

本タスクの修正により、SDK が正常に解決されることが期待される。
本ドキュメントでは、修正後も想定外の状況で SDK が利用できない場合のフォールバック設計を定義する。

---

## フォールバックシナリオ

### シナリオ1: SDK インストール失敗

**発生条件**:

- npm registry への接続失敗
- パッケージの整合性チェック失敗
- ディスク容量不足

**対応**:
既存の `AgentInitializationError` を使用してエラーを報告。

```typescript
// packages/shared/src/agent/agent-client.ts（既存実装）
try {
  this.sdk = new ClaudeSDK({ apiKey: this.config.apiKey });
  this.updateStatus("initialized");
} catch (error) {
  this.updateStatus("error", (error as Error).message);
  throw new AgentInitializationError("SDK initialization failed", error);
}
```

**フォールバック動作**:

- ステータスが `error` に設定
- エラーメッセージがログに記録
- UI にエラー状態が表示

### シナリオ2: API キー未設定

**発生条件**:

- 環境変数 `ANTHROPIC_API_KEY` が未設定
- 無効な API キー形式

**対応**:
既存の `AgentInitializationError` で検証。

```typescript
// packages/shared/src/agent/agent-client.ts（既存実装）
constructor(config: AgentClientConfig) {
  if (!config.apiKey) {
    throw new AgentInitializationError("API key is required");
  }
  // ...
}
```

**フォールバック動作**:

- 初期化時に例外発生
- IPC ハンドラ登録がスキップされる
- Agent 機能が無効化

### シナリオ3: SDK モジュール解決失敗（修正後も発生する可能性）

**発生条件**:

- node_modules の破損
- pnpm キャッシュの不整合
- 部分的なインストール

**対応**:
Main Process 起動時のエラーハンドリング。

```typescript
// apps/desktop/src/main/index.ts での対応案
try {
  const agentHandler = new AgentHandler({ apiKey });
  await agentHandler.initialize();
} catch (error) {
  if (error instanceof Error && error.message.includes("MODULE_NOT_FOUND")) {
    console.error("[Agent] SDK not found. Please run: pnpm install");
    // Agent 機能なしで続行
  } else {
    throw error;
  }
}
```

**フォールバック動作**:

- コンソールに復旧手順を出力
- Agent 機能を無効化してアプリを起動
- UI で Agent 機能が利用不可と表示

---

## エラーハンドリング階層

### エラー種別と対応

| エラー種別         | エラークラス               | 復旧可能性 | ユーザーへの通知       |
| ------------------ | -------------------------- | ---------- | ---------------------- |
| SDK 未インストール | `Error` (MODULE_NOT_FOUND) | 復旧可能   | pnpm install を促す    |
| API キー未設定     | `AgentInitializationError` | 復旧可能   | 設定画面への誘導       |
| API キー無効       | `AgentInitializationError` | 復旧可能   | API キー再入力を促す   |
| SDK 初期化失敗     | `AgentInitializationError` | 要調査     | エラーログを確認       |
| クエリ実行失敗     | `AgentQueryError`          | リトライ可 | 再試行またはエラー表示 |
| タイムアウト       | `AgentTimeoutError`        | リトライ可 | 再試行を促す           |
| ユーザー中断       | `AgentAbortedError`        | 正常       | 中断完了を表示         |

### エラー伝播フロー

```
SDK / Node.js エラー
        ↓
AgentClient でキャッチ
        ↓
AgentError にラップ
        ↓
IPC 経由でシリアライズ
        ↓
Renderer で deserializeAgentError
        ↓
UI でエラー表示
```

---

## グレースフルデグラデーション

### Agent 機能なしの動作

Agent SDK が利用不可の場合、以下の機能が制限される:

| 機能               | 状態     | 代替動作                   |
| ------------------ | -------- | -------------------------- |
| Agent クエリ       | 無効     | エラーメッセージ表示       |
| セッション管理     | 無効     | N/A                        |
| ストリーミング応答 | 無効     | N/A                        |
| AgentView          | 部分動作 | スキル一覧は表示可能       |
| AgentSDKPage       | 無効     | エラー状態を表示           |
| その他の機能       | 正常     | Agent 以外の機能は影響なし |

### UI での表示

```typescript
// AgentView での状態表示例
const AgentStatusBadge = ({ status }: { status: AgentStatus }) => {
  if (status.status === 'error') {
    return (
      <Badge variant="destructive">
        Agent: 利用不可 - {status.error}
      </Badge>
    );
  }
  // ...
};
```

---

## 復旧手順

### 手動復旧手順

1. **パッケージ再インストール**:

   ```bash
   pnpm install
   ```

2. **キャッシュクリア**:

   ```bash
   pnpm store prune
   pnpm install
   ```

3. **完全再インストール**:

   ```bash
   rm -rf node_modules
   rm -rf apps/desktop/node_modules
   rm -rf packages/shared/node_modules
   pnpm install
   ```

4. **ビルド再実行**:
   ```bash
   pnpm --filter @repo/shared build
   pnpm --filter @repo/desktop build
   ```

---

## ログ出力

### エラーログ形式

```
[Agent] ERROR: SDK initialization failed
  Cause: Cannot find package '@anthropic-ai/claude-agent-sdk'
  Recovery: Please run 'pnpm install' to install dependencies
```

### ログレベル

| レベル | 用途                           |
| ------ | ------------------------------ |
| ERROR  | 初期化失敗、クエリ失敗         |
| WARN   | リトライ発生、タイムアウト警告 |
| INFO   | 初期化完了、クエリ開始/終了    |
| DEBUG  | 詳細なSDK通信ログ              |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-13 | 初版作成 |
