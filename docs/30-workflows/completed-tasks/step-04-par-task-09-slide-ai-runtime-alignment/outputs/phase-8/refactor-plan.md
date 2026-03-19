# Phase 8 責務整理計画

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| タスクID | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase    | 8 - リファクタリング                    |
| 作成日   | 2026-03-19                              |
| 分類     | 設計タスク（実装なし、仕様書作成）      |

## 概要

本 Phase は設計タスクのため、実際のコードリファクタリングは実施しない。
代わりに、Phase 2-3 で確定した設計に基づき、実装時に守るべき責務分離の検証基準を記録する。

---

## T-8-1: Credential 解決分離

### 目的

agent-client.ts 廃止後、credential 解決が RuntimeResolver に統一されているかを確認する。

### 検証基準

| 観点                            | 合否基準                                                |
| ------------------------------- | ------------------------------------------------------- |
| `@anthropic-ai/sdk` 直接 import | slide 配下（`src/main/slide/`）に存在しない（0件）      |
| `electron-store` 直読み         | credential 取得箇所で使用しない（0件）                  |
| env 直参照                      | `process.env.ANTHROPIC_API_KEY` 等を直参照しない（0件） |
| RuntimeResolver 経由            | `IAuthKeyService.getKey()` のみで credential を解決     |

### 設計確認結果

- **判定: PASS**
- agent-client.ts 全体廃止により、Direct SDK import・electron-store 直読み・env 直参照が構造的に排除される設計となっている
- credential 解決は `RuntimeResolver → IAuthKeyService.getKey()` の単一経路に統一
- SDK クライアント生成は `SkillExecutor` が `RuntimeResolver` を介して行う

### 実装時の検証コマンド

```bash
# Direct SDK import の排除確認
grep -rn "from '@anthropic-ai/sdk'" apps/desktop/src/main/slide/ | wc -l
# 期待値: 0

# electron-store 直読みの排除確認
grep -rn "electron-store\|new Store(" apps/desktop/src/main/slide/ | wc -l
# 期待値: 0

# env 直参照の排除確認
grep -rn "process\.env\.ANTHROPIC" apps/desktop/src/main/slide/ | wc -l
# 期待値: 0
```

---

## T-8-2: Watcher / Streaming 分離

### 目的

FileWatcher と streaming feedback の責務が sync-manager.ts に混在しないことを確認する。

### 検証基準

| コンポーネント | 責務                                 | 禁止事項                     |
| -------------- | ------------------------------------ | ---------------------------- |
| `FileWatcher`  | ファイル変更検知 → callback 発火のみ | streaming 制御、IPC 送信禁止 |
| `SyncManager`  | sync orchestration のみ              | ファイル監視ロジック禁止     |

### 設計確認結果

- **判定: PASS**
- DI 設計で責務分離済み
- `FileWatcher` は `onChanged(path: string) => void` callback を受け取りファイル変更を通知するのみ
- `SyncManager` は `FileWatcher` から通知を受けて sync orchestration を担当
- streaming feedback は `SyncManager` が IPC 経由で Renderer に送信

### クラス責務定義

```typescript
// FileWatcher: ファイル検知のみ
interface IFileWatcher {
  start(watchPath: string, onChanged: (path: string) => void): void;
  stop(): void;
}

// SyncManager: orchestration のみ
interface ISyncManager {
  startSync(sessionId: string): Promise<void>;
  stopSync(sessionId: string): Promise<void>;
  reverseSync(params: ReverseSyncParams): Promise<SyncResult>;
  manualSync(params: ManualSyncParams): Promise<SyncResult>;
}
```

---

## T-8-3: Sync Orchestration 整理

### 目的

`reverseSync` / `manualSync` の責務が明確に分離され、共通ロジックが private helper に抽出されていることを確認する。

### 検証基準

| 観点               | 合否基準                                  |
| ------------------ | ----------------------------------------- |
| `reverseSync` 行数 | 実装時に30行以下                          |
| `manualSync` 行数  | 実装時に30行以下                          |
| 共通ロジック       | `private` helper メソッドに抽出されている |
| エラーハンドリング | `Result<T, E>` パターンで上位伝播         |

### 設計確認結果

- **判定: PASS（設計段階）**
- SyncManager の責務分離は設計済み
- 共通ロジック（進捗通知、エラー変換）は private helper として設計
- 実装フェーズで行数制限を遵守すること

### 設計上の helper 候補

```typescript
class SyncManager {
  // public methods（各30行以下を目標）
  async reverseSync(params: ReverseSyncParams): Promise<SyncResult> { ... }
  async manualSync(params: ManualSyncParams): Promise<SyncResult> { ... }

  // private helpers（共通ロジックを集約）
  private async validateSession(sessionId: string): Promise<Session> { ... }
  private notifyProgress(event: SyncProgressEvent): void { ... }
  private toSyncError(err: unknown): SyncError { ... }
}
```

---

## T-8-4: IPC Handler 整理

### 目的

`ipc-handlers.ts` が handler 登録のみの薄いレイヤーであることを確認する。

### 検証基準

| 観点             | 合否基準                                                    |
| ---------------- | ----------------------------------------------------------- |
| ビジネスロジック | `ipc-handlers.ts` に含まれない                              |
| handler の構造   | `validateIpcSender` → バリデーション → 委譲 の3ステップのみ |
| 委譲先           | `SyncManager` または `SkillExecutor` のメソッドのみ         |
| 行数             | handler 1本あたり15行以下                                   |

### 設計確認結果

- **判定: PASS**
- 全 handler が `SyncManager` / `SkillExecutor` に委譲する設計
- `ipc-handlers.ts` は登録とバリデーションのみを担当
- ビジネスロジックは各 Service クラスに閉じている

### 設計上の handler 構造

```typescript
// 薄いレイヤーの例（15行以下）
ipcMain.handle(IPC_CHANNELS.SLIDE_SYNC_START, async (event, args: unknown) => {
  validateIpcSender(event);
  if (typeof args !== "object" || args === null) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "args must be object" },
    };
  }
  const { sessionId } = args as { sessionId: unknown };
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "sessionId must be non-empty string",
      },
    };
  }
  return syncManager.startSync(sessionId);
});
```

---

## 総合判定

| タスク                        | 判定             | 備考                                   |
| ----------------------------- | ---------------- | -------------------------------------- |
| T-8-1 Credential 解決分離     | PASS             | agent-client.ts 廃止設計で構造的に解決 |
| T-8-2 Watcher/Streaming 分離  | PASS             | DI 設計で責務分離済み                  |
| T-8-3 Sync Orchestration 整理 | PASS（設計段階） | 実装時に行数制限を遵守すること         |
| T-8-4 IPC Handler 整理        | PASS             | 薄いレイヤー設計確認済み               |

**Phase 8 総合: PASS** — 設計段階での責務整理は完了。実装フェーズで本計画に従うこと。
