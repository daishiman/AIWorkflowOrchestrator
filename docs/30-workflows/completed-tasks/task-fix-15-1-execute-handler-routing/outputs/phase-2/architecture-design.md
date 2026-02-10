# アーキテクチャ設計

## メタ情報

| 項目         | 値                                         |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名       | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日       | 2026-02-09                                 |
| 仕様書参照先 | phase-02-design.md                         |

---

## 1. 呼び出しフロー設計

### 1.1 全体フロー図

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

### 1.2 シーケンス図

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

## 2. コンポーネント設計

### 2.1 ハンドラー処理フロー

| ステップ | 処理内容                | 成功時の次アクション | 失敗時のレスポンス               |
| -------- | ----------------------- | -------------------- | -------------------------------- |
| 1        | IPC送信元検証           | ステップ2へ          | throw toIPCValidationError       |
| 2        | skillId バリデーション  | ステップ3へ          | { success: false, error: "..." } |
| 3        | prompt バリデーション   | ステップ4へ          | { success: false, error: "..." } |
| 4        | SkillExecutor初期化確認 | ステップ5へ          | { success: false, error: "..." } |
| 5        | スキル取得              | ステップ6へ          | { success: false, error: "..." } |
| 6        | リクエスト構築          | ステップ7へ          | N/A（例外発生時は catch へ）     |
| 7        | SkillExecutor.execute() | ステップ8へ          | catch ブロックへ                 |
| 8        | レスポンス変換          | return               | { success: false, error: "..." } |

### 2.2 統合ポイント

| 統合ポイント             | 契約定義                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------- |
| ハンドラー→SkillService  | `getSkillById(id: string): Promise<Skill \| null>`                                           |
| ハンドラー→SkillExecutor | `execute(req: SkillExecutionRequest, skill: SkillMetadata): Promise<SkillExecutionResponse>` |
| SkillExecutor→Renderer   | SKILL_STREAM チャンネルでストリーミングイベント送信                                          |

---

## 3. エラーハンドリング設計

### 3.1 エラーケース一覧

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

### 3.2 エラーメッセージサニタイズ

```typescript
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

## 4. 設定値・定数

### 4.1 RetryConfig デフォルト値

| パラメータ        | デフォルト値 | 説明                   |
| ----------------- | ------------ | ---------------------- |
| maxRetries        | 3            | 最大リトライ回数       |
| baseDelayMs       | 1000         | 基本待機時間（ミリ秒） |
| maxDelayMs        | 30000        | 最大待機時間（ミリ秒） |
| jitterFactor      | 0.2          | Jitter範囲 0-1         |
| backoffMultiplier | 2            | バックオフ倍率         |

### 4.2 PermissionResolver 設定

| パラメータ         | デフォルト値 | 説明                            |
| ------------------ | ------------ | ------------------------------- |
| DEFAULT_TIMEOUT_MS | 300000       | 権限応答待機タイムアウト（5分） |

### 4.3 同時実行制限

| パラメータ     | 値  | 説明             |
| -------------- | --- | ---------------- |
| MAX_CONCURRENT | 5   | 同時実行数の上限 |

---

## 5. ハンドラー実装設計（疑似コード）

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

## 6. アーキテクチャ層別設計

| 層           | 設計観点                                   | 修正ファイル                               |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| Main Process | ハンドラー修正、バリデーション、型変換     | apps/desktop/src/main/ipc/skillHandlers.ts |
| IPC通信      | 既存チャンネル使用、型定義参照             | （変更なし）                               |
| サービス層   | getSkillById, isSkillImported メソッド使用 | （変更なし）                               |
| Preload      | 変更不要                                   | （変更なし）                               |
| Renderer     | 変更不要                                   | （変更なし）                               |

---

## 7. セキュリティ設計

### 7.1 IPC セキュリティ原則の適用

| 原則                     | 適用方法                                               |
| ------------------------ | ------------------------------------------------------ |
| 送信元検証               | validateIpcSender で mainWindow からの呼び出しのみ許可 |
| 引数バリデーション       | skillId, prompt の型・空チェック                       |
| エラーサニタイズ         | sanitizeErrorMessage で内部情報を隠蔽                  |
| チャンネルホワイトリスト | IPC_CHANNELS 定数経由でのみアクセス                    |

### 7.2 エラー情報の隠蔽

- スタックトレースを含むエラーは log.error で記録のみ
- ユーザーへは sanitizeErrorMessage で変換したメッセージを返却
- 認証情報、パス情報等の機密データを含まないことを保証

---

## 8. 成果物チェックリスト

- [x] 呼び出しフロー図が作成されている
- [x] シーケンス図が作成されている
- [x] 統合ポイントと契約が定義されている
- [x] エラーハンドリング設計が完了している
- [x] 設定値・定数が整理されている
- [x] ハンドラー実装の疑似コードが作成されている
- [x] アーキテクチャ層別の設計が完了している
- [x] セキュリティ設計が完了している
