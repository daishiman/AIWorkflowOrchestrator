---
description: |
  GitHub ActionsのCD（継続的デプロイ）ワークフローを作成します。
  ステージング・本番環境へのデプロイ自動化、承認フロー、ロールバック機能を提供します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** deployment-environments-gha
  **Phase 2（設計時）:** deployment-strategies, railway-integration
  **Phase 3（セキュリティ時）:** github-actions-security, secret-management
  **Phase 4（品質時）:** deployment-best-practices
  **Phase 5（最適化時）:** rollback-strategies

  ⚙️ このコマンドの設定:
  - argument-hint: staging|production
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 既存設定確認用
    • Write(.github/workflows/**): ワークフローファイル作成用
    • Write(docs/**): デプロイドキュメント作成用
  - model: sonnet

  トリガーキーワード: cd, deploy, deployment, continuous deployment
argument-hint: "staging|production"
allowed-tools:
  - Task
  - Read
  - Write(.github/workflows/**)
  - Write(docs/**)
model: sonnet
---

# create-cd-workflow

## Phase 1: エージェント起動（ワークフロー設計）

`.claude/agents/gha-workflow-architect.md` を起動して、CD ワークフロー基盤を作成:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:
- `$ARGUMENTS`: デプロイ環境（staging/production）
  - `staging`: ステージング環境用ワークフロー（自動デプロイ）
  - `production`: 本番環境用ワークフロー（承認フロー付き）
  - 未指定: 両環境対応の統合ワークフロー

**依頼内容**:
以下のCD ワークフローを作成してください:

1. **環境別ワークフロー設計**
   - ステージング: PR マージ時の自動デプロイ
   - 本番: タグプッシュ時の承認デプロイ

2. **デプロイフロー構成**
   - ビルド → テスト → デプロイ → ヘルスチェック
   - 失敗時の自動ロールバック機能

3. **GitHub Environments 設定**
   - 環境変数の管理
   - 承認者の設定（本番のみ）
   - デプロイ履歴の記録

**期待成果物**:
- `.github/workflows/deploy-{environment}.yml`
- GitHub Environments 設定ガイド（コメント形式）

## Phase 2: エージェント起動（インフラ統合）

`.claude/agents/devops-eng.md` を起動して、Railway 統合を設定:

**起動タイミング**: Phase 1 完了後

**依頼内容**:
以下のRailway 統合設定を追加してください:

1. **railway.json 設定**
   - ビルドコマンド
   - 開始コマンド
   - 環境変数マッピング

2. **Railway CLI 統合**
   - デプロイコマンドの追加
   - ヘルスチェックエンドポイント設定

3. **プレビュー環境設定**
   - PR ごとのプレビューデプロイ
   - 自動クリーンアップ

**期待成果物**:
- `railway.json` 設定ファイル
- Railway 統合ドキュメント（`docs/deployment.md`）

## Phase 3: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル（gha-workflow-architect）**:
- `.claude/skills/deployment-environments-gha/SKILL.md`: GitHub Environments 設定
- `.claude/skills/deployment-strategies/SKILL.md`: デプロイ戦略・パターン

**必須スキル（devops-eng）**:
- `.claude/skills/railway-integration/SKILL.md`: Railway 統合設定

**条件付きスキル**:
- `.claude/skills/github-actions-security/SKILL.md`: シークレット管理が必要な場合
- `.claude/skills/rollback-strategies/SKILL.md`: ロールバック機能が必要な場合
- `.claude/skills/deployment-best-practices/SKILL.md`: 複雑なデプロイフローの場合

## Phase 4: 検証と完了

**検証基準**:
- ✅ 環境別ワークフローが正しく作成されている
- ✅ Railway 統合設定が完了している
- ✅ 本番環境には承認フローが設定されている
- ✅ ヘルスチェックとロールバック機能が含まれている
- ✅ デプロイドキュメントが作成されている

**完了時の出力**:
ワークフローファイルのパスと初回デプロイ手順を表示してください。
