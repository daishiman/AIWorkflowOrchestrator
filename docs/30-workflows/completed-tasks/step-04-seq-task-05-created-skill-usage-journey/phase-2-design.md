# Phase 2: 設計

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 2                                                      |
| Phase名    | 設計                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-05                                |
| タスク名   | 作成済みスキルを使う主導線                             |
| 機能名     | created-skill-usage-journey                            |
| 前提Phase  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 後続Phase  | [phase-3-design-review.md](./phase-3-design-review.md) |
| ステータス | not_started                                            |
| 作成日     | 2026-03-15                                             |

## 目的

Phase 1 で定義した3シナリオ・主利用導線・品質表示・改善フィードバックループを、画面遷移・コンポーネント・状態管理・IPC連携の設計として確定する。

## Atent Team 編成

| 役割       | 担当                 | 責務                                                       |
| ---------- | -------------------- | ---------------------------------------------------------- |
| Lead       | 設計統合             | 採用案決定、設計全体整合、Phase 1 要件との突合             |
| SubAgent-A | Journey Designer     | 3シナリオの画面遷移フロー設計                              |
| SubAgent-B | Component Designer   | 利用導線UI コンポーネント設計                              |
| SubAgent-C | State Designer       | 利用状態・履歴・お気に入りの状態管理設計                   |
| SubAgent-D | Integration Designer | Task04 品質ゲート・Task03 改善戻りのインテグレーション設計 |

## 実行タスク

- タスク1: 「今すぐ使う」CTA と「あとで使う」保存導線の画面遷移を設計する
- タスク2: 一覧 / 履歴 / お気に入り / 最近使ったスキルの再利用導線を設計する
- タスク3: 実行画面に品質表示（ScoringGateBanner / ScoreDisplay）を埋め込む設計をする
- タスク4: 実行結果から改善へ戻るショートカットを設計する
- タスク5: 利用導線でのコンポーネント階層と状態管理を設計する
- タスク6: IPC連携と既存チャネルの再利用可否を検証する

## 参照資料

| 参照資料            | パス                                                                                                                         | 説明                                |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件定義    | [phase-1-requirements.md](./phase-1-requirements.md)                                                                         | 3シナリオ・導線比較・品質要件       |
| Task01 一次導線     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/primary-journey-sequence.md`      | 一次導線シーケンス                  |
| Task01 画面責務     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 画面別責務・禁止事項                |
| Task04 ゲート遷移   | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4 フローとTask05 I/O契約    |
| Task04 スコアモデル | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate型定義・テストマトリクス |
| UI/UX Realization   | `../../ui-ux-realization.md`                                                                                                 | Reuse導線・CTA契約                  |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                 | 内容                                       |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent実行画面の導線・権限確認・進捗surface |
| ui-ux-navigation              | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`              | ナビゲーション正本・入口設計               |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | Skill Center / Workspace / Agent catalog   |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行契約・IPCチャネル                      |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | スキル関連インターフェース契約             |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | 状態管理・Store設計                        |

## 設計方針

- 作成直後の利用導線と後日再利用導線は同じ実行面（Agent）へ収束させる
- Workspace と Agent の二重主導線は許容せず、Workspace → Agent の二段構成を固定する
- 品質表示は Task04 の評価モデル（ScoringGate / ScoreDisplay / ScoreDelta）を使い回し、利用導線ごとに別採点ロジックを持たない
- IPC は既存 `skill:optimize:evaluate` チャネルを再利用し、新規チャネルは追加しない（Task04 GAP-05 方針に準拠）

## 実行手順

### ステップ1: 「今すぐ使う」CTA と「あとで使う」保存導線

#### 画面遷移フロー: シナリオA（作成直後）

```
Skill Creator 完了
    |
    v
[EP-1 採点完了画面]
    |
    +--- ScoringGate: USE_ALLOWED / RECOMMENDED ---+
    |                                               |
    v                                               v
「今すぐ使う」CTA                            「保存して後で使う」CTA
    |                                               |
    v                                               v
Workspace                                    Skill Center に保存
(文脈準備 + スキル自動選択)                  (保存完了トースト表示)
    |                                               |
    v                                               v
Agent                                        シナリオB へ合流
(実行 + 結果確認)
    |
    v
[実行結果サマリー]
    |
    +--- 「改善する」CTA → Task03 改善フロー
    +--- 「もう一度使う」CTA → Agent 再実行
    +--- 「完了」→ 履歴に記録
```

#### CTA 仕様

| CTA              | 表示条件                   | 遷移先            | スタイル         |
| ---------------- | -------------------------- | ----------------- | ---------------- |
| 今すぐ使う       | canUse === true            | Workspace         | Primary (Blue)   |
| 保存して後で使う | canSave === true           | Skill Center 保存 | Secondary (Gray) |
| 改善してから使う | gate === NEEDS_IMPROVEMENT | SkillAnalysisView | Warning (Orange) |
| 改善を推奨       | gate === SAVE_ALLOWED      | SkillAnalysisView | Text link        |

### ステップ2: 再利用導線

#### Skill Center 一覧

```
Skill Center
+------------------------------------------------------------------+
| [検索バー]                                    [フィルタ] [ソート] |
+------------------------------------------------------------------+
| おすすめスキル（USE_ALLOWED 以上、利用頻度上位3件）              |
| +----------+ +----------+ +----------+                           |
| | SkillCard| | SkillCard| | SkillCard|                           |
| +----------+ +----------+ +----------+                           |
+------------------------------------------------------------------+
| 最近使ったスキル                                                 |
| +----------+ +----------+                                        |
| | SkillCard| | SkillCard|                                        |
| +----------+ +----------+                                        |
+------------------------------------------------------------------+
| 保存済みスキル一覧                                               |
| +----------+ +----------+ +----------+ +----------+              |
| | SkillCard| | SkillCard| | SkillCard| | SkillCard|              |
| +----------+ +----------+ +----------+ +----------+              |
+------------------------------------------------------------------+
```

#### SkillCard コンポーネント仕様

| 要素               | 内容                                          |
| ------------------ | --------------------------------------------- |
| スキル名           | 1行、省略あり（max 40文字）                   |
| 説明               | 2行、省略あり（max 80文字）                   |
| ScoringGate バッジ | 色（error/warning/success）+ ラベル（文字列） |
| 最終使用日         | 「3日前に使用」形式                           |
| お気に入りスター   | 右上角、トグル操作                            |
| クリック動作       | スキル詳細パネルを開く                        |

#### スキル詳細パネル

| セクション | 表示内容                                         |
| ---------- | ------------------------------------------------ |
| ヘッダー   | スキル名 + ScoringGate バッジ + お気に入りスター |
| スコア詳細 | ScoreDisplay（総合 + 5軸 breakdown）             |
| 説明       | スキルの全文説明                                 |
| 利用履歴   | 直近5件の実行日時・結果サマリー                  |
| CTAバー    | 「使う」(Primary) + 「改善する」(Secondary)      |

### ステップ3: 品質表示の埋め込み設計

#### 利用導線の各地点での品質コンポーネント配置

| 画面                 | コンポーネント                | 配置場所                 | 表示モード            |
| -------------------- | ----------------------------- | ------------------------ | --------------------- |
| Skill Center 一覧    | `ScoreGateBadge`              | SkillCard 右上           | compact (色+アイコン) |
| スキル詳細パネル     | `ScoreDisplay`                | ヘッダー直下             | full (5軸表示)        |
| 作成直後CTA画面      | `ScoringGateBanner` + CTA制御 | CTA上部                  | banner                |
| Workspace スキル選択 | `ScoreGateBadge` + EP-3バナー | スキル選択ドロップダウン | inline                |
| Agent 実行前         | `ScoreDisplay`                | 実行パネル上部           | compact               |
| Agent 実行後         | `ScoreDelta` + EP-4再評価     | 結果サマリー内           | delta                 |
| 履歴一覧             | `ScoreGateBadge` + ScoreDelta | 履歴エントリ             | compact+delta         |

#### ScoreGateBadge 仕様（新規コンポーネント）

```typescript
interface ScoreGateBadgeProps {
  gate: ScoringGate;
  score: number;
  size: "sm" | "md";
  showLabel?: boolean; // default: true
}

// 表示マッピング
const GATE_BADGE_CONFIG: Record<
  ScoringGate,
  {
    label: string;
    variant: "error" | "warning" | "success";
    icon: string;
  }
> = {
  NEEDS_IMPROVEMENT: {
    label: "改善必須",
    variant: "error",
    icon: "alert-circle",
  },
  SAVE_ALLOWED: { label: "保存可", variant: "warning", icon: "save" },
  USE_ALLOWED: { label: "利用可", variant: "success", icon: "check-circle" },
  RECOMMENDED: { label: "推奨", variant: "success", icon: "star" },
};
```

### ステップ4: 改善戻りショートカット設計

#### Agent 実行結果画面からの改善導線

```
[Agent 実行結果]
+------------------------------------------------------------------+
| 実行結果サマリー                                                 |
| ・ステータス: 完了                                                |
| ・実行時間: 12.3秒                                               |
| ・結果プレビュー: ...                                            |
+------------------------------------------------------------------+
| 品質情報                                                         |
| [ScoreDisplay: 75点] [ScoreDelta: +5 (70→75)]                   |
| [ScoringGateBanner: 利用可能だが改善推奨]                        |
+------------------------------------------------------------------+
| アクション                                                       |
| [もう一度使う] [改善する] [完了] [terminal で続ける]             |
+------------------------------------------------------------------+
```

| アクション        | 遷移先                     | 渡すコンテキスト                         |
| ----------------- | -------------------------- | ---------------------------------------- |
| もう一度使う      | Agent（同スキル再実行）    | 前回パラメータ                           |
| 改善する          | SkillAnalysisView (Task03) | skillName + 最新SkillAnalysis + 実行結果 |
| 完了              | 履歴に記録 → 画面遷移なし  | なし                                     |
| terminal で続ける | Terminal Dock              | prompt bundle + context summary          |

### ステップ5: コンポーネント階層と状態管理

#### コンポーネントツリー（利用導線関連）

```
SkillCenterView
  ├── SkillSearchBar
  ├── RecommendedSkillSection
  │   └── SkillCard[] (with ScoreGateBadge)
  ├── RecentlyUsedSection
  │   └── SkillCard[] (with ScoreGateBadge)
  ├── SavedSkillList
  │   └── SkillCard[] (with ScoreGateBadge)
  └── SkillDetailPanel
      ├── ScoreDisplay (full)
      ├── SkillDescription
      ├── UsageHistory
      └── SkillActionBar (使う / 改善する)

AgentView (実行結果セクション拡張)
  ├── ExecutionResultSummary
  ├── ScoreDisplay (compact) + ScoreDelta
  ├── ScoringGateBanner
  └── PostExecutionActionBar
      ├── RerunButton
      ├── ImproveButton
      ├── CompleteButton
      └── TerminalHandoffButton
```

#### 状態管理設計

| Store / Slice | 追加フィールド        | 型                                   | 責務                               |
| ------------- | --------------------- | ------------------------------------ | ---------------------------------- |
| skillSlice    | `favoriteSkillNames`  | `Set<string>`                        | お気に入りスキルの管理             |
| skillSlice    | `recentlyUsedSkills`  | `{ name: string; usedAt: string }[]` | 最近使ったスキルの管理（最大20件） |
| agentSlice    | `lastExecutionResult` | `ExecutionResultSummary \| null`     | 直近の実行結果保持                 |
| agentSlice    | `postExecutionScore`  | `ScoringGateResult \| null`          | EP-4 利用後再評価結果              |

**注意**: P31/P48 準拠で個別セレクタを使用。合成 Hook は使用しない。

```typescript
// 個別セレクタ例
export const useFavoriteSkillNames = () =>
  useAppStore((state) => state.favoriteSkillNames);

export const useRecentlyUsedSkills = () =>
  useAppStore(useShallow((state) => state.recentlyUsedSkills)); // P48: 配列は useShallow 必須
```

### ステップ6: IPC連携設計

| 操作                | IPCチャネル                    | 新規/既存 | 引数                | 戻り値                    |
| ------------------- | ------------------------------ | --------- | ------------------- | ------------------------- |
| 利用前評価 (EP-3)   | `skill:optimize:evaluate`      | 既存      | `skillName: string` | `PromptEvaluation`        |
| 利用後再評価 (EP-4) | `skill:optimize:evaluate`      | 既存      | `skillName: string` | `PromptEvaluation`        |
| スキル一覧取得      | `skill:list`                   | 既存      | なし                | `ImportedSkill[]`         |
| お気に入り登録      | `skill:favorite:toggle`        | 新規検討  | `skillName: string` | `{ isFavorite: boolean }` |
| 最近使った記録      | なし（Renderer Store内で管理） | -         | -                   | -                         |

**IPC方針**: 新規チャネルは `skill:favorite:toggle` のみ検討。他は既存チャネルを再利用する。お気に入りをローカルストレージ（Zustand persist）で管理する場合は新規IPC不要。

## 統合テスト連携

| 観点     | 連携内容                                                               |
| -------- | ---------------------------------------------------------------------- |
| 画面遷移 | Skill Center → 詳細 → Workspace → Agent の遷移フローをテスト対象にする |
| CTA制御  | ScoringGate別のCTA有効/無効をテスト対象にする                          |
| 品質表示 | 各画面でのScoreDisplay/ScoreGateBadge表示をテスト対象にする            |
| 改善戻り | Agent結果→改善→再評価→再利用のフローをテスト対象にする                 |
| 状態管理 | お気に入り・最近使った・履歴の状態更新をテスト対象にする               |

## 多角的チェック観点

| 観点             | 適用内容                                                                  |
| ---------------- | ------------------------------------------------------------------------- |
| UI/UX            | CTAの視認性、品質バッジの一貫性、改善戻りの自然さ                         |
| アーキテクチャ   | コンポーネント階層がAtomic Design準拠か、Store設計がslice分離されているか |
| API/IPC          | 既存チャネル再利用で型契約が一致するか、新規チャネルの最小化              |
| セキュリティ     | お気に入り・履歴データのローカル保存がセキュリティ要件に準拠するか        |
| アクセシビリティ | ScoreGateBadgeが色+ラベル+アイコンの3重表現か、キーボード操作可能か       |
| パフォーマンス   | スキル一覧の遅延読み込み、履歴データのページネーション                    |

## 成果物

| 成果物             | パス                                           | 説明                             |
| ------------------ | ---------------------------------------------- | -------------------------------- |
| 画面遷移設計       | `outputs/phase-2/screen-transition-design.md`  | 3シナリオの画面遷移フロー        |
| コンポーネント設計 | `outputs/phase-2/component-design.md`          | SkillCard / ScoreGateBadge / CTA |
| 状態管理設計       | `outputs/phase-2/state-management-design.md`   | Store拡張・セレクタ設計          |
| IPC連携設計        | `outputs/phase-2/ipc-integration-design.md`    | 既存チャネル再利用・新規チャネル |
| 品質表示配置設計   | `outputs/phase-2/quality-display-placement.md` | 各画面での品質コンポーネント配置 |

## 完了条件

- [ ] 3シナリオ（作成直後 / あとから / 履歴から）の画面遷移フローが設計されている
- [ ] CTA仕様が ScoringGate 別に定義されている（表示条件 / 遷移先 / スタイル）
- [ ] Skill Center 一覧の SkillCard / SkillDetailPanel のコンポーネント仕様が設計されている
- [ ] ScoreGateBadge コンポーネントの Props / 表示マッピングが設計されている
- [ ] Agent 実行結果画面の改善戻りショートカットが設計されている
- [ ] 状態管理設計（favoriteSkillNames / recentlyUsedSkills / postExecutionScore）が定義されている
- [ ] P31/P48 準拠の個別セレクタ設計が含まれている
- [ ] IPC連携で既存チャネル再利用が検証されている
- [ ] 品質表示が利用導線の全地点で配置設計されている
- [ ] Task01 画面責務（Workspace: 文脈準備 / Agent: 実行本体）と矛盾しない
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認（Phase 1要件 + Task01/04成果物 + システム仕様）
- [ ] SubAgent-A: 画面遷移フロー設計
- [ ] SubAgent-B: コンポーネント設計
- [ ] SubAgent-C: 状態管理設計
- [ ] SubAgent-D: IPC連携・品質表示設計
- [ ] Lead: 統合判断
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 3: [phase-3-design-review.md](./phase-3-design-review.md)
