# Phase 2: 設計

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 2                         |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

Phase 1の要件を実現可能な構造に落とし込み、Preload APIの設計を行う。

## 実行タスク

- API設計: SkillAPIインターフェースのメソッド設計
- セキュリティ設計: safeInvoke/safeOnパターンの適用設計
- 型設計: 入出力型の定義

## 参照資料

| 資料名            | パス                                                                        | 説明            |
| ----------------- | --------------------------------------------------------------------------- | --------------- |
| 要件定義書        | `outputs/phase-1/requirements-definition.md`                                | Phase 1成果物   |
| 既存Preload API   | `apps/desktop/src/preload/index.ts`                                         | 既存パターン    |
| チャネル定義      | `apps/desktop/src/preload/channels.ts`                                      | IPCチャネル     |
| IPC永続化パターン | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md` | IPC実装パターン |

---

## アーキテクチャ設計

### コンポーネント構成

```
┌─────────────────────────────────────────────────────────────┐
│                    Renderer Process                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  window.skillAPI                                     │    │
│  │  ├── execute(request) → Promise<Response>           │    │
│  │  ├── abort(executionId) → Promise<boolean>          │    │
│  │  ├── getExecutionStatus(id) → Promise<Info|null>    │    │
│  │  ├── onStream(callback) → () => void                │    │
│  │  ├── onPermissionRequest(callback) → () => void     │    │
│  │  └── sendPermissionResponse(response) → Promise     │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ contextBridge
┌──────────────────────────┴──────────────────────────────────┐
│                     Preload Script                           │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  skill-api.ts                                        │    │
│  │  ├── SkillAPI interface                              │    │
│  │  ├── safeInvoke<T>(channel, args) → Promise<T>      │    │
│  │  ├── safeOn<T>(channel, callback) → cleanup         │    │
│  │  └── skillAPI: SkillAPI                              │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ IPC Channels
┌──────────────────────────┴──────────────────────────────────┐
│                     Main Process                             │
│  (TASK-4-2: skillHandlers.ts)                               │
└─────────────────────────────────────────────────────────────┘
```

### ファイル構成

| ファイル                                | 責務                              |
| --------------------------------------- | --------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI インターフェース・実装   |
| `apps/desktop/src/preload/channels.ts`  | IPCチャネル定義（TASK-4-1で追加） |
| `apps/desktop/src/preload/index.ts`     | contextBridge公開                 |

---

## API設計

### SkillAPI インターフェース

| メソッド                 | 引数                      | 戻り値                            | 説明           |
| ------------------------ | ------------------------- | --------------------------------- | -------------- |
| `execute`                | `SkillExecutionRequest`   | `Promise<SkillExecutionResponse>` | スキル実行開始 |
| `abort`                  | `executionId: string`     | `Promise<boolean>`                | 実行中断       |
| `getExecutionStatus`     | `executionId: string`     | `Promise<ExecutionInfo \| null>`  | 実行状態取得   |
| `onStream`               | `(message) => void`       | `() => void`                      | ストリーム購読 |
| `onPermissionRequest`    | `(request) => void`       | `() => void`                      | 権限要求購読   |
| `sendPermissionResponse` | `SkillPermissionResponse` | `Promise<{success: boolean}>`     | 権限応答送信   |

### IPCチャネルマッピング

| API メソッド             | IPC チャネル                | 通信方向 |
| ------------------------ | --------------------------- | -------- |
| `execute`                | `skill:execute`             | R → M    |
| `abort`                  | `skill:abort`               | R → M    |
| `getExecutionStatus`     | `skill:getStatus`           | R → M    |
| `onStream`               | `skill:stream`              | M → R    |
| `onPermissionRequest`    | `skill:permission:request`  | M → R    |
| `sendPermissionResponse` | `skill:permission:response` | R → M    |

※ R: Renderer, M: Main

---

## セキュリティ設計

### safeInvoke パターン

```typescript
// 許可されたチャネルのみ invoke を実行
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### safeOn パターン

```typescript
// 許可されたチャネルのみリスナーを登録
function safeOn<T>(channel: string, callback: (data: T) => void): () => void {
  if (!ALLOWED_ON_CHANNELS.includes(channel)) {
    console.error(`Channel ${channel} is not allowed`);
    return () => {};
  }

  const listener = (_event: IpcRendererEvent, data: T) => {
    callback(data);
  };

  ipcRenderer.on(channel, listener);

  return () => {
    ipcRenderer.removeListener(channel, listener);
  };
}
```

### チャネルホワイトリスト

`channels.ts` に以下を追加（TASK-4-1で定義済み）:

| 配列                      | 追加チャネル                                                                   |
| ------------------------- | ------------------------------------------------------------------------------ |
| `ALLOWED_INVOKE_CHANNELS` | `skill:execute`, `skill:abort`, `skill:getStatus`, `skill:permission:response` |
| `ALLOWED_ON_CHANNELS`     | `skill:stream`, `skill:permission:request`                                     |

---

## 型設計

### 入出力型

| 型名                      | 定義元                               | 説明                 |
| ------------------------- | ------------------------------------ | -------------------- |
| `SkillExecutionRequest`   | `@repo/shared/types/skill-execution` | 実行リクエスト       |
| `SkillExecutionResponse`  | `@repo/shared/types/skill-execution` | 実行レスポンス       |
| `ExecutionInfo`           | `@repo/shared/types/skill-execution` | 実行状態情報         |
| `SkillStreamMessage`      | `@repo/shared/types/skill-execution` | ストリームメッセージ |
| `SkillPermissionRequest`  | `@repo/shared`                       | 権限要求             |
| `SkillPermissionResponse` | `@repo/shared`                       | 権限応答             |

---

## 統合テスト連携

### 統合ポイント

| 統合ポイント       | 契約定義                                           |
| ------------------ | -------------------------------------------------- |
| Preload → IPC      | `IPC_CHANNELS` で定義されたチャネル名を使用        |
| Renderer → Preload | `window.skillAPI` インターフェースを介した呼び出し |
| Preload → Main     | TASK-4-2 の `skillHandlers` が受け取る型と一致     |

### データフロー

```
[Renderer]              [Preload]              [Main Process]
    │                       │                       │
    │ skillAPI.execute()    │                       │
    │──────────────────────>│                       │
    │                       │ safeInvoke            │
    │                       │──────────────────────>│
    │                       │                       │ skillHandlers
    │                       │                       │──────────>
    │                       │                       │
    │                       │<──────────────────────│
    │<──────────────────────│                       │
    │                       │                       │
    │                       │ skill:stream (M→R)    │
    │<──────────────────────│<──────────────────────│
    │ onStream callback     │                       │
    │                       │                       │
```

---

## 成果物

| 成果物             | パス                                     | 説明           |
| ------------------ | ---------------------------------------- | -------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 本ドキュメント |
| API設計書          | `outputs/phase-2/api-design.md`          | API仕様        |

---

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] API設計が完了している
- [ ] セキュリティ設計（safeInvoke/safeOn）が定義されている
- [ ] 型設計が完了している
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 3: 設計レビューゲート
