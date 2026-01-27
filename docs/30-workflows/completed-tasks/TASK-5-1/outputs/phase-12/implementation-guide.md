# SkillAPI 実装ガイド

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 12                       |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

# Part 1: 概念的説明（中学生でもわかる版）

## SkillAPI とは何か？

「SkillAPI」は、デスクトップアプリの「窓口係」のようなものです。

### 日常での例え話

レストランで注文するとき、あなた（お客さん）はウェイター（窓口係）に注文を伝えます。ウェイターはその注文を厨房（料理を作るところ）に伝えます。料理ができたら、ウェイターがあなたのテーブルに運んできます。

アプリでも同じことが起きています：

| 役割     | レストランの例え | アプリの場合                 |
| -------- | ---------------- | ---------------------------- |
| お客さん | あなた           | アプリの画面（Renderer）     |
| 窓口係   | ウェイター       | SkillAPI（Preload）          |
| 厨房     | 料理人           | アプリの本体（Main Process） |

### なぜ窓口係が必要なの？

**セキュリティのためです。**

厨房に誰でも入れたら危険ですよね。包丁や火を使っているし、衛生的にも問題があります。同じように、アプリの本体にも誰でもアクセスできたら危険です。

だから「窓口係」を通して、許可された操作だけができるようにしています。窓口係は「注文リスト」（ホワイトリスト）を持っていて、そこにない注文は受け付けません。

### 何ができるの？

| 機能               | 日常での例え                             | 説明                                 |
| ------------------ | ---------------------------------------- | ------------------------------------ |
| スキル実行         | 料理を注文する                           | AIにタスクをお願いする               |
| 実行中断           | 料理の注文をキャンセルする               | 実行中のタスクを止める               |
| ストリーム受信     | 「今焼いてます」と進捗を聞く             | タスクの進み具合をリアルタイムで見る |
| 実行状態取得       | 「私の注文どうなってますか？」と確認する | タスクの状態を確認する               |
| 権限確認リクエスト | 「辛くしていいですか？」と聞かれる       | 許可が必要な操作の確認を受ける       |
| 権限応答           | 「はい、大丈夫です」と答える             | 確認に対して返事をする               |

### データの流れ

```
[あなた] --注文--> [ウェイター] --注文--> [厨房]
   ↑                   |                    |
   |                   |                    |
   +---料理できました---+<----料理完成------+
```

これをアプリで表すと：

```
[画面] --リクエスト--> [SkillAPI] --IPC--> [Main Process]
  ↑                        |                    |
  |                        |                    |
  +-----レスポンス---------+<----処理結果------+
```

---

# Part 2: 技術的詳細（開発者向け）

## 1. インターフェース定義

```typescript
/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 */
export interface SkillAPI {
  /**
   * スキルを実行する
   * @param request - 実行リクエスト
   * @returns 実行レスポンス（executionId を含む）
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   * @param callback - メッセージ受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   * @param executionId - 中断対象の実行ID
   * @returns 中断成功の場合 true
   */
  abort: (executionId: string) => Promise<boolean>;

  /**
   * 実行状態を取得する
   * @param executionId - 実行ID
   * @returns 実行情報（見つからない場合 null）
   */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  /**
   * 権限確認リクエストを購読する
   * @param callback - リクエスト受信時のコールバック関数
   * @returns クリーンアップ関数（購読解除用）
   */
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;

  /**
   * 権限確認応答を送信する
   * @param response - 権限確認応答
   * @returns 送信結果
   */
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

## 2. IPCチャネルマッピング

| APIメソッド              | IPCチャネル                 | 方向 | ホワイトリスト          |
| ------------------------ | --------------------------- | ---- | ----------------------- |
| `execute`                | `skill:execute`             | R→M  | ALLOWED_INVOKE_CHANNELS |
| `abort`                  | `skill:abort`               | R→M  | ALLOWED_INVOKE_CHANNELS |
| `getExecutionStatus`     | `skill:get-status`          | R→M  | ALLOWED_INVOKE_CHANNELS |
| `onStream`               | `skill:stream`              | M→R  | ALLOWED_ON_CHANNELS     |
| `onPermissionRequest`    | `skill:permission:request`  | M→R  | ALLOWED_ON_CHANNELS     |
| `sendPermissionResponse` | `skill:permission:response` | R→M  | ALLOWED_INVOKE_CHANNELS |

## 3. 実装パターン

### 3.1 safeInvoke パターン（Renderer → Main）

```typescript
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 3.2 safeOn パターン（Main → Renderer）

```typescript
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}
```

## 4. 使用例

### 4.1 基本的なスキル実行

```typescript
// スキル実行
const response = await window.skillAPI.execute({
  skillName: "my-skill",
  args: { input: "test" },
});
console.log("Execution ID:", response.executionId);
```

### 4.2 ストリーミング受信

```typescript
// React コンポーネントでの使用例
useEffect(() => {
  const cleanup = window.skillAPI.onStream((message) => {
    console.log("Stream content:", message.content);
    // UI更新処理
  });

  // コンポーネントアンマウント時にクリーンアップ
  return cleanup;
}, []);
```

### 4.3 実行中断

```typescript
// 実行中断
const success = await window.skillAPI.abort(executionId);
if (success) {
  console.log("Execution aborted successfully");
}
```

### 4.4 権限確認フロー

```typescript
// 権限リクエスト購読
const cleanup = window.skillAPI.onPermissionRequest(async (request) => {
  console.log("Permission required:", request.reason);

  // ユーザーに確認（UIダイアログなど）
  const userApproved = await showPermissionDialog(request);

  // 応答送信
  await window.skillAPI.sendPermissionResponse({
    requestId: request.requestId,
    allowed: userApproved,
  });
});
```

## 5. エラーハンドリング

| エラーケース             | エラー内容                             | 対処法                        |
| ------------------------ | -------------------------------------- | ----------------------------- |
| 許可されていないチャネル | `Channel ${channel} is not allowed`    | 許可チャネルを確認            |
| 実行IDが存在しない       | `abort`/`getExecutionStatus`がnull返却 | 実行中かどうか事前確認        |
| IPC通信エラー            | Promise.reject                         | try-catchでエラーハンドリング |
| タイムアウト             | IPC invoke timeout                     | リトライまたはエラー表示      |

```typescript
// エラーハンドリング例
try {
  const result = await window.skillAPI.execute(request);
} catch (error) {
  if (error.message.includes("is not allowed")) {
    console.error("Channel not allowed");
  } else if (error.message.includes("timeout")) {
    console.error("Request timed out");
  } else {
    console.error("Unexpected error:", error);
  }
}
```

## 6. セキュリティ考慮事項

### 6.1 ホワイトリスト制御

```typescript
// channels.ts より
export const ALLOWED_INVOKE_CHANNELS = [
  IPC_CHANNELS.SKILL_EXECUTE,
  IPC_CHANNELS.SKILL_ABORT,
  IPC_CHANNELS.SKILL_GET_STATUS,
  IPC_CHANNELS.SKILL_PERMISSION_RESPONSE,
  // ... 他の許可チャネル
];

export const ALLOWED_ON_CHANNELS = [
  IPC_CHANNELS.SKILL_STREAM,
  IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
  // ... 他の許可チャネル
];
```

### 6.2 contextIsolation 対応

```typescript
// index.ts より
if (process.contextIsolated) {
  contextBridge.exposeInMainWorld("skillAPI", skillAPI);
} else {
  (window as unknown as { skillAPI: SkillAPI }).skillAPI = skillAPI;
}
```

### 6.3 型安全性

- 全てのAPIメソッドに TypeScript 型定義
- `@repo/shared/types/skill-execution` から共有型をインポート
- コンパイル時に型チェックが実行される

## 7. ファイル構成

```
apps/desktop/src/preload/
├── skill-api.ts      # SkillAPI 実装（144行）
├── channels.ts       # IPC チャネル定義・ホワイトリスト
├── index.ts          # contextBridge 公開
└── __tests__/
    ├── skill-api.test.ts            # 基本テスト（37テスト）
    └── skill-api.permission.test.ts # 権限テスト（30テスト）
```

## 8. 関連ドキュメント

| ドキュメント  | 場所                                    | 内容                    |
| ------------- | --------------------------------------- | ----------------------- |
| 型定義        | `packages/shared/types/skill-execution` | 共有型定義              |
| IPCハンドラー | `apps/desktop/src/main/handlers/`       | Main Process ハンドラー |
| テスト仕様    | `outputs/phase-4/`                      | テストケース定義        |

---

## 完了条件確認

| 条件                                 | 状態    |
| ------------------------------------ | ------- |
| Part 1: 概念的説明が作成されている   | ✅ 完了 |
| Part 2: 技術的詳細が作成されている   | ✅ 完了 |
| 使用例が記載されている               | ✅ 完了 |
| エラーハンドリングが記載されている   | ✅ 完了 |
| セキュリティ考慮事項が記載されている | ✅ 完了 |
