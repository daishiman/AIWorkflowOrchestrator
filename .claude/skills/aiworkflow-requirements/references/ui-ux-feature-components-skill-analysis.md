# UIフィーチャーコンポーネント参照（SkillAnalysisView・SkillCreateWizard） / skill-analysis specification
> 親ファイル: [ui-ux-feature-components-reference.md](ui-ux-feature-components-reference.md)

## SkillAnalysisView UI（TASK-10A-B / completed）

TASK-10A-B で `SkillAnalysisView`（分析結果の可視化と改善操作UI）を実装し、Phase 1-12 を完了。
`ScoreDisplay`（スコア表示）、`SuggestionList`（改善提案選択）、`RiskPanel`（リスク表示）を `useSkillAnalysis` で統合する構成を採用した。

### コンポーネント構成

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | SkillAnalysisView | 画面統合、分析実行、改善アクション、エラー/ローディング表示 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| molecule | ScoreDisplay | 総合スコア/カテゴリ別スコアの表示 | `.../components/skill/ScoreDisplay.tsx` |
| molecule | SuggestionList | 優先度別提案リスト、チェック選択、auto-fixable表示 | `.../components/skill/SuggestionList.tsx` |
| molecule | RiskPanel | リスクレベル別表示（critical/high/medium/low） | `.../components/skill/RiskPanel.tsx` |
| hook | useSkillAnalysis | 分析API呼び出し、選択状態、改善適用、再分析制御 | `.../components/skill/hooks/useSkillAnalysis.ts` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-analysis-view/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | 初期実装（TASK-10A-B）はローカル状態 + `useSkillAnalysis` 集約。現行は Store 駆動（`currentAnalysis` / `previousAnalysis` / `isAnalyzing` / `isImproving`）を併用 |
| IPC利用 | 初期実装は direct IPC。現行は `analyzeSkill` / `applySkillImprovements` / `autoImproveSkill` を Store action 経由で実行（`evaluatePrompt` は follow-up 対象） |
| エラー処理 | `role=\"alert\"` のUI表示 + 再試行導線 |
| 設計方針 | UI表示とビジネスロジックを hook 分離（Refactor済み） |

### 再監査追補（TASK-SKILL-LIFECYCLE-04 / 2026-03-14）

| 観点 | 反映内容 |
| --- | --- |
| Δスコア表示連携 | `SkillAnalysisView` が `useSkillAnalysis` の `previousAnalysis` を `ScoreDisplay` に渡す経路へ修正し、`ScoreDeltaBadge` が実画面で表示されることを確認 |
| Store snapshot | `agentSlice.applySkillImprovements` で改善適用前 `currentAnalysis` を `previousAnalysis` に保存し、再分析後の比較基準を固定 |
| 画面証跡 | `docs/30-workflows/completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-11/screenshots/` に TC-11-01〜04 を保存（dark/light/mobile + Δ表示） |
| テスト/品質 | `scoring-gate` 30件、`ScoreDisplay` 26件、`useSkillAnalysis-gate` 7件、合計 63/63 PASS + `tsc --noEmit` PASS |
| 残課題 | `TASK-FIX-EVAL-STORE-DISPATCH-001`（evaluatePrompt Store経由化）、`TASK-FIX-SCORE-DELTA-DEDUP-001`（差分計算重複解消）を backlog 管理 |
| 統合正本 | `workflow-skill-lifecycle-evaluation-scoring-gate.md` で current canonical set / artifact inventory / same-wave 同期手順を管理 |

### アクセシビリティ・デザイントークン補正（Phase 11 反映）

| 観点 | 反映内容 |
| --- | --- |
| リストラベル | `SuggestionList` の優先度別リスト / `RiskPanel` リストへ `aria-label` を追加 |
| 色トークン | `SkillAnalysisView` のボタン文字色を `text-[var(--text-inverse)]` に統一 |
| テスト補強 | `SuggestionList.test.tsx` / `RiskPanel.test.tsx` に `aria-label` 検証を追加 |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| 初期表示（分析結果） | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-01-analysis-default.png` |
| 提案選択状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-02-analysis-selection.png` |
| 改善後状態 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-03-analysis-improved.png` |
| エラー表示 | `docs/30-workflows/completed-tasks/skill-analysis-view/outputs/phase-11/screenshots/TC-04-analysis-error.png` |

### 実装時の苦戦箇所（TASK-10A-B）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| Phase 11 がコード分析ベースのまま残りやすい | UI起動制約を理由にスクリーンショット取得を省略する場合 | 専用スクリプトで 4 状態（通常/選択/改善後/エラー）を再撮影し、manual-test-result を実証跡ベースへ更新 | UIタスクのPhase 11は「実画面証跡」を完了条件に固定する |
| Phase 11 必須セクション欠落で `validate-phase-output` が落ちる | `phase-11-manual-test.md` の章立てを簡略化しすぎる場合 | 「統合テスト連携」節を追加し、Phase 12未タスク連携を明記 | 仕様書更新前にテンプレート必須節を機械検証する |
| Phase 12 で active set が stale のまま残る | 完了済みUT（001/003/008）と継続UT（002/004/005/006/007/009）を同一表で更新しない場合 | `task-workflow.md` を canonical、`unassigned-task-detection.md` を derived として current active set 6件へ再同期し、`validate-task10ab-ledger-sync` を追加 | 未タスク台帳は固定レンジでなく canonical ledger から毎回再計算する |
| React StrictMode で分析画面がローディングのまま固着する | `useEffect` cleanup で `isMountedRef=false` にしたまま再マウントし、初回 `setIsAnalyzing(true)` だけが残る場合 | `useSkillAnalysis` で mount 時に `isMountedRef.current = true` を再設定し、Phase 11 screenshot 再監査で 8 ケースを再取得した | 画面証跡再監査で perpetual loading が出たら selector ではなく Hook の mount/unmount 制御も疑い、StrictMode を含む targeted test を追加する |

### 同種課題の簡潔解決手順（5ステップ）

1. 画面証跡を先に再取得し、`outputs/phase-11/screenshots` を更新する。  
2. `manual-test-result` と `discovered-issues` を実証跡ベースに書き換える。  
3. `verify-all-specs` と `validate-phase-output` を実行し、不足セクションを埋める。  
4. 未タスク台帳（作成済みID）を再計算し、`task-workflow.md` と同期する。  
5. 苦戦箇所を `lessons-learned.md` に転記して再利用ルール化する。  

### 関連未タスク（active set）

| 未タスクID | 概要 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-002 | 改善結果トースト通知実装 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-improvement-toast-notification.md` |
| UT-TASK-10A-B-004 | Props 契約整合（`skill` vs `skillName`） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-props-contract-alignment.md` |
| UT-TASK-10A-B-005 | molecule 分割設計追補（Header/Error/Actions） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-analysis-view-molecule-separation.md` |
| UT-TASK-10A-B-006 | Phase 11 必須セクション検証ガード（統合テスト連携/完了条件） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-phase11-required-sections-validation-guard.md` |
| UT-TASK-10A-B-007 | Phase 11 画面証跡鮮度ガード（再撮影 + 更新時刻確認） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-phase11-screenshot-freshness-guard.md` |
| UT-TASK-10A-B-009 | 完了済みUT配置ポリシー統一ガード（3分類 + target監査境界） | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-b-completed-ut-placement-policy-guard.md` |

### 完了済み派生タスク

| タスクID | 状態 | タスク仕様書 |
| --- | --- | --- |
| UT-TASK-10A-B-001 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-autofixable-filter-button.md` |
| UT-TASK-10A-B-003 | 完了（2026-03-05） | `docs/30-workflows/completed-tasks/task-10a-b-improvement-result-breakdown-ui.md` |
| UT-TASK-10A-B-008 | 完了（2026-03-06） | `docs/30-workflows/completed-tasks/task-10a-b-unassigned-count-resync-guard.md` |

---

<a id="skill-create-wizard-task-10a-c"></a>

## SkillCreateWizard UI（TASK-10A-C / completed）

TASK-10A-C で `SkillCreateWizard`（説明入力→設定→生成→完了の4ステップ）を実装し、Phase 1-12 を完了。
`useWizardStep` でステップ遷移を管理し、`window.electronAPI.skill.create` を通じて Main の `skill:create` IPC と接続する。

### コンポーネント構成（current facts）

W1-par-02b 再設計により、旧設計の `ConfigureStep`（生成オプション3チェックボックス）と旧 `DescribeStep`（説明入力のみ）は廃止済み（export も除去）。現行構成は以下の通り。

| 区分 | コンポーネント / Hook | 役割 | 配置 |
| --- | --- | --- | --- |
| view-like component | SkillCreateWizard | ウィザード全体状態管理（formData/answers/smartDefaults/generationMethod/error）+ W3-seq-04 計装 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` |
| molecule | StepIndicator | ステップ進捗表示（active/completed/pending） | `.../wizard/StepIndicator.tsx` |
| molecule | SkillInfoStep | Step 0: スキル名・目的・カテゴリ入力（`SkillInfoFormData`） | `.../wizard/SkillInfoStep.tsx` |
| molecule | ConversationRoundStep | Step 1: 6問・2ページインタビューUI（Page1: Q1-Q3、Page2: Q4-Q6）<br>Q3: cron + timezone / Q5: category 依存の必須表示 | `.../wizard/ConversationRoundStep.tsx` |
| molecule | InterviewProgressBar | 質問 N/6 + `role="progressbar"` 進捗バー（常時表示） | `.../wizard/InterviewProgressBar.tsx` |
| molecule | ApplySummaryCard | 未回答問の smartDefaults 一覧 + Q5 空欄警告（external-integration 時のみ） | `.../wizard/ApplySummaryCard.tsx` |
| molecule | GenerateStep | Step 2: 生成中ローディング / エラー表示 | `.../wizard/GenerateStep.tsx` |
| molecule | CompleteStep | Step 3: 起点画面（骨格生成ヘッダー / 品質フィードバック / 3つの次アクション / 条件付き外部連携チェック）+ W3-seq-04 計装 | `.../wizard/CompleteStep.tsx` |
| hook | useWizardStep | ステップ遷移ロジック（goNext/goBack/goToStep） | `.../components/skill/hooks/useWizardStep.ts` |

**wizard/index.ts の export（current facts）**:
- `ConversationRoundStep` / `InterviewProgressBar` / `ApplySummaryCard` / `SkillInfoStep` を export
- `ConfigureStep` / `WizardOptions` は削除済み（export なし）

**shared contracts（`packages/shared/src/types/skillCreator.ts` の既存定義を consumer として利用）**:
- `SkillCategory` / `SkillInfoFormData` / `ConversationAnswers` / `QuestionAnswer`
- `SkillWizardScheduleConfig` / `SmartDefaultResult`

**設計上の重要な挙動**:
- `smartDefaults` の反映は「初回描画時のみ」（Step 0 再訪問後の自動上書きなし）
- Q5 必須は表示と警告のみ（生成ブロックなし）
- cron 検証は browser-safe な 5-field validator（実行スケジューラとの厳密整合は別タスク）

**Phase 11 証跡**: `docs/30-workflows/skill-wizard-redesign-lane/W1-par-02b-conversation-round-step/outputs/phase-11/screenshots/`

> W1-par-02c で `CompleteStep` は旧来の「作成パス表示 + close」から、次の行動を促す起点画面へ更新された。`generatedSkill` は親コンテキストとして保持し、表示責務からは切り離している。

### 使用率計装（W3-seq-04 / completed）

`trackEvent.ts`（renderer-local util）を追加し、SkillCreateWizard に 5 計装ポイントを実装した。

**ファイル**: `apps/desktop/src/renderer/utils/trackEvent.ts`

| イベント名 | payload | 計装責務 |
| --- | --- | --- |
| `skill_wizard_started` | `{}` | SkillCreateWizard（マウント時 useEffect） |
| `skill_wizard_step1_completed` | `{ method, skippedAtQuestion }` | SkillCreateWizard（handleGenerate 冒頭） |
| `skill_wizard_generation_completed` | `{ method, category, hasExternalIntegration }` | SkillCreateWizard（createSkill 成功後・失敗時は発火しない） |
| `skill_skeleton_quality_feedback` | `{ satisfied, generationMethod }` | SkillCreateWizard（handleQualityFeedback 経由）→ CompleteStep からコールバック受信 |
| `skill_wizard_next_action` | `{ action: "execute" \| "open_editor" \| "create_another" }` | SkillCreateWizard（handleExecuteNow / handleOpenInEditor / handleCreateAnother） |

**設計方針**: dev 環境は `console.info` でログ出力、prod は no-op。将来的に内部 sink を analytics adapter に差し替え可能（呼び出し側は変えない）。SkillAnalytics / AnalyticsStore（execution-centric）とは直接接続しない。

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/completed-tasks/skill-create-wizard/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| テスト資産 | ✅ 完了 | `apps/desktop/src/renderer/components/skill/__tests__/` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/` |
| W3-seq-04 使用率計装（trackEvent 5ポイント） | ✅ 完了 | `apps/desktop/src/renderer/utils/trackEvent.ts` |

### 状態管理・IPC依存

| 観点 | 採用方針 |
| --- | --- |
| 状態管理 | ローカル state + `useWizardStep` で完結（Store追加なし） |
| IPC利用 | `window.electronAPI.skill.create({ description, options })` |
| エラー処理 | `GenerateStep` 上でエラーメッセージ表示 |
| 契約整合 | `skill:create`（P42準拠3段バリデーション + sender検証） |

### 画面検証証跡（2026-03-02）

| 証跡 | ファイル |
| --- | --- |
| Step1 初期表示（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-01-step1-initial-dark.png` |
| Step1 入力後（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-02-step1-filled-dark.png` |
| Step2 設定（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-03-step2-configure-dark.png` |
| Step3 生成中（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-04-step3-generating-dark.png` |
| Step4 完了（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-05-step4-complete-dark.png` |
| Step3 エラー（Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-06-step3-error-dark.png` |
| Step1 初期表示（Light） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-07-step1-initial-light.png` |
| Step1 初期表示（Mobile Dark） | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-11/screenshots/TC-08-step1-initial-mobile-dark.png` |

### 実装時の苦戦箇所（TASK-10A-C）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| ウィザード状態の画面証跡が不足しやすい | 正常系のみ撮影して生成中/エラー状態を取り逃がす場合 | 専用スクリプトで 8 状態を一括撮影し、TCとの対応表を作成 | UIタスクは状態遷移ごとに screenshot-plan を先に固定する |
| `skill:create` 契約が仕様未反映のまま残る | Main/Preload更新後に仕様同期を後回しにする場合 | `api-ipc-agent`/`interfaces`/`security`/`architecture` を同一ターン更新 | 新規 `skill:*` 追加時は4仕様書同時更新を必須化 |
| Phase 12 成果物名の揺れ | `unassigned-task-report` など旧命名を残す場合 | `unassigned-task-detection.md` へ統一し artifacts を同期 | 命名規約と `validate-phase-output` を完了前に必ず照合する |

### 関連未タスク

本タスクで新規未タスクは検出されていない（`unassigned-task-detection.md`: 0件）。

---

## Store駆動ライフサイクルUI統合（TASK-10A-F / completed）

TASK-10A-F では `SkillAnalysisView` / `SkillCreateWizard` の責務境界を再確認し、Renderer コンポーネントからの直接 `window.electronAPI.skill.*` 呼び出しを排除した。

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 1-12 完了 | `docs/30-workflows/store-driven-lifecycle-ui/` |
| 実画面検証（スクリーンショット） | ✅ 11件取得 | `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-11/screenshots/` |
| Phase 12成果物 | ✅ 5成果物 + changelog | `docs/30-workflows/store-driven-lifecycle-ui/outputs/phase-12/` |

### UI観点の要点

- `useSkillAnalysis` は Store 個別セレクタ経由で `analysis/isAnalyzing/isImproving/skillError` を参照する。
- `SkillCreateWizard` は `useCreateSkill()` で作成 action を実行し、生成進捗をUIに反映する。
- 画面検証は dark/light/mobile と error/loading を含む 11ケースで確認済み。
- TASK-SKILL-LIFECYCLE-01 では `skillLifecycleJourney.ts` を追加し、create / use / improve の job guide と downstream contract を Store-driven lifecycle の前段ガイドとして固定した。

### 後続未タスク（TASK-10A-F 由来）

| タスクID | 内容 | 優先度 | 仕様書 |
| --- | --- | --- | --- |
| TASK-10A-G-SKILLEDITOR-FILEOPS-STORE-MIGRATION | SkillEditor.tsx ファイル操作系 direct IPC の Store 移行（6API） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-g-skilleditor-fileops-store-migration.md` |
| TASK-10A-F-MINOR-01-ANALYSIS-SUCCESS-FEEDBACK | SkillAnalysisView 成功フィードバックの視覚強化 | 低 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-f-minor-01-analysis-success-feedback.md` |
| TASK-10A-F-MINOR-02-WIZARD-GENERATE-RECOVERY | SkillCreateWizard GenerateStep のリカバリ導線追加 | 低 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-10a-f-minor-02-wizard-generate-recovery.md` |

---

## Verify / Improve Result Panel UI（TASK-RT-03 / phase-11）

TASK-RT-03-VERIFY-IMPROVE-PANEL-001 で、`VerifyResultDetailPanel` と `ImproveResultDetailPanel` を追加し、Phase 11 の visual harness で主要状態のスクリーンショット証跡を取得した。

### 実装済みコンポーネント / Harness

| 区分 | コンポーネント / Hook | 役割 | 想定配置 |
| --- | --- | --- | --- |
| view-like component | VerifyResultDetailPanel | Verify 結果詳細の表示、再検証導線、Governance Notes 表示 | `apps/desktop/src/renderer/components/skill/VerifyResultDetailPanel.tsx` |
| view-like component | ImproveResultDetailPanel | Improve 結果詳細の表示、提案リスト、Revised Spec 表示 | `apps/desktop/src/renderer/components/skill/ImproveResultDetailPanel.tsx` |
| harness | phase11-task-rt-03-verify-improve-panel | Verify pass / fail と Improve default の visual harness | `apps/desktop/src/renderer/phase11-task-rt-03-verify-improve-panel.tsx` |
| capture script | capture-task-rt-03-verify-improve-panel-phase11 | visual harness の screenshot capture | `apps/desktop/scripts/capture-task-rt-03-verify-improve-panel-phase11.mjs` |

### 進捗ステータス

| 項目 | 状態 | 参照 |
| --- | --- | --- |
| ワークフロー仕様（Phase 1-13） | ✅ Phase 12 ドキュメント整合完了 | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/` |
| 実装コード | ✅ 完了 | `apps/desktop/src/renderer/components/skill/` |
| visual harness | ✅ 完了 | `apps/desktop/src/renderer/phase11-task-rt-03-verify-improve-panel.tsx` |
| 画面検証証跡（スクリーンショット） | ✅ 取得済み | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/outputs/phase-11/screenshots/` |

### 画面検証証跡

| TC | 状態 | ファイル |
| --- | --- | --- |
| TC-11-01 | Verify pass | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/outputs/phase-11/screenshots/TC-11-01-verify-pass.png` |
| TC-11-02 | Verify fail | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/outputs/phase-11/screenshots/TC-11-02-verify-fail.png` |
| TC-11-03 | Improve default | `docs/30-workflows/step-09-par-task-rt-03-verify-improve-panel-001/outputs/phase-11/screenshots/TC-11-03-improve-default.png` |

### 実装時の苦戦箇所（再利用用）

| 苦戦箇所 | 再発条件 | 今回の対処 | 再利用ルール |
| --- | --- | --- | --- |
| `components/skill/index.ts` への再エクスポート前提が崩れる | 追加コンポーネントを index 経由で import するが、未 export のままにする | harness 側で直 import に切り替え、既存実装ファイルは変更しない | visual harness は既存 export 構造に依存しすぎず、必要なら direct import を使う |
| screenshot 待機対象が DOM に存在しない | `data-testid` の付与忘れで locator が見つからない | `phase11-verify-improve-harness` を main に付与して待機を安定化 | capture script には待機対象の存在を明示する |
| verify pass / fail の差が薄く見える | 同じカード幅・同じメッセージで差異が分かりにくい | pass / fail で nextAction、disabledReason、severity を変えた | screenshot は見た目の差が一目で分かる条件を含める |

---

<a id="organisms-foundation-task-ui-00-organisms"></a>
