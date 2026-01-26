# トピックマップ

> 自動生成: 2026-01-25
> 生成コマンド: node scripts/generate-index.mjs

このファイルはreferences/配下の仕様をトピック別に整理したインデックスです。
**新規ファイルはprefixに基づいて自動分類されます。**

---

## 検索方法

### コマンド検索

```bash
node scripts/search-spec.mjs "<キーワード>"
node scripts/search-spec.mjs "認証" -C 5
```

### トピック一覧

```bash
node scripts/list-specs.mjs --topics
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
| セキュリティ | L256 |
| 可用性 | L284 |
| 保守性 | L302 |
| アクセシビリティ | L403 |
| テストカバレッジ目標 | L422 |
| 関連ドキュメント | L498 |

---

## アーキテクチャ

**関連キーワード**: モノレポ, レイヤー, Clean Architecture, RAG, Knowledge Graph

### references/architecture-auth-security.md

| セクション | 行 |
|------------|----|\n| 認証アーキテクチャ（Supabase + Electron） | L8 |
| セキュリティアーキテクチャ | L125 |
| RAGパイプラインアーキテクチャ | L164 |
| 関連ドキュメント | L281 |

### references/architecture-chat-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| レイヤー構成 | L17 |
| 依存関係ルール | L43 |
| ディレクトリ構成 | L56 |
| UI Layer | L114 |
| Domain Layer | L204 |
| Application Layer | L285 |
| Infrastructure Layer | L305 |
| エラーハンドリング | L361 |
| ビジネスルール | L387 |
| 品質指標 | L398 |
| 設計原則 | L412 |
| 関連ドキュメント | L433 |
| 完了タスク | L443 |
| 変更履歴 | L475 |

### references/architecture-database.md

| セクション | 行 |
|------------|----|\n| データベース設計原則 | L8 |
| workflowsテーブル設計 | L49 |
| ベクトル検索設計（将来拡張） | L99 |

### references/architecture-embedding-pipeline.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 主要コンポーネント | L21 |
| チャンキング戦略 | L33 |
| 埋め込みプロバイダー | L52 |
| 信頼性機能 | L66 |
| パフォーマンス最適化 | L94 |
| 品質メトリクス | L121 |
| 関連ドキュメント | L149 |

### references/architecture-file-conversion.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 主要コンポーネント | L15 |
| ログ記録サービス（ConversionLogger） | L27 |
| 履歴管理サービス（HistoryService） | L72 |
| Electron統合（history-service-db-integration） | L119 |
| アーキテクチャパターン | L215 |
| 実装済みコンバーター | L225 |
| 品質指標 | L263 |
| 新規コンバーター追加手順 | L272 |
| コンバーター優先度ガイドライン | L282 |
| パフォーマンス要件 | L291 |
| 既知の制限事項 | L301 |
| 技術的負債 | L310 |
| 将来の拡張ポイント | L319 |
| 関連ドキュメント | L340 |

### references/architecture-monorepo.md

| セクション | 行 |
|------------|----|\n| モノレポアーキテクチャ | L8 |
| 型エクスポートパターン | L127 |

### references/architecture-patterns.md

| セクション | 行 |
|------------|----|\n| 機能追加パターン | L8 |
| Environment Backend サービス（Desktop Main Process） | L75 |
| Zustand Sliceパターン（Desktop） | L141 |
| スキル管理サービス（Desktop Main Process） | L235 |
| Claude Code CLI連携パターン（Desktop Main Process） | L523 |
| IPC Handler Registration Pattern（Desktop Main Process） | L620 |
| Claude CLI Renderer API（Preload API） | L704 |
| 会話履歴永続化パターン（Desktop Main Process） | L906 |
| chatEditSlice（Workspace Chat Edit状態管理） | L1006 |
| Monaco Diff Editor統合パターン（Desktop Renderer） | L1089 |

### references/architecture-rag.md

| セクション | 行 |
|------------|----|\n| Knowledge Graph型定義（RAG実装） | L8 |
| DiskANNベクトル検索アーキテクチャ | L158 |
| オフライン・同期アーキテクチャ | L248 |
| Desktop状態管理 | L279 |
| クエリ分類器 | L416 |
| エンティティ抽出サービス (NER) | L460 |
| コミュニティ検出サービス (Leiden Algorithm) | L541 |
| VectorSearchStrategy（セマンティック検索） | L658 |
| GraphRAGクエリサービス | L734 |
| HybridRAG統合パイプライン | L806 |

---

## インターフェース

**関連キーワード**: インターフェース, 型定義, IConverter, Repository, Logger

### references/interfaces-agent-sdk.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| アーキテクチャ | L25 |
| 依存関係解決 | L54 |
| Preload API（window.agentAPI） | L101 |
| 型定義 | L172 |
| エラー型 | L218 |
| IPC チャンネル | L246 |
| Zodスキーマ | L260 |
| 設定定数 | L295 |
| React Hook（useAgent） | L307 |
| セッション管理 | L332 |
| Skill Dashboard 型定義（AGENT-002） | L367 |
| SkillImportStore（TASK-2B） | L1016 |
| ModifierSkill（スライド逆同期機能） | L1247 |
| Agent Execution UI 型定義（AGENT-004） | L1400 |
| AgentSDKPage（ポストリリーステスト検証UI） | L1757 |
| AgentSDKPage Postrelease Testing（AGENT-005-POST） | L1894 |
| Claude Code CLI統合 | L2034 |
| Session Persistence（セッション永続化） | L2154 |
| Skill Import Agent System 型定義（TASK-1-1） | L2372 |
| PermissionResolver 型定義（TASK-3-2） | L2961 |
| Hooks実装（TASK-3-1-B） | L3380 |
| PermissionResolver IPC Handlers（TASK-4-2） | L3952 |
| onPermission（TASK-3-1-D） | L705 |
| respondPermission（TASK-3-1-D） | L740 |
| Permission型定義（TASK-3-1-D） | L782 |
| React Hooks（TASK-3-1-D） | L816 |
| permission-dialog-ui完了（TASK-3-1-D） | L4026 |

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
| ビジネスルール | L228 |
| エクスポート形式 | L250 |
| 品質メトリクス | L302 |
| Renderer Process型定義（UI側） | L312 |
| Preload API（conversationAPI） | L366 |
| React Hooks | L396 |
| UIコンポーネント構成（Atomic Design） | L441 |
| アクセシビリティ対応 | L472 |
| 完了タスク | L483 |
| 残課題 | L527 |
| 関連ドキュメント | L535 |
| 変更履歴 | L545 |

### references/interfaces-converter-extension.md

| セクション | 行 |
|------------|----|\n| BaseConverter 継承による実装 | L14 |
| 実装の最小構成 | L42 |
| カスタムメタデータの追加 | L100 |
| エラーハンドリングのベストプラクティス | L138 |
| テストの実装パターン | L176 |
| 関連ドキュメント | L242 |

### references/interfaces-converter-implementations.md

| セクション | 行 |
|------------|----|\n| 実装クラス一覧 | L10 |
| HTMLConverter | L24 |
| CSVConverter | L62 |
| JSONConverter | L112 |
| MarkdownConverter | L171 |
| CodeConverter | L229 |
| YAMLConverter | L279 |
| PlainTextConverter（未実装） | L328 |
| 関連ドキュメント | L366 |

### references/interfaces-converter.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| IConverter インターフェース | L24 |
| 実装クラス一覧 | L56 |
| IConversionLogger インターフェース | L72 |
| IHistoryService インターフェース | L128 |
| ConversionRepository インターフェース | L173 |
| 関連ドキュメント | L190 |

### references/interfaces-core.md

| セクション | 行 |
|------------|----|\n| IRepository インターフェース | L8 |
| Result型 | L70 |
| Logger インターフェース | L105 |
| IAIClient インターフェース | L140 |
| IFileWatcher インターフェース | L173 |

### references/interfaces-llm.md

| セクション | 行 |
|------------|----|\n| LLM チャット関連型定義（Desktop IPC） | L8 |
| Multi-LLM Provider Switching 型定義 | L102 |
| LLM ストリーミングレスポンス仕様 | L253 |
| Embedding Generation 型定義 | L403 |
| Workspace Chat Edit サービスインターフェース | L555 |
| 完了タスク | L777 |
| 関連ドキュメント | L882 |
| 変更履歴 | L895 |

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
| インターフェース定義 | L101 |
| 型定義 | L132 |
| エラー型 | L181 |
| 使用例 | L193 |
| 実装ガイドライン | L250 |
| 関連ドキュメント | L273 |
| 変更履歴 | L285 |

### references/interfaces-rag-community-summarization.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L26 |
| 設計 | L51 |
| インターフェース定義 | L103 |
| 型定義 | L128 |
| エラー型 | L175 |
| 使用例 | L187 |
| 実装ガイドライン | L266 |
| 関連ドキュメント | L297 |
| 変更履歴 | L308 |

### references/interfaces-rag-entity-extraction.md

| セクション | 行 |
|------------|----|\n| 主要インターフェース | L16 |
| 実装クラス | L66 |
| 型定義（Zodスキーマ） | L116 |
| エンティティタイプ（52種類・10カテゴリ） | L170 |
| エラーハンドリング | L187 |
| パフォーマンス特性 | L221 |
| テスト用ユーティリティ | L250 |
| テスト品質 | L275 |
| 変更履歴 | L285 |
| 関連ドキュメント | L293 |

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
| 実装ガイドライン | L249 |
| 関連ドキュメント | L282 |
| 変更履歴 | L293 |

### references/interfaces-rag-knowledge-graph-store.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 要件 | L25 |
| 設計 | L49 |
| インターフェース定義 | L139 |
| エラー型 | L176 |
| 実装ガイドライン | L187 |
| 実装ステータス | L209 |
| 関連ドキュメント | L284 |
| 変更履歴 | L294 |

### references/interfaces-rag-search.md

| セクション | 行 |
|------------|----|\n| 主要型 | L16 |
| 列挙型 | L58 |
| 検索設定型 | L68 |
| デフォルト値 | L108 |
| ユーティリティ関数 | L116 |
| 型ガード | L131 |
| バリデーション | L141 |
| クエリ分類器 | L155 |
| キーワード検索戦略（FTS5/BM25） | L175 |
| ベクトル検索戦略（VectorSearchStrategy） | L306 |
| グラフ検索戦略（GraphSearchStrategy） | L386 |
| Corrective RAG（CRAG） | L454 |
| HybridRAG統合エンジン | L636 |
| HybridRAGFactory | L730 |
| 変更履歴 | L786 |
| 関連ドキュメント | L800 |

### references/interfaces-rag.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L12 |
| Branded Types | L25 |
| RAGエラー型 | L48 |
| 共通インターフェース | L69 |
| ファイル・変換ドメイン型 | L126 |
| Knowledge Graph型 | L152 |
| 設計原則 | L168 |
| 関連ドキュメント | L394 |

### references/interfaces-system-prompt.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Repository インターフェース | L17 |
| エンティティ型定義 | L122 |
| IPC チャネル仕様 | L169 |
| エラーコード体系 | L193 |
| バリデーションルール | L210 |
| セキュリティ仕様 | L232 |
| データ永続化 | L251 |
| マイグレーション仕様 | L268 |
| 完了タスク | L290 |
| 関連ドキュメント | L302 |
| 変更履歴 | L312 |

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
| DTOs | L297 |
| リポジトリインターフェース | L340 |
| エラーハンドリングパターン | L369 |
| 将来の拡張 | L415 |
| 関連ドキュメント | L429 |

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
|------------|----|\n| エンドポイント一覧 | L8 |
| Desktop IPC API（認証・プロフィール） | L126 |
| Slide IPC API（スライド同期） | L514 |
| エンドポイント命名規則 | L608 |
| Electron IPC API設計 | L629 |
| AIプロバイダーAPI連携 | L736 |
| エンティティ抽出サービス (NER) | L769 |

### references/api-internal-chunk-search.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 検索エンドポイント（将来実装） | L14 |
| 性能目標 | L69 |
| 使用例（データベース層） | L78 |
| 実装ステータス | L105 |

### references/api-internal-conversion.md

| セクション | 行 |
|------------|----|\n| ConversionService API | L8 |
| HistoryService API | L155 |
| Electron HistoryService API | L328 |

### references/api-internal-embedding.md

| セクション | 行 |
|------------|----|\n| 主要インターフェース | L10 |
| エラーコード | L140 |
| 性能指標 | L151 |

### references/api-internal-search.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| 主要クラス | L14 |
| SearchService メソッド | L24 |
| エラーコード | L182 |
| 使用パターン | L192 |
| 性能特性 | L251 |
| デフォルト除外パターン | L261 |
| 関連ドキュメント | L274 |

### references/api-internal.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| API一覧 | L12 |
| 各APIの概要 | L21 |
| 関連ドキュメント | L49 |

---

## データベース

**関連キーワード**: Turso, SQLite, スキーマ, FTS5, Embedded Replicas

### references/database-architecture.md

| セクション | 行 |
|------------|----|\n| 採用技術と選定理由 | L8 |
| アーキテクチャ概要 | L17 |
| 設計原則 | L43 |
| 環境別接続設定 | L50 |
| ディレクトリ構成 | L76 |
| 基盤モジュール | L97 |
| 使用例 | L144 |
| 関連ドキュメント | L155 |

### references/database-implementation.md

| セクション | 行 |
|------------|----|\n| 型安全なクエリ実装 | L8 |
| Embedded Replicas とオフライン対応 | L58 |
| マイグレーション管理 | L104 |
| テスト戦略 | L144 |
| エラーハンドリング | L174 |
| ベクトル検索実装（DiskANN） | L205 |
| Knowledge Graphテーブル群（GraphRAG基盤） | L263 |
| パフォーマンス最適化 | L468 |

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

### references/ui-ux-components.md

| セクション | 行 |
|------------|----|\n| コンポーネント設計原則 | L8 |
| Apple HIG 準拠（Electron向け） | L51 |
| インタラクション設計 | L106 |
| アクセシビリティ（WCAG 2.1 AA準拠） | L196 |
| Agent Execution UI コンポーネント（AGENT-004） | L257 |
| Community Visualization UI コンポーネント（CONV-08-05） | L511 |
| Custom Execution Environment UI コンポーネント（AGENT-006） | L647 |
| workspace-chat-edit-ui コンポーネント（Issue #468） | L736 |
| SkillStreamDisplay コンポーネント（TASK-3-2） | L848 |
| 完了タスク | L957 |

### references/ui-ux-design-system.md

| セクション | 行 |
|------------|----|\n| デザインシステム概要 | L8 |
| Spatial Design Tokens（Knowledge Studio） | L34 |
| カラーシステム | L71 |
| タイポグラフィ | L121 |
| スペーシングとレイアウト | L160 |

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
| フォルダ一括選択機能 | L223 |
| 関連ドキュメント | L284 |

### references/ui-ux-forms.md

| セクション | 行 |
|------------|----|\n| フォーム設計 | L8 |
| 認証UI設計 | L69 |
| APIキー設定UI設計 | L277 |

### references/ui-ux-history-panel.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| ファイル構成 | L16 |
| コンポーネント構成 | L39 |
| カスタムフック | L138 |
| データ型 | L242 |
| データフロー | L310 |
| UI設計 | L350 |
| アクセシビリティ | L395 |
| エラーハンドリング | L440 |
| パフォーマンス | L475 |
| テストカバレッジ | L509 |
| 統合手順 | L533 |
| 統合ステータス | L552 |
| 関連ドキュメント | L714 |
| 変更履歴 | L728 |

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
| 実装詳細（TASK-SEARCH-INTEGRATE-001） | L304 |
| 関連ドキュメント | L398 |
| 完了タスク | L407 |
| 未タスク（将来の改善候補） | L413 |

### references/ui-ux-settings.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 設定画面アーキテクチャ | L15 |
| スライド出力ディレクトリ設定 | L51 |
| 設定永続化 | L119 |
| IPC API仕様 | L140 |
| セキュリティ要件 | L162 |
| テスト要件 | L177 |
| ツール許可設定（Permission Settings） | L200 |
| 関連ドキュメント | L265 |
| 実装ファイル | L274 |
| バージョン履歴 | L291 |

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
|------------|----|\n| API セキュリティ | L10 |
| 依存関係セキュリティ | L53 |
| Electron セキュリティ | L78 |
| スキルインポートIPCチャネル（TASK-4-1） | L284 |
| Permission IPC Handler セキュリティ（TASK-4-2） | L571 |
| useSkillPermission Hook セキュリティ（TASK-3-1-D） | L543 |
| 完了タスク | L601 |
| 関連ドキュメント | L657 |
| 変更履歴 | L612 |

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
|------------|----|\n| ログ・監査 | L8 |
| ファイル選択セキュリティ | L47 |
| インシデント対応 | L103 |
| セキュリティチェックリスト | L149 |
| 関連ドキュメント | L195 |

### references/security-principles.md

| セクション | 行 |
|------------|----|\n| セキュリティ設計原則 | L8 |
| 認証・認可 | L45 |
| データ保護 | L227 |

### references/security-skill-execution.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| エクスポート一覧 | L20 |
| DANGEROUS_PATTERNS | L35 |
| ALLOWED_TOOLS_WHITELIST | L89 |
| API リファレンス | L116 |
| 使用例 | L195 |
| テストカバレッジ | L242 |
| Permission Store（権限永続化） | L258 |
| 関連ドキュメント | L338 |
| 変更履歴 | L348 |

---

## 技術スタック

**関連キーワード**: Next.js, Electron, TypeScript, Drizzle, pnpm

### references/technology-backend.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| バックエンド・データベース | L54 |
| AI統合 | L222 |
| 開発ツール | L442 |

### references/technology-core.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| 概要 | L54 |
| コアランタイム | L102 |
| フロントエンド | L165 |

### references/technology-devops.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| パッケージ構成詳細 | L54 |
| 依存関係管理戦略 | L189 |
| 無料枠の活用ガイド | L295 |
| CI/CDツール選定 | L328 |
| 学習リソースとコミュニティ | L406 |
| マイグレーション計画 | L432 |
| 関連ドキュメント | L453 |

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
| 依存スキルの記述規則 | L91 |
| 本文の必須セクション | L129 |
| 行数制約 | L175 |
| 命名規則 | L185 |
| ファイル参照形式 | L197 |
| 関連ドキュメント | L218 |

### references/claude-code-agents-workflow.md

| セクション | 行 |
|------------|----|\n| ワークフローセクションの記述形式（各Phase共通） | L10 |
| ペルソナ設計 | L67 |
| ツール権限設定 | L82 |
| エージェント間協調 | L95 |
| ハンドオフプロトコル | L106 |
| agent_list.md 仕様 | L119 |
| エラーハンドリング | L157 |
| 状態管理 | L178 |
| 品質基準 | L202 |
| 関連ドキュメント | L220 |

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
| 品質基準 | L321 |
| 命名規則 | L334 |
| ファイル参照形式 | L346 |
| 参照 | L374 |
| 変更履歴 | L392 |

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
| ドキュメント構成 | L302 |

### references/claude-code-skills-agents.md

| セクション | 行 |
|------------|----|\n| 目的 | L10 |
| agents/ の位置づけ（誤解防止） | L17 |
| agents/_.md 標準フォーマット（必須テンプレ） | L26 |
| agents/_.md テンプレ（Markdown見出しで構造化） | L43 |
| 関連ドキュメント | L175 |

### references/claude-code-skills-overview.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| コア原則 | L43 |

### references/claude-code-skills-process.md

| セクション | 行 |
|------------|----|\n| スキル作成・更新プロセス | L10 |
| フィードバックループ | L243 |
| 品質基準 | L291 |
| 命名規則 | L324 |
| ファイル参照形式 | L345 |
| skill_list.md 仕様 | L382 |
| 参照（最小限に維持） | L416 |

### references/claude-code-skills-resources.md

| セクション | 行 |
|------------|----|\n| scripts/ ディレクトリ仕様 | L10 |
| references/ ディレクトリ仕様 | L47 |
| Progressive Disclosure パターン | L77 |
| assets/ ディレクトリ仕様 | L124 |
| ワークフローパターン | L145 |
| 出力パターン | L175 |
| 関連ドキュメント | L252 |

### references/claude-code-skills-structure.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| ドキュメント構成 | L16 |
| Skill構造仕様 | L25 |
| SKILL.md 仕様 | L50 |
| 関連ドキュメント | L133 |

---

## その他

**関連キーワード**: デプロイ, Railway, 環境変数, Discord, プラグイン

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
|------------|----|\n| 環境変数の分類 | L8 |
| セキュリティベストプラクティス | L60 |
| 環境別設定 | L132 |
| Electron アプリでの環境変数 | L184 |
| トラブルシューティング | L241 |
| チーム開発での運用 | L302 |
| 必須環境変数一覧 | L340 |
| 関連ドキュメント | L399 |

### references/error-handling.md

| セクション | 行 |
|------------|----|\n| エラー分類 | L8 |
| 認可エラー（UnauthorizedError） | L231 |
| リトライ戦略 | L312 |
| サーキットブレーカー（将来対応） | L354 |
| エラーレスポンス形式 | L382 |
| エラーログ出力 | L413 |
| ユーザー向けエラーメッセージ | L450 |
| エラーハンドリングの実装指針 | L473 |
| 関連ドキュメント | L503 |

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

### references/spec-guidelines.md

| セクション | 行 |
|------------|----|\n| 命名規則 | L5 |
| 記述形式 | L34 |
| すべきこと | L54 |
| 避けるべきこと | L63 |
| 新規仕様の追加手順 | L72 |
| ファイルサイズ管理 | L80 |

### references/task-workflow-phases.md

| セクション | 行 |
|------------|----|\n| フェーズ構造 | L8 |
| 出力テンプレート | L186 |

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
| ドキュメント構成 | L32 |
| フェーズ構造（概要） | L41 |
| 品質ゲート（概要） | L71 |
| 出力テンプレート | L82 |
| 実行時のコマンド・エージェント・スキル | L107 |
| 完了タスク | L131 |
| 残課題（未タスク） | L201 |
| 関連ドキュメント | L222 |
| 変更履歴 | L232 |

---
