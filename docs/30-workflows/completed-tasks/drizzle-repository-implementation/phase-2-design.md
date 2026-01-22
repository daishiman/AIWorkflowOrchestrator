# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| Phase名    | 設計                              |
| 前提Phase  | Phase 1                           |
| 後続Phase  | Phase 3                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | drizzle-repository-implementation |

---

## 目的

Phase 1で確定した要件に基づき、Drizzle ORMベースのリポジトリクラスの詳細設計を行う。

## 背景

Clean Architecture準拠のリポジトリインターフェースに対して、Drizzle ORMを使用した具体実装のクラス設計・メソッド仕様を策定する。既存のMapper、DBスキーマ、Result型を活用した設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: DrizzleChatSessionRepository クラス設計

**目的**: セッションリポジトリの詳細クラス設計を行う

**実行手順**:

1. クラス構造を設計:
   ```typescript
   export class DrizzleChatSessionRepository implements IChatSessionRepository {
     constructor(private readonly db: DrizzleDB) {}
   }
   ```
2. 各メソッドの実装方針を策定:
   - `findById`: `db.query.chatSessions.findFirst()` を使用
   - `findByUserId`: `db.query.chatSessions.findMany()` を使用
   - `findPinned`: `db.query.chatSessions.findMany()` + `where` + `orderBy`
   - `search`: FTS5仮想テーブル `chat_sessions_fts` を使用
   - `save`: `db.insert().onConflictDoUpdate()` を使用（upsert）
   - `delete`: `db.delete()` を使用
   - `exists`: `db.query.chatSessions.findFirst()` で存在確認
   - `countPinned`: `db.select({ count: count() })` を使用
3. エラーハンドリング方針を策定（try-catch + Result型）

**期待される成果物**:

- `outputs/phase-2/drizzle-chat-session-repository-design.md`: クラス設計書

---

### タスク2: DrizzleChatMessageRepository クラス設計

**目的**: メッセージリポジトリの詳細クラス設計を行う

**実行手順**:

1. クラス構造を設計:
   ```typescript
   export class DrizzleChatMessageRepository implements IChatMessageRepository {
     constructor(private readonly db: DrizzleDB) {}
   }
   ```
2. 各メソッドの実装方針を策定:
   - `findById`: `db.query.chatMessages.findFirst()` を使用
   - `findBySessionId`: `db.query.chatMessages.findMany()` + `orderBy(messageIndex)`
   - `findLatestBySessionId`: `db.query.chatMessages.findFirst()` + `orderBy(desc)`
   - `countBySessionId`: `db.select({ count: count() })` を使用
   - `save`: `db.insert().onConflictDoUpdate()` を使用（upsert）
   - `saveMany`: `db.insert().values([...])` を使用（バッチ挿入）
   - `delete`: `db.delete()` を使用
   - `deleteBySessionId`: `db.delete().where(eq(sessionId))` を使用
3. エラーハンドリング方針を策定

**期待される成果物**:

- `outputs/phase-2/drizzle-chat-message-repository-design.md`: クラス設計書

---

### タスク3: Drizzle クエリパターン設計

**目的**: 各メソッドで使用するDrizzle ORMクエリパターンを設計する

**実行手順**:

1. Select クエリパターンを設計:

   ```typescript
   // findById
   const result = await this.db.query.chatSessions.findFirst({
     where: eq(chatSessions.id, id.value),
   });

   // findMany with pagination
   const results = await this.db.query.chatSessions.findMany({
     where: eq(chatSessions.userId, userId.value),
     limit: limit,
     offset: offset,
     orderBy: [desc(chatSessions.updatedAt)],
   });
   ```

2. Insert/Update クエリパターンを設計:
   ```typescript
   // upsert
   await this.db
     .insert(chatSessions)
     .values(record)
     .onConflictDoUpdate({
       target: chatSessions.id,
       set: { ...record, id: undefined },
     });
   ```
3. Delete クエリパターンを設計
4. FTS5 全文検索クエリパターンを設計:
   ```typescript
   // FTS5 search
   const ftsResults = await this.db.all(
     sql`SELECT * FROM chat_sessions_fts WHERE chat_sessions_fts MATCH ${keyword}`,
   );
   ```

**期待される成果物**:

- `outputs/phase-2/drizzle-query-patterns.md`: クエリパターン設計書

---

### タスク4: エラーハンドリング設計

**目的**: Repository層のエラーハンドリング方針を設計する

**実行手順**:

1. エラー種別を定義:
   - `RepositoryError`: 基底エラークラス
   - `NotFoundError`: レコード未存在
   - `DuplicateError`: 重複エラー
   - `ConnectionError`: DB接続エラー
   - `QueryError`: クエリ実行エラー
2. Result型を使用したエラーハンドリングパターンを設計:
   ```typescript
   async save(session: ChatSession): Promise<void> {
     try {
       const record = ChatSessionMapper.toPersistence(session);
       await this.db.insert(chatSessions).values(record).onConflictDoUpdate({...});
     } catch (error) {
       throw new RepositoryError('Failed to save session', { cause: error });
     }
   }
   ```
3. 既存エラー体系との整合性を確認

**期待される成果物**:

- `outputs/phase-2/error-handling-design.md`: エラーハンドリング設計書

---

### タスク5: テスト戦略設計

**目的**: Repository実装のテスト戦略を設計する

**実行手順**:

1. テスト環境を設計:
   - インメモリSQLite（`:memory:`）を使用
   - テスト用DBセットアップ・クリーンアップ手順
2. テストカテゴリを定義:
   - 正常系テスト（各メソッドの基本動作）
   - 異常系テスト（存在しないID、重複挿入等）
   - 境界値テスト（空配列、大量データ等）
   - FTS5テスト（全文検索の動作確認）
3. モック戦略を設計:
   - 実DBテスト（インメモリSQLite）
   - DBエラーシミュレーション

**期待される成果物**:

- `outputs/phase-2/test-strategy.md`: テスト戦略設計書

---

### タスク6: 設計ドキュメント統合

**目的**: 全設計ドキュメントを統合した詳細設計書を作成する

**実行手順**:

1. 上記タスク1〜5の成果物を統合
2. クラス図を作成（Mermaid形式）
3. シーケンス図を作成（主要フローのみ）
4. 設計判断の根拠を記録

**期待される成果物**:

- `outputs/phase-2/detailed-design.md`: 詳細設計書（統合版）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | Repository IF定義      |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`            | エラー設計パターン     |

### Phase 1成果物

| 参照資料             | パス                                             | 内容             |
| -------------------- | ------------------------------------------------ | ---------------- |
| インターフェース分析 | `outputs/phase-1/interface-analysis.md`          | IF全メソッド一覧 |
| スキーマ対応表       | `outputs/phase-1/schema-entity-mapping.md`       | DB-Entity対応    |
| 機能要件             | `outputs/phase-1/functional-requirements.md`     | 機能要件一覧     |
| 非機能要件           | `outputs/phase-1/non-functional-requirements.md` | 品質要件一覧     |

---

## 成果物

| 成果物                   | パス                                                        | 内容                  |
| ------------------------ | ----------------------------------------------------------- | --------------------- |
| Session Repository設計書 | `outputs/phase-2/drizzle-chat-session-repository-design.md` | クラス設計            |
| Message Repository設計書 | `outputs/phase-2/drizzle-chat-message-repository-design.md` | クラス設計            |
| クエリパターン設計書     | `outputs/phase-2/drizzle-query-patterns.md`                 | Drizzleクエリパターン |
| エラーハンドリング設計書 | `outputs/phase-2/error-handling-design.md`                  | エラー設計            |
| テスト戦略設計書         | `outputs/phase-2/test-strategy.md`                          | テスト方針            |
| 詳細設計書（統合版）     | `outputs/phase-2/detailed-design.md`                        | 設計統合ドキュメント  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2での統合テスト連携アクション**:

- Repository-DB間インターフェースを設計に反映
- Drizzle API使用パターンを設計に反映
- DB接続・クエリエラーのハンドリングを設計に反映
- テスト環境（インメモリSQLite）のセットアップ手順を設計

---

## 完了条件

- [ ] DrizzleChatSessionRepository の全メソッド（7メソッド）の実装方針が策定されている
- [ ] DrizzleChatMessageRepository の全メソッド（8メソッド）の実装方針が策定されている
- [ ] 各クエリパターン（Select/Insert/Update/Delete/FTS5）が設計されている
- [ ] エラーハンドリング方針が既存エラー体系と整合している
- [ ] テスト戦略（テスト環境、テストカテゴリ、モック戦略）が設計されている
- [ ] 詳細設計書（統合版）が作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（6タスク）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認（6ファイル）

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/drizzle-repository-implementation/phase-3-design-review.md`
