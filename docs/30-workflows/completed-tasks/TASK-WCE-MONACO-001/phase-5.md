# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 5                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

## 目的

テストを通すための最小限の実装を行う。

## 実行タスク

- クリーンコード実装: 可読性・保守性の高いコード作成
- エラーハンドリング: 適切なエラー処理の実装
- 型安全性確保: TypeScriptの型システム活用

## 参照資料

| 資料名       | パス                                     | 説明          |
| ------------ | ---------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md`  | Phase 4成果物 |
| 設計書       | `outputs/phase-2/architecture-design.md` | Phase 2成果物 |

## 実行手順

### 1. Renderer側ユーティリティ実装

**ファイル**: `apps/desktop/src/renderer/utils/editorSelection.ts`

```typescript
import type { TextSelection } from "../features/workspace-chat-edit/types";

// Monaco Editorインスタンスを取得する関数（要実装）
let activeEditor: monaco.editor.IStandaloneCodeEditor | null = null;

export const setActiveEditor = (
  editor: monaco.editor.IStandaloneCodeEditor | null,
): void => {
  activeEditor = editor;
};

export const getActiveEditor =
  (): monaco.editor.IStandaloneCodeEditor | null => {
    return activeEditor;
  };

export const getEditorSelection = (): TextSelection | null => {
  const editor = getActiveEditor();
  if (!editor) return null;

  const selection = editor.getSelection();
  if (!selection) return null;

  const model = editor.getModel();
  if (!model) return null;

  const selectedText = model.getValueInRange(selection);

  // 空選択（カーソルのみ）の場合はnullを返す
  if (selection.isEmpty()) return null;

  return {
    startLine: selection.startLineNumber,
    endLine: selection.endLineNumber,
    startColumn: selection.startColumn,
    endColumn: selection.endColumn,
    selectedText,
  };
};
```

### 2. Preload API実装

**ファイル**: `apps/desktop/src/preload/chatEditApi.ts`

```typescript
import { ipcRenderer } from "electron";
import { CHANNELS } from "./channels";
import type { TextSelection } from "../renderer/features/workspace-chat-edit/types";

export const chatEditAPI = {
  // ... 既存メソッド

  getEditorSelection: async (): Promise<TextSelection | null> => {
    return ipcRenderer.invoke(CHANNELS.CHAT_EDIT_GET_SELECTION);
  },
};
```

### 3. Main Process ハンドラー実装

**ファイル**: `apps/desktop/src/main/ipc/chatEditHandlers.ts`

```typescript
import { ipcMain, BrowserWindow } from "electron";
import { CHANNELS } from "../../preload/channels";
import { validateIpcSender } from "../utils/ipcValidation";
import type { TextSelection } from "../../renderer/features/workspace-chat-edit/types";

export const registerChatEditHandlers = (): void => {
  ipcMain.handle(
    CHANNELS.CHAT_EDIT_GET_SELECTION,
    async (event): Promise<TextSelection | null> => {
      if (!validateIpcSender(event)) {
        return null;
      }

      // Renderer側に選択範囲を問い合わせ
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (!focusedWindow) return null;

      try {
        const selection = await focusedWindow.webContents.executeJavaScript(`
          (function() {
            if (window.__editorSelection && typeof window.__editorSelection.getEditorSelection === 'function') {
              return window.__editorSelection.getEditorSelection();
            }
            return null;
          })()
        `);
        return selection;
      } catch (error) {
        console.error("Failed to get editor selection:", error);
        return null;
      }
    },
  );
};
```

### 4. IPC登録追加

**ファイル**: `apps/desktop/src/main/ipc/index.ts`

```typescript
import { registerChatEditHandlers } from "./chatEditHandlers";

export const registerAllIpcHandlers = (): void => {
  // ... 既存の登録
  registerChatEditHandlers();
};
```

### 5. チャンネル定義確認

**ファイル**: `apps/desktop/src/preload/channels.ts`

```typescript
export const CHANNELS = {
  // ... 既存チャンネル
  CHAT_EDIT_GET_SELECTION: "chat-edit:get-selection",
} as const;
```

## 統合テスト連携【必須】

フロント/バック接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                        |
| ------------------ | ------------------------------------------- |
| IPC接続            | chat-edit:get-selectionチャンネル経由の通信 |
| エラーハンドリング | エディタ未存在時のnull返却                  |
| 状態同期           | activeEditorの設定/取得                     |

## アーキテクチャ層別実装

| 層               | 実装観点                         | 実装ファイル配置                   | 仕様参照先                 |
| ---------------- | -------------------------------- | ---------------------------------- | -------------------------- |
| Renderer Process | Monaco選択範囲取得ユーティリティ | `apps/desktop/src/renderer/utils/` | `ui-ux-components.md`      |
| Main Process     | handleGetSelection、IPC登録      | `apps/desktop/src/main/ipc/`       | `architecture-patterns.md` |
| IPC通信          | チャンネルハンドラー             | `apps/desktop/src/main/ipc/`       | `api-ipc-agent.md`         |
| Preload          | chatEditAPI.getEditorSelection   | `apps/desktop/src/preload/`        | `security-electron-ipc.md` |

## 成果物

| 成果物                  | パス                                                 | 説明                     |
| ----------------------- | ---------------------------------------------------- | ------------------------ |
| editorSelection.ts      | `apps/desktop/src/renderer/utils/editorSelection.ts` | Renderer側ユーティリティ |
| chatEditHandlers.ts修正 | `apps/desktop/src/main/ipc/chatEditHandlers.ts`      | Main Processハンドラー   |
| chatEditApi.ts修正      | `apps/desktop/src/preload/chatEditApi.ts`            | Preload API              |
| index.ts修正            | `apps/desktop/src/main/ipc/index.ts`                 | IPC登録追加              |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] IPC接続が実装されている
- [ ] アーキテクチャ層別の実装が適切に配置されている
- [ ] TODOコメントが削除されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（Rendererユーティリティ、Preload API、Main Process、IPC登録）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 5
```

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
