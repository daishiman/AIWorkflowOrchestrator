# Concurrency Control Skill

GitHub Actions ワークフローの並行実行制御を提供するスキルです。

## 📁 ディレクトリ構造

```
.claude/skills/concurrency-control/
├── SKILL.md                           # メインスキル定義（187行）
├── README.md                          # このファイル
├── resources/
│   ├── concurrency-syntax.md          # 並行実行制御の構文詳細（378行）
│   └── race-conditions.md             # レースコンディション防止（611行）
├── templates/
│   └── concurrency-workflow.yaml      # 12種類のワークフロー例
└── scripts/
    └── check-concurrency.mjs          # 並行実行設定の検証スクリプト
```

## 🎯 このスキルを参照するタイミング

以下のシナリオで参照してください:

1. **デプロイメント制御**
   - 本番環境への同時デプロイを防ぎたい
   - デプロイキューを実装したい

2. **リソース保護**
   - データベースマイグレーションの競合を防ぎたい
   - リリース作成の重複を防ぎたい

3. **CI/CD最適化**
   - PR更新時に古いビルドをキャンセルしたい
   - 最新のコードのみをテストしたい

4. **環境別制御**
   - 環境ごとに異なる並行実行戦略を適用したい
   - 本番は順次、開発は最新のみ実行したい

5. **レースコンディション対策**
   - 状態競合を防ぎたい
   - デプロイ順序を保証したい

## 🚀 クイックスタート

### 基本的な並行実行制御

```yaml
# 本番デプロイ（順次実行）
concurrency:
  group: production-deploy
  cancel-in-progress: false

# PR ビルド（最新のみ）
concurrency:
  group: pr-${{ github.ref }}
  cancel-in-progress: true
```

### テンプレートの使用

```bash
# ワークフロー例を参照
cat .claude/skills/concurrency-control/templates/concurrency-workflow.yaml
```

### 設定の検証

```bash
# 並行実行設定をチェック
node .claude/skills/concurrency-control/scripts/check-concurrency.mjs .github/workflows/deploy.yml
```

## 📚 詳細ドキュメント

### 1. 構文リファレンス

`resources/concurrency-syntax.md` を参照:

- group の設計パターン
- cancel-in-progress の設定戦略
- 条件付き並行実行制御
- 式の活用とベストプラクティス

### 2. レースコンディション防止

`resources/race-conditions.md` を参照:

- 排他制御とキューイング
- タイムスタンプ検証
- ロック機構の実装
- デプロイメントキューの設計

### 3. ワークフロー例

`templates/concurrency-workflow.yaml` を参照:

- 12種類の実装パターン
- 環境別制御の例
- モニタリングとリトライ戦略

## 🔧 スクリプトの使用方法

### check-concurrency.mjs

並行実行設定を検証し、ベストプラクティスに準拠しているかチェックします。

```bash
# 単一ファイルの検証
node .claude/skills/concurrency-control/scripts/check-concurrency.mjs .github/workflows/deploy.yml

# 複数ファイルの検証
for file in .github/workflows/*.yml; do
  node .claude/skills/concurrency-control/scripts/check-concurrency.mjs "$file"
done
```

**チェック項目**:

- ✅ concurrency 設定の構文
- ✅ group 名のパターン
- ✅ cancel-in-progress の適切性
- ✅ ベストプラクティス準拠
- ✅ 環境別推奨事項

## 📖 関連スキル

- **.claude/skills/github-actions-syntax/SKILL.md**: 基本構文と式の評価
- **.claude/skills/deployment-environments-gha/SKILL.md**: 環境ベースのデプロイメント
- **.claude/skills/workflow-security/SKILL.md**: セキュアな並行実行制御

## 🎓 学習パス

1. **初級**: SKILL.md の基本パターンを理解
2. **中級**: resources/concurrency-syntax.md で構文を習得
3. **上級**: resources/race-conditions.md でレースコンディション対策を学習
4. **実践**: templates/ の例を実プロジェクトに適用

## ⚠️ よくある間違い

### ❌ 悪い例

```yaml
# 静的なグループ名（複数ブランチで競合）
concurrency:
  group: my-workflow

# 本番デプロイでキャンセルあり
concurrency:
  group: production-deploy
  cancel-in-progress: true  # 危険！
```

### ✅ 良い例

```yaml
# 動的なグループ名
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/main' }}

# 本番は順次実行
concurrency:
  group: production-deploy
  cancel-in-progress: false
```

## 🛠️ トラブルシューティング

### デプロイが重複実行される

→ `resources/race-conditions.md` の「排他制御」セクションを参照

### 古いバージョンがデプロイされる

→ `resources/race-conditions.md` の「タイムスタンプ検証」セクションを参照

### キューが溜まり続ける

→ `resources/concurrency-syntax.md` の「トラブルシューティング」セクションを参照

## 📝 メンテナンス

- **最終更新**: 2025-11-27
- **メンテナ**: .claude/agents/gha-workflow-architect.md
- **バージョン**: 1.0.0

## 🔗 外部リソース

- [GitHub Actions: Concurrency](https://docs.github.com/en/actions/using-jobs/using-concurrency)
- [Workflow syntax for GitHub Actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#concurrency)
- [GitHub Deployments API](https://docs.github.com/en/rest/deployments/deployments)
