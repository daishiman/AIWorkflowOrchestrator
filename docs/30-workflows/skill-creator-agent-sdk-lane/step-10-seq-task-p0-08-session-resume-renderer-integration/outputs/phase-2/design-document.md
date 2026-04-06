# Phase 2: 設計ドキュメント

## IPC 4層設計

| 層                | ファイル                                                         | 内容                                                                               |
| ----------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1. 定数定義       | `apps/desktop/src/preload/channels.ts`                           | SKILL_CREATOR_LIST_SESSIONS / RESUME_SESSION / DELETE_SESSION / GET_SESSION_DETAIL |
| 2. ホワイトリスト | `apps/desktop/src/preload/channels.ts` (ALLOWED_INVOKE_CHANNELS) | 4チャンネル全て登録済み                                                            |
| 3. ハンドラ登録   | `apps/desktop/src/main/ipc/creatorHandlers.ts`                   | ipcMain.handle 4件                                                                 |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts`                  | skillCreatorAPI に4メソッド追加                                                    |

## 型定義

```typescript
// packages/shared/src/types/skillCreator.ts に追加済み
export interface SkillCreatorSessionListItem {
  checkpointId: string;
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  checkpointType: SkillCreatorCheckpointType;
  compatibility: ResumeCompatibilityResult;
  createdAt: number; // 追加
  updatedAt: number;
}
```

## コンポーネントトポロジー

```
SkillLifecyclePanel.tsx（修正済み）
├── useEffect[]: 起動時 listSessions() → setResumableSessions → setShowResumePrompt
├── SessionResumePrompt（実装済み）
│   ├── Props: sessions, isLoading, onResume, onSkip, onDelete
│   └── UI: セッション一覧 + 復元/削除ボタン + 互換性バッジ
└── SessionIndicator（実装済み）
    ├── Props: planId, currentPhase, startedAt
    └── UI: planId先頭8文字 + フェーズ + 経過時間 + pulseアニメーション
```

## セッション復元フロー

1. アプリ起動 → `detectSessions()` → `listSessions()` IPC
2. sessions.length > 0 → `showResumePrompt = true`
3. 「復元」クリック → `resumeSession(checkpointId)` → `setWorkflowSnapshot`
4. 「削除」クリック → `deleteSession(checkpointId)` → リストから除外
5. 「スキップ」クリック → `showResumePrompt = false`
