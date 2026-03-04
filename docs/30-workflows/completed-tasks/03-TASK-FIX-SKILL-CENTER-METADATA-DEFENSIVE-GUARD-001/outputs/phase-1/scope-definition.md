# Phase 1 スコープ定義（再監査版）

更新日: 2026-03-04

## 対象（In Scope）

- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/` 配下テスト
- `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-1..12`
- `.claude/skills/aiworkflow-requirements/references/*.md`（本タスク反映先）

## 非対象（Out of Scope）

- 新規機能追加（検索仕様拡張、UIテーマ刷新など）
- Main Process の新規 IPC チャンネル追加
- コミット/PR 作成

## SubAgent 分離（関心ごと分離）

- SubAgent-A: Hook/状態管理防御（`useSkillCenter`, `useFeaturedSkills`）
- SubAgent-B: UI描画防御（`SkillCard`, `SkillDetailPanel`）
- SubAgent-C: 仕様同期・検証自動化（Phase 12 / scripts 実行）

## 依存

- `/.claude/skills/task-specification-creator/`
- `/.claude/skills/aiworkflow-requirements/`
- 依存タスク: 01（reconciliation）, 02（idempotency）
