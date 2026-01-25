# インターフェース仕様書 - PermissionRequest Hook 統合

## メタ情報

| 項目     | 内容                        |
| -------- | --------------------------- |
| タスクID | TASK-3-1-C                  |
| Phase    | 1 - 要件定義                |
| 作成日   | 2026-01-25                  |
| 機能名   | PermissionRequest Hook 統合 |

---

## IPC チャネル定義

### skill:permission:request

権限確認リクエストを Main Process から Renderer Process へ送信する。

| 項目       | 内容                       |
| ---------- | -------------------------- |
| チャネル名 | `skill:permission:request` |
| 方向       | Main → Renderer            |
| 通信方式   | webContents.send()         |

**ペイロード**:

```typescript
interface SkillPermissionRequest {
  /** スキル実行を識別するID */
  executionId: string;

  /** 権限リクエストを識別するID（UUID） */
  requestId: string;

  /** ツール名（Bash, Write, Edit 等） */
  toolName: string;

  /** サニタイズ済みツール引数 */
  args: Record<string, unknown>;

  /** 人間可読な権限リクエスト理由 */
  reason?: string;
}
```

---

### skill:permission:response

権限確認レスポンスを Renderer Process から Main Process へ送信する。

| 項目       | 内容                        |
| ---------- | --------------------------- |
| チャネル名 | `skill:permission:response` |
| 方向       | Renderer → Main             |
| 通信方式   | ipcRenderer.invoke()        |

**ペイロード**:

```typescript
interface SkillPermissionResponse {
  /** 対応する権限リクエストID */
  requestId: string;

  /** 承認=true, 拒否=false */
  approved: boolean;

  /** 同じツールの今後のリクエストを自動承認するか */
  rememberChoice?: boolean;

  /** 拒否時の理由（任意） */
  rejectReason?: string;
}
```

---

## 型定義

### PermissionRequest Hook 戻り値

```typescript
/** 権限承認時の戻り値 */
interface PermissionAllowResult {
  behavior: "allow";
}

/** 権限拒否時の戻り値 */
interface PermissionDenyResult {
  behavior: "deny";
  message: string;
}

type PermissionHookResult = PermissionAllowResult | PermissionDenyResult;
```

---

### サニタイズ関数

```typescript
/**
 * ツール引数をサニタイズする
 * @param args - 元のツール引数
 * @returns サニタイズ済み引数
 */
function sanitizeArgs(args: Record<string, unknown>): Record<string, unknown>;

/**
 * 機密情報をマスクする
 * @param key - 引数キー名
 * @param value - 引数値
 * @returns マスク済み値
 */
function maskSensitiveValue(key: string, value: unknown): unknown;

/**
 * 長い文字列を省略する
 * @param value - 元の文字列
 * @param maxLength - 最大文字数（デフォルト: 500）
 * @returns 省略済み文字列
 */
function truncateValue(value: string, maxLength?: number): string;
```

---

### 理由文生成関数

```typescript
/**
 * 権限リクエスト理由を生成する
 * @param toolName - ツール名
 * @param args - ツール引数
 * @returns 日本語の理由文
 */
function generatePermissionReason(
  toolName: string,
  args: Record<string, unknown>,
): string;
```

---

## エラーハンドリング

### エラー種別

| エラー種別       | 説明                         | 処理           |
| ---------------- | ---------------------------- | -------------- |
| タイムアウト     | 30秒以内にユーザー応答がない | 自動拒否       |
| キャンセル       | AbortSignal によるキャンセル | 即座に停止     |
| IPC エラー       | Renderer への通信失敗        | 拒否として処理 |
| 無効なレスポンス | レスポンスの形式が不正       | 拒否として処理 |

### エラーメッセージ

```typescript
const ERROR_MESSAGES = {
  TIMEOUT: "権限確認がタイムアウトしました（30秒）",
  CANCELLED: "権限確認がキャンセルされました",
  IPC_ERROR: "Rendererとの通信に失敗しました",
  INVALID_RESPONSE: "無効な権限応答を受信しました",
  USER_REJECTED: "ユーザーにより拒否されました",
};
```

---

## シーケンス図

```
┌───────────┐     ┌──────────────┐     ┌───────────────────┐     ┌──────────┐
│ Claude SDK│     │SkillExecutor │     │PermissionResolver │     │ Renderer │
└─────┬─────┘     └──────┬───────┘     └─────────┬─────────┘     └────┬─────┘
      │                  │                       │                    │
      │PermissionRequest │                       │                    │
      │─────────────────>│                       │                    │
      │                  │                       │                    │
      │                  │ sanitize & generate   │                    │
      │                  │ reason                │                    │
      │                  │──────────────────────>│                    │
      │                  │                       │                    │
      │                  │                       │ IPC: request       │
      │                  │                       │───────────────────>│
      │                  │                       │                    │
      │                  │ waitForResponse()     │                    │
      │                  │──────────────────────>│                    │
      │                  │                       │                    │
      │                  │                       │   User Decision    │
      │                  │                       │<- - - - - - - - - -│
      │                  │                       │                    │
      │                  │                       │ IPC: response      │
      │                  │                       │<───────────────────│
      │                  │                       │                    │
      │                  │ resolve(response)     │                    │
      │                  │<──────────────────────│                    │
      │                  │                       │                    │
      │ { behavior }     │                       │                    │
      │<─────────────────│                       │                    │
      │                  │                       │                    │
```

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-01-25 | 初版作成 |
