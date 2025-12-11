---
description: |
  新規開発者のオンボーディングガイドを生成するコマンド。

  開発者の役割（frontend/backend/fullstack）に応じた、プロジェクト理解から実装開始までの
  包括的なオンボーディング資料を作成します。

  🤖 起動エージェント（Phase別）:
  - Phase 1: `.claude/agents/manual-writer.md` - オンボーディングガイド作成
  - Phase 2: `.claude/agents/meta-agent-designer.md` - エージェント活用ガイド作成（オプション）
  - Phase 3: `.claude/agents/skill-librarian.md` - スキル参照ガイド作成（オプション）

  📚 利用可能スキル（エージェントが参照）:
  **ドキュメント作成:**
  - `.claude/skills/tutorial-design/SKILL.md` - チュートリアル構造、段階的学習
  - `.claude/skills/progressive-disclosure/SKILL.md` - 情報階層化、3層構造
  - `.claude/skills/structured-writing/SKILL.md` - 構造化文書、モジュール化
  - `.claude/skills/markdown-advanced-syntax/SKILL.md` - Mermaid図、表、コードブロック
  - `.claude/skills/version-control-for-docs/SKILL.md` - ドキュメント変更管理

  **技術ガイド:**
  - `.claude/skills/nextjs-app-router/SKILL.md` - App Routerアーキテクチャ、Server/Client Components
  - `.claude/skills/clean-architecture-principles/SKILL.md` - 依存関係ルール、レイヤー分離
  - `.claude/skills/repository-pattern/SKILL.md` - Repository実装パターン
  - `.claude/skills/tdd-principles/SKILL.md` - TDD手法、Red-Green-Refactor
  - `.claude/skills/git-workflow-patterns/SKILL.md` - Git Flow、ブランチ戦略

  ⚙️ このコマンドの設定:
  - argument-hint: "[developer-role]"（必須: frontend/backend/fullstack/devops）
  - allowed-tools: エージェント起動と読み取り専用
    • Task: 3エージェント起動用
    • Read: プロジェクトコード・ドキュメント全体確認用
    • Write(docs/**): オンボーディングドキュメント生成用（docsのみ）
    • Grep, Glob: コード検索・パターン抽出用
  - model: sonnet（標準的なドキュメント作成タスク）

  📋 成果物:
  - `docs/onboarding/${role}-onboarding.md`（役割別オンボーディングガイド）
  - プロジェクト構造図（Mermaid）
  - セットアップ手順（環境構築、依存関係、ローカル実行）
  - 開発フロー（Git、TDD、コードレビュー）
  - エージェント・スキル活用ガイド
  - トラブルシューティング

  🎯 対象読者:
  - Frontend Developer: UI/UX、Next.js、React、Tailwind CSS
  - Backend Developer: API、ビジネスロジック、DB、セキュリティ
  - Fullstack Developer: 全レイヤー
  - DevOps Engineer: CI/CD、デプロイ、インフラ、監視

  トリガーキーワード: onboarding, オンボーディング, 新規開発者, developer guide, getting started
argument-hint: "[developer-role]"
allowed-tools:
  - Task
  - Read
  - Write(docs/**)
  - Grep
  - Glob
model: sonnet
---

# 新規開発者オンボーディング

このコマンドは、新規開発者の役割に応じたオンボーディングガイドを生成します。

## 📋 実行フロー

### Phase 1: 役割の確認

**引数解析**:

```bash
# 役割（必須）
developer-role: "$ARGUMENTS"（frontend | backend | fullstack | devops）

# 未指定の場合
エラー: 開発者の役割は必須です
使用例: /ai:onboard-developer frontend
```

### Phase 2: manual-writerエージェントを起動

**使用エージェント**: `.claude/agents/manual-writer.md`

**エージェントへの依頼内容**:

```markdown
役割「${developer-role}」の新規開発者向けオンボーディングガイドを作成してください。

**対象読者**: ${developer-role} Developer

**要件**:

1. プロジェクト概要:
   - 目的、背景、主要機能
   - 技術スタック（3.2-3.7章）
   - アーキテクチャ概要（ハイブリッド構造、Clean Architecture）

2. 環境セットアップ:
   - 必要なツール（pnpm, Node.js, Railway CLI, Git）
   - リポジトリクローン
   - 依存関係インストール（`pnpm install`）
   - 環境変数設定（`.env` 作成）
   - ローカル実行（`pnpm dev`）

3. プロジェクト構造理解:
   - ディレクトリ構造図（4.3章準拠）
   - レイヤー責務（app, features, infrastructure, core）
   - 依存関係ルール（5.1章）

4. 開発フロー（役割別）:
   **Frontend Developer:**
   - UIコンポーネント作成（`src/app/components/`）
   - Page/Layout実装（`src/app/`）
   - 状態管理（`src/hooks/`）
   - スタイリング（Tailwind CSS、デザイントークン）

   **Backend Developer:**
   - 機能プラグイン作成（`src/features/${feature}/`）
   - Repository実装（`src/shared/infrastructure/repositories/`）
   - API実装（`src/app/api/v1/`）
   - DB操作（Drizzle ORM、マイグレーション）

   **Fullstack Developer:**
   - 上記両方

   **DevOps Engineer:**
   - CI/CD設定（`.github/workflows/`）
   - Railway設定（`railway.json`）
   - 環境変数管理
   - 監視・ログ設定

5. TDDフロー（2.4章準拠）:
   - Red: テストを先に書く
   - Green: 最小限の実装
   - Refactor: リファクタリング

6. Git ワークフロー:
   - ブランチ戦略（feature/xxx）
   - コミット規約（Conventional Commits）
   - PR作成・レビュー
   - マージ手順

7. エージェント・スキル活用（役割別）:
   **Frontend:**
   - `.claude/agents/ui-designer.md` - UIコンポーネント設計
   - `.claude/agents/router-dev.md` - Next.js App Router
   - `.claude/agents/state-manager.md` - 状態管理
   - `.claude/skills/nextjs-app-router/SKILL.md` - App Routerアーキテクチャ
   - `.claude/skills/component-composition-patterns/SKILL.md` - Slot/Compoundパターン
   - `.claude/skills/accessibility-wcag/SKILL.md` - WCAG 2.1準拠

   **Backend:**
   - `.claude/agents/domain-modeler.md` - ドメインモデル設計
   - `.claude/agents/logic-dev.md` - ビジネスロジック実装
   - `.claude/agents/repo-dev.md` - Repository実装
   - `.claude/agents/gateway-dev.md` - APIゲートウェイ
   - `.claude/skills/repository-pattern/SKILL.md` - Repository実装パターン
   - `.claude/skills/transaction-management/SKILL.md` - トランザクション制御
   - `.claude/skills/http-best-practices/SKILL.md` - HTTP設計ベストプラクティス

   **Fullstack:**
   - 上記全エージェント・スキル

   **DevOps:**
   - `.claude/agents/devops-eng.md` - DevOps・インフラ設計
   - `.claude/agents/process-mgr.md` - プロセス管理
   - `.claude/skills/ci-cd-pipelines/SKILL.md` - CI/CDパイプライン設計
   - `.claude/skills/infrastructure-as-code/SKILL.md` - IaC実装

8. トラブルシューティング:
   - よくある問題と解決策
   - エラーメッセージ解釈
   - ヘルプの探し方

**スキル参照**:

- `.claude/skills/tutorial-design/SKILL.md`
- `.claude/skills/progressive-disclosure/SKILL.md`

**成果物**:

- `docs/onboarding/${role}-onboarding.md`（オンボーディングガイド）
```

### Phase 3: エージェント活用ガイド作成（meta-agent-designer、オプション）

**条件**: フルスタック開発者または明示的な要求がある場合

**使用エージェント**: `.claude/agents/meta-agent-designer.md`

**エージェントへの依頼内容**:

```markdown
役割「${developer-role}」向けのエージェント活用ガイドを作成してください。

**要件**:

1. 役割別エージェント一覧
2. 各エージェントの使用タイミング
3. エージェント起動方法（Task tool、コマンド）
4. エージェント間連携パターン

**成果物**:

- `docs/onboarding/${role}-agent-guide.md`（エージェント活用ガイド）
```

### Phase 4: スキル参照ガイド作成（skill-librarian、オプション）

**条件**: フルスタック開発者または明示的な要求がある場合

**使用エージェント**: `.claude/agents/skill-librarian.md`

**エージェントへの依頼内容**:

```markdown
役割「${developer-role}」向けのスキル参照ガイドを作成してください。

**要件**:

1. 役割別スキル一覧
2. 各スキルの使用タイミング
3. スキル参照方法（相対パス）
4. Progressive Disclosure活用法

**成果物**:

- `docs/onboarding/${role}-skill-guide.md`（スキル参照ガイド）
```

### Phase 5: 完了報告

**完了報告**:

```markdown
## オンボーディングガイド完成: ${developer-role}

### 成果物

✅ オンボーディングガイド: docs/onboarding/${role}-onboarding.md

- プロジェクト概要
- 環境セットアップ
- プロジェクト構造理解
- 開発フロー（役割別）
- TDDフロー
- Git ワークフロー
- エージェント・スキル活用
- トラブルシューティング

✅ エージェント活用ガイド: docs/onboarding/${role}-agent-guide.md（オプション）
✅ スキル参照ガイド: docs/onboarding/${role}-skill-guide.md（オプション）

### Next Steps（新規開発者へ）

1. オンボーディングガイドを読む
2. 環境セットアップを実行
3. サンプル機能を実装してみる
4. 最初のPRを作成
5. コードレビューを受ける
```

## 使用例

### Frontend Developer向け

```bash
/ai:onboard-developer frontend
```

生成内容:

- Next.js App Router、React、Tailwind CSS
- UIコンポーネント作成フロー
- `.claude/agents/ui-designer.md` の使い方
- `.claude/agents/router-dev.md` の使い方
- `.claude/agents/state-manager.md` の使い方

### Backend Developer向け

```bash
/ai:onboard-developer backend
```

生成内容:

- Drizzle ORM、Repository Pattern、API設計
- 機能プラグイン作成フロー
- `.claude/agents/domain-modeler.md` の使い方
- `.claude/agents/logic-dev.md` の使い方
- `.claude/agents/repo-dev.md` の使い方
- `.claude/agents/gateway-dev.md` の使い方

### Fullstack Developer向け

```bash
/ai:onboard-developer fullstack
```

生成内容:

- 全レイヤーの理解
- フロントエンド・バックエンド両方の開発フロー
- 全エージェント・スキルの活用法

## ガイド構成例

```markdown
# Frontend Developer オンボーディングガイド

## 1. プロジェクト概要

[目的、背景、主要機能]

## 2. 環境セットアップ

### 2.1 必要なツール

- pnpm 9.x
- Node.js 22.x LTS
- Railway CLI
- Git

### 2.2 セットアップ手順

[ステップバイステップガイド]

## 3. プロジェクト構造

[ディレクトリ構造図、レイヤー責務]

## 4. 開発フロー

### 4.1 UIコンポーネント作成

[ステップバイステップ]

### 4.2 Page実装

[ステップバイステップ]

## 5. TDDフロー

[Red-Green-Refactor]

## 6. Git ワークフロー

[ブランチ戦略、コミット、PR]

## 7. エージェント活用

- `.claude/agents/ui-designer.md` の使い方
- `.claude/agents/router-dev.md` の使い方
- `.claude/agents/state-manager.md` の使い方

## 8. トラブルシューティング

[よくある問題と解決策]
```

## 参照

- `.claude/agents/manual-writer.md` - ユーザー中心ドキュメンテーション専門
- `.claude/agents/meta-agent-designer.md` - エージェント設計専門
- `.claude/agents/skill-librarian.md` - 知識体系化・スキル作成専門
