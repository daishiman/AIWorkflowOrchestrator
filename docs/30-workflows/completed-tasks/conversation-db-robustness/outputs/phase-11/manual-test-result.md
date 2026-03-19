# Phase 11 手動テスト結果

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスク   | conversation-db-robustness            |
| フェーズ | Phase 11 - 手動テスト                 |
| 実施日   | 2026-03-19                            |
| 実施環境 | CLI 環境（Electron 実画面テスト不可） |
| 代替手法 | 自動テスト実行 + コード静的検査       |

---

## TC-11-01: 初回起動（DB 未作成）シナリオ検証

### 自動テスト結果

```
 ✓ initializeConversationDatabase > initialize() で DB ファイルが自動作成される
 Test Files  1 passed (1)
     Tests  1 passed | 19 skipped (20)
  Duration  2.79s
```

**判定: PASS**

### コード静的検査

対象: `apps/desktop/src/main/database/conversationDatabase.ts`

| 検査ポイント         | 確認内容                                                                    | 結果 |
| -------------------- | --------------------------------------------------------------------------- | ---- |
| ディレクトリ自動作成 | L124: `fs.mkdirSync(dir, { recursive: true })` が存在する                   | OK   |
| DB ファイル自動作成  | L127: `new Database(resolvedDbPath)` が実行される                           | OK   |
| デフォルトパス       | L119-120: `app.getPath("userData") + "/conversations.db"` を使用            | OK   |
| WAL モード有効化     | L131-133: `instance.pragma("journal_mode = WAL")` が既定で適用              | OK   |
| スキーマ DDL 適用    | L140: `instance.exec(CONVERSATION_DB_SCHEMA)` で CREATE TABLE IF NOT EXISTS | OK   |

**判定: PASS**

---

## TC-11-02: 既存 DB がある状態での再起動

### 自動テスト結果

```
 ✓ ConversationDatabase - エラー > 二重初期化は既存インスタンスを返す
 Test Files  1 passed (1)
     Tests  1 passed | 19 skipped (20)
  Duration  7.67s
```

**判定: PASS**

### コード静的検査

対象: `conversationDatabase.ts`

| 検査ポイント         | 確認内容                                                                                 | 結果 |
| -------------------- | ---------------------------------------------------------------------------------------- | ---- |
| 冪等性ガード         | L95-97: `if (db !== null) { return db; }` で既存インスタンスを返す                       | OK   |
| スキーマ再適用安全性 | `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` のため二重実行でもエラーなし | OK   |

**判定: PASS**

---

## TC-11-03: アプリ終了・再起動

### 自動テスト結果

```
 ✓ ConversationDatabase - ライフサイクル > closeConversationDatabase() で DB が安全にクローズされる
 ✓ ConversationDatabase - ライフサイクル > close() 後に isConversationDatabaseInitialized() が false を返す
 ✓ ConversationDatabase - ライフサイクル > close() 後に getConversationDatabase() がエラーを投げる
 ✓ ConversationDatabase - エッジケース > close() 後の再初期化が正常動作する
 Test Files  1 passed (1)
     Tests  4 passed | 16 skipped (20)
  Duration  1.95s
```

**判定: PASS**

### コード静的検査

対象: `main/index.ts`

| 検査ポイント         | 確認内容                                                                                 | 結果 |
| -------------------- | ---------------------------------------------------------------------------------------- | ---- |
| will-quit フック     | L312-314: `app.on("will-quit", () => closeConversationDatabase())` が登録されている      | OK   |
| WAL チェックポイント | `closeConversationDatabase()` 内で `wal_checkpoint(TRUNCATE)` を実行後 `db.close()`      | OK   |
| null リセット        | クローズ後 `db = null` にセットされ状態をリセット                                        | OK   |
| 再初期化可否         | close 後に `initializeConversationDatabase()` を再度呼ぶと新しいインスタンスが生成される | OK   |

**判定: PASS**

---

## TC-11-04: ターミナルログ確認

### コード静的検査

対象: `main/ipc/index.ts`

| 検査ポイント              | 確認内容                                                                                                        | 結果 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- | ---- |
| safeRegister 成功時のログ | `safeRegister()` は成功時に console 出力なし（L501-516）                                                        | OK   |
| DB 初期化失敗時のログ     | `main/index.ts` L287: `console.error("[DB] Failed to initialize conversation database:", error)` のみ           | OK   |
| フォールバックハンドラ    | DB 初期化失敗時は `registerConversationFallbackHandlers()` が登録され、各チャンネルが `DB_NOT_AVAILABLE` を返す | OK   |
| サマリーログ              | L937-941: 失敗件数が0件より大きい場合のみ `console.error` でサマリーを出力                                      | OK   |

**判定: PASS**

---

## TC-11-05: activate イベント後の DB 再利用

### 自動テスト結果

```
 ✓ ConversationDatabase - エッジケース > getConversationDatabase() が同一インスタンスを返す（activate再利用テスト）
 Test Files  1 passed (1)
     Tests  1 passed | 19 skipped (20)
  Duration  2.70s
```

**判定: PASS**

### コード静的検査

対象: `main/index.ts`

| 検査ポイント          | 確認内容                                                                                                      | 結果 |
| --------------------- | ------------------------------------------------------------------------------------------------------------- | ---- |
| activate イベント登録 | L293-303: `app.on("activate", ...)` が `app.whenReady()` 内で登録されている                                   | OK   |
| DB 再利用ロジック     | L297-300: `isConversationDatabaseInitialized()` で確認後 `getConversationDatabase()` で既存インスタンスを取得 | OK   |
| 再初期化不要          | activate 時に `initializeConversationDatabase()` を再度呼ばない                                               | OK   |
| IPC ハンドラ再登録    | `unregisterAllIpcHandlers()` の後 `registerAllIpcHandlers(mainWindowRef, existingDb)` で再登録                | OK   |

**判定: PASS**

---

## テストケース総合結果

| テストケース                      | 方法                    | 結果 |
| --------------------------------- | ----------------------- | ---- |
| TC-11-01: 初回起動（DB 未作成）   | 自動テスト + コード検査 | PASS |
| TC-11-02: 既存 DB がある状態      | 自動テスト + コード検査 | PASS |
| TC-11-03: アプリ終了・再起動      | 自動テスト + コード検査 | PASS |
| TC-11-04: ターミナルログ確認      | コード検査              | PASS |
| TC-11-05: activate 後の DB 再利用 | 自動テスト + コード検査 | PASS |

**全 5 件 PASS / 0 件 FAIL**

---

## 補足: CLI 環境での制約

CLI 環境のため Electron アプリの実画面を直接操作することはできない。
代替として以下を実施した:

- 各シナリオに対応する自動テスト（Vitest）を実行し、PASS を確認
- `conversationDatabase.ts` / `main/index.ts` / `ipc/index.ts` のコードを静的に検査し、実装の正確性を確認

P53（CLI 環境でのスクリーンショット取得制約）に準じた対応である。
