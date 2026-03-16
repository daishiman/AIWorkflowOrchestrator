# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1（要件定義）                    |
| 後続Phase  | Phase 3（設計レビュー）                |
| ステータス | 未実施                                 |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |

---

## 目的

Phase 1 で定義したライフサイクルイベント要件とフィードバック収集要件に基づき、履歴イベントモデル、集約ビュー、フィードバック還流パス、推薦/再利用アルゴリズムの設計を確定する。

## 背景

Phase 1 の成果物（イベント一覧、フィードバック収集要件、Task05/08 連携要件）を入力として、具体的なデータモデル・集約ロジック・UI表示モデル・IPC契約を設計する。設計タスクのため、コード実装ではなく仕様書と設計図が成果物となる。

---

## aiworkflow-requirements 仕様抽出トレース

| ステップ | 起点                                                                | 抽出結果                                                                                                                                                                                       |
| -------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | 「設計仕様（Skill Lifecycle 作成済みスキル利用導線 / CTA制御マトリクス）」と「UI実装（HistorySearch timeline / あなたの記録）」を必須導線として固定                                            |
| 2        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | `TASK-SKILL-LIFECYCLE-05` / `created-skill-usage-journey` / `ScoringGate` の分割検索セットを適用                                                                                               |
| 3        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`       | `workflow-skill-lifecycle-created-skill-usage-journey.md` / `workflow-skill-lifecycle-evaluation-scoring-gate.md` / `ui-history-search-view.md` / `interfaces-agent-sdk-history.md` を実体確認 |
| 4        | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`      | `lifecycle` / `history` / `feedback` / `score` / `timeline` の関連キーを確認し、設計対象仕様の取りこぼしを補完                                                                                 |

### 設計で固定する仕様境界

| 境界               | 仕様書                                                                                                                                                       | 使い方                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Task04評価依存     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                                                      | `ScoringGate` とスコア差分契約の入力境界として参照 |
| Task05利用導線依存 | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                                                  | 履歴イベントが供給すべき導線データを固定           |
| 履歴UI/状態        | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md` / `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | timeline と lifecycle slice の責務分離を固定       |
| 台帳同期           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`        | Phase 12 同期先を設計時点で固定                    |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ライフサイクルイベントモデル設計

**目的**: Phase 1 のイベント一覧をもとに、永続化可能なイベントモデルと型定義を設計する。

**実行手順**:

1. `SkillLifecycleEvent` 型を設計する:
   ```typescript
   interface SkillLifecycleEvent {
     id: string; // UUID v4
     skillId: string; // SkillName (branded type)
     skillVersion: string; // semver
     eventType: SkillEventType; // union type
     category: EventCategory; // 'creation' | 'evaluation' | 'execution' | 'improvement' | 'reuse'
     timestamp: string; // ISO 8601
     userId: string; // ユーザーID
     source: EventSource; // 'main' | 'renderer' | 'cli'
     metadata: Record<string, unknown>; // イベント固有データ
     parentEventId?: string; // 因果関係の親イベント
   }
   ```
2. イベントカテゴリごとの metadata スキーマを設計する
3. イベントの因果関係（parentEventId）のルールを定義する（例: `skill:improved` -> `skill:score_updated`）
4. イベントの永続化先を決定する（Zustand persist + SQLite）

**期待される成果物**:

- イベントモデル設計書（型定義、metadata スキーマ、因果関係ルール）

---

### タスク2: 集約ビュー設計

**目的**: 最近使ったスキル、成功率、品質推移の表示モデルを設計する。

**実行手順**:

1. 集約ビューの型を設計する:
   ```typescript
   interface SkillAggregateView {
     skillId: string;
     skillName: string;
     totalExecutions: number;
     successRate: number; // 0.0 - 1.0
     lastExecutedAt: string; // ISO 8601
     latestScore: number; // 0 - 100
     scoreHistory: ScoreDataPoint[];
     recentEvents: SkillLifecycleEvent[]; // 最新10件
     trend: "improving" | "stable" | "declining";
   }
   ```
2. 集約ロジックの計算方法を定義する:
   - 成功率: `successCount / totalExecutions`（直近30日間）
   - トレンド: 直近5回のスコア変化の傾き
   - 推薦スコア: `successRate * 0.4 + normalizedScore * 0.4 + recency * 0.2`
3. 集約の更新タイミングを定義する:
   - リアルタイム: イベント発生時に即時更新（Zustand Store）
   - バッチ: 日次でSQLiteから再計算

**期待される成果物**:

- 集約ビュー設計書（型定義、計算ロジック、更新タイミング）

---

### タスク3: フィードバック還流モデル設計

**目的**: 実行結果から改善アクションへ戻るフィードバックパスを設計する。

**実行手順**:

1. フィードバックモデルの型を設計する:
   ```typescript
   interface SkillFeedback {
     id: string;
     skillId: string;
     feedbackType:
       | "auto_metric"
       | "user_rating"
       | "user_text"
       | "improvement_suggestion";
     value: number | string | ImprovementSuggestion;
     sourceEventId: string; // フィードバックの発生元イベント
     createdAt: string;
     processedAt?: string; // 改善に反映された日時
     status: "pending" | "applied" | "dismissed";
   }
   ```
2. フィードバック→改善アクションの還流ルールを設計する:
   - 自動メトリクス: 成功率が50%以下なら改善推奨アラートを生成
   - ユーザーレーティング: 平均3.0以下なら改善推奨
   - テキストフィードバック: 蓄積して改善提案のコンテキストに使用
3. 改善優先度の計算方法を定義する:
   - `priority = (1 - successRate) * weight_sr + (1 - normalizedScore) * weight_ns + feedbackCount * weight_fb`

**期待される成果物**:

- フィードバック還流設計書（型定義、還流ルール、優先度計算）

---

### タスク4: Task08 公開判断メトリクスインターフェース設計

**目的**: Task08 が使う公開判断メトリクスの提供インターフェースを設計する。

**実行手順**:

1. 公開判断メトリクスの型を設計する:
   ```typescript
   interface PublishReadinessMetrics {
     skillId: string;
     qualityScore: number; // 最新評価スコア
     stabilityScore: number; // 実行成功率（直近N回）
     usageCount: number; // 総実行回数
     hasCriticalFeedback: boolean; // 重大問題報告の有無
     readinessLevel: "not_ready" | "review_needed" | "ready";
   }
   ```
2. メトリクス取得APIを設計する:
   - `getPublishReadiness(skillId: string): Promise<PublishReadinessMetrics>`
   - `getSkillHealthReport(skillId: string): Promise<SkillHealthReport>`
3. Task08 との契約境界を明確にする（このタスクはデータ提供まで、判断ロジックはTask08の責務）

**期待される成果物**:

- 公開メトリクスインターフェース設計書（型定義、API仕様、契約境界）

---

### タスク5: 自動収集・手動フィードバックの役割分担設計

**目的**: Phase 1 で定義した自動/手動の境界に基づき、データフローとUI入力点を設計する。

**実行手順**:

1. 自動収集パイプラインを設計する:
   - Main Process: 実行結果をイベントとして記録
   - Store: Zustand の lifecycleHistorySlice で管理
   - 永続化: SQLite へバッチ保存
2. 手動フィードバックUIの入力点を設計する:
   - PostExecutionActionBar: 実行直後の評価入力（星レーティング + 一言コメント）
   - SkillDetailPanel: スキル詳細画面からのフィードバック
   - HistorySearchView: 履歴画面からの過去実行に対するフィードバック
3. データフロー図（Renderer → IPC → Main → SQLite → 集約ビュー → UI）を作成する

**期待される成果物**:

- データフロー設計書（自動収集パイプライン、手動入力UI、データフロー図）

---

## 参照資料

| 参照資料                                             | パス                                                                                                        | 内容                    |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------- |
| Phase 1 成果物                                       | `outputs/phase-1/`                                                                                          | 要件定義の全成果物      |
| ui-history-search-view                               | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`                               | 履歴検索UIの仕様        |
| ui-ux-history-panel                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`                                  | 履歴パネルUI仕様        |
| architecture-chat-history                            | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`                            | 履歴基盤アーキテクチャ  |
| arch-state-management                                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                | Zustand Store 設計      |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Task05 利用導線統合正本 |
| workflow-skill-lifecycle-evaluation-scoring-gate     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | Task04 評価依存契約     |
| task-workflow                                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | 完了/未タスク台帳       |
| lessons-learned-current                              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                              | 最新教訓                |
| task-05 phase-2                                      | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/phase-2-design.md`       | Task05 設計書           |
| ライフサイクルイベント一覧                           | `outputs/phase-1/lifecycle-event-catalog.md`                                                                | Phase 1 成果物          |
| フィードバック収集要件                               | `outputs/phase-1/feedback-collection-spec.md`                                                               | Phase 1 成果物          |
| Task05連携要件                                       | `outputs/phase-1/task05-integration-contract.md`                                                            | Phase 1 成果物          |
| Task08メトリクス定義                                 | `outputs/phase-1/task08-metrics-definition.md`                                                              | Phase 1 成果物          |
| 受入基準検証マトリクス                               | `outputs/phase-1/acceptance-criteria-matrix.md`                                                             | Phase 1 成果物          |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | スキル管理インターフェース |
| interfaces-agent-sdk-history         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`         | SDK履歴インターフェース    |
| arch-state-management-details        | `.claude/skills/aiworkflow-requirements/references/arch-state-management-details.md`        | Store スライス詳細設計     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターン集             |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 完了/未タスク台帳          |
| lessons-learned-current              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`              | 最新教訓                   |

---

## 成果物

| 成果物                               | パス                                                  | 内容                                     |
| ------------------------------------ | ----------------------------------------------------- | ---------------------------------------- |
| イベントモデル設計書                 | `outputs/phase-2/event-model-design.md`               | 型定義、metadata、因果関係ルール         |
| 集約ビュー設計書                     | `outputs/phase-2/aggregate-view-design.md`            | 集約型、計算ロジック、更新タイミング     |
| フィードバック還流設計書             | `outputs/phase-2/feedback-loop-design.md`             | フィードバック型、還流ルール、優先度計算 |
| 公開メトリクスインターフェース設計書 | `outputs/phase-2/publish-metrics-interface-design.md` | Task08 向け型定義、API仕様               |
| データフロー設計書                   | `outputs/phase-2/data-flow-design.md`                 | 自動収集、手動入力、データフロー図       |

---

## 統合テスト連携

- Phase 3（設計レビュー）で本Phase の全設計書をレビュー対象とする
- Phase 4（テスト作成）で本Phase の型定義とAPI仕様をテストケース設計の基盤とする
- Phase 5（実装）で本Phase の設計を実装仕様として使用する

---

## 多角的チェック観点（AIが判断）

- 型定義が `packages/shared` で共有可能か確認する
- Zustand Store のスライス設計が P31/P48 対策を満たしているか確認する
- IPC チャンネル名が `IPC_CHANNELS` 定数で管理されるか確認する
- イベントモデルが既存の `architecture-chat-history` と整合しているか確認する

---

## 完了条件

- [ ] `SkillLifecycleEvent` 型が全5カテゴリのイベントをカバーしている
- [ ] 集約ビューの計算ロジック（成功率、トレンド、推薦スコア）が数式で定義されている
- [ ] フィードバック→改善アクションの還流ルールが条件付きで定義されている
- [ ] Task08 向け `PublishReadinessMetrics` インターフェースが定義されている
- [ ] データフロー図（Renderer→IPC→Main→SQLite→集約→UI）が作成されている
- [ ] 全成果物が `outputs/phase-2/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビュー）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-3-design-review.md`
