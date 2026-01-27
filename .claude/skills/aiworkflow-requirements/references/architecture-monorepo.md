# モノレポ アーキテクチャ設計

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## モノレポアーキテクチャ

### レイヤー定義

| レイヤー             | ディレクトリ                      | 責務                                   | 依存許可                           | 共有範囲          |
| -------------------- | --------------------------------- | -------------------------------------- | ---------------------------------- | ----------------- |
| 共通ドメイン         | packages/shared/core/             | 共通エンティティ、インターフェース定義 | なし（外部依存ゼロ）               | Web + Desktop     |
| 型定義層             | packages/shared/src/types/rag/    | RAG型定義、Zodスキーマ、バリデーション | なし（外部依存ゼロ）               | Web + Desktop     |
| **ドメインサービス** | **packages/shared/src/services/** | **ファイル変換等のドメインロジック**   | **shared/types/rag のみ**          | **Web + Desktop** |
| 共通UI               | packages/shared/ui/               | UIコンポーネント、Design Tokens        | shared/core のみ                   | Web + Desktop     |
| 共通インフラ         | packages/shared/infrastructure/   | DB、AI、Discord等の共通サービス        | shared/core のみ                   | Web + Desktop     |
| **グラフサービス**   | **packages/shared/src/services/graph/** | **Knowledge Graph、Community検出** | **shared/types/rag のみ**          | **Web + Desktop** |
| 機能プラグイン       | apps/web/features/                | 機能ごとのビジネスロジック             | shared/\*                          | Web専用           |
| Web API層            | apps/web/app/                     | HTTPエンドポイント、Next.js App Router | すべて                             | Web専用           |
| Desktop Main         | apps/desktop/src/main/            | システムAPI、IPC、ウィンドウ管理       | shared/infrastructure, shared/core | Desktop専用       |
| Desktop Renderer     | apps/desktop/src/renderer/        | React UI、クライアント状態管理         | shared/ui, shared/core             | Desktop専用       |

### 依存関係ルール

**依存の方向**（以下の方向のみ許可、逆方向は禁止）:

| 依存元                          | 依存先                                                 |
| ------------------------------- | ------------------------------------------------------ |
| apps/web/app/                   | apps/web/features/, packages/shared/\*                 |
| apps/web/features/              | packages/shared/infrastructure/, packages/shared/core/ |
| apps/desktop/renderer/          | packages/shared/ui/, packages/shared/core/             |
| apps/desktop/main/              | packages/shared/infrastructure/, packages/shared/core/ |
| packages/shared/infrastructure/ | packages/shared/core/, packages/shared/src/types/rag/  |
| packages/shared/ui/             | packages/shared/core/, packages/shared/src/types/rag/  |
| packages/shared/src/types/rag/  | なし（外部依存ゼロ）                                   |
| packages/shared/core/           | なし（外部依存ゼロ）                                   |

**違反検出**:

- ESLint eslint-plugin-boundaries を使用して依存関係違反をCIでブロックする
- PRマージ条件として依存関係チェックを必須とする

### pnpm 依存解決ルール

本プロジェクトでは pnpm の厳格モード（`node-linker=isolated`）を使用しています。

**.npmrc 設定**:

| 設定項目    | 値         | 説明                                             |
| ----------- | ---------- | ------------------------------------------------ |
| node-linker | `isolated` | パッケージを分離モードで配置し、幽霊依存を防止する |

**厳格モードの特徴**:

| 特徴               | 説明                                                          |
| ------------------ | ------------------------------------------------------------- |
| 明示的依存のみ許可 | package.json に宣言された依存関係のみアクセス可能             |
| 幽霊依存の防止     | 宣言していない依存へのアクセスを自動的にブロック              |
| シンボリックリンク | node_modules 内はシンボリックリンクで構成され、重複を排除     |
| 再現性の保証       | pnpm-lock.yaml により全環境で同一の依存ツリーを再現           |

**重要ルール: 直接importには直接宣言が必要**

パッケージが外部ライブラリを直接 `import` する場合、そのパッケージ自身の `package.json` に依存を宣言する必要があります。

**依存宣言パターンの比較**:

| パターン | package.json | import文 | 結果 |
| -------- | ------------ | -------- | ---- |
| 幽霊依存（NG） | SDK宣言なし | `@anthropic-ai/claude-agent-sdk` を import | ERR_MODULE_NOT_FOUND（ランタイムエラー） |
| 明示的依存（OK） | `dependencies` に SDK を宣言 | `@anthropic-ai/claude-agent-sdk` を import | 正常に解決 |

**具体例（packages/shared）**:

- 誤った構成: `packages/shared/package.json` に SDK を宣言せず、`src/agent/agent-client.ts` で import するとランタイムエラーが発生する
- 正しい構成: `packages/shared/package.json` の `dependencies` に `@anthropic-ai/claude-agent-sdk` を追加し、その後で import する

**workspace: プロトコルとの関係**:

- `workspace:*` は内部パッケージ（例: `@repo/shared`）の参照に使用
- 外部パッケージ（npm registry）はバージョン指定（例: `^0.2.5`）で宣言
- 消費側（apps/desktop）が依存を宣言していても、提供側（packages/shared）で import する場合は提供側にも宣言が必要

**テスト時と実行時の違い**:

| 環境     | 動作                                         | 幽霊依存の検出 |
| -------- | -------------------------------------------- | -------------- |
| vitest   | モック/エイリアスで代替可能                  | 検出されない   |
| Electron | 実際の node_modules から解決                 | 即時エラー     |

> 参考実装: AGENT-SDK-DEP-FIX タスク（packages/shared への SDK 依存追加）

### 主要原則

| 原則                     | 説明                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| 内側から外側への依存禁止 | packages/shared/core/ は外部依存ゼロを維持する                   |
| 機能の独立性             | features/ 各機能は相互依存禁止とする                             |
| 共通コードの活用         | UI、ビジネスロジック、インフラを packages/shared/ で共有する     |
| プラットフォーム分離     | Web固有（apps/web）とDesktop固有（apps/desktop）を明確に分離する |

### モノレポ構造の利点

| 利点         | 説明                                                          |
| ------------ | ------------------------------------------------------------- |
| コード再利用 | UIコンポーネント、ビジネスロジック、型定義をWeb/Desktopで共有 |
| 一貫性       | 同一のDesign TokensとコンポーネントによりUI/UXを統一          |
| 変更容易性   | 1箇所の変更が両プラットフォームに反映                         |
| 独立デプロイ | Web（Railway）とDesktop（GitHub Releases）を独立して管理      |
| テスト効率   | 共通コンポーネントのテストを一度だけ実装                      |

---

## 型エクスポートパターン

### バレルファイル戦略

サービス単位で`index.ts`を作成し、外部公開する型と値を一元管理する。

**実装場所**: `packages/shared/src/services/{service}/index.ts`

### services/graph エクスポート構造

**ファイルパス**: `packages/shared/src/services/graph/index.ts`

**モジュール**: `@repo/shared/services/graph` - Knowledge Graphサービスの公開インターフェースを提供する。

**型エクスポート（export type）**:

コンパイル後は消える型定義。`./types` からre-exportする。

| カテゴリ     | エクスポート型                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Entity関連   | StoredEntity, ExtractedEntity, EntityMention                                                                                      |
| Relation関連 | StoredRelation, ExtractedRelation, RelationEvidence                                                                               |
| Graph関連    | GraphNode, GraphPath, GraphTraversalResult, GraphStats, GraphEdge                                                                 |
| Community関連 | Community, CommunitySummary, CommunityStructure, CommunityDetectionOptions, CommunityDetectionResult, CommunityDetectionStats, CommunitySummarizationOptions, CommunitySummarizationResult |
| Query関連    | EntityQuery, TraversalOptions, RelationQueryOptions                                                                               |

**値エクスポート（export）**:

ランタイムに存在する値。`./types` からre-exportする。

| カテゴリ       | エクスポート値                                            |
| -------------- | --------------------------------------------------------- |
| エラーコード   | CommunityErrorCode, CommunitySummarizationErrorCode       |
| エラークラス   | CommunityDetectionError, CommunitySummarizationError      |
| ユーティリティ | normalizeEntityName                                       |

### エクスポート一覧

| カテゴリ      | 項目数 | エクスポート形式    | 例                               |
| ------------- | ------ | ------------------- | -------------------------------- |
| インターフェース | 22    | `export type { }`   | Community, StoredEntity          |
| 列挙型 (enum)   | 2     | `export { }`        | CommunityErrorCode               |
| クラス (class)  | 2     | `export { }`        | CommunityDetectionError          |
| 関数           | 1     | `export { }`        | normalizeEntityName              |

### 使用例

**インポートパターン**:

| 用途             | インポート形式   | 対象                                                        | インポート元                        |
| ---------------- | ---------------- | ----------------------------------------------------------- | ----------------------------------- |
| 型のインポート   | `import type { }` | Community, CommunitySummary, StoredEntity 等                | `@repo/shared/services/graph`       |
| 値のインポート   | `import { }`      | CommunityErrorCode, CommunityDetectionError, normalizeEntityName | `@repo/shared/services/graph` |

**使用上の注意**:

- 型（interface, type alias）は `import type` を使用してインポートする（Tree-shaking最適化のため）
- 値（enum, class, function）は通常の `import` を使用する
- 両方を混在させる場合は、別々のインポート文に分けることを推奨

### 下位互換性

| インポートパス                              | 状態        |
| ------------------------------------------- | ----------- |
| `from "./types"` (services/graph内部)       | ✅ 継続動作 |
| `from "../graph/types"` (他サービス)        | ✅ 継続動作 |
| `from "@repo/shared/services/graph"` (新規) | ✅ 新規追加 |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                 |
| ---------- | ---------- | ------------------------------------------------------------------------ |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: 全コードブロックを表形式・文章に変換                |
| v1.0.0     | -          | 初版作成                                                                 |
