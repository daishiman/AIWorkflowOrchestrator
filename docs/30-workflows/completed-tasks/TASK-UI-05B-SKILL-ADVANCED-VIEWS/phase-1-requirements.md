# Phase 1: 要件定義 — TASK-UI-05B-SKILL-ADVANCED-VIEWS

## メタ情報

| 項目            | 値                                                                                     |
| --------------- | -------------------------------------------------------------------------------------- |
| タスク ID       | TASK-UI-05B-SKILL-ADVANCED-VIEWS                                                       |
| Phase           | 1（要件定義）                                                                          |
| ステータス      | pending                                                                                |
| 依存タスク      | TASK-UI-00（デザイン基盤）, TASK-UI-01（アーキテクチャ）, TASK-UI-05（スキルセンター） |
| バックエンド    | TASK-9D, TASK-9G, TASK-9H, TASK-9J                                                     |
| 前 Phase 成果物 | なし（初回 Phase）                                                                     |

## 目的

タスク元仕様書（task-031b-ui-05b-skill-advanced-views.md）を分析し、4つの独立ビュー（3A: SkillChainBuilder, 3B: ScheduleManager, 3C: DebugPanel, 3D: AnalyticsDashboard）の機能要件・非機能要件・受け入れ基準を定義する。バックエンド IPC チャネル（TASK-9D/9G/9H/9J）との対応関係を明確にし、既存コンポーネント（TASK-UI-05 SkillCenterView）との統合ポイントを確認する。

## 実行タスク

- 要件分解: 元タスク仕様と4ビュー要件を FR/NFR に分解する
- 受け入れ基準化: Phase 4 テストへ接続できる検証条件へ変換する
- IPC契約抽出: TASK-9D/9G/9H/9J の IPC チャネルと型契約を抽出する
- UI要件抽出: Apple HIG/WCAG/レスポンシブ要件を抽出する
- 統合境界定義: SkillCenterView 連携と Store/Preload 境界を定義する
- 仕様突合準備: Phase 2 設計へ受け渡す依存情報を固定化する

## 参照資料

| 資料                     | パス / タスク ID                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| 元タスク仕様書           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-031b-ui-05b-skill-advanced-views.md` |
| デザイン基盤             | TASK-UI-00 `00-ui-design-foundation.md`                                                                                              |
| UI アーキテクチャ        | TASK-UI-01 `01-store-ipc-architecture.md`                                                                                            |
| スキルセンター画面       | TASK-UI-05 `05-skill-center-view.md`                                                                                                 |
| チェーンバックエンド     | TASK-9D `task-023e-task-9d-skill-chain.md`                                                                                           |
| スケジュールバックエンド | TASK-9G `task-023a-task-9g-skill-schedule.md`                                                                                        |
| デバッグバックエンド     | TASK-9H `task-023b-task-9h-skill-debug.md`                                                                                           |
| 分析バックエンド         | TASK-9J `task-023d-task-9j-skill-analytics.md`                                                                                       |
| 仕様抽出正本             | `spec-extraction-matrix.md`                                                                                                          |
| aiworkflow UI基準        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                              |
| aiworkflow Feature仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                      |
| aiworkflow IPC契約       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                                 |
| aiworkflow 型契約        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                                    |
| aiworkflow セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                                         |
| aiworkflow 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                         |
| aiworkflow サービス契約  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                                                        |
| aiworkflow 全体構成      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                                         |
| aiworkflow 品質要件      | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                          |
| aiworkflow タスク台帳    | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                 |
| Apple HIG カラー         | `01-architecture.md` カラーパレットセクション                                                                                        |
| 既知の落とし穴           | `06-known-pitfalls.md`（P5, P13, P31, P39, P40, P47）                                                                                |

## 実行手順

### Task 1: 元タスク仕様書分析

元仕様書（task-031b-ui-05b-skill-advanced-views.md）の全セクションを分析し、以下を抽出する:

- 共通パターン（HIG レイアウト、EmptyState、Loading、IPC 連携）
- 4ビューそれぞれの画面構成図・コンポーネント構成・マイクロインタラクション
- レスポンシブ設計仕様（3ブレークポイント）
- 完了条件（セクション6）

### Task 2: 機能要件抽出

#### 3A: SkillChainBuilder 機能要件

| ID       | 機能要件                                                                                           |
| -------- | -------------------------------------------------------------------------------------------------- |
| FR-3A-01 | チェーン一覧をカード形式（ChainCardGrid）で表示する                                                |
| FR-3A-02 | 新規チェーンを作成ダイアログ（CreateChainDialog）で作成する                                        |
| FR-3A-03 | チェーン内のステップカード（StepCard）を追加・削除・並び替えする                                   |
| FR-3A-04 | ステップの入力マッピングを4種類（literal/variable/template/previousOutput）設定する                |
| FR-3A-05 | ステップの条件設定を4種類（always/ifVariable/ifPreviousSuccess/expression）設定する                |
| FR-3A-06 | ステップのタイムアウト・リトライ回数を設定する                                                     |
| FR-3A-07 | チェーン定義を保存する（`skill:chain:save` IPC）                                                   |
| FR-3A-08 | チェーン定義を読み込む（`skill:chain:get` IPC）                                                    |
| FR-3A-09 | チェーンを実行する（`skill:chain:execute` IPC）                                                    |
| FR-3A-10 | チェーン実行時にステップ進行状態をビジュアル表示する（ボーダーパルス、チェックマーク、エラー表示） |
| FR-3A-11 | チェーンを削除する（`skill:chain:delete` IPC）                                                     |
| FR-3A-12 | エラーハンドリング設定（stop/skip/retry）を選択する                                                |

#### 3B: ScheduleManager 機能要件

| ID       | 機能要件                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| FR-3B-01 | スケジュール一覧をテーブル形式（ScheduleTable）で表示する                         |
| FR-3B-02 | 新規スケジュールをダイアログ（ScheduleDialog）で作成する                          |
| FR-3B-03 | CronEditor で Cron 式を GUI で設定する                                            |
| FR-3B-04 | Cron プリセット（毎日9:00/平日9:00/毎時/毎週月曜9:00）を選択する                  |
| FR-3B-05 | カスタム Cron 式を分/時/日/月/曜日のセレクトボックスで入力する                    |
| FR-3B-06 | ON/OFF トグルでスケジュールの有効/無効を切り替える（`skill:schedule:toggle` IPC） |
| FR-3B-07 | 次回実行時刻を計算して表示する                                                    |
| FR-3B-08 | スケジュールの実行履歴をリスト（RunHistoryList）で表示する                        |
| FR-3B-09 | スケジュールを編集する（`skill:schedule:update` IPC）                             |
| FR-3B-10 | スケジュールを削除する（`skill:schedule:delete` IPC）                             |
| FR-3B-11 | テーブル行選択時にスケジュール詳細パネル（ScheduleDetailPanel）を展開する         |

#### 3C: DebugPanel 機能要件

| ID       | 機能要件                                                                        |
| -------- | ------------------------------------------------------------------------------- |
| FR-3C-01 | デバッグセッションを開始する（`skill:debug:start` IPC + StartDebugDialog）      |
| FR-3C-02 | デバッグセッションを停止する（`skill:debug:command` IPC, command: stop）        |
| FR-3C-03 | コールスタックをツリー形式（CallStackView）で表示する                           |
| FR-3C-04 | 変数ウォッチ（VariableWatch）で値をリアルタイム更新する                         |
| FR-3C-05 | ブレークポイントを追加・削除・有効/無効トグルする（BreakpointEditor）           |
| FR-3C-06 | ステップ実行コマンド（continue/stepOver/stepInto/stepOut/pause/stop）を実行する |
| FR-3C-07 | 出力コンソール（OutputConsole）にログを表示する                                 |
| FR-3C-08 | ステップ履歴（StepHistoryList）を表示する                                       |
| FR-3C-09 | `skill:debug:event` をリアルタイムで購読し、UI を更新する（safeOn パターン）    |
| FR-3C-10 | キーボードショートカットでデバッグ操作する（F5/F6/F10/F11/Shift+F5/Shift+F11）  |
| FR-3C-11 | 式を評価する（`skill:debug:evaluate` IPC）                                      |
| FR-3C-12 | 変数を検査する（`skill:debug:inspect` IPC）                                     |

#### 3D: AnalyticsDashboard 機能要件

| ID       | 機能要件                                                                          |
| -------- | --------------------------------------------------------------------------------- |
| FR-3D-01 | サマリーカード（SummaryCards）で総実行回数・成功率・平均実行時間を表示する        |
| FR-3D-02 | サマリー値のカウントアップアニメーション（0→実際値、800ms ease-out）を実行する    |
| FR-3D-03 | 使用トレンドチャート（UsageChart）を recharts で描画する                          |
| FR-3D-04 | トレンドチャートの初期表示で折れ線の左→右ドローアニメーション（1000ms）を実行する |
| FR-3D-05 | ツール使用ランキング（SkillRanking）を水平バーチャートで表示する                  |
| FR-3D-06 | ランキングバーの初期表示で幅0%→実際値%のアニメーション（600ms）を実行する         |
| FR-3D-07 | 期間フィルター（PeriodSelector）で過去7日/30日/90日を切り替える                   |
| FR-3D-08 | CSV/JSON エクスポート（ExportButton）を実行する（`skill:analytics:export` IPC）   |
| FR-3D-09 | トレンドデータの粒度（hour/day/week/month）を選択する                             |
| FR-3D-10 | チャートツールチップ（ChartTooltip）で実行回数・エラー数・平均時間を表示する      |

### Task 3: 非機能要件定義

#### パフォーマンス要件

| ID      | 要件                                       | 基準値     |
| ------- | ------------------------------------------ | ---------- |
| NFR-P01 | 各ビューの初期レンダリング時間             | 200ms 以下 |
| NFR-P02 | IPC 呼び出し後の UI 更新遅延               | 100ms 以下 |
| NFR-P03 | チャート描画完了時間（AnalyticsDashboard） | 500ms 以下 |
| NFR-P04 | DebugPanel のイベント購読更新遅延          | 50ms 以下  |
| NFR-P05 | チェーン一覧のカード表示数上限             | 100件      |
| NFR-P06 | スケジュール一覧のテーブル行数上限         | 200件      |
| NFR-P07 | トレンドチャートのデータポイント数上限     | 365件      |
| NFR-P08 | SkillRanking の表示件数上限                | 50件       |

#### アクセシビリティ要件（WCAG 2.1 AA）

| ID      | 要件                                                               |
| ------- | ------------------------------------------------------------------ |
| NFR-A01 | 通常テキストのコントラスト比 4.5:1 以上                            |
| NFR-A02 | 大テキスト・UI部品のコントラスト比 3:1 以上                        |
| NFR-A03 | 全操作がキーボードのみで実行可能                                   |
| NFR-A04 | ARIA ラベルが全インタラクティブ要素に付与されている                |
| NFR-A05 | DebugControls のショートカットキーが Tooltip で表示される          |
| NFR-A06 | チャート（recharts）に `aria-label` でデータの要約が付与されている |
| NFR-A07 | 色だけで情報を伝えない（アイコン・テキストを併用）                 |
| NFR-A08 | フォーカス可視化（focus-visible ring）が全フォーカス可能要素に適用 |

#### レスポンシブ要件

| ID      | ブレークポイント | レイアウト                        |
| ------- | ---------------- | --------------------------------- |
| NFR-R01 | >= 1024px        | 左右分割（メイン + サイド 320px） |
| NFR-R02 | 768px〜1023px    | 上下分割（折りたたみパネル）      |
| NFR-R03 | < 768px          | 単一カラム + ボトムシート（85vh） |

### Task 4: 受け入れ基準定義

受け入れ基準は `outputs/phase-1/acceptance-criteria.md` に詳細チェックリスト形式で記載する。元仕様書セクション6の完了条件を基に、各項目を検証可能な形式に変換する。

### Task 5: バックエンド依存関係の整理

#### IPC チャネル対応表

| ビュー          | IPC チャネル                    | メソッド   | バックエンド型定義        |
| --------------- | ------------------------------- | ---------- | ------------------------- |
| ChainBuilder    | `skill:chain:list`              | safeInvoke | `SkillChainDefinition[]`  |
| ChainBuilder    | `skill:chain:get`               | safeInvoke | `SkillChainDefinition`    |
| ChainBuilder    | `skill:chain:save`              | safeInvoke | `SkillChainDefinition`    |
| ChainBuilder    | `skill:chain:delete`            | safeInvoke | `{ success: boolean }`    |
| ChainBuilder    | `skill:chain:execute`           | safeInvoke | `SkillChainResult`        |
| ScheduleManager | `skill:schedule:list`           | safeInvoke | `ScheduledSkill[]`        |
| ScheduleManager | `skill:schedule:add`            | safeInvoke | `ScheduledSkill`          |
| ScheduleManager | `skill:schedule:update`         | safeInvoke | `ScheduledSkill`          |
| ScheduleManager | `skill:schedule:delete`         | safeInvoke | `{ success: boolean }`    |
| ScheduleManager | `skill:schedule:toggle`         | safeInvoke | `ScheduledSkill`          |
| DebugPanel      | `skill:debug:start`             | safeInvoke | `DebugSession`            |
| DebugPanel      | `skill:debug:command`           | safeInvoke | `DebugSession`            |
| DebugPanel      | `skill:debug:breakpoint:add`    | safeInvoke | `Breakpoint`              |
| DebugPanel      | `skill:debug:breakpoint:remove` | safeInvoke | `{ success: boolean }`    |
| DebugPanel      | `skill:debug:inspect`           | safeInvoke | `Record<string, unknown>` |
| DebugPanel      | `skill:debug:evaluate`          | safeInvoke | `{ result: unknown }`     |
| DebugPanel      | `skill:debug:event`             | safeOn     | `DebugEvent`（購読）      |
| Analytics       | `skill:analytics:record`        | safeInvoke | `SkillUsageEvent`         |
| Analytics       | `skill:analytics:statistics`    | safeInvoke | `SkillStatistics`         |
| Analytics       | `skill:analytics:summary`       | safeInvoke | `AnalyticsSummary`        |
| Analytics       | `skill:analytics:trend`         | safeInvoke | `UsageTrend`              |
| Analytics       | `skill:analytics:export`        | safeInvoke | `Blob / string`           |

#### バックエンド主要型定義

**TASK-9D（SkillChain）:**

- `SkillChainDefinition`: チェーン定義（id, name, description, steps, errorHandling, metadata）
- `SkillChainStep`: ステップ定義（id, skillName, inputs, outputs, condition, timeout, retryCount）
- `InputMapping`: 入力マッピング（type: literal/variable/template/previousOutput, value）
- `OutputMapping`: 出力マッピング（name, path）
- `SkillChainCondition`: 条件（type: always/ifVariable/ifPreviousSuccess/expression, config）
- `SkillChainResult`: 実行結果（chainId, steps, status, duration, outputs, errors）

**TASK-9G（SkillSchedule）:**

- `ScheduledSkill`: スケジュール済みスキル（id, skillName, schedule, isEnabled, lastRun, nextRun, prompt）
- `SkillSchedule`: スケジュール定義（cron, timezone, description）
- `NotificationSettings`: 通知設定（onSuccess, onFailure, channels）
- `ScheduledRunResult`: 実行結果（id, scheduledSkillId, startTime, endTime, status, output, error）

**TASK-9H（SkillDebug）:**

- `DebugSession`: セッション（id, skillName, status, startTime, steps, callStack, breakpoints）
- `Breakpoint`: ブレークポイント（id, type, target, isEnabled, hitCount）
- `DebugStep`: ステップ（index, type, toolName, status, duration, input, output）
- `CallStackEntry`: コールスタック（id, name, type, status, children）
- `DebugEvent`: イベント（type: step/breakpoint-hit/variable-changed/session-ended, payload）
- `DebugCommand`: コマンド（type: continue/stepOver/stepInto/stepOut/pause/stop）

**TASK-9J（SkillAnalytics）:**

- `SkillUsageEvent`: 使用イベント（id, skillName, timestamp, duration, status, toolsUsed）
- `SkillStatistics`: 統計（skillName, totalRuns, successRate, avgDuration, toolUsageStats）
- `ToolUsageStat`: ツール使用統計（toolName, count, avgDuration, successRate）
- `AnalyticsPeriod`: 期間（start, end, granularity: hour/day/week/month）
- `UsageTrend`: トレンド（period, dataPoints, summary）
- `TrendDataPoint`: データポイント（timestamp, totalRuns, successCount, failureCount, avgDuration）

### Task 6: 既存コンポーネントとの統合ポイント

| 統合ポイント     | 既存コンポーネント                       | 統合方法                                           |
| ---------------- | ---------------------------------------- | -------------------------------------------------- |
| 状態管理         | `agentSlice.ts`（Zustand Store）         | 個別セレクタで必要フィールドのみ取得（P31対策）    |
| IPC チャネル定義 | `preload/channels.ts`                    | IPC_CHANNELS 定数に新規チャネルを追加              |
| Preload API      | `preload/skill-api.ts`                   | 各ビュー用の safeInvoke/safeOn メソッドを追加      |
| 共有型定義       | `packages/shared/src/types/skill-*.ts`   | 新規型定義ファイルを追加                           |
| ナビゲーション   | SkillCenterView のタブまたはルーティング | SkillCenterView から各高度ビューへの遷移リンク     |
| EmptyState       | 既存 EmptyState コンポーネント           | mood / メッセージ / アクションボタンのカスタマイズ |
| アイコン         | lucide-react                             | 全ビューで lucide-react アイコンのみ使用           |

## 統合テスト連携【必須】

| 接続カテゴリ               | 連携内容                                                                                 | 検証出力先                                 |
| -------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1 → Phase 4          | FR/NFR をテストケース ID に対応付ける                                                    | `outputs/phase-4/test-specification.md`    |
| Phase 1 → IPC契約テスト    | `skill:schedule:*`, `skill:debug:*`, `skill:analytics:*` の引数/戻り値契約をテスト化する | `outputs/phase-4/test-utilities-design.md` |
| Phase 1 → a11yテスト       | WCAG/キーボード操作要件を a11y テスト項目へ変換する                                      | `outputs/phase-6/test-expansion-report.md` |
| Phase 1 → レスポンシブ検証 | 3ブレークポイント要件を手動テスト項目へ変換する                                          | `outputs/phase-11/manual-test-result.md`   |

## 成果物

| 成果物       | パス                                         | 内容                                             |
| ------------ | -------------------------------------------- | ------------------------------------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 全機能要件・非機能要件の一覧                     |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 各ビューの完了条件チェックリスト                 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | スコープ内外・バックエンド依存関係・統合ポイント |

## 完了条件

- [ ] 4ビュー（3A〜3D）の機能要件が全て列挙されている（FR-3A: 12件, FR-3B: 11件, FR-3C: 12件, FR-3D: 10件）
- [ ] 各ビューの受け入れ基準がチェックリスト形式で記載されている
- [ ] バックエンド IPC チャネル（22チャネル）との対応が明確に記載されている
- [ ] バックエンド型定義（6+4+6+6=22型）との対応が記載されている
- [ ] 非機能要件（パフォーマンス8項目、アクセシビリティ8項目、レスポンシブ3項目）が定量的に記載されている
- [ ] 既存コンポーネント（agentSlice、channels.ts、skill-api.ts）との統合ポイントが7項目記載されている
- [ ] 3つの成果物ファイルが全て作成されている

## 次 Phase

Phase 2（設計）へ進む。Phase 1 の要件定義書・受け入れ基準・スコープ定義を入力として、コンポーネントアーキテクチャ・状態管理・IPC インターフェース・レスポンシブ設計を行う。
