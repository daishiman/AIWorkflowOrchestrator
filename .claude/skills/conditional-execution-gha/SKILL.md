---
name: conditional-execution-gha
description: |
    GitHub Actions 条件付き実行の完全ガイド。
    専門分野:
    - if条件: ステータス関数、式構文、論理演算子
    - イベントフィルタリング: パス/ブランチ/タグフィルター、イベントベース条件
    - ジョブ/ステップ制御: 条件付きスキップ、失敗時実行、クリーンアップステップ
    - コンテキスト活用: github/needs/secrets/matrix コンテキストによる動的制御
    使用タイミング:
    - ジョブやステップを特定条件下でのみ実行したい時
    - 失敗時のクリーンアップ/通知を実装する時
    - ブランチ/パス/イベント別に実行を制御する時
    - マトリックスビルドの一部を条件付きで実行する時

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/conditional-execution-gha/resources/event-filtering.md`: イベント、パス、ブランチ、タグフィルターの詳細設定パターン
  - `.claude/skills/conditional-execution-gha/resources/if-conditions.md`: if構文、ステータス関数、式評価の完全リファレンス
  - `.claude/skills/conditional-execution-gha/templates/conditional-workflow.yaml`: 条件付き実行を使用したワークフローのサンプル実装
  - `.claude/skills/conditional-execution-gha/scripts/analyze-conditions.mjs`: 条件式の分析と最適化を行う自動化スクリプト

  Use proactively when implementing conditional-execution-gha patterns or solving related problems.
version: 1.0.0
---

# GitHub Actions Conditional Execution

## 概要

このスキルは、GitHub Actions での条件付き実行パターンを体系的に提供します。
if 条件、イベントフィルタリング、ステータス関数を活用した効率的なワークフロー制御を実現します。

**主要な価値**:

- ステータス関数による柔軟な実行制御
- イベント/パス/ブランチフィルタリングによるトリガー最適化
- 失敗時処理とクリーンアップの実装
- コンテキスト活用による動的条件分岐

## ディレクトリ構造

```
conditional-execution-gha/
├── SKILL.md                          # 本ファイル
├── resources/
│   ├── if-conditions.md              # if構文、ステータス関数、式評価
│   └── event-filtering.md            # イベントフィルター、パス/ブランチ条件
├── templates/
│   └── conditional-workflow.yaml     # 条件付き実行のサンプル
└── scripts/
    └── analyze-conditions.mjs        # 条件式の分析と最適化ツール
```

## コマンドリファレンス

```bash
# if条件とステータス関数の詳細
cat .claude/skills/conditional-execution-gha/resources/if-conditions.md

# イベントフィルタリングとパス条件
cat .claude/skills/conditional-execution-gha/resources/event-filtering.md

# 条件付き実行のサンプルワークフロー
cat .claude/skills/conditional-execution-gha/templates/conditional-workflow.yaml

# 条件式の分析と最適化提案
node .claude/skills/conditional-execution-gha/scripts/analyze-conditions.mjs <workflow.yml>
```

## ステータス関数

| 関数          | 前ステップ成功 | 前ステップ失敗 | 前ステップスキップ | キャンセル時 |
| ------------- | -------------- | -------------- | ------------------ | ------------ |
| `success()`   | ✅ 実行        | ❌ スキップ    | ❌ スキップ        | ❌ スキップ  |
| `always()`    | ✅ 実行        | ✅ 実行        | ✅ 実行            | ❌ スキップ  |
| `failure()`   | ❌ スキップ    | ✅ 実行        | ❌ スキップ        | ❌ スキップ  |
| `cancelled()` | ❌ スキップ    | ❌ スキップ    | ❌ スキップ        | ✅ 実行      |

## 一般的な if パターン

| パターン             | 条件式                                                            | 用途                               |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| **成功時のみ**       | `if: success()`                                                   | 前のステップがすべて成功した場合   |
| **常に実行**         | `if: always()`                                                    | 前のステップの結果に関係なく実行   |
| **失敗時のみ**       | `if: failure()`                                                   | いずれかのステップが失敗した場合   |
| **キャンセル時**     | `if: cancelled()`                                                 | ワークフローがキャンセルされた場合 |
| **main ブランチ**    | `if: github.ref == 'refs/heads/main'`                             | main ブランチでのみ実行            |
| **PR のみ**          | `if: github.event_name == 'pull_request'`                         | PR イベントでのみ実行              |
| **特定ラベル**       | `if: contains(github.event.pull_request.labels.*.name, 'deploy')` | 特定ラベル付き PR のみ             |
| **依存ジョブ成功**   | `if: needs.build.result == 'success'`                             | 依存ジョブが成功した場合           |
| **シークレット存在** | `if: secrets.API_KEY != ''`                                       | シークレットが設定されている場合   |
| **マトリックス条件** | `if: matrix.os == 'ubuntu-latest'`                                | マトリックスの特定値のみ           |

## 条件式の構文

### 基本構文

```yaml
# ステップレベル
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy

# ジョブレベル
deploy:
  if: github.event_name == 'push'
  runs-on: ubuntu-latest
```

### 論理演算子

```yaml
# AND
if: github.ref == 'refs/heads/main' && success()

# OR
if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'

# NOT
if: "!cancelled()"

# 複数行（括弧は使用不可）
if: |
  github.ref == 'refs/heads/main' &&
  github.event_name == 'push' &&
  success()
```

### 関数

```yaml
# contains() - 配列/文字列検索
if: contains(github.event.pull_request.labels.*.name, 'deploy')
if: contains(github.ref, 'refs/tags/')

# startsWith() / endsWith()
if: startsWith(github.ref, 'refs/heads/feature/')
if: endsWith(github.ref, '-beta')
```

## イベントフィルタリング

### ブランチフィルター

```yaml
on:
  push:
    branches: [main, "releases/**"]
    branches-ignore: ["feature/**"]
```

### パスフィルター

```yaml
on:
  push:
    paths: ["src/**", "package.json"]
    paths-ignore: ["*.md", "docs/**"]
```

### タグフィルター

```yaml
on:
  push:
    tags: ["v*.*.*", "!v*.*.*-beta"]
```

## 実践的なパターン

### 失敗時の通知

```yaml
- name: Notify on failure
  if: failure()
  run: curl -X POST $SLACK_WEBHOOK -d '{"text":"Build failed!"}'
```

### 条件付きデプロイメント

```yaml
deploy:
  needs: [build, test]
  if: |
    github.ref == 'refs/heads/main' &&
    needs.build.result == 'success' &&
    needs.test.result == 'success'
  runs-on: ubuntu-latest
```

### マトリックス条件

```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]

steps:
  - name: Unix tests
    if: matrix.os != 'windows-latest'
    run: ./run-unix-tests.sh
```

### 常にクリーンアップ

```yaml
- name: Cleanup
  if: always() && !cancelled()
  run: docker-compose down
```

## ベストプラクティス

1. **on: レベルでフィルタリング**: `branches`, `paths` はワークフロー開始前に評価されるため効率的
2. **ジョブレベルで条件設定**: すべてのステップに同じ条件を書くより明確
3. **ステータス関数を明示**: `always()`/`failure()` で意図を明確に
4. **シークレットは存在チェックのみ**: `secrets.KEY != ''` (値の直接比較は危険)
5. **複雑な条件は複数行で**: `|` を使って読みやすく

## 関連スキル

| スキル名                       | パス                                                 | 関連性                 |
| ------------------------------ | ---------------------------------------------------- | ---------------------- |
| **github-actions-syntax**      | `.claude/skills/github-actions-syntax/SKILL.md`      | ワークフロー構文の基礎 |
| **github-actions-expressions** | `.claude/skills/github-actions-expressions/SKILL.md` | 式構文とコンテキスト   |
| **concurrency-control**        | `.claude/skills/concurrency-control/SKILL.md`        | 並行実行制御           |
| **matrix-builds**              | `.claude/skills/matrix-builds/SKILL.md`              | マトリックス戦略       |

---

**詳細情報**: 各リソースファイルには、より詳細な構文、使用例、ベストプラクティスが含まれています。
