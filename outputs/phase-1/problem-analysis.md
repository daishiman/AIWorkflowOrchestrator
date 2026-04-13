# Phase 1: 問題分析書

## タスクID: TASK-SW-FIX-FEEDBACK-001

## 問題6: スキル一覧にリアルタイム反映されない（全般）

- 根本原因: LLMモードの handleExecutePlan が api.executePlan() を直接呼ぶため fetchSkills が未呼び出し
- templateモードは createSkill (agentSlice.ts:1125) が内部で fetchSkills を自動実行済み
- 修正箇所: SkillCreateWizard.tsx の handleExecutePlan 成功パス末尾

## 問題8: LLMモード完了後に fetchSkills() が呼ばれない

- 根本原因: handleExecutePlan の成功パス (goToStep(3) 直前) に useFetchSkills フックの呼び出しがない
- 影響範囲: LLMモード専用パスのみ（templateモードは非影響）
- 修正: `useFetchSkills` を import して `await fetchSkills()` を追加

## 問題14: skillPath = null のままStep 3到達でサイレント失敗

- 根本原因: CompleteStep コンポーネントに skillPath === null のガード処理がない
- 現状: skillPath が null でも成功UIが表示されユーザーが誤認する
- 修正: アーリーリターンで エラーUI（「スキルの生成に失敗しました」）を表示

## 問題20: skillPath = null でも成功ヘッダーが表示される

- 根本原因: CompleteStep.tsx の成功ヘッダーが skillPath の値に関わらず無条件表示
- 現状: HEADER_MESSAGE「スキルの骨格を生成しました」が skillPath=null でも表示
- 修正: skillPath === null の場合はアーリーリターンし成功ヘッダーを表示しない
