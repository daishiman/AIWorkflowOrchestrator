# トピックマップ

> 自動生成: 2026-01-31
> 生成コマンド: node scripts/generate-index.js

このファイルはreferences/配下の仕様をトピック別に整理したインデックスです。
**新規ファイルはprefixに基づいて自動分類されます。**

---

## 検索方法

### コマンド検索
```bash
node scripts/search-spec.js "<キーワード>"
node scripts/search-spec.js "認証" -C 5
```

### トピック一覧
```bash
node scripts/list-specs.js --topics
```

---

## 概要・品質

**関連キーワード**: 目的, スコープ, 設計原則, 品質, TDD, 用語

### references/glossary.md

| セクション | 行 |
|------------|----|\n| システム用語 | L8 |
| アーキテクチャ用語 | L18 |
| パッケージ/ディレクトリ | L29 |
| インターフェース用語 | L39 |
| UI/デザイン用語 | L50 |
| テスト用語 | L65 |
| Electron 用語 | L76 |
| データベース用語 | L90 |
| 認証・認可用語 | L109 |
| エラーハンドリング用語 | L120 |
| インフラ用語 | L132 |
| AI 用語 | L148 |
| RAG 用語 | L158 |
| 参考資料 (References) | L250 |
| 関連ドキュメント | L303 |

### references/master-design.md

| セクション | 行 |
|------------|----|\n| 目次 | L8 |
| クイックリファレンス | L81 |
| ドキュメント管理 | L175 |
| 関連リソース | L189 |

### references/overview.md

| セクション | 行 |
|------------|----|\n| システムの目的 | L8 |
| 設計の核心概念 | L36 |
| 対象ユーザー | L69 |
| スコープ定義 | L80 |
| アーキテクチャ原則 | L120 |
| 成功基準 | L152 |
| 関連ドキュメント | L173 |

### references/quality-requirements.md

| セクション | 行 |
|------------|----|\n| パフォーマンス要件 | L6 |
| テスト戦略（TDD実践ガイド） | L94 |
| セキュリティ | L328 |
| 可用性 | L356 |
| 保守性 | L374 |
| アクセシビリティ | L474 |
| テストカバレッジ目標 | L493 |
| 関連ドキュメント | L570 |
| 完了タスク | L578 |
| 変更履歴 | L638 |

---

## アーキテクチャ

**関連キーワード**: モノレポ, レイヤー, Clean Architecture, RAG, Knowledge Graph

### references/architecture-auth-security.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L6 |
| 認証アーキテクチャ（Supabase + Electron） | L15 |
| セキュリティアーキテクチャ | L133 |
| RAGパイプラインアーキテクチャ | L172 |
| 関連ドキュメント | L287 |

### references/architecture-chat-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| レイヤー構成 | L17 |
| 依存関係ルール | L32 |
| ディレクトリ構成 | L45 |
| UI Layer | L100 |
| Domain Layer | L160 |
| Application Layer | L245 |
| Infrastructure Layer | L265 |
| エラーハンドリング | L318 |
| ビジネスルール | L339 |
| 品質指標 | L350 |
| 設計原則 | L364 |
| 関連ドキュメント | L385 |
| 完了タスク | L395 |
| 変更履歴 | L427 |

### references/architecture-database.md

| セクション | 行 |
|------------|----|\n| データベース設計原則 | L8 |
| workflowsテーブル設計 | L49 |
| ベクトル検索設計（将来拡張） | L99 |

### references/architecture-embedding-pipeline.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 主要コンポーネント | L25 |
| チャンキング戦略 | L37 |
| 埋め込みプロバイダー | L56 |
| 信頼性機能 | L70 |
| パフォーマンス最適化 | L98 |
| 品質メトリクス | L125 |
| 関連ドキュメント | L153 |
| 変更履歴 | L161 |

### references/architecture-file-conversion.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L17 |
| 主要コンポーネント | L24 |
| ログ記録サービス（ConversionLogger） | L36 |
| 履歴管理サービス（HistoryService） | L86 |
| Electron統合（history-service-db-integration） | L137 |
| アーキテクチャパターン | L229 |
| 実装済みコンバーター | L239 |
| 品質指標 | L277 |
| 新規コンバーター追加手順 | L286 |
| コンバーター優先度ガイドライン | L296 |
| パフォーマンス要件 | L305 |
| 既知の制限事項 | L315 |
| 技術的負債 | L324 |
| 将来の拡張ポイント | L333 |
| 関連ドキュメント | L354 |

### references/architecture-implementation-patterns.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| フロントエンド実装パターン | L16 |
| バックエンド実装パターン | L118 |
| デスクトップ（Electron）実装パターン | L184 |
| パフォーマンス最適化パターン | L239 |
| セキュリティ実装パターン | L277 |
| テスト実装パターン | L309 |
| アクセシビリティ実装パターン | L373 |
| 関連ドキュメント | L398 |
| 変更履歴 | L410 |

### references/architecture-monorepo.md

| セクション | 行 |
|------------|----|\n| モノレポアーキテクチャ | L8 |
| 型エクスポートパターン | L116 |
| 変更履歴 | L186 |

### references/architecture-overview.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 設計思想 | L14 |
| レイヤー構成 | L41 |
| デザインパターン | L71 |
| UI/UXアーキテクチャ | L101 |
| セキュリティアーキテクチャ | L124 |
| 状態管理アーキテクチャ | L158 |
| データフローアーキテクチャ | L183 |
| ディレクトリ構造 | L204 |
| データ構造（型システム） | L260 |
| 機能追加パターン | L294 |
| 技術スタック | L329 |
| テンプレート | L341 |
| 関連ドキュメント | L361 |
| 変更履歴 | L402 |

### references/architecture-patterns.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| パターン概要 | L28 |
| アーキテクチャ層の関係 | L100 |
| 変更履歴 | L135 |
| 関連ドキュメント | L145 |

### references/architecture-rag.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| アーキテクチャ概要図 | L27 |
| 主要コンポーネント | L65 |
| テスト品質サマリー | L95 |
| 変更履歴 | L109 |
| 関連ドキュメント | L119 |

---

## インターフェース

**関連キーワード**: インターフェース, 型定義, IConverter, Repository, Logger

### references/interfaces-agent-sdk-executor.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| SkillExecutor 型定義（TASK-3-1-A） | L16 |
| リトライ機構（TASK-SKILL-RETRY-001） | L166 |
| PermissionResolver 型定義（TASK-3-2） | L233 |
| SkillExecutor IPC統合（TASK-3-2） | L320 |
| 完了タスク | L397 |
| 関連ドキュメント | L434 |
| 変更履歴 | L446 |

### references/interfaces-agent-sdk-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| 完了タスク | L16 |
| 残課題（未タスク） | L478 |
| 関連ドキュメント | L489 |
| 変更履歴 | L505 |

### references/interfaces-agent-sdk-integration.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| Claude Code CLI統合 | L16 |
| Session Persistence（セッション永続化） | L119 |
| Skill Import Agent System 型定義（TASK-1-1） | L219 |
| 関連ドキュメント | L367 |
| 変更履歴 | L376 |

### references/interfaces-agent-sdk-skill.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| Skill Dashboard 型定義（AGENT-002） | L16 |
| SkillImportStore（TASK-2B） | L378 |
| SkillSlice型定義（TASK-6-1） | L430 |
| ModifierSkill（スライド逆同期機能） | L522 |
| ChatPanel統合（TASK-7D） | L556 |
| 関連ドキュメント | L591 |
| 変更履歴 | L602 |

### references/interfaces-agent-sdk-ui.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| Agent Execution UI 型定義（AGENT-004） | L16 |
| AgentSDKPage（ポストリリーステスト検証UI） | L302 |
| 関連ドキュメント | L365 |
| 完了タスク | L376 |
| 変更履歴 | L408 |

### references/interfaces-agent-sdk.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 仕様書インデックス | L25 |
| アーキテクチャ | L39 |
| 依存関係解決 | L63 |
| Preload API（window.agentAPI） | L88 |
| 型定義 | L159 |
| エラー型 | L205 |
| IPC チャンネル | L235 |
| 設定定数 | L249 |
| React Hook（useAgent） | L261 |
| セッション管理 | L286 |
| 関連ドキュメント | L313 |
| 変更履歴 | L327 |

### references/interfaces-auth.md

| セクション | 行 |
|------------|----|\n| 認証・プロフィール型定義 | L8 |
| ワークスペース型定義 | L124 |

### references/interfaces-chat-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| データベーススキーマ | L21 |
| ドメインエンティティ型定義 | L68 |
| Repositoryインターフェース | L115 |
| サービスインターフェース | L148 |
| 認可（Authorization） | L175 |
| ビジネスルール | L224 |
| エクスポート形式 | L246 |
| 品質メトリクス | L293 |
| Renderer Process型定義（UI側） | L303 |
| Preload API（conversationAPI） | L357 |
| React Hooks | L387 |
| UIコンポーネント構成（Atomic Design） | L432 |
| アクセシビリティ対応 | L463 |
| 完了タスク | L474 |
| 残課題 | L518 |
| 関連ドキュメント | L526 |
| 変更履歴 | L536 |

### references/interfaces-converter-extension.md

| セクション | 行 |
|------------|----|\n| BaseConverter 継承による実装 | L14 |
| 実装の最小構成 | L46 |
| カスタムメタデータの追加 | L89 |
| エラーハンドリングのベストプラクティス | L124 |
| テストの実装パターン | L160 |
| 関連ドキュメント | L202 |
| 変更履歴 | L210 |

### references/interfaces-converter-implementations.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| 実装クラス一覧 | L18 |
| HTMLConverter | L32 |
| CSVConverter | L77 |
| JSONConverter | L128 |
| MarkdownConverter | L173 |
| CodeConverter | L221 |
| YAMLConverter | L269 |
| PlainTextConverter（未実装） | L316 |
| 関連ドキュメント | L351 |

### references/interfaces-converter.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L17 |
| ドキュメント構成 | L24 |
| IConverter インターフェース | L33 |
| 実装クラス一覧 | L67 |
| IConversionLogger インターフェース | L83 |
| IHistoryService インターフェース | L141 |
| ConversionRepository インターフェース | L192 |
| 関連ドキュメント | L209 |

### references/interfaces-core.md

| セクション | 行 |
|------------|----|\n| IRepository インターフェース | L8 |
| Result型 | L70 |
| Logger インターフェース | L105 |
| IAIClient インターフェース | L140 |
| IFileWatcher インターフェース | L173 |
| 変更履歴 | L205 |

### references/interfaces-llm.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| アーキテクチャ概要 | L26 |
| 対応LLMプロバイダー | L58 |
| 主要IPCチャンネル | L69 |
| 品質メトリクス サマリー | L80 |
| 完了タスク | L91 |
| 変更履歴 | L124 |
| 関連ドキュメント | L136 |

### references/interfaces-rag-chunk-embedding.md

| セクション | 行 |
|------------|----|\n| 主要型 | L16 |
| ChunkEntity型 | L25 |
| EmbeddingEntity型 | L47 |
| チャンキング戦略 | L67 |
| 埋め込みプロバイダー | L83 |
| デフォルト設定 | L96 |
| ベクトル演算ユーティリティ | L121 |
| バリデーション | L143 |
| 関連ドキュメント | L151 |

### references/interfaces-rag-community-detection.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L25 |
| 設計 | L50 |
| インターフェース定義 | L99 |
| 型定義 | L130 |
| エラー型 | L179 |
| 使用例 | L191 |
| 実装ガイドライン | L256 |
| 関連ドキュメント | L279 |
| 変更履歴 | L291 |

### references/interfaces-rag-community-summarization.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L26 |
| 設計 | L51 |
| インターフェース定義 | L106 |
| 型定義 | L131 |
| エラー型 | L178 |
| 使用例 | L190 |
| 実装ガイドライン | L237 |
| 関連ドキュメント | L268 |
| 変更履歴 | L279 |

### references/interfaces-rag-entity-extraction.md

| セクション | 行 |
|------------|----|\n| 主要インターフェース | L16 |
| 実装クラス | L49 |
| 型定義（Zodスキーマ） | L100 |
| エンティティタイプ（52種類・10カテゴリ） | L154 |
| エラーハンドリング | L171 |
| パフォーマンス特性 | L201 |
| テスト用ユーティリティ | L230 |
| テスト品質 | L257 |
| 変更履歴 | L267 |
| 関連ドキュメント | L276 |

### references/interfaces-rag-file-selection.md

| セクション | 行 |
|------------|----|\n| IPCチャンネル | L14 |
| リクエスト/レスポンス型 | L25 |
| セキュリティ機能 | L54 |
| UIコンポーネント | L65 |
| 実装場所 | L84 |
| 関連ドキュメント | L93 |

### references/interfaces-rag-graphrag-query.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L26 |
| 設計 | L51 |
| インターフェース定義 | L106 |
| 型定義 | L129 |
| エラー型 | L172 |
| 使用例 | L185 |
| 実装ガイドライン | L228 |
| 関連ドキュメント | L261 |
| 変更履歴 | L272 |

### references/interfaces-rag-knowledge-graph-store.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L25 |
| 設計 | L49 |
| インターフェース定義 | L139 |
| エラー型 | L181 |
| 実装ガイドライン | L192 |
| 実装ステータス | L214 |
| 関連ドキュメント | L293 |
| 変更履歴 | L303 |

### references/interfaces-rag-search.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L19 |
| 検索戦略一覧 | L32 |
| HybridRAGパイプライン | L43 |
| 品質メトリクス サマリー | L71 |
| 変更履歴 | L84 |
| 関連ドキュメント | L100 |

### references/interfaces-rag.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L17 |
| ドキュメント構成 | L21 |
| Branded Types | L34 |
| RAGエラー型 | L57 |
| 共通インターフェース | L78 |
| ファイル・変換ドメイン型 | L146 |
| Knowledge Graph型 | L172 |
| 設計原則 | L188 |
| 関連ドキュメント | L411 |

### references/interfaces-system-prompt.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Repository インターフェース | L17 |
| エンティティ型定義 | L98 |
| IPC チャネル仕様 | L134 |
| エラーコード体系 | L169 |
| バリデーションルール | L186 |
| セキュリティ仕様 | L208 |
| データ永続化 | L227 |
| マイグレーション仕様 | L244 |
| 完了タスク | L266 |
| 関連ドキュメント | L278 |
| 変更履歴 | L288 |

### references/interfaces-workflow.md

| セクション | 行 |
|------------|----|\n| IWorkflowExecutor インターフェース | L8 |

---

## API設計

**関連キーワード**: REST, エンドポイント, 認証, レート制限, IPC

### references/api-chat-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| Use Cases | L17 |
| DTOs | L254 |
| リポジトリインターフェース | L297 |
| エラーハンドリングパターン | L326 |
| 将来の拡張 | L365 |
| 変更履歴 | L379 |
| 関連ドキュメント | L388 |

### references/api-core.md

| セクション | 行 |
|------------|----|\n| API 設計方針 | L8 |
| APIバージョニング | L30 |
| HTTPステータスコード | L40 |
| リクエスト/レスポンス形式 | L73 |
| ページネーション | L99 |
| フィルタリング・ソート | L121 |
| 認証・認可 | L152 |
| レート制限 | L179 |
| CORS設定 | L201 |

### references/api-endpoints.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| REST API エンドポイント一覧 | L25 |
| エンドポイント命名規則 | L81 |
| Desktop IPC API サマリー | L102 |
| 変更履歴 | L127 |
| 関連ドキュメント | L136 |

### references/api-internal-chunk-search.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 検索エンドポイント（将来実装） | L14 |
| 性能目標 | L69 |
| 使用例（データベース層） | L78 |
| 実装ステータス | L104 |
| 変更履歴 | L119 |

### references/api-internal-conversion.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| ConversionService API | L16 |
| HistoryService API | L170 |
| Electron HistoryService API | L340 |

### references/api-internal-embedding.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 主要インターフェース | L19 |
| エラーコード | L165 |
| 性能指標 | L176 |

### references/api-internal-search.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| 主要クラス | L14 |
| SearchService メソッド | L24 |
| エラーコード | L188 |
| 使用パターン | L198 |
| 性能特性 | L261 |
| デフォルト除外パターン | L271 |
| 関連ドキュメント | L284 |
| 変更履歴 | L293 |

### references/api-internal.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| API一覧 | L12 |
| 各APIの概要 | L21 |
| 関連ドキュメント | L49 |

### references/api-ipc-agent.md

| セクション | 行 |
|------------|----|\n| Agent Dashboard IPC チャネル | L10 |
| Workspace Chat Edit IPC チャネル | L76 |
| 完了タスク | L199 |
| 関連ドキュメント | L215 |
| 変更履歴 | L224 |

### references/api-ipc-auth.md

| セクション | 行 |
|------------|----|\n| 認証 IPC チャネル | L10 |
| プロフィール IPC チャネル | L32 |
| イベントチャネル（Main → Renderer） | L43 |
| 型定義 | L51 |
| 認証状態管理 | L108 |
| IPCセキュリティ実装 | L139 |
| 関連ドキュメント | L166 |
| 変更履歴 | L174 |

### references/api-ipc-system.md

| セクション | 行 |
|------------|----|\n| AI/チャット IPC チャネル | L10 |
| Slide IPC API（スライド同期） | L46 |
| Electron IPC API設計 | L100 |
| AIプロバイダーAPI連携 | L137 |
| エンティティ抽出サービス (NER) | L170 |
| 関連ドキュメント | L207 |
| 変更履歴 | L216 |

---

## データベース

**関連キーワード**: Turso, SQLite, スキーマ, FTS5, Embedded Replicas

### references/database-architecture.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 採用技術と選定理由 | L17 |
| アーキテクチャ概要 | L26 |
| 設計原則 | L45 |
| 環境別接続設定 | L52 |
| ディレクトリ構成 | L78 |
| 基盤モジュール | L108 |
| 使用例 | L153 |
| 関連ドキュメント | L168 |

### references/database-implementation.md

| セクション | 行 |
|------------|----|\n| 型安全なクエリ実装 | L8 |
| Embedded Replicas とオフライン対応 | L58 |
| マイグレーション管理 | L104 |
| テスト戦略 | L144 |
| エラーハンドリング | L174 |
| ベクトル検索実装（DiskANN） | L205 |
| Knowledge Graphテーブル群（GraphRAG基盤） | L263 |
| パフォーマンス最適化 | L467 |
| 変更履歴 | L500 |

### references/database-operations.md

| セクション | 行 |
|------------|----|\n| Turso 無料枠の活用 | L8 |
| セキュリティベストプラクティス | L41 |
| 運用・メンテナンス | L76 |
| Electron ローカルストレージ | L103 |
| 関連ドキュメント | L166 |

### references/database-schema.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| テーブル一覧 | L13 |
| ワークフロー関連テーブル | L39 |
| ユーザー関連テーブル | L78 |
| システムプロンプト関連テーブル | L112 |
| チャット関連テーブル | L149 |
| RAG関連テーブル | L185 |
| Knowledge Graph関連テーブル | L227 |
| 変換処理関連テーブル | L361 |
| インデックス設計 | L420 |
| 関連ドキュメント | L479 |
| 変更履歴 | L489 |

---

## UI/UX

**関連キーワード**: Design Tokens, コンポーネント, Tailwind, レスポンシブ, Apple HIG

### references/ui-ux-advanced.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント一覧 | L13 |
| トピック別参照 | L22 |
| 関連ドキュメント | L41 |

### references/ui-ux-agent-execution.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L12 |
| 概要 | L26 |
| コンポーネント階層 | L32 |
| コンポーネント仕様 | L59 |
| インタラクション設計 | L278 |
| 視覚デザイン | L306 |
| アクセシビリティ（WCAG 2.1 AA） | L330 |
| 完了タスク | L342 |
| 関連ドキュメント | L378 |

### references/ui-ux-components.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| コンポーネント設計概要 | L25 |
| デザイン原則サマリー | L55 |
| コンポーネント階層図 | L77 |
| 完了タスク | L116 |
| 変更履歴 | L133 |
| 関連ドキュメント | L148 |

### references/ui-ux-design-principles.md

| セクション | 行 |
|------------|----|\n| コンポーネント設計原則 | L10 |
| Apple HIG 準拠（Electron向け） | L66 |
| インタラクション設計 | L121 |
| アクセシビリティ（WCAG 2.1 AA準拠） | L211 |
| UXデザイン法則 | L272 |
| 認知負荷の軽減 | L397 |
| 関連ドキュメント | L418 |
| 変更履歴 | L427 |

### references/ui-ux-design-system.md

| セクション | 行 |
|------------|----|\n| デザインシステム概要 | L8 |
| Spatial Design Tokens（Knowledge Studio） | L34 |
| カラーシステム | L71 |
| タイポグラフィ | L121 |
| スペーシングとレイアウト | L160 |

### references/ui-ux-feature-components.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| Community Visualization UI コンポーネント（CONV-08-05） | L36 |
| Custom Execution Environment UI コンポーネント（AGENT-006） | L143 |
| workspace-chat-edit-ui コンポーネント（Issue #468, #494） | L210 |
| SkillStreamDisplay コンポーネント（TASK-3-2） | L358 |
| i18n対応（TASK-3-2-B） | L393 |
| コピー履歴機能（TASK-3-2-D） | L442 |
| アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA） | L551 |
| 完了タスク | L562 |
| 関連ドキュメント | L576 |
| 変更履歴 | L598 |

### references/ui-ux-feature-skill-stream.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| コンポーネント階層 | L25 |
| SkillStreamDisplay コンポーネント | L38 |
| useSkillExecution Hook | L71 |
| IPC API（Preload） | L93 |
| UX改善機能（TASK-3-2-A） | L115 |
| タイムスタンプ自動更新機能（TASK-3-2-C） | L198 |
| i18n対応（TASK-3-2-B） | L332 |
| ChatPanel統合 SkillStreamingView（TASK-7D） | L380 |
| 関連ドキュメント | L441 |
| 変更履歴 | L453 |

### references/ui-ux-file-selector.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| コンポーネント構成 | L21 |
| トリガーボタン | L47 |
| モーダルダイアログ | L63 |
| ドロップゾーン | L75 |
| ファイルリスト | L86 |
| フィルター機能 | L98 |
| キーボード操作 | L110 |
| アニメーション | L121 |
| アクセシビリティ対応 | L132 |
| レスポンシブ対応 | L148 |
| WorkspaceFileSelectorモード | L157 |
| フォルダ一括選択機能 | L222 |
| 変更履歴 | L283 |
| 関連ドキュメント | L292 |

### references/ui-ux-forms.md

| セクション | 行 |
|------------|----|\n| フォーム設計 | L8 |
| 認証UI設計 | L69 |
| APIキー設定UI設計 | L287 |
| 変更履歴 | L372 |

### references/ui-ux-history-panel.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| ドキュメント構成 | L16 |
| コンポーネント一覧 | L27 |
| カスタムフック一覧 | L38 |
| IPCチャンネル | L49 |
| テスト品質サマリー | L60 |
| 統合ステータス | L74 |
| 変更履歴 | L91 |
| 関連ドキュメント | L108 |

### references/ui-ux-llm-selector.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| UI構成 | L18 |
| プロバイダーとモデル一覧 | L28 |
| 状態管理 | L43 |
| UXフロー | L57 |
| スタイルガイドライン | L77 |
| アクセシビリティ | L104 |
| エラーハンドリング | L114 |
| テストカバレッジ | L122 |
| システムプロンプト連携 | L138 |
| 関連タスクドキュメント | L152 |
| 関連ドキュメント | L164 |

### references/ui-ux-navigation.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| AppDockナビゲーション | L15 |
| ChatViewナビゲーション | L76 |
| ナビゲーションボタン仕様 | L82 |
| ボタンスタイルガイドライン（アイコンのみボタン） | L98 |
| テスト検証済み項目 | L112 |
| アクセシビリティ対応事例 | L127 |
| ナビゲーションパターンのベストプラクティス | L159 |
| 関連ドキュメント | L171 |

### references/ui-ux-panels.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L12 |
| アイコンとイラスト | L21 |
| パネル共通ガイドライン | L58 |
| 関連ドキュメント | L80 |

### references/ui-ux-portal-patterns.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Stacking Context問題の理解 | L17 |
| 基本実装パターン | L32 |
| イベントハンドリング | L65 |
| WAI-ARIA Menu Pattern実装 | L85 |
| テスト設計 | L114 |
| パフォーマンス最適化 | L129 |
| ベストプラクティス | L140 |
| 注意事項 | L151 |
| 実装チェックリスト | L167 |
| 参考実装 | L182 |
| 関連ドキュメント | L190 |

### references/ui-ux-search-panel.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| キーボードショートカット | L22 |
| タブバー設計 | L37 |
| ファイル内検索パネル（FileSearchPanel） | L62 |
| ワークスペース検索パネル（WorkspaceSearchPanel） | L100 |
| ファイル名検索パネル（FileNameSearchPanel） | L130 |
| ハイライト表示 | L151 |
| アクセシビリティ対応 | L163 |
| エラー状態 | L177 |
| パフォーマンス考慮事項 | L188 |
| 実装アーキテクチャ | L200 |
| 実装詳細（TASK-SEARCH-INTEGRATE-001） | L310 |
| 関連ドキュメント | L408 |
| 完了タスク | L417 |
| 未タスク（将来の改善候補） | L423 |
| 変更履歴 | L464 |

### references/ui-ux-settings.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 設定画面アーキテクチャ | L15 |
| スライド出力ディレクトリ設定 | L36 |
| 設定永続化 | L101 |
| IPC API仕様 | L122 |
| セキュリティ要件 | L148 |
| テスト要件 | L163 |
| ツール許可設定（Permission Settings） | L186 |
| 権限要求履歴パネル（Permission History Panel） | L251 |
| 関連ドキュメント | L311 |
| 実装ファイル | L320 |
| バージョン履歴 | L342 |

### references/ui-ux-system-prompt.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| UIコンポーネント構成 | L15 |
| パネル展開/折りたたみ仕様 | L27 |
| システムプロンプト入力エリア仕様 | L39 |
| プロンプトテンプレート管理仕様 | L56 |
| 状態管理構造（Zustand） | L91 |
| LLM連携仕様 | L113 |
| データ永続化 | L123 |
| アクセシビリティ対応 | L131 |
| パフォーマンス要件 | L157 |
| E2Eテスト実装 | L166 |
| デザイントークン | L179 |
| セキュリティ考慮事項 | L192 |
| 関連タスクドキュメント | L201 |
| 関連ドキュメント | L214 |

---

## セキュリティ

**関連キーワード**: 認証, 暗号化, CSP, バリデーション, インシデント

### references/security-api-electron.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L17 |
| セキュリティ原則 | L28 |
| テスト品質サマリー | L51 |
| 完了タスク | L65 |
| 変更履歴 | L80 |
| 関連ドキュメント | L95 |

### references/security-api.md

| セクション | 行 |
|------------|----|\n| 認証・認可フロー | L10 |
| レート制限 | L29 |
| CORS設定 | L46 |
| 依存関係セキュリティ | L55 |
| 関連ドキュメント | L80 |

### references/security-electron-ipc.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| セキュリティ設定 | L19 |
| Content Security Policy (CSP) | L33 |
| IPC通信のセキュリティ | L50 |
| 実装例: historyAPI | L76 |
| 実装例: slideSettingsAPI | L128 |
| 自動更新のセキュリティ | L177 |
| 関連ドキュメント | L188 |

### references/security-implementation.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L14 |
| セキュリティ原則 | L24 |
| 関連ドキュメント | L47 |

### references/security-input-validation.md

| セクション | 行 |
|------------|----|\n| バリデーション原則 | L10 |
| 入力タイプ別バリデーション | L22 |
| SQLインジェクション対策 | L37 |
| XSS対策 | L54 |
| Zodスキーマによるバリデーション | L70 |
| ファイル変換のセキュリティ | L84 |
| 関連ドキュメント | L132 |

### references/security-operations.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| ログ・監査 | L17 |
| ファイル選択セキュリティ | L56 |
| インシデント対応 | L123 |
| セキュリティチェックリスト | L169 |
| 関連ドキュメント | L215 |

### references/security-principles.md

| セクション | 行 |
|------------|----|\n| セキュリティ設計原則 | L8 |
| 認証・認可 | L45 |
| データ保護 | L227 |
| 変更履歴 | L350 |

### references/security-skill-execution.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| エクスポート一覧 | L20 |
| DANGEROUS_PATTERNS | L35 |
| ALLOWED_TOOLS_WHITELIST | L92 |
| API リファレンス | L116 |
| 使用例 | L193 |
| テストカバレッジ | L224 |
| Permission Store（権限永続化） | L240 |
| 関連ドキュメント | L324 |
| 変更履歴 | L334 |

### references/security-skill-ipc.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| スキル管理IPCセキュリティ | L20 |
| スキルインポートIPCチャネル（TASK-4-1） | L67 |
| Claude Code CLI連携セキュリティ | L110 |
| Skill Execution Preload API セキュリティ | L171 |
| Permission IPC Handler セキュリティ | L216 |
| SkillAPI Preload実装（TASK-5-1） | L252 |
| 完了タスク | L318 |
| 関連ドキュメント | L330 |

---

## 技術スタック

**関連キーワード**: Next.js, Electron, TypeScript, Drizzle, pnpm

### references/technology-backend.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| バックエンド・データベース | L45 |
| AI統合 | L198 |
| 開発ツール | L404 |
| 完了タスク | L445 |
| 関連ドキュメント | L477 |
| 変更履歴 | L487 |

### references/technology-core.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| コアランタイム | L54 |
| フロントエンド | L115 |
| 変更履歴 | L242 |

### references/technology-desktop.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Electron | L14 |
| ビルド・パッケージング | L44 |
| Main Process技術 | L72 |
| Renderer Process技術 | L111 |
| IPC通信 | L137 |
| macOS固有 | L158 |
| セキュリティ | L182 |
| 自動更新 | L207 |
| 開発ツール | L227 |
| ディレクトリ構造 | L247 |
| 関連ドキュメント | L266 |
| 変更履歴 | L278 |

### references/technology-devops.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| パッケージ構成詳細 | L54 |
| 依存関係管理戦略 | L176 |
| 無料枠の活用ガイド | L269 |
| CI/CDツール選定 | L301 |
| 学習リソースとコミュニティ | L375 |
| マイグレーション計画 | L402 |
| 関連ドキュメント | L423 |
| 変更履歴 | L431 |

### references/technology-frontend.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| UIフレームワーク | L14 |
| スタイリング | L50 |
| 状態管理 | L101 |
| フォーム・バリデーション | L129 |
| エディター・表示 | L159 |
| アイコン・アセット | L177 |
| アニメーション | L193 |
| テスト | L212 |
| ビルド・バンドル | L251 |
| 関連ドキュメント | L272 |
| 変更履歴 | L283 |

---

## Claude Code

**関連キーワード**: Skill, Agent, Command, Progressive Disclosure, Task

### references/claude-code-agents-spec.md

| セクション | 行 |
|------------|----|\n| ファイル配置 | L10 |
| YAML Frontmatter 必須フィールド | L19 |
| YAML Frontmatter オプションフィールド | L26 |
| 完全な YAML Frontmatter 記述形式 | L36 |
| description フィールドの詳細記述規則 | L66 |
| 依存スキルの記述規則 | L92 |
| 本文の必須セクション | L130 |
| 行数制約 | L161 |
| 命名規則 | L171 |
| ファイル参照形式 | L183 |
| 関連ドキュメント | L204 |
| 変更履歴 | L211 |

### references/claude-code-agents-workflow.md

| セクション | 行 |
|------------|----|\n| ワークフローセクションの記述形式（各Phase共通） | L10 |
| ペルソナ設計 | L47 |
| ツール権限設定 | L62 |
| エージェント間協調 | L75 |
| ハンドオフプロトコル | L86 |
| agent_list.md 仕様 | L99 |
| エラーハンドリング | L137 |
| 状態管理 | L158 |
| 品質基準 | L182 |
| 関連ドキュメント | L200 |
| 変更履歴 | L208 |

### references/claude-code-agents.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L14 |
| Agent 層の役割 | L23 |
| 責務境界 | L34 |
| 関連エージェント | L47 |
| 関連スキル | L55 |
| 関連ドキュメント | L66 |

### references/claude-code-commands.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Command（コマンド）仕様 | L31 |
| 品質基準 | L288 |
| 命名規則 | L301 |
| ファイル参照形式 | L313 |
| 参照 | L341 |
| 変更履歴 | L359 |

### references/claude-code-overview.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 3層アーキテクチャ | L34 |
| 各層の詳細仕様 | L96 |
| 共通仕様 | L135 |
| 用語定義 | L190 |
| 参照 | L205 |
| クイックリファレンス | L245 |
| 変更履歴 | L282 |
| ドキュメント構成 | L303 |

### references/claude-code-skills-agents.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L6 |
| 目的 | L17 |
| agents/ の位置づけ（誤解防止） | L24 |
| agents/*.md 標準フォーマット（必須テンプレ） | L33 |
| agents/*.md テンプレ（Markdown見出しで構造化） | L50 |
| 関連ドキュメント | L168 |

### references/claude-code-skills-overview.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| コア原則 | L43 |

### references/claude-code-skills-process.md

| セクション | 行 |
|------------|----|\n| スキル作成・更新プロセス | L10 |
| フィードバックループ | L238 |
| 品質基準 | L286 |
| 命名規則 | L319 |
| ファイル参照形式 | L340 |
| skill_list.md 仕様 | L371 |
| 参照（最小限に維持） | L403 |
| 変更履歴 | L411 |

### references/claude-code-skills-resources.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| scripts/ ディレクトリ仕様 | L17 |
| references/ ディレクトリ仕様 | L54 |
| Progressive Disclosure パターン | L84 |
| assets/ ディレクトリ仕様 | L128 |
| ワークフローパターン | L149 |
| 出力パターン | L181 |
| 関連ドキュメント | L233 |

### references/claude-code-skills-structure.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| 概要 | L19 |
| ドキュメント構成 | L25 |
| Skill構造仕様 | L34 |
| SKILL.md 仕様 | L60 |
| 関連ドキュメント | L145 |

---

## その他

**関連キーワード**: デプロイ, Railway, 環境変数, Discord, プラグイン

### references/arch-claude-cli.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| Claude Code CLI連携（Desktop Main Process） | L19 |
| Claude CLI Renderer API（Preload API） | L118 |
| 関連ドキュメント | L311 |

### references/arch-electron-services.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| Environment Backend サービス | L16 |
| スキル管理サービス | L83 |
| 関連ドキュメント | L390 |

### references/arch-feature-addition.md

| セクション | 行 |
|------------|----|\n| 新機能追加の手順 | L10 |
| 機能構成のベストプラクティス | L47 |
| この構造の利点 | L67 |
| 関連ドキュメント | L79 |

### references/arch-ipc-persistence.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| IPC Handler Registration Pattern（Desktop Main Process） | L17 |
| 会話履歴永続化パターン（Desktop Main Process） | L95 |
| 関連ドキュメント | L203 |

### references/arch-state-management.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| Zustand Sliceパターン | L21 |
| chatEditSlice（Workspace Chat Edit状態管理） | L117 |
| skillSlice（スキル実行状態管理） | L207 |
| permissionHistorySlice（権限要求履歴管理） | L333 |
| 関連ドキュメント | L436 |

### references/arch-ui-components.md

| セクション | 行 |
|------------|----|\n| Monaco Diff Editor統合パターン | L10 |
| SkillSelector コンポーネントパターン | L208 |
| ChatPanel統合パターン（TASK-7D） | L403 |
| 変更履歴 | L454 |
| 関連ドキュメント | L466 |

### references/deployment-electron.md

| セクション | 行 |
|------------|----|\n| ビルドターゲット | L10 |
| リリースフロー | L33 |
| リリースチェックリスト | L45 |
| 自動更新（electron-updater） | L58 |
| コードサイニング | L85 |
| デプロイチェックリスト | L109 |
| データベースマイグレーションのロールバック | L160 |
| 関連ドキュメント | L186 |

### references/deployment-gha.md

| セクション | 行 |
|------------|----|\n| ワークフロー構成 | L10 |
| CI ワークフロー要件（PR時） | L20 |
| キャッシュ戦略 | L54 |
| 並列実行の活用 | L76 |
| CD ワークフロー要件（mainマージ時） | L95 |
| モニタリングとアラート | L119 |
| GitHub Secrets の要件 | L166 |
| 関連ドキュメント | L184 |

### references/deployment-railway.md

| セクション | 行 |
|------------|----|\n| 無料枠の制限と最適化 | L10 |
| スリープモード対策 | L43 |
| カスタムドメイン設定 | L73 |
| 環境分離 | L90 |
| ロールバック | L115 |
| 関連ドキュメント | L140 |

### references/deployment.md

| セクション | 行 |
|------------|----|\n| デプロイメント戦略概要 | L8 |
| Railway デプロイ戦略 | L38 |
| GitHub Actions CI/CD パイプライン | L139 |
| Electron アプリのリリース | L242 |
| ロールバック戦略 | L322 |
| モニタリングとアラート | L373 |
| デプロイチェックリスト | L436 |
| GitHub Secrets の要件 | L489 |
| 関連ドキュメント | L507 |

### references/development-guidelines.md

| セクション | 行 |
|------------|----|\n| ロギング戦略 | L10 |
| キャッシング戦略 | L65 |
| データマイグレーション | L104 |
| コードレビューガイドライン | L143 |
| パフォーマンス最適化 | L192 |
| 国際化（i18n） | L231 |
| Git ワークフロー | L261 |
| 命名規則 | L297 |
| デバッグガイド | L345 |
| リリースプロセス | L382 |
| バックアップ・リカバリ | L411 |
| 環境構築ガイド | L448 |
| 関連ドキュメント | L491 |
| 変更履歴 | L503 |

### references/directory-structure.md

| セクション | 行 |
|------------|----|\n| 設計方針 | L8 |
| ルート構造 | L45 |
| packages/shared/ 詳細構造 | L96 |
| apps/web/ 詳細構造（Next.js） | L252 |
| apps/desktop/ 詳細構造（Electron） | L292 |
| local-agent/ 詳細構造 | L391 |
| .github/workflows/ 詳細構造 | L402 |
| ルートの設定ファイル群 | L412 |
| 機能追加の手順 | L431 |
| 構造の選択理由 | L463 |
| 依存関係ルール | L478 |
| pnpm-workspace 設定 | L505 |
| 関連ドキュメント | L524 |

### references/discord-bot.md

| セクション | 行 |
|------------|----|\n| 機能概要 | L8 |
| イベントハンドリング | L30 |
| スラッシュコマンド | L53 |
| メッセージ解析 | L87 |
| レート制限 | L118 |
| 通知システム | L147 |
| 認証・認可 | L180 |
| エラーハンドリング | L211 |
| 設定項目 | L233 |
| デプロイ・運用 | L264 |
| 開発ガイドライン | L292 |
| 関連ドキュメント | L323 |

### references/environment-variables.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L6 |
| 環境変数の分類 | L15 |
| セキュリティベストプラクティス | L67 |
| 環境別設定 | L139 |
| Electron アプリでの環境変数 | L191 |
| トラブルシューティング | L248 |
| チーム開発での運用 | L309 |
| 必須環境変数一覧 | L347 |
| 関連ドキュメント | L405 |

### references/error-handling.md

| セクション | 行 |
|------------|----|\n| エラー分類 | L8 |
| 認可エラー（UnauthorizedError） | L145 |
| リトライ戦略 | L210 |
| SkillExecutor リトライ戦略（TASK-SKILL-RETRY-001） | L252 |
| サーキットブレーカー（将来対応） | L289 |
| エラーレスポンス形式 | L317 |
| エラーログ出力 | L348 |
| ユーザー向けエラーメッセージ | L385 |
| エラーハンドリングの実装指針 | L408 |
| 関連ドキュメント | L438 |
| 変更履歴 | L447 |

### references/llm-embedding.md

| セクション | 行 |
|------------|----|\n| プロバイダーインターフェース | L13 |
| データ型 | L37 |
| 設定型 | L53 |
| 出力型 | L93 |
| 信頼性設定型 | L105 |
| メトリクス型 | L135 |
| エラー型 | L147 |
| 列挙型 | L178 |
| 品質メトリクス | L206 |
| 関連ドキュメント | L214 |

### references/llm-ipc-types.md

| セクション | 行 |
|------------|----|\n| LLM チャット関連型定義（Desktop IPC） | L10 |
| Multi-LLM Provider Switching 型定義 | L104 |
| バリデーション関数 | L201 |
| IPC通信 | L212 |
| LLMアダプター実装 | L223 |
| 関連ドキュメント | L261 |

### references/llm-streaming.md

| セクション | 行 |
|------------|----|\n| 概要 | L15 |
| 型定義 | L21 |
| SSEフロー | L58 |
| プロバイダー別SSE解析 | L75 |
| キャンセル機構 | L86 |
| UIコンポーネント | L109 |
| エラーハンドリング | L133 |
| テストカバレッジ | L146 |
| 型安全性の保証 | L158 |
| 関連ドキュメント | L166 |
| 変更履歴 | L174 |

### references/llm-workspace-chat-edit.md

| セクション | 行 |
|------------|----|\n| 概要 | L15 |
| FileService | L21 |
| ContextBuilder | L63 |
| ChatEditService | L103 |
| IPCチャンネル | L149 |
| セキュリティ | L160 |
| ディレクトリ構成 | L172 |
| 品質メトリクス | L198 |
| 関連ドキュメント | L209 |
| 変更履歴 | L217 |

### references/local-agent.md

| セクション | 行 |
|------------|----|\n| 機能概要 | L8 |
| 設定項目 | L41 |
| ファイル監視 | L74 |
| クラウド同期 | L116 |
| オフライン対応 | L150 |
| エラーハンドリング | L180 |
| セキュリティ | L211 |
| PM2 プロセス管理 | L242 |
| ヘルスチェック | L278 |
| 開発・デバッグ | L309 |
| 関連ドキュメント | L330 |

### references/plugin-development.md

| セクション | 行 |
|------------|----|\n| プラグインアーキテクチャ概要 | L8 |
| プラグイン追加フロー | L33 |
| IWorkflowExecutor 実装ガイド | L62 |
| スキーマ定義ガイド | L101 |
| 共通インフラストラクチャの使用 | L137 |
| エラーハンドリング | L187 |
| テスト作成ガイド | L219 |
| Registry 登録 | L259 |
| 実装チェックリスト | L281 |
| サンプルプラグイン仕様 | L317 |
| 個人開発における注意点 | L345 |
| 関連ドキュメント | L373 |

### references/rag-desktop-state.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| テーマ状態管理 | L16 |
| ワークスペース状態管理 | L37 |
| システムプロンプト状態管理 | L60 |
| IPCチャネル設計（チャット・LLM選択） | L98 |
| LLM選択アーキテクチャ | L121 |
| セキュリティ考慮事項 | L154 |
| 関連ドキュメント | L165 |

### references/rag-knowledge-graph.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| 主要型定義 | L19 |
| EntityEntity型（ノード） | L32 |
| RelationEntity型（エッジ） | L63 |
| CommunityEntity型（クラスター） | L96 |
| バリデーション（Zod） | L118 |
| ユーティリティ関数 | L133 |
| 型安全性の保証 | L148 |
| テストカバレッジ | L160 |
| 関連ドキュメント | L174 |

### references/rag-query-pipeline.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| 概要 | L19 |
| GraphRAGクエリサービス | L25 |
| HybridRAG統合パイプライン | L94 |
| クエリタイプと検索重み | L175 |
| フォールバック設計 | L186 |
| パフォーマンス目標 | L198 |
| HybridRAGFactory | L210 |
| テスト品質 | L224 |
| 関連ドキュメント | L233 |

### references/rag-search-crag.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L14 |
| アーキテクチャ | L23 |
| 主要インターフェース | L49 |
| 型定義 | L69 |
| 設定オプション | L128 |
| 外部依存インターフェース | L150 |
| 定数 | L182 |
| 型ガード | L200 |
| アクション決定ロジック | L213 |
| テスト品質 | L223 |
| 関連ドキュメント | L233 |

### references/rag-search-graph.md

| セクション | 行 |
|------------|----|\n| GraphSearchStrategyインターフェース | L14 |
| クエリタイプ | L24 |
| GraphSearchOptions | L34 |
| 依存インターフェース | L46 |
| スコアリング | L56 |
| 定数 | L66 |
| テスト品質 | L79 |
| 関連ドキュメント | L88 |

### references/rag-search-hybrid.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| HybridRAGEngineクラス | L23 |
| HybridRAGResponse | L50 |
| HybridRAGResult | L70 |
| PipelineStageResult | L82 |
| SearchOptions（HybridRAG） | L95 |
| HybridRAGOptions | L106 |
| 定数 | L115 |
| HybridRAGFactory | L125 |
| テスト品質 | L174 |
| 関連ドキュメント | L183 |

### references/rag-search-keyword.md

| セクション | 行 |
|------------|----|\n| IKeywordSearchStrategy | L14 |
| KeywordSearchError | L28 |
| 定数 | L48 |
| 検索モード | L58 |
| FTS5テーブル構造 | L68 |
| FTS5クエリパターン | L81 |
| BM25スコア正規化 | L93 |
| データフロー | L106 |
| 非機能要件 | L121 |
| テスト品質 | L133 |
| 関連ドキュメント | L142 |
| 変更履歴 | L150 |

### references/rag-search-types.md

| セクション | 行 |
|------------|----|\n| 主要型 | L14 |
| 列挙型 | L56 |
| 検索設定型 | L66 |
| デフォルト値 | L106 |
| ユーティリティ関数 | L114 |
| 型ガード | L129 |
| バリデーション | L139 |
| クエリ分類器 | L153 |
| 関連ドキュメント | L173 |

### references/rag-search-vector.md

| セクション | 行 |
|------------|----|\n| ISearchStrategy実装 | L14 |
| VectorSearchStrategyインターフェース | L25 |
| Result型 | L35 |
| フィルタ対応 | L52 |
| 定数 | L65 |
| CachedVectorSearchStrategy | L77 |
| テスト品質 | L88 |
| 関連ドキュメント | L97 |
| 変更履歴 | L106 |

### references/rag-services.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| 概要 | L19 |
| クエリ分類器 | L25 |
| エンティティ抽出サービス (NER) | L76 |
| コミュニティ検出サービス (Leiden Algorithm) | L162 |
| 関連ドキュメント | L284 |

### references/rag-vector-search.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| 概要 | L19 |
| アーキテクチャ構成 | L32 |
| 距離メトリクス | L57 |
| 類似度計算 | L67 |
| ベクトルインデックス設定 | L77 |
| プリセット設定 | L94 |
| データフロー | L104 |
| CASCADE DELETE | L114 |
| オフライン・同期アーキテクチャ | L120 |
| VectorSearchStrategy（セマンティック検索） | L151 |
| 関連ドキュメント | L221 |

### references/spec-guidelines.md

| セクション | 行 |
|------------|----|\n| テンプレート一覧 | L7 |
| 命名規則 | L29 |
| 記述形式 | L58 |
| すべきこと | L78 |
| 避けるべきこと | L87 |
| 新規仕様の追加手順 | L96 |
| ファイルサイズ管理 | L104 |

### references/spec-splitting-guidelines.md

| セクション | 行 |
|------------|----|\n| 概要 | L7 |
| 分割判断基準 | L13 |
| インターフェース仕様（interfaces-）の分割パターン | L23 |
| アーキテクチャ仕様（architecture-）の分割パターン | L69 |
| API仕様（api-）の分割パターン | L91 |
| UI/UX仕様（ui-ux-）の分割パターン | L113 |
| セキュリティ仕様（security-）の分割パターン | L135 |
| データベース仕様（database-）の分割パターン | L157 |
| 技術スタック仕様（technology-）の分割パターン | L179 |
| ワークフロー仕様（workflow-）の分割パターン | L199 |
| Claude Code仕様（claude-code-）の分割パターン | L219 |
| 分割実行手順 | L240 |
| 命名規則 | L295 |
| 分割後のメンテナンス | L326 |
| 関連ドキュメント | L346 |
| 変更履歴 | L355 |

### references/task-workflow-phases.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| フェーズ構造 | L17 |
| 出力テンプレート | L180 |

### references/task-workflow-rules.md

| セクション | 行 |
|------------|----|\n| 品質ゲート | L8 |
| コマンド・エージェント・スキル選定ルール | L37 |
| タスク分解ルール | L94 |
| ドキュメント更新ルール | L115 |
| 実行時のコマンド・エージェント・スキル | L136 |
| 関連ドキュメント | L160 |

### references/task-workflow.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L35 |
| フェーズ構造（概要） | L44 |
| 品質ゲート（概要） | L75 |
| 出力テンプレート | L86 |
| 実行時のコマンド・エージェント・スキル | L109 |
| 完了タスク | L133 |
| 残課題（未タスク） | L233 |
| 関連ドキュメント | L267 |
| 変更履歴 | L277 |

### references/ui-history-components.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| ファイル構成 | L18 |
| コンポーネント構成 | L41 |
| Props定義 | L92 |
| カスタムフック | L130 |
| 関連ドキュメント | L210 |

### references/ui-history-data-types.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L10 |
| データ型 | L19 |
| IPC通信 | L99 |
| 関連ドキュメント | L142 |

### references/ui-history-design.md

| セクション | 行 |
|------------|----|\n| UI設計 | L10 |
| アクセシビリティ | L74 |
| エラーハンドリング | L140 |
| パフォーマンス | L190 |
| 関連ドキュメント | L211 |
| 変更履歴 | L219 |

### references/ui-history-integration.md

| セクション | 行 |
|------------|----|\n| テストカバレッジ | L10 |
| 統合手順 | L34 |
| 統合ステータス | L53 |
| IPCハンドラー詳細（history-ipc-handlers） | L85 |
| タスク依存関係一覧 | L119 |
| タスク: history-preload-setup（2026-01-13完了） | L133 |
| タスク: history-manual-testing（2026-01-17完了） | L163 |
| 残課題 | L211 |
| 関連ドキュメント | L225 |

---

