---
name: matrix-builds
description: |
  GitHub Actionsのマトリックスビルド戦略（strategy.matrix）の設計と最適化。
  複数のOS、バージョン、環境での並列テスト実行、動的マトリックス生成、include/exclude条件、
  fail-fast制御、max-parallel設定による効率的なCI/CDパイプライン構築を支援。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/matrix-builds/resources/dynamic-matrix.md`: fromJSON活用、変更ファイルベースの動的テスト選択、条件付きマトリックス生成
  - `.claude/skills/matrix-builds/resources/matrix-strategy.md`: include/exclude構文、fail-fast制御、max-parallel設定、マトリックス変数アクセス
  - `.claude/skills/matrix-builds/scripts/generate-matrix.mjs`: マトリックス設定の自動生成（OS/バージョン組み合わせ、YAML出力）
  - `.claude/skills/matrix-builds/templates/matrix-template.yaml`: マルチOS・マルチバージョンテスト用マトリックスビルドテンプレート

version: 1.0.0
triggers:
  - "複数バージョンでのテスト実行"
  - "マルチOS対応のビルド"
  - "マトリックスビルド設定"
  - "動的マトリックス生成"
  - "並列ビルド最適化"
related_skills:
  - .claude/skills/github-actions-syntax/SKILL.md
  - .claude/skills/parallel-jobs-gha/SKILL.md
  - .claude/skills/conditional-execution-gha/SKILL.md
  - .claude/skills/caching-strategies-gha/SKILL.md
---

# Matrix Builds Skill

GitHub Actions のマトリックスビルド戦略による効率的な並列実行パターン。

## ディレクトリ構造

```
.claude/skills/matrix-builds/
├── SKILL.md                          # このファイル（概要とクイックリファレンス）
├── resources/
│   ├── matrix-strategy.md           # strategy.matrix構文詳細
│   └── dynamic-matrix.md            # 動的マトリックス生成
├── templates/
│   └── matrix-template.yaml         # マトリックス設定テンプレート
└── scripts/
    └── generate-matrix.mjs          # マトリックス設定ジェネレーター
```

---

## コマンドリファレンス

### リソース参照

```bash
# マトリックス戦略詳細（基本構文、include/exclude、制御オプション）
cat .claude/skills/matrix-builds/resources/matrix-strategy.md

# 動的マトリックス生成（fromJSON、出力ベースマトリックス）
cat .claude/skills/matrix-builds/resources/dynamic-matrix.md
```

### テンプレート使用

```bash
# マトリックス設定テンプレート
cat .claude/skills/matrix-builds/templates/matrix-template.yaml
```

### スクリプト実行

```bash
# マトリックス設定生成
node .claude/skills/matrix-builds/scripts/generate-matrix.mjs --os "ubuntu,windows,macos" --node "18,20,22"
```

---

## 基本マトリックスパターン

### 1. シンプルマトリックス

```yaml
jobs:
  test:
    strategy:
      matrix:
        node-version: [18, 20, 22]
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
```

**結果**: 9 個のジョブ（3 OS × 3 Node.js） = 並列実行

---

### 2. include/exclude パターン

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest]
    node: [18, 20]
    include:
      # 特定の組み合わせに追加設定
      - os: ubuntu-latest
        node: 22
        experimental: true
    exclude:
      # Windows + Node 18は除外
      - os: windows-latest
        node: 18
```

**結果**: 5 ジョブ（2×2 - 1 除外 + 1 追加）

---

### 3. fail-fast 制御

```yaml
strategy:
  fail-fast: false # 1つ失敗しても全て実行
  matrix:
    node: [18, 20, 22]
```

**用途**: 全バージョンのテスト結果を取得したい場合

---

### 4. max-parallel 制限

```yaml
strategy:
  max-parallel: 2 # 同時実行2ジョブまで
  matrix:
    region: [us-east-1, us-west-2, eu-west-1, ap-northeast-1]
```

**用途**: API 制限やリソース節約

---

### 5. 動的マトリックス（fromJSON）

```yaml
jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.set-matrix.outputs.matrix }}
    steps:
      - id: set-matrix
        run: echo "matrix={\"node\":[18,20,22]}" >> $GITHUB_OUTPUT

  test:
    needs: setup
    strategy:
      matrix: ${{ fromJSON(needs.setup.outputs.matrix) }}
    runs-on: ubuntu-latest
```

**用途**: 変更ファイルに基づく動的テスト選択

---

## マトリックス変数アクセス

### 基本アクセス

```yaml
steps:
  - name: マトリックス値を表示
    run: |
      echo "OS: ${{ matrix.os }}"
      echo "Node: ${{ matrix.node-version }}"
      echo "Experimental: ${{ matrix.experimental || 'false' }}"
```

### 条件分岐

```yaml
steps:
  - name: Windows専用ステップ
    if: matrix.os == 'windows-latest'
    run: choco install some-package

  - name: 実験的ビルド専用
    if: matrix.experimental == true
    run: npm run test:experimental
```

---

## ベストプラクティス

### 1. マトリックス次元の選択

**推奨**: 2-3 次元まで（OS × Version × Feature）
**理由**: 組み合わせ爆発を防ぐ（3×3×3 = 27 ジョブ）

### 2. fail-fast 戦略

- **開発中**: `fail-fast: false`（全結果確認）
- **本番 CI**: `fail-fast: true`（高速フィードバック）

### 3. max-parallel 調整

- **無制限**: GitHub 無料プラン（20 並列）
- **制限**: 外部 API やリソース制約がある場合

### 4. キャッシュとの組み合わせ

```yaml
strategy:
  matrix:
    node: [18, 20, 22]
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: ${{ matrix.node }}
      cache: "npm" # マトリックス別にキャッシュ
```

---

## 関連スキル

| スキル名                      | パス                                                | 用途                     |
| ----------------------------- | --------------------------------------------------- | ------------------------ |
| **github-actions-syntax**     | `.claude/skills/github-actions-syntax/SKILL.md`     | 基本構文理解             |
| **parallel-jobs-gha**         | `.claude/skills/parallel-jobs-gha/SKILL.md`         | ジョブ並列化             |
| **conditional-execution-gha** | `.claude/skills/conditional-execution-gha/SKILL.md` | マトリックス条件分岐     |
| **caching-strategies-gha**    | `.claude/skills/caching-strategies-gha/SKILL.md`    | マトリックス別キャッシュ |

---

## 使用タイミング

✅ **このスキルを使う場合**:

- 複数の OS/バージョン/環境でテストが必要
- クロスプラットフォーム互換性検証
- 並列実行による高速化が必要

❌ **不要な場合**:

- 単一環境のみのテスト
- 順次実行が必須のジョブ
- 極めてシンプルな CI/CD

---

**詳細情報**: `resources/`ディレクトリ参照
**テンプレート**: `templates/matrix-template.yaml`
**ツール**: `scripts/generate-matrix.mjs`
