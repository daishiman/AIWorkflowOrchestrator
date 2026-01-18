# Phase 12: システム仕様更新ログ

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | システム仕様更新ログ          |
| Phase      | 12                            |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 完了                          |

---

## 1. 更新要否判断

### 判断基準

| 更新が必要な場合             | 更新が不要な場合                         |
| ---------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加  | 内部実装の詳細変更のみ                   |
| 既存インターフェース変更     | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加          | バグ修正（仕様変更なし）                 |
| 外部連携インターフェース追加 | テスト追加のみ                           |

### 判定結果

| 判定項目                     | 該当 | 理由                                     |
| ---------------------------- | ---- | ---------------------------------------- |
| 新規インターフェース/型追加  | ✅   | PersistedSession, PersistedMessage等追加 |
| 既存インターフェース変更     | ❌   | 既存インターフェースは変更なし           |
| 新規定数/設定値追加          | ✅   | DEFAULT_PERSISTENCE_CONFIG追加           |
| 外部連携インターフェース追加 | ✅   | session:persist:\* IPCチャンネル追加     |

**結論**: システム仕様書の更新が **必要**

---

## 2. 更新対象

| ファイル                | パス                                                 | 更新内容                       |
| ----------------------- | ---------------------------------------------------- | ------------------------------ |
| interfaces-agent-sdk.md | `.claude/skills/aiworkflow-requirements/references/` | セッション永続化セクション追加 |

---

## 3. 更新内容詳細

### 3.1 追加する型定義

#### PersistedSession

```typescript
interface PersistedSession {
  id: string; // UUID
  createdAt: number; // タイムスタンプ
  lastAccessedAt: number; // 最終アクセス日時
  isActive: boolean; // アクティブ状態
  messageCount: number; // メッセージ数
  title?: string; // セッションタイトル
}
```

#### PersistedMessage

```typescript
interface PersistedMessage {
  id: string; // UUID
  sessionId: string; // 所属セッションID
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
```

#### StorageStats

```typescript
interface StorageStats {
  totalSessions: number;
  totalMessages: number;
  usedSize: number; // bytes
  maxSize: number; // bytes
  usageRatio: number; // 0-1
}
```

#### CleanupResult

```typescript
interface CleanupResult {
  deletedSessions: number;
  deletedMessages: number;
  freedSize: number; // bytes
  deletedSessionIds: string[];
}
```

#### SessionPersistenceConfig

```typescript
interface SessionPersistenceConfig {
  maxSessions: number; // default: 100
  maxStorageSize: number; // default: 50MB
  maxMessagesPerSession: number; // default: 1000
  enableAutoBackup: boolean; // default: true
  backupRetentionCount: number; // default: 3
  lruWarningThreshold: number; // default: 0.9
}
```

#### IPCResponse<T>

```typescript
type IPCResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };
```

### 3.2 追加するIPCチャンネル

| チャンネル                     | 方向            | 説明               |
| ------------------------------ | --------------- | ------------------ |
| `session:persist:load`         | Renderer → Main | セッション一覧取得 |
| `session:persist:save`         | Renderer → Main | セッション保存     |
| `session:persist:delete`       | Renderer → Main | セッション削除     |
| `session:persist:update`       | Renderer → Main | セッション更新     |
| `session:persist:loadMessages` | Renderer → Main | メッセージ取得     |
| `session:persist:saveMessage`  | Renderer → Main | メッセージ保存     |
| `session:persist:clearAll`     | Renderer → Main | 全データ削除       |
| `session:persist:getStats`     | Renderer → Main | 統計情報取得       |
| `session:persist:cleanup`      | Renderer → Main | LRU削除実行        |

### 3.3 追加するエラーコード

| コード                | 説明                         |
| --------------------- | ---------------------------- |
| `VALIDATION_ERROR`    | 入力データバリデーション失敗 |
| `SESSION_NOT_FOUND`   | セッションが見つからない     |
| `STORAGE_READ_ERROR`  | ストレージ読み取りエラー     |
| `STORAGE_WRITE_ERROR` | ストレージ書き込みエラー     |
| `INTERNAL_ERROR`      | 予期しないエラー             |

### 3.4 追加する設定定数

| 定数                       | 値         | 説明                             |
| -------------------------- | ---------- | -------------------------------- |
| `DEFAULT_MAX_SESSIONS`     | `100`      | 最大セッション数                 |
| `DEFAULT_MAX_STORAGE_SIZE` | `52428800` | 最大ストレージサイズ (50MB)      |
| `DEFAULT_MAX_MESSAGES`     | `1000`     | セッションあたり最大メッセージ数 |
| `DEFAULT_LRU_THRESHOLD`    | `0.9`      | LRU警告閾値                      |

---

## 4. 更新履歴

| バージョン | 日付       | 変更内容                                 |
| ---------- | ---------- | ---------------------------------------- |
| 1.0.0      | 2026-01-17 | セッション永続化インターフェース初版追加 |

---

## 5. 関連ドキュメント

| ドキュメント      | パス                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------ |
| 実装ガイド        | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-12/implementation-guide.md` |
| Phase 2 設計      | `docs/30-workflows/agent-sdk-session-persistence/outputs/phase-2/`                         |
| 型定義ソース      | `packages/shared/src/types/agent.ts`                                                       |
| Zodスキーマソース | `packages/shared/src/agent/validation.ts`                                                  |
