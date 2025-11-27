---
name: slo-sli-design
description: |
  SLO/SLI設計とエラーバジェット管理の専門スキル。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/slo-sli-design/resources/error-budget-management.md`: Error Budget Managementリソース
  - `.claude/skills/slo-sli-design/resources/sli-design-guide.md`: Sli Design Guideリソース

  - `.claude/skills/slo-sli-design/templates/slo-definition-template.yaml`: Slo Definitionテンプレート

  - `.claude/skills/slo-sli-design/scripts/calculate-error-budget.mjs`: Calculate Error Budgetスクリプト

version: 1.0.0
---

# SLO/SLI Design - サービスレベル目標設計

## 概要

SLO（Service Level Objective）と SLI（Service Level Indicator）は、
サービス品質を定量的に定義・測定・管理するためのフレームワークです。

このスキルは、Google SRE の実践と『Site Reliability Engineering』に基づく
SLO/SLI 設計とエラーバジェット管理の知識を提供します。

## 核心概念

### 1. SLI/SLO/SLA の関係

**SLI (Service Level Indicator)**:

- 定義: サービス品質を測定する指標
- 例: リクエスト成功率、レイテンシ P99、エラー率
- 測定: システムから自動収集可能な定量的指標

**SLO (Service Level Objective)**:

- 定義: SLI の目標値（社内目標）
- 例: 可用性 99.9%、P99 レイテンシ < 200ms
- 用途: 信頼性と開発速度のバランス調整

**SLA (Service Level Agreement)**:

- 定義: 顧客との契約（法的拘束力）
- 例: 可用性 99.5%、違反時は返金
- 関係: SLO > SLA（SLO の方が厳しい）

**関係図**:

```
SLI = 測定指標 (何を測るか)
  ↓
SLO = 目標値 (どこまで達成するか、社内目標)
  ↓
SLA = 契約 (顧客との約束、SLOより緩い)
```

### 2. ユーザー中心の SLI 設計

**設計原則**:
内部システム健全性ではなく、ユーザーが体験する品質を測定

**アンチパターン**:
❌ CPU 使用率、メモリ使用率 → 内部指標
✅ リクエスト成功率、レイテンシ → ユーザー体験

**SLI 設計ステップ**:

1. ユーザージャーニーを特定
2. 各ジャーニーの品質を測定可能な指標に変換
3. 自動測定可能か検証
4. SLI を明確に定義

### 3. SLI の種類

#### 可用性 SLI（Availability）

**定義**: 成功したリクエストの割合

**計算式**:

```
可用性 = 成功リクエスト数 / 全リクエスト数
```

**成功の定義**:

- HTTP ステータスコード 2xx
- ビジネスロジックが正常に完了
- 応答時間が許容範囲内

**測定方法**:

```
# Prometheusクエリ例
sum(rate(http_requests_total{status=~"2.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

#### レイテンシ SLI（Latency）

**定義**: リクエスト処理時間の分布

**パーセンタイル選択**:

- P50（中央値）: 半数のユーザー体験
- P95: 95%のユーザー体験
- P99: 99%のユーザー体験（ロングテール）

**目標設定例**:

```
P50 < 100ms  # 半数のユーザーは100ms以内
P95 < 300ms  # 95%のユーザーは300ms以内
P99 < 500ms  # 99%のユーザーは500ms以内
```

**測定方法**:

```
# Prometheusクエリ例
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m])
)
```

#### エラー率 SLI（Error Rate）

**定義**: エラーレスポンスの割合

**計算式**:

```
エラー率 = エラーリクエスト数 / 全リクエスト数
```

**エラーの定義**:

- HTTP ステータスコード 5xx（サーバーエラー）
- HTTP ステータスコード 4xx（一部、429 等）
- タイムアウト

**測定方法**:

```
# Prometheusクエリ例
sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))
```

### 4. SLO 設定フレームワーク

#### 現実的な SLO 設定

**ステップ 1**: 過去データ分析

```
過去3ヶ月の実績:
- 可用性: 99.95%
- P99レイテンシ: 250ms
- エラー率: 0.05%
```

**ステップ 2**: 技術制約の考慮

```
データベース可用性: 99.9% (外部依存)
→ 自サービスは最大 99.9% までしか達成不可
```

**ステップ 3**: ビジネス期待との調整

```
ビジネス要件: 99.99% (年間52分のダウンタイム)
技術制約: 99.9% (年間8.76時間のダウンタイム)
→ 現実的な折衷案: 99.95% (年間4.38時間)
```

**ステップ 4**: 段階的目標設定

```
初期SLO: 99.9% (達成可能)
6ヶ月後: 99.95% (段階的厳格化)
1年後: 99.99% (最終目標)
```

#### 複数 SLO の管理

**単一サービスで複数の SLO**:

```yaml
slos:
  - name: "API可用性"
    sli: "成功リクエスト率"
    target: 99.9%
    window: 30日間

  - name: "APIレイテンシ"
    sli: "P99レイテンシ"
    target: < 500ms
    window: 30日間

  - name: "エラー率"
    sli: "5xxエラー率"
    target: < 0.1%
    window: 30日間
```

### 5. エラーバジェット

#### 計算方法

**公式**:

```
エラーバジェット = (1 - SLO) × 測定期間のリクエスト数
```

**例**:

```
SLO: 99.9%
測定期間: 30日間
総リクエスト数: 100,000,000

エラーバジェット = (1 - 0.999) × 100,000,000
                = 0.001 × 100,000,000
                = 100,000リクエスト

→ 30日間で100,000回のエラーまで許容
```

#### エラーバジェット消費追跡

**リアルタイム計算**:

```
現在のエラー数: 50,000
エラーバジェット: 100,000
残りバジェット: 50,000 (50%)
消費ペース: 2,000/日
予測枯渇日: 25日後
```

**測定方法**:

```
# Prometheusクエリ例
# 30日間のエラー数
sum(increase(http_requests_total{status=~"5.."}[30d]))

# エラーバジェット残量
error_budget_total - sum(increase(http_requests_total{status=~"5.."}[30d]))
```

#### エラーバジェットポリシー

**バジェット枯渇時のアクション**:

| 残量   | アクション                 |
| ------ | -------------------------- |
| > 50%  | 通常開発速度               |
| 25-50% | 新機能デプロイ慎重化       |
| 10-25% | 新機能凍結、信頼性改善優先 |
| < 10%  | 緊急対応、すべての変更凍結 |

## 設計チェックリスト

### SLI 設計

- [ ] SLI はユーザー体験を正確に反映しているか？
- [ ] SLI は自動測定可能で明確に定義されているか？
- [ ] SLI は曖昧さなく、誰が測定しても同じ結果になるか？
- [ ] ビジネス目標と SLI は整合しているか？

### SLO 設定

- [ ] SLO は過去データと技術制約を考慮して現実的か？
- [ ] SLO は達成可能だが、容易すぎない適切な難易度か？
- [ ] 複数 SLO がバランスよく設定されているか（可用性、レイテンシ、エラー率）？
- [ ] 測定期間（ローリングウィンドウ）は適切か？

### エラーバジェット管理

- [ ] エラーバジェットの計算方法は明確で自動化可能か？
- [ ] バジェット消費状況をリアルタイムで追跡できるか？
- [ ] バジェット枯渇時のエスカレーションプロセスが定義されているか？
- [ ] SLO 定期レビュープロセスが確立されているか？

## 関連リソース

詳細な設計ガイドと実装パターンは以下のリソースを参照:

- **SLI 設計ガイド**: `.claude/skills/slo-sli-design/resources/sli-design-guide.md`
- **SLO 設定フレームワーク**: `.claude/skills/slo-sli-design/resources/slo-setting-framework.md`
- **エラーバジェット管理**: `.claude/skills/slo-sli-design/resources/error-budget-management.md`
- **SLO 定義テンプレート**: `.claude/skills/slo-sli-design/templates/slo-definition-template.yaml`

## 関連スキル

このスキルは以下のスキルと連携します:

- `.claude/skills/observability-pillars/SKILL.md` - メトリクス収集と可視化
- `.claude/skills/alert-design/SKILL.md` - SLO 違反アラートの設計
- `.claude/skills/structured-logging/SKILL.md` - SLI 測定に必要なログ設計

## 使用例

### 開発環境での利用

```bash
# このスキルを参照
cat .claude/skills/slo-sli-design/SKILL.md

# SLI設計ガイドを確認
cat .claude/skills/slo-sli-design/resources/sli-design-guide.md

# SLO定義テンプレートを使用
cat .claude/skills/slo-sli-design/templates/slo-definition-template.yaml
```

### エージェントからの参照

```markdown
## Phase 2: SLO/SLI 設計とメトリクス定義

**使用スキル**: `.claude/skills/slo-sli-design/SKILL.md`

**実行内容**:

1. ユーザー中心の SLI 定義
2. 現実的な SLO 設定とエラーバジェット設計
3. ダッシュボードとメトリクス可視化設計
```

## 参照文献

- Betsy Beyer et al., 『Site Reliability Engineering』, O'Reilly, 2016
- Alex Hidalgo, 『Implementing Service Level Objectives』, O'Reilly, 2020
- Google SRE Workbook, https://sre.google/workbook/table-of-contents/
