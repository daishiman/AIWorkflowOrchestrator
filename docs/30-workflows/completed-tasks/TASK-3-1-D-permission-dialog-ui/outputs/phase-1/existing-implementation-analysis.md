# 既存実装調査レポート

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 既存PermissionDialogコンポーネント

**ファイル**: `apps/desktop/src/renderer/components/organisms/PermissionDialog/PermissionDialog.tsx`

### Props定義

```typescript
export interface PermissionDialogProps {
  /** 権限リクエスト（nullで非表示） */
  request: PermissionRequest | null;
  /** 許可ハンドラ */
  onApprove: (rememberChoice: boolean) => void;
  /** 拒否ハンドラ */
  onDeny: (rememberChoice: boolean) => void;
}
```

### 機能一覧

| 機能                 | 状態      | 詳細                                          |
| -------------------- | --------- | --------------------------------------------- |
| ダイアログ表示       | ✅ 実装済 | `request`がnullでない場合に表示               |
| ツール名表示         | ✅ 実装済 | `request.toolName`を表示                      |
| 引数表示             | ✅ 実装済 | `request.args`をJSON形式で表示                |
| 理由表示             | ✅ 実装済 | `request.reason`が存在する場合に表示          |
| 許可ボタン           | ✅ 実装済 | `onApprove(rememberChoice)`を呼び出し         |
| 拒否ボタン           | ✅ 実装済 | `onDeny(rememberChoice)`を呼び出し            |
| 記憶チェックボックス | ✅ 実装済 | `rememberChoice`状態を管理                    |
| フォーカストラップ   | ✅ 実装済 | モーダル内でTabキーがループ                   |
| aria-labelledby      | ✅ 実装済 | `role="alertdialog"`, `aria-modal="true"`対応 |

### アクセシビリティ対応状況

| 要件               | 状態      | 実装内容                               |
| ------------------ | --------- | -------------------------------------- |
| フォーカストラップ | ✅ 対応済 | useEffect内でTabキーイベント処理       |
| 初期フォーカス     | ✅ 対応済 | モーダル表示時に最初の要素にフォーカス |
| role="alertdialog" | ✅ 対応済 | ダイアログルート要素に設定             |
| aria-modal="true"  | ✅ 対応済 | モーダル性を明示                       |
| aria-labelledby    | ✅ 対応済 | タイトル要素にID紐付け                 |
| ボタンaria-label   | ✅ 対応済 | 「許可」「拒否」のラベル設定           |

---

## 2. agentAPI permission機能

**ファイル**: `apps/desktop/src/preload/index.ts`

### 実装済みメソッド

```typescript
const agentAPI: AgentExecutionAPI = {
  // ...
  respondPermission: (response: AgentPermissionResponse) =>
    safeInvoke(IPC_CHANNELS.AGENT_PERMISSION_RESPOND, response),
  onPermission: (callback: (request: AgentPermissionRequest) => void) =>
    safeOn<AgentPermissionRequest>(
      IPC_CHANNELS.AGENT_PERMISSION_REQUEST,
      callback,
    ),
};
```

### 使用IPCチャネル

| チャネル                   | 定数名                   | 方向            | 用途                |
| -------------------------- | ------------------------ | --------------- | ------------------- |
| `agent:permission-request` | AGENT_PERMISSION_REQUEST | Main → Renderer | Agent権限リクエスト |
| `agent:permission-respond` | AGENT_PERMISSION_RESPOND | Renderer → Main | Agent権限応答       |

---

## 3. skillAPIの現状

**ファイル**: `apps/desktop/src/preload/skill-api.ts`

### 現在のインターフェース

```typescript
export interface SkillAPI {
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;
  abort: (executionId: string) => Promise<boolean>;
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;
}
```

### permission関連メソッド状況

| メソッド          | 状態      | 追加が必要 |
| ----------------- | --------- | ---------- |
| onPermission      | ❌ 未実装 | ✅ 必要    |
| respondPermission | ❌ 未実装 | ✅ 必要    |

---

## 4. TASK-3-1-C Main Process実装

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

### 権限リクエスト送信メソッド

```typescript
async sendPermissionRequest(
  executionId: string,
  toolName: string,
  args: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<SkillPermissionResponse> {
  const requestId = uuidv4();

  // Renderer に権限リクエストを送信
  if (!this.mainWindow.isDestroyed()) {
    this.mainWindow.webContents.send(
      SKILL_CHANNELS.SKILL_PERMISSION_REQUEST,
      {
        executionId,
        requestId,
        toolName,
        args: this.sanitizeArgs(args),
        reason: this.getPermissionReason(toolName, args),
      },
    );
  }

  // 応答を待機
  return this.permissionResolver.waitForResponse(requestId, signal);
}
```

### 権限応答処理メソッド

```typescript
handlePermissionResponse(
  requestId: string,
  approved: boolean,
  rememberChoice?: boolean,
  rejectReason?: string,
): void {
  this.permissionResolver.resolveRequest({
    requestId,
    approved,
    rememberChoice,
    rejectReason,
  });
}
```

### 使用IPCチャネル

| チャネル                    | 方向            | 用途                       |
| --------------------------- | --------------- | -------------------------- |
| `skill:permission:request`  | Main → Renderer | 権限リクエスト送信         |
| `skill:permission:response` | Renderer → Main | 権限応答受信（期待される） |

---

## 5. IPCチャネル定義状況

**ファイル**: `packages/shared/src/ipc/channels.ts`

### Skill Permission関連チャネル（定義済み）

```typescript
export const SKILL_CHANNELS = {
  // ...
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
};
```

**ファイル**: `apps/desktop/src/preload/channels.ts`

### ALLOWED_ON_CHANNELS (受信許可リスト)

| チャネル                 | 登録状況  |
| ------------------------ | --------- |
| SKILL_STREAM             | ✅ 登録済 |
| SKILL_PERMISSION_REQUEST | ❌ 未登録 |

### ALLOWED_INVOKE_CHANNELS (送信許可リスト)

| チャネル                 | 登録状況  |
| ------------------------ | --------- |
| SKILL_EXECUTE            | ✅ 登録済 |
| SKILL_ABORT              | ✅ 登録済 |
| SKILL_GET_STATUS         | ✅ 登録済 |
| SKILL_PERMISSION_RESPOND | ❌ 未登録 |

---

## 6. agentSlice状態管理

**ファイル**: `apps/desktop/src/renderer/store/slices/agentSlice.ts`

### pendingPermission状態

```typescript
executionState: {
  // ...
  pendingPermission: null,  // PermissionRequest | null
  rememberedChoices: {},    // Record<string, boolean>
}
```

### Permission関連アクション

| アクション               | 説明                              |
| ------------------------ | --------------------------------- |
| setPermissionRequest     | 権限リクエストを設定              |
| respondToPermission      | 権限に応答（ステータス更新）      |
| rememberPermissionChoice | 選択を記憶（toolName → approved） |
| getRememberedChoice      | 記憶された選択を取得              |
| clearRememberedChoices   | 記憶をクリア                      |

---

## 7. 本タスクで追加が必要な機能

### 7.1 skillAPI拡張

| 追加メソッド      | 説明                           |
| ----------------- | ------------------------------ |
| onPermission      | 権限リクエスト受信リスナー登録 |
| respondPermission | 権限応答送信                   |

### 7.2 IPCチャネル登録

| チャネル                          | 登録先                  |
| --------------------------------- | ----------------------- |
| SKILL_PERMISSION_REQUEST (受信用) | ALLOWED_ON_CHANNELS     |
| SKILL_PERMISSION_RESPOND (送信用) | ALLOWED_INVOKE_CHANNELS |

### 7.3 SkillStreamDisplayコンポーネント連携

- skillAPI.onPermission()でリクエスト受信
- PermissionDialogコンポーネントの表示制御
- 許可/拒否時にskillAPI.respondPermission()呼び出し

---

## 8. 結論

### 再利用可能な実装

1. **PermissionDialog**: そのまま再利用可能（Props互換）
2. **agentSlice**: pendingPermission状態管理パターンを流用可能
3. **PermissionRequest型**: @repo/shared/types/agent から import可能

### 新規実装が必要な部分

1. **skillAPI拡張**: `onPermission`, `respondPermission` メソッド追加
2. **channels.ts**: ALLOWED_ON/INVOKE_CHANNELSへの登録
3. **SkillStreamDisplay連携**: skillAPIとPermissionDialogの接続ロジック

### 設計方針

- 既存のagentAPIのパターンを踏襲
- SKILL_CHANNELS定義を活用
- 既存PermissionDialogコンポーネントを再利用
