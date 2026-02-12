# API 仕様書

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 2                                     |
| 作成日   | 2026-02-11                            |
| 更新日   | 2026-02-12                            |

## 1. SkillService API

### 1.1 setSkillExecutor

**概要**: SkillExecutor インスタンスを設定する（Setter Injection）

```typescript
setSkillExecutor(executor: SkillExecutor): void
```

**パラメータ**:

| 名前     | 型            | 必須 | 説明                      |
| -------- | ------------- | ---- | ------------------------- |
| executor | SkillExecutor | Yes  | SkillExecutorインスタンス |

**戻り値**: `void`

**呼び出しタイミング**: BrowserWindow 生成後、IPC ハンドラ登録前

**使用例**:

```typescript
// main/index.ts
const mainWindow = createWindow();
const skillExecutor = new SkillExecutor(
  mainWindow,
  permissionStore,
  authKeyService,
);
skillService.setSkillExecutor(skillExecutor);
```

---

### 1.2 executeSkill

**概要**: スキルを実行する（SkillExecutor に委譲）

```typescript
async executeSkill(
  skillId: string,
  params?: {
    prompt?: string;
    timeout?: number;
    sessionId?: string;
    retryConfig?: Partial<RetryConfig>;
  }
): Promise<SkillExecutionResponse>
```

**パラメータ**:

| 名前               | 型                   | 必須 | 説明                                     |
| ------------------ | -------------------- | ---- | ---------------------------------------- |
| skillId            | string               | Yes  | 実行対象のスキルID                       |
| params             | object               | No   | 実行オプション                           |
| params.prompt      | string               | No   | ユーザープロンプト（デフォルト: 空文字） |
| params.timeout     | number               | No   | タイムアウト（ms）（デフォルト: 30000）  |
| params.sessionId   | string               | No   | セッションID（会話継続用）               |
| params.retryConfig | Partial<RetryConfig> | No   | リトライ設定（部分指定可能）             |

**戻り値**: `Promise<SkillExecutionResponse>`

**例外**:

| 例外条件               | エラーメッセージ                       |
| ---------------------- | -------------------------------------- |
| SkillExecutor 未初期化 | `SkillExecutor が初期化されていません` |
| スキルが見つからない   | `スキルが見つかりません`               |
| スキルが未インポート   | `スキルがインポートされていません`     |

**使用例**:

```typescript
// IPC handler から呼び出し
const response = await skillService.executeSkill("my-skill-id", {
  prompt: "ファイルを作成してください",
  timeout: 60000,
});

if (response.success) {
  console.log("Execution ID:", response.executionId);
} else {
  console.error("Error:", response.error);
}
```

---

## 2. 型定義

### 2.1 SkillExecutionRequest

**概要**: スキル実行リクエスト

```typescript
interface SkillExecutionRequest {
  /** ユーザープロンプト */
  prompt: string;

  /** スキルID */
  skillId: string;

  /** タイムアウト（ミリ秒）（オプション） */
  timeout?: number;

  /** セッションID（オプション） */
  sessionId?: string;

  /** リトライ設定（部分指定可能）（オプション） */
  retryConfig?: Partial<RetryConfig>;
}
```

---

### 2.2 SkillExecutionResponse

**概要**: スキル実行レスポンス

```typescript
interface SkillExecutionResponse {
  /** 実行ID（UUID） */
  executionId: string;

  /** 実行成功フラグ */
  success: boolean;

  /** エラー情報（失敗時のみ） */
  error?: SkillExecutionError;
}
```

---

### 2.3 SkillExecutionError

**概要**: スキル実行エラー

```typescript
interface SkillExecutionError {
  /** エラーコード */
  code: SkillExecutionErrorCode;

  /** エラーメッセージ */
  message: string;

  /** 追加詳細（オプション） */
  details?: unknown;
}
```

---

### 2.4 SkillExecutionErrorCode

**概要**: エラーコード定義

```typescript
type SkillExecutionErrorCode =
  | "EXECUTION_FAILED" // 一般的な実行失敗
  | "TIMEOUT" // タイムアウト
  | "ABORTED" // ユーザーによる中断
  | "MAX_CONCURRENT_EXCEEDED" // 同時実行数上限超過
  | "SKILL_NOT_FOUND" // スキルが見つからない
  | "VALIDATION_FAILED" // バリデーション失敗
  | "SDK_ERROR" // SDK エラー
  | "NETWORK_ERROR" // ネットワークエラー
  | "AUTHENTICATION_ERROR"; // 認証エラー（APIキー未設定等）
```

---

### 2.5 RetryConfig

**概要**: リトライ設定

```typescript
interface RetryConfig {
  /** 最大リトライ回数（デフォルト: 3） */
  maxRetries: number;

  /** 基本待機時間（ミリ秒）（デフォルト: 1000） */
  baseDelayMs: number;

  /** 最大待機時間（ミリ秒）（デフォルト: 30000） */
  maxDelayMs: number;

  /** Jitter範囲 0-1（デフォルト: 0.2） */
  jitterFactor: number;

  /** バックオフ倍率（デフォルト: 2） */
  backoffMultiplier: number;
}
```

---

### 2.6 SkillMetadata

**概要**: SDK 層で使用するスキルメタデータ

```typescript
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  /** スキルID */
  id: string;

  /** スキル名 */
  name: string;

  /** スラグ */
  slug: string;

  /** 説明 */
  description: string;

  /** スキルディレクトリパス */
  path: string;

  /** トリガー定義 */
  triggers: SkillTrigger[];

  /** アンカー定義 */
  anchors: SkillAnchor[];

  /** 許可ツールリスト */
  allowedTools: string[];

  /** カテゴリ（オプション） */
  category?: string;
}
```

---

## 3. 型変換仕様

### 3.1 Skill → SkillMetadata 変換

**概要**: UI 層の Skill 型を SDK 層の SkillMetadata 型に変換する

**変換マッピング**:

| Skill フィールド | SkillMetadata フィールド | 変換内容       |
| ---------------- | ------------------------ | -------------- |
| id               | id                       | そのままコピー |
| name             | name                     | そのままコピー |
| slug             | slug                     | そのままコピー |
| description      | description              | そのままコピー |
| path             | path                     | そのままコピー |
| triggers         | triggers                 | そのままコピー |
| anchors          | anchors                  | そのままコピー |
| allowedTools     | allowedTools             | そのままコピー |
| category         | category                 | そのままコピー |
| **lastModified** | -                        | **除外**       |
| **version**      | -                        | **除外**       |

**実装コード**:

```typescript
// SkillService.executeSkill() 内
const metadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  category: skill.category,
};
```

---

## 4. IPC チャンネル仕様

### 4.1 skill:execute

**チャンネル名**: `SKILL_CHANNELS.SKILL_EXECUTE`（`skill:execute`）

**方向**: Renderer → Main

**リクエスト形式**:

```typescript
{
  skillId: string;
  prompt?: string;
  timeout?: number;
  sessionId?: string;
  retryConfig?: Partial<RetryConfig>;
}
```

**レスポンス形式**:

```typescript
{
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}
```

---

### 4.2 skill:stream

**チャンネル名**: `SKILL_CHANNELS.SKILL_STREAM`（`skill:stream`）

**方向**: Main → Renderer（ストリーミング）

**メッセージ形式**:

```typescript
interface SkillStreamMessage {
  executionId: string;
  id: string;
  type: "text" | "tool_use" | "error" | "complete" | "retry";
  content: string;
  timestamp: number;
  isComplete: boolean;
}
```

---

## 5. エラーハンドリング

### 5.1 実行前バリデーションエラー

| エラー条件         | スローされる例外                                |
| ------------------ | ----------------------------------------------- |
| Executor 未初期化  | `Error('SkillExecutor が初期化されていません')` |
| スキルID 不存在    | `Error('スキルが見つかりません')`               |
| スキル未インポート | `Error('スキルがインポートされていません')`     |

### 5.2 実行中エラー（SkillExecutionResponse で返却）

| エラー条件         | code                    | message                                |
| ------------------ | ----------------------- | -------------------------------------- |
| 同時実行数超過     | MAX_CONCURRENT_EXCEEDED | Maximum concurrent executions exceeded |
| タイムアウト       | TIMEOUT                 | Execution timed out                    |
| ユーザー中断       | ABORTED                 | Execution was aborted                  |
| API キー未設定     | AUTHENTICATION_ERROR    | Anthropic API Key is not configured    |
| ネットワークエラー | NETWORK_ERROR           | Network error occurred                 |
| SDK エラー         | SDK_ERROR               | SDK error message                      |

---

## 6. シーケンス図

```
Renderer          IPC Handler       SkillService      SkillExecutor      SDK
   │                   │                │                  │              │
   │ skill:execute     │                │                  │              │
   │──────────────────>│                │                  │              │
   │                   │ executeSkill() │                  │              │
   │                   │───────────────>│                  │              │
   │                   │                │ [1] 初期化確認   │              │
   │                   │                │─────────────────>│              │
   │                   │                │<─────────────────│              │
   │                   │                │ [2] getSkillById │              │
   │                   │                │ [3] isImported   │              │
   │                   │                │ [4] 型変換       │              │
   │                   │                │ execute()        │              │
   │                   │                │─────────────────>│              │
   │                   │                │                  │ query()      │
   │                   │                │                  │─────────────>│
   │                   │                │                  │<─────stream──│
   │                   │                │                  │              │
   │<──────────────────────────────────skill:stream────────│              │
   │                   │                │                  │              │
   │                   │<───────────────│<─────────────────│              │
   │<──────────────────│                │                  │              │
   │                   │                │                  │              │
```

---

## 7. 関連ドキュメント

- [アーキテクチャ設計書](./architecture-design.md)
- [要件定義書](../phase-1/requirements-definition.md)
- [SkillExecutor 実装](/apps/desktop/src/main/services/skill/SkillExecutor.ts)
- [SkillService 実装](/apps/desktop/src/main/services/skill/SkillService.ts)
