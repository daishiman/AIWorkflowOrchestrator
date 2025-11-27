---
name: prompt-testing-evaluation
description: |
  プロンプトのテスト、評価、反復改善を専門とするスキル。
  A/Bテスト、評価メトリクス、自動化されたプロンプト品質保証により、
  本番環境で信頼性の高いプロンプトを実現します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/prompt-testing-evaluation/resources/ab-testing-guide.md`: プロンプトA/Bテスト設計（サンプルサイズ、メトリクス、成功基準）
  - `.claude/skills/prompt-testing-evaluation/resources/automated-evaluation.md`: LLM-as-a-Judge、自動スコアリング、回帰テスト自動化手法
  - `.claude/skills/prompt-testing-evaluation/resources/evaluation-metrics.md`: 精度、一貫性、完全性、レイテンシ、コスト等の定量評価指標
  - `.claude/skills/prompt-testing-evaluation/scripts/prompt-evaluator.mjs`: Prompt Evaluator Script
  - `.claude/skills/prompt-testing-evaluation/templates/evaluation-rubric.md`: 評価ルーブリックテンプレート
  - `.claude/skills/prompt-testing-evaluation/templates/test-case-template.md`: テストケーステンプレート

  専門分野:
  - A/Bテスト: 複数プロンプトの比較評価
  - 評価メトリクス: 精度、一貫性、レイテンシ、コスト
  - 回帰テスト: プロンプト変更の影響検証
  - 自動評価: LLM-as-a-Judge、自動スコアリング

  使用タイミング:
  - プロンプトの品質を定量的に評価したい時
  - 複数のプロンプト候補を比較したい時
  - プロンプトの継続的改善サイクルを確立したい時
  - 本番デプロイ前の品質保証を行いたい時

  Use proactively when evaluating prompt quality,
  comparing prompt variations, or establishing
  prompt testing pipelines.
version: 1.0.0
---

# Prompt Testing & Evaluation

## 概要

プロンプトのテストと評価は、AIシステムの品質保証における
重要な工程です。体系的なテストにより、信頼性の高いプロンプトを
開発・維持することができます。

**主要な価値**:
- プロンプト品質の定量化
- 回帰の早期検出
- 継続的な改善サイクル
- 本番環境でのリスク低減

## リソース構造

```
prompt-testing-evaluation/
├── SKILL.md
├── resources/
│   ├── evaluation-metrics.md           # 評価メトリクス
│   ├── ab-testing-guide.md             # A/Bテストガイド
│   └── automated-evaluation.md         # 自動評価手法
├── templates/
│   ├── evaluation-rubric.md            # 評価ルーブリック
│   └── test-case-template.md           # テストケーステンプレート
└── scripts/
    └── prompt-evaluator.mjs            # 評価スクリプト
```

## コマンドリファレンス

### リソース読み取り

```bash
# 評価メトリクス
cat .claude/skills/prompt-testing-evaluation/resources/evaluation-metrics.md

# A/Bテストガイド
cat .claude/skills/prompt-testing-evaluation/resources/ab-testing-guide.md

# 自動評価手法
cat .claude/skills/prompt-testing-evaluation/resources/automated-evaluation.md
```

### テンプレート参照

```bash
# 評価ルーブリック
cat .claude/skills/prompt-testing-evaluation/templates/evaluation-rubric.md

# テストケーステンプレート
cat .claude/skills/prompt-testing-evaluation/templates/test-case-template.md
```

## テスト戦略

### テストピラミッド

```
           ▲
          /\
         /  \
        / E2E\        少数の統合テスト
       /──────\
      /        \
     / 機能テスト \    中程度の機能テスト
    /────────────\
   /              \
  /  ユニットテスト  \  多数のユニットテスト
 /──────────────────\
```

### テストレベル

| レベル | 目的 | 頻度 |
|--------|------|------|
| ユニット | 個別プロンプトの基本動作 | 毎回 |
| 機能 | タスク完了能力 | 変更時 |
| 統合 | システム全体の整合性 | リリース前 |
| 回帰 | 既存機能の維持 | 変更後 |

## 評価メトリクス

### 品質メトリクス

| メトリクス | 説明 | 測定方法 |
|-----------|------|---------|
| 精度 | 正しい出力の割合 | 正解との比較 |
| 一貫性 | 同入力での出力の安定性 | 複数回実行の分散 |
| 完全性 | 必要情報の網羅度 | チェックリスト |
| 適切性 | 文脈への適合度 | 人間評価 |

### 運用メトリクス

| メトリクス | 説明 | 目標値 |
|-----------|------|--------|
| レイテンシ | 応答時間 | タスク依存 |
| トークン数 | 消費トークン | 予算内 |
| エラー率 | 失敗の割合 | <5% |
| コスト | 1リクエストあたりコスト | 予算内 |

## ワークフロー

### Phase 1: テスト計画

**目的**: テスト戦略とケースを定義

**成果物**:
- テスト目標の明確化
- テストケースの設計
- 評価基準の設定

**チェックリスト**:
- [ ] テスト対象のプロンプトを特定
- [ ] 評価メトリクスを選択
- [ ] テストデータを準備
- [ ] 合格基準を定義

### Phase 2: テスト実行

**目的**: テストを実行しデータを収集

**実行手順**:
1. テストケースの実行
2. 出力の記録
3. メトリクスの計算
4. エラーの記録

### Phase 3: 分析と改善

**目的**: 結果を分析し改善点を特定

**分析項目**:
- 失敗パターンの特定
- メトリクスの傾向
- ボトルネックの発見
- 改善機会の優先順位付け

### Phase 4: 反復

**目的**: 改善を実施し再テスト

**サイクル**:
```
プロンプト修正 → テスト → 分析 → 修正 → ...
```

## テスト手法

### A/Bテスト

**目的**: 2つのプロンプトバリアントを比較

**設計**:
```yaml
ab_test:
  control: prompt_v1
  treatment: prompt_v2
  sample_size: 100
  metrics:
    - accuracy
    - latency
    - user_preference
  success_criteria:
    accuracy_improvement: ">5%"
    latency_regression: "<10%"
```

### ゴールデンデータセット

**目的**: 既知の正解との比較

**構造**:
```yaml
golden_dataset:
  - input: "入力1"
    expected_output: "期待される出力1"
    metadata:
      category: "category_a"
      difficulty: "easy"

  - input: "入力2"
    expected_output: "期待される出力2"
    metadata:
      category: "category_b"
      difficulty: "hard"
```

### LLM-as-a-Judge

**目的**: AIによる自動評価

**評価プロンプト**:
```markdown
以下の出力を評価してください。

入力: {{input}}
出力: {{output}}
期待: {{expected}}

評価基準:
1. 正確性 (1-5)
2. 完全性 (1-5)
3. 明確性 (1-5)

スコアと理由を記載してください。
```

## ベストプラクティス

### すべきこと

1. **テストの自動化**:
   - CI/CDパイプラインに統合
   - 定期的な回帰テスト
   - 自動レポート生成

2. **多角的な評価**:
   - 複数のメトリクスを使用
   - 人間評価とAI評価の併用
   - エッジケースのテスト

3. **バージョン管理**:
   - プロンプトのバージョニング
   - テスト結果の記録
   - 変更履歴の追跡

4. **統計的厳密性**:
   - 適切なサンプルサイズ
   - 有意差検定
   - 再現性の確保

### 避けるべきこと

1. **単一メトリクスへの依存**:
   - ❌ 精度だけで判断
   - ✅ 複合的なメトリクス

2. **テストなしの変更**:
   - ❌ 本番環境で直接変更
   - ✅ テスト環境で検証後にデプロイ

3. **エッジケースの無視**:
   - ❌ 典型例のみテスト
   - ✅ 境界ケースを含む

4. **過度の最適化**:
   - ❌ テストセットへの過学習
   - ✅ 汎化性能の重視

## トラブルシューティング

### 問題1: テスト結果が不安定

**症状**: 同じテストで異なる結果

**対策**:
1. Temperatureを下げる
2. サンプルサイズを増やす
3. 平均値を使用
4. シード固定（可能な場合）

### 問題2: 評価基準が曖昧

**症状**: 評価者間で判断が異なる

**対策**:
1. 詳細なルーブリックを作成
2. 具体例を提供
3. 評価者訓練を実施
4. Inter-rater reliabilityを測定

### 問題3: テストが遅い

**症状**: テスト実行に時間がかかりすぎる

**対策**:
1. 並列実行
2. テストケースの優先順位付け
3. サンプリング戦略
4. キャッシュの活用

## 関連スキル

- **prompt-engineering-for-agents** (`.claude/skills/prompt-engineering-for-agents/SKILL.md`)
- **hallucination-prevention** (`.claude/skills/hallucination-prevention/SKILL.md`)
- **best-practices-curation** (`.claude/skills/best-practices-curation/SKILL.md`)

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-25 | 初版作成 |
