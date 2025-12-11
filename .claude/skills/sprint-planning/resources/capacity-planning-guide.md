# キャパシティプランニングガイド

## 概要

スプリントで実現可能な作業量を正確に見積もるための体系的手法を提供します。
過度なコミットメントと過少なコミットメントのバランスを取り、
予測可能で持続可能なベロシティを実現します。

---

## 1. チームキャパシティの計算

### 基本公式

```
個人キャパシティ = (作業日数 × 1日の作業時間 - 固定オーバーヘッド)
                    × フォーカスファクター × 出勤率

チームキャパシティ = Σ(個人キャパシティ) - チーム全体のオーバーヘッド
```

### 詳細計算例

```yaml
team_member_1:
  name: "山田太郎"
  role: "シニアエンジニア"
  calculation:
    sprint_days: 10日
    hours_per_day: 8時間
    fixed_meetings: 12時間 # デイリー、プランニング、レトロ等
    support_time: 5時間 # 他チームサポート
    focus_factor: 0.75 # 集中可能時間の割合
    attendance: 1.0 # 100%出勤

  capacity:
    gross_hours: 80 # 10日 × 8時間
    net_hours: 63 # 80 - 12 - 5
    effective_hours: 47.25 # 63 × 0.75

team_member_2:
  name: "佐藤花子"
  role: "ミドルエンジニア"
  calculation:
    sprint_days: 9日 # 休暇1日
    hours_per_day: 8時間
    fixed_meetings: 12時間
    support_time: 2時間
    focus_factor: 0.7
    attendance: 0.9

  capacity:
    gross_hours: 72
    net_hours: 58
    effective_hours: 40.6

team_total:
  members: 5
  total_capacity: 205時間
  buffer: 20%
  committed_capacity: 164時間
```

### フォーカスファクター（Focus Factor）

```
フォーカスファクターとは:
- 実際に集中して作業できる時間の割合
- 割り込み、予期しない会議、メール対応等を考慮

一般的な値:
- 経験豊富なチーム: 0.75 - 0.85
- 新しいチーム: 0.60 - 0.70
- 高度な集中環境: 0.80 - 0.90
- 割り込み頻発環境: 0.50 - 0.60

計測方法:
1. スプリント終了時に実績を記録
2. 「実際の作業時間 / 利用可能時間」を計算
3. 3-5スプリントの平均を使用
4. 継続的に更新
```

---

## 2. 固定オーバーヘッドの管理

### 必須会議

```
日次スタンドアップ:
  頻度: 毎日
  時間: 15分 × 10日 = 2.5時間/スプリント

スプリントプランニング:
  頻度: スプリント開始時
  時間: 4時間（Part 1: 2時間、Part 2: 2時間）

スプリントレビュー:
  頻度: スプリント終了時
  時間: 2時間

スプリントレトロスペクティブ:
  頻度: スプリント終了時
  時間: 1.5時間

バックログリファインメント:
  頻度: 週1回
  時間: 2時間 × 2回 = 4時間

---
固定会議合計: 14時間/スプリント
```

### 可変オーバーヘッド

```
サポート活動:
  - 他チームへの技術支援: 0-5時間
  - 新人メンタリング: 0-10時間
  - オンコールローテーション: 0-8時間

リクルーティング:
  - 面接: 1-2時間/件
  - スクリーニング: 0.5時間/件

その他:
  - 全社会議: 0-2時間
  - 部門会議: 0-2時間
  - 1on1: 0.5-1時間
```

---

## 3. 休暇・イベント考慮

### 休暇スケジュール管理

```markdown
## Sprint 15 休暇カレンダー

| 日付       | 曜日 | イベント             | 影響メンバー | 影響時間  |
| ---------- | ---- | -------------------- | ------------ | --------- |
| 2024-02-11 | 月   | 祝日（建国記念の日） | 全員         | -8時間/人 |
| 2024-02-14 | 木   | 山田の休暇           | 山田         | -8時間    |
| 2024-02-15 | 金   | 山田の休暇           | 山田         | -8時間    |
| 2024-02-16 | 土   | 週末                 | 全員         | N/A       |
| 2024-02-17 | 日   | 週末                 | 全員         | N/A       |
| 2024-02-20 | 水   | 技術カンファレンス   | 佐藤、鈴木   | -8時間/人 |

**キャパシティ調整**:

- 祝日影響: 5人 × 8時間 = 40時間減
- 山田休暇: 2日 × 8時間 = 16時間減
- カンファレンス: 2人 × 8時間 = 16時間減
- **合計減少**: 72時間
```

### イベント影響度評価

```yaml
event_impact:
  company_all_hands:
    duration: 2時間
    frequency: 月1回
    planning_overhead: +0.5時間（準備）
    total_impact: 2.5時間

  training:
    duration: 半日-1日
    frequency: 四半期1回
    impact_type: "スキル向上（長期的にはプラス）"
    short_term_capacity: -4～8時間

  hackathon:
    duration: 1-2日
    frequency: 年2回
    impact_type: "イノベーション促進"
    capacity_loss: 大（通常業務ストップ）
    recommendation: "専用スプリントとして計画"
```

---

## 4. バッファとリスク管理

### バッファ戦略

```
バッファタイプ:

1. スケジュールバッファ（20-30%）:
   - 見積もりの不確実性
   - 予期しない問題
   - 新技術の学習曲線

2. リスクバッファ（10-20%）:
   - 高リスクアイテム用
   - 依存関係の不確実性
   - 外部要因（APIベンダー等）

3. 緊急対応バッファ（5-10%）:
   - 本番障害対応
   - 緊急のバグ修正
   - ホットフィックス

4. 技術的負債バッファ（10-20%）:
   - リファクタリング
   - テスト追加
   - ドキュメント整備

推奨配分:
  総キャパシティ: 200時間
  - コミット作業: 140-160時間（70-80%）
  - 各種バッファ: 40-60時間（20-30%）
```

### バッファ使用の判断基準

```python
def should_use_buffer(story):
    """バッファ使用判断"""
    risk_score = calculate_risk_score(story)

    if risk_score > 15:
        return "高リスク: 30%バッファ追加"
    elif risk_score > 10:
        return "中リスク: 20%バッファ追加"
    elif risk_score > 6:
        return "低リスク: 10%バッファ追加"
    else:
        return "バッファ不要"

def calculate_risk_score(story):
    """リスクスコア計算"""
    complexity = story.get('complexity', 0)  # 1-5
    dependency = story.get('dependency', 0)  # 1-5
    uncertainty = story.get('uncertainty', 0)  # 1-5

    return complexity * 0.4 + dependency * 0.3 + uncertainty * 0.3
```

---

## 5. ベロシティ管理

### ベロシティ計測

```
ベロシティとは:
- スプリント内で完了したストーリーポイントまたは時間
- チームの持続可能なペースの指標

計算方法:
  ベロシティ = 完了したストーリーポイントの合計

過去3スプリントの例:
  Sprint 12: 35ポイント
  Sprint 13: 42ポイント
  Sprint 14: 38ポイント

  平均ベロシティ = (35 + 42 + 38) / 3 = 38.3ポイント

次スプリントの計画:
  - 保守的: 35ポイント（最低値）
  - 標準: 38ポイント（平均値）
  - 楽観的: 42ポイント（最高値）

推奨: 38ポイントでコミット、42ポイントをストレッチゴール
```

### ベロシティの変動要因

```
ベロシティ上昇の要因:
✅ チームスキルの向上
✅ コラボレーションの改善
✅ 技術的負債の返済
✅ ツール・プロセスの最適化
✅ ドメイン知識の蓄積

ベロシティ低下の要因:
❌ チームメンバーの変更
❌ 新技術の導入
❌ 技術的負債の蓄積
❌ 外部依存の増加
❌ 割り込みの増加
❌ 会議時間の増加

対応策:
- 3-5スプリントの移動平均を使用
- 異常値（±30%以上の変動）は除外
- 変動要因を記録し、補正
```

---

## 6. キャパシティプランニングツール

### スプレッドシート計算

```python
import pandas as pd

class CapacityPlanner:
    """キャパシティプランニングツール"""

    def __init__(self, team_members, sprint_days=10):
        self.team_members = team_members
        self.sprint_days = sprint_days

    def calculate_individual_capacity(self, member):
        """個人キャパシティ計算"""
        gross_hours = member['working_days'] * 8
        net_hours = gross_hours - member['fixed_meetings']
        effective_hours = net_hours * member['focus_factor'] * member['attendance']

        return {
            'name': member['name'],
            'gross_hours': gross_hours,
            'net_hours': net_hours,
            'effective_hours': round(effective_hours, 2)
        }

    def calculate_team_capacity(self, buffer_percentage=0.2):
        """チームキャパシティ計算"""
        individual_capacities = [
            self.calculate_individual_capacity(m)
            for m in self.team_members
        ]

        total_effective = sum(c['effective_hours'] for c in individual_capacities)
        buffered_capacity = total_effective * (1 - buffer_percentage)

        return {
            'team_members': individual_capacities,
            'total_effective_hours': round(total_effective, 2),
            'buffer_hours': round(total_effective * buffer_percentage, 2),
            'committed_capacity': round(buffered_capacity, 2)
        }

# 使用例
team = [
    {
        'name': '山田',
        'working_days': 10,
        'fixed_meetings': 14,
        'focus_factor': 0.75,
        'attendance': 1.0
    },
    {
        'name': '佐藤',
        'working_days': 9,  # 休暇1日
        'fixed_meetings': 14,
        'focus_factor': 0.70,
        'attendance': 0.9
    },
]

planner = CapacityPlanner(team)
result = planner.calculate_team_capacity(buffer_percentage=0.2)

print(f"チーム総キャパシティ: {result['total_effective_hours']}時間")
print(f"バッファ: {result['buffer_hours']}時間")
print(f"コミット可能: {result['committed_capacity']}時間")
```

---

## 7. キャパシティプランニングテンプレート

```markdown
# Sprint XX キャパシティプランニング

## スプリント期間

- 開始日: YYYY-MM-DD
- 終了日: YYYY-MM-DD
- 営業日数: XX日

## チームメンバー

### メンバー1: 山田太郎

- **役割**: シニアエンジニア
- **稼働日数**: 10日
- **固定会議**: 14時間
- **フォーカスファクター**: 0.75
- **出勤率**: 100%
- **有効時間**: 47.25時間

### メンバー2: 佐藤花子

- **役割**: ミドルエンジニア
- **稼働日数**: 9日（休暇1日）
- **固定会議**: 14時間
- **フォーカスファクター**: 0.70
- **出勤率**: 90%
- **有効時間**: 40.6時間

[他のメンバーも同様に記載]

## キャパシティサマリー

| 項目               | 時間        |
| ------------------ | ----------- |
| 総稼働時間         | 400時間     |
| 固定オーバーヘッド | 70時間      |
| 有効作業時間       | 330時間     |
| フォーカス調整後   | 240時間     |
| バッファ（20%）    | 48時間      |
| **コミット可能**   | **192時間** |

## イベント・休暇

| 日付          | イベント       | 影響        |
| ------------- | -------------- | ----------- |
| 2024-02-11    | 祝日           | -40時間     |
| 2024-02-14-15 | 山田休暇       | -16時間     |
| 2024-02-20    | カンファレンス | -16時間     |
| **合計影響**  |                | **-72時間** |

## 調整後キャパシティ
```

初期キャパシティ: 192時間
イベント影響: -72時間

---

最終コミット可能: 120時間

```

## ベロシティ参考

| スプリント | 完了ポイント |
|-----------|------------|
| Sprint 12 | 35pt |
| Sprint 13 | 42pt |
| Sprint 14 | 38pt |
| **平均** | **38pt** |

## 推奨コミットメント

- **標準**: 35-38ポイント
- **ストレッチ**: 40ポイント
- **根拠**: 休暇・イベント影響を考慮し、保守的な見積もり
```

---

## 8. キャパシティプランニングのベストプラクティス

```yaml
best_practices:
  realistic_estimates:
    description: "楽観的すぎる見積もりを避ける"
    approach:
      - 過去のデータを使用
      - フォーカスファクターを過大評価しない
      - 割り込みとオーバーヘッドを考慮

  buffer_management:
    description: "適切なバッファを確保"
    guidelines:
      - 新しいチーム: 30%バッファ
      - 成熟チーム: 20%バッファ
      - 高リスクスプリント: 追加10-15%

  continuous_calibration:
    description: "継続的なキャパシティ調整"
    actions:
      - レトロスペクティブでフォーカスファクターを見直し
      - 実績との差異を分析
      - 3-5スプリントごとに再計算

  transparency:
    description: "キャパシティの透明性"
    practices:
      - チーム全員でキャパシティ計算
      - 前提条件を明示
      - 変更があれば即座に再計算

  avoid_overcommitment:
    description: "過度なコミットメントを避ける"
    reasons:
      - 品質の低下
      - バーンアウトのリスク
      - 持続不可能なペース
      - 技術的負債の蓄積
```

---

## 9. キャパシティプランニングチェックリスト

```markdown
## スプリント計画前

- [ ] 各メンバーの休暇予定を確認
- [ ] 会社イベント・祝日をカレンダーに反映
- [ ] 前スプリントのフォーカスファクターを更新
- [ ] ベロシティデータを集計
- [ ] 固定会議の時間を確認

## キャパシティ計算

- [ ] 個人キャパシティを計算
- [ ] チーム総キャパシティを算出
- [ ] バッファを確保（20-30%）
- [ ] イベント影響を差し引き
- [ ] 最終コミット可能時間を決定

## プランニング中

- [ ] キャパシティをチームと共有
- [ ] ストーリーポイントとキャパシティの整合性確認
- [ ] リスクの高いアイテムに追加バッファ
- [ ] ストレッチゴールを設定

## スプリント実行中

- [ ] キャパシティの変化を監視
- [ ] 突発的なイベントがあれば再計算
- [ ] バッファ使用状況を追跡

## スプリント終了後

- [ ] 実績キャパシティを記録
- [ ] フォーカスファクターを再計算
- [ ] 次スプリントの改善点を特定
```

---

## 関連ガイド

- `sprint-goal-setting.md`: 効果的なスプリントゴール設定
- `task-breakdown-guide.md`: タスク分解とストーリーポイント見積もり
- `velocity-tracking.md`: ベロシティの継続的追跡と改善
