---
name: concurrency-control
version: 1.0.0
description: >
  GitHub Actions ワークフローの並行実行制御を提供します。
  以下の場合に参照:
  - 同時実行を防ぐ必要がある時（デプロイ、リリース、データベースマイグレーション）
  - キューベースの実行順序を保証したい時（cancel-in-progress: false）
  - 進行中のジョブをキャンセルしたい時（cancel-in-progress: true）
  - 環境ごとに並行実行を制御したい時（production、staging）
  - レースコンディションを防ぎたい時（状態競合、リソース競合）
  - ワークフロー実行のスロットリングが必要な時（リソース保護、コスト最適化）

dependencies:
  - .claude/skills/github-actions-syntax/SKILL.md
  - .claude/skills/deployment-environments-gha/SKILL.md
  - .claude/skills/workflow-security/SKILL.md

tags:
  - github-actions
  - concurrency
  - workflow-control
  - deployment
  - race-conditions
  - queue-management
---

# Concurrency Control Skill

GitHub Actions ワークフローの並行実行制御パターンと、レースコンディション防止戦略を提供します。

## ディレクトリ構造

```
.claude/skills/concurrency-control/
├── SKILL.md                           # このファイル（概要とコマンドリファレンス）
├── resources/
│   ├── concurrency-syntax.md          # group と cancel-in-progress 詳細構文
│   └── race-conditions.md             # レースコンディション防止パターン
├── templates/
│   └── concurrency-workflow.yaml      # 並行実行制御のワークフロー例
└── scripts/
    └── check-concurrency.mjs          # 並行実行設定の検証スクリプト
```

## コマンドリファレンス

### リソース参照

```bash
# 並行実行制御の構文詳細
cat .claude/skills/concurrency-control/resources/concurrency-syntax.md

# レースコンディション防止パターン
cat .claude/skills/concurrency-control/resources/race-conditions.md
```

### テンプレート参照

```bash
# 並行実行制御ワークフロー例
cat .claude/skills/concurrency-control/templates/concurrency-workflow.yaml
```

### スクリプト実行

```bash
# 並行実行設定の検証
node .claude/skills/concurrency-control/scripts/check-concurrency.mjs <workflow-file.yml>
```

## 並行実行制御の基本パターン

### 1. デプロイメントキュー（順次実行）

```yaml
concurrency:
  group: production-deploy
  cancel-in-progress: false  # キューに入れて順次実行
```

**用途**: デプロイ、データベースマイグレーション、リリース

### 2. 最新のみ実行（古いジョブキャンセル）

```yaml
concurrency:
  group: pr-${{ github.ref }}
  cancel-in-progress: true  # 進行中のジョブをキャンセル
```

**用途**: PR ビルド、テスト、プレビューデプロイ

### 3. 環境ごとの制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.deployment.environment }}
  cancel-in-progress: ${{ github.event.deployment.environment != 'production' }}
```

**用途**: 環境別デプロイメント戦略

### 4. ブランチごとの制御

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}
```

**用途**: メインブランチ保護、フィーチャーブランチ最適化

## レースコンディション防止のベストプラクティス

### 状態競合の防止

1. **排他制御**: `cancel-in-progress: false` でキューベース実行
2. **タイムスタンプ検証**: デプロイ前に最新性確認
3. **ロック機構**: GitHub Deployment API の利用

### リソース競合の防止

1. **環境ごとのグループ化**: 環境名を group に含める
2. **セマフォパターン**: 同時実行数制限（GitHub Apps API）
3. **リトライ戦略**: 競合時の自動リトライ

### デプロイメント順序保証

1. **シーケンシャルキュー**: `cancel-in-progress: false`
2. **依存関係チェック**: 前回デプロイの完了確認
3. **バージョン検証**: デプロイ対象バージョンの検証

## トラブルシューティング

### よくある問題

| 問題 | 原因 | 解決策 |
|------|------|--------|
| デプロイが重複実行 | `cancel-in-progress: true` | `false` に変更してキュー化 |
| キューが溜まる | すべて順次実行 | 環境別に group を分離 |
| 古いデプロイが完了 | キャンセルなし | `cancel-in-progress: true` で最新化 |
| 同時デプロイ競合 | group が不適切 | 環境名を group に追加 |

### デバッグコマンド

```bash
# ワークフロー実行の確認
gh run list --workflow=deploy.yml --limit=10

# 並行実行設定の検証
node .claude/skills/concurrency-control/scripts/check-concurrency.mjs .github/workflows/deploy.yml

# 実行中のジョブ確認
gh run list --status in_progress
```

## 実装チェックリスト

- [ ] デプロイワークフローに concurrency 設定を追加
- [ ] 環境ごとに適切な group を定義
- [ ] production は `cancel-in-progress: false` を設定
- [ ] 非 production は `cancel-in-progress: true` を検討
- [ ] レースコンディションテストを実施
- [ ] ドキュメントに並行実行ポリシーを記載

## 関連スキル

このスキルは以下のスキルと連携します:

- **github-actions-syntax**: `.claude/skills/github-actions-syntax/SKILL.md`
  - 基本構文と式の評価
- **deployment-environments-gha**: `.claude/skills/deployment-environments-gha/SKILL.md`
  - 環境ベースのデプロイメント制御
- **workflow-security**: `.claude/skills/workflow-security/SKILL.md`
  - セキュアな並行実行制御

## 詳細情報

- **構文詳細**: `resources/concurrency-syntax.md`
- **レースコンディション**: `resources/race-conditions.md`
- **ワークフロー例**: `templates/concurrency-workflow.yaml`

---

**最終更新**: 2025-11-27
**メンテナ**: @gha-workflow-architect
