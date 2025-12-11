---
description: |
  本番環境への安全なデプロイを実行します。
  承認フロー → ビルド → テスト → デプロイ → 監視の厳格なフローを適用します。

  🤖 起動エージェント:
  - `.claude/agents/devops-eng.md`: DevOps・インフラストラクチャ設計の専門家（Phase 1で起動）
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 2で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** deployment-strategies, production-deployment-checklist
  **Phase 2（実行時）:** railway-integration, deployment-verification
  **Phase 3（セキュリティ時）:** secret-management, production-security
  **Phase 4（品質時）:** deployment-best-practices, rollback-strategies

  ⚙️ このコマンドの設定:
  - argument-hint: なし
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 設定ファイル確認用
    • Bash(gh*, railway*): GitHub CLI・Railway CLI実行用
  - model: opus（本番環境のため最高品質）
  - disable-model-invocation: true（安全のため手動承認必須）

  トリガーキーワード: deploy production, production deployment
allowed-tools:
  - Task
  - Read
  - Bash(gh*)
  - Bash(railway*)
model: opus
disable-model-invocation: true
---

# deploy-production

⚠️ **本番環境デプロイコマンド - 手動承認必須**

このコマンドは本番環境へのデプロイを実行します。
`disable-model-invocation: true` のため、各ステップで手動承認が必要です。

## Phase 1: エージェント起動（デプロイ前検証）

`.claude/agents/devops-eng.md` を起動して、厳格なデプロイ前検証を実施:

**起動タイミング**: コマンド開始直後

**依頼内容**:
以下の本番環境デプロイ前検証を実施してください:

1. **環境設定の厳格確認**
   - `railway.json` の本番設定確認
   - 本番環境変数の設定確認
   - シークレット管理の検証
   - Railway 本番プロジェクト接続確認

2. **品質ゲート検証**
   - すべてのテストの実行（ユニット・統合・E2E）
   - Lint・型チェックの実行
   - セキュリティスキャンの実行
   - パフォーマンステストの実行

3. **デプロイ可能性チェック**
   - ステージング環境での検証完了確認
   - 既知の問題・バグがないことの確認
   - ロールバックプランの準備

4. **承認プロセス**
   - デプロイ内容のサマリー作成
   - 承認者への通知（手動）

**期待成果物**:

- 本番デプロイ前検証レポート
- デプロイ承認リクエスト
- ロールバックプラン

**⚠️ 手動承認ポイント**: 検証レポートを確認し、デプロイ続行を承認してください。

## Phase 2: エージェント起動（デプロイ実行）

`.claude/agents/gha-workflow-architect.md` を起動して、本番デプロイを実行:

**起動タイミング**: Phase 1 で承認された場合のみ

**依頼内容**:
以下の本番デプロイフローを実行してください:

1. **本番ビルド実行**
   - `NODE_ENV=production pnpm run build` または `pnpm build`
   - ビルド成果物の検証
   - バンドルサイズの確認

2. **Railway 本番デプロイ**
   - `railway up --environment production`
   - デプロイログのリアルタイム監視
   - デプロイ進捗の記録

3. **デプロイ後検証**
   - ヘルスチェックエンドポイントの確認
   - 主要機能の動作確認（smoke test）
   - エラーログの監視
   - パフォーマンス指標の確認

4. **デプロイ記録**
   - デプロイURL
   - デプロイ時刻
   - コミットハッシュ
   - リリースノート

**期待成果物**:

- 本番デプロイ成功レポート
- 本番URL
- リリースノート
- ロールバック手順（失敗時）

**⚠️ 手動承認ポイント**: デプロイ後検証結果を確認し、問題がなければ完了としてください。

## Phase 3: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル（devops-eng）**:

- `.claude/skills/deployment-strategies/SKILL.md`: デプロイ戦略
- `.claude/skills/production-deployment-checklist/SKILL.md`: 本番デプロイチェックリスト
- `.claude/skills/railway-integration/SKILL.md`: Railway統合

**必須スキル（gha-workflow-architect）**:

- `.claude/skills/deployment-verification/SKILL.md`: デプロイ検証

**条件付きスキル**:

- `.claude/skills/rollback-strategies/SKILL.md`: デプロイ失敗時のみ
- `.claude/skills/production-security/SKILL.md`: セキュリティ問題発生時のみ

## Phase 4: 検証と完了

**検証基準**:

- ✅ すべての品質ゲートが成功している
- ✅ 承認プロセスが完了している
- ✅ 本番ビルドが正常に完了している
- ✅ Railwayへのデプロイが成功している
- ✅ デプロイ後検証がすべて成功している
- ✅ エラーログに問題がない
- ✅ パフォーマンス指標が正常範囲内

**完了時の出力**:
本番URLとリリースノートを表示してください。

---

## ロールバック手順

デプロイ失敗時は以下の手順でロールバック:

1. `railway rollback --environment production`
2. 問題の調査とログ確認
3. 修正後、再デプロイ
