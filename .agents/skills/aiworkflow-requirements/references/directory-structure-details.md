# ディレクトリ構造（モノレポ） / detail specification

> 親仕様書: [directory-structure.md](directory-structure.md)
> 役割: detail specification

## ルートの設定ファイル群

| ファイル                  | 役割                                   |
| ------------------------- | -------------------------------------- |
| package.json              | ワークスペースルート                   |
| pnpm-workspace.yaml       | pnpmワークスペース設定                 |
| tsconfig.json             | TypeScript基本設定                     |
| tsconfig.base.json        | 共通TypeScript設定                     |
| .eslintrc.js              | ESLint設定                             |
| .prettierrc               | Prettier設定                           |
| vitest.config.ts          | Vitest設定                             |
| .env.example              | 環境変数サンプル                       |
| .gitignore                | Git無視設定                            |
| .husky/post-checkout      | **worktree切替時の自動クリーンアップ** |
| scripts/setup-worktree.sh | **worktree手動セットアップスクリプト** |
| README.md                 | プロジェクト説明                       |

---

## 機能追加の手順

### 新機能追加フロー

**ステップ1: フォルダ作成**

- apps/web/src/features/[feature-name]/ を作成する

**ステップ2: 必須ファイル作成**

| ファイル         | 役割                  |
| ---------------- | --------------------- |
| schema.ts        | 入出力スキーマ（Zod） |
| executor.ts      | ビジネスロジック      |
| executor.test.ts | ユニットテスト        |
| api.ts           | APIハンドラー         |

**ステップ3: オプションファイル作成**

| ファイル/フォルダ | 用途           |
| ----------------- | -------------- |
| hooks/            | 機能固有フック |
| components/       | 機能固有UI     |

**ステップ4: API登録**

- apps/web/src/app/api/v1/[feature-name]/route.ts を作成する

**影響範囲**: 新規フォルダのみ、既存コードの変更なし

---

## 構造の選択理由

### 機能ベース vs レイヤーベース

| 比較項目         | レイヤーベース         | 機能ベース（採用） |
| ---------------- | ---------------------- | ------------------ |
| ファイル配置     | 型別に分散             | 機能でまとめる     |
| 新機能追加       | 複数フォルダに分散     | 1フォルダで完結    |
| 機能削除         | 複数箇所から削除       | フォルダ削除のみ   |
| 関連ファイル確認 | 探し回る必要あり       | 同じ場所にある     |
| テスト管理       | テストが実装から離れる | テストが実装の隣   |
| 初心者の理解     | 難しい                 | 直感的             |

---

## 依存関係ルール

### 依存方向（逆方向禁止）

| 依存元                          | 依存先                          |
| ------------------------------- | ------------------------------- |
| apps/\*/                        | features/                       |
| features/                       | packages/shared/infrastructure/ |
| packages/shared/infrastructure/ | packages/shared/core/           |
| apps/\*/                        | packages/shared/ui/             |
| packages/shared/ui/             | packages/shared/core/           |

**違反検出**: ESLint eslint-plugin-boundaries で強制

### 各層の責務

| 層             | パス                            | 責務                                         |
| -------------- | ------------------------------- | -------------------------------------------- |
| Core           | packages/shared/core/           | ビジネスルール、エンティティ（外部依存ゼロ） |
| Infrastructure | packages/shared/infrastructure/ | 外部サービス接続（DB、AI、Discord）          |
| UI             | packages/shared/ui/             | 共通UIコンポーネント、Design Tokens          |
| Features       | apps/\*/features/               | プラットフォーム固有の機能ロジック           |
| App            | apps/web/app/                   | Next.js App Router、API Routes               |
| Desktop        | apps/desktop/src/               | Electron Main/Preload/Renderer               |

### apps/desktop テスト基盤

| パス                                                     | 役割                               |
| -------------------------------------------------------- | ---------------------------------- |
| src/__tests__/                                           | E2Eテスト・統合テストルート        |
| src/__tests__/__fixtures__/skills/                       | **E2Eテストフィクスチャ**          |
| src/__tests__/__fixtures__/skills/test-skill/            | 完全構成スキル（SKILL.md + サブリソース） |
| src/__tests__/__fixtures__/skills/test-skill/SKILL.md    | スキル定義（Frontmatter + body）   |
| src/__tests__/__fixtures__/skills/test-skill/agents/     | エージェントサブリソース           |
| src/__tests__/__fixtures__/skills/test-skill/references/ | 参照サブリソース                   |
| src/__tests__/__fixtures__/skills/another-skill/         | 最小構成スキル（SKILL.md のみ）    |
| src/__tests__/__fixtures__/skills/invalid-skill/         | 無効スキル（SKILL.md なし）        |
| src/__tests__/fixtures/skills.fixture.test.ts            | フィクスチャ検証テスト（29ケース） |
| src/main/services/skill/__tests__/__fixtures__/          | ユニットテスト用フィクスチャ（独立） |
| src/test/                                                | テストユーティリティ               |

> **詳細**: [quality-e2e-testing.md](./quality-e2e-testing.md)

---

## pnpm-workspace 設定

### ワークスペース構成

| パッケージパス | 説明                 |
| -------------- | -------------------- |
| packages/\*    | 共有パッケージ       |
| apps/\*        | アプリケーション     |
| local-agent    | ローカルエージェント |

### 依存関係の指定方法

| 依存元       | 依存先       | 指定方法     |
| ------------ | ------------ | ------------ |
| apps/web     | @repo/shared | workspace:\* |
| apps/desktop | @repo/shared | workspace:\* |

---

