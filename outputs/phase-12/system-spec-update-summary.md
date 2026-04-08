# Phase 12: システム仕様更新サマリー（system-spec-update-summary.md）— UT-SKILL-WIZARD-W1-par-02b

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 対象: Skill Create Wizard（renderer UI）
- 作成日: 2026-04-08

## Step 1: タスクの current facts（変更点の整理）

### 変更の核

- Step 0（DescribeStep）で `SkillCategory` を選択できるようにし、Step 1 の必須表示（Q5）判定へ使う
- template 生成モードでは Step 0 の入力から `SmartDefaultResult` を推論し、Step 1 へ渡す
- Step 1（ConversationRoundStep）を 6問・2ページのインタビュー UI として実装し、Q3 の定期実行 UI（cron + timezone）と、サマリーカード（ApplySummaryCard）を追加
- Q3 の cron 検証は renderer で動く browser-safe な 5-field validator を使い、Vite ブラウザバンドルでも起動できるようにした

### 公開面（モジュール export）に関する current facts

- `apps/desktop/src/renderer/components/skill/wizard/index.ts` は `ConversationRoundStep` / `InterviewProgressBar` / `ApplySummaryCard` を export している
- `ConfigureStep` は削除され、export も存在しない

### shared contracts（型）について

このタスク自体で shared 型を新規追加するのではなく、既存の「Skill Wizard Shared Contracts」を consumer として利用する。

- `packages/shared/src/types/skillCreator.ts`
  - `SkillCategory`
  - `SkillInfoFormData`
  - `ConversationAnswers` / `QuestionAnswer`
  - `SkillWizardScheduleConfig`
  - `SmartDefaultResult`

## Step 2: システム仕様書（aiworkflow-requirements）への反映要否

### 判定

- IPC / backend API / データ永続化などの「システム外部契約」は変更していない
- 変更は renderer UI 内のウィザード挙動（画面と state の配線）が中心

よって、**システム中核仕様（IPC contract 等）の更新は不要**。

### 更新が必要になり得るドキュメント（条件付き）

以下のような「UI/UX の画面仕様書」が aiworkflow-requirements に存在する場合のみ、`Q5 必須表示の条件（category）` と `smartDefaults の推論タイミング` を current facts として追記する価値がある。

- Skill wizard の画面要件を記述する references
- ウィザード Step の遷移図/画面設計の説明

本タスクの Phase 12 では、まず `outputs/phase-12/implementation-guide.md` に current facts を固定し、Phase 11 のスクリーンショット証跡と合わせて「仕様として確定」させる。
