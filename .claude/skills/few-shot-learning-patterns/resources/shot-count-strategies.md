# Shot Count戦略

## 概要

例示の数（Shot Count）は、Few-Shot Learningの
効果とコストのバランスに大きく影響します。

## Shot Countの比較

| 戦略 | 例数 | トークン効率 | 精度 | 適用場面 |
|------|-----|-------------|------|---------|
| Zero-Shot | 0 | 最高 | 低〜中 | 単純タスク |
| One-Shot | 1 | 高 | 中 | 形式示範 |
| Few-Shot | 2-5 | 中 | 中〜高 | 複雑タスク |
| Many-Shot | 6+ | 低 | 高 | 高精度要求 |

## Zero-Shot（0例）

### 適用条件

```yaml
zero_shot_applicable:
  task_type:
    - 一般的な質問回答
    - シンプルな変換
    - 明確な指示のタスク
  requirements:
    - 明示的な指示で十分
    - 形式が自明
    - モデルの既存知識で対応可能
```

### 例

```markdown
# Zero-Shotプロンプト
以下のテキストを日本語から英語に翻訳してください。

テキスト: こんにちは
翻訳:
```

### 限界

- 特定の出力形式が必要な場合は不適切
- 暗黙のルールを伝えられない
- 複雑なタスクでは精度が低下

## One-Shot（1例）

### 適用条件

```yaml
one_shot_applicable:
  task_type:
    - 形式の示範が主目的
    - パターンが単一
    - 変換ルールが明確
  requirements:
    - 1つの例で形式が明確になる
    - 多様性が不要
    - トークン効率を重視
```

### 例

```markdown
# One-Shotプロンプト
製品レビューから感情と理由を抽出してください。

例:
レビュー: この製品は使いやすくて価格も手頃です。
出力:
{
  "sentiment": "positive",
  "reasons": ["使いやすい", "価格が手頃"]
}

実際のタスク:
レビュー: バッテリーの持ちが悪く、1日持たない。
出力:
```

### 注意点

- 1例が非典型的だとバイアスが生じる
- 多様なパターンに対応できない
- 例の選択が極めて重要

## Few-Shot（2-5例）

### 適用条件

```yaml
few_shot_applicable:
  task_type:
    - 複数パターンの分類
    - 構造化データ抽出
    - 変換・生成タスク
  requirements:
    - 複数のバリエーションが存在
    - 一貫した出力形式が必要
    - Zero/One-Shotで不十分
```

### 例数の決定基準

| 状況 | 推奨例数 | 理由 |
|------|---------|------|
| 2パターンの分類 | 2-3 | 各パターンに1例+境界 |
| 3パターンの分類 | 3-4 | 各パターンに1例 |
| データ抽出 | 3-5 | 多様な入力形式に対応 |
| 生成タスク | 3-4 | スタイルと形式を確立 |

### 例

```markdown
# 3-Shotプロンプト
メールの緊急度を「高」「中」「低」に分類してください。

例1（高）:
メール: 本日中に承認が必要です。至急ご確認ください。
緊急度: 高

例2（中）:
メール: 今週中にレビューをお願いできますでしょうか。
緊急度: 中

例3（低）:
メール: 参考までに共有します。お時間のある時にご覧ください。
緊急度: 低

実際のタスク:
メール: [入力メール]
緊急度:
```

## Many-Shot（6例以上）

### 適用条件

```yaml
many_shot_applicable:
  task_type:
    - 高精度が絶対条件
    - 複雑な分類体系
    - 専門ドメイン
  requirements:
    - トークンコストが許容される
    - 多数のパターンが存在
    - エラー許容度が低い
```

### トレードオフ

| 利点 | 欠点 |
|------|------|
| 高い精度と安定性 | トークン消費が大きい |
| エッジケースに強い | コンテキスト圧迫 |
| パターン網羅性 | 設計コストが高い |
| 一貫性が向上 | レスポンス時間増加 |

### 使用ガイドライン

```yaml
many_shot_guidelines:
  recommended_max: 10
  absolute_max: 15

  structure:
    - 基本例: 3-4
    - バリエーション: 2-3
    - エッジケース: 1-2
    - 難しいケース: 1-2

  organization:
    - カテゴリ別にグループ化
    - 複雑性順に配置
    - 明確な区切りを使用
```

## 動的Shot Count

### コンテキスト適応型

```typescript
interface ShotCountDecision {
  baseCount: number;
  adjustments: {
    complexTask: "+1-2";
    simpleTask: "-1";
    limitedContext: "-1-2";
    highPrecision: "+1-2";
  };
}

function determineShotCount(
  taskComplexity: "low" | "medium" | "high",
  contextBudget: number,
  precisionRequirement: number
): number {
  let count = 3; // デフォルト

  // タスク複雑性による調整
  if (taskComplexity === "high") count += 2;
  if (taskComplexity === "low") count -= 1;

  // コンテキスト予算による制限
  const maxByContext = Math.floor(contextBudget / avgExampleTokens);
  count = Math.min(count, maxByContext);

  // 精度要件による調整
  if (precisionRequirement > 0.95) count += 1;

  return Math.max(1, Math.min(count, 10));
}
```

### タスク複雑性スコア

```yaml
complexity_scoring:
  factors:
    - pattern_count: "分類カテゴリ数"
    - output_structure: "出力の構造化度"
    - domain_specificity: "専門性"
    - ambiguity: "曖昧さの度合い"

  calculation:
    low: "score < 3"
    medium: "3 <= score < 6"
    high: "score >= 6"

  shot_mapping:
    low: "1-2"
    medium: "3-4"
    high: "5-7"
```

## コンテキスト最適化

### トークン予算配分

```
総コンテキスト予算
├─ システムプロンプト: 10-15%
├─ 例示セクション: 30-50%
│   ├─ 例1: 均等配分
│   ├─ 例2: 均等配分
│   └─ ...
├─ 実際の入力: 20-30%
└─ 出力余裕: 10-20%
```

### 例示の圧縮テクニック

```markdown
# 冗長な例
例1:
入力テキスト: これは入力として使用されるテキストです。
期待される出力: これは期待される出力フォーマットです。

# 圧縮した例
例1:
入: これは入力テキストです。
出: 期待出力フォーマット
```

### 例示の優先順位付け

```yaml
priority_order:
  1: "基本パターンを示す例"
  2: "最も頻出するパターンの例"
  3: "重要なバリエーションの例"
  4: "エッジケースの例"

  cutting_order:
    first: "類似パターンの重複例"
    second: "稀なエッジケース"
    last: "基本パターン例"
```

## 決定フローチャート

```
タスクの複雑性は？
│
├─ 単純（単一変換、明確ルール）
│   └─ Zero-Shot または One-Shot
│
├─ 中程度（複数パターン、構造化出力）
│   ├─ パターン数は？
│   │   ├─ 2-3 → 3例
│   │   └─ 4+ → 4-5例
│   └─ コンテキスト制限？
│       ├─ あり → 2-3例に圧縮
│       └─ なし → 推奨数を維持
│
└─ 複雑（専門領域、高精度要求）
    ├─ 精度要件は？
    │   ├─ >95% → 6-8例
    │   └─ <95% → 4-5例
    └─ コンテキスト制限？
        ├─ あり → 必須例のみ
        └─ なし → Many-Shot
```

## 検証と調整

### A/Bテスト

```yaml
ab_test_setup:
  variants:
    A: "3例"
    B: "5例"

  metrics:
    - accuracy: "出力の正確性"
    - consistency: "出力の一貫性"
    - token_cost: "消費トークン数"
    - latency: "応答時間"

  sample_size: 100
  success_criteria: "accuracy >= 90%"
```

### 段階的調整

```
初期: 3例でテスト
│
├─ 精度が目標未達
│   └─ 例を1つ追加して再テスト
│
├─ 精度は達成、トークン超過
│   └─ 例を1つ削減して再テスト
│
└─ 両方達成
    └─ 現在の例数を採用
```
