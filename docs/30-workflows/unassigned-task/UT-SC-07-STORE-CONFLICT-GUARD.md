# UT-SC-07-STORE-CONFLICT-GUARD

## タスク名

Store 競合防止 UI 制御

## 概要

SkillCreateWizard と SkillLifecyclePanel が同一 agentSlice の generationState を共有するため、同時アクティブ時に状態が競合する可能性がある。

## 背景

- TASK-SC-07 で SkillCreateWizard に LLM 生成フローを追加
- SkillLifecyclePanel（TASK-SC-06）も同じ agentSlice を使用
- 現在の UI 設計では同時アクティブにならないが、将来の UI 変更時にリスクが顕在化する

## 対応方針

- 排他制御メカニズムの導入（例: generationOwner state で使用中コンポーネントを記録）
- または agentSlice の generationState をコンポーネント別に分離

## 優先度

低

## 検出元

TASK-SC-07 Phase 12 unassigned-task-report.md
