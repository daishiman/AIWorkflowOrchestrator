# 集約ロジックテスト仕様書

## メタ情報

| 項目       | 内容                                                                   |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 4（テスト作成）                                                        |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                |
| 作成日     | 2026-03-16                                                             |
| 入力成果物 | `outputs/phase-2/aggregate-view-design.md`                             |
| テスト状態 | Red（未実装のため全テスト失敗）                                        |
| 実装先     | `packages/shared/src/skill/lifecycle/__tests__/aggregate-view.test.ts` |
| MINOR対応  | INT-M-01（successRate集計ウィンドウ）, INT-M-02（latestScore型null）   |

---

## 1. テスト対象

- `calculateSuccessRate(events, periodDays)`: 成功率計算
- `calculateTrend(scoreHistory, windowSize)`: トレンド判定（線形回帰）
- `calculateRecommendationScore(params)`: 推薦スコア計算
- `buildAggregateView(skillId, skillName, events)`: 集約ビュー統合構築
- `SkillAggregateView` 型の整合性検証

---

## 2. テストケース一覧

### 2-1. `calculateSuccessRate` - 成功率計算

| テストID   | テストケース                                         | 入力                                                                           | 期待結果                                | 分類     |
| ---------- | ---------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------- | -------- |
| AGG-SR-001 | 10回中8回成功で成功率0.8                             | executed:10件, execution_succeeded:8件（parentEventIdで紐付け）, periodDays:30 | `0.8`                                   | 正常系   |
| AGG-SR-002 | 実行0件でゼロ除算回避                                | events:空配列, periodDays:30                                                   | `0.0`                                   | 境界値   |
| AGG-SR-003 | 全成功で成功率1.0                                    | executed:5件, execution_succeeded:5件, periodDays:30                           | `1.0`                                   | 正常系   |
| AGG-SR-004 | 全失敗で成功率0.0                                    | executed:5件, execution_failed:5件, periodDays:30                              | `0.0`                                   | 正常系   |
| AGG-SR-005 | 30日フィルタで期間外イベントが除外される             | executed:3件（31日前1件+直近2件）, succeeded:2件                               | 直近2件のみ集計 → `1.0`                 | 境界値   |
| AGG-SR-006 | periodDays=0で全期間集計                             | periodDays:0, executed:10件（100日前含む）                                     | 全件対象の成功率                        | 境界値   |
| AGG-SR-007 | periodDays<0で全期間集計                             | periodDays:-1                                                                  | 全件対象の成功率（cutoffをEPOCHとする） | 境界値   |
| AGG-SR-008 | 成功+失敗+タイムアウト混合                           | executed:10, succeeded:5, failed:3, timeout:2                                  | `0.5`（成功5件/実行10件）               | 正常系   |
| AGG-SR-009 | parentEventIdによる正確な紐付け                      | succeeded イベントの parentEventId が対象外スキルの executed.id を参照         | 紐付け外の succeeded はカウントしない   | 正常系   |
| AGG-SR-010 | 件数ベース集計（INT-M-01対応: 直近N件モード）        | 直近10件の executed イベントで集計                                             | 件数ベースの成功率を返す                | INT-M-01 |
| AGG-SR-011 | 時間ベース集計（INT-M-01対応: 30日ウィンドウモード） | 30日間の executed イベントで集計                                               | 時間ベースの成功率を返す                | INT-M-01 |

### 2-2. `calculateTrend` - トレンド判定

| テストID   | テストケース                   | 入力（scoreHistory）                     | windowSize | 期待結果                                           | 分類   |
| ---------- | ------------------------------ | ---------------------------------------- | ---------- | -------------------------------------------------- | ------ |
| AGG-TR-001 | 単調増加で improving           | scores: [60, 65, 70, 75, 80]             | 5          | `"improving"`                                      | 正常系 |
| AGG-TR-002 | 単調減少で declining           | scores: [80, 75, 70, 65, 60]             | 5          | `"declining"`                                      | 正常系 |
| AGG-TR-003 | 全スコア同一で stable          | scores: [70, 70, 70, 70, 70]             | 5          | `"stable"`（slope=0.0）                            | 正常系 |
| AGG-TR-004 | データ不足（5件未満）で stable | scores: [60, 70, 80]                     | 5          | `"stable"`（デフォルト）                           | 境界値 |
| AGG-TR-005 | 空配列で stable                | scores: []                               | 5          | `"stable"`                                         | 境界値 |
| AGG-TR-006 | 微増で stable（slope <= 0.5）  | scores: [70, 70, 70, 71, 71]             | 5          | `"stable"`（slope < 0.5）                          | 境界値 |
| AGG-TR-007 | 微減で stable（slope >= -0.5） | scores: [71, 71, 70, 70, 70]             | 5          | `"stable"`（slope > -0.5）                         | 境界値 |
| AGG-TR-008 | slope 境界値 0.5 ちょうど      | 計算で slope=0.5 となるスコア列          | 5          | `"stable"`（slope > 0.5 が improving の条件）      | 境界値 |
| AGG-TR-009 | slope 境界値 -0.5 ちょうど     | 計算で slope=-0.5 となるスコア列         | 5          | `"stable"`（slope < -0.5 が declining の条件）     | 境界値 |
| AGG-TR-010 | windowSize=1 で stable         | scores: [80]                             | 1          | `"stable"`（denominator=0）                        | 境界値 |
| AGG-TR-011 | 10件中直近5件のみ使用          | scores: [10,20,30,40,50,60,70,80,90,100] | 5          | 直近5件 [60,70,80,90,100] から判定 → `"improving"` | 正常系 |
| AGG-TR-012 | 急激な V 字回復                | scores: [80, 40, 20, 60, 90]             | 5          | 線形回帰の傾きで判定（ノイズ含む改善）             | 正常系 |

### 2-3. `calculateRecommendationScore` - 推薦スコア計算

| テストID   | テストケース                         | 入力パラメータ                                                                        | 期待結果                               | 分類   |
| ---------- | ------------------------------------ | ------------------------------------------------------------------------------------- | -------------------------------------- | ------ |
| AGG-RS-001 | 全要素最大値でスコア1.0              | successRate:1.0, latestScore:100, lastExecutedAt:今日                                 | `1.0`（0.4+0.4+0.2）                   | 正常系 |
| AGG-RS-002 | 全要素最小値でスコア0.0              | successRate:0.0, latestScore:0, lastExecutedAt:null                                   | `0.0`（0.0+0.0+0.0）                   | 正常系 |
| AGG-RS-003 | 中間値の計算検証                     | successRate:0.8, latestScore:85, lastExecutedAt:null                                  | `0.8*0.4 + 0.85*0.4 + 0.0*0.2 = 0.66`  | 正常系 |
| AGG-RS-004 | lastExecutedAt=null で recency=0.0   | successRate:1.0, latestScore:100, lastExecutedAt:null                                 | `0.4 + 0.4 + 0.0 = 0.8`                | 正常系 |
| AGG-RS-005 | 90日以上前の実行で recency=0.0       | lastExecutedAt: 91日前                                                                | recency = max(0, 1-91/90) = 0.0        | 境界値 |
| AGG-RS-006 | 90日ちょうどで recency=0.0           | lastExecutedAt: 90日前                                                                | recency = max(0, 1-90/90) = 0.0        | 境界値 |
| AGG-RS-007 | 45日前で recency=0.5                 | lastExecutedAt: 45日前                                                                | recency = 1.0 - 45/90 = 0.5            | 正常系 |
| AGG-RS-008 | 当日実行で recency=1.0               | lastExecutedAt: 0日前                                                                 | recency = 1.0 - 0/90 = 1.0             | 正常系 |
| AGG-RS-009 | 浮動小数点誤差で1.0超過時のクランプ  | successRate:1.0000001, latestScore:100                                                | `1.0`（clamp適用）                     | 境界値 |
| AGG-RS-010 | referenceDate を明示指定             | referenceDate: "2026-03-16T00:00:00.000Z", lastExecutedAt: "2026-03-01T00:00:00.000Z" | 15日差 → recency = 1.0 - 15/90 ≈ 0.833 | 正常系 |
| AGG-RS-011 | latestScore=0 で normalizedScore=0.0 | successRate:0.5, latestScore:0, lastExecutedAt:null                                   | `0.5*0.4 + 0.0*0.4 + 0.0*0.2 = 0.2`    | 境界値 |

### 2-4. `buildAggregateView` - 集約ビュー統合

| テストID   | テストケース                                                    | 入力                                                  | 期待結果                                                                                                                                          | 分類     |
| ---------- | --------------------------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| AGG-BV-001 | 空イベントで全フィールドがデフォルト値                          | events:[]                                             | totalExecutions:0, successRate:0.0, lastExecutedAt:null, latestScore:0, scoreHistory:[], recentEvents:[], trend:"stable", recommendationScore:0.0 | 境界値   |
| AGG-BV-002 | 対象skillIdのイベントのみフィルタされる                         | events: skill-A 3件 + skill-B 2件, skillId: "skill-A" | skill-A の3件のみ集計対象                                                                                                                         | 正常系   |
| AGG-BV-003 | totalExecutions が直近30日の executed 件数                      | executed:5件（直近30日）+ executed:3件（31日以上前）  | totalExecutions: 5                                                                                                                                | 正常系   |
| AGG-BV-004 | lastExecutedAt が最新の実行関連イベントの timestamp             | executed + succeeded + failed が混在                  | 最新 timestamp が設定される                                                                                                                       | 正常系   |
| AGG-BV-005 | lastExecutedAt が実行イベント不在時に null                      | 評価イベントのみ                                      | lastExecutedAt: null                                                                                                                              | 境界値   |
| AGG-BV-006 | scoreHistory が評価イベントから構築される                       | evaluated:3件 + score_updated:2件                     | scoreHistory.length === 5、timestamp 昇順                                                                                                         | 正常系   |
| AGG-BV-007 | scoreHistory が最新200件に制限される                            | evaluated:250件                                       | scoreHistory.length === 200、直近200件のみ                                                                                                        | 境界値   |
| AGG-BV-008 | latestScore が scoreHistory の最後のスコア                      | scoreHistory: [60, 70, 80]                            | latestScore: 80                                                                                                                                   | 正常系   |
| AGG-BV-009 | latestScore が評価イベント不在時に0（INT-M-02対応）             | 実行イベントのみ                                      | latestScore: 0                                                                                                                                    | INT-M-02 |
| AGG-BV-010 | latestScore が null ケースの扱い（INT-M-02対応）                | 評価イベント0件 → latestScore 計算                    | latestScore === 0（null ではなく 0 をデフォルトとする設計）                                                                                       | INT-M-02 |
| AGG-BV-011 | recentEvents が最新10件を降順で返す                             | events: 15件                                          | recentEvents.length === 10、timestamp 降順                                                                                                        | 正常系   |
| AGG-BV-012 | recentEvents がイベント10件未満で実件数分                       | events: 3件                                           | recentEvents.length === 3                                                                                                                         | 境界値   |
| AGG-BV-013 | trend が scoreHistory から正しく算出される                      | evaluated: scores [60,65,70,75,80]                    | trend: "improving"                                                                                                                                | 正常系   |
| AGG-BV-014 | trend がスコア不足時に "stable"                                 | evaluated: 2件のみ                                    | trend: "stable"                                                                                                                                   | 境界値   |
| AGG-BV-015 | recommendationScore が3要素から正しく算出される                 | successRate:0.8, latestScore:85, lastExecutedAt:今日  | 0.8*0.4 + 0.85*0.4 + 1.0\*0.2 = 0.86                                                                                                              | 正常系   |
| AGG-BV-016 | aggregatedAt が ISO 8601 UTC                                    | 任意イベント                                          | aggregatedAt が ISO 8601 形式の文字列                                                                                                             | 正常系   |
| AGG-BV-017 | score_updated の metadata.newScore が scoreHistory に使用される | score_updated イベント（newScore:85）                 | scoreHistory にスコア 85 のデータポイントが含まれる                                                                                               | 正常系   |
| AGG-BV-018 | evaluated の metadata.score が scoreHistory に使用される        | evaluated イベント（score:90）                        | scoreHistory にスコア 90 のデータポイントが含まれる                                                                                               | 正常系   |
| AGG-BV-019 | べき等性: 同一イベントで複数回実行しても同一結果                | events: 固定5件                                       | 2回実行して結果を比較 → 同一                                                                                                                      | 正常系   |

### 2-5. ScoreDataPoint 構造検証

| テストID   | テストケース                             | 入力                       | 期待結果                                      | 分類   |
| ---------- | ---------------------------------------- | -------------------------- | --------------------------------------------- | ------ |
| AGG-SD-001 | ScoreDataPoint が必須4フィールドを持つ   | evaluated イベントから構築 | timestamp, score, version, eventId が全て存在 | 正常系 |
| AGG-SD-002 | timestamp がイベントの timestamp と一致  | evaluated イベント         | dataPoint.timestamp === event.timestamp       | 正常系 |
| AGG-SD-003 | score が 0-100 の範囲内                  | score:0 / score:100        | 範囲内の値が設定される                        | 境界値 |
| AGG-SD-004 | version がイベントの skillVersion と一致 | evaluated イベント         | dataPoint.version === event.skillVersion      | 正常系 |
| AGG-SD-005 | eventId がイベントの id と一致           | evaluated イベント         | dataPoint.eventId === event.id                | 正常系 |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
packages/shared/src/skill/lifecycle/__tests__/
  calculate-success-rate.test.ts  # AGG-SR-*
  calculate-trend.test.ts         # AGG-TR-*
  calculate-recommendation.test.ts # AGG-RS-*
  build-aggregate-view.test.ts    # AGG-BV-*, AGG-SD-*
```

### 3-2. INT-M-01 対応方針

Phase 3 MINOR 指摘（INT-M-01: successRate集計ウィンドウ）に対し、`calculateSuccessRate` のテストで以下の2モードを検証する:

1. **時間ベース**（periodDays パラメータ）: 直近N日間の実行イベントを対象
2. **件数ベース**（将来拡張を想定）: 直近N件の実行イベントを対象

現行設計は時間ベースを採用（periodDays パラメータ）。件数ベースのテスト（AGG-SR-010）は設計変更時に有効化する。

### 3-3. INT-M-02 対応方針

Phase 3 MINOR 指摘（INT-M-02: latestScore型 number vs number|null）に対し:

- `SkillAggregateView.latestScore` の型は `number`（null ではなく 0 をデフォルト）
- AGG-BV-009, AGG-BV-010 で評価イベント不在時のデフォルト値 0 を検証
- `calculateRecommendationScore` では `latestScore / 100` で正規化するため、0 は normalizedScore=0.0 として扱われる

### 3-4. 既知パターン対策

| パターン | 対策                                                                    |
| -------- | ----------------------------------------------------------------------- |
| P9       | テスト間で共有するイベントデータは `beforeEach` で毎回新規生成          |
| P42      | buildAggregateView の skillId 引数はバリデーション済み SkillName を使用 |
| P13      | タイマーは使用しない（純粋関数のテストのため）                          |

### 3-5. テストデータ依存

- `createMockLifecycleEvent()` ファクトリ（`test-data-factory-definition.md` 参照）を使用
- `createMockAggregateView()` ファクトリを使用して期待値の生成を効率化

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 4_
