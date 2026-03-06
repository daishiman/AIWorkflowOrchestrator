# Phase 2 canonical contract 設計

## 型の正式名

| 型名                   | 用途                                     |
| ---------------------- | ---------------------------------------- | ----------------------- |
| `AuthMode`             | `"subscription"                          | "api-key"` の mode 正本 |
| `AuthModeErrorCode`    | `auth-mode/*` の string union            |
| `AuthModeStatus`       | `status` / `validate` 共通 transport DTO |
| `AuthModeChangedEvent` | `changed` event transport DTO            |
| `IPCResponse<T>`       | auth-mode 公開面で使う response envelope |

## request / response / event

### `auth-mode:get`

| 項目     | 設計                              |
| -------- | --------------------------------- |
| Request  | なし                              |
| Response | `IPCResponse<{ mode: AuthMode }>` |
| 備考     | Main の文字列直返しを禁止する     |

### `auth-mode:set`

| 項目     | 設計                                        |
| -------- | ------------------------------------------- |
| Request  | `{ mode: AuthMode }`                        |
| Response | `IPCResponse<void>`                         |
| 副作用   | 成功時に `auth-mode:changed` を新契約で送る |

### `auth-mode:status`

```ts
interface AuthModeStatus {
  mode: AuthMode;
  isValid: boolean;
  hasCredentials: boolean;
  message: string;
  errorCode?: AuthModeErrorCode;
  guidance?: string;
  lastCheckedAt: number;
}
```

| 項目     | 設計                                                    |
| -------- | ------------------------------------------------------- |
| Request  | なし                                                    |
| Response | `IPCResponse<AuthModeStatus>`                           |
| 備考     | UI 表示に必要な `message` と `guidance` を DTO に含める |

### `auth-mode:validate`

| 項目     | 設計                                                       |
| -------- | ---------------------------------------------------------- |
| Request  | `request?: { mode?: AuthMode }`                            |
| Response | `IPCResponse<AuthModeStatus>`                              |
| 備考     | current mode 検証と指定 mode 検証の shape を完全一致させる |

### `auth-mode:changed`

```ts
interface AuthModeChangedEvent {
  previousMode: AuthMode;
  mode: AuthMode;
  status: AuthModeStatus;
  changedAt: number;
}
```

| 項目           | 設計                                                                    |
| -------------- | ----------------------------------------------------------------------- |
| 送信タイミング | `auth-mode:set` 成功直後                                                |
| 目的           | Renderer が event payload のみで画面更新できるようにする                |
| 備考           | `currentMode` / `timestamp` / `isAuthenticated` 単体 payload を廃止する |

## adapter 方針

1. Main service 内部型 `AuthStatus` は維持する。
2. `authModeHandlers.ts` で `AuthStatus -> AuthModeStatus` 変換関数を 1 箇所へ集約する。
3. `validate` は `AuthModeService.validateMode(mode)` を使い、mode ごとの message / errorCode / guidance を同じ adapter 規則で組み立てる。
4. `set` 成功時の event payload も同じ adapter を使う。

## message 規則

| mode           | isValid | message                                    | guidance                                |
| -------------- | ------- | ------------------------------------------ | --------------------------------------- |
| `subscription` | `true`  | `Claude Code CLI の認証情報を使用できます` | なし                                    |
| `subscription` | `false` | `サブスクリプションが見つかりません`       | `Claude Code CLIでログインしてください` |
| `api-key`      | `true`  | `Anthropic APIキーを使用できます`          | なし                                    |
| `api-key`      | `false` | `APIキーが設定されていません`              | `設定画面でAPIキーを入力してください`   |

## 設計判断

- `status` と `validate` を同一 DTO にして、Renderer の分岐を減らす。
- `validate` request は optional を維持し、既存 UI の `validate()` 呼び出しを壊さない。
- `set` response には DTO を追加しない。`changed` event と `status` 再取得で状態整合を確認する。
