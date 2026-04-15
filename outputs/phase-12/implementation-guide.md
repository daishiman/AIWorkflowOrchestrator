# Phase 12 成果物: 実装ガイド

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 1. 変更概要

スキルウィザードを LLM 専用に一本化し、Step 0 のラジオボタンと `generationMode` / `hasActivatedLlmMode` の二重管理を廃止した。
Step 0→1→2→3 の正規フローに統一し、Phase 11 のスクリーンショットも current task として再取得した。

## 2. 変更内容

### 2.1 `SkillCreateWizard.tsx`

- `generationMode` / `hasActivatedLlmMode` state を削除
- `handleStep0Next` は `goNext()` のみに統一
- `handleGenerate` は Step 1 を経由して Step 2 / Step 3 に進行
- `buildSkillContext()` を用いて LLM 生成コンテキストを組み立てる

### 2.2 `SkillInfoStep.tsx`

- 仕様外ラジオボタンを削除
- `generationMode` / `onGenerationModeChange` props を削除

### 2.3 `GenerateStep.tsx` / `wizard/index.ts`

- `GenerationMode` の public export を削除
- barrel 経由の旧 API を廃止

### 2.4 テスト

- `wizard-exports.test.ts` で `GenerationMode` 未公開を確認
- `SkillCreateWizard.test.tsx` に TC-06 を追加
- `SkillCreateWizard.store-integration.test.tsx` を復帰し `createSkill(..., context)` を確認

## 3. Phase 11 スクリーンショット

| ファイル                                               | 確認内容                            |
| ------------------------------------------------------ | ----------------------------------- |
| `outputs/phase-11/screenshots/step-0-no-radio.png`     | Step 0 でラジオボタンが表示されない |
| `outputs/phase-11/screenshots/step-1-conversation.png` | Step 0→1 の正規遷移                 |
| `outputs/phase-11/screenshots/step-1-questions.png`    | Q1〜Q6 の表示                       |
| `outputs/phase-11/screenshots/step-2-generating.png`   | 生成中状態                          |
| `outputs/phase-11/screenshots/step-3-complete.png`     | 完了状態                            |

補助メタデータ: `outputs/phase-11/phase11-capture-metadata.json`
スクリーンショット計画: `outputs/phase-11/screenshot-plan.json`

## 4. 検証結果

- `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/wizard-exports.test.ts src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` は PASS
- `SkillCreateWizard.store-integration.test.tsx` では `createSkill(formData.purpose, options, context)` の第三引数も確認済み
