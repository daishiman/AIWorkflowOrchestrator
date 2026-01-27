# Phase 1: 要件定義書

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase      | 1                        |
| タスクID   | TASK-5-1                 |
| タスク名   | SkillAPI 実装（Preload） |
| 作成日     | 2026-01-27               |
| ステータス | 完了                     |

---

## 1. 概要

SkillAPI は Renderer プロセスから安全に IPC 通信を行うための Preload API です。
Electron の `contextBridge` と `ipcRenderer` を使用し、既存の `safeInvoke` / `safeOn` パターンに準拠しています。

### 実装ファイル

| ファイル                                | 説明                            |
| --------------------------------------- | ------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | SkillAPI インターフェース・実装 |
| `apps/desktop/src/preload/index.ts`     | window.skillAPI への公開        |
| `apps/desktop/src/preload/channels.ts`  | IPC チャネル定義                |

---

## 2. 機能要件（FR）

### FR-1: SkillAPI インターフェース定義

| ID     | 要件                                          | 優先度 | 実装状況 |
| ------ | --------------------------------------------- | ------ | -------- |
| FR-1.1 | `SkillAPI` インターフェースが型定義されている | 高     | ✅ 完了  |
| FR-1.2 | 全APIメソッドが `SkillAPI` に定義されている   | 高     | ✅ 完了  |
| FR-1.3 | TypeScript の型安全性が確保されている         | 高     | ✅ 完了  |

**実装確認:**

- `SkillAPI` インターフェースは `skill-api.ts:29-77` で定義
- 全6メソッドが型定義済み: `execute`, `onStream`, `abort`, `getExecutionStatus`, `onPermissionRequest`, `sendPermissionResponse`

### FR-2: スキル実行API

| ID     | 要件                                                    | 優先度 | 実装状況 |
| ------ | ------------------------------------------------------- | ------ | -------- |
| FR-2.1 | `execute(request)`: スキル実行を開始できる              | 高     | ✅ 完了  |
| FR-2.2 | `abort(executionId)`: 実行中のスキルを中断できる        | 高     | ✅ 完了  |
| FR-2.3 | `getExecutionStatus(executionId)`: 実行状態を取得できる | 中     | ✅ 完了  |

**実装確認:**

- `execute`: `skill-api.ts:113-114` - `SKILL_EXECUTE` チャネル使用
- `abort`: `skill-api.ts:119-120` - `SKILL_ABORT` チャネル使用
- `getExecutionStatus`: `skill-api.ts:122-123` - `SKILL_GET_STATUS` チャネル使用

### FR-3: ストリーミングイベント

| ID     | 要件                                                       | 優先度 | 実装状況 |
| ------ | ---------------------------------------------------------- | ------ | -------- |
| FR-3.1 | `onStream(callback)`: ストリーミングメッセージを受信できる | 高     | ✅ 完了  |
| FR-3.2 | イベントリスナーのクリーンアップ関数を返す                 | 高     | ✅ 完了  |

**実装確認:**

- `onStream`: `skill-api.ts:116-117` - `SKILL_STREAM` チャネル使用
- クリーンアップ関数: `safeOn` 関数が `() => void` 型を返す

### FR-4: 権限確認API

| ID     | 要件                                                            | 優先度 | 実装状況 |
| ------ | --------------------------------------------------------------- | ------ | -------- |
| FR-4.1 | `onPermissionRequest(callback)`: 権限確認リクエストを購読できる | 高     | ✅ 完了  |
| FR-4.2 | `sendPermissionResponse(response)`: 権限確認応答を送信できる    | 高     | ✅ 完了  |

**実装確認:**

- `onPermissionRequest`: `skill-api.ts:127-133` - `SKILL_PERMISSION_REQUEST` チャネル使用
- `sendPermissionResponse`: `skill-api.ts:135-138` - `SKILL_PERMISSION_RESPONSE` チャネル使用

### FR-5: window.skillAPI への公開

| ID     | 要件                                               | 優先度 | 実装状況 |
| ------ | -------------------------------------------------- | ------ | -------- |
| FR-5.1 | `window.skillAPI` としてグローバルに公開されている | 高     | ✅ 完了  |
| FR-5.2 | `contextBridge.exposeInMainWorld` を使用している   | 高     | ✅ 完了  |

**実装確認:**

- `index.ts:539`: `contextBridge.exposeInMainWorld("skillAPI", skillAPI)`
- `index.ts:560`: 非isolated環境のフォールバック対応

---

## 3. 非機能要件（NFR）

### NFR-1: セキュリティ

| ID      | 要件                                                | 優先度 | 実装状況 |
| ------- | --------------------------------------------------- | ------ | -------- |
| NFR-1.1 | 許可されたIPCチャネルのみアクセス可能（safeInvoke） | 高     | ✅ 完了  |
| NFR-1.2 | 許可されたイベントチャネルのみ購読可能（safeOn）    | 高     | ✅ 完了  |
| NFR-1.3 | `contextIsolation: true` 環境で動作する             | 高     | ✅ 完了  |

**実装確認:**

- `safeInvoke`: `skill-api.ts:82-87` - `ALLOWED_INVOKE_CHANNELS` でホワイトリスト検証
- `safeOn`: `skill-api.ts:92-107` - `ALLOWED_ON_CHANNELS` でホワイトリスト検証
- チャネル登録: `channels.ts:379-388`（INVOKE）, `channels.ts:476-481`（ON）

### NFR-2: 品質

| ID      | 要件                                          | 優先度 | 実装状況 |
| ------- | --------------------------------------------- | ------ | -------- |
| NFR-2.1 | TypeScript コンパイルエラーがない             | 高     | 要確認   |
| NFR-2.2 | 既存の `safeInvoke` / `safeOn` パターンに準拠 | 高     | ✅ 完了  |
| NFR-2.3 | 単体テストカバレッジ 80% 以上                 | 中     | 要テスト |

### NFR-3: 互換性

| ID      | 要件                                         | 優先度 | 実装状況 |
| ------- | -------------------------------------------- | ------ | -------- |
| NFR-3.1 | 既存の `electronAPI` パターンとの整合性      | 高     | ✅ 完了  |
| NFR-3.2 | Electron Preload Script として正しく動作する | 高     | ✅ 完了  |

---

## 4. IPCチャネル一覧

### Invoke チャネル（Renderer → Main）

| チャネル                    | 用途           | 登録箇所        |
| --------------------------- | -------------- | --------------- |
| `skill:execute`             | スキル実行開始 | channels.ts:177 |
| `skill:abort`               | 実行中止       | channels.ts:179 |
| `skill:get-status`          | 実行状態取得   | channels.ts:180 |
| `skill:permission:response` | 権限応答送信   | channels.ts:191 |

### On チャネル（Main → Renderer）

| チャネル                   | 用途               | 登録箇所        |
| -------------------------- | ------------------ | --------------- |
| `skill:stream`             | ストリーミング受信 | channels.ts:178 |
| `skill:permission:request` | 権限確認リクエスト | channels.ts:190 |

---

## 5. 型定義

### SkillAPI インターフェース

```typescript
interface SkillAPI {
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

### 依存型定義

- `SkillExecutionRequest`: `@repo/shared/types/skill-execution`
- `SkillExecutionResponse`: `@repo/shared/types/skill-execution`
- `SkillStreamMessage`: `@repo/shared/types/skill-execution`
- `ExecutionInfo`: `@repo/shared/types/skill-execution`
- `SkillPermissionRequest`: `@repo/shared`
- `SkillPermissionResponse`: `@repo/shared`

---

## 6. 要件充足度サマリ

| カテゴリ          | 要件数 | 完了数 | 充足率 |
| ----------------- | ------ | ------ | ------ |
| 機能要件（FR）    | 10     | 10     | 100%   |
| 非機能要件（NFR） | 6      | 4      | 67%    |
| **合計**          | 16     | 14     | 88%    |

### 残課題

- [ ] NFR-2.1: TypeScript コンパイル確認（Phase 5で実施）
- [ ] NFR-2.3: 単体テストカバレッジ確認（Phase 7で実施）

---

## 7. 次のステップ

Phase 2: 設計 - API設計ドキュメント作成へ進む
