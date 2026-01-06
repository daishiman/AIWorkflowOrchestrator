# トピックマップ

> 自動生成: 2026-01-05
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

### references/architecture-database.md

| セクション | 行 |
|------------|----|\n| データベース設計原則 | L8 |
| workflowsテーブル設計 | L49 |
| ベクトル検索設計（将来拡張） | L99 |

### references/architecture-file-conversion.md

| セクション | 行 |
|------------|----|\n| A ファイル変換基盤アーキテクチャ | L8 |
| B Embedding Generation Pipeline アーキテクチャ | L584 |

### references/architecture-monorepo.md

| セクション | 行 |
|------------|----|\n| モノレポアーキテクチャ | L8 |

### references/architecture-patterns.md

| セクション | 行 |
|------------|----|\n| 機能追加パターン | L8 |

### references/architecture-rag.md

| セクション | 行 |
|------------|----|\n| Knowledge Graph型定義（RAG実装） | L8 |
| DiskANNベクトル検索アーキテクチャ | L157 |
| オフライン・同期アーキテクチャ | L246 |
| Desktop状態管理 | L277 |

---

## インターフェース

**関連キーワード**: インターフェース, 型定義, IConverter, Repository, Logger

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
| ビジネスルール | L171 |
| エクスポート形式 | L192 |
| User | L203 |
| Assistant | L207 |
| 品質メトリクス | L244 |

### references/interfaces-converter.md

| セクション | 行 |
|------------|----|\n| A IConverter インターフェース | L8 |
| 概要 | L223 |

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
| Embedding Generation 型定義 | L124 |
| 関連ドキュメント | L276 |

### references/interfaces-rag.md

| セクション | 行 |
|------------|----|\n| FileSelection API | L8 |
| RAG型定義 | L81 |

### references/interfaces-workflow.md

| セクション | 行 |
|------------|----|\n| IWorkflowExecutor インターフェース | L8 |

---

## API設計

**関連キーワード**: REST, エンドポイント, 認証, レート制限, IPC

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
| エンドポイント命名規則 | L325 |
| Electron IPC API設計 | L346 |
| AIプロバイダーAPI連携 | L453 |

### references/api-internal.md

| セクション | 行 |
|------------|----|\n| 内部サービスAPI（RAG変換システム） | L8 |
| チャンク検索API（RAG全文検索） | L157 |
| Embedding Generation API | L269 |
| Search Service API | L426 |
| 関連ドキュメント | L694 |

---

## データベース

**関連キーワード**: Turso, SQLite, スキーマ, FTS5, Embedded Replicas

### references/database-architecture.md

| セクション | 行 |
|------------|----|\n| データベース統一アーキテクチャ | L8 |
| 環境別接続設定 | L54 |
| スキーマ設計 | L82 |
| Knowledge Graph テーブル | L717 |
| Repository パターン設計 | L772 |

### references/database-implementation.md

| セクション | 行 |
|------------|----|\n| 型安全なクエリ実装 | L8 |
| Embedded Replicas とオフライン対応 | L58 |
| マイグレーション管理 | L104 |
| テスト戦略 | L144 |
| エラーハンドリング | L174 |
| ベクトル検索実装（DiskANN） | L205 |
| Knowledge Graphテーブル群（GraphRAG基盤） | L263 |
| パフォーマンス最適化 | L449 |

### references/database-operations.md

| セクション | 行 |
|------------|----|\n| Turso 無料枠の活用 | L8 |
| セキュリティベストプラクティス | L41 |
| 運用・メンテナンス | L76 |
| Electron ローカルストレージ | L103 |
| 関連ドキュメント | L166 |

---

## UI/UX

**関連キーワード**: Design Tokens, コンポーネント, Tailwind, レスポンシブ, Apple HIG

### references/ui-ux-advanced.md

| セクション | 行 |
|------------|----|\n| Portal実装パターン | L8 |
| ナビゲーションUI設計（ChatView） | L343 |
| システムプロンプト設定UI | L540 |
| LLM選択機能（Chat LLM Switching） | L773 |
| 関連ドキュメント | L923 |

### references/ui-ux-components.md

| セクション | 行 |
|------------|----|\n| コンポーネント設計原則 | L8 |
| Apple HIG 準拠（Electron向け） | L51 |
| インタラクション設計 | L106 |
| アクセシビリティ（WCAG 2.1 AA準拠） | L196 |

### references/ui-ux-design-system.md

| セクション | 行 |
|------------|----|\n| デザインシステム概要 | L8 |
| Spatial Design Tokens（Knowledge Studio） | L34 |
| カラーシステム | L71 |
| タイポグラフィ | L121 |
| スペーシングとレイアウト | L160 |

### references/ui-ux-forms.md

| セクション | 行 |
|------------|----|\n| フォーム設計 | L8 |
| 認証UI設計 | L69 |
| APIキー設定UI設計 | L277 |

### references/ui-ux-panels.md

| セクション | 行 |
|------------|----|\n| アイコンとイラスト | L8 |
| 検索・置換パネルUI設計 | L45 |
| ファイルセレクターUI設計 | L219 |

---

## セキュリティ

**関連キーワード**: 認証, 暗号化, CSP, バリデーション, インシデント

### references/security-implementation.md

| セクション | 行 |
|------------|----|\n| 入力バリデーション | L8 |
| API セキュリティ | L361 |
| 依存関係セキュリティ | L412 |
| Electron セキュリティ | L451 |

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
| 無料枠の活用ガイド | L258 |
| CI/CDツール選定 | L291 |
| 学習リソースとコミュニティ | L369 |
| マイグレーション計画 | L395 |
| 関連ドキュメント | L416 |

---

## Claude Code

**関連キーワード**: Skill, Agent, Command, Progressive Disclosure, Task

### references/claude-code-agents.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Agent（エージェント）仕様 | L34 |
| 目的 | L169 |
| 責務 | L173 |
| 背景 | L177 |
| 役割定義 | L181 |
| ワークフロー | L199 |
| {{チーム名}} | L343 |
| 品質基準 | L369 |
| 命名規則 | L387 |

### references/claude-code-commands.md

| セクション | 行 |
|------------|----|\n| 概要 | L8 |
| Command（コマンド）仕様 | L31 |
| 目的 | L155 |
| 背景 | L159 |
| ゴール | L163 |
| エージェント起動フロー | L167 |
| {{カテゴリ名}} | L296 |
| 品質基準 | L321 |
| 命名規則 | L334 |
| ファイル参照形式 | L346 |

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
| Resources | L360 |
| Scripts | L366 |
| skill_list.md 仕様 | L382 |
| {{番号}}. {{エージェント役割名}} | L395 |
| 参照（最小限に維持） | L416 |

### references/claude-code-skills-structure.md

| セクション | 行 |
|------------|----|\n| Skill構造仕様 | L10 |
| SKILL.md 仕様 | L42 |
| agents/ ディレクトリ仕様（Task仕様書） | L125 |
| メタ情報 | L152 |
| プロフィール | L160 |
| 知識ベース | L176 |
| 実行仕様 | L202 |
| インターフェース | L230 |
| scripts/ ディレクトリ仕様（維持） | L277 |
| references/ ディレクトリ仕様（維持＋補強） | L316 |

---

## その他

**関連キーワード**: デプロイ, Railway, 環境変数, Discord, プラグイン

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
| apps/web/ 詳細構造（Next.js） | L231 |
| apps/desktop/ 詳細構造（Electron） | L271 |
| local-agent/ 詳細構造 | L370 |
| .github/workflows/ 詳細構造 | L381 |
| ルートの設定ファイル群 | L391 |
| 機能追加の手順 | L410 |
| 構造の選択理由 | L442 |

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
| リトライ戦略 | L170 |
| サーキットブレーカー（将来対応） | L212 |
| エラーレスポンス形式 | L240 |
| エラーログ出力 | L271 |
| ユーザー向けエラーメッセージ | L308 |
| エラーハンドリングの実装指針 | L331 |
| 関連ドキュメント | L361 |

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

### references/spec-guidelines.md

| セクション | 行 |
|------------|----|\n| 命名規則 | L5 |
| 記述形式 | L34 |
| すべきこと | L54 |
| 避けるべきこと | L63 |
| 新規仕様の追加手順 | L72 |
| ファイルサイズ管理 | L80 |

### references/task-workflow.md

| セクション | 行 |
|------------|----|\n| 概要 | L6 |
| フェーズ構造 | L30 |
| 品質ゲート | L509 |
| コマンド・エージェント・スキル選定ルール | L538 |
| タスク分解ルール | L597 |
| 出力テンプレート | L618 |
| ドキュメント更新ルール | L643 |
| 実行時のコマンド・エージェント・スキル | L664 |
| 関連ドキュメント | L688 |

---

