# ディレクトリ構造（モノレポ） / core specification

> 親仕様書: [directory-structure.md](directory-structure.md)
> 役割: core specification

## 設計方針

### 変数表記の凡例

| 表記                  | 説明                       | 例                              |
| --------------------- | -------------------------- | ------------------------------- |
| [feature-name]/       | 機能名                     | workflow-executor, log-analyzer |
| [component-name].tsx  | コンポーネント名           | Button.tsx, Card.tsx            |
| [entity-name].ts      | エンティティ・型名         | workflow.ts, user.ts            |
| [service-name].ts     | サービス名                 | ai-client.ts, db.ts             |
| [page-name]/          | ページ名                   | dashboard/, settings/           |
| [test-target].test.ts | テスト対象ファイル名に対応 | workflow.test.ts                |

### モノレポ構造の採用理由

| パッケージ       | 役割                                            |
| ---------------- | ----------------------------------------------- |
| packages/shared/ | Web/Desktop共通のコード（UI、ロジック、型定義） |
| apps/web/        | Next.js Webアプリケーション                     |
| apps/desktop/    | Electronデスクトップアプリケーション            |

**メリット**:

- コード再利用: 1箇所の変更が両プラットフォームに反映
- 独立デプロイ: Web（Railway）とDesktop（GitHub Releases）を別々に管理

### 4つの基本原則

| 原則           | 説明                                         |
| -------------- | -------------------------------------------- |
| 機能ベース分離 | 機能ごとにフォルダを分け、関連ファイルを集約 |
| テストの同居   | 実装ファイルと同じ場所にテストを配置         |
| 階層の明確化   | 各階層の責務を明確にし、依存方向を制御       |
| 拡張容易性     | 新機能追加時は新フォルダ作成のみで完結       |

---

## ルート構造

| パス               | 説明                                                            |
| ------------------ | --------------------------------------------------------------- |
| .claude/           | AI開発アシスタント設定（agents、commands、skills）              |
| .claude/scripts/   | **Phase 12 ガード共通スクリプト（N/A判定ログ・三点突合・監査出力解析）** |
| docs/              | 仕様書（00-requirements、10-design、20-specifications、99-adr） |
| packages/shared/   | Web/Desktop共通コード                                           |
| apps/web/          | Next.js Webアプリ                                               |
| apps/desktop/      | Electronデスクトップアプリ                                      |
| local-agent/       | ローカルファイル監視エージェント                                |
| scripts/           | **プロジェクト管理スクリプト（setup-worktree.sh等）**           |
| .husky/            | **Gitフック（post-checkout等）**                                |
| .github/workflows/ | CI/CDワークフロー                                               |
| 設定ファイル群     | package.json、tsconfig.json等                                   |

**構造の特徴**:

- packages/shared/: 4階層（core → infrastructure → ui → types）で依存方向を制御
- apps/: 各アプリは独立してデプロイ可能
- docs/: 番号プレフィックスで整理（参照しやすい）

### docs/ 詳細構造

| パス                                                      | 役割                               |
| --------------------------------------------------------- | ---------------------------------- |
| 00-requirements/                                          | システム要件定義                   |
| 00-requirements/05-architecture.md                        | アーキテクチャ設計                 |
| 00-requirements/08-api-design.md                          | API設計                            |
| 00-requirements/17-security-guidelines.md                 | セキュリティガイドライン           |
| 10-design/                                                | 設計ドキュメント                   |
| 20-specifications/                                        | 仕様書                             |
| 30-api/                                                   | **APIリファレンス**                |
| 30-api/converters/                                        | コンバーターAPI仕様                |
| 30-api/converters/markdown-converter.md                   | MarkdownConverter API              |
| 30-api/converters/code-converter.md                       | CodeConverter API                  |
| 30-api/converters/yaml-converter.md                       | YAMLConverter API                  |
| 30-workflows/                                             | **ワークフロー・プロジェクト記録** |
| 30-workflows/rag-conversion-system/                       | RAG変換システムプロジェクト        |
| 30-workflows/rag-conversion-system/manual-test-report.md  | 手動テスト結果レポート             |
| 30-workflows/rag-conversion-system/quality-report.md      | 品質保証レポート                   |
| 30-workflows/rag-conversion-system/final-review-report.md | 最終レビューレポート               |
| 30-workflows/login-recovery/                              | **ログイン機能復旧プロジェクト**   |
| 30-workflows/login-recovery/README.md                     | プロジェクト完全ガイド             |
| 30-workflows/login-recovery/step11-final-review.md        | 最終レビュー結果                   |
| 30-workflows/login-recovery/step12-manual-test-guide.md   | 手動テストガイド                   |
| 40-manuals/                                               | **ユーザー/開発者マニュアル**      |
| 40-manuals/rag-conversion-guide.md                        | RAG変換システム使用ガイド          |
| 99-adr/                                                   | Architecture Decision Records      |

---

## packages/shared/ 詳細構造

### core/（ビジネスルール層）

| パス                            | 役割                       |
| ------------------------------- | -------------------------- |
| entities/                       | ドメインエンティティ定義   |
| entities/[entity-name].ts       | エンティティファイル       |
| entities/[entity-name].test.ts  | エンティティテスト         |
| interfaces/                     | インターフェース定義       |
| interfaces/[repository-name].ts | リポジトリインターフェース |
| interfaces/[service-name].ts    | サービスインターフェース   |
| errors/                         | ドメインエラー             |
| errors/[error-type].ts          | カスタムエラークラス       |

**特徴**: 外部依存ゼロを維持する

### infrastructure/（外部サービス接続層）

| パス                     | 役割                                      |
| ------------------------ | ----------------------------------------- |
| database/schema/         | Drizzleスキーマ定義                       |
| database/repositories/   | リポジトリ実装                            |
| database/client.ts       | DB接続クライアント                        |
| ai/providers/            | AIプロバイダー実装（OpenAI、Anthropic等） |
| ai/client.ts             | 統一AIクライアント                        |
| external/[service-name]/ | 外部サービス（Discord等）                 |
| logging/                 | ログ基盤                                  |

### packages/shared/src/db/（データベース詳細構造）

| パス                                    | 役割                                           |
| --------------------------------------- | ---------------------------------------------- |
| **スキーマ定義**                        |                                                |
| schema/index.ts                         | スキーマエントリーポイント（re-export）        |
| schema/chat-history.ts                  | チャット履歴スキーマ                           |
| schema/files.ts                         | RAGファイルメタデータスキーマ                  |
| schema/chunks.ts                        | RAGチャンクスキーマ + FTS5                     |
| schema/chunks-fts.ts                    | FTS5仮想テーブル管理関数                       |
| schema/conversions.ts                   | ファイル変換履歴スキーマ                       |
| schema/extracted-metadata.ts            | 抽出メタデータスキーマ                         |
| schema/relations.ts                     | テーブル間リレーション定義                     |
| **Knowledge Graphスキーマ**             |                                                |
| schema/graph/                           | Knowledge Graphテーブル群                      |
| schema/graph/entities.ts                | entitiesテーブル（ノード、52種類EntityType）   |
| schema/graph/relations.ts               | relationsテーブル（エッジ）※graphRelations    |
| schema/graph/relation-evidence.ts       | relation_evidenceテーブル（証拠）              |
| schema/graph/communities.ts             | communitiesテーブル（Leidenクラスター）        |
| schema/graph/junction-tables.ts         | entity_communities, chunk_entities中間テーブル |
| schema/graph/graph-relations.ts         | Drizzleリレーション定義（6リレーション）       |
| schema/graph/index.ts                   | バレルエクスポート                             |
| schema/graph/__tests__/                 | スキーマテスト（198ケース）                    |
| **検索クエリ**                          |                                                |
| queries/chunks-search.ts                | FTS5全文検索クエリ（キーワード/フレーズ/NEAR） |
| **データベース基盤**                    |                                                |
| env.ts                                  | 環境変数管理（Zod検証）                        |
| migrate.ts                              | マイグレーション実行スクリプト                 |
| utils.ts                                | データベースユーティリティ関数                 |
| index.ts                                | データベースクライアントエクスポート           |
| **テスト**                              |                                                |
| schema/**tests**/chunks.test.ts         | chunksスキーマテスト                           |
| schema/**tests**/chunks-fts.test.ts     | FTS5管理関数テスト（7ケース）                  |
| queries/**tests**/chunks-search.test.ts | FTS5検索クエリテスト（74ケース）               |
| **Repository実装**                      |                                                |
| repositories/index.ts                   | バレルエクスポート・ファクトリ関数             |
| repositories/base.repository.ts         | 基底Repositoryクラス（抽象、ジェネリクス）     |
| repositories/file.repository.ts         | FileRepository（filesテーブル、論理削除対応）  |
| repositories/chunk.repository.ts        | ChunkRepository（chunksテーブル、隣接取得）    |
| repositories/entity.repository.ts       | EntityRepository（entitiesテーブル、upsert）   |
| repositories/__tests__/                 | Repository単体テスト                           |

### ui/（共通UIコンポーネント層）

| パス        | 役割                                      |
| ----------- | ----------------------------------------- |
| primitives/ | 基本コンポーネント（Button、Input等）     |
| patterns/   | 複合コンポーネント（Form、Card等）        |
| tokens/     | Design Tokens（global、alias、component） |
| hooks/      | 共通カスタムフック                        |

### types/（共通型定義）

| パス                 | 役割                                    |
| -------------------- | --------------------------------------- |
| [domain-name].ts     | ドメイン型                              |
| api.ts               | API型                                   |
| rag/branded.ts       | RAG Branded Type定義（ID型）            |
| rag/interfaces.ts    | RAG共通インターフェース                 |
| rag/errors.ts        | RAGエラー型                             |
| rag/result.ts        | Result型（Railway Oriented Programming) |
| rag/file/            | RAGファイル・変換ドメイン型             |
| rag/file/types.ts    | 型定義・定数・インターフェース          |
| rag/file/schemas.ts  | Zodスキーマ（ランタイムバリデーション） |
| rag/file/utils.ts    | ユーティリティ関数                      |
| rag/file/index.ts    | バレルエクスポート                      |
| rag/graph/           | Knowledge Graph型定義                   |
| rag/graph/types.ts   | Entity・Relation・Community型定義       |
| rag/graph/schemas.ts | Zodスキーマ（カスタム制約含む）         |
| rag/graph/utils.ts   | PageRank、正規化等のユーティリティ      |
| rag/graph/index.ts   | バレルエクスポート                      |
| index.ts             | エクスポート                            |

### src/services/（ドメインサービス層）

| パス                                                       | 役割                                           |
| ---------------------------------------------------------- | ---------------------------------------------- |
| conversion/                                                | **ファイル変換サービス**                       |
| conversion/types.ts                                        | 変換関連型定義（IConverter, ConverterInput等） |
| conversion/base-converter.ts                               | BaseConverter抽象クラス（Template Method）     |
| conversion/converter-registry.ts                           | ConverterRegistry（Repository Pattern）        |
| conversion/conversion-service.ts                           | ConversionService（統括サービス）              |
| conversion/converters/                                     | **各種コンバーター実装**                       |
| conversion/converters/index.ts                             | コンバーター登録・エクスポート                 |
| conversion/converters/html-converter.ts                    | HTMLConverter実装                              |
| conversion/converters/csv-converter.ts                     | CSVConverter実装                               |
| conversion/converters/json-converter.ts                    | JSONConverter実装                              |
| conversion/converters/markdown-converter.ts                | MarkdownConverter実装                          |
| conversion/converters/code-converter.ts                    | CodeConverter実装                              |
| conversion/converters/yaml-converter.ts                    | YAMLConverter実装                              |
| conversion/converters/**tests**/                           | **コンバーターユニットテスト**                 |
| conversion/converters/**tests**/index.test.ts              | 登録処理テスト                                 |
| conversion/converters/**tests**/markdown-converter.test.ts | MarkdownConverterテスト（54ケース）            |
| conversion/converters/**tests**/code-converter.test.ts     | CodeConverterテスト（51ケース）                |
| conversion/converters/**tests**/yaml-converter.test.ts     | YAMLConverterテスト（61ケース）                |
| conversion/**manual-tests**/                               | **手動テストスクリプト**                       |
| conversion/**manual-tests**/run-manual-tests.ts            | 手動テスト実行スクリプト                       |
| conversion/**manual-tests**/fixtures/                      | テスト用サンプルファイル                       |
| conversion/**manual-tests**/fixtures/sample.md             | Markdownサンプル                               |
| conversion/**manual-tests**/fixtures/sample.ts             | TypeScriptサンプル                             |
| conversion/**manual-tests**/fixtures/sample.js             | JavaScriptサンプル                             |
| conversion/**manual-tests**/fixtures/sample.py             | Pythonサンプル                                 |
| conversion/**manual-tests**/fixtures/sample.yaml           | YAMLサンプル                                   |
| conversion/**manual-tests**/fixtures/empty.md              | 空ファイルサンプル                             |
| graph/                                                     | **Knowledge Graph Store サービス**             |
| graph/knowledge-graph-store.ts                             | KnowledgeGraphStore実装（17メソッド）          |
| graph/types.ts                                             | ストア固有の型定義                             |
| graph/index.ts                                             | バレルエクスポート                             |
| graph/__tests__/                                           | Knowledge Graph Store テスト                   |
| graph/__tests__/knowledge-graph-store.test.ts              | ストア機能テスト（178ケース）                  |
| extraction/                                                | **エンティティ抽出サービス (NER)**             |
| extraction/entity-extractor.ts                             | LLMベースエンティティ抽出                      |
| extraction/rule-based-extractor.ts                         | ルールベースエンティティ抽出                   |
| extraction/types.ts                                        | 抽出関連型定義                                 |
| extraction/__tests__/                                      | 抽出サービステスト                             |

**サービス層の特徴**:

- shared/types/rag のみに依存（外部ライブラリ依存を最小化）
- Result型でエラーハンドリング
- 100%テストカバレッジ（Phase 6で検証済み）
- Template Method・Repository・Singletonパターン適用

**依存方向**: types ← core ← infrastructure ← ui ← services（逆方向禁止）

---

## apps/web/ 詳細構造（Next.js）

### features/（機能ベース分離）

| パス                            | 役割                         |
| ------------------------------- | ---------------------------- |
| [feature-name]/schema.ts        | 入出力スキーマ（Zod）        |
| [feature-name]/executor.ts      | ビジネスロジック             |
| [feature-name]/executor.test.ts | ユニットテスト               |
| [feature-name]/api.ts           | API Routesハンドラー         |
| [feature-name]/hooks/           | 機能固有フック（オプション） |
| [feature-name]/components/      | 機能固有UI（オプション）     |

### app/（Next.js App Router）

| パス                            | 役割                           |
| ------------------------------- | ------------------------------ |
| layout.tsx                      | ルートレイアウト               |
| page.tsx                        | ホームページ                   |
| globals.css                     | グローバルスタイル             |
| api/v1/[resource-name]/route.ts | APIエンドポイント              |
| api/v1/health/route.ts          | ヘルスチェック                 |
| ([route-group])/                | Route Groups（レイアウト共有） |
| [page-name]/page.tsx            | 個別ページ（Server Component） |
| [page-name]/loading.tsx         | ローディングUI                 |

### components/（Web固有コンポーネント）

| パス    | 役割                                |
| ------- | ----------------------------------- |
| server/ | Server Components専用               |
| client/ | Client Components専用（use client） |

### lib/（Web固有ユーティリティ）

- ユーティリティ関数
- ヘルパー関数

---

## apps/desktop/ 詳細構造（Electron）

### main/（Main Process）

| パス                                     | 役割                                                             |
| ---------------------------------------- | ---------------------------------------------------------------- |
| index.ts                                 | エントリーポイント                                               |
| ipc/channels.ts                          | IPCチャネル定義（型定義）                                        |
| ipc/handlers/                            | ハンドラー実装                                                   |
| ipc/authHandlers.ts                      | 認証IPC（withValidation適用）                                    |
| ipc/workspaceHandlers.ts                 | ワークスペースIPC                                                |
| ipc/aiHandlers.ts                        | **AI/LLM チャットIPC（AI_CHAT、AI_CHECK_CONNECTION、AI_INDEX）** |
| ipc/validation.ts                        | 入力バリデーション                                               |
| auth/                                    | 認証フロー実装（TASK-AUTH-CALLBACK-001）                         |
| auth/pkce.ts                             | PKCE code_verifier/code_challenge生成（RFC 7636）                |
| auth/authCallbackServer.ts               | ローカルHTTPコールバックサーバー（127.0.0.1動的ポート）          |
| auth/authFlowOrchestrator.ts             | 認証フロー統合制御（State/PKCE/サーバー管理）                    |
| auth/__tests__/                          | 認証機能テスト（5スイート68テスト）                              |
| protocol/                                | カスタムプロトコル処理                                           |
| protocol/customProtocol.ts               | URLスキーム検証・パス抽出（extractProtocolPath）                 |
| infrastructure/secureStorage.ts          | トークン暗号化（safeStorage）                                    |
| infrastructure/security/ipc-validator.ts | IPC送信元検証（withValidation）                                  |
| services/                                | バックグラウンドサービス                                         |
| windows/                                 | ウィンドウ管理                                                   |
| config/                                  | 設定（security、app）                                            |

### preload/（セキュリティ境界）

| パス        | 役割                          |
| ----------- | ----------------------------- |
| index.ts    | contextBridge設定             |
| api.ts      | Renderer公開API定義           |
| channels.ts | 許可IPCチャネルホワイトリスト |
| types.d.ts  | 型定義（window.electronAPI）  |

### renderer/（React UI）

| パス        | 役割                        |
| ----------- | --------------------------- |
| App.tsx     | アプリルート                |
| main.tsx    | エントリーポイント          |
| views/      | 画面コンポーネント          |
| components/ | Atomic Designコンポーネント |
| hooks/      | IPC通信フック               |
| store/      | 状態管理（Zustand）         |
| styles/     | CSS/Design Tokens           |
| utils/      | ユーティリティ関数          |

### renderer/components/（Atomic Design）

| パス                                              | 役割                                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------- |
| atoms/                                            | 基本UI要素（Button、Input、Icon、Badge等）                           |
| molecules/                                        | 複合要素（Tooltip、NavIcon、FileTreeItem等）                         |
| molecules/LLMSelector/                            | **LLMプロバイダー/モデル選択ドロップダウン（100%テストカバレッジ）** |
| molecules/ChatMessage/                            | チャットメッセージ表示コンポーネント                                 |
| organisms/                                        | 機能単位（GlobalNavStrip、MobileNavBar、AppLayout、AppDock等）       |
| AuthGuard/                                        | **認証ガード（HOC）**                                                |
| AuthGuard/index.tsx                               | 認証状態による表示制御                                               |
| AuthGuard/LoadingScreen.tsx                       | ローディング画面                                                     |
| AuthGuard/types.ts                                | AuthGuard型定義                                                      |
| AuthGuard/hooks/useAuthState.ts                   | 認証状態取得フック                                                   |
| AuthGuard/utils/getAuthState.ts                   | 状態判定純粋関数                                                     |
| AuthGuard/AuthGuard.test.tsx                      | AuthGuardテスト（67 tests）                                          |
| AuthGuard/utils/getAuthState.test.ts              | getAuthState単体テスト（5 tests）                                    |
| organisms/AccountSection/                         | **アカウント管理セクション**                                         |
| AccountSection/index.tsx                          | プロフィール・アバター・連携管理UI                                   |
| AccountSection/AccountSection.test.tsx            | 基本機能テスト（55 tests）                                           |
| AccountSection/AccountSection.portal.test.tsx     | Portal機能テスト（27 tests）                                         |
| AccountSection/AccountSection.a11y.test.tsx       | アクセシビリティテスト（15 tests）                                   |
| AccountSection/AccountSection.edge-cases.test.tsx | エッジケーステスト（18 tests）                                       |

### renderer/views/（画面構成）

| パス           | 役割                                   |
| -------------- | -------------------------------------- |
| AuthView/      | **ログイン画面（OAuthボタン配置）**    |
| DashboardView/ | ホーム画面（挨拶・次の一手・最近のタイムライン） |
| EditorView/    | エディタ（ファイルツリー・編集）       |
| ChatView/      | AIチャット                             |
| GraphView/     | ナレッジグラフ                         |
| SettingsView/  | 設定画面                               |

### renderer/store/（Zustand状態管理）

| パス                  | 役割                                                                            |
| --------------------- | ------------------------------------------------------------------------------- |
| index.ts              | 統合ストア（createAppStore）                                                    |
| slices/               | 機能別スライス                                                                  |
| slices/authSlice      | **認証状態（ログイン、トークン、セッション）**                                  |
| slices/uiSlice        | UI状態（ビュー、レスポンシブ種別、ナビ開閉、ウィンドウサイズ）                  |
| slices/editorSlice    | エディタ状態（ファイル、フォルダ）                                              |
| slices/chatSlice      | **チャット状態（メッセージ、入力、LLM選択、システムプロンプト、テンプレート）** |
| slices/workspaceSlice | ワークスペース状態（複数フォルダ管理）                                          |
| types/workspace.ts    | Workspace型定義（Branded Types）                                                |

### Electron 3プロセスモデル

| プロセス | 環境                      | 役割             |
| -------- | ------------------------- | ---------------- |
| Main     | Node.js全API使用可        | システム操作担当 |
| Preload  | contextBridge経由         | 安全なAPI公開    |
| Renderer | Chromium環境、sandbox有効 | UIのみ担当       |

---

## local-agent/ 詳細構造

| パス          | 役割                     |
| ------------- | ------------------------ |
| src/index.ts  | エントリーポイント       |
| src/watchers/ | ファイル監視実装         |
| src/sync/     | クラウド同期クライアント |
| src/config/   | 設定                     |

---

## .github/workflows/ 詳細構造

| ファイル            | 役割                                |
| ------------------- | ----------------------------------- |
| ci.yml              | CI（テスト、lint、型チェック）      |
| deploy-web.yml      | Webデプロイ（Railway）              |
| release-desktop.yml | Electronリリース（GitHub Releases） |

---

