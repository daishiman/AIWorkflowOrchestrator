# Skill Lifecycle Routing / renderView Foundation ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

`TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001`（`step-01-seq-task-01-viewtype-renderView-foundation`）で実装した
`ViewType` 拡張と `renderView()` 分岐を、Phase 11/12 の証跡と同時に再利用できるようにまとめた統合正本。

**トリガー**: `viewtype renderView`, `skillAnalysis`, `skillCreate`, `skill-center normalize`, `skill-lifecycle-routing`

---

## 実装内容（2026-03-17）

| 観点 | 反映内容 | 実装アンカー |
| --- | --- | --- |
| ViewType 拡張 | `ViewType` に `skillAnalysis` / `skillCreate` を追加 | `apps/desktop/src/renderer/store/types.ts` |
| 画面分岐 | `renderView()` に `skillAnalysis` / `skillCreate` case を追加 | `apps/desktop/src/renderer/App.tsx` |
| close 導線 | `SkillAnalysisView` close 時に `skillCenter` へ戻し `currentSkillName` を `null` へ戻す | `apps/desktop/src/renderer/App.tsx` |
| 型境界 | `SkillLifecycleJobGuide` に `onAction?: () => void` を追加して既存ガイド互換を維持 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| alias 正規化 | `skill-center` を `normalizeSkillLifecycleView()` で canonical `skillCenter` へ変換 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |

---

## Phase 11 証跡（画面）

| TC | 証跡 | 内容 |
| --- | --- | --- |
| TC-11-01 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/TC-11-01-renderview-skill-analysis.png` | skillAnalysis 描画 |
| TC-11-02 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/TC-11-02-renderview-skill-create.png` | skillCreate 描画 |
| TC-11-03 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/TC-11-03-renderview-dashboard-regression.png` | dashboard 回帰 |
| TC-11-04 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/TC-11-04-analysis-close-to-skill-center.png` | analysis close 導線 |
| TC-11-05 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/TC-11-05-legacy-skill-center-alias-normalized.png` | legacy alias 到達面 |

`apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` は
`advanced route fallback`（`/advanced/*?skipAuth=true`）で screenshot を固定し、
`renderView()` 分岐自体は `App.renderView.viewtype.test.tsx` で補助検証する。

---

## 苦戦箇所（再利用形式）

| 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- |
| `currentView` 注入での direct 画面到達が不安定 | auth/persist 初期化と同時に screenshot を取ろうとする | 画面証跡は `advanced route fallback` に寄せ、分岐保証は unit test へ分離 |
| Phase 12 出力名の揺れ（`unassigned-task-report` vs `unassigned-task-detection`） | workflow 出力と task-spec 期待名の同値確認を省略する | `unassigned-task-detection.md` と `spec-update-summary.md` を正本名で生成し、changelog と同値同期する |
| P40 再発: dynamic import の Vite alias 解決失敗 | モノレポルートから `await import("@/renderer/App")` を含むテストを実行する | `cd apps/desktop` が必須。`pnpm --filter @repo/desktop exec vitest run` で実行する |
| コンテキスト圧縮リカバリ | エージェント作業中にコンテキストウィンドウが圧縮される | `git diff --stat HEAD` + `Glob` で完了判定し、未完了成果物を特定する |
| ViewType union 拡張パターンの安全性 | `Record<ViewType, Config>` を使用すると全 case の強制が網羅的になりすぎる | カテゴリコメント付きで union を整理し、`renderView()` の default case で安全に fallback する |

### テスト証跡

34テスト全PASS（TC-VT-01~04, TC-RV-01~08, TC-SL-01~11 を含む3ファイル）:

| テストファイル | テスト数 | 対象 |
| --- | --- | --- |
| `App.renderView.viewtype.test.tsx` | TC-VT-01~04, TC-RV-01~08 | ViewType union / renderView 分岐 |
| `skillLifecycleJourney.test.ts` | TC-SL-01~11 | normalizeSkillLifecycleView / onAction / パススルー |
| `types.test.ts` | 型検証 | ViewType 15→17 メンバー拡張 |

---

## artifact inventory

| 区分 | 成果物 | パス |
| --- | --- | --- |
| 型定義 | ViewType union（15→17メンバー: `skillAnalysis` / `skillCreate` 追加） | `apps/desktop/src/renderer/store/types.ts` |
| 画面分岐 | `renderView()` に2つの新 case 分岐追加 | `apps/desktop/src/renderer/App.tsx` |
| 型契約 | `SkillLifecycleJobGuide` に `onAction?: () => void` 追加 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| alias 正規化 | `normalizeSkillLifecycleView` が新 ViewType をパススルー | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| テスト | `App.renderView.viewtype.test.tsx` | `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` |
| テスト | `skillLifecycleJourney.test.ts` | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts` |
| テスト | `types.test.ts` | `apps/desktop/src/renderer/store/types.test.ts` |
| screenshot harness | Phase 11 capture script | `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` |
| screenshot | TC-11-01..05 | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/outputs/phase-11/screenshots/` |

---

## current canonical set（2026-03-17 wave）

| 区分 | canonical docs |
| --- | --- |
| workflow 正本 | `references/workflow-skill-lifecycle-routing-render-view-foundation.md` |
| parent docs | `references/ui-ux-navigation.md`, `references/arch-state-management-core.md` |
| 台帳 | `references/task-workflow.md`, `references/task-workflow-completed-skill-lifecycle.md`, `references/task-workflow-backlog.md` |
| 教訓 | `references/lessons-learned-current.md` |
| index | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/quick-reference-search-patterns.md` |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-skill-lifecycle-routing-direct-renderview-capture-guard-001.md` |
| mirror root | canonical=`.claude/skills/aiworkflow-requirements/` / mirror=`.agents/skills/aiworkflow-requirements/` |

Phase 12 の `unassigned-task-detection.md` では上記 follow-up を 1 件として記録し、
`documentation-changelog.md` / `spec-update-summary.md` と件数を同値で同期する。

---

## 検証コマンド

| コマンド | 目的 |
| --- | --- |
| `pnpm --filter @repo/desktop exec vitest run src/renderer/__tests__/App.renderView.viewtype.test.tsx src/renderer/navigation/skillLifecycleJourney.test.ts src/renderer/store/types.test.ts` | renderView / 型境界の回帰確認 |
| `node apps/desktop/scripts/capture-task-skill-lifecycle-routing-step01-phase11.mjs` | Phase 11 screenshot 取得 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation` | 画面証跡カバレッジ確認 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation` | implementation guide literal 要件確認 |

---

## 同種課題の5分解決カード

1. `ViewType` 拡張時は `types.ts` と `renderView()` を同一ターンで更新する。  
2. legacy alias は shell 入口で 1 回だけ canonical 化する。  
3. screenshot 到達と分岐保証を分離し、画面証跡は route、分岐は unit test で固定する。  
4. Phase 12 は `spec-update-summary` / `documentation-changelog` / `unassigned-task-detection` を同値同期する。  
5. 最後に index 再生成と mirror 同期を実施し、ドキュメント導線の取りこぼしをなくす。  

---

---

## TASK-SKILL-LIFECYCLE-02: SkillCenterView CTA ルーティング（2026-03-18）

| 観点 | 反映内容 | 実装アンカー |
| --- | --- | --- |
| ヘッダー CTA | 「+ 新規作成」ボタンで `skillCreate` へ直接遷移 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| JourneyPanel CTA | 3ジョブ別 CTA ボタン（create/use/improve）で対応ビューへ遷移 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| ナビゲーション関数 | `navigateToSkillCreate` / `navigateToWorkspace` / `navigateToSkillAnalysis` | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| 型拡張 | `SkillLifecycleJobGuide` に `ctaLabel?: string` 追加 | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts` |
| スタイル拡張 | `viewStyles` に `headerRow` / `headerCta` / `journeyCardCta` 追加 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |

### テスト証跡（Task02）

34テスト全PASS:

| テストファイル | テスト数 | 対象 |
| --- | --- | --- |
| `useSkillCenter.navigation.test.ts` | 4 | ナビゲーション関数の setCurrentView 呼び出し検証 |
| `SkillCenterView.cta.test.tsx` | 26 | CTA 表示・非表示・クリック動作・data-testid 検証 |
| `skillLifecycleJourney.test.ts` | TC-SL-12~15（4追加） | ctaLabel 型拡張・定数値検証 |

### data-testid 一覧

| data-testid | 要素 |
| --- | --- |
| `header-create-cta` | ヘッダーの「+ 新規作成」ボタン |
| `skill-lifecycle-cta-create` | JourneyPanel「作成を始める」ボタン |
| `skill-lifecycle-cta-use` | JourneyPanel「使ってみる」ボタン |
| `skill-lifecycle-cta-improve` | JourneyPanel「改善する」ボタン |
| `skill-lifecycle-journey` | JourneyPanel セクション全体 |

---

## TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001: SkillDetailPanel 二次 handoff（2026-03-19）

| 観点 | 反映内容 | 実装アンカー |
| --- | --- | --- |
| source action zone | imported `SkillDetailPanel` に `エディタで開く` / `分析する` を追加 | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` |
| edit handoff | `handleEditSkill(skillName)` が `currentSkillName` を設定して `skill-editor` へ遷移 | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| analyze handoff | `handleAnalyzeSkill(skillName)` が `currentSkillName` を設定して `skillAnalysis` へ遷移 | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` |
| shell integration | `SkillCenterView` から `SkillDetailPanel` へ `onEdit` / `onAnalyze` を接続 | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx` |
| screenshot mode | main shell 上で source panel から destination まで連続 capture し、`phase11-capture-metadata.json` に 7 evidence を保存 | `apps/desktop/scripts/capture-task-skilldetail-action-buttons-phase11.mjs` |

### テスト証跡（Task03）

| テストファイル | テスト数 | 対象 |
| --- | --- | --- |
| `SkillDetailPanel.test.tsx` | 49 | action zone 表示条件、keyboard focus、Escape close |
| `useSkillCenter.test.ts` | 17 | edit/analyze handoff、state 更新順序 |
| `useSkillCenter.navigation.test.ts` | 4 | SkillCenter navigation 既存契約の回帰 |

### downstream adoption note

- `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` が用意した `skillAnalysis` / `skill-editor` ViewType を、SkillCenter detail panel の secondary action が再利用する。
- 画面到達は main shell screenshot、分岐保証は hook/unit test に分離して証明する。

---

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001: AgentView <-> SkillAnalysis round-trip（2026-03-20）

| 観点 | 反映内容 | 実装アンカー |
| --- | --- | --- |
| CTA gate | `AgentView` が `selectedSkillName` / `skillExecutionStatus` / `isExecuting` から改善 CTA の表示可否を導出 | `apps/desktop/src/renderer/views/AgentView/index.tsx` |
| handoff start | CTA click で対象スキル名を `currentSkillName` へ保持し、`skillAnalysis` へ遷移 | `apps/desktop/src/renderer/views/AgentView/index.tsx` |
| round-trip guard | `App.tsx` は `viewHistory[length - 2] === "agent"` のときだけ `SkillAnalysisView` に戻り導線を渡す | `apps/desktop/src/renderer/App.tsx` |
| destination UI | `SkillAnalysisView` は Agent 起点限定で `戻る` / `エージェントで再実行` を表示 | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx` |
| screenshot mode | App 実画面 harness + metadata で CTA 表示/非表示、analysis、戻る、再実行、dark theme を 6件固定 | `apps/desktop/scripts/capture-task-skill-lifecycle-routing-step03-phase11.mjs` |

### テスト証跡（Task04）

| テストファイル | テスト数 | 対象 |
| --- | --- | --- |
| `AgentView.cta.test.tsx` | 8 | CTA 表示条件、click handoff、aria 契約 |
| `AgentView.coverage.test.tsx` | 4 | 実行完了/未完了/未選択/実行中の条件網羅 |
| `SkillAnalysisView.navigation.test.tsx` | 9 | optional props 表示条件、callback 発火、a11y |
| `App.renderView.viewtype.test.tsx` | 既存回帰 + 追加 case | `viewHistory` 起点での navigation props 注入 |

### Phase 11 証跡（Task04）

| TC | 証跡 | 内容 |
| --- | --- | --- |
| TC-11-01 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-01-agent-cta-visible-light.png` | AgentView CTA visible |
| TC-11-02 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-02-agent-cta-hidden-light.png` | CTA hidden guard |
| TC-11-03 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-03-skill-analysis-from-agent-light.png` | Agent 起点 analysis |
| TC-11-04 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-04-agent-return-from-analysis-light.png` | 戻る導線 |
| TC-11-05 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-05-agent-rerun-from-analysis-light.png` | 再実行導線 |
| TC-11-06 | `docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route/outputs/phase-11/screenshots/TC-11-06-agent-cta-visible-dark.png` | dark theme 回帰 |

### follow-up backlog（Task04）

- `UT-FIX-SKILLANALYSIS-ARIA-LABEL-001`
- `UT-FIX-SKILLANALYSIS-ARIA-LABEL-002`
- `UT-FIX-SKILLANALYSIS-ARIA-LABEL-003`
- `UT-FIX-SKILLIMPORT-ARIA-LABEL-001`
- `UT-FIX-APP-CONSOLE-LOG-001`
- `UT-FIX-APP-INLINE-SELECTOR-001`
- `UT-FIX-VIEWHISTORY-ACCUMULATION-001`
- `UT-FIX-AGENTVIEW-CTA-ACT-WRAP-001`
- `UT-FIX-VERIFY-ALL-SPECS-BLOCKED-PHASE-001`

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-20 | 1.3.0 | `TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001` の CTA gate、Agent round-trip、Phase 11 screenshot 6件、follow-up 8件を追加 |
| 2026-03-19 | 1.2.0 | `TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001` の secondary handoff、main shell screenshot 7件、panel-scoped selector ルールを追加 |
| 2026-03-18 | 1.1.0 | `TASK-SKILL-LIFECYCLE-02` の実装内容、Phase 11証跡、data-testid一覧を追加 |
| 2026-03-17 | 1.0.0 | `TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001` の実装内容、Phase 11証跡、Phase 12同期、follow-up を統合正本として追加 |
