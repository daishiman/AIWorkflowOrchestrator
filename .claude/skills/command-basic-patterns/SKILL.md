---
name: command-basic-patterns
description: |
  4つの基本実装パターンを専門とするスキル。
  シンプル指示型、ステップバイステップ型、条件分岐型、ファイル参照型の
  選択基準と実装例を提供します。

  使用タイミング:
  - コマンドの複雑度に応じたパターンを選択する時
  - 既存コマンドのパターンを理解したい時
  - ワークフローの構造化方法を知りたい時

  Use proactively when selecting command patterns, understanding existing commands,
  or structuring workflows.
version: 1.0.0
---

# Command Basic Patterns

## 概要

このスキルは、Claude Codeコマンドの4つの基本実装パターンを提供します。
各パターンの選択基準、実装例、使い分けにより、
コマンドの複雑度に応じた最適な構造を選択できます。

**主要な価値**:
- 4つのパターンの完全理解
- 複雑度に応じた適切な選択
- パターンごとのベストプラクティス
- 実装例と応用方法

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- ワークフローを構造化したい開発者
- パターンを学びたいチーム

## リソース構造

```
command-basic-patterns/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── pattern1-simple-instruction.md         # シンプル指示型詳細
│   ├── pattern2-step-by-step.md               # ステップバイステップ型詳細
│   ├── pattern3-conditional.md                # 条件分岐型詳細
│   ├── pattern4-file-reference.md             # ファイル参照型詳細
│   └── pattern-selection-guide.md             # パターン選択ガイド
└── templates/
    ├── simple-instruction-template.md         # パターン1テンプレート
    ├── step-by-step-template.md               # パターン2テンプレート
    ├── conditional-template.md                # パターン3テンプレート
    └── file-reference-template.md             # パターン4テンプレート
```

### リソース種別

- **パターン詳細** (`resources/pattern*.md`): 各パターンの詳細仕様と実例
- **選択ガイド** (`resources/pattern-selection-guide.md`): 意思決定フローチャート
- **テンプレート** (`templates/`): パターン別のテンプレート

## いつ使うか

### シナリオ1: パターン選択
**状況**: どのパターンを使うべきか判断したい

**適用条件**:
- [ ] コマンドの複雑度が不明
- [ ] 適切なパターンがわからない
- [ ] 複数パターンの組み合わせが必要

**期待される成果**: 最適なパターンの選択

### シナリオ2: 既存コマンドの理解
**状況**: 既存コマンドがどのパターンを使っているか理解したい

**適用条件**:
- [ ] パターンが混在している
- [ ] 各パターンの特徴を知りたい
- [ ] リファクタリングを検討している

**期待される成果**: パターンの特定と理解

### シナリオ3: ワークフローの構造化
**状況**: 複雑なワークフローを整理したい

**適用条件**:
- [ ] 複数ステップがある
- [ ] 条件分岐が必要
- [ ] 外部ファイルの参照が必要

**期待される成果**: 構造化されたワークフロー

## パターン1: シンプル指示型

### 用途
- 単一操作
- シンプルなワークフロー
- 明確な手順

### 適用例
- フォーマット
- 単純なビルド
- 基本的なテスト実行

### 実装例

```markdown
---
description: Format code with Prettier
---

# Code Formatting

Run Prettier on all JavaScript and TypeScript files:

```bash
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"
```

Verify formatting is correct.
```

### 特徴
- ✓ シンプルで理解しやすい
- ✓ 実行が速い
- ✓ メンテナンスが容易
- ✗ 複雑なロジックには不向き

## パターン2: ステップバイステップ型

### 用途
- 複数ステップの明確なワークフロー
- 順序が重要な処理
- 中間結果の確認が必要

### 適用例
- コンポーネント作成
- 機能実装
- 複雑なセットアップ

### 実装例

```markdown
---
description: Create a new React component with tests
---

# Create React Component

Component name: $ARGUMENTS

## Step 1: Create Component File
Create `src/components/$ARGUMENTS.tsx` with:
- TypeScript interface for props
- Functional component with hooks
- JSDoc comments

## Step 2: Create Test File
Create `src/components/$ARGUMENTS.test.tsx` with:
- Render test
- Props test
- Interaction tests

## Step 3: Update Index
Add export to `src/components/index.ts`

## Step 4: Verify
Run tests and type checking:
```bash
npm test -- $ARGUMENTS
npm run typecheck
```
```

### 特徴
- ✓ ステップが明確
- ✓ 進捗が追いやすい
- ✓ デバッグが容易
- ✗ 長くなりがち

## パターン3: 条件分岐型

### 用途
- 環境別処理
- 条件付き実行
- 動的ワークフロー

### 適用例
- 環境別デプロイ
- 条件付きテスト
- 動的ビルド

### 実装例

```markdown
---
description: Deploy to environment (staging/production)
---

# Deployment Command

Environment: $ARGUMENTS

## Environment Detection
Determine target environment from $ARGUMENTS:
- If "staging" → Deploy to staging
- If "production" → Deploy to production
- Else → Error

## Pre-deployment Checks
1. Run tests: `npm test`
2. Run linter: `npm run lint`
3. Build: `npm run build`

## Deployment Steps

### If Staging:
```bash
aws s3 sync dist/ s3://staging-bucket/
aws cloudfront create-invalidation --distribution-id STAGING_ID
```

### If Production:
```bash
# Require confirmation
aws s3 sync dist/ s3://production-bucket/
aws cloudfront create-invalidation --distribution-id PROD_ID
```

## Post-deployment
Verify deployment health:
```bash
curl -f https://$ARGUMENTS.example.com/health
```
```

### 特徴
- ✓ 柔軟性が高い
- ✓ 環境別処理が可能
- ✓ 再利用性が高い
- ✗ 複雑になりやすい

## パターン4: ファイル参照型

### 用途
- ガイドライン参照
- チェックリスト実行
- 標準遵守確認

### 適用例
- コードレビュー
- 品質チェック
- ドキュメント生成

### 実装例

```markdown
---
description: Review code following team guidelines
---

# Code Review

## Load Guidelines
Read team coding standards:
- @.claude/code-standards.md
- @.claude/review-checklist.md

## Review Criteria
Based on guidelines, check:
1. Code style consistency
2. Test coverage
3. Documentation
4. Security considerations
5. Performance implications

## Generate Review Comments
Create detailed review with:
- Issues found (with severity)
- Suggestions for improvement
- Approved sections
```

### 特徴
- ✓ ガイドラインの一元管理
- ✓ 一貫性の確保
- ✓ 更新が容易
- ✗ 外部ファイルへの依存

## パターン選択ガイド

### 意思決定フロー

```
コマンドの複雑度は？
│
├─ シンプル（1-3ステップ）
│  → パターン1: シンプル指示型
│
├─ 中程度（4-8ステップ）
│  │
│  ├─ 条件分岐が必要？
│  │  ├─ Yes → パターン3: 条件分岐型
│  │  └─ No  → パターン2: ステップバイステップ型
│  │
│  └─ 外部ファイル参照が必要？
│     └─ Yes → パターン4: ファイル参照型
│
└─ 複雑（9+ステップ）
   → パターン2 + パターン3の組み合わせ
   または
   → 高度な実装パターンを検討
```

### 選択基準

| 基準 | パターン1 | パターン2 | パターン3 | パターン4 |
|------|----------|----------|----------|----------|
| ステップ数 | 1-3 | 4-8 | 4-8 | 制約なし |
| 条件分岐 | なし | 少ない | 多い | 可能 |
| 外部参照 | なし | なし | なし | 必要 |
| 複雑度 | 低 | 中 | 中-高 | 中 |
| メンテナンス | 容易 | 容易 | 中 | 容易 |

## パターンの組み合わせ

### ステップバイステップ + 条件分岐

```markdown
## Step 1: Environment Detection
If $ARGUMENTS is "production":
  - Require additional approval
  - Use production configuration
Else:
  - Use staging configuration

## Step 2: Pre-deployment Checks
Run based on environment:
- Staging: Basic tests
- Production: Full test suite

## Step 3: Deployment
Execute environment-specific deployment
```

### ファイル参照 + 条件分岐

```markdown
## Load Configuration
Read environment-specific config:
- If staging: @.claude/config/staging.md
- If production: @.claude/config/production.md

## Apply Configuration
Based on loaded config, execute deployment
```

## 詳細リソースの参照

### パターン詳細
各パターンの詳細は `resources/pattern*.md` を参照

### 選択ガイド
意思決定フローチャートは `resources/pattern-selection-guide.md` を参照

### テンプレート
- パターン1: `templates/simple-instruction-template.md`
- パターン2: `templates/step-by-step-template.md`
- パターン3: `templates/conditional-template.md`
- パターン4: `templates/file-reference-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# パターン選択ガイド
cat .claude/skills/command-basic-patterns/resources/pattern-selection-guide.md
```

### テンプレート参照

```bash
# ステップバイステップテンプレート
cat .claude/skills/command-basic-patterns/templates/step-by-step-template.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-basic-patterns/resources/pattern-selection-guide.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-basic-patterns/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-basic-patterns
```

## 関連スキル

- `.claude/skills/command-advanced-patterns/SKILL.md` - パイプライン、メタコマンド、インタラクティブ
- `.claude/skills/command-arguments-system/SKILL.md` - 条件分岐での引数使用
- `.claude/skills/command-error-handling/SKILL.md` - 各パターンでのエラーハンドリング

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
