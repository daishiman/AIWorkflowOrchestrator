# 実装ガイド: SkillService.executeSkill() の SkillExecutor 委譲

## メタ情報

| 項目     | 値                                       |
| -------- | ---------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION    |
| Phase    | 12                                       |
| 作成日   | 2026-02-11                               |
| 対象読者 | Part 1: 初学者・非技術者、Part 2: 開発者 |

---

# Part 1: 概念的な説明（中学生でもわかる版）

## この仕組みは何をするの？

### 郵便局と配達員の例えで説明します

あなたが手紙を送りたいとき、どうしますか？

1. **郵便局の窓口（SkillService）** に手紙を持っていく
2. 窓口の人が **配達員（SkillExecutor）** に手紙を渡す
3. 配達員が実際に **届け先（Claude SDK）** まで届けてくれる

今回の変更は、「窓口の人が配達員に渡す」という部分を作ったものです。

```
あなた → 郵便局窓口 → 配達員 → 届け先
           ↓           ↓
      SkillService  SkillExecutor
```

### なぜこの仕組みが必要なの？

以前は、窓口の人（SkillService）が「後で対応します」と言って、実際には何もしていませんでした（スタブ）。

でも、お客さん（アプリのユーザー）は本当に手紙を届けてほしいですよね？

そこで、窓口の人が配達員に渡すようにしました。配達員は実際に届け先まで行って、手紙を届けてくれます。

### スキル実行の流れを「レストランでの注文」で説明

1. **注文する（Renderer）**
   - お客さんがメニューを選んで注文します
   - 「このスキルを実行して！」とボタンを押す

2. **注文を受け付ける（SkillService）**
   - ウェイター（SkillService）が注文を聞きます
   - 「はい、かしこまりました」

3. **シェフに渡す（SkillExecutor）**
   - ウェイターがシェフ（SkillExecutor）に注文票を渡します
   - シェフは料理（AIの処理）を作り始めます

4. **料理中の報告（ストリーミング）**
   - シェフが「今、野菜を切っています」「今、焼いています」と報告します
   - 電話で進捗報告を受けるようなイメージです

5. **料理完成（完了）**
   - シェフから「できました！」と連絡が来ます
   - お客さんのテーブルに料理が届きます

### 途中でキャンセル（中断機能）

レストランで「やっぱりキャンセルしたい」と言えるように、スキル実行も途中で止められます。

- 中断ボタンを押すと...
- シェフに「作るのやめて！」と連絡が行きます
- シェフは作業をやめて、キッチンを片付けます

### エラーが起きたとき

もし問題が起きたら（例：材料がない = APIキーがない）、シェフからエラー報告が来ます。

「すみません、今日はその料理は作れません。材料（APIキー）がないんです。」

このエラーはちゃんとお客さんに伝えられます。

---

## 図解: データの流れ

```
+----------+      +---------------+      +----------------+      +------------+
|          |      |               |      |                |      |            |
| Renderer | ---> | SkillService  | ---> | SkillExecutor  | ---> | Claude SDK |
|  (画面)  |      |   (受付)      |      |   (実行者)     |      |   (AI)     |
|          | <--- |               | <--- |                | <--- |            |
+----------+      +---------------+      +----------------+      +------------+
     ↑                                         |
     |                                         |
     +-----------------------------------------+
              ストリーミングメッセージ
              （リアルタイム報告）
```

---

# Part 2: 技術的な詳細（開発者向け）

## アーキテクチャ概要

### レイヤー構成

```
Renderer Process
    ↓ IPC (skill:execute)
Main Process
    ├── skillHandlers.ts      ← IPCハンドラー
    │       ↓
    ├── SkillService.ts       ← Facadeサービス
    │       ↓ (委譲)
    └── SkillExecutor.ts      ← 実行エンジン
            ↓
        Claude Agent SDK
```

### 依存関係の注入（DI）パターン

SkillExecutorはSkillServiceに対してDIで注入されます：

```typescript
// skillHandlers.ts での注入
export function registerSkillHandlers(
  mainWindow: BrowserWindow,
  skillService: SkillService,
): void {
  // SkillExecutor インスタンスを作成
  const skillExecutor = new SkillExecutor(mainWindow);

  // SkillService に注入
  skillService.setSkillExecutor(skillExecutor);
}
```

---

## 型定義

### SkillExecutionRequest

```typescript
interface SkillExecutionRequest {
  /** 実行するプロンプト */
  prompt: string;
  /** スキルID */
  skillId: string;
  /** タイムアウト（ミリ秒） */
  timeout?: number;
  /** セッションID（オプション） */
  sessionId?: string;
  /** リトライ設定（部分指定可能） */
  retryConfig?: Partial<RetryConfig>;
}
```

### SkillExecutionResponse

```typescript
interface SkillExecutionResponse {
  /** 実行ID（一意識別子） */
  executionId: string;
  /** 成功/失敗 */
  success: boolean;
  /** エラー情報（失敗時） */
  error?: {
    code: SkillExecutionErrorCode;
    message: string;
    details?: unknown;
  };
}
```

### SkillExecutionErrorCode

```typescript
type SkillExecutionErrorCode =
  | "MAX_CONCURRENT_EXCEEDED" // 同時実行数上限超過
  | "ABORTED" // ユーザーによる中断
  | "TIMEOUT" // タイムアウト
  | "EXECUTION_FAILED" // 実行エラー
  | "AUTHENTICATION_ERROR" // 認証エラー（APIキー未設定等）
  | "SKILL_NOT_FOUND" // スキル未発見
  | "VALIDATION_FAILED" // 入力検証エラー
  | "SDK_ERROR" // SDKエラー
  | "NETWORK_ERROR"; // ネットワークエラー
```

### SkillMetadata

```typescript
interface SkillMetadata extends Omit<Skill, "lastModified"> {
  id: string;
  name: string;
  slug: string;
  description: string;
  path: string;
  triggers: string[];
  anchors: SkillAnchor[];
  allowedTools?: string[];
  category?: string;
}
```

---

## SkillExecutor.execute() の使用方法

### 基本的な使用例

```typescript
import { SkillExecutor } from "../services/skill/SkillExecutor";

// 1. SkillExecutor のインスタンス作成
const executor = new SkillExecutor(mainWindow);

// 2. 実行リクエストの構築
const request: SkillExecutionRequest = {
  prompt: "ファイルの内容を読み取ってください",
  skillId: "file-reader-skill",
  timeout: 30000, // 30秒
};

// 3. スキルメタデータの準備
const skill: SkillMetadata = {
  id: "file-reader-skill",
  name: "File Reader",
  slug: "file-reader",
  description: "ファイルを読み取るスキル",
  path: "/path/to/skill",
  triggers: ["read", "file"],
  anchors: [],
  allowedTools: ["Read", "Glob"],
};

// 4. 実行
const response = await executor.execute(request, skill);

if (response.success) {
  console.log("実行ID:", response.executionId);
} else {
  console.error("エラー:", response.error?.message);
}
```

### ストリーミングメッセージの受信（Renderer側）

```typescript
// preload/index.ts で公開されたAPI経由
window.electronAPI.skill.onStream((message) => {
  switch (message.type) {
    case "text":
      // テキストメッセージを表示
      appendToOutput(message.content);
      break;
    case "tool_use":
      // ツール使用通知
      showToolUsage(JSON.parse(message.content));
      break;
    case "error":
      // エラー表示
      showError(message.content);
      break;
    case "complete":
      // 完了処理
      onComplete();
      break;
    case "retry":
      // リトライ通知
      showRetryInfo(JSON.parse(message.content));
      break;
  }
});
```

### 実行の中断

```typescript
// 中断リクエスト
const aborted = await window.electronAPI.skill.abort(executionId);

if (aborted) {
  console.log("実行を中断しました");
}
```

### 実行状態の取得

```typescript
const status = await window.electronAPI.skill.getStatus(executionId);

if (status) {
  console.log("状態:", status.state); // 'running', 'completed', 'aborted', 'error'
  console.log("開始時刻:", new Date(status.startedAt));
}
```

---

## エラーハンドリングパターン

### エラーの種類と対処

```typescript
try {
  const response = await executor.execute(request, skill);

  if (!response.success) {
    switch (response.error?.code) {
      case "AUTHENTICATION_ERROR":
        // APIキー設定画面に誘導
        showApiKeySettings();
        break;
      case "MAX_CONCURRENT_EXCEEDED":
        // 同時実行数制限のメッセージ表示
        showConcurrencyLimit();
        break;
      case "TIMEOUT":
        // タイムアウト設定の見直しを促す
        suggestTimeoutIncrease();
        break;
      case "ABORTED":
        // ユーザーによる中断（正常ケース）
        // 特別な処理は不要
        break;
      default:
        // 一般的なエラー表示
        showGenericError(response.error?.message);
    }
  }
} catch (error) {
  // 予期しないエラー
  console.error("Unexpected error:", error);
}
```

### リトライ設定のカスタマイズ

```typescript
const request: SkillExecutionRequest = {
  prompt: "重要な処理",
  skillId: "important-skill",
  retryConfig: {
    maxRetries: 5, // 最大5回リトライ
    baseDelayMs: 2000, // 基本待機2秒
    maxDelayMs: 60000, // 最大待機1分
    backoffMultiplier: 2, // 指数バックオフ係数
    jitterFactor: 0.3, // ジッター30%
  },
};
```

---

## AbortController の使用

### 実装パターン

```typescript
// SkillExecutor内部での実装
async execute(request, skill): Promise<SkillExecutionResponse> {
  const abortController = new AbortController();

  // ExecutionContext に登録
  const context: ExecutionContext = {
    id: executionId,
    skillId: skill.id,
    abortController,
    state: 'running',
    startedAt: Date.now(),
  };
  this.activeExecutions.set(executionId, context);

  try {
    // SDKにAbortSignalを渡す
    const response = await this.callSDKQuery(prompt, {
      signal: abortController.signal,
    });

    // ストリーミング処理
    for await (const message of response.stream()) {
      // 中断チェック
      if (abortController.signal.aborted) {
        break;
      }
      await this.handleStreamMessage(executionId, message);
    }
  } finally {
    // クリーンアップ
    this.cleanup(executionId);
  }
}

// 中断メソッド
abort(executionId: string): boolean {
  const context = this.activeExecutions.get(executionId);
  if (!context) return false;

  context.abortController.abort();
  this.updateExecutionState(executionId, 'aborted');
  return true;
}
```

---

## IPCチャンネル一覧

| チャンネル名       | 方向          | 説明                     |
| ------------------ | ------------- | ------------------------ |
| `skill:execute`    | Renderer→Main | スキル実行リクエスト     |
| `skill:abort`      | Renderer→Main | 実行中断リクエスト       |
| `skill:get-status` | Renderer→Main | 実行状態取得             |
| `skill:stream`     | Main→Renderer | ストリーミングメッセージ |

### チャンネル定数の使用

```typescript
import { IPC_CHANNELS, SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";

// ハンドラー登録
ipcMain.handle(IPC_CHANNELS.SKILL_EXECUTE, async (event, args) => {
  // ...
});

// ストリーム送信
mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
```

---

## テスト例

### ユニットテスト

```typescript
describe("SkillService.executeSkill", () => {
  it("should delegate to SkillExecutor", async () => {
    // Given
    const executor = new SkillExecutor(mockMainWindow);
    const executeSpy = vi.spyOn(executor, "execute").mockResolvedValue({
      executionId: "test-id",
      success: true,
    });
    skillService.setSkillExecutor(executor);

    // When
    await skillService.executeSkill("skill-id", { prompt: "test" });

    // Then
    expect(executeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ skillId: "skill-id" }),
      expect.objectContaining({ id: "skill-id" }),
    );
  });
});
```

### 統合テスト

```typescript
describe("skill:execute integration", () => {
  it("should execute skill via IPC", async () => {
    // Given
    const handler = handlers.get("skill:execute");

    // When
    const result = await handler(
      { sender: mockMainWindow.webContents },
      { skillId: "test-skill", params: { prompt: "test" } },
    );

    // Then
    expect(result.success).toBe(true);
    expect(result.data.executionId).toBeDefined();
  });
});
```

---

## 関連ドキュメント

| ドキュメント       | パス                                                    |
| ------------------ | ------------------------------------------------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md`            |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`                |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`                |
| SkillExecutor実装  | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| SkillService実装   | `apps/desktop/src/main/services/skill/SkillService.ts`  |
| IPCハンドラー      | `apps/desktop/src/main/ipc/skillHandlers.ts`            |
| テストファイル     | `apps/desktop/src/main/services/skill/__tests__/`       |

---

## 変更履歴

| 日付       | 変更内容 | 担当者          |
| ---------- | -------- | --------------- |
| 2026-02-11 | 初版作成 | Claude Opus 4.5 |
