# アーキテクチャ設計書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 2                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、skill-executor.tsおよびagent-client.tsにClaude Agent SDKを統合するためのアーキテクチャ設計を定義する。

---

## 現行アーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                FileWatcher (chokidar)                    ││
│  │             onHtmlChange / onStructureChange            ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                    SyncManager                           ││
│  │              forwardSync() / reverseSync()              ││
│  │              changeContextMap（無限ループ防止）          ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                   SkillExecutor                          ││
│  │           execute() ← 現在シミュレーション実装           ││
│  │           progressCallbacks、AbortController           ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                    AgentClient                           ││
│  │           query() ← 現在シミュレーション実装             ││
│  │           messageListeners、AbortController            ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────┘
                              │ シミュレーション
                              │ （1秒後に応答）
                              ▼
                        [シミュレーション応答]
```

### 現行の問題点

| 問題                 | 説明                                                           |
| -------------------- | -------------------------------------------------------------- |
| シミュレーション実装 | skill-executor.ts と agent-client.ts が1秒後にダミー応答を返す |
| SDK未統合            | 実際のClaude Agent SDK呼び出しが行われていない                 |
| 機能制限             | スキル実行が実際には何も処理しない                             |

---

## SDK統合後のアーキテクチャ

```
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                FileWatcher (chokidar)                    ││
│  │             onHtmlChange / onStructureChange            ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                    SyncManager                           ││
│  │              forwardSync() / reverseSync()              ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                   SkillExecutor                          ││
│  │           execute() ── スキルフェーズマッピング          ││
│  │           getSkillName() ── スキル名解決                ││
│  │           emitProgress() ── 進捗通知                    ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                    AgentClient                           ││
│  │           query() ── 実SDK API呼び出し                   ││
│  │           executeAgentQuery() ── HTTPS通信              ││
│  │           handleStreaming() ── ストリーミング処理       ││
│  └──────────────────────────┬──────────────────────────────┘│
│  ┌──────────────────────────┴──────────────────────────────┐│
│  │                 APIKeyManager (new)                      ││
│  │           getApiKey() ── safeStorage取得                ││
│  │           isKeyAvailable() ── キー存在確認              ││
│  └──────────────────────────┬──────────────────────────────┘│
└─────────────────────────────┼───────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────┴───────────────────────────────┐
│                Claude Agent SDK / Anthropic API              │
│               @anthropic-ai/claude-agent-sdk                │
│                     api.anthropic.com                        │
└─────────────────────────────────────────────────────────────┘
```

---

## コンポーネント設計

### 1. SkillExecutor（skill-executor.ts）

| 責務                     | 説明                            |
| ------------------------ | ------------------------------- |
| スキルフェーズマッピング | SkillPhaseをスキル名に変換      |
| 実行制御                 | 排他制御、キャンセル、進捗管理  |
| Agent API呼び出し        | AgentClientを使用してスキル実行 |

**変更内容**:

- シミュレーション（87-102行目）を実SDK呼び出しに置換
- `executeWithAgentSDK()` ヘルパー関数の実装
- ストリーミング応答からの進捗計算

```typescript
// 変更前（シミュレーション）
await new Promise<void>((resolve, reject) => {
  const timeout = setTimeout(() => resolve(), 1000);
  // ...
});

// 変更後（実SDK呼び出し）
const result = await executeWithAgentSDK(
  skillName,
  projectPath,
  abortController.signal,
  (progress) => emitProgress(progress),
);
```

### 2. AgentClient（agent-client.ts）

| 責務           | 説明                                   |
| -------------- | -------------------------------------- |
| SDK通信        | Claude Agent SDKを使用したHTTPS通信    |
| 認証           | APIキー管理とAuthorizationヘッダー設定 |
| ストリーミング | レスポンスのストリーミング処理         |

**変更内容**:

- `executeAgentQuery()` の実装を実API呼び出しに置換
- Anthropicクライアントの初期化
- ストリーミング応答のハンドリング

```typescript
// 変更前（シミュレーション）
setTimeout(() => {
  clearTimeout(timeoutId);
  resolve(simulatedResponse);
}, 1000);

// 変更後（実SDK呼び出し）
const client = new Anthropic({ apiKey: await getApiKey() });
const response = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 8192,
  system: systemPrompt,
  messages: [{ role: "user", content: prompt }],
});
```

### 3. APIKeyManager（新規追加）

| 責務                   | 説明                                  |
| ---------------------- | ------------------------------------- |
| キー取得               | safeStorageからAPIキーを安全に取得    |
| 環境変数フォールバック | 開発時のANTHROPIC_API_KEY環境変数対応 |
| キー検証               | APIキーの存在確認                     |

**実装方針**:

- agent-client.ts内に関数として追加（別ファイル不要）
- Electron safeStorageの利用
- 環境変数のフォールバック対応

```typescript
async function getApiKey(): Promise<string> {
  // 1. safeStorageから取得を試みる
  try {
    const encryptedKey = await getStoredApiKey();
    if (encryptedKey) {
      return safeStorage.decryptString(Buffer.from(encryptedKey, "base64"));
    }
  } catch {
    // safeStorage失敗時はフォールバック
  }

  // 2. 環境変数からフォールバック（開発用）
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error("API key not found");
}
```

---

## 依存関係設計

### パッケージ依存

| パッケージ                     | 追加先                       | 理由                     |
| ------------------------------ | ---------------------------- | ------------------------ |
| @anthropic-ai/claude-agent-sdk | packages/shared/package.json | sharedからimportするため |
| @anthropic-ai/claude-agent-sdk | apps/desktop/package.json    | 実行時依存               |

### モジュール依存

```
skill-executor.ts
├── @repo/shared (SkillPhase, SkillExecutionResult)
└── agent-client.ts (getAgentAPI)

agent-client.ts
├── @anthropic-ai/claude-agent-sdk (Anthropic)
├── electron (safeStorage)
└── crypto (randomUUID)
```

### 依存追加コマンド

```bash
# packages/sharedへの追加
pnpm --filter @repo/shared add @anthropic-ai/claude-agent-sdk

# apps/desktopへの追加
pnpm --filter @repo/desktop add @anthropic-ai/claude-agent-sdk

# ロックファイル更新
pnpm install
```

---

## データフロー設計

### 正常系フロー

```
1. FileWatcher: ファイル変更検知
        ↓
2. SyncManager: 同期方向判定（forward/reverse）
        ↓
3. SkillExecutor: スキルフェーズ→スキル名マッピング
        ↓
4. AgentClient: プロンプト生成、API呼び出し
        ↓
5. Claude SDK: HTTPS通信、ストリーミング応答
        ↓
6. AgentClient: レスポンス解析、メッセージ通知
        ↓
7. SkillExecutor: 結果解析、進捗完了通知
        ↓
8. SyncManager: ファイル更新
```

### 異常系フロー

```
エラー発生時:
1. Claude SDK: エラー応答 / タイムアウト
        ↓
2. AgentClient: 例外キャッチ、ステータス更新
        ↓
3. SkillExecutor: エラー結果生成
        ↓
4. SyncManager: エラー通知（IPC）
        ↓
5. Renderer: エラーUI表示
```

---

## 設定値設計

### タイムアウト設定

| 設定            | 値       | 説明                    |
| --------------- | -------- | ----------------------- |
| DEFAULT_TIMEOUT | 30000ms  | デフォルトタイムアウト  |
| MAX_TIMEOUT     | 300000ms | 最大タイムアウト（5分） |

### モデル設定

| 設定       | 値                       | 説明           |
| ---------- | ------------------------ | -------------- |
| MODEL      | claude-sonnet-4-20250514 | 使用モデル     |
| MAX_TOKENS | 8192                     | 最大トークン数 |

---

## セキュリティ設計

### APIキー管理

| 対策       | 実装                     |
| ---------- | ------------------------ |
| 暗号化保存 | Electron safeStorage使用 |
| メモリ保護 | 使用後に変数クリア       |
| ログ除外   | APIキーをログ出力しない  |

### 通信セキュリティ

| 対策  | 実装                           |
| ----- | ------------------------------ |
| HTTPS | Anthropic API（TLS 1.3）       |
| 認証  | Authorization: Bearer ヘッダー |

---

## 変更影響範囲

### 変更ファイル

| ファイル                     | 変更内容                       |
| ---------------------------- | ------------------------------ |
| skill-executor.ts            | シミュレーション→実SDK呼び出し |
| agent-client.ts              | シミュレーション→実API呼び出し |
| packages/shared/package.json | SDK依存追加                    |
| apps/desktop/package.json    | SDK依存追加                    |

### 影響を受けないファイル

| ファイル            | 理由                     |
| ------------------- | ------------------------ |
| file-watcher.ts     | インターフェース変更なし |
| sync-manager.ts     | インターフェース変更なし |
| SyncStatusIndicator | 既存進捗APIを使用        |

---

## テスト戦略

### ユニットテスト

| 対象              | テスト内容                                     |
| ----------------- | ---------------------------------------------- |
| skill-executor.ts | スキルフェーズマッピング、進捗通知、キャンセル |
| agent-client.ts   | API呼び出し（モック）、エラーハンドリング      |

### 統合テスト

| 対象    | テスト内容                                |
| ------- | ----------------------------------------- |
| SDK統合 | エンドツーエンドのスキル実行（モックAPI） |

### モック戦略

```typescript
// Anthropicクライアントのモック
vi.mock("@anthropic-ai/claude-agent-sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: '{"changes": []}' }],
        usage: { input_tokens: 100, output_tokens: 50 },
      }),
    },
  })),
}));
```

---

## 次のステップ

Phase 2 タスク2: API設計 - 詳細なAPI仕様を設計

---

**作成日**: 2026-01-17
**Phase 2 タスク1 完了**
