---
name: .claude/skills/parallel-jobs-gha/SKILL.md
description: |
  GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/parallel-jobs-gha/resources/data-passing.md`: ジョブ間のデータ受け渡し手法（outputs、artifacts、cache活用パターン）
  - `.claude/skills/parallel-jobs-gha/resources/job-dependencies.md`: needs構文による依存関係グラフと実行順序制御パターン
  - `.claude/skills/parallel-jobs-gha/scripts/visualize-deps.mjs`: ワークフロー内ジョブ依存関係をMermaid形式で可視化
  - `.claude/skills/parallel-jobs-gha/templates/parallel-workflow.yaml`: 並列実行、依存関係、データ共有を含むGitHub Actionsワークフローテンプレート
version: 1.0.0
triggers:
  - needs キーワード
  - ジョブ依存関係
  - 並列実行
  - ジョブ間データ共有
  - outputs 定義
dependencies: []
related_skills:
  - .claude/skills/matrix-builds/SKILL.md
  - .claude/skills/concurrency-control/SKILL.md
  - .claude/skills/conditional-execution-gha/SKILL.md
  - .claude/skills/artifact-management-gha/SKILL.md
  - .claude/skills/caching-strategies-gha/SKILL.md
---

# GitHub Actions Parallel Jobs Skill

GitHub Actions での並列ジョブ実行とジョブ依存関係管理の専門知識を提供します。

## ディレクトリ構造

```
parallel-jobs-gha/
├── SKILL.md                          # このファイル（スキル定義）
├── resources/
│   ├── job-dependencies.md           # needs構文と依存関係グラフ
│   └── data-passing.md               # outputs、artifacts、通信パターン
├── templates/
│   └── parallel-workflow.yaml        # 並列ジョブの実装例
└── scripts/
    └── visualize-deps.mjs            # 依存関係グラフ可視化
```

## コマンドリファレンス

### リソース参照

```bash
# ジョブ依存関係の詳細（needs構文、依存グラフ）
cat .claude/skills/parallel-jobs-gha/resources/job-dependencies.md

# データ受け渡しパターン（outputs、artifacts）
cat .claude/skills/parallel-jobs-gha/resources/data-passing.md
```

### テンプレート参照

```bash
# 並列ジョブ実装例
cat .claude/skills/parallel-jobs-gha/templates/parallel-workflow.yaml
```

### スクリプト実行

```bash
# ワークフローの依存関係グラフを可視化（Mermaid形式）
node .claude/skills/parallel-jobs-gha/scripts/visualize-deps.mjs .github/workflows/ci.yml
```

## 並列ジョブの基本パターン

### 完全並列実行

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run build
```

すべてのジョブが同時に開始されます。

### シーケンシャル依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run deploy
```

依存関係チェーン: build → test → deploy

### 複数依存関係

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run test:integration

  deploy:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run deploy
```

deploy は両方のテストジョブの完了を待ちます。

## ジョブ間データ受け渡し

### Outputs 使用

```yaml
jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      app_version: ${{ steps.get_version.outputs.version }}
    steps:
      - id: get_version
        run: echo "version=1.2.3" >> $GITHUB_OUTPUT

  deploy:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying ${{ needs.version.outputs.app_version }}"
```

### Artifacts 使用

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: pnpm test
```

## 条件付き並列実行

### 条件付き依存

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to staging"

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploy to production"
```

## パフォーマンス最適化のヒント

1. **独立タスクを並列化**: lint、test、build などの独立したタスクは並列実行
2. **適切な needs 設定**: 不要な依存関係を作らない
3. **Matrix と組み合わせ**: 複数環境テストを並列化
4. **Artifacts を最小化**: 必要なファイルのみをアップロード
5. **キャッシュ活用**: 共通依存関係はキャッシュで共有

## よくある使用パターン

### CI/CD パイプライン

```
Build → Test (unit, integration, e2e) → Deploy (staging | production)
```

### マルチ環境テスト

```
Build → Test Matrix (OS × Node version) → Aggregate Results → Deploy
```

### ドキュメント生成

```
Code Lint | Docs Build → Deploy Docs
     ↓
    Test
```

## 関連スキル

詳細な知識については、以下のスキルを参照してください:

- **.claude/skills/matrix-builds/SKILL.md**: マトリックスビルドとの組み合わせで並列化を最大化
- **.claude/skills/concurrency-control/SKILL.md**: 並列実行の制御と制限
- **.claude/skills/conditional-execution-gha/SKILL.md**: 条件付き実行パターン
- **.claude/skills/artifact-management-gha/SKILL.md**: ジョブ間ファイル共有
- **.claude/skills/caching-strategies-gha/SKILL.md**: キャッシュによる実行時間短縮

## トラブルシューティング

### ジョブが並列実行されない

**原因**: 不要な needs 依存関係が設定されている

**解決**: needs を削除し、本当に必要な依存関係のみ保持

### データが受け渡せない

**原因**: outputs 設定の誤り、または artifacts の未アップロード

**解決**: resources/data-passing.md の正しいパターンを参照

### 依存関係が複雑で理解できない

**原因**: ジョブグラフが複雑化

**解決**: scripts/visualize-deps.mjs で依存関係を可視化

---

**詳細情報**: resources/ディレクトリ内のドキュメントを参照してください。
