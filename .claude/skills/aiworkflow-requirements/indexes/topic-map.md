# トピックマップ

> 自動生成: 2026-02-26
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
| UX言語辞書 | L189 |
| 関連リソース | L224 |

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
|------------|----|\n| 概要 | L6 |
| パフォーマンス要件 | L37 |
| テスト戦略（TDD実践ガイド） | L125 |
| セキュリティ | L452 |
| 可用性 | L480 |
| 保守性 | L498 |
| アクセシビリティ | L598 |
| テストカバレッジ目標 | L617 |
| 関連ドキュメント | L694 |
| 完了タスク | L702 |
| 変更履歴 | L1008 |

---

## アーキテクチャ

**関連キーワード**: モノレポ, レイヤー, Clean Architecture, RAG, Knowledge Graph

### references/architecture-auth-security.md

| セクション | 行 |
|------------|----|\n| セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001） | L28 |
| 変更履歴 | L95 |
| 認証アーキテクチャ（Supabase + Electron） | L108 |
| セキュリティアーキテクチャ | L233 |
| RAGパイプラインアーキテクチャ | L272 |
| 完了タスク | L387 |
| 実装時の苦戦した箇所・知見 | L509 |
| 関連ドキュメント | L553 |

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
| バックエンド実装パターン | L298 |
| デスクトップ（Electron）実装パターン | L364 |
| パフォーマンス最適化パターン | L779 |
| セキュリティ実装パターン | L817 |
| テスト実装パターン | L980 |
| アクセシビリティ実装パターン | L1426 |
| 関連ドキュメント | L1451 |
| スキル作成実装パターン（TASK-9B-G） | L1463 |
| 外部API データ正規化パターン | L1587 |
| SkillAPI統一パターン（TASK-FIX-5-1 2026-02-06実装） | L1626 |
| 型定義修正タスクパターン（UT-FIX-5-4 2026-02-10実装） | L1688 |
| SDK 型統合パターン（TASK-9B-I 2026-02-12実装） | L1742 |
| IPCインターフェース不整合修正パターン（P44 2026-02-21実装） | L1958 |
| SkillEditor 実装パターン（TASK-9A-C spec_created） | L2025 |
| IPC インターフェース不整合修正パターン（P44/P45解決） | L2085 |
| IPCチャネル名競合予防パターン（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 2026-02-24策定） | L2113 |
| P42準拠バリデーション一括移行パターン（UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 2026-02-24実装） | L2208 |
| IPC データフロー型ギャップパターン（UT-IPC-DATA-FLOW-TYPE-GAPS-001 2026-02-24実装） | L2313 |

### references/architecture-monorepo.md

| セクション | 行 |
|------------|----|\n| モノレポアーキテクチャ | L8 |
| 型エクスポートパターン | L214 |
| 完了タスク | L284 |
| 変更履歴 | L316 |

### references/architecture-overview.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 設計思想 | L14 |
| レイヤー構成 | L41 |
| デザインパターン | L71 |
| UI/UXアーキテクチャ | L102 |
| セキュリティアーキテクチャ | L125 |
| 状態管理アーキテクチャ | L159 |
| データフローアーキテクチャ | L184 |
| ディレクトリ構造 | L235 |
| データ構造（型システム） | L292 |
| 機能追加パターン | L326 |
| 技術スタック | L361 |
| テンプレート | L373 |
| 関連ドキュメント | L393 |
| 変更履歴 | L434 |

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
| SkillService 統合（TASK-FIX-7-1） | L16 |
| SkillExecutor 型定義（TASK-3-1-A） | L102 |
| リトライ機構（TASK-SKILL-RETRY-001） | L316 |
| PermissionResolver 型定義（TASK-3-2） | L383 |
| SkillExecutor IPC統合（TASK-3-2） | L470 |
| 完了タスク | L547 |
| 関連ドキュメント | L731 |
| 変更履歴 | L744 |

### references/interfaces-agent-sdk-history.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| 完了タスク | L16 |
| 残課題（未タスク） | L529 |
| 関連ドキュメント | L543 |
| 変更履歴 | L559 |

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
| SkillImportStore（TASK-2B） | L708 |
| SkillSlice型定義（TASK-6-1） | L760 |
| ModifierSkill（スライド逆同期機能） | L852 |
| ChatPanel統合（TASK-7D） | L886 |
| SkillFileManager（TASK-9A-A） | L921 |
| テストアーキテクチャ（TASK-8C-A） | L1009 |
| 完了タスク | L1061 |
| 関連ドキュメント | L1279 |
| SkillCreatorService（TASK-9B-G） | L1292 |
| 完了タスク | L1519 |
| SkillEditor UI 型定義（TASK-9A-C / spec_created） | L1804 |
| 変更履歴 | L1855 |

### references/interfaces-agent-sdk-ui.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| Agent Execution UI 型定義（AGENT-004） | L16 |
| AgentSDKPage（ポストリリーステスト検証UI） | L345 |
| 関連ドキュメント | L408 |
| 完了タスク | L421 |
| 変更履歴 | L480 |

### references/interfaces-agent-sdk.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| 仕様書インデックス | L25 |
| アーキテクチャ | L39 |
| 依存関係解決 | L63 |
| Preload API（window.agentAPI） | L88 |
| 型定義 | L161 |
| エラー型 | L207 |
| IPC チャンネル | L237 |
| 設定定数 | L251 |
| React Hook（useAgent） | L263 |
| セッション管理 | L288 |
| 関連ドキュメント | L315 |
| SDK 型安全統合（TASK-9B-I） | L329 |
| 変更履歴 | L387 |

### references/interfaces-auth.md

| セクション | 行 |
|------------|----|\n| 認証・プロフィール型定義 | L8 |
| 完了タスク | L256 |
| ワークスペース型定義 | L343 |
| 変更履歴 | L397 |

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
| 変更履歴 | L137 |
| 関連ドキュメント | L150 |

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
| 変更履歴 | L131 |
| 関連ドキュメント | L142 |

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
| Workspace Chat Edit IPC チャネル | L78 |
| 完了タスク | L204 |
| Skill Creator IPC チャネル | L276 |
| 実装パターン参照 | L353 |
| 関連ドキュメント | L365 |
| スキルファイル操作 IPC チャネル（TASK-9A-B） | L377 |
| 完了タスク | L433 |
| 変更履歴 | L453 |

### references/api-ipc-auth.md

| セクション | 行 |
|------------|----|\n| 認証 IPC チャネル | L10 |
| プロフィール IPC チャネル | L71 |
| イベントチャネル（Main → Renderer） | L82 |
| 型定義 | L109 |
| 認証状態管理 | L167 |
| IPCセキュリティ実装 | L198 |
| セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001） | L225 |
| 関連ドキュメント | L279 |
| 完了タスク | L289 |
| 変更履歴 | L303 |

### references/api-ipc-system.md

| セクション | 行 |
|------------|----|\n| AI/チャット IPC チャネル | L10 |
| Slide IPC API（スライド同期） | L46 |
| Electron IPC API設計 | L100 |
| AIプロバイダーAPI連携 | L177 |
| エンティティ抽出サービス (NER) | L210 |
| 関連ドキュメント | L247 |
| 変更履歴 | L256 |

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
| 概要 | L29 |
| コンポーネント階層 | L35 |
| コンポーネント仕様 | L62 |
| インタラクション設計 | L281 |
| 視覚デザイン | L309 |
| アクセシビリティ（WCAG 2.1 AA） | L333 |
| 完了タスク | L345 |
| ChatPanel統合UIフロー（TASK-7D実装済） | L383 |
| 関連ドキュメント | L537 |

### references/ui-ux-atoms-patterns.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| 1. コンポーネント設計パターン | L10 |
| 2. デザイントークン連携パターン | L164 |
| 3. 苦戦箇所と解決策 | L212 |
| 4. アクセシビリティ実装知見 | L346 |
| 5. 後方互換性パターン | L418 |
| 6. テスト戦略 | L472 |
| 7. Molecules/Organisms実装への推奨事項 | L541 |
| 関連ドキュメント | L584 |
| 変更履歴 | L593 |

### references/ui-ux-components.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L15 |
| コンポーネント設計概要 | L25 |
| デザイン原則サマリー | L68 |
| コンポーネント階層図 | L90 |
| 完了タスク | L129 |
| 変更履歴 | L152 |
| 関連ドキュメント | L174 |

### references/ui-ux-design-principles.md

| セクション | 行 |
|------------|----|\n| コンポーネント設計原則 | L10 |
| Apple HIG 準拠（Electron向け） | L78 |
| インタラクション設計 | L133 |
| アクセシビリティ（WCAG 2.1 AA準拠） | L223 |
| UXデザイン法則 | L284 |
| 認知負荷の軽減 | L409 |
| Tap & Discover 哲学 | L430 |
| 関連ドキュメント | L562 |
| 変更履歴 | L572 |

### references/ui-ux-design-system.md

| セクション | 行 |
|------------|----|\n| デザインシステム概要 | L8 |
| Spatial Design Tokens（Knowledge Studio） | L34 |
| カラーシステム | L71 |
| タイポグラフィ | L122 |
| スペーシングとレイアウト | L161 |
| Tap & Discover デザイントークン拡張 | L211 |
| 完了タスク | L246 |
| 変更履歴 | L305 |

### references/ui-ux-feature-components.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| Community Visualization UI コンポーネント（CONV-08-05） | L37 |
| Custom Execution Environment UI コンポーネント（AGENT-006） | L144 |
| workspace-chat-edit-ui コンポーネント（Issue #468, #494） | L211 |
| SkillStreamDisplay コンポーネント（TASK-3-2） | L359 |
| i18n対応（TASK-3-2-B） | L394 |
| コピー履歴機能（TASK-3-2-D） | L443 |
| アクセシビリティ（全コンポーネント共通 WCAG 2.1 AA） | L552 |
| SkillStreamingView コンポーネント（TASK-7D） | L563 |
| SkillEditor UI（TASK-9A-C / 仕様書作成済み） | L607 |
| 完了タスク | L732 |
| 関連ドキュメント | L747 |
| 変更履歴 | L770 |

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
| ChatPanel統合パターン（TASK-7D） | L80 |
| 関連ドキュメント | L118 |

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
| 未タスク（将来の改善候補） | L453 |
| 変更履歴 | L525 |

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
| 関連ドキュメント | L324 |
| 実装ファイル | L334 |
| バージョン履歴 | L359 |

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
| 完了タスク | L80 |
| 変更履歴 | L90 |
| 関連ドキュメント | L107 |

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
| セキュリティ設定 | L27 |
| Content Security Policy (CSP) | L41 |
| IPC通信のセキュリティ | L58 |
| 実装例: historyAPI | L111 |
| 実装例: slideSettingsAPI | L163 |
| 実装例: skillCreatorAPI | L212 |
| 実装例: skillFileAPI（TASK-9A-B） | L329 |
| 自動更新のセキュリティ | L402 |
| 関連ドキュメント | L413 |
| 完了タスク | L421 |

### references/security-implementation.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| ドキュメント構成 | L14 |
| セキュリティ原則 | L24 |
| PKCE / State parameter 実装記録 | L47 |
| 実装時の苦戦した箇所・知見 | L90 |
| 関連ドキュメント | L108 |

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
| ログ・監査 | L18 |
| ファイル選択セキュリティ | L57 |
| インシデント対応 | L124 |
| セキュリティチェックリスト | L170 |
| 関連ドキュメント | L216 |

### references/security-principles.md

| セクション | 行 |
|------------|----|\n| セキュリティ設計原則 | L8 |
| 認証・認可 | L45 |
| データ保護 | L227 |
| 変更履歴 | L408 |

### references/security-skill-execution.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| エクスポート一覧 | L20 |
| DANGEROUS_PATTERNS | L35 |
| ALLOWED_TOOLS_WHITELIST | L92 |
| API リファレンス | L137 |
| 使用例 | L214 |
| テストカバレッジ | L245 |
| Permission Store（権限永続化） | L261 |
| 関連ドキュメント | L345 |
| 変更履歴 | L355 |

### references/security-skill-ipc.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| スキル管理IPCセキュリティ | L16 |
| スキルインポートIPCチャネル（TASK-4-1） | L78 |
| Claude Code CLI連携セキュリティ | L123 |
| Skill Execution Preload API セキュリティ | L184 |
| Permission IPC Handler セキュリティ | L229 |
| SkillAPI Preload実装（TASK-5-1） | L265 |
| 完了タスク | L343 |
| 残課題 | L457 |
| 関連ドキュメント | L471 |
| 変更履歴 | L483 |

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
| 学習リソースとコミュニティ | L387 |
| マイグレーション計画 | L414 |
| 関連ドキュメント | L435 |
| 完了タスク | L445 |
| CI最適化パターン（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02追加） | L459 |
| 変更履歴 | L489 |

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
| プロジェクト登録スキル一覧 | L108 |

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

## ワークフロー

**関連キーワード**: タスク分解, Git Worktree, PR, CI/CD

### references/workflow-skill-identifier-branded-type-resolution.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| フェーズ構造 | L17 |
| Phase詳細 | L46 |
| 苦戦箇所由来のリスクと先回り対策 | L167 |
| 監視・ログ | L177 |
| 関連ドキュメント | L197 |
| 変更履歴 | L208 |

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
| Environment Backend サービス | L21 |
| スキル管理サービス | L88 |
| 関連ドキュメント | L523 |

### references/arch-feature-addition.md

| セクション | 行 |
|------------|----|\n| 新機能追加の手順 | L10 |
| 機能構成のベストプラクティス | L47 |
| この構造の利点 | L67 |
| 関連ドキュメント | L79 |

### references/arch-ipc-persistence.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| IPC Handler Registration Pattern（Desktop Main Process） | L18 |
| 会話履歴永続化パターン（Desktop Main Process） | L96 |
| 関連ドキュメント | L204 |

### references/arch-state-management.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| Zustand Sliceパターン | L33 |
| P31対策: Store Hooks無限ループ防止パターン | L163 |
| chatEditSlice（Workspace Chat Edit状態管理） | L625 |
| skillSlice（統合済み - TASK-FIX-6-1-STATE-CENTRALIZATION） | L715 |
| permissionHistorySlice（権限要求履歴管理） | L873 |
| 関連ドキュメント | L1002 |

### references/arch-ui-components.md

| セクション | 行 |
|------------|----|\n| Monaco Diff Editor統合パターン | L10 |
| SkillSelector コンポーネントパターン | L208 |
| ChatPanel統合パターン（TASK-7D） | L442 |
| 変更履歴 | L493 |
| 関連ドキュメント | L506 |

### references/csrf-state-parameter.md

| セクション | 行 |
|------------|----|\n| メタ情報 | L6 |
| 概要 | L17 |
| API仕様 | L24 |
| 認証フローにおける統合 | L99 |
| セキュリティ設計根拠 | L142 |
| 既知の制約（Implicit Flow由来） | L155 |
| 苦戦箇所と教訓 | L166 |
| テストカバレッジ | L197 |
| 関連ドキュメント | L221 |
| 変更履歴 | L229 |

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
|------------|----|\n| 概要 | L10 |
| ワークフロー構成 | L38 |
| CI ワークフロー要件（PR時） | L48 |
| キャッシュ戦略 | L82 |
| 並列実行の活用 | L112 |
| CD ワークフロー要件（mainマージ時） | L185 |
| モニタリングとアラート | L209 |
| GitHub Secrets の要件 | L256 |
| 関連ドキュメント | L274 |
| 変更履歴 | L282 |

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
| キャッシング戦略 | L88 |
| データマイグレーション | L127 |
| コードレビューガイドライン | L166 |
| パフォーマンス最適化 | L215 |
| 国際化（i18n） | L314 |
| Git ワークフロー | L344 |
| 命名規則 | L380 |
| デバッグガイド | L428 |
| リリースプロセス | L482 |
| バックアップ・リカバリ | L511 |
| 環境構築ガイド | L548 |
| 関連ドキュメント | L651 |
| 完了タスク | L664 |
| 変更履歴 | L676 |

### references/directory-structure.md

| セクション | 行 |
|------------|----|\n| 設計方針 | L8 |
| ルート構造 | L45 |
| packages/shared/ 詳細構造 | L96 |
| apps/web/ 詳細構造（Next.js） | L252 |
| apps/desktop/ 詳細構造（Electron） | L292 |
| local-agent/ 詳細構造 | L398 |
| .github/workflows/ 詳細構造 | L409 |
| ルートの設定ファイル群 | L419 |
| 機能追加の手順 | L438 |
| 構造の選択理由 | L470 |
| 依存関係ルール | L485 |
| pnpm-workspace 設定 | L530 |
| 関連ドキュメント | L549 |

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
| 外部ストレージ取得フォールバックパターン（TASK-FIX-4-2） | L210 |
| リトライ戦略 | L254 |
| SkillExecutor リトライ戦略（TASK-SKILL-RETRY-001） | L296 |
| TokenRefreshScheduler リトライ戦略（TASK-AUTH-SESSION-REFRESH-001） | L333 |
| SkillExecutor 実行エラーコード（TASK-8A） | L384 |
| OAuthエラーコードマッピング（TASK-FIX-GOOGLE-LOGIN-001） | L423 |
| 認証フォールバックパターン（AUTH-UI-001） | L465 |
| サーキットブレーカー（将来対応） | L507 |
| エラーレスポンス形式 | L535 |
| エラーログ出力 | L566 |
| ユーザー向けエラーメッセージ | L603 |
| エラーハンドリングの実装指針 | L626 |
| 関連ドキュメント | L656 |
| 変更履歴 | L665 |

### references/ipc-contract-checklist.md

| セクション | 行 |
|------------|----|\n| メタ情報 | L9 |
| 変更履歴 | L21 |
| 背景 | L30 |
| チェックリスト | L45 |
| 契約ドリフト検出コマンド | L125 |
| 関連ドキュメント | L154 |
| 適用事例 | L168 |

### references/ipc-type-resolution-guide.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| IPC 型不整合の分類 | L18 |
| 診断ワークフロー | L33 |
| 解決パターン | L68 |
| 予防策チェックリスト | L205 |
| 関連ドキュメント | L220 |
| 適用実績 | L231 |
| 変更履歴 | L242 |

### references/lessons-learned.md

| セクション | 行 |
|------------|----|\n| メタ情報 | L8 |
| 変更履歴 | L19 |
| UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ | L87 |
| UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化 | L134 |
| UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離 | L188 |
| UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応 | L271 |
| 目次 | L319 |
| UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク） | L504 |
| UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正 | L663 |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化 | L712 |
| TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード | L761 |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正 | L935 |
| UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正 | L986 |
| UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正 | L1056 |
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一 | L1364 |
| TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠） | L1475 |
| 関連ドキュメント | L1614 |
| TASK-9A-B: スキルファイル操作IPCハンドラー実装 | L1624 |
| TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元 | L1801 |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決エラー修正 | L1859 |

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
| セキュリティ | L169 |
| ディレクトリ構成 | L181 |
| 品質メトリクス | L207 |
| 関連ドキュメント | L218 |
| 完了タスク | L246 |
| 変更履歴 | L271 |

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

### references/logging-migration-guide.md

| セクション | 行 |
|------------|----|\n| メタ情報 | L9 |
| 変更履歴 | L21 |
| 目次 | L29 |
| ログレベルマッピング基準 | L40 |
| 移行手順チェックリスト | L63 |
| コードパターン | L91 |
| テストモックテンプレート | L133 |
| 条件ガード削除パターン | L184 |
| 注意事項・ピットフォール | L227 |
| 関連ドキュメント | L268 |

### references/patterns.md

| セクション | 行 |
|------------|----|\n| 目次 | L9 |
| 成功パターン | L37 |
| 失敗パターン（避けるべきこと） | L513 |
| ガイドライン | L767 |

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

### references/quality-e2e-testing.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L21 |
| テスト戦略 | L35 |
| E2Eテストフィクスチャ | L55 |
| フィクスチャ詳細仕様 | L92 |
| フィクスチャ検証テスト | L142 |
| SkillScannerテスト統合パターン | L198 |
| 完了タスク | L218 |
| skill-creatorフィクスチャ検証テスト（TASK-8C-G） | L327 |
| 残課題（未タスク） | L366 |
| 関連ドキュメント | L377 |

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

### references/skill-executor-type-migration.md

| セクション | 行 |
|------------|----|\n| 概要 | L3 |
| 実装内容 | L7 |
| 苦戦した箇所と解決策 | L28 |
| 関連タスク | L63 |
| 参照 | L72 |
| 変更履歴 | L77 |

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
| 残課題（未タスク） | L1256 |
| 関連ドキュメント | L1399 |
| 変更履歴 | L1409 |

### references/testing-accessibility.md

| セクション | 行 |
|------------|----|\n| 概要 | L10 |
| 1. ARIA属性テスト | L17 |
| 2. キーボードナビゲーション | L105 |
| 3. スクリーンリーダー互換性 | L169 |
| 4. 色とコントラスト | L214 |
| 5. 検証チェックリスト | L244 |
| 6. 自動テストツール | L270 |
| 7. WCAG 2.1 AAチェックリスト | L300 |
| 参照 | L327 |
| 変更履歴 | L335 |

### references/testing-component-patterns.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| 1. Storeモッキングパターン | L18 |
| 2. テストデータファクトリ | L83 |
| 3. アクセシビリティテスト | L153 |
| 4. キーボードナビゲーション | L207 |
| 5. 非同期テスト | L246 |
| 6. テスト構成 | L284 |
| 7. userEvent vs fireEvent | L320 |
| 8. テストファイル分離パターン（TASK-FIX-4-2） | L343 |
| 9. Zustand Store Hooks テストパターン | L398 |
| 10. Main Process SDKテスト有効化パターン（TASK-FIX-11-1-SDK-TEST-ENABLEMENT） | L561 |
| 11. SkillEditor テストパターン（TASK-9A-C spec_created） | L621 |
| 12. テーマ横断テストヘルパー（TASK-UI-00-TOKENS） | L690 |
| 参照 | L721 |
| 関連未タスク | L730 |
| 13. Atoms コンポーネントテストパターン（TASK-UI-00-ATOMS） | L740 |
| 変更履歴 | L842 |

### references/testing-dialog-patterns.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L16 |
| ダイアログ種別 | L22 |
| テストカテゴリ構成 | L32 |
| Basic Flowパターン | L45 |
| Edge Casesパターン | L141 |
| Accessibilityパターン | L180 |
| ヘルパー関数定義 | L256 |
| 定数パターン | L289 |
| テストファイル実装例 | L313 |
| 関連ドキュメント | L328 |

### references/testing-fixtures.md

| セクション | 行 |
|------------|----|\n| 概要 | L9 |
| 1. ファクトリ関数パターン | L16 |
| 2. 境界値フィクスチャ | L106 |
| 3. Storeモック構築 | L155 |
| 4. Propsビルダー | L209 |
| 5. Providerラッパー | L251 |
| 6. フィクスチャファイル構成 | L308 |
| 7. ベストプラクティス | L349 |
| 参照 | L371 |
| 変更履歴 | L379 |

### references/testing-playwright-e2e.md

| セクション | 行 |
|------------|----|\n| 変更履歴 | L8 |
| 概要 | L16 |
| テスト構成 | L22 |
| セレクター戦略 | L43 |
| 待機戦略 | L77 |
| ヘルパー関数パターン | L113 |
| テストスイート構造 | L158 |
| アクセシビリティテスト | L205 |
| beforeEachパターン | L233 |
| テストスキップパターン | L259 |
| CI/CD統合 | L275 |
| デバッグパターン | L307 |
| 関連ドキュメント | L329 |

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

