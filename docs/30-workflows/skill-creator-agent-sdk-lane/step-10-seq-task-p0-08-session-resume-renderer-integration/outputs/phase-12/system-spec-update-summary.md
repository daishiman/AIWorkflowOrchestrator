# Phase 12: システム仕様書更新サマリー

## current contract / target delta 分離

### current contract (TASK-P0-08 で確定した仕様)

| 項目                  | 仕様                                                   |
| --------------------- | ------------------------------------------------------ |
| 新規 IPC チャンネル数 | 4件（list / resume / get-detail / delete）             |
| 新規型定義            | `SkillCreatorSessionListItem.createdAt` フィールド追加 |
| Preload API           | `window.skillCreatorAPI` に 4メソッド追加              |
| セッション TTL        | 24時間（`SkillCreatorWorkflowEngine` 内定数）          |
| renderer 側永続化     | なし（localStorage / sessionStorage 使用禁止）         |
| 互換性判定            | Facade に委譲（IPC 層で再実装しない）                  |

### target delta (今回 wave で更新した範囲)

| 対象ファイル                                                         | 更新内容                                                |
| -------------------------------------------------------------------- | ------------------------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                          | `SkillCreatorSessionListItem` に `createdAt` 追加       |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `SkillCreatorSessionApi` インターフェース・実装 4件追加 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | セッション検出 useEffect・ハンドラ統合                  |

### no-op 判定 (今回 wave で変更しなかった範囲)

| 対象                      | 理由                                           |
| ------------------------- | ---------------------------------------------- |
| `useInterviewState`       | P0-06 管轄、ephemeral UI 状態は変更対象外      |
| `ConversationalInterview` | P0-06 管轄、インタビューフロー自体は変更対象外 |
| セッション TTL 設定 UI    | 本タスクスコープ外（未タスクとして追跡）       |

## Step 1-A: タスク完了記録

| ファイル                                                                       | 更新内容                               | 状態   |
| ------------------------------------------------------------------------------ | -------------------------------------- | ------ |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | TASK-P0-08 close-out 導線追加          | 更新済 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | TASK-P0-08 spec_created close-out 記録 | 更新済 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                               | 完了エントリ追加                       | 更新済 |
| `.claude/skills/task-specification-creator/LOGS.md`                            | close-out エントリ追加                 | 更新済 |
| `.claude/skills/aiworkflow-requirements/SKILL.md`                              | 変更履歴更新                           | 更新済 |
| `.claude/skills/task-specification-creator/SKILL.md`                           | 変更履歴更新                           | 更新済 |
| `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  | セッション復元セクション追加           | 更新済 |
| `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                 | セッション復元キーワード更新           | 更新済 |

## Step 1-B: 実装状況テーブル更新

- TASK-P0-08: `spec_created` を維持（`completed` へ昇格しない）
- 理由: Phase 13 PR 作成はユーザーの明示承認後に実施

## Step 1-C: 関連タスクテーブル更新

| タスク                                   | 更新内容                                            |
| ---------------------------------------- | --------------------------------------------------- |
| UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 | TASK-P0-08 Phase 11 手動テスト完了、open 状態で維持 |

## Step 2: システム仕様更新

新規インターフェース（`SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` / `SkillCreatorSessionApi`）が追加されたため **Step 2 実施**。

| 対象ファイル                                                                                | 更新内容                                       |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                  | session resume / preload bridge セクション追記 |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorSessionApi 利用面追記              |
