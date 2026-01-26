# TASK-4-2: PermissionResolver IPC Handlers 実装ガイド

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-4-2   |
| 作成日   | 2026-01-26 |
| 関連     | TASK-3-1-C |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 権限確認ダイアログとは？

権限確認ダイアログは、AIがツールを実行する前にユーザーの許可を求める仕組みです。

### なぜ必要なの？

AIアシスタントがファイルの読み書きや外部サービスへのアクセスなど、重要な操作を行う際に、ユーザーの明示的な許可なく実行されると、意図しない変更や情報漏洩のリスクがあります。

権限確認ダイアログは以下の役割を果たします：

1. **透明性**: AIが何をしようとしているかをユーザーに明示
2. **制御**: ユーザーが実行を許可または拒否できる
3. **安全性**: 不正な操作や誤った操作を防止

### ユーザーにとっての意味

ダイアログが表示されたら：

- **ツール名**: どんな操作が行われようとしているか確認
- **理由**: なぜその操作が必要か確認
- **引数**: 具体的にどのようなデータが使われるか確認
- **許可/拒否**: 安全だと判断したら「許可」、不安なら「拒否」

### セキュリティ上の重要性

```
┌─────────────────────────────────────────────────┐
│ AIアシスタント                                   │
│   「ファイルを削除していいですか？」             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 権限確認ダイアログ                               │
│   ツール: file:delete                           │
│   対象: /important/data.txt                     │
│                                                 │
│   [拒否]  [許可]                                │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ ユーザーの判断                                   │
│   「大事なファイルだから拒否しよう」             │
└─────────────────────────────────────────────────┘
```

このように、ユーザーが最終的な判断権を持つことで、AIによる意図しない操作を防ぎます。

---

# Part 2: 技術的詳細（開発者向け）

## アーキテクチャ概要

### コンポーネント構成

```
┌─────────────────────────────────────────────────────────────────┐
│ Main Process                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PermissionResolver (TASK-3-1-C)                           │  │
│  │  - waitForResponse(requestId): Promise<Response>          │  │
│  │  - resolveRequest(response): void                         │  │
│  │  - cancelRequest(requestId): void                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↑                                       │
│                         │ resolveRequest()                      │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │ permission-handlers.ts (TASK-4-2)                         │  │
│  │  - registerPermissionHandlers(mainWindow, resolver)       │  │
│  │  - unregisterPermissionHandlers()                         │  │
│  │  - createPermissionRequestForwarder(mainWindow)           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↑                                       │
└─────────────────────────┼───────────────────────────────────────┘
                          │ IPC
┌─────────────────────────┼───────────────────────────────────────┐
│ Preload                 │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │ skill-api.ts (TASK-4-2)                                   │  │
│  │  - onPermissionRequest(callback): () => void              │  │
│  │  - sendPermissionResponse(response): Promise<{success}>   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          ↑
┌─────────────────────────┼───────────────────────────────────────┐
│ Renderer Process        │                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │ usePermissionDialog.ts (TASK-4-2)                         │  │
│  │  - currentRequest: SkillPermissionRequest | null          │  │
│  │  - isOpen: boolean                                        │  │
│  │  - respond(approved, rememberChoice?): void               │  │
│  │  - close(): void                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ↑                                       │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │ PermissionDialog.tsx (TASK-4-2)                           │  │
│  │  - アクセシビリティ対応 (ARIA, Focus Trap)                │  │
│  │  - キーボードナビゲーション (Tab, Escape, Enter)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## IPC通信フロー

### シーケンス図

```
PermissionResolver    permission-handlers    Preload API    usePermissionDialog    PermissionDialog
       │                      │                   │                  │                    │
       │  waitForResponse()   │                   │                  │                    │
       │──────────────────────>                   │                  │                    │
       │                      │                   │                  │                    │
       │                      │ webContents.send  │                  │                    │
       │                      │ (skill:permission-│                  │                    │
       │                      │  request)         │                  │                    │
       │                      │─────────────────>│                   │                    │
       │                      │                   │                  │                    │
       │                      │                   │ onPermissionRequest                   │
       │                      │                   │ callback()       │                    │
       │                      │                   │─────────────────>│                    │
       │                      │                   │                  │                    │
       │                      │                   │                  │ setRequestQueue    │
       │                      │                   │                  │─────────────────>│
       │                      │                   │                  │                    │
       │                      │                   │                  │        render()    │
       │                      │                   │                  │<─────────────────│
       │                      │                   │                  │                    │
       │                      │                   │                  │  User clicks       │
       │                      │                   │                  │  "Allow"           │
       │                      │                   │                  │<─────────────────│
       │                      │                   │                  │                    │
       │                      │                   │ sendPermission   │                    │
       │                      │                   │ Response()       │                    │
       │                      │                   │<─────────────────│                    │
       │                      │                   │                  │                    │
       │                      │ ipcMain.handle    │                  │                    │
       │                      │ (skill:permission-│                  │                    │
       │                      │  response)        │                  │                    │
       │                      │<─────────────────│                   │                    │
       │                      │                   │                  │                    │
       │  resolveRequest()    │                   │                  │                    │
       │<─────────────────────│                   │                  │                    │
       │                      │                   │                  │                    │
       │  Promise resolves    │                   │                  │                    │
       │                      │                   │                  │                    │
```

### IPCチャンネル

| チャンネル                  | 方向            | 用途                   |
| --------------------------- | --------------- | ---------------------- |
| `skill:permission-request`  | Main → Renderer | 権限確認リクエスト送信 |
| `skill:permission-response` | Renderer → Main | 権限確認応答送信       |

## 各コンポーネントの責務

### permission-handlers.ts

**責務**: IPC通信の登録・解除・転送

```typescript
// IPC Handler登録
export function registerPermissionHandlers(
  mainWindow: BrowserWindow,
  permissionResolver: PermissionResolver,
): void;

// IPC Handler解除
export function unregisterPermissionHandlers(): void;

// リクエスト転送関数作成
export function createPermissionRequestForwarder(
  mainWindow: BrowserWindow,
): (request: SkillPermissionRequest) => void;
```

**セキュリティ**: sender検証によりメインウィンドウからのリクエストのみ受付

### skill-api.ts（Permission部分）

**責務**: Preload APIとしてRenderer側に安全なインターフェースを公開

```typescript
// 権限確認リクエストの購読
onPermissionRequest: (
  callback: (request: SkillPermissionRequest) => void,
) => () => void;

// 権限確認応答の送信
sendPermissionResponse: (
  response: SkillPermissionResponse,
) => Promise<{ success: boolean }>;
```

**セキュリティ**: safeOn/safeInvokeによるホワイトリスト強制

### usePermissionDialog.ts

**責務**: React状態管理とPreload API連携

```typescript
interface UsePermissionDialogReturn {
  currentRequest: SkillPermissionRequest | null;
  isOpen: boolean;
  requestQueue: SkillPermissionRequest[];
  isResponding: boolean;
  respond: (approved: boolean, rememberChoice?: boolean) => void;
  close: () => void;
}
```

**特徴**:

- 複数リクエストのFIFOキュー管理
- useCallbackによる最適化
- 適切なクリーンアップ

### PermissionDialog.tsx

**責務**: UI表示とアクセシビリティ

**ARIA属性**:

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` / `aria-describedby`

**キーボード操作**:

- `Escape`: ダイアログを閉じる（拒否）
- `Tab` / `Shift+Tab`: フォーカス移動（トラップ内）
- 初期フォーカス: 許可ボタン

## 使用例・コードサンプル

### Main Process での使用

```typescript
import { BrowserWindow } from "electron";
import { PermissionResolver } from "./services/skill/PermissionResolver";
import {
  registerPermissionHandlers,
  createPermissionRequestForwarder,
  unregisterPermissionHandlers,
} from "./ipc/permission-handlers";

// アプリ起動時
const mainWindow = new BrowserWindow({
  /* ... */
});
const permissionResolver = new PermissionResolver();

// ハンドラ登録
registerPermissionHandlers(mainWindow, permissionResolver);

// リクエスト転送関数を PermissionResolver に設定
const forwarder = createPermissionRequestForwarder(mainWindow);
permissionResolver.setRequestForwarder(forwarder);

// アプリ終了時
app.on("before-quit", () => {
  unregisterPermissionHandlers();
});
```

### Renderer Process での使用

```tsx
import React from "react";
import { usePermissionDialog } from "../hooks/usePermissionDialog";
import { PermissionDialog } from "../components/Permission/PermissionDialog";

function App() {
  const { currentRequest, isOpen, requestQueue, isResponding, respond, close } =
    usePermissionDialog();

  return (
    <div>
      {/* アプリのメインコンテンツ */}

      <PermissionDialog
        request={currentRequest}
        isOpen={isOpen}
        onAllow={() => respond(true)}
        onDeny={() => respond(false)}
        onClose={close}
        isResponding={isResponding}
      />
    </div>
  );
}
```

## トラブルシューティング

### ダイアログが表示されない

1. **IPC Handler登録確認**: `registerPermissionHandlers` が呼ばれているか
2. **ウィンドウ破棄確認**: `mainWindow.isDestroyed()` が true でないか
3. **チャンネルホワイトリスト確認**: `ALLOWED_ON_CHANNELS` に登録されているか

### レスポンスが届かない

1. **sender検証**: `event.sender === mainWindow.webContents` を確認
2. **ホワイトリスト**: `ALLOWED_INVOKE_CHANNELS` に登録されているか
3. **requestId一致**: リクエストとレスポンスの `requestId` が一致しているか

### フォーカストラップが動作しない

1. **ボタンref確認**: `allowButtonRef` / `denyButtonRef` が正しく設定されているか
2. **イベントリスナー**: `useEffect` のクリーンアップが正しく動作しているか

## テスト

### テストファイル構成

| ファイル                       | テスト数 | カバレッジ |
| ------------------------------ | -------- | ---------- |
| permission-handlers.test.ts    | 15       | 100%       |
| skill-api.permission.test.ts   | 12       | 100%       |
| usePermissionDialog.test.ts    | 21       | 100%       |
| PermissionDialog.test.tsx      | 25       | 96.66%     |
| permission-integration.test.ts | 20       | -          |
| **合計**                       | **93**   | -          |

### テスト実行

```bash
# 権限関連テストのみ実行
pnpm exec vitest run src/main/ipc/__tests__/permission-handlers.test.ts \
  src/preload/__tests__/skill-api.permission.test.ts \
  src/renderer/hooks/__tests__/usePermissionDialog.test.ts \
  src/renderer/components/Permission/__tests__/PermissionDialog.test.tsx \
  src/__tests__/permission-integration.test.ts
```

## 関連ドキュメント

| ドキュメント           | パス                                                             |
| ---------------------- | ---------------------------------------------------------------- |
| タスク仕様書           | `docs/30-workflows/TASK-4-2-permission-resolver-ipc-handlers/`   |
| PermissionResolver実装 | TASK-3-1-C                                                       |
| 型定義                 | `@repo/shared` (SkillPermissionRequest, SkillPermissionResponse) |
