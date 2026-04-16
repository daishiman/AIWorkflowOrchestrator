# implementation-guide.md

## Part 1

### なぜ必要か

`packages/shared/src/ipc/channels.ts` は IPC チャネルの正本です。  
そこにある名前を `apps/desktop/src/preload/channels.ts` のホワイトリストに入れておかないと、renderer は安全のために main に話しかけられません。

たとえば、学校の受付で「入校名簿に名前が載っている人だけ通す」運用に似ています。  
名簿が正しくても、受付のチェック表に名前がなければ入れません。今回の修正は、そのチェック表を正本に合わせ直す作業です。

### 日常の例え

たとえば、家の鍵を持っていても、玄関のロックが別の鍵番号になっていたら開きません。  
今回の `IPC_CHANNELS` は鍵の番号、`ALLOWED_INVOKE_CHANNELS` と `ALLOWED_ON_CHANNELS` は玄関の認証表です。

### 何をするか

- `CHAT_EXPORT_CHANNELS` はそのまま `IPC_CHANNELS` に取り込む
- `FILE_SYSTEM_CHANNELS` は `SHOW_SAVE_DIALOG` の重複値を増やさず、`WRITE_FILE` と `READ_FILE` だけを明示的に追加する
- `ALLOWED_INVOKE_CHANNELS` に 6 件、`ALLOWED_ON_CHANNELS` に 6 件を追加する
- `verify-ipc-4layer.cjs` の Rule-1 を PASS にする

### 今回作ったもの

- `chat:exportSession` と `chat:previewExport`
- `fs:writeFile` と `fs:readFile`
- `skill-creator:start-session` と `skill-creator:answer`
- `skill-creator:question-received`
- `skill-creator:session-complete`
- `skill-creator:session-error`
- `skill-creator:external-api-config-required`
- `skill-creator:api-configured`
- `skill-creator:api-test-result`

## Part 2

### 型定義

```ts
import {
  CHAT_EXPORT_CHANNELS,
  FILE_SYSTEM_CHANNELS,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_SESSION_CHANNELS,
} from "@repo/shared/src/ipc/channels";

type IpcChannelValue = string;

export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  WRITE_FILE: FILE_SYSTEM_CHANNELS.WRITE_FILE,
  READ_FILE: FILE_SYSTEM_CHANNELS.READ_FILE,
  ...SKILL_CREATOR_SESSION_CHANNELS,
  ...SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  // 既存のチャネル定義は省略
} as const;

export const ALLOWED_INVOKE_CHANNELS: readonly IpcChannelValue[] = [
  IPC_CHANNELS.EXPORT_SESSION,
  IPC_CHANNELS.PREVIEW_EXPORT,
  IPC_CHANNELS.WRITE_FILE,
  IPC_CHANNELS.READ_FILE,
  IPC_CHANNELS.START_SESSION,
  IPC_CHANNELS.ANSWER,
];

export const ALLOWED_ON_CHANNELS: readonly IpcChannelValue[] = [
  IPC_CHANNELS.QUESTION_RECEIVED,
  IPC_CHANNELS.SESSION_COMPLETE,
  IPC_CHANNELS.SESSION_ERROR,
  IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED,
  IPC_CHANNELS.API_CONFIGURED,
  IPC_CHANNELS.API_TEST_RESULT,
];
```

### APIシグネチャ

このファイルは関数 API を公開しません。公開するのは次の定数群です。

```ts
export const IPC_CHANNELS: Readonly<Record<string, string>>;
export const ALLOWED_INVOKE_CHANNELS: readonly string[];
export const ALLOWED_ON_CHANNELS: readonly string[];
```

### 使用例

```ts
await window.electronAPI.invoke(IPC_CHANNELS.EXPORT_SESSION, {
  sessionId: "session-123",
});

window.electronAPI.on(IPC_CHANNELS.QUESTION_RECEIVED, (question) => {
  console.log(question.prompt);
});
```

### エラーハンドリング

- `verify-ipc-4layer.cjs` で Rule-1 が FAIL したら、`IPC_CHANNELS.*` 参照を `ALLOWED_*` に追加する
- `FILE_SYSTEM_CHANNELS.SHOW_SAVE_DIALOG` は既存の `IPC_CHANNELS.DIALOG_SHOW_SAVE` と同じ値なので、`FILE_SYSTEM_CHANNELS` を丸ごと spread しない
- `Rule-2` の missing は main handler 側の別タスクで扱う

### エッジケース

- `CONFIGURE_API` は既に preload 側にあるので追加しない
- `CHAT_EXPORT_CHANNELS` の値は重複しないので spread で問題ない
- `WRITE_FILE` / `READ_FILE` を明示参照にしても、検証スクリプトは `IPC_CHANNELS.*` として正しく解決できる

### 設定項目と定数一覧

| 定数                                        | 値                                           | 役割                         |
| ------------------------------------------- | -------------------------------------------- | ---------------------------- |
| `IPC_CHANNELS.EXPORT_SESSION`               | `chat:exportSession`                         | チャット履歴のエクスポート   |
| `IPC_CHANNELS.PREVIEW_EXPORT`               | `chat:previewExport`                         | エクスポート前の見積もり取得 |
| `IPC_CHANNELS.WRITE_FILE`                   | `fs:writeFile`                               | ファイル書き込み             |
| `IPC_CHANNELS.READ_FILE`                    | `fs:readFile`                                | ファイル読み取り             |
| `IPC_CHANNELS.START_SESSION`                | `skill-creator:start-session`                | Skill Creator セッション開始 |
| `IPC_CHANNELS.ANSWER`                       | `skill-creator:answer`                       | Skill Creator への回答送信   |
| `IPC_CHANNELS.QUESTION_RECEIVED`            | `skill-creator:question-received`            | 質問通知                     |
| `IPC_CHANNELS.SESSION_COMPLETE`             | `skill-creator:session-complete`             | セッション完了通知           |
| `IPC_CHANNELS.SESSION_ERROR`                | `skill-creator:session-error`                | セッションエラー通知         |
| `IPC_CHANNELS.EXTERNAL_API_CONFIG_REQUIRED` | `skill-creator:external-api-config-required` | 外部 API 設定要求            |
| `IPC_CHANNELS.API_CONFIGURED`               | `skill-creator:api-configured`               | API 設定完了通知             |
| `IPC_CHANNELS.API_TEST_RESULT`              | `skill-creator:api-test-result`              | API テスト結果通知           |

### テスト構成

- `node scripts/verify-ipc-4layer.cjs`
- `pnpm --filter @repo/desktop typecheck`
- `pnpm --filter @repo/desktop test:run -- apps/desktop/src/preload/channels.test.ts apps/desktop/src/preload/__tests__/channels.skill-import.test.ts`
