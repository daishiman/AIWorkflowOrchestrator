# TASK-SC-07-PARSE-ERROR-CODE: エラーコード判定の構造化（文字列マッチング→構造化コード）

## メタ情報

| 項目     | 値                                                                 |
| -------- | ------------------------------------------------------------------ |
| タスクID | TASK-SC-07-PARSE-ERROR-CODE                                        |
| 検出元   | TASK-SC-07-STREAMING-PROGRESS-UI Phase 3 未実装検出                |
| 優先度   | MEDIUM                                                             |
| 影響     | エラーメッセージの文字列変更で誤判定が発生するリスク（保守性低下） |
| 検出日   | 2026-03-25                                                         |

## 概要

`parseErrorCode` が文字列マッチング（`includes("API_KEY")`）でエラー種別を判定しているため、IPC ペイロードのメッセージ文言変更で誤判定が生じるリスクがある。IPC ペイロードに構造化された `code` フィールドを持たせ、文字列マッチングを廃止する。

## 現状

```typescript
// apps/desktop/src/renderer/hooks/useStreamingProgress.ts
function parseErrorCode(message: string): ErrorCode {
  if (message.includes("API_KEY")) return "API_KEY_NOT_SET"; // 文字列マッチング
  if (message.includes("RATE_LIMIT")) return "RATE_LIMIT_EXCEEDED";
  return "UNKNOWN_ERROR";
}
```

## 期待される修正

```typescript
// IPC ペイロードに構造化コードを追加
interface ErrorPayload {
  code: "API_KEY_NOT_SET" | "RATE_LIMIT_EXCEEDED" | "UNKNOWN_ERROR"; // 構造化コード
  message: string;
}

// apps/desktop/src/renderer/hooks/useStreamingProgress.ts
function parseErrorCode(payload: ErrorPayload): ErrorCode {
  return payload.code; // 文字列マッチング不要
}
```

## 完了条件

- [ ] IPC エラーペイロードに `code` フィールドが追加されている
- [ ] `parseErrorCode` が `code` フィールドを直接参照している
- [ ] 文字列マッチング（`includes`）によるエラー判定が削除されている
- [ ] Main プロセス側が構造化された `code` を送信している
- [ ] 既存テストが全て PASS する

## 関連

- 親タスク: TASK-SC-07-STREAMING-PROGRESS-UI
- 対象ファイル: `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`
