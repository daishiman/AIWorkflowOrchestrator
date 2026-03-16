# Phase 2 成果物: 設計検証記録

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスク ID  | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| Phase      | 2 - 設計                                       |
| 成果物種別 | 設計検証記録                                   |
| 作成日     | 2026-03-16                                     |
| ステータス | 完了                                           |
| 依存成果物 | `outputs/phase-1/requirements-verification.md` |

---

## 1. DB 初期化設計

### 1-1. ファイルパス解決

- `homeDir` は `apps/desktop/src/main/ipc/index.ts` L645 で参照済み（Section 8 内で定義）
- DB ファイルパス: `path.join(homeDir, ".claude", "conversations.db")`
- `homeDir` の定義箇所: L645（Section 8 内）— Section 13 挿入時点では既に利用可能であることを確認済み

### 1-2. DB 初期化フロー

```
try {
  1. better-sqlite3 の Database インスタンスを生成
  2. WAL モードを有効化: db.pragma("journal_mode = WAL")
  3. CONVERSATION_DB_SCHEMA を実行（DDL）
  4. ConversationRepository(db) を生成
  5. registerConversationHandlers(repository) で7チャンネル登録
} catch (error) {
  registerConversationFallbackHandlers() で7チャンネル × DB_NOT_AVAILABLE
}
```

### 1-3. CONVERSATION_DB_SCHEMA 定義

対象テーブルとインデックス:

| オブジェクト    | 種別     | 内容                               |
| --------------- | -------- | ---------------------------------- |
| `chat_sessions` | テーブル | セッション管理                     |
| `chat_messages` | テーブル | メッセージ管理                     |
| インデックス1   | INDEX    | chat_sessions に対するインデックス |
| インデックス2   | INDEX    | chat_sessions に対するインデックス |
| インデックス3   | INDEX    | chat_messages に対するインデックス |
| インデックス4   | INDEX    | chat_messages に対するインデックス |

計4件のインデックスを含む DDL を `db.exec()` で一括実行する。

---

## 2. Section 13 挿入位置設計

### 2-1. 挿入箇所

`apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` 内:

```
... (Section 12: Chat Edit)
// L853-867: Section 12 の処理

// ===== Section 13: Conversation (新規挿入) =====
// DB 初期化 → ハンドラ登録 or フォールバック登録

// L869: サマリーログ（既存）
logger.info(`Registered ${track.count} IPC handlers`);
```

- 挿入位置: Section 12（L853-867）の直後、サマリーログ（L869）の直前
- サマリーログの `track.count` に Section 13 登録数が含まれるよう、ログ出力の前に登録を完了させる

### 2-2. Section 番号の整合性

既存の Section 1-12 に続けて Section 13 として追加する。既存セクションのコードには一切変更を加えない。

---

## 3. ハンドラ登録パターン設計

### 3-1. safeRegister + track パターン

```typescript
// 正常系: DB 初期化成功
function registerConversationHandlers(
  repository: ConversationRepository,
): void {
  safeRegister(IPC_CHANNELS.CONVERSATION_CREATE_SESSION, async (_, args) => {
    // ... P42準拠バリデーション + 処理
  });
  track();
  // ... 残り6チャンネル同様
}
```

- `safeRegister` を使用する理由: void 戻り値のハンドラのみ（P54 適合確認済み）
- `track()` で登録数をカウントし、サマリーログに反映させる

### 3-2. P54 適合確認

P54の教訓:「`safeRegister` は戻り値を破棄するため、unsubscribe 関数をキャプチャする必要があるハンドラには使えない」

- `conversationHandlers.ts` の全7ハンドラは戻り値なし（void）であることを確認済み
- `setupThemeWatcher` のような unsubscribe 関数を返すハンドラは含まれない
- よって `safeRegister` パターンが適合する

### 3-3. フォールバックハンドラ設計

```typescript
function registerConversationFallbackHandlers(): void {
  const CONVERSATION_CHANNELS = [
    IPC_CHANNELS.CONVERSATION_CREATE_SESSION,
    IPC_CHANNELS.CONVERSATION_GET_SESSION,
    IPC_CHANNELS.CONVERSATION_LIST_SESSIONS,
    IPC_CHANNELS.CONVERSATION_UPDATE_SESSION,
    IPC_CHANNELS.CONVERSATION_DELETE_SESSION,
    IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
    IPC_CHANNELS.CONVERSATION_GET_MESSAGES,
  ];

  for (const channel of CONVERSATION_CHANNELS) {
    safeRegister(channel, async () => {
      return {
        success: false,
        error: {
          code: "DB_NOT_AVAILABLE",
          message: "Conversation database is not available",
        },
      };
    });
    track();
  }
}
```

- 全7チャンネルに対して `DB_NOT_AVAILABLE` エラーを返す
- S30（Graceful Degradation）パターン準拠
- アプリがクラッシュせず、エラーを Renderer に伝達する

---

## 4. import 追加設計

`apps/desktop/src/main/ipc/index.ts` に追加するインポート:

```typescript
import Database from "better-sqlite3";
import { registerConversationHandlers } from "./handlers/conversationHandlers";
import { ConversationRepository } from "../repositories/ConversationRepository";
```

### 循環依存チェック

- `conversationHandlers.ts` → `ConversationRepository` → `better-sqlite3`（外部ライブラリ）
- `ipc/index.ts` → `handlers/conversationHandlers.ts`（一方向）
- `ipc/index.ts` → `repositories/ConversationRepository`（一方向）
- 循環依存なし（確認済み）

---

## 5. 設計全体サマリー

| 設計項目               | 設計内容                                                             | 確認状態             |
| ---------------------- | -------------------------------------------------------------------- | -------------------- |
| DB ファイルパス        | `path.join(homeDir, ".claude", "conversations.db")`                  | 確認済み（L645参照） |
| Section 13 挿入位置    | Section 12直後、サマリーログ直前                                     | 確認済み             |
| ハンドラ登録パターン   | `safeRegister` + `track`                                             | P54適合確認済み      |
| フォールバックハンドラ | 7チャンネル × `DB_NOT_AVAILABLE`                                     | S30準拠確認済み      |
| DB スキーマ            | `chat_sessions` + `chat_messages` + インデックス4件                  | 確認済み             |
| import 追加            | `Database`, `registerConversationHandlers`, `ConversationRepository` | 循環依存なし確認済み |

---

## 6. 参照資料

- `apps/desktop/src/main/ipc/index.ts` - 修正対象ファイル（L645, L853-869）
- `apps/desktop/src/main/ipc/handlers/conversationHandlers.ts` - 既実装ハンドラ
- `apps/desktop/src/main/ipc/channels.ts` - CONVERSATION\_\* チャンネル定数（L276-282）
- `/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.claude/rules/06-known-pitfalls.md` - P54, P55 参照
- `outputs/phase-1/requirements-verification.md` - 要件定義（FR-01〜FR-04, AC-01〜AC-08）
