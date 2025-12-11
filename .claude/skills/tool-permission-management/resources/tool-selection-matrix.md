# Tool Selection Matrix

## 概要

エージェントの役割に応じた適切なツール選択のための意思決定マトリックス。

## ツールカテゴリ

### 1. 読み取り専用ツール

**ツール**: `[Read, Grep, Glob]`

**用途**: 分析、レビュー、監査

**リスクレベル**: 低

**推奨エージェント**:

- コードレビューアー
- セキュリティ監査
- ドキュメント生成
- 依存関係分析

**例**:

```yaml
---
name: code-reviewer
tools:
  - Read
  - Grep
  - Glob
---
```

### 2. 読み書きツール

**ツール**: `[Read, Write, Edit, Grep]`

**用途**: 実装、生成、変換

**リスクレベル**: 中

**パス制限**: **必須**

**推奨エージェント**:

- コード実装者
- ドキュメント生成
- テストライター
- リファクタリング専門家

**例**:

```yaml
---
name: feature-implementer
tools:
  - Read
  - Write
  - Edit
  - Grep
write_allowed_paths:
  - "src/features/**/*.ts"
  - "tests/**/*.test.ts"
write_forbidden_paths:
  - ".env"
  - "**/*.key"
---
```

### 3. オーケストレーターツール

**ツール**: `[Task, Read]`

**用途**: マルチエージェント調整

**リスクレベル**: 中

**パス制限**: 不要

**推奨エージェント**:

- プロジェクトオーケストレーター
- ワークフロー管理
- タスク委譲

**例**:

```yaml
---
name: project-orchestrator
tools:
  - Task
  - Read
  - Grep
---
```

### 4. フル権限ツール

**ツール**: `[Bash, Read, Write, Edit, Task]`

**用途**: デプロイ、インフラ管理

**リスクレベル**: 高

**パス制限**: **必須**

**承認要求**: **推奨**

**推奨エージェント**:

- デプロイメント管理
- インフラ構築
- CI/CD実行

**例**:

```yaml
---
name: deployment-manager
tools:
  - Bash
  - Read
  - Write
  - Edit
  - Task
write_allowed_paths:
  - "deploy/**"
  - ".github/workflows/**"
approval_required: true
---
```

## エージェントタイプ別ツール選択

| エージェントタイプ | ツール                             | リスク | パス制限 | 承認要求 |
| ------------------ | ---------------------------------- | ------ | -------- | -------- |
| **Analyzer**       | Read, Grep, Glob                   | 低     | 不要     | 不要     |
| **Reviewer**       | Read, Grep, Glob                   | 低     | 不要     | 不要     |
| **Implementer**    | Read, Write, Edit, Grep            | 中     | **必須** | 任意     |
| **Refactorer**     | Read, Write, Edit, MultiEdit, Grep | 中     | **必須** | 推奨     |
| **Orchestrator**   | Task, Read, Grep                   | 中     | 不要     | 不要     |
| **Deployer**       | Bash, Read, Write, Edit            | 高     | **必須** | **推奨** |
| **Tester**         | Bash, Read, Write, Grep            | 中     | 推奨     | 不要     |

## ツール選択フローチャート

```
エージェントの役割は？
│
├─ 分析・レビューのみ？
│  └─ YES → [Read, Grep, Glob]
│  └─ NO → 次へ
│
├─ ファイル作成・変更が必要？
│  └─ YES → [Read, Write, Edit, Grep]
│  │       + write_allowed_paths設定
│  └─ NO → 次へ
│
├─ 他のエージェントに委譲？
│  └─ YES → [Task, Read]
│  └─ NO → 次へ
│
└─ シェルコマンド実行が必要？
   └─ YES → [Bash, Read, Write, Edit, Task]
           + write_allowed_paths設定
           + approval_required設定
```

## パス制限設定

### write_allowed_paths

**目的**: 書き込みを許可するパスを明示

**例**:

```yaml
write_allowed_paths:
  - ".claude/agents/**/*.md"
  - ".claude/skills/**/*.md"
  - "src/features/**/*.ts"
  - "docs/**/*.md"
```

**パターン**:

- `**`: すべてのサブディレクトリ
- `*.md`: すべての.mdファイル
- `src/**/*.ts`: srcディレクトリ以下のすべての.tsファイル

### write_forbidden_paths

**目的**: 書き込みを禁止するパスを明示（センシティブファイル保護）

**例**:

```yaml
write_forbidden_paths:
  - ".env"
  - ".env.*"
  - "**/*.key"
  - "**/*.pem"
  - ".git/**"
  - "node_modules/**"
  - "**/.aws/**"
```

**一般的な禁止パス**:

- 環境変数ファイル: `.env`, `.env.local`
- 認証鍵: `*.key`, `*.pem`, `*.crt`
- Gitディレクトリ: `.git/**`
- 依存関係: `node_modules/**`, `vendor/**`
- クラウド認証: `.aws/**`, `.gcloud/**`

## 承認要求設定

### approval_required

**目的**: すべての操作に承認を要求

**例**:

```yaml
approval_required: true
```

**推奨ケース**:

- 本番環境へのデプロイ
- インフラ変更
- データベース操作

### approval_required_for（カスタム）

**目的**: 特定のコマンドのみ承認を要求

**例**:

```yaml
approval_required_for:
  - "rm *"
  - "git push"
  - "pnpm publish"
  - "terraform apply"
```

## ツール組み合わせ例

### 例1: 低リスクエージェント

```yaml
---
name: documentation-analyzer
description: ドキュメント分析専門エージェント
tools:
  - Read
  - Grep
  - Glob
model: sonnet
---
```

**理由**: 分析のみで書き込みなし → 低リスク

### 例2: 中リスクエージェント

```yaml
---
name: feature-implementer
description: 機能実装専門エージェント
tools:
  - Read
  - Write
  - Edit
  - Grep
model: sonnet
write_allowed_paths:
  - "src/features/**/*.ts"
  - "tests/**/*.test.ts"
write_forbidden_paths:
  - ".env"
  - "**/*.key"
---
```

**理由**: ファイル作成・変更あり → パス制限必須

### 例3: 高リスクエージェント

```yaml
---
name: deployment-manager
description: デプロイメント管理エージェント
tools:
  - Bash
  - Read
  - Write
  - Edit
  Task
model: sonnet
write_allowed_paths:
  - "deploy/**"
  - ".github/workflows/**"
write_forbidden_paths:
  - ".env"
  - "**/*.key"
approval_required: true
---
```

**理由**: Bash使用 + デプロイ → パス制限 + 承認要求

## ベストプラクティス

### ✅ すべきこと

1. **最小権限の原則**: 必要最小限のツールのみ選択
2. **パス制限必須**: Write/Editツール使用時は必ずwrite_allowed_pathsを設定
3. **センシティブファイル保護**: write_forbidden_pathsで保護
4. **承認要求**: 危険な操作にはapproval_required
5. **定期レビュー**: ツール権限を定期的に見直し

### ❌ 避けるべきこと

1. **過剰な権限**: 不要なツールの付与
2. **パス制限の省略**: Write/Edit使用時にwrite_allowed_pathsなし
3. **承認なしの危険操作**: デプロイやインフラ変更にapproval_requiredなし
4. **ワイルドカード乱用**: write_allowed_paths: ["**"]
5. **レビュー不足**: 作成後の権限見直しなし

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2025-11-24 | 初版作成 |
