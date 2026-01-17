# API設計書 - slide-agent-sdk-integration

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | task-imp-slide-agent-sdk-integration-001 |
| Phase      | 2                                        |
| 作成日     | 2026-01-17                               |
| ステータス | 完了                                     |

---

## 概要

本ドキュメントは、skill-executor.tsおよびagent-client.tsのAPI設計を定義する。

---

## SkillExecutor API

### インターフェース定義

```typescript
/**
 * スキル実行器インターフェース
 */
export interface SkillExecutor {
  /**
   * スキルを実行する
   * @param phase スキルフェーズ（hearing/structure/html/modifier）
   * @param projectPath プロジェクトパス
   * @returns スキル実行結果
   */
  execute(
    phase: SkillPhase,
    projectPath: string,
  ): Promise<SkillExecutionResult>;

  /**
   * 実行中のスキルをキャンセルする
   */
  cancel(): void;

  /**
   * 進捗コールバックを登録する
   * @param callback 進捗値（0-100）を受け取るコールバック
   */
  onProgress(callback: (progress: number) => void): void;

  /**
   * スキルが実行中かどうかを返す
   * @returns 実行中の場合true
   */
  isExecuting(): boolean;
}
```

### 型定義

```typescript
/**
 * スキルフェーズ
 */
type SkillPhase = "hearing" | "structure" | "html" | "modifier";

/**
 * スキル実行結果
 */
interface SkillExecutionResult {
  /** 実行したフェーズ */
  phase: SkillPhase;
  /** 成功したかどうか */
  success: boolean;
  /** 出力（成功時） */
  output?: string;
  /** エラーメッセージ（失敗時） */
  error?: string;
  /** 実行時間（ミリ秒） */
  duration: number;
  /** 変更リスト（modifierフェーズのみ） */
  changes?: StructureChange[];
  /** 同期方向（modifierフェーズのみ） */
  direction?: "forward" | "reverse";
  /** プロジェクトパス */
  projectPath?: string;
}

/**
 * 構造変更情報
 */
interface StructureChange {
  type: "add" | "remove" | "modify";
  section: string;
  description: string;
}
```

### スキルフェーズマッピング

| SkillPhase | Skill Name          | 説明               |
| ---------- | ------------------- | ------------------ |
| hearing    | hearing-facilitator | ヒアリングフェーズ |
| structure  | structure-designer  | 構造設計フェーズ   |
| html       | html-generator      | HTML生成フェーズ   |
| modifier   | slide-modifier      | 逆同期フェーズ     |

```typescript
const getSkillName = (phase: SkillPhase): string => {
  const skillMap: Record<SkillPhase, string> = {
    hearing: "hearing-facilitator",
    structure: "structure-designer",
    html: "html-generator",
    modifier: "slide-modifier",
  };
  return skillMap[phase];
};
```

### 使用例

```typescript
const executor = createSkillExecutor();

// 進捗コールバック登録
executor.onProgress((progress) => {
  console.log(`Progress: ${progress}%`);
});

// スキル実行
const result = await executor.execute("html", "/path/to/project");

if (result.success) {
  console.log("Skill executed:", result.output);
} else {
  console.error("Skill failed:", result.error);
}

// キャンセル
executor.cancel();
```

---

## AgentClient API

### インターフェース定義

```typescript
/**
 * Modifier Skill用のAgent APIインターフェース
 */
export interface ModifierAgentAPI {
  /**
   * クエリを実行する
   * @param options クエリオプション
   * @returns クエリ応答
   */
  query(
    options: ModifierAgentQueryOptions,
  ): Promise<ModifierAgentQueryResponse>;

  /**
   * 実行中のクエリを中断する
   */
  abort(): void;

  /**
   * 現在のステータスを取得する
   * @returns 内部ステータス
   */
  getStatus(): AgentInternalStatus;

  /**
   * メッセージコールバックを登録する
   * @param callback メッセージを受け取るコールバック
   * @returns 購読解除関数
   */
  onMessage(callback: (message: SDKMessage) => void): () => void;
}
```

### 型定義

```typescript
/**
 * クエリオプション
 */
interface ModifierAgentQueryOptions {
  /** プロンプト文字列 */
  prompt: string;
  /** 追加オプション */
  options?: {
    /** セッションID */
    sessionId?: string;
    /** システムプロンプト */
    systemPrompt?: string;
    /** タイムアウト（ミリ秒） */
    timeout?: number;
  };
}

/**
 * クエリ応答
 */
interface ModifierAgentQueryResponse {
  /** 応答コンテンツ */
  content: string;
  /** トークン使用量 */
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * 内部ステータス
 */
type AgentInternalStatus = "idle" | "running" | "error";

/**
 * SDKメッセージ
 */
interface SDKMessage {
  id: string;
  type: SDKMessageType;
  content: string;
  timestamp: number;
  isComplete: boolean;
}

/**
 * SDKメッセージタイプ
 */
type SDKMessageType =
  | "text"
  | "tool_use"
  | "tool_result"
  | "error"
  | "complete";
```

### 使用例

```typescript
const agentAPI = getAgentAPI();

// メッセージコールバック登録
const unsubscribe = agentAPI.onMessage((message) => {
  console.log("Message:", message);
});

// クエリ実行
try {
  const response = await agentAPI.query({
    prompt: "Generate slide structure",
    options: {
      systemPrompt: "You are a slide designer.",
      timeout: 30000,
    },
  });
  console.log("Response:", response.content);
} catch (error) {
  console.error("Query failed:", error);
}

// 購読解除
unsubscribe();
```

---

## 内部API設計

### executeWithAgentSDK（新規追加）

```typescript
/**
 * Agent SDKを使用してスキルを実行する
 * @param skillName スキル名
 * @param projectPath プロジェクトパス
 * @param signal AbortSignal
 * @param onProgress 進捗コールバック
 * @returns スキル出力
 */
async function executeWithAgentSDK(
  skillName: string,
  projectPath: string,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<string> {
  const agentAPI = getAgentAPI();

  // システムプロンプト生成
  const systemPrompt = buildSystemPrompt(skillName, projectPath);

  // プロンプト生成
  const prompt = buildPrompt(skillName, projectPath);

  // 進捗開始
  onProgress(0);

  try {
    const response = await agentAPI.query({
      prompt,
      options: {
        systemPrompt,
        timeout: 30000,
      },
    });

    onProgress(100);
    return response.content;
  } catch (error) {
    if (signal.aborted) {
      throw new Error("Cancelled");
    }
    throw error;
  }
}
```

### buildSystemPrompt（新規追加）

```typescript
/**
 * スキル用システムプロンプトを生成する
 * @param skillName スキル名
 * @param projectPath プロジェクトパス
 * @returns システムプロンプト
 */
function buildSystemPrompt(skillName: string, projectPath: string): string {
  return `You are an AI assistant specialized in ${skillName}.
Project path: ${projectPath}
Follow the skill instructions carefully and produce valid output.`;
}
```

### buildPrompt（新規追加）

```typescript
/**
 * スキル用プロンプトを生成する
 * @param skillName スキル名
 * @param projectPath プロジェクトパス
 * @returns プロンプト
 */
function buildPrompt(skillName: string, projectPath: string): string {
  switch (skillName) {
    case "html-generator":
      return `Generate HTML slides based on structure.md in ${projectPath}`;
    case "slide-modifier":
      return `Update structure.md based on HTML changes in ${projectPath}`;
    default:
      return `Execute ${skillName} skill for project at ${projectPath}`;
  }
}
```

### getApiKey（新規追加）

```typescript
/**
 * APIキーを取得する
 * safeStorageから取得、なければ環境変数からフォールバック
 * @returns APIキー
 * @throws APIキーが見つからない場合
 */
async function getApiKey(): Promise<string> {
  // 1. safeStorageから取得
  try {
    const stored = await getStoredApiKey();
    if (stored && safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(Buffer.from(stored, "base64"));
    }
  } catch {
    // safeStorage失敗時は環境変数にフォールバック
  }

  // 2. 環境変数からフォールバック
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey) {
    return envKey;
  }

  throw new Error("API key not found. Please set ANTHROPIC_API_KEY.");
}
```

---

## エラーハンドリング設計

### エラー型

| エラー            | メッセージ                           | 発生条件           |
| ----------------- | ------------------------------------ | ------------------ |
| タイムアウト      | "Request timeout"                    | 30秒超過           |
| 中断              | "Cancelled" / "Aborted"              | ユーザーキャンセル |
| 認証エラー        | "API key not found"                  | APIキー未設定      |
| SDK呼び出しエラー | "SDK call failed: ..."               | API呼び出し失敗    |
| 排他エラー        | "Another skill is already executing" | 同時実行           |

### エラーハンドリングフロー

```typescript
try {
  const result = await executor.execute(phase, projectPath);
  if (!result.success) {
    // 実行失敗（エラーは result.error に含まれる）
    handleError(result.error);
  }
} catch (error) {
  // 予期しないエラー
  handleUnexpectedError(error);
}
```

---

## 認証設計

### APIキー取得フロー

```
1. safeStorageから暗号化キーを取得
        ↓
   成功 → 復号して返却
   失敗 ↓
2. 環境変数 ANTHROPIC_API_KEY を取得
        ↓
   成功 → 返却
   失敗 ↓
3. Error("API key not found") をスロー
```

### APIキー保存フロー（既存機能）

```
1. UIでAPIキーを入力
        ↓
2. IPC: settings:save-api-key
        ↓
3. safeStorage.encryptString()
        ↓
4. 暗号化キーを永続化
```

---

## 進捗管理設計

### 進捗値

| 進捗 | タイミング                   |
| ---- | ---------------------------- |
| 0%   | 実行開始                     |
| 25%  | スキル名解決完了             |
| 50%  | API呼び出し開始              |
| 75%  | ストリーミング中（将来拡張） |
| 100% | 実行完了                     |

### 進捗通知フロー

```typescript
// SkillExecutor内
emitProgress(0); // 開始
emitProgress(25); // スキル名解決
emitProgress(50); // API呼び出し開始
// ... ストリーミング中は 51-99% で更新（将来拡張）
emitProgress(100); // 完了
```

---

## SDK統合ポイント

### 統合契約

| 統合ポイント              | 入力                    | 出力                 | 契約                        |
| ------------------------- | ----------------------- | -------------------- | --------------------------- |
| SkillExecutor→AgentClient | SkillPhase, projectPath | SkillExecutionResult | execute() → query()         |
| AgentClient→SDK           | prompt, systemPrompt    | content, usage       | query() → messages.create() |
| 認証                      | safeStorage / env       | APIキー              | Bearer トークン             |
| エラー                    | SDK例外                 | AgentError階層       | try/catch変換               |

### 入出力スキーマ

**AgentClient.query() 入力**:

```typescript
{
  prompt: string;          // 必須
  options?: {
    sessionId?: string;    // オプション
    systemPrompt?: string; // オプション
    timeout?: number;      // デフォルト: 30000
  };
}
```

**AgentClient.query() 出力**:

```typescript
{
  content: string;         // 応答テキスト
  usage?: {
    inputTokens: number;   // 入力トークン数
    outputTokens: number;  // 出力トークン数
  };
}
```

---

## 次のステップ

Phase 2 タスク3: シーケンス設計 - 処理フローの詳細設計

---

**作成日**: 2026-01-17
**Phase 2 タスク2 完了**
