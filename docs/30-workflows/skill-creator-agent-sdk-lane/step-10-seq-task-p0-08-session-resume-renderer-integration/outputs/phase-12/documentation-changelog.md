# TASK-P0-08 documentation changelog

## Step 1-A: タスク完了記録

- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`: current root の close-out 導線更新 ✅
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`: TASK-P0-08 spec_created close-out 記録追加 ✅
- `.claude/skills/aiworkflow-requirements/LOGS.md`: 更新 ✅
- `.claude/skills/task-specification-creator/LOGS.md`: 更新 ✅
- `.claude/skills/aiworkflow-requirements/SKILL.md`: 変更履歴更新 ✅
- `.claude/skills/task-specification-creator/SKILL.md`: 変更履歴更新 ✅
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`: セッション復元セクション追加 ✅
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`: セッション復元キーワード更新 ✅

## Step 1-B: 実装状況テーブル更新

- TASK-P0-08: `spec_created` を維持 / `completed` へ昇格しない ✅

## Step 1-C: 関連タスクテーブル更新

- UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001: Phase 11 手動テスト完了、open 状態で維持 ✅

## Step 2: システム仕様更新

- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`: session resume / preload bridge 追記 ✅
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`: SkillCreatorSessionApi 利用面を追記 ✅

## Validation / current-baseline

- validate-phase12-implementation-guide.js: PASS
- verify-unassigned-links.js: PASS
- currentViolations.total: 0
- baselineViolations.total: 0
- planned wording: 0件

## 実装で特筆すべき点

- `vi.hoisted()` を使用して IPC mock の巻き上げ問題を解消した（`vi.mock` ファクトリ内から `mockInvoke` 変数を参照できない問題）
- esbuild バイナリバージョン不一致（`0.21.5` vs `0.25.12`）を `pnpm rebuild esbuild` で解消した
- `SkillCreatorSessionListItem` の `createdAt` フィールド欠如（TECH-M-01）を Phase 5 で解消し、WorkflowEngine と Facade の両経路に伝播させた
