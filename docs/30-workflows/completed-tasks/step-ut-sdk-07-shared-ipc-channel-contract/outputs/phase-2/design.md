# Phase 2 設計ドキュメント

タスクID: `UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001`

---

## 1. 設計方針

shared パッケージを IPC チャネル名の **Single Source of Truth** とし、desktop 側はその定義と parity を維持する。既存の `CHAT_EXPORT_CHANNELS`, `SKILL_CHANNELS` 等と同一パターンで `APPROVAL_CHANNELS`, `EXECUTION_CHANNELS` を追加する。

---

## 2. shared 側変更: `packages/shared/src/ipc/channels.ts`

### 2.1 新規定数追加

```typescript
/**
 * 承認フロー関連の IPC チャネル
 */
export const APPROVAL_CHANNELS = {
  /** 承認応答 (Renderer → Main) */
  APPROVAL_RESPOND: "approval:respond",
  /** 承認リクエスト (Main → Renderer) */
  APPROVAL_REQUEST: "approval:request",
} as const;

/**
 * 実行情報関連の IPC チャネル
 */
export const EXECUTION_CHANNELS = {
  /** ディスクロージャ情報取得 */
  EXECUTION_GET_DISCLOSURE_INFO: "execution:get-disclosure-info",
} as const;
```

### 2.2 IPC_CHANNELS スプレッド更新

```typescript
export const IPC_CHANNELS = {
  ...CHAT_EXPORT_CHANNELS,
  ...FILE_SYSTEM_CHANNELS,
  ...SKILL_CHANNELS,
  ...NOTIFICATION_CHANNELS,
  ...HISTORY_SEARCH_CHANNELS,
  ...APPROVAL_CHANNELS, // 追加
  ...EXECUTION_CHANNELS, // 追加
} as const;
```

### 2.3 型 export

`IpcChannel` 型は `IPC_CHANNELS` から自動導出されるため、追加の型定義変更は不要。

---

## 3. desktop 側変更: `apps/desktop/src/preload/channels.ts`

### 3.1 方針

desktop 側の `IPC_CHANNELS` は独自のフラットな定数オブジェクトとして独立管理されている（shared とは構造が異なる）。したがって、desktop 側のローカル定義を削除して shared から直接 import する方式は採用しない。

代わりに、**parity テストで shared と desktop の文字列値一致を保証**する方式を取る。

### 3.2 変更内容

desktop 側のコードは変更不要。parity テストで契約を担保する。

> 理由: desktop の `IPC_CHANNELS` はフラットな巨大オブジェクト (388 エントリ) であり、shared の分割グループ構造とは異なる。import に切り替えると desktop 側の allowlist 管理パターン全体に影響するため、本タスクのスコープを超える。

---

## 4. テスト設計概要

| テスト種別      | 対象                                      | 概要                            |
| --------------- | ----------------------------------------- | ------------------------------- |
| shared ユニット | `APPROVAL_CHANNELS`, `EXECUTION_CHANNELS` | 定義存在・値の一致              |
| parity テスト   | shared vs desktop                         | 3チャネルの文字列値が両者で一致 |
| チャネル分離    | `APPROVAL_*` vs `EXECUTION_*`             | 値の衝突がないこと              |

---

## 5. ファイル変更サマリー

| ファイル                                                   | 変更種別                          | リスク |
| ---------------------------------------------------------- | --------------------------------- | ------ |
| `packages/shared/src/ipc/channels.ts`                      | 追加 (定数2グループ + スプレッド) | Low    |
| `packages/shared/src/ipc/__tests__/channels.test.ts`       | 新規作成                          | Low    |
| `packages/shared/src/ipc/__tests__/channel-parity.test.ts` | 新規作成                          | Low    |
