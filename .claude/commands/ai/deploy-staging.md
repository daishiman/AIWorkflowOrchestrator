---
description: |
  ステージング環境へのデプロイを実行します。
  ビルド → テスト → デプロイ → ヘルスチェックのフローを自動化します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** deployment-strategies
  **Phase 2（実行時）:** railway-integration, deployment-verification
  **Phase 3（セキュリティ時）:** secret-management
  **Phase 4（品質時）:** deployment-best-practices

  ⚙️ このコマンドの設定:
  - argument-hint: --dry-run（オプション、ドライラン実行）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 設定ファイル確認用
    • Bash(gh*, railway*): GitHub CLI・Railway CLI実行用
  - model: sonnet

  トリガーキーワード: deploy staging, staging deployment
argument-hint: "[--dry-run]"
allowed-tools:
  - Task
  - Read
  - Bash(gh*)
  - Bash(railway*)
model: sonnet
---

# deploy-staging

## Phase 1: エージェント起動（デプロイ検証）

`.claude/agents/devops-eng.md` を起動して、デプロイ前検証を実施:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:

- `$ARGUMENTS`: `--dry-run` フラグ（オプション）
  - 指定時: デプロイシミュレーションのみ実行

**依頼内容**:
以下のデプロイ前検証を実施してください:

1. **環境設定の確認**
   - `railway.json` の存在確認
   - 環境変数の設定確認
   - Railway プロジェクト接続確認

2. **ビルド前チェック**
   - 依存関係の整合性確認
   - テストの実行（`pnpm test` または `pnpm test`）
   - Lint・型チェックの実行

3. **デプロイ戦略の決定**
   - ドライラン時: シミュレーションのみ
   - 通常時: Railway へのデプロイ実行

**期待成果物**:

- デプロイ前検証レポート
- デプロイ実行の可否判定

## Phase 2: エージェント起動（デプロイ実行）

`.claude/agents/gha-workflow-architect.md` を起動して、デプロイを実行:

**起動タイミング**: Phase 1 で検証が成功した場合のみ

**依頼内容**:
以下のデプロイフローを実行してください:

1. **ビルド実行**
   - `pnpm run build` または `pnpm build`
   - ビルド成果物の確認

2. **Railway デプロイ**
   - `railway up` または `railway deploy`
   - デプロイログの監視

3. **ヘルスチェック**
   - デプロイ完了待機
   - ヘルスチェックエンドポイントの確認
   - 基本的な動作確認

4. **デプロイ結果の記録**
   - デプロイURL
   - デプロイ時刻
   - コミットハッシュ

**期待成果物**:

- デプロイ成功/失敗のレポート
- デプロイURL
- ロールバック手順（失敗時）

## Phase 3: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル（devops-eng）**:

- `.claude/skills/deployment-strategies/SKILL.md`: デプロイ戦略
- `.claude/skills/railway-integration/SKILL.md`: Railway統合

**必須スキル（gha-workflow-architect）**:

- `.claude/skills/deployment-verification/SKILL.md`: デプロイ検証

**条件付きスキル**:

- `.claude/skills/rollback-strategies/SKILL.md`: デプロイ失敗時のみ

## Phase 4: 検証と完了

**検証基準**:

- ✅ デプロイ前チェックがすべて成功している
- ✅ ビルドが正常に完了している
- ✅ Railwayへのデプロイが成功している
- ✅ ヘルスチェックが正常に完了している
- ✅ デプロイ結果が記録されている

**完了時の出力**:
デプロイURLとアクセス方法を表示してください。
