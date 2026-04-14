# トピックマップ

> 自動生成: 2026-04-14
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
|------------|----|
| システム用語 | L8 |
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
|------------|----|
| 目次 | L8 |
| クイックリファレンス | L81 |
| ドキュメント管理 | L175 |
| UX言語辞書 | L189 |
| 関連リソース | L224 |

### references/overview.md

| セクション | 行 |
|------------|----|
| システムの目的 | L8 |
| 設計の核心概念 | L36 |
| 対象ユーザー | L69 |
| スコープ定義 | L80 |
| アーキテクチャ原則 | L120 |
| 成功基準 | L152 |
| 関連ドキュメント | L173 |

### references/quality-requirements.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 関連ドキュメント | L19 |
| IPC契約ドリフト自動検出（UT-TASK06-007） | L23 |

---

## アーキテクチャ

**関連キーワード**: モノレポ, レイヤー, Clean Architecture, RAG, Knowledge Graph

### references/architecture-auth-security-core.md

| セクション | 行 |
|------------|----|
| セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001） | L6 |
| OAuth ログインフローの state ownership（TASK-FIX-AUTH-IPC-001） | L73 |
| 認証アーキテクチャ（Supabase + Electron） | L93 |
| セキュリティアーキテクチャ | L260 |
| RAGパイプラインアーキテクチャ | L299 |

### references/architecture-auth-security-details.md

| セクション | 行 |
|------------|----|
| 実装時の苦戦した箇所・知見 | L6 |

### references/architecture-auth-security-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 完了タスク | L20 |
| 関連ドキュメント | L142 |

### references/architecture-auth-security.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/architecture-chat-history.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
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
|------------|----|
| データベース設計原則 | L8 |
| workflowsテーブル設計 | L49 |
| ベクトル検索設計（将来拡張） | L99 |

### references/architecture-embedding-pipeline.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 変更履歴 | L8 |
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

### references/architecture-implementation-patterns-advanced.md

| セクション | 行 |
|------------|----|
| デスクトップ（Electron）実装パターン | L6 |
| パフォーマンス最適化パターン | L121 |
| セキュリティ実装パターン | L159 |

### references/architecture-implementation-patterns-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| フロントエンド実装パターン | L12 |
| バックエンド実装パターン | L368 |
| 続き | L457 |

### references/architecture-implementation-patterns-details.md

| セクション | 行 |
|------------|----|
| デスクトップ（Electron）実装パターン | L6 |

### references/architecture-implementation-patterns-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 変更履歴 | L18 |

### references/architecture-implementation-patterns-reference-agent-view-selector-migration.md

| セクション | 行 |
|------------|----|
| AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装） | L6 |

### references/architecture-implementation-patterns-reference-ipc-contract-audits.md

| セクション | 行 |
|------------|----|
| IPC データフロー型ギャップパターン（UT-IPC-DATA-FLOW-TYPE-GAPS-001 2026-02-24実装） | L6 |
| 続き | L261 |

### references/architecture-implementation-patterns-reference-ipc-drift-detection.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| スクリプト | L10 |
| 検出ルール | L14 |
| 実行方法 | L23 |
| 抽出パターン | L31 |
| 既知の制約 | L37 |
| 教訓 | L43 |
| テスト戦略 | L49 |
| 実行サマリー（2026-03-21 実測） | L82 |
| 関連タスク | L93 |

### references/architecture-implementation-patterns-reference-ipc-fallback-validation.md

| セクション | 行 |
|------------|----|
| AgentView Enhancement 実装パターン（TASK-UI-03 2026-03-07実装） | L6 |

### references/architecture-implementation-patterns-reference-ipc-naming.md

| セクション | 行 |
|------------|----|
| IPCチャネル命名監査の運用パターン（UT-IPC-CHANNEL-NAMING-AUDIT-001 2026-02-25実施） | L4 |
| 未タスク監査スコープ分離パターン（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001） | L45 |
| 共有型インポート標準パターン（TASK-10A-D） | L95 |
| IPC レスポンス Wrapper パターン（UT-06-003 2026-03-17実装） | L136 |
| Dynamic Import 型伝播パターン（UT-SC-05-APPLY-IMPROVEMENT-UI 2026-03-24実装） | L217 |
| S-IPC-AUTO: IPC契約ドリフト自動検出パターン（UT-TASK06-007） | L261 |

### references/architecture-implementation-patterns-reference.md

| セクション | 行 |
|------------|----|
| テスト実装パターン | L6 |

### references/architecture-implementation-patterns-shared.md

| セクション | 行 |
|------------|----|
| 共有パッケージ実装パターン | L4 |
| ApprovalGate Enforcement パターン（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001） | L85 |

### references/architecture-implementation-patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L20 |
| 関連ドキュメント | L25 |

### references/architecture-monorepo.md

| セクション | 行 |
|------------|----|
| モノレポアーキテクチャ | L8 |
| 型エクスポートパターン | L214 |
| 完了タスク | L284 |
| 変更履歴 | L316 |

### references/architecture-overview-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 設計思想 | L12 |
| レイヤー構成 | L39 |
| デザインパターン | L69 |
| UI/UXアーキテクチャ | L101 |
| セキュリティアーキテクチャ | L146 |
| 状態管理アーキテクチャ | L180 |
| データフローアーキテクチャ | L217 |
| ディレクトリ構造 | L319 |
| データ構造（型システム） | L383 |

### references/architecture-overview-details.md

| セクション | 行 |
|------------|----|
| 機能追加パターン | L6 |
| 技術スタック | L41 |

### references/architecture-overview-history.md

| セクション | 行 |
|------------|----|
| テンプレート | L6 |
| 関連ドキュメント | L26 |
| 変更履歴 | L67 |

### references/architecture-overview.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/architecture-patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L15 |
| パターン概要 | L28 |
| アーキテクチャ層の関係 | L100 |
| Strangler Fig パターン（Facade standalone 関数 → 責務モジュールへの段階集約） | L135 |
| 変更履歴 | L164 |
| 関連ドキュメント | L175 |

### references/architecture-rag.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| current runtime snapshot（2026-03-21） | L13 |
| ドキュメント構成 | L26 |
| アーキテクチャ概要図 | L38 |
| 主要コンポーネント | L76 |
| テスト品質サマリー | L106 |
| known issues | L120 |
| 変更履歴 | L137 |
| 関連ドキュメント | L150 |

---

## インターフェース

**関連キーワード**: インターフェース, 型定義, IConverter, Repository, Logger

### references/interfaces-agent-sdk-executor-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| SkillService 統合（TASK-FIX-7-1） | L13 |
| SkillExecutor 型定義（TASK-3-1-A） | L99 |
| リトライ機構（TASK-SKILL-RETRY-001） | L390 |
| 関連未タスク | L457 |

### references/interfaces-agent-sdk-executor-details.md

| セクション | 行 |
|------------|----|
| PermissionResolver 型定義（TASK-3-2） | L6 |
| SkillExecutor IPC統合（TASK-3-2） | L160 |
| AllowedToolEntryV2 / SafetyGatePort 参照（TASK-SKILL-LIFECYCLE-06） | L249 |
| 型変更記録（UT-06-005） | L280 |

### references/interfaces-agent-sdk-executor-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 関連ドキュメント | L249 |
| 変更履歴 | L263 |

### references/interfaces-agent-sdk-executor.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/interfaces-agent-sdk-history-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 残課題（未タスク） | L13 |

### references/interfaces-agent-sdk-history-history-doc-links-changelog.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 関連ドキュメント | L100 |
| 変更履歴 | L116 |

### references/interfaces-agent-sdk-history-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/interfaces-agent-sdk-history.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L14 |
| ライフサイクルイベントモデル（TASK-SKILL-LIFECYCLE-07） | L19 |
| 関連ドキュメント | L43 |

### references/interfaces-agent-sdk-integration.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| Claude Code CLI統合 | L16 |
| Session Persistence（セッション永続化） | L119 |
| Skill Import Agent System 型定義（TASK-1-1） | L219 |
| 関連ドキュメント | L373 |
| 変更履歴 | L382 |

### references/interfaces-agent-sdk-skill-advanced.md

| セクション | 行 |
|------------|----|
| SkillSlice型定義（TASK-6-1） | L6 |
| Slide Runtime / Modifier Skill Alignment（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001） | L98 |
| ChatPanel統合（TASK-7D） | L164 |
| SkillFileManager（TASK-9A-A） | L199 |
| テストアーキテクチャ（TASK-8C-A） | L297 |

### references/interfaces-agent-sdk-skill-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| Skill Dashboard 型定義（AGENT-002） | L13 |

### references/interfaces-agent-sdk-skill-details.md

| セクション | 行 |
|------------|----|
| Skill Dashboard 型定義（AGENT-002） | L6 |
| SkillImportStore（TASK-2B） | L413 |

### references/interfaces-agent-sdk-skill-editor.md

| セクション | 行 |
|------------|----|
| SkillEditor UI 型定義（TASK-9A / completed） | L4 |
| スキルチェーン 型定義（TASK-9D） | L54 |
| スキルスケジュール 型定義（TASK-9G） | L89 |
| スキルフォーク 型定義（TASK-9E） | L114 |
| RuntimeSkillCreatorFacade（UT-SC-03-003） | L162 |

### references/interfaces-agent-sdk-skill-history-contract-fix-changelog.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 変更履歴 | L335 |

### references/interfaces-agent-sdk-skill-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 関連ドキュメント | L254 |

### references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md

| セクション | 行 |
|------------|----|
| スキル共有 型定義（TASK-9F） | L6 |
| スキル利用分析 型定義（UT-W3-ANALYTICS-STORE-INTEGRATION-001） | L72 |
| スキル公開・配布 契約参照（TASK-SKILL-LIFECYCLE-08 / spec_created） | L96 |
| スキルデバッグ 型定義（TASK-9H） | L115 |
| スキルドキュメント生成 型定義（TASK-9I） | L165 |
| Skill Docs Runtime Integration 型定義（TASK-IMP-SKILL-DOCS-AI-RUNTIME-001） | L229 |
| スキル分析 型定義（TASK-9J） | L315 |
| assertNoSilentFallback ガード（P62 対策） | L364 |

### references/interfaces-agent-sdk-skill-reference.md

| セクション | 行 |
|------------|----|
| SkillCreatorService（TASK-9B-G） | L6 |
| 続き | L492 |

### references/interfaces-agent-sdk-skill.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L18 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 の読み分け | L23 |
| ライフサイクル履歴型定義（TASK-SKILL-LIFECYCLE-07） | L31 |
| 公開・互換性型定義（TASK-SKILL-LIFECYCLE-08） | L56 |
| IPermissionStoreV2 インターフェース（UT-06-002） | L210 |
| buildPhaseResourceRequestsFromManifest 純粋関数（TASK-P0-07） | L226 |
| 関連ドキュメント | L286 |

### references/interfaces-agent-sdk-ui.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| Agent Execution UI 型定義（AGENT-004） | L16 |
| AgentSDKPage（ポストリリーステスト検証UI） | L345 |
| 関連ドキュメント | L408 |
| 完了タスク | L421 |
| 変更履歴 | L480 |

### references/interfaces-agent-sdk.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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

### references/interfaces-auth-core.md

| セクション | 行 |
|------------|----|
| 認証・プロフィール型定義 | L6 |
| ExecutionCapability 型定義（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001） | L274 |
| HealthPolicy 統一インターフェース（TASK-IMP-HEALTH-POLICY-UNIFICATION-001） | L360 |
| ワークスペース型定義 | L421 |

### references/interfaces-auth-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 変更履歴 | L179 |

### references/interfaces-auth.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L12 |
| 関連ドキュメント | L17 |

### references/interfaces-chat-history-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| データベーススキーマ | L19 |
| ドメインエンティティ型定義 | L66 |
| Repositoryインターフェース | L113 |
| サービスインターフェース | L146 |
| 認可（Authorization） | L173 |
| ビジネスルール | L222 |
| エクスポート形式 | L244 |
| 品質メトリクス | L291 |
| Renderer Process型定義（UI側） | L301 |
| Preload API（conversationAPI） | L355 |

### references/interfaces-chat-history-details.md

| セクション | 行 |
|------------|----|
| React Hooks | L6 |
| UIコンポーネント構成（Atomic Design） | L51 |
| アクセシビリティ対応 | L82 |

### references/interfaces-chat-history-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 残課題 | L62 |
| 関連ドキュメント | L70 |
| 変更履歴 | L80 |

### references/interfaces-chat-history.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/interfaces-converter-extension.md

| セクション | 行 |
|------------|----|
| BaseConverter 継承による実装 | L14 |
| 実装の最小構成 | L46 |
| カスタムメタデータの追加 | L89 |
| エラーハンドリングのベストプラクティス | L124 |
| テストの実装パターン | L160 |
| 関連ドキュメント | L202 |
| 変更履歴 | L210 |

### references/interfaces-converter-implementations.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
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
|------------|----|
| 変更履歴 | L8 |
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
|------------|----|
| IRepository インターフェース | L8 |
| Result型 | L70 |
| Logger インターフェース | L105 |
| IAIClient インターフェース | L140 |
| IFileWatcher インターフェース | L173 |
| 変更履歴 | L205 |

### references/interfaces-llm.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L15 |
| アーキテクチャ概要 | L26 |
| 対応LLMプロバイダー | L62 |
| 主要IPCチャンネル | L85 |
| 主要型定義（v2.4.0 追加分） | L97 |
| 品質メトリクス サマリー | L137 |
| 完了タスク | L149 |
| ChatPanel コンポーネント設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001） | L217 |
| 変更履歴 | L287 |
| 関連ドキュメント | L303 |

### references/interfaces-rag-chunk-embedding.md

| セクション | 行 |
|------------|----|
| 主要型 | L16 |
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
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 概要 | L8 |
| 要件 | L26 |
| 設計 | L51 |
| インターフェース定義 | L106 |
| 型定義 | L131 |
| エラー型 | L178 |
| 使用例 | L198 |
| 実装ガイドライン | L245 |
| 関連ドキュメント | L276 |
| 変更履歴 | L287 |

### references/interfaces-rag-entity-extraction.md

| セクション | 行 |
|------------|----|
| 主要インターフェース | L16 |
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
|------------|----|
| IPCチャンネル | L14 |
| リクエスト/レスポンス型 | L25 |
| セキュリティ機能 | L54 |
| UIコンポーネント | L65 |
| 実装場所 | L84 |
| 関連ドキュメント | L93 |

### references/interfaces-rag-graphrag-query.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 要件 | L26 |
| 設計 | L51 |
| インターフェース定義 | L106 |
| 型定義 | L129 |
| エラー型 | L182 |
| 使用例 | L195 |
| 実装ガイドライン | L238 |
| 関連ドキュメント | L271 |
| 変更履歴 | L282 |

### references/interfaces-rag-knowledge-graph-store.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L19 |
| 検索戦略一覧 | L32 |
| HybridRAGパイプライン | L43 |
| 品質メトリクス サマリー | L71 |
| 変更履歴 | L84 |
| 関連ドキュメント | L100 |

### references/interfaces-rag.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| 概要 | L17 |
| ドキュメント構成 | L21 |
| Branded Types | L34 |
| RAGエラー型 | L57 |
| 共通インターフェース | L78 |
| ファイル・変換ドメイン型 | L146 |
| Knowledge Graph型 | L172 |
| 設計原則 | L188 |
| 関連ドキュメント | L411 |

### references/interfaces-skill-verify-contract.md

| セクション | 行 |
|------------|----|
| 概要 | L5 |
| Layer 命名規則 | L14 |
| Layer 1: 構造検証（Structural Validation） | L45 |
| Layer 2: コンテンツ検証（Content Validation） | L55 |
| Layer 3: 詳細コンテンツ検証（Detailed Content Validation） | L67 |
| Layer 4: 参照整合性・結合検証（Reference Integrity Validation） | L76 |
| verify エンジン責務分離 | L84 |
| Layer 拡張ガイドライン | L100 |

### references/interfaces-system-prompt.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| IWorkflowExecutor インターフェース | L8 |

---

## API設計

**関連キーワード**: REST, エンドポイント, 認証, レート制限, IPC

### references/api-chat-history.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| Use Cases | L17 |
| DTOs | L254 |
| リポジトリインターフェース | L297 |
| エラーハンドリングパターン | L326 |
| 将来の拡張 | L365 |
| 変更履歴 | L379 |
| 関連ドキュメント | L388 |

### references/api-core.md

| セクション | 行 |
|------------|----|
| API 設計方針 | L8 |
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
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L15 |
| REST API エンドポイント一覧 | L25 |
| エンドポイント命名規則 | L81 |
| Desktop IPC API サマリー | L102 |
| 変更履歴 | L133 |
| 関連ドキュメント | L147 |

### references/api-internal-chunk-search.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 検索エンドポイント（将来実装） | L14 |
| 性能目標 | L69 |
| 使用例（データベース層） | L78 |
| 実装ステータス | L104 |
| 変更履歴 | L119 |

### references/api-internal-conversion.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| ConversionService API | L16 |
| HistoryService API | L170 |
| Electron HistoryService API | L340 |

### references/api-internal-embedding.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| 主要インターフェース | L19 |
| エラーコード | L165 |
| 性能指標 | L176 |

### references/api-internal-search.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
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
|------------|----|
| 概要 | L8 |
| API一覧 | L12 |
| 各APIの概要 | L21 |
| 関連ドキュメント | L49 |

### references/api-ipc-agent-advanced.md

| セクション | 行 |
|------------|----|
| スキル分析・統計 IPC チャネル（TASK-9J） | L6 |

### references/api-ipc-agent-core.md

| セクション | 行 |
|------------|----|
| Agent Dashboard IPC チャネル | L6 |
| Workspace Chat Edit IPC チャネル | L74 |
| Skill Creator IPC チャネル | L256 |
| SDK メッセージ出力型統合 | L344 |
| SDK メッセージ出力型統合 | L358 |
| `skill:execute` IPC 契約（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001） | L402 |
| スキルファイル操作 IPC チャネル | L436 |
| スキル安全性評価・ファイルツリー IPC チャネル | L445 |
| スキル公開・配布 IPC 契約（TASK-SKILL-LIFECYCLE-08 / spec_created） | L456 |

### references/api-ipc-agent-details.md

| セクション | 行 |
|------------|----|
| スキル共有 IPC チャネル（TASK-9F） | L6 |
| スキルフォーク IPC チャネル（TASK-9E） | L114 |
| スキルチェーン IPC チャネル（TASK-9D） | L156 |
| スキルスケジュール IPC チャネル（TASK-9G） | L223 |
| スキルデバッグ IPC チャネル（TASK-9H） | L272 |
| スキルドキュメント生成 IPC チャネル（TASK-9I） | L321 |

### references/api-ipc-agent-fileops.md

| セクション | 行 |
|------------|----|
| スキルファイル操作 IPC チャネル（TASK-9A-B） | L6 |

### references/api-ipc-agent-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 実装パターン参照 | L78 |
| 関連ドキュメント | L90 |
| 完了タスク | L102 |
| 変更履歴 | L141 |

### references/api-ipc-agent-safety.md

| セクション | 行 |
|------------|----|
| スキル安全性評価 IPC チャネル（UT-06-003） | L8 |
| スキルファイルツリー取得 IPC チャネル（TASK-UI-05A） | L72 |
| 変更履歴 | L103 |

### references/api-ipc-agent.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 補助参照の境界 | L19 |
| 関連ドキュメント | L24 |

### references/api-ipc-auth.md

| セクション | 行 |
|------------|----|
| 認証 IPC チャネル | L10 |
| プロフィール IPC チャネル | L90 |
| アバター IPC チャネル | L106 |
| Supabase 未設定時の fallback 契約 | L114 |
| イベントチャネル（Main → Renderer） | L134 |
| 型定義 | L161 |
| 認証状態管理 | L219 |
| IPCセキュリティ実装 | L250 |
| セッション自動リフレッシュ（TASK-AUTH-SESSION-REFRESH-001） | L277 |
| 関連ドキュメント | L331 |
| 完了タスク | L341 |
| 変更履歴 | L407 |

### references/api-ipc-sdk-type-contracts.md

| セクション | 行 |
|------------|----|
| SDK メッセージ出力型統合（UT-RT-06 / UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION-001） | L6 |

### references/api-ipc-system-core.md

| セクション | 行 |
|------------|----|
| AI/チャット IPC チャネル | L6 |
| Analytics IPC API（UT-W3-ANALYTICS-ADAPTER-001） | L74 |
| Skill Creator Workflow Interaction Bridge（TASK-SDK-04） | L107 |
| Slide IPC API（スライド同期） | L151 |
| Workspace File Watch IPC API（TASK-UI-04A） | L232 |
| Conversation IPC API（会話履歴永続化） | L276 |
| Electron IPC API設計 | L312 |
| 分割ファイル一覧 | L457 |

### references/api-ipc-system-details.md

| セクション | 行 |
|------------|----|
| エンティティ抽出サービス (NER) | L6 |

### references/api-ipc-system-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 完了タスク | L15 |
| 変更履歴 | L219 |

### references/api-ipc-system-skill-creator-part2.md

| セクション | 行 |
|------------|----|
| ChatPanel IPC チャネル契約（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001） | L4 |
| Advanced Console Safety Governance（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001） | L35 |
| AIプロバイダーAPI連携 | L73 |
| Skill Creator - execute() ファイル永続化統合（TASK-P0-05） | L106 |
| Skill Creator External API Support（TASK-SDK-SC-03） | L153 |
| IPC Handler Lifecycle Management（TASK-FIX-IPC-SKILL-NAME-001 追記: 2026-04-06） | L234 |
| TASK-SC-13-VERIFY-CHANNEL-IMPLEMENTATION（2026-04-08） | L270 |

### references/api-ipc-system-skill-creator.md

| セクション | 行 |
|------------|----|
| Skill Creator Runtime Public IPC（UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001） | L4 |

### references/api-ipc-system.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

---

## データベース

**関連キーワード**: Turso, SQLite, スキーマ, FTS5, Embedded Replicas

### references/database-architecture.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| 採用技術と選定理由 | L17 |
| アーキテクチャ概要 | L26 |
| 設計原則 | L45 |
| 環境別接続設定 | L52 |
| ディレクトリ構成 | L78 |
| 基盤モジュール | L108 |
| 使用例 | L153 |
| 関連ドキュメント | L168 |

### references/database-implementation-core.md

| セクション | 行 |
|------------|----|
| 型安全なクエリ実装 | L6 |
| Embedded Replicas とオフライン対応 | L56 |
| マイグレーション管理 | L102 |
| テスト戦略 | L142 |
| エラーハンドリング | L172 |
| Conversation DB 初期化パターン | L203 |
| ベクトル検索実装（DiskANN） | L238 |

### references/database-implementation-details.md

| セクション | 行 |
|------------|----|
| Knowledge Graphテーブル群（GraphRAG基盤） | L6 |
| パフォーマンス最適化 | L210 |

### references/database-implementation-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |

### references/database-implementation.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/database-operations.md

| セクション | 行 |
|------------|----|
| Turso 無料枠の活用 | L8 |
| セキュリティベストプラクティス | L41 |
| 運用・メンテナンス | L76 |
| Electron ローカルストレージ | L103 |
| 関連ドキュメント | L166 |

### references/database-schema.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 概要 | L8 |
| ドキュメント一覧 | L13 |
| トピック別参照 | L22 |
| 関連ドキュメント | L41 |

### references/ui-ux-agent-execution-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| コンポーネント階層 | L12 |
| コンポーネント仕様 | L43 |
| インタラクション設計 | L324 |
| 視覚デザイン | L353 |
| 改善 CTA バナー（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 / 2026-03-20） | L378 |
| Session Dock 設計仕様（TASK-IMP-SESSION-DOCK-ARTIFACT-BRIDGE-001, 2026-03-24 設計確定） | L400 |
| アクセシビリティ（WCAG 2.1 AA） | L472 |

### references/ui-ux-agent-execution-details.md

| セクション | 行 |
|------------|----|
| ChatPanel統合UIフロー（TASK-7D実装済） | L6 |

### references/ui-ux-agent-execution-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 完了タスク | L24 |
| 関連ドキュメント | L79 |

### references/ui-ux-agent-execution.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-atoms-patterns-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 1. コンポーネント設計パターン | L10 |
| 2. デザイントークン連携パターン | L164 |
| 3. 苦戦箇所と解決策 | L212 |
| 4. アクセシビリティ実装知見 | L346 |

### references/ui-ux-atoms-patterns-details.md

| セクション | 行 |
|------------|----|
| 5. 後方互換性パターン | L6 |
| 6. テスト戦略 | L60 |
| 7. Molecules/Organisms実装への推奨事項 | L129 |

### references/ui-ux-atoms-patterns-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 変更履歴 | L15 |

### references/ui-ux-atoms-patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-components-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| ドキュメント構成 | L13 |
| コンポーネント設計概要 | L23 |
| デザイン原則サマリー | L109 |
| コンポーネント階層図 | L131 |
| TASK-UI-04C 実装完了記録 | L180 |
| TASK-UI-08 実装完了記録 | L202 |
| TASK-UI-07 実装完了記録 | L224 |
| TASK-UI-03 実装完了記録 | L245 |
| TASK-UI-02 実装完了記録 | L268 |
| TASK-UI-05B 実装完了記録 | L293 |
| TASK-10A-B 実装完了記録 | L311 |
| TASK-10A-C 実装完了記録 | L331 |
| TASK-10A-D 実装完了記録 | L350 |

### references/ui-ux-components-details.md

| セクション | 行 |
|------------|----|
| 仕様書作成済みタスク（spec_created） | L6 |

### references/ui-ux-components-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| SkillCenterView 関連未タスク | L43 |
| 変更履歴 | L57 |
| 関連ドキュメント | L118 |

### references/ui-ux-components.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-design-principles-core.md

| セクション | 行 |
|------------|----|
| コンポーネント設計原則 | L6 |
| Apple HIG 準拠（Electron向け） | L74 |
| インタラクション設計 | L129 |
| アクセシビリティ（WCAG 2.1 AA準拠） | L260 |

### references/ui-ux-design-principles-details.md

| セクション | 行 |
|------------|----|
| UXデザイン法則 | L6 |
| 認知負荷の軽減 | L131 |
| Tap & Discover 哲学 | L152 |

### references/ui-ux-design-principles-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 変更履歴 | L16 |

### references/ui-ux-design-principles.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-design-system.md

| セクション | 行 |
|------------|----|
| デザインシステム概要 | L8 |
| Spatial Design Tokens（Knowledge Studio） | L34 |
| カラーシステム | L71 |
| タイポグラフィ | L129 |
| スペーシングとレイアウト | L168 |
| Tap & Discover デザイントークン拡張 | L218 |
| 完了タスク | L263 |
| 変更履歴 | L360 |

### references/ui-ux-feature-components-advanced.md

| セクション | 行 |
|------------|----|
| Custom Execution Environment UI コンポーネント（AGENT-006） | L4 |
| workspace-chat-edit-ui コンポーネント（Issue #468, #494） | L71 |
| ChatPanel Real AI Chat Wiring（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created） | L219 |

### references/ui-ux-feature-components-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| Skill Runtime API Key Panel（TASK-RT-04） | L68 |
| LLM Adapter Error Banner（TASK-RT-01） | L124 |
| VisualCronPicker UI validation（TASK-UI-SCHEDULE-CRON-UI-VALIDATION-001） | L163 |
| Community Visualization UI コンポーネント（CONV-08-05） | L193 |
| 続き | L302 |

### references/ui-ux-feature-components-details.md

| セクション | 行 |
|------------|----|
| Workspace Layout Foundation（TASK-UI-04A-WORKSPACE-LAYOUT） | L6 |
| Workspace Chat Panel（TASK-UI-04B-WORKSPACE-CHAT） | L76 |
| Slide Workspace Runtime Alignment（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001） | L187 |
| Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW） | L258 |
| 続き | L332 |

### references/ui-ux-feature-components-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 関連ドキュメント | L222 |
| 変更履歴 | L261 |

### references/ui-ux-feature-components-reference-organisms-history-surfaces.md

| セクション | 行 |
|------------|----|
| Organisms Foundation（TASK-UI-00-ORGANISMS / completed） | L6 |
| Foundation Reflection Audit（TASK-UI-00-FOUNDATION-REFLECTION-AUDIT / completed） | L62 |
| Notification / History Domain（TASK-UI-01-C / completed） | L93 |
| History Timeline Refresh（TASK-UI-06-HISTORY-SEARCH-VIEW / completed） | L152 |
| 仕様書作成済みタスク（spec_created） | L239 |
| 仕様書作成済みタスク（spec_created） | L269 |

### references/ui-ux-feature-components-reference.md

| セクション | 行 |
|------------|----|
| SkillCenterView UI（TASK-UI-05 / 完了） | L8 |
| Skill Advanced Views UI（TASK-UI-05B / completed） | L225 |
| 続き | L304 |

### references/ui-ux-feature-components-skill-analysis.md

| セクション | 行 |
|------------|----|
| SkillAnalysisView UI（TASK-10A-B / completed） | L4 |
| SkillCreateWizard UI（TASK-10A-C / completed） | L105 |
| Store駆動ライフサイクルUI統合（TASK-10A-F / completed） | L219 |
| Verify / Improve Result Panel UI（TASK-RT-03 / phase-11） | L248 |
| SkillAnalysisView UI（TASK-10A-B / completed） | L5 |
| SkillCreateWizard UI（TASK-10A-C / completed） | L106 |
| ConversationRoundStep 主ツールバッジ（UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 / completed） | L259 |
| Store駆動ライフサイクルUI統合（TASK-10A-F / completed） | L308 |
| Verify / Improve Result Panel UI（TASK-RT-03 / phase-11） | L337 |
| SkillAnalysisView UI（TASK-10A-B / completed） | L5 |
| SkillCreateWizard UI（TASK-10A-C / completed） | L106 |
| ConversationRoundStep 主ツールバッジ（UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 / completed） | L252 |
| Store駆動ライフサイクルUI統合（TASK-10A-F / completed） | L301 |
| Verify / Improve Result Panel UI（TASK-RT-03 / phase-11） | L330 |
| UI整合性修正（TASK-SW-FIX-UI-001 / completed） | L266 |
| ConversationRoundStep 主ツールバッジ（UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 / completed） | L281 |
| Store駆動ライフサイクルUI統合（TASK-10A-F / completed） | L330 |
| Verify / Improve Result Panel UI（TASK-RT-03 / phase-11） | L359 |

### references/ui-ux-feature-components-theme-chat.md

| セクション | 行 |
|------------|----|
| Light Theme Contrast Regression Guard（TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001） | L4 |
| ChatPanel 実チャット配線設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001） | L54 |
| SkillStreamDisplay コンポーネント（TASK-3-2） | L118 |
| i18n対応（TASK-3-2-B） | L169 |
| 完了タスク | L218 |

### references/ui-ux-feature-components.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L17 |
| 関連ドキュメント | L22 |

### references/ui-ux-feature-skill-stream.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
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
|------------|----|
| 概要 | L10 |
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
|------------|----|
| フォーム設計 | L8 |
| 認証UI設計 | L84 |
| APIキー設定UI設計 | L302 |
| 変更履歴 | L387 |

### references/ui-ux-history-panel.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| ドキュメント構成 | L16 |
| コンポーネント一覧 | L27 |
| カスタムフック一覧 | L38 |
| IPCチャンネル | L49 |
| テスト品質サマリー | L60 |
| 統合ステータス | L74 |
| 変更履歴 | L91 |
| 履歴UIファミリー参照導線（TASK-SKILL-LIFECYCLE-07） | L108 |
| 関連ドキュメント | L132 |

### references/ui-ux-llm-selector.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| UI構成 | L29 |
| 共有インラインセレクター | L40 |
| プロバイダーとモデル一覧 | L57 |
| 状態管理 | L71 |
| UXフロー | L100 |
| スタイルガイドライン | L120 |
| アクセシビリティ | L147 |
| エラーハンドリング | L157 |
| テストカバレッジ | L165 |
| 実行経路との統合 | L190 |
| 関連タスクドキュメント | L201 |
| 関連ドキュメント | L216 |

### references/ui-ux-navigation-chat-patterns.md

| セクション | 行 |
|------------|----|
| ChatViewナビゲーション | L4 |
| ナビゲーションボタン仕様 | L34 |
| ボタンスタイルガイドライン（アイコンのみボタン） | L50 |
| テスト検証済み項目 | L64 |
| アクセシビリティ対応事例 | L79 |
| ナビゲーションパターンのベストプラクティス | L111 |
| 関連ドキュメント | L123 |
| Onboarding overlay / rerun 契約（TASK-UI-09-ONBOARDING-WIZARD） | L132 |

### references/ui-ux-navigation.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 変更履歴 | L13 |
| Global Navigation | L47 |
| 続き | L376 |

### references/ui-ux-panels.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L12 |
| アイコンとイラスト | L21 |
| パネル共通ガイドライン | L58 |
| ChatPanel 実AIチャット配線設計（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001） | L80 |
| ChatPanel統合パターン（TASK-7D） | L124 |
| ChatPanel Review Harness（TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001） | L162 |
| 関連ドキュメント | L192 |

### references/ui-ux-portal-patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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

### references/ui-ux-search-panel-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| キーボードショートカット | L18 |
| タブバー設計 | L33 |
| ファイル内検索パネル（FileSearchPanel） | L58 |
| ワークスペース検索パネル（WorkspaceSearchPanel） | L96 |
| ファイル名検索パネル（FileNameSearchPanel） | L126 |
| ハイライト表示 | L168 |
| アクセシビリティ対応 | L180 |
| エラー状態 | L194 |
| パフォーマンス考慮事項 | L205 |
| 実装アーキテクチャ | L217 |

### references/ui-ux-search-panel-details.md

| セクション | 行 |
|------------|----|
| 実装詳細（TASK-SEARCH-INTEGRATE-001） | L6 |
| 未タスク（将来の改善候補） | L104 |

### references/ui-ux-search-panel-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 完了タスク | L15 |
| 変更履歴 | L52 |

### references/ui-ux-search-panel.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-settings-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 設定画面アーキテクチャ | L13 |
| スライド出力ディレクトリ設定 | L34 |
| 設定永続化 | L99 |
| IPC API仕様 | L120 |
| セキュリティ要件 | L146 |
| テスト要件 | L161 |
| ツール許可設定（Permission Settings） | L184 |
| 権限要求履歴パネル（Permission History Panel） | L250 |
| Settings 画面の AuthGuard 非依存アクセス（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001） | L323 |
| Mainline Access Matrix（TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001） | L366 |
| AuthKeySection 表示契約（TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001） | L404 |

### references/ui-ux-settings-details.md

| セクション | 行 |
|------------|----|
| ApiKeysSection 異常系表示仕様（2026-03-07追加） | L6 |
| 実装ファイル | L68 |
| バージョン履歴 | L93 |

### references/ui-ux-settings-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |

### references/ui-ux-settings.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/ui-ux-system-prompt.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L17 |
| セキュリティ原則 | L28 |
| テスト品質サマリー | L51 |
| 完了タスク | L65 |
| 完了タスク | L80 |
| 完了タスク（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001） | L91 |
| 変更履歴 | L105 |
| 関連ドキュメント | L123 |

### references/security-api.md

| セクション | 行 |
|------------|----|
| 認証・認可フロー | L10 |
| レート制限 | L29 |
| CORS設定 | L46 |
| 依存関係セキュリティ | L55 |
| 関連ドキュメント | L80 |

### references/security-electron-ipc-advanced.md

| セクション | 行 |
|------------|----|
| 実装例: skillDebugAPI（TASK-9H） | L6 |
| 実装例: skillDocsAPI（TASK-9I） | L61 |
| 実装例: skillAnalyticsAPI（TASK-9J） | L128 |
| 実装例: `skill:execute` 認証 preflight ガード（TASK-FIX-SKILL-AUTH-PREFLIGHT-GUARD-001） | L161 |
| 自動更新のセキュリティ | L192 |
| safeInvoke / invokeWithTimeout チャンネル別 timeout + cleanup 契約（TASK-FIX-IPC-TIMEOUT-001） | L203 |

### references/security-electron-ipc-core.md

| セクション | 行 |
|------------|----|
| セキュリティ設定 | L6 |
| Content Security Policy (CSP) | L20 |
| IPC通信のセキュリティ | L37 |
| 続き | L346 |

### references/security-electron-ipc-details.md

| セクション | 行 |
|------------|----|
| 実装例: skillCreatorAPI | L6 |
| 実装例: skillFileAPI（TASK-9A-B） | L188 |
| 実装例: skillShareAPI（TASK-9F） | L262 |
| 実装例: skillChainAPI（TASK-9D） | L341 |
| 実装例: skillScheduleAPI（TASK-9G） | L381 |

### references/security-electron-ipc-examples.md

| セクション | 行 |
|------------|----|
| 実装例: historyAPI | L4 |
| 実装例: notificationAPI（TASK-UI-08） | L56 |
| 実装例: slideSettingsAPI | L89 |
| IPC Layer Integrity Fix（TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001、2026-03-19完了） | L138 |
| ApprovalGate セキュリティ契約（TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001） | L153 |
| Skill Creator External API Credential 秘匿化（TASK-SDK-SC-03） | L208 |

### references/security-electron-ipc-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 関連ドキュメント | L53 |
| 完了タスク | L62 |

### references/security-electron-ipc.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 関連ドキュメント | L19 |
| IPC契約ドリフト防止（UT-TASK06-007） | L23 |

### references/security-implementation.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L14 |
| セキュリティ原則 | L24 |
| PKCE / State parameter 実装記録 | L47 |
| 実装時の苦戦した箇所・知見 | L94 |
| Tool Risk Configuration（UT-06-001: 2026-03-16 実装完了） | L139 |
| 関連ドキュメント | L175 |

### references/security-input-validation.md

| セクション | 行 |
|------------|----|
| バリデーション原則 | L10 |
| 入力タイプ別バリデーション | L22 |
| SQLインジェクション対策 | L37 |
| XSS対策 | L54 |
| Zodスキーマによるバリデーション | L70 |
| ファイル変換のセキュリティ | L84 |
| 関連ドキュメント | L132 |

### references/security-operations.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| ログ・監査 | L18 |
| ファイル選択セキュリティ | L57 |
| インシデント対応 | L124 |
| セキュリティチェックリスト | L170 |
| 関連ドキュメント | L216 |

### references/security-principles.md

| セクション | 行 |
|------------|----|
| セキュリティ設計原則 | L8 |
| 認証・認可 | L45 |
| データ保護 | L227 |
| 変更履歴 | L408 |

### references/security-skill-execution-permission.md

| セクション | 行 |
|------------|----|
| Permission Store（権限永続化） | L4 |
| Permission Store V2（UT-06-002） | L88 |
| Permission フォールバック セキュリティ（UT-06-005） | L161 |
| 公開判定セキュリティ（TASK-SKILL-LIFECYCLE-08 / spec_created） | L196 |
| 関連ドキュメント | L239 |
| ToolRiskLevel 参照（TASK-SKILL-LIFECYCLE-06） | L249 |
| 変更履歴 | L262 |

### references/security-skill-execution.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| エクスポート一覧 | L20 |
| DANGEROUS_PATTERNS | L35 |
| ALLOWED_TOOLS_WHITELIST | L92 |
| API リファレンス | L137 |
| 使用例 | L214 |
| Skill Lifecycle 実行境界（TASK-SKILL-LIFECYCLE-03） | L245 |
| テストカバレッジ | L264 |
| 続き | L284 |

### references/security-skill-ipc-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| スキル管理IPCセキュリティ | L12 |
| スキルインポートIPCチャネル（TASK-4-1） | L96 |
| Claude Code CLI連携セキュリティ | L141 |
| Skill Execution Preload API セキュリティ | L202 |
| Permission IPC Handler セキュリティ | L247 |
| SkillAPI Preload実装（TASK-5-1） | L283 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 完了記録（2026-03-19） | L361 |

### references/security-skill-ipc-history.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| 残課題 | L120 |
| 関連ドキュメント | L135 |
| 変更履歴 | L147 |

### references/security-skill-ipc.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L12 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 の読み分け | L17 |
| 関連ドキュメント | L23 |

---

## 技術スタック

**関連キーワード**: Next.js, Electron, TypeScript, Drizzle, pnpm

### references/technology-backend.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| バックエンド・データベース | L45 |
| AI統合 | L198 |
| 開発ツール | L404 |
| 完了タスク | L445 |
| 関連ドキュメント | L477 |
| 変更履歴 | L487 |

### references/technology-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| コアランタイム | L54 |
| フロントエンド | L115 |
| 変更履歴 | L242 |

### references/technology-desktop.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| Electron | L14 |
| ビルド・パッケージング | L44 |
| Main Process技術 | L72 |
| Renderer Process技術 | L118 |
| IPC通信 | L144 |
| macOS固有 | L165 |
| セキュリティ | L189 |
| 自動更新 | L214 |
| 開発ツール | L234 |
| ディレクトリ構造 | L254 |
| 関連ドキュメント | L274 |
| 関連未タスク | L286 |
| 変更履歴 | L294 |

### references/technology-devops-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| パッケージ構成詳細 | L54 |
| 依存関係管理戦略 | L176 |
| 無料枠の活用ガイド | L269 |
| CI/CDツール選定 | L301 |
| 学習リソースとコミュニティ | L388 |

### references/technology-devops-details.md

| セクション | 行 |
|------------|----|
| マイグレーション計画 | L6 |
| CI最適化パターン（TASK-OPT-CI-TEST-PARALLEL-001 2026-02-02追加） | L27 |

### references/technology-devops-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 完了タスク | L16 |
| 変更履歴 | L31 |

### references/technology-devops.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |
| IPC契約ドリフト品質ゲート（UT-TASK06-007） | L22 |

### references/technology-frontend.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| ファイル配置 | L10 |
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
|------------|----|
| ワークフローセクションの記述形式（各Phase共通） | L10 |
| ペルソナ設計 | L47 |
| ツール権限設定 | L62 |
| エージェント間協調 | L75 |
| Skill Lifecycle 向け internal orchestration（TASK-SKILL-LIFECYCLE-03） | L86 |
| ハンドオフプロトコル | L104 |
| agent_list.md 仕様 | L117 |
| エラーハンドリング | L155 |
| 状態管理 | L176 |
| 品質基準 | L200 |
| 関連ドキュメント | L218 |
| 変更履歴 | L226 |

### references/claude-code-agents.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| ドキュメント構成 | L14 |
| Agent 層の役割 | L23 |
| 責務境界 | L34 |
| 関連エージェント | L47 |
| 関連スキル | L55 |
| 関連ドキュメント | L66 |

### references/claude-code-commands.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| Command（コマンド）仕様 | L31 |
| 品質基準 | L288 |
| 命名規則 | L301 |
| ファイル参照形式 | L313 |
| 参照 | L341 |
| 変更履歴 | L359 |

### references/claude-code-overview.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
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
|------------|----|
| 変更履歴 | L6 |
| 目的 | L17 |
| agents/ の位置づけ（誤解防止） | L24 |
| agents/*.md 標準フォーマット（必須テンプレ） | L33 |
| agents/*.md テンプレ（Markdown見出しで構造化） | L50 |
| 関連ドキュメント | L168 |

### references/claude-code-skills-overview.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| コア原則 | L43 |
| プロジェクト登録スキル一覧 | L108 |

### references/claude-code-skills-process.md

| セクション | 行 |
|------------|----|
| スキル作成・更新プロセス | L10 |
| フィードバックループ | L245 |
| 品質基準 | L293 |
| 命名規則 | L339 |
| ファイル参照形式 | L360 |
| skill_list.md 仕様 | L391 |
| 参照（最小限に維持） | L423 |
| 変更履歴 | L431 |
| large skill docs update flow | L439 |

### references/claude-code-skills-resources.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| scripts/ ディレクトリ仕様 | L18 |
| references/ ディレクトリ仕様 | L55 |
| Progressive Disclosure パターン | L85 |
| assets/ ディレクトリ仕様 | L143 |
| ワークフローパターン | L164 |
| 出力パターン | L196 |
| 関連ドキュメント | L248 |

### references/claude-code-skills-structure.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| 概要 | L20 |
| ドキュメント構成 | L26 |
| Skill構造仕様 | L35 |
| SKILL.md 仕様 | L73 |
| 関連ドキュメント | L158 |

---

## ワークフロー

**関連キーワード**: タスク分解, Git Worktree, PR, CI/CD

### references/workflow-ai-chat-llm-integration-fix-artifact-inventory.md

| セクション | 行 |
|------------|----|
| 対象 wave | L3 |
| current canonical set | L15 |
| workflow-local artifacts | L31 |
| follow-up 未タスク | L116 |
| 同一 wave で更新した canonical docs | L129 |
| legacy path / filename compatibility | L140 |
| validation chain | L150 |
| 運用メモ | L173 |

### references/workflow-ai-chat-llm-integration-fix.md

| セクション | 行 |
|------------|----|
| 対象 | L3 |
| 現行実装アンカー | L12 |
| current canonical set | L26 |
| 実装・監査ステータス | L39 |
| artifact inventory / parent docs / legacy | L87 |
| タスク別の最小読書セット | L97 |
| 読む順番 | L139 |
| 検索キーワード | L148 |
| 注意点 | L161 |

### references/workflow-ai-runtime-authmode-unification.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 今回の確定事項（2026-03-13） | L19 |
| Step-03 Task06 再監査追補（2026-03-17） | L29 |
| Step-04 Task09 再監査追補（2026-03-19） | L37 |
| 再監査追補（2026-03-14） | L79 |
| current canonical set（2026-03-14 wave） | L93 |
| artifact inventory（Step-01 + system spec sync） | L109 |
| parent docs と依存関係 | L140 |
| 旧 filename 互換管理 | L153 |
| 設定画面レビューの必須改善対象 | L160 |
| 後続タスクへの伝搬先 | L178 |
| SubAgent 編成（関心ごと分離） | L207 |
| 同種課題の5分解決カード | L219 |
| 最適なファイル形成 | L229 |
| 関連ドキュメント | L241 |
| 変更履歴 | L253 |

### references/workflow-ai-runtime-execution-responsibility-realignment.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| current canonical set | L12 |
| extraction matrix | L25 |
| 実装同期ルール | L40 |
| 実装ステータススナップショット（2026-03-27） | L49 |
| Follow-up Backlog | L65 |

### references/workflow-aiworkflow-requirements-line-budget-reform-artifact-inventory.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 集計 | L23 |
| 更新した canonical control / index files | L35 |
| 更新した既存 reference files | L44 |
| 新規 canonical reference files | L84 |
| completed workflow files | L135 |
| 再生成・監査コマンド | L154 |
| 使い方 | L164 |
| 変更履歴 | L172 |

### references/workflow-aiworkflow-requirements-line-budget-reform.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 仕様書別 SubAgent 編成 | L20 |
| 今回実装した内容（2026-03-12 / 2026-03-13） | L33 |
| 苦戦箇所と再発防止 | L72 |
| 同種課題の 5 分解決カード | L85 |
| 最適なファイル形成 | L97 |
| 検証コマンド | L116 |
| 関連改善タスク | L129 |
| 関連ドキュメント | L140 |
| 変更履歴 | L153 |

### references/workflow-apikey-chat-tool-integration-alignment.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| フェーズ構造 | L17 |
| 今回実装内容（2026-03-11） | L49 |
| 苦戦箇所と再発防止 | L62 |
| 同種課題の5分解決カード | L72 |
| 最適なファイル形成（責務マトリクス） | L82 |
| 検証コマンド（最小セット） | L97 |
| 関連改善タスク | L109 |
| 関連ドキュメント | L117 |
| 変更履歴 | L131 |

### references/workflow-light-theme-contrast-regression-guard.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 仕様書別 SubAgent 編成 | L20 |
| 今回実装した内容（2026-03-12） | L33 |
| 苦戦箇所と再発防止 | L56 |
| 同種課題の 5 分解決カード | L68 |
| 最適なファイル形成 | L78 |
| 検証コマンド | L92 |
| 関連改善タスク | L105 |
| 関連ドキュメント | L114 |
| 変更履歴 | L126 |

### references/workflow-light-theme-global-remediation.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| フェーズ構造 | L17 |
| 今回実装内容（2026-03-11） | L49 |
| shared color migration 仕様作成追補（2026-03-12） | L62 |
| 苦戦箇所と再発防止 | L84 |
| 同種課題の5分解決カード | L95 |
| 最適なファイル形成（責務マトリクス） | L105 |
| 検証コマンド（最小セット） | L116 |
| 関連改善タスク | L132 |
| 関連ドキュメント | L142 |
| 変更履歴 | L152 |

### references/workflow-onboarding-wizard-alignment.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 仕様書別 SubAgent 編成 | L20 |
| 今回実装した内容（2026-03-13） | L34 |
| 苦戦箇所と再発防止 | L47 |
| 同種課題の 5 分解決カード | L60 |
| 最適なファイル形成 | L70 |
| 検証コマンド（最小セット） | L86 |
| 関連改善タスク | L102 |
| 関連ドキュメント | L112 |
| 変更履歴 | L126 |

### references/workflow-permission-fallback-abort-skip-retry.md

| セクション | 行 |
|------------|----|
| メタ情報 | L8 |
| current canonical set | L19 |
| artifact inventory | L31 |
| 実装内容（要点） | L46 |
| 苦戦箇所（再利用形式） | L87 |
| 同種課題の5分解決カード | L115 |
| 検出した未タスク（更新: 2026-03-17） | L127 |
| 関連ドキュメント | L137 |
| 変更履歴 | L148 |

### references/workflow-skill-identifier-branded-type-resolution.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| フェーズ構造 | L17 |
| Phase詳細 | L46 |
| 苦戦箇所由来のリスクと先回り対策 | L167 |
| 監視・ログ | L177 |
| 関連ドキュメント | L197 |
| 変更履歴 | L208 |

### references/workflow-skill-lifecycle-created-skill-usage-journey.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 必要仕様の抽出セット | L23 |
| 抽出確認コマンド | L37 |
| Task04 依存契約 | L51 |
| Task07 依存契約（TASK-SKILL-LIFECYCLE-07） | L62 |
| Task08 接続契約（TASK-SKILL-LIFECYCLE-08 / spec_created） | L77 |
| 現行 workflow 仕様書 | L133 |
| 実装内容（TASK-SKILL-LIFECYCLE-05） | L145 |
| 苦戦箇所 | L173 |
| Current Canonical Set | L213 |
| Artifact Inventory | L233 |
| 実装コードアンカー | L255 |
| same-wave 検証手順 | L267 |
| Agent -> SkillAnalysis handoff 実装完了記録（TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 / 2026-03-20） | L284 |
| 5分解決カード | L296 |

### references/workflow-skill-lifecycle-evaluation-scoring-gate.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| classification-first 分割判断 | L18 |
| 今回の実装内容（2026-03-14） | L29 |
| 苦戦箇所（再利用形式） | L42 |
| current canonical set（2026-03-14 wave） | L53 |
| artifact inventory（implementation + doc sync） | L69 |
| parent docs と依存関係 | L86 |
| 旧 filename 互換管理 | L99 |
| 仕様書別 SubAgent 分担（関心分離） | L111 |
| 検証コマンド | L123 |
| 同種課題の5分解決カード | L136 |
| 関連ドキュメント | L146 |
| Task04→Task07 評価イベント連携（TASK-SKILL-LIFECYCLE-07） | L159 |
| 変更履歴 | L174 |

### references/workflow-skill-lifecycle-routing-render-view-foundation.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 実装内容（2026-03-17） | L17 |
| Phase 11 証跡（画面） | L29 |
| 苦戦箇所（再利用形式） | L45 |
| artifact inventory | L67 |
| current canonical set（2026-03-17 wave） | L83 |
| 検証コマンド | L100 |
| 同種課題の5分解決カード | L111 |
| TASK-SKILL-LIFECYCLE-02: SkillCenterView CTA ルーティング（2026-03-18） | L123 |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001: SkillDetailPanel 二次 handoff（2026-03-19） | L155 |
| TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001: AgentView <-> SkillAnalysis round-trip（2026-03-20） | L180 |
| 変更履歴 | L224 |

### references/workflow-task-rt-06-artifact-inventory.md

| セクション | 行 |
|------------|----|
| メタ情報 | L3 |
| Current Canonical Set | L12 |
| Follow-up 未タスク | L25 |
| Validation Chain | L31 |

### references/workflow-ui-ux-visual-baseline-drift.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 仕様書別 SubAgent 編成 | L20 |
| 今回実装した内容 | L32 |
| 苦戦箇所と再発防止 | L53 |
| 同種課題の 5 分解決カード | L63 |
| 最適なファイル形成 | L73 |
| 検証コマンド | L87 |
| 関連改善タスク | L99 |
| 関連ドキュメント | L107 |
| 変更履歴 | L119 |

### references/workflow-workspace-parent-reference-sweep-guard.md

| セクション | 行 |
|------------|----|
| 概要 | L8 |
| 仕様書別 SubAgent 編成 | L19 |
| 今回実装・更新した内容（2026-03-12） | L31 |
| 苦戦箇所と標準ルール | L55 |
| 同種課題の5分解決カード | L67 |
| 最適なファイル形成 | L77 |
| 検証コマンド | L89 |
| 関連ドキュメント | L103 |
| 変更履歴 | L117 |

### references/workflow-workspace-preview-search-resilience-guard.md

| セクション | 行 |
|------------|----|
| 概要 | L9 |
| 仕様書別 SubAgent 編成 | L20 |
| 今回実装・更新した内容（2026-03-13） | L32 |
| 苦戦箇所と標準ルール | L60 |
| 同種課題の 5 分解決カード | L74 |
| 最適なファイル形成 | L84 |
| 検証コマンド | L101 |
| 関連未タスク | L119 |
| 関連ドキュメント | L127 |
| 変更履歴 | L143 |

---

## その他

**関連キーワード**: デプロイ, Railway, 環境変数, Discord, プラグイン

### references/arch-claude-cli.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| Claude Code CLI連携（Desktop Main Process） | L19 |
| Claude CLI Renderer API（Preload API） | L124 |
| 関連ドキュメント | L317 |

### references/arch-electron-services-advanced.md

| セクション | 行 |
|------------|----|
| スキル管理サービス | L6 |

### references/arch-electron-services-core.md

| セクション | 行 |
|------------|----|
| Environment Backend サービス | L6 |
| スキル公開・配布サービス境界（TASK-SKILL-LIFECYCLE-08 / spec_created） | L73 |

### references/arch-electron-services-details-part1.md

| セクション | 行 |
|------------|----|
| スキル管理サービス | L8 |

### references/arch-electron-services-details-part2.md

| セクション | 行 |
|------------|----|
| SkillForker（TASK-9E） | L8 |
| RuntimeResolver（runtime routing 共通化 — UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001） | L27 |
| RuntimePolicyResolver（TASK-SC-02-RUNTIME-POLICY-CLOSURE） | L100 |
| Slide RuntimeResolver 採用計画（TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001） | L217 |
| SkillScheduler / ScheduleStore（TASK-9G） | L276 |
| DefaultSafetyGate サービス（UT-06-003） | L305 |
| SkillService と SkillExecutor の統合（TASK-FIX-7-1） | L356 |
| Runtime routing / handoff DI 統合（UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001） | L381 |
| キャッシュ機構 | L409 |
| 永続化 | L415 |
| SkillImportManager 永続化実装詳細（TASK-FIX-4-2） | L421 |

### references/arch-electron-services-details.md

| セクション | 行 |
|------------|----|
| 分割先ファイル | L8 |
| 目次（クイックリファレンス） | L15 |

### references/arch-electron-services-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 関連ドキュメント | L23 |

### references/arch-electron-services.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 関連ドキュメント | L19 |

### references/arch-execution-capability-contract.md

| セクション | 行 |
|------------|----|
| AccessCapability の shared パッケージ移動（TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 / Task01） | L7 |
| HealthPolicy 統合（TASK-IMP-HEALTH-POLICY-UNIFICATION-001） | L66 |

### references/arch-feature-addition.md

| セクション | 行 |
|------------|----|
| 新機能追加の手順 | L10 |
| 機能構成のベストプラクティス | L47 |
| この構造の利点 | L67 |
| 関連ドキュメント | L79 |

### references/arch-ipc-persistence.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| IPC Handler Registration Pattern（Desktop Main Process） | L18 |
| 会話履歴永続化パターン（Desktop Main Process） | L96 |
| 関連ドキュメント | L235 |

### references/arch-state-management-advanced.md

| セクション | 行 |
|------------|----|
| P31対策: Store Hooks無限ループ防止パターン | L6 |

### references/arch-state-management-core.md

| セクション | 行 |
|------------|----|
| UI Design Foundation 状態管理方針（TASK-UI-00-DESIGN-FOUNDATION） | L6 |
| Store Slice Baseline（TASK-UI-01-A-STORE-SLICE-BASELINE） | L29 |
| ChatPanel 実AIチャット配線 初期設計（廃止 → 最終設計は後述セクション参照） | L87 |
| Workspace Layout 基盤（TASK-UI-04A-WORKSPACE-LAYOUT） | L97 |
| Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW） | L130 |
| Workspace Chat Panel 統合（TASK-UI-04B-WORKSPACE-CHAT） | L160 |
| Notification/HistorySearch 実装同期（TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN） | L195 |
| HistorySearch timeline 再設計（TASK-UI-06-HISTORY-SEARCH-VIEW） | L240 |
| ViewType/ナビ導線 実装同期（TASK-UI-01-D-VIEWTYPE-ROUTING-NAV） | L287 |
| 続き | L356 |

### references/arch-state-management-details.md

| セクション | 行 |
|------------|----|
| Zustand Sliceパターン | L6 |

### references/arch-state-management-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 関連ドキュメント | L78 |

### references/arch-state-management-reference-permissions-import-lifecycle.md

| セクション | 行 |
|------------|----|
| permissionHistorySlice（権限要求履歴管理） | L6 |
| Skill Advanced Views 状態管理設計（TASK-UI-05B / completed） | L135 |
| Skill Import / SkillCenter 防御状態管理（2026-03-04） | L180 |
| TASK-10A-E-C: Store駆動ライフサイクル統合（2026-03-06） | L229 |
| TASK-10A-F: Store駆動ライフサイクルUI統合（selector migration / renderer direct IPC removal, 2026-03-07） | L267 |
| permissionHistorySlice 拡張仕様（TASK-SKILL-LIFECYCLE-06） | L337 |

### references/arch-state-management-reference-persist-hardening-test-quality.md

| セクション | 行 |
|------------|----|
| LLM Selection Persist Validation（TASK-FIX-LLM-CONFIG-PERSISTENCE） | L6 |
| Persist Iterable Hardening（TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001） | L29 |
| TASK-043D: テスト品質ゲート設計（2026-03-08） | L86 |

### references/arch-state-management-reference-selectors.md

| セクション | 行 |
|------------|----|
| Notification/HistorySearch 実装同期（TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN） | L7 |
| HistorySearch timeline 再設計（TASK-UI-06-HISTORY-SEARCH-VIEW） | L52 |
| ViewType/ナビ導線 実装同期（TASK-UI-01-D-VIEWTYPE-ROUTING-NAV） | L99 |
| LLMConfigProvider 状態管理変更（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001） | L163 |
| ChatPanel Real AI Chat 配線 状態管理拡張（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created） | L202 |
| 公開・配布状態管理設計（TASK-SKILL-LIFECYCLE-08 / spec_created） | L298 |

### references/arch-state-management-reference.md

| セクション | 行 |
|------------|----|
| P31対策: Store Hooks無限ループ防止パターン | L6 |
| chatEditSlice（Workspace Chat Edit状態管理） | L94 |
| skillSlice（統合済み - TASK-FIX-6-1-STATE-CENTRALIZATION） | L184 |

### references/arch-state-management-skill-creator.md

| セクション | 行 |
|------------|----|
| LLMConfigProvider 状態管理変更（TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001） | L5 |
| ChatPanel Real AI Chat 配線 状態管理拡張（TASK-IMP-CHATPANEL-REAL-AI-CHAT-001 / spec_created） | L46 |
| 公開・配布状態管理設計（TASK-SKILL-LIFECYCLE-08 / spec_created） | L149 |
| SkillExecutionStatus 拡張状態の配置ルール（UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001） | L175 |
| Slide Modifier / Manual Fallback 状態管理設計（TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 / spec_created） | L202 |
| SkillCreateWizard 生成状態配置ルール（TASK-SW-FIX-MODE-MGMT-001 current facts） | L277 |
| Workflow Snapshot State 配置ルール（TASK-SDK-04） | L353 |

### references/arch-state-management.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L18 |
| lifecycleHistorySlice / feedbackSlice（TASK-SKILL-LIFECYCLE-07） | L23 |
| LLM 選択状態の永続化（TASK-FIX-LLM-CONFIG-PERSISTENCE） | L51 |
| 関連ドキュメント | L81 |

### references/arch-ui-components-advanced.md

| セクション | 行 |
|------------|----|
| SkillManagementPanel アーキテクチャパターン（TASK-10A-A / completed） | L6 |
| SkillManagementPanel ビュー統合アーキテクチャパターン（TASK-10A-D / completed） | L72 |
| SkillManagementPanel Import List アーキテクチャパターン（TASK-043B / completed） | L174 |
| TASK-UI-00-ORGANISMS アーキテクチャ記録 | L209 |
| AgentView Enhancement アーキテクチャパターン（TASK-UI-03 / completed） | L255 |

### references/arch-ui-components-core.md

| セクション | 行 |
|------------|----|
| Monaco Diff Editor統合パターン | L6 |
| SkillCreateWizard コンポーネント構成（TASK-SW-FIX-MODE-MGMT-001 current facts） | L210 |

### references/arch-ui-components-details.md

| セクション | 行 |
|------------|----|
| SkillSelector コンポーネントパターン | L6 |
| ChatPanel統合パターン（TASK-7D） | L240 |
| SkillCenterView アーキテクチャパターン（TASK-UI-05） | L291 |
| Skill Advanced Views アーキテクチャパターン（TASK-UI-05B / completed） | L344 |

### references/arch-ui-components-history.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L6 |
| 関連ドキュメント | L30 |

### references/arch-ui-components.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 関連ドキュメント | L19 |

### references/csrf-state-parameter.md

| セクション | 行 |
|------------|----|
| メタ情報 | L6 |
| 概要 | L17 |
| API仕様 | L24 |
| 認証フローにおける統合 | L99 |
| セキュリティ設計根拠 | L142 |
| 既知の制約（Implicit Flow由来） | L155 |
| 苦戦箇所と教訓 | L166 |
| テストカバレッジ | L197 |
| 関連ドキュメント | L221 |
| 変更履歴 | L229 |

### references/deployment-core.md

| セクション | 行 |
|------------|----|
| デプロイメント戦略概要 | L6 |
| Railway デプロイ戦略 | L36 |
| GitHub Actions CI/CD パイプライン | L137 |
| Electron アプリのリリース | L240 |
| ロールバック戦略 | L320 |

### references/deployment-details.md

| セクション | 行 |
|------------|----|
| モニタリングとアラート | L6 |
| デプロイチェックリスト | L69 |
| GitHub Secrets の要件 | L122 |

### references/deployment-electron.md

| セクション | 行 |
|------------|----|
| ビルドターゲット | L10 |
| Native Addon 再構築（postinstall bootstrap） | L34 |
| リリースフロー | L74 |
| リリースチェックリスト | L86 |
| 自動更新（electron-updater） | L99 |
| コードサイニング | L126 |
| デプロイチェックリスト | L150 |
| データベースマイグレーションのロールバック | L203 |
| 関連ドキュメント | L229 |

### references/deployment-gha.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| ワークフロー構成 | L38 |
| CI ワークフロー要件（PR時） | L48 |
| キャッシュ戦略 | L99 |
| 並列実行の活用 | L129 |
| CD ワークフロー要件（mainマージ時） | L216 |
| モニタリングとアラート | L240 |
| GitHub Secrets の要件 | L287 |
| 関連ドキュメント | L305 |
| 変更履歴 | L313 |

### references/deployment-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |

### references/deployment-railway.md

| セクション | 行 |
|------------|----|
| 無料枠の制限と最適化 | L10 |
| スリープモード対策 | L43 |
| カスタムドメイン設定 | L73 |
| 環境分離 | L90 |
| ロールバック | L115 |
| 関連ドキュメント | L140 |

### references/deployment.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/development-guidelines-core.md

| セクション | 行 |
|------------|----|
| ロギング戦略 | L6 |
| キャッシング戦略 | L84 |
| データマイグレーション | L123 |
| コードレビューガイドライン | L162 |
| パフォーマンス最適化 | L211 |
| 国際化（i18n） | L335 |
| Git ワークフロー | L365 |

### references/development-guidelines-details.md

| セクション | 行 |
|------------|----|
| 命名規則 | L6 |
| デバッグガイド | L54 |
| リリースプロセス | L108 |
| バックアップ・リカバリ | L137 |
| 環境構築ガイド | L174 |

### references/development-guidelines-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 完了タスク | L19 |
| 変更履歴 | L31 |

### references/development-guidelines.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/directory-structure-core.md

| セクション | 行 |
|------------|----|
| 設計方針 | L6 |
| ルート構造 | L43 |
| packages/shared/ 詳細構造 | L95 |
| apps/web/ 詳細構造（Next.js） | L251 |
| apps/desktop/ 詳細構造（Electron） | L291 |
| local-agent/ 詳細構造 | L397 |
| .github/workflows/ 詳細構造 | L408 |

### references/directory-structure-details.md

| セクション | 行 |
|------------|----|
| ルートの設定ファイル群 | L6 |
| 機能追加の手順 | L25 |
| 構造の選択理由 | L57 |
| 依存関係ルール | L72 |
| pnpm-workspace 設定 | L117 |

### references/directory-structure-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |

### references/directory-structure.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/discord-bot.md

| セクション | 行 |
|------------|----|
| 機能概要 | L8 |
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
|------------|----|
| 変更履歴 | L6 |
| 環境変数の分類 | L15 |
| セキュリティベストプラクティス | L80 |
| 環境別設定 | L152 |
| Electron アプリでの環境変数 | L204 |
| トラブルシューティング | L261 |
| チーム開発での運用 | L322 |
| 必須環境変数一覧 | L360 |
| 関連ドキュメント | L418 |

### references/error-handling-core.md

| セクション | 行 |
|------------|----|
| エラー分類 | L6 |
| 認可エラー（UnauthorizedError） | L194 |
| 外部ストレージ取得フォールバックパターン（TASK-FIX-4-2） | L259 |
| リトライ戦略 | L303 |
| SkillExecutor リトライ戦略（TASK-SKILL-RETRY-001） | L367 |

### references/error-handling-details.md

| セクション | 行 |
|------------|----|
| TokenRefreshScheduler リトライ戦略（TASK-AUTH-SESSION-REFRESH-001） | L6 |
| SkillExecutor 実行エラーコード（TASK-8A） | L57 |
| OAuthエラーコードマッピング（TASK-FIX-GOOGLE-LOGIN-001） | L96 |
| AuthMode IPC エラー envelope（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001） | L138 |
| 認証フォールバックパターン（AUTH-UI-001） | L201 |
| サーキットブレーカー（将来対応） | L243 |
| エラーレスポンス形式 | L271 |
| エラーログ出力 | L302 |
| ユーザー向けエラーメッセージ | L339 |
| エラーハンドリングの実装指針 | L362 |

### references/error-handling-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 変更履歴 | L15 |

### references/error-handling.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/governance-hooks-factory-audit-sink.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| SkillCreatorPermissionPolicy | L24 |
| SkillCreatorHooksFactory | L65 |
| SkillCreatorAuditSink | L113 |
| 使用例 | L162 |
| 設計上の注意事項 | L203 |
| path-scoped canUseTool 判定（TASK-P0-09-U1 実装済み） | L213 |
| 関連仕様書 | L233 |

### references/ipc-4-layer-pattern.md

| セクション | 行 |
|------------|----|
| メタ情報 | L8 |
| 概要 | L19 |
| Layer 1: チャネル定数 | L38 |
| Layer 2: ホワイトリスト | L70 |
| Layer 3: ipcMain ハンドラ | L98 |
| Layer 4: contextBridge API | L161 |
| 4層 チェックリスト（新規チャネル追加時） | L216 |
| P0-06 / P0-08 状態境界ガイドライン | L232 |
| 関連ファイル一覧 | L277 |

### references/ipc-contract-checklist.md

| セクション | 行 |
|------------|----|
| メタ情報 | L9 |
| 変更履歴 | L21 |
| 背景 | L34 |
| チェックリスト | L49 |
| 契約ドリフト検出コマンド | L170 |
| 関連ドキュメント | L200 |
| 適用事例 | L214 |
| Skill Creator IPC ハンドラー scope 分離マトリクス（TASK-UI-02） | L228 |
| 自動検出ツール（UT-TASK06-007） | L254 |

### references/ipc-type-resolution-guide.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| IPC 型不整合の分類 | L18 |
| 診断ワークフロー | L33 |
| 解決パターン | L68 |
| 予防策チェックリスト | L205 |
| 関連ドキュメント | L220 |
| 適用実績 | L231 |
| 変更履歴 | L242 |

### references/legacy-ordinal-family-register.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 使い方 | L14 |
| Current Alias Overrides（個別互換行） | L21 |
| Family Summary | L37 |
| Detailed Register | L56 |
| Section Extract Register (2026-03-17) | L237 |
| 500-Line Split Register (2026-03-16) | L248 |

### references/lessons-learned-2026-04-early.md

| セクション | 行 |
|------------|----|
| UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11） | L6 |
| UT-W3-ANALYTICS-ADAPTER-001 trackEvent analytics adapter差し替え 教訓（2026-04-12） | L37 |
| TASK-SC-08-E2E-VALIDATION 教訓（2026-03-25） | L60 |
| TASK-SDK-08 session-persistence-and-resume-contract (2026-03-28) | L85 |
| UT-SDK-07 shared IPC channel 契約整合（2026-03-29） | L116 |
| TASK-RT-06 教訓（2026-03-29） | L147 |
| UT-IMP-SDK-06 教訓（2026-04-01） | L169 |
| TASK-P0-04 教訓（2026-03-30） | L200 |
| TASK-SDK-SC-03 External API Support 教訓（2026-04-03） | L236 |
| TASK-SDK-SC-04 Skill Output Integration 教訓（2026-04-04） | L330 |
| UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION 教訓（2026-04-04） | L384 |
| TASK-P0-05 execute→SkillFileWriter persist 統合 教訓（2026-04-05） | L424 |
| TASK-P0-07 ハードコード AGENT_NAMES の動的解決 教訓（2026-04-06） | L464 |
| TASK-SDK-04-U1-F1 先行完了パターン教訓（2026-04-06） | L495 |
| TASK-FIX-IPC-SKILL-NAME-001 教訓（2026-04-06） | L507 |
| UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 教訓（2026-04-06） | L530 |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08） | L538 |
| TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消 | L572 |
| UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08） | L606 |
| UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08） | L629 |

### references/lessons-learned-archive-2026-03-mid.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 教訓アーカイブ（2026-03-14 〜 2026-03-16） | L18 |
| 教訓アーカイブ（2026-03-18） | L457 |

### references/lessons-learned-archive-2026-03.md

| セクション | 行 |
|------------|----|
| メタ情報 | L8 |
| 教訓アーカイブ（2026-03-01 〜 2026-03-15） | L19 |

### references/lessons-learned-auth-ipc-contract-bridge-audit-scope.md

| セクション | 行 |
|------------|----|
| UT-FIX-SKILL-EXECUTE-INTERFACE-001: skill:execute IPC契約ブリッジ | L6 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001: IPC契約同期オーケストレーション | L51 |
| UT-IPC-AUTH-HANDLE-DUPLICATE-001: AUTH IPC登録一元化 | L71 |
| UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001: 未タスク監査の scope 分離 | L125 |
| UT-UI-THEME-DYNAMIC-SWITCH-001: settingsSlice テーマ動的切替対応 | L208 |
| TASK-9A-skill-editor: Phase 12再確認（2026-02-26） | L256 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 教訓（2026-03-19） | L294 |

### references/lessons-learned-auth-ipc-fallback-registration-settings.md

| セクション | 行 |
|------------|----|
| TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 再監査（2026-03-08） | L6 |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001: SettingsView 統合回帰強化（2026-03-08） | L60 |
| TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001: Profile / Avatar fallback ハンドラ追加（2026-03-08） | L97 |
| TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001: auth-key IPCハンドラ登録漏れ修正（2026-03-05） | L144 |
| TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001: SkillExecutor AuthKeyService DI経路統一（2026-03-05） | L216 |
| TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001: OAuth後 sandbox iterable エラー原因分離（2026-03-06追補） | L281 |
| TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001: authCallbackServer timeout/stop 責務分離 | L344 |
| TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION: Conversation IPC ハンドラ登録修正（2026-03-16） | L375 |

### references/lessons-learned-auth-ipc-file-ops-skill-creator-registration.md

| セクション | 行 |
|------------|----|
| TASK-9A-B: スキルファイル操作IPCハンドラー実装 | L6 |
| TASK-9B-H: SkillCreatorService IPCハンドラー登録 | L186 |

### references/lessons-learned-auth-ipc-phase12-type-gaps-preload-alignment.md

| セクション | 行 |
|------------|----|
| UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク） | L6 |
| UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正 | L177 |
| UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正 | L235 |
| TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 型ギャップ教訓（2026-03-19） | L286 |

### references/lessons-learned-auth-ipc-safeinvoke-timeout.md

| セクション | 行 |
|------------|----|
| TASK-FIX-SAFEINVOKE-TIMEOUT-001 教訓（2026-03-10） | L6 |

### references/lessons-learned-auth-ipc-security-double-registration.md

| セクション | 行 |
|------------|----|
| UT-9B-H-003: SkillCreator IPCセキュリティ強化 | L6 |
| UT-FIX-IPC-RESPONSE-UNWRAP-001: IPCレスポンスラッパー未展開修正 | L80 |
| UT-FIX-IPC-HANDLER-DOUBLE-REG-001: IPC ハンドラ二重登録防止 | L203 |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001: skill:import IPCチャネル名競合の予防的解消 | L252 |
| UT-IPC-CHANNEL-NAMING-AUDIT-001: IPCチャネル命名監査の台帳同期（2026-02-25） | L356 |

### references/lessons-learned-auth-ipc-skill-creator-governance-hooks.md

| セクション | 行 |
|------------|----|
| TASK-P0-09: Claude SDK permissionMode + canUseTool + Hooks ガバナンス実装（2026-03-31） | L6 |

### references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md

| セクション | 行 |
|------------|----|
| TASK-9B: SkillCreator IPC拡張同期 再監査（2026-02-26） | L7 |
| UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001 Runtime Skill Creator public IPC wiring（2026-03-21） | L9 |
| TASK-SDK-02 workflow-engine-runtime-orchestration（2026-03-26） | L11 |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle（2026-03-26） | L13 |
| UT-IMP-RUNTIME-WORKFLOW-ENGINE-FAILURE-LIFECYCLE-001 Runtime workflow engine failure lifecycle hardening（2026-03-26） | L87 |
| TASK-SDK-08 session-persistence-and-resume-contract（2026-03-26） | L134 |
| TASK-SDK-03〜06 / UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 追加教訓（2026-03-27） | L257 |
| TASK-RT-06: SDK Event Normalizer 実装知見 | L306 |

### references/lessons-learned-auth-settings-degradation-guard.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 | L26 |
| TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 教訓 | L118 |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装教訓（2026-03-10） | L178 |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査教訓（2026-03-10） | L283 |

### references/lessons-learned-conversation-db-robustness.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 2026-03-19 TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 | L18 |
| 2026-03-23 UT-CONV-DB-001: CPU アーキテクチャ不一致によるテスト SKIP（P66） | L38 |
| 問題パターン（一般化） | L56 |
| 5分で確認する順序 | L62 |
| 次回の判断ルール | L69 |

### references/lessons-learned-current-2026-03-early.md

| セクション | 行 |
|------------|----|

### references/lessons-learned-current-2026-03-late.md

| セクション | 行 |
|------------|----|
| UT-TASK06-007 IPC契約ドリフト自動検出スクリプト（2026-03-18） | L4 |
| TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001（2026-03-21） | L38 |
| TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 契約テスト教訓（2026-03-24） | L121 |
| UT-SC-05-APPLY-IMPROVEMENT-UI: 改善提案 承認/適用 UI | L137 |
| TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 からの教訓（2026-03-24） | L161 |

### references/lessons-learned-current-2026-03-mid.md

| セクション | 行 |
|------------|----|
| TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001（2026-03-22） | L4 |

### references/lessons-learned-current-2026-04.md

| セクション | 行 |
|------------|----|
| UT-SKILL-WIZARD-FB-05 テスト証跡一本化テンプレート 教訓（2026-04-13） | L5 |
| UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11） | L45 |
| UT-W3-ANALYTICS-ADAPTER-001 trackEvent analytics adapter差し替え 教訓（2026-04-12） | L76 |
| TASK-SC-08-E2E-VALIDATION 教訓（2026-03-25） | L99 |
| TASK-SDK-08 session-persistence-and-resume-contract (2026-03-28) | L124 |
| UT-SDK-07 shared IPC channel 契約整合（2026-03-29） | L155 |
| TASK-RT-06 教訓（2026-03-29） | L186 |
| UT-IMP-SDK-06 教訓（2026-04-01） | L208 |
| TASK-P0-04 教訓（2026-03-30） | L239 |
| TASK-SDK-SC-03 External API Support 教訓（2026-04-03） | L275 |
| TASK-SDK-SC-04 Skill Output Integration 教訓（2026-04-04） | L370 |
| UT-RT-06-SKILL-STREAM-SKCE-TYPE-UNIFICATION 教訓（2026-04-04） | L424 |
| TASK-P0-05 execute→SkillFileWriter persist 統合 教訓（2026-04-05） | L464 |
| TASK-P0-07 ハードコード AGENT_NAMES の動的解決 教訓（2026-04-06） | L504 |
| TASK-SDK-04-U1-F1 先行完了パターン教訓（2026-04-06） | L535 |
| TASK-FIX-IPC-SKILL-NAME-001 教訓（2026-04-06） | L547 |
| UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 教訓（2026-04-06） | L570 |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08） | L579 |
| TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消 | L613 |
| UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08） | L647 |

### references/lessons-learned-current-electron-menu-docs-task0912.md

| セクション | 行 |
|------------|----|

### references/lessons-learned-current-safetygrate-ipc-gap.md

| セクション | 行 |
|------------|----|

### references/lessons-learned-current.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 分割ファイル一覧 | L150 |
| クイックリファレンス: カテゴリ別検索ガイド | L170 |
| 分割ファイル一覧 | L174 |

### references/lessons-learned-governance-hooks-phase-policy.md

| セクション | 行 |
|------------|----|
| 1. 定義済み / 接続済み / 可視化済みの区別 | L8 |
| 2. UI Payload vs. Visual Evidence の区別 | L22 |
| 3. パストラバーサル対策の実装パターン（null byte check + path.resolve/relative） | L35 |
| 4. phase gap の警告パターン | L61 |
| 5. follow-up タスクの formalize タイミング | L81 |
| 6. waitFor + vi.useFakeTimers() 非互換問題（テスト環境） | L91 |
| 7. canUseTool 引数順序の罠（型が同一な引数の逆転バグ） | L107 |
| 8. worktree でのテスト実行と esbuild バージョン不一致 | L127 |
| 関連ファイル | L139 |

### references/lessons-learned-health-policy-worktree-2026-04.md

| セクション | 行 |
|------------|----|
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 shared policy 移管 教訓（2026-04-08） | L7 |
| TASK-FIX-WORKTREE-CONFLICT-001: 並列 worktree コンフリクト解消 | L41 |

### references/lessons-learned-ipc-channel-whitelist-sync.md

| セクション | 行 |
|------------|----|
| TASK-UI-02 / UT-TASK06-007: IPC Channel whitelist 同期ガード | L6 |

### references/lessons-learned-ipc-preload-runtime-2026-03-early.md

| セクション | 行 |
|------------|----|
| 2026-03-23 UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 | L4 |
| 2026-03-27 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | L6 |
| 2026-03-27 TASK-SDK-04 user interaction bridge / phase UI | L16 |
| 2026-03-28 TASK-SDK-04-U1 submitUserInput phase transition semantics | L34 |
| 2026-03-16 TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION | L70 |
| 2026-03-22 TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR | L76 |
| 2026-03-20 TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査 | L96 |
| 2026-03-21 UT-TASK06-007-EXT-006 テスト拡充 Phase 12 再監査 | L124 |
| 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 再監査 | L160 |
| 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 | L188 |
| 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57-P61） | L225 |
| 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補） | L291 |
| 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | L312 |

### references/lessons-learned-ipc-preload-runtime-2026-03-late.md

| セクション | 行 |
|------------|----|
| 2026-03-18 TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 | L4 |
| 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 実装セッション | L46 |
| TASK-SC-02-RUNTIME-POLICY-CLOSURE（2026-03-22） | L93 |
| TASK-SC-05-IMPROVE-LLM（2026-03-23） | L113 |
| TASK-SC-06-UI-RUNTIME-CONNECTION（2026-03-24） | L129 |
| TASK-IMP-HEALTH-POLICY-UNIFICATION-001（2026-03-25） | L160 |
| TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION（2026-03-25） | L174 |
| UT-SC-02-005（2026-03-25） | L211 |

### references/lessons-learned-ipc-preload-runtime-2026-04.md

| セクション | 行 |
|------------|----|
| TASK-FIX-EXECUTE-PLAN-FF-001（2026-04-01） | L5 |
| TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001（2026-03-31） | L25 |
| TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001（2026-03-31） | L39 |
| TASK-FIX-AUTH-IPC-001（2026-04-01） | L54 |
| Phase-12 IPC 4層型同期（2026-04-06） | L78 |
| TASK-UT-RT-01 executeAsync エラー伝搬パス（2026-04-06） | L112 |
| UT-FIX-IPC-REGISTRATION-COMPLETENESS-CI-001 IPC ハンドラ重複登録サイレントフェイル（2026-04-07） | L116 |
| UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001（2026-04-13） | L188 |

### references/lessons-learned-ipc-preload-runtime.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 2026-03-23 UT-TERMINAL-HANDOFF-ADAPTER-PLACEMENT-001 | L46 |
| 2026-03-27 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001 | L48 |
| 2026-03-27 TASK-SDK-04 user interaction bridge / phase UI | L58 |
| 2026-03-28 TASK-SDK-04-U1 submitUserInput phase transition semantics | L76 |
| 2026-03-16 TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION | L112 |
| 2026-03-22 TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR | L118 |
| 2026-03-20 TASK-FIX-CHATVIEW-ERROR-SILENT-FAILURE 再監査 | L138 |
| 2026-03-21 UT-TASK06-007-EXT-006 テスト拡充 Phase 12 再監査 | L166 |
| 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 再監査 | L202 |
| 2026-03-16 TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 | L230 |
| 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（P57-P61） | L267 |
| 2026-03-14 TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001（Phase 12 再確認追補） | L333 |
| 2026-03-14 TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 / TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001 | L354 |
| 2026-03-18 TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 | L384 |
| 2026-03-19 UT-TASK06-007 IPC契約ドリフト自動検出 実装セッション | L426 |
| TASK-SC-02-RUNTIME-POLICY-CLOSURE（2026-03-22） | L473 |
| TASK-SC-05-IMPROVE-LLM（2026-03-23） | L493 |
| TASK-SC-06-UI-RUNTIME-CONNECTION（2026-03-24） | L509 |

### references/lessons-learned-phase12-lifecycle-early-b.md

| セクション | 行 |
|------------|----|
| 2026-03-23 TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001 教訓 | L4 |
| TASK-RT-06 Phase 12 close-out 教訓（2026-03-29） | L37 |
| UT-RT-06-ESBUILD-ARCH-MISMATCH-001 (2026-03-29) | L57 |
| UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001 Phase 12 教訓（2026-03-29） | L73 |
| TASK-UIUX-FEEDBACK-001 Phase 12 review 教訓（2026-03-31） | L113 |
| 2026-04-01 TASK-SC-DIALOG-MANDATORY-001 skill-creator 対話強制 | L141 |
| 2026-04-03 TASK-FIX-LIFECYCLE-PANEL-ERROR-001 handoff エラー保持パターン | L172 |
| 2026-04-03 task-ut-p0-02-001-repeat-feedback-memory | L203 |
| TASK-UT-RT-01 executeAsync エラーテストパターン（2026-04-06） | L225 |

### references/lessons-learned-phase12-lifecycle-early.md

| セクション | 行 |
|------------|----|
| 2026-03-17 TASK-SKILL-LIFECYCLE-08 再監査（Phase 11/12 実績同期） | L4 |
| 2026-03-16 TASK-SKILL-LIFECYCLE-06 | L32 |
| 2026-03-16 TASK-SKILL-LIFECYCLE-07 | L75 |
| 2026-03-15 TASK-SKILL-LIFECYCLE-05 | L126 |
| 2026-03-14 TASK-SKILL-LIFECYCLE-04 | L195 |
| 2026-03-18 TASK-SKILL-LIFECYCLE-02 | L233 |

### references/lessons-learned-phase12-lifecycle-mid.md

| セクション | 行 |
|------------|----|
| 2026-03-21 TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001 | L4 |
| 2026-03-22 TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 | L44 |
| 2026-03-21 TASK-FIX-LLM-CONFIG-PERSISTENCE | L88 |
| 2026-03-20 TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 | L128 |
| 2026-03-21 TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 | L168 |
| 2026-03-17 TASK-SKILL-LIFECYCLE-08 仕様書作成（設計タスク Phase 1-13） | L217 |

### references/lessons-learned-phase12-lifecycle-recent.md

| セクション | 行 |
|------------|----|
| 2026-04-02 TASK-FIX-LIFECYCLE-PANEL-ERROR-001 | L4 |
| 2026-04-04 TASK-SKILL-CENTER-LIFECYCLE-NAV-001 | L38 |
| 2026-03-29 TASK-RT-04 skill-authkey-api-key-management-ui | L62 |
| 2026-03-31 TASK-ELECTRON-BUILD-FIX | L86 |
| 2026-03-28 TASK-SDK-07 execution-governance-and-handoff-alignment | L140 |
| 2026-03-27 UT-IMP-TASK-SDK-06-LAYER34-VERIFY-EXPANSION-001 | L180 |
| 2026-03-27 TASK-SDK-04 | L220 |
| 2026-03-27 UT-EXEC-01 | L222 |
| 2026-03-27 TASK-SDK-05 | L244 |
| 2026-03-26 TASK-SDK-01 manifest-contract-foundation | L274 |
| 2026-03-26 UT-IMP-RUNTIME-WORKFLOW-VERIFY-ARTIFACT-APPEND-001 | L286 |

### references/lessons-learned-phase12-workflow-lifecycle.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 分割ファイル一覧 | L55 |

### references/lessons-learned-rag-embedding-runtime.md

| セクション | 行 |
|------------|----|
| 教訓サマリー | L8 |
| TASK-IMP-RAG-EMBEDDING-EXTRACTION-AI-RUNTIME-001 実装教訓（2026-03-19） | L22 |

### references/lessons-learned-rt-04-authkey-dedup.md

| セクション | 行 |
|------------|----|
| TASK-RT-04-AUTHKEY-COMPONENT-DEDUP-001: AuthKey コンポーネント重複解消（2026-04-06） | L9 |
| L-RT04-001: 二重送信防止パターン（isSubmittingRef） | L23 |
| L-RT04-002: useAuthKeyManagement フック統合パターン | L35 |
| L-RT04-003: check-failed + apiError の二層設計 | L50 |
| L-RT04-004: ApiKeyStatus への check-failed 追加 — 型拡張の同一 wave 更新 | L63 |
| L-RT04-005: ApiKeySettingsPanel 委譲パターン — 廃止より先に委譲 | L74 |
| 応用候補 | L85 |
| esbuild バイナリ問題（参照のみ） | L96 |

### references/lessons-learned-rt02-stub-response-error-notification.md

| セクション | 行 |
|------------|----|
| L-RT02-001: false-success stub を explicit error contract へ置換するパターン | L8 |
| L-RT02-002: degraded path で governanceHooks.onSessionEnd() を呼ぶ audit 補修 | L20 |
| L-RT02-003: renderer での union response 型ガード（IPC wrapper + logical error） | L32 |
| L-RT02-004: shared types の union 拡張は同一 wave で renderer・テストと同期 | L44 |

### references/lessons-learned-safety-gate-ipc-quality.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 2026-03-17 UT-06-003 SafetyGate 実装 | L26 |

### references/lessons-learned-safety-gate-permission-fallback.md

| セクション | 行 |
|------------|----|
| メタ情報 | L6 |
| TASK-SKILL-LIFECYCLE-08 / UT-06-005 実装知見（2026-03-17） | L16 |
| UT-06-005-A 実装知見（2026-03-17） | L170 |

### references/lessons-learned-sdk-session-bridge-vitest-worktree.md

| セクション | 行 |
|------------|----|
| TASK-SDK-SC-01: SDK Session Bridge 実装 | L6 |

### references/lessons-learned-severity-filter-ui.md

| セクション | 行 |
|------------|----|
| タスク情報 | L3 |
| 技術的教訓 | L8 |
| 苦戦箇所 | L27 |
| コードパターン | L39 |

### references/lessons-learned-skill-build-harness-guard.md

| セクション | 行 |
|------------|----|
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 教訓（2026-03-12） | L6 |

### references/lessons-learned-skill-contrast-guard-lifecycle-followup.md

| セクション | 行 |
|------------|----|
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 教訓（2026-03-12） | L6 |
| TASK-10A-F: Store駆動ライフサイクルUI統合 再確認（2026-03-07） | L245 |
| TASK-10A-F: スキルライフサイクルUI Store移行（2026-03-07） | L247 |

### references/lessons-learned-skill-create-lifecycle-import-contract.md

| セクション | 行 |
|------------|----|
| TASK-10A-C: SkillCreateWizard 実装再監査（2026-03-02） | L6 |
| TASK-10A-D スキルライフサイクルUI統合（2026-03-03） | L55 |
| UT-FIX-SKILL-IMPORT-INTERFACE-001: skill:import インターフェース整合修正 | L101 |

### references/lessons-learned-skill-create-multi-select-kind.md

| セクション | 行 |
|------------|----|
| L-RT05-001: UserInputKind 拡張は field 追加 + kind 分岐が最安全 | L9 |
| L-RT05-002: input kind 切替時の stale state は useEffect + workflowSnapshot 監視で解消 | L22 |
| L-RT05-003: jest-dom matchers 使用前に setupFiles を確認する | L35 |
| L-RT05-004: shared contract 変更は same-wave で canonical spec へ同期する | L48 |
| L-MSO-001: SmartDefaultResult の型は不変を維持し、UI層で変換を吸収する | L61 |
| L-MSO-003: トリガー型選択肢（Q3パターン）のフォールバックは Phase 2 設計で明文化する | L74 |
| L-MSO-004: スクリーンショット取得ハーネスは終了処理をテンプレート化する | L88 |
| L-RT05-005: worktree環境での esbuild platform mismatch 解消手順 | L101 |

### references/lessons-learned-skill-creator-ipc-handler-scope.md

| セクション | 行 |
|------------|----|
| TASK-UI-02: Skill Creator IPC ハンドラー責務分離 | L6 |

### references/lessons-learned-skill-execute-hook-migration.md

| セクション | 行 |
|------------|----|
| TASK-FIX-7-1: SkillService executeSkill 委譲実装 | L6 |
| UT-STORE-HOOKS-COMPONENT-MIGRATION-001: 個別セレクタHook移行 | L296 |

### references/lessons-learned-skill-import-analysis-view.md

| セクション | 行 |
|------------|----|
| TASK-FIX-SKILL-IMPORT 3連続是正（2026-03-04） | L6 |
| TASK-10A-B: SkillAnalysisView 再監査（2026-03-02） | L206 |

### references/lessons-learned-skill-lifecycle-test-hardening.md

| セクション | 行 |
|------------|----|
| TASK-10A-G 実装知見追補（2026-03-10） | L6 |

### references/lessons-learned-skill-plan-exec-hardening.md

| セクション | 行 |
|------------|----|
| TASK-P0-07: Lane分割による並列実装の効果確認 (step-11) | L6 |
| [2026-04-03] TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 知見 | L28 |
| [2026-04-06] TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 知見 | L51 |

### references/lessons-learned-skill-remove-contract.md

| セクション | 行 |
|------------|----|
| UT-FIX-SKILL-REMOVE-INTERFACE-001: skill:remove インターフェース整合修正 | L6 |

### references/lessons-learned-skill-share-debug-lifecycle-design.md

| セクション | 行 |
|------------|----|
| TASK-9F: スキル共有・インポート機能 再監査（2026-02-27） | L6 |
| TASK-9H: スキルデバッグモード実装（2026-02-27） | L86 |
| TASK-10A-E-C: Store駆動ライフサイクル統合設計（2026-03-06） | L145 |
| persist iterable ハードニングでの教訓（2026-03-08） | L210 |
| TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 | L227 |
| TASK-10A-G 再監査教訓（2026-03-09） | L334 |

### references/lessons-learned-skill-validation-logging-deprecation.md

| セクション | 行 |
|------------|----|
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001: skill:ハンドラP42準拠バリデーション形式統一 | L6 |
| TASK-FIX-14-1: console → electron-log 移行 | L126 |
| TASK-FIX-13-1: deprecatedプロパティ正式移行 | L230 |

### references/lessons-learned-skill-wizard-llm-connection.md

| セクション | 行 |
|------------|----|
| タスク概要 | L9 |
| L-SC07-001: generationMode のローカル state 管理と UI 切替の分離 | L20 |
| L-SC07-002: executePlan の skillSpec 必須化（C-1 回避） | L31 |
| L-SC07-003: Hybrid State Pattern における対称クリアの必要性 | L42 |
| L-SC07-004: request-id ガードによる遅延レスポンスの破棄 | L53 |
| L-SC07-005: getWorkflowState による snapshot 再読込パターン | L64 |
| L-SC07-006: smartDefaults の推論と Q5 外部ツール解決の分離 | L75 |
| L-SC07-007: DescribeStep の deprecated 管理と SkillInfoStep への移行 | L86 |
| L-SC07-008: generationLockRef による二重実行防止 | L97 |
| 応用候補 | L108 |

### references/lessons-learned-skill-wizard-mso-main-tool-badge.md

| セクション | 行 |
|------------|----|
| タスク概要 | L9 |
| 実装パターン（将来参照用） | L22 |
| L-MSO-001: visual label と accessible name は別管理する | L80 |
| L-MSO-002: exact match テストを壊さないバッジ追加パターン | L90 |
| L-MSO-003: 削除容易性を保ったまま条件分岐バッジを実装する | L100 |
| スキル改善提案（task-specification-creator への反映事項） | L112 |

### references/lessons-learned-skill-wizard-mode-mgmt.md

| セクション | 行 |
|------------|----|
| L-MODE-001: state 廃止は 6 ステップで完結させる | L8 |
| L-MODE-002: TC-06 型の動的廃止検証テストを廃止系タスクの標準に組み込む | L20 |
| L-MODE-003: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する | L34 |
| L-MODE-004: Electron 実機なしでの視覚証跡の多層防御 | L47 |
| L-MODE-005: SkillCreateWizard の確定フロー（本タスク後の正規仕様） | L59 |

### references/lessons-learned-skill-wizard-mso-main-tool-badge.md

| セクション | 行 |
|------------|----|
| タスク概要 | L9 |
| 実装パターン（将来参照用） | L22 |
| L-MSO-001: visual label と accessible name は別管理する | L80 |
| L-MSO-002: exact match テストを壊さないバッジ追加パターン | L90 |
| L-MSO-003: 削除容易性を保ったまま条件分岐バッジを実装する | L100 |
| スキル改善提案（task-specification-creator への反映事項） | L112 |

### references/lessons-learned-skill-wizard-redesign.md

| セクション | 行 |
|------------|----|
| タスク概要 | L9 |
| 実装パターン（将来参照用） | L21 |
| 苦戦箇所 | L110 |
| 非ブロッカー改善候補（skill-feedback-report.md より） | L121 |
| UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08） | L161 |
| W0-seq-02 SmartDefault推論サービス実装 教訓（2026-04-08） | L187 |
| UT-HEALTH-POLICY-RUNTIME-INJECTION-001 healthPolicy DI注入 教訓（2026-04-08） | L204 |
| W1-par-02a SkillInfoStep実装（DescribeStep再設計）教訓（2026-04-08） | L220 |
| UT-SKILL-WIZARD-W2-seq-03b wizard exports 教訓（2026-04-08） | L237 |
| Google Calendar スキル新規追加 教訓（2026-04-08） | L253 |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11） | L269 |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11） | L293 |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11） | L317 |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11） | L341 |
| UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11） | L365 |
| UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 実装知見（2026-04-11） | L389 |
| 依存関係 | L413 |
| 関連ファイル | L425 |
| UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11） | L437 |
| TASK-SC-07 LLM生成フロー接続 教訓（2026-04-09） | L462 |

### references/lessons-learned-templates.md

| セクション | 行 |
|------------|----|
| 目次 | L6 |
| 関連ドキュメント | L203 |
| テンプレート（新規教訓追加用） | L213 |

### references/lessons-learned-test-typesafety.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 2026-03-29 UT-RT-06-CONS（sdkMessageUtils shared helper 抽出 / Phase 7 個別カバレッジ計測） | L30 |
| 2026-03-25 UT-LLM-MOD-01-005（provider registry SSoT） | L66 |
| 2026-03-16 UT-06-001 (tool-risk-config-implementation) | L109 |
| 2026-03-16 UT-06-005 Permission Fallback（abort/skip/retry/timeout） | L198 |
| 2026-04-01 TASK-TRACE-SKILL-AUTH-001（スキル生成 auth:login リグレッション調査） | L238 |
| 2026-04-07 TASK-UT-RT-01（TDD 2段階テスト設計） | L311 |

### references/lessons-learned-ui-adapter-status-retry.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L9 |
| TASK-RT-02 / api-key-ui-adapter-status | L17 |
| 関連リソース (TASK-RT-02) | L115 |
| TASK-RT-03: SkillCreationResultPanel 実装知見 (2026-04-06) | L127 |
| 関連リソース (TASK-RT-03) | L276 |

### references/lessons-learned-ui-agent-view-nav-notification-history.md

| セクション | 行 |
|------------|----|
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT: AgentView Enhancement（2026-03-07） | L6 |
| TASK-UI-02-GLOBAL-NAV-CORE: Global Navigation 基盤移行（2026-03-06） | L80 |
| TASK-UI-01-C-NOTIFICATION-HISTORY-DOMAIN: Notification/HistorySearch 実装（2026-03-05） | L146 |
| TASK-UI-08-NOTIFICATION-CENTER: NotificationCenter 058e 再監査（2026-03-11） | L199 |
| TASK-UI-01-A-STORE-SLICE-BASELINE: Store境界基準化の再監査（2026-03-05） | L238 |
| TASK-UI-05A-SKILL-EDITOR-VIEW: 再監査（2026-03-02） | L317 |

### references/lessons-learned-ui-skill-center-editor-dashboard.md

| セクション | 行 |
|------------|----|
| TASK-UI-05-SKILL-CENTER-VIEW: SkillCenterView 実装（2026-03-01） | L6 |
| TASK-UI-05B-SKILL-ADVANCED-VIEWS: 高度管理ビュー群再確認（2026-03-02） | L48 |
| TASK-9A-C: SkillEditor 仕様書再監査（Phase 12準拠） | L90 |
| TASK-UI-07-DASHBOARD-ENHANCEMENT: ホーム画面リデザイン（2026-03-11） | L229 |
| TASK-UI-04A-WORKSPACE-LAYOUT 実装教訓（2026-03-10） | L282 |
| TASK-UI-04C-WORKSPACE-PREVIEW 実装教訓（2026-03-11） | L334 |

### references/lessons-learned-ui-ux-visual-baseline-drift.md

| セクション | 行 |
|------------|----|
| メタ情報 | L9 |
| 教訓 | L20 |
| 同種課題の簡潔解決手順 | L51 |
| 関連ドキュメント | L61 |
| 変更履歴 | L72 |

### references/lessons-learned-verify-contract-consolidation.md

| セクション | 行 |
|------------|----|
| UT-VERIFY-DOC-CONSOLIDATION-001: verify関連ドキュメント 正本・履歴分離と責務分離の実装パターン | L6 |
| 苦戦箇所と解決策 | L29 |
| 知見まとめ | L129 |

### references/lessons-learned-viewtype-electron-ui.md

| セクション | 行 |
|------------|----|
| メタ情報 | L7 |
| 変更履歴 | L18 |
| 2026-03-17 TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001 | L29 |
| 2026-03-19 TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 | L102 |
| 2026-03-20 TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001 | L176 |
| 2026-03-16 TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 | L225 |
| 派生未タスク | L277 |

### references/lessons-learned-w3-usage-tracking-2026-04.md

| セクション | 行 |
|------------|----|
| UT-SKILL-WIZARD-W3-seq-04 使用率計装 教訓（2026-04-08） | L8 |
| UT-W3-ANALYTICS-ADAPTER-001 analytics adapter接続 教訓（2026-04-12） | L66 |
| UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 E2E trackEvent 確認 教訓（2026-04-12） | L104 |
| UT-W3-ANALYTICS-HTTP-PROVIDER-001 HTTP Provider 実装 教訓（2026-04-13） | L119 |

### references/lessons-learned-workflow-quality-ci-module-resolution.md

| セクション | 行 |
|------------|----|
| TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: @repo/shared 4設定ファイル整合CIガード | L6 |
| TASK-FIX-10-1: Vitest未処理Promise拒否検知の復元 | L187 |
| TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` モジュール解決エラー修正 | L245 |

### references/lessons-learned-workflow-quality-line-budget-reform.md

| セクション | 行 |
|------------|----|
| TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001: Phase 12 root evidence 再監査（2026-03-13） | L6 |
| UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001: 検証ゲート整合化（2026-02-26） | L57 |
| TASK-10A-F ワークフロー教訓（2026-03-09 P50検証実行） | L114 |
| TASK-10A-G: ライフサイクルテストハードニング（2026-03-09） | L144 |
| 2026-03-12: TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 | L219 |

### references/lessons-learned-workflow-quality-phase12-audit-validator.md

| セクション | 行 |
|------------|----|
| TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001: Phase 12実行監査（2026-02-28） | L6 |
| UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001: quick_validate 空フィールドガード | L64 |
| TASK-9J-skill-analytics: Phase 12再確認（2026-02-28） | L106 |
| TASK-9G-skill-schedule: Phase 12再確認（2026-02-27） | L167 |
| TASK-9I-skill-docs: Phase 12再確認（2026-02-28） | L208 |
| UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001: Phase 12 再確認証跡・未タスクリンク整合ガード（2026-02-28） | L267 |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001: Vitest alias と tsconfig paths の同期自動化 | L309 |

### references/lessons-learned-workflow-quality-sdk-tests-loop-guard.md

| セクション | 行 |
|------------|----|
| TASK-FIX-11-1: SDK統合テスト有効化 | L6 |
| UT-STORE-HOOKS-TEST-REFACTOR-001: renderHookパターン移行 | L153 |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001: AgentView無限ループ修正テスト | L300 |

### references/lessons-learned.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L7 |
| 利用順序 | L45 |
| 関連ドキュメント | L50 |

### references/llm-embedding.md

| セクション | 行 |
|------------|----|
| プロバイダーインターフェース | L13 |
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
|------------|----|
| 概要 | L9 |
| LLM チャット関連型定義（Desktop IPC） | L25 |
| Provider Registry SSoT | L74 |
| Renderer / Main surface 型 | L118 |
| バリデーション関数 | L150 |
| IPC通信 | L169 |
| UIアンカー | L204 |
| 関連ドキュメント | L216 |
| 変更履歴 | L224 |

### references/llm-streaming.md

| セクション | 行 |
|------------|----|
| 概要 | L15 |
| 型定義 | L21 |
| SSEフロー | L58 |
| プロバイダー別SSE解析 | L75 |
| キャンセル機構 | L86 |
| UIコンポーネント | L109 |
| エラーハンドリング | L133 |
| テストカバレッジ | L146 |
| 型安全性の保証 | L158 |
| 関連ドキュメント | L166 |
| 完了タスク記録 | L174 |
| 変更履歴 | L202 |

### references/llm-workspace-chat-edit.md

| セクション | 行 |
|------------|----|
| 概要 | L15 |
| FileService | L21 |
| ContextBuilder | L63 |
| ChatEditService | L103 |
| RuntimeResolver | L153 |
| AnthropicLLMAdapter | L190 |
| TerminalHandoffBuilder | L227 |
| IPCチャンネル | L300 |
| セキュリティ | L320 |
| ディレクトリ構成 | L336 |
| 品質メトリクス | L365 |
| 関連ドキュメント | L376 |
| 完了タスク | L404 |
| 変更履歴 | L464 |

### references/local-agent.md

| セクション | 行 |
|------------|----|
| 機能概要 | L8 |
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
|------------|----|
| メタ情報 | L9 |
| 変更履歴 | L21 |
| 目次 | L29 |
| ログレベルマッピング基準 | L40 |
| 移行手順チェックリスト | L63 |
| コードパターン | L91 |
| テストモックテンプレート | L133 |
| 条件ガード削除パターン | L184 |
| 注意事項・ピットフォール | L227 |
| 関連ドキュメント | L268 |

### references/logs-archive-2026-01-agent-sdk-deps-renderer-api.md

| セクション | 行 |
|------------|----|
| 2026-01-14: AGENT-SDK-DEP-FIX pnpm依存解決ルール追加 | L5 |
| 2026-01-17: Claude CLI Renderer API仕様追加 | L50 |
| [実行日時: 2026-01-19T08:09:21.230Z] | L106 |
| [実行日時: 2026-01-21T12:24:53.856Z] | L114 |
| [実行日時: 2026-01-22T03:40:15.617Z] | L122 |
| [実行日時: 2026-01-22T03:41:04.212Z] | L130 |
| [実行日時: 2026-01-22T13:47:58.498Z] | L138 |
| [実行日時: 2026-01-24T11:30:00.000Z] | L146 |
| [実行日時: 2026-01-24T03:43:19.280Z] | L180 |
| [実行日時: 2026-01-25T06:09:41.166Z] | L188 |
| 2026-01-25: Hooks実装（TASK-3-1-B） | L196 |
| 2026-01-25: TASK-3-2 SkillExecutor IPC Handler Integration | L237 |
| 2026-01-26: TASK-4-2 未タスク指示書作成 | L276 |
| 2026-01-26: TASK-4-2 PermissionResolver IPC Handlers | L294 |
| 2026-01-25: TASK-4-1 IPCチャネル定義 | L346 |

### references/logs-archive-2026-01-feature-structure-workspace-chat-edit.md

| セクション | 行 |
|------------|----|
| 2026-01-27: ui-ux-feature-components.md構造最適化 | L5 |
| 2026-01-27: workspace-chat-edit-ui（TASK-WCE-UI-001 / Issue #494） | L28 |
| 2026-01-26: permission-dialog-ui（TASK-3-1-D） | L57 |
| 2026-01-08: chat-multi-llm-switching | L78 |
| 2026-01-10: community-detection-leiden | L120 |
| 2026-01-11: community-summarization | L167 |
| [実行日時: 2026-01-11T22:42:11.689Z] | L202 |
| [実行日時: 2026-01-12T12:53:06.233Z] | L210 |
| [実行日時: 2026-01-12T12:55:54.882Z] | L218 |
| [実行日時: 2026-01-12T12:56:01.636Z] | L226 |
| 2026-01-12: AGENT-005 Claude Agent SDK統合 | L234 |
| [実行日時: 2026-01-13T01:30:00.000Z] | L275 |
| [実行日時: 2026-01-13T01:35:00.000Z] | L295 |
| 2026-01-13: services/graph型エクスポートパターン文書化 | L310 |
| [実行日時: 2026-01-13T08:30:32.142Z] | L351 |

### references/logs-archive-2026-01-skill-selector-todo-scan-template.md

| セクション | 行 |
|------------|----|
| 2026-01-30: TASK-7A SkillSelector コンポーネント実装完了 | L5 |
| 2026-01-29: コードベースTODOスキャン未タスク新規作成（4件） | L30 |
| 2026-01-29: TASK-CI-FIX-001 未タスク指示書テンプレート最適化 | L61 |
| 2026-01-29: fix-backend-lint-next16 未タスク指示書作成（TASK-CI-FIX-001） | L86 |
| 2026-01-29: fix-backend-lint-next16（TASK-CI-FIX-001） | L107 |
| 2026-01-28: skill-stream-i18n（TASK-3-2-B） | L139 |
| 2026-01-28: コピー履歴機能（TASK-3-2-D） | L181 |
| 2026-01-28: 構造最適化（ui-ux-feature-components.md分割） | L219 |
| 2026-01-28: システム仕様更新（TASK-3-2-B Phase 12） | L255 |
| 2026-01-28: 未タスク仕様書作成（TASK-6-1 Phase 12） | L287 |
| 2026-01-27: SkillAPI Preload実装（TASK-5-1） | L318 |
| 2026-01-27: skill-stream-ux-improvements（TASK-3-2-A） | L352 |

### references/logs-archive-2026-01-skill-stream-display-test-env.md

| セクション | 行 |
|------------|----|
| 2026-01-30: TASK-3-2-F SkillStreamDisplay テスト環境改善 | L5 |

### references/logs-archive-2026-01-system-spec-gap-skill-retry.md

| セクション | 行 |
|------------|----|
| 2026-01-31: システム仕様書Gap分析 → 未タスク仕様書2件作成 | L5 |
| 2026-01-31: TASK-SKILL-RETRY-001 SkillExecutor リトライ機構 Phase 1-12 完了 | L24 |
| 2026-01-31: TASK-IMP-permission-tool-icons 仕様詳細追記（v1.3.2） | L54 |
| 2026-01-31: TASK-7D Phase 12追加仕様書更新 | L73 |
| 2026-01-30: TASK-7D Phase 12 完了タスク・インデックス更新 | L94 |
| 2026-01-30: TASK-IMP-permission-tool-icons PermissionDialogツール別アイコン表示 | L115 |
| 2026-01-30: TASK-7D ChatPanel統合のシステム仕様書更新 | L143 |
| 2026-01-31: permissionDescriptionsモジュール仕様追加 | L171 |
| 2026-01-31: task-imp-permission-readable-ui-001 詳細完了記録・スキル改善 | L192 |
| 2026-01-30: task-imp-permission-readable-ui-001 PermissionDialog 人間可読UI改善完了 | L213 |
| 2026-01-30: TASK-3-2-F テスト環境改善知見のシステム仕様書追加 | L251 |
| 2026-01-30: TASK-7C PermissionDialog コンポーネント完了 | L285 |
| 2026-01-30: TASK-7B SkillImportDialog実装完了 | L324 |

### references/logs-archive-2026-01-topic-map-remember-choice.md

| セクション | 行 |
|------------|----|
| 2026-01-26: TASK-4-1 topic-map.md更新（補完） | L5 |
| [実行日時: 2026-01-26T02:09:48.407Z] | L31 |
| 2026-01-26: rememberChoice機能永続化（TASK-3-1-E） | L39 |
| 2026-01-27: SkillStreamDisplay UX改善（TASK-3-2-A） | L93 |
| 2026-01-27: TASK-5-1 SkillAPI Preload実装 | L145 |
| [実行日時: 2026-01-27T08:03:43.494Z] | L188 |
| 2026-01-27: workspace-chat-edit-ui（Issue #494） | L196 |
| 2026-01-28: TASK-3-2-D SkillStreamDisplay コピー履歴機能 | L244 |
| 2026-01-28: SkillSlice実装（TASK-6-1） | L284 |
| 2026-01-28: タイムスタンプ自動更新（TASK-3-2-C） | L318 |
| [実行日時: 2026-01-28T13:42:17.894Z] | L361 |

### references/logs-archive-2026-02-abort-security-loop-guard.md

| セクション | 行 |
|------------|----|
| 2026-02-10: UT-FIX-5-3完了（Preload Agent Abort セキュリティ修正） | L5 |
| [2026-02-10 - P31対策実装とスキル最適化] | L49 |
| 2026-02-10: UT-FIX-STORE-HOOKS-INFINITE-LOOP-001完了（Zustand Store Hooks無限ループ修正） | L75 |
| 2026-02-09: patterns.md構造最適化（skill-creatorテンプレート準拠） | L108 |
| 2026-02-09: TASK-FIX-12-1-IPC-HARDCODE-FIX完了（SkillExecutorのIPCチャネル名定数化） | L136 |
| 2026-02-08: TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE完了（Claude Agent SDK用認証キー管理基盤） | L180 |
| 2026-02-08: TASK-FIX-4-2-SKILL-STORE-PERSISTENCE完了（スキル永続化バグ修正） | L220 |
| 2026-02-06: TASK-AUTH-CALLBACK-001 未タスク指示書作成（苦戦箇所からの知見展開） | L282 |
| 2026-02-06: DEBT-SEC-001 仕様書更新（Phase 12ドキュメント・未タスク管理） | L309 |
| 2026-02-06: DEBT-SEC-001完了（OAuth State Parameter検証実装） | L340 |
| 2026-02-06: TASK-FIX-5-1完了（SkillAPI二重定義の統一） | L361 |
| 2026-02-06: TASK-AUTH-SESSION-REFRESH-001完了（セッション自動リフレッシュ実装） | L380 |

### references/logs-archive-2026-02-auth-callback-lifecycle-guard.md

| セクション | 行 |
|------------|----|
| 2026-02-28 - TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 完了移管反映 | L5 |
| 2026-02-28 - UT-IMP-AUTH-CALLBACK-LIFECYCLE-CONTRACT-GUARD-001 未タスク登録 | L24 |
| 2026-02-28 - TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 テンプレート最適化追補 | L43 |
| 2026-02-28 - TASK-FIX-AUTH-CALLBACK-SERVER-WORKER-EXIT-001 仕様再同期 | L62 |
| 2026-02-27 - TASK-9H 仕様再監査（Phase 12 最終同期） | L81 |
| 2026-02-28 - TASK-9I completed-tasks 移管（Phase 12完了条件充足） | L83 |
| 2026-02-28 - UT-IMP-PHASE12-EVIDENCE-LINK-GUARD-001 登録・仕様同期 | L109 |
| 2026-02-28 - TASK-9I Phase 12ドキュメント最適化（テンプレート準拠） | L135 |
| 2026-02-28 - TASK-9I Phase 12再確認（最終整合） | L158 |
| 2026-02-28 - TASK-9I 再監査反映（スキルドキュメント生成仕様同期） | L179 |
| 2026-02-28 - TASK-9J 完了移管（Phase 12完了条件に基づく成果物移動） | L201 |
| 2026-02-28 - TASK-9J 未タスク仕様書登録（Phase 12 IPC同期自動検証ガード） | L224 |
| 2026-02-28 - TASK-9J 仕様同期テンプレート最適化（5仕様書SubAgent分担） | L247 |
| 2026-02-28 - TASK-9J Phase 12再確認（苦戦箇所追補 + 未タスク整合確認） | L269 |
| 2026-02-28 - TASK-9J スキル使用統計・分析機能 Phase 12 仕様同期 | L292 |
| 2026-02-27 - TASK-9G 未タスク登録同期追補（Step 1-E 完了化） | L317 |
| 2026-02-27 - UT-IMP-PHASE12-SPEC-VERSION-CONSISTENCY-GUARD-001 未タスク登録 | L337 |
| 2026-02-27 - UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 Phase 12再監査 | L356 |

### references/logs-archive-2026-02-completed-move-preload-sync.md

| セクション | 行 |
|------------|----|
| 2026-02-25 - Phase 12完了済み成果物の completed-tasks への移管 | L5 |
| 2026-02-25 - UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001 未タスク登録 | L24 |
| 2026-02-25 - UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001 完了反映 + 再発防止スキル新設 | L43 |
| 2026-02-25 - UT-SKILL-IPC-PRELOAD-EXTENSION-001 再監査反映 | L64 |
| 2026-02-25 - UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 未タスク登録 | L84 |
| 2026-02-25 - UT-IPC-AUTH-HANDLE-DUPLICATE-001 テンプレート最適化（skill-creator適用） | L108 |
| 2026-02-25 - UT-IPC-AUTH-HANDLE-DUPLICATE-001 再監査補完 | L133 |
| 2026-02-25 - UT-IPC-AUTH-HANDLE-DUPLICATE-001 実装パターン追補 | L152 |
| 2026-02-25 - UT-IPC-AUTH-HANDLE-DUPLICATE-001 Phase 12完了反映 | L171 |
| 2026-02-25 - UT-IPC-CHANNEL-NAMING-AUDIT-001 Phase 12再監査是正 | L191 |
| 2026-02-25 - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 派生未タスク2件を登録 | L211 |
| 2026-02-25 - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12要件再適合（実装内容/苦戦箇所追記） | L234 |
| 2026-02-25 - UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001 Phase 12再監査整合 | L253 |
| 2026-02-24 - 未タスク監査スコープ分離タスク登録 | L273 |
| 2026-02-24 - SKILLフロントマター description 制約準拠化 | L292 |
| 2026-02-24 - UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 12再監査是正 | L311 |
| 2026-02-24 - UT-IPC-DATA-FLOW-TYPE-GAPS-001 Phase 1-12全完了 | L331 |
| 2026-02-24 - UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 再監査整合 | L356 |

### references/logs-archive-2026-02-console-migration-patterns.md

| セクション | 行 |
|------------|----|
| 2026-02-14: TASK-FIX-14-1 実装パターンの体系化・スキル最適化 | L5 |
| 2026-02-14: TASK-FIX-14-1 苦戦箇所のシステム仕様書反映 | L27 |
| 2026-02-14: TASK-FIX-14-1 console移行タスクのPhase 12再監査・仕様同期 | L46 |
| 2026-02-13: TASK-FIX-13-1 未タスク仕様書作成（UT-TYPE-DATETIME-DOC-001） | L67 |
| 2026-02-13: TASK-FIX-13-1 教訓追記（再検証セッション分）+ skill-creator patterns.md更新 | L80 |
| 2026-02-13: TASK-FIX-13-1 苦戦箇所の体系化（再発防止） | L93 |
| 2026-02-13: TASK-FIX-13-1 deprecatedプロパティ正式移行の仕様反映 | L114 |
| 2026-02-13: UT-FIX-AGENTVIEW-INFINITE-LOOP-001 苦戦箇所・テスト環境教訓追記 | L134 |
| 2026-02-13: TASK-FIX-11-1-SDK-TEST-ENABLEMENT スキル改善（技術詳細追記） | L154 |
| 2026-02-13: TASK-FIX-11-1-SDK-TEST-ENABLEMENT 教訓反映（追補） | L174 |
| 2026-02-13: TASK-FIX-11-1-SDK-TEST-ENABLEMENT完了 | L194 |
| 2026-02-12: UT-9B-H-003 Phase 12再監査（苦戦箇所記録・未タスク配置整合） | L224 |
| 2026-02-12: 完了タスク移動（UT-FIX-AGENTVIEW-INFINITE-LOOP-001） | L246 |
| 2026-02-12: task-workflow未タスク参照整合の是正 | L259 |
| 2026-02-12: UT-9B-H-003 仕様整合追補（未タスク残置・返却仕様の是正） | L278 |
| 2026-02-12: UT-FIX-AGENTVIEW-INFINITE-LOOP-001完了 | L300 |
| 2026-02-12: UT-9B-H-003 SkillCreator IPCセキュリティ強化完了 | L321 |

### references/logs-archive-2026-02-env-infra-ipc-auth-ui.md

| セクション | 行 |
|------------|----|
| 2026-02-05: ENV-INFRA-001完了（better-sqlite3 Node.jsバージョン不一致修正） | L5 |
| 2026-02-05: TASK-FIX-4-1-IPC-CONSOLIDATION完了（IPCチャンネル統合） | L34 |
| 2026-02-04: AUTH-UI-001完了（認証UIバグ修正） | L59 |
| 2026-02-04: AUTH-UI-004完了（Googleアバター取得修正） | L80 |
| 2026-02-04: TASK-FIX-1-1-TYPE-ALIGNMENT完了（スキル型定義の統一） | L98 |
| 2026-02-04: task-imp-search-ui-001完了（検索・置換機能UI実装） | L129 |
| 2026-02-03: TASK-9C完了（スキル改善・自動修正機能） | L156 |
| 2026-02-03: TASK-9B-G Phase 12完了（苦戦箇所・教訓追記） | L177 |
| 2026-02-03: TASK-9B-G完了（SkillCreatorService実装） | L195 |
| 2026-02-02: TASK-WCE-WORKSPACE-001完了（Chat Edit Workspace管理統合） | L214 |
| 2026-02-02: 両ブランチ統合マージ | L233 |
| 2026-02-02: TASK-OPT-CI-TEST-PARALLEL-001完了（CI/テスト並列実行最適化） | L244 |
| 2026-02-02: task-imp-permission-date-filter完了（権限履歴の期間別フィルタリング） | L264 |
| 2026-02-02: TASK-8C-A完了（IPC統合テスト） | L275 |
| 2026-02-02: TASK-8A完了（スキル管理モジュール単体テスト） | L286 |
| 2026-02-02: TASK-8B完了（コンポーネントテスト） | L297 |
| 2026-02-01: TASK-8C-G完了（quality-e2e-testing.md v1.1.0更新） | L308 |
| 2026-02-01: task-imp-permission-history-001 Permission履歴トラッキングUI 仕様更新 | L320 |

### references/logs-archive-2026-02-permission-history-execution-timestamps.md

| セクション | 行 |
|------------|----|
| 2026-02-01: TASK-IMP-permission-history-001 Permission履歴トラッキングUI | L5 |
| [実行日時: 2026-02-06T02:11:35.490Z] | L94 |
| [実行日時: 2026-02-06T01:43:32.416Z] | L102 |
| [実行日時: 2026-02-06T01:41:25.133Z] | L110 |
| 2026-02-03: TASK-9B-A完了（skill-creator SKILL.md 作成） | L118 |
| 2026-02-03: TASK-9A-A完了（SkillFileManager実装） | L165 |
| 2026-02-04: TASK-FIX-1-1-TYPE-ALIGNMENT完了（スキル型定義統一） | L216 |
| 2026-02-04: AUTH-UI-001完了（認証UI改善） | L266 |
| 2026-02-04: ENV-INFRA-001完了（better-sqlite3バージョン不一致修正） | L308 |
| 2026-02-05: TASK-FIX-GOOGLE-LOGIN-001完了（Googleログイン修正） | L344 |
| 2026-02-09 | L383 |
| 2026-02-19 | L391 |

### references/logs-archive-2026-02-skill-creator-ipc-sdk-integration.md

| セクション | 行 |
|------------|----|
| 2026-02-12: TASK-9B-H-SKILL-CREATOR-IPC完了 | L5 |
| 2026-02-12: Store HooksテストrenderHookパターン移行（UT-STORE-HOOKS-TEST-REFACTOR-001） | L47 |
| 2026-02-12: TASK-9B-I-SDK-FORMAL-INTEGRATION完了（Claude Agent SDK型安全正式統合） | L64 |
| 2026-02-12: UT-STORE-HOOKS-COMPONENT-MIGRATION-001完了 | L91 |
| 2026-02-12: スキル最適化（TASK-FIX-7-1事後） | L112 |
| 2026-02-12: TASK-FIX-7-1スキル改善（スキルクリエーター経由） | L125 |
| 2026-02-11: TASK-FIX-7-1システム仕様書更新（Phase 12） | L138 |
| 2026-02-11: TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION完了 | L159 |
| 2026-02-11: UT-STORE-HOOKS-REFACTOR-001完了（Zustand Store Hooks無限ループ修正） | L192 |
| 2026-02-10: UT-FIX-5-4完了（AgentSDKAPI abort() 型定義不一致修正） | L239 |
| 2026-02-10: TASK-FIX-6-1知見によるシステム仕様書・スキル改善 | L283 |
| 2026-02-10: TASK-FIX-6-1-STATE-CENTRALIZATION完了（スキル状態管理集約） | L326 |
| 2026-02-10: UT-FIX-5-4未タスク仕様書作成 | L361 |

### references/logs-archive-2026-02-skill-import-interface-atoms-rerun.md

| セクション | 行 |
|------------|----|
| 2026-02-20 | L5 |
| 2026-02-21 - UT-FIX-SKILL-IMPORT-INTERFACE-001 完了 | L18 |
| 2026-02-24 - Phase 12 再監査（task-ui-00-atoms / ut-skill-import-channel-conflict-001） | L48 |
| 2026-02-25 - UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 Phase 12再確認 | L78 |
| 2026-02-25 - UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 最終整合（quick_validate.js統一） | L107 |
| 2026-02-25 - UT-IMP-PHASE12-VALIDATION-COMMAND-STANDARDIZATION-001 登録 | L128 |
| 2026-02-25 - Phase 12完了タスクの completed-tasks 移管 | L146 |
| 2026-02-25 - UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 1-12 実行反映 | L164 |
| 2026-02-25 - UT-FIX-SKILL-EXECUTE-INTERFACE-001 Phase 12再確認反映 | L184 |
| 2026-02-27 - TASK-9H 教訓同期追補 | L206 |

### references/logs-archive-2026-02-skill-validation-atoms-audit.md

| セクション | 行 |
|------------|----|
| 2026-02-24 - UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 Phase 12完了記録 | L5 |
| 2026-02-24 - Phase 12再監査（task-ui-00-atoms / UT-SKILL-IMPORT-CHANNEL-CONFLICT-001） | L35 |
| 2026-02-24 - UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 Phase 12完了記録 | L56 |
| 2026-02-24 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 再監査是正 | L84 |
| 2026-02-24 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 Phase 12追補（苦戦箇所とDevOps更新） | L102 |
| 2026-02-24 - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 Phase 1-12完了記録 | L120 |
| 2026-02-23 - TASK-UI-00-ATOMS Phase 12完了記録 | L146 |
| 2026-02-23 - TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追加 | L173 |
| 2026-02-22 - TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 教訓追補（Phase 12再確認） | L179 |
| 2026-02-22 - TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 再監査是正（文書整合） | L198 |
| 2026-02-22 - TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 12 Task 2実行 | L216 |
| 2026-02-22 - UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 追加監査（未タスク配置/フォーマット） | L244 |
| 2026-02-22 - UT-FIX-SKILL-IMPORT-ID-MISMATCH-001 Phase 12 Task 2実行 | L267 |
| 2026-02-22 - 仕様準拠再監査（リンク整合 + テスト仕様補強） | L293 |
| 2026-02-22 - TASK-UI-00-TOKENS Phase 1-12完了 | L318 |
| 2026-02-21 - UT-FIX-SKILL-REMOVE-INTERFACE-001 Phase 1-12実行 | L343 |
| 2026-02-21: task-workflow 未タスク参照リンク整合の再修正 | L368 |

### references/logs-archive-2026-02-unassigned-placement-import-interface.md

| セクション | 行 |
|------------|----|
| 2026-02-21: 未実施タスク誤配置の是正 + 実装苦戦箇所追記 | L5 |
| 2026-02-21: UT-FIX-SKILL-IMPORT-INTERFACE-001 Phase 12再監査反映（苦戦箇所追記） | L24 |
| 2026-02-21: UT-FIX-SKILL-IMPORT-INTERFACE-001 Phase 12反映（契約同期 + 完了反映） | L46 |
| 2026-02-21: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 未タスク検出・登録（3件） | L70 |
| 2026-02-21: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 スキル改善（実装パターン・苦戦箇所文書化） | L91 |
| 2026-02-21: UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 Phase 12反映 | L112 |
| 2026-02-20: UT-FIX-SKILL-REMOVE-INTERFACE-001 未タスク配置整合 + 教訓追記 | L135 |
| 2026-02-20: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 12反映 | L156 |
| 2026-02-19: TASK-9A-C SkillEditor UI仕様書作成反映 | L204 |
| 2026-02-19: TASK-9A-C Phase 12準拠監査・教訓反映（追補） | L227 |
| 2026-02-19: TASK-9A-B ファイル編集IPCハンドラー追加 | L248 |
| 2026-02-19: TASK-FIX-10-1-VITEST-ERROR-HANDLING 教訓最適化 | L272 |
| 2026-02-19: TASK-FIX-10-1-VITEST-ERROR-HANDLING 完了 | L291 |
| 2026-02-14: UT-FIX-IPC-RESPONSE-UNWRAP-001 実装苦戦箇所・パターン追記 | L304 |
| 2026-02-14: UT-FIX-IPC-RESPONSE-UNWRAP-001 完了反映 + MINOR未タスク化 | L325 |
| 2026-02-14: UT-FIX-IPC-HANDLER-DOUBLE-REG-001 Phase 12再監査追補（苦戦箇所記録） | L346 |
| 2026-02-14: UT-FIX-IPC-HANDLER-DOUBLE-REG-001 参照整合性是正 | L359 |
| 2026-02-14: UT-FIX-IPC-HANDLER-DOUBLE-REG-001 IPC ハンドラ二重登録防止修正 | L372 |

### references/logs-archive-2026-02-validator-task-9f-task-9b.md

| セクション | 行 |
|------------|----|
| 2026-02-27 - UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 | L5 |
| 2026-02-27 - TASK-9F完了反映（スキル共有・インポート機能） | L27 |
| 2026-02-26 - TASK-9B 再監査（実装内容+苦戦箇所の仕様反映） | L48 |
| 2026-02-26 - TASK-9B SkillCreator 仕様再同期（13チャンネル化） | L73 |
| 2026-02-26 - TASK-9A Phase 12完了移管（workflow + 未タスク） | L94 |
| 2026-02-26 - TASK-9A-C-004 未タスク登録（Phase 12仕様同期ガード） | L114 |
| 2026-02-26 - TASK-9A Phase 12再確認（苦戦箇所反映） | L134 |
| 2026-02-26 - TASK-9A スキルエディター完了同期 | L153 |
| 2026-02-26 - UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 12同期 | L173 |
| 2026-02-25 - UT-IMP-THEME-DYNAMIC-SWITCH-ROBUSTNESS-001 未タスク登録 | L192 |
| 2026-02-25 - UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 12 Step 2 テンプレート最適化 | L211 |
| 2026-02-25 - UT-UI-THEME-DYNAMIC-SWITCH-001 Phase 12準拠再確認（苦戦箇所追記） | L230 |
| 2026-02-25 - UT-UI-THEME-DYNAMIC-SWITCH-001 再監査（仕様同期） | L249 |
| 2026-02-25 - UT-IMP-PHASE12-SPEC-SYNC-SUBAGENT-GUARD-001 未タスク登録 | L269 |
| 2026-02-25 - UT-FIX-SKILL-EXECUTE-INTERFACE-001 仕様書別SubAgent同期（追補） | L293 |
| 2026-02-25 - UT-FIX-SKILL-EXECUTE-INTERFACE-001 仕様同期・再監査 | L318 |
| 2026-02-25 - UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 再監査（仕様同期） | L343 |
| 2026-02-25 - UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001 完了反映 | L363 |

### references/logs-archive-2026-03-auth-mode-migration-sync.md

| セクション | 行 |
|------------|----|
| 2026-03-06 - TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 再監査（横断導線補強） | L5 |
| 2026-03-06 - TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 仕様同期（auth-mode contract alignment） | L34 |
| 2026-03-06 - TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 completed-tasks 移管（Phase 12完了条件充足） | L69 |
| 2026-03-06 - UT-IMP-SKILLHANDLERS-AUTHKEY-DI-BOUNDARY-GUARD-001 追加（未タスク化 + 仕様同期） | L96 |
| 2026-03-06 - TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 教訓同期強化（実装内容 + 苦戦箇所） | L124 |
| 2026-03-05 - TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 再監査（仕様整合 + 画面回帰） | L154 |
| 2026-03-05 - TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 仕様同期（AuthKeyService DI経路統一） | L185 |
| 2026-03-06 - UT-IMP-PHASE12-TASK-INVESTIGATE-FIVE-MINUTE-CARD-SYNC-VALIDATOR-001 起票同期 | L214 |
| 2026-03-06 - TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 追補2（5分解決カード同期 + 仕様書整形最適化） | L242 |
| 2026-03-06 - TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 Phase 12準拠再確認（実装内容+苦戦箇所同期） | L270 |
| 2026-03-06 - TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 再監査（Phase 11 実画面証跡） | L300 |
| 2026-03-05 - TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 Phase 12同期 | L330 |
| 2026-03-05 - TASK-UI-01-C 再監査追補（phase/index整合 + 実画面証跡） | L359 |

### references/logs-archive-2026-03-history-search-notification-center.md

| セクション | 行 |
|------------|----|
| 2026-03-10 - TASK-UI-06-HISTORY-SEARCH-VIEW system spec 形成をテンプレート準拠へ最適化 | L5 |
| 2026-03-10 - TASK-UI-06-HISTORY-SEARCH-VIEW Phase 12 再監査同期 | L17 |
| 2026-03-11 - TASK-UI-08-NOTIFICATION-CENTER 再監査追補 | L36 |
| 2026-03-11 - TASK-UI-08-NOTIFICATION-CENTER Phase 12 仕様同期 | L53 |
| 2026-03-10 - TASK-FIX-SAFEINVOKE-TIMEOUT-001 Phase 1-12 実装完了 | L71 |
| 2026-03-10 - TASK-UI-03 workflow と関連未タスクを completed-tasks へ移管 | L88 |
| 2026-03-10 - TASK-UI-03 未タスク仕様書に親タスクの苦戦箇所を継承 | L105 |
| 2026-03-10 - TASK-UI-03 実装内容と苦戦箇所の正本配置を最適化 | L122 |
| 2026-03-10 - TASK-UI-03 Phase 12再監査で型アサーション完了追随と token 未タスク化を同期 | L139 |
| 2026-03-10 - TASK-UI-03 再監査で current workflow 台帳と UI review パターン補完 | L156 |
| 2026-03-10 - UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001 を system spec へ同期 | L173 |
| 2026-03-10 - TASK-UI-04A-WORKSPACE-LAYOUT 再監査同期 | L191 |
| 2026-03-10 - TASK-FIX-SAFEINVOKE-TIMEOUT-001 再監査同期 | L210 |
| 2026-03-10 - TASK-UI-03-AGENT-VIEW-ENHANCEMENT current workflow 同期 | L228 |
| 2026-03-10 - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 実装完了 | L245 |
| 2026-03-10 - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 再監査追補 | L265 |
| 2026-03-09 - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 再監査同期 | L283 |
| 2026-03-09 - TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 完了 | L302 |
| 2026-03-09 - TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 仕様反映 | L319 |
| 2026-03-09 - TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査の教訓固定 | L337 |

### references/logs-archive-2026-03-ipc-fallback-phase12-sync.md

| セクション | 行 |
|------------|----|
| 2026-03-08 - TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 仕様同期 | L5 |
| 2026-03-08 - TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 Phase 12 実績同期と教訓追加 | L24 |
| 2026-03-08 - TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001 Phase 12完了同期 | L42 |
| 2026-03-08 - workflow11 再確認反映（画面証跡 + 未タスク + broken link 是正） | L59 |
| 2026-03-08 - TASK-10A-F final sync（2workflow 正規化） | L81 |
| 2026-03-08 - TASK-10A-F current workflow 再確認追補 | L104 |
| 2026-03-08 - TASK-10A-F Phase 12タスク仕様再確認 | L127 |
| 2026-03-08 - 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 再監査同期 | L150 |
| 2026-03-07 - TASK-10A-F Store駆動ライフサイクルUI統合の仕様同期 | L173 |
| 2026-03-07 - TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 仕様同期 | L201 |
| 2026-03-07 - TASK-10A-E-C Store駆動ライフサイクル統合設計の仕様同期 | L218 |
| 2026-03-07 - TASK-UI-03-AGENT-VIEW-ENHANCEMENT Phase 12 完了 | L220 |
| 2026-03-06 - TASK-UI-02 completed-tasks 移管（workflow + 派生未タスク） | L244 |
| 2026-03-06 - TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 completed-tasks 移管 | L267 |
| 2026-03-06 - auth-mode 由来の domain spec 同期ブロック残課題を仕様同期 | L295 |
| 2026-03-06 - TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 system spec 記述粒度最適化 | L324 |
| 2026-03-06 - TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001 Phase 12準拠再確認（未タスク診断強化） | L353 |

### references/logs-archive-2026-03-line-budget-reform-formalize.md

| セクション | 行 |
|------------|----|
| 2026-03-12 - TASK-IMP-TASK-SPECIFICATION-CREATOR-LINE-BUDGET-REFORM-001 system spec sync | L5 |
| 2026-03-12 - TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 未タスク formalize | L23 |
| 2026-03-12 - TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 12 再確認追補 | L40 |
| 2026-03-12 - TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 仕様書集約（再利用導線最適化） | L57 |
| 2026-03-12 - TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 1-12 同期 | L74 |
| 2026-03-12 - TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 の spec_created 追補を system spec へ同期 | L92 |
| 2026-03-11 - TASK-UI-04C follow-up の未タスク formalize を system spec へ同期 | L110 |
| 2026-03-11 - TASK-UI-04C follow-up の未タスク formalize を system spec へ同期 | L128 |
| 2026-03-11 - TASK-UI-04C の cross-cutting system spec 入口を補完 | L146 |
| 2026-03-11 - TASK-UI-04C-WORKSPACE-PREVIEW を system spec 正本へ同期 | L164 |
| 2026-03-11 - TASK-UI-04B-WORKSPACE-CHAT Phase 12 仕様同期 | L182 |
| 2026-03-11 - TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 global light remediation 仕様同期 | L200 |
| 2026-03-11 - TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001 completed workflow 同期 | L217 |
| 2026-03-11 - UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 完了移管 | L234 |
| 2026-03-11 - UT-IMP-APIKEY-CHAT-TRIPLE-SYNC-GUARD-001 追加 | L251 |
| 2026-03-11 - TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 Phase 12再確認（ユーザー再依頼） | L268 |
| 2026-03-11 - TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 仕様書集約（再利用導線最適化） | L286 |
| 2026-03-11 - TASK-FIX-APIKEY-CHAT-TOOL-INTEGRATION-001 Phase 12 再監査同期 | L303 |
| 2026-03-11 - TASK-UI-07 由来の dual skill-root follow-up を system spec へ登録 | L321 |
| 2026-03-11 - TASK-UI-07 の UI カタログ要約カードを system spec へ追加 | L338 |

### references/logs-archive-2026-03-line-budget-workflow-consolidation.md

| セクション | 行 |
|------------|----|
| 2026-03-13 - TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 workflow spec consolidation | L5 |
| 2026-03-06 - TASK-043B 再監査の状態契約・参照導線補強 | L34 |
| 2026-03-06 - TASK-043B Phase 12準拠再確認と skill 改善同期 | L59 |
| 2026-03-06 - TASK-043B 由来の legacy 未タスク正規化課題を分離 | L83 |
| 2026-03-06 - TASK-043B の簡潔解決手順を UI 機能仕様へ追補 | L105 |
| 2026-03-06 - TASK-043B 由来の skill import 契約横展開UTを追加 | L125 |
| 2026-03-06 - TASK-10A-E-C Phase 12再確認（仕様同期 + 画面証跡補完） | L150 |
| 2026-03-06 - TASK-10A-E-C Phase 12 準拠再確認（苦戦箇所同期 + 未タスク整形） | L173 |
| 2026-03-09 - TASK-10A-F P50検証ワークフロー実行（Phase 1-13完了） | L196 |
| 2026-03-08 - TASK-10A-E-D/TASK-UI-03/TASK-10A-F 仕様同期 | L211 |
| 2026-03-09 - TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 再監査追補 | L237 |
| 2026-03-09 - TASK-10A-G ライフサイクル統合テスト hardening と Phase 12再監査 | L260 |
| 2026-03-09 - TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | L287 |
| 2026-03-10 - TASK-10A-G | L303 |

### references/logs-archive-2026-03-mid-lifecycle-governance-improve.md

| セクション | 行 |
|------------|----|
| TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION 完了（2026-03-16） | L5 |
| TASK-FIX-ELECTRON-APP-MENU-ZOOM-001 完了（2026-03-16） | L20 |
| UT-06-001 完了（2026-03-16） | L31 |
| TASK-SKILL-LIFECYCLE-06 完了（2026-03-16） | L41 |
| UT-06-005 abort-skip-retry-fallback 完了（2026-03-16） | L59 |
| UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001（2026-03-20） | L73 |
| UT-TASK06-007 IPC契約ドリフト自動検出スクリプト完了（2026-03-18） | L93 |
| 2026-03-24: TASK-IMP-ADVANCED-CONSOLE-SAFETY-GOVERNANCE-001 | L142 |
| UT-SC-02-005 preload execute 型追従の Phase 12 整理（2026-03-25） | L150 |

### references/logs-archive-2026-03-notification-history-sigterm-guard.md

| セクション | 行 |
|------------|----|
| 2026-03-05 - TASK-UI-01-C Notification/HistorySearch 実装の Phase 12仕様同期 | L5 |
| 2026-03-05 - UT-IMP-DESKTOP-TESTRUN-SIGTERM-FALLBACK-GUARD-001 未タスク登録 | L35 |
| 2026-03-05 - TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 追補（SIGTERM運用ガード + 5分解決カード） | L65 |
| 2026-03-05 - TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 再監査（Phase 11画面証跡同期） | L94 |
| 2026-03-05 - TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 Phase 12同期 | L125 |
| 2026-03-05 - TASK-UI-01-A Phase 12追補（workflowパス正規化ガード） | L154 |
| 2026-03-05 - TASK-UI-01-A Phase 12準拠再確認（未タスク運用追補） | L185 |
| 2026-03-05 - TASK-UI-01-A-STORE-SLICE-BASELINE 再監査（仕様同期漏れ是正） | L215 |
| 2026-03-05 - UT-TASK-10A-B-009 未タスク起票（配置3分類 + target監査境界ガード） | L246 |
| 2026-03-05 - UT-TASK-10A-B-001 再利用最適化（クイック解決カード同期） | L276 |
| 2026-03-05 - UT-TASK-10A-B-001 最終再監査（未タスク配置是正） | L301 |
| 2026-03-04 - Phase 11 画面カバレッジマトリクス未記載 warning の未タスク化 | L330 |
| 2026-03-04 - UT workflow Phase 11証跡正規化（coverage validator fail是正） | L354 |

### references/logs-archive-2026-03-skill-views-completed-move.md

| セクション | 行 |
|------------|----|
| 2026-03-01 - TASK-UI-05B spec_created 同期 + 参照切れ是正 | L5 |
| 2026-03-01 - TASK-UI-05 completed-tasks 移管 | L36 |
| 2026-03-01 - UT-UI-05-007 未タスク登録（UI仕様同期ガード） | L65 |
| 2026-03-01 - TASK-UI-05 UI仕様書追補（未タスク6件 + 苦戦箇所） | L95 |
| 2026-03-01 - TASK-UI-05 Phase 12再確認（苦戦箇所テンプレート追補） | L124 |
| [実行日時: 2026-03-06T04:42:41.549Z] | L151 |
| 2026-03-01 - TASK-UI-05-SKILL-CENTER-VIEW Phase 12 最終同期 | L161 |
| 2026-03-02 - TASK-10A-B 再監査（画面証跡ベース）と仕様同期 | L196 |
| 2026-03-05 - UT-TASK-10A-B-001 完了同期（自動修正可能フィルタボタン） | L233 |
| 2026-03-05 - UT-TASK-10A-B-001 再監査追補（light証跡ドリフト是正） | L261 |
| 2026-03-05 - TASK-UI-01-C Phase 12準拠の再確認（指定ディレクトリ未タスク監査） | L290 |
| 2026-03-05 - TASK-FIX-AUTH-KEY-HANDLER-REGISTRATION-001 教訓同期追補 | L321 |
| 2026-03-05 - TASK-FIX-SKILL-EXECUTOR-AUTHKEY-DI-001 Phase 12仕様準拠の再確認 | L346 |
| 2026-03-06 - TASK-043B SkillManagementPanel import list refinement 完了同期 | L375 |

### references/logs-archive-2026-03-task-10a-c-final-audit.md

| セクション | 行 |
|------------|----|
| 2026-03-03 - TASK-10A-C 最終再確認（仕様反映 + 画面証跡） | L5 |
| 2026-03-02 - TASK-10A-C SubAgent責務分離の仕様固定 | L31 |
| 2026-03-02 - TASK-10A-C 教訓追補（lessons-learned同期） | L57 |
| 2026-03-02 - TASK-10A-C SkillCreateWizard 再監査と仕様同期（Phase 12 Step 1-A） | L76 |
| 2026-03-02 - TASK-10A-B SkillAnalysisView 実装完了（Phase 12 Step 1-A） | L101 |
| 2026-03-02 - UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001 未タスク登録 | L121 |
| 2026-03-02 - Phase 12準拠再確認（TASK-UI-05A / TASK-UI-05） | L146 |
| 2026-03-02 - TASK-UI-05A 再監査（実装実体同期 + 未タスク正本化） | L172 |
| 2026-03-01 - TASK-UI-05A 包括的監査・getFileTree仕様追加 | L201 |
| 2026-03-01 - TASK-UI-05A spec_created 再監査（画面証跡付き） | L219 |
| 2026-03-02 - TASK-UI-05B 仕様書別SubAgent最適化（6仕様書分割） | L248 |
| 2026-03-02 - TASK-UI-05B Phase 12 再確認追補（苦戦箇所の再資産化） | L284 |
| 2026-03-02 - TASK-UI-05B 実装完了再同期（spec_created残存解消 + 画面証跡再取得） | L318 |
| 2026-03-01 - TASK-UI-05B アーキテクチャ層仕様書追補（多角的検証で検出） | L356 |

### references/logs-archive-2026-03-workflow02-screenshot-guard.md

| セクション | 行 |
|------------|----|
| 2026-03-04 - workflow02 再確認（screenshot Port 5174 競合ガード同期） | L5 |
| 2026-03-04 - UT-IMP-PHASE12-SCREENSHOT-COMMAND-REGISTRATION-GUARD-001 完了状態の再同期 | L30 |
| 2026-03-04 - 未タスク仕様書（coverage include pathガード）をシステム仕様へ同期 | L53 |
| 2026-03-04 - SkillCenter削除導線ホットフィックス実測値の再確定（coverage include path是正） | L77 |
| 2026-03-04 - TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 第2回再確認（証跡・未タスク移管の最終同期） | L101 |
| 2026-03-04 - SkillCenter削除導線ホットフィックス再確認（テスト・仕様同期） | L125 |
| 2026-03-04 - Phase 12テンプレート最適化の仕様同期（preview preflight分岐） | L150 |
| 2026-03-04 - TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 再監査追補（preview preflight課題の分離） | L173 |
| 2026-03-04 - TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 再監査（漏れ補完） | L197 |
| 2026-03-04 - TASK-FIX-SKILL-IMPORT 3連続是正の仕様同期（再監査） | L224 |
| 2026-03-04 - TASK-10A-D 苦戦箇所の未タスク分離（2件） | L251 |
| 2026-03-04 - TASK-10A-D 仕様書別SubAgent運用の最適化 | L272 |
| 2026-03-04 - TASK-10A-D 再確認追補（Phase 12再検証 + 画面証跡解釈同期） | L291 |
| 2026-03-03 - TASK-10A-D 再監査追補（証跡再取得 + 未タスクリンク是正） | L311 |
| 2026-03-03 - TASK-10A-D スキルライフサイクルUI統合 完了同期 | L330 |
| 2026-03-03 - TASK-10A-C 未タスク仕様書2件の追加（再発防止ガード） | L352 |

### references/logs-archive-index.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| archive list | L7 |

### references/logs-archive-legacy.md

| セクション | 行 |
|------------|----|
| TASK-AUTH-CALLBACK-001: OAuth認証コールバックPKCE移行 | L6 |
| TASK-FIX-4-2-SKILL-STORE-PERSISTENCE | L58 |
| 変更履歴アーカイブ | L111 |

### references/patterns-advanced.md

| セクション | 行 |
|------------|----|
| 成功パターン | L6 |
| 失敗パターン（避けるべきこと） | L67 |
| ガイドライン | L321 |

### references/patterns-core.md

| セクション | 行 |
|------------|----|
| 目次 | L6 |

### references/patterns-details.md

| セクション | 行 |
|------------|----|
| 成功パターン | L6 |

### references/patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L13 |
| 関連ドキュメント | L18 |

### references/phase-12-documentation-retrospective.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 実施した内容 | L10 |
| 課題（苦戦ポイント） | L31 |
| 運用上の最適化提案 | L49 |
| 現在の状態 | L55 |

### references/plugin-development.md

| セクション | 行 |
|------------|----|
| プラグインアーキテクチャ概要 | L8 |
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
|------------|----|
| 変更履歴 | L8 |
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

### references/quality-requirements-advanced.md

| セクション | 行 |
|------------|----|
| 保守性 | L6 |
| アクセシビリティ | L106 |
| テストカバレッジ目標 | L125 |

### references/quality-requirements-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| パフォーマンス要件 | L37 |

### references/quality-requirements-details.md

| セクション | 行 |
|------------|----|
| テスト戦略（TDD実践ガイド） | L6 |
| セキュリティ | L343 |
| 可用性 | L371 |

### references/quality-requirements-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 完了タスク | L14 |
| 変更履歴 | L375 |

### references/rag-desktop-state.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| テーマ状態管理 | L16 |
| ワークスペース状態管理 | L37 |
| システムプロンプト状態管理 | L60 |
| IPCチャネル設計（チャット・LLM選択） | L98 |
| LLM選択アーキテクチャ | L121 |
| セキュリティ考慮事項 | L154 |
| 関連ドキュメント | L165 |

### references/rag-knowledge-graph.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
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
|------------|----|
| 変更履歴 | L10 |
| 概要 | L22 |
| GraphRAGクエリサービス | L28 |
| HybridRAG統合パイプライン | L104 |
| クエリタイプと検索重み | L185 |
| フォールバック設計 | L196 |
| パフォーマンス目標 | L210 |
| HybridRAGFactory | L222 |
| テスト品質 | L272 |
| 関連ドキュメント | L281 |

### references/rag-search-crag.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L14 |
| アーキテクチャ | L24 |
| 主要インターフェース | L50 |
| 型定義 | L70 |
| 設定オプション | L129 |
| 外部依存インターフェース | L151 |
| 定数 | L189 |
| 型ガード | L207 |
| アクション決定ロジック | L220 |
| テスト品質 | L230 |
| 関連ドキュメント | L240 |

### references/rag-search-graph.md

| セクション | 行 |
|------------|----|
| GraphSearchStrategyインターフェース | L14 |
| クエリタイプ | L24 |
| GraphSearchOptions | L34 |
| 依存インターフェース | L46 |
| スコアリング | L56 |
| 定数 | L66 |
| テスト品質 | L79 |
| 関連ドキュメント | L88 |

### references/rag-search-hybrid.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| HybridRAGEngineクラス | L29 |
| HybridRAGResponse | L56 |
| HybridRAGResult | L76 |
| PipelineStageResult | L88 |
| SearchOptions（HybridRAG） | L101 |
| HybridRAGOptions | L112 |
| 定数 | L121 |
| HybridRAGFactory | L131 |
| テスト品質 | L306 |
| 関連ドキュメント | L315 |

### references/rag-search-keyword.md

| セクション | 行 |
|------------|----|
| IKeywordSearchStrategy | L14 |
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
|------------|----|
| 主要型 | L14 |
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
|------------|----|
| ISearchStrategy実装 | L14 |
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
|------------|----|
| 変更履歴 | L10 |
| 概要 | L22 |
| クエリ分類器 | L28 |
| エンティティ抽出サービス (NER) | L88 |
| コミュニティ検出サービス (Leiden Algorithm) | L174 |
| 関連ドキュメント | L296 |
| Task08 完了記録（2026-03-19） | L304 |

### references/rag-vector-search.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
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
|------------|----|
| 概要 | L3 |
| 実装内容 | L7 |
| 苦戦した箇所と解決策 | L28 |
| 関連タスク | L63 |
| 参照 | L72 |
| 変更履歴 | L77 |

### references/spec-elegance-consistency-audit.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 期待する出力 | L17 |
| SubAgent-Lane 分割 | L27 |
| 多角的監査マトリクス | L38 |
| 監査順序 | L63 |
| 必須コマンド | L71 |
| 完了判定 | L96 |
| 失敗時の処理 | L107 |
| 今後追加時の反映境界 | L116 |
| 今後追加時の同一 wave checklist | L128 |
| ユーザー依頼テンプレ | L140 |

### references/spec-guidelines.md

| セクション | 行 |
|------------|----|
| テンプレート一覧 | L7 |
| 命名規則 | L29 |
| 記述形式 | L58 |
| すべきこと | L78 |
| 避けるべきこと | L87 |
| 新規仕様の追加手順 | L96 |
| 完了タスクセクション標準化 | L104 |
| ファイルサイズ管理 | L152 |

### references/spec-splitting-guidelines.md

| セクション | 行 |
|------------|----|
| 概要 | L7 |
| 分割判断基準 | L13 |
| インターフェース仕様（interfaces-）の分割パターン | L23 |
| 2026-03 line budget reform 標準パターン | L56 |
| アーキテクチャ仕様（architecture-）の分割パターン | L173 |
| API仕様（api-）の分割パターン | L195 |
| UI/UX仕様（ui-ux-）の分割パターン | L217 |
| セキュリティ仕様（security-）の分割パターン | L239 |
| データベース仕様（database-）の分割パターン | L261 |
| 技術スタック仕様（technology-）の分割パターン | L283 |
| ワークフロー仕様（workflow-）の分割パターン | L303 |
| Claude Code仕様（claude-code-）の分割パターン | L323 |
| 分割実行手順 | L344 |
| 命名規則 | L399 |
| 分割後のメンテナンス | L430 |
| 関連ドキュメント | L450 |
| 変更履歴 | L459 |

### references/task-workflow-active.md

| セクション | 行 |
|------------|----|
| 概要 | L7 |
| ドキュメント構成 | L34 |
| フェーズ構造（概要） | L43 |
| 品質ゲート（概要） | L74 |
| 出力テンプレート | L85 |
| 実行時のコマンド・エージェント・スキル | L108 |
| 昇格パターン集 | L132 |

### references/task-workflow-backlog-part2.md

| セクション | 行 |
|------------|----|
| 残課題（未タスク）続き | L4 |

### references/task-workflow-backlog.md

| セクション | 行 |
|------------|----|
| 残課題（未タスク） | L6 |
| 続き | L331 |
| 続き | L332 |
| 続き | L334 |
| 続き | L331 |
| 続き | L335 |

### references/task-workflow-completed-abort-contract-auth-session-chat.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| TASK-10A-B: SkillAnalysisView 実装完了記録（2026-03-02） | L278 |

### references/task-workflow-completed-advanced-views-analytics-audit.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/task-workflow-completed-agent-view-line-budget.md

| セクション | 行 |
|------------|----|
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT current workflow 再監査記録（2026-03-10） | L8 |
| TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001 Phase 1-12 実行記録（2026-03-12 JST） | L43 |
| 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 完了記録（2026-03-08） | L107 |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001 再監査同期（2026-03-10） | L127 |
| TASK-IMP-AIWORKFLOW-REQUIREMENTS-LINE-BUDGET-REFORM-001 | L164 |

### references/task-workflow-completed-chat-lifecycle-tests-part2.md

| セクション | 行 |
|------------|----|

### references/task-workflow-completed-chat-lifecycle-tests.md

| セクション | 行 |
|------------|----|
| 完了タスク | L9 |

### references/task-workflow-completed-debug-scheduler-doc-generation-theme.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/task-workflow-completed-ipc-contract-preload-alignment.md

| セクション | 行 |
|------------|----|
| 完了タスク | L7 |

### references/task-workflow-completed-ipc-graceful-degradation-lifecycle.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |
| TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 | L395 |

### references/task-workflow-completed-ipc-preload-foundation.md

| セクション | 行 |
|------------|----|

### references/task-workflow-completed-notification-history-auth-key-state.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/task-workflow-completed-quality-gates-module-resolution-logging.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/task-workflow-completed-recent-2026-03a.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-03b.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-03c.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-03d.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-03e.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-04a.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |

### references/task-workflow-completed-recent-2026-04b.md

| セクション | 行 |
|------------|----|
| 完了タスク | L4 |
| UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001: task-specification-creator Phase-12 テンプレート改善 | L184 |

### references/task-workflow-completed-recent-2026-04c.md

| セクション | 行 |
|------------|----|

### references/task-workflow-completed-recent-2026-04d.md

| セクション | 行 |
|------------|----|
| 2026-04-12 - UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 trackEvent E2E UI reach close-out sync | L7 |
| 2026-04-11 - UT-SKILL-WIZARD-FB-03 fallback spec clarification close-out sync | L27 |

### references/task-workflow-completed-recent-2026-04e.md

| セクション | 行 |
|------------|----|
| TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 | L301 |
| UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001 | L318 |
| TASK-UI-SCHEDULE-CRON-MONTHLY-GUARD-001 | L340 |

### references/task-workflow-completed-recent-2026-04f.md

| セクション | 行 |
|------------|----|

### references/task-workflow-completed-skill-create-ui-integration.md

| セクション | 行 |
|------------|----|
| TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02） | L8 |
| TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03） | L75 |
| TASK-SC-08-E2E-VALIDATION: Skill Creator LLM統合 E2E検証 + TerminalHandoff（2026-03-25） | L363 |

### references/task-workflow-completed-skill-import-skill-center-nav.md

| セクション | 行 |
|------------|----|
| 完了タスク | L6 |

### references/task-workflow-completed-skill-lifecycle-agent-view-line-budget.md

| セクション | 行 |
|------------|----|
| TASK-FIX-ELECTRON-APP-MENU-ZOOM-001: Electronアプリケーションメニュー初期化・ズームショートカット対応 完了記録（2026-03-16） | L20 |
| TASK-SKILL-LIFECYCLE-07: ライフサイクル履歴・フィードバック統合 設計完了記録（2026-03-16） | L81 |
| TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02） | L131 |

### references/task-workflow-completed-skill-lifecycle-archive-2026-03.md

| セクション | 行 |
|------------|----|
| TASK-IMP-CHATPANEL-REAL-AI-CHAT-001: ChatPanel Real AI Chat 配線 設計完了記録（2026-03-18） | L9 |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001: ViewType/renderView 基盤拡張 完了記録（2026-03-17） | L42 |
| UT-06-003: DefaultSafetyGate 具象クラス実装完了記録（2026-03-16） | L91 |
| UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16） | L129 |
| UT-06-005-A: PreToolUse Hook fallback 統合完了記録（2026-03-17） | L166 |
| TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合 再監査記録（2026-03-14） | L193 |
| TASK-SKILL-LIFECYCLE-05: 作成済みスキルを使う主導線（設計タスク）完了記録（2026-03-15） | L231 |
| TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合（設計タスク）仕様書作成完了記録（2026-03-16） | L264 |
| TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16） | L290 |

### references/task-workflow-completed-skill-lifecycle-authfix.md

| セクション | 行 |
|------------|----|
| 完了タスク | L9 |

### references/task-workflow-completed-skill-lifecycle-design.md

| セクション | 行 |
|------------|----|
| TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合 再監査記録（2026-03-14） | L8 |
| TASK-SKILL-LIFECYCLE-05: 作成済みスキルを使う主導線（設計タスク）完了記録（2026-03-15） | L93 |
| TASK-SKILL-LIFECYCLE-05: 作成済みスキル利用導線 再監査記録（2026-03-15） | L115 |
| TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合（設計タスク）仕様書作成完了記録（2026-03-16） | L168 |
| TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16） | L205 |
| Task09-12: スキルライフサイクル統合 UI GAP 解消 + 状態遷移完成 仕様書作成記録（2026-03-18） | L254 |
| UT-SC-02-002: execute() terminal_handoff 分岐追加 完了記録（2026-03-23） | L295 |

### references/task-workflow-completed-skill-lifecycle-security.md

| セクション | 行 |
|------------|----|
| UT-06-003: DefaultSafetyGate 具象クラス実装完了記録（2026-03-16） | L7 |
| UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16） | L45 |
| TASK-SKILL-LIFECYCLE-06: 信頼・権限ガバナンス（設計タスク）完了記録（2026-03-16） | L82 |
| UT-06-002: AllowedToolEntryV2 PermissionStore V2 拡張完了記録（2026-03-23） | L129 |

### references/task-workflow-completed-skill-lifecycle-ui-verify.md

| セクション | 行 |
|------------|----|
| TASK-RT-03-VERIFY-IMPROVE-PANEL-001: Verify / Improve 結果パネル実装 完了記録（2026-04-04） | L7 |
| TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合 再監査記録（2026-03-14） | L48 |
| TASK-SKILL-LIFECYCLE-05: 作成済みスキルを使う主導線（設計タスク）完了記録（2026-03-15） | L133 |
| TASK-SKILL-LIFECYCLE-05: 作成済みスキル利用導線 再監査記録（2026-03-15） | L155 |
| TASK-SKILL-LIFECYCLE-08: スキル共有・公開・互換性統合（設計タスク）仕様書作成完了記録（2026-03-16） | L218 |
| Task09-12: スキルライフサイクル統合 UI GAP 解消 + 状態遷移完成 仕様書作成記録（2026-03-18） | L255 |
| TASK-RT-05: multi_select ユーザー入力種別追加 完了記録（2026-03-30） | L298 |
| UT-LIFECYCLE-EXECUTION-STATUS-TYPE-SPEC-SYNC-001: SkillExecutionStatus型3値追加の仕様書同期 完了記録（2026-03-20） | L349 |

### references/task-workflow-completed-skill-lifecycle-ui.md

| セクション | 行 |
|------------|----|
| TASK-RT-03: SkillCreationResultPanel orchestration wrapper 完了記録（2026-04-06） | L7 |
| TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001: ViewType/renderView 基盤拡張 完了記録（2026-03-17） | L49 |
| TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001: SkillDetailPanel action buttons handoff 完了記録（2026-03-19） | L98 |
| TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001: AgentView 改善導線 round-trip 完了記録（2026-03-20） | L137 |
| TASK-10A-C: SkillCreateWizard 実装完了記録（2026-03-02） | L193 |
| TASK-10A-D: スキルライフサイクルUI統合 実装完了記録（2026-03-03） | L260 |

### references/task-workflow-completed-skill-lifecycle.md

| セクション | 行 |
|------------|----|
| 分割ファイル一覧 | L7 |
| タスクID 逆引き | L14 |

### references/task-workflow-completed-ui-ux-visual-baseline-drift.md

| セクション | 行 |
|------------|----|
| メタ情報 | L9 |
| 完了記録 | L20 |
| 関連ドキュメント | L55 |
| 変更履歴 | L66 |

### references/task-workflow-completed-ut-06-safety-gate.md

| セクション | 行 |
|------------|----|
| UT-06-003: DefaultSafetyGate 具象クラス実装完了記録（2026-03-16） | L8 |
| UT-06-003-PRELOAD-API-IMPL: evaluateSafety Preload API 追加完了記録（2026-03-23） | L46 |
| UT-06-005: abort/skip/retry/timeout Permission Fallback 実装完了記録（2026-03-16） | L85 |
| UT-06-001: tool-risk-config-implementation 完了記録（2026-03-16） | L122 |

### references/task-workflow-completed-workspace-chat-lifecycle-tests.md

### references/task-workflow-completed-workspace.md

| セクション | 行 |
|------------|----|

### references/task-workflow-completed.md

| セクション | 行 |
|------------|----|
| 最近の完了タスク（2026-04） | L7 |
| 2026-04-13 - TASK-SW-FIX-MODE-MGMT-001 SkillCreateWizard mode/state current facts sync | L29 |
| 2026-04-14 - TASK-SW-FIX-UI-001 UI整合性修正 current facts sync | L49 |
| 2026-04-14 - TASK-SW-FIX-STATE-DETAIL-001 state detail current facts sync | L50 |
| 2026-04-12 - UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001 trackEvent E2E UI reach close-out sync | L62 |
| 完了タスク（2026-03後半） | L90 |
| 完了タスク（機能別アーカイブ） | L98 |
| UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001: task-specification-creator Phase-12 テンプレート改善 | L198 |

### references/task-workflow-history.md

| セクション | 行 |
|------------|----|
| 関連ドキュメント | L6 |
| 変更履歴 | L16 |

### references/task-workflow-phases.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| フェーズ構造 | L18 |
| 出力テンプレート | L189 |
| Phase 12/13 Close-out Workflow（2026-04-07追加） | L218 |

### references/task-workflow-rules.md

| セクション | 行 |
|------------|----|
| 品質ゲート | L8 |
| コマンド・エージェント・スキル選定ルール | L37 |
| タスク分解ルール | L94 |
| ドキュメント更新ルール | L115 |
| 実行時のコマンド・エージェント・スキル | L136 |
| 関連ドキュメント | L160 |

### references/task-workflow.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L13 |
| 利用順序 | L42 |
| 関連ドキュメント | L47 |
| 仕様書インデックス | L15 |
| 利用順序 | L45 |
| 関連ドキュメント | L51 |
| 仕様書インデックス | L17 |
| 利用順序 | L101 |
| 関連ドキュメント | L106 |

### references/testing-accessibility.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| 1. ARIA属性テスト | L17 |
| 2. キーボードナビゲーション | L105 |
| 3. スクリーンリーダー互換性 | L169 |
| 4. 色とコントラスト | L214 |
| 5. 検証チェックリスト | L244 |
| 6. 自動テストツール | L270 |
| 7. WCAG 2.1 AAチェックリスト | L300 |
| 参照 | L327 |
| 変更履歴 | L335 |

### references/testing-component-patterns-advanced.md

| セクション | 行 |
|------------|----|
| 13. Atoms コンポーネントテストパターン（TASK-UI-00-ATOMS） | L6 |
| 14. Preload Shape 異常系テストパターン（2026-03-07追加） | L108 |
| 15. SettingsView 統合ハーネスパターン（2026-03-08追加） | L164 |
| 16. 統合テストハーネスパターン | L198 |

### references/testing-component-patterns-core.md

| セクション | 行 |
|------------|----|
| 概要 | L6 |
| 1. Storeモッキングパターン | L15 |
| 2. テストデータファクトリ | L80 |
| 3. アクセシビリティテスト | L150 |
| 4. キーボードナビゲーション | L204 |
| 5. 非同期テスト | L243 |
| 6. テスト構成 | L281 |
| 7. userEvent vs fireEvent | L317 |
| 8. テストファイル分離パターン（TASK-FIX-4-2） | L340 |

### references/testing-component-patterns-details.md

| セクション | 行 |
|------------|----|
| 9. Zustand Store Hooks テストパターン | L6 |
| 9.1 AuthMode 契約テストパターン（TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001） | L187 |
| 10. Main Process SDKテスト有効化パターン（TASK-FIX-11-1-SDK-TEST-ENABLEMENT） | L240 |
| 11. SkillEditor テストパターン（TASK-9A completed） | L300 |
| 12. テーマ横断テストヘルパー（TASK-UI-00-TOKENS） | L369 |

### references/testing-component-patterns-history.md

| セクション | 行 |
|------------|----|
| 参照 | L6 |
| 関連未タスク | L15 |
| 変更履歴 | L25 |

### references/testing-component-patterns.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| 仕様書インデックス | L6 |
| 利用順序 | L14 |
| 関連ドキュメント | L19 |

### references/testing-dialog-patterns.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
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
|------------|----|
| 概要 | L9 |
| 1. ファクトリ関数パターン | L16 |
| 2. 境界値フィクスチャ | L106 |
| 3. Storeモック構築 | L155 |
| 4. Propsビルダー | L209 |
| 5. Providerラッパー | L251 |
| 6. フィクスチャファイル構成 | L308 |
| 7. ベストプラクティス | L349 |
| 8. electronAPI Mock ファクトリ | L371 |
| 参照 | L438 |
| 変更履歴 | L446 |

### references/testing-playwright-e2e.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L8 |
| 概要 | L18 |
| テスト構成 | L24 |
| セレクター戦略 | L48 |
| 待機戦略 | L82 |
| ヘルパー関数パターン | L118 |
| テストスイート構造 | L163 |
| アクセシビリティテスト | L210 |
| beforeEachパターン | L245 |
| テストスキップパターン | L271 |
| CI/CD統合 | L287 |
| デバッグパターン | L339 |
| 関連ドキュメント | L361 |

### references/ui-history-components.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| ファイル構成 | L18 |
| コンポーネント構成 | L41 |
| Props定義 | L92 |
| カスタムフック | L130 |
| 関連ドキュメント | L210 |

### references/ui-history-data-types.md

| セクション | 行 |
|------------|----|
| 変更履歴 | L10 |
| データ型 | L19 |
| IPC通信 | L99 |
| 関連ドキュメント | L142 |

### references/ui-history-design.md

| セクション | 行 |
|------------|----|
| UI設計 | L10 |
| アクセシビリティ | L74 |
| エラーハンドリング | L140 |
| パフォーマンス | L190 |
| 関連ドキュメント | L211 |
| 変更履歴 | L219 |

### references/ui-history-integration.md

| セクション | 行 |
|------------|----|
| テストカバレッジ | L10 |
| 統合手順 | L34 |
| 統合ステータス | L53 |
| IPCハンドラー詳細（history-ipc-handlers） | L85 |
| タスク依存関係一覧 | L119 |
| タスク: history-preload-setup（2026-01-13完了） | L133 |
| タスク: history-manual-testing（2026-01-17完了） | L163 |
| 残課題 | L211 |
| 関連ドキュメント | L225 |

### references/ui-history-search-view.md

| セクション | 行 |
|------------|----|
| 概要 | L10 |
| 実装内容（要点） | L25 |
| UI責務 | L37 |
| コンポーネント構成 | L50 |
| 状態・導線契約 | L66 |
| IPC契約 | L105 |
| テスト・画面検証 | L124 |
| 苦戦箇所（再利用形式） | L149 |
| ライフサイクルタイムライン観測項目（TASK-SKILL-LIFECYCLE-07） | L167 |
| 関連ドキュメント | L189 |
| 変更履歴 | L199 |

### references/ui-result-panel-pattern.md

| セクション | 行 |
|------------|----|
| 概要 | L3 |
| コンポーネント構成 | L7 |
| 重要設計決定 | L25 |
| コンポーネント設計パターン早見表 | L65 |
| テスト戦略 | L74 |
| SkillLifecyclePanel 責務別props分離パターン | L82 |

---

