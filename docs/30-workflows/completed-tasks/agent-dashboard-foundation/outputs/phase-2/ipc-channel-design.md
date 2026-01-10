# IPCチャネル設計書 - エージェントダッシュボード基盤

## 概要情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| タスクID | AGENT-001                  |
| 機能名   | agent-dashboard-foundation |
| Phase    | 2                          |
| 作成日   | 2026-01-10                 |

---

## チャネル定義

### 新規追加チャネル一覧

| チャネル名             | 定数名                 | 方向            | 用途               |
| ---------------------- | ---------------------- | --------------- | ------------------ |
| agent:get-skills       | AGENT_GET_SKILLS       | Renderer → Main | スキル一覧取得     |
| agent:get-skill-detail | AGENT_GET_SKILL_DETAIL | Renderer → Main | スキル詳細取得     |
| agent:execute          | AGENT_EXECUTE          | Renderer → Main | エージェント実行   |
| agent:abort            | AGENT_ABORT            | Renderer → Main | 実行中断           |
| agent:get-status       | AGENT_GET_STATUS       | Renderer → Main | ステータス取得     |
| agent:status-changed   | AGENT_STATUS_CHANGED   | Main → Renderer | ステータス変更通知 |
| agent:stream-chunk     | AGENT_STREAM_CHUNK     | Main → Renderer | 出力ストリーム     |
| agent:stream-end       | AGENT_STREAM_END       | Main → Renderer | ストリーム終了     |
| agent:stream-error     | AGENT_STREAM_ERROR     | Main → Renderer | エラー通知         |

---

## channels.ts 更新内容

### 定数定義追加

```typescript
// channels.ts
export const IPC_CHANNELS = {
  // ... 既存チャネル ...

  // Agent operations
  AGENT_GET_SKILLS: "agent:get-skills",
  AGENT_GET_SKILL_DETAIL: "agent:get-skill-detail",
  AGENT_EXECUTE: "agent:execute",
  AGENT_ABORT: "agent:abort",
  AGENT_GET_STATUS: "agent:get-status",
  AGENT_STATUS_CHANGED: "agent:status-changed",
  AGENT_STREAM_CHUNK: "agent:stream-chunk",
  AGENT_STREAM_END: "agent:stream-end",
  AGENT_STREAM_ERROR: "agent:stream-error",
} as const;
```

### ホワイトリスト追加

```typescript
// ALLOWED_INVOKE_CHANNELS に追加
export const ALLOWED_INVOKE_CHANNELS: readonly string[] = [
  // ... 既存チャネル ...

  // Agent channels
  IPC_CHANNELS.AGENT_GET_SKILLS,
  IPC_CHANNELS.AGENT_GET_SKILL_DETAIL,
  IPC_CHANNELS.AGENT_EXECUTE,
  IPC_CHANNELS.AGENT_ABORT,
  IPC_CHANNELS.AGENT_GET_STATUS,
];

// ALLOWED_ON_CHANNELS に追加
export const ALLOWED_ON_CHANNELS: readonly string[] = [
  // ... 既存チャネル ...

  // Agent channels
  IPC_CHANNELS.AGENT_STATUS_CHANGED,
  IPC_CHANNELS.AGENT_STREAM_CHUNK,
  IPC_CHANNELS.AGENT_STREAM_END,
  IPC_CHANNELS.AGENT_STREAM_ERROR,
];
```

---

## チャネル詳細仕様

### agent:get-skills

**目的**: 利用可能なスキル一覧を取得

```typescript
// Request
// パラメータなし

// Response
interface GetSkillsResponse {
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  description: string;
  path: string;
  triggers: string[];
  category?: string;
}
```

---

### agent:get-skill-detail

**目的**: 特定スキルの詳細情報を取得

```typescript
// Request
interface GetSkillDetailRequest {
  skillId: string;
}

// Response
interface GetSkillDetailResponse {
  skill: SkillDetail;
}

interface SkillDetail extends Skill {
  anchors: Anchor[];
  workflow?: string;
  bestPractices?: string[];
}

interface Anchor {
  source: string;
  application: string;
  purpose: string;
}
```

---

### agent:execute

**目的**: スキルを実行

```typescript
// Request
interface ExecuteRequest {
  skillId: string;
  input?: string;
  options?: ExecuteOptions;
}

interface ExecuteOptions {
  timeout?: number;
  env?: Record<string, string>;
}

// Response (initial)
interface ExecuteResponse {
  executionId: string;
}
// 実行結果はストリームで送信
```

---

### agent:abort

**目的**: 実行中のスキルを中断

```typescript
// Request
interface AbortRequest {
  executionId: string;
}

// Response
interface AbortResponse {
  success: boolean;
}
```

---

### agent:get-status

**目的**: エージェントサービスのステータスを取得

```typescript
// Request
// パラメータなし

// Response
interface GetStatusResponse {
  status: "ready" | "busy" | "error";
  activeExecutions: number;
  lastError?: string;
}
```

---

### agent:status-changed

**目的**: ステータス変更をRenderer Processに通知

```typescript
// Event payload
interface StatusChangedEvent {
  status: "ready" | "busy" | "error";
  executionId?: string;
  error?: string;
}
```

---

### agent:stream-chunk

**目的**: 実行出力をストリームで送信

```typescript
// Event payload
interface StreamChunkEvent {
  executionId: string;
  chunk: string;
  type: "stdout" | "stderr";
}
```

---

### agent:stream-end

**目的**: ストリーム終了を通知

```typescript
// Event payload
interface StreamEndEvent {
  executionId: string;
  exitCode: number;
}
```

---

### agent:stream-error

**目的**: エラーを通知

```typescript
// Event payload
interface StreamErrorEvent {
  executionId: string;
  error: string;
  code?: string;
}
```

---

## Preload API設計

### window.agentAPI

```typescript
// preload/index.ts での公開

interface AgentAPI {
  // スキル取得
  getSkills: () => Promise<GetSkillsResponse>;
  getSkillDetail: (skillId: string) => Promise<GetSkillDetailResponse>;

  // 実行制御
  execute: (request: ExecuteRequest) => Promise<ExecuteResponse>;
  abort: (executionId: string) => Promise<AbortResponse>;

  // ステータス
  getStatus: () => Promise<GetStatusResponse>;

  // イベント購読
  onStatusChanged: (
    callback: (event: StatusChangedEvent) => void,
  ) => () => void;
  onStreamChunk: (callback: (event: StreamChunkEvent) => void) => () => void;
  onStreamEnd: (callback: (event: StreamEndEvent) => void) => () => void;
  onStreamError: (callback: (event: StreamErrorEvent) => void) => () => void;
}

contextBridge.exposeInMainWorld("agentAPI", {
  getSkills: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_SKILLS),
  getSkillDetail: (skillId) =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_SKILL_DETAIL, { skillId }),
  execute: (request) => ipcRenderer.invoke(IPC_CHANNELS.AGENT_EXECUTE, request),
  abort: (executionId) =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_ABORT, { executionId }),
  getStatus: () => ipcRenderer.invoke(IPC_CHANNELS.AGENT_GET_STATUS),
  onStatusChanged: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.AGENT_STATUS_CHANGED, handler);
    return () =>
      ipcRenderer.removeListener(IPC_CHANNELS.AGENT_STATUS_CHANGED, handler);
  },
  // ... 他のイベント購読も同様
});
```

---

## セキュリティ考慮事項

### バリデーション

| チャネル               | バリデーション項目                 |
| ---------------------- | ---------------------------------- |
| agent:execute          | skillIdの存在確認、inputの長さ制限 |
| agent:abort            | executionIdの形式確認              |
| agent:get-skill-detail | skillIdの存在確認                  |

### エラーハンドリング

```typescript
// Main Process側でのエラーハンドリング
ipcMain.handle(IPC_CHANNELS.AGENT_GET_SKILLS, async () => {
  try {
    const skills = await agentService.getSkills();
    return { skills };
  } catch (error) {
    console.error("Failed to get skills:", error);
    throw new Error("スキルの取得に失敗しました");
  }
});
```

---

## 本タスクでの実装範囲

本タスク（AGENT-001）では、チャネル定義のみを実装します。
実際のIPCハンドラー実装は後続タスクで行います。

| 項目                 | 本タスク | 後続タスク |
| -------------------- | -------- | ---------- |
| チャネル定数定義     | ✅       | -          |
| ホワイトリスト追加   | ✅       | -          |
| Preload API実装      | -        | AGENT-002+ |
| Main Process Handler | -        | AGENT-003+ |
