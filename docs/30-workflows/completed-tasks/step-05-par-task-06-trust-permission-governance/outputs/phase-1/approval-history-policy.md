# 承認履歴ポリシー定義書

## メタ情報

| 項目       | 値                                                                       |
| ---------- | ------------------------------------------------------------------------ |
| 成果物ID   | OUT-3                                                                    |
| タスクID   | TASK-SKILL-LIFECYCLE-06                                                  |
| Phase      | 1: 要件定義                                                              |
| 作成日     | 2026-03-16                                                               |
| 対応AC     | AC-2（承認履歴と取り消し方針）                                           |
| 依存成果物 | OUT-1（risk-level-classification.md）、OUT-2（permission-state-flow.md） |
| 既存定数   | `PERMISSION_HISTORY_MAX_ENTRIES = 1000`                                  |

---

## 1. 履歴エントリ型定義（8フィールド）

```typescript
type PermissionDecision = "approved" | "denied" | "revoked";
type RiskLevel = "critical" | "high" | "medium" | "low";
type ExpiryPolicy = "session" | "time_24h" | "time_7d" | "permanent";

interface ApprovalHistoryEntry {
  /** 1. 履歴エントリの一意識別子（UUID v4 形式） */
  id: string;

  /** 2. ツール識別子（ALLOWED_TOOLS_WHITELIST の11ツールのいずれかに一致する値） */
  toolName: string;

  /** 3. スキル識別子（スキル名） */
  skillName: string;

  /** 4. 判断結果 */
  decision: PermissionDecision;

  /** 5. ツール呼び出し時点のリスクレベル */
  riskLevel: RiskLevel;

  /** 6. 判断が記録された時刻（Unix timestamp、ミリ秒精度） */
  timestamp: number;

  /** 7. 許可の有効期限ポリシー */
  expiryPolicy: ExpiryPolicy;

  /** 8. 取り消し操作が実行された時刻（decision === "revoked" の場合のみ設定） */
  revokedAt?: number;
}
```

### 8フィールドの仕様詳細

| #   | フィールド     | 型                   | 必須 | バリデーション条件                                                                                                 |
| --- | -------------- | -------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | `id`           | `string`             | 必須 | UUID v4 形式（`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`）                         |
| 2   | `toolName`     | `string`             | 必須 | ALLOWED_TOOLS_WHITELIST の11ツールのいずれかに完全一致。空文字列・トリム空文字列は不可（P42準拠3段バリデーション） |
| 3   | `skillName`    | `string`             | 必須 | 空文字列・トリム空文字列は不可（P42準拠3段バリデーション）                                                         |
| 4   | `decision`     | `PermissionDecision` | 必須 | `"approved"` / `"denied"` / `"revoked"` のいずれかに完全一致                                                       |
| 5   | `riskLevel`    | `RiskLevel`          | 必須 | `"critical"` / `"high"` / `"medium"` / `"low"` のいずれかに完全一致                                                |
| 6   | `timestamp`    | `number`             | 必須 | 正の整数、`timestamp <= Date.now()` を満たす（未来の値は不可）                                                     |
| 7   | `expiryPolicy` | `ExpiryPolicy`       | 必須 | `"session"` / `"time_24h"` / `"time_7d"` / `"permanent"` のいずれかに完全一致                                      |
| 8   | `revokedAt`    | `number`             | 任意 | `decision === "revoked"` の場合のみ設定。正の整数、`revokedAt <= Date.now()` を満たす                              |

---

## 2. 取り消し条件定義

| 取り消しトリガー       | 発生条件                                                               | 処理内容                                                                                                          |
| ---------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ユーザー手動取り消し   | 設定画面の Permission History Panel で「取り消し」操作                 | `decision` を `"revoked"` に更新し `revokedAt = Date.now()` を設定。`PermissionStore.revokeTool(toolName)` を実行 |
| スキル更新時の自動失効 | `currentContentHash !== lastApprovedContentHash`（スキルファイル変更） | 該当スキルの `approved` エントリを `"revoked"` に更新。`revokedAt = Date.now()` を設定                            |
| 期限切れ自動削除       | `expiryPolicy` の条件を超過した場合（セクション4の計算式を参照）       | 該当エントリを履歴から削除（`"revoked"` への更新ではなく完全削除）                                                |

---

## 3. FIFO 1000件制限

| パラメータ                       | 値                              | 定義元                                               |
| -------------------------------- | ------------------------------- | ---------------------------------------------------- |
| `PERMISSION_HISTORY_MAX_ENTRIES` | `1000`                          | 既存定数（Permission History Panel）                 |
| 超過時アルゴリズム               | FIFO（先入れ先出し）            | 最古エントリ（`timestamp` が最小のエントリ）から削除 |
| 削除単位                         | 1件ずつ（バッチ削除は行わない） | 1001件目追加時に最古1件のみ削除                      |

### 1001件目追加時の処理フロー

```
前提: 履歴配列 history の長さが 1000 の状態で新規エントリ E を追加する

1. history.length === PERMISSION_HISTORY_MAX_ENTRIES (1000) を判定
2. 条件が true の場合:
   a. history[0]（最古エントリ、timestamp が最小のエントリ）を削除
   b. history の末尾に E を追加
   c. 結果: history.length === 1000（上限を超過しない）
3. 条件が false の場合（history.length < 1000）:
   a. history の末尾に E を追加
   b. 結果: history.length === history.length + 1
```

> **制約**: 削除されるエントリの `decision` が `"approved"` であっても、`PermissionStore` の許可状態には影響しない。履歴の削除と許可状態の変更は独立した操作である。

---

## 4. AllowedToolEntryV2 拡張プレビュー

既存の `AllowedToolEntry` 型に `expiresAt`、`skillName`、`expiryPolicy` を追加した拡張型。

```typescript
// 既存型（V1）
interface AllowedToolEntry {
  toolName: string; // ツール識別子
  allowedAt: string; // 許可日時（ISO 8601形式）
}

// 拡張型（V2 プレビュー、Phase 2 で正式設計）
interface AllowedToolEntryV2 extends AllowedToolEntry {
  expiresAt?: number; // 許可の期限（Unix timestamp、ミリ秒）。永続の場合は undefined
  skillName?: string; // 許可を付与したスキルの名前
  expiryPolicy?: ExpiryPolicy; // 許可の有効期限ポリシー
}
```

### 後方互換性方針

| 項目                         | 方針                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| 既存データのマイグレーション | `expiryPolicy` 未設定のエントリは `"permanent"` をデフォルト値として補完する     |
| `expiresAt` の算出           | V1 エントリは `expiresAt = undefined`（永続）として補完する                      |
| 破壊的変更の回避             | `AllowedToolEntry` の既存フィールド（`toolName`、`allowedAt`）は変更・削除しない |

---

## 5. 失効ポリシー定義（4種）

| ポリシー識別子 | 名称           | 説明                                                          |
| -------------- | -------------- | ------------------------------------------------------------- |
| `session`      | セッション限定 | セッション終了（`agent:destroySession` IPC 発行）時に即時失効 |
| `time_24h`     | 24時間限定     | 許可から24時間経過後に自動削除                                |
| `time_7d`      | 7日間限定      | 許可から7日間経過後に自動削除                                 |
| `permanent`    | 永続           | ユーザーが手動で取り消すまで有効                              |

### expiresAt 計算式

| ポリシー識別子 | `expiresAt` の計算式                                                                 |
| -------------- | ------------------------------------------------------------------------------------ |
| `session`      | `expiresAt = undefined`（セッション管理はタイムスタンプではなく `sessionId` で管理） |
| `time_24h`     | `expiresAt = timestamp + 24 * 60 * 60 * 1000`（24時間 = 86,400,000ms）               |
| `time_7d`      | `expiresAt = timestamp + 7 * 24 * 60 * 60 * 1000`（7日間 = 604,800,000ms）           |
| `permanent`    | `expiresAt = undefined`（期限なし）                                                  |

### 期限切れ判定条件

```typescript
function isExpired(entry: AllowedToolEntryV2): boolean {
  if (entry.expiresAt === undefined) {
    // session スコープはタイムスタンプで管理しない（sessionMemory で管理）
    // permanent は期限なし
    return false;
  }
  return Date.now() > entry.expiresAt;
}
```

---

## 6. AC対応マッピング

| AC   | 対応内容                                                  | 本文書の対応セクション                                                                      |
| ---- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| AC-1 | 危険操作の権限境界定義（4段階リスク分類、確認方式の定義） | セクション1（`riskLevel` フィールド定義）                                                   |
| AC-2 | 承認取り消しフロー（失効条件、手動取り消し、状態遷移）    | セクション2（取り消し条件）、セクション5（失効ポリシー）、セクション3（FIFO 制限）          |
| AC-3 | 説明責任UI（INS-01〜03、ScoringGate連携）                 | セクション1（`decision` フィールドが INS-03 の表示内容に使用）                              |
| AC-4 | 公開前安全性ゲート（SafetyGatePort、SafetyGateResult）    | セクション1（`skillName` フィールドが SafetyCheckId の `NO_PERMANENT_APPROVAL` 判定に使用） |
