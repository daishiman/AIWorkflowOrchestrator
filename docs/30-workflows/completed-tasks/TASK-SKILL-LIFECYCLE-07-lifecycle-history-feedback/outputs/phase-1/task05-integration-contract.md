# Task05 再利用導線との連携要件定義

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 1                                          |
| タスク     | タスク3: Task05 再利用導線との連携要件定義 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                    |
| 作成日     | 2026-03-16                                 |
| 依存タスク | TASK-SKILL-LIFECYCLE-05（完了）            |
| 参照元     | `phase-1-requirements.md` タスク3          |

---

## 1. Task05 UIコンポーネント別の履歴データ要件

### 1.1 コンポーネント別データ要件テーブル

| コンポーネント名                               | 必要データ                                                                                                                                                                       | データソース                                                                                                                     | 更新タイミング                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **ScoreGateBadge**                             | - 最新評価スコア（0-100）<br>- ScoringGate 判定結果（NEEDS_IMPROVEMENT / SAVE_ALLOWED / USE_ALLOWED / RECOMMENDED）<br>- スコア推移データポイント（任意: グラフ表示用）          | `skill:evaluated` / `skill:score_updated` イベント履歴<br>最新エントリをプロジェクション                                         | `skill:evaluated` イベント発生時<br>（評価実行のたびに更新）                       |
| **PostExecutionActionBar**                     | - 直近の実行ステータス（success / partial / failed / cancelled）<br>- 実行成功率（直近N回の成功件数 / 総件数）<br>- 前回スコアとの差分（scoreDelta）<br>- 再評価後スコア（任意） | `skill:executed` / `skill:execution_succeeded` / `skill:execution_failed` イベント履歴<br>`ExecutionResultSummary`（agentSlice） | Agent 実行完了時（`skill:execution_succeeded` or `skill:execution_failed` 発生時） |
| **SkillManagementPanel (RecentlyUsedSection)** | - 最終実行日時（ISO 8601）<br>- スキル名<br>- 成功率（直近10件の成功率）<br>- 最新スコア（最後の評価スコア）                                                                     | `recentlyUsedSkills`（skillSlice / Zustand persist）<br>`skill:evaluated` 最新エントリ                                           | `addRecentlyUsed(skillName)` 呼び出し時（Agent 実行完了時）                        |

### 1.2 コンポーネントとデータの依存関係

```
TASK-SKILL-LIFECYCLE-07 (履歴基盤)
    |
    | 提供するデータ
    v
+--------------------------------------------------+
| LifecycleEventStore                              |
|  - skill:evaluated の最新スコア                  |
|  - skill:executed の成功率                       |
|  - スコア推移データポイント列                    |
+--------------------------------------------------+
    |                    |                    |
    v                    v                    v
ScoreGateBadge    PostExecutionActionBar  SkillManagementPanel
(スコア表示)      (実行後導線分岐)        (最近使ったスキル)
```

---

## 2. 「最近使ったスキル」リスト仕様

### 2.1 表示フィールド

| フィールド名  | 型       | 説明                                         | 取得元                                                 |
| ------------- | -------- | -------------------------------------------- | ------------------------------------------------------ |
| `skillName`   | `string` | スキルの識別名                               | `recentlyUsedSkills[].name` (skillSlice)               |
| `lastUsedAt`  | `string` | 最終実行日時（ISO 8601）                     | `recentlyUsedSkills[].usedAt` (skillSlice)             |
| `successRate` | `number` | 成功率（0.0-1.0）。計算式: 成功件数 / 総件数 | `skill:execution_succeeded` / `skill:executed` 集計    |
| `latestScore` | `number` | 最新の評価スコア（0-100）                    | `skill:evaluated` / `skill:score_updated` 最新エントリ |

### 2.2 ソート仕様

| 項目       | 仕様                                                    |
| ---------- | ------------------------------------------------------- |
| ソートキー | `lastUsedAt`（最終実行日時）                            |
| ソート順   | 降順（最近実行したスキルを先頭に表示）                  |
| 優先度     | `lastUsedAt` のみ。スコアや成功率によるソートは行わない |

### 2.3 フィルタ仕様

| 項目                 | 仕様                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| 削除済みスキルの除外 | `ImportedSkill` に存在しないスキル名のエントリは表示から除外する            |
| 評価データなし時     | `latestScore` が取得できない場合は `null` を格納し、表示上は「未評価」表示  |
| 実行履歴なし時       | `successRate` が計算できない場合（0件）は `null` を格納し、「実績なし」表示 |

### 2.4 ページネーション仕様

| 項目           | 仕様                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------- |
| 表示件数       | 最新10件（固定）                                                                                    |
| ページング     | なし（10件を超えるエントリは非表示。`recentlyUsedSkills` は最大20件保持するが、表示は上位10件のみ） |
| 「もっと見る」 | 実装なし（Skill Center の全スキル一覧から参照を誘導）                                               |

---

## 3. 「スコア推移グラフ」データ仕様

### 3.1 ScoreDataPoint 型

```typescript
/**
 * スコア推移グラフの1データポイント
 * skill:evaluated / skill:score_updated イベントを起点に生成する
 */
export interface ScoreDataPoint {
  /** データポイントのタイムスタンプ（ISO 8601） */
  timestamp: string;

  /** 評価スコア（0-100） */
  score: number;

  /** 評価時点のスキルバージョン（例: "1.0.0"）。バージョン管理されていない場合は null */
  version: string | null;

  /** 評価トリガーイベント種別 */
  triggerEvent:
    | "skill:evaluated"
    | "skill:score_updated"
    | "skill:gate_passed"
    | "skill:gate_failed";

  /** ScoringGate 判定結果 */
  gate: "NEEDS_IMPROVEMENT" | "SAVE_ALLOWED" | "USE_ALLOWED" | "RECOMMENDED";
}
```

### 3.2 集計期間

| 項目                 | 仕様                                                                   |
| -------------------- | ---------------------------------------------------------------------- |
| デフォルト期間       | 直近30件のデータポイント（件数ベース）                                 |
| 時間範囲             | 制限なし（全期間から直近30件を取得）                                   |
| データポイント数上限 | グラフ描画パフォーマンスのため上限30件。超過分は古いものから切り捨て   |
| 最小表示件数         | 1件以上でグラフを表示。0件の場合は「評価履歴なし」プレースホルダー表示 |

### 3.3 グラフ要件

| 軸・要素         | 仕様                                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| X軸              | バージョン（`version` フィールドが存在する場合）または時間（`timestamp`）。バージョンが混在する場合は時間軸を優先 |
| Y軸              | 評価スコア（0-100）。固定スケール                                                                                 |
| Y軸目盛り        | 0, 20, 40, 60, 80, 100 の6段階                                                                                    |
| ゲートしきい値線 | y=60（SAVE_ALLOWED 境界）、y=80（USE_ALLOWED 境界）を補助線として描画                                             |
| データポイント   | 各評価イベント時点のスコアを点でプロット。線で結んで推移を表現                                                    |
| ゲート色分け     | NEEDS_IMPROVEMENT: error色、SAVE_ALLOWED: warning色、USE_ALLOWED / RECOMMENDED: success色                         |
| ツールチップ     | ホバー時に timestamp、score、gate、version（ある場合）を表示                                                      |

---

## 4. データフロー図

以下のテキスト図は、どのライフサイクルイベントがどの Task05 UI コンポーネントにデータを供給するかを示す。

```
【ライフサイクルイベント】           【TASK-07 集計層】            【Task05 UIコンポーネント】

skill:evaluated ─────────────────> ScoreDataPoint 生成 ──────> ScoreGateBadge
skill:score_updated ─────────────>   (推移グラフ用)               (最新スコア + ScoringGate)
skill:gate_passed ───────────────>
skill:gate_failed ────────────────>
                                    LatestScoreProjection ────> ScoreGateBadge
                                      (最新スコア抽出)            (score, gate フィールド)

skill:executed ──────────────────> ExecutionSuccessRate ──────> PostExecutionActionBar
skill:execution_succeeded ───────>   (成功率集計)                (成功率 + 直近実行ステータス)
skill:execution_failed ──────────>
skill:execution_timeout ─────────>
                                    ScoreDelta 算出 ───────────> PostExecutionActionBar
                                      (前回比スコア差分)          (scoreDelta フィールド)

skill:executed (完了時) ─────────> recentlyUsedSkills 更新 ──> SkillManagementPanel
                                      (skillSlice persist)       (最近使ったスキル一覧)
                                    LatestScoreProjection ────> SkillManagementPanel
                                      (スキル別最新スコア)        (latestScore フィールド)
                                    ExecutionSuccessRate ──────> SkillManagementPanel
                                      (スキル別成功率)            (successRate フィールド)
```

### 4.1 イベント発生源とデータ提供先の対応

| イベント種別                | 発生源                         | データ供給先コンポーネント                                 |
| --------------------------- | ------------------------------ | ---------------------------------------------------------- |
| `skill:evaluated`           | Main Process (PromptEvaluator) | ScoreGateBadge、SkillManagementPanel (latestScore)         |
| `skill:score_updated`       | Main Process (SkillService)    | ScoreGateBadge（スコア更新時）                             |
| `skill:gate_passed`         | Main Process (ScoringGate)     | ScoreGateBadge（ゲート判定変化時）                         |
| `skill:gate_failed`         | Main Process (ScoringGate)     | ScoreGateBadge（ゲート判定変化時）                         |
| `skill:executed`            | Main Process (SkillExecutor)   | PostExecutionActionBar、SkillManagementPanel（実行記録）   |
| `skill:execution_succeeded` | Main Process (SkillExecutor)   | PostExecutionActionBar（成功率更新）、SkillManagementPanel |
| `skill:execution_failed`    | Main Process (SkillExecutor)   | PostExecutionActionBar（成功率更新）、SkillManagementPanel |
| `skill:execution_timeout`   | Main Process (SkillExecutor)   | PostExecutionActionBar（成功率更新）                       |

---

## 5. Task05 との契約インターフェース定義

Task07（履歴基盤）が Task05 UIコンポーネントに提供する TypeScript 型インターフェース。

```typescript
// ==========================================================
// packages/shared/src/types/skill-lifecycle-history.ts
// TASK-SKILL-LIFECYCLE-07 が提供する契約インターフェース
// ==========================================================

import type { ScoringGate } from "./skill-improver";

// ----------------------------------------------------------
// ScoreGateBadge 向け: スコア履歴データ
// ----------------------------------------------------------

/**
 * スコア推移グラフの1データポイント
 * skill:evaluated / skill:score_updated イベントを起点に生成する
 */
export interface ScoreDataPoint {
  /** データポイントのタイムスタンプ（ISO 8601） */
  timestamp: string;
  /** 評価スコア（0-100） */
  score: number;
  /** 評価時点のスキルバージョン。バージョン管理されていない場合は null */
  version: string | null;
  /** 評価トリガーイベント種別 */
  triggerEvent:
    | "skill:evaluated"
    | "skill:score_updated"
    | "skill:gate_passed"
    | "skill:gate_failed";
  /** ScoringGate 判定結果 */
  gate: ScoringGate;
}

/**
 * ScoreGateBadge コンポーネントに提供するスコア履歴データ
 */
export interface ScoreHistoryForBadge {
  /** スキル名（識別子） */
  skillName: string;
  /** 最新の評価スコア（0-100） */
  latestScore: number;
  /** 最新の ScoringGate 判定結果 */
  latestGate: ScoringGate;
  /**
   * スコア推移データポイント列（新しい順、最大30件）
   * グラフ表示用。0件の場合は空配列
   */
  scoreHistory: ScoreDataPoint[];
}

// ----------------------------------------------------------
// PostExecutionActionBar 向け: 実行履歴データ
// ----------------------------------------------------------

/**
 * PostExecutionActionBar コンポーネントに提供する実行履歴データ
 */
export interface ExecutionHistoryForActionBar {
  /** スキル名（識別子） */
  skillName: string;
  /** 直近の実行ステータス */
  lastExecutionStatus: "success" | "partial" | "failed" | "cancelled" | null;
  /** 直近の実行日時（ISO 8601）。未実行の場合は null */
  lastExecutedAt: string | null;
  /**
   * 成功率（0.0-1.0）。計算対象: 直近N回の実行
   * 実行記録が存在しない場合は null
   */
  successRate: number | null;
  /**
   * 成功率の計算に使用した実行件数（N）
   * successRate が null の場合は 0
   */
  successRateSampleCount: number;
  /**
   * 前回スコアとの差分（現在スコア - 前回スコア）
   * 評価履歴が1件以下の場合は null
   */
  scoreDelta: number | null;
}

// ----------------------------------------------------------
// SkillManagementPanel (RecentlyUsedSection) 向け: 最近使ったスキルリスト
// ----------------------------------------------------------

/**
 * 「最近使ったスキル」リストの1エントリ
 * SkillManagementPanel (RecentlyUsedSection) コンポーネントに提供する
 */
export interface RecentlyUsedSkillEntry {
  /** スキル名（識別子） */
  skillName: string;
  /** 最終実行日時（ISO 8601） */
  lastUsedAt: string;
  /**
   * 成功率（0.0-1.0）。計算対象: 直近10件の実行
   * 実行記録が存在しない場合は null
   */
  successRate: number | null;
  /**
   * 最新の評価スコア（0-100）
   * 評価履歴が存在しない場合は null（「未評価」として表示）
   */
  latestScore: number | null;
  /**
   * 最新の ScoringGate 判定結果
   * latestScore が null の場合は null
   */
  latestGate: ScoringGate | null;
}

/**
 * SkillManagementPanel に提供する「最近使ったスキル」リスト
 */
export interface RecentlyUsedSkillList {
  /**
   * 最近使ったスキルのリスト
   * - ソート: lastUsedAt の降順（最新が先頭）
   * - 件数: 最大10件
   * - 削除済みスキルは除外済み
   */
  entries: RecentlyUsedSkillEntry[];
  /** リストの生成日時（ISO 8601） */
  generatedAt: string;
}

// ----------------------------------------------------------
// 集計クエリインターフェース
// ----------------------------------------------------------

/**
 * TASK-07 の履歴集計レイヤーに対するクエリ引数
 * IPC チャネル `skill:history:query` で使用（TASK-07 で新規定義）
 */
export interface SkillHistoryQuery {
  /** 対象スキル名 */
  skillName: string;
  /** 取得するデータ種別 */
  dataType:
    | "score_history" // ScoreHistoryForBadge 用
    | "execution_history" // ExecutionHistoryForActionBar 用
    | "recently_used"; // RecentlyUsedSkillList 用（skillName 指定不要）
  /**
   * 成功率の計算対象件数（デフォルト: 10）
   * dataType が "execution_history" または "recently_used" の場合に使用
   */
  successRateSampleCount?: number;
  /**
   * スコア推移の最大件数（デフォルト: 30）
   * dataType が "score_history" の場合に使用
   */
  scoreHistoryLimit?: number;
}

/**
 * SkillHistoryQuery に対するレスポンス
 * dataType に応じていずれか1つのフィールドが non-null になる
 */
export interface SkillHistoryQueryResult {
  scoreHistory: ScoreHistoryForBadge | null;
  executionHistory: ExecutionHistoryForActionBar | null;
  recentlyUsedList: RecentlyUsedSkillList | null;
}
```

---

## 6. インターフェース整合性チェックリスト

Task05 の既存設計（`phase-2/component-design.md`, `phase-2/state-management-design.md`）との整合確認。

### 6.1 ScoreGateBadge との整合

| Task05 側の要求フィールド | Task07 提供フィールド               | 整合     |
| ------------------------- | ----------------------------------- | -------- |
| `gate: ScoringGate`       | `ScoreHistoryForBadge.latestGate`   | 一致     |
| `score: number`           | `ScoreHistoryForBadge.latestScore`  | 一致     |
| スコア推移（グラフ用）    | `ScoreHistoryForBadge.scoreHistory` | 新規提供 |

### 6.2 PostExecutionActionBar との整合

| Task05 側の要求フィールド | Task07 提供フィールド                                    | 整合     |
| ------------------------- | -------------------------------------------------------- | -------- |
| `postExecutionScore`      | agentSlice 経由（Task05 既存。Task07 は delta のみ補完） | 補完     |
| `scoreDelta`              | `ExecutionHistoryForActionBar.scoreDelta`                | 新規提供 |
| 成功率（表示用）          | `ExecutionHistoryForActionBar.successRate`               | 新規提供 |
| `executionResult.status`  | `ExecutionHistoryForActionBar.lastExecutionStatus`       | 補完     |

### 6.3 SkillManagementPanel (RecentlyUsedSection) との整合

| Task05 側の要求フィールド              | Task07 提供フィールド                | 整合     |
| -------------------------------------- | ------------------------------------ | -------- |
| `recentlyUsedSkills[].name`            | `RecentlyUsedSkillEntry.skillName`   | 一致     |
| `recentlyUsedSkills[].usedAt`          | `RecentlyUsedSkillEntry.lastUsedAt`  | 一致     |
| 成功率（表示用。Task05では未定義）     | `RecentlyUsedSkillEntry.successRate` | 拡張提供 |
| 最新スコア（表示用。Task05では未定義） | `RecentlyUsedSkillEntry.latestScore` | 拡張提供 |

### 6.4 Task05 skillSlice との分担

| データ                               | 管理主体                             | 理由                                       |
| ------------------------------------ | ------------------------------------ | ------------------------------------------ |
| `recentlyUsedSkills`（UIキャッシュ） | Task05: skillSlice (Zustand persist) | セッション跨ぎのUI状態。最大20件のLIFO管理 |
| `successRate`, `latestScore`         | Task07: LifecycleEventStore          | 集計計算が必要なデータ。履歴基盤の責務     |
| `favoriteSkillNames`                 | Task05: skillSlice (Zustand persist) | ユーザーのUI設定。Task07 のスコープ外      |
| `lastExecutionResult`                | Task05: agentSlice（セッション限定） | 直近1件のみ。Task07 は集計・推移管理を担当 |

---

## 7. 完了確認チェックリスト

- [x] Task05 の3コンポーネント（ScoreGateBadge / PostExecutionActionBar / SkillManagementPanel）への履歴データ要件テーブルが定義されている
- [x] 「最近使ったスキル」リストの表示フィールド・ソート・フィルタ・ページネーションが定義されている（表示件数: 最新10件、ソート: lastUsedAt 降順）
- [x] 「スコア推移グラフ」の ScoreDataPoint 型・集計期間（直近30件）・グラフ要件が定義されている
- [x] データフロー図（イベント発生源 -> 集計層 -> UIコンポーネント）が定義されている
- [x] Task05 との契約インターフェース（TypeScript 型）が定義されている
- [x] Task05 既存設計との整合性チェックリストが完了している
- [x] skillSlice との責務分担が明確化されている
