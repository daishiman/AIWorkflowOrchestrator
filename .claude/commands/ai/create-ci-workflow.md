---
description: |
  GitHub ActionsのCI（継続的インテグレーション）ワークフローを作成します。
  テスト・Lint・ビルドなどのワークフロータイプに対応し、キャッシュ戦略とマトリックスビルドを最適化します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** github-actions-syntax
  **Phase 2（設計時）:** matrix-builds, caching-strategies-gha
  **Phase 3（セキュリティ時）:** github-actions-security
  **Phase 4（品質時）:** github-actions-best-practices
  **Phase 5（最適化時）:** parallel-jobs-gha

  ⚙️ このコマンドの設定:
  - argument-hint: test|lint|build
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: 既存ワークフロー確認用
    • Write(.github/workflows/**): ワークフローファイル作成用
  - model: sonnet

  トリガーキーワード: ci, workflow, github actions, continuous integration
argument-hint: "test|lint|build"
allowed-tools:
  - Task
  - Read
  - Write(.github/workflows/**)
model: sonnet
---

# create-ci-workflow

## Phase 1: エージェント起動

`.claude/agents/gha-workflow-architect.md` を起動して、CI ワークフローを作成:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:
- `$ARGUMENTS`: ワークフロータイプ（test/lint/build）
  - 未指定時: 全タイプを含む統合CIワークフローを作成

**依頼内容**:
以下のCI ワークフローを作成してください:

1. **ワークフロータイプの判定** (`$ARGUMENTS` に基づく)
   - `test`: テストワークフロー（ユニット・統合・E2E）
   - `lint`: 静的解析ワークフロー（ESLint・Prettier・TypeScript）
   - `build`: ビルドワークフロー（成果物生成・検証）
   - 未指定: すべてを含む統合ワークフロー

2. **プロジェクト構成の分析**
   - package.json からスクリプト確認
   - テストフレームワーク検出（Jest・Vitest・Playwright）
   - ビルドツール検出（Vite・Next.js・Turbo）

3. **ワークフロー設計**
   - トリガー設定（push・PR・schedule）
   - 必要なジョブとステップの構成
   - キャッシュ戦略の適用（依存関係・ビルド成果物）
   - マトリックスビルド設定（複数Node.jsバージョン対応）

4. **master_system_design.md準拠**
   - セクション2.4（テスト戦略）に従ったテストジョブ構成
   - セクション3.8（GitHub Actions）のベストプラクティス適用
   - Railway自動デプロイとの連携考慮

**期待成果物**:
- `.github/workflows/ci-{type}.yml` または `.github/workflows/ci.yml`
- ワークフロー設定の説明ドキュメント（コメント形式）

## Phase 2: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル**:
- `.claude/skills/github-actions-syntax/SKILL.md`: ワークフロー構文・トリガー設定
- `.claude/skills/caching-strategies-gha/SKILL.md`: 依存関係・ビルドキャッシュ戦略

**条件付きスキル**:
- `.claude/skills/matrix-builds/SKILL.md`: 複数バージョン対応が必要な場合
- `.claude/skills/parallel-jobs-gha/SKILL.md`: 並列実行による高速化が必要な場合
- `.claude/skills/github-actions-security/SKILL.md`: シークレット管理・権限設定が必要な場合

## Phase 3: 検証と完了

**検証基準**:
- ✅ ワークフローファイルが正しいYAML構文で作成されている
- ✅ プロジェクト構成に適したジョブ・ステップが含まれている
- ✅ キャッシュ戦略が適用され、実行時間が最適化されている
- ✅ トリガー設定が適切（push・PR・必要に応じてschedule）
- ✅ エラーハンドリングと通知設定が含まれている

**完了時の出力**:
ワークフローファイルのパスと使用方法を表示してください。
