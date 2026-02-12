# 実装ガイド: SkillCreatorService IPCハンドラー登録 (TASK-9B-H)

## メタ情報

| 項目      | 値                          |
| --------- | --------------------------- |
| タスクID  | TASK-9B-H-SKILL-CREATOR-IPC |
| 作成日    | 2026-02-12                  |
| 対象Phase | Phase 12                    |

---

# Part 1: 概念説明（中学生でもわかる版）

## 1. IPCは「学校の連絡帳」

学校にいる**先生（Main Process）**と、教室にいる**生徒（Renderer）**は、直接話すことができません。先生は職員室にいて、生徒は教室にいるからです。

そこで、2人の間に「**連絡帳（IPC: Inter-Process Communication）**」を使います。

生徒が先生にお願いしたいことがあるときは、連絡帳に書いて提出します。先生はその連絡帳を読んで、返事を書いて返します。

なぜ直接話せないのか。これは**安全のため**です。もし誰でも職員室に入れたら、知らない人が勝手に先生にお願いごとをできてしまいます。連絡帳を通すことで、「本当にこのクラスの生徒か？」を確認できます。

実際のアプリに置き換えると:

- **先生（Main Process）** = パソコンのファイルやシステムを操作できる特別なプログラム
- **生徒（Renderer）** = 画面に表示されるUI（ボタンやテキスト）を動かすプログラム
- **連絡帳（Preload/IPC）** = 2つのプログラムの間で安全にやり取りするための仕組み

## 2. 今回やったこと：「新しい連絡事項の種類を追加した」

これまでも連絡帳にはいろいろな「連絡事項」がありました（ファイルを読む、設定を変える、AIに質問する、など）。

今回、「**スキルを作る機能（SkillCreator）**」のために、6つの新しい連絡事項を追加しました。

| 連絡事項（チャンネル）          | 日常の例え                                       |
| ------------------------------- | ------------------------------------------------ |
| `skill-creator:detect-mode`     | 「今日の授業は何？」と先生に聞く                 |
| `skill-creator:create`          | 「新しいノートを作って」と先生にお願いする       |
| `skill-creator:execute-tasks`   | 「宿題をやって」と先生にお願いする               |
| `skill-creator:validate`        | 「テストの答え合わせをして」と先生にお願いする   |
| `skill-creator:validate-schema` | 「ノートの書き方が合っているか確認して」とお願い |
| `skill-creator:progress`        | 先生から「ここまで終わったよ」と途中経過が届く   |

上の5つは「**生徒から先生への連絡**」です。最後の1つは「**先生から生徒への報告**」です。長い作業（スキル作成など）のときに、先生が「30%終わったよ」「50%終わったよ」と途中経過を教えてくれます。

## 3. ホワイトリストは「許可された連絡事項リスト」

学校では、連絡帳に書ける内容が決まっています。「宿題の提出」や「体調不良の連絡」は書けますが、「お菓子を買ってきて」は受け付けてもらえません。

これが「**ホワイトリスト**」です。事前に許可されたお願いだけが通ります。許可されていないお願いは、安全のために自動的に拒否されます。

今回追加した6つの連絡事項は、全てホワイトリストに登録しました。

- 5つは「生徒→先生」用のリスト（ALLOWED_INVOKE_CHANNELS）に登録
- 1つは「先生→生徒」用のリスト（ALLOWED_ON_CHANNELS）に登録

## 4. 安全を守る3つの仕組み

連絡帳を安全に使うために、3つのチェックがあります。

1. **ホワイトリスト**: 許可された連絡事項だけを受け付ける
2. **身元確認（sender検証）**: 連絡帳を出した人が本当にこのクラスの生徒か確認する
3. **内容チェック（引数バリデーション）**: 書かれた内容が正しい形式か確認する（例: 名前の欄に数字が書かれていたら拒否する）

この3つのチェックを通過しないと、先生は仕事をしてくれません。

---

# Part 2: 技術詳細（開発者向け）

## 1. SkillCreatorAPI インターフェース定義

ファイル: `apps/desktop/src/preload/skill-creator-api.ts`

```typescript
/**
 * IPC結果型
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 進捗通知データ型
 */
export interface SkillCreatorProgress {
  phase: string;
  percentage: number;
  message: string;
}

/**
 * SkillCreatorAPI - スキル作成関連のPreload APIインターフェース
 */
export interface SkillCreatorAPI {
  /** リクエストからモードを判定する */
  detectMode: (request: string) => Promise<IpcResult<SkillCreatorMode>>;

  /** スキルを作成する */
  createSkill: (options: CreateSkillOptions) => Promise<IpcResult<string>>;

  /** タスクを実行する */
  executeTasks: (
    options: ExecuteTasksOptions,
  ) => Promise<IpcResult<ExecutionReport>>;

  /** スキルを検証する */
  validateSkill: (skillDir: string) => Promise<IpcResult<boolean>>;

  /** データをスキーマで検証する */
  validateSchema: (
    schemaName: string,
    data: unknown,
  ) => Promise<IpcResult<boolean>>;

  /** 進捗通知を受信するコールバックを登録する（クリーンアップ関数を返す） */
  onProgress: (
    callback: (progress: SkillCreatorProgress) => void,
  ) => () => void;
}
```

## 2. チャンネル定数定義

ファイル: `apps/desktop/src/preload/channels.ts`

```typescript
// Skill Creator operations (TASK-9B-H)
SKILL_CREATOR_DETECT_MODE: "skill-creator:detect-mode",
SKILL_CREATOR_CREATE: "skill-creator:create",
SKILL_CREATOR_EXECUTE_TASKS: "skill-creator:execute-tasks",
SKILL_CREATOR_VALIDATE: "skill-creator:validate",
SKILL_CREATOR_VALIDATE_SCHEMA: "skill-creator:validate-schema",
SKILL_CREATOR_PROGRESS: "skill-creator:progress",
```

ホワイトリスト登録:

- **ALLOWED_INVOKE_CHANNELS**: 5チャンネル（detect-mode, create, execute-tasks, validate, validate-schema）
- **ALLOWED_ON_CHANNELS**: 1チャンネル（progress）

## 3. 各チャンネルのシグネチャと使用例

### 3.1 detect-mode

```typescript
// Renderer側
const result =
  await window.electronAPI.skillCreator.detectMode("新しいスキルを作りたい");
if (result.success) {
  console.log("検出モード:", result.data); // SkillCreatorMode
}
```

| 項目       | 値                            |
| ---------- | ----------------------------- |
| チャンネル | `skill-creator:detect-mode`   |
| 方向       | Renderer -> Main (invoke)     |
| 引数       | `{ request: string }`         |
| 戻り値     | `IpcResult<SkillCreatorMode>` |

### 3.2 create

```typescript
const result = await window.electronAPI.skillCreator.createSkill({
  name: "my-skill",
  description: "スキルの説明",
  mode: "create",
});
if (result.success) {
  console.log("作成先:", result.data); // ディレクトリパス
}
```

| 項目       | 値                        |
| ---------- | ------------------------- |
| チャンネル | `skill-creator:create`    |
| 方向       | Renderer -> Main (invoke) |
| 引数       | `CreateSkillOptions`      |
| 戻り値     | `IpcResult<string>`       |

### 3.3 execute-tasks

```typescript
const result = await window.electronAPI.skillCreator.executeTasks({
  tasksDir: "/path/to/tasks",
});
if (result.success) {
  console.log("実行レポート:", result.data); // ExecutionReport
}
```

| 項目       | 値                            |
| ---------- | ----------------------------- |
| チャンネル | `skill-creator:execute-tasks` |
| 方向       | Renderer -> Main (invoke)     |
| 引数       | `ExecuteTasksOptions`         |
| 戻り値     | `IpcResult<ExecutionReport>`  |

### 3.4 validate

```typescript
const result =
  await window.electronAPI.skillCreator.validateSkill("/path/to/skill");
if (result.success) {
  console.log("検証結果:", result.data); // boolean
}
```

| 項目       | 値                        |
| ---------- | ------------------------- |
| チャンネル | `skill-creator:validate`  |
| 方向       | Renderer -> Main (invoke) |
| 引数       | `{ skillDir: string }`    |
| 戻り値     | `IpcResult<boolean>`      |

### 3.5 validate-schema

```typescript
const result = await window.electronAPI.skillCreator.validateSchema(
  "skill-config",
  data,
);
if (result.success) {
  console.log("スキーマ検証結果:", result.data); // boolean
}
```

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| チャンネル | `skill-creator:validate-schema`         |
| 方向       | Renderer -> Main (invoke)               |
| 引数       | `{ schemaName: string, data: unknown }` |
| 戻り値     | `IpcResult<boolean>`                    |

### 3.6 progress（Main -> Renderer）

```typescript
// Renderer側: 進捗通知リスナー登録
const cleanup = window.electronAPI.skillCreator.onProgress((progress) => {
  console.log(
    `${progress.phase}: ${progress.percentage}% - ${progress.message}`,
  );
});

// クリーンアップ（コンポーネントアンマウント時）
cleanup();
```

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| チャンネル | `skill-creator:progress`                                 |
| 方向       | Main -> Renderer (on)                                    |
| データ     | `{ phase: string, percentage: number, message: string }` |
| 戻り値     | `() => void`（クリーンアップ関数）                       |

Main側からの送信:

```typescript
// Main側: 進捗通知を送信
sendSkillCreatorProgress(mainWindow, {
  phase: "creating",
  percentage: 50,
  message: "スキルファイルを生成中...",
});
```

## 4. エラーハンドリングパターン

### 4.1 IpcResult型によるResult パターン

全チャンネルは `IpcResult<T>` 型で結果を返す。例外をthrowせず、成功/失敗を明示的に表現する。

```typescript
// 成功時
{ success: true, data: result }

// 失敗時（バリデーションエラー）
{ success: false, error: "リクエスト文字列が指定されていません" }

// 失敗時（サービスエラー）
{ success: false, error: "モード判定に失敗しました" }
```

### 4.2 エラーサニタイズ

サービス層から発生したエラーは、スタックトレースや内部パスを除外してRendererに返す。

```typescript
catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "デフォルトエラーメッセージ",
  };
}
```

### 4.3 sender検証失敗

`validateIpcSender` による検証に失敗した場合は `toIPCValidationError` でエラーをthrowする。これはバリデーションエラーやサービスエラーとは別経路で処理される。

```typescript
const validation = validateIpcSender(
  event,
  IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE,
  {
    getAllowedWindows: () => [mainWindow],
  },
);
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

## 5. セキュリティ実装パターン

### 5.1 3層セキュリティモデル

| 層    | 実装箇所                     | 検証内容                                 |
| ----- | ---------------------------- | ---------------------------------------- |
| 第1層 | Preload（safeInvoke/safeOn） | チャンネルがホワイトリストに含まれるか   |
| 第2層 | Main（validateIpcSender）    | 送信元ウィンドウが許可されたウィンドウか |
| 第3層 | Main（引数バリデーション）   | 引数の型と値が正しいか                   |

### 5.2 safeInvoke / safeOn パターン（Preload層）

```typescript
// safeInvoke: 許可されたチャンネルのみinvokeを実行
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}

// safeOn: 許可されたチャンネルのみリスナーを登録
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }
  const listener = (_event: IpcRendererEvent, data: T) => callback(data);
  ipcRenderer.on(channel, listener);
  return () => ipcRenderer.removeListener(channel, listener);
}
```

### 5.3 validateIpcSender パターン（Main層）

全5つのinvokeハンドラーの先頭で呼び出される。

```typescript
const validation = validateIpcSender(event, channelName, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  throw toIPCValidationError(validation);
}
```

### 5.4 引数バリデーションパターン（Main層）

typeof手動チェックで実装。バリデーション失敗時は `{ success: false, error: "..." }` を返す。

```typescript
// 例: detect-mode の引数バリデーション
if (typeof args?.request !== "string" || args.request.trim() === "") {
  return { success: false, error: "リクエスト文字列が指定されていません" };
}
```

### 5.5 進捗通知の安全な送信

`mainWindow.isDestroyed()` をチェックし、破棄済みウィンドウへの送信を防止する。

```typescript
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

## 6. IPC_CHANNELS 定数一覧

| 定数名                          | 値                                | 方向          | ホワイトリスト |
| ------------------------------- | --------------------------------- | ------------- | -------------- |
| `SKILL_CREATOR_DETECT_MODE`     | `"skill-creator:detect-mode"`     | invoke (R->M) | ALLOWED_INVOKE |
| `SKILL_CREATOR_CREATE`          | `"skill-creator:create"`          | invoke (R->M) | ALLOWED_INVOKE |
| `SKILL_CREATOR_EXECUTE_TASKS`   | `"skill-creator:execute-tasks"`   | invoke (R->M) | ALLOWED_INVOKE |
| `SKILL_CREATOR_VALIDATE`        | `"skill-creator:validate"`        | invoke (R->M) | ALLOWED_INVOKE |
| `SKILL_CREATOR_VALIDATE_SCHEMA` | `"skill-creator:validate-schema"` | invoke (R->M) | ALLOWED_INVOKE |
| `SKILL_CREATOR_PROGRESS`        | `"skill-creator:progress"`        | on (M->R)     | ALLOWED_ON     |

## 7. ファイル構成

| ファイル                                            | 行数 | 役割                                    |
| --------------------------------------------------- | ---- | --------------------------------------- |
| `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | 279  | Main側IPCハンドラー登録                 |
| `apps/desktop/src/preload/skill-creator-api.ts`     | 158  | Preload API定義・実装                   |
| `apps/desktop/src/preload/channels.ts`              | 538  | チャンネル定数・ホワイトリスト（6追加） |
| `apps/desktop/src/preload/index.ts`                 | -    | skillCreatorAPI統合（4箇所変更）        |
| `apps/desktop/src/main/ipc/index.ts`                | -    | registerAllIpcHandlers連携              |

## 8. テスト結果サマリー

| 指標              | 値          |
| ----------------- | ----------- |
| テスト数          | 85テスト    |
| 全テスト結果      | 全PASS      |
| Line Coverage     | 98% / 85%   |
| Branch Coverage   | 95% / 65%   |
| Function Coverage | 100% / 100% |
