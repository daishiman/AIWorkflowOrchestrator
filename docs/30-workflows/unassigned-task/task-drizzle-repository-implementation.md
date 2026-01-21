# Drizzle Repository実装 - タスク指示書

## メタ情報

```yaml
issue_number: 400
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | UT-005                                     |
| タスク名     | Drizzle ORM Repository実装                 |
| 分類         | リファクタリング                           |
| 対象機能     | チャット履歴機能（chat-history）           |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（ドキュメント更新・未タスク検出） |
| 発見日       | 2026-01-19                                 |
| 関連タスク   | ARCH-001 Clean Architecture Refactoring    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ARCH-001 Clean Architectureリファクタリングにて、チャット履歴機能のDomain/Application/Infrastructure各層の設計・実装が完了した。現在、テスト用としてInMemoryRepositoryが実装されているが、本番環境で使用するDrizzle ORMベースのリポジトリは未実装である。

Clean Architecture設計により、Repository PatternとDependency Inversion Principleが適用されているため、InMemoryからDrizzleへの置換は既存のインターフェースに沿って実装するだけで完了する。

### 1.2 問題点・課題

- 本番環境ではSQLiteデータベースによる永続化が必要
- InMemoryRepositoryはテスト用であり、アプリ再起動でデータが消失する
- UI統合時にDrizzle Repositoryが必要となる

### 1.3 放置した場合の影響

- UI統合タスクがブロックされる
- チャット履歴機能がデスクトップアプリで使用できない
- 新アーキテクチャへの移行が完了しない

---

## 2. 何を達成するか（What）

### 2.1 目的

Clean Architectureで定義されたリポジトリインターフェース（`IChatSessionRepository`, `IChatMessageRepository`）を、Drizzle ORMを使用して実装する。

### 2.2 最終ゴール

- `DrizzleChatSessionRepository`クラスの実装完了
- `DrizzleChatMessageRepository`クラスの実装完了
- 既存のDBスキーマ（`packages/shared/src/db/schema/chat-history.ts`）との統合
- 全ユニットテストのパス（カバレッジ≥80%）
- 型エラー・Lintエラー0件

### 2.3 スコープ

#### 含むもの

- `DrizzleChatSessionRepository`の実装
- `DrizzleChatMessageRepository`の実装
- Mapperの拡張（必要に応じて）
- ユニットテスト作成
- 既存InMemoryテストとの互換性確認

#### 含まないもの

- UI統合（別タスク）
- React Context DI実装（別タスク: UT-006）
- フィーチャーフラグ実装
- マイグレーションスクリプト（既存スキーマを使用）

### 2.4 成果物

| 成果物                               | 配置先                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------- |
| DrizzleChatSessionRepository.ts      | `packages/shared/src/features/chat-history/infrastructure/persistence/`           |
| DrizzleChatMessageRepository.ts      | `packages/shared/src/features/chat-history/infrastructure/persistence/`           |
| DrizzleChatSessionRepository.test.ts | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/` |
| DrizzleChatMessageRepository.test.ts | `packages/shared/src/features/chat-history/infrastructure/persistence/__tests__/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- ARCH-001のPhase 1-12が完了していること
- 以下のインターフェースが定義済みであること:
  - `IChatSessionRepository`
  - `IChatMessageRepository`
- 以下のマッパーが実装済みであること:
  - `ChatSessionMapper`
  - `ChatMessageMapper`
- DBスキーマが定義済みであること:
  - `packages/shared/src/db/schema/chat-history.ts`

### 3.2 依存タスク

| タスク   | ステータス |
| -------- | ---------- |
| ARCH-001 | 完了       |

### 3.3 必要な知識

- Drizzle ORM APIの理解
- Clean Architecture Repository Pattern
- TypeScript（特にジェネリクス、非同期処理）
- Result<T, E>型によるエラーハンドリング
- SQLite FTS5（全文検索）

### 3.4 推奨アプローチ

1. 既存の`InMemoryChatSessionRepository`を参考にする
2. `IChatSessionRepository`インターフェースの各メソッドを順番に実装
3. Drizzle ORMクエリビルダーを使用してSQLを構築
4. `ChatSessionMapper`を使用してDB Record ↔ Entity変換
5. エラーは`Result<T, RepositoryError>`で返却

---

## 4. 実行手順

### Phase構成

| Phase | 名称               | 概要                         |
| ----- | ------------------ | ---------------------------- |
| 1     | 環境準備           | 依存関係・ファイル構成の確認 |
| 2     | Session Repository | セッションリポジトリ実装     |
| 3     | Message Repository | メッセージリポジトリ実装     |
| 4     | 統合テスト         | 全体の動作確認               |

---

### Phase 1: 環境準備

#### 目的

実装に必要な環境とファイル構成を確認する。

#### 手順

1. 既存のインターフェース定義を確認:

   ```
   packages/shared/src/features/chat-history/domain/repositories/IChatSessionRepository.ts
   packages/shared/src/features/chat-history/domain/repositories/IChatMessageRepository.ts
   ```

2. DBスキーマ定義を確認:

   ```
   packages/shared/src/db/schema/chat-history.ts
   ```

3. 既存Mapperを確認:

   ```
   packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatSessionMapper.ts
   packages/shared/src/features/chat-history/infrastructure/persistence/mappers/ChatMessageMapper.ts
   ```

4. InMemoryRepositoryの実装を参照として確認

#### 成果物

- 環境確認チェックリスト完了

#### 完了条件

- 全ての依存ファイルが存在することを確認

---

### Phase 2: Session Repository実装

#### 目的

`DrizzleChatSessionRepository`を実装する。

#### 手順

1. `DrizzleChatSessionRepository.ts`ファイルを作成

2. コンストラクタでDrizzle DB接続を受け取る:

   ```typescript
   export class DrizzleChatSessionRepository implements IChatSessionRepository {
     constructor(private readonly db: DrizzleDB) {}
   }
   ```

3. 各メソッドを実装:
   - `findById(id: ChatSessionId): Promise<ChatSession | null>`
   - `findByUserId(userId: UserId): Promise<ChatSession[]>`
   - `findPinnedByUserId(userId: UserId): Promise<ChatSession[]>`
   - `save(session: ChatSession): Promise<Result<void, RepositoryError>>`
   - `delete(id: ChatSessionId): Promise<Result<void, RepositoryError>>`
   - `search(query: SearchQuery): Promise<SearchResult>`
   - `countPinnedByUserId(userId: UserId): Promise<number>`

4. FTS5全文検索の実装（searchメソッド）:

   ```typescript
   // chat_sessions_fts仮想テーブルを使用
   const ftsResults = await this.db.run(
     sql`SELECT * FROM chat_sessions_fts WHERE chat_sessions_fts MATCH ${query}`,
   );
   ```

5. ユニットテストを作成

#### 成果物

- `DrizzleChatSessionRepository.ts`
- `DrizzleChatSessionRepository.test.ts`

#### 完了条件

- 全メソッドが実装されている
- ユニットテスト全パス
- カバレッジ≥80%

---

### Phase 3: Message Repository実装

#### 目的

`DrizzleChatMessageRepository`を実装する。

#### 手順

1. `DrizzleChatMessageRepository.ts`ファイルを作成

2. コンストラクタでDrizzle DB接続を受け取る

3. 各メソッドを実装:
   - `findById(id: ChatMessageId): Promise<ChatMessage | null>`
   - `findBySessionId(sessionId: ChatSessionId): Promise<ChatMessage[]>`
   - `save(message: ChatMessage): Promise<Result<void, RepositoryError>>`
   - `delete(id: ChatMessageId): Promise<Result<void, RepositoryError>>`

4. ユニットテストを作成

#### 成果物

- `DrizzleChatMessageRepository.ts`
- `DrizzleChatMessageRepository.test.ts`

#### 完了条件

- 全メソッドが実装されている
- ユニットテスト全パス
- カバレッジ≥80%

---

### Phase 4: 統合テスト

#### 目的

Session/Message Repository間の連携を確認する。

#### 手順

1. 統合テストファイルを作成（オプション）

2. 以下のシナリオをテスト:
   - セッション作成 → メッセージ追加 → メッセージ取得
   - セッション削除時のメッセージ削除（CASCADE）
   - 全文検索（FTS5）の動作確認

3. 型チェック・Lint実行:

   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/shared lint
   ```

4. 全テスト実行:
   ```bash
   pnpm --filter @repo/shared test
   ```

#### 成果物

- 統合テスト（オプション）
- 品質検証レポート

#### 完了条件

- 全テストパス
- 型エラー0件
- Lintエラー0件
- カバレッジ≥80%

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `DrizzleChatSessionRepository`の全メソッドが実装されている
- [ ] `DrizzleChatMessageRepository`の全メソッドが実装されている
- [ ] FTS5全文検索が動作する
- [ ] CRUD操作が正常に動作する

### 品質要件

- [ ] Line Coverage ≥ 80%
- [ ] 型エラー 0件
- [ ] Lintエラー 0件
- [ ] 全テストパス

### ドキュメント要件

- [ ] JSDocコメントが記述されている
- [ ] 使用例がコメントに含まれている（オプション）

---

## 6. 検証方法

### テストケース

| #   | テストケース                 | 期待結果                       |
| --- | ---------------------------- | ------------------------------ |
| 1   | セッション作成               | DBにレコードが保存される       |
| 2   | セッションID検索             | 該当セッションが返却される     |
| 3   | ユーザーID検索               | ユーザーの全セッションが返却   |
| 4   | ピン留めセッション取得       | ピン留め済みのみ返却           |
| 5   | セッション更新               | 更新内容がDBに反映             |
| 6   | セッション削除               | DBからレコードが削除される     |
| 7   | 全文検索                     | キーワードに一致するセッション |
| 8   | メッセージ作成               | DBにレコードが保存される       |
| 9   | セッションID別メッセージ取得 | セッションの全メッセージ       |
| 10  | 存在しないID検索             | nullが返却される               |

### 検証手順

1. ユニットテスト実行:

   ```bash
   pnpm --filter @repo/shared test -- --coverage
   ```

2. 型チェック:

   ```bash
   pnpm --filter @repo/shared typecheck
   ```

3. Lint:
   ```bash
   pnpm --filter @repo/shared lint
   ```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                |
| -------------------------- | ------ | -------- | ----------------------------------- |
| FTS5の動作不備             | 中     | 低       | 既存のFTS実装を参考にする           |
| Mapper変換エラー           | 中     | 低       | 既存Mapperのテストを拡充            |
| トランザクション処理の不備 | 高     | 低       | Drizzleのトランザクション機能を使用 |
| 既存スキーマとの不整合     | 高     | 低       | スキーマ定義を事前に十分確認        |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`            |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`                     |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`              |
| 実装ガイド           | `docs/30-workflows/clean-architecture-refactoring/outputs/phase-12/implementation-guide.md` |
| DBスキーマ           | `packages/shared/src/db/schema/chat-history.ts`                                             |

### 参考資料

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [SQLite FTS5 Documentation](https://www.sqlite.org/fts5.html)
- Clean Architecture (Robert C. Martin)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 12 未タスク検出レポートより:

UT-005: Drizzle Repository実装
- 概要: 本番用のDrizzle ORMリポジトリ実装
- 詳細: `DrizzleChatSessionRepository`, `DrizzleChatMessageRepository`の実装
- 優先度: High
- 対応期限: UI統合前
- ステータス: 未着手（別タスクとして切り出し推奨）
```

### 補足事項

- 本タスクはARCH-001のスコープ外として明示的に除外されていた
- UI統合タスク（UT-006）の前提条件として実装が必要
- InMemoryRepositoryと同じインターフェースを実装するため、置換が容易
- Drizzle ORMは既にプロジェクトで使用されているため、追加の依存関係は不要

---

**作成日**: 2026-01-19
**作成者**: Claude Code
**バージョン**: 1.0
