# Phase 2: 設計

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| Phase    | 2                                          |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-09                                 |

## 目的

Phase 1で定義した要件を実現可能な設計に落とし込む。

## 実行タスク

- アーキテクチャ設計: ハンドラー → SkillExecutor の呼び出しフロー設計
- 型変換設計: SkillExecutionRequest/Response 変換ロジック設計
- エラーハンドリング設計: 各エラーケースの処理フロー設計
- API設計: ハンドラー内部の関数分割設計

## 参照資料

| 資料名                 | パス                                                                             | 説明                                        |
| ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| 要件定義書             | docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-01-requirements.md | Phase 1成果物                               |
| IPC セキュリティ仕様   | `aiworkflow-requirements: security-skill-ipc.md`                                 | IPC Sender検証、チャンネルホワイトリスト    |
| SkillExecutor仕様      | `aiworkflow-requirements: interfaces-agent-sdk-executor.md`                      | execute()シグネチャ、戻り値型               |
| エラーハンドリング定義 | `aiworkflow-requirements: error-handling.md`                                     | SkillExecutionErrorCode定義（SE-01〜SE-07） |
| スキル実行セキュリティ | `aiworkflow-requirements: security-skill-execution.md`                           | 危険パターン検出、権限確認                  |
| PermissionResolver     | `apps/desktop/src/main/services/skill/PermissionResolver.ts`                     | 権限応答待機、5分タイムアウト               |

---

## 定数・設定値

### RetryConfig デフォルト値

| パラメータ        | デフォルト値 | 説明                   |
| ----------------- | ------------ | ---------------------- |
| maxRetries        | 3            | 最大リトライ回数       |
| baseDelayMs       | 1000         | 基本待機時間（ミリ秒） |
| maxDelayMs        | 30000        | 最大待機時間（ミリ秒） |
| jitterFactor      | 0.2          | Jitter範囲 0-1         |
| backoffMultiplier | 2            | バックオフ倍率         |

### PermissionResolver 設定

| パラメータ         | デフォルト値 | 説明                            |
| ------------------ | ------------ | ------------------------------- |
| DEFAULT_TIMEOUT_MS | 300000       | 権限応答待機タイムアウト（5分） |

### 同時実行制限

| パラメータ     | 値  | 説明             |
| -------------- | --- | ---------------- |
| MAX_CONCURRENT | 5   | 同時実行数の上限 |

### SkillExecutionErrorCode 一覧（SE-01〜SE-07, PR-02）

| エラーコード            | コードID | カテゴリ       | 説明                                    | リトライ |
| ----------------------- | -------- | -------------- | --------------------------------------- | -------- |
| MAX_CONCURRENT_EXCEEDED | SE-01    | リソース制限   | 同時実行数が上限（5件）に到達           | 待機後可 |
| INVALID_SKILL_METADATA  | SE-02    | バリデーション | SkillMetadata必須フィールド不足         | 不可     |
| ABORT                   | SE-03    | キャンセル     | ユーザーまたはシステムによる実行中断    | 不可     |
| EXECUTION_FAILED        | SE-06    | 実行エラー     | SDK query()呼び出し中の例外発生         | 不可     |
| PERMISSION_DENIED       | SE-07    | 権限エラー     | PreToolUseフックでツール使用が拒否      | 不可     |
| TIMEOUT                 | PR-02    | タイムアウト   | PermissionResolver応答待機が5分を超過   | 不可     |
| AUTHENTICATION_ERROR    | ※新規    | 認証エラー     | APIキー未設定/無効（TASK-FIX-16-1依存） | 不可     |

※ AUTHENTICATION_ERROR は TASK-FIX-16-1-SDK-APIKEY-INFRASTRUCTURE で追加予定

---

## アーキテクチャ設計

### 呼び出しフロー図

```
┌─────────────────────────────────────────────────────────────────┐
│                      SKILL_EXECUTE Handler                       │
├─────────────────────────────────────────────────────────────────┤
│  1. validateIpcSender()  ─────────────────────→ 失敗: throw     │
│  2. 引数バリデーション   ─────────────────────→ 失敗: return    │
│  3. _skillExecutorInstance チェック ──────────→ null: return    │
│  4. skillService.getSkillById(skillId) ──────→ null: return    │
│  5. buildSkillExecutionRequest(args, skill) ──→ request        │
│  6. _skillExecutorInstance.execute(request, skillMetadata)      │
│  7. mapExecutionResponse(response) ──────────→ return           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SkillExecutor.execute()                     │
├─────────────────────────────────────────────────────────────────┤
│  - 同時実行数チェック                                            │
│  - ExecutionContext 登録                                         │
│  - executeWithRetry() → callSDKQuery()                           │
│  - ストリーミング処理 → sendStream() → Renderer                  │
│  - 完了/エラー処理                                               │
└─────────────────────────────────────────────────────────────────┘
```

### シーケンス図

```
Renderer           skillHandlers       SkillService      SkillExecutor      SDK
   │                    │                    │                 │              │
   │──invoke(skill:execute)──→│               │                 │              │
   │                    │                    │                 │              │
   │                    │─validateIpcSender()→│                 │              │
   │                    │                    │                 │              │
   │                    │─getSkillById()────→│                 │              │
   │                    │←────skill──────────│                 │              │
   │                    │                    │                 │              │
   │                    │─buildRequest()────→│                 │              │
   │                    │                    │                 │              │
   │                    │─execute(req,skill)─────────────────→│              │
   │                    │                    │                 │─query()────→│
   │                    │                    │                 │←stream──────│
   │                    │                    │                 │              │
   │←─────────────────────stream(SKILL_STREAM)─────────────────│              │
   │                    │                    │                 │              │
   │                    │←───SkillExecutionResponse────────────│              │
   │←──{ success, data }│                    │                 │              │
```

---

## 型変換設計

### 入力変換: ハンドラー引数 → SkillExecutionRequest

```typescript
/**
 * ハンドラー引数の型定義
 */
interface SkillExecuteHandlerArgs {
  skillId: string;
  params?: {
    prompt?: string;
    timeout?: number;
    sessionId?: string;
    retryConfig?: Partial<RetryConfig>;
  };
}

/**
 * SkillExecutor.execute() が期待する SkillExecutionRequest
 * (apps/desktop/src/main/services/skill/SkillExecutor.ts で定義)
 */
interface SkillExecutionRequest {
  prompt: string;
  skillId: string;
  timeout?: number;
  sessionId?: string;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * 変換関数
 */
function buildSkillExecutionRequest(
  args: SkillExecuteHandlerArgs,
): SkillExecutionRequest {
  return {
    skillId: args.skillId,
    prompt: args.params?.prompt ?? "",
    timeout: args.params?.timeout,
    sessionId: args.params?.sessionId,
    retryConfig: args.params?.retryConfig,
  };
}
```

### Skill → SkillMetadata 変換

```typescript
/**
 * Skill 型（packages/shared/src/types/skill.ts）
 */
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: Anchor[];
  category?: SkillCategory | string;
  environment?: EnvironmentConfig;
  license?: string;
  allowedTools?: string[];
  tags?: string[];
  dependencies?: string[];
  lastModified: Date; // <- 除外対象
}

/**
 * SkillMetadata 型（SkillExecutor.ts で定義）
 */
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  // Skill型から継承
}

/**
 * 変換関数
 */
function toSkillMetadata(skill: Skill): SkillMetadata {
  const { lastModified, ...metadata } = skill;
  return metadata;
}
```

### 出力変換: SkillExecutionResponse → ハンドラーレスポンス

```typescript
/**
 * SkillExecutor.execute() が返す SkillExecutionResponse
 */
interface SkillExecutionResponse {
  executionId: string;
  success: boolean;
  error?: SkillExecutionError;
}

/**
 * ハンドラーが返すレスポンス型
 */
type HandlerResponse =
  | { success: true; data: { executionId: string } }
  | { success: false; error: string };

/**
 * 変換関数
 */
function mapExecutionResponse(
  response: SkillExecutionResponse,
): HandlerResponse {
  if (response.success) {
    return {
      success: true,
      data: { executionId: response.executionId },
    };
  }
  return {
    success: false,
    error: response.error?.message ?? "スキル実行に失敗しました",
  };
}
```

---

## エラーハンドリング設計

### エラーケース一覧

| エラーケース           | 検出箇所                         | レスポンス                                                    |
| ---------------------- | -------------------------------- | ------------------------------------------------------------- |
| IPC送信元検証失敗      | validateIpcSender                | throw toIPCValidationError(validation)                        |
| skillId が空/無効      | 引数バリデーション               | { success: false, error: "skillId must be..." }               |
| prompt が空/未指定     | 引数バリデーション               | { success: false, error: "prompt must be..." }                |
| SkillExecutor 未初期化 | \_skillExecutorInstance チェック | { success: false, error: "スキル実行エンジンが..." }          |
| スキル未取得           | getSkillById                     | { success: false, error: "スキルが見つかりません" }           |
| スキル未インポート     | getSkillById 後チェック          | { success: false, error: "スキルがインポートされていません" } |
| 同時実行数超過         | SkillExecutor                    | { success: false, error: response.error.message }             |
| SDK認証エラー          | SkillExecutor                    | { success: false, error: response.error.message }             |
| 実行タイムアウト       | SkillExecutor                    | { success: false, error: response.error.message }             |
| その他の実行エラー     | try-catch                        | { success: false, error: error.message }                      |

### エラーレスポンス設計

```typescript
/**
 * エラーレスポンス生成ヘルパー
 */
function createErrorResponse(message: string): {
  success: false;
  error: string;
} {
  return { success: false, error: message };
}

/**
 * 内部エラーからメッセージを安全に抽出
 * - 内部情報（スタックトレース等）を漏洩しない
 * - ユーザーフレンドリーなメッセージに変換
 */
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 既知のエラーパターンを安全なメッセージに変換
    if (error.message.includes("AUTHENTICATION_ERROR")) {
      return "認証に失敗しました。設定画面でAPIキーを確認してください。";
    }
    if (error.message.includes("TIMEOUT")) {
      return "実行がタイムアウトしました。";
    }
    if (error.message.includes("MAX_CONCURRENT_EXCEEDED")) {
      return "同時実行数の上限に達しました。しばらくしてから再試行してください。";
    }
    // デフォルト
    return error.message;
  }
  return "スキル実行に失敗しました";
}
```

---

## ハンドラー実装設計

### 修正後のハンドラーコード（設計）

```typescript
// skill:execute - スキルを実行
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event: IpcMainInvokeEvent,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // 1. 送信元検証
    const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_EXECUTE, {
      getAllowedWindows: () => [mainWindow],
    });
    if (!validation.valid) {
      throw toIPCValidationError(validation);
    }

    // 2. 引数バリデーション
    if (typeof args?.skillId !== "string" || args.skillId === "") {
      return createErrorResponse("skillId must be a non-empty string");
    }

    const prompt = args.params?.prompt;
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return createErrorResponse("prompt must be a non-empty string");
    }

    // 3. SkillExecutor 初期化チェック
    if (!_skillExecutorInstance) {
      return createErrorResponse("スキル実行エンジンが初期化されていません");
    }

    // 4. スキル取得
    const skill = await skillService.getSkillById(args.skillId);
    if (!skill) {
      return createErrorResponse("スキルが見つかりません");
    }

    // 5. リクエスト構築
    const request: SkillExecutionRequest = {
      skillId: args.skillId,
      prompt: prompt.trim(),
      timeout:
        typeof args.params?.timeout === "number"
          ? args.params.timeout
          : undefined,
      sessionId:
        typeof args.params?.sessionId === "string"
          ? args.params.sessionId
          : undefined,
    };

    // 6. スキルメタデータ構築
    const { lastModified, ...skillMetadata } = skill;

    try {
      // 7. SkillExecutor.execute() 呼び出し
      const response = await _skillExecutorInstance.execute(
        request,
        skillMetadata,
      );

      // 8. レスポンス変換
      if (response.success) {
        return {
          success: true,
          data: { executionId: response.executionId },
        };
      }
      return createErrorResponse(
        response.error?.message ?? "スキル実行に失敗しました",
      );
    } catch (error) {
      log.error("[skillHandlers] skill:execute error:", error);
      return createErrorResponse(sanitizeErrorMessage(error));
    }
  },
);
```

---

## 統合ポイント設計

| 統合ポイント             | 契約定義                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| ハンドラー→SkillService  | getSkillById(id: string): Promise<Skill \| null>                                           |
| ハンドラー→SkillExecutor | execute(req: SkillExecutionRequest, skill: SkillMetadata): Promise<SkillExecutionResponse> |
| SkillExecutor→Renderer   | SKILL_STREAM チャンネルでストリーミングイベント送信                                        |

---

## インポートチェック設計

現在の `SkillService.executeSkill()` にはインポート状態確認が含まれていた:

```typescript
// インポート状態確認
if (!this.importManager.isImported(skillId)) {
  throw new Error("スキルがインポートされていません");
}
```

この確認ロジックをハンドラー側に移動するか、SkillService の getSkillById とは別に確認する必要がある。

### 設計案: SkillService にインポート確認メソッド追加

```typescript
// SkillService に追加
isSkillImported(skillId: string): boolean {
  return this.importManager.isImported(skillId);
}
```

ハンドラーでの使用:

```typescript
// 4. スキル取得後にインポート確認
const skill = await skillService.getSkillById(args.skillId);
if (!skill) {
  return createErrorResponse("スキルが見つかりません");
}
if (!skillService.isSkillImported(args.skillId)) {
  return createErrorResponse("スキルがインポートされていません");
}
```

---

## アーキテクチャ層別設計

| 層           | 設計観点                                   | ファイル                                   |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| Main Process | ハンドラー修正、バリデーション、型変換     | apps/desktop/src/main/ipc/skillHandlers.ts |
| IPC通信      | 既存チャンネル使用、型定義参照             | packages/shared/src/types/skill.ts         |
| サービス層   | getSkillById, isSkillImported メソッド使用 | apps/desktop/src/main/services/skill/      |

---

## 多角的チェック観点（AIが判断）

本タスク（SKILL_EXECUTEハンドラーのSkillExecutor委譲）では以下の観点を適用：

| 観点                 | 確認内容                                    | 仕様参照先                                                  |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------- |
| セキュリティ         | IPC送信元検証、エラーメッセージのサニタイズ | `aiworkflow-requirements: security-skill-ipc.md`            |
| API設計              | チャンネル定義、入出力型の統一性            | `aiworkflow-requirements: interfaces-agent-sdk-executor.md` |
| エラーハンドリング   | SkillExecutionErrorCode準拠                 | `aiworkflow-requirements: error-handling.md`                |
| Electronセキュリティ | Main Process実装、validateIpcSender使用     | `aiworkflow-requirements: security-api-electron.md`         |

**Electronデスクトップアプリ観点**:

| 層                   | 確認内容                                  | 仕様参照先                    |
| -------------------- | ----------------------------------------- | ----------------------------- |
| バックエンド（Main） | SkillExecutor委譲設計、呼び出しフロー設計 | `architecture-*.md`           |
| IPC通信              | skill:execute チャンネル設計、型変換設計  | `interfaces-*.md`, `api-*.md` |

---

## 成果物

| 成果物             | パス                                                                       | 説明           |
| ------------------ | -------------------------------------------------------------------------- | -------------- |
| アーキテクチャ設計 | docs/30-workflows/task-fix-15-1-execute-handler-routing/phase-02-design.md | 本ドキュメント |

---

## 完了条件

- [x] 呼び出しフローが設計されている
- [x] 型変換ロジックが設計されている
- [x] エラーハンドリングが設計されている
- [x] 統合ポイント/契約が定義されている
- [x] アーキテクチャ層別の設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート
