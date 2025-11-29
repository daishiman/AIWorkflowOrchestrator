---
description: |
  GitHub Environmentsを使用してステージング・本番環境を設定します。
  環境変数管理、承認フロー、デプロイ履歴記録を構成します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** deployment-environments-gha
  **Phase 2（設計時）:** environment-variables-management, approval-workflows
  **Phase 3（セキュリティ時）:** secret-management, github-actions-security
  **Phase 4（品質時）:** deployment-best-practices

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 既存設定確認用
    • Write(.github/**): 環境設定ファイル作成用
    • Write(docs/**): デプロイドキュメント作成用
  - model: sonnet

  トリガーキーワード: environment, staging, production, deployment setup
allowed-tools:
  - Task
  - Read
  - Write(.github/**)
  - Write(docs/**)
model: sonnet
---

# setup-deployment-environments

## Phase 1: エージェント起動（環境設計）

`.claude/agents/devops-eng.md` を起動して、デプロイ環境を設計:

**起動タイミング**: コマンド開始直後

**依頼内容**:
以下のデプロイ環境設計を実施してください:

1. **環境構成の設計**
   - ステージング環境の設定
   - 本番環境の設定
   - プレビュー環境の設定（オプション）

2. **環境変数の整理**
   - 共通環境変数の定義
   - 環境別の環境変数の定義
   - シークレット管理戦略

3. **Railway統合設定**
   - `railway.json` の作成
   - 環境変数グループの設定
   - プレビューデプロイ設定

4. **ドキュメント作成**
   - デプロイ手順書（`docs/deployment.md`）
   - 環境変数リファレンス
   - トラブルシューティングガイド

**期待成果物**:
- `railway.json` 設定ファイル
- 環境変数リスト（`.env.example`）
- デプロイドキュメント（`docs/deployment.md`）

## Phase 2: エージェント起動（GitHub連携）

`.claude/agents/gha-workflow-architect.md` を起動して、GitHub Environments を設定:

**起動タイミング**: Phase 1 完了後

**依頼内容**:
以下のGitHub Environments設定を実施してください:

1. **GitHub Environments設定ガイド**
   - Staging環境の設定手順
   - Production環境の設定手順（承認者設定含む）
   - 環境シークレットの設定方法

2. **承認フローの設計**
   - 本番環境の承認者設定
   - 承認タイムアウト設定
   - 承認通知の設定

3. **デプロイ履歴の記録**
   - デプロイログの保存方法
   - ロールバック用の情報記録

**期待成果物**:
- GitHub Environments設定ガイド（`.github/ENVIRONMENTS.md`）
- 承認フロー設定手順

## Phase 3: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル（devops-eng）**:
- `.claude/skills/deployment-environments-gha/SKILL.md`: 環境設定パターン
- `.claude/skills/railway-integration/SKILL.md`: Railway統合設定

**必須スキル（gha-workflow-architect）**:
- `.claude/skills/approval-workflows/SKILL.md`: 承認フロー設計

**条件付きスキル**:
- `.claude/skills/secret-management/SKILL.md`: シークレット管理が複雑な場合
- `.claude/skills/environment-variables-management/SKILL.md`: 環境変数が多い場合

## Phase 4: 検証と完了

**検証基準**:
- ✅ `railway.json` が正しく設定されている
- ✅ 環境変数リストが作成されている
- ✅ GitHub Environments設定ガイドが明確
- ✅ 承認フローが適切に設計されている
- ✅ デプロイドキュメントが完成している

**完了時の出力**:
設定ファイルのパスと次のステップ（GitHub Environmentsの設定方法）を表示してください。
