# UT-SC-07-AUTH-MODE-API-KEY-IMPL

## タスク名

planSkill/executePlan の authMode・apiKey パラメータ実装

## 概要

planSkill と executePlan の Preload API は authMode と apiKey を optional パラメータとして受け付けるが、現在の SkillCreateWizard / SkillLifecyclePanel では未使用のまま。

## 背景

- `skill-creator-api.ts` の planSkill シグネチャ: `planSkill(prompt, authMode?, apiKey?)`
- `skill-creator-api.ts` の executePlan シグネチャ: `executePlan(planId, skillSpec, authMode?, apiKey?)`
- TASK-SC-06/SC-07 では authMode/apiKey を渡さずに呼び出している

## 対応方針

- LLM プロバイダー設定画面から authMode/apiKey を取得する仕組みを構築
- Settings Store または環境変数から読み取り、planSkill/executePlan に渡す

## 優先度

中

## 検出元

TASK-SC-07 Phase 12 unassigned-task-report.md
