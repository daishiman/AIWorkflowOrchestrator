# TASK-FIX-15-1 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| 機能名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| 作成日   | 2026-02-10                                 |
| Phase    | 12                                         |

---

# Part 1: 概念的説明（中学生レベル）

## 1. 日常生活での例え：レストランの注文システム

### 1.1 問題の状況（修正前）

レストランで注文を考えてみましょう。

```
お客さん → ウェイター → 「ただいま準備中です」とだけ返答
                         （実際には厨房に注文が届いていない！）
```

これが修正前の状態でした。お客さん（アプリのユーザー）がスキルを実行しようとすると、ウェイター（IPCハンドラー）は「実行しました」と返事をしますが、実際には厨房（SDK）に注文が届いていませんでした。

### 1.2 解決後の状態（修正後）

```
お客さん → ウェイター → 厨房（シェフ）→ 料理を調理 → お客さんに提供
              ↓
        注文内容を確認:
        1. メニューにあるか？
        2. 材料は揃っているか？
        3. 厨房は稼働中か？
```

修正後は、ウェイター（IPCハンドラー）がちゃんと厨房（SkillExecutor経由でSDK）に注文を伝え、実際の料理（スキル実行結果）がお客さんに届くようになりました。

### 1.3 この修正の意味

| 用語       | レストランでの例え     | 実際の意味                       |
| ---------- | ---------------------- | -------------------------------- |
| お客さん   | お客さん               | アプリを使うユーザー             |
| ウェイター | IPCハンドラー          | 注文を受け取って厨房に伝える役   |
| 厨房       | SkillExecutor          | 実際にスキルを実行するエンジン   |
| シェフ     | Claude Agent SDK       | AIに問い合わせて結果を返す仕組み |
| 注文内容   | SkillExecutionRequest  | 何を実行してほしいかの情報       |
| 料理       | SkillExecutionResponse | 実行した結果                     |

---

## 2. 技術的な意味の平易な説明

### 2.1 何が問題だったか

アプリには「スキルを実行する」機能がありますが、その機能が「実行したふりをする」だけで、実際にはAI（Claude）に問い合わせていませんでした。

### 2.2 何を直したか

「実行したふりをする部分」を削除し、「本当にAIに問い合わせる部分」につなぎ直しました。

### 2.3 なぜ重要か

この修正がないと、どんなにスキルをインポートしても、AIによる実行が行われません。つまり、スキル機能全体が使い物にならない状態でした。

---

# Part 2: 技術的詳細

## 1. 修正前/修正後のコードフロー

### 1.1 修正前（問題のあるフロー）

```
Renderer Process
      │
      ▼
skill:execute IPC 呼び出し
      │
      ▼
skillHandlers.ts [SKILL_EXECUTE handler]
      │
      ▼ skillService.executeSkill()
      │
SkillService.executeSkill()
      │
      ▼
"Skill executed successfully" (固定文字列を返すだけ)
      │
      ▼
SkillExecutor.execute() ← 完全に孤立（呼ばれない）
```

### 1.2 修正後（正しいフロー）

```
Renderer Process
      │
      ▼
skill:execute IPC 呼び出し
      │
      ▼
skillHandlers.ts [SKILL_EXECUTE handler]
      │
      ├─ 1. validateIpcSender()        ← セキュリティチェック
      │
      ├─ 2. 引数バリデーション          ← skillId, prompt の検証
      │
      ├─ 3. _skillExecutorInstance 確認 ← 初期化チェック
      │
      ├─ 4. skillService.getSkillById() ← スキル取得
      │
      ├─ 5. SkillExecutionRequest 構築  ← 型変換
      │
      ▼
_skillExecutorInstance.execute(request, skillMetadata)
      │
      ▼
Claude Agent SDK query() API 呼び出し
      │
      ▼
ストリーミングレスポンス → Renderer へ送信
      │
      ▼
SkillExecutionResponse を返却
```

---

## 2. 主要な変更点

### 2.1 変更ファイル

| ファイル                                               | 変更種別 | 内容                                    |
| ------------------------------------------------------ | -------- | --------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | 修正     | SKILL_EXECUTE ハンドラーの実行パス変更  |
| `apps/desktop/src/main/services/skill/SkillService.ts` | 削除     | executeSkill() メソッドを削除（スタブ） |

### 2.2 SKILL_EXECUTE ハンドラーの変更

**修正前:**

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_EXECUTE, async (event, args) => {
  // スタブ実装への呼び出し
  return await skillService.executeSkill(args.skillId, args.params);
});
```

**修正後:**

```typescript
ipcMain.handle(IPC_CHANNELS.SKILL_EXECUTE, async (event, args) => {
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
});
```

---

## 3. インターフェース定義

### 3.1 SkillExecutionRequest

```typescript
interface SkillExecutionRequest {
  skillId: string; // 実行対象のスキルID（必須）
  prompt: string; // ユーザーからのプロンプト（必須）
  timeout?: number; // タイムアウト（ミリ秒、オプション）
  sessionId?: string; // セッションID（オプション）
  retryConfig?: RetryConfig; // リトライ設定（オプション）
}
```

### 3.2 SkillExecutionResponse

```typescript
interface SkillExecutionResponse {
  success: boolean;
  executionId?: string; // 実行ID（成功時）
  error?: {
    code: SkillExecutionErrorCode;
    message: string;
  };
}
```

### 3.3 IPCハンドラーレスポンス

```typescript
// 成功時
{ success: true, data: { executionId: string } }

// エラー時
{ success: false, error: string }
```

---

## 4. 責務分離

### 4.1 レイヤー別責務

| レイヤー      | 責務                                       | ファイル         |
| ------------- | ------------------------------------------ | ---------------- |
| IPC Handler   | バリデーション、型変換、エラーハンドリング | skillHandlers.ts |
| SkillService  | スキル取得、インポート状態確認             | SkillService.ts  |
| SkillExecutor | SDK呼び出し、ストリーミング、リトライ      | SkillExecutor.ts |

### 4.2 責務の境界

```
┌─────────────────────────────────────────────────┐
│  skillHandlers.ts (IPC Layer)                   │
│  - IPC送信元検証                                 │
│  - 引数バリデーション                            │
│  - SkillExecutionRequest 構築                   │
│  - SkillExecutionResponse → IPCレスポンス変換   │
└───────────────────┬─────────────────────────────┘
                    │
    ┌───────────────┴───────────────┐
    ▼                               ▼
┌─────────────────┐         ┌─────────────────────┐
│  SkillService   │         │   SkillExecutor     │
│  - スキル取得    │         │  - SDK呼び出し       │
│  - インポート確認│         │  - ストリーミング     │
│                 │         │  - リトライ処理      │
│                 │         │  - abort/getStatus  │
└─────────────────┘         └─────────────────────┘
```

---

## 5. エラーハンドリング

### 5.1 エラーケース一覧

| エラーケース           | 検出箇所           | エラーコード         | レスポンス     |
| ---------------------- | ------------------ | -------------------- | -------------- |
| IPC送信元検証失敗      | validateIpcSender  | -                    | throw          |
| skillId 空/無効        | 引数バリデーション | -                    | error response |
| prompt 空/未指定       | 引数バリデーション | -                    | error response |
| SkillExecutor 未初期化 | 初期化チェック     | -                    | error response |
| スキル未取得           | getSkillById       | -                    | error response |
| 同時実行数超過         | SkillExecutor      | SE-01                | error response |
| 認証エラー             | SkillExecutor      | AUTHENTICATION_ERROR | error response |
| タイムアウト           | SkillExecutor      | PR-02                | error response |
| その他実行エラー       | catch block        | SE-06                | error response |

### 5.2 エラーメッセージサニタイズ

内部エラー情報がユーザーに漏洩しないよう、`sanitizeErrorMessage()` 関数でエラーメッセージを変換します。

```typescript
function sanitizeErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("AUTHENTICATION_ERROR")) {
      return "認証に失敗しました。設定画面でAPIキーを確認してください。";
    }
    if (error.message.includes("TIMEOUT")) {
      return "実行がタイムアウトしました。";
    }
    if (error.message.includes("MAX_CONCURRENT_EXCEEDED")) {
      return "同時実行数の上限に達しました。しばらくしてから再試行してください。";
    }
    return error.message;
  }
  return "スキル実行に失敗しました";
}
```

---

## 6. 設定可能なパラメータ

### 6.1 RetryConfig デフォルト値

| パラメータ        | デフォルト値 | 説明                   |
| ----------------- | ------------ | ---------------------- |
| maxRetries        | 3            | 最大リトライ回数       |
| baseDelayMs       | 1000         | 基本待機時間（ミリ秒） |
| maxDelayMs        | 30000        | 最大待機時間（ミリ秒） |
| jitterFactor      | 0.2          | Jitter範囲 0-1         |
| backoffMultiplier | 2            | バックオフ倍率         |

### 6.2 同時実行制限

| パラメータ     | 値  | 説明             |
| -------------- | --- | ---------------- |
| MAX_CONCURRENT | 5   | 同時実行数の上限 |

### 6.3 権限応答タイムアウト

| パラメータ         | 値     | 説明                            |
| ------------------ | ------ | ------------------------------- |
| DEFAULT_TIMEOUT_MS | 300000 | 権限応答待機タイムアウト（5分） |

---

## 7. テスト結果サマリー

| 項目           | 結果                                                                         |
| -------------- | ---------------------------------------------------------------------------- |
| テストファイル | 4件パス                                                                      |
| テスト数       | 106件パス / 1件スキップ                                                      |
| 実行時間       | 44.41秒                                                                      |
| スキップ理由   | SkillExecutor未初期化テスト（registerSkillHandlers()で常に初期化されるため） |

---

## 8. 関連タスク

| タスクID                              | 内容                 | 関係       |
| ------------------------------------- | -------------------- | ---------- |
| TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE | APIキー管理基盤      | 前提条件   |
| TASK-FIX-15-2-TYPE-CONSOLIDATION      | 型定義をsharedに移動 | 派生タスク |
| TASK-FIX-5-1-SKILL-API-UNIFICATION    | スキルAPI統一        | 関連       |

---

## 成果物チェックリスト

- [x] Part 1: 概念的説明（中学生レベル）が作成されている
- [x] Part 2: 技術的詳細が作成されている
- [x] 修正前/修正後のコードフローが記載されている
- [x] インターフェース定義が記載されている
- [x] 責務分離が説明されている
- [x] エラーハンドリングが網羅されている
- [x] 設定可能なパラメータが記載されている
