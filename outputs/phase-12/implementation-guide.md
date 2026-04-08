# Phase 12: 実装ガイド（implementation-guide.md）— UT-SKILL-WIZARD-W1-par-02b

## メタ情報

- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 対象: Skill Create Wizard（Step 0: DescribeStep / Step 1: ConversationRoundStep）
- 作成日: 2026-04-08

## Part 1: 中学生レベルの概念説明

### 何が変わったの？

「スキルを作るウィザード」を、アンケートみたいに 6つの質問で順番に答える形にしました。

- まず Step 0 で「このスキルは何をする？」を文章で書きます
- さらに「カテゴリ（自動化、外部連携など）」も選べます
- 次に Step 1 で 6問に答えると、スキルの設定が決まっていきます

### どうしてカテゴリが必要？

カテゴリは「この質問（Q5: 外部ツール連携）が重要かどうか」を判断する材料です。

- 外部連携カテゴリなら「Q5 は必須」だと分かる
- それ以外なら「Q5 は任意」でもよい

### smartDefaults（スマートデフォルト）って何？

最初に書いた説明文やカテゴリから、よくある答えを先に「予測して入れておく」仕組みです。

例:

- 説明文に「毎日」「定期」などが入っていれば、Q3 は「定期実行」になりやすい
- 「Slack」「GitHub」などが入っていれば、Q5 の候補が絞りやすい

ただし、予測はあくまで「助け」なので、あとでユーザーが自由に上書きできます。

### 「今すぐ生成する」って何？

質問に全部答えなくても、途中で「今すぐ生成する」を押せます。

- まだ答えていない質問があると、smartDefaults を「こう入れますよ」という確認カードが出ます
- 外部連携カテゴリなのに Q5 を空にしている場合だけ、警告が出ます（生成をブロックはしない）

## Part 2: 技術者向け説明

### 目的と変更点（要約）

- Step 0（DescribeStep）に `SkillCategory` 選択を追加し、Step 1（ConversationRoundStep）へカテゴリを引き渡す
- template モードでは Step 0 の入力（description + category）から `SmartDefaultResult` を推論して Step 1 に渡す
- Step 1（ConversationRoundStep）は 6問・2ページのインタビュー UI として実装し、Q3 で cron 入力、Q5 でカテゴリ依存の必須表示、サマリーカード表示を行う

### 主な実装ファイル（current facts）

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
  - `category?: SkillCategory | null` と `onCategoryChange?: (value: SkillCategory | null) => void` を追加
  - `select#skill-category` でカテゴリ選択（未選択/自動化/外部連携/データ分析/コード支援/その他）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `category` state を追加し、DescribeStep に接続
  - `smartDefaults` state を追加し、template モードで `inferSmartDefaults({ purpose, category })` を実行して Step 1 に渡す
  - `ConversationRoundStep` へ `formData={{ purpose: description, category } as SkillInfoFormData}` を渡す
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
  - 6問・2ページ、`InterviewProgressBar` 常時表示（Page1: 1/6, Page2: 4/6）
  - smartDefaults は初回描画時に answers へ反映（以降はユーザー入力を優先）
  - cron 検証は renderer で動く browser-safe な 5-field validator を使用
  - `onAnswersChange` は `useEffect` で `internalAnswers` の変更に追従
  - Q3 を「定期実行」以外へ切替時、`scheduleConfig` を `undefined` にクリア
  - 「今すぐ生成する」で `ApplySummaryCard` を表示し、確認後 `onGenerate("skip")`
- `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`
  - `質問 N/6` + `role="progressbar"` のバー表示
- `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`
  - 未回答問の smartDefaults を key-based マッピング（`q1..q6` -> `who..format`）で一覧表示
  - `category === "external-integration"` かつ Q5 未回答の場合に警告（ブロックしない）

### 型（shared contracts）

以下は `packages/shared/src/types/skillCreator.ts` の「Skill Wizard Shared Contracts」セクションを参照する。

- `SkillCategory`
- `SkillInfoFormData`
- `ConversationAnswers` / `QuestionAnswer`
- `SkillWizardScheduleConfig`
- `SmartDefaultResult`（`inferenceLog?: string[]` を含む）

### 仕様上の重要な挙動

- smartDefaults の反映タイミングは「初回描画時のみ」。Step 0 に戻って description を変えても、Step 1 で既に回答している場合は自動上書きしない（ユーザー回答優先）。
- Q5 の「必須」は表示と警告に限定する（生成のブロックはしない）。
- cron のバリデーションは UI 上でのフィードバック用途。renderer で動く browser-safe な 5-field validator を使い、実行スケジューラの厳密性とは別（必要なら後続タスクで統一）。

### Phase 11 スクリーンショット（証跡）

Phase 11 の視覚証跡は `outputs/phase-11/` 配下に保存する。

- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshots/`（本タスクの UI 状態を示す PNG 群）

本ファイルは、上記の証跡が current task（`UT-SKILL-WIZARD-W1-par-02b`）として更新されている前提で記述している。
