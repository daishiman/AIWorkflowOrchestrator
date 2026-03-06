# TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 実装ガイド

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| タスクID   | TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001          |
| 対象       | auth-mode Main / Preload / Renderer 公開契約の整合 |
| 作成日     | 2026-03-06                                         |
| 関連成果物 | Phase 2 / 5 / 6 / 11 / 12                          |

## Part 1: 中学生向けの説明

### なぜ必要だったか

学校の職員室に「認証方法を確認する窓口」があるとします。  
先生によって「今どの方法を使っているか」「ちゃんと使えるか」「切り替わったか」の伝え方がバラバラだと、受け取る側は毎回読み替えないといけません。  
今回の不具合は、その伝え方が Main、Preload、Renderer の3か所で少しずつ違っていたことが原因でした。

### 何をそろえたか

- どの認証方式かを返す形を1つにそろえた
- 使えるかどうかの結果を同じ箱で返すようにした
- 切り替わったときの通知に、前の値・新しい値・確認結果をまとめて載せた

### どう良くなったか

- 画面側は「この形で来る」と決め打ちできる
- テストも Main / Preload / Renderer で同じ前提を使える
- 認証情報が足りないときも、画面に出す文言と案内を安定して表示できる

## Part 2: 技術者向け実装詳細

### 正本型

`packages/shared/src/types/auth-mode.ts` を公開 transport 型の正本に統一した。

```ts
export interface IPCError {
  code: AuthModeErrorCode;
  message: string;
  guidance?: string;
}

export interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}

export interface AuthModeStatus {
  mode: AuthMode;
  isValid: boolean;
  hasCredentials: boolean;
  message: string;
  errorCode?: AuthModeErrorCode;
  guidance?: string;
  lastCheckedAt: number;
}

export interface AuthModeChangedEvent {
  previousMode: AuthMode;
  mode: AuthMode;
  status: AuthModeStatus;
  changedAt: number;
}
```

### 公開API

```ts
authMode: {
  get: () => Promise<AuthModeGetResponse>;
  set: (request: AuthModeSetRequest) => Promise<AuthModeSetResponse>;
  status: () => Promise<AuthModeStatusResponse>;
  validate: (request?: AuthModeValidateRequest) => Promise<AuthModeValidateResponse>;
  onModeChanged: (callback: (event: AuthModeChangedEvent) => void) => () => void;
}
```

### request / response / event 契約

| 操作       | request     | success時の data                              | 失敗時                                       |
| ---------- | ----------- | --------------------------------------------- | -------------------------------------------- |
| `get`      | なし        | `{ mode }`                                    | `IPCResponse.error`                          |
| `set`      | `{ mode }`  | なし                                          | `IPCResponse.error`                          |
| `status`   | なし        | `AuthModeStatus`                              | `IPCResponse.error`                          |
| `validate` | `{ mode? }` | `AuthModeStatus`                              | `IPCResponse.error`                          |
| `changed`  | event       | `previousMode`, `mode`, `status`, `changedAt` | event自体は success/fail envelope を持たない |

### 重要な仕様

- `status` / `validate` は「資格情報不足」を envelope error ではなく `AuthModeStatus.isValid = false` で返す
- `set` 成功時は `changed` event に `status` を同梱する
- `validate()` の引数は省略可能。省略時は現在モードを検証する
- Renderer は `event.mode` と `event.status` をそのまま Store に反映する

### エラーコード

| コード                            | 用途                    |
| --------------------------------- | ----------------------- |
| `auth-mode/invalid-sender`        | 不正送信元              |
| `auth-mode/invalid-mode`          | 不正な mode 指定        |
| `auth-mode/no-credentials`        | 資格情報なし            |
| `auth-mode/no-api-key`            | API key 不在            |
| `auth-mode/no-subscription-token` | subscription token 不在 |
| `auth-mode/storage-failed`        | 保存失敗                |
| `auth-mode/storage-read-failed`   | 読み取り失敗            |
| `auth-mode/unknown-error`         | 想定外エラー            |

### 定数・設定値

| 項目                 | 値                            |
| -------------------- | ----------------------------- |
| `DEFAULT_AUTH_MODE`  | `"subscription"`              |
| `VALID_AUTH_MODES`   | `["subscription", "api-key"]` |
| `AUTH_MODE_GET`      | `auth-mode:get`               |
| `AUTH_MODE_SET`      | `auth-mode:set`               |
| `AUTH_MODE_STATUS`   | `auth-mode:status`            |
| `AUTH_MODE_VALIDATE` | `auth-mode:validate`          |
| `AUTH_MODE_CHANGED`  | `auth-mode:changed`           |

### 使用例

#### `get`

```ts
const response = await window.electronAPI.authMode.get();
if (response.success && response.data) {
  console.log(response.data.mode);
}
```

#### `status`

```ts
const response = await window.electronAPI.authMode.status();
if (response.success && response.data) {
  console.log(response.data.message, response.data.isValid);
}
```

#### `validate`

```ts
const response = await window.electronAPI.authMode.validate({
  mode: "api-key",
});
if (response.success && response.data && !response.data.isValid) {
  console.log(response.data.errorCode, response.data.guidance);
}
```

#### `changed`

```ts
const cleanup = window.electronAPI.authMode.onModeChanged((event) => {
  console.log(event.previousMode, event.mode, event.status.lastCheckedAt);
});

cleanup();
```

### エッジケース

- invalid sender: Main 側で `validateSender()` を最初に実行し `auth-mode/invalid-sender` を返す
- invalid mode: `set` で `VALID_AUTH_MODES` に含まれない値を拒否する
- Preload未初期化: Renderer slice は `window.electronAPI?.authMode` を確認し安全に early return する
- IPC欠落/例外: Renderer slice は fallback status を生成し `UNKNOWN_ERROR` を UI 表示へ変換する

### 今回の実装差分

- Shared に transport DTO / error envelope / changed event を集約
- Main IPC を envelope + DTO ベースへ正規化
- Preload の公開型と bridge 実装を shared 契約へ合わせた
- Renderer slice を `fetchMode -> fetchStatus` / `setMode -> fetchStatus` の順へ統一
- Settings UI に `data-testid` を追加し、契約整合を UI テストと Phase 11 証跡で固定した
