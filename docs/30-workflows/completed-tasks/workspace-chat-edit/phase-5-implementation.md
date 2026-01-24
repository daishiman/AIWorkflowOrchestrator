# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 5                   |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

Phase 4で作成したテストを通すための最小限の実装を行う。TDD原則に従い、テストを成功させることに集中し、過度な最適化やリファクタリングは行わない。

## 実行タスク

- **コンテキスト連携実装**: ファイル添付ロジック実装
- **編集指示UI実装**: チャットUI拡張
- **差分プレビューUI実装**: Monaco Diff Editor統合
- **結果適用ロジック実装**: ファイル書き込み処理
- **IPC Handler実装**: Main Process連携

## 参照資料

| 資料名             | パス                                         | 説明          |
| ------------------ | -------------------------------------------- | ------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | Phase 4成果物 |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | Phase 4成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2成果物 |
| ドメインモデル     | `outputs/phase-2/domain-model.md`            | Phase 2成果物 |
| IPC API設計        | `outputs/phase-2/ipc-api-design.md`          | Phase 2成果物 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                 |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------- |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | Zustand Slice/IPC    |
| UIコンポーネント設計   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | HIG準拠              |
| セキュリティ           | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electronセキュリティ |

## 実行手順

### 1. コンテキスト連携実装

#### 型定義

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts

export interface FileContext {
  id: string;
  filePath: string;
  fileName: string;
  content: string;
  selection?: TextSelection;
  language: string;
  addedAt: Date;
}

export interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  selectedText: string;
}

export interface EditCommand {
  type: "continue" | "refactor" | "generate-test" | "add-comment" | "custom";
  targetContextId: string;
  instruction?: string;
}

export interface GeneratedResult {
  id: string;
  contextId: string;
  originalContent: string;
  generatedContent: string;
  diffHunks: DiffHunk[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface DiffHunk {
  startLine: number;
  endLine: number;
  originalLines: string[];
  newLines: string[];
}
```

#### Zustand Slice

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts

import { StateCreator } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { FileContext, GeneratedResult } from "../types";

export interface ChatEditSlice {
  fileContexts: FileContext[];
  generatedResults: GeneratedResult[];
  activeContextId: string | null;
  currentResultId: string | null;
  isLoading: boolean;
  isDiffPreviewOpen: boolean;
  error: string | null;

  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  removeFileContext: (id: string) => void;
  clearAllContexts: () => void;
  setGeneratedResult: (
    result: Omit<GeneratedResult, "id" | "createdAt">,
  ) => void;
  approveResult: (resultId: string) => Promise<void>;
  rejectResult: (resultId: string) => void;
  openDiffPreview: (resultId: string) => void;
  closeDiffPreview: () => void;
  setError: (error: string | null) => void;
}

export const createChatEditSlice: StateCreator<ChatEditSlice> = (set, get) => ({
  fileContexts: [],
  generatedResults: [],
  activeContextId: null,
  currentResultId: null,
  isLoading: false,
  isDiffPreviewOpen: false,
  error: null,

  addFileContext: (context) => {
    const newContext: FileContext = {
      ...context,
      id: uuidv4(),
      addedAt: new Date(),
    };
    set((state) => ({
      fileContexts: [...state.fileContexts, newContext],
      activeContextId: newContext.id,
    }));
  },

  removeFileContext: (id) => {
    set((state) => ({
      fileContexts: state.fileContexts.filter((c) => c.id !== id),
      activeContextId:
        state.activeContextId === id ? null : state.activeContextId,
    }));
  },

  clearAllContexts: () => {
    set({ fileContexts: [], activeContextId: null });
  },

  setGeneratedResult: (result) => {
    const newResult: GeneratedResult = {
      ...result,
      id: uuidv4(),
      createdAt: new Date(),
    };
    set((state) => ({
      generatedResults: [...state.generatedResults, newResult],
      currentResultId: newResult.id,
      isDiffPreviewOpen: true,
    }));
  },

  approveResult: async (resultId) => {
    // IPC呼び出しでファイル書き込み
    // 実装
  },

  rejectResult: (resultId) => {
    set((state) => ({
      generatedResults: state.generatedResults.map((r) =>
        r.id === resultId ? { ...r, status: "rejected" } : r,
      ),
      isDiffPreviewOpen: false,
      currentResultId: null,
    }));
  },

  openDiffPreview: (resultId) => {
    set({ currentResultId: resultId, isDiffPreviewOpen: true });
  },

  closeDiffPreview: () => {
    set({ isDiffPreviewOpen: false, currentResultId: null });
  },

  setError: (error) => {
    set({ error });
  },
});
```

### 2. UIコンポーネント実装

#### FileContextBadge

```typescript
// apps/desktop/src/renderer/components/ChatPanel/FileContextBadge.tsx

import React from 'react';
import type { FileContext } from '../../features/workspace-chat-edit/types';

interface FileContextBadgeProps {
  context: FileContext;
  onRemove: (id: string) => void;
}

export const FileContextBadge: React.FC<FileContextBadgeProps> = ({
  context,
  onRemove,
}) => {
  const lineCount = context.content.split('\n').length;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
      role="listitem"
      aria-label={`添付ファイル: ${context.fileName}`}
    >
      <span className="text-sm font-medium">{context.fileName}</span>
      <span className="text-xs text-gray-500">({lineCount} lines)</span>
      <button
        onClick={() => onRemove(context.id)}
        className="text-gray-400 hover:text-gray-600"
        aria-label={`${context.fileName}を削除`}
      >
        ×
      </button>
    </div>
  );
};
```

#### DiffPreview

```typescript
// apps/desktop/src/renderer/components/DiffPreview/DiffPreview.tsx

import React from 'react';
import { DiffEditor } from '@monaco-editor/react';
import type { GeneratedResult } from '../../features/workspace-chat-edit/types';

interface DiffPreviewProps {
  result: GeneratedResult;
  onApprove: () => void;
  onReject: () => void;
}

export const DiffPreview: React.FC<DiffPreviewProps> = ({
  result,
  onApprove,
  onReject,
}) => {
  return (
    <div className="flex flex-col h-full" role="dialog" aria-label="差分プレビュー">
      <div className="flex-1">
        <DiffEditor
          original={result.originalContent}
          modified={result.generatedContent}
          language="typescript"
          theme="vs-dark"
          options={{
            readOnly: true,
            renderSideBySide: true,
          }}
        />
      </div>
      <div className="flex justify-end gap-2 p-4 border-t">
        <button
          onClick={onReject}
          className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
          aria-label="変更を却下"
        >
          却下
        </button>
        <button
          onClick={onApprove}
          className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
          aria-label="変更を適用"
        >
          適用
        </button>
      </div>
    </div>
  );
};
```

### 3. IPC Handler実装

```typescript
// apps/desktop/src/main/handlers/chatEditHandlers.ts

import { ipcMain } from "electron";
import * as fs from "fs/promises";
import * as path from "path";

export function registerChatEditHandlers(): void {
  ipcMain.handle("chat-edit:read-file", async (event, filePath: string) => {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const ext = path.extname(filePath).slice(1);
      const language = getLanguageFromExtension(ext);
      return { success: true, content, language };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(
    "chat-edit:write-file",
    async (event, filePath: string, content: string) => {
      try {
        await fs.writeFile(filePath, content, "utf-8");
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    },
  );

  ipcMain.handle("chat-edit:get-selection", async (event) => {
    // エディタ選択範囲取得ロジック
    // Monaco Editorとの連携
    return null;
  });

  ipcMain.handle(
    "chat-edit:send-with-context",
    async (event, contexts, command, message) => {
      // LLM送信ロジック
      // 実装
    },
  );
}

function getLanguageFromExtension(ext: string): string {
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    md: "markdown",
    json: "json",
    html: "html",
    css: "css",
  };
  return languageMap[ext] || "plaintext";
}
```

### 4. Preload API実装

```typescript
// apps/desktop/src/preload/chatEditApi.ts

import { ipcRenderer } from "electron";
import type {
  FileContext,
  EditCommand,
  TextSelection,
} from "../renderer/features/workspace-chat-edit/types";

export interface ChatEditAPI {
  readFile: (filePath: string) => Promise<FileReadResult>;
  writeFile: (filePath: string, content: string) => Promise<FileWriteResult>;
  getEditorSelection: () => Promise<TextSelection | null>;
  sendWithContext: (
    contexts: FileContext[],
    command: EditCommand,
    message: string,
  ) => Promise<StreamResponse>;
}

interface FileReadResult {
  success: boolean;
  content?: string;
  language?: string;
  error?: string;
}

interface FileWriteResult {
  success: boolean;
  error?: string;
}

interface StreamResponse {
  success: boolean;
  content?: string;
  error?: string;
}

export const chatEditApi: ChatEditAPI = {
  readFile: (filePath) => ipcRenderer.invoke("chat-edit:read-file", filePath),
  writeFile: (filePath, content) =>
    ipcRenderer.invoke("chat-edit:write-file", filePath, content),
  getEditorSelection: () => ipcRenderer.invoke("chat-edit:get-selection"),
  sendWithContext: (contexts, command, message) =>
    ipcRenderer.invoke(
      "chat-edit:send-with-context",
      contexts,
      command,
      message,
    ),
};
```

## 統合テスト連携【必須】

Renderer/Main接続の実装とテスト支援コード整備:

| 実装項目           | 内容                                    |
| ------------------ | --------------------------------------- |
| IPC接続            | chat-edit:\* ハンドラー登録             |
| エラーハンドリング | ファイル読取/書込エラーのUI通知         |
| 状態同期           | chatEditSlice更新時のワークスペース連携 |

## 成果物

| 成果物           | パス                                                            | 説明                |
| ---------------- | --------------------------------------------------------------- | ------------------- |
| 型定義           | `apps/desktop/src/renderer/features/workspace-chat-edit/types/` | TypeScript型        |
| 状態管理         | `apps/desktop/src/renderer/features/workspace-chat-edit/store/` | Zustand Slice       |
| UIコンポーネント | `apps/desktop/src/renderer/components/`                         | Reactコンポーネント |
| IPC Handler      | `apps/desktop/src/main/handlers/`                               | Main Process        |
| Preload API      | `apps/desktop/src/preload/`                                     | IPC Bridge          |

## 完了条件

- [ ] すべてのテストが成功状態（Green）
- [ ] 実装が最小限に抑えられている
- [ ] IPC接続が実装されている
- [ ] 型定義が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが成功することを確認（Green状態）
```

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 型定義の実装
3. chatEditSliceの実装
4. useFileContextフックの実装
5. useDiffApplyフックの実装
6. FileContextBadgeコンポーネントの実装
7. DiffPreviewコンポーネントの実装
8. IPC Handlerの実装
9. Preload APIの実装
10. テスト実行・Green確認
11. 成果物の作成・配置
12. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 5
```

## 次のPhase

Phase 6: テスト拡充
