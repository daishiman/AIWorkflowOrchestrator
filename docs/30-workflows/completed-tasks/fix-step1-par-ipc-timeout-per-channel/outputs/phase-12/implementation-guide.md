# Implementation Guide: fix-ipc-timeout-per-channel

**TASK-FIX-IPC-TIMEOUT-001 | 2026-04-01**

---

## Part 1: 中学生レベルの概念説明

### なぜ必要だったか

今まで、アプリの部品（IPC チャンネル）が Main プロセスに連絡を取るとき、
どのチャンネルも一律 **5秒** しか待ってくれませんでした。

たとえば、宅配便屋さんが荷物を届けるとき、小さな手紙も大きな冷蔵庫も
「5秒以内に受け取らないと帰る」と言っていたようなものです。
手紙なら5秒で十分ですが、冷蔵庫の搬入は60秒必要です。

- `auth:login`（OAuth起動の確認）→ 手紙サイズ → **0.5秒**で十分
- `skill:execute`（AIスキルの実行）→ 冷蔵庫サイズ → **60秒**必要

これを解決するために、荷物の大きさ（処理時間）に応じて待ち時間を変える
`CHANNEL_TIMEOUTS` マップと `getChannelTimeout` 関数を追加しました。

### 何をしたか

1. チャンネル名 → タイムアウト値のマップ（`CHANNEL_TIMEOUTS`）を追加
2. チャンネル名から適切なタイムアウトを返す関数（`getChannelTimeout`）を追加
3. `invokeWithTimeout` がこの関数を使うように1箇所修正
4. 定義されていないチャンネルは以前と同じ5秒にフォールバック（後方互換性維持）

---

## Part 2: 技術的実装ガイド

### current contract（変更前）

```typescript
// apps/desktop/src/preload/ipc-utils.ts
export const IPC_TIMEOUT_MS = 5000;                    // 全チャンネル共通 5秒
export function invokeWithTimeout<T>(...)              // IPC_TIMEOUT_MS ハードコード
```

**export**: `IPC_TIMEOUT_MS`, `invokeWithTimeout`

### target delta（変更後）

```typescript
// apps/desktop/src/preload/ipc-utils.ts

// 新規追加
const CHANNEL_TIMEOUTS: Partial<Record<string, number>> = {
  "auth:login": 500,
  "auth:get-session": 10000,
  "auth:refresh": 10000,
  "skill-creator:plan": 30000,
  "skill:execute": 60000,
};

// 新規追加（export）
export function getChannelTimeout(channel: string): number {
  return CHANNEL_TIMEOUTS[channel] ?? IPC_TIMEOUT_MS;
}

// 修正（IPC_TIMEOUT_MS → getChannelTimeout(channel) に変更）
export function invokeWithTimeout<T>(...) {
  const timeout = getChannelTimeout(channel);  // ← 追加
  // setTimeout, エラーメッセージで timeout 変数を使用
}
```

**export（変更後）**: `IPC_TIMEOUT_MS`, `invokeWithTimeout`, `getChannelTimeout`（新規追加）

### チャンネル別タイムアウト設定

| チャンネル           | タイムアウト | 根拠                                 |
| -------------------- | ------------ | ------------------------------------ |
| `auth:login`         | 500ms        | OAuth フロー起動の fire-and-forget   |
| `auth:get-session`   | 10000ms      | ネットワーク通信を伴うセッション取得 |
| `auth:refresh`       | 10000ms      | ネットワーク通信を伴うトークン更新   |
| `skill-creator:plan` | 30000ms      | AI 生成処理を含む                    |
| `skill:execute`      | 60000ms      | 長時間スキル実行                     |
| その他               | 5000ms       | `IPC_TIMEOUT_MS` フォールバック      |

### エッジケース・エラーハンドリング

```typescript
// 未定義チャンネル → IPC_TIMEOUT_MS (5000ms) にフォールバック
getChannelTimeout("unknown:channel"); // → 5000

// 空文字 → 同様にフォールバック
getChannelTimeout(""); // → 5000

// タイムアウトエラーメッセージはチャンネル別の値を含む
// "IPC timeout: skill:execute did not respond within 60000ms"
```

### 使用例

```typescript
const skillTimeout = getChannelTimeout("skill:execute"); // 60000
const loginTimeout = getChannelTimeout("auth:login"); // 500
const fallbackTimeout = getChannelTimeout("unknown:channel"); // 5000
```

### 変更範囲

- 変更ファイル: `apps/desktop/src/preload/ipc-utils.ts`（1ファイル完結）
- 新規テスト: `apps/desktop/src/preload/__tests__/ipc-utils.test.ts`
- 影響なし: `preload/index.ts`, `skill-api.ts`, `skill-creator-api.ts`, `channels.ts`

### テスト結果

- 新規テスト: 18件 PASS（T-001〜T-018）
- 既存テスト: 15件 PASS（後方互換性確認）
