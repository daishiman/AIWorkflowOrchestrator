# Phase 2: 設計

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 2                   |
| 機能名 | workspace-chat-edit |
| 作成日 | 2026-01-23          |

## 目的

Phase 1で定義した要件を実現可能な構造に落とし込む。アーキテクチャ設計、ドメインモデリング、IPC API設計を行い、実装の基盤を確立する。

## 実行タスク

- **アーキテクチャ設計**: システム構造の設計とパターン選定
- **ドメインモデリング**: エンティティ・関係の定義
- **IPC API設計**: IPCエンドポイント・スキーマの設計

## 参照資料

| 資料名                     | パス                                                                             | 説明                         |
| -------------------------- | -------------------------------------------------------------------------------- | ---------------------------- |
| 要件定義書                 | `outputs/phase-1/requirements-definition.md`                                     | Phase 1成果物                |
| アーキテクチャパターン     | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`     | Zustand Slice・IPC Handler   |
| チャット履歴アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | レイヤー構成・依存関係ルール |
| LLMインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`            | LLMチャット関連型定義        |
| APIエンドポイント          | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`             | Electron IPC API設計         |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                         | 内容                     |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| UIコンポーネント設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`      | コンポーネント設計原則   |
| セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | Electronセキュリティ     |
| エラーハンドリング   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類・リトライ戦略 |

## 実行手順

### 1. アーキテクチャ設計

#### レイヤー構成

```
┌─────────────────────────────────────────────────────────────┐
│                      UI Layer (React)                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ ChatPanel   │  │ DiffPreview  │  │ FileContextBadge  │  │
│  └─────────────┘  └──────────────┘  └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                  Application Layer (Hooks)                   │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ useFileContext   │  │ useChatWithContext              │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    State Layer (Zustand)                     │
│  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │ workspaceSlice   │  │ chatEditSlice (NEW)             │  │
│  └──────────────────┘  └─────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                 Infrastructure Layer (IPC)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Preload API: window.workspaceAPI / window.chatAPI    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ IPC
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Main Process                            │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ FileService     │  │ ChatEditService                 │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### コンポーネント構成

```
apps/desktop/src/renderer/
├── components/
│   ├── ChatPanel/
│   │   ├── ChatPanel.tsx
│   │   ├── FileContextBadge.tsx      # 添付ファイル表示バッジ
│   │   ├── FileContextDropZone.tsx   # D&Dドロップゾーン
│   │   └── EditCommandInput.tsx      # 編集コマンド入力
│   └── DiffPreview/
│       ├── DiffPreview.tsx           # 差分プレビューパネル
│       ├── DiffEditor.tsx            # Monaco Diff Editor
│       └── ApplyControls.tsx         # 適用/却下ボタン
├── features/
│   └── workspace-chat-edit/
│       ├── hooks/
│       │   ├── useFileContext.ts     # ファイルコンテキスト管理
│       │   ├── useChatWithContext.ts # コンテキスト付きチャット
│       │   └── useDiffApply.ts       # 差分適用ロジック
│       ├── store/
│       │   └── chatEditSlice.ts      # 状態管理スライス
│       └── types/
│           └── index.ts              # 型定義
└── lib/
    └── ipc/
        └── chatEditApi.ts            # IPC API
```

### 2. ドメインモデリング

#### エンティティ定義

```typescript
// FileContext: 添付ファイルコンテキスト
interface FileContext {
  id: string; // ユニークID
  filePath: string; // ファイルパス
  fileName: string; // ファイル名
  content: string; // ファイル内容
  selection?: TextSelection; // 選択範囲（オプション）
  language: string; // プログラミング言語
  addedAt: Date; // 添付日時
}

// TextSelection: テキスト選択範囲
interface TextSelection {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  selectedText: string;
}

// EditCommand: 編集コマンド
interface EditCommand {
  type: "continue" | "refactor" | "generate-test" | "add-comment" | "custom";
  targetContextId: string; // 対象FileContextのID
  instruction?: string; // カスタム指示（typeがcustomの場合）
}

// GeneratedResult: LLM生成結果
interface GeneratedResult {
  id: string;
  contextId: string; // 関連FileContextのID
  originalContent: string; // 元のコンテンツ
  generatedContent: string; // 生成されたコンテンツ
  diffHunks: DiffHunk[]; // 差分情報
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

// DiffHunk: 差分の塊
interface DiffHunk {
  startLine: number;
  endLine: number;
  originalLines: string[];
  newLines: string[];
}

// ApplyResult: 適用結果
interface ApplyResult {
  success: boolean;
  filePath: string;
  appliedAt: Date;
  error?: string;
}
```

#### 状態管理（Zustand Slice）

```typescript
// chatEditSlice.ts
interface ChatEditState {
  // ファイルコンテキスト
  fileContexts: FileContext[];
  activeContextId: string | null;

  // 生成結果
  generatedResults: GeneratedResult[];
  currentResultId: string | null;

  // UI状態
  isLoading: boolean;
  isDiffPreviewOpen: boolean;
  error: string | null;

  // アクション
  addFileContext: (context: Omit<FileContext, "id" | "addedAt">) => void;
  removeFileContext: (id: string) => void;
  clearAllContexts: () => void;
  setGeneratedResult: (result: GeneratedResult) => void;
  approveResult: (resultId: string) => Promise<ApplyResult>;
  rejectResult: (resultId: string) => void;
  openDiffPreview: (resultId: string) => void;
  closeDiffPreview: () => void;
}
```

### 3. IPC API設計

#### チャンネル定義

| チャンネル名                  | 方向          | 説明                           |
| ----------------------------- | ------------- | ------------------------------ |
| `chat-edit:read-file`         | Renderer→Main | ファイル内容の読み取り         |
| `chat-edit:write-file`        | Renderer→Main | ファイルへの書き込み           |
| `chat-edit:get-selection`     | Renderer→Main | エディタ選択範囲の取得         |
| `chat-edit:send-with-context` | Renderer→Main | コンテキスト付きメッセージ送信 |

#### Preload API

```typescript
// preload/chatEditApi.ts
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
```

#### Main Process Handler

```typescript
// main/handlers/chatEditHandlers.ts
import { ipcMain } from "electron";

export function registerChatEditHandlers(): void {
  ipcMain.handle("chat-edit:read-file", async (event, filePath: string) => {
    // ファイル読み取りロジック
  });

  ipcMain.handle(
    "chat-edit:write-file",
    async (event, filePath: string, content: string) => {
      // ファイル書き込みロジック
    },
  );

  ipcMain.handle("chat-edit:get-selection", async (event) => {
    // エディタ選択範囲取得ロジック
  });

  ipcMain.handle(
    "chat-edit:send-with-context",
    async (event, contexts, command, message) => {
      // LLM送信ロジック
    },
  );
}
```

## 統合テスト連携【必須】

統合ポイント/契約（IPC API・スキーマ）を設計に反映する:

| 統合ポイント  | 契約定義                               |
| ------------- | -------------------------------------- |
| Renderer→Main | IPC: `chat-edit:*` チャンネル群        |
| Main→LLM      | LLMClient.sendWithContext()            |
| 状態同期      | Zustand chatEditSlice ⇔ workspaceSlice |
| UI連携        | DiffPreview ⇔ Monaco Editor            |

## 成果物

| 成果物             | パス                                     | 説明             |
| ------------------ | ---------------------------------------- | ---------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | システム構造     |
| ドメインモデル     | `outputs/phase-2/domain-model.md`        | エンティティ定義 |
| IPC API設計        | `outputs/phase-2/ipc-api-design.md`      | API仕様          |

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] ドメインモデル（エンティティ・型定義）が作成されている
- [ ] IPC APIが設計されている（チャンネル・リクエスト・レスポンス）
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. レイヤー構成の設計
3. コンポーネント構成の設計
4. ドメインモデリング（エンティティ定義）
5. 状態管理スライスの設計
6. IPC API設計
7. 統合テスト連携の実施
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/workspace-chat-edit --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート
