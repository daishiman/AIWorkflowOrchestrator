# Phase 12: 実装ガイド（implementation-guide.md）— UT-SKILL-WIZARD-W1-par-02b / UT-SKILL-WIZARD-W2-seq-03a

## メタ情報

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-W1-par-02b / UT-SKILL-WIZARD-W2-seq-03a     |
| 作成日   | 2026-04-08                                                  |
| 対象     | Skill Create Wizard（Step 0〜3 のオーケストレーション全体） |

---

## Part 1: 中学生向け説明

### 何を直したのか

スキル作成ウィザードを「AI中心の4ステップ」に整理しました。

1. スキル情報を入力する
2. 詳細を会話で決める（6問）
3. AI で生成する
4. 完了画面で次の行動を選ぶ

「スキルを作るウィザード」を、アンケートみたいに 6つの質問で順番に答える形にし、テンプレートから選ぶ方式を廃止して AI が全部考えてくれる方式（LLM 専用）にしました。

### 使いやすくなった点

- `slack` / `Slack` / `SLACK` のように大文字小文字が違っても、同じ意味として自動判定できる
- 生成中にボタンを連打しても、二重で生成が走らない
- 完了画面で生成先パス（`skillPath`）が見える
- 外部連携が必要なときだけチェックリストが出る
- 「やり直す」で最初の入力は残しつつ、生成結果まわりだけ初期化できる
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

### 「やり直す」時にどうなるか

- 残るもの: Step 0 で入力した内容（`formData`）
- 消えるもの: 回答内容・推論結果・生成先パス・外部連携表示情報

## Part 2: 技術者向け説明

### 目的と変更点（要約）

- Step 0（DescribeStep → SkillInfoStep）に `SkillCategory` 選択を追加し、Step 1（ConversationRoundStep）へカテゴリを引き渡す
- template モードは廃止し、LLM 生成専用のオーケストレーションに更新
- `formData` / `answers` / `smartDefaults` / `generationMethod` / `skillPath` / `hasExternalIntegration` / `externalToolName` の 7 つの state を追加
- `inferSmartDefaults` 純粋関数を実装し、purpose テキストとカテゴリからスマートデフォルトを推論
- `handleStep0Next` / `handleGenerate(method)` / `handleQualityFeedback` / `handleRetry` の 4 つのハンドラを追加
- STEPS 配列を `["スキル情報入力", "詳細設定", "生成", "完了"]` に更新

### 対象ファイル

- `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx`
  - `category?: SkillCategory | null` と `onCategoryChange?: (value: SkillCategory | null) => void` を追加
  - `select#skill-category` でカテゴリ選択（未選択/自動化/外部連携/データ分析/コード支援/その他）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `category` state を追加し、DescribeStep に接続
  - `smartDefaults` state を追加し、`inferSmartDefaults({ purpose, category })` を実行して Step 1 に渡す
  - `ConversationRoundStep` へ `formData` を渡す
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
  - `skillPath` / `hasExternalIntegration` / `externalToolName` / action cards / `onRetry` props を追加
  - `onClose` を optional に変更
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`
  - `generationMode` prop を廃止
- `apps/desktop/src/renderer/components/skill/wizard/index.ts`
  - `SkillInfoStep` の export を追加
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
  - 6問・2ページ、`InterviewProgressBar` 常時表示（Page1: 1/6, Page2: 4/6）
  - smartDefaults は初回描画時に answers へ反映（以降はユーザー入力を優先）
  - cron 検証は renderer で動く browser-safe な 5-field validator を使用
  - Q3 を「定期実行」以外へ切替時、`scheduleConfig` を `undefined` にクリア
  - 「今すぐ生成する」で `ApplySummaryCard` を表示し、確認後 `onGenerate("skip")`
- `apps/desktop/src/renderer/components/skill/wizard/InterviewProgressBar.tsx`
  - `質問 N/6` + `role="progressbar"` のバー表示
- `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`
  - 未回答問の smartDefaults を key-based マッピング（`q1..q6` -> `who..format`）で一覧表示
  - `category === "external-integration"` かつ Q5 未回答の場合に警告（ブロックしない）

## 主要 state

- `formData: SkillInfoFormData`
- `answers: ConversationAnswers`
- `smartDefaults: SmartDefaultResult | null`
- `generationMethod: "complete" | "skip"`
- `isGenerating: boolean`
- `error: Error | null`
- `skillPath: string | null`
- `hasExternalIntegration: boolean`
- `externalToolName: string | null`
- `generationLockRef: Ref<boolean>` は再入防止用の補助フラグ

## inferSmartDefaults の現在仕様

- `purpose` を小文字化して判定する（大小文字不問）
- `slack` / `github` / `notion` を検出して `tool` を設定
- `毎日` / `毎週` / `定期` / `スケジュール` を検出して `timing="scheduled"`
- `リアルタイム` / `即座` / `すぐに` を検出して `timing="realtime"`
- `category==="code-support"` で `format="code"`
- `category==="data-analysis"` で `format="structured"`
- 推論根拠は `inferenceLog` に格納

## ハンドラ仕様

### `handleStep0Next()`

- `inferSmartDefaults(formData)` を実行
- `smartDefaults` を保存
- `answers.q5` と推論結果から `hasExternalIntegration` / `externalToolName` の初期値を設定
- Step 1 へ遷移

### `handleGenerate(method)`

- 先頭で `generationLockRef` と `isGenerating` を確認し、`true` なら return（再入防止）
- 生成開始前に `clearGenerationState()` で前回のストア状態を初期化する
- Step 1 の回答とスマートデフォルトから外部連携状態を再計算する
- `generationMethod` を保存
- Step 2（生成中）へ遷移
- 生成 API 実行後、`skillPath` を保存
- 成功時に `hasExternalIntegration` / `externalToolName` を確定する
- Step 3（完了）へ遷移

### `handleRetry()`

- Step 0 へ戻す
- 下記 state をリセットする:
  - `answers`
  - `smartDefaults`
  - `skillPath`
  - `hasExternalIntegration`
  - `externalToolName`
  - `error`
  - `generationMethod`
  - `isGenerating`
- `clearGenerationState()` で generation store も初期化する
- `formData` は保持する

## CompleteStep 表示仕様

- `skillPath` を表示する
- `hasExternalIntegration===true` のときだけ外部連携チェックリストを表示する
- `externalToolName` があればチェックリスト文言にツール名を使う

## GenerateStep 仕様

- `generationMode` prop は廃止
- 進捗表示は LLM 生成専用として扱う

## 注意事項

- smartDefaults の反映タイミングは「初回描画時のみ」。Step 0 に戻って description を変えても、Step 1 で既に回答している場合は自動上書きしない（ユーザー回答優先）。
- Q5 の「必須」は表示と警告に限定する（生成のブロックはしない）。
- cron のバリデーションは UI 上でのフィードバック用途。renderer で動く browser-safe な 5-field validator を使い、実行スケジューラの厳密性とは別（必要なら後続タスクで統一）。
- `inferSmartDefaults` は Step 0 完了時（`handleStep0Next`）に1回だけ実行される。
- Step 1 で回答を変えても `inferSmartDefaults` は再実行しない（ユーザー入力優先）。
- `generationMode` prop は `GenerateStep` から完全削除し、後方互換性を持たせない。

## Phase 11 証跡参照

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/evidence-index.md`
- `outputs/phase-11/screenshot-plan.md`
- `outputs/phase-11/screenshot-plan.json`
- `outputs/phase-11/phase11-capture-metadata.json`
- `outputs/phase-11/screenshots/`（Step 0〜3 の UI 状態を示す PNG 群）
