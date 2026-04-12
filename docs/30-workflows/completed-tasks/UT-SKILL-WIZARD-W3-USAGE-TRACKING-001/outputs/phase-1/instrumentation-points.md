# Phase 1 成果物: 計装ポイント一覧（P-1〜P-6）

## P-1: skill_wizard_open（マウント時）

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **発火場所**: 既存のマウント時 `useEffect`（依存配列 `[]`）内、`trackEvent("skill_wizard_started", {})` の直後
- **ペイロード**: `{ source: source ?? 'direct' }`
- **source prop**: `SkillCreateWizardProps` に `source?: 'lifecycle_panel' | 'direct'` を追加

## P-2: skill_wizard_step_complete（Step 0 完了）

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **発火場所**: `handleStep0Next` 関数内、`goNext()` 呼び出し前
- **ペイロード**: `{ step: 0, stepName: STEPS[0] }` = `{ step: 0, stepName: 'スキル情報入力' }`
- **補足**: `handleStep0NextFromLlm` にも同様に追加する

## P-3: skill_wizard_step_complete（Step 1 完了）

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **発火場所**: `handleGenerate` 関数内、既存 `trackEvent("skill_wizard_step1_completed", {...})` の直後
- **ペイロード**: `{ step: 1, stepName: STEPS[1] }` = `{ step: 1, stepName: '詳細設定' }`

## P-4: skill_wizard_step_complete（Step 2 完了）

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **発火場所**: `handleGenerate` の `goToStep(3)` 直前（生成完了後）、および `handleExecutePlan` の `goToStep(3)` 直前
- **ペイロード**: `{ step: 2, stepName: STEPS[2] }` = `{ step: 2, stepName: '生成' }`

## P-5: skill_wizard_abandon（アンマウント時）

- **ファイル**: `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- **発火場所**: 既存のアンマウント `useEffect` のクリーンアップ関数
- **ペイロード**: `{ lastStep: currentStepRef.current }`
- **制御**: `wizardCompletedRef.current === false` の場合のみ発火
- **実装**: `useRef<boolean>(false)` の `wizardCompletedRef` + `useRef<number>(0)` の `currentStepRef` を追加

## P-6: skill_wizard_next_action（CompleteStep ネクストアクション）

- **ファイル**: `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`
- **発火場所**: `nextActions` 配列の各アクションの `onClick` ハンドラ内
- **ペイロード**: `{ action: 'edit' | 'execute' | 'close' }`
- **マッピング**: `onExecuteNow` → `'execute'` / `onOpenInEditor` → `'edit'` / `onCreateAnother` → `'close'`
- **除外**: `onClose`（後方互換ボタン）クリック時は発火しない
