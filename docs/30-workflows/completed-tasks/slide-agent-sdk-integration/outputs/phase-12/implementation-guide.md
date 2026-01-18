# 実装ガイド - Claude Agent SDK統合

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 12                                       |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## この機能は何をするの？

Claude Agent SDK統合は、AIを使ってプレゼンテーションスライドを自動生成する機能です。

### たとえ話で説明すると...

料理に例えると:

1. **hearing（ヒアリング）** = レシピを聞く
   - 「何を作りたいですか？」「材料は何がありますか？」

2. **structure（構造設計）** = 献立を考える
   - 「前菜→メイン→デザートの順番で作ろう」

3. **html（HTML生成）** = 実際に料理を作る
   - 材料を調理して、お皿に盛り付ける

4. **modifier（修正）** = 味を調整する
   - 「もう少し塩を足して」「盛り付けを変えて」

### 処理の流れ

```
あなた → [要望を入力] → AIエージェント → [スライド生成] → 完成したスライド
```

### 何が便利になるの？

| 従来の方法             | SDK統合後                |
| ---------------------- | ------------------------ |
| スライドを手作業で作成 | AIが自動でスライドを生成 |
| 構成を自分で考える     | AIが最適な構成を提案     |
| 修正のたびに手動編集   | AIが変更内容を自動反映   |

### セキュリティについて

- APIキー（AIサービスを使うための鍵）は暗号化されて保存されます
- インターネット通信は暗号化されています（HTTPS）
- あなたのデータは安全に扱われます

---

# Part 2: 技術的詳細（開発者・技術者向け）

## アーキテクチャ概要

```
Main Process
├── FileWatcher (chokidar)
│   └── onHtmlChange / onStructureChange
├── SyncManager
│   └── forwardSync() / reverseSync()
├── SkillExecutor
│   └── execute() → getAgentAPI().query()
└── AgentClient
    └── executeAgentQuery() → Anthropic SDK
                                  ↓
                         api.anthropic.com (HTTPS)
```

## 主要コンポーネント

### 1. SkillExecutor

**ファイル**: `apps/desktop/src/main/slide/skill-executor.ts`

**責務**: スキルフェーズのマッピングと実行制御

```typescript
interface SkillExecutor {
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;
  cancel(): void;
  onProgress(callback: (progress: number) => void): void;
  isExecuting(): boolean;
}

type SkillPhase = "hearing" | "structure" | "html" | "modifier";
```

**スキルマッピング**:

| SkillPhase | スキル名            |
| ---------- | ------------------- |
| hearing    | hearing-facilitator |
| structure  | structure-designer  |
| html       | html-generator      |
| modifier   | slide-modifier      |

### 2. AgentClient

**ファイル**: `apps/desktop/src/main/slide/agent-client.ts`

**責務**: Claude Agent SDKとの通信

```typescript
interface ModifierAgentAPI {
  query(
    options: ModifierAgentQueryOptions,
  ): Promise<ModifierAgentQueryResponse>;
  abort(): void;
  getStatus(): AgentInternalStatus;
  onMessage(callback: (message: SDKMessage) => void): () => void;
}

interface ModifierAgentQueryOptions {
  prompt: string;
  options?: {
    sessionId?: string;
    systemPrompt?: string;
    timeout?: number;
  };
}

interface ModifierAgentQueryResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}
```

## API仕様

### createSkillExecutor()

```typescript
/**
 * スキル実行器を作成する
 * @returns SkillExecutorインスタンス
 */
function createSkillExecutor(): SkillExecutor;
```

### execute()

```typescript
/**
 * スキルを実行する
 * @param phase - 実行するスキルフェーズ
 * @param projectPath - プロジェクトのルートパス
 * @returns スキル実行結果
 * @throws {Error} "Another skill is already executing" - 別のスキルが実行中
 * @throws {Error} "Cancelled" - キャンセルされた場合
 * @throws {Error} "Request timeout" - 30秒以内に応答がない場合
 */
async function execute(
  phase: SkillPhase,
  projectPath: string,
): Promise<SkillExecutionResult>;
```

### getAgentAPI()

```typescript
/**
 * Agent APIシングルトンを取得する
 * @returns ModifierAgentAPIインスタンス
 */
function getAgentAPI(): ModifierAgentAPI;
```

## 型定義

### SkillExecutionResult

```typescript
interface SkillExecutionResult {
  phase: SkillPhase;
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  // modifierフェーズの場合のみ
  changes?: StructureChange[];
  direction?: "forward" | "reverse";
  projectPath?: string;
}
```

### SDKMessage

```typescript
interface SDKMessage {
  id: string;
  type: "text" | "tool_use" | "tool_result" | "error" | "complete";
  content: string;
  timestamp: number;
  isComplete: boolean;
}
```

## 設定値

| 定数                 | 値                       | 説明                   |
| -------------------- | ------------------------ | ---------------------- |
| SDK_TIMEOUT          | 30000ms                  | デフォルトタイムアウト |
| SDK_CONFIG.model     | claude-sonnet-4-20250514 | 使用モデル             |
| SDK_CONFIG.maxTokens | 8192                     | 最大トークン数         |

## 使用例

### 基本的な使用

```typescript
import { createSkillExecutor } from "./skill-executor";

const executor = createSkillExecutor();

// 進捗コールバックを登録
executor.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
});

// スキルを実行
const result = await executor.execute("html", "/path/to/project");

if (result.success) {
  console.log("スキル実行成功:", result.output);
} else {
  console.error("スキル実行失敗:", result.error);
}
```

### キャンセル処理

```typescript
const executor = createSkillExecutor();

// 実行開始
const promise = executor.execute("hearing", "/path/to/project");

// 途中でキャンセル
setTimeout(() => {
  executor.cancel();
}, 5000);

// 結果を確認
const result = await promise;
if (result.error === "Cancelled") {
  console.log("処理がキャンセルされました");
}
```

### メッセージリスナー

```typescript
const agentAPI = getAgentAPI();

// メッセージリスナーを登録
const unsubscribe = agentAPI.onMessage((message) => {
  if (message.type === "text") {
    console.log("テキスト受信:", message.content);
  } else if (message.type === "complete") {
    console.log("完了:", message.content);
  }
});

// クエリ実行
const response = await agentAPI.query({
  prompt: "プレゼンテーションの構造を設計してください",
  options: { timeout: 30000 },
});

// リスナー解除
unsubscribe();
```

## エラーハンドリング

### エラー種別

| エラーメッセージ                     | 原因                | 対処法                  |
| ------------------------------------ | ------------------- | ----------------------- |
| "Another skill is already executing" | 別のスキルが実行中  | 実行完了を待つ          |
| "Cancelled"                          | ユーザーキャンセル  | 必要に応じて再実行      |
| "Request timeout"                    | 30秒タイムアウト    | ネットワーク確認/再試行 |
| "API key not configured"             | APIキー未設定       | 設定画面でAPIキーを設定 |
| "Aborted"                            | AbortController発火 | 意図的な中断            |

### エラーハンドリングパターン

```typescript
try {
  const result = await executor.execute("html", projectPath);

  if (!result.success) {
    switch (result.error) {
      case "Another skill is already executing":
        // 排他制御エラー
        await waitForCompletion();
        break;
      case "Cancelled":
        // キャンセル - 正常終了として扱う
        break;
      default:
        // その他のエラー
        showErrorNotification(result.error);
    }
  }
} catch (error) {
  // 予期せぬエラー
  console.error("Unexpected error:", error);
}
```

## セキュリティ

### APIキー管理

```typescript
// APIキーはsafeStorageで暗号化保存
const encrypted = store.get("anthropic_api_key");
if (encrypted && safeStorage.isEncryptionAvailable()) {
  return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
}

// 環境変数フォールバック（開発用）
const envKey = process.env.ANTHROPIC_API_KEY;
if (envKey) {
  return envKey;
}

throw new Error("API key not configured");
```

### 通信セキュリティ

- Anthropic API: HTTPS (TLS 1.3)
- 認証: Authorization: Bearer ヘッダー
- APIキーはログに出力されない

---

**作成日**: 2026-01-17
**Phase 12 タスク1-2 完了**
