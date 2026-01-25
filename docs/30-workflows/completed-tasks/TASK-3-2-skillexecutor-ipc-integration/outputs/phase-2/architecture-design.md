# アーキテクチャ設計 - TASK-3-2 Phase 2

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| 作成日     | 2026-01-25         |
| Phase      | 2                  |
| タスク     | アーキテクチャ設計 |
| ステータス | 完了               |

---

## 1. 全体アーキテクチャ

### 1.1 データフロー図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                                   │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                    SkillStreamDisplay.tsx                               │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │ │
│  │  │ StreamHeader │  │StreamContent │  │StreamActions │                  │ │
│  │  │ (状態表示)   │  │(メッセージ)  │  │ (中断ボタン) │                  │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                  │ │
│  │         │                 │                 │                          │ │
│  │         └─────────────────┼─────────────────┘                          │ │
│  │                           │ props                                       │ │
│  └───────────────────────────┼─────────────────────────────────────────────┘ │
│                              ↓                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │                     useSkillExecution.ts (React Hook)                  │   │
│  │                                                                        │   │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │   │
│  │  │  State: messages, status, executionId, error                      │ │   │
│  │  │  Actions: execute, abort, reset                                   │ │   │
│  │  └───────────────────────────┬──────────────────────────────────────┘ │   │
│  │                              │ skillAPI calls                         │   │
│  └──────────────────────────────┼────────────────────────────────────────┘   │
│                                 ↓                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │                     skillAPI (Preload API)                            │    │
│  │                                                                       │    │
│  │  execute()  ─────→ ipcRenderer.invoke("skill:execute")               │    │
│  │  abort()    ─────→ ipcRenderer.invoke("skill:abort")                 │    │
│  │  onStream() ─────→ ipcRenderer.on("skill:stream")                    │    │
│  └───────────────────────────────┬──────────────────────────────────────┘    │
│                                  │ contextBridge                             │
└──────────────────────────────────┼───────────────────────────────────────────┘
                                   │ IPC
┌──────────────────────────────────┼───────────────────────────────────────────┐
│                           Main Process                                        │
│                                  │                                            │
│  ┌───────────────────────────────┴──────────────────────────────────────────┐ │
│  │                         IPC Handlers                                      │ │
│  │                                                                           │ │
│  │  "skill:execute" ─────→ SkillExecutor.execute()                          │ │
│  │  "skill:abort"   ─────→ SkillExecutor.abort()                            │ │
│  └───────────────────────────────┬───────────────────────────────────────────┘ │
│                                  ↓                                            │
│  ┌───────────────────────────────────────────────────────────────────────────┐ │
│  │                        SkillExecutor                                       │ │
│  │                                                                            │ │
│  │  execute() → SDK query() → stream messages                                │ │
│  │            ↓                                                              │ │
│  │  sendStream() → webContents.send("skill:stream", message) ─────┐         │ │
│  │                                                                 │         │ │
│  └─────────────────────────────────────────────────────────────────┼─────────┘ │
│                                                                    │          │
└────────────────────────────────────────────────────────────────────┼──────────┘
                                                                     │
                              ┌──────────────────────────────────────┘
                              │ IPC send (skill:stream)
                              ↓
                    Renderer Process (callback invocation)
```

### 1.2 メッセージシーケンス

```
User              UI              Hook           skillAPI          Main           SDK
 │                │                │                │                │              │
 │  execute       │                │                │                │              │
 │───────────────→│                │                │                │              │
 │                │  execute()     │                │                │              │
 │                │───────────────→│                │                │              │
 │                │                │  execute()     │                │              │
 │                │                │───────────────→│                │              │
 │                │                │                │  invoke        │              │
 │                │                │                │───────────────→│              │
 │                │                │                │                │  query()     │
 │                │                │                │                │─────────────→│
 │                │                │                │                │              │
 │                │                │                │ response       │              │
 │                │                │  response     ←│←───────────────│              │
 │                │                │←───────────────│                │              │
 │                │                │                │                │              │
 │                │                │                │   stream msg   │   stream    │
 │                │                │  callback      │←───────────────│←─────────────│
 │                │  state update  │←───────────────│                │              │
 │  UI update     │←───────────────│                │                │              │
 │←───────────────│                │                │                │              │
 │                │                │                │                │              │
 │  abort         │                │                │                │              │
 │───────────────→│                │                │                │              │
 │                │  abort()       │                │                │              │
 │                │───────────────→│                │                │              │
 │                │                │  abort()       │                │              │
 │                │                │───────────────→│                │              │
 │                │                │                │  invoke        │              │
 │                │                │                │───────────────→│              │
 │                │                │                │                │  abort       │
 │                │                │                │                │─────────────→│
 │                │                │                │                │              │
```

---

## 2. コンポーネント責務

### 2.1 レイヤー構成

| レイヤー  | コンポーネント     | 責務                       |
| --------- | ------------------ | -------------------------- |
| UI        | SkillStreamDisplay | ユーザー操作・表示         |
| UI        | StreamHeader       | 実行状態表示               |
| UI        | StreamContent      | メッセージ一覧表示         |
| UI        | StreamActions      | アクションボタン           |
| Logic     | useSkillExecution  | 状態管理・ビジネスロジック |
| API       | skillAPI           | IPC通信の抽象化            |
| Transport | Preload Script     | IPC通信のセキュリティ境界  |
| Service   | SkillExecutor      | スキル実行エンジン         |
| External  | Claude Agent SDK   | AI API呼び出し             |

### 2.2 依存関係

```
SkillStreamDisplay
        │
        ↓ uses
useSkillExecution
        │
        ↓ calls
skillAPI (Preload)
        │
        ↓ IPC
SkillExecutor (Main)
        │
        ↓ query
Claude Agent SDK
```

---

## 3. IPC チャンネル設計

### 3.1 チャンネル一覧

| チャンネル      | 方向           | 用途                 | データ型              |
| --------------- | -------------- | -------------------- | --------------------- |
| `skill:execute` | R → M (invoke) | スキル実行開始       | SkillExecutionRequest |
| `skill:abort`   | R → M (invoke) | 実行中断             | string (executionId)  |
| `skill:stream`  | M → R (send)   | ストリームメッセージ | SkillStreamMessage    |

### 3.2 セキュリティ設定

```typescript
// channels.ts 追加
SKILL_STREAM: "skill:stream",
SKILL_ABORT: "skill:abort",

// ALLOWED_INVOKE_CHANNELS 追加
IPC_CHANNELS.SKILL_ABORT,

// ALLOWED_ON_CHANNELS 追加
IPC_CHANNELS.SKILL_STREAM,
```

---

## 4. ファイル構成

### 4.1 新規作成ファイル

```
apps/desktop/src/
├── preload/
│   ├── skill-api.ts                    # skillAPI 実装
│   └── __tests__/
│       └── skill-api.test.ts           # skillAPI テスト
├── renderer/
│   ├── hooks/
│   │   ├── useSkillExecution.ts        # React Hook
│   │   └── __tests__/
│   │       └── useSkillExecution.test.ts
│   └── components/
│       └── SkillStreamDisplay/
│           ├── index.tsx               # メインコンポーネント
│           ├── StreamHeader.tsx        # ヘッダー
│           ├── StreamContent.tsx       # コンテンツ
│           ├── StreamActions.tsx       # アクション
│           ├── messages/
│           │   ├── TextMessage.tsx
│           │   ├── ToolUseMessage.tsx
│           │   └── ErrorMessage.tsx
│           └── __tests__/
│               └── SkillStreamDisplay.test.tsx
└── main/
    └── ipc/
        └── skill-handlers.ts           # IPC Handler（既存拡張）
```

### 4.2 既存ファイル変更

| ファイル              | 変更内容                       |
| --------------------- | ------------------------------ |
| `preload/index.ts`    | skillAPI の export 追加        |
| `preload/channels.ts` | SKILL_STREAM, SKILL_ABORT 追加 |

---

## 5. エラーハンドリング設計

### 5.1 エラー伝播フロー

```
SDK Error
    ↓
SkillExecutor (catch)
    ↓ sendStream({type: "error"})
IPC skill:stream
    ↓
skillAPI.onStream callback
    ↓
useSkillExecution (setError, setStatus("error"))
    ↓
SkillStreamDisplay (ErrorMessage 表示)
```

### 5.2 エラー分類

| エラーコード            | 発生箇所      | UI表示             |
| ----------------------- | ------------- | ------------------ |
| EXECUTION_FAILED        | SDK           | 実行エラー         |
| TIMEOUT                 | SkillExecutor | タイムアウト       |
| ABORTED                 | SkillExecutor | ユーザー中断       |
| MAX_CONCURRENT_EXCEEDED | SkillExecutor | 同時実行制限       |
| NETWORK_ERROR           | SDK           | ネットワークエラー |

---

## 6. 参照

- Phase 1 要件定義: `outputs/phase-1/`
- 既存 Preload API: `apps/desktop/src/preload/index.ts`
- SkillExecutor: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
