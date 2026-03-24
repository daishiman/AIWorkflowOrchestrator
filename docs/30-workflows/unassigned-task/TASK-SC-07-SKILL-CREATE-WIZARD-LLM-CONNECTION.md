# TASK-SC-07: SkillCreateWizard への LLM 生成フロー接続

## 概要

SkillCreateWizard の4段階フローに planSkill/executePlan を接続する。
Phase 2 設計でスコープ外とした未タスク（R-2）。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION で SkillLifecyclePanel への接続を完了した。
SkillCreateWizard（GenerateStep）への接続は独立した別タスクで対応する。

## 変更対象ファイル

- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
- apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx

## 受入基準

- DescribeStep で「LLM で生成」を選択した場合、planSkill が呼ばれる
- GenerateStep で plan 結果が表示される
- 既存の「テンプレートから作成」フローは非破壊

## 参照

- Phase 3 設計レビュー（R-2）
- TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド
