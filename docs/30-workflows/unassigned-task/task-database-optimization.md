# データベーススキーマ最適化 - タスク指示書

## メタ情報

| 項目             | 内容                                     |
| ---------------- | ---------------------------------------- |
| タスクID         | DB-001                                   |
| タスク名         | チャット履歴データベーススキーマの最適化 |
| 分類             | パフォーマンス                           |
| 対象機能         | chat-history（データベース層）           |
| 優先度           | 高                                       |
| 見積もり規模     | 小規模（1週間）                          |
| ステータス       | 未実施                                   |
| 発見元           | Phase 7 - 最終レビューゲート             |
| 発見日           | 2024-12-23                               |
| 発見エージェント | @db-architect                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7の最終レビュー（@db-architect）で、チャット履歴データベーススキーマに**重大なパフォーマンス問題とデータ整合性リスク**が発見されました。

**検出された違反**:

- **Critical**: 2件（外部キーインデックス欠落、CASCADE動作未定義）
- **Major**: 1件（正規化違反 - messageCount冗長フィールド）

### 1.2 問題点・課題

#### C-04: 外部キーインデックス欠落

```typescript
// ❌ 問題: chat_messages.sessionId にインデックスなし
export const chatMessages = sqliteTable("chat_messages", {
  sessionId: text("session_id")
    .notNull()
    .references(() => chatSessions.id), // インデックス未定義
});
```

**影響**:

- **パフォーマンス劣化**: メッセージ取得クエリがフルテーブルスキャン（O(N)）
- **削除処理の低速化**: セッション削除時の整合性チェックがO(N)
- **データ量増加時に顕著**: 1万メッセージで数秒の遅延発生可能性

#### C-05: CASCADE動作未定義

```typescript
// ❌ 問題: onDelete未指定（SQLiteデフォルト動作に依存）
sessionId: text("session_id")
  .notNull()
  .references(() => chatSessions.id),  // onDelete未指定
```

**影響**:

- **データ整合性リスク**: 孤立メッセージ発生可能性
- **論理削除との矛盾**: 物理削除と論理削除（deletedAt）の整合性が不明確
- **動作の不透明性**: 削除時の挙動がSQLiteのデフォルト動作に依存

#### M-01: 正規化違反（messageCount）

```typescript
// ❌ 問題: 算出可能なフィールドを保存（3NF違反）
messageCount: integer("message_count").notNull().default(0),
```

**影響**:

- **更新異常リスク**: メッセージ追加/削除時の同期漏れ
- **データ不整合**: カウントと実際のメッセージ数の乖離
- **保守性低下**: トリガー等の複雑な同期機構が必要

### 1.3 放置した場合の影響

**技術的影響度**: Critical（パフォーマンス）

- **パフォーマンス劣化**: メッセージ数増加時に指数関数的に遅延
- **ユーザー体験悪化**: UI応答性の低下
- **スケーラビリティ不足**: 大量データ処理が困難
- **データ整合性リスク**: 孤立レコード、カウント不整合

**ビジネス影響**:

- ユーザーの離脱（レスポンス遅延）
- データ品質問題（不整合データ）
- サポートコスト増（データ修復対応）

---

## 2. 何を達成するか（What）

### 2.1 目的

データベーススキーマに適切なインデックス・制約を追加し、パフォーマンスとデータ整合性を向上させる。

### 2.2 最終ゴール

- ✅ 外部キーインデックスが追加されている
- ✅ CASCADE動作が明示的に定義されている
- ✅ CHECK制約が追加されている（role等）
- ✅ 論理削除対応の部分インデックスが追加されている
- ✅ messageCount削除が検討され、判断が記録されている
- ✅ クエリパフォーマンスが改善されている（ベンチマーク測定）
- ✅ データ整合性が保証されている
- ✅ 既存データが正常に動作している

### 2.3 スコープ

#### 含むもの

- 外部キーインデックス追加（`sessionId`）
- CASCADE動作定義（`onDelete: "restrict"`推奨）
- CHECK制約追加（`role` ENUM制約）
- 論理削除対応部分インデックス追加
- messageCount削除の影響評価とパフォーマンステスト
- マイグレーションスクリプト作成
- データベースベンチマーク測定

#### 含まないもの

- テーブル構造の大幅変更
- 新規テーブルの追加
- フルテキスト検索（FTS）導入
- レプリケーション設定

### 2.4 成果物

| 種別             | 成果物               | 配置先                                                                 |
| ---------------- | -------------------- | ---------------------------------------------------------------------- |
| マイグレーション | インデックス追加     | `packages/shared/drizzle/migrations/add-chat-indexes.sql`              |
| マイグレーション | CASCADE定義          | `packages/shared/drizzle/migrations/add-cascade-constraints.sql`       |
| マイグレーション | CHECK制約追加        | `packages/shared/drizzle/migrations/add-check-constraints.sql`         |
| テスト           | パフォーマンステスト | `packages/shared/src/db/__tests__/performance.test.ts`                 |
| ドキュメント     | DB最適化レポート     | `docs/30-workflows/chat-history-persistence/db-optimization-report.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 7: 最終レビューゲートが完了していること
- データベース設計レビューレポートが作成済み
- 既存データが存在する場合はバックアップを取得済み

### 3.2 依存タスク

- T-07-1: 最終レビューゲート（完了）

### 3.3 必要な知識・スキル

- SQLiteインデックス設計
- Drizzle ORM
- データベースマイグレーション
- パフォーマンスベンチマーク

### 3.4 推奨アプローチ

**段階的な最適化**:

1. **Phase 1**: 即座対応（インデックス追加）- パフォーマンス改善
2. **Phase 2**: 制約追加（CASCADE、CHECK）- データ整合性向上
3. **Phase 3**: 正規化検討（messageCount削除）- データ品質向上

**リスク管理**:

- 各マイグレーション前にバックアップ
- テストデータで先行検証
- ロールバックスクリプト準備

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（最適化要件、パフォーマンス基準）
Phase 1: 設計（インデックス設計、制約設計）
Phase 2: 設計レビューゲート
Phase 3: テスト作成（パフォーマンステスト）
Phase 4: 実装（マイグレーション実行）
  - Phase 4.1: インデックス追加
  - Phase 4.2: CASCADE定義
  - Phase 4.3: CHECK制約追加
  - Phase 4.4: messageCount削除（条件付き）
Phase 5: リファクタリング（不要）
Phase 6: 品質保証（パフォーマンス測定）
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 1: 設計

#### T-01-1: インデックス・制約設計

##### 目的

最適なインデックス設計とCASCADE戦略を決定する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-architecture database-optimization
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@db-architect`
- **選定理由**: データベース最適化の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                | 活用方法                   |
| ----------------------- | -------------------------- |
| indexing-strategies     | インデックス設計パターン   |
| foreign-key-constraints | CASCADE戦略決定            |
| query-optimization      | クエリパフォーマンス最適化 |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                                   | 内容                          |
| -------------- | ---------------------------------------------------------------------- | ----------------------------- |
| DB最適化設計書 | `docs/30-workflows/chat-history-persistence/design-db-optimization.md` | インデックス設計、CASCADE戦略 |

##### 完了条件

- [ ] 追加するインデックスが明確に定義されている
- [ ] CASCADE戦略が決定されている（restrict推奨）
- [ ] CHECK制約が設計されている
- [ ] パフォーマンス改善見込みが評価されている

##### 依存関係

- **前提**: T-00-1
- **後続**: T-02-1

---

### Phase 4: 実装（マイグレーション）

#### T-04-1: インデックス追加マイグレーション

##### 目的

外部キーと論理削除対応のインデックスを追加する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-migration add-indexes
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@dba-mgr`
- **選定理由**: マイグレーション実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 実行マイグレーション

```sql
-- 即座対応推奨
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
  ON chat_messages(session_id);

-- 複合インデックス（時系列検索用）
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created
  ON chat_messages(session_id, created_at, role);

-- 論理削除対応部分インデックス
CREATE INDEX IF NOT EXISTS idx_chat_messages_active
  ON chat_messages(session_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_active
  ON chat_sessions(created_at)
  WHERE deleted_at IS NULL;
```

##### 完了条件

- [ ] マイグレーションが実行されている
- [ ] インデックスが正しく作成されている
- [ ] クエリプランで Index Scan が確認できる

##### 依存関係

- **前提**: T-03-1
- **後続**: T-04-2

---

#### T-04-2: CASCADE制約追加マイグレーション

##### 目的

外部キー制約に `onDelete` 動作を明示する。

##### 実行マイグレーション

```sql
-- CASCADE動作定義（論理削除優先のため RESTRICT）
-- 注意: SQLiteでは既存外部キーの変更が困難
-- テーブル再作成またはアプリケーション層で制御

-- オプション1: アプリケーション層で制御（推奨）
-- ChatSessionRepository.softDelete()でトランザクション実装

-- オプション2: テーブル再作成（データマイグレーション必要）
-- 後日実施を検討
```

##### 完了条件

- [ ] CASCADE動作がドキュメント化されている
- [ ] アプリケーション層で適切に実装されている
- [ ] テストで整合性が確認されている

##### 依存関係

- **前提**: T-04-1
- **後続**: T-04-3

---

#### T-04-3: CHECK制約追加マイグレーション

##### 目的

データ品質を向上させるためのCHECK制約を追加する。

##### 実行マイグレーション

```sql
-- role列のENUM制約
-- ALTER TABLE chat_messages ADD CONSTRAINT chk_chat_messages_role
--   CHECK (role IN ('user', 'assistant', 'system'));

-- messageCount >= 0制約（削除しない場合）
-- ALTER TABLE chat_sessions ADD CONSTRAINT chk_chat_sessions_message_count
--   CHECK (message_count >= 0);

-- 注意: SQLiteのALTER TABLE制約は制限あり
-- 新規テーブル作成時に含める、またはアプリケーション層で検証
```

##### 完了条件

- [ ] CHECK制約が追加されている、またはアプリケーション層で実装されている
- [ ] 不正データの混入が防止されている

##### 依存関係

- **前提**: T-04-2
- **後続**: T-04-4

---

#### T-04-4: messageCount削除検討

##### 目的

messageCountの削除可否をパフォーマンステストで判断する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:benchmark database-query
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@sre-observer`
- **選定理由**: パフォーマンス測定・分析の専門家
- **参照**: `.claude/agents/agent_list.md`

##### パフォーマンステスト

```typescript
// ベンチマークテスト
describe("messageCount パフォーマンステスト", () => {
  it("現状（冗長フィールド）のクエリ性能", async () => {
    const start = performance.now();
    const sessions = await db.select().from(chatSessions).all();
    const end = performance.now();
    console.log(`冗長フィールド使用: ${end - start}ms`);
  });

  it("削除後（COUNT集計）のクエリ性能", async () => {
    const start = performance.now();
    const sessions = await db
      .select({
        session: chatSessions,
        messageCount: sql`COUNT(${chatMessages.id})`,
      })
      .from(chatSessions)
      .leftJoin(chatMessages, eq(chatMessages.sessionId, chatSessions.id))
      .groupBy(chatSessions.id)
      .all();
    const end = performance.now();
    console.log(`COUNT集計使用: ${end - start}ms`);
  });
});
```

##### 判断基準

- **削除**: パフォーマンス劣化<10%
- **保持**: パフォーマンス劣化>10%、ただし意図的非正規化として文書化

##### 完了条件

- [ ] パフォーマンステストが実施されている
- [ ] 削除可否が判断されている
- [ ] 判断根拠が文書化されている

##### 依存関係

- **前提**: T-04-3
- **後続**: T-06-1

---

### Phase 6: 品質保証

#### T-06-1: DB最適化の検証

##### 目的

最適化後のパフォーマンス改善と、データ整合性を検証する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
/ai:benchmark database-performance
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `@sre-observer`
- **選定理由**: パフォーマンス監視・分析の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                 | 活用方法                     |
| ------------------------ | ---------------------------- |
| query-performance-tuning | クエリチューニング検証       |
| database-monitoring      | パフォーマンスメトリクス収集 |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物         | パス                                                                   | 内容                   |
| -------------- | ---------------------------------------------------------------------- | ---------------------- |
| 最適化レポート | `docs/30-workflows/chat-history-persistence/db-optimization-report.md` | パフォーマンス改善結果 |

##### 完了条件

- [ ] すべてのテストが成功している
- [ ] クエリパフォーマンスが改善されている（ベンチマーク比較）
- [ ] データ整合性が保証されている
- [ ] 孤立レコードが存在しない

##### 依存関係

- **前提**: T-04-4
- **後続**: T-07-1

---

### Phase 7-9: 最終レビュー～ドキュメント更新

各フェーズは標準的な流れに従います。

---

## 5. 完了条件チェックリスト

### パフォーマンス要件

- [ ] 外部キーインデックスが追加されている
- [ ] メッセージ取得クエリがIndex Scanを使用している
- [ ] パフォーマンスが改善されている（ベンチマーク測定）

### データ整合性要件

- [ ] CASCADE動作が定義されている
- [ ] CHECK制約が追加されている
- [ ] 孤立レコードが存在しない

### 品質要件

- [ ] 全テスト成功
- [ ] マイグレーション成功
- [ ] ロールバック可能

### ドキュメント要件

- [ ] DB最適化レポートが作成されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### インデックス確認

```sql
-- インデックス一覧確認
SELECT name, sql FROM sqlite_master
WHERE type='index' AND tbl_name IN ('chat_sessions', 'chat_messages');

-- クエリプラン確認
EXPLAIN QUERY PLAN
SELECT * FROM chat_messages WHERE session_id = 'test-id';
```

期待結果: `SEARCH TABLE chat_messages USING INDEX idx_chat_messages_session_id (session_id=?)`

### パフォーマンスベンチマーク

```bash
pnpm --filter @repo/shared test:benchmark db-performance
```

### データ整合性確認

```sql
-- 孤立メッセージ検出
SELECT COUNT(*) FROM chat_messages
WHERE session_id NOT IN (SELECT id FROM chat_sessions);

-- 期待結果: 0
```

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                     |
| ---------------------------------------- | ------ | -------- | ---------------------------------------- |
| マイグレーション失敗                     | 高     | 低       | 自動バックアップ、ロールバックスクリプト |
| 既存データ破損                           | 高     | 低       | テスト環境で先行検証                     |
| パフォーマンス劣化（messageCount削除時） | 中     | 中       | ベンチマーク測定、判断基準設定           |
| インデックス肥大化                       | 低     | 中       | 定期的なVACUUM実行                       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/final-review-report.md` - 最終レビューレポート
- `.claude/agents/db-architect.md` - DB設計エージェント
- `.claude/skills/indexing-strategies/SKILL.md` - インデックス戦略
- `.claude/skills/foreign-key-constraints/SKILL.md` - 外部キー制約
- `.claude/skills/query-optimization/SKILL.md` - クエリ最適化

### 参考資料

- [SQLite Index Documentation](https://www.sqlite.org/queryplanner.html)
- [Drizzle ORM Indexes](https://orm.drizzle.team/docs/indexes-constraints)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)

---

## 9. 備考

### レビュー指摘の原文

```
### Critical違反（2件）
- C-04: 外部キーインデックス欠落
- C-05: CASCADE動作未定義

### Major違反（1件）
- M-01: 正規化違反（messageCount冗長フィールド）

**推奨対応**:
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_active ON chat_messages(session_id) WHERE deleted_at IS NULL;

ALTER TABLE chat_messages ADD CONSTRAINT fk_session
  FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE RESTRICT;
```

### 補足事項

**即座対応を推奨する理由**:

- パフォーマンス影響が大きい（メッセージ数増加で顕著）
- マイグレーション実装が比較的簡単
- リスクが低い（インデックス追加のみ）

**messageCount削除の判断基準**:

- COUNT集計のパフォーマンス劣化が10%以内: 削除推奨
- COUNT集計のパフォーマンス劣化が10%超: 保持して意図的非正規化として文書化
