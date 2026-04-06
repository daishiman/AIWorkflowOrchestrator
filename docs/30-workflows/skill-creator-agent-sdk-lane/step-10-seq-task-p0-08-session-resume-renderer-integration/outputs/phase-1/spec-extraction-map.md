# Phase 1: spec-extraction-map

## system spec と current code anchor の対応

| AC   | 説明                                       | 実装ファイル                                      | 状態      |
| ---- | ------------------------------------------ | ------------------------------------------------- | --------- |
| AC-1 | 未完了セッション自動検出                   | SkillLifecyclePanel.tsx: detectSessions useEffect | ○実装済み |
| AC-2 | SessionResumePrompt 表示・復元ボタン       | SessionResumePrompt.tsx                           | ○実装済み |
| AC-3 | resumeSession 呼び出し・継続               | SkillLifecyclePanel.tsx: handleSessionResume      | ○実装済み |
| AC-4 | deleteSession → 新規開始                   | SkillLifecyclePanel.tsx: handleSessionDelete      | ○実装済み |
| AC-5 | SessionIndicator: session_id・経過時間     | SessionIndicator.tsx                              | ○実装済み |
| AC-6 | TTL クリーンアップ                         | RuntimeSkillCreatorFacade.ts: listSessions 内     | ○実装済み |
| AC-7 | session_id を SDK resume/continue へ再利用 | creatorHandlers.ts: RESUME_SESSION handler        | ○実装済み |
| AC-8 | 非互換時の警告バッジ・フォールバック       | SessionResumePrompt.tsx: compatibilityBadge       | ○実装済み |
| AC-9 | IPC 経由のセッション操作                   | creatorHandlers.ts (TASK-P0-08 section)           | ○実装済み |

## P0-06 / P0-08 責務境界

| 状態種類                                   | 責務  | 保持レイヤー    |
| ------------------------------------------ | ----- | --------------- |
| 一時状態 (messages, currentStepIndex 等)   | P0-06 | Renderer メモリ |
| 永続状態 (workflowSnapshot, session_id 等) | P0-08 | Main + SQLite   |
