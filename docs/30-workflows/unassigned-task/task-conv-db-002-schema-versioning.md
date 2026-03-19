# UT-CONV-DB-002: Conversation DB スキーマバージョニング - タスク指示書

## メタ情報

```yaml
issue_number: 1341
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-CONV-DB-002                                                 |
| タスク名     | Conversation DB スキーマバージョニング（マイグレーション機構） |
| 分類         | 機能追加                                                       |
| 対象機能     | Conversation DB                                                |
| 優先度       | MEDIUM                                                         |
| 見積もり規模 | Medium (Phase 1-13標準)                                        |
| ステータス   | unassigned                                                     |
| 発見元       | Phase 12（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001）            |
| 発見日       | 2026-03-19                                                     |
| 親タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 で `conversationDatabase.ts` に Factory 関数パターンを導入し、`CONVERSATION_DB_SCHEMA` による DDL 実行（`CREATE TABLE IF NOT EXISTS`）でスキーマを作成している。しかし、スキーマのバージョン管理（マイグレーション）機構が存在しない。

### 1.2 問題点・課題

- `CREATE TABLE IF NOT EXISTS` はテーブル構造の変更（カラム追加・型変更・インデックス追加）に対応できない
- 将来の機能追加（メッセージの添付ファイル拡張、検索用FTS5テーブル等）でスキーマ変更が必要になった際、既存ユーザーの DB が自動更新されない
- 手動での `ALTER TABLE` は実行漏れやバージョン不整合のリスク

### 1.3 放置した場合の影響

- スキーマ変更時にユーザーがDBを手動削除する必要が生じる
- データ損失リスク

### 苦戦箇所の教訓（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 より）

- CONVERSATION_DB_SCHEMA を `ipc/index.ts` から `conversationDatabase.ts` に移動する際、後方互換パスにも旧スキーマが参照されていた。スキーマ定義が1箇所に集約されていないと、バージョン管理がさらに困難になる
- WAL モードでの pragma 設定はスキーマ変更前に実行する必要がある（トランザクション内でpragma変更不可）
- `will-quit` での DB クローズは、マイグレーション中のアプリ終了でデータ破損リスクがある。マイグレーションはトランザクション内で実行し、`will-quit` のクローズ処理と競合しないよう設計が必要

## 2. 何を達成するか（What）

### 2.1 目的

Conversation DB にスキーマバージョン管理（マイグレーション）機構を導入し、将来のスキーマ変更を安全に自動適用できるようにする。

### 2.2 最終ゴール

- `user_version` pragma でスキーマバージョンを管理
- マイグレーション関数群（up）でバージョン間の差分を適用
- アプリ起動時に自動マイグレーション実行

### 2.3 スコープ

含むもの:

- `user_version` pragma によるバージョン管理
- マイグレーション関数の設計・実装
- `initializeConversationDatabase()` 内でのマイグレーション自動実行
- マイグレーションテスト

含まないもの:

- FTS5 検索テーブルの追加（別タスク: task-chat-history-fts5-search.md）
- ベクトル類似検索の追加（別タスク: task-CONV-08-01-01）

### 2.4 成果物

- マイグレーション機構の設計・実装
- マイグレーションテスト
- Phase 1-13 仕様書一式

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 完了（conversationDatabase.ts の Factory 関数パターンが前提）

### 3.2 依存タスク

- TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001（完了済み）

### 3.3 必要な知識・スキル

- SQLite PRAGMA user_version
- better-sqlite3 の transaction API
- Factory 関数パターン（S32: DB Factory + ライフサイクル管理）

### 3.4 推奨アプローチ

```typescript
// user_version でバージョン管理
const currentVersion = db.pragma("user_version", { simple: true }) as number;

// マイグレーション定義
interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  {
    version: 1,
    description: "初期スキーマ",
    up: (db) => {
      db.exec(CONVERSATION_DB_SCHEMA);
    },
  },
  {
    version: 2,
    description: "将来のカラム追加",
    up: (db) => {
      /* ALTER TABLE ... */
    },
  },
];

// 未適用マイグレーションを順次実行
for (const migration of migrations.filter((m) => m.version > currentVersion)) {
  db.transaction(() => {
    migration.up(db);
    db.pragma(`user_version = ${migration.version}`);
  })();
}
```

## 4. 実行手順

標準 Phase 1-13 で実行。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `user_version` pragma でバージョン管理が実装されている
- [ ] マイグレーション関数が定義可能
- [ ] アプリ起動時に自動マイグレーションが実行される
- [ ] 既存 DB（バージョン 0）からの自動マイグレーションが動作する
- [ ] マイグレーション失敗時のロールバックが実装されている

### 品質要件

- [ ] 既存85件テストに影響がない
- [ ] マイグレーションテストが追加されている
- [ ] Line Coverage 80%以上

### ドキュメント要件

- [ ] Phase 12 で仕様書が更新されている

## 6. 検証方法

| テストケース         | 手順               | 期待結果                       |
| -------------------- | ------------------ | ------------------------------ |
| 空DB → v1            | 新規DBで起動       | v1スキーマが適用される         |
| v1 → v2              | v1 DBで起動        | v2マイグレーションが適用される |
| v2（最新）           | v2 DBで起動        | マイグレーションスキップ       |
| マイグレーション失敗 | v1→v2 途中でエラー | ロールバックされv1のまま       |

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                    |
| ---------------------------------- | ------ | -------- | ------------------------------------------------------- |
| マイグレーション失敗でデータ破損   | 高     | 低       | トランザクション内で実行、失敗時ロールバック            |
| will-quit とマイグレーションの競合 | 中     | 低       | マイグレーション完了フラグで will-quit のクローズを制御 |
| version 管理が形骸化               | 中     | 中       | スキーマ変更時にversion更新を必須ルール化               |

## 8. 参照情報

| 資料                             | パス                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| DB 実装パターン                  | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`                                           |
| S32 DB Factory パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-fallback-validation.md` |
| Conversation DB Factory          | `apps/desktop/src/main/database/conversationDatabase.ts`                                                                      |
| 親タスク仕様                     | `docs/30-workflows/conversation-db-robustness/index.md`                                                                       |
| 教訓（will-quit vs before-quit） | `.claude/skills/aiworkflow-requirements/references/lessons-learned-conversation-db-robustness.md`                             |

## 9. 備考

- 本タスクは TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 のスコープ外として Phase 12 で検出
- SQLite の `user_version` pragma は整数値（0〜2147483647）で、アプリケーション定義のバージョン番号として使用可能
- 現行の `CONVERSATION_DB_SCHEMA` は全て `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` で冪等であり、version 1 としてそのまま使用可能
