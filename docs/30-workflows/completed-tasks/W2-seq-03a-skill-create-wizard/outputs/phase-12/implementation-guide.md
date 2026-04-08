# W2-seq-03a 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a                 |
| 作成日   | 2026-04-08                                 |
| 対象     | SkillCreateWizard オーケストレーション更新 |

---

## Part 1: 中学生向け説明

### 何を直したのか

スキル作成ウィザードを「AI中心の4ステップ」に整理しました。

1. スキル情報を入力する
2. 詳細を会話で決める
3. AIで生成する
4. 完了画面で次の行動を選ぶ

### 使いやすくなった点

- `slack` / `Slack` / `SLACK` のように大文字小文字が違っても、同じ意味として自動判定できる
- 生成中にボタンを連打しても、二重で生成が走らない
- 完了画面で生成先パス（`skillPath`）が見える
- 外部連携が必要なときだけチェックリストが出る
- 「やり直す」で最初の入力は残しつつ、生成結果まわりだけ初期化できる

### 「やり直す」時にどうなるか

- 残るもの: Step 0 で入力した内容（`formData`）
- 消えるもの: 回答内容・推論結果・生成先パス・外部連携表示情報

---

## Part 2: 技術者向け説明

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
- `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`

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

## Phase 11 証跡参照

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/evidence-index.md`
- `outputs/phase-11/screenshot-plan.md`
