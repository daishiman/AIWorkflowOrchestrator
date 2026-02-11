# Phase 2: 設計

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 2                                     |
| 機能名   | skill-execute-delegation              |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| 作成日   | 2026-02-10                            |

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。既存のSkillExecutorを活用し、IPCハンドラーからの委譲パターンを設計する。

## 実行タスク

- アーキテクチャ設計: 委譲パターンの設計とインターフェース定義
- データフロー設計: IPC → SkillExecutor → SDK → Stream のフロー設計
- エラーハンドリング設計: エラー変換とレスポンス形式の設計

## 参照資料

### Phase成果物

| 資料名     | パス                                                                        | 説明          |
| ---------- | --------------------------------------------------------------------------- | ------------- |
| 要件定義書 | `docs/30-workflows/skill-execute-delegation/phases/phase-1-requirements.md` | Phase 1成果物 |

### システム仕様書（aiworkflow-requirements）【必須参照】

| 資料名                                  | パス                                                                                        | 説明                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| interfaces-agent-sdk-executor.md        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`        | SkillExecutor完全仕様（型定義・API・リトライ） |
| interfaces-agent-sdk-skill.md           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理API仕様・SkillMetadata型定義         |
| security-skill-ipc.md                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | IPC通信セキュリティ（safeInvoke/safeOn）       |
| error-handling.md                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラーハンドリング仕様                         |
| architecture-implementation-patterns.md | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン                                   |

---

## アーキテクチャ設計

### 現在のアーキテクチャ（Before）

```
Renderer                    Main Process
┌─────────────────┐        ┌─────────────────────────────────────┐
│ useSkillExecution │       │ skillHandlers.ts                    │
│     hook          │       │ ┌─────────────────────────────────┐ │
│                   │──────▶│ │ skill:execute handler           │ │
│                   │       │ │   ↓                             │ │
│                   │       │ │ SkillService.executeSkill()     │ │
│                   │       │ │   ↓                             │ │
│                   │       │ │ [STUB: 常に成功を返す]          │ │
│                   │       │ └─────────────────────────────────┘ │
│                   │◀──────│                                     │
│                   │       │ SkillExecutor (未使用)              │
└─────────────────┘        └─────────────────────────────────────┘
```

### 新しいアーキテクチャ（After）

```
Renderer                    Main Process
┌─────────────────┐        ┌─────────────────────────────────────┐
│ useSkillExecution │       │ skillHandlers.ts                    │
│     hook          │       │ ┌─────────────────────────────────┐ │
│                   │──────▶│ │ skill:execute handler           │ │
│                   │       │ │   ↓                             │ │
│                   │       │ │ SkillService.getSkillById()     │ │
│                   │       │ │   ↓                             │ │
│                   │       │ │ SkillExecutor.execute()         │ │
│                   │       │ │   ↓                             │ │
│                   │       │ │ SDK query() + Stream            │ │
│                   │       │ └─────────────────────────────────┘ │
│                   │◀──────│         │                           │
│                   │       │         ↓ (SKILL_STREAM)            │
│ onSkillStream     │◀══════│ mainWindow.webContents.send()       │
└─────────────────┘        └─────────────────────────────────────┘
```

### 設計判断

| 判断項目                          | 選択                   | 理由                                          |
| --------------------------------- | ---------------------- | --------------------------------------------- |
| SkillService.executeSkill()の扱い | 非推奨化 + @deprecated | 既存のテストコードへの影響を最小化            |
| SkillExecutorのインスタンス管理   | モジュールレベル変数   | 既存パターン（\_skillExecutorInstance）を維持 |
| パラメータ変換                    | ハンドラー内で実施     | 責務を明確に分離                              |
| ストリーミング                    | 既存の仕組みを流用     | SKILL_CHANNELS.SKILL_STREAM経由               |

---

## インターフェース設計

### skill:execute ハンドラーの変更

#### 現在の実装

```typescript
// skillHandlers.ts (現在)
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // ...validation...
    const result = await skillService.executeSkill(args.skillId, args.params);
    return { success: true, data: result };
  },
);
```

#### 新しい実装

```typescript
// skillHandlers.ts (変更後)
ipcMain.handle(
  IPC_CHANNELS.SKILL_EXECUTE,
  async (
    event,
    args: { skillId: string; params?: Record<string, unknown> },
  ) => {
    // ...validation...

    // 1. スキルメタデータを取得
    const skill = await skillService.getSkillById(args.skillId);
    if (!skill) {
      return {
        success: false,
        error: "スキルが見つかりません",
        errorCode: "SKILL_NOT_FOUND",
      };
    }

    // 2. SkillExecutionRequest を構築
    const request: SkillExecutionRequest = {
      prompt: extractPromptFromParams(args.params),
      skillId: args.skillId,
      timeout: args.params?.timeout as number | undefined,
    };

    // 3. SkillExecutor.execute() を呼び出し
    if (!_skillExecutorInstance) {
      return {
        success: false,
        error: "SkillExecutor が初期化されていません",
        errorCode: "EXECUTOR_NOT_INITIALIZED",
      };
    }

    const response = await _skillExecutorInstance.execute(request, skill);

    // 4. レスポンスを変換
    return {
      success: response.success,
      data: response.success
        ? { executionId: response.executionId }
        : undefined,
      error: response.error?.message,
      errorCode: response.error?.code,
    };
  },
);
```

### パラメータ変換関数

```typescript
/**
 * IPC引数からプロンプトを抽出する
 *
 * @param params - IPC引数のparams
 * @returns プロンプト文字列
 */
function extractPromptFromParams(params?: Record<string, unknown>): string {
  if (!params) {
    return "";
  }

  // promptフィールドがあればそれを使用
  if (typeof params.prompt === "string") {
    return params.prompt;
  }

  // messageフィールドがあればそれを使用（互換性のため）
  if (typeof params.message === "string") {
    return params.message;
  }

  // その他の場合は空文字
  return "";
}
```

### Skill → SkillMetadata 変換

SkillExecutorはSkillMetadata型を期待するが、SkillService.getSkillById()はSkill型を返す。
両者は互換性があるため、型アサーションで対応可能。

```typescript
// Skill型とSkillMetadata型の互換性確認
// SkillMetadata extends Omit<Skill, 'lastModified'>
// → Skill型からlastModifiedを除けばSkillMetadataとして使用可能

const skillMetadata: SkillMetadata = {
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools,
  // lastModifiedは除外
};
```

---

## 型定義参照

> **参照**: `aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`

### SkillStreamMessageType（5種類）

| 値         | 説明               |
| ---------- | ------------------ |
| `text`     | テキストメッセージ |
| `tool_use` | ツール使用         |
| `error`    | エラーメッセージ   |
| `complete` | 完了通知           |
| `retry`    | リトライ通知       |

### ExecutionState

| 値          | 説明         |
| ----------- | ------------ |
| `pending`   | 実行待ち     |
| `running`   | 実行中       |
| `completed` | 完了         |
| `aborted`   | ユーザー中断 |
| `error`     | エラー発生   |

### RetryConfig

| プロパティ          | 型       | デフォルト値 | 説明                   |
| ------------------- | -------- | ------------ | ---------------------- |
| `maxRetries`        | `number` | `3`          | 最大リトライ回数       |
| `baseDelayMs`       | `number` | `1000`       | 基本待機時間（ミリ秒） |
| `maxDelayMs`        | `number` | `30000`      | 最大待機時間（ミリ秒） |
| `jitterFactor`      | `number` | `0.2`        | Jitter範囲（0〜1）     |
| `backoffMultiplier` | `number` | `2`          | バックオフ倍率         |

### IAuthKeyService インターフェース

| メソッド      | シグネチャ                                           | 説明                                    |
| ------------- | ---------------------------------------------------- | --------------------------------------- |
| `setKey`      | `(apiKey: string) => Promise<void>`                  | キーを暗号化して保存                    |
| `getKey`      | `() => Promise<string \| null>`                      | キーを復号して取得（Main Process のみ） |
| `deleteKey`   | `() => Promise<void>`                                | キーを削除                              |
| `hasKey`      | `() => Promise<boolean>`                             | キー存在確認                            |
| `validateKey` | `(key?: string) => Promise<AuthKeyValidationResult>` | Anthropic API でキーを検証              |

### IPCチャンネル

| チャンネル         | 方向            | 定数                            | 用途                 |
| ------------------ | --------------- | ------------------------------- | -------------------- |
| `skill:execute`    | Renderer → Main | `IPC_CHANNELS.SKILL_EXECUTE`    | 実行開始             |
| `skill:stream`     | Main → Renderer | `SKILL_CHANNELS.SKILL_STREAM`   | メッセージストリーム |
| `skill:abort`      | Renderer → Main | `IPC_CHANNELS.SKILL_ABORT`      | 実行中断             |
| `skill:get-status` | Renderer → Main | `IPC_CHANNELS.SKILL_GET_STATUS` | ステータス照会       |

---

## データフロー設計

### 正常系フロー

```
1. Renderer: useSkillExecution.execute({ skillId, params })
      ↓
2. Preload: safeInvoke('skill:execute', { skillId, params })
      ↓
3. Main: skillHandlers skill:execute handler
      ↓
4. Main: SkillService.getSkillById(skillId) → Skill
      ↓
5. Main: SkillExecutor.execute(request, skillMetadata)
      ↓
6. Main: SDK query() 開始
      ↓
7. Main: for await (message of response.stream())
      ↓ (並行)
8. Main: mainWindow.webContents.send(SKILL_STREAM, message)
      ↓
9. Renderer: onSkillStream コールバックで受信
      ↓
10. Main: 完了メッセージ送信 (type: 'complete')
      ↓
11. Main: return { success: true, data: { executionId } }
      ↓
12. Renderer: 実行完了
```

### エラー系フロー

```
エラー発生ポイントと対応:

A. スキル未発見
   3. → 4. でスキルが見つからない
   → return { success: false, error: 'スキルが見つかりません', errorCode: 'SKILL_NOT_FOUND' }

B. 認証エラー
   6. SDK query() で AUTHENTICATION_ERROR
   → SkillExecutor.handleExecutionError() でエラー変換
   → SKILL_STREAM で error メッセージ送信
   → return { success: false, error: '...', errorCode: 'AUTHENTICATION_ERROR' }

C. SDK実行エラー
   7. stream 処理中にエラー
   → SkillExecutor.handleExecutionError() でエラー変換
   → SKILL_STREAM で error メッセージ送信
   → return { success: false, error: '...', errorCode: 'EXECUTION_FAILED' }

D. 中断
   Renderer から skill:abort 呼び出し
   → SkillExecutor.abort(executionId)
   → AbortController.abort()
   → stream ループ終了
   → SKILL_STREAM で error メッセージ送信 (type: 'error', content: 'Execution aborted')
```

---

## エラーハンドリング設計

> **参照**: `aiworkflow-requirements/references/error-handling.md`

### エラーカテゴリとコード範囲

| カテゴリ               | コード範囲 | 本タスクでの適用                           | リトライ |
| ---------------------- | ---------- | ------------------------------------------ | -------- |
| Validation Error       | 1000-1999  | skillId未指定、スキル未インポート          | 不可     |
| Business Error         | 2000-2999  | スキル未存在、SkillExecutor未初期化        | 不可     |
| External Service Error | 3000-3999  | SDK認証エラー、SDK実行エラー、タイムアウト | **可能** |
| Infrastructure Error   | 4000-4999  | -                                          | **可能** |
| Internal Error         | 5000-5999  | 予期せぬエラー                             | 不可     |

### エラーコードマッピング

> **注意**: SkillExecutionErrorCodeは公式仕様（interfaces-agent-sdk-executor.md）で定義された5種類のみ。
> IPCレスポンスでは独自コードも使用可能だが、SkillExecutor内部では公式コードのみ使用する。

#### 公式エラーコード（SkillExecutionErrorCode）

| SkillExecutionErrorCode | IPCレスポンスerrorCode  | カテゴリ                | ユーザー向けメッセージ                              |
| ----------------------- | ----------------------- | ----------------------- | --------------------------------------------------- |
| AUTHENTICATION_ERROR    | AUTHENTICATION_ERROR    | External Service (3xxx) | APIキーが設定されていません。設定で確認してください |
| EXECUTION_FAILED        | EXECUTION_FAILED        | External Service (3xxx) | スキル実行に失敗しました                            |
| TIMEOUT                 | TIMEOUT                 | External Service (3xxx) | スキル実行がタイムアウトしました                    |
| ABORTED                 | ABORTED                 | Business (2xxx)         | スキル実行が中断されました                          |
| MAX_CONCURRENT_EXCEEDED | MAX_CONCURRENT_EXCEEDED | Business (2xxx)         | 同時実行数の上限に達しました                        |

#### IPCハンドラー独自エラー（SkillExecutor呼び出し前）

| エラー状況             | IPCレスポンスerrorCode   | カテゴリ          | ユーザー向けメッセージ              |
| ---------------------- | ------------------------ | ----------------- | ----------------------------------- |
| スキル未発見           | SKILL_NOT_FOUND          | Business (2xxx)   | スキルが見つかりません              |
| SkillExecutor未初期化  | EXECUTOR_NOT_INITIALIZED | Internal (5xxx)   | SkillExecutorが初期化されていません |
| 引数バリデーション失敗 | VALIDATION_FAILED        | Validation (1xxx) | 入力値が不正です                    |

### ログサニタイズ要件

| 項目                 | 方針                                               |
| -------------------- | -------------------------------------------------- |
| APIキー              | ログ出力禁止（`[REDACTED]` に置換）                |
| ユーザー入力(prompt) | 最初の50文字のみログ出力                           |
| スタック情報         | 本番環境ではユーザー向けエラーに含めない           |
| エラーメッセージ     | 内部詳細を含めない（サニタイズ後に Renderer 送信） |

### レスポンス形式

```typescript
// 成功時
{
  success: true,
  data: {
    executionId: string;
  }
}

// 失敗時
{
  success: false,
  error: string;      // ユーザー向けメッセージ
  errorCode?: string; // エラーコード（デバッグ用）
}
```

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント   | 契約定義                                            |
| -------------- | --------------------------------------------------- |
| Renderer → IPC | skill:execute({ skillId: string, params?: object }) |
| IPC → Executor | SkillExecutionRequest, SkillMetadata                |
| Executor → SDK | SDK query() API, AbortSignal                        |
| SDK → Renderer | SKILL_STREAM (SkillStreamMessage)                   |

---

## アーキテクチャ層別設計

| 層                         | 設計観点                                                   | 仕様参照先                                |
| -------------------------- | ---------------------------------------------------------- | ----------------------------------------- |
| フロントエンド（Renderer） | 変更なし（既存のuseSkillExecutionを維持）                  | -                                         |
| バックエンド（Main）       | skill:executeハンドラーの修正、extractPromptFromParams追加 | `architecture-implementation-patterns.md` |
| IPC通信                    | レスポンス形式維持（success/data/error）                   | `aiworkflow-requirements: api-*.md`       |
| Preload                    | 変更なし                                                   | -                                         |
| データ                     | Skill → SkillMetadata 変換                                 | -                                         |

---

## 実装ファイル一覧

| ファイル                                                            | 変更内容                              | 優先度 |
| ------------------------------------------------------------------- | ------------------------------------- | ------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                        | skill:executeハンドラー修正           | P0     |
| `apps/desktop/src/main/services/skill/SkillService.ts`              | executeSkillに@deprecatedコメント追加 | P1     |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts` | テスト修正                            | P0     |

### 新規追加関数

| 関数名                  | 配置先           | 説明                       |
| ----------------------- | ---------------- | -------------------------- |
| extractPromptFromParams | skillHandlers.ts | paramsからpromptを抽出     |
| convertToSkillMetadata  | skillHandlers.ts | Skill → SkillMetadata 変換 |

---

## 成果物

| 成果物         | パス                                                                  | 説明           |
| -------------- | --------------------------------------------------------------------- | -------------- |
| アーキテクチャ | `docs/30-workflows/skill-execute-delegation/phases/phase-2-design.md` | 本ドキュメント |

---

## 完了条件

- [x] アーキテクチャが定義されている
- [x] インターフェース設計が完了している
- [x] データフロー設計が完了している
- [x] エラーハンドリング設計が完了している
- [x] 要件との整合性が確認されている
- [x] 統合ポイント/契約が設計に反映されている
- [x] アーキテクチャ層別の設計が完了している
- [x] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
