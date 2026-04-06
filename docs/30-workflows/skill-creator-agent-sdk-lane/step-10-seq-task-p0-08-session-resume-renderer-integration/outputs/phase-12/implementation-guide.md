# TASK-P0-08 実装ガイド

## Part 1: 中学生レベル — セッション復元ってなに？

### なぜ必要か

スキル作成の途中でパソコンを閉じたり、アプリを終了してしまうことがあります。そのとき、せっかく進めていた作業が全部消えてしまったら困りますよね。

たとえば、本を読んでいる途中に栞（しおり）を挟んでおくと、次に開いたときに「あ、ここまで読んでいたんだ」と分かります。このセッション復元機能も同じです。スキル作成の進行状況を自動的に保存しておいて、次にアプリを開いたとき「前の続きからやりますか？」と聞いてくれます。

### 何をするか

1. **自動保存**: スキル作成中は進捗が自動的に記録されます
2. **起動時に確認**: 次回アプリを開いたとき、未完了の作業があれば一覧で表示されます
3. **選択できる**: 「続きから再開する」「削除して新規開始する」「スキップ（後で決める）」の3つから選べます
4. **期限付き**: 古すぎる保存データ（24時間以上）は自動的に削除されます

---

## Part 2: 技術者レベル — インターフェース・API 仕様

### 型定義（TypeScript）

```typescript
// セッション一覧アイテム (packages/shared/src/types/skillCreator.ts)
export interface SkillCreatorSessionListItem {
  checkpointId: string;
  planId: string;
  currentPhase: SkillCreatorWorkflowPhase;
  checkpointType: SkillCreatorCheckpointType;
  compatibility: ResumeCompatibilityResult;
  createdAt: number; // Unix timestamp (ms)
  updatedAt: number; // Unix timestamp (ms)
}

// 復元結果 (Facade から返却)
export interface SkillCreatorSessionResumeResult {
  success: boolean;
  workflowSnapshot?: SkillCreatorWorkflowUiSnapshot;
  error?: string;
}

// Preload API (window.skillCreatorAPI)
export interface SkillCreatorSessionApi {
  listSessions: () => Promise<IpcResult<SkillCreatorSessionListItem[]>>;
  resumeSession: (
    checkpointId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  getSessionDetail: (
    checkpointId: string,
  ) => Promise<IpcResult<SkillCreatorWorkflowUiSnapshot>>;
  deleteSession: (checkpointId: string) => Promise<IpcResult<void>>;
}
```

### IPC チャンネル一覧

| チャンネル定数                     | チャンネル名                       | 引数               | 戻り値                                      |
| ---------------------------------- | ---------------------------------- | ------------------ | ------------------------------------------- |
| `SKILL_CREATOR_LIST_SESSIONS`      | `skill-creator:list-sessions`      | なし               | `IpcResult<SkillCreatorSessionListItem[]>`  |
| `SKILL_CREATOR_RESUME_SESSION`     | `skill-creator:resume-session`     | `{ checkpointId }` | `IpcResult<SkillCreatorWorkflowUiSnapshot>` |
| `SKILL_CREATOR_GET_SESSION_DETAIL` | `skill-creator:get-session-detail` | `{ checkpointId }` | `IpcResult<SkillCreatorWorkflowUiSnapshot>` |
| `SKILL_CREATOR_DELETE_SESSION`     | `skill-creator:delete-session`     | `{ checkpointId }` | `IpcResult<void>`                           |

### Preload API 経由の呼び出し例

```typescript
// renderer コンポーネント内での使用例
import { useState, useEffect } from "react";
import type { SkillCreatorSessionListItem } from "@repo/shared";

function SkillCreatorContainer() {
  const [sessions, setSessions] = useState<SkillCreatorSessionListItem[]>([]);

  useEffect(() => {
    const api = window.skillCreatorAPI;
    if (!api?.listSessions) return;

    api.listSessions().then((result) => {
      if (result.success && result.data && result.data.length > 0) {
        setSessions(result.data);
      }
    });
  }, []);

  const handleResume = async (checkpointId: string) => {
    const result = await window.skillCreatorAPI?.resumeSession(checkpointId);
    if (result?.success && result.data) {
      // workflowSnapshot を使ってUIを復元
    }
  };

  const handleDelete = async (checkpointId: string) => {
    await window.skillCreatorAPI?.deleteSession(checkpointId);
    setSessions((prev) => prev.filter((s) => s.checkpointId !== checkpointId));
  };
}
```

### エラーハンドリングとエッジケース

| エラーシナリオ                             | 対処方針                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `compatibility: "incompatible"`            | 復元ボタンを非表示、「非互換」バッジ表示、削除のみ可能にする               |
| `compatibility: "compatible_with_warning"` | 復元ボタン表示＋警告テキスト表示                                           |
| `listSessions()` 失敗                      | サイレント処理（console.error のみ）、セッション検出なしとして扱う         |
| `resumeSession()` 失敗                     | `success: false + error` を受け取り、ユーザーにエラー表示                  |
| TTL 期限切れ (24時間超)                    | `cleanupExpiredSessions()` が自動削除、一覧に表示されない                  |
| `checkpointId` が空文字                    | IPC ハンドラが `{ success: false, error: "checkpointId required" }` を返す |

### 設定可能なパラメータ

| パラメータ     | デフォルト値 | 説明                                             |
| -------------- | ------------ | ------------------------------------------------ |
| セッション TTL | 24時間       | `SkillCreatorWorkflowEngine` 内の TTL 定数で管理 |

### current contract と target delta

**current contract (TASK-P0-08 実装済み)**:

- IPC 4層（channels.ts / preload allowlist / creatorHandlers / skill-creator-api）にセッション操作 4チャンネル追加
- `SkillCreatorSessionListItem.createdAt` フィールド追加
- `SkillLifecyclePanel` にセッション検出 useEffect 統合
- `SessionResumePrompt` / `SessionIndicator` コンポーネントの IPC 接続

**target delta (今回 wave で更新しない no-op 判定)**:

- `useInterviewState` への sessionId 書き込み: P0-06 担当、変更なし
- `ConversationalInterview` コンポーネント: P0-06 担当、変更なし
- セッション TTL 値の設定 UI: スコープ外（UT-P0-08-PHASE11-SCREENSHOT-EVIDENCE-001 で追跡）
