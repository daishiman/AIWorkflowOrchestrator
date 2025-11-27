---
name: prioritization-frameworks
description: |
  MoSCoW法、RICE Scoring、Kano Modelなどの優先順位付けフレームワーク。
  客観的な基準に基づいて、限られたリソースで最大の価値を提供するための
  意思決定手法を体系化します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/prioritization-frameworks/scripts/rice-calculator.py`: RICE Score計算機（Reach×Impact×Confidence÷Effortの自動算出）
version: 1.0.0
---

# 優先順位付けフレームワークスキル

## 概要

複数の優先順位付け手法を状況に応じて使い分けることで、
ステークホルダー間の合意形成と価値最大化を実現します。

## いつ使うか

- プロダクトバックログの優先順位付け
- 機能開発の順序決定
- リソース配分の最適化
- ステークホルダー間の調整
- トレードオフの意思決定

## 主要フレームワーク

### MoSCoW 法

#### カテゴリー定義

```
Must have (必須):
- ないと製品が成立しない
- 法規制要件
- 最小限の価値提供

Should have (重要):
- 重要だが回避策がある
- 競合優位性に貢献
- ユーザー満足度に大きく影響

Could have (あると良い):
- あれば価値が増す
- 余裕があれば実装
- 将来的な拡張

Won't have (今回は対象外):
- 明示的に対象外
- 将来のリリース候補
- リソース制約により除外
```

#### 配分ガイドライン

```
推奨配分:
- Must have: 60%
- Should have: 20%
- Could have: 20%
- Won't have: 記録のみ
```

### RICE Scoring

#### 計算式

```
RICE Score = (Reach × Impact × Confidence) / Effort

各要素の定義:
Reach: 影響を受けるユーザー数/期間
Impact: 影響の大きさ (0.25, 0.5, 1, 2, 3)
Confidence: 確信度 (50%, 80%, 100%)
Effort: 必要な人月
```

#### Impact スケール

```
3 = Massive: 劇的な改善
2 = High: 大きな改善
1 = Medium: 中程度の改善
0.5 = Low: 小さな改善
0.25 = Minimal: 最小限の改善
```

#### 実装例

```
機能A:
- Reach: 10,000 users/quarter
- Impact: 2 (High)
- Confidence: 80%
- Effort: 3 person-months
- Score: (10,000 × 2 × 0.8) / 3 = 5,333

機能B:
- Reach: 5,000 users/quarter
- Impact: 3 (Massive)
- Confidence: 100%
- Effort: 2 person-months
- Score: (5,000 × 3 × 1.0) / 2 = 7,500

結果: 機能B > 機能A
```

### Kano Model

#### 品質カテゴリー

```
基本品質 (Basic):
- あって当然の機能
- ないと不満
- あっても満足度は上がらない
例: ログイン機能、データ保存

性能品質 (Performance):
- 多いほど満足度が上がる
- リニアな関係
例: 処理速度、ストレージ容量

魅力品質 (Delighter):
- なくても不満はない
- あると満足度が大きく向上
例: AI推奨、ゲーミフィケーション

無関心品質 (Indifferent):
- あってもなくても影響なし
例: 使われない設定項目

逆品質 (Reverse):
- ない方が良い
例: 過度な通知、複雑な設定
```

#### Kano アンケート

```
機能的質問: その機能があったらどう思うか？
非機能的質問: その機能がなかったらどう思うか？

回答選択肢:
1. とても嬉しい
2. 当然だと思う
3. 特に何も感じない
4. 仕方ないと思う
5. とても不満
```

### Value vs Effort Matrix

#### 4 象限の戦略

```
高価値・低努力 (Quick Wins):
→ 最優先で実装
→ ROI最大

高価値・高努力 (Major Projects):
→ 計画的に実装
→ 段階的アプローチ

低価値・低努力 (Fill Ins):
→ 余裕があれば実装
→ バッチで処理

低価値・高努力 (Time Sinks):
→ 実装しない
→ 代替案を検討
```

### ICE Scoring

#### 計算式

```
ICE Score = Impact × Confidence × Ease

Impact: ビジネスへの影響 (1-10)
Confidence: 成功の確信度 (1-10)
Ease: 実装の容易さ (1-10)
```

#### スコアリング基準

```
Impact:
10: ゲームチェンジャー
7-9: 大きな改善
4-6: 中程度の改善
1-3: 小さな改善

Confidence:
10: データで実証済み
7-9: 強い根拠あり
4-6: 合理的な推測
1-3: 仮説レベル

Ease:
10: 数時間で完了
7-9: 数日で完了
4-6: 1-2週間
1-3: 1ヶ月以上
```

### Weighted Scoring

#### 評価基準の設定

```
基準例と重み付け:
- ビジネス価値: 30%
- ユーザー価値: 25%
- 技術的実現性: 15%
- コスト: 15%
- リスク: 10%
- 戦略的整合性: 5%

合計: 100%
```

#### スコアリングマトリクス

```
| 機能 | ビジネス(30%) | ユーザー(25%) | 技術(15%) | コスト(15%) | リスク(10%) | 戦略(5%) | 総合 |
|-----|-------------|-------------|----------|-----------|-----------|---------|------|
| A   | 8×0.3=2.4   | 9×0.25=2.25 | 7×0.15=1.05 | 6×0.15=0.9 | 8×0.1=0.8 | 9×0.05=0.45 | 7.85 |
| B   | 7×0.3=2.1   | 7×0.25=1.75 | 9×0.15=1.35 | 8×0.15=1.2 | 7×0.1=0.7 | 8×0.05=0.4  | 7.5  |
```

## 複合的アプローチ

### 段階的フィルタリング

```
Step 1: MoSCoW法で基本分類
↓ Must/Should のみ選択

Step 2: Kano分析で品質分類
↓ 基本品質と性能品質を優先

Step 3: RICE Scoringで順位付け
↓ スコア順にランキング

Step 4: リソース制約でカットライン
→ 実装リストの確定
```

### コンテキスト別選択

```
スタートアップ期:
- ICE Scoring (素早い実験)
- Value vs Effort (Quick Wins重視)

成長期:
- RICE Scoring (スケール重視)
- Kano Model (差別化)

成熟期:
- Weighted Scoring (バランス)
- MoSCoW (効率化)
```

## 実践テクニック

### ステークホルダー調整

#### 事前準備

```
1. 評価基準の合意
2. 重み付けの調整
3. データの収集
4. 仮説の明確化
```

#### ワークショップ運営

```
1. 個別評価 (バイアス防止)
2. 結果の共有
3. 差異の議論
4. 合意形成
5. 文書化
```

### バイアスの管理

#### 認知バイアス対策

```
確認バイアス:
→ 反対意見を意図的に収集

アンカリング:
→ 独立した評価を先に実施

サンクコスト:
→ 将来価値のみで判断

現状維持バイアス:
→ 変化の価値を明示
```

### データ駆動の強化

#### メトリクス活用

```
定量データ:
- ユーザー行動ログ
- A/Bテスト結果
- 市場調査データ
- 競合分析

定性データ:
- ユーザーインタビュー
- サポートチケット分析
- ソーシャルリスニング
- NPS verbatim
```

## 優先順位の可視化

### プライオリティマトリクス

```
    高 ┌─────────┬─────────┐
    価 │ Plan    │ Do Now  │
    値 │ (計画)  │ (即実行) │
       ├─────────┼─────────┤
    低 │ Avoid   │ Quick   │
    価 │ (回避)  │ Wins    │
    値 └─────────┴─────────┘
       高努力      低努力
```

### ロードマップへの反映

```
Now (Sprint 1-2):
- Must have items
- Quick wins
- Tech debt (critical)

Next (Sprint 3-4):
- Should have items
- Major projects (phase 1)
- Performance improvements

Later (Sprint 5+):
- Could have items
- Major projects (phase 2+)
- Experiments
```

## アンチパターンと対策

### HiPPO (Highest Paid Person's Opinion)

**症状**: 役職者の意見が優先される
**対策**: データベースの判断、匿名投票

### 分析麻痺

**症状**: 完璧な優先順位を求めて決定が遅れる
**対策**: タイムボックス、80%ルール

### 頻繁な優先順位変更

**症状**: 毎週優先順位が変わる
**対策**: 変更プロセスの確立、バッファ設定

## ツールとテンプレート

### 優先順位付けキャンバス

```
┌──────────────────────────────────┐
│ Vision & Strategy                │
├──────────────────────────────────┤
│ Evaluation Criteria              │
│ □ Business Value (weight: __)   │
│ □ User Value (weight: __)       │
│ □ Technical Feasibility (__) │
│ □ Cost/Effort (__)              │
├──────────────────────────────────┤
│ Items to Prioritize              │
│ 1. ________________ Score: __   │
│ 2. ________________ Score: __   │
│ 3. ________________ Score: __   │
├──────────────────────────────────┤
│ Decision & Rationale             │
└──────────────────────────────────┘
```

### 自動スコアリングシート

```python
# RICE Calculator
def calculate_rice(reach, impact, confidence, effort):
    """
    reach: number of users
    impact: 0.25, 0.5, 1, 2, or 3
    confidence: 0.5, 0.8, or 1.0
    effort: person-months
    """
    return (reach * impact * confidence) / effort

# ICE Calculator
def calculate_ice(impact, confidence, ease):
    """
    All parameters: 1-10 scale
    """
    return impact * confidence * ease
```

## チェックリスト

### フレームワーク選択

- [ ] 意思決定の目的は明確か
- [ ] ステークホルダーは特定されているか
- [ ] 必要なデータは利用可能か
- [ ] タイムラインは現実的か

### 実施時

- [ ] 評価基準に合意はあるか
- [ ] バイアス対策は実施したか
- [ ] データの信頼性は確認したか
- [ ] 結果の妥当性を検証したか

### 実施後

- [ ] 決定理由は文書化したか
- [ ] ステークホルダーに共有したか
- [ ] 見直しプロセスは設定したか
- [ ] 学びは記録したか

## 関連スキル

- `product-vision` - 戦略との整合
- `user-story-mapping` - 要件の理解
- `estimation-techniques` - 努力の見積もり
- `metrics-tracking` - 結果の測定
