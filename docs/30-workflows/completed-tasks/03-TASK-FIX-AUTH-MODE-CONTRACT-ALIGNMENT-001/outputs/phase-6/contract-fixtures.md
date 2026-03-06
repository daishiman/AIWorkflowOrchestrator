# Phase 6: 共通 fixture

## 方針

- public contract の正本は `packages/shared/src/types/auth-mode.ts`
- Main / Preload / Renderer の fixture 名は transport DTO と同じプロパティ名を使う
- internal service shape は fixture 正本にせず、Main handler で transport へ写像する

## `auth-mode:get`

```ts
const getSuccessFixture = {
  success: true,
  data: {
    mode: "subscription",
  },
};
```

## `auth-mode:set`

```ts
const setSuccessFixture = {
  success: true,
};
```

## `auth-mode:status`

```ts
const statusSuccessFixture = {
  success: true,
  data: {
    mode: "subscription",
    isValid: true,
    hasCredentials: true,
    message: "Claude Code CLI の認証情報を使用できます",
    lastCheckedAt: 1760000000000,
  },
};
```

## `auth-mode:validate`

```ts
const validateFailureFixture = {
  success: true,
  data: {
    mode: "api-key",
    isValid: false,
    hasCredentials: false,
    message: "APIキーが設定されていません",
    errorCode: "auth-mode/no-api-key",
    guidance: "設定画面でAPIキーを入力してください",
    lastCheckedAt: 1760000000000,
  },
};
```

## `auth-mode:changed`

```ts
const changedEventFixture = {
  previousMode: "subscription",
  mode: "api-key",
  status: {
    mode: "api-key",
    isValid: false,
    hasCredentials: false,
    message: "APIキーが設定されていません",
    errorCode: "auth-mode/no-api-key",
    guidance: "設定画面でAPIキーを入力してください",
    lastCheckedAt: 1760000000000,
  },
  changedAt: 1760000000500,
};
```

## error envelope

```ts
const invalidSenderFixture = {
  success: false,
  error: {
    code: "auth-mode/invalid-sender",
    message: "Invalid request sender",
  },
};

const invalidModeFixture = {
  success: false,
  error: {
    code: "auth-mode/invalid-mode",
    message:
      "Invalid auth mode: invalid. Must be one of: subscription, api-key",
  },
};
```

## fixture 使用先

| fixture                  | Main                              | Preload                             | Renderer                        |
| ------------------------ | --------------------------------- | ----------------------------------- | ------------------------------- |
| `getSuccessFixture`      | handler response assert           | invoke passthrough assert           | `fetchMode` state assert        |
| `statusSuccessFixture`   | handler response assert           | N/A                                 | `fetchStatus` state assert      |
| `validateFailureFixture` | handler response assert           | request optional assert             | `validate` / fallback UI assert |
| `changedEventFixture`    | `webContents.send` payload assert | listener payload passthrough assert | store listener state assert     |
| `invalidSenderFixture`   | invalid sender assert             | whitelist 前提                      | fallback / error mapping assert |

## 命名統一ルール

1. `newMode` は廃止し `mode` に統一する。
2. `timestamp` は廃止し `changedAt` に統一する。
3. credential state は `hasCredentials` を必須にする。
4. UI 表示用補助情報は `message`, `errorCode`, `guidance`, `lastCheckedAt` に限定する。
