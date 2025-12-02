---
name: command-performance-optimization
description: |
  コマンドのパフォーマンス最適化を専門とするスキル。
  トークン効率化、並列実行の活用、モデル選択の最適化、
  実行速度の改善方法を提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/command-performance-optimization/resources/execution-speed.md`: キャッシング・早期リターン・遅延実行・バッチ処理による実行速度改善と<5秒目標の測定方法
  - `.claude/skills/command-performance-optimization/resources/token-optimization.md`: description/本文圧縮で73%削減、不要情報削除と箇条書き活用によるトークン最適化技法
  - `.claude/skills/command-performance-optimization/resources/model-selection.md`: Haiku(単純)/Sonnet(標準)/Opus(複雑)の選択基準と90%コスト削減のHaiku活用戦略
  - `.claude/skills/command-performance-optimization/resources/parallel-execution.md`: 独立タスクの並列化条件判定とBranch/Wait/Combineパターンによる並列実行設計
  - `.claude/skills/command-performance-optimization/templates/optimized-command-template.md`: 最適化コマンドテンプレート
  - `.claude/skills/command-performance-optimization/templates/parallel-execution-template.md`: 並列実行テンプレート
  - `.claude/skills/command-performance-optimization/scripts/analyze-performance.mjs`: パフォーマンス分析スクリプト

  使用タイミング:
  - コマンドの実行速度を改善したい時
  - トークン使用量を削減したい時
  - 並列実行を活用したい時

  Use proactively when optimizing command performance, reducing token usage,
  or implementing parallel execution.
version: 1.0.0
---

# Command Performance Optimization

## 概要

このスキルは、Claude Codeコマンドのパフォーマンス最適化を提供します。
トークン効率化、並列実行、モデル選択最適化により、
高速で効率的なコマンドを作成できます。

**主要な価値**:
- トークン使用量の削減
- 実行速度の向上
- 並列実行の活用
- 最適なモデル選択

**対象ユーザー**:
- コマンドを作成するエージェント（@command-arch）
- パフォーマンスを重視する開発者
- 大規模プロジェクトで効率化したいチーム

## リソース構造

```
command-performance-optimization/
├── SKILL.md                                    # 本ファイル
├── resources/
│   ├── token-optimization.md                  # トークン最適化詳細
│   ├── parallel-execution.md                  # 並列実行ガイド
│   ├── model-selection.md                     # モデル選択ガイド
│   └── execution-speed.md                     # 実行速度改善
└── templates/
    ├── optimized-command-template.md          # 最適化コマンドテンプレート
    └── parallel-execution-template.md         # 並列実行テンプレート
```

### リソース種別

- **最適化詳細** (`resources/*.md`): 各最適化手法の詳細
- **テンプレート** (`templates/`): 最適化パターン別のテンプレート

## いつ使うか

### シナリオ1: トークン削減
**状況**: コマンドのトークン使用量が多すぎる

**適用条件**:
- [ ] description が長すぎる
- [ ] 本文が冗長
- [ ] 不要な情報が多い

**期待される成果**: 60-80%のトークン削減

### シナリオ2: 実行速度改善
**状況**: コマンドの実行が遅い

**適用条件**:
- [ ] 連続処理が多い
- [ ] 並列化可能な処理がある
- [ ] 待機時間が長い

**期待される成果**: 実行時間の短縮

### シナリオ3: モデル選択最適化
**状況**: 適切なモデルを選択したい

**適用条件**:
- [ ] Opusを使う必要がない処理
- [ ] Haikuで十分な処理
- [ ] コスト最適化が必要

**期待される成果**: コストと速度のバランス

## トークン最適化

### 1. description の圧縮

**Before（冗長）**:

```yaml
description: |
  This command creates a new React component with TypeScript support.
  It will generate the component file, test file, and story file.
  The component will be created in the components directory.
  It also updates the index file to export the new component.
  This is useful when you need to quickly scaffold a new component.
  You can use this command whenever you want to add a component.
  (6行、約50単語)
```

**After（簡潔）**:

```yaml
description: |
  Create React component with TypeScript, tests, and stories.
  Automatically exports in index. Use for rapid component scaffolding.
  (2行、約20単語、60%削減)
```

### 2. 本文の最適化

**Before（冗長）**:

```markdown
# Create Component

This command will create a new React component for you.

## Step 1: Create Component File
In this step, we will create the main component file.
The file will be created in the components directory.
The file will be named after the component name you provide.

Create `src/components/$ARGUMENTS/$ARGUMENTS.tsx` with:
- A TypeScript interface for the props
- A functional component that uses the interface
- JSDoc comments to document the component

## Step 2: Create Test File
In this step, we will create a test file for the component.
The test file will contain basic tests for the component.

Create `src/components/$ARGUMENTS/$ARGUMENTS.test.tsx` with:
- A test for rendering the component
- A test for props
- Tests for interactions

(約150単語)
```

**After（簡潔）**:

```markdown
# Create Component

Component: $ARGUMENTS

## Create Files
`src/components/$ARGUMENTS/$ARGUMENTS.tsx`:
- TypeScript interface for props
- Functional component with hooks
- JSDoc comments

`src/components/$ARGUMENTS/$ARGUMENTS.test.tsx`:
- Render, props, interaction tests

(約40単語、73%削減)
```

### 3. 箇条書きの活用

**Before（冗長）**:

```markdown
First, check if the file exists. Then, read the file contents.
After that, parse the contents. Finally, validate the parsed data.
```

**After（簡潔）**:

```markdown
1. Check file exists
2. Read contents
3. Parse
4. Validate
```

## 並列実行

### パターン1: 独立タスクの並列化

**Before（連続実行）**:

```markdown
## Execution
1. Run linter: `pnpm run lint`
2. Run tests: `pnpm test`
3. Run type check: `pnpm run typecheck`

Total time: 5 + 10 + 3 = 18 seconds
```

**After（並列実行）**:

```markdown
## Execution
Run checks in parallel:
```bash
pnpm run lint & \
pnpm test & \
pnpm run typecheck & \
wait
```

Total time: max(5, 10, 3) = 10 seconds (44% faster)
```

### パターン2: バッチ処理

**Before（ループ）**:

```bash
for file in src/**/*.js; do
  npx prettier --write "$file"
done

# 100 files × 0.5s = 50 seconds
```

**After（バッチ）**:

```bash
npx prettier --write "src/**/*.js"

# All files in one run = 5 seconds (90% faster)
```

### パターン3: コマンドの並列起動

**Before（連続）**:

```markdown
Execute `/lint`
Wait for completion
Execute `/test`
Wait for completion
Execute `/build`
```

**After（並列）**:

```markdown
Execute in parallel:
- `/lint` &
- `/test` &
Wait for both to complete
Then execute `/build`
```

## モデル選択最適化

### 選択マトリックス

| タスクの複雑度 | 推奨モデル | 理由 |
|--------------|-----------|------|
| **シンプル** | Haiku | 高速・低コスト |
| フォーマット | Haiku | 決定論的タスク |
| シンプルな変換 | Haiku | パターン認識のみ |
| **中程度** | Sonnet | バランス |
| コード生成 | Sonnet | 適度な判断が必要 |
| レビュー | Sonnet | 文脈理解が必要 |
| **複雑** | Opus | 高度な推論 |
| アーキテクチャ設計 | Opus | 複雑な判断 |
| 複雑なリファクタリング | Opus | 深い理解が必要 |

### 実装例

**シンプルなタスク**:

```yaml
---
description: Format code with Prettier
model: claude-3-5-haiku-20241022  # Haiku で十分
---

# Format Code
Run: `npx prettier --write "src/**/*.{js,ts}"`
```

**中程度のタスク**:

```yaml
---
description: Review code for best practices
model: claude-sonnet-4-5-20250929  # デフォルト（Sonnet）
---

# Code Review
Analyze code quality, patterns, potential issues
```

**複雑なタスク**:

```yaml
---
description: Design microservices architecture
model: claude-opus-4-20250514  # Opus が必要
---

# Architecture Design
Evaluate requirements, design services, plan integration
```

### 動的モデル選択

```markdown
## Model Selection

Based on $ARGUMENTS complexity:
- If "simple" → Use Haiku (fast, cheap)
- If "standard" → Use Sonnet (balanced)
- If "complex" → Use Opus (thorough)

Analyze task automatically and select appropriate model
```

## 実行速度改善

### 1. 遅延読み込み

**Before（事前ロード）**:

```markdown
## Preparation
Load all configuration files:
- package.json
- tsconfig.json
- .eslintrc
- .prettierrc
- jest.config.js

(5 seconds even if not all needed)
```

**After（遅延ロード）**:

```markdown
## Lazy Loading
Load configuration only when needed:
- If linting → Load .eslintrc
- If testing → Load jest.config.js
- etc.

(1-2 seconds, load only what's needed)
```

### 2. キャッシングの活用

```markdown
## Step 1: Check Cache
```bash
CACHE_FILE=".claude/cache/$COMMAND_NAME"

if [ -f "$CACHE_FILE" ]; then
  CACHE_TIME=$(stat -f %m "$CACHE_FILE")
  CURRENT_TIME=$(date +%s)
  AGE=$((CURRENT_TIME - CACHE_TIME))

  if [ $AGE -lt 3600 ]; then  # 1 hour
    echo "✅ Using cached results"
    cat "$CACHE_FILE"
    exit 0
  fi
fi
```

## Step 2: Execute (if cache miss)
Run command and cache results
```

### 3. 早期終了

**Before（全チェック）**:

```markdown
## Validation
1. Check arg1
2. Check arg2
3. Check arg3
4. Check env
5. Check files

(All checks, even if arg1 fails)
```

**After（早期終了）**:

```markdown
## Validation
Check arg1 → Fail fast if invalid
Check arg2 → Fail fast if invalid
Check arg3 → Fail fast if invalid

(Stop at first failure, save time)
```

### 4. 最小限の出力

**Before（冗長）**:

```bash
echo "Starting process..."
echo "Processing file 1..."
echo "Processing file 2..."
...
echo "Processing file 100..."
echo "Done"

(Excessive output slows execution)
```

**After（簡潔）**:

```bash
echo "Processing 100 files..."
# Silent processing
echo "✅ Done"

(Minimal output, faster execution)
```

## パフォーマンス計測

### ベンチマーク

```markdown
## Performance Metrics

Add timing to your command:
```bash
START_TIME=$(date +%s)

# Your command logic here

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "⏱️  Execution time: ${DURATION}s"
```

### 最適化前後の比較

```markdown
## Optimization Results

Before:
- Token usage: 5,000 tokens
- Execution time: 30 seconds
- Model: Opus

After:
- Token usage: 1,200 tokens (76% reduction)
- Execution time: 8 seconds (73% faster)
- Model: Sonnet

Improvements:
- 4x faster execution
- 10x cheaper (Opus → Sonnet + fewer tokens)
```

## ベストプラクティス

### 1. トークン削減

- [ ] description は簡潔か？（2-4行）
- [ ] 箇条書きを活用しているか？
- [ ] 冗長な説明を削除したか？
- [ ] コードブロックは必要最小限か？

### 2. 並列実行

- [ ] 独立タスクを特定したか？
- [ ] 並列実行可能な処理を並列化したか？
- [ ] バッチ処理を活用したか？
- [ ] 待機時間を最小化したか？

### 3. モデル選択

- [ ] タスクの複雑度を評価したか？
- [ ] 適切なモデルを選択したか？
- [ ] 過剰なモデルを使っていないか？
- [ ] コストを考慮したか？

### 4. 実行速度

- [ ] 遅延読み込みを実装したか？
- [ ] キャッシングを活用したか？
- [ ] 早期終了を実装したか？
- [ ] 出力を最小限にしたか？

## 詳細リソースの参照

### トークン最適化
詳細は `resources/token-optimization.md` を参照

### 並列実行
詳細は `resources/parallel-execution.md` を参照

### モデル選択
詳細は `resources/model-selection.md` を参照

### 実行速度
詳細は `resources/execution-speed.md` を参照

### テンプレート
- 最適化コマンド: `templates/optimized-command-template.md`
- 並列実行: `templates/parallel-execution-template.md`

## コマンドリファレンス

このスキルで使用可能なリソース、テンプレートへのアクセスコマンド:

### リソース読み取り

```bash
# トークン最適化詳細
cat .claude/skills/command-performance-optimization/resources/token-optimization.md

# 並列実行ガイド
cat .claude/skills/command-performance-optimization/resources/parallel-execution.md

# モデル選択ガイド
cat .claude/skills/command-performance-optimization/resources/model-selection.md

# 実行速度改善
cat .claude/skills/command-performance-optimization/resources/execution-speed.md
```

### テンプレート参照

```bash
# 最適化コマンドテンプレート
cat .claude/skills/command-performance-optimization/templates/optimized-command-template.md

# 並列実行テンプレート
cat .claude/skills/command-performance-optimization/templates/parallel-execution-template.md
```

### 他のスキルのスクリプトを活用

```bash
# 知識ドキュメントの品質検証
node .claude/skills/knowledge-management/scripts/validate-knowledge.mjs .claude/skills/command-performance-optimization/resources/token-optimization.md

# トークン見積もり
node .claude/skills/context-optimization/scripts/estimate-tokens.mjs .claude/skills/command-performance-optimization/SKILL.md

# ドキュメント構造分析
node .claude/skills/documentation-architecture/scripts/analyze-structure.mjs .claude/skills/command-performance-optimization
```

## 関連スキル

- `.claude/skills/command-structure-fundamentals/SKILL.md` - model フィールド
- `.claude/skills/command-best-practices/SKILL.md` - DRY原則

## 更新履歴

- v1.0.0 (2025-11-24): 初版作成
