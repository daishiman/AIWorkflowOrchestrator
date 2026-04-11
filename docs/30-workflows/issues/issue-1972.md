# [#1972] refactor: Session IPC dead code クリーンアップ (TASK-UI-SESSION-CLEANUP-01)

## メタ情報

```yaml
issue_number: 1972
title: refactor: Session IPC dead code クリーンアップ (TASK-UI-SESSION-CLEANUP-01)
state: OPEN
priority: 低
scale: 小規模
category: リファクタリング
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1972
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

TASK-UI-02 で stub 化された Session IPC スタック（`SkillCreatorIpcBridge` / `SKILL_CREATOR_SESSION_CHANNELS` / `skillCreatorSession` preload エントリ / `skill-creator/` 配下コンポーネント群）を段階的に完全削除し、コードベースをクリーンな状態へ戻す。

## 問題点

1. **`SkillCreatorIpcBridge.ts` が dead code として存在**  
   `index.ts` でインスタンス化されておらず、どこからも呼ばれない（308行が無駄）

2. **`preload/types.ts` の `ElectronAPI` に不要プロパティが残存**  
   `skillCreatorSession: import("./skill-creator-session-api").SkillCreatorSessionAPI` が残り、Renderer 側で no-op アクセスしても型エラーが発生しない

3. **`skill-creator/` 配下に `export {}` のみのスタブが5ファイル残存**  
   `ChoiceButton.tsx` / `ConversationProgress.tsx` / `FreeTextInput.tsx` / `QuestionCard.tsx` / `SkillCreatorResultPanel.tsx`

## 削除対象

- `apps/desktop/src/main/services/runtime/SkillCreatorIpcBridge.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorIpcBridge.test.ts`
- `apps/desktop/src/preload/skill-creator-session-api.ts`
- `apps/desktop/src/preload/types.ts` の `skillCreatorSession` プロパティ行
- `apps/desktop/src/preload/index.ts` の `skillCreatorSessionAPI` 参照行
- `apps/desktop/src/renderer/components/skill-creator/` 配下スタブ5ファイル
- 対応テストファイル群

## 実施順序（型依存グラフに沿った段階的削除）

1. Phase 1: 依存確認・参照洗い出し
2. Phase 2: preload の型・参照除去 → `skill-creator-session-api.ts` git rm
3. Phase 3: `SkillCreatorIpcBridge.ts` と `skill-creator/` スタブファイル git rm

## 仕様書

`docs/30-workflows/unassigned-task/task-session-ipc-dead-code-cleanup.md`

## タスクID

TASK-UI-SESSION-CLEANUP-01

## 優先度

LOW

## 見積もり規模

小規模

## 発見元

TASK-UI-02 Phase 5, 8 未タスク検出
