---
name: parallel-jobs-gha
description: |
  GitHub Actionsの並列ジョブ実行とジョブ依存関係管理のスキル。

  **使用タイミング**:
  - ワークフロー実行時間を短縮したい時
  - ジョブ間の依存関係を定義する時
  - ジョブ間でデータを受け渡す時
  - 条件付き並列実行を設計する時
  - 複雑なジョブグラフを最適化する時
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

GitHub Actionsでの並列ジョブ実行とジョブ依存関係管理の専門知識を提供します。

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
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
```

すべてのジョブが同時に開始されます。

### シーケンシャル依存関係

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

依存関係チェーン: build → test → deploy

### 複数依存関係

```yaml
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:unit

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:integration

  deploy:
    needs: [unit-tests, integration-tests]
    runs-on: ubuntu-latest
    steps:
      - run: npm run deploy
```

deployは両方のテストジョブの完了を待ちます。

## ジョブ間データ受け渡し

### Outputs使用

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

### Artifacts使用

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
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
      - run: npm test
```

## 条件付き並列実行

### 条件付き依存

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

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

1. **独立タスクを並列化**: lint、test、buildなどの独立したタスクは並列実行
2. **適切なneeds設定**: 不要な依存関係を作らない
3. **Matrixと組み合わせ**: 複数環境テストを並列化
4. **Artifactsを最小化**: 必要なファイルのみをアップロード
5. **キャッシュ活用**: 共通依存関係はキャッシュで共有

## よくある使用パターン

### CI/CDパイプライン

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

- **matrix-builds**: マトリックスビルドとの組み合わせで並列化を最大化
- **concurrency-control**: 並列実行の制御と制限
- **conditional-execution-gha**: 条件付き実行パターン
- **artifact-management-gha**: ジョブ間ファイル共有
- **caching-strategies-gha**: キャッシュによる実行時間短縮

## トラブルシューティング

### ジョブが並列実行されない

**原因**: 不要なneeds依存関係が設定されている

**解決**: needsを削除し、本当に必要な依存関係のみ保持

### データが受け渡せない

**原因**: outputs設定の誤り、またはartifactsの未アップロード

**解決**: resources/data-passing.mdの正しいパターンを参照

### 依存関係が複雑で理解できない

**原因**: ジョブグラフが複雑化

**解決**: scripts/visualize-deps.mjsで依存関係を可視化

---

**詳細情報**: resources/ディレクトリ内のドキュメントを参照してください。
