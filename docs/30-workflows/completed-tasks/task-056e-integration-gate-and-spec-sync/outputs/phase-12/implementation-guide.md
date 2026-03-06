# Phase 12 実装ガイド

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| タスクID   | TASK-UI-01-E-INTEGRATION-GATE-SPEC-SYNC |
| Phase      | 12                                      |
| 作成日     | 2026-03-06                              |
| ステータス | completed                               |

## Part 1: やさしい説明（中学生向け）

### 1. このタスクは何をしたか

このタスクは、ばらばらの仕様書を1つの「通行チェック表」にまとめる作業です。

#### 日常生活での例え

駅の改札に似ています。

- 切符があるか
- 行き先が合っているか
- 持ち込み禁止のものがないか
- 進んでよいホームか

を改札がまとめて確認してから通します。

今回の統合レビューゲートも同じで、`state`、`ipc`、`security`、`navigation`、`documentation` の5つをまとめて確認し、後続タスクを進めてよいかを決めます。

### 2. なぜ必要か

`TASK-UI-01-A`、`TASK-UI-01-B`、`TASK-UI-01-C`、`TASK-UI-01-D` はそれぞれ大事な仕様を持っていますが、後続タスクから見ると「どれを正本として見ればよいか」「どこまで揃えば着手してよいか」が分かりにくくなります。

このタスクでは、その迷いをなくすために次の3つを固定しました。

| 機能         | 説明                               | 例                                            |
| ------------ | ---------------------------------- | --------------------------------------------- |
| 統合ゲート   | 5つの観点で通過判定をする          | `navigation` が欠けたら `TASK-UI-02` は止める |
| 仕様同期台帳 | どの文書を常時更新するかを整理する | `task-workflow.md` は常時更新                 |
| handoff条件  | 後続タスクごとの解放条件を決める   | `TASK-UI-04A` は `workspace` 導線が必須       |

### 3. このタスクでできるようになったこと

| できること           | 説明                                        | 具体例                                      |
| -------------------- | ------------------------------------------- | ------------------------------------------- |
| 判定の一本化         | PASS / MINOR / MAJOR を同じ基準で判断できる | `review-gate.md` だけ見れば判定根拠が分かる |
| 更新先の一本化       | Step 1-A / 1-B / 1-C / 2 の更新先が分かる   | `spec-sync-targets.md` で更新区分を確認     |
| 下流引き渡しの一本化 | `TASK-UI-02/03/04A` の着手条件が分かる      | `dependency-handoff-plan.md` を参照         |

## Part 2: 技術者向け詳細

### 1. 論理契約

本タスクは `spec_created` の統合タスクであり、current workflow 自体にランタイム実装コードは追加していない。  
ただし Phase 11 では branch-level integration visual recheck を実施し、Phase 12 では後続自動化のために以下の論理契約を正本化した。

```ts
type GateAxis = "state" | "ipc" | "security" | "navigation" | "documentation";

type GateDecision = "PASS" | "MINOR" | "MAJOR";

type SpecSyncMode = "always" | "conditional" | "no-change";

interface GateCriterion {
  axis: GateAxis;
  evidenceSources: string[];
  passCondition: string;
  minorCondition: string;
  majorCondition: string;
  fallbackPhase: string;
}

interface SpecSyncTarget {
  target: string;
  mode: SpecSyncMode;
  step: "1-A" | "1-B" | "1-C" | "2";
  reason: string;
}

interface DownstreamHandoff {
  taskId:
    | "TASK-UI-02-GLOBAL-NAV-CORE"
    | "TASK-UI-03-AGENT-VIEW-ENHANCEMENT"
    | "TASK-UI-04A-WORKSPACE-LAYOUT";
  requiredAxes: GateAxis[];
  references: string[];
}
```

### 2. 論理APIシグネチャ

```ts
function evaluateIntegrationGate(criteria: GateCriterion[]): {
  overall: GateDecision;
  axisResults: { axis: GateAxis; decision: GateDecision }[];
};

function classifySpecSyncTargets(targets: SpecSyncTarget[]): {
  always: SpecSyncTarget[];
  conditional: SpecSyncTarget[];
  noChange: SpecSyncTarget[];
};

function resolveDownstreamReadiness(handoffs: DownstreamHandoff[]): {
  taskId: DownstreamHandoff["taskId"];
  ready: boolean;
  blockers: string[];
}[];
```

### 3. 使用例

#### 3.1 統合ゲート判定

```ts
const result = evaluateIntegrationGate([
  {
    axis: "state",
    evidenceSources: ["task-056a", "task-056c", "task-056d"],
    passCondition: "...",
    minorCondition: "...",
    majorCondition: "...",
    fallbackPhase: "Phase 1 or 2",
  },
  {
    axis: "navigation",
    evidenceSources: ["task-056d", "ui-ux-navigation.md"],
    passCondition: "...",
    minorCondition: "...",
    majorCondition: "...",
    fallbackPhase: "Phase 2",
  },
]);
```

- `navigation=MAJOR` の場合、`TASK-UI-02-GLOBAL-NAV-CORE` は unblock しない。
- `documentation=MINOR` の場合、下流解放前に Step 1-A/1-B/1-C を再確認する。

#### 3.2 仕様同期区分

```ts
const sync = classifySpecSyncTargets([
  {
    target: "task-workflow.md",
    mode: "always",
    step: "1-A",
    reason: "完了台帳の正本",
  },
  {
    target: "quality-requirements.md",
    mode: "conditional",
    step: "2",
    reason: "新しい品質閾値がある場合のみ",
  },
  {
    target: "database-schema.md",
    mode: "no-change",
    step: "2",
    reason: "DB変更なし",
  },
]);
```

### 4. エラーハンドリング

| ケース                                                         | 判定  | 対応                                                                               |
| -------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------- |
| parent docs が削除済み nested workflow を参照                  | MAJOR | current workflow path へ正規化し、parent docs と current workflow の両方を更新する |
| `task-workflow.md` / `lessons-learned.md` 更新漏れ             | MAJOR | Step 1-A 未達として Phase 12 を完了扱いにしない                                    |
| `artifacts.json` と `phase-12-documentation.md` の状態が不一致 | MAJOR | `complete-phase.js` 実行後に phase 本文を再同期する                                |
| 文言補足のみ不足                                               | MINOR | Phase 10 で再判定し、downstream 解放前に補う                                       |
| current workflow に実装差分はないが upstream UI を再監査する   | PASS  | representative screenshots を current workflow 配下へ再取得して記録する            |

### 5. エッジケース

| ケース                                  | 説明                                                 | 対応                                                    |
| --------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| completed/current path 混在             | `completed-tasks/` と current workflow path が混ざる | canonical path を `outputs/phase-11` と Phase 12 で固定 |
| parent/index のみ旧パス残置             | current workflow だけ正しくても探索が壊れる          | parent task と統合 index も同一ターンで修正             |
| 既存の未タスクが completed 配下へ誤配置 | `verify-unassigned-links` が失敗する                 | `unassigned-task/` へ戻し、リンク監査を再実行           |
| docs-only task の実装フェーズ           | Phase 5 にコードがなくても成果物は必要               | 実装計画 / review gate / sync targets を正本化する      |

### 6. 設定可能な定数・基準値

| 項目                     | 値                         | 用途                                                                                                          |
| ------------------------ | -------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ゲート軸数               | 5                          | `state / ipc / security / navigation / documentation`                                                         |
| 仕様同期区分数           | 3                          | `常時更新 / 条件付き更新 / 更新不要`                                                                          |
| downstream 対象数        | 3                          | `TASK-UI-02` / `TASK-UI-03` / `TASK-UI-04A`                                                                   |
| Phase 12 必須成果物数    | 7                          | 実装ガイド、更新サマリー、更新履歴、未タスク検出、フィードバック、再監査、準拠再確認                          |
| Phase 11 screenshot 判定 | integration_visual_recheck | `AppDock` / `NotificationCenter` / `HistorySearchView` / 履歴ルートの代表画面を current workflow 配下で再撮影 |

### 7. 参照ファイル

| 種別               | ファイル                                     |
| ------------------ | -------------------------------------------- |
| 統合ゲート設計     | `outputs/phase-2/integration-gate-design.md` |
| レビューゲート正本 | `outputs/phase-5/review-gate.md`             |
| 仕様同期対象一覧   | `outputs/phase-5/spec-sync-targets.md`       |
| downstream handoff | `outputs/phase-2/dependency-handoff-plan.md` |
| 最終判定           | `outputs/phase-10/final-review-result.md`    |
