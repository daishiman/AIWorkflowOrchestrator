# CONV-04-01: Drizzle ORM セットアップ - タスク実行仕様書

## ユーザーからの元の指示

```
チャット関係とラグのシステムの構築関係で今実装を進めようとしています。
これでコンフリクトが起きなくて、優先度の高い実装は何かというところを次のミタスクから選択してください。
一つだけ選定してほしいです。優先度高いものです。
@docs/30-workflows/unassigned-task

→ 選定結果: CONV-04-01: Drizzle ORMセットアップ
→ 理由: RAGシステム全体のデータベース操作の基礎となる基盤タスク。
  規模が小さく、依存が少なく、コンフリクトリスクが低い。
  これが完了しないと他のDB関連タスク（CONV-04-02〜CONV-08）が進められない。
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | CONV-04-01                               |
| Worktreeパス | `.worktrees/task-{{timestamp}}-{{hash}}` |
| ブランチ名   | `task-{{timestamp}}-{{hash}}`            |
| タスク名     | Drizzle ORM セットアップ                 |
| 分類         | 要件（新規機能の基盤実装）               |
| 対象機能     | RAGパイプライン - データベース基盤       |
| 優先度       | 高                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 作成日       | 2025-12-24                               |

---

## タスク概要

### 目的

libSQL/Tursoと統合するDrizzle ORMの基盤設定を行い、すべてのデータベーステーブル実装（CONV-04-02〜06）の基盤を構築する。

### 背景

HybridRAG（GraphRAG + VectorRAG統合）パイプラインを実装するには、データベース操作の基盤が必要。
Drizzle ORMはTypeScript完全型安全で、libSQL/Tursoとの連携に最適。
本タスクでは、テーブル定義は行わず、ORM設定・クライアント・共通ユーティリティの基盤のみを実施する。

### 最終ゴール

- Drizzle ORMがpackages/sharedにセットアップされている
- libSQLクライアントが正常に接続できる
- トランザクション・ヘルスチェック等の基本機能が実装されている
- 共通カラム定義（timestamps, metadata, softDelete）が利用可能
- 環境変数スキーマが定義・検証されている
- マイグレーション実行環境が整っている

### 成果物一覧

| 種別         | 成果物                   | 配置先                                                                 |
| ------------ | ------------------------ | ---------------------------------------------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-{{timestamp}}-{{hash}}`                               |
| 機能         | Drizzle ORM基盤          | `packages/shared/src/db/`                                              |
| 機能         | Drizzle設定ファイル      | `packages/shared/drizzle.config.ts`                                    |
| 機能         | データベースクライアント | `packages/shared/src/db/client.ts`                                     |
| 機能         | 共通スキーマ定義         | `packages/shared/src/db/schema/common.ts`                              |
| 機能         | 環境変数定義             | `packages/shared/src/db/env.ts`                                        |
| 機能         | ユーティリティ関数       | `packages/shared/src/db/utils.ts`                                      |
| ドキュメント | タスク実行仕様書         | `docs/30-workflows/rag-pipeline/task-conv-04-01-drizzle-setup-spec.md` |
| 品質         | ユニットテスト           | `packages/shared/src/db/__tests__/`                                    |
| PR           | GitHub Pull Request      | GitHub UI                                                              |

---

## 参照ファイル

本仕様書のコマンド・エージェント・スキル選定は以下を参照：

- `docs/00-requirements/master_system_design.md` - システム要件
- `.claude/commands/ai/command_list.md` - /ai:コマンド定義
- `.claude/agents/agent_list.md` - エージェント定義
- `.claude/skills/skill_list.md` - スキル定義
- `.kamui/prompt/merge-prompt.txt` - Git/PRワークフロー

---

## タスク分解サマリー

> ⚠️ **T-07-1最終レビュー結果による追加タスク**
> 2025-12-25のレビューで以下のP0改善ポイントが判明し、Phase 1とPhase 4に追加タスクを挿入しました。

| ID          | フェーズ    | サブタスク名                       | 責務                                                   | 依存        |
| ----------- | ----------- | ---------------------------------- | ------------------------------------------------------ | ----------- |
| T--1-1      | Phase -1    | Git Worktree環境作成               | 独立した作業環境の構築                                 | なし        |
| T-00-1      | Phase 0     | 要件定義書作成                     | Drizzle ORM導入要件の明確化                            | T--1-1      |
| T-01-1      | Phase 1     | データベースアーキテクチャ設計     | libSQL/Drizzle構成設計                                 | T-00-1      |
| T-01-2      | Phase 1     | 共通スキーマ設計                   | 共通カラム・型定義の設計                               | T-01-1      |
| **T-01-3**  | **Phase 1** | **スキーマ詳細設計**               | **実テーブル（chatHistory等）のスキーマ定義設計**      | **T-01-2**  |
| **T-01-4**  | **Phase 1** | **インデックス戦略設計**           | **クエリパターン分析とインデックス設計**               | **T-01-3**  |
| T-02-1      | Phase 2     | 設計レビュー実施                   | アーキテクチャ・スキーマの妥当性検証                   | T-01-4      |
| T-03-1      | Phase 3     | クライアント接続テスト作成         | DB接続・ヘルスチェックのテストコード作成               | T-02-1      |
| T-03-2      | Phase 3     | トランザクションテスト作成         | トランザクション実行のテストコード作成                 | T-03-1      |
| T-04-1      | Phase 4     | 依存パッケージインストール         | drizzle-orm, @libsql/client, drizzle-kitのインストール | T-03-2      |
| T-04-2      | Phase 4     | Drizzle設定ファイル実装            | drizzle.config.ts作成                                  | T-04-1      |
| T-04-3      | Phase 4     | データベースクライアント実装       | client.ts実装                                          | T-04-2      |
| T-04-4      | Phase 4     | 共通スキーマ定義実装               | schema/common.ts実装                                   | T-04-3      |
| **T-04-4a** | **Phase 4** | **スキーマディレクトリ作成**       | **schema/ディレクトリ構築とindex.ts作成**              | **T-04-4**  |
| **T-04-4b** | **Phase 4** | **実テーブルスキーマ実装**         | **chatHistory等の実テーブル実装**                      | **T-04-4a** |
| **T-04-4c** | **Phase 4** | **インデックス定義実装**           | **主要インデックスの実装と検証**                       | **T-04-4b** |
| T-04-5      | Phase 4     | 環境変数定義実装                   | env.ts実装                                             | T-04-4c     |
| T-04-6      | Phase 4     | ユーティリティ関数実装             | utils.ts実装                                           | T-04-5      |
| T-04-7      | Phase 4     | マイグレーションスクリプト実装     | migrate.ts実装                                         | T-04-6      |
| T-04-8      | Phase 4     | package.jsonスクリプト追加         | db:generate等のスクリプト追加                          | T-04-7      |
| T-04-9      | Phase 4     | バレルエクスポート実装             | index.ts実装                                           | T-04-8      |
| **T-04-10** | **Phase 4** | **初回マイグレーション生成・検証** | **db:generateで実マイグレーション生成と検証**          | **T-04-9**  |
| T-05-1      | Phase 5     | コード品質改善                     | リファクタリング・最適化                               | T-04-10     |
| T-06-1      | Phase 6     | Lint・型チェック実行               | 品質ゲート検証                                         | T-05-1      |
| T-06-2      | Phase 6     | テストカバレッジ確認               | カバレッジ基準達成確認                                 | T-06-1      |
| T-07-1      | Phase 7     | 最終レビュー実施                   | 全成果物の最終検証                                     | T-06-2      |
| **T-07-2**  | **Phase 7** | **P0改善対応**                     | **MAJORレビュー指摘事項の解消**                        | **T-07-1**  |
| T-08-1      | Phase 8     | 手動動作確認                       | 実際のDB接続・マイグレーション実行確認                 | T-07-2      |
| T-09-1      | Phase 9     | システムドキュメント更新           | master_system_design.md等の更新                        | T-08-1      |
| T-09-2      | Phase 9     | 未完了タスク記録                   | 後続タスク（CONV-04-02等）の指示書作成                 | T-09-1      |
| T-10-1      | Phase 10    | コミット作成                       | Conventional Commits形式でコミット                     | T-09-2      |
| T-10-2      | Phase 10    | PR作成                             | GitHub Pull Request作成                                | T-10-1      |
| T-10-3      | Phase 10    | PR補足コメント追加                 | 技術的詳細のコメント投稿                               | T-10-2      |
| T-10-4      | Phase 10    | CI/CD完了確認                      | GitHub Actions完了待機                                 | T-10-3      |
| T-10-5      | Phase 10    | マージ可能通知                     | ユーザーへの通知                                       | T-10-4      |

**総サブタスク数**: 34個（追加7タスク）

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

#### 目的

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチに影響を与えずに開発を進める。

#### 背景

複数タスクの並行開発や実験的な変更のため、各タスクごとに独立したWorktreeで作業を行う必要がある。
これにより、本体ブランチを保護し、タスク間の干渉を防ぐ。

#### 責務（単一責務）

Git Worktree環境の作成と初期化のみを担当する。

#### Claude Code スラッシュコマンド（該当する場合）

> ⚠️ 該当コマンドなし - 以下の手動手順で実行

#### 実行手順

**1. タスク識別子の生成**

```bash
TASK_ID="task-$(date +%s)-$(openssl rand -hex 4)"
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
pnpm build
```

#### 使用エージェント

- **エージェント**: なし（Bashコマンド直接実行）
- **選定理由**: 定型的なGit操作のためエージェント不要

#### 成果物

| 成果物           | パス                                     | 内容                             |
| ---------------- | ---------------------------------------- | -------------------------------- |
| Git Worktree環境 | `.worktrees/task-{{timestamp}}-{{hash}}` | 独立した作業ディレクトリ         |
| 新規ブランチ     | `task-{{timestamp}}-{{hash}}`            | タスク専用ブランチ               |
| 初期化済み環境   | -                                        | 依存関係インストール・ビルド完了 |

#### 完了条件

- [ ] Git Worktreeが正常に作成されている
- [ ] 新規ブランチが作成されている（`git branch --show-current`で確認）
- [ ] Worktreeディレクトリへ移動済み
- [ ] 依存関係がインストールされている（`node_modules/`が存在）
- [ ] ビルドが成功する（`pnpm build`が成功）
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

#### 目的

Drizzle ORM導入の要件を明確化し、実装の方向性を定める。

#### 背景

HybridRAGパイプライン構築のデータベース基盤として、Drizzle ORMの導入要件を整理する必要がある。
libSQL/Turso互換性、型安全性、マイグレーション戦略などを明確にする。

#### 責務（単一責務）

Drizzle ORM導入の要件定義のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:gather-requirements drizzle-orm-setup
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: データベース設計・ORM選定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                         | 活用方法                    |
| ------------------------------------------------ | --------------------------- |
| `.claude/skills/database-normalization/SKILL.md` | スキーマ設計原則の適用      |
| `.claude/skills/architectural-patterns/SKILL.md` | Repository パターン等の検討 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物     | パス                                                        | 内容                  |
| ---------- | ----------------------------------------------------------- | --------------------- |
| 要件定義書 | `docs/30-workflows/rag-pipeline/conv-04-01-requirements.md` | Drizzle ORM導入の要件 |

#### 完了条件

- [ ] 要件定義書が作成されている
- [ ] libSQL/Turso互換性要件が明記されている
- [ ] 型安全性要件が明記されている
- [ ] マイグレーション戦略が定義されている
- [ ] 共通カラム定義の要件が明記されている
- [ ] 環境変数管理の要件が明記されている

#### 依存関係

- **前提**: T--1-1（Git Worktree環境作成）
- **後続**: T-01-1（データベースアーキテクチャ設計）

---

## Phase 1: 設計

### T-01-1: データベースアーキテクチャ設計

#### 目的

libSQL/Drizzle ORM統合のアーキテクチャを設計する。

#### 背景

Drizzle ORMとlibSQLクライアントの統合、トランザクション管理、接続プーリング等のアーキテクチャを設計する必要がある。

#### 責務（単一責務）

データベースアーキテクチャ設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:design-architecture drizzle-libsql-integration
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/arch-police.md`
- **選定理由**: アーキテクチャ設計・検証の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                                | 活用方法                       |
| ------------------------------------------------------- | ------------------------------ |
| `.claude/skills/architectural-patterns/SKILL.md`        | レイヤードアーキテクチャの適用 |
| `.claude/skills/clean-architecture-principles/SKILL.md` | 依存性逆転原則の適用           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                                        | 内容                             |
| -------------------- | ----------------------------------------------------------- | -------------------------------- |
| アーキテクチャ設計書 | `docs/30-workflows/rag-pipeline/conv-04-01-architecture.md` | libSQL/Drizzle統合アーキテクチャ |

#### 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] クライアント構成が設計されている
- [ ] トランザクション管理方式が設計されている
- [ ] 接続管理方式が設計されている
- [ ] ヘルスチェック機構が設計されている
- [ ] エラーハンドリング方針が定義されている

#### 依存関係

- **前提**: T-00-1（要件定義書作成）
- **後続**: T-01-2（スキーマ設計）

---

### T-01-2: スキーマ設計

#### 目的

共通カラム定義・型定義の設計を行う。

#### 背景

全テーブルで共有する共通カラム（timestamps, metadata, softDelete）、
UUID主キー、JSON型等の設計を行う必要がある。

#### 責務（単一責務）

共通スキーマ設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:create-db-schema common-columns
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: スキーマ設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                         | 活用方法                 |
| ------------------------------------------------ | ------------------------ |
| `.claude/skills/database-normalization/SKILL.md` | 正規化原則の適用         |
| `.claude/skills/type-safety-patterns/SKILL.md`   | TypeScript型安全性の確保 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物         | パス                                                         | 内容                     |
| -------------- | ------------------------------------------------------------ | ------------------------ |
| スキーマ設計書 | `docs/30-workflows/rag-pipeline/conv-04-01-schema-design.md` | 共通カラム・型定義の設計 |

#### 完了条件

- [ ] スキーマ設計書が作成されている
- [ ] UUID主キーの設計が完了している
- [ ] timestampsカラムの設計が完了している
- [ ] metadataカラムの設計が完了している
- [ ] softDeleteカラムの設計が完了している
- [ ] 型定義の設計が完了している

#### 依存関係

- **前提**: T-01-1（データベースアーキテクチャ設計）
- **後続**: T-01-3（スキーマ詳細設計）

---

### T-01-3: スキーマ詳細設計 ⚠️ **追加タスク**

#### 目的

実際に使用するテーブル（chat_sessions, chat_messages等）のスキーマを詳細設計する。

#### 背景

**T-07-1最終レビュー（MAJOR判定）で判明した問題**:

- ❌ `schema/` ディレクトリが存在しない
- ❌ テーブル定義が未実装
- ❌ リレーション定義が不明確

共通カラム定義だけでなく、実際のテーブル構造を設計しないと、マイグレーション生成・実行ができません。

#### 責務（単一責務）

実テーブルスキーマの詳細設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:create-db-schema chat-history-tables
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: データベーススキーマ設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法             |
| ------------------------------------------------- | -------------------- |
| `.claude/skills/database-normalization/SKILL.md`  | 正規化・外部キー設計 |
| `.claude/skills/type-safety-patterns/SKILL.md`    | Drizzle型定義        |
| `.claude/skills/foreign-key-constraints/SKILL.md` | リレーション設計     |

- **参照**: `.claude/skills/skill_list.md`

#### 設計対象テーブル

1. **chat_sessions**
   - id (PRIMARY KEY)
   - title
   - created_at, updated_at
   - metadata (JSON)

2. **chat_messages**
   - id (PRIMARY KEY)
   - session_id (FOREIGN KEY → chat_sessions.id)
   - role (user/assistant/system)
   - content (TEXT)
   - created_at
   - metadata (JSON)

#### 成果物

| 成果物               | パス                                                               | 内容                         |
| -------------------- | ------------------------------------------------------------------ | ---------------------------- |
| テーブルスキーマ設計 | `docs/30-workflows/rag-pipeline/conv-04-01-table-schema-design.md` | 実テーブルの詳細スキーマ設計 |

#### 完了条件

- [ ] chat_sessionsテーブルスキーマが設計されている
- [ ] chat_messagesテーブルスキーマが設計されている
- [ ] 外部キー制約が定義されている
- [ ] インデックス候補がリストアップされている
- [ ] 型定義（Drizzle）が明記されている

#### 依存関係

- **前提**: T-01-2（共通スキーマ設計）
- **後続**: T-01-4（インデックス戦略設計）

---

### T-01-4: インデックス戦略設計 ⚠️ **追加タスク**

#### 目的

クエリパターンを分析し、必要なインデックスを設計する。

#### 背景

**T-07-1最終レビュー（CRITICAL判定）で判明した問題**:

- ❌ インデックス定義が一切存在しない
- ❌ クエリパターン分析が未実施
- ❌ 複合インデックスの検討がない

インデックスなしでは全テーブルスキャンが発生し、パフォーマンスが致命的に悪化します。

#### 責務（単一責務）

インデックス戦略の設計のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:design-architecture database-index-strategy
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/dba-mgr.md`
- **選定理由**: インデックス最適化の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法               |
| -------------------------------------------------- | ---------------------- |
| `.claude/skills/indexing-strategies/SKILL.md`      | インデックス種類の選定 |
| `.claude/skills/query-performance-tuning/SKILL.md` | クエリパターン分析     |

- **参照**: `.claude/skills/skill_list.md`

#### 分析対象クエリパターン

1. **セッション一覧取得** (`SELECT * FROM chat_sessions ORDER BY updated_at DESC`)
2. **特定セッションのメッセージ取得** (`SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC`)
3. **検索** (`SELECT * FROM chat_messages WHERE content LIKE ?`)

#### 成果物

| 成果物             | パス                                                                 | 内容                   |
| ------------------ | -------------------------------------------------------------------- | ---------------------- |
| インデックス設計書 | `docs/30-workflows/rag-pipeline/conv-04-01-index-strategy-design.md` | インデックス戦略・定義 |

#### 完了条件

- [ ] クエリパターンが分析されている
- [ ] 主要インデックスが設計されている（最低3つ）
- [ ] 複合インデックスの必要性が検討されている
- [ ] EXPLAIN QUERY PLANの想定結果が記載されている
- [ ] インデックス命名規則が定義されている

#### 依存関係

- **前提**: T-01-3（スキーマ詳細設計）
- **後続**: T-02-1（設計レビュー実施）

---

## Phase 2: 設計レビューゲート

### T-02-1: 設計レビュー実施

#### 目的

アーキテクチャ・スキーマ設計の妥当性を検証する。

#### 背景

実装前に設計の問題点を発見し、手戻りを防ぐ必要がある。

#### レビュー参加エージェント

| エージェント                     | レビュー観点               | 選定理由                   |
| -------------------------------- | -------------------------- | -------------------------- |
| `.claude/agents/arch-police.md`  | アーキテクチャパターン遵守 | アーキテクチャ検証の専門家 |
| `.claude/agents/db-architect.md` | スキーマ設計妥当性         | データベース設計の専門家   |
| `.claude/agents/sec-auditor.md`  | セキュリティ考慮事項       | セキュリティ検証の専門家   |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:review-architecture database-foundation
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**アーキテクチャパターン遵守** (`.claude/agents/arch-police.md`)

- [ ] レイヤードアーキテクチャに準拠しているか
- [ ] 依存性逆転原則が適用されているか
- [ ] 単一責務原則が守られているか
- [ ] インターフェース分離原則が適用されているか

**スキーマ設計妥当性** (`.claude/agents/db-architect.md`)

- [ ] 正規化が適切に行われているか
- [ ] インデックス戦略が適切か
- [ ] 型定義が適切か
- [ ] 共通カラムの設計が妥当か

**セキュリティ考慮事項** (`.claude/agents/sec-auditor.md`)

- [ ] 環境変数管理が安全か
- [ ] 認証トークンの扱いが適切か
- [ ] SQLインジェクション対策が講じられているか

#### レビュー結果

- **判定**: {{PASS/MINOR/MAJOR/CRITICAL}}
- **指摘事項**: {{指摘内容}}
- **対応方針**: {{対応内容}}

#### 戻り先決定（MAJORの場合）

| 問題の種類                   | 戻り先              |
| ---------------------------- | ------------------- |
| アーキテクチャの根本的な問題 | Phase 1（設計）     |
| 要件定義の不備               | Phase 0（要件定義） |

#### 完了条件

- [ ] 全レビュー観点でチェック完了
- [ ] 判定がPASSまたはMINOR
- [ ] MAJOR/CRITICAL指摘は解消済み

#### 依存関係

- **前提**: T-01-2（スキーマ設計）
- **後続**: T-03-1（クライアント接続テスト作成）

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: クライアント接続テスト作成

#### 目的

DB接続・ヘルスチェックのテストコードを先に作成する（TDD: Red）。

#### 背景

テストファースト開発により、仕様を明確化し、実装の品質を担保する。

#### 責務（単一責務）

DB接続・ヘルスチェックのテストコード作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/db/client.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: ユニットテスト作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                 | 活用方法             |
| ---------------------------------------- | -------------------- |
| `.claude/skills/tdd-principles/SKILL.md` | TDDサイクルの実践    |
| `.claude/skills/test-doubles/SKILL.md`   | モック・スタブの活用 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                              | 内容                           |
| ------------ | ------------------------------------------------- | ------------------------------ |
| テストコード | `packages/shared/src/db/__tests__/client.test.ts` | DB接続・ヘルスチェックのテスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] DB接続テストが作成されている
- [ ] ヘルスチェックテストが作成されている
- [ ] クローズ処理テストが作成されている
- [ ] テストが失敗する（実装未完のため）

#### 依存関係

- **前提**: T-02-1（設計レビュー実施）
- **後続**: T-03-2（トランザクションテスト作成）

---

### T-03-2: トランザクションテスト作成

#### 目的

トランザクション実行のテストコードを作成する（TDD: Red）。

#### 背景

トランザクション管理の仕様を明確化し、実装の品質を担保する。

#### 責務（単一責務）

トランザクション実行のテストコード作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/db/utils.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: ユニットテスト作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                         | 活用方法                     |
| ------------------------------------------------ | ---------------------------- |
| `.claude/skills/tdd-principles/SKILL.md`         | TDDサイクルの実践            |
| `.claude/skills/transaction-management/SKILL.md` | トランザクション管理パターン |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                                   | 内容                         |
| ------------ | ------------------------------------------------------ | ---------------------------- |
| テストコード | `packages/shared/src/db/__tests__/transaction.test.ts` | トランザクション実行のテスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] トランザクション成功テストが作成されている
- [ ] トランザクションロールバックテストが作成されている
- [ ] ネストトランザクションテストが作成されている
- [ ] テストが失敗する（実装未完のため）

#### 依存関係

- **前提**: T-03-1（クライアント接続テスト作成）
- **後続**: T-04-1（依存パッケージインストール）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: 依存パッケージインストール

#### 目的

Drizzle ORM関連パッケージをインストールする。

#### 背景

drizzle-orm, @libsql/client, drizzle-kitの3つのパッケージが必要。

#### 責務（単一責務）

依存パッケージのインストールのみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:add-dependency drizzle-orm
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: 依存関係管理の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実行手順

**1. packages/sharedディレクトリで実行**

```bash
cd packages/shared
pnpm add drizzle-orm @libsql/client
pnpm add -D drizzle-kit
```

**2. インストール確認**

```bash
pnpm list drizzle-orm @libsql/client drizzle-kit
```

#### 成果物

| 成果物             | パス                           | 内容                                         |
| ------------------ | ------------------------------ | -------------------------------------------- |
| 依存関係更新       | `packages/shared/package.json` | drizzle-orm, @libsql/client, drizzle-kit追加 |
| ロックファイル更新 | `pnpm-lock.yaml`               | 依存関係ロック                               |

#### 完了条件

- [ ] drizzle-ormがインストールされている
- [ ] @libsql/clientがインストールされている
- [ ] drizzle-kit（devDependency）がインストールされている
- [ ] package.jsonに追加されている
- [ ] pnpm-lock.yamlが更新されている

#### 依存関係

- **前提**: T-03-2（トランザクションテスト作成）
- **後続**: T-04-2（Drizzle設定ファイル実装）

---

### T-04-2: Drizzle設定ファイル実装

#### 目的

drizzle.config.tsを作成し、Drizzle Kitの設定を行う。

#### 背景

マイグレーション生成・実行のためのDrizzle Kit設定が必要。

#### 責務（単一責務）

Drizzle設定ファイルの実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

> ⚠️ 該当コマンドなし - 設計書に基づき手動実装

#### 使用エージェント

- **エージェント**: `.claude/agents/db-architect.md`
- **選定理由**: データベース設定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

```typescript
// packages/shared/drizzle.config.ts

import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  driver: "libsql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:local.db",
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
  verbose: true,
  strict: true,
} satisfies Config;
```

#### 成果物

| 成果物      | パス                                | 内容                    |
| ----------- | ----------------------------------- | ----------------------- |
| Drizzle設定 | `packages/shared/drizzle.config.ts` | Drizzle Kit設定ファイル |

#### 完了条件

- [ ] drizzle.config.tsが作成されている
- [ ] schemaパスが正しく設定されている
- [ ] outディレクトリが設定されている
- [ ] driverがlibsqlに設定されている
- [ ] 環境変数が正しく参照されている

#### 依存関係

- **前提**: T-04-1（依存パッケージインストール）
- **後続**: T-04-3（データベースクライアント実装）

---

### T-04-3: データベースクライアント実装

#### 目的

libSQLクライアントとDrizzle ORMの統合を実装する。

#### 背景

DB接続、トランザクション管理、ヘルスチェック等の基本機能を実装する。

#### 責務（単一責務）

データベースクライアントの実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-client
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                         | 活用方法             |
| ------------------------------------------------ | -------------------- |
| `.claude/skills/connection-pooling/SKILL.md`     | 接続管理の実装       |
| `.claude/skills/transaction-management/SKILL.md` | トランザクション実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                   | パス                               | 内容                           |
| ------------------------ | ---------------------------------- | ------------------------------ |
| データベースクライアント | `packages/shared/src/db/client.ts` | libSQL/Drizzle統合クライアント |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test
```

- [ ] クライアント接続テストが成功することを確認（Green状態）
- [ ] トランザクションテストが成功することを確認（Green状態）

#### 完了条件

- [ ] getLibSQLClient関数が実装されている
- [ ] dbインスタンスが作成されている
- [ ] withTransaction関数が実装されている
- [ ] closeDatabase関数が実装されている
- [ ] checkDatabaseHealth関数が実装されている
- [ ] runMigrations関数が実装されている
- [ ] 全テストがGreen状態

#### 依存関係

- **前提**: T-04-2（Drizzle設定ファイル実装）
- **後続**: T-04-4（共通スキーマ定義実装）

---

### T-04-4: 共通スキーマ定義実装

#### 目的

全テーブルで共有する共通カラム定義を実装する。

#### 背景

timestamps, metadata, softDelete等の共通カラムを再利用可能な形で実装する。

#### 責務（単一責務）

共通スキーマ定義の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-common-schema
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/schema-def.md`
- **選定理由**: スキーマ定義の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法                 |
| ---------------------------------------------- | ------------------------ |
| `.claude/skills/type-safety-patterns/SKILL.md` | TypeScript型安全性の確保 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物               | パス                                      | 内容                 |
| -------------------- | ----------------------------------------- | -------------------- |
| 共通スキーマ定義     | `packages/shared/src/db/schema/common.ts` | 共通カラム定義       |
| スキーマインデックス | `packages/shared/src/db/schema/index.ts`  | スキーマエクスポート |

#### 完了条件

- [ ] uuidPrimaryKey関数が実装されている
- [ ] timestampsオブジェクトが実装されている
- [ ] metadataColumn関数が実装されている
- [ ] softDeleteオブジェクトが実装されている
- [ ] schema/index.tsが作成されている

#### 依存関係

- **前提**: T-04-3（データベースクライアント実装）
- **後続**: T-04-4a（スキーマディレクトリ作成）

---

### T-04-4a: スキーマディレクトリ作成 ⚠️ **追加タスク**

#### 目的

スキーマファイル格納用のディレクトリ構造を作成する。

#### 背景

**T-07-1最終レビュー（MAJOR判定）で判明した問題**:

- ❌ `packages/shared/src/db/schema/` ディレクトリが存在しない

スキーマファイルを配置する場所がないため、マイグレーション生成ができません。

#### 責務（単一責務）

スキーマディレクトリの作成とindex.ts初期化のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

該当コマンドなし - 以下の手動手順で実行

#### 実行手順

```bash
# スキーマディレクトリ作成
mkdir -p packages/shared/src/db/schema

# index.ts初期化
cat > packages/shared/src/db/schema/index.ts <<'EOF'
/**
 * Database schema exports
 */

// Common schema utilities
export * from "./common.js";
EOF
```

#### 成果物

| 成果物               | パス                                     | 内容                     |
| -------------------- | ---------------------------------------- | ------------------------ |
| スキーマディレクトリ | `packages/shared/src/db/schema/`         | スキーマファイル格納場所 |
| スキーマインデックス | `packages/shared/src/db/schema/index.ts` | エクスポート定義         |

#### 完了条件

- [ ] schema/ディレクトリが作成されている
- [ ] schema/index.tsが作成されている
- [ ] common.tsのエクスポートが定義されている

#### 依存関係

- **前提**: T-04-4（共通スキーマ定義実装）
- **後続**: T-04-4b（実テーブルスキーマ実装）

---

### T-04-4b: 実テーブルスキーマ実装 ⚠️ **追加タスク**

#### 目的

chat_sessions, chat_messagesテーブルのDrizzleスキーマを実装する。

#### 背景

**T-07-1最終レビュー（CRITICAL判定）で判明した問題**:

- ❌ テーブル定義が未実装
- ❌ リレーション定義が不明確

実際のテーブルスキーマがないと、マイグレーション生成ができません。

#### 責務（単一責務）

実テーブルスキーマの実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic chat-history-schema
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/schema-def.md`
- **選定理由**: Drizzleスキーマ実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                          | 活用方法           |
| ------------------------------------------------- | ------------------ |
| `.claude/skills/type-safety-patterns/SKILL.md`    | Drizzle型定義      |
| `.claude/skills/foreign-key-constraints/SKILL.md` | 外部キー制約の実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 実装テーブル

1. **chatSessionsTable** (`schema/chatHistory.ts`)
   - Drizzle sqliteTableによる定義
   - 共通カラムの活用
   - 適切な型定義

2. **chatMessagesTable** (`schema/chatHistory.ts`)
   - session_idの外部キー定義
   - roleのenumバリデーション
   - created_atのソート対応

#### 成果物

| 成果物                   | パス                                           | 内容                         |
| ------------------------ | ---------------------------------------------- | ---------------------------- |
| チャット履歴スキーマ     | `packages/shared/src/db/schema/chatHistory.ts` | chat_sessions, chat_messages |
| スキーマインデックス更新 | `packages/shared/src/db/schema/index.ts`       | chatHistory.tsのエクスポート |

#### 完了条件

- [ ] chatSessionsTableが実装されている
- [ ] chatMessagesTableが実装されている
- [ ] 外部キー制約が定義されている
- [ ] schema/index.tsにエクスポートが追加されている
- [ ] TypeScript型エラーがない

#### 依存関係

- **前提**: T-04-4a（スキーマディレクトリ作成）
- **後続**: T-04-4c（インデックス定義実装）

---

### T-04-4c: インデックス定義実装 ⚠️ **追加タスク**

#### 目的

T-01-4で設計したインデックスをDrizzleスキーマに実装する。

#### 背景

**T-07-1最終レビュー（CRITICAL判定）で判明した問題**:

- ❌ インデックス定義が一切存在しない

インデックスなしでは全テーブルスキャンが発生し、パフォーマンスが致命的に悪化します。

#### 責務（単一責務）

インデックス定義の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-indexes
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/dba-mgr.md`
- **選定理由**: インデックス実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法              |
| --------------------------------------------- | --------------------- |
| `.claude/skills/indexing-strategies/SKILL.md` | Drizzle index()使用法 |

- **参照**: `.claude/skills/skill_list.md`

#### 実装インデックス

1. **chat_sessions**
   - updated_atインデックス（降順ソート用）

2. **chat_messages**
   - session_idインデックス（外部キー検索用）
   - 複合インデックス（session_id + created_at）

#### 実装例

```typescript
export const chatSessionsTable = sqliteTable(
  "chat_sessions",
  {
    // カラム定義...
  },
  (table) => ({
    updatedAtIdx: index("chat_sessions_updated_at_idx").on(table.updatedAt),
  }),
);

export const chatMessagesTable = sqliteTable(
  "chat_messages",
  {
    // カラム定義...
  },
  (table) => ({
    sessionIdx: index("chat_messages_session_idx").on(table.sessionId),
    sessionTimeIdx: index("chat_messages_session_time_idx").on(
      table.sessionId,
      table.createdAt,
    ),
  }),
);
```

#### 成果物

| 成果物                       | パス                                           | 内容                         |
| ---------------------------- | ---------------------------------------------- | ---------------------------- |
| インデックス定義済みスキーマ | `packages/shared/src/db/schema/chatHistory.ts` | インデックス追加済みテーブル |

#### 完了条件

- [ ] chat_sessionsにインデックスが定義されている
- [ ] chat_messagesにインデックスが定義されている（最低2つ）
- [ ] インデックス命名規則に従っている
- [ ] TypeScript型エラーがない

#### 依存関係

- **前提**: T-04-4b（実テーブルスキーマ実装）
- **後続**: T-04-5（環境変数定義実装）

---

### T-04-5: 環境変数定義実装

#### 目的

データベース接続用の環境変数スキーマ定義と検証を実装する。

#### 背景

環境変数の型安全な管理と検証が必要。

#### 責務（単一責務）

環境変数定義の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-env-validation
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法              |
| ----------------------------------------------- | --------------------- |
| `.claude/skills/zod-validation/SKILL.md`        | Zodスキーマによる検証 |
| `.claude/skills/environment-isolation/SKILL.md` | 環境変数管理          |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                            | 内容                   |
| ------------ | ------------------------------- | ---------------------- |
| 環境変数定義 | `packages/shared/src/db/env.ts` | 環境変数スキーマ・検証 |

#### 完了条件

- [ ] databaseEnvSchemaが実装されている
- [ ] validateDatabaseEnv関数が実装されている
- [ ] getDatabaseEnv関数が実装されている
- [ ] Zodによる検証が実装されている

#### 依存関係

- **前提**: T-04-4（共通スキーマ定義実装）
- **後続**: T-04-6（ユーティリティ関数実装）

---

### T-04-6: ユーティリティ関数実装

#### 目的

データベース操作のユーティリティ関数を実装する。

#### 背景

COALESCE, ページネーション, バッチ処理等の汎用ユーティリティが必要。

#### 責務（単一責務）

ユーティリティ関数の実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-utilities
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物             | パス                              | 内容                 |
| ------------------ | --------------------------------- | -------------------- |
| ユーティリティ関数 | `packages/shared/src/db/utils.ts` | DB操作ユーティリティ |

#### 完了条件

- [ ] coalesce関数が実装されている
- [ ] jsonArrayLength関数が実装されている
- [ ] currentTimestamp関数が実装されている
- [ ] paginate関数が実装されている
- [ ] batchProcess関数が実装されている
- [ ] onConflictDoNothing関数が実装されている
- [ ] onConflictDoUpdate関数が実装されている

#### 依存関係

- **前提**: T-04-5（環境変数定義実装）
- **後続**: T-04-7（マイグレーションスクリプト実装）

---

### T-04-7: マイグレーションスクリプト実装

#### 目的

マイグレーション実行スクリプトを実装する。

#### 背景

開発環境でのマイグレーション実行を自動化する必要がある。

#### 責務（単一責務）

マイグレーションスクリプトの実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:implement-business-logic database-migration-script
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 成果物

| 成果物                     | パス                                | 内容                           |
| -------------------------- | ----------------------------------- | ------------------------------ |
| マイグレーションスクリプト | `packages/shared/src/db/migrate.ts` | マイグレーション実行スクリプト |

#### 完了条件

- [ ] migrate.tsが実装されている
- [ ] runMigrations関数が呼び出されている
- [ ] エラーハンドリングが実装されている
- [ ] closeDatabase関数が呼び出されている

#### 依存関係

- **前提**: T-04-6（ユーティリティ関数実装）
- **後続**: T-04-8（package.jsonスクリプト追加）

---

### T-04-8: package.jsonスクリプト追加

#### 目的

Drizzle Kit操作用のnpmスクリプトを追加する。

#### 背景

マイグレーション生成・実行・Studioの起動等をコマンドで実行できるようにする。

#### 責務（単一責務）

package.jsonスクリプトの追加のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

> ⚠️ 該当コマンドなし - 設計書に基づき手動実装

#### 使用エージェント

- **エージェント**: `.claude/agents/dep-mgr.md`
- **選定理由**: パッケージ設定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

#### 成果物

| 成果物               | パス                           | 内容                      |
| -------------------- | ------------------------------ | ------------------------- |
| パッケージスクリプト | `packages/shared/package.json` | Drizzle Kitスクリプト追加 |

#### 完了条件

- [ ] db:generateスクリプトが追加されている
- [ ] db:migrateスクリプトが追加されている
- [ ] db:pushスクリプトが追加されている
- [ ] db:studioスクリプトが追加されている
- [ ] db:dropスクリプトが追加されている

#### 依存関係

- **前提**: T-04-7（マイグレーションスクリプト実装）
- **後続**: T-04-9（バレルエクスポート実装）

---

### T-04-9: バレルエクスポート実装

#### 目的

db/index.tsからすべての機能をエクスポートする。

#### 背景

他のモジュールから簡単にインポートできるようにする。

#### 責務（単一責務）

バレルエクスポートの実装のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

> ⚠️ 該当コマンドなし - 設計書に基づき手動実装

#### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: モジュール構成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実装内容

```typescript
// packages/shared/src/db/index.ts

export * from "./client";
export * from "./env";
export * from "./utils";
export * from "./schema";
```

#### 成果物

| 成果物             | パス                              | 内容                       |
| ------------------ | --------------------------------- | -------------------------- |
| バレルエクスポート | `packages/shared/src/db/index.ts` | すべての機能のエクスポート |

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/shared test
```

- [ ] 実装後もすべてのテストがGreen状態

#### 完了条件

- [ ] db/index.tsが作成されている
- [ ] client.tsがエクスポートされている
- [ ] env.tsがエクスポートされている
- [ ] utils.tsがエクスポートされている
- [ ] schema/index.tsがエクスポートされている

#### 依存関係

- **前提**: T-04-8（package.jsonスクリプト追加）
- **後続**: T-04-10（初回マイグレーション生成・検証）

---

### T-04-10: 初回マイグレーション生成・検証 ⚠️ **追加タスク**

#### 目的

実装したスキーマから実際のマイグレーションファイルを生成し、正常に動作することを検証する。

#### 背景

**T-07-1最終レビュー（CRITICAL判定）で判明した問題**:

- ❌ マイグレーション環境が未整備
- ❌ 初回マイグレーション未実行

スキーマを実装しても、マイグレーションファイルを生成しないとデータベースに反映されません。

#### 責務（単一責務）

マイグレーション生成と動作検証のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

該当コマンドなし - 以下の手動手順で実行

#### 実行手順

**1. マイグレーション生成**

```bash
cd packages/shared
pnpm db:generate
```

**2. 生成されたマイグレーションファイル確認**

```bash
ls -la drizzle/
cat drizzle/0000_*.sql
```

**3. ローカルDBでマイグレーション実行テスト**

```bash
# テスト用DBパス設定
export DATABASE_URL="file:./test.db"

# マイグレーション実行
pnpm db:migrate

# テーブル作成確認
sqlite3 test.db ".tables"
sqlite3 test.db ".schema chat_sessions"
sqlite3 test.db ".schema chat_messages"
```

**4. インデックス確認**

```bash
sqlite3 test.db "SELECT name FROM sqlite_master WHERE type='index';"
```

**5. クリーンアップ**

```bash
rm test.db
```

#### 成果物

| 成果物              | パス                                 | 内容                               |
| ------------------- | ------------------------------------ | ---------------------------------- |
| マイグレーションSQL | `packages/shared/drizzle/0000_*.sql` | 生成されたマイグレーションファイル |
| メタデータJSON      | `packages/shared/drizzle/meta/`      | Drizzle管理用メタデータ            |

#### 完了条件

- [ ] `pnpm db:generate`が成功する
- [ ] drizzle/ディレクトリにマイグレーションファイルが生成されている
- [ ] 生成されたSQLにCREATE TABLE文が含まれている
- [ ] インデックスCREATE INDEX文が含まれている（最低3つ）
- [ ] 外部キー制約が定義されている
- [ ] テストDBでマイグレーションが実行できる
- [ ] テーブルとインデックスが正しく作成される

#### 依存関係

- **前提**: T-04-9（バレルエクスポート実装）
- **後続**: T-05-1（コード品質改善）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コード品質改善

#### 目的

実装コードのリファクタリング・最適化を行う。

#### 背景

動作するコードを、より保守性・可読性の高いコードに改善する。

#### 責務（単一責務）

コード品質改善のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:refactor code-quality
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質改善の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                       | 活用方法                 |
| ---------------------------------------------- | ------------------------ |
| `.claude/skills/clean-code-practices/SKILL.md` | クリーンコード原則の適用 |
| `.claude/skills/solid-principles/SKILL.md`     | SOLID原則の適用          |
| `.claude/skills/code-smell-detection/SKILL.md` | コード臭の検出・修正     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                     | パス                      | 内容                 |
| -------------------------- | ------------------------- | -------------------- |
| リファクタリング済みコード | `packages/shared/src/db/` | 品質改善されたコード |

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/shared test
```

- [ ] リファクタリング後もテストが成功することを確認

#### 完了条件

- [ ] コードの重複が削減されている
- [ ] 関数の責務が明確になっている
- [ ] 命名が適切になっている
- [ ] コメントが適切に追加されている
- [ ] すべてのテストがGreen状態

#### 依存関係

- **前提**: T-04-9（バレルエクスポート実装）
- **後続**: T-06-1（Lint・型チェック実行）

---

## Phase 6: 品質保証

### T-06-1: Lint・型チェック実行

#### 目的

ESLint・TypeScriptによる静的解析を実行し、品質を保証する。

#### 背景

コード品質・型安全性を自動検証する必要がある。

#### 責務（単一責務）

Lint・型チェックの実行のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:lint --fix
```

その後、TypeScript型チェックを実行：

```bash
pnpm typecheck
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: コード品質検証の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実行手順

```bash
# ESLint実行
pnpm --filter @repo/shared lint

# TypeScript型チェック
pnpm --filter @repo/shared typecheck
```

#### 成果物

| 成果物           | パス | 内容                 |
| ---------------- | ---- | -------------------- |
| 品質検証レポート | -    | Lint・型チェック結果 |

#### 完了条件

- [ ] ESLintエラーがゼロ
- [ ] TypeScript型エラーがゼロ
- [ ] 警告が解消されている

#### 依存関係

- **前提**: T-05-1（コード品質改善）
- **後続**: T-06-2（テストカバレッジ確認）

---

### T-06-2: テストカバレッジ確認

#### 目的

テストカバレッジを確認し、基準を満たしているか検証する。

#### 背景

十分なテストカバレッジが品質保証に必要。

#### 責務（単一責務）

テストカバレッジ確認のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```bash
pnpm test:coverage
```

- **参照**: テストカバレッジレポートを確認

#### 使用エージェント

- **エージェント**: `.claude/agents/unit-tester.md`
- **選定理由**: テスト品質の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 実行手順

```bash
pnpm --filter @repo/shared test:coverage
```

#### 成果物

| 成果物             | パス                        | 内容                     |
| ------------------ | --------------------------- | ------------------------ |
| カバレッジレポート | `packages/shared/coverage/` | テストカバレッジレポート |

#### 完了条件

- [ ] カバレッジ80%以上達成
- [ ] 主要機能のカバレッジ100%
- [ ] カバレッジレポートが生成されている

#### 依存関係

- **前提**: T-06-1（Lint・型チェック実行）
- **後続**: T-07-1（最終レビュー実施）

---

## Phase 7: 最終レビューゲート

### T-07-1: 最終レビュー実施

#### 目的

全成果物の最終検証を行い、マージ可否を判定する。

#### 背景

品質ゲート通過後、最終的な総合レビューで問題がないか確認する必要がある。

#### レビュー参加エージェント

| エージェント                     | レビュー観点               | 選定理由                   |
| -------------------------------- | -------------------------- | -------------------------- |
| `.claude/agents/arch-police.md`  | アーキテクチャパターン遵守 | アーキテクチャ検証の専門家 |
| `.claude/agents/db-architect.md` | データベース設計妥当性     | データベース設計の専門家   |
| `.claude/agents/code-quality.md` | コード品質・保守性         | コード品質の専門家         |
| `.claude/agents/sec-auditor.md`  | セキュリティ脆弱性         | セキュリティ検証の専門家   |
| `.claude/agents/unit-tester.md`  | テスト網羅性               | テスト品質の専門家         |

- **参照**: `.claude/agents/agent_list.md`

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:code-review-complete packages/shared/src/db/
```

- **参照**: `.claude/commands/ai/command_list.md`

#### レビューチェックリスト

**アーキテクチャパターン遵守** (`.claude/agents/arch-police.md`)

- [ ] レイヤードアーキテクチャに準拠している
- [ ] 依存性逆転原則が適用されている
- [ ] 単一責務原則が守られている

**データベース設計妥当性** (`.claude/agents/db-architect.md`)

- [ ] スキーマ設計が適切である
- [ ] 型定義が適切である
- [ ] マイグレーション戦略が適切である

**コード品質・保守性** (`.claude/agents/code-quality.md`)

- [ ] クリーンコード原則に従っている
- [ ] コードの重複がない
- [ ] 命名が適切である
- [ ] コメントが適切である

**セキュリティ脆弱性** (`.claude/agents/sec-auditor.md`)

- [ ] 環境変数管理が安全である
- [ ] SQLインジェクション対策が講じられている
- [ ] 認証トークンの扱いが適切である

**テスト網羅性** (`.claude/agents/unit-tester.md`)

- [ ] カバレッジ80%以上達成
- [ ] 主要機能のテストが完備している
- [ ] エッジケースのテストがある

#### レビュー結果

- **判定**: {{PASS/MINOR/MAJOR/CRITICAL}}
- **指摘事項**: {{指摘内容}}
- **対応方針**: {{対応内容}}
- **未完了タスク数**: {{未完了タスク数}}件

#### 戻り先決定（MAJOR/CRITICALの場合）

| 問題の種類   | 戻り先                |
| ------------ | --------------------- |
| 実装の問題   | Phase 4（実装）       |
| テストの問題 | Phase 3（テスト作成） |
| 設計の問題   | Phase 1（設計）       |
| 要件の問題   | Phase 0（要件定義）   |

#### エスカレーション条件

- CRITICALレベルの指摘が3件以上
- MAJORレベルの指摘が5件以上
- セキュリティ脆弱性が検出された場合

#### 完了条件

- [ ] 全レビュー観点でチェック完了
- [ ] 判定がPASSまたはMINOR
- [ ] MAJOR/CRITICAL指摘は解消済み
- [ ] 未完了タスク指示書が作成済み（該当する場合）

#### 依存関係

- **前提**: T-06-2（テストカバレッジ確認）
- **後続**: T-07-2（P0改善対応）

---

### T-07-2: P0改善対応 ⚠️ **追加タスク**

#### 目的

T-07-1の最終レビューで検出されたMAJOR/CRITICAL問題（P0改善ポイント）を解消する。

#### 背景

**2025-12-25実施のT-07-1最終レビューで以下のP0問題が判明**:

1. スキーマ定義の未実装（CRITICAL）
2. マイグレーション環境の未整備（CRITICAL）
3. インデックス戦略の欠如（CRITICAL）

これらは **Phase 1設計とPhase 4実装に新規タスク（T-01-3, T-01-4, T-04-4a~c, T-04-10）として追加済み** です。
本サブタスクは、それらの追加タスクが完了していることを確認し、再レビューを実施します。

#### 責務（単一責務）

P0改善ポイントの解消確認と再レビューのみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 該当コマンドなし - 以下の確認手順を実施

#### 実行手順

**1. 追加タスクの完了確認**

- [ ] T-01-3（スキーマ詳細設計）完了
- [ ] T-01-4（インデックス戦略設計）完了
- [ ] T-04-4a（スキーマディレクトリ作成）完了
- [ ] T-04-4b（実テーブルスキーマ実装）完了
- [ ] T-04-4c（インデックス定義実装）完了
- [ ] T-04-10（初回マイグレーション生成・検証）完了

**2. 成果物の存在確認**

```bash
# スキーマディレクトリ確認
ls -la packages/shared/src/db/schema/

# 必須ファイル確認
test -f packages/shared/src/db/schema/index.ts && echo "✅ index.ts"
test -f packages/shared/src/db/schema/chatHistory.ts && echo "✅ chatHistory.ts"

# マイグレーションファイル確認
ls -la packages/shared/drizzle/
test -f packages/shared/drizzle/0000_*.sql && echo "✅ マイグレーションファイル"
```

**3. インデックス実装確認**

```bash
# スキーマファイルでインデックス定義を確認
grep -c "index(" packages/shared/src/db/schema/chatHistory.ts
# 期待値: 3以上
```

**4. 再レビュー実施**

```
/ai:code-review-complete packages/shared/src/db/
```

期待される結果: **PASS** または **MINOR**

#### 成果物

| 成果物         | パス | 内容                       |
| -------------- | ---- | -------------------------- |
| 再レビュー結果 | -    | P0問題解消後のレビュー判定 |

#### 完了条件

- [ ] 全追加タスク（T-01-3, T-01-4, T-04-4a~c, T-04-10）が完了している
- [ ] スキーマファイルが実装されている
- [ ] インデックスが定義されている（最低3つ）
- [ ] マイグレーションファイルが生成されている
- [ ] 再レビューの判定が **PASS** または **MINOR**
- [ ] CRITICAL/MAJOR問題がゼロ

#### 依存関係

- **前提**: T-07-1（最終レビュー実施）
- **前提**: T-01-3, T-01-4, T-04-4a~c, T-04-10（追加タスク）
- **後続**: T-08-1（手動動作確認）

---

## Phase 8: 手動テスト検証

### T-08-1: 手動動作確認

#### 目的

実際のDB接続・マイグレーション実行を手動で確認する。

#### 背景

自動テストでは検証できない実際の動作を確認する必要がある。

#### テスト分類

機能テスト・統合テスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

> ⚠️ 該当コマンドなし - 以下の手動テストを実施

#### 使用エージェント

- **エージェント**: `.claude/agents/e2e-tester.md`
- **選定理由**: 統合テストの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 手動テストケース

| No  | カテゴリ | テスト項目                 | 前提条件                   | 操作手順                                         | 期待結果                     | 実行結果 | 備考 |
| --- | -------- | -------------------------- | -------------------------- | ------------------------------------------------ | ---------------------------- | -------- | ---- |
| 1   | 機能     | DB接続確認                 | パッケージインストール済み | 1. `pnpm --filter @repo/shared test` 実行        | DB接続テストがPASS           |          |      |
| 2   | 機能     | ヘルスチェック実行         | DB接続成功                 | 1. `checkDatabaseHealth()`を呼び出し             | trueが返る                   |          |      |
| 3   | 機能     | トランザクション実行       | DB接続成功                 | 1. `withTransaction()`でトランザクション実行     | トランザクションが正常完了   |          |      |
| 4   | 機能     | マイグレーションスクリプト | Drizzle設定完了            | 1. `pnpm --filter @repo/shared db:generate` 実行 | マイグレーションファイル生成 |          |      |
| 5   | 機能     | Drizzle Studio起動         | マイグレーション完了       | 1. `pnpm --filter @repo/shared db:studio` 実行   | Studioがブラウザで開く       |          |      |
| 6   | 機能     | 環境変数検証               | .env設定                   | 1. `getDatabaseEnv()`を呼び出し                  | 環境変数が正しく読み込まれる |          |      |

#### テスト実行手順

1. packages/sharedディレクトリに移動
2. 環境変数ファイル(.env)を作成（必要に応じて）
3. 各テストケースを順番に実行
4. 結果を「実行結果」列に記録
5. 問題があれば「備考」列に記載

#### 成果物

| 成果物         | パス                                                               | 内容               |
| -------------- | ------------------------------------------------------------------ | ------------------ |
| 手動テスト結果 | `docs/30-workflows/rag-pipeline/conv-04-01-manual-test-results.md` | 手動テスト実行結果 |

#### 完了条件

- [ ] 全テストケースを実行済み
- [ ] 全テストケースがPASS
- [ ] 手動テスト結果が記録されている
- [ ] 問題が発見された場合は修正済み

#### 依存関係

- **前提**: T-07-1（最終レビュー実施）
- **後続**: T-09-1（システムドキュメント更新）

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: システムドキュメント更新

#### 目的

Drizzle ORM基盤の実装をシステムドキュメントに反映する。

#### 前提条件

- [ ] Phase 6の品質ゲートをすべて通過
- [ ] Phase 7の最終レビューゲートを通過
- [ ] Phase 8の手動テストが完了
- [ ] すべてのテストが成功

---

#### サブタスク 9.1: システムドキュメント更新

##### 更新対象ドキュメント

- `docs/00-requirements/master_system_design.md` - Drizzle ORM基盤の追加
- `docs/30-workflows/unassigned-task/task-**-architecture-overview-rag-pipeline.md` - CONV-04-01完了の記録

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/api-doc-writer.md`
- **選定理由**: ドキュメント更新の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 更新原則

- 概要のみ記載（詳細な実装説明は不要）
- システム構築に必要十分な情報のみ追記
- 既存ドキュメントの構造・フォーマットを維持
- Single Source of Truth原則を遵守

##### スキル同期（必要時）

docs/00-requirements を更新した場合はスキル索引を同期する。
SKILL.md は requirements-index の参照が不足している場合のみ更新する。

**ターミナル実行コマンド**

```bash
python3 scripts/sync_requirements_to_skills.py
python3 scripts/update_skill_levels.py
```

---

#### サブタスク 9.2: 未完了タスク・追加タスク記録

##### 出力先

`docs/30-workflows/unassigned-task/`

##### 記録対象タスク一覧

後続タスクの指示書を作成する：

- CONV-04-02: files/conversionsテーブル実装
- CONV-04-03: content_chunksテーブル + FTS5実装
- CONV-04-04: DiskANNベクトルインデックス設定
- CONV-04-05: Knowledge Graphテーブル群実装
- CONV-04-06: Repositoryパターン実装

##### ファイル命名規則

- 要件系: `task-conv-04-02-files-conversions-tables.md`
- 要件系: `task-conv-04-03-chunks-fts5.md`
- 要件系: `task-conv-04-04-diskann-vector-index.md`
- 要件系: `task-conv-04-05-knowledge-graph-tables.md`
- 要件系: `task-conv-04-06-repository-pattern.md`

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{{timestamp}}-{{hash}}`) 内で実行してください

```
/ai:write-spec rag-next-steps
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/req-analyst.md`
- **選定理由**: 要件定義・タスク分解の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                              | 活用方法         |
| ----------------------------------------------------- | ---------------- |
| `.claude/skills/acceptance-criteria-writing/SKILL.md` | 完了条件の明確化 |
| `.claude/skills/use-case-modeling/SKILL.md`           | ユースケース分析 |

- **参照**: `.claude/skills/skill_list.md`

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
- [ ] 使用エージェント・スキルが選定されている
- [ ] 各フェーズの成果物・完了条件が定義されている

**検証・完了**

- [ ] 完了条件チェックリストがある
- [ ] テストケース/検証方法が記載されている
- [ ] リスクと対策が検討されている

##### 各タスクの詳細

各後続タスクの指示書は、本タスク（CONV-04-01）の成果物を前提条件とし、
HybridRAGパイプライン構築の次のステップを明確に定義する。

---

#### 完了条件

- [ ] システムドキュメントが更新されている
- [ ] 後続タスクの指示書が作成されている（5件）
- [ ] 全指示書が品質基準を満たしている
- [ ] スキル索引が同期されている（必要時）

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### 目的

Git Worktree内の変更をConventional Commits形式でコミットする。

#### 背景

実装完了後、変更内容を適切なコミットメッセージで記録する必要がある。

#### 責務（単一責務）

差分確認とコミット作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:commit
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/prompt-eng.md`
- **選定理由**: コミットメッセージの自動生成が得意
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                      | 活用方法                                         |
| --------------------------------------------- | ------------------------------------------------ |
| `.claude/skills/semantic-versioning/SKILL.md` | Conventional Commits形式のコミットメッセージ生成 |
| `.claude/skills/git-hooks-concepts/SKILL.md`  | Pre-commit hooks理解とコミット前検証             |

- **参照**: `.claude/skills/skill_list.md`

#### 実行手順

**1. Worktreeディレクトリ内で差分確認**

```bash
# 現在のディレクトリ確認
pwd  # .worktrees/task-XXX であることを確認

# 変更ファイル確認
git status

# 詳細な差分確認
git diff
```

**2. 変更内容を分析し、適切なコミットメッセージを生成**

Conventional Commitsタイプ:

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `docs`: ドキュメント
- `test`: テスト
- `chore`: その他（依存関係更新等）

スコープ例: `shared`, `db`, `config`

subject: 50文字以内、現在形・命令形

**3. コミット前チェック（Pre-commit hookが自動実行）**

```bash
# 手動で確認する場合
pnpm typecheck  # 型チェック
pnpm lint       # ESLint
pnpm test       # テスト実行
```

**4. コミット実行**

```bash
git add .
git commit -m "$(cat <<'EOF'
feat(db): Drizzle ORMセットアップ（libSQL/Turso対応）

- drizzle-orm, @libsql/client, drizzle-kit追加
- データベースクライアント実装（接続・トランザクション・ヘルスチェック）
- 共通スキーマ定義（timestamps, metadata, softDelete）
- 環境変数検証（Zod）
- ユーティリティ関数（paginate, batchProcess等）
- マイグレーションスクリプト実装
- package.jsonスクリプト追加（db:generate等）

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 成果物

| 成果物      | 内容                               |
| ----------- | ---------------------------------- |
| Gitコミット | Conventional Commits形式のコミット |

#### 完了条件

- [ ] git statusで変更内容を確認済み
- [ ] Conventional Commits形式でコミット作成済み
- [ ] Claude Code署名が含まれている

#### 依存関係

- **前提**: Phase 9（ドキュメント更新）
- **後続**: T-10-2（PR作成）

---

### T-10-2: PR作成

#### 目的

実装完了した変更をGitHubにPull Requestとして作成し、レビュー可能な状態にする。

#### 背景

コミット後、変更を本体ブランチにマージするためにPRを作成する必要がある。

#### 責務（単一責務）

PRの作成のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-pr
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: GitHub操作・PR作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法                                   |
| -------------------------------------------------- | ------------------------------------------ |
| `.claude/skills/semantic-versioning/SKILL.md`      | PRタイトル生成（Conventional Commits準拠） |
| `.claude/skills/markdown-advanced-syntax/SKILL.md` | PR本文のマークダウンフォーマット           |

- **参照**: `.claude/skills/skill_list.md`

#### 実行手順

**1. ブランチプッシュ**

```bash
git push -u origin <branch-name>
```

**2. PR作成（テンプレート使用）**

```bash
gh pr create --title "feat(db): Drizzle ORMセットアップ（libSQL/Turso対応）" --body "$(cat <<'EOF'
## 概要

HybridRAGパイプライン構築のデータベース基盤として、Drizzle ORMをセットアップしました。
libSQL/Turso互換のクライアント・スキーマ・ユーティリティを実装しています。

## 変更内容

- drizzle-orm, @libsql/client, drizzle-kit追加
- データベースクライアント実装（client.ts）
- 共通スキーマ定義（schema/common.ts）
- 環境変数検証（env.ts）
- ユーティリティ関数（utils.ts）
- マイグレーションスクリプト（migrate.ts）
- package.jsonスクリプト追加（db:generate, db:migrate等）

## 変更タイプ

- [ ] 🐛 バグ修正 (bug fix)
- [x] ✨ 新機能 (new feature)
- [ ] 🔨 リファクタリング (refactoring)
- [ ] 📝 ドキュメント (documentation)
- [ ] 🧪 テスト (test)
- [ ] 🔧 設定変更 (configuration)
- [ ] 🚀 CI/CD (continuous integration)

## テスト

- [x] ユニットテスト実行 (`pnpm test`)
- [x] 型チェック実行 (`pnpm typecheck`)
- [x] ESLint チェック実行 (`pnpm lint`)
- [x] ビルド確認 (`pnpm build`)
- [x] 手動テスト実施

## 関連 Issue

関連タスク: CONV-04-01: Drizzle ORMセットアップ

## 破壊的変更

- [ ] この PR には破壊的変更が含まれます

## チェックリスト

- [x] コードが既存のスタイルに従っている
- [x] 必要に応じてドキュメントを更新した
- [x] 新規・変更機能にテストを追加した
- [x] すべてのテストがローカルで成功する
- [x] Pre-commit hooks が成功する

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base main
```

#### 成果物

| 成果物              | 内容                             |
| ------------------- | -------------------------------- |
| GitHub Pull Request | PRが作成され、レビュー可能な状態 |

#### 完了条件

- [ ] ブランチがリモートにプッシュされている
- [ ] PRが正常に作成されている
- [ ] PR本文が適切に記載されている
- [ ] PR番号が取得できている

#### 依存関係

- **前提**: T-10-1（差分確認・コミット作成）
- **後続**: T-10-3（PR補足コメント追加）

---

### T-10-3: PR補足コメント追加

#### 目的

PR作成後、実装の詳細やレビュー観点を補足コメントとして追加する。

#### 背景

PR本文だけでは伝えきれない技術的詳細や注意点を、追加コメントで補足する必要がある。

#### 責務（単一責務）

PR補足コメントの投稿のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

> ⚠️ 該当コマンドなし - GitHub CLIで実施

```bash
gh pr comment <pr-number> --body "補足コメント内容"
```

#### 使用エージェント

- **エージェント**: `.claude/agents/prompt-eng.md`
- **選定理由**: 技術的な補足説明の生成が得意
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                                   | 活用方法                           |
| ---------------------------------------------------------- | ---------------------------------- |
| `.claude/skills/markdown-advanced-syntax/SKILL.md`         | コメントのマークダウンフォーマット |
| `.claude/skills/api-documentation-best-practices/SKILL.md` | 技術的詳細の構造化された説明       |

- **参照**: `.claude/skills/skill_list.md`

#### 実行手順

**1. PR番号取得**

```bash
PR_NUMBER=$(gh pr view --json number -q .number)
```

**2. 補足コメント投稿**

````bash
gh pr comment "${PR_NUMBER}" --body "$(cat <<'EOF'
## 📝 実装の詳細

### アーキテクチャ
- libSQLクライアントのシングルトンパターン採用
- Drizzle ORMによる型安全なDB操作
- トランザクション管理機能（withTransaction）

### 技術選定の理由
- **Drizzle ORM**: TypeScript完全型安全、libSQL互換
- **libSQL**: SQLite互換、Turso対応、エッジデプロイ可能

### 設計判断
- 共通カラム定義を関数・オブジェクトで再利用可能にした
- 環境変数をZodで検証し、型安全性を確保
- バッチ処理等のユーティリティを汎用的に実装

## ⚠️ レビュー時の注意点

- `packages/shared/src/db/`配下の構造が適切か
- 環境変数スキーマ（env.ts）が十分か
- トランザクション実装に問題がないか
- ユーティリティ関数の汎用性が確保されているか

## 🔍 テスト方法

**1. 依存関係インストール**
```bash
pnpm install
````

**2. ユニットテスト実行**

```bash
pnpm --filter @repo/shared test
```

**3. Drizzle Studioで確認（オプション）**

```bash
pnpm --filter @repo/shared db:studio
```

## 📚 参考資料

- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [libSQL公式ドキュメント](https://github.com/tursodatabase/libsql)
- [HybridRAGパイプラインアーキテクチャ概要](docs/30-workflows/unassigned-task/task-**-architecture-overview-rag-pipeline.md)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"

````

#### 成果物
| 成果物 | 内容 |
|--------|------|
| PR補足コメント | 技術的詳細・レビュー観点の追加情報 |

#### 完了条件
- [ ] PR番号が正常に取得できている
- [ ] 補足コメントが投稿されている
- [ ] コメント内容が適切である（実装詳細/注意点/テスト方法/参考資料）

#### 依存関係
- **前提**: T-10-2（PR作成）
- **後続**: T-10-4（CI/CD完了確認）

---

### T-10-4: CI/CD完了確認

#### 目的
GitHub ActionsのCI/CDが全て完了し、全チェックがpassであることを確認する。

#### 背景
CI未完了またはfail状態でマージすると、品質問題が本体ブランチに混入する恐れがある。

#### 責務（単一責務）
CI/CDステータスの確認と完了待機のみを担当する。

#### Claude Code スラッシュコマンド
> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

> ⚠️ 該当コマンドなし - GitHub CLIで実施

```bash
gh run list --limit 5
gh run watch
````

- **参照**: GitHub CLI

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: CI/CD監視の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                           | 活用方法                        |
| -------------------------------------------------- | ------------------------------- |
| `.claude/skills/github-actions-debugging/SKILL.md` | CI/CD失敗時のデバッグ・原因特定 |
| `.claude/skills/metrics-tracking/SKILL.md`         | CI実行時間・ステータスの監視    |

- **参照**: `.claude/skills/skill_list.md`

#### 実行手順

**1. CIステータス確認（待機ループ）**

```bash
for i in {1..10}; do
  gh pr checks ${PR_NUMBER}
  if gh pr checks ${PR_NUMBER} 2>&1 | grep -qE "(pending|in_progress)"; then
    echo "CI実行中... 30秒後に再確認"
    sleep 30
  else
    echo "CI完了"
    break
  fi
done
```

**2. CI結果の最終確認**

```bash
gh pr checks ${PR_NUMBER}
```

**3. 全チェックがpassであることを確認**

- Lint チェック: ✅ pass
- Type チェック: ✅ pass
- Test 実行: ✅ pass
- Build チェック: ✅ pass
- Security スキャン: ✅ pass

#### CI失敗時の対応

**問題: CIが失敗した場合**

```bash
# ローカルで再現
pnpm typecheck  # 型エラー
pnpm lint       # Lint
pnpm test       # テスト
pnpm build      # ビルド

# 修正後
git add .
git commit -m "fix: resolve CI errors"
git push
```

#### 成果物

| 成果物        | 内容                   |
| ------------- | ---------------------- |
| CI/CD完了確認 | 全チェックpass確認済み |

#### 完了条件

- [ ] CI/CDが全て完了している（pending/in_progressなし）
- [ ] 全チェックがpassである
- [ ] fail状態のチェックがない

#### 依存関係

- **前提**: T-10-3（PR補足コメント追加）
- **後続**: T-10-5（ユーザーへマージ可能通知）

---

### T-10-5: ユーザーへマージ可能通知

#### 目的

CI完了後、ユーザーにマージ準備が整ったことを通知する。

#### 背景

全てのCI/CDが完了し、品質が保証されたことを確認した上で、ユーザーに最終マージ実施を依頼する必要がある。

#### 責務（単一責務）

マージ準備完了の通知のみを担当する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

> ⚠️ 該当コマンドなし - 手動でユーザーに通知

#### 使用エージェント

- **エージェント**: `.claude/agents/devops-eng.md`
- **選定理由**: Git/GitHub操作・マージフローの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                            | 活用方法                             |
| --------------------------------------------------- | ------------------------------------ |
| `.claude/skills/stakeholder-communication/SKILL.md` | ユーザーへの明確な通知メッセージ生成 |
| `.claude/skills/markdown-advanced-syntax/SKILL.md`  | 通知内容のフォーマット               |

- **参照**: `.claude/skills/skill_list.md`

#### 通知内容

````
✅ PR作成完了・CI確認完了

📝 PR情報:
- PR番号: #XXX
- PR URL: https://github.com/.../pull/XXX

✅ CI/CD ステータス: 全てPASS

🎯 次のステップ（ユーザー実施）:
1. GitHub Web UIでPRを開く
2. 変更内容を最終確認
3. 「Squash and merge」をクリック
4. 「Delete branch」にチェック

📌 マージ後の同期（オプション）:
```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
git checkout main
git pull origin main
git worktree remove .worktrees/task-XXX
git fetch --prune
````

```

#### 成果物
| 成果物 | 内容 |
|--------|------|
| マージ準備完了通知 | ユーザーへの通知完了 |

#### 完了条件
- [ ] ユーザーにマージ準備完了を通知済み
- [ ] PRのURL・番号を提示済み
- [ ] マージ手順を説明済み
- [ ] マージ後の同期手順を提示済み

#### 依存関係
- **前提**: T-10-4（CI/CD完了確認）
- **後続**: なし（最終サブタスク - ユーザーが手動マージ）

---

## 品質ゲートチェックリスト

### 機能検証
- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功
- [ ] 全E2Eテスト成功

### コード品質
- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

### テスト網羅性
- [ ] カバレッジ80%以上達成
- [ ] 主要機能のカバレッジ100%

### セキュリティ
- [ ] 脆弱性スキャン完了
- [ ] 重大な脆弱性なし
- [ ] 環境変数が安全に管理されている

### CI/CD
- [ ] GitHub Actions 全てPASS
- [ ] Pre-commit hooks 成功

---

## リスクと対策

| リスク | 影響度 | 発生確率 | 対策 | 対応サブタスク |
|--------|--------|----------|------|----------------|
| libSQL互換性問題 | 高 | 低 | Drizzle公式ドキュメント参照、libSQLバージョン固定 | T-04-3 |
| 環境変数設定ミス | 中 | 中 | Zodによる検証、デフォルト値設定 | T-04-5 |
| マイグレーション失敗 | 中 | 低 | ロールバック機能、手動確認 | T-04-7, T-08-1 |
| テストカバレッジ不足 | 中 | 低 | TDD徹底、カバレッジ計測 | T-03-1, T-03-2, T-06-2 |
| CI/CD失敗 | 低 | 低 | ローカルでの事前検証 | T-06-1, T-10-4 |

---

## 前提条件

- pnpmがインストールされている
- packages/sharedパッケージが存在する
- TypeScript環境が整っている
- Git Worktreeが利用可能
- GitHub CLIがインストールされている

---

## 備考

### 技術的制約
- libSQLはSQLite互換だが、一部拡張機能に制限がある
- Drizzle ORMのlibSQLドライバーは比較的新しいため、ドキュメント参照が重要
- FTS5やDiskANN等の拡張は後続タスク（CONV-04-03, CONV-04-04）で実装

### 参考資料
- [Drizzle ORM公式ドキュメント](https://orm.drizzle.team/)
- [libSQL公式ドキュメント](https://github.com/tursodatabase/libsql)
- [Turso公式ドキュメント](https://docs.turso.tech/)
- [HybridRAGパイプラインアーキテクチャ概要](docs/30-workflows/unassigned-task/task-**-architecture-overview-rag-pipeline.md)
```
