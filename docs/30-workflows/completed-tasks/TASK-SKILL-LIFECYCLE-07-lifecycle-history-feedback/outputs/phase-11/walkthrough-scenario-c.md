# Phase 11 シナリオC: Task08 公開判断メトリクスの確認

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| Phase    | 11                               |
| タスクID | TASK-SKILL-LIFECYCLE-07          |
| 作成日   | 2026-03-16                       |
| シナリオ | C: Task08 公開判断メトリクス確認 |

---

## 1. Phase 1 task08-metrics-definition.md の指標セット確認

### 1.1 最小指標セット

Phase 1 `task08-metrics-definition.md` 1 で定義された6指標:

| 指標名                | データ型 | データソース                    | 定義状況 |
| --------------------- | -------- | ------------------------------- | -------- |
| `qualityScore`        | number   | 最新評価イベントの score        | PASS     |
| `stabilityScore`      | number   | 直近N回の実行成功率             | PASS     |
| `usageCount`          | number   | execution カテゴリ総イベント数  | PASS     |
| `hasCriticalFeedback` | boolean  | SkillFeedback severity=critical | PASS     |
| `lastEvaluatedAt`     | string   | 最新評価イベントの timestamp    | PASS     |
| `stabilityWindowSize` | number   | 安定性計算のウィンドウサイズ    | PASS     |

### 1.2 デフォルト閾値テーブル

| 指標名                | Phase 1 デフォルト値 | Task08 オーバーライド | 定義状況 |
| --------------------- | -------------------- | --------------------- | -------- |
| `qualityScore`        | 70                   | 可能                  | PASS     |
| `stabilityScore`      | 0.8                  | 可能                  | PASS     |
| `stabilityWindowSize` | 10                   | 可能                  | PASS     |
| `usageCount`          | 3                    | 可能                  | PASS     |
| `hasCriticalFeedback` | false 必須           | 不可（安全側固定）    | PASS     |

**結果**: PASS -- 6指標と5閾値が明確に定義されている。

---

## 2. Phase 2 publish-metrics-interface-design.md の PublishReadinessMetrics 網羅確認

### 2.1 Phase 1 指標と Phase 2 型の対応

| Phase 1 指標        | Phase 2 PublishReadinessMetrics フィールド | 型               | 網羅 |
| ------------------- | ------------------------------------------ | ---------------- | ---- |
| qualityScore        | `qualityScore`                             | `number \| null` | PASS |
| stabilityScore      | `stabilityScore`                           | `number \| null` | PASS |
| usageCount          | `usageCount`                               | `number`         | PASS |
| hasCriticalFeedback | `hasCriticalFeedback`                      | `boolean`        | PASS |
| lastEvaluatedAt     | `lastEvaluatedAt`                          | `string \| null` | PASS |
| stabilityWindowSize | `stabilityWindowSize`                      | `number`         | PASS |
| (追加) skillId      | `skillId`                                  | `string`         | 新規 |
| (追加) skillName    | `skillName`                                | `string`         | 新規 |
| (追加) calculatedAt | `calculatedAt`                             | `string`         | 新規 |

Phase 2 では Phase 1 の6指標に加えて `skillId`, `skillName`, `calculatedAt` の3フィールドが追加されている。これは実用上必要な識別・メタ情報であり、Phase 1 要件のスーパーセットになっている。

### 2.2 PublishThresholds と Phase 1 閾値の差異

| 指標名        | Phase 1 デフォルト | Phase 2 デフォルト | 差異                                                                                      |
| ------------- | ------------------ | ------------------ | ----------------------------------------------------------------------------------------- |
| minUsageCount | 3                  | 5                  | Phase 2 で引き上げ（REQ-M-01 として Phase 3 で検出済み、Phase 5 で Phase 2 値を採用決定） |

Phase 5 `publish-metrics-api-impl-spec.md` で REQ-M-01 を解決し、Phase 2 の `minUsageCount: 5` を採用している。

**結果**: PASS -- 全6指標が網羅されており、閾値の差異も Phase 3/5 で解決済み。

---

## 3. Phase 1 task05-integration-contract.md との整合性

### 3.1 Task05 契約型と Task08 メトリクスの関係

Task05 UIコンポーネントに提供するデータと Task08 公開判断メトリクスの関係:

| Task05 契約型                            | Task08 メトリクスとの関係                             | 整合 |
| ---------------------------------------- | ----------------------------------------------------- | ---- |
| ScoreHistoryForBadge.latestScore         | PublishReadinessMetrics.qualityScore と同一ソース     | PASS |
| ExecutionHistoryForActionBar.successRate | PublishReadinessMetrics.stabilityScore の計算元と共通 | PASS |
| RecentlyUsedSkillEntry.latestScore       | PublishReadinessMetrics.qualityScore と同一ソース     | PASS |

### 3.2 データソースの単一性

Task05 UIコンポーネントへのデータ提供と Task08 メトリクス提供は、同一のライフサイクルイベントストア（SQLite lifecycle_events テーブル）を単一データソースとしている。これにより、Task05 UI 表示と Task08 公開判断で異なる値が表示されるリスクが排除されている。

**結果**: PASS -- 単一データソースにより整合性が保証されている。

---

## 4. AC-4 の検証データ存在確認

Phase 1 `acceptance-criteria-matrix.md` の AC-4 検証結果:

- TypeScript 型: PublishReadinessMetrics, PublishThresholds, ReadinessLevel, ReadinessResult, SkillHealthReport（5型 + DEFAULT_PUBLISH_THRESHOLDS 定数）
- デフォルト閾値: qualityScore=70, stabilityScore=0.8, usageCount=3（Phase 2 で 5 に引き上げ）
- readinessLevel 判定: 5ステップフロー（not_ready / review_needed / ready）
- 責務分担: 12項目で Task07（データ提供）vs Task08（判断ロジック）を明確化
- API 仕様: getPublishReadiness, getSkillHealthReport の2エンドポイント
- Phase 5 `publish-metrics-api-impl-spec.md` で IPC ハンドラと P42 バリデーションが仕様化済み

**結果**: PASS -- AC-4 充足。

---

## 5. Task08 index.md の確認と後続入力の参照可能性

### 5.1 Task08 index.md の存在確認

ファイルパス: `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/index.md`

**存在**: 確認済み

### 5.2 Task08 の依存関係

Task08 index.md のメタ情報:

- 依存タスク: `TASK-SKILL-LIFECYCLE-05, 06, 07`
- ステータス: `not_started`

Task07 が Task08 の依存タスクとして明示されており、Task07 の成果物が Task08 の入力として参照可能であることが確認された。

### 5.3 Task08 AC-3 との接続確認

Task08 受入基準 AC-3: 「公開前の安全性と観測指標が接続されている」

本タスク（Task07）が提供する以下の成果物が AC-3 の入力となる:

| Task07 成果物                               | Task08 AC-3 への提供内容                        |
| ------------------------------------------- | ----------------------------------------------- |
| PublishReadinessMetrics 型                  | 公開準備度メトリクス（6指標 + 3メタフィールド） |
| SkillHealthReport 型                        | 総合ヘルスレポート（メトリクス + 履歴サマリー） |
| DEFAULT_PUBLISH_THRESHOLDS 定数             | デフォルト閾値（Task08 がオーバーライド可能）   |
| IPC チャンネル仕様（getPublishReadiness等） | データ取得APIの契約                             |
| readinessLevel 参考判定フロー               | 判定ロジックの参考仕様（Task08 が実装）         |

**結果**: PASS -- Task07 成果物が Task08 の後続入力として参照可能。

---

## 6. シナリオC 総合判定

| 検証項目                                         | 結果 |
| ------------------------------------------------ | ---- |
| Phase 1 最小指標セット（6指標）定義              | PASS |
| Phase 2 PublishReadinessMetrics 全指標網羅       | PASS |
| minUsageCount 差異（Phase 1:3 vs Phase 2:5）解決 | PASS |
| Phase 1 task05-integration-contract との整合     | PASS |
| AC-4 検証データ存在                              | PASS |
| Task08 index.md の存在                           | PASS |
| Task08 依存関係での Task07 参照                  | PASS |
| Task07 成果物の Task08 後続入力参照可能性        | PASS |

**シナリオC 判定: PASS**

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 11 シナリオC_
