# 式構文の詳細

## 概要

GitHub Actionsの式は、ワークフローファイル内で動的な値の評価と条件分岐を可能にします。
式は`${{ }}`構文で囲み、演算子、リテラル、関数、コンテキストオブジェクトを組み合わせて記述します。

## 式の基本構文

### `${{ }}` 構文

**基本形式**:

```yaml
${{ <expression> }}
```

**使用可能な場所**:

- `if`条件（ジョブ、ステップレベル）
- `with`パラメータ
- `env`環境変数の値
- `run`コマンド内（文字列展開）
- `name`フィールド

**評価タイミング**:

- ワークフロー実行時にサーバー側で評価
- 環境変数展開（`$VAR`）よりも優先

### 式の省略形

`if`条件では`${{ }}`を省略可能:

```yaml
# 完全形
if: ${{ github.ref == 'refs/heads/main' }}

# 省略形（推奨）
if: github.ref == 'refs/heads/main'
```

**注意**: `if`以外の場所では省略不可:

```yaml
# ❌ 間違い
env:
  BRANCH: github.ref_name

# ✅ 正しい
env:
  BRANCH: ${{ github.ref_name }}
```

## リテラル

### 文字列リテラル

**シングルクォート**（推奨）:

```yaml
if: github.event.head_commit.message == 'deploy'
if: contains(github.ref, 'feature/')
```

**エスケープ**:

```yaml
# シングルクォート内でシングルクォートをエスケープ
if: github.event.head_commit.message == 'It''s ready'
```

### 数値リテラル

```yaml
if: github.event.pull_request.additions > 100
if: matrix.version == 18
```

### ブール値

```yaml
if: true
if: false
if: inputs.enable_cache == true
```

### null

```yaml
if: env.OPTIONAL_VAR == null
if: steps.check.outputs.result != null
```

## 演算子

### 論理演算子

| 演算子 | 説明    | 例                                             |
| ------ | ------- | ---------------------------------------------- |
| `&&`   | 論理AND | `success() && github.ref == 'refs/heads/main'` |
| `\|\|` | 論理OR  | `failure() \|\| cancelled()`                   |
| `!`    | 論理NOT | `!contains(github.ref, 'feature/')`            |

**評価順序**:

1. `!` (最優先)
2. `&&`
3. `||` (最低優先)

**短絡評価**:

```yaml
# 左辺がfalseなら右辺は評価されない
if: github.ref == 'refs/heads/main' && success()

# 左辺がtrueなら右辺は評価されない
if: failure() || cancelled()
```

### 比較演算子

| 演算子 | 説明   | 例                                             |
| ------ | ------ | ---------------------------------------------- |
| `==`   | 等価   | `github.ref == 'refs/heads/main'`              |
| `!=`   | 非等価 | `matrix.os != 'windows-latest'`                |
| `<`    | 小なり | `github.event.pull_request.additions < 100`    |
| `<=`   | 以下   | `matrix.version <= 16`                         |
| `>`    | 大なり | `github.event.pull_request.changed_files > 10` |
| `>=`   | 以上   | `matrix.node >= 18`                            |

**文字列比較**:

- 大文字小文字を区別
- 辞書順で比較

```yaml
# ✅ 正しい
if: github.ref == 'refs/heads/main'

# ❌ 間違い（大文字小文字が異なる）
if: github.ref == 'refs/heads/Main'
```

**型の自動変換**:

```yaml
# 文字列と数値の比較は文字列として比較される
if: env.VERSION == '1.0'  # "1.0" == "1.0"
if: matrix.version == 18   # 18 == 18
```

### 算術演算子

GitHub Actionsの式では直接的な算術演算子（`+`, `-`, `*`, `/`）はサポートされていません。
代わりに、外部ツールやスクリプトを使用:

```yaml
# ❌ 直接的な算術演算は不可
# if: matrix.version + 1 == 19

# ✅ シェルスクリプトで計算
- id: calc
  run: echo "RESULT=$((18 + 1))" >> $GITHUB_OUTPUT
- if: steps.calc.outputs.RESULT == '19'
  run: echo "Calculated"
```

## 演算子の優先順位

| 優先順位  | 演算子               | 結合性 |
| --------- | -------------------- | ------ |
| 1（最高） | `!`                  | 右結合 |
| 2         | `<`, `<=`, `>`, `>=` | 左結合 |
| 3         | `==`, `!=`           | 左結合 |
| 4         | `&&`                 | 左結合 |
| 5（最低） | `\|\|`               | 左結合 |

**括弧による優先順位制御**:

```yaml
# 括弧なし: (success() && github.ref == 'refs/heads/main') || failure()
if: success() && github.ref == 'refs/heads/main' || failure()

# 括弧あり: success() && (github.ref == 'refs/heads/main' || failure())
if: success() && (github.ref == 'refs/heads/main' || failure())
```

## 式の評価ルール

### 型変換

**Truthyな値**:

- `true`
- 0以外の数値
- 空でない文字列

**Falsyな値**:

- `false`
- `0`
- `''`（空文字列）
- `null`

```yaml
# 文字列が存在するかチェック
if: env.DEPLOY_ENV  # 空でなければtrue

# 明示的な比較（推奨）
if: env.DEPLOY_ENV != ''
```

### Nullセーフティ

存在しないプロパティは`null`として評価:

```yaml
# env.OPTIONAL_VARが定義されていない場合、nullと評価
if: env.OPTIONAL_VAR == null
```

## 文字列内での式展開

### 単一の式

```yaml
# 文字列全体が式の場合、${{ }}が必要
env:
  BRANCH_NAME: ${{ github.ref_name }}
  COMMIT_SHA: ${{ github.sha }}
```

### 文字列の連結

```yaml
# 複数の式を含む場合
env:
  IMAGE_TAG: ${{ github.repository }}:${{ github.sha }}

# format関数を使用（推奨）
env:
  IMAGE_TAG: ${{ format('{0}:{1}', github.repository, github.sha) }}
```

### runコマンド内での使用

```yaml
# ✅ 正しい: シェル変数として展開
- run: |
    echo "Branch: ${{ github.ref_name }}"
    echo "SHA: ${{ github.sha }}"

# ⚠️ 注意: 複雑な値は環境変数経由が安全
- env:
    EVENT_JSON: ${{ toJSON(github.event) }}
  run: echo "$EVENT_JSON"
```

## 実践例

### 複雑な条件式

```yaml
# 複数条件の組み合わせ
if: |
  success() &&
  github.event_name == 'push' &&
  (github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/'))

# PRラベルによる条件分岐
if: |
  github.event_name == 'pull_request' &&
  contains(github.event.pull_request.labels.*.name, 'deploy')
```

### 動的な値生成

```yaml
steps:
  - name: Generate tag
    env:
      TAG: ${{ format('v{0}-{1}', github.run_number, github.sha) }}
    run: echo "TAG=$TAG"

  - name: Set matrix value
    if: matrix.os == 'ubuntu-latest' && matrix.node == 18
    run: echo "Using Ubuntu with Node 18"
```

### Nullチェック

```yaml
# オプショナルなシークレットのチェック
- if: secrets.DEPLOY_KEY != null
  run: echo "Deploy key available"

# ステップ出力の存在確認
- if: steps.check.outputs.result != null
  run: echo "Result: ${{ steps.check.outputs.result }}"
```

## トラブルシューティング

### よくあるエラー

**1. 構文エラー: クォートなし文字列**

```yaml
# ❌ 間違い
if: github.ref == refs/heads/main

# ✅ 正しい
if: github.ref == 'refs/heads/main'
```

**2. 型の不一致**

```yaml
# ❌ 文字列と数値の誤った比較
if: env.VERSION == 1.0  # env.VERSIONは文字列

# ✅ 正しい
if: env.VERSION == '1.0'
```

**3. 式の省略可能な場所の誤解**

```yaml
# ❌ if以外で${{ }}を省略
env:
  BRANCH: github.ref_name

# ✅ 正しい
env:
  BRANCH: ${{ github.ref_name }}
```

### デバッグ方法

```yaml
# 式の値をログ出力
- name: Debug expressions
  run: |
    echo "Ref: ${{ github.ref }}"
    echo "Event: ${{ github.event_name }}"
    echo "Success: ${{ success() }}"
    echo "Matrix OS: ${{ matrix.os }}"

# JSON全体をダンプ
- name: Dump context
  env:
    GITHUB_CONTEXT: ${{ toJSON(github) }}
  run: echo "$GITHUB_CONTEXT"
```

## 参考資料

- GitHub公式ドキュメント: [Expressions](https://docs.github.com/en/actions/learn-github-actions/expressions)
- GitHub公式ドキュメント: [Contexts](https://docs.github.com/en/actions/learn-github-actions/contexts)
