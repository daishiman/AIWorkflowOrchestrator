# Phase 5: 実装（TDD Green）— TASK-UI-05B

## メタ情報

| 項目         | 値                                                                                |
| ------------ | --------------------------------------------------------------------------------- |
| タスク ID    | TASK-UI-05B                                                                       |
| Phase        | 5 — 実装                                                                          |
| 前提 Phase   | Phase 4（テスト作成）完了 — 全テストが Red 状態                                   |
| 作成日       | 2026-03-01                                                                        |
| 対象ビュー   | 3A SkillChainBuilder / 3B ScheduleManager / 3C DebugPanel / 3D AnalyticsDashboard |
| スタイリング | Tailwind CSS + Apple HIG System Colors（CSS 変数）                                |
| アイコン     | lucide-react のみ（絵文字不使用）                                                 |

## 目的

Phase 4 で作成した全 89 テストを Green（成功）にするプロダクションコードを実装する。4 つの高度管理ビュー（SkillChainBuilder, ScheduleManager, DebugPanel, AnalyticsDashboard）を Atomic Design に基づいて構成し、IPC 経由のバックエンド連携、Apple HIG 準拠のスタイリング、マイクロインタラクションを実装する。

## 実行タスク

- 共通基盤実装: EmptyState/Loading/Error と IPC Hook 基盤を実装する
- ビュー実装: 3A〜3D の UI/Hooks/IPC 連携を順次実装する
- 契約準拠実装: IPC_CHANNELS 定数・型契約・Preload API 契約を順守する
- セキュリティ実装: P5/P27/P31/P42 の対策をコードへ組み込む
- レスポンシブ実装: sm/md/lg の表示戦略を実装する
- アニメーション実装: 仕様化済みマイクロインタラクションを実装する
- Green確認: Phase 4 の Red テストを Green 化する

### Task 1: 共通パターンの実装

**目的**: 4 ビュー共通で使用する UI パターンを先行実装し、重複コードを防止する。

**実装対象**:

| コンポーネント / パターン | 説明                                           | 配置先                                       |
| ------------------------- | ---------------------------------------------- | -------------------------------------------- |
| `EmptyState`              | データ未登録時のイラスト＋メッセージ表示       | 既存 atoms を利用、各ビュー内で Props 差替え |
| Loading スケルトン        | カード型 / テーブル行型 / チャート型の 3 種    | 各ビュー内に専用スケルトンコンポーネント     |
| エラーバナー              | IPC エラーのインラインメッセージ表示           | 共通パターンとして各ビュー内に実装           |
| IPC 連携 hooks パターン   | `isLoading` / `error` / `data` の 3 state 管理 | 各 hooks 内で統一的に実装                    |

**レスポンシブブレークポイント定義**:

| ブレークポイント | 幅         | レイアウト方針                       |
| ---------------- | ---------- | ------------------------------------ |
| sm               | < 768px    | シングルカラム、カード縦積み         |
| md               | 768-1024px | 2 カラム、サイドパネル折りたたみ可能 |
| lg               | > 1024px   | フル表示、左右ペイン、カードグリッド |

### Task 2: 3A SkillChainBuilder 実装

**目的**: スキルチェーンの作成・編集・実行を行うパイプラインビルダーを実装する。

#### 2-1: コンポーネント実装

| コンポーネント          | Atomic Design | 責務                                    | 主要 Props                                                      |
| ----------------------- | ------------- | --------------------------------------- | --------------------------------------------------------------- |
| `SkillChainBuilder.tsx` | organisms     | ビュー全体のレイアウト・状態管理        | —                                                               |
| `ChainCardGrid.tsx`     | molecules     | チェーン一覧のカードグリッド表示        | `chains`, `onSelect`, `onCreateNew`                             |
| `ChainEditor.tsx`       | organisms     | 選択チェーンの編集 UI                   | `chain`, `onSave`, `onCancel`                                   |
| `StepCard.tsx`          | molecules     | 個別ステップのカード表示（160px×100px） | `step`, `status`, `onSelect`                                    |
| `StepConnector.tsx`     | atoms         | ステップ間の SVG パス接続線             | `from`, `to`, `isActive`                                        |
| `StepEditor.tsx`        | molecules     | ステップの詳細編集フォーム              | `step`, `onSkillChange`, `onMappingChange`, `onConditionChange` |
| `CreateChainDialog.tsx` | organisms     | 新規チェーン作成ダイアログ              | `isOpen`, `onClose`, `onCreate`                                 |

#### 2-2: Hooks 実装

| Hook                | IPC チャネル                                                                       | 管理する state                                     |
| ------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------- |
| `useChainList.ts`   | `skill:chain:list`                                                                 | `chains`, `isLoading`, `error`                     |
| `useChainEditor.ts` | `skill:chain:get`, `skill:chain:save`, `skill:chain:execute`, `skill:chain:delete` | `chain`, `steps`, `isExecuting`, `result`, `error` |

#### 2-3: マイクロインタラクション

| 要素              | アニメーション                  | 持続時間   |
| ----------------- | ------------------------------- | ---------- |
| StepCard hover    | `scale(1.02)` + `shadow-md`     | 200ms      |
| StepCard ドラッグ | `opacity: 0.7`                  | ドラッグ中 |
| ステップ追加      | `opacity: 0→1` + `scale(0.9→1)` | 300ms      |
| 実行中パルス      | `animate-pulse` クラス          | 1.5s 周期  |

### Task 3: 3B ScheduleManager 実装

**目的**: スキルスケジュールの一覧管理・作成・編集を行う管理画面を実装する。

#### 3-1: コンポーネント実装

| コンポーネント            | Atomic Design | 責務                             | 主要 Props                                 |
| ------------------------- | ------------- | -------------------------------- | ------------------------------------------ |
| `ScheduleManager.tsx`     | organisms     | ビュー全体のレイアウト・状態管理 | —                                          |
| `ScheduleTable.tsx`       | molecules     | スケジュール一覧テーブル         | `schedules`, `onRowClick`, `onToggle`      |
| `ScheduleRow.tsx`         | molecules     | テーブル 1 行分の表示            | `schedule`, `onClick`, `onToggle`          |
| `ScheduleDetailPanel.tsx` | molecules     | 選択スケジュールの詳細表示       | `schedule`, `runHistory`                   |
| `ScheduleDialog.tsx`      | organisms     | スケジュール作成/編集ダイアログ  | `isOpen`, `schedule?`, `onSave`, `onClose` |
| `CronEditor.tsx`          | molecules     | Cron 式の入力・プレビュー        | `value`, `onChange`, `error?`              |
| `CronPresetList.tsx`      | atoms         | Cron プリセット選択リスト        | `onSelect`                                 |
| `RunHistoryList.tsx`      | molecules     | 実行履歴リスト                   | `history`                                  |

#### 3-2: Hooks 実装

| Hook                   | IPC チャネル                                                            | 管理する state                    |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------- |
| `useScheduleList.ts`   | `skill:schedule:list`, `skill:schedule:toggle`, `skill:schedule:delete` | `schedules`, `isLoading`, `error` |
| `useScheduleEditor.ts` | `skill:schedule:add`, `skill:schedule:update`                           | `schedule`, `isSaving`, `error`   |

#### 3-3: マイクロインタラクション

| 要素              | アニメーション              | 持続時間 |
| ----------------- | --------------------------- | -------- |
| ScheduleRow hover | 背景色遷移                  | 100ms    |
| ON/OFF トグル     | スライド + 色変化           | 200ms    |
| 詳細パネル展開    | `max-height` トランジション | 300ms    |

### Task 4: 3C DebugPanel 実装

**目的**: スキルのステップ実行デバッグ機能を提供する 2 ペインパネルを実装する。

#### 4-1: コンポーネント実装

| コンポーネント         | Atomic Design | 責務                                     | 主要 Props                                     |
| ---------------------- | ------------- | ---------------------------------------- | ---------------------------------------------- |
| `DebugPanel.tsx`       | organisms     | 左右 2 ペインレイアウト・セッション管理  | —                                              |
| `DebugControls.tsx`    | molecules     | Continue/StepOver/StepInto/Stop ボタン群 | `status`, `onCommand`                          |
| `CallStackView.tsx`    | molecules     | コールスタックのツリー表示               | `callStack`, `currentFrame`                    |
| `StepHistoryList.tsx`  | molecules     | 実行済みステップのリスト                 | `steps`                                        |
| `OutputConsole.tsx`    | molecules     | コンソール出力の表示                     | `outputs`                                      |
| `VariableWatch.tsx`    | molecules     | 変数ウォッチパネル                       | `variables`                                    |
| `VariableNode.tsx`     | atoms         | 個別変数の表示（展開可能）               | `variable`, `depth`                            |
| `BreakpointEditor.tsx` | molecules     | ブレークポイント管理                     | `breakpoints`, `onAdd`, `onRemove`, `onToggle` |
| `BreakpointRow.tsx`    | atoms         | ブレークポイント 1 行表示                | `breakpoint`, `onRemove`, `onToggle`           |
| `StartDebugDialog.tsx` | organisms     | デバッグ開始ダイアログ（スキル選択）     | `isOpen`, `onStart`, `onClose`                 |

#### 4-2: Hooks 実装

| Hook                 | IPC チャネル                                                                                                             | 管理する state                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `useDebugSession.ts` | `skill:debug:start`, `skill:debug:command`, `skill:debug:event`（safeOn）, `skill:debug:inspect`, `skill:debug:evaluate` | `session`, `status`, `callStack`, `variables`, `outputs`, `error` |
| `useBreakpoints.ts`  | `skill:debug:breakpoint:add`, `skill:debug:breakpoint:remove`                                                            | `breakpoints`, `error`                                            |

#### 4-3: P5 対策 — リスナー管理

`useDebugSession.ts` では `skill:debug:event` チャネルの `safeOn` リスナーを登録する。`useEffect` の cleanup 関数で必ずリスナーを解除する。

```typescript
// 実装パターン（概念）
useEffect(() => {
  const cleanup = window.electronAPI.skill.debug.onEvent(handleDebugEvent);
  return () => {
    cleanup(); // リスナー解除
  };
}, [sessionId]);
```

#### 4-4: マイクロインタラクション

| 要素             | アニメーション       | 持続時間 |
| ---------------- | -------------------- | -------- |
| コールスタック行 | ブレーク時ハイライト | 300ms    |
| 変数値変更       | アクセント色点滅     | 500ms    |
| 操作ボタン hover | `scale(1.05)`        | 100ms    |

### Task 5: 3D AnalyticsDashboard 実装

**目的**: スキル使用状況の集計・トレンド・ランキングを表示するダッシュボードを実装する。

#### 5-1: コンポーネント実装

| コンポーネント           | Atomic Design | 責務                                            | 主要 Props                                  |
| ------------------------ | ------------- | ----------------------------------------------- | ------------------------------------------- |
| `AnalyticsDashboard.tsx` | organisms     | ダッシュボード全体のレイアウト                  | —                                           |
| `SummaryCards.tsx`       | molecules     | サマリーカードの並列表示                        | `summary`                                   |
| `SummaryCard.tsx`        | atoms         | 個別サマリー値の表示（min-h-100px, flex-1）     | `label`, `value`, `trend`, `trendDirection` |
| `UsageChart.tsx`         | molecules     | recharts を使用した使用量チャート（280px 高さ） | `data`, `period`                            |
| `ChartTooltip.tsx`       | atoms         | チャートのカスタムツールチップ                  | `active`, `payload`, `label`                |
| `SkillRanking.tsx`       | molecules     | スキル使用頻度の水平バーチャート                | `rankings`                                  |
| `PeriodSelector.tsx`     | atoms         | 期間選択セレクタ                                | `value`, `onChange`                         |
| `ExportButton.tsx`       | atoms         | CSV エクスポートボタン                          | `onExport`, `isExporting`                   |

#### 5-2: Hooks 実装

| Hook                     | IPC チャネル                                          | 管理する state                                  |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------- |
| `useAnalyticsSummary.ts` | `skill:analytics:summary`                             | `summary`, `isLoading`, `error`                 |
| `useUsageTrend.ts`       | `skill:analytics:trend`, `skill:analytics:statistics` | `trendData`, `statistics`, `isLoading`, `error` |

#### 5-3: recharts 統合

- `ResponsiveContainer` で親要素に追従するレスポンシブチャートを実装する
- `AreaChart` または `BarChart` でトレンドデータを表示する
- `ChartTooltip` をカスタムコンポーネントとして実装する
- recharts が `@repo/desktop` の `package.json` に宣言されていることを確認する（P8 対策）

#### 5-4: マイクロインタラクション

| 要素              | アニメーション             | 持続時間 |
| ----------------- | -------------------------- | -------- |
| SummaryCard       | カウントアップ（0→実際値） | 800ms    |
| UsageChart        | チャートドロー             | 1000ms   |
| SkillRanking バー | 幅 0%→実際値               | 600ms    |

### Task 6: レスポンシブ対応

**目的**: 3 ブレークポイント（sm/md/lg）で各ビューのレイアウトを最適化する。

| ビュー             | sm（< 768px）               | md（768-1024px）            | lg（> 1024px）                  |
| ------------------ | --------------------------- | --------------------------- | ------------------------------- |
| SkillChainBuilder  | カード 1 列、エディター全幅 | カード 2 列、エディター下部 | カード 3 列、エディター右ペイン |
| ScheduleManager    | カード形式表示              | テーブル（列数制限）        | テーブルフル + 詳細ペイン       |
| DebugPanel         | タブ切替式                  | 上下 2 ペイン               | 左右 2 ペイン                   |
| AnalyticsDashboard | 縦積み                      | 2 カラム                    | 3 カラム + サイドパネル         |

### Task 7: マイクロインタラクション実装

**目的**: Task 2-5 で定義したマイクロインタラクションを CSS トランジション / Tailwind アニメーションで実装する。

**実装方針**:

- CSS `transition` プロパティと Tailwind の `hover:`, `focus:`, `active:` バリアントを使用する
- カウントアップアニメーションは `requestAnimationFrame` ベースのカスタム Hook で実装する
- recharts のアニメーションは `<AreaChart isAnimationActive={true} animationDuration={1000}>` で制御する
- `prefers-reduced-motion: reduce` メディアクエリでアニメーション無効化に対応する

## 参照資料

| 資料                     | パス / 参照先                                                                     |
| ------------------------ | --------------------------------------------------------------------------------- |
| Phase 4 テスト仕様書     | `phase-4-test-creation.md`                                                        |
| Phase 2 設計書           | `phase-2-design.md`                                                               |
| アーキテクチャルール     | `.claude/rules/01-architecture.md`                                                |
| Apple HIG カラーパレット | `.claude/rules/01-architecture.md#カラーパレット`                                 |
| 状態管理ルール           | `.claude/rules/03-state-management.md`                                            |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`（P5, P8, P31, P47）                          |
| IPC 型定義               | `packages/shared/src/types/skill-{chain,schedule,debug,analytics}.ts`             |
| Preload skill-api        | `apps/desktop/src/preload/skill-api.ts`                                           |
| aiworkflow IPC契約       | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              |
| aiworkflow 型契約        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |
| aiworkflow セキュリティ  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      |
| aiworkflow 状態管理      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      |
| aiworkflow サービス契約  | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`     |
| aiworkflow 全体構成      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      |
| aiworkflow UI仕様        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |

## 実行手順

### Step 1: 共通パターン実装

1. EmptyState / Loading スケルトン / エラーバナーの共通パターンを確認する
2. 4ビュー間で共通するUI要素（EmptyState バリアント、Loading スケルトンのカード数差異）がある場合、共通コンポーネントの Props を拡張する
3. IPC hooks の共通パターン（isLoading / error / data）を確認する

### Step 2: 3A SkillChainBuilder 実装

1. `useChainList.ts` → `useChainEditor.ts` の順で hooks を実装する
2. atoms（StepConnector）→ molecules（StepCard, StepEditor, ChainCardGrid）→ organisms（ChainEditor, SkillChainBuilder, CreateChainDialog）の順で実装する
3. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillChainBuilder/` で全テストが Green であることを確認する

### Step 3: 3B ScheduleManager 実装

1. `useScheduleList.ts` → `useScheduleEditor.ts` の順で hooks を実装する
2. atoms（CronPresetList）→ molecules（CronEditor, ScheduleRow, ScheduleTable, ScheduleDetailPanel, RunHistoryList）→ organisms（ScheduleDialog, ScheduleManager）の順で実装する
3. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/ScheduleManager/` で全テストが Green であることを確認する

### Step 4: 3C DebugPanel 実装

1. `useBreakpoints.ts` → `useDebugSession.ts`（P5 対策: cleanup 実装）の順で hooks を実装する
2. atoms（VariableNode, BreakpointRow）→ molecules（DebugControls, CallStackView, StepHistoryList, OutputConsole, VariableWatch, BreakpointEditor）→ organisms（StartDebugDialog, DebugPanel）の順で実装する
3. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/DebugPanel/` で全テストが Green であることを確認する

### Step 5: 3D AnalyticsDashboard 実装

1. recharts が `@repo/desktop` の依存に含まれていることを確認する（不足時は `pnpm --filter @repo/desktop add recharts`）
2. `useAnalyticsSummary.ts` → `useUsageTrend.ts` の順で hooks を実装する
3. atoms（SummaryCard, PeriodSelector, ExportButton, ChartTooltip）→ molecules（SummaryCards, UsageChart, SkillRanking）→ organisms（AnalyticsDashboard）の順で実装する
4. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/AnalyticsDashboard/` で全テストが Green であることを確認する

### Step 6: レスポンシブ対応

1. Tailwind のレスポンシブプレフィックス（`sm:`, `md:`, `lg:`）を各コンポーネントに適用する
2. 各ブレークポイントでレイアウト変更を確認する

### Step 7: マイクロインタラクション実装

1. CSS トランジション（hover, focus, active 状態）を各コンポーネントに適用する
2. カウントアップアニメーション Hook を実装する
3. recharts アニメーション設定を適用する
4. `prefers-reduced-motion` 対応を確認する

### Step 8: 全体テスト確認

1. `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillChainBuilder/ src/renderer/views/ScheduleManager/ src/renderer/views/DebugPanel/ src/renderer/views/AnalyticsDashboard/` で全 89 テストが Green であることを確認する

## 統合テスト連携【必須】

| 連携観点           | 実装で満たす条件                                                  | 確認出力先                                  |
| ------------------ | ----------------------------------------------------------------- | ------------------------------------------- |
| Phase 4 テスト接続 | Red テストの失敗理由を仕様どおりに解消する                        | `outputs/phase-5/implementation-summary.md` |
| IPC契約接続        | `api-ipc-agent.md` / `interfaces-agent-sdk-skill.md` 契約を満たす | `outputs/phase-5/implementation-summary.md` |
| セキュリティ接続   | P42 入力検証と event/invoke 分離を実装する                        | `outputs/phase-5/implementation-summary.md` |
| a11y接続           | Phase 6 で検証可能な ARIA/キーボード対応を実装する                | `outputs/phase-6/test-expansion-report.md`  |

## 成果物

| 成果物                              | パス                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| 実装サマリー                        | `outputs/phase-5/implementation-summary.md`           |
| ChainBuilder コンポーネント群       | `apps/desktop/src/renderer/views/SkillChainBuilder/`  |
| ScheduleManager コンポーネント群    | `apps/desktop/src/renderer/views/ScheduleManager/`    |
| DebugPanel コンポーネント群         | `apps/desktop/src/renderer/views/DebugPanel/`         |
| AnalyticsDashboard コンポーネント群 | `apps/desktop/src/renderer/views/AnalyticsDashboard/` |

## 完了条件

- [ ] Phase 4 で作成した全 89 テストが Green（成功）状態である
- [ ] 4 ビューの全コンポーネントが Atomic Design 階層に従って実装されている
- [ ] IPC 連携が全 22 チャネルで動作する
- [ ] Apple HIG 準拠のカラーパレット（CSS 変数）が適用されている
- [ ] lucide-react アイコンのみ使用し、絵文字は不使用である
- [ ] レスポンシブ対応が 3 ブレークポイント（sm/md/lg）で実装されている
- [ ] マイクロインタラクションが全ビューに実装されている
- [ ] `prefers-reduced-motion` でアニメーション無効化に対応している
- [ ] `useDebugSession.ts` で `safeOn` リスナーの cleanup が実装されている（P5 対策）
- [ ] recharts が `@repo/desktop` の `package.json` に宣言されている（P8 対策）
- [ ] 個別セレクタのみ使用し、合成 Store Hook を使用していない（P31 対策）
- [ ] `outputs/phase-5/implementation-summary.md` が作成されている

## 次 Phase

Phase 6（テスト拡充）へ進む。カバレッジ基準達成に向けた追加テストを作成する。
