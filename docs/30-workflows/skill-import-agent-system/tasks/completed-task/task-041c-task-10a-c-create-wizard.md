---
id: TASK-10A-C
tier: 2
title: SkillCreateWizard 実装
phase: 10
depends_on: [TASK-9B]
parallel_with: [TASK-10A-A, TASK-10A-B]
blocks: [TASK-10A-D]
status: completed
priority: high
estimated_complexity: medium
tags: [frontend, renderer, ui, wizard]
---

# SkillCreateWizard 実装

## 概要

新規スキル作成フローを4ステップのウィザード UI として実装し、`skill:create` IPC で Main の SkillService へ接続する。

## 実装成果物

| 操作 | パス                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| 作成 | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                |
| 作成 | `apps/desktop/src/renderer/components/skill/wizard/`                              |
| 作成 | `apps/desktop/src/renderer/components/skill/hooks/useWizardStep.ts`               |
| 作成 | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` |
| 修正 | `apps/desktop/src/main/services/skill/SkillService.ts`                            |
| 修正 | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      |
| 修正 | `apps/desktop/src/preload/channels.ts`                                            |
| 修正 | `apps/desktop/src/preload/skill-api.ts`                                           |

## 機能仕様（実装反映済み）

- Step 1: 説明入力（空文字不可）
- Step 2: 生成オプション設定（`generateTasks` / `addAgents` / `addReferences`）
- Step 3: 生成中表示とエラー表示
- Step 4: 完了表示（生成パス表示）
- Main側では `SkillCreatorService.createSkill()` に委譲し、`addAgents` / `addReferences` は `agents/` / `references/` 初期化として反映

## 検証

| 項目                | 結果                          |
| ------------------- | ----------------------------- |
| 単体テスト          | PASS                          |
| Phase 11 手動テスト | PASS（スクリーンショット8件） |
| Phase 12 文書同期   | PASS                          |

## 関連ワークフロー

- `docs/30-workflows/completed-tasks/skill-create-wizard/`
