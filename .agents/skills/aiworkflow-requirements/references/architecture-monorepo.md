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

### `@repo/shared` サブパス解決運用（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001）

`@repo/shared` のサブパス解決は、以下の3層を同時に整合させる。

| 層 | 正本ファイル | 役割 |
| --- | --- | --- |
| 公開境界 | `packages/shared/package.json` (`exports`, `typesVersions`) | サブパスの公開契約 |
| TypeScript型解決 | `apps/desktop/tsconfig.json` (`compilerOptions.paths`) | `tsc --noEmit` の解決 |
| テスト時解決 | `apps/desktop/vitest.config.ts` (`vite-tsconfig-paths`) | Vitest 実行時に `tsconfig.paths` を自動解決 |

#### 三層モジュール解決アーキテクチャ

```
[npm 公開境界層]        [TypeScript 解決層]      [テスト解決層]
package.json            tsconfig.json            vitest.config.ts
├─ exports              ├─ compilerOptions       ├─ plugins
│  └─ サブパスマップ     │  └─ paths              │  └─ vite-tsconfig-paths
└─ typesVersions        │     └─ サブパスマップ    └─ resolve.alias(アプリ内用のみ)
   └─ 型解決マップ      └─ include
                           └─ 補助宣言ファイル

同期方向: exports(正本) → paths(TypeScript用) → plugin経由でVitest解決
```

Vitest は標準設定では tsconfig の paths を自動参照しないが、本プロジェクトでは `vite-tsconfig-paths` を使用して `paths` を参照する。`@repo/shared` については手動 alias 同期を不要とし、`exports` と `paths` を正本として運用する。

#### 運用ルール

- `exports` にサブパスを追加した場合、同一PRで `paths` を更新し `pnpm check:module-sync` を実行する
- 3層の定義順序は「具体サブパス → ルート (`@repo/shared`)」を守る（後述の paths 定義順序ルール参照）
- 3層の解決先は同一ソースを指すこと
- `resolve.alias` は `@` / `@renderer` / `@main` などアプリ内 alias のみ管理する
- 回帰防止として以下の整合性テストを維持する
  `apps/desktop/src/__tests__/shared-module-resolution.test.ts`（59テスト）
  `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts`（108テスト）
  `packages/shared/src/__tests__/module-resolution.test.ts`（57テスト）

#### paths 定義順序ルール

TypeScript の `compilerOptions.paths` は**上から順に照合**される。具体的なサブパスを先に、汎用パターンを後に定義しないと、汎用パターンが先にマッチして誤った解決先を返す。

| 定義順序 | パスパターン | 解決先 |
| --- | --- | --- |
| 先（具体的） | `@repo/shared/types/auth` | `packages/shared/types/auth.ts` |
| 先（具体的） | `@repo/shared/agent/types` | `packages/shared/src/agent/types.ts` |
| 先（具体的） | `@repo/shared/services/graph` | `packages/shared/src/services/graph/index.ts` |
| 後（汎用） | `@repo/shared/*` | `packages/shared/src/*` |
| 最後（ルート） | `@repo/shared` | `packages/shared/src/index.ts` |

この順序を逆にすると、`@repo/shared/types/auth` が `@repo/shared/*` に先にマッチし、`packages/shared/src/types/auth`（存在しない可能性あり）に解決されて TS2307 エラーとなる。

#### サブパス追加の具体例（before/after）

新しいサブパス `@repo/shared/utils/format` を追加する場合の3ファイル変更:

**1. packages/shared/package.json**（exports + typesVersions）:

| 変更種別 | キー | 値 |
| --- | --- | --- |
| exports 追加 | `"./utils/format"` | `"./src/utils/format.ts"` |
| typesVersions 追加 | `"utils/format"` | `["src/utils/format.ts"]` |

**2. apps/desktop/tsconfig.json**（compilerOptions.paths）:

| 変更種別 | キー | 値 |
| --- | --- | --- |
| paths 追加（`@repo/shared/*` より前に配置） | `"@repo/shared/utils/format"` | `["../../packages/shared/src/utils/format.ts"]` |

**3. packages/shared/tsup.config.ts**（entry、ビルド対象の場合のみ）:

| 変更種別 | キー | 値 |
| --- | --- | --- |
| entry 追加 | `"utils/format"` | `"src/utils/format.ts"` |

#### ソース構造の二重性

`packages/shared` には以下の2つのソース配置パターンが混在している:

| パターン | パス例 | 特徴 |
| --- | --- | --- |
| ルート直下 | `packages/shared/types/auth.ts` | `src/` を経由しない |
| src 配下 | `packages/shared/src/types/index.ts` | 標準的な src ディレクトリ構成 |

paths マッピングでは解決先がどちらのパターンかを正確に指定する必要がある。誤ったパスを指定すると TS2307 が発生する。

#### 補足（ソース直接参照時）

`apps/desktop` が `packages/shared/src` を直接参照する場合、shared側の補助型宣言も読み込む。
現行運用では `apps/desktop/tsconfig.json` の `include` に `../../packages/shared/src/agent/@anthropic-ai-claude-agent-sdk.d.ts` を含める。

#### 関連タスク

| タスクID | 概要 | 仕様書パス | ステータス |
| --- | --- | --- | --- |
| UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 | vitest-tsconfig-paths プラグイン導入による alias 手動同期の自動化 | `docs/30-workflows/vitest-tsconfig-paths-sync/` | **完了**（2026-02-24） |
| TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 | @repo/shared ソース構造二重性の統一（types/ と src/types/ の整理） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-refactor-shared-source-structure-consolidation.md` | 未着手 |
| TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 | @repo/shared モジュール解決3層整合CIガード | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/` | **完了**（2026-02-22） |

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

## 完了タスク

### TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001（2026-02-22完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 |
| 概要 | `@repo/shared` サブパス解決の3層整合（`exports` / `paths` / `alias`）をCIで自動検証するガードスクリプト追加 |
| 成果物 | `scripts/check-shared-module-sync.ts`（検証スクリプト）、GitHub Actions `check-module-sync` ジョブ |
| テスト | 43テスト全PASS（Line 98.38%, Branch 96.96%, Function 100%） |
| Issue | #845 |

#### 実装時の苦戦箇所と対処

| 苦戦箇所 | 原因 | 対処 |
| --- | --- | --- |
| Phase 10 MINOR（M1/M2/M3）の残置 | コア検証機能の実装を優先し、レポート表現（修正ガイダンス/件数サマリー/シグネチャ整合）が後回しになった | 派生未タスク `TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001` を起票し、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` に登録してP3 3ステップ（指示書/残課題表/参照リンク）を完了 |
| Phase 12証跡と仕様書本体状態の不一致リスク | 成果物生成が先行すると、仕様書本体のステータス同期が漏れやすい | Phase 12で `verify-all-specs` / `validate-phase-output` を実行し、成果物・仕様書・台帳の3点を同時確認 |
| 未タスク監査結果の誤読リスク | リポジトリ全体には既存の未準拠ファイルが多く、対象タスク由来の課題と混同しやすい | 監査結果を「全体ベースライン」と「今回対象ファイル」に分離し、対象（`task-imp-module-sync-report-enhancement.md`）のみテンプレート準拠を個別確認 |

---

### TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001（2026-02-20完了）

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| 概要 | `@repo/shared` サブパス解決を `exports` / `paths` / `alias` の三層整合運用へ統一 |
| 成果物 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-12/system-docs-update-log.md` |

---

## 変更履歴

| バージョン | 日付       | 変更内容                                                                 |
| ---------- | ---------- | ------------------------------------------------------------------------ |
| v1.5.0     | 2026-02-24 | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001再監査反映: `vite-tsconfig-paths` 導入後の運用へ更新（Vitest解決層をplugin参照へ変更、`@repo/shared` 手動alias同期の廃止、サブパス追加手順を3ファイル運用に修正） |
| v1.4.0     | 2026-02-22 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 の実装苦戦箇所と対処を追加（Phase 10 MINOR統合未タスク化、Phase 12証跡同期、未タスク監査のベースライン分離） |
| v1.3.0     | 2026-02-22 | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001: 3層整合CIガード完了タスク記録追加。関連未タスクテーブルにステータス列追加、TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001を完了に更新 |
| v1.2.0     | 2026-02-20 | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001: `@repo/shared` サブパス解決運用を追加（exports/paths/alias 三層整合、ソース直接参照時の補助型宣言取り込み） |
| v1.1.0     | 2026-01-26 | spec-guidelines準拠: 全コードブロックを表形式・文章に変換                |
| v1.0.0     | -          | 初版作成                                                                 |
