# Phase 5: 実装

## メタ情報

| 項目      | 値         |
| --------- | ---------- |
| Phase     | 5          |
| Phase名   | 実装       |
| カテゴリ  | 実装       |
| 前提Phase | Phase 4    |
| 後続Phase | Phase 6    |
| 作成日    | 2026-04-06 |

## 目的

Phase 4 のテストケースに対して、TDD グリーン（テスト PASS）を達成する実装を行う。
薄いIPCラッパー原則を遵守し、新規ファイルと修正ファイルの一覧を明示した上で実装する。

---

## 実装計画

### 新規作成ファイル

| ファイルパス                                                                        | 役割                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`                | セッション復元プロンプト UI コンポーネント |
| `apps/desktop/src/renderer/components/skill/SessionIndicator.tsx`                   | アクティブセッション表示コンポーネント     |
| `apps/desktop/src/renderer/components/skill/__tests__/SessionResumePrompt.test.tsx` | SessionResumePrompt ユニットテスト         |
| `apps/desktop/src/renderer/components/skill/__tests__/SessionIndicator.test.tsx`    | SessionIndicator ユニットテスト            |
| `apps/desktop/src/__tests__/session-resume-ipc.test.ts`                             | IPC 統合テスト                             |

### 修正ファイル

| ファイルパス                                                         | 変更内容                                                                  |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `packages/shared/src/ipc/channels.ts`                                | セッション関連チャンネル定数の追加（RT-06 定義済みの場合は参照のみ）      |
| `packages/shared/src/types/skillCreator.ts`                          | `SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` 型の追加 |
| `apps/desktop/src/main/ipc/index.ts`                                 | セッション復元 IPC ハンドラー 4 件の追加                                  |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | セッション関連 Preload API メソッドの追加                                 |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 起動時セッション検出フローの統合                                          |

---

## 実行タスク

### ステップ1: `packages/shared/` 型定義の追加（最初に実施）

`packages/shared/src/types/skillCreator.ts` に以下を追加する（既存型を確認してから追加）:

```typescript
export interface SkillCreatorSessionSummary {
  sessionId: string;
  skillName: string;
  lastActivityAt: string; // ISO 8601
  stepProgress: { current: number; total: number };
  isCompatible: boolean;
}

export interface SkillCreatorSessionResumeResult {
  success: boolean;
  workflowSnapshot?: SkillCreatorWorkflowUiSnapshot;
  errorReason?: "incompatible" | "expired" | "not_found";
}
```

**注意**: 既存の `SkillCreatorWorkflowUiSnapshot` 型が存在するか確認してから参照する。

### ステップ2: IPC チャンネル定数の追加

`packages/shared/src/ipc/channels.ts` に追加（TASK-RT-06 で未定義の場合のみ）:

```typescript
// セッション復元関連チャンネル（TASK-P0-08 追加）
export const SKILL_CREATOR_LIST_SESSIONS =
  "skill-creator:list-sessions" as const;
export const SKILL_CREATOR_RESUME_SESSION =
  "skill-creator:resume-session" as const;
export const SKILL_CREATOR_DELETE_SESSION =
  "skill-creator:delete-session" as const;
export const SKILL_CREATOR_CLEANUP_SESSIONS =
  "skill-creator:cleanup-expired-sessions" as const;
```

### ステップ3: Main 側 IPC ハンドラー追加（薄いラッパー原則遵守）

`apps/desktop/src/main/ipc/index.ts` に追加:

```typescript
// セッション復元 IPC（TASK-P0-08 追加）
// 注意: ビジネスロジックはすべて RuntimeSkillCreatorFacade に委譲する
ipcMain.handle(SKILL_CREATOR_LIST_SESSIONS, async (_event) => {
  return facade.listSessions();
});

ipcMain.handle(
  SKILL_CREATOR_RESUME_SESSION,
  async (_event, sessionId: string) => {
    return facade.resumeSession(sessionId);
  },
);

ipcMain.handle(
  SKILL_CREATOR_DELETE_SESSION,
  async (_event, sessionId: string) => {
    return facade.deleteSession(sessionId);
  },
);

ipcMain.handle(SKILL_CREATOR_CLEANUP_SESSIONS, async (_event) => {
  return facade.cleanupExpiredSessions();
});
```

**禁止実装パターン**:

```typescript
// 禁止: IPC ハンドラー内に DB アクセスを書く
ipcMain.handle(SKILL_CREATOR_LIST_SESSIONS, async (_event) => {
  return await db.sessions.findAll(); // ← Facade を経由しない直接 DB アクセス（禁止）
});
```

### ステップ4: Preload API 追加

`apps/desktop/src/preload/skill-creator-api.ts` に追加:

```typescript
// contextBridge 経由でセッション復元 API を公開
listSessions: (): Promise<SkillCreatorSessionSummary[]> =>
  ipcRenderer.invoke(SKILL_CREATOR_LIST_SESSIONS),
resumeSession: (sessionId: string): Promise<SkillCreatorSessionResumeResult> =>
  ipcRenderer.invoke(SKILL_CREATOR_RESUME_SESSION, sessionId),
deleteSession: (sessionId: string): Promise<void> =>
  ipcRenderer.invoke(SKILL_CREATOR_DELETE_SESSION, sessionId),
cleanupExpiredSessions: (): Promise<number> =>
  ipcRenderer.invoke(SKILL_CREATOR_CLEANUP_SESSIONS),
```

また、`apps/desktop/src/preload/index.ts` の `allowedChannels` / `validChannels` に追加する（IPC 4層整合）。

### ステップ5: `SessionResumePrompt.tsx` 実装

必須の `data-testid` 属性:

- `data-testid="session-resume-prompt"`
- `data-testid="session-list"`
- `data-testid="session-item-{sessionId}"`
- `data-testid="session-resume-btn-{sessionId}"`
- `data-testid="session-skip-btn-{sessionId}"`
- `data-testid="session-incompatible-warning"`
- `data-testid="session-start-new-btn"`

### ステップ6: `SessionIndicator.tsx` 実装

必須の `data-testid` 属性:

- `data-testid="session-indicator"`
- `data-testid="session-indicator-pulse"`
- `data-testid="session-id-display"`
- `data-testid="session-elapsed-time"`

### ステップ7: `SkillLifecyclePanel.tsx` 統合

追加するロジック（P0-06 の既存実装を変更しない。追加のみ行う）:

```typescript
useEffect(() => {
  const detectSessions = async () => {
    try {
      const sessions = await window.skillCreatorSessionApi.listSessions();
      if (sessions.length > 0) {
        setResumableSessions(sessions);
        setShowResumePrompt(true);
      }
    } catch (e) {
      // listSessions 失敗時はログのみ（UI への影響なし）
      console.error("[P0-08] listSessions failed:", e);
    }
  };
  detectSessions();
}, []); // アプリ起動時のみ実行
```

### ステップ8: テスト実行・確認

```bash
# SessionResumePrompt ユニットテスト
pnpm --filter @repo/desktop test -- --testPathPattern="SessionResumePrompt"

# SessionIndicator ユニットテスト
pnpm --filter @repo/desktop test -- --testPathPattern="SessionIndicator"

# IPC 統合テスト
pnpm --filter @repo/desktop test -- --testPathPattern="session-resume-ipc"

# SkillLifecyclePanel 統合テスト
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"

# 型チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

---

## 参照資料

| 資料名          | パス                                                                                  | 説明                |
| --------------- | ------------------------------------------------------------------------------------- | ------------------- |
| Phase 2 設計    | `phase-2-design.md`                                                                   | IPC 4層設計・型定義 |
| Phase 4 テスト  | `outputs/phase-4/test-matrix.md`                                                      | テストケース一覧    |
| index.md        | `index.md`                                                                            | 想定変更ポイント    |
| unassigned spec | `docs/30-workflows/unassigned-task/TASK-P0-08-session-resume-renderer-integration.md` | 実装詳細            |

---

## 成果物

実装で作成・修正されるファイルが成果物。`artifacts.json` の Phase 5 に記録する。

---

## 統合テスト連携【必須】

| 判定項目                  | 基準 | 備考                                                 |
| ------------------------- | ---- | ---------------------------------------------------- |
| ユニットテスト Line       | 80%+ | SessionResumePrompt / SessionIndicator / IPC handler |
| ユニットテスト Branch     | 60%+ | 互換性判定・エラー分岐を含む                         |
| 結合テスト API            | 100% | AC-1〜AC-9 全シナリオ                                |
| 結合テスト シナリオ正常系 | 100% | 復元成功・新規開始選択                               |
| 結合テスト シナリオ異常系 | 80%+ | 互換性なし・復元失敗・期限切れ                       |

## 完了条件

- [ ] `SkillCreatorSessionSummary` / `SkillCreatorSessionResumeResult` 型が追加されている
- [ ] IPC チャンネル定数が `channels.ts` に定義されている
- [ ] IPC ハンドラー 4 件が `ipc/index.ts` に追加されている（薄いラッパー原則遵守）
- [ ] Preload API が `contextBridge` 経由で公開されている
- [ ] `allowedChannels` / `validChannels` に新チャンネルが追加されている
- [ ] `SessionResumePrompt.tsx` が実装されている（必須 data-testid 属性を含む）
- [ ] `SessionIndicator.tsx` が実装されている（必須 data-testid 属性を含む）
- [ ] `SkillLifecyclePanel.tsx` にセッション検出フローが統合されている（P0-06 実装を破壊していない）
- [ ] 全テスト（TC-U-01〜TC-I-13）が PASS している
- [ ] TypeScript strict mode でエラーがない
- [ ] ESLint エラーがない
- [ ] `any` 型が使用されていない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充
