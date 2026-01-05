# 埋め込み生成パイプライン - タスク実行仕様書

## ユーザーからの元の指示

```
RAG（検索拡張生成）システムを構築するためには、ドキュメントをベクトル埋め込み（embedding）に変換する必要がある。
このパイプラインは変換結果をチャンク分割し、各チャンクの埋め込みベクトルを生成してデータベースに保存する。
```

## メタ情報

| 項目             | 内容                              |
| ---------------- | --------------------------------- |
| タスクID         | CONV-06                           |
| Worktreeパス     | `.worktrees/task-{timestamp}`     |
| ブランチ名       | `task-{timestamp}`                |
| タスク名         | 埋め込み生成パイプライン          |
| 分類             | 新規機能                          |
| 対象機能         | RAG基盤（埋め込み・チャンキング） |
| 優先度           | 高                                |
| 見積もり規模     | 中規模                            |
| ステータス       | 未実施                            |
| 作成日           | 2025-12-26                        |
| 発見元           | アーキテクチャ設計                |
| 発見エージェント | .claude/agents/logic-dev.md       |

---

## タスク概要

### 目的

変換されたドキュメントをセマンティックチャンクに分割し、埋め込みベクトルを生成してデータベースに保存するパイプラインを実装することで、RAG（検索拡張生成）システムの基盤を構築する。

### 背景

現状、RAG型定義・スキーマは完了しているが、実際のチャンキングと埋め込み生成機能が未実装である。以下の問題がある：

- 変換結果からチャンクへの分割ロジックが未実装
- 埋め込みモデルの統合が未完了
- バッチ処理による効率的な埋め込み生成機能がない
- Contextual Retrieval（Anthropic方式）未対応
- Late Chunking（Jina AI方式）未対応

これらを解決するため、埋め込み生成パイプラインを実装する。

### 最終ゴール

- セマンティック・階層チャンキングの実装
- 複数埋め込みプロバイダー対応（OpenAI, Voyage, Qwen3, BGE-M3, EmbeddingGemma）
- Contextual Embeddings対応（67%の検索精度向上）
- バッチ処理・レート制限対応
- 変換→チャンク→埋め込み→保存の完全な自動パイプライン
- 差分更新（変更ファイルのみ再処理）

### 成果物一覧

| 種別         | 成果物                   | 配置先                                                          |
| ------------ | ------------------------ | --------------------------------------------------------------- |
| 環境         | Git Worktree環境         | `.worktrees/task-{timestamp}`                                   |
| サービス     | チャンキングサービス     | `packages/shared/src/services/chunking/`                        |
| サービス     | 埋め込みプロバイダー     | `packages/shared/src/services/embedding/providers/`             |
| サービス     | 埋め込みパイプライン     | `packages/shared/src/services/embedding/pipeline.ts`            |
| 設定         | プロバイダー設定         | `packages/shared/src/config/embedding-providers.ts`             |
| 型定義       | パイプライン型定義       | `packages/shared/src/types/embedding-pipeline.ts`               |
| テスト       | ユニットテスト           | 各サービスの`__tests__`ディレクトリ                             |
| テスト       | 統合テスト               | `packages/shared/src/services/embedding/__tests__/integration/` |
| ドキュメント | システムドキュメント更新 | `docs/00-requirements/`配下の関連ドキュメント                   |
| ドキュメント | 未完了タスク記録         | `docs/30-workflows/unassigned-task/`配下                        |
| PR           | GitHub Pull Request      | GitHub UI                                                       |

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

| ID     | フェーズ         | サブタスク名                   | 責務                                   | 依存   |
| ------ | ---------------- | ------------------------------ | -------------------------------------- | ------ |
| T--1-1 | 環境準備         | Git Worktree環境作成・初期化   | タスク専用の開発環境準備               | なし   |
| T-00-1 | 要件定義         | チャンキング戦略要件定義       | チャンキング手法・パラメータの定義     | T--1-1 |
| T-00-2 | 要件定義         | 埋め込みモデル要件定義         | モデル選定基準・API統合要件の定義      | T-00-1 |
| T-01-1 | 設計             | チャンキングサービス設計       | セマンティック・階層チャンキング設計   | T-00-2 |
| T-01-2 | 設計             | 埋め込みプロバイダー設計       | プロバイダー抽象化・複数モデル対応設計 | T-01-1 |
| T-01-3 | 設計             | パイプライン統合設計           | 変換→チャンク→埋め込み→保存フロー設計  | T-01-2 |
| T-02-1 | 設計レビュー     | アーキテクチャレビュー         | 設計の妥当性検証                       | T-01-3 |
| T-03-1 | テスト作成       | チャンキングサービステスト     | チャンク分割ロジックのテスト           | T-02-1 |
| T-03-2 | テスト作成       | 埋め込みプロバイダーテスト     | API統合・バッチ処理のテスト            | T-02-1 |
| T-03-3 | テスト作成       | パイプライン統合テスト         | E2Eフローのテスト                      | T-02-1 |
| T-04-1 | 実装             | チャンキングサービス実装       | セマンティック・階層チャンキング実装   | T-03-1 |
| T-04-2 | 実装             | OpenAI埋め込みプロバイダー実装 | OpenAI API統合                         | T-03-2 |
| T-04-3 | 実装             | Qwen3埋め込みプロバイダー実装  | Qwen3 API統合（MTEB 1位）              | T-04-2 |
| T-04-4 | 実装             | バッチ処理・レート制限実装     | バッチ処理・リトライロジック           | T-04-3 |
| T-04-5 | 実装             | パイプライン統合実装           | 変換→チャンク→埋め込み→保存フロー      | T-04-4 |
| T-04-6 | 実装             | Contextual Embeddings実装      | Anthropic方式のコンテキスト付与        | T-04-5 |
| T-05-1 | リファクタリング | コード品質改善                 | 重複排除・命名改善・型安全性向上       | T-04-6 |
| T-06-1 | 品質保証         | 自動テスト実行                 | 全テスト成功確認                       | T-05-1 |
| T-06-2 | 品質保証         | パフォーマンステスト           | 1000チャンク処理時間・メモリ使用量確認 | T-06-1 |
| T-07-1 | 最終レビュー     | 包括的品質レビュー             | 実装完了後の全体品質検証               | T-06-2 |
| T-08-1 | 手動テスト       | 機能テスト                     | 実際のドキュメントでの動作確認         | T-07-1 |
| T-08-2 | 手動テスト       | パフォーマンステスト           | 大容量ドキュメントでの性能確認         | T-08-1 |
| T-09-1 | ドキュメント更新 | システムドキュメント更新       | docs/00-requirements/配下の更新        | T-08-2 |
| T-09-2 | ドキュメント更新 | 未完了タスク記録               | スコープ外タスクの記録                 | T-09-1 |
| T-10-1 | PR作成・CI確認   | 差分確認・コミット作成         | Git差分確認とコミット                  | T-09-2 |
| T-10-2 | PR作成・CI確認   | PR作成                         | GitHub PR作成                          | T-10-1 |
| T-10-3 | PR作成・CI確認   | PR補足コメント追加             | レビュー観点の追加                     | T-10-2 |
| T-10-4 | PR作成・CI確認   | CI/CD完了確認                  | CI成功確認                             | T-10-3 |
| T-10-5 | PR作成・CI確認   | ユーザーへマージ可能通知       | マージ準備完了の報告                   | T-10-4 |

**総サブタスク数**: 29個

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

タスク実装用の独立したGit Worktree環境を作成し、本体ブランチ（main）に影響を与えずに開発を進める。

#### 背景

RAG基盤の新規機能実装のため、独立したWorktree環境で作業を行う。既存のチャット機能やファイル変換機能とは独立しているが、安全のためWorktreeを使用する。

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

# 依存関係インストール
pnpm install

# ビルド確認
pnpm build
```

#### 成果物

| 成果物           | パス                          | 内容                             |
| ---------------- | ----------------------------- | -------------------------------- |
| Git Worktree環境 | `.worktrees/task-{timestamp}` | 独立した作業ディレクトリ         |
| 新規ブランチ     | `task-{timestamp}`            | タスク専用ブランチ               |
| 初期化済み環境   | -                             | 依存関係インストール・ビルド完了 |

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

---

## Phase 0: 要件定義

### T-00-1: チャンキング戦略要件定義

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:gather-requirements chunking-strategy
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: チャンキング手法とパラメータの詳細要件を明確化する必要があるため

#### 使用エージェント

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 要件分析・ユースケース定義の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                                       | 活用方法                   |
| -------------------------------------------------------------- | -------------------------- |
| .claude/skills/functional-non-functional-requirements/SKILL.md | 機能要件・非機能要件の整理 |
| .claude/skills/acceptance-criteria-writing/SKILL.md            | 受け入れ基準の明確化       |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

セマンティック・階層・固定サイズ・文単位チャンキングの各戦略と、Contextual Embeddings、Late Chunkingの要件を定義する。

#### 背景

RAG検索の精度を左右するチャンキング戦略を、ドキュメントタイプ別に最適化する必要がある。

#### 責務（単一責務）

チャンキング戦略の要件定義のみを担当する。埋め込みモデル要件は含まない。

#### 成果物

| 成果物                 | パス                                                                       | 内容                                     |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| チャンキング要件定義書 | `docs/30-workflows/embedding-generation-pipeline/requirements-chunking.md` | チャンキング手法・パラメータ・戦略の定義 |

#### 完了条件

- [ ] 対応チャンキング戦略が明確に定義されている（semantic, hierarchical, fixed, sentence）
- [ ] 各戦略のパラメータが定義されている（トークン数、オーバーラップ率）
- [ ] ドキュメントタイプ別の推奨戦略が定義されている
- [ ] Contextual Embeddings要件が定義されている
- [ ] Late Chunking要件が定義されている
- [ ] 非機能要件が定義されている（処理速度、メモリ使用量）

#### 依存関係

- **前提**: T--1-1（環境準備）
- **後続**: T-00-2（埋め込みモデル要件定義）

---

### T-00-2: 埋め込みモデル要件定義

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:gather-requirements embedding-models
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 埋め込みモデルの選定基準とAPI統合要件を明確化する必要があるため

#### 使用エージェント

- **エージェント**: .claude/agents/gateway-dev.md
- **選定理由**: 外部API統合・複数プロバイダー管理の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                    | 活用方法                     |
| ------------------------------------------- | ---------------------------- |
| .claude/skills/api-client-patterns/SKILL.md | API統合パターンの設計        |
| .claude/skills/network-resilience/SKILL.md  | リトライ・フォールバック設計 |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

対応する埋め込みモデル、API統合方法、バッチ処理・レート制限対応の要件を定義する。

#### 背景

複数の埋め込みモデル（OpenAI, Voyage, Qwen3, BGE-M3, EmbeddingGemma）に対応し、用途に応じて切り替えられる設計が必要。

#### 責務（単一責務）

埋め込みモデルの要件定義のみを担当する。チャンキング要件は含まない。

#### 成果物

| 成果物                   | パス                                                                        | 内容                                    |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------------------- |
| 埋め込みモデル要件定義書 | `docs/30-workflows/embedding-generation-pipeline/requirements-embedding.md` | モデル選定基準・API統合・バッチ処理要件 |

#### 完了条件

- [ ] 対応埋め込みモデルが選定されている（OpenAI, Qwen3, Voyage, BGE-M3, EmbeddingGemma）
- [ ] 各モデルのAPI統合方法が定義されている
- [ ] バッチ処理仕様が定義されている（バッチサイズ、並列度）
- [ ] レート制限対応が定義されている（リトライ、バックオフ）
- [ ] コスト試算が完了している

#### 依存関係

- **前提**: T-00-1（チャンキング戦略要件定義）
- **後続**: T-01-1（チャンキングサービス設計）

---

## Phase 1: 設計

### T-01-1: チャンキングサービス設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:design-architecture chunking-service
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: チャンキングサービスのアーキテクチャ設計が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック・アルゴリズム設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                              | 活用方法                   |
| ----------------------------------------------------- | -------------------------- |
| .claude/skills/solid-principles/SKILL.md              | 単一責務・依存性逆転の適用 |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離の設計         |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

セマンティック・階層・固定サイズ・文単位チャンキングのサービスアーキテクチャを設計する。

#### 背景

Phase 0で定義したチャンキング要件を、実装可能な設計に落とし込む。

#### 責務（単一責務）

チャンキングサービスの設計のみを担当する。埋め込みプロバイダー設計は含まない。

#### 参照資料

| 参照資料               | パス                                                                       | 内容                         |
| ---------------------- | -------------------------------------------------------------------------- | ---------------------------- |
| チャンキング要件定義書 | `docs/30-workflows/embedding-generation-pipeline/requirements-chunking.md` | チャンキング戦略・パラメータ |

#### 成果物

| 成果物                   | パス                                                                 | 内容                                       |
| ------------------------ | -------------------------------------------------------------------- | ------------------------------------------ |
| チャンキングサービス設計 | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md` | サービスクラス・メソッド・アルゴリズム設計 |

#### 完了条件

- [ ] ChunkingServiceインターフェース設計完了
- [ ] セマンティックチャンキングアルゴリズム設計完了
- [ ] 階層チャンキングアルゴリズム設計完了
- [ ] Contextual Embeddings対応設計完了
- [ ] Late Chunking対応設計完了
- [ ] エラーハンドリング戦略設計完了

#### 依存関係

- **前提**: T-00-2（埋め込みモデル要件定義）
- **後続**: T-01-2（埋め込みプロバイダー設計）

---

### T-01-2: 埋め込みプロバイダー設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:design-architecture embedding-provider
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 埋め込みプロバイダーの抽象化設計が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/gateway-dev.md
- **選定理由**: 外部API統合・プロバイダー管理の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                    | 活用方法                   |
| ------------------------------------------- | -------------------------- |
| .claude/skills/api-client-patterns/SKILL.md | API統合パターンの適用      |
| .claude/skills/solid-principles/SKILL.md    | インターフェース分離の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

複数の埋め込みモデル（OpenAI, Qwen3, Voyage, BGE-M3, EmbeddingGemma）を統一インターフェースで扱える設計を行う。

#### 背景

チャンキングサービスが設計されたので、埋め込み生成を行うプロバイダー層を設計する。

#### 責務（単一責務）

埋め込みプロバイダーの設計のみを担当する。パイプライン統合設計は含まない。

#### 参照資料

| 参照資料                 | パス                                                                        | 内容                        |
| ------------------------ | --------------------------------------------------------------------------- | --------------------------- |
| 埋め込みモデル要件定義書 | `docs/30-workflows/embedding-generation-pipeline/requirements-embedding.md` | モデル選定基準・API統合要件 |
| チャンキングサービス設計 | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md`        | チャンキングサービス設計    |

#### 成果物

| 成果物                     | パス                                                                  | 内容                                   |
| -------------------------- | --------------------------------------------------------------------- | -------------------------------------- |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md` | プロバイダーインターフェース・実装設計 |

#### 完了条件

- [ ] EmbeddingProviderインターフェース設計完了
- [ ] OpenAIプロバイダー設計完了
- [ ] Qwen3プロバイダー設計完了
- [ ] バッチ処理設計完了
- [ ] レート制限対応設計完了
- [ ] プロバイダーファクトリー設計完了

#### 依存関係

- **前提**: T-01-1（チャンキングサービス設計）
- **後続**: T-01-3（パイプライン統合設計）

---

### T-01-3: パイプライン統合設計

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:design-architecture embedding-pipeline
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 変換→チャンク→埋め込み→保存の統合フロー設計が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/arch-police.md
- **選定理由**: クリーンアーキテクチャに基づいた統合設計の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                              | 活用方法                   |
| ----------------------------------------------------- | -------------------------- |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離の設計         |
| .claude/skills/solid-principles/SKILL.md              | 依存性逆転・単一責務の適用 |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

チャンキングサービスと埋め込みプロバイダーを統合し、完全な自動パイプラインを設計する。

#### 背景

各サービスが設計されたので、それらを統合して完全なフローを実現する設計を行う。

#### 責務（単一責務）

パイプライン統合の設計のみを担当する。個別サービスの設計は含まない。

#### 参照資料

| 参照資料                   | パス                                                                  | 内容             |
| -------------------------- | --------------------------------------------------------------------- | ---------------- |
| チャンキングサービス設計   | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md`  | チャンキング設計 |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md` | プロバイダー設計 |

#### 成果物

| 成果物                 | パス                                                                 | 内容                                   |
| ---------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| パイプライン統合設計書 | `docs/30-workflows/embedding-generation-pipeline/design-pipeline.md` | パイプラインフロー・統合アーキテクチャ |

#### 完了条件

- [ ] EmbeddingPipelineクラス設計完了
- [ ] 変換→チャンク→埋め込み→保存フロー設計完了
- [ ] エラーハンドリング戦略設計完了
- [ ] トランザクション管理設計完了
- [ ] 差分更新（変更検知・再処理）設計完了

#### 依存関係

- **前提**: T-01-2（埋め込みプロバイダー設計）
- **後続**: T-02-1（設計レビューゲート）

---

## Phase 2: 設計レビューゲート

### T-02-1: アーキテクチャレビュー

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:review-architecture embedding-generation-pipeline
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 実装開始前に設計の妥当性を検証する必要があるため

#### 使用エージェント

- **エージェント**: .claude/agents/arch-police.md
- **選定理由**: アーキテクチャレビュー・レイヤー違反検出の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                              | 活用方法                       |
| ----------------------------------------------------- | ------------------------------ |
| .claude/skills/clean-architecture-principles/SKILL.md | レイヤー分離の妥当性確認       |
| .claude/skills/solid-principles/SKILL.md              | SOLID原則準拠の確認            |
| .claude/skills/architectural-patterns/SKILL.md        | アーキテクチャパターン適用確認 |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

Phase 0-1で作成した要件・設計ドキュメントの妥当性を検証し、実装前に問題を発見する。

#### 背景

設計ミスが実装後に発見されると修正コストが大幅に増加する。「Shift Left」原則に基づき、問題を早期に検出する。

#### 責務（単一責務）

設計レビューのみを担当する。実装は含まない。

#### 参照資料

| 参照資料                   | パス                                                                        | 内容               |
| -------------------------- | --------------------------------------------------------------------------- | ------------------ |
| チャンキング要件定義書     | `docs/30-workflows/embedding-generation-pipeline/requirements-chunking.md`  | チャンキング要件   |
| 埋め込みモデル要件定義書   | `docs/30-workflows/embedding-generation-pipeline/requirements-embedding.md` | 埋め込みモデル要件 |
| チャンキングサービス設計   | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md`        | チャンキング設計   |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md`       | プロバイダー設計   |
| パイプライン統合設計書     | `docs/30-workflows/embedding-generation-pipeline/design-pipeline.md`        | パイプライン設計   |

#### レビューチェックリスト

**アーキテクチャ観点**

- [ ] レイヤー分離が適切である（サービス層、API層、データアクセス層）
- [ ] 依存関係が適切な方向である（上位層→下位層）
- [ ] 単一責務原則が守られている

**API統合観点**

- [ ] プロバイダー抽象化が適切である
- [ ] Factory Patternが適切に使用されている
- [ ] レート制限対応が設計されている

**パフォーマンス観点**

- [ ] バッチ処理が効率的に設計されている
- [ ] メモリ使用量が許容範囲である
- [ ] 大容量ドキュメントへの対応がある

**セキュリティ観点**

- [ ] APIキーの安全な管理
- [ ] プライバシーへの配慮（ローカル処理優先）

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 3へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 3へ進行
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定

#### 戻り先決定基準

| 問題の種類 | 戻り先              |
| ---------- | ------------------- |
| 要件の問題 | Phase 0（要件定義） |
| 設計の問題 | Phase 1（設計）     |
| 両方の問題 | Phase 0（要件定義） |

#### 成果物

| 成果物             | パス                                                               | 内容                   |
| ------------------ | ------------------------------------------------------------------ | ---------------------- |
| 設計レビュー報告書 | `docs/30-workflows/embedding-generation-pipeline/review-design.md` | レビュー結果・指摘事項 |

#### 完了条件

- [ ] 全レビューチェック項目が確認されている
- [ ] レビュー結果がPASSまたはMINORである
- [ ] MINOR指摘がある場合、対応方針が明確である

#### 依存関係

- **前提**: T-01-3（パイプライン統合設計）
- **後続**: T-03-1（テスト作成）またはPhase 0/1への戻り

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: チャンキングサービステスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/services/chunking/chunking-service.ts
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: チャンキングサービスのテストファースト開発のため

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテスト作成・TDD原則・境界値分析の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                        | 活用方法                         |
| ----------------------------------------------- | -------------------------------- |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactorサイクルの実践 |
| .claude/skills/boundary-value-analysis/SKILL.md | 境界値テストケースの作成         |
| .claude/skills/test-data-management/SKILL.md    | テストドキュメントの準備         |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

ChunkingServiceの期待される動作を検証するテストを実装より先に作成する。

#### 背景

TDDサイクルのRed段階。テストを通すための実装を行う前に、期待動作を定義する。

#### 責務（単一責務）

チャンキングサービスのテスト作成のみを担当する。埋め込みプロバイダーのテストは含まない。

#### 参照資料

| 参照資料                 | パス                                                                       | 内容             |
| ------------------------ | -------------------------------------------------------------------------- | ---------------- |
| チャンキング要件定義書   | `docs/30-workflows/embedding-generation-pipeline/requirements-chunking.md` | チャンキング要件 |
| チャンキングサービス設計 | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md`       | チャンキング設計 |
| 設計レビュー報告書       | `docs/30-workflows/embedding-generation-pipeline/review-design.md`         | レビュー結果     |

#### 成果物

| 成果物         | パス                                                                       | 内容                       |
| -------------- | -------------------------------------------------------------------------- | -------------------------- |
| ユニットテスト | `packages/shared/src/services/chunking/__tests__/chunking-service.test.ts` | チャンキングサービステスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが失敗することを確認（Red状態）- サービス未実装のため

#### 完了条件

- [ ] セマンティックチャンキングのテストが作成されている
- [ ] 階層チャンキングのテストが作成されている
- [ ] 固定サイズチャンキングのテストが作成されている
- [ ] 文単位チャンキングのテストが作成されている
- [ ] エラーケースのテストが作成されている
- [ ] テストが失敗する（Red状態）

#### 依存関係

- **前提**: T-02-1（設計レビュー）
- **後続**: T-03-2（埋め込みプロバイダーテスト）

---

### T-03-2: 埋め込みプロバイダーテスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/services/embedding/providers/openai-provider.ts
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 埋め込みプロバイダーのテストファースト開発のため

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテスト作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

埋め込みプロバイダー（OpenAI, Qwen3等）のテストを実装より先に作成する。

#### 背景

API統合のテストをモックを使用して先に定義する。

#### 責務（単一責務）

埋め込みプロバイダーのテスト作成のみを担当する。パイプラインテストは含まない。

#### 参照資料

| 参照資料                   | パス                                                                        | 内容               |
| -------------------------- | --------------------------------------------------------------------------- | ------------------ |
| 埋め込みモデル要件定義書   | `docs/30-workflows/embedding-generation-pipeline/requirements-embedding.md` | 埋め込みモデル要件 |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md`       | プロバイダー設計   |
| 設計レビュー報告書         | `docs/30-workflows/embedding-generation-pipeline/review-design.md`          | レビュー結果       |

#### 成果物

| 成果物         | パス                                                                                 | 内容                     |
| -------------- | ------------------------------------------------------------------------------------ | ------------------------ |
| ユニットテスト | `packages/shared/src/services/embedding/providers/__tests__/openai-provider.test.ts` | OpenAIプロバイダーテスト |
| ユニットテスト | `packages/shared/src/services/embedding/providers/__tests__/qwen3-provider.test.ts`  | Qwen3プロバイダーテスト  |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが失敗することを確認（Red状態）- プロバイダー未実装のため

#### 完了条件

- [ ] OpenAIプロバイダーのテストが作成されている
- [ ] Qwen3プロバイダーのテストが作成されている
- [ ] バッチ処理のテストが作成されている
- [ ] レート制限対応のテストが作成されている
- [ ] エラーケースのテストが作成されている
- [ ] テストが失敗する（Red状態）

#### 依存関係

- **前提**: T-03-1（チャンキングサービステスト）
- **後続**: T-03-3（パイプライン統合テスト）

---

### T-03-3: パイプライン統合テスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実行してください

```
/ai:generate-unit-tests packages/shared/src/services/embedding/pipeline.ts
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: パイプライン統合のテストファースト開発のため

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: 統合テスト作成の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

変換→チャンク→埋め込み→保存の完全なフローのテストを作成する。

#### 背景

統合フローが正しく動作することを、E2Eテストで事前に定義する。

#### 責務（単一責務）

パイプライン統合テストの作成のみを担当する。

#### 参照資料

| 参照資料               | パス                                                                 | 内容             |
| ---------------------- | -------------------------------------------------------------------- | ---------------- |
| パイプライン統合設計書 | `docs/30-workflows/embedding-generation-pipeline/design-pipeline.md` | パイプライン設計 |
| 設計レビュー報告書     | `docs/30-workflows/embedding-generation-pipeline/review-design.md`   | レビュー結果     |

#### 成果物

| 成果物     | パス                                                                            | 内容                   |
| ---------- | ------------------------------------------------------------------------------- | ---------------------- |
| 統合テスト | `packages/shared/src/services/embedding/__tests__/integration/pipeline.test.ts` | パイプライン統合テスト |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが失敗することを確認（Red状態）- パイプライン未実装のため

#### 完了条件

- [ ] 変換→チャンク→埋め込み→保存フローのテストが作成されている
- [ ] エラーハンドリングのテストが作成されている
- [ ] 差分更新のテストが作成されている
- [ ] テストが失敗する（Red状態）

#### 依存関係

- **前提**: T-03-2（埋め込みプロバイダーテスト）
- **後続**: T-04-1（実装）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: チャンキングサービス実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実装してください

```
/ai:implement-business-logic chunking-service
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: チャンキングサービスのビジネスロジック実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック・アルゴリズム実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

セマンティック・階層・固定サイズ・文単位チャンキングを実装する。

#### 背景

テストが作成されたので、テストを通すための実装を行う（TDD Green段階）。

#### 責務（単一責務）

チャンキングサービス実装のみを担当する。埋め込みプロバイダー実装は含まない。

#### 参照資料

| 参照資料                 | パス                                                                       | 内容                          |
| ------------------------ | -------------------------------------------------------------------------- | ----------------------------- |
| チャンキングサービス設計 | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md`       | チャンキング設計              |
| 設計レビュー報告書       | `docs/30-workflows/embedding-generation-pipeline/review-design.md`         | レビュー結果                  |
| ユニットテスト           | `packages/shared/src/services/chunking/__tests__/chunking-service.test.ts` | チャンキングテスト（Red状態） |

#### 成果物

| 成果物                   | パス                                                            | 内容                           |
| ------------------------ | --------------------------------------------------------------- | ------------------------------ |
| チャンキングサービス実装 | `packages/shared/src/services/chunking/chunking-service.ts`     | チャンキングロジック実装       |
| セマンティックチャンカー | `packages/shared/src/services/chunking/semantic-chunker.ts`     | セマンティックチャンキング実装 |
| 階層チャンカー           | `packages/shared/src/services/chunking/hierarchical-chunker.ts` | 階層チャンキング実装           |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- チャンキングテストがパスする

#### 完了条件

- [ ] セマンティックチャンキングが実装されている
- [ ] 階層チャンキングが実装されている
- [ ] 固定サイズチャンキングが実装されている
- [ ] 文単位チャンキングが実装されている
- [ ] Contextual Embeddings対応が実装されている
- [ ] チャンキング関連テストがパスする

#### 依存関係

- **前提**: T-03-3（パイプライン統合テスト）
- **後続**: T-04-2（OpenAI埋め込みプロバイダー実装）

---

### T-04-2: OpenAI埋め込みプロバイダー実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実装してください

```
/ai:create-api-gateway openai
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: OpenAI API統合ゲートウェイの実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/gateway-dev.md
- **選定理由**: 外部API統合・ゲートウェイ実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

OpenAI Embeddings API（text-embedding-3-small/large）を統合する。

#### 背景

チャンキングサービスが実装されたので、埋め込み生成機能を実装する。

#### 責務（単一責務）

OpenAI埋め込みプロバイダー実装のみを担当する。他のプロバイダーは含まない。

#### 参照資料

| 参照資料                   | パス                                                                                 | 内容                    |
| -------------------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md`                | プロバイダー設計        |
| ユニットテスト             | `packages/shared/src/services/embedding/providers/__tests__/openai-provider.test.ts` | OpenAIテスト（Red状態） |

#### 成果物

| 成果物                     | パス                                                                  | 内容               |
| -------------------------- | --------------------------------------------------------------------- | ------------------ |
| OpenAI埋め込みプロバイダー | `packages/shared/src/services/embedding/providers/openai-provider.ts` | OpenAI API統合実装 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- OpenAIプロバイダーテストがパスする

#### 完了条件

- [ ] OpenAI API統合が実装されている
- [ ] text-embedding-3-small/largeに対応している
- [ ] エラーハンドリングが実装されている
- [ ] OpenAIプロバイダーテストがパスする

#### 依存関係

- **前提**: T-04-1（チャンキングサービス実装）
- **後続**: T-04-3（Qwen3埋め込みプロバイダー実装）

---

### T-04-3: Qwen3埋め込みプロバイダー実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ (`.worktrees/task-{timestamp}`) 内で実装してください

```
/ai:implement-business-logic qwen3-embedding-provider
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: Qwen3埋め込みプロバイダーの実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/gateway-dev.md
- **選定理由**: 外部API統合の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

Qwen3-Embedding-8B（MTEB多言語1位）のプロバイダーを実装する。

#### 背景

OpenAIプロバイダーが実装されたので、より高精度なQwen3プロバイダーを実装する。

#### 責務（単一責務）

Qwen3埋め込みプロバイダー実装のみを担当する。

#### 参照資料

| 参照資料                   | パス                                                                  | 内容               |
| -------------------------- | --------------------------------------------------------------------- | ------------------ |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md` | プロバイダー設計   |
| OpenAIプロバイダー実装     | `packages/shared/src/services/embedding/providers/openai-provider.ts` | OpenAI実装（参考） |

#### 成果物

| 成果物                    | パス                                                                 | 内容              |
| ------------------------- | -------------------------------------------------------------------- | ----------------- |
| Qwen3埋め込みプロバイダー | `packages/shared/src/services/embedding/providers/qwen3-provider.ts` | Qwen3 API統合実装 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- Qwen3プロバイダーテストがパスする

#### 完了条件

- [ ] Qwen3 API統合が実装されている
- [ ] 4096次元ベクトルに対応している
- [ ] エラーハンドリングが実装されている
- [ ] Qwen3プロバイダーテストがパスする

#### 依存関係

- **前提**: T-04-2（OpenAI埋め込みプロバイダー実装）
- **後続**: T-04-4（バッチ処理・レート制限実装）

---

### T-04-4: バッチ処理・レート制限実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実装してください

```
/ai:implement-business-logic embedding-batch-processor
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: バッチ処理とレート制限の実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック・アルゴリズム実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                   | 活用方法                   |
| ------------------------------------------ | -------------------------- |
| .claude/skills/network-resilience/SKILL.md | リトライ・バックオフの実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

大量のチャンクを効率的にバッチ処理し、API制限に対応するロジックを実装する。

#### 背景

プロバイダーが実装されたので、効率的なバッチ処理とレート制限対応を実装する。

#### 責務（単一責務）

バッチ処理・レート制限実装のみを担当する。

#### 参照資料

| 参照資料                   | パス                                                                  | 内容           |
| -------------------------- | --------------------------------------------------------------------- | -------------- |
| 埋め込みプロバイダー設計書 | `docs/30-workflows/embedding-generation-pipeline/design-embedding.md` | バッチ処理設計 |

#### 成果物

| 成果物             | パス                                                        | 内容                       |
| ------------------ | ----------------------------------------------------------- | -------------------------- |
| バッチプロセッサー | `packages/shared/src/services/embedding/batch-processor.ts` | バッチ処理・レート制限実装 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- バッチ処理テストがパスする

#### 完了条件

- [ ] バッチサイズ調整が実装されている（100チャンク/バッチ推奨）
- [ ] レート制限検知が実装されている
- [ ] 指数バックオフリトライが実装されている
- [ ] 並列バッチ処理が実装されている
- [ ] バッチ処理テストがパスする

#### 依存関係

- **前提**: T-04-3（Qwen3埋め込みプロバイダー実装）
- **後続**: T-04-5（パイプライン統合実装）

---

### T-04-5: パイプライン統合実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実装してください

```
/ai:implement-business-logic embedding-pipeline
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: パイプライン統合のビジネスロジック実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック統合の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

変換→チャンク→埋め込み→保存の完全な自動パイプラインを実装する。

#### 背景

個別サービスが実装されたので、それらを統合して完全なフローを実現する。

#### 責務（単一責務）

パイプライン統合実装のみを担当する。

#### 参照資料

| 参照資料                 | パス                                                                 | 内容                 |
| ------------------------ | -------------------------------------------------------------------- | -------------------- |
| パイプライン統合設計書   | `docs/30-workflows/embedding-generation-pipeline/design-pipeline.md` | パイプライン設計     |
| チャンキングサービス実装 | `packages/shared/src/services/chunking/chunking-service.ts`          | チャンキング実装済み |
| プロバイダー実装         | `packages/shared/src/services/embedding/providers/`                  | プロバイダー実装済み |

#### 成果物

| 成果物           | パス                                                 | 内容                 |
| ---------------- | ---------------------------------------------------- | -------------------- |
| パイプライン実装 | `packages/shared/src/services/embedding/pipeline.ts` | パイプライン統合実装 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- パイプライン統合テストがパスする

#### 完了条件

- [ ] EmbeddingPipelineクラスが実装されている
- [ ] 変換→チャンク→埋め込み→保存フローが動作する
- [ ] エラーハンドリングが実装されている
- [ ] トランザクション管理が実装されている
- [ ] パイプライン統合テストがパスする

#### 依存関係

- **前提**: T-04-4（バッチ処理・レート制限実装）
- **後続**: T-04-6（Contextual Embeddings実装）

---

### T-04-6: Contextual Embeddings実装

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実装してください

```
/ai:implement-business-logic contextual-embeddings
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: Contextual Embeddings（Anthropic方式）の実装が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック実装の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

チャンクにコンテキスト情報を付与することで、検索精度を67%向上させる（Anthropic方式）。

#### 背景

基本パイプラインが実装されたので、検索精度向上のためのContextual Embeddings機能を追加する。

#### 責務（単一責務）

Contextual Embeddings実装のみを担当する。

#### 参照資料

| 参照資料                 | パス                                                                 | 内容                      |
| ------------------------ | -------------------------------------------------------------------- | ------------------------- |
| チャンキングサービス設計 | `docs/30-workflows/embedding-generation-pipeline/design-chunking.md` | Contextual Embeddings設計 |
| パイプライン実装         | `packages/shared/src/services/embedding/pipeline.ts`                 | パイプライン実装済み      |

#### 成果物

| 成果物                    | パス                                                          | 内容                             |
| ------------------------- | ------------------------------------------------------------- | -------------------------------- |
| Contextual Embeddings実装 | `packages/shared/src/services/chunking/contextual-chunker.ts` | コンテキスト付与チャンキング実装 |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] テストが成功することを確認（Green状態）- Contextual Embeddingsテストがパスする

#### 完了条件

- [ ] LLMによるコンテキスト生成が実装されている
- [ ] チャンクへのコンテキスト付与が実装されている
- [ ] Claudeプロンプトキャッシング対応が実装されている
- [ ] Contextual Embeddingsテストがパスする

#### 依存関係

- **前提**: T-04-5（パイプライン統合実装）
- **後続**: T-05-1（リファクタリング）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コード品質改善

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実装してください

```
/ai:refactor embedding-generation-pipeline
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: コード品質向上のリファクタリングが必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: Clean Code原則・SOLID原則・リファクタリングパターンの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                                     | 活用方法                        |
| -------------------------------------------- | ------------------------------- |
| .claude/skills/clean-code-practices/SKILL.md | 命名・関数サイズ・DRY原則の適用 |
| .claude/skills/solid-principles/SKILL.md     | 単一責務・依存性逆転の確認      |
| .claude/skills/type-safety-patterns/SKILL.md | 型安全性の向上                  |

- **参照**: `.claude/skills/skill_list.md`

#### 目的

実装したコードを、保守性と再利用性の観点からリファクタリングする。動作を変えずにコード品質を改善。

#### 背景

全機能の実装が完了したので、コードの可読性・保守性を向上させる。

#### 責務（単一責務）

コード品質改善のみを担当する。新機能追加は行わない。

#### 成果物

| 成果物                     | パス           | 内容             |
| -------------------------- | -------------- | ---------------- |
| リファクタリング済みコード | 各実装ファイル | 改善されたコード |

#### TDD検証: 継続Green確認

```bash
pnpm --filter @repo/shared test:run
```

- [ ] リファクタリング後もテストが成功することを確認（継続Green状態）

#### 完了条件

- [ ] 重複コードが排除されている
- [ ] 関数が適切なサイズに分割されている
- [ ] 変数・関数名が意図を明確に表現している
- [ ] any型が使用されていない
- [ ] 全テストが継続成功する

#### 依存関係

- **前提**: T-04-6（Contextual Embeddings実装）
- **後続**: T-06-1（品質保証）

---

## Phase 6: 品質保証

### T-06-1: 自動テスト実行

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 全テストの一括実行とカバレッジ確認が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: テスト実行・カバレッジ分析の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

全自動テストを実行し、成功を確認する。

#### 背景

実装・リファクタリングが完了したので、品質ゲートを通過する。

#### 責務（単一責務）

自動テスト実行のみを担当する。

#### 実行手順

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test:run

# カバレッジ確認
pnpm --filter @repo/shared test:coverage
```

#### 品質ゲートチェックリスト

**機能検証**

- [ ] 全ユニットテスト成功
- [ ] 全統合テスト成功

**コード品質**

- [ ] Lintエラーなし
- [ ] 型エラーなし
- [ ] コードフォーマット適用済み

**テスト網羅性**

- [ ] Statement Coverage ≥ 80%
- [ ] Branch Coverage ≥ 75%
- [ ] Function Coverage ≥ 80%

**セキュリティ**

- [ ] APIキーの適切な管理
- [ ] プライバシー保護（ローカル処理）

#### 完了条件

- [ ] 全ユニットテストが成功している
- [ ] コードカバレッジが80%以上である
- [ ] テスト失敗が0件である

#### 依存関係

- **前提**: T-05-1（リファクタリング）
- **後続**: T-06-2（パフォーマンステスト）

---

### T-06-2: パフォーマンステスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:analyze-performance embedding-pipeline
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: パフォーマンス分析とボトルネック特定が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/sre-observer.md
- **選定理由**: パフォーマンス分析・メトリクス測定の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

1000チャンクの処理時間・メモリ使用量を測定し、パフォーマンス基準を満たすことを確認する。

#### 背景

機能テストが成功したので、非機能要件（パフォーマンス）を検証する。

#### 責務（単一責務）

パフォーマンステストのみを担当する。

#### 実行手順

```bash
# パフォーマンステスト実行
pnpm --filter @repo/shared test:run performance

# メモリプロファイリング（必要に応じて）
node --inspect packages/shared/src/services/embedding/__tests__/performance.test.ts
```

#### 品質ゲートチェックリスト

**パフォーマンス基準**

- [ ] 1000チャンクの処理時間 ≤ 5分
- [ ] メモリ使用量 ≤ 500MB
- [ ] バッチ処理のスループット ≥ 100チャンク/分

#### 完了条件

- [ ] パフォーマンステストが成功している
- [ ] 処理時間が基準を満たしている
- [ ] メモリ使用量が基準を満たしている

#### 依存関係

- **前提**: T-06-1（自動テスト実行）
- **後続**: T-07-1（最終レビューゲート）

---

## Phase 7: 最終レビューゲート

### T-07-1: 包括的品質レビュー

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:code-review-complete --phase=final --severity=MAJOR
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 実装完了後の全体品質検証が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/arch-police.md, .claude/agents/code-quality.md, .claude/agents/sec-auditor.md, .claude/agents/logic-dev.md
- **選定理由**: 多角的レビューで見落としを防ぐ
- **参照**: `.claude/agents/agent_list.md`

#### 目的

実装完了後、ドキュメント更新前に全体的な品質・整合性を検証する。

#### 背景

Phase 6の自動検証だけでは検出できない設計判断やベストプラクティス違反を確認する。

#### 責務（単一責務）

最終品質レビューのみを担当する。

#### レビュー観点

**アーキテクチャレビュー（arch-police）**

- [ ] レイヤー分離が適切である
- [ ] SOLID原則が守られている

**コード品質レビュー（code-quality）**

- [ ] Clean Code原則に準拠している
- [ ] 重複が排除されている

**セキュリティ監査（sec-auditor）**

- [ ] APIキーの安全な管理
- [ ] プライバシー保護（データローカル保持）

**ビジネスロジックレビュー（logic-dev）**

- [ ] 要件を満たしている
- [ ] エラーハンドリングが適切である

#### レビュー結果判定

- **PASS**: 全レビュー観点で問題なし → Phase 8へ進行
- **MINOR**: 軽微な指摘あり → 指摘対応後Phase 8へ進行
- **MAJOR**: 重大な問題あり → 影響範囲に応じて戻り先を決定
- **CRITICAL**: 致命的な問題あり → Phase 0へ戻りユーザーと要件を再確認

#### 戻り先決定基準

| 問題の種類       | 戻り先                      |
| ---------------- | --------------------------- |
| 要件の問題       | Phase 0（要件定義）         |
| 設計の問題       | Phase 1（設計）             |
| テスト設計の問題 | Phase 3（テスト作成）       |
| 実装の問題       | Phase 4（実装）             |
| コード品質の問題 | Phase 5（リファクタリング） |

#### 成果物

| 成果物             | パス                                                              | 内容                   |
| ------------------ | ----------------------------------------------------------------- | ---------------------- |
| 最終レビュー報告書 | `docs/30-workflows/embedding-generation-pipeline/review-final.md` | レビュー結果・指摘事項 |

#### 完了条件

- [ ] 全レビュー観点が確認されている
- [ ] レビュー結果がPASSまたはMINORである
- [ ] MINOR指摘がある場合、対応方針が明確である

#### 依存関係

- **前提**: T-06-2（パフォーマンステスト）
- **後続**: T-08-1（手動テスト）またはPhase 0-5への戻り

---

## Phase 8: 手動テスト検証

### T-08-1: 機能テスト

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
# 手動テストケース作成は、e2e-tester.mdエージェントを直接使用
# コマンドリストに該当するコマンドが存在しないため、エージェントベースで実施
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 手動テストケース生成は専用コマンドがないため、エージェントを直接使用

#### 使用エージェント

- **エージェント**: .claude/agents/e2e-tester.md
- **選定理由**: E2Eシナリオ・手動テスト計画の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

自動テストでは検証できない実際のドキュメントでの動作を手動で確認する。

#### 背景

自動テストはロジックの正しさを検証するが、実際のユースケースでの動作確認が必要。

#### 責務（単一責務）

機能テストの実施のみを担当する。パフォーマンステストは含まない。

#### 手動テストケース

| No  | カテゴリ              | テスト項目                  | 前提条件                 | 操作手順                            | 期待結果                             | 実行結果 | 備考 |
| --- | --------------------- | --------------------------- | ------------------------ | ----------------------------------- | ------------------------------------ | -------- | ---- |
| 1   | チャンキング          | Markdownドキュメント分割    | サンプルMDファイル準備   | 1. セマンティックチャンキング実行   | 段落単位でチャンク分割される         |          |      |
| 2   | チャンキング          | コードファイル分割          | サンプルTSファイル準備   | 1. 階層チャンキング実行             | 関数・クラス単位でチャンク分割される |          |      |
| 3   | 埋め込み生成          | OpenAI埋め込み生成          | APIキー設定済み          | 1. テキストチャンクを埋め込み変換   | ベクトルが正常に生成される           |          |      |
| 4   | 埋め込み生成          | Qwen3埋め込み生成           | Qwen3 APIキー設定済み    | 1. テキストチャンクを埋め込み変換   | 4096次元ベクトルが生成される         |          |      |
| 5   | バッチ処理            | 100チャンクバッチ処理       | 100チャンク準備          | 1. バッチ埋め込み生成実行           | 全チャンクが処理される               |          |      |
| 6   | レート制限            | レート制限時のリトライ      | レート制限発生環境       | 1. 大量リクエスト送信               | リトライ後に成功する                 |          |      |
| 7   | Contextual Embeddings | コンテキスト付与            | ドキュメント準備         | 1. Contextual Embeddings実行        | チャンクにコンテキストが付与される   |          |      |
| 8   | パイプライン          | 変換→チャンク→埋め込み→保存 | 変換済みドキュメント準備 | 1. パイプライン実行 2. DB確認       | 全フローが成功し、DBに保存される     |          |      |
| 9   | エラーハンドリング    | API失敗時の処理             | API障害シミュレーション  | 1. API失敗を発生させる              | 適切なエラーメッセージが表示される   |          |      |
| 10  | 差分更新              | 変更ファイルのみ再処理      | 既存インデックスあり     | 1. ファイル変更 2. パイプライン実行 | 変更ファイルのみ再処理される         |          |      |

#### 成果物

| 成果物         | パス                                                                     | 内容               |
| -------------- | ------------------------------------------------------------------------ | ------------------ |
| 手動テスト結果 | `docs/30-workflows/embedding-generation-pipeline/test-manual-results.md` | 手動テスト実行結果 |

#### 完了条件

- [ ] すべての手動テストケースが実行済み
- [ ] すべてのテストケースがPASS（または既知の問題として記録）
- [ ] 発見された不具合が修正済みまたは未完了タスクとして記録済み

#### 依存関係

- **前提**: T-07-1（最終レビュー）
- **後続**: T-08-2（パフォーマンステスト）

---

### T-08-2: パフォーマンステスト

#### 目的

大容量ドキュメント（100KB+）での処理時間・メモリ使用量を実測する。

#### 責務（単一責務）

パフォーマンステストの実施のみを担当する。

#### 手動テストケース

| No  | カテゴリ       | テスト項目             | 前提条件              | 操作手順                                | 期待結果                     | 実行結果 | 備考 |
| --- | -------------- | ---------------------- | --------------------- | --------------------------------------- | ---------------------------- | -------- | ---- |
| 1   | 処理時間       | 1000チャンク処理時間   | 1000チャンク準備      | 1. パイプライン実行 2. 処理時間計測     | 5分以内に完了                |          |      |
| 2   | メモリ使用量   | 大容量ドキュメント処理 | 100KBドキュメント準備 | 1. パイプライン実行 2. メモリ使用量計測 | 500MB以下                    |          |      |
| 3   | バッチ処理効率 | バッチサイズ最適化     | 各種バッチサイズ設定  | 1. バッチサイズ変更 2. スループット計測 | 100チャンク/分以上           |          |      |
| 4   | 並列処理       | 並列バッチ処理         | 並列度設定            | 1. 並列度変更 2. 処理時間計測           | 並列度に応じて処理時間が短縮 |          |      |

#### 完了条件

- [ ] すべてのパフォーマンステストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] パフォーマンス問題が修正済みまたは記録済み

#### 依存関係

- **前提**: T-08-1（機能テスト）
- **後続**: T-09-1（ドキュメント更新）

---

## Phase 9: ドキュメント更新・未完了タスク記録

### T-09-1: システムドキュメント更新

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:update-all-docs
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: docs/00-requirements/配下のドキュメント一括更新が必要なため

#### 使用エージェント

- **エージェント**: .claude/agents/api-doc-writer.md
- **選定理由**: システムドキュメント更新の専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

タスク完了後、実装した内容をシステム要件ドキュメントに反映する。

#### 背景

埋め込み生成パイプラインが実装されたので、関連ドキュメントを更新する。

#### 責務（単一責務）

ドキュメント更新のみを担当する。未完了タスク記録は含まない。

#### 更新対象ドキュメント

| ドキュメント         | パス                                          | 更新内容                                    |
| -------------------- | --------------------------------------------- | ------------------------------------------- |
| アーキテクチャ       | `docs/00-requirements/05-architecture.md`     | 埋め込みパイプライン層の追加                |
| 技術スタック         | `docs/00-requirements/03-technology-stack.md` | 埋め込みプロバイダー（OpenAI, Qwen3）の追加 |
| APIデザイン          | `docs/00-requirements/08-api-design.md`       | 埋め込みAPI統合の追加                       |
| コアインターフェース | `docs/00-requirements/06-core-interfaces.md`  | EmbeddingProviderインターフェースの追加     |

#### 更新原則

- 概要のみ記載（詳細な実装説明は不要）
- システム構築に必要十分な情報のみ追記
- 既存ドキュメントの構造・フォーマットを維持
- Single Source of Truth原則を遵守（重複記載禁止）

#### 完了条件

- [ ] 全対象ドキュメントが更新されている
- [ ] 更新内容が正確である
- [ ] フォーマットが統一されている

#### 依存関係

- **前提**: T-08-2（パフォーマンステスト）
- **後続**: T-09-2（未完了タスク記録）

---

### T-09-2: 未完了タスク記録

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
# 未完了タスク記録は、product-manager.mdエージェントを直接使用
# コマンドリストに該当するコマンドが存在しないため、エージェントベースで実施
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: 未完了タスク記録は専用コマンドがないため、エージェントを直接使用

#### 使用エージェント

- **エージェント**: .claude/agents/product-manager.md
- **選定理由**: タスク分解・優先度付けの専門家
- **参照**: `.claude/agents/agent_list.md`

#### 目的

レビューで発見された未対応の課題や、スコープ外だが将来対応が必要なタスクを、誰でも実行可能な粒度でドキュメント化する。

#### 背景

Phase 7レビューやPhase 8手動テストで発見されたが、今回スコープ外の改善点を記録する。

#### 責務（単一責務）

未完了タスクの記録のみを担当する。

#### 記録対象（例）

- Voyage AI埋め込みプロバイダー追加
- BGE-M3セルフホスト対応
- EmbeddingGemmaオンデバイス対応
- Late Chunking完全実装
- 埋め込みキャッシュ機能
- モデル変更時の再埋め込み自動化

#### 出力先

`docs/30-workflows/unassigned-task/`配下

#### ファイル命名規則

- 要件系: `requirements-embedding-cache.md`
- 改善系: `task-embedding-late-chunking.md`

#### 完了条件

- [ ] 未完了タスクが全て記録されている
- [ ] 各タスクが100人中100人が同じ理解で実行できる粒度である
- [ ] 優先度が明確である

#### 依存関係

- **前提**: T-09-1（ドキュメント更新）
- **後続**: T-10-1（PR作成）

---

## Phase 10: PR作成・CI確認・マージ準備

### T-10-1: 差分確認・コミット作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:commit
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: Conventional Commits形式でのコミット作成が必要なため

#### 目的

Git差分を確認し、適切なコミットメッセージでコミットを作成する。

#### 背景

実装・テスト・ドキュメント更新が完了したので、変更をコミットする。

#### 責務（単一責務）

コミット作成のみを担当する。PR作成は含まない。

#### 実行手順

```bash
# 差分確認
git status
git diff

# コミット作成（スラッシュコマンドが自動生成）
```

#### 完了条件

- [ ] コミットが作成されている
- [ ] コミットメッセージがConventional Commits形式である
- [ ] 変更内容が適切に説明されている

#### 依存関係

- **前提**: T-09-2（未完了タスク記録）
- **後続**: T-10-2（PR作成）

---

### T-10-2: PR作成

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行してください

```
/ai:create-pr
```

- **参照**: `.claude/commands/ai/command_list.md`
- **選定理由**: GitHub PR作成の自動化が必要なため

#### 目的

ブランチをプッシュし、GitHub PRを作成する。

#### 背景

コミットが作成されたので、PRを作成してCI/CDを実行する。

#### 責務（単一責務）

PR作成のみを担当する。CI確認は含まない。

#### 実行手順

```bash
# ブランチプッシュ（スラッシュコマンドが自動実行）
# PR作成（スラッシュコマンドが自動実行）
```

#### 完了条件

- [ ] ブランチがプッシュされている
- [ ] PRが作成されている
- [ ] PR本文が適切に記述されている

#### 依存関係

- **前提**: T-10-1（コミット作成）
- **後続**: T-10-3（PR補足コメント追加）

---

### T-10-3: PR補足コメント追加

#### 目的

PRに技術的詳細・レビュー観点・テスト方法を補足コメントとして追加する。

#### 背景

レビュアーがPRを理解しやすくするため。

#### 責務（単一責務）

PR補足コメント追加のみを担当する。

#### 実行手順

```bash
# PR番号取得
PR_NUMBER=$(gh pr view --json number -q .number)

# 補足コメント投稿（スラッシュコマンドが自動実行）
```

#### 完了条件

- [ ] PR補足コメントが投稿されている
- [ ] 実装の詳細が記載されている
- [ ] レビュー時の注意点が記載されている
- [ ] テスト方法が記載されている

#### 依存関係

- **前提**: T-10-2（PR作成）
- **後続**: T-10-4（CI/CD完了確認）

---

### T-10-4: CI/CD完了確認

#### 目的

CIステータスを確認し、全チェックがpassすることを確認する。

#### 背景

CI/CD完了を待ってから、ユーザーにマージ可能を通知する。

#### 責務（単一責務）

CI/CD完了確認のみを担当する。

#### 実行手順

```bash
# CIステータス確認（待機ループ）
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

# CI結果の最終確認
gh pr checks ${PR_NUMBER}
```

#### 完了条件

- [ ] 全CIチェックがpassしている
- [ ] CI失敗がない

#### 依存関係

- **前提**: T-10-3（PR補足コメント追加）
- **後続**: T-10-5（ユーザーへマージ可能通知）

---

### T-10-5: ユーザーへマージ可能通知

#### 目的

AIがユーザーに対して、PR作成完了・CI成功・マージ準備完了を報告する。

#### 背景

ユーザーがGitHub UIでPRをマージできる状態になったことを通知する。

#### 責務（単一責務）

ユーザーへの通知のみを担当する。

#### 通知内容

1. **PR作成完了の通知**
   - PR URL
   - PR番号

2. **CI/CD完了の報告**
   - 全チェック pass ✅

3. **マージ手順の案内**
   - GitHub Web UIでPRを開く
   - CI結果を最終確認
   - 「Squash and merge」をクリック
   - 「Delete branch」にチェック

4. **マージ後の同期手順（オプション）**
   ```bash
   cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
   git checkout main
   git pull origin main
   git worktree remove .worktrees/<worktree-name>
   git fetch --prune
   ```

#### 完了条件

- [ ] ユーザーにマージ可能が通知されている
- [ ] PR URLが提供されている
- [ ] マージ手順が説明されている

#### 依存関係

- **前提**: T-10-4（CI/CD完了確認）
- **後続**: なし（タスク完了）

---

## 完了条件チェックリスト

### 機能要件

- [ ] セマンティックチャンキングが動作する
- [ ] 階層チャンキングが動作する
- [ ] 固定サイズチャンキングが動作する
- [ ] 文単位チャンキングが動作する
- [ ] OpenAI埋め込みが生成できる
- [ ] Qwen3埋め込みが生成できる
- [ ] バッチ処理が動作する（レート制限対応）
- [ ] Contextual Embeddingsが動作する
- [ ] 埋め込みがDBに保存される
- [ ] 差分更新が動作する（変更ファイルのみ再処理）

### 品質要件

- [ ] 全ユニットテストが成功
- [ ] 全統合テストが成功
- [ ] コードカバレッジ80%以上
- [ ] ESLintエラー0件
- [ ] TypeScript型エラー0件
- [ ] 1000チャンク処理時間 ≤ 5分
- [ ] メモリ使用量 ≤ 500MB
- [ ] 全手動テストがPASS
- [ ] 最終レビューがPASSまたはMINOR
- [ ] CI/CD全チェックがpass

### ドキュメント要件

- [ ] docs/00-requirements/配下のドキュメントが更新されている
- [ ] 未完了タスクが記録されている
- [ ] PR本文が適切に記述されている
- [ ] JSDocコメントが記述されている

---

## 検証方法

### 自動テスト検証

```bash
# ユニットテスト実行
pnpm --filter @repo/shared test:run

# カバレッジ確認
pnpm --filter @repo/shared test:coverage

# Lint実行
pnpm lint

# 型チェック
pnpm typecheck
```

### 手動テスト検証

上記Phase 8の手動テストケースを実行する。

---

## リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                             |
| ---------------------------------- | ------ | -------- | -------------------------------- |
| APIレート制限                      | 高     | 高       | 指数バックオフ、バッチサイズ調整 |
| 埋め込みモデル変更時の再処理コスト | 中     | 中       | 再埋め込みキュー、バージョン管理 |
| 大容量ドキュメントのメモリ不足     | 中     | 中       | ストリーミング処理、チャンク分割 |
| 埋め込みAPIコスト増大              | 中     | 中       | キャッシュ、差分更新             |
| オンデバイスモデルのパフォーマンス | 中     | 中       | フォールバックをクラウドAPIに    |
| Contextual Embeddings生成コスト    | 低     | 中       | Claudeプロンプトキャッシング活用 |

---

## 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md` - システム全体設計
- `docs/00-requirements/05-architecture.md` - アーキテクチャ
- `docs/00-requirements/03-technology-stack.md` - 技術スタック

### 関連タスク

- CONV-02: ファイル変換エンジン（完了）
- CONV-03: JSONスキーマ定義（完了）
- CONV-04: データベーススキーマ（完了）
- CONV-07: ハイブリッド検索エンジン（後続タスク）
- TASK-RAG-CORE-001: RAGコア機能統合（後続タスク）

### 参考資料

- [Anthropic Contextual Retrieval](https://www.anthropic.com/news/contextual-retrieval) - 67%の検索失敗率削減
- [Late Chunking: Contextual Chunk Embeddings](https://arxiv.org/abs/2409.04701) - Jina AI
- [MMTEB: Massive Multilingual Text Embedding Benchmark](https://arxiv.org/abs/2502.13595)
- [Best Chunking Strategies for RAG 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025)
- [NVIDIA Chunking Benchmark](https://developer.nvidia.com/blog/finding-the-best-chunking-strategy-for-accurate-ai-responses/)
- [Voyage AI voyage-3-large](https://blog.voyageai.com/2025/01/07/voyage-3-large/)
- [Qwen3-Embedding](https://ollama.com/library/qwen3-embedding) - MTEB多言語リーダーボード1位
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

---

## 備考

### 技術的補足

#### 推奨埋め込みモデル（2025年12月時点）

| 基準           | Qwen3-Embedding-8B   | Voyage 3-large  | OpenAI 3-large  | BGE-M3               | EmbeddingGemma     |
| -------------- | -------------------- | --------------- | --------------- | -------------------- | ------------------ |
| **精度**       | **最高（MTEB 1位）** | 最高            | 高              | 高                   | 中                 |
| **次元数**     | 4096                 | 1024            | 3072            | 1024                 | 768                |
| **速度**       | 中                   | 中              | 中              | 中                   | 高（オンデバイス） |
| **コスト**     | 無料（セルフホスト） | $0.06/1M tokens | $0.13/1M tokens | 無料（セルフホスト） | 無料（ローカル）   |
| **多言語**     | **最良（100+言語）** | 最良            | 良              | 良                   | 良                 |
| **オフライン** | 可能                 | 不可            | 不可            | 可能                 | 可能               |

#### チャンキング設定ガイドライン

| ドキュメントタイプ   | 推奨戦略     | トークン数    | オーバーラップ |
| -------------------- | ------------ | ------------- | -------------- |
| 技術文書・マニュアル | hierarchical | 親1024, 子256 | 親子連携       |
| 一般記事・ブログ     | semantic     | 256-512       | 10-20%         |
| FAQ・Q&A             | sentence     | 文単位        | 1-2文          |
| コード・設定ファイル | fixed        | 512           | 50トークン     |

#### Contextual Retrieval効果

| 手法                         | 失敗率削減 | 失敗率      |
| ---------------------------- | ---------- | ----------- |
| Contextual Embeddings のみ   | 35%        | 5.7% → 3.7% |
| Contextual Embeddings + BM25 | 49%        | 5.7% → 2.9% |
| **+ Reranking（推奨）**      | **67%**    | 5.7% → 1.9% |

### 実装優先順位

**Phase 4実装の優先順位:**

1. ✅ T-04-1: チャンキングサービス（最優先）
2. ✅ T-04-2: OpenAIプロバイダー（安定性重視）
3. ✅ T-04-3: Qwen3プロバイダー（精度重視）
4. ✅ T-04-4: バッチ処理・レート制限（必須）
5. ✅ T-04-5: パイプライン統合（必須）
6. ⚠️ T-04-6: Contextual Embeddings（精度向上、高優先度だがオプション）

**将来拡張（スコープ外）:**

- Voyage AIプロバイダー（コスト重視の場合）
- BGE-M3プロバイダー（セルフホスト）
- EmbeddingGemmaプロバイダー（オンデバイス）
- Late Chunking完全実装（Jina AI方式）

---

**タスク作成日**: 2025-12-26
**作成者**: Claude Code
**最終更新**: 2025-12-26
