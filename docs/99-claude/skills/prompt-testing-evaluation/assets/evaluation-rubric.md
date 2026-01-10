# 評価ルーブリックテンプレート

## 概要

評価ルーブリックは、出力品質を一貫して評価するための
標準化された基準です。

## 汎用ルーブリック

### 5段階評価スケール

```yaml
general_rubric:
  5_excellent:
    description: "期待を大きく上回る"
    criteria:
      - すべての要件を完全に満たす
      - 追加の価値を提供
      - 改善点がほぼない

  4_good:
    description: "期待を満たす"
    criteria:
      - ほとんどの要件を満たす
      - 軽微な問題のみ
      - 実用に十分

  3_acceptable:
    description: "最低限の期待を満たす"
    criteria:
      - 主要な要件を満たす
      - いくつかの問題あり
      - 改善の余地あり

  2_poor:
    description: "期待を下回る"
    criteria:
      - 一部の要件のみ満たす
      - 重大な問題あり
      - 大幅な改善が必要

  1_unacceptable:
    description: "受け入れられない"
    criteria:
      - 要件を満たさない
      - 使用不可
      - 完全なやり直しが必要
```

## 次元別ルーブリック

### 正確性（Accuracy）

```yaml
accuracy_rubric:
  dimension: "正確性"
  description: "情報の事実的正確さ"

  levels:
    5:
      label: "完全に正確"
      criteria:
        - すべての事実が正確
        - 誤解を招く表現なし
        - 情報源と一致

    4:
      label: "ほぼ正確"
      criteria:
        - 99%以上の事実が正確
        - 軽微な不正確さ1つ以下
        - 本質的な誤りなし

    3:
      label: "概ね正確"
      criteria:
        - 90%以上の事実が正確
        - 軽微な不正確さ数個
        - 重大な誤りなし

    2:
      label: "部分的に不正確"
      criteria:
        - 70-90%の事実が正確
        - 重要な情報に誤り
        - 検証が必要

    1:
      label: "不正確"
      criteria:
        - 70%未満の事実が正確
        - 重大な誤りあり
        - 信頼できない
```

### 完全性（Completeness）

```yaml
completeness_rubric:
  dimension: "完全性"
  description: "必要な情報の網羅度"

  levels:
    5:
      label: "完全"
      criteria:
        - すべての必須項目を含む
        - 有用な追加情報あり
        - 欠落なし

    4:
      label: "ほぼ完全"
      criteria:
        - 必須項目をすべて含む
        - 一部の付加情報欠落
        - 実用上問題なし

    3:
      label: "概ね完全"
      criteria:
        - 主要な必須項目を含む
        - 一部の必須項目欠落
        - 主目的は達成可能

    2:
      label: "不完全"
      criteria:
        - 重要な項目が欠落
        - 追加情報が必要
        - 目的達成に支障

    1:
      label: "大幅に不完全"
      criteria:
        - 大部分の情報が欠落
        - 使用不可
        - 作り直しが必要
```

### 明確性（Clarity）

```yaml
clarity_rubric:
  dimension: "明確性"
  description: "表現の明確さと理解しやすさ"

  levels:
    5:
      label: "非常に明確"
      criteria:
        - 誰でも即座に理解可能
        - 論理的な構造
        - 専門用語に適切な説明

    4:
      label: "明確"
      criteria:
        - 対象読者が容易に理解
        - 構造化されている
        - 曖昧さがほぼない

    3:
      label: "概ね明確"
      criteria:
        - 理解可能だが努力が必要
        - 一部曖昧な箇所あり
        - 構造に改善余地

    2:
      label: "不明確"
      criteria:
        - 理解が困難
        - 曖昧な表現が多い
        - 構造が不明確

    1:
      label: "非常に不明確"
      criteria:
        - 理解不能
        - 支離滅裂
        - 意味が伝わらない
```

### 適切性（Relevance）

```yaml
relevance_rubric:
  dimension: "適切性"
  description: "質問や文脈への適合度"

  levels:
    5:
      label: "完全に適切"
      criteria:
        - 質問に直接回答
        - 文脈に完全に適合
        - 無関係な情報なし

    4:
      label: "適切"
      criteria:
        - 質問にほぼ回答
        - 文脈に適合
        - わずかに無関係な情報

    3:
      label: "概ね適切"
      criteria:
        - 質問に部分的に回答
        - 一部文脈外の情報
        - 関連性は認められる

    2:
      label: "不適切"
      criteria:
        - 質問への回答が不十分
        - 文脈から外れている
        - 無関係な情報が多い

    1:
      label: "全く不適切"
      criteria:
        - 質問に回答していない
        - 完全に文脈外
        - 的外れ
```

## タスク特化ルーブリック

### 要約タスク用

```yaml
summarization_rubric:
  dimensions:
    faithfulness:
      weight: 0.4
      description: "原文への忠実性"
      levels:
        5: "原文の意味を完全に保持"
        3: "主要な意味は保持、一部省略"
        1: "原文と異なる意味"

    conciseness:
      weight: 0.3
      description: "簡潔性"
      levels:
        5: "無駄なく最適な長さ"
        3: "やや冗長だが許容範囲"
        1: "過度に冗長または短すぎ"

    coverage:
      weight: 0.3
      description: "重要点の網羅"
      levels:
        5: "すべての重要点を含む"
        3: "主要な点は含む"
        1: "重要点の多くが欠落"
```

### 分類タスク用

```yaml
classification_rubric:
  dimensions:
    correctness:
      weight: 0.6
      description: "分類の正確性"
      levels:
        5: "完全に正しい分類"
        3: "近いカテゴリだが正確でない"
        1: "全く異なるカテゴリ"

    confidence_calibration:
      weight: 0.2
      description: "確信度の妥当性"
      levels:
        5: "確信度が実際の正確性と一致"
        3: "やや過信または過小評価"
        1: "確信度が全く当てにならない"

    explanation:
      weight: 0.2
      description: "分類理由の説明"
      levels:
        5: "明確で論理的な説明"
        3: "説明があるが不十分"
        1: "説明なしまたは不適切"
```

### コード生成用

```yaml
code_generation_rubric:
  dimensions:
    correctness:
      weight: 0.4
      description: "コードの正確性"
      levels:
        5: "エラーなく動作、全テストパス"
        3: "一部のケースで動作"
        1: "動作しないまたはエラー"

    efficiency:
      weight: 0.2
      description: "効率性"
      levels:
        5: "最適なアルゴリズム・実装"
        3: "許容範囲の効率"
        1: "非効率な実装"

    readability:
      weight: 0.2
      description: "可読性"
      levels:
        5: "クリーンで理解しやすい"
        3: "理解可能だが改善余地"
        1: "理解困難"

    best_practices:
      weight: 0.2
      description: "ベストプラクティス準拠"
      levels:
        5: "すべてのベストプラクティスに準拠"
        3: "主要なプラクティスに準拠"
        1: "準拠していない"
```

## ルーブリックの使用方法

### 評価プロセス

```markdown
## 評価手順

1. 出力を読み、全体的な印象を把握
2. 各次元について個別に評価
3. 該当するレベルの基準を確認
4. スコアを記録し、理由を記述
5. 総合スコアを計算

## 評価記録テンプレート

### 評価対象

- テストケースID: {{test_case_id}}
- 入力: {{input}}
- 出力: {{output}}

### 次元別評価

| 次元   | スコア | 理由 |
| ------ | ------ | ---- |
| 正確性 | /5     |      |
| 完全性 | /5     |      |
| 明確性 | /5     |      |
| 適切性 | /5     |      |

### 総合評価

- 総合スコア: /5
- 主な強み:
- 主な改善点:
- その他コメント:
```

### スコア集約

```typescript
interface RubricScore {
  dimension: string;
  score: number;
  weight: number;
  reason: string;
}

function calculateWeightedScore(scores: RubricScore[]): number {
  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);

  return weightedSum / totalWeight;
}
```

## カスタムルーブリック作成ガイド

### Step 1: 次元の特定

```yaml
process:
  1_identify_dimensions:
    questions:
      - このタスクで最も重要な品質特性は何か？
      - ユーザーは何を最も重視するか？
      - 失敗のモードは何か？
```

### Step 2: レベルの定義

```yaml
2_define_levels:
  guidelines:
    - 各レベルの差を明確に
    - 具体的で観察可能な基準
    - 主観を最小化
```

### Step 3: 重み付け

```yaml
3_assign_weights:
  guidelines:
    - ビジネス影響度を考慮
    - 合計が1.0になるように
    - 最重要次元に最大の重み
```

### Step 4: 検証

```yaml
4_validate:
  methods:
    - サンプル出力で試行
    - 評価者間の一致率を確認
    - 必要に応じて調整
```
