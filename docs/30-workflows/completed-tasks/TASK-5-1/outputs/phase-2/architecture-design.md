# Phase 2: アーキテクチャ設計

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 2                        |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

## 1. アーキテクチャ概要

SkillAPI は Electron のセキュリティモデルに従い、Main Process と Renderer Process 間の安全な通信を実現する Preload API です。

### 1.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────────────┐
│                      Renderer Process                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Components (TASK-6-1: SkillSlice)                  │   │
│  │     │                                                     │   │
│  │     │ window.skillAPI.xxx()                               │   │
│  │     ▼                                                     │   │
│  │  ┌────────────────────────────────────────────────────┐  │   │
│  │  │  window.skillAPI                                    │  │   │
│  │  │  ├── execute(request)                               │  │   │
│  │  │  ├── abort(executionId)                             │  │   │
│  │  │  ├── getExecutionStatus(executionId)                │  │   │
│  │  │  ├── onStream(callback)                             │  │   │
│  │  │  ├── onPermissionRequest(callback)                  │  │   │
│  │  │  └── sendPermissionResponse(response)               │  │   │
│  │  └────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ contextBridge.exposeInMainWorld
┌─────────────────────────────┴───────────────────────────────────┐
│                       Preload Script                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  skill-api.ts                                             │   │
│  │  ├── SkillAPI interface (型定義)                          │   │
│  │  ├── safeInvoke<T>()     (セキュアな invoke)              │   │
│  │  ├── safeOn<T>()         (セキュアな on)                  │   │
│  │  └── skillAPI: SkillAPI  (実装オブジェクト)               │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  channels.ts                                              │   │
│  │  ├── IPC_CHANNELS        (チャネル名定数)                 │   │
│  │  ├── ALLOWED_INVOKE_CHANNELS  (許可リスト: R→M)           │   │
│  │  └── ALLOWED_ON_CHANNELS      (許可リスト: M→R)           │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  index.ts                                                 │   │
│  │  └── contextBridge.exposeInMainWorld("skillAPI", ...)     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────┬───────────────────────────────────┘
                              │ IPC (ipcRenderer ↔ ipcMain)
┌─────────────────────────────┴───────────────────────────────────┐
│                        Main Process                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  skillHandlers.ts (TASK-4-2)                              │   │
│  │  ├── skill:execute     → SkillExecutor.execute()          │   │
│  │  ├── skill:abort       → SkillExecutor.abort()            │   │
│  │  ├── skill:get-status  → SkillExecutor.getStatus()        │   │
│  │  └── skill:permission:response → handlePermission()       │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  SkillExecutor (TASK-3-1)                                 │   │
│  │  ├── execute()         → Claude Agent SDK 呼び出し        │   │
│  │  ├── abort()           → 実行中断                         │   │
│  │  └── emitStream()      → skill:stream イベント送信        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. コンポーネント責務

### 2.1 Preload Script コンポーネント

| ファイル       | 責務                            | 依存関係     |
| -------------- | ------------------------------- | ------------ |
| `skill-api.ts` | SkillAPI インターフェースと実装 | channels.ts  |
| `channels.ts`  | IPCチャネル定義とホワイトリスト | なし         |
| `index.ts`     | API公開（contextBridge）        | skill-api.ts |

### 2.2 ファイル間の依存関係

```
index.ts
    │
    ├──import──> skill-api.ts
    │               │
    │               └──import──> channels.ts
    │                               │
    │                               ├── IPC_CHANNELS
    │                               ├── ALLOWED_INVOKE_CHANNELS
    │                               └── ALLOWED_ON_CHANNELS
    │
    └── contextBridge.exposeInMainWorld("skillAPI", skillAPI)
```

---

## 3. 通信フロー

### 3.1 スキル実行フロー (execute)

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Renderer │      │ Preload  │      │   IPC    │      │   Main   │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ execute(req)    │                 │                 │
     │────────────────>│                 │                 │
     │                 │                 │                 │
     │                 │ safeInvoke      │                 │
     │                 │ (skill:execute) │                 │
     │                 │────────────────>│                 │
     │                 │                 │                 │
     │                 │                 │ invoke handler  │
     │                 │                 │────────────────>│
     │                 │                 │                 │
     │                 │                 │                 │ SkillExecutor
     │                 │                 │                 │ .execute()
     │                 │                 │                 │
     │                 │                 │<────────────────│
     │                 │<────────────────│ executionId     │
     │<────────────────│                 │                 │
     │ response        │                 │                 │
     │                 │                 │                 │
```

### 3.2 ストリーミングフロー (onStream)

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Renderer │      │ Preload  │      │   IPC    │      │   Main   │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ onStream(cb)    │                 │                 │
     │────────────────>│                 │                 │
     │                 │ safeOn          │                 │
     │<────────────────│ (skill:stream)  │                 │
     │ cleanup()       │ register        │                 │
     │                 │────────────────>│                 │
     │                 │                 │                 │
     │                 │                 │                 │ execution
     │                 │                 │                 │ progress
     │                 │                 │<────────────────│
     │                 │<────────────────│ skill:stream    │
     │<────────────────│ callback(msg)   │ event           │
     │ message         │                 │                 │
     │                 │                 │                 │
```

### 3.3 権限確認フロー (onPermissionRequest / sendPermissionResponse)

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Renderer │      │ Preload  │      │   IPC    │      │   Main   │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ onPermission    │                 │                 │
     │ Request(cb)     │                 │                 │
     │────────────────>│ register        │                 │
     │                 │────────────────>│                 │
     │                 │                 │                 │
     │                 │                 │                 │ tool use
     │                 │                 │                 │ permission
     │                 │                 │<────────────────│ required
     │                 │<────────────────│ skill:permission│
     │<────────────────│                 │ :request        │
     │ request         │                 │                 │
     │                 │                 │                 │
     │ (user action)   │                 │                 │
     │                 │                 │                 │
     │ sendPermission  │                 │                 │
     │ Response(res)   │                 │                 │
     │────────────────>│                 │                 │
     │                 │ safeInvoke      │                 │
     │                 │────────────────>│                 │
     │                 │                 │────────────────>│
     │                 │                 │                 │ resolve
     │                 │<────────────────│<────────────────│
     │<────────────────│                 │                 │
     │ {success:true}  │                 │                 │
```

---

## 4. セキュリティアーキテクチャ

### 4.1 Context Isolation

```
┌────────────────────────────────┐
│        Renderer Process         │
│  ┌──────────────────────────┐  │
│  │   Isolated Context       │  │
│  │   (window.skillAPI)      │  │
│  │                          │  │
│  │   ❌ ipcRenderer アクセス不可 │
│  │   ❌ Node.js API アクセス不可  │
│  │   ✅ skillAPI のみ使用可能    │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### 4.2 ホワイトリストベースのチャネル制御

```typescript
// 許可リスト (channels.ts)
ALLOWED_INVOKE_CHANNELS = [
  "skill:execute",
  "skill:abort",
  "skill:get-status",
  "skill:permission:response",
  // ...
];

ALLOWED_ON_CHANNELS = [
  "skill:stream",
  "skill:permission:request",
  // ...
];

// セキュリティチェック (skill-api.ts)
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_INVOKE_CHANNELS.includes(channel)) {
    return Promise.reject(new Error(`Channel ${channel} is not allowed`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

### 4.3 セキュリティ境界

| 境界               | 保護対象                 | メカニズム           |
| ------------------ | ------------------------ | -------------------- |
| Renderer ↔ Preload | Node.js API, ipcRenderer | contextIsolation     |
| Preload ↔ Main     | 任意のIPCチャネル        | ホワイトリスト       |
| Main内部           | システムリソース         | サービス層の権限管理 |

---

## 5. エラーハンドリング設計

### 5.1 エラー発生箇所と伝播

| 発生箇所   | エラー種類                | 伝播先        |
| ---------- | ------------------------- | ------------- |
| safeInvoke | Channel not allowed       | Renderer      |
| safeOn     | Channel not allowed (log) | Preload (log) |
| IPC        | Invoke handler error      | Renderer      |
| Main       | SkillExecutor error       | skill:error   |

### 5.2 エラー処理フロー

```typescript
// Renderer側
try {
  const response = await window.skillAPI.execute(request);
} catch (error) {
  // safeInvoke のエラー または IPC handler のエラー
  console.error("Execution failed:", error);
}

// ストリーミングエラーは別チャネルで通知
// skill:error → SKILL_ERROR チャネル経由で Renderer に通知
```

---

## 6. メモリ管理設計

### 6.1 イベントリスナーのライフサイクル

```typescript
// リスナー登録
const cleanup = window.skillAPI.onStream((message) => {
  // handle message
});

// コンポーネントアンマウント時
useEffect(() => {
  const cleanup = window.skillAPI.onStream(handler);
  return () => cleanup(); // リスナー解除
}, []);
```

### 6.2 メモリリーク防止

| 対策                   | 実装箇所 | 説明                            |
| ---------------------- | -------- | ------------------------------- |
| クリーンアップ関数返却 | safeOn   | removeListener を呼ぶ関数を返す |
| React useEffect 連携   | TASK-6-1 | アンマウント時に cleanup 呼出   |

---

## 7. 拡張性設計

### 7.1 新規APIメソッド追加手順

1. `SkillAPI` インターフェースにメソッド追加
2. `IPC_CHANNELS` にチャネル定義追加
3. `ALLOWED_INVOKE_CHANNELS` または `ALLOWED_ON_CHANNELS` に登録
4. `skillAPI` オブジェクトに実装追加
5. Main Process側にハンドラー追加（TASK-4-2）

### 7.2 設計のポイント

- 新規チャネルは必ずホワイトリストに追加
- 型定義は `@repo/shared` に集約
- Main Process側との契約は IPC チャネル名で管理

---

## 8. 実装確認

### 8.1 実装ファイル確認

| ファイル                                | 確認項目          | 状態    |
| --------------------------------------- | ----------------- | ------- |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI実装      | ✅ 完了 |
| `apps/desktop/src/preload/channels.ts`  | チャネル定義      | ✅ 完了 |
| `apps/desktop/src/preload/index.ts`     | contextBridge公開 | ✅ 完了 |

### 8.2 アーキテクチャ準拠確認

| 確認項目                   | 状態    |
| -------------------------- | ------- |
| Context Isolation 対応     | ✅ 完了 |
| safeInvoke/safeOn パターン | ✅ 完了 |
| ホワイトリスト管理         | ✅ 完了 |
| クリーンアップ関数返却     | ✅ 完了 |
| 型安全性確保               | ✅ 完了 |

---

## 9. 次のステップ

Phase 3: 設計レビューゲートへ進む
