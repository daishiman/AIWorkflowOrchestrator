# Phase 8: 命名統一レポート

> タスク: TASK-SKILL-LIFECYCLE-07（Skill Lifecycle History & Feedback）
> フェーズ: Phase 8 - リファクタリング
> 作成日: 2026-03-16
> 種別: ドキュメント専用設計タスク（コード実行なし）

---

## 1. 目的

Phase 1〜5 の仕様書群における命名規則の不統一を検出し、統一ルールを定義する。
本レポートは仕様書レベルのリファクタリングであり、実コードの変更は伴わない。

---

## 2. ドメイン用語統一ルール

### 2.1 識別子命名規則

| 用語                 | 統一後の名称 | 型                          | 備考                                  |
| -------------------- | ------------ | --------------------------- | ------------------------------------- |
| スキル識別子         | `skillName`  | `SkillName`（Branded Type） | P45準拠: セマンティクスに一致する命名 |
| イベント識別子       | `eventId`    | `string`（UUID v4）         | 全Phase共通                           |
| フィードバック識別子 | `feedbackId` | `string`（UUID v4）         | Phase 5で確定                         |

### 2.2 Branded Type ルール

```typescript
// 統一定義: packages/shared/src/skill/lifecycle-types.ts
type SkillName = string & { readonly __brand: "SkillName" };
```

- `skillId` はコードベース内で「スキル名」を指す場合にのみ歴史的に使われていた（P45）
- Phase 5 で `SkillName` Branded Type に統一済み
- 今後すべての仕様書では `skillName: SkillName` を使用する

---

## 3. 命名不統一の検出結果

### 3.1 EventSource 値の乖離

| Phase   | 定義値                            | 出典ファイル               |
| ------- | --------------------------------- | -------------------------- |
| Phase 1 | `"main"` / `"renderer"` / `"cli"` | lifecycle-event-catalog.md |
| Phase 2 | `"system"` / `"user"` / `"api"`   | event-model-design.md      |
| Phase 5 | `"system"` / `"user"` / `"api"`   | event-model-impl-spec.md   |

**判定**: Phase 2/5 の `"system" | "user" | "api"` が最終仕様。Phase 1 の値はプロセスモデル（Electron）に依存しており、ドメインモデルとしては不適切であったため Phase 2 で修正された。

**統一ルール**: `EventSource = "system" | "user" | "api"`

### 3.2 イベント型名の乖離

Phase 1（カタログ）と Phase 5（実装仕様）で以下のイベント名が変更された。

| Phase 1 カタログ名       | Phase 5 実装仕様名       | 変更理由                                               |
| ------------------------ | ------------------------ | ------------------------------------------------------ |
| `skill:draft_saved`      | `skill:cloned`           | 設計で「下書き保存」から「複製」に概念を再定義         |
| `skill:template_applied` | `skill:template_created` | テンプレート「適用」ではなく「作成」が正確             |
| `skill:gate_passed`      | `skill:shared`           | ゲート判定はTask08の責務に移管                         |
| `skill:gate_failed`      | `skill:exported`         | 同上                                                   |
| `skill:feedback_applied` | `skill:deprecated`       | フィードバック適用はアクションであり、イベントではない |
| `skill:forked`           | `skill:archived`         | fork概念をarchiveに再定義                              |
| `skill:imported`         | `skill:reviewed`         | インポートはイベントカテゴリが異なる                   |

**判定**: Phase 5 の18イベント型が最終仕様。Phase 1 カタログは要件定義時の初期案であり、Phase 2 設計で精緻化された。

**統一ルール**: `SkillEventType` は Phase 5 `event-model-impl-spec.md` の18型を正とする。

### 3.3 スコア関連フィールド名の乖離

| フィールド名    | 使用箇所                              | 意味                 |
| --------------- | ------------------------------------- | -------------------- |
| `score`         | Phase 1 EvaluationMetadata            | 評価時のスコア値     |
| `latestScore`   | Phase 1 contract / Phase 2 aggregate  | 最新の評価スコア     |
| `qualityScore`  | Phase 2 aggregate / Phase 5 aggregate | 品質スコア（集約値） |
| `newScore`      | Phase 1 ScoreChangeMetric             | スコア変化後の値     |
| `previousScore` | Phase 1 ScoreChangeMetric             | スコア変化前の値     |

**判定**: 各フィールドは異なるコンテキストで使用されており、名前が異なるのは妥当。ただし型の統一が必要。

**統一ルール**:

- イベントメタデータ内: `score: number`（評価時の生スコア）
- 集約ビュー内: `latestScore: number | null`（INT-M-02解決済み、null=未評価）
- 集約ビュー内: `qualityScore: number`（0〜1の正規化スコア）
- スコア変化メトリクス内: `newScore: number`, `previousScore: number`

### 3.4 タイムスタンプフィールド名の不統一

| サフィックス      | 使用箇所                | 判定                                 |
| ----------------- | ----------------------- | ------------------------------------ |
| `createdAt`       | SkillLifecycleEvent     | 統一対象外（イベント作成時刻）       |
| `processedAt`     | FeedbackAction          | 統一対象外（処理完了時刻）           |
| `aggregatedAt`    | SkillAggregateView      | 統一対象外（集約計算時刻）           |
| `calculatedAt`    | PublishReadinessMetrics | 統一対象外（メトリクス計算時刻）     |
| `generatedAt`     | SkillHealthReport       | 統一対象外（レポート生成時刻）       |
| `lastExecutedAt`  | SkillAggregateView      | 統一対象外（最終実行時刻）           |
| `lastEvaluatedAt` | SkillAggregateView      | 統一対象外（最終評価時刻）           |
| `submittedAt`     | SkillFeedback           | 統一対象外（フィードバック送信時刻） |
| `recordedAt`      | AutoMetric              | 統一対象外（メトリクス記録時刻）     |

**判定**: 全て `*At` サフィックスで統一されており、各フィールドが異なるセマンティクスを持つため命名は妥当。統一は不要。

**統一ルール**: タイムスタンプは `{動詞過去分詞}At: string`（ISO 8601形式）で統一。

---

## 4. Phase 3 MINOR 指摘との関連

| MINOR ID  | 内容                                 | 命名観点での影響               |
| --------- | ------------------------------------ | ------------------------------ | ------------------------- |
| TECH-M-01 | aggregateViews persist不整合         | 命名影響なし（構造の問題）     |
| REQ-M-01  | minUsageCount 3 vs 5                 | 命名影響なし（値の問題）       |
| INT-M-01  | successRate算出方式                  | 命名影響なし（ロジックの問題） |
| INT-M-02  | latestScore型 number vs number\|null | `latestScore: number           | null` に統一（3.3節参照） |

---

## 5. Before/After マッピング表

| 項目             | Before（Phase 1）               | After（Phase 5 最終）           | 根拠                 |
| ---------------- | ------------------------------- | ------------------------------- | -------------------- |
| EventSource      | `"main" \| "renderer" \| "cli"` | `"system" \| "user" \| "api"`   | ドメインモデル適合性 |
| スキル識別引数名 | `skillId`（一部）               | `skillName: SkillName`          | P45準拠              |
| latestScore型    | `number`（0=未評価）            | `number \| null`（null=未評価） | INT-M-02解決         |
| minUsageCount    | `3`                             | `5`                             | REQ-M-01解決         |
| イベント型定義   | 18型（Phase 1版）               | 18型（Phase 5版、6型名変更）    | 設計精緻化           |

---

## 6. 推奨アクション

1. **仕様書間の相互参照更新**: Phase 1 カタログのイベント名を参照している箇所は、Phase 5 の最終名を正として参照すること
2. **P45チェック**: 今後のIPC仕様追加時、引数名のセマンティクスを値の実態と一致させること
3. **Branded Type活用**: `SkillName` 型を全レイヤーで一貫して使用し、`string` 直接使用を避けること
