---
description: |
  CI/CDパイプラインのパフォーマンスを最適化します。
  キャッシュ戦略、並列実行、コスト削減により実行時間を短縮します。

  🤖 起動エージェント:
  - `.claude/agents/gha-workflow-architect.md`: GitHub Actionsワークフロー設計の専門家（Phase 1で起動）

  📚 利用可能スキル（タスクに応じてエージェントが必要時に参照）:
  **Phase 1（要件収集時）:** github-actions-syntax
  **Phase 2（設計時）:** caching-strategies-gha, parallel-jobs-gha
  **Phase 3（最適化時）:** cost-optimization-gha, workflow-optimization
  **Phase 4（品質時）:** github-actions-best-practices

  ⚙️ このコマンドの設定:
  - argument-hint: workflow-file（例: ci.yml, deploy.yml）
  - allowed-tools: エージェント起動と最小限の確認用
    • Task: エージェント起動用
    • Read: ワークフロー分析用
    • Write(.github/workflows/**): 最適化後のワークフロー作成用
  - model: sonnet

  トリガーキーワード: optimize, performance, speed up, ci performance
argument-hint: "workflow-file"
allowed-tools:
  - Task
  - Read
  - Write(.github/workflows/**)
model: sonnet
---

# optimize-ci-performance

## Phase 1: エージェント起動

`.claude/agents/gha-workflow-architect.md` を起動して、CI/CDパイプラインを最適化:

**起動タイミング**: コマンド開始直後

**引数引き渡し**:
- `$ARGUMENTS`: 対象ワークフローファイル（例: ci.yml, deploy.yml）
  - 未指定時: `.github/workflows/` 内の全ワークフローを分析

**依頼内容**:
以下のCI/CD最適化を実施してください:

1. **現状分析**
   - ワークフローファイルの読み込み
   - 実行時間のボトルネック特定
   - 並列化可能なジョブの抽出

2. **キャッシュ戦略の最適化**
   - 依存関係キャッシュ（npm/yarn/pnpm）
   - ビルド成果物キャッシュ
   - キャッシュキーの最適化

3. **並列実行の導入**
   - 独立したジョブの並列化
   - マトリックス戦略の活用
   - 条件付き実行の最適化

4. **コスト削減**
   - 不要なステップの削除
   - タイムアウト設定の最適化
   - GitHub Actions無料枠の効率的利用

5. **最適化レポート作成**
   - 変更前後の実行時間比較（推定）
   - 適用した最適化手法の説明
   - さらなる改善提案

**期待成果物**:
- 最適化されたワークフローファイル（`.github/workflows/{name}-optimized.yml`）
- 最適化レポート（コメント形式またはドキュメント）

## Phase 2: スキル参照（エージェント内で実行）

エージェントが以下のスキルを必要に応じて参照:

**必須スキル**:
- `.claude/skills/caching-strategies-gha/SKILL.md`: キャッシュ戦略・パターン
- `.claude/skills/parallel-jobs-gha/SKILL.md`: 並列実行の設計

**条件付きスキル**:
- `.claude/skills/cost-optimization-gha/SKILL.md`: コスト削減が重要な場合
- `.claude/skills/workflow-optimization/SKILL.md`: 複雑な最適化が必要な場合

## Phase 3: 検証と完了

**検証基準**:
- ✅ キャッシュ戦略が適切に適用されている
- ✅ 並列実行可能なジョブが並列化されている
- ✅ 不要なステップが削除されている
- ✅ 最適化レポートが作成されている
- ✅ 既存の機能が損なわれていない

**完了時の出力**:
最適化されたワークフローファイルのパスと改善内容を表示してください。
