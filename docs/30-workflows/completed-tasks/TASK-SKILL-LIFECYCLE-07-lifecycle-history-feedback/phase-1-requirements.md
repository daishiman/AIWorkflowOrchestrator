# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 1                                           |
| Phase名    | 要件定義                                    |
| 前提Phase  | なし（初回Phase）                           |
| 後続Phase  | Phase 2（設計）                             |
| ステータス | 未実施                                      |
| 作成日     | 2026-03-16                                  |
| 機能名     | ライフサイクル履歴・フィードバック統合      |
| タスクID   | TASK-SKILL-LIFECYCLE-07                     |
| タスク種別 | 設計                                        |
| 依存タスク | TASK-SKILL-LIFECYCLE-04（完了）, 05（完了） |

---

## 目的

スキルのライフサイクルイベント（作成・評価・実行・改善・再利用）を追跡し、改善優先度の判断と再利用推薦に使えるフィードバック要件を定義する。Task04（採点・評価ゲート）の品質スコアと Task05（利用導線）の CTA 制御を横断参照できる履歴モデルの要件を固定する。

## 背景

現在のスキルライフサイクルでは、作成・評価・実行の各イベントが個別に記録されているが、横断的な履歴ビューが存在しない。ユーザーは「どのスキルがよく使われているか」「改善後にスコアがどう変化したか」「再利用すべきスキルはどれか」を判断する材料が不足している。Task08（公開・互換性）の公開判断にも観測指標が必要であり、本タスクでその基盤を整備する。

---

## aiworkflow-requirements 仕様抽出トレース

| ステップ | 起点                                                                | 抽出結果                                                                                                                                                          |
| -------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`    | 「設計仕様（Skill Lifecycle 作成済みスキル利用導線 / CTA制御マトリクス）」「UI実装（HistorySearch timeline / あなたの記録）」「会話履歴機能」を一次候補として固定 |
| 2        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` | 「Skill Lifecycle 評価・採点ゲート」「作成済みスキル利用導線」の分割検索クエリを採用し、依存契約と導線仕様を分離抽出                                              |
| 3        | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`       | `workflow-skill-lifecycle-*` / `interfaces-agent-sdk-*` / `ui-history-*` / `task-workflow*` / `lessons-learned-current.md` の実体見出しを確認                     |
| 4        | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`      | `lifecycle` / `history` / `feedback` / `scoring-gate` / `created-skill-usage` の関連キーを逆引きし、参照漏れ候補を補完確認                                        |

### 今回固定する必須仕様セット

| 関心ごと       | 仕様書                                                                                                                                                                  | 抽出理由                                                  |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Task04依存契約 | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`                                                                 | `ScoringGate` / `evaluatePrompt` の依存境界を固定するため |
| Task05利用導線 | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                                                             | created skill usage journey の3シナリオ導線を引き継ぐため |
| 履歴UI         | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`                                                                                           | HistorySearch timeline 要件を継承するため                 |
| 履歴UI索引     | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`                                                                                              | 履歴UI family の参照起点を固定するため                    |
| 履歴基盤       | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`                                                                                        | 履歴データ層の責務境界を合わせるため                      |
| 型/IPC契約     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` / `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` | 型追加時の更新先を先に固定するため                        |
| 状態管理       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                            | lifecycle state ownership を整合させるため                |
| 台帳/教訓      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                   | Phase 12 同期先を確定するため                             |

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: ライフサイクルイベント一覧の定義

**目的**: スキルの全ライフサイクルイベントを網羅的に列挙し、各イベントの記録対象データを定義する。

**実行手順**:

1. 以下のイベントカテゴリごとにイベント種別を列挙する:
   - 作成イベント: `skill:created`, `skill:draft_saved`, `skill:template_applied`
   - 評価イベント: `skill:evaluated`, `skill:score_updated`, `skill:gate_passed`, `skill:gate_failed`
   - 実行イベント: `skill:executed`, `skill:execution_succeeded`, `skill:execution_failed`, `skill:execution_timeout`
   - 改善イベント: `skill:improved`, `skill:version_bumped`, `skill:feedback_applied`
   - 再利用イベント: `skill:reused`, `skill:recommended`, `skill:imported`, `skill:forked`
2. 各イベントに対して記録すべきメタデータ（タイムスタンプ、ユーザーID、スキルID、バージョン、コンテキスト情報）を定義する
3. イベントの発生元（Main Process / Renderer / CLI）を明記する

**期待される成果物**:

- ライフサイクルイベント一覧表（イベント名、カテゴリ、記録データ、発生元）

---

### タスク2: フィードバック収集要件の定義

**目的**: 成功/失敗、品質変化、利用頻度、再実行理由の収集要件を定義する。

**実行手順**:

1. 自動収集対象を定義する:
   - 実行結果（成功/失敗/タイムアウト）
   - 実行時間（開始〜完了の duration）
   - スコア変化（改善前後の delta）
   - 利用頻度（日次/週次/月次の集計）
2. 手動フィードバック入力を定義する:
   - ユーザー評価（5段階レーティング）
   - テキストフィードバック（自由記述、最大500文字）
   - 改善提案（構造化フォーム: 対象箇所、提案内容、優先度）
3. 自動収集と手動入力の境界を明確にする（自動: 実行メトリクス / 手動: 主観評価）

**期待される成果物**:

- フィードバック収集要件定義書（自動/手動の分類表、データスキーマ案）

---

### タスク3: Task05 再利用導線との連携要件定義

**目的**: Task05 で定義された CTA 制御マトリクスと再利用導線に必要な履歴表示要件を定義する。

**実行手順**:

1. Task05 の Phase 2 設計書から以下を確認する:
   - ScoreGateBadge の表示に使うスコア履歴
   - PostExecutionActionBar の導線分岐に使う実行履歴
   - SkillManagementPanel の「最近使ったスキル」表示
2. 「最近使ったスキル」リストの要件を定義する:
   - 表示件数: 最新10件
   - 表示情報: スキル名、最終実行日時、成功率、最新スコア
   - ソート順: 最終実行日時の降順
3. 「スコア推移グラフ」の要件を定義する:
   - X軸: バージョン or 時間
   - Y軸: 評価スコア（0-100）
   - データポイント: 各評価イベント時点のスコア

**期待される成果物**:

- Task05 連携要件書（履歴表示仕様、データフロー図）

---

### タスク4: Task08 公開判断メトリクス要件定義

**目的**: Task08（公開・互換性）が使う公開判断の観測指標を定義する。

**実行手順**:

1. 公開可否判断に必要な最小指標セットを定義する:
   - 品質スコア: 最新の評価スコアが閾値以上（閾値は Task08 で決定）
   - 安定性: 直近N回の実行成功率が閾値以上
   - 利用実績: 最低実行回数を満たしている
   - フィードバック: 重大な問題報告がない
2. 各指標の計算方法とデータソースを定義する
3. Task08 への引継ぎ契約（インターフェース）を定義する

**期待される成果物**:

- 公開判断メトリクス定義書（指標名、計算方法、データソース、閾値の決定権限）

---

### タスク5: 受入基準の検証マトリクス作成

**目的**: AC-1〜AC-4 の各受入基準に対して、検証方法と検証データを定義する。

**実行手順**:

1. 以下の受入基準ごとに検証方法を定義する:

| AC   | 基準                                                   | 検証方法                                         |
| ---- | ------------------------------------------------------ | ------------------------------------------------ |
| AC-1 | 作成/評価/実行/改善の履歴イベントが定義されている      | タスク1 のイベント一覧で全カテゴリをカバー       |
| AC-2 | 再利用や推薦に使うフィードバックデータが定義されている | タスク2 の収集要件でデータスキーマが存在         |
| AC-3 | Task05 の再利用導線と連動している                      | タスク3 の連携要件でデータフロー図が存在         |
| AC-4 | Task08 の公開判断材料へ接続できる                      | タスク4 のメトリクス定義でインターフェースが存在 |

**期待される成果物**:

- 受入基準検証マトリクス

---

## 参照資料

| 参照資料                                             | パス                                                                                                                      | 内容                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| ui-history-search-view                               | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`                                             | 履歴検索UIの仕様             |
| ui-ux-history-panel                                  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`                                                | 履歴パネルUI仕様             |
| architecture-chat-history                            | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md`                                          | 履歴基盤アーキテクチャ       |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`               | Task05 利用導線統合正本      |
| task-04 index                                        | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/index.md`                              | 採点・評価ゲート（完了済み） |
| task-05 index                                        | `docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                              | 作成済みスキル利用導線       |
| task-08 index                                        | `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/index.md` | スキル公開・互換性（後続）   |
| arch-state-management                                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                              | Zustand Store 設計           |
| task-workflow                                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                      | 完了/未タスク台帳            |
| lessons-learned-current                              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                                            | 最新教訓                     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                             | パス                                                                                                        | 内容                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| interfaces-agent-sdk-skill                           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                           | スキル管理インターフェース       |
| interfaces-agent-sdk-history                         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`                         | SDK履歴インターフェース          |
| workflow-skill-lifecycle-evaluation                  | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | 評価・採点ゲート統合ワークフロー |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Task05 利用導線統合正本          |
| task-workflow                                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | 完了/未タスク台帳                |
| lessons-learned-current                              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                              | 最新教訓                         |

---

## 成果物

| 成果物                     | パス                                             | 内容                                       |
| -------------------------- | ------------------------------------------------ | ------------------------------------------ |
| ライフサイクルイベント一覧 | `outputs/phase-1/lifecycle-event-catalog.md`     | 全イベントの定義（名前、カテゴリ、データ） |
| フィードバック収集要件     | `outputs/phase-1/feedback-collection-spec.md`    | 自動/手動フィードバックの収集仕様          |
| Task05連携要件             | `outputs/phase-1/task05-integration-contract.md` | 再利用導線との履歴データ連携仕様           |
| Task08メトリクス定義       | `outputs/phase-1/task08-metrics-definition.md`   | 公開判断用の観測指標定義                   |
| 受入基準検証マトリクス     | `outputs/phase-1/acceptance-criteria-matrix.md`  | AC-1〜AC-4 の検証方法と検証データ          |

---

## 統合テスト連携

- Phase 2 の設計で本Phase の成果物を入力として使用する
- ライフサイクルイベント一覧は Phase 4（テスト作成）のテストケース設計の基盤となる
- Task05/Task08 連携要件は Phase 10（最終レビュー）で整合性を再検証する

---

## 完了条件

- [ ] ライフサイクルイベント一覧が全5カテゴリ（作成/評価/実行/改善/再利用）をカバーしている
- [ ] 各イベントの記録データ（メタデータ）が定義されている
- [ ] 自動収集と手動フィードバックの境界が明確に定義されている
- [ ] Task05 の CTA 制御マトリクスに必要な履歴データが特定されている
- [ ] Task08 の公開判断に必要な最小指標セットが定義されている
- [ ] 受入基準 AC-1〜AC-4 の検証方法が定義されている
- [ ] 全成果物が `outputs/phase-1/` に生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（初回Phase）。ただし TASK-SKILL-LIFECYCLE-04, 05 が完了していること
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-2-design.md`
