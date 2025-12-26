# content_chunks テーブル + FTS5 - タスク実行仕様書

## ユーザーからの元の指示

```
@docs/30-workflows/unassigned-task/task-04-03-chunks-fts5.md のタスクを実行してほしいです。まずはタスク仕様書を作成してほしいです。次のプロンプトを用いてタスク仕様書を作成してください。このタスク仕様書を作成する以外のタスクは絶対に実行しないでください。@docs/00-requirements/task-orchestration-specification.md
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | CONV-04-03                               |
| Worktreeパス | `.worktrees/task-{{timestamp}}`          |
| ブランチ名   | `task-{{timestamp}}`                     |
| タスク名     | content_chunks テーブル + FTS5           |
| 分類         | 要件                                     |
| 対象機能     | RAG変換システム - チャンキング・検索基盤 |
| 優先度       | 中                                       |
| 見積もり規模 | 中規模                                   |
| 依存タスク   | CONV-04-01 (Drizzle ORM セットアップ)    |
| ステータス   | 未実施                                   |
| 作成日       | 2025-12-26                               |

---

## タスク概要

### 目的

テキストチャンクを保存し、FTS5（Full-Text Search 5）によるキーワード検索を可能にするテーブルとクエリ基盤を実装する。BM25ベースのキーワード検索を提供し、RAG（Retrieval-Augmented Generation）システムの検索層の基盤となる。

### 背景

RAG変換システムでは、ファイルをチャンク（断片）に分割し、それらのチャンクを検索可能にする必要がある。FTS5はSQLiteの標準拡張で、libSQLでもサポートされており、高速な全文検索とBM25スコアリングを提供する。これにより、ユーザーはキーワードでコンテンツを検索し、関連度の高いチャンクを取得できる。

### 最終ゴール

- `chunks`テーブルが定義され、チャンクデータが保存できる
- FTS5仮想テーブル`chunks_fts`が作成され、全文検索が可能になる
- INSERT/UPDATE/DELETEトリガーが動作し、FTSインデックスが自動同期される
- キーワード検索、フレーズ検索、NEAR検索のクエリ関数が実装される
- BM25スコア正規化関数が実装される
- マイグレーションが正常に実行できる
- 単体テストが作成され、全テストがパスする

### 成果物一覧

| 種別             | 成果物                 | 配置先                                                                      |
| ---------------- | ---------------------- | --------------------------------------------------------------------------- |
| 環境             | Git Worktree環境       | `.worktrees/task-{{timestamp}}`                                             |
| スキーマ         | chunksテーブル定義     | `packages/shared/src/db/schema/chunks.ts`                                   |
| スキーマ         | FTS5仮想テーブル定義   | `packages/shared/src/db/schema/chunks-fts.ts`                               |
| クエリ           | FTS5検索クエリビルダー | `packages/shared/src/db/queries/chunks-search.ts`                           |
| リレーション     | リレーション更新       | `packages/shared/src/db/schema/relations.ts`                                |
| マイグレーション | SQLマイグレーション    | `packages/shared/src/db/migrations/0004_create_chunks_table.sql`            |
| マイグレーション | SQLマイグレーション    | `packages/shared/src/db/migrations/0005_create_chunks_fts.sql`              |
| テスト           | ユニットテスト         | `packages/shared/src/db/schema/__tests__/chunks.test.ts`                    |
| テスト           | ユニットテスト         | `packages/shared/src/db/queries/__tests__/chunks-search.test.ts`            |
| ドキュメント     | 設計ドキュメント       | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`             |
| ドキュメント     | テストレポート         | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`        |
| ドキュメント     | 手動テストレポート     | `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md` |
| PR               | GitHub Pull Request    | GitHub UI                                                                   |

---

## 参照ファイル

本仕様書のコマンド選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

| ID     | フェーズ | サブタスク名                 | 責務                                              | 依存   |
| ------ | -------- | ---------------------------- | ------------------------------------------------- | ------ |
| T--1-1 | Phase -1 | Git Worktree環境作成・初期化 | タスク専用の独立した開発環境を準備                | なし   |
| T-00-1 | Phase 0  | 要件定義書作成               | chunksテーブルとFTS5の詳細要件を明確化            | T--1-1 |
| T-01-1 | Phase 1  | chunksテーブル設計           | chunksテーブルのスキーマ設計                      | T-00-1 |
| T-01-2 | Phase 1  | FTS5仮想テーブル設計         | chunks_ftsテーブルとトリガーの設計                | T-01-1 |
| T-01-3 | Phase 1  | 検索クエリビルダー設計       | FTS5検索関数の設計                                | T-01-2 |
| T-02-1 | Phase 2  | 設計レビュー実施             | 設計の妥当性を検証                                | T-01-3 |
| T-03-1 | Phase 3  | chunksテーブルテスト作成     | chunksスキーマの単体テスト作成                    | T-02-1 |
| T-03-2 | Phase 3  | FTS5検索テスト作成           | 検索クエリの単体テスト作成                        | T-03-1 |
| T-04-1 | Phase 4  | chunksテーブル実装           | chunksスキーマの実装                              | T-03-2 |
| T-04-2 | Phase 4  | FTS5仮想テーブル実装         | chunks_ftsとトリガーの実装                        | T-04-1 |
| T-04-3 | Phase 4  | 検索クエリビルダー実装       | FTS5検索関数の実装                                | T-04-2 |
| T-04-4 | Phase 4  | リレーション更新             | filesとchunksのリレーション定義                   | T-04-3 |
| T-04-5 | Phase 4  | マイグレーション作成         | SQLマイグレーションファイル作成                   | T-04-4 |
| T-05-1 | Phase 5  | コードリファクタリング       | コード品質と保守性の向上                          | T-04-5 |
| T-06-1 | Phase 6  | 全テスト実行                 | 全テストスイートの実行と確認                      | T-05-1 |
| T-06-2 | Phase 6  | カバレッジ確認               | テストカバレッジの確認と補完                      | T-06-1 |
| T-07-1 | Phase 7  | 最終コードレビュー実施       | 実装全体の包括的レビュー                          | T-06-2 |
| T-08-1 | Phase 8  | 手動テスト実施               | マイグレーション・検索の手動検証                  | T-07-1 |
| T-09-1 | Phase 9  | システムドキュメント更新     | master_system_design.md等の更新と未完了タスク記録 | T-08-1 |
| T-10-1 | Phase 10 | 差分確認・コミット作成       | Git差分確認とコミット                             | T-09-1 |
| T-10-2 | Phase 10 | PR作成                       | GitHub Pull Request作成                           | T-10-1 |
| T-10-3 | Phase 10 | CI/CD完了確認                | CI成功確認とマージ準備                            | T-10-2 |

**総サブタスク数**: 21個

---

## 実行フロー図

```mermaid
graph TD
    START[タスク開始] --> T--1[Phase -1: 環境準備]
    T--1 --> T-00[Phase 0: 要件定義]
    T-00 --> T-01[Phase 1: 設計]
    T-01 --> T-02[Phase 2: 設計レビューゲート]
    T-02 --> T-03[Phase 3: テスト作成]
    T-03 --> T-04[Phase 4: 実装]
    T-04 --> T-05[Phase 5: リファクタリング]
    T-05 --> T-06[Phase 6: 品質保証]
    T-06 --> T-07[Phase 7: 最終レビューゲート]
    T-07 --> T-08[Phase 8: 手動テスト]
    T-08 --> T-09[Phase 9: ドキュメント更新]
    T-09 --> T-10[Phase 10: PR作成・CI確認]
    T-10 --> END[マージ準備完了]

    T-02 -->|MAJOR| T-01
    T-02 -->|MAJOR: 要件| T-00
    T-07 -->|MAJOR| T-05
    T-07 -->|MAJOR: 実装| T-04
    T-07 -->|MAJOR: テスト| T-03
    T-07 -->|MAJOR: 設計| T-01
    T-07 -->|CRITICAL| T-00
```

---

## Phase -1: 環境準備（Git Worktree作成）

### T--1-1: Git Worktree環境作成・初期化

#### Claude Code スラッシュコマンド（該当する場合）

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
# 現時点では専用のスラッシュコマンドは存在しません
# 以下のBashコマンドを使用してください
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 背景

複数タスクの並行開発や実験的な変更のため、各タスクごとに独立したWorktreeで作業を行う必要がある。
これにより、本体ブランチを保護し、タスク間の干渉を防ぐ。

#### 責務（単一責務）

Git Worktree環境の作成と初期化のみを担当する。

#### 実行手順

**1. タスク識別子の生成**

```bash
TASK_ID="task-$(date +%Y%m%d-%H%M%S)"
echo "Generated Task ID: $TASK_ID"
```

**2. Git Worktreeの作成**

```bash
WORKTREE_PATH=".worktrees/$TASK_ID"
git worktree add "$WORKTREE_PATH" -b "$TASK_ID"
```

**3. Worktreeディレクトリへ移動**

```bash
cd "$WORKTREE_PATH"
pwd  # 現在のディレクトリを確認
```

**4. 環境確認**

```bash
# ブランチ確認
git branch --show-current

# Git状態確認
git status

# 依存関係インストール（必要に応じて）
pnpm install

# ビルド確認
pnpm --filter @repo/shared build
```

#### 成果物

| 成果物           | パス                            | 内容                             |
| ---------------- | ------------------------------- | -------------------------------- |
| Git Worktree環境 | `.worktrees/task-{{timestamp}}` | 独立した作業ディレクトリ         |
| 新規ブランチ     | `task-{{timestamp}}`            | タスク専用ブランチ               |
| 初期化済み環境   | -                               | 依存関係インストール・ビルド完了 |

#### 完了条件

- [ ] Git Worktreeが正常に作成されている
- [ ] 新規ブランチが作成されている（`git branch --show-current`で確認）
- [ ] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている（`node_modules/`が存在）
- [ ] ビルドが成功する（`pnpm --filter @repo/shared build`が成功）
- [ ] Git状態がクリーンである（`git status`で未コミット変更なし）

#### 依存関係

- **前提**: なし（最初のフェーズ）
- **後続**: Phase 0（要件定義）

#### トラブルシューティング

**問題: Worktree作成失敗**

```bash
# 原因確認
git worktree list  # 既存Worktree確認

# 対策: 既存のWorktreeを削除
git worktree remove <worktree-path>
```

**問題: ビルド失敗**

```bash
# 原因確認
pnpm why <package-name>  # 依存関係確認

# 対策: 依存関係再インストール
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**問題: 本体ディレクトリに戻りたい**

```bash
# 本体ディレクトリのパスを確認
git worktree list

# 本体ディレクトリに移動
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
```

---

## Phase 0: 要件定義

### T-00-1: 要件定義書作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:write-spec chunks-fts5
```

- **参照**: `.claude/commands/ai/write-spec.md`
- **トリガーキーワード**: spec, specification, 仕様書, 詳細仕様

#### 目的

chunksテーブル、FTS5仮想テーブル、検索クエリビルダーの詳細要件を明確化し、実装可能な仕様書を作成する。

#### 背景

元のタスクファイル（`task-04-03-chunks-fts5.md`）には実装の概要が記載されているが、実装者が迷わないよう、さらに詳細な要件と仕様を明文化する必要がある。

#### 責務（単一責務）

chunksテーブルとFTS5の要件を整理し、詳細仕様書として文書化する。

#### 成果物

| 成果物     | パス                                                                  | 内容                           |
| ---------- | --------------------------------------------------------------------- | ------------------------------ |
| 要件定義書 | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` | chunksテーブルとFTS5の詳細要件 |

#### 完了条件

- [ ] chunksテーブルの全カラムと制約が定義されている
- [ ] FTS5仮想テーブルの設定（tokenizer、content、content_rowid）が明記されている
- [ ] INSERT/UPDATE/DELETEトリガーの仕様が明記されている
- [ ] キーワード検索、フレーズ検索、NEAR検索の要件が定義されている
- [ ] BM25スコアリングと正規化の要件が定義されている
- [ ] Contextual Retrieval用のcontextualContentカラムの用途が明記されている
- [ ] 依存関係（CONV-04-01）が確認されている

#### 依存関係

- **前提**: T--1-1（Git Worktree環境作成）
- **後続**: T-01-1（chunksテーブル設計）

---

## Phase 1: 設計

### T-01-1: chunksテーブル設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:design-database chunks
```

- **参照**: `.claude/commands/ai/design-database.md`
- **トリガーキーワード**: database design, schema, table, ER diagram, データベース設計

#### 目的

chunksテーブルのDrizzle ORMスキーマ設計を行い、必要なカラム、インデックス、制約を定義する。

#### 背景

テキストチャンクを効率的に保存・検索するため、適切なスキーマ設計が必要。以下の要素を含む：

- 主キー（UUID）
- 外部キー（files.id）
- コンテンツ（content、contextualContent）
- 位置情報（chunkIndex、startLine、endLine、startChar、endChar、parentHeader）
- チャンキング情報（strategy、tokenCount、hash）
- オーバーラップ情報（prevChunkId、nextChunkId、overlapTokens）
- メタデータ（JSON）
- タイムスタンプ（createdAt、updatedAt）

#### 責務（単一責務）

chunksテーブルのスキーマ定義のみを担当する。

#### 参照資料

| 参照資料   | パス                                                                  | 内容                           |
| ---------- | --------------------------------------------------------------------- | ------------------------------ |
| 要件定義書 | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` | chunksテーブルとFTS5の詳細要件 |

#### 成果物

| 成果物           | パス                                                              | 内容                           |
| ---------------- | ----------------------------------------------------------------- | ------------------------------ |
| 設計ドキュメント | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md` | chunksテーブルのスキーマ設計書 |

#### 完了条件

- [ ] 全カラムが定義されている（id、fileId、content、contextualContent、chunkIndex、startLine、endLine、startChar、endChar、parentHeader、strategy、tokenCount、hash、prevChunkId、nextChunkId、overlapTokens、metadata、createdAt、updatedAt）
- [ ] 外部キー制約が定義されている（fileId → files.id、onDelete: cascade）
- [ ] インデックスが定義されている（fileIdIdx、hashIdx、chunkIndexIdx、strategyIdx）
- [ ] strategy列のenumが定義されている（fixed_size、semantic、recursive、sentence、paragraph、markdown_header、code_block）
- [ ] 型定義が明確である（Chunk、NewChunk）

#### 依存関係

- **前提**: T-00-1（要件定義書作成）
- **後続**: T-01-2（FTS5仮想テーブル設計）

---

### T-01-2: FTS5仮想テーブル設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:design-database chunks-fts
```

- **参照**: `.claude/commands/ai/design-database.md`
- **トリガーキーワード**: database design, schema, FTS5, full-text search

#### 目的

FTS5仮想テーブル`chunks_fts`とINSERT/UPDATE/DELETEトリガーの設計を行う。

#### 背景

FTS5はDrizzle ORMで直接定義できないため、raw SQLで作成する必要がある。以下を設計：

- FTS5仮想テーブル（content、contextualContent、parentHeader）
- tokenizerの設定（unicode61 remove_diacritics 2）
- contentとcontent_rowidの設定
- INSERT/UPDATE/DELETEトリガーによるFTSインデックス同期

#### 責務（単一責務）

FTS5仮想テーブルとトリガーの設計のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                  | 内容                           |
| -------------------- | --------------------------------------------------------------------- | ------------------------------ |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` | chunksテーブルとFTS5の詳細要件 |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`     | chunksテーブルのスキーマ設計書 |

#### 成果物

| 成果物           | パス                                                            | 内容                               |
| ---------------- | --------------------------------------------------------------- | ---------------------------------- |
| 設計ドキュメント | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md` | FTS5仮想テーブルとトリガーの設計書 |

#### 完了条件

- [ ] FTS5仮想テーブルのSQL定義が明記されている
- [ ] tokenizerの設定が明記されている（unicode61 remove_diacritics 2）
- [ ] contentとcontent_rowidの設定が明記されている
- [ ] INSERTトリガーの仕様が明記されている
- [ ] UPDATEトリガーの仕様が明記されている（delete + insert）
- [ ] DELETEトリガーの仕様が明記されている
- [ ] 初期化関数（initializeChunksFts）の仕様が明記されている

#### 依存関係

- **前提**: T-01-1（chunksテーブル設計）
- **後続**: T-01-3（検索クエリビルダー設計）

---

### T-01-3: 検索クエリビルダー設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:write-spec chunks-search
```

- **参照**: `.claude/commands/ai/write-spec.md`
- **トリガーキーワード**: spec, specification, 仕様書, 詳細仕様

#### 目的

FTS5を使用したキーワード検索、フレーズ検索、NEAR検索のクエリビルダーを設計する。

#### 背景

FTS5の検索機能を活用するため、以下の検索関数を設計：

- `searchChunksByKeyword`: キーワード検索（BM25スコアリング、スニペット、ハイライト）
- `searchChunksByPhrase`: フレーズ検索
- `searchChunksByNear`: NEAR検索（近接検索）
- `escapeFts5Query`: FTS5クエリのエスケープ
- `normalizeBm25Score`: BM25スコア正規化

#### 責務（単一責務）

FTS5検索クエリビルダーの設計のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                  | 内容                               |
| -------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`     | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`       | FTS5仮想テーブルとトリガーの設計書 |

#### 成果物

| 成果物           | パス                                                              | 内容                       |
| ---------------- | ----------------------------------------------------------------- | -------------------------- |
| 設計ドキュメント | `docs/30-workflows/rag-conversion-system/design-chunks-search.md` | 検索クエリビルダーの設計書 |

#### 完了条件

- [ ] searchChunksByKeyword関数のインターフェースが定義されている
- [ ] searchChunksByPhrase関数のインターフェースが定義されている
- [ ] searchChunksByNear関数のインターフェースが定義されている
- [ ] escapeFts5Query関数のロジックが明記されている
- [ ] normalizeBm25Score関数のロジックが明記されている（シグモイド関数）
- [ ] FtsSearchResult型が定義されている（chunkId、content、contextualContent、parentHeader、bm25Score、snippet、highlights）
- [ ] オプション（limit、offset、fileIds、highlightTag、distance）が定義されている

#### 依存関係

- **前提**: T-01-2（FTS5仮想テーブル設計）
- **後続**: T-02-1（設計レビュー実施）

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビュー実施

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:review-architecture chunks-fts5
```

- **参照**: `.claude/commands/ai/review-architecture.md`
- **トリガーキーワード**: architecture review, アーキテクチャレビュー, 設計レビュー

#### 目的

Phase 1で作成した設計ドキュメントを包括的にレビューし、設計の妥当性を検証する。

#### 背景

設計段階で問題を発見することで、実装後の手戻りを防ぐ。以下の観点でレビュー：

- スキーマ設計の妥当性
- FTS5設定の適切性
- インデックス戦略の妥当性
- 検索クエリの効率性
- 依存関係の整合性

#### 責務（単一責務）

設計の妥当性検証のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                  | 内容                               |
| -------------------- | --------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md` | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`     | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`       | FTS5仮想テーブルとトリガーの設計書 |
| 検索クエリ設計書     | `docs/30-workflows/rag-conversion-system/design-chunks-search.md`     | 検索クエリビルダーの設計書         |

#### レビューチェックリスト

**スキーマ設計**

- [ ] カラム定義が妥当である
- [ ] 制約が適切である
- [ ] インデックスが効率的である
- [ ] 型定義が正確である

**FTS5設計**

- [ ] tokenizer設定が適切である（日本語対応）
- [ ] トリガーが完全である（INSERT/UPDATE/DELETE）
- [ ] content_rowid設定が正確である

**検索クエリ設計**

- [ ] クエリが効率的である
- [ ] エスケープ処理が安全である
- [ ] スコアリングが妥当である
- [ ] エラーハンドリングが適切である

**アーキテクチャ整合性**

- [ ] master_system_design.mdとの整合性がある
- [ ] 依存関係が正確である
- [ ] ディレクトリ構造を遵守している

#### レビュー結果

- **判定**: PASS / MINOR / MAJOR（レビュー実施後に記入）
- **指摘事項**: （レビュー実施後に記入）
- **対応方針**: （レビュー実施後に記入）

#### 戻り先決定（MAJORの場合）

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 0（要件定義） |
| 設計の問題 | Phase 1（設計）     |
| 両方の問題 | Phase 0（要件定義） |

#### 成果物

| 成果物               | パス                                                                   | 内容                         |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------- |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項 |

#### 完了条件

- [ ] 全レビュー観点が確認されている
- [ ] 指摘事項が文書化されている
- [ ] レビュー結果（PASS/MINOR/MAJOR）が明記されている
- [ ] MINOR/MAJORの場合、対応方針が明記されている

#### 依存関係

- **前提**: T-01-3（検索クエリビルダー設計）
- **後続**: T-03-1（chunksテーブルテスト作成）※PASS/MINOR対応完了後

---

## Phase 3: テスト作成（TDD: Red）

### T-03-1: chunksテーブルテスト作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/db/schema/chunks.ts
```

- **参照**: `.claude/commands/ai/generate-unit-tests.md`
- **トリガーキーワード**: unit test, test generation, TDD

#### 目的

chunksテーブルスキーマの単体テストを作成し、TDDサイクルのRed（テスト失敗確認）フェーズを完了する。

#### 背景

TDD（テスト駆動開発）では、実装前にテストを作成する。これにより、要件を明確化し、実装の正確性を保証する。

#### 責務（単一責務）

chunksテーブルスキーマの単体テスト作成のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                           |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件 |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項   |

#### テストカバレッジ

- chunksテーブルの作成
- レコードのINSERT
- レコードのUPDATE
- レコードのDELETE
- 外部キー制約（files.id）
- CASCADE削除
- インデックスの存在確認
- enum制約の確認

#### 成果物

| 成果物         | パス                                                     | 内容                   |
| -------------- | -------------------------------------------------------- | ---------------------- |
| ユニットテスト | `packages/shared/src/db/schema/__tests__/chunks.test.ts` | chunksテーブルのテスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run packages/shared/src/db/schema/__tests__/chunks.test.ts
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] 全テストケースが定義されている
- [ ] テストが失敗する（実装前なので当然）
- [ ] テストコードが読みやすく保守しやすい

#### 依存関係

- **前提**: T-02-1（設計レビュー実施）
- **後続**: T-03-2（FTS5検索テスト作成）

---

### T-03-2: FTS5検索テスト作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/db/queries/chunks-search.ts
```

- **参照**: `.claude/commands/ai/generate-unit-tests.md`
- **トリガーキーワード**: unit test, test generation, TDD

#### 目的

FTS5検索クエリビルダーの単体テストを作成し、TDDサイクルのRed（テスト失敗確認）フェーズを完了する。

#### 背景

検索機能は複雑なロジックを含むため、包括的なテストが必要。各検索タイプ（キーワード、フレーズ、NEAR）を個別にテストする。

#### 責務（単一責務）

FTS5検索クエリビルダーの単体テスト作成のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 検索クエリ設計書     | `docs/30-workflows/rag-conversion-system/design-chunks-search.md`      | 検索クエリビルダーの設計書         |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |

#### テストカバレッジ

- searchChunksByKeyword関数
  - 基本的なキーワード検索
  - 複数キーワード検索
  - ファイルIDフィルター
  - ページネーション
  - BM25スコアリング
  - スニペット生成
  - ハイライト生成
- searchChunksByPhrase関数
  - フレーズ検索
  - ダブルクォートエスケープ
- searchChunksByNear関数
  - 近接検索
  - 距離パラメータ
- escapeFts5Query関数
  - 特殊文字エスケープ
  - ワイルドカード処理
- normalizeBm25Score関数
  - スコア正規化（0-1範囲）

#### 成果物

| 成果物         | パス                                                             | 内容                   |
| -------------- | ---------------------------------------------------------------- | ---------------------- |
| ユニットテスト | `packages/shared/src/db/queries/__tests__/chunks-search.test.ts` | FTS5検索クエリのテスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run packages/shared/src/db/queries/__tests__/chunks-search.test.ts
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] テストファイルが作成されている
- [ ] 全テストケースが定義されている
- [ ] テストが失敗する（実装前なので当然）
- [ ] テストコードが読みやすく保守しやすい
- [ ] エッジケースが網羅されている

#### 依存関係

- **前提**: T-03-1（chunksテーブルテスト作成）
- **後続**: T-04-1（chunksテーブル実装）

---

## Phase 4: 実装（TDD: Green）

### T-04-1: chunksテーブル実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:create-db-schema chunks
```

- **参照**: `.claude/commands/ai/create-db-schema.md`
- **トリガーキーワード**: schema, database, table, Drizzle

#### 目的

chunksテーブルのDrizzle ORMスキーマを実装し、Phase 3で作成したテストをパスさせる。

#### 背景

設計書とテストに基づいて、chunksテーブルのスキーマを実装する。Drizzle ORMの型安全性を活用する。

#### 責務（単一責務）

chunksテーブルスキーマの実装のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                           |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件 |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項   |

#### 実装内容

- `packages/shared/src/db/schema/chunks.ts`の作成
- 全カラムの定義（id、fileId、content、contextualContent、etc.）
- 外部キー制約の定義
- インデックスの定義
- enum制約の定義
- 型定義（Chunk、NewChunk）

#### 成果物

| 成果物           | パス                                      | 内容               |
| ---------------- | ----------------------------------------- | ------------------ |
| スキーマファイル | `packages/shared/src/db/schema/chunks.ts` | chunksテーブル定義 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run packages/shared/src/db/schema/__tests__/chunks.test.ts
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] ファイルが作成されている
- [ ] 全カラムが実装されている
- [ ] 外部キー制約が実装されている
- [ ] インデックスが実装されている
- [ ] enum制約が実装されている
- [ ] 型定義が実装されている
- [ ] T-03-1のテストがパスする

#### 依存関係

- **前提**: T-03-2（FTS5検索テスト作成）
- **後続**: T-04-2（FTS5仮想テーブル実装）

---

### T-04-2: FTS5仮想テーブル実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:implement-business-logic chunks-fts-initialization
```

- **参照**: `.claude/commands/ai/implement-business-logic.md`
- **トリガーキーワード**: business logic, executor, implement, 実装

#### 目的

FTS5仮想テーブル`chunks_fts`とINSERT/UPDATE/DELETEトリガーを実装する。

#### 背景

FTS5はDrizzle ORMで直接定義できないため、raw SQLで作成する。initializeChunksFts関数を実装し、FTS5テーブルとトリガーをセットアップする。

#### 責務（単一責務）

FTS5仮想テーブルとトリガーの実装のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |

#### 実装内容

- `packages/shared/src/db/schema/chunks-fts.ts`の作成
- createChunksFtsTable関数の実装
- createChunksFtsTriggers関数の実装（INSERT/UPDATE/DELETE）
- initializeChunksFts関数の実装

#### 成果物

| 成果物               | パス                                          | 内容                 |
| -------------------- | --------------------------------------------- | -------------------- |
| FTS5スキーマファイル | `packages/shared/src/db/schema/chunks-fts.ts` | FTS5仮想テーブル定義 |

#### TDD検証: Green状態確認

```bash
# FTS5初期化のテスト実行
pnpm --filter @repo/shared test:run packages/shared/src/db/schema/__tests__/chunks-fts.test.ts
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] ファイルが作成されている
- [ ] createChunksFtsTable関数が実装されている
- [ ] INSERTトリガーが実装されている
- [ ] UPDATEトリガーが実装されている
- [ ] DELETEトリガーが実装されている
- [ ] initializeChunksFts関数が実装されている
- [ ] トリガーが正常に動作する

#### 依存関係

- **前提**: T-04-1（chunksテーブル実装）
- **後続**: T-04-3（検索クエリビルダー実装）

---

### T-04-3: 検索クエリビルダー実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:implement-business-logic chunks-search
```

- **参照**: `.claude/commands/ai/implement-business-logic.md`
- **トリガーキーワード**: business logic, executor, implement, 実装

#### 目的

FTS5検索クエリビルダー（searchChunksByKeyword、searchChunksByPhrase、searchChunksByNear等）を実装し、Phase 3で作成したテストをパスさせる。

#### 背景

FTS5の検索機能を活用し、BM25スコアリング、スニペット生成、ハイライト機能を提供する。

#### 責務（単一責務）

FTS5検索クエリビルダーの実装のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                           |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件 |
| 検索クエリ設計書     | `docs/30-workflows/rag-conversion-system/design-chunks-search.md`      | 検索クエリビルダーの設計書     |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項   |

#### 実装内容

- `packages/shared/src/db/queries/chunks-search.ts`の作成
- searchChunksByKeyword関数の実装
- searchChunksByPhrase関数の実装
- searchChunksByNear関数の実装
- escapeFts5Query関数の実装
- normalizeBm25Score関数の実装
- FtsSearchResult型の定義

#### 成果物

| 成果物             | パス                                              | 内容                   |
| ------------------ | ------------------------------------------------- | ---------------------- |
| 検索クエリファイル | `packages/shared/src/db/queries/chunks-search.ts` | FTS5検索クエリビルダー |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run packages/shared/src/db/queries/__tests__/chunks-search.test.ts
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] ファイルが作成されている
- [ ] searchChunksByKeyword関数が実装されている
- [ ] searchChunksByPhrase関数が実装されている
- [ ] searchChunksByNear関数が実装されている
- [ ] escapeFts5Query関数が実装されている
- [ ] normalizeBm25Score関数が実装されている
- [ ] FtsSearchResult型が定義されている
- [ ] T-03-2のテストがパスする

#### 依存関係

- **前提**: T-04-2（FTS5仮想テーブル実装）
- **後続**: T-04-4（リレーション更新）

---

### T-04-4: リレーション更新

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:create-entity chunks-relations
```

- **参照**: `.claude/commands/ai/create-entity.md`
- **トリガーキーワード**: entity, domain, リレーション

#### 目的

filesテーブルとchunksテーブルのリレーション、およびchunksテーブル内の自己参照リレーション（prevChunk、nextChunk）を定義する。

#### 背景

Drizzle ORMのリレーション機能を使用して、テーブル間の関連を明確化する。これにより、型安全なクエリが可能になる。

#### 責務（単一責務）

chunksテーブルのリレーション定義のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                           |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------ |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件 |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項   |

#### 実装内容

- `packages/shared/src/db/schema/relations.ts`の更新
- filesRelationsの更新（chunks: many(chunks)）
- chunksRelationsの追加
  - file: one(files)
  - prevChunk: one(chunks)（自己参照）
  - nextChunk: one(chunks)（自己参照）

#### 成果物

| 成果物               | パス                                         | 内容                   |
| -------------------- | -------------------------------------------- | ---------------------- |
| リレーションファイル | `packages/shared/src/db/schema/relations.ts` | chunksリレーション定義 |

#### TDD検証: Green状態確認

```bash
# リレーション定義を含む全テスト実行
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] filesRelationsが更新されている
- [ ] chunksRelationsが追加されている
- [ ] file（one）リレーションが定義されている
- [ ] prevChunk（one）リレーションが定義されている
- [ ] nextChunk（one）リレーションが定義されている
- [ ] リレーションが正常に動作する

#### 依存関係

- **前提**: T-04-3（検索クエリビルダー実装）
- **後続**: T-04-5（マイグレーション作成）

---

### T-04-5: マイグレーション作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:create-migration chunks-and-fts5
```

- **参照**: `.claude/commands/ai/create-migration.md`
- **トリガーキーワード**: migration, schema-change, Drizzle

#### 目的

chunksテーブルとchunks_ftsテーブルのSQLマイグレーションファイルを作成する。

#### 背景

Drizzle ORMのマイグレーション機能を使用して、データベーススキーマを管理する。chunksテーブルとFTS5テーブルを別々のマイグレーションとして作成する。

#### 責務（単一責務）

SQLマイグレーションファイルの作成のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |

#### 実装内容

- `0004_create_chunks_table.sql`の作成
  - CREATE TABLE chunks
  - CREATE INDEX（fileIdIdx、hashIdx、chunkIndexIdx、strategyIdx）
- `0005_create_chunks_fts.sql`の作成
  - CREATE VIRTUAL TABLE chunks_fts
  - CREATE TRIGGER chunks_fts_insert
  - CREATE TRIGGER chunks_fts_update
  - CREATE TRIGGER chunks_fts_delete

#### 成果物

| 成果物                   | パス                                                             | 内容                       |
| ------------------------ | ---------------------------------------------------------------- | -------------------------- |
| マイグレーションファイル | `packages/shared/src/db/migrations/0004_create_chunks_table.sql` | chunksテーブル作成         |
| マイグレーションファイル | `packages/shared/src/db/migrations/0005_create_chunks_fts.sql`   | FTS5テーブル・トリガー作成 |

#### TDD検証: Green状態確認

```bash
# マイグレーション実行テスト
pnpm --filter @repo/shared test:run packages/shared/src/db/migrations/__tests__/chunks-migration.test.ts

# または手動でマイグレーション実行
pnpm --filter @repo/shared db:migrate
```

- [ ] テストが成功することを確認（Green状態）
- [ ] マイグレーションが正常に実行できることを確認

#### 完了条件

- [ ] 0004マイグレーションが作成されている
- [ ] 0005マイグレーションが作成されている
- [ ] マイグレーションが正常に実行できる
- [ ] ロールバックが正常に実行できる
- [ ] トリガーが正常に動作する

#### 依存関係

- **前提**: T-04-4（リレーション更新）
- **後続**: T-05-1（コードリファクタリング）

---

## Phase 5: リファクタリング（TDD: Refactor）

### T-05-1: コードリファクタリング

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:refactor packages/shared/src/db
```

- **参照**: `.claude/commands/ai/refactor.md`
- **トリガーキーワード**: refactor, improve, clean code

#### 目的

実装コードの品質と保守性を向上させ、コードスメルを除去し、ベストプラクティスに準拠させる。

#### 背景

TDDサイクルのRefactorフェーズでは、テストがパスした状態で、コードの内部品質を改善する。機能を変更せず、コードの読みやすさ、保守性、パフォーマンスを向上させる。

#### 責務（単一責務）

コードのリファクタリングのみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |

#### リファクタリング観点

- コードの重複除去
- 関数の責務分離
- 変数名・関数名の改善
- コメントの追加・改善
- エラーハンドリングの改善
- パフォーマンスの最適化
- 型安全性の向上

#### 成果物

| 成果物                       | パス                                              | 内容                     |
| ---------------------------- | ------------------------------------------------- | ------------------------ |
| リファクタリングされたコード | `packages/shared/src/db/schema/chunks.ts`         | 改善されたchunksスキーマ |
| リファクタリングされたコード | `packages/shared/src/db/schema/chunks-fts.ts`     | 改善されたFTS5スキーマ   |
| リファクタリングされたコード | `packages/shared/src/db/queries/chunks-search.ts` | 改善された検索クエリ     |

#### 完了条件

- [ ] コードが読みやすく保守しやすい
- [ ] コードの重複が除去されている
- [ ] 関数の責務が明確である
- [ ] 変数名・関数名が適切である
- [ ] エラーハンドリングが適切である
- [ ] 全テストがパスする（機能が変更されていない）

#### 依存関係

- **前提**: T-04-5（マイグレーション作成）
- **後続**: T-06-1（全テスト実）

---

## Phase 6: 品質保証

### T-06-1: 全テスト実行

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/run-all-tests.md`
- **トリガーキーワード**: run tests, all tests, test suite, CI

#### 目的

全テストスイート（ユニットテスト）を実行し、テストカバレッジを確認する。

#### 背景

品質保証の一環として、全テストが正常にパスし、十分なテストカバレッジが確保されていることを確認する。

#### 責務（単一責務）

全テスト実行とカバレッジ確認のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |

#### 実行内容

- `pnpm --filter @repo/shared test:run`の実行
- `pnpm --filter @repo/shared test:coverage`の実行
- テスト結果の確認
- カバレッジレポートの確認

#### 成果物

| 成果物         | パス                                                                 | 内容           |
| -------------- | -------------------------------------------------------------------- | -------------- |
| テストレポート | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md` | テスト実行結果 |

#### 完了条件

- [ ] 全テストがパスする
- [ ] テストカバレッジが80%以上である
- [ ] テストレポートが作成されている
- [ ] カバレッジレポートが作成されている

#### 依存関係

- **前提**: T-05-1（コードリファクタリング）
- **後続**: T-06-2（カバレッジ確認）

---

### T-06-2: カバレッジ確認

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:analyze-code-quality packages/shared/src/db
```

- **参照**: `.claude/commands/ai/analyze-code-quality.md`
- **トリガーキーワード**: code quality, analyze, metrics, 品質分析

#### 目的

テストカバレッジを確認し、カバレッジが不足している箇所を特定して補完する。

#### 背景

カバレッジが低い箇所は、バグの温床となる可能性がある。カバレッジを確認し、必要に応じてテストを追加する。

#### 責務（単一責務）

カバレッジ確認とテスト補完のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |
| テストレポート       | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`   | テスト実行結果                     |

#### 確認内容

- Statement coverage（文カバレッジ）
- Branch coverage（分岐カバレッジ）
- Function coverage（関数カバレッジ）
- Line coverage（行カバレッジ）

#### 成果物

| 成果物             | パス                                                                     | 内容               |
| ------------------ | ------------------------------------------------------------------------ | ------------------ |
| カバレッジレポート | `docs/30-workflows/rag-conversion-system/coverage-report-chunks-fts5.md` | カバレッジ分析結果 |

#### 完了条件

- [ ] カバレッジレポートが作成されている
- [ ] カバレッジが不足している箇所が特定されている
- [ ] 必要に応じてテストが追加されている
- [ ] 全カバレッジが80%以上である

#### 依存関係

- **前提**: T-06-1（全テスト実行）
- **後続**: T-07-1（最終コードレビュー実施）

---

## 品質ゲートチェックリスト

### 機能検証

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功（該当する場合）
- [ ] 全E2Eテスト成功（該当する場合）

### コード品質

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性

- [ ] カバレッジ基準達成（80%以上）

### セキュリティ

- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし

---

## Phase 7: 最終レビューゲート

### T-07-1: 最終コードレビュー実施

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:code-review-complete packages/shared/src/db
```

- **参照**: `.claude/commands/ai/code-review-complete.md`
- **トリガーキーワード**: code review, レビュー, 品質チェック

#### 目的

実装全体の包括的レビューを実施し、コード品質、アーキテクチャ整合性、セキュリティを検証する。

#### 背景

最終レビューゲートでは、実装・テスト・ドキュメントの全体を包括的にレビューし、リリース可能な品質であることを確認する。

#### 責務（単一責務）

最終コードレビューのみを担当する。

#### 参照資料

| 参照資料             | パス                                                                     | 内容                               |
| -------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`    | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`        | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`          | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md`   | 設計レビューの結果と指摘事項       |
| テストレポート       | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`     | テスト実行結果                     |
| カバレッジレポート   | `docs/30-workflows/rag-conversion-system/coverage-report-chunks-fts5.md` | カバレッジ分析結果                 |

#### レビューチェックリスト

**コード品質**

- [ ] コードスタイルが一貫している
- [ ] 命名規則を遵守している
- [ ] コメントが適切である
- [ ] エラーハンドリングが適切である

**アーキテクチャ整合性**

- [ ] master_system_design.mdとの整合性がある
- [ ] ディレクトリ構造を遵守している
- [ ] 依存関係が整合している

**テスト品質**

- [ ] テストカバレッジが十分である
- [ ] テストケースが妥当である
- [ ] エッジケースが網羅されている

**セキュリティ**

- [ ] SQLインジェクション対策がある
- [ ] エスケープ処理が適切である
- [ ] 入力検証が適切である

**パフォーマンス**

- [ ] クエリが効率的である
- [ ] インデックスが適切である
- [ ] N+1問題を回避している

#### レビュー結果

- **判定**: PASS / MINOR / MAJOR / CRITICAL（レビュー実施後に記入）
- **指摘事項**: （レビュー実施後に記入）
- **対応方針**: （レビュー実施後に記入）
- **未完了タスク数**: 0件（レビュー実施後に記入）

#### 戻り先決定（MAJOR/CRITICALの場合）

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 0（要件定義）         |
| 設計の問題       | Phase 1（設計）             |
| テスト設計の問題 | Phase 3（テスト作成）       |
| 実装の問題       | Phase 4（実装）             |
| コード品質の問題 | Phase 5（リファクタリング） |

#### エスカレーション条件

- アーキテクチャ方針に関する重大な問題が発見された場合
- セキュリティ上の致命的な脆弱性が発見された場合
- パフォーマンス上の重大な問題があり、設計から見直す必要がある場合
- ユーザー要件との齟齬が発見された場合

#### 成果物

| 成果物               | パス                                                                  | 内容                         |
| -------------------- | --------------------------------------------------------------------- | ---------------------------- |
| 最終レビューレポート | `docs/30-workflows/rag-conversion-system/final-review-chunks-fts5.md` | 最終レビューの結果と指摘事項 |

#### 完了条件

- [ ] 全レビュー観点が確認されている
- [ ] 指摘事項が文書化されている
- [ ] レビュー結果（PASS/MINOR/MAJOR/CRITICAL）が明記されている
- [ ] MINOR/MAJOR/CRITICALの場合、対応方針が明記されている

#### 依存関係

- **前提**: T-06-2（カバレッジ確認）
- **後続**: T-08-1（手動テスト実施）※PASS/MINOR対応完了後

---

## Phase 8: 手動テスト検証

### T-08-1: 手動テスト実施

#### Claude Code スラッシュコマンド

> ⚠️ 現時点では専用のスラッシュコマンドは存在しません

```
# 手動テストは以下の手順に従って実施してください
```

#### 目的

マイグレーション実行、FTS5検索、トリガー動作を手動で検証し、実際の動作を確認する。

#### 背景

自動テストでは検出できない問題を発見するため、手動テストを実施する。特にマイグレーションとFTS5の動作は、実際のデータベースで確認する必要がある。

#### 責務（単一責務）

手動テスト実施のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                   | 内容                               |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`  | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`      | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`        | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md` | 設計レビューの結果と指摘事項       |
| テストレポート       | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`   | テスト実行結果                     |
| 最終レビューレポート | `docs/30-workflows/rag-conversion-system/final-review-chunks-fts5.md`  | 最終レビューの結果と指摘事項       |

#### テスト分類

機能テスト / 統合テスト

#### テスト項目

| No  | カテゴリ         | テスト項目              | 前提条件                 | 操作手順                  | 期待結果                                   | 実行結果 | 備考 |
| --- | ---------------- | ----------------------- | ------------------------ | ------------------------- | ------------------------------------------ | -------- | ---- |
| 1   | マイグレーション | chunksテーブル作成      | データベースが存在       | 0004マイグレーション実行  | chunksテーブルが作成される                 |          |      |
| 2   | マイグレーション | FTS5テーブル作成        | chunksテーブルが存在     | 0005マイグレーション実行  | chunks_ftsテーブルが作成される             |          |      |
| 3   | マイグレーション | トリガー作成            | FTS5テーブルが存在       | 0005マイグレーション実行  | 3つのトリガーが作成される                  |          |      |
| 4   | INSERT           | チャンク挿入            | テーブルが作成済み       | chunksにレコード挿入      | レコードが挿入される                       |          |      |
| 5   | INSERT           | FTSインデックス自動更新 | チャンク挿入済み         | FTSテーブル確認           | FTSインデックスが更新される                |          |      |
| 6   | 検索             | キーワード検索          | データが挿入済み         | searchChunksByKeyword実行 | 関連チャンクが返される                     |          |      |
| 7   | 検索             | フレーズ検索            | データが挿入済み         | searchChunksByPhrase実行  | フレーズにマッチするチャンクが返される     |          |      |
| 8   | 検索             | NEAR検索                | データが挿入済み         | searchChunksByNear実行    | 近接するキーワードを含むチャンクが返される |          |      |
| 9   | 検索             | BM25スコアリング        | データが挿入済み         | BM25スコア確認            | スコアが正しく計算される                   |          |      |
| 10  | 検索             | スニペット生成          | データが挿入済み         | スニペット確認            | スニペットが正しく生成される               |          |      |
| 11  | UPDATE           | チャンク更新            | チャンクが存在           | chunksレコード更新        | レコードが更新される                       |          |      |
| 12  | UPDATE           | FTSインデックス自動更新 | チャンク更新済み         | FTSテーブル確認           | FTSインデックスが更新される                |          |      |
| 13  | DELETE           | チャンク削除            | チャンクが存在           | chunksレコード削除        | レコードが削除される                       |          |      |
| 14  | DELETE           | FTSインデックス自動削除 | チャンク削除済み         | FTSテーブル確認           | FTSインデックスが削除される                |          |      |
| 15  | CASCADE          | ファイル削除時のCASCADE | ファイルとチャンクが存在 | filesレコード削除         | 関連チャンクも削除される                   |          |      |

#### テスト実行手順

1. テスト用データベースの準備
2. マイグレーション実行
3. テストデータ挿入
4. 各テスト項目の実行
5. 結果の記録

#### 成果物

| 成果物             | パス                                                                        | 内容           |
| ------------------ | --------------------------------------------------------------------------- | -------------- |
| 手動テストレポート | `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md` | 手動テスト結果 |

#### 完了条件

- [ ] 全テスト項目が実行されている
- [ ] 全テスト項目がパスしている
- [ ] 手動テストレポートが作成されている
- [ ] 問題が発見された場合、対応方針が明記されている

#### 依存関係

- **前提**: T-07-1（最終コードレビュー実施）
- **後続**: T-09-1（ドキュメント更新）

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: システムドキュメント更新

#### 目的

master_system_design.md等のプロジェクトドキュメントを更新し、chunksテーブルとFTS5の実装内容を反映する。

#### 背景

実装内容をドキュメントに反映し、プロジェクト全体の整合性を保つ。特にmaster_system_design.mdのデータベース設計セクションを更新する。

#### 責務（単一責務）

システムドキュメント更新のみを担当する。

#### 前提条件

- [ ] Phase 6の品質ゲートをすべて通過
- [ ] Phase 7の最終レビューゲートを通過
- [ ] Phase 8の手動テストが完了
- [ ] すべてのテストが成功

---

#### サブタスク 9.1: システムドキュメント更新

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:update-all-docs
```

#### 目的

プロジェクト全体のドキュメントを更新し、chunksテーブルとFTS5の実装内容を反映する。

#### 背景

実装内容をドキュメントに反映し、プロジェクト全体の整合性を保つ。

#### 責務（単一責務）

システムドキュメントの更新のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                        | 内容                               |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`       | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`           | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`             | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md`      | 設計レビューの結果と指摘事項       |
| テストレポート       | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`        | テスト実行結果                     |
| 最終レビューレポート | `docs/30-workflows/rag-conversion-system/final-review-chunks-fts5.md`       | 最終レビューの結果と指摘事項       |
| 手動テストレポート   | `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md` | 手動テスト結果                     |

##### 更新対象ドキュメント

- `docs/00-requirements/master_system_design.md`
  - データベース設計セクションにchunksテーブルとFTS5の情報を追加
  - ER図の更新

##### 更新原則

- 概要のみ記載（詳細な実装説明は不要）
- システム構築に必要十分な情報のみ追記
- 既存ドキュメントの構造・フォーマットを維持
- Single Source of Truth原則を遵守

##### 更新手順

**1. Requirementsドキュメントの更新**

ワークツリー上で実装した内容を `docs/00-requirements/` の適切なドキュメントに追記する。

- 実装内容に関連する要件ファイルを特定
- 該当セクションに概要レベルの情報を追記
- 既存の構造・フォーマットを維持

**2. スキルドキュメントの更新（該当する場合）**

`docs/00-requirements/requirements-skill-map.json` を参照し、更新したRequirementsファイルに関連するスキルも更新する。

手順:

1. `requirements-skill-map.json` を開く
2. 更新したRequirementsファイルのエントリを確認
3. `"skills"` 配列に記載されているスキル名を確認
4. 該当するスキル（`.claude/skills/<スキル名>/SKILL.md`）を開く
5. `## 📚 Requirements References` セクションに追記（不足している場合のみ）
6. スキル内容が古い場合は必要に応じて更新

例: `docs/00-requirements/05-architecture.md` を更新した場合

- `requirements-skill-map.json` で確認 → `"architectural-patterns"`, `"clean-architecture-principles"` などがマッピングされている
- `.claude/skills/architectural-patterns/SKILL.md` の Requirements References セクションを確認・更新
- `.claude/skills/clean-architecture-principles/SKILL.md` の Requirements References セクションを確認・更新

---

#### サブタスク 9.2: 未完了タスク・追加タスク記録

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
# 現時点では専用のスラッシュコマンドは存在しません
# 手動でタスクファイルを作成してください
```

- **選定方法**: コマンドリストの「トリガーキーワード」と「目的」を参照し、タスクに最も適したコマンドを選択

#### 目的

実装中に発見された未完了タスクや追加で必要なタスクを記録し、後続の実装者が取り組めるようにする。

#### 背景

実装中に判明したが今回のスコープ外となったタスク、または改善提案として残すべき項目を記録する。

#### 責務（単一責務）

未完了タスク・追加タスクの記録のみを担当する。

#### 参照資料

| 参照資料             | パス                                                                        | 内容                               |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| 要件定義書           | `docs/30-workflows/rag-conversion-system/requirements-chunks-fts5.md`       | chunksテーブルとFTS5の詳細要件     |
| chunksスキーマ設計書 | `docs/30-workflows/rag-conversion-system/design-chunks-schema.md`           | chunksテーブルのスキーマ設計書     |
| FTS5設計書           | `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`             | FTS5仮想テーブルとトリガーの設計書 |
| 設計レビューレポート | `docs/30-workflows/rag-conversion-system/design-review-chunks-fts5.md`      | 設計レビューの結果と指摘事項       |
| テストレポート       | `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`        | テスト実行結果                     |
| 最終レビューレポート | `docs/30-workflows/rag-conversion-system/final-review-chunks-fts5.md`       | 最終レビューの結果と指摘事項       |
| 手動テストレポート   | `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md` | 手動テスト結果                     |

##### 出力先

`docs/30-workflows/unassigned-task/`

##### 記録対象タスク一覧

実装中に発見された未完了タスクや追加タスクをリストアップし、各タスクの指示書を作成する。

##### ファイル命名規則

- 要件系: `requirements-{{機能領域}}.md`
- 改善系: `task-{{改善領域}}-improvements.md`

##### 指示書としての品質基準

生成されるタスク指示書は以下を満たすこと：

**Why（なぜ必要か）**

- [ ] 背景が明確に記述されている
- [ ] 問題点・課題が具体的に説明されている
- [ ] 放置した場合の影響が記載されている

**What（何を達成するか）**

- [ ] 目的が明確に定義されている
- [ ] 最終ゴールが具体的に記述されている
- [ ] スコープ（含む/含まない）が明記されている
- [ ] 成果物が一覧化されている

**How（どのように実行するか）**

- [ ] 前提条件が明記されている
- [ ] 依存タスクが特定されている
- [ ] 必要な知識・スキルが記載されている
- [ ] 推奨アプローチが説明されている

**実行手順**

- [ ] フェーズ構成が明確である
- [ ] 各フェーズにClaude Codeスラッシュコマンド（/ai:xxx形式）が記載されている
- [ ] 各フェーズの成果物・完了条件が定義されている

**検証・完了**

- [ ] 完了条件チェックリストがある
- [ ] テストケース/検証方法が記載されている
- [ ] リスクと対策が検討されている

---

#### 成果物

| 成果物                             | パス                                                | 内容                           |
| ---------------------------------- | --------------------------------------------------- | ------------------------------ |
| 更新されたmaster_system_design.md  | `docs/00-requirements/master_system_design.md`      | chunksテーブル情報を含む設計書 |
| 更新されたREADME.md                | `docs/30-workflows/rag-conversion-system/README.md` | タスク完了状況                 |
| 未完了タスク指示書（該当する場合） | `docs/30-workflows/unassigned-task/task-*.md`       | 未完了タスクの指示書           |

#### 完了条件

- [ ] master_system_design.mdが更新されている
- [ ] README.mdが更新されている
- [ ] タスクファイルがcompleted-tasksに移動されている
- [ ] 全ドキュメントが整合性を保っている
- [ ] 未完了タスクが記録されている（該当する場合）
- [ ] 未完了タスク指示書が品質基準を満たしている

#### 依存関係

- **前提**: T-08-1（手動テスト実施）
- **後続**: T-10-1（差分確認・コミット作成）

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:commit
```

- **参照**: `.claude/commands/ai/commit.md`
- **トリガーキーワード**: commit, git commit, conventional commits

#### 目的

Git差分を確認し、Conventional Commitsに準拠したコミットを作成する。

#### 背景

変更内容を整理し、意味のあるコミットメッセージを作成する。Conventional Commits形式に従うことで、CHANGELOGの自動生成が可能になる。

#### 責務（単一責務）

Git差分確認とコミット作成のみを担当する。

#### 実行手順

**1. Worktreeディレクトリ内で差分確認**

```bash
# 現在のディレクトリ確認
pwd  # .worktrees/task-XXX であることを確認

# Git状態確認
git status

# 差分確認
git diff

# ステージング状態確認
git diff --staged
```

**2. ステージングとコミット**

```bash
# 変更ファイルをステージング
git add packages/shared/src/db/schema/chunks.ts
git add packages/shared/src/db/schema/chunks-fts.ts
git add packages/shared/src/db/queries/chunks-search.ts
git add packages/shared/src/db/schema/relations.ts
git add packages/shared/src/db/migrations/0004_create_chunks_table.sql
git add packages/shared/src/db/migrations/0005_create_chunks_fts.sql
git add packages/shared/src/db/schema/__tests__/chunks.test.ts
git add packages/shared/src/db/queries/__tests__/chunks-search.test.ts
git add docs/

# コミット作成（Conventional Commits形式）
git commit -m "$(cat <<'EOF'
feat(shared): chunksテーブルとFTS5検索基盤を実装

- chunksテーブルスキーマを実装（Drizzle ORM）
- FTS5仮想テーブルとトリガーを実装
- BM25ベースのキーワード検索・フレーズ検索・NEAR検索を実装
- filesとchunksのリレーションを定義
- マイグレーションファイルを作成
- 単体テストを追加（カバレッジ80%以上）
- ドキュメントを更新

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 (1M context) <noreply@anthropic.com>
EOF
)"
```

**3. コミット確認**

```bash
# コミットログ確認
git log -1

# ブランチ確認
git branch --show-current
```

#### 成果物

| 成果物      | パス | 内容                               |
| ----------- | ---- | ---------------------------------- |
| Gitコミット | -    | Conventional Commits形式のコミット |

#### 完了条件

- [ ] 差分が確認されている
- [ ] 全変更がステージングされている
- [ ] Conventional Commits形式のコミットが作成されている
- [ ] コミットメッセージが適切である

#### 依存関係

- **前提**: T-09-1（ドキュメント更新）
- **後続**: T-10-2（PR作成）

---

### T-10-2: PR作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}`) 内で実行してください

```
/ai:create-pr main
```

- **参照**: `.claude/commands/ai/create-pr.md`
- **トリガーキーワード**: pull request, pr, create pr

#### 目的

GitHub Pull Requestを作成し、レビューとマージの準備を行う。

#### 背景

Worktreeブランチをリモートにプッシュし、mainブランチへのPRを作成する。PR作成時には、変更内容のサマリーとテスト結果を記載する。

#### 責務（単一責務）

PR作成のみを担当する。

#### 実行手順

**1. ブランチプッシュ**

```bash
# リモートブランチにプッシュ
git push -u origin <branch-name>
```

**2. PR作成**

```bash
# GitHub CLIでPR作成
gh pr create --title "feat(shared): chunksテーブルとFTS5検索基盤を実装" --body "$(cat <<'EOF'
## 概要
CONV-04-03タスクの実装: chunksテーブルとFTS5検索基盤を実装しました。

## 変更内容
- ✅ chunksテーブルスキーマを実装（Drizzle ORM）
- ✅ FTS5仮想テーブルとトリガーを実装
- ✅ BM25ベースのキーワード検索・フレーズ検索・NEAR検索を実装
- ✅ filesとchunksのリレーションを定義
- ✅ マイグレーションファイルを作成
- ✅ 単体テストを追加（カバレッジ80%以上）
- ✅ ドキュメントを更新

## テスト結果
- ✅ 全ユニットテストがパス
- ✅ テストカバレッジ: 80%以上
- ✅ 手動テスト: 全15項目パス
- ✅ マイグレーション正常実行確認済み

## レビュー観点
- スキーマ設計の妥当性
- FTS5設定の適切性
- 検索クエリの効率性
- テストカバレッジの十分性

## 依存関係
- CONV-04-01（Drizzle ORM セットアップ）に依存

## 関連ドキュメント
- `docs/30-workflows/rag-conversion-system/design-chunks-fts5.md`
- `docs/30-workflows/rag-conversion-system/test-report-chunks-fts5.md`
- `docs/30-workflows/rag-conversion-system/manual-test-report-chunks-fts5.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

#### 成果物

| 成果物              | パス      | 内容     |
| ------------------- | --------- | -------- |
| GitHub Pull Request | GitHub UI | PRの作成 |

#### 完了条件

- [ ] ブランチがリモートにプッシュされている
- [ ] PRが作成されている
- [ ] PR本文が適切である
- [ ] PR番号が取得できている

#### 依存関係

- **前提**: T-10-1（差分確認・コミット作成）
- **後続**: T-10-3（CI/CD完了確認）

---

### T-10-3: CI/CD完了確認

#### Claude Code スラッシュコマンド

> ⚠️ 現時点では専用のスラッシュコマンドは存在しません

```
# 以下のBashコマンド（gh CLI）を使用してください
# 実行手順を参照
```

#### 目的

CI/CDパイプラインの完了を確認し、全チェックがパスしたことを確認する。

#### 背景

PR作成後、GitHub ActionsによるCI/CDが実行される。全チェックがパスしたことを確認し、マージ可能であることをユーザーに通知する。

#### 責務（単一責務）

CI/CD完了確認とマージ可能通知のみを担当する。

#### 実行手順

**1. PR番号取得**

```bash
PR_NUMBER=$(gh pr view --json number -q .number)
echo "PR Number: $PR_NUMBER"
```

**2. CIステータス確認（待機ループ）**

```bash
for i in {1..10}; do
  gh pr checks ${PR_NUMBER}
  if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
    echo "CI実行中... ($i/10) 30秒後に再確認します"
    sleep 30
  else
    echo "CI完了"
    break
  fi
done
```

**3. 全チェックがpassであることを確認**

```bash
gh pr checks ${PR_NUMBER}
```

**4. ユーザーへマージ可能通知**
AIはユーザーに以下を報告する：

- PR作成完了の通知
  - PR URL
  - PR番号
  - タイトル

- CI/CD結果の報告
  - 全チェックがパスしたか
  - 失敗したチェックがあればその内容

- マージ準備完了の確認
  - 「全チェックがパスしました。GitHub UIでPRをマージしてください」

#### 成果物

| 成果物         | パス | 内容             |
| -------------- | ---- | ---------------- |
| マージ可能通知 | -    | ユーザーへの通知 |

#### 完了条件

- [ ] CI/CDが完了している
- [ ] 全チェックがパスしている
- [ ] ユーザーにマージ可能が通知されている

#### 依存関係

- **前提**: T-10-2（PR作成）
- **後続**: なし（ユーザーが手動でマージ）

---

## リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                    |
| ---------------------------------- | ------ | -------- | ------------------------------------------------------- |
| FTS5がlibSQLでサポートされていない | 高     | 低       | 事前にlibSQLのFTS5サポートを確認済み                    |
| マイグレーション実行時のエラー     | 中     | 中       | ロールバック手順を準備、テスト環境で事前検証            |
| 日本語検索がうまく動作しない       | 中     | 中       | unicode61トークナイザーの設定を確認、テストデータで検証 |
| BM25スコアの計算が不正確           | 低     | 低       | 正規化関数をテスト、実データで検証                      |
| パフォーマンス問題                 | 中     | 中       | インデックス戦略を見直し、クエリ最適化                  |
| テストカバレッジ不足               | 低     | 低       | Phase 6でカバレッジ確認、不足箇所を補完                 |

---

## 参照情報

### 関連ドキュメント

- `docs/30-workflows/unassigned-task/task-04-03-chunks-fts5.md` - 元のタスクファイル
- `docs/00-requirements/master_system_design.md` - システム設計書
- `docs/00-requirements/task-orchestration-specification.md` - タスク分解仕様書

### 参考資料

- [SQLite FTS5 Extension](https://www.sqlite.org/fts5.html) - FTS5公式ドキュメント
- [Drizzle ORM Documentation](https://orm.drizzle.team/) - Drizzle ORM公式ドキュメント
- [libSQL Documentation](https://github.com/tursodatabase/libsql) - libSQL公式ドキュメント
- [BM25 Algorithm](https://en.wikipedia.org/wiki/Okapi_BM25) - BM25アルゴリズム解説

---

## 備考

### レビュー指摘の原文（該当する場合）

該当なし（新規タスク）

### 補足事項

- FTS5はSQLite標準拡張で、libSQLでもサポートされている
- `tokenize='unicode61 remove_diacritics 2'` で日本語を含むUnicode文字を適切に処理
- BM25スコアは負の値で返される（小さいほど関連度が高い）ため、正規化が必要
- contextualContentはContextual Retrieval用のLLM生成コンテキスト
- 既存データがある場合、FTS5テーブルの再構築が必要（`INSERT INTO chunks_fts(chunks_fts) VALUES('rebuild')`）
- Worktree作成後、必ずそのディレクトリ内で作業すること
- PRマージはユーザーがGitHub UIで手動実行する

---

## タスク仕様書チェックリスト

**基本情報**

- [x] ユーザーの元の指示が記載されている
- [x] メタ情報が適切に記載されている
- [x] タスク概要が明確である
- [x] 最終ゴールが具体的である
- [x] 成果物一覧が網羅的である

**タスク分解**

- [x] Phase -1（環境準備）が含まれている
- [x] Phase 0（要件定義）が含まれている
- [x] Phase 1（設計）が含まれている
- [x] Phase 2（設計レビューゲート）が含まれている
- [x] Phase 3（テスト作成）が含まれている
- [x] Phase 4（実装）が含まれている
- [x] Phase 5（リファクタリング）が含まれている
- [x] Phase 6（品質保証）が含まれている
- [x] Phase 7（最終レビューゲート）が含まれている
- [x] Phase 8（手動テスト）が含まれている
- [x] Phase 9（ドキュメント更新）が含まれている
- [x] Phase 10（PR作成・CI確認）が含まれている
- [x] 各サブタスクが単一責務である
- [x] 依存関係が明確である

**コマンド選定**

- [x] 各フェーズにClaude Codeスラッシュコマンドが記載されている
- [x] コマンドが適切に選定されている
- [x] コマンドが/ai:プレフィックス付きである
- [x] 参照ファイルが明記されている

**品質基準**

- [x] 完了条件が明確である
- [x] 成果物が具体的である
- [x] レビュー観点が明確である
- [x] テストカバレッジ目標が設定されている

**ドキュメント**

- [x] リスクと対策が記載されている
- [x] 参照情報が記載されている
- [x] 備考が記載されている
- [x] トラブルシューティングが記載されている

---

**タスク仕様書作成完了日**: 2025-12-26
