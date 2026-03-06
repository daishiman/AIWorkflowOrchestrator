# Phase 2 error envelope 設計

## error envelope

```ts
interface IPCError {
  code: AuthModeErrorCode | "auth-mode/invalid-sender";
  message: string;
  guidance?: string;
}

interface IPCResponse<T> {
  success: boolean;
  data?: T;
  error?: IPCError;
}
```

## error code 一覧

| code                              | 用途                                        |
| --------------------------------- | ------------------------------------------- |
| `auth-mode/invalid-sender`        | sender 検証失敗                             |
| `auth-mode/invalid-mode`          | mode 値不正                                 |
| `auth-mode/no-credentials`        | mode 非依存の credential 欠落共通コード予備 |
| `auth-mode/no-api-key`            | API key 欠落                                |
| `auth-mode/no-subscription-token` | subscription token 欠落                     |
| `auth-mode/storage-failed`        | 保存失敗                                    |
| `auth-mode/storage-read-failed`   | 読み込み失敗                                |
| `auth-mode/unknown-error`         | 想定外障害                                  |

## UI 表示規則

| フィールド      | ルール                                                        |
| --------------- | ------------------------------------------------------------- |
| `message`       | 画面上の主文言として必須表示                                  |
| `errorCode`     | 不正 / 欠落時のみ補助表示可能。テストと手動検証の識別子に使う |
| `guidance`      | ある場合は message の下に表示する                             |
| `lastCheckedAt` | DTO の fresh 判定と manual evidence の照合に使う              |

## sender 検証順序

1. sender の存在と origin を検証する。
2. request shape を検証する。
3. `mode` の allowed value を検証する。
4. service call を実行する。

この順序を破る変更は Phase 9 で fail 扱いにする。
