---
name: command-best-practices
description: |
  コマンド設計のベストプラクティスを専門とするスキル。
  単一責任原則、組み合わせ可能性、冪等性の原則、
  DRYの適用、保守性の高い設計を提供します。

  使用タイミング:
  - コマンド設計の原則を確認したい時
  - 既存コマンドをリファクタリングする時
  - 保守性の高いコマンドを設計する時

  Use proactively when designing commands, refactoring existing commands,
  or ensuring maintainable command architecture.
version: 1.0.0
---

# Command Best Practices

## 概要

このスキルは、Claude Codeコマンド設計のベストプラクティスを提供します。
単一責任原則、組み合わせ可能性、冪等性の3つの核心原則により、
保守性が高く、再利用可能で、信頼できるコマンドを作成できます。

**主要な価値**:
- 3つの核心原則の完全理解
- DRY原則の適用
- 保守性の高い設計
- 再利用可能なコマンド

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- 設計原則を学びたい開発者
- 高品質なコマンドを作成したいチーム

## リソース構造

```
command-best-practices/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── single-responsibility-principle.md     # 単一責任原則詳細
│   ├── composability-principle.md             # 組み合わせ可能性詳細
│   ├── idempotency-principle.md               # 冪等性原則詳細
│   └── maintainability-guide.md               # 保守性ガイド
└── templates/
    └── best-practice-checklist.md             # ベストプラクティスチェックリスト
```

### リソース種別

- **原則詳細** (`resources/*-principle.md`): 各原則の詳細仕様と実例
- **保守性ガイド** (`resources/maintainability-guide.md`): 保守性向上の方法
- **チェックリスト** (`templates/best-practice-checklist.md`): 設計時の確認事項

## いつ使うか

### シナリオ1: 新規コマンド設計
**状況**: 設計原則に従って新しいコマンドを作成したい

**適用条件**:
- [ ] 設計原則が不明
- [ ] どの原則を優先すべきか不明
- [ ] ベストプラクティスを適用したい

**期待される成果**: 原則に基づく堅牢な設計

### シナリオ2: 既存コマンドのリファクタリング
**状況**: 既存コマンドを改善したい

**適用条件**:
- [ ] コマンドが複雑すぎる
- [ ] 保守が困難
- [ ] 再利用できない

**期待される成果**: 改善されたコマンド設計

### シナリオ3: コードレビュー
**状況**: コマンドの品質を評価したい

**適用条件**:
- [ ] レビュー基準が不明
- [ ] 品質チェックポイントを知りたい
- [ ] 改善提案が必要

**期待される成果**: 具体的な改善提案

## 核心原則

### 原則1: 単一責任の原則（SRP）

**定義**: 各コマンドは1つのことだけを行うべき

#### 良い設計

```markdown
✓ 良い例:

/commit        - Git commit のみ
/test          - テスト実行のみ
/deploy        - デプロイのみ

各コマンドは明確な単一の責任を持つ
```

#### 悪い設計

```markdown
✗ 悪い例:

/do-everything - commit + test + deploy + notification + logging

問題点:
- 柔軟性がない（一部だけ実行できない）
- デバッグ困難（どこで失敗したかわかりにくい）
- 再利用不可（全てが必要な場合のみ使用可能）
- 保守困難（変更の影響範囲が広い）
```

#### リファクタリング例

**Before（悪い例）**:

```markdown
---
description: Complete CI/CD pipeline
---

# All-in-One Pipeline

1. Run linter
2. Run tests
3. Build application
4. Deploy to staging
5. Run smoke tests
6. Deploy to production
7. Send notifications
```

**After（良い例）**:

```markdown
# 個別コマンドに分割

## commands/lint.md
---
description: Run linter
---
# Lint Code
Run ESLint on codebase

## commands/test.md
---
description: Run tests
---
# Run Tests
Execute test suite

## commands/build.md
---
description: Build application
---
# Build App
Build for production

## commands/deploy.md
---
description: Deploy to environment
---
# Deploy
Deploy to specified environment

# 組み合わせコマンド（オプション）
## commands/ci-pipeline.md
---
description: Run CI pipeline
---
# CI Pipeline
Execute: /lint → /test → /build
```

### 原則2: 組み合わせ可能性の原則

**定義**: 小さなコマンドを組み合わせて大きなワークフローを構築できるべき

#### 設計パターン

```markdown
Small Building Blocks:
┌────────┐  ┌────────┐  ┌────────┐
│ /lint  │  │ /test  │  │ /build │
└────────┘  └────────┘  └────────┘
     │           │           │
     └───────────┼───────────┘
                 ▼
        ┌─────────────────┐
        │  /pre-commit    │ (組み合わせ)
        └─────────────────┘

Flexible Composition:
┌────────┐  ┌────────┐
│ /test  │  │ /lint  │
└────────┘  └────────┘
     │           │
     └───────────┘
         ▼
   ┌─────────┐      or     ┌────────┐
   │ /lint   │              │ /test  │
   │ /test   │              │ /lint  │
   └─────────┘              └────────┘

   順序を変更可能
```

#### 実装例

**小さなコマンド**:

```bash
.claude/commands/
├── lint.md        # /lint - Lint実行
├── test.md        # /test - テスト実行
└── build.md       # /build - ビルド実行
```

**組み合わせコマンド**:

```bash
.claude/commands/
├── pre-commit.md  # /pre-commit → /lint + /test
├── ci-check.md    # /ci-check → /lint + /test + /build
└── quick-check.md # /quick-check → /lint
```

**柔軟な使用**:

```bash
# 個別実行
/lint
/test
/build

# 組み合わせ実行
/pre-commit   # lint + test
/ci-check     # lint + test + build

# カスタム組み合わせ
/lint && /build  # testスキップ
```

### 原則3: 冪等性の原則

**定義**: コマンドは何度実行しても安全で、同じ結果を生成すべき

#### 冪等なコマンド

```markdown
✓ 良い例:

/format-code
- 既にフォーマット済み → 何もしない
- フォーマット必要 → フォーマット実行
- 複数回実行 → 常に同じ結果

/deploy-staging
- 既にデプロイ済み → 同じバージョン確認、変更なし
- 新しいバージョン → デプロイ実行
- 複数回実行 → 冪等性保証
```

#### 非冪等なコマンド（避けるべき）

```markdown
✗ 悪い例:

/increment-version
- 実行1回目: 1.0.0 → 1.0.1
- 実行2回目: 1.0.1 → 1.0.2 ❌
- 意図しない重複実行のリスク

/append-log
- 実行1回目: ログに1行追加
- 実行2回目: 重複行追加 ❌
```

#### 冪等性の実装

**パターン1: 状態確認**

```markdown
## Step 1: Check Current State
Check if operation already completed:
```bash
if [ -f ".deployed" ]; then
  DEPLOYED_VERSION=$(cat .deployed)
  if [ "$DEPLOYED_VERSION" = "$VERSION" ]; then
    echo "✅ Already deployed: $VERSION"
    echo "No action needed"
    exit 0
  fi
fi
```

## Step 2: Execute
Only execute if not already in target state
```

**パターン2: 差分ベース**

```markdown
## Step 1: Calculate Diff
```bash
git diff --quiet
if [ $? -eq 0 ]; then
  echo "✅ No changes to commit"
  exit 0
fi
```

## Step 2: Execute
Only execute if there are actual changes
```

## DRY原則の適用

### 重複の排除

**Before（重複あり）**:

```markdown
# deploy-staging.md
1. Run tests: `npm test`
2. Run lint: `npm run lint`
3. Build: `npm run build`
4. Deploy to staging

# deploy-production.md
1. Run tests: `npm test`
2. Run lint: `npm run lint`
3. Build: `npm run build`
4. Deploy to production
```

**After（DRY適用）**:

```markdown
# pre-deploy.md（共通部分）
---
description: Pre-deployment checks
---
1. Run tests: `npm test`
2. Run lint: `npm run lint`
3. Build: `npm run build`

# deploy-staging.md
Execute `/pre-deploy`
Then deploy to staging

# deploy-production.md
Execute `/pre-deploy`
Then deploy to production
```

### テンプレートの活用

**共通パターンをテンプレート化**:

```markdown
# .claude/templates/deployment-template.md

---
description: Deploy to ${ENVIRONMENT}
---

# Deploy to ${ENVIRONMENT}

## Pre-deployment
Execute `/pre-deploy`

## Deployment
```bash
export ENV=${ENVIRONMENT}
./deploy.sh
```

## Verification
Verify deployment health:
```bash
curl -f https://${ENVIRONMENT}.example.com/health
```
```

## 保守性の向上

### 1. 明確なドキュメンテーション

```markdown
✓ 良い:
## Purpose
Clear explanation of what and why

## Prerequisites
List all requirements

## Examples
Multiple usage examples

## Troubleshooting
Common issues and solutions

✗ 悪い:
# Command
Does something
Run it
```

### 2. 適切なエラーハンドリング

```markdown
✓ 良い:
- 明示的なエラーチェック
- わかりやすいエラーメッセージ
- 解決方法の提示
- ロールバック機能

✗ 悪い:
- エラー無視
- 不明瞭なエラーメッセージ
- 解決方法なし
```

### 3. バージョニング

```markdown
✓ 良い:
- YAML frontmatterにversionフィールド
- CHANGELOGの維持
- 破壊的変更の明示

✗ 悪い:
- バージョン管理なし
- 変更履歴なし
```

### 4. テスタビリティ

```markdown
✓ 良い:
- dry-runモード
- 検証コマンド
- テスト可能な構造

✗ 悪い:
- 実行のみ
- 検証不可
```

## ベストプラクティスチェックリスト

### 設計時

- [ ] 単一責任を持っているか？
- [ ] 他のコマンドと組み合わせ可能か？
- [ ] 冪等性が保証されているか？
- [ ] 重複コードを排除しているか？
- [ ] 命名規則に従っているか？

### 実装時

- [ ] エラーハンドリングが適切か？
- [ ] ドキュメントが充実しているか？
- [ ] 使用例があるか？
- [ ] トラブルシューティングがあるか？
- [ ] セキュリティが考慮されているか？

### レビュー時

- [ ] 3つの核心原則を満たしているか？
- [ ] 保守性が高いか？
- [ ] テストしやすいか？
- [ ] チーム規約に準拠しているか？
- [ ] パフォーマンスが適切か？

## アンチパターン

### 1. God Command（神コマンド）

```markdown
✗ 避けるべき:
/do-everything
- あらゆる機能を1つのコマンドに詰め込む
- 柔軟性なし
- デバッグ困難
- 保守不可能

✓ 代わりに:
- 機能別に分割
- 組み合わせ可能に設計
```

### 2. Hardcoded Values（ハードコード）

```markdown
✗ 避けるべき:
- 環境変数ではなく直接記述
- プロジェクト固有のパスをハードコード
- 個人的な設定を埋め込み

✓ 代わりに:
- 引数や環境変数で設定可能に
- 設定ファイルの参照
- デフォルト値の提供
```

### 3. Silent Failures（サイレント失敗）

```markdown
✗ 避けるべき:
- エラーを無視
- 失敗しても続行
- エラーメッセージなし

✓ 代わりに:
- 明示的なエラーハンドリング
- わかりやすいエラーメッセージ
- 適切な終了コード
```

## 詳細リソースの参照

### 単一責任原則
詳細は `resources/single-responsibility-principle.md` を参照

### 組み合わせ可能性
詳細は `resources/composability-principle.md` を参照

### 冪等性原則
詳細は `resources/idempotency-principle.md` を参照

### 保守性ガイド
詳細は `resources/maintainability-guide.md` を参照

### チェックリスト
完全版は `templates/best-practice-checklist.md` を参照

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# 単一責任原則詳細
cat .claude/skills/command-best-practices/resources/single-responsibility-principle.md

# 組み合わせ可能性詳細
cat .claude/skills/command-best-practices/resources/composability-principle.md
```

### テンプレート参照

```bash
# ベストプラクティスチェックリスト
cat .claude/skills/command-best-practices/templates/best-practice-checklist.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-best-practices/resources/single-responsibility-principle.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-best-practices/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-best-practices
```

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - 基本構造
- `.claude/skills/command-security-design/SKILL.md` - セキュリティ原則
- `.claude/skills/command-error-handling/SKILL.md` - エラーハンドリング原則

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
