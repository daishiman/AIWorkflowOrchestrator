---
name: .claude/skills/command-naming-conventions/SKILL.md
description: |
  コマンドの命名規則を専門とするスキル。
  動詞ベース命名、kebab-case、名前空間の活用、
  発見可能性の高い命名設計を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-naming-conventions/resources/naming-rules.md`: kebab-case形式・動詞ベース命名・2-4語の長さ制限と一貫性保持の基本ルールと命名パターン集
  - `.claude/skills/command-naming-conventions/templates/naming-checklist.md`: kebab-case確認・動詞開始・3-20文字範囲・目的推測可能性・重複回避の5項目チェックリスト
  - `.claude/skills/command-naming-conventions/scripts/validate-naming.mjs`: 命名規則検証スクリプト

  使用タイミング:
  - コマンド名を決定する時
  - 名前空間構造を設計する時
  - 既存コマンドとの一貫性を保ちたい時

  Use proactively when naming commands, designing namespace structure,
  or maintaining naming consistency.
version: 1.0.0
---

# Command Naming Conventions

## 概要

このスキルは、Claude Codeコマンドの命名規則を提供します。
動詞ベース命名、kebab-case、名前空間の活用により、
発見可能性が高く、一貫性のあるコマンド命名を実現できます。

**主要な価値**:

- 統一された命名規則
- 発見可能性の向上
- 命名衝突の回避
- プロフェッショナルな印象

**対象ユーザー**:

- コマンドを作成するエージェント（.claude/agents/command-arch.md）
- 命名規則を統一したい開発者
- チーム全体で一貫性を保ちたいプロジェクト

## リソース構造

```
command-naming-conventions/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── verb-based-naming.md                   # 動詞ベース命名詳細
│   ├── kebab-case-guide.md                    # kebab-caseガイド
│   ├── namespace-design.md                    # 名前空間設計
│   └── naming-checklist.md                    # 命名チェックリスト
└── templates/
    └── naming-template.md                     # 命名テンプレート
```

### リソース種別

- **命名詳細** (`resources/*.md`): 各命名規則の詳細仕様
- **チェックリスト** (`resources/naming-checklist.md`): 命名時の確認事項
- **テンプレート** (`templates/naming-template.md`): 命名パターンテンプレート

## いつ使うか

### シナリオ1: 新規コマンド命名

**状況**: 新しいコマンドの名前を決定したい

**適用条件**:

- [ ] 適切な動詞が不明
- [ ] kebab-caseのルールを知らない
- [ ] 既存コマンドとの一貫性を保ちたい

**期待される成果**: 明確で一貫性のある命名

### シナリオ2: 名前空間設計

**状況**: コマンドを論理的にグループ化したい

**適用条件**:

- [ ] 多数のコマンドがある
- [ ] 命名衝突を避けたい
- [ ] 組織化が必要

**期待される成果**: 論理的な名前空間構造

### シナリオ3: 既存コマンドのリファクタリング

**状況**: 既存コマンドの命名を改善したい

**適用条件**:

- [ ] 命名が不一致
- [ ] 発見しにくい
- [ ] 命名規則が統一されていない

**期待される成果**: 統一された命名規則

## 基本原則

### 1. 動詞ベース命名

```
推奨パターン: [動詞]-[対象]

例:
✓ create-component
✓ deploy-staging
✓ review-code
✓ test-integration

避けるべき:
✗ component (動詞がない)
✗ staging-deploy (動詞が後)
✗ code-review-tool (余分な単語)
```

### 2. kebab-case の使用

```
形式: lowercase-with-hyphens

✓ 正しい:
  - create-feature
  - run-tests
  - deploy-production

✗ 間違い:
  - createFeature (camelCase)
  - create_feature (snake_case)
  - CreateFeature (PascalCase)
  - create.feature (ドット区切り)
```

### 3. 簡潔さと明確さのバランス

```
✓ 適切な長さ:
  - deploy          (シンプルで明確)
  - create-component (2-3単語)
  - analyze-performance (3単語まで)

✗ 長すぎる:
  - create-new-react-component-with-tests-and-storybook (長すぎ)

✗ 短すぎる:
  - do (何をするか不明)
  - run (何を実行するか不明)
```

## 動詞の選択

### 主要な動詞

| 動詞         | 用途     | 例                                  |
| ------------ | -------- | ----------------------------------- |
| **create**   | 新規作成 | create-component, create-migration  |
| **generate** | 自動生成 | generate-docs, generate-types       |
| **build**    | ビルド   | build-app, build-docker             |
| **deploy**   | デプロイ | deploy-staging, deploy-production   |
| **test**     | テスト   | test-unit, test-e2e                 |
| **run**      | 実行     | run-migrations, run-benchmarks      |
| **analyze**  | 分析     | analyze-bundle, analyze-performance |
| **review**   | レビュー | review-code, review-security        |
| **update**   | 更新     | update-deps, update-version         |
| **delete**   | 削除     | delete-cache, delete-temp-files     |
| **fix**      | 修正     | fix-lint, fix-types                 |
| **migrate**  | 移行     | migrate-db, migrate-config          |
| **sync**     | 同期     | sync-env, sync-remote               |
| **check**    | チェック | check-types, check-security         |

### 動詞の優先順位

```
具体的 > 一般的

✓ 推奨:
  - deploy (具体的)
  - migrate (具体的)
  - analyze (具体的)

✗ 避ける:
  - do (一般的すぎ)
  - handle (一般的すぎ)
  - process (一般的すぎ)
```

## 対象の選択

### 具体的な対象

```
✓ 明確:
  - create-component
  - deploy-api
  - test-auth
  - review-pr

✗ 曖昧:
  - create-thing
  - deploy-stuff
  - test-code
```

### 階層的な対象

```
一般 → 具体的

レベル1（一般）:
  - test

レベル2（カテゴリ）:
  - test-unit
  - test-integration
  - test-e2e

レベル3（具体的）:
  - test-unit-auth
  - test-integration-api
  - test-e2e-checkout
```

## 名前空間の設計

### フラット vs 階層

**フラット構造（小規模プロジェクト）**:

```bash
.claude/commands/
├── deploy.md
├── test.md
├── build.md
└── review.md

起動: /deploy, /test, /build, /review
```

**階層構造（推奨）**:

```bash
.claude/commands/
├── git/
│   ├── commit.md      # /project:git:commit
│   ├── push.md        # /project:git:push
│   └── pr.md          # /project:git:pr
├── test/
│   ├── unit.md        # /project:test:unit
│   ├── integration.md # /project:test:integration
│   └── e2e.md         # /project:test:e2e
└── deploy/
    ├── staging.md     # /project:deploy:staging
    └── production.md  # /project:deploy:production
```

### 名前空間の選択

```
カテゴリ別:
  - git/ (Gitコマンド)
  - test/ (テストコマンド)
  - deploy/ (デプロイコマンド)
  - db/ (データベースコマンド)

機能別:
  - auth/ (認証関連)
  - api/ (API関連)
  - ui/ (UI関連)

環境別:
  - dev/ (開発環境)
  - staging/ (ステージング)
  - prod/ (本番環境)
```

## 命名パターン集

### CRUD操作

```
create-[resource]
read-[resource]
update-[resource]
delete-[resource]

例:
  - create-user
  - read-config
  - update-settings
  - delete-cache
```

### テスト関連

```
test-[scope]
check-[aspect]
verify-[condition]

例:
  - test-unit
  - check-types
  - verify-build
```

### デプロイ関連

```
deploy-[environment]
release-[version]
rollback-[target]

例:
  - deploy-staging
  - release-v1
  - rollback-migration
```

### 分析関連

```
analyze-[target]
inspect-[component]
profile-[aspect]

例:
  - analyze-bundle
  - inspect-deps
  - profile-performance
```

## 命名チェックリスト

### 作成前の確認

- [ ] 動詞で始まっているか？
- [ ] kebab-caseか？
- [ ] 2-4単語で収まっているか？
- [ ] 目的が明確か？
- [ ] 既存コマンドと重複していないか？
- [ ] 既存コマンドと一貫性があるか？

### 名前空間の確認

- [ ] 適切なカテゴリに配置されているか？
- [ ] 階層が深すぎないか？（2-3レベル）
- [ ] 同じカテゴリ内で一貫性があるか？

### 発見可能性の確認

- [ ] 検索しやすい名前か？
- [ ] 推測しやすい名前か？
- [ ] 説明的な名前か？

## 悪い例と良い例

### 例1: 動詞の欠如

```
✗ 悪い: /component
✓ 良い: /create-component

理由: 何をするか不明確
```

### 例2: 一貫性の欠如

```
✗ 悪い:
  - /buildApp
  - /test-unit
  - /Deploy_staging

✓ 良い:
  - /build-app
  - /test-unit
  - /deploy-staging

理由: 統一されたkebab-case
```

### 例3: 長すぎる名前

```
✗ 悪い: /create-new-react-component-with-tests-and-storybook
✓ 良い: /create-component

理由: 詳細はdescriptionとargument-hintに
```

### 例4: 曖昧な名前

```
✗ 悪い: /do-stuff
✓ 良い: /deploy-staging

理由: 具体的で明確
```

### 例5: 名前空間の不使用

```
✗ 悪い:
  - /test-unit.md
  - /test-integration.md
  - /test-e2e.md

✓ 良い:
  - /test/unit.md      → /project:test:unit
  - /test/integration.md → /project:test:integration
  - /test/e2e.md       → /project:test:e2e

理由: 組織化と発見可能性
```

## リファクタリングガイド

### 既存コマンドの改善

**ステップ1: 監査**

```bash
# 既存コマンドを一覧表示
ls -R .claude/commands/

# 命名規則違反を特定
# - camelCase
# - snake_case
# - 動詞なし
# - 長すぎる
```

**ステップ2: 分類**

```
カテゴリ別にグループ化:
  - Git操作
  - テスト
  - デプロイ
  - 開発ツール
```

**ステップ3: リネーム**

```
命名規則適用:
  - 動詞ベース
  - kebab-case
  - 簡潔明確
```

**ステップ4: 名前空間化**

```
ディレクトリに移動:
  - git/
  - test/
  - deploy/
```

## 詳細リソースの参照

### 動詞ベース命名

詳細は `resources/verb-based-naming.md` を参照

### kebab-caseガイド

詳細は `resources/kebab-case-guide.md` を参照

### 名前空間設計

詳細は `resources/namespace-design.md` を参照

### 命名チェックリスト

完全版は `resources/naming-checklist.md` を参照

### テンプレート

命名パターンテンプレートは `templates/naming-template.md` を参照

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 命名ルール
cat .claude/skills/command-naming-conventions/resources/naming-rules.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-naming-conventions/resources/naming-rules.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-naming-conventions/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-naming-conventions
```

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - ファイル構造と配置
- `.claude/skills/command-placement-priority/SKILL.md` - 名前空間と優先順位
- `.claude/skills/command-documentation-patterns/SKILL.md` - description記述

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
