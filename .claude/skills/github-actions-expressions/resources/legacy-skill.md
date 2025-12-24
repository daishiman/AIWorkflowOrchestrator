---
name: .claude/skills/github-actions-expressions/SKILL.md
description: |
    GitHub Actionsのワークフローで使用できる式構文とコンテキストオブジェクトを専門とするスキル。
    ${{ }}構文、演算子、リテラル、組み込み関数、および利用可能なすべてのコンテキスト（github, env, job, steps, runner, secrets, needs, matrix, inputs）を提供します。
    専門分野:
    - 式構文: ${{ }}、演算子（論理、比較、算術）、リテラル
    - コンテキストオブジェクト: github（イベント情報）、env（環境変数）、job（ジョブ情報）、steps（ステップ出力）
    - 組み込み関数: contains、startsWith、endsWith、format、join、toJSON、fromJSON、hashFiles、always、success、failure
    - 条件付き実行: if式、マトリクス展開、動的値生成
    使用タイミング:
    - ワークフローで条件付き実行（if:）を設定する時
    - ステップ出力を参照したり、動的に値を生成する時
    - コンテキスト情報（ブランチ名、コミットSHA、イベントタイプ）を使用する時
    - 組み込み関数で文字列操作やJSON処理を行う時
    Use proactively when users need to implement conditional logic, reference context objects,
    or use built-in functions in GitHub Actions workflows.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/github-actions-expressions/resources/builtin-functions.md`: contains/startsWith/format/join/toJSON/hashFiles等の組み込み関数詳細
  - `.claude/skills/github-actions-expressions/resources/conditional-patterns.md`: if式による条件付き実行とマトリクス展開の実践パターン
  - `.claude/skills/github-actions-expressions/resources/context-objects.md`: github/env/job/steps/runner/secrets/needs/matrix/inputsコンテキスト詳細
  - `.claude/skills/github-actions-expressions/resources/expression-syntax.md`: ${{ }}構文・演算子・リテラル・評価ルールリファレンス
  - `.claude/skills/github-actions-expressions/templates/expression-examples.yaml`: 頻出式パターンのテンプレート集
  - `.claude/skills/github-actions-expressions/scripts/validate-expressions.mjs`: 式構文検証スクリプト

version: 1.0.0
---

# GitHub Actions Expressions

## 概要

このスキルは、GitHub Actions ワークフローで使用される式構文とコンテキストオブジェクトを体系的に提供します。
`${{ }}`構文を使った動的な値生成、条件付き実行、ステップ間のデータ参照など、
ワークフローの柔軟性と再利用性を大幅に向上させる機能を網羅しています。

**主要な価値**:

- 条件付き実行による効率的なワークフロー設計
- コンテキスト情報の活用による動的な処理
- 組み込み関数による強力なデータ操作
- ステップ間の依存関係と出力の管理

**対象ユーザー**:

- GitHub Actions ワークフローを設計・実装するエージェント
- 動的な条件付き実行を必要とする開発者
- ワークフローの再利用性を高めたいチーム

## リソース構造

```
github-actions-expressions/
├── SKILL.md                                    # 本ファイル（概要とクイックリファレンス）
├── resources/
│   ├── expression-syntax.md                   # 式構文の詳細（演算子、リテラル、評価順序）
│   ├── context-objects.md                     # すべてのコンテキストオブジェクトの詳細
│   ├── builtin-functions.md                   # すべての組み込み関数の詳細と使用例
│   └── conditional-patterns.md                # 条件付き実行の実践パターン
├── scripts/
│   └── validate-expressions.mjs               # 式構文の検証スクリプト
└── templates/
    └── expression-examples.yaml               # 頻出パターンのテンプレート集
```

### リソース種別

- **式構文** (`resources/expression-syntax.md`): `${{ }}`構文、演算子、リテラル、評価ルール
- **コンテキストオブジェクト** (`resources/context-objects.md`): github、env、job、steps、runner、secrets、needs、matrix、inputs
- **組み込み関数** (`resources/builtin-functions.md`): contains、startsWith、format、join、toJSON、fromJSON、hashFiles、ステータス関数
- **パターン集** (`resources/conditional-patterns.md`): 条件付き実行、マトリクス展開、動的値生成の実践例
- **検証スクリプト** (`scripts/validate-expressions.mjs`): 式構文の妥当性検証
- **テンプレート** (`templates/expression-examples.yaml`): コピー＆ペースト可能な頻出パターン

## コマンドリファレンス

### リソース参照（詳細が必要な場合）

```bash
# 式構文の詳細（演算子、リテラル、評価ルール）
cat .claude/skills/github-actions-expressions/resources/expression-syntax.md

# すべてのコンテキストオブジェクトの詳細
cat .claude/skills/github-actions-expressions/resources/context-objects.md

# すべての組み込み関数の詳細と使用例
cat .claude/skills/github-actions-expressions/resources/builtin-functions.md

# 条件付き実行の実践パターン
cat .claude/skills/github-actions-expressions/resources/conditional-patterns.md
```

### スクリプト実行

```bash
# ワークフローファイル内の式構文を検証
node .claude/skills/github-actions-expressions/scripts/validate-expressions.mjs <workflow.yml>

# テンプレート参照
cat .claude/skills/github-actions-expressions/templates/expression-examples.yaml
```

## クイックリファレンス

### 式構文の基本

| 構文                            | 説明             | 例                                   |
| ------------------------------- | ---------------- | ------------------------------------ |
| `${{ <expression> }}`           | 式の評価         | `${{ github.ref }}`                  |
| `${{ env.NAME }}`               | 環境変数参照     | `${{ env.NODE_VERSION }}`            |
| `${{ secrets.TOKEN }}`          | シークレット参照 | `${{ secrets.GITHUB_TOKEN }}`        |
| `${{ steps.id.outputs.value }}` | ステップ出力参照 | `${{ steps.build.outputs.version }}` |

### 主要なコンテキストオブジェクト

| コンテキスト | 用途             | 主要プロパティ                                     |
| ------------ | ---------------- | -------------------------------------------------- |
| `github`     | イベント情報     | `ref`, `sha`, `actor`, `event_name`, `repository`  |
| `env`        | 環境変数         | カスタム環境変数、`GITHUB_*`変数                   |
| `job`        | ジョブ情報       | `status`, `container`, `services`                  |
| `steps`      | ステップ出力     | `<step_id>.outputs.<name>`, `<step_id>.conclusion` |
| `runner`     | ランナー情報     | `os`, `arch`, `temp`, `tool_cache`                 |
| `secrets`    | シークレット     | リポジトリ/組織のシークレット                      |
| `needs`      | 依存ジョブ       | `<job_id>.outputs.<name>`, `<job_id>.result`       |
| `matrix`     | マトリクス値     | マトリクス戦略の各パラメータ                       |
| `inputs`     | ワークフロー入力 | `workflow_dispatch`/`workflow_call`の入力          |

### 頻出の組み込み関数

| 関数                         | 説明                      | 例                                          |
| ---------------------------- | ------------------------- | ------------------------------------------- |
| `contains(search, item)`     | 文字列/配列の包含チェック | `contains(github.ref, 'refs/tags/')`        |
| `startsWith(search, prefix)` | 前方一致チェック          | `startsWith(github.ref, 'refs/heads/main')` |
| `endsWith(search, suffix)`   | 後方一致チェック          | `endsWith(matrix.os, '-latest')`            |
| `format(template, ...)`      | 文字列フォーマット        | `format('v{0}.{1}', major, minor)`          |
| `join(array, separator)`     | 配列結合                  | `join(matrix.*, ', ')`                      |
| `toJSON(value)`              | JSON 文字列化             | `toJSON(github.event)`                      |
| `fromJSON(json)`             | JSON 解析                 | `fromJSON(steps.data.outputs.json)`         |
| `hashFiles(pattern)`         | ファイルハッシュ          | `hashFiles('**/package-lock.json')`         |

### ステータスチェック関数

| 関数          | 評価結果               | 用途              |
| ------------- | ---------------------- | ----------------- |
| `success()`   | 前ステップ成功時`true` | `if: success()`   |
| `failure()`   | 前ステップ失敗時`true` | `if: failure()`   |
| `always()`    | 常に`true`             | `if: always()`    |
| `cancelled()` | キャンセル時`true`     | `if: cancelled()` |

### 条件式の実践例

```yaml
# ブランチによる条件分岐
- if: github.ref == 'refs/heads/main'
  run: echo "main branch"

# タグプッシュの検出
- if: startsWith(github.ref, 'refs/tags/')
  run: echo "Tag pushed"

# PRラベルによる条件実行
- if: contains(github.event.pull_request.labels.*.name, 'deploy')
  run: echo "Deploy label found"

# 失敗時のクリーンアップ
- if: failure()
  run: docker-compose down

# マトリクス値による分岐
- if: matrix.os == 'ubuntu-latest'
  run: apt-get update

# 複数条件の組み合わせ
- if: success() && github.ref == 'refs/heads/main'
  run: pnpm run deploy
```

## ワークフローにおける式の使用フェーズ

### Phase 1: ワークフロー/ジョブレベル

- **トリガー条件**: `on.push.branches`、`on.pull_request.types`
- **ジョブ条件**: `jobs.<job_id>.if`
- **環境選択**: `jobs.<job_id>.environment`

### Phase 2: ステップレベル

- **ステップ条件**: `steps[*].if`
- **動的入力**: `steps[*].with.<param>`
- **環境変数**: `steps[*].env`

### Phase 3: 出力と参照

- **ステップ出力**: `steps.<step_id>.outputs.<name>`
- **ジョブ出力**: `jobs.<job_id>.outputs.<name>`
- **依存ジョブ参照**: `needs.<job_id>.outputs.<name>`

## 関連スキル

このスキルは以下のスキルと連携して使用されます:

| スキル名                      | パス                                                | 関係性                            |
| ----------------------------- | --------------------------------------------------- | --------------------------------- |
| **.claude/skills/github-actions-syntax/SKILL.md**     | `.claude/skills/github-actions-syntax/SKILL.md`     | ワークフロー基本構文 → 式の使用   |
| **.claude/skills/conditional-execution-gha/SKILL.md** | `.claude/skills/conditional-execution-gha/SKILL.md` | 式を活用した条件付き実行パターン  |
| **.claude/skills/matrix-builds/SKILL.md**             | `.claude/skills/matrix-builds/SKILL.md`             | マトリクス戦略と式の組み合わせ    |
| **.claude/skills/reusable-workflows/SKILL.md**        | `.claude/skills/reusable-workflows/SKILL.md`        | inputs/outputs/needs コンテキスト |
| **.claude/skills/composite-actions/SKILL.md**         | `.claude/skills/composite-actions/SKILL.md`         | inputs/outputs コンテキスト       |

## 使用例

### 基本的な条件付き実行

```yaml
name: Deploy
on: [push, pull_request]

jobs:
  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - if: success()
        run: pnpm run deploy
```

### ステップ出力の活用

```yaml
steps:
  - id: version
    run: echo "VERSION=$(cat VERSION)" >> $GITHUB_OUTPUT

  - if: startsWith(steps.version.outputs.VERSION, 'v2')
    run: echo "Version 2.x detected"
```

### コンテキスト情報の活用

```yaml
steps:
  - name: Build image
    run: |
      docker build -t myapp:${{ github.sha }} .
      docker tag myapp:${{ github.sha }} myapp:${{ github.ref_name }}
```

## 詳細情報へのアクセス

詳細な説明、すべての演算子、コンテキストプロパティ、組み込み関数、実践パターンについては、
上記の**コマンドリファレンス**に記載されたリソースファイルを参照してください。

特に以下の場合は該当リソースを参照:

- **演算子や評価順序の詳細** → `resources/expression-syntax.md`
- **コンテキストオブジェクトの全プロパティ** → `resources/context-objects.md`
- **組み込み関数の全リスト** → `resources/builtin-functions.md`
- **実践的なパターン集** → `resources/conditional-patterns.md`、`templates/expression-examples.yaml`
