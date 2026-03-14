# Phase 5 実装計画 - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 5                                           |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| 依存成果物 | Phase 1〜4 成果物                           |

---

## 1. 実装方針

本タスクは設計フェーズ（type: design）であり、本 Phase の成果物は「実際のコード実装」ではなく「実装手順書」である。
実際のコード実装は後続タスクで行う。

### 実装原則

- stub 除去は段階的に行い、各ステップでテストが PASS であることを確認する
- RuntimeResolver は AuthKeyService / AuthModeService に DI で依存させる（P34: Setter Injection も検討）
- 既実装の workspacePath 制約（read/write）は一切変更しない
- M-01 指摘の contextBridge 修正を最初のステップとして行う

---

## 2. adapter 置換順序（GAP-02 解決）

### Step 1: Preload contextBridge 修正（M-01 対応）【最優先】

**変更ファイル**: `apps/desktop/src/preload/chatEditApi.ts`

```
現状:
  (window as unknown as Record<string, unknown>).chatEditAPI = chatEditAPI;

修正後:
  contextBridge.exposeInMainWorld('chatEditAPI', chatEditAPI);
```

確認事項:

- `preload/index.ts` で `exposeChatEditAPI()` が呼び出されているか確認
- Renderer の型定義に `window.chatEditAPI: ChatEditAPI` を追加
- `contextIsolation: true` 環境でアクセスできることを TC-PREL-01 で確認

### Step 2: types.ts に新エラーコードと handoff フィールドを追加

**変更ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/types.ts`

追加する型:

```typescript
// 新エラーコード（SendError.code に追加）
type SendErrorCode =
  | "SELECTION_REQUIRED" // 新規
  | "ACCESS_NOT_CONFIGURED" // 新規
  | "RATE_LIMIT" // 新規
  | "TIMEOUT" // 新規
  | "CONTEXT_TOO_LARGE" // 既存
  | "PERMISSION_DENIED" // 既存
  | "INVALID_COMMAND" // 既存
  | "LLM_ERROR"; // 既存

// HandoffGuidance（新規）
interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

// SendWithContextResponse に追加
interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
  handoff?: boolean; // 新規
  guidance?: HandoffGuidance; // 新規
}

// SendWithContextRequest に追加
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message?: string;
  options?: SendOptions;
  workspacePath?: string; // 新規
}
```

### Step 3: RuntimeResolver 新規実装

**新規ファイル**: `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`

```typescript
// インターフェース設計（Phase 2 contract-matrix.md §6 参照）
interface RuntimeResolver {
  resolve(authMode: AuthMode, hasApiKey: boolean): RuntimeResolution;
}

type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string }
  | { type: "hybrid"; adapter: LLMAdapter; fallbackToHandoff: boolean };
```

解決ロジック:
| authMode | hasApiKey | 解決結果 |
| ------------ | --------- | ------------ |
| integrated | true | integrated |
| integrated | false | handoff |
| terminal | any | handoff |
| hybrid | true | hybrid |
| hybrid | false | handoff |

### Step 4: TerminalHandoffBuilder 新規実装

**新規ファイル**: `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`

```typescript
interface TerminalHandoffBuilder {
  build(request: SendWithContextRequest, reason: string): HandoffGuidance;
}
```

`contextSummary` 生成内容:

- 対象ファイルパス（basename）
- 選択行範囲（selection があれば）
- コマンドタイプ（refactor / generate-test 等）
- workspacePath

`terminalCommand` 生成内容:

- `claude` コマンドに workspacePath と context サマリーを渡すコマンド例

### Step 5: handleSendWithContext を修正

**変更ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

追加する処理（ハンドラ冒頭の検証ブロック後）:

1. `request.workspacePath` が指定されている場合、contexts の各 filePath を `isWithinWorkspace` で検証
2. 違反があれば `{ success: false, error: { code: 'PERMISSION_DENIED', ... } }` を返却
3. RuntimeResolver への委譲
4. integrated 経路: ChatEditService.sendWithContext() へ
5. handoff 経路: TerminalHandoffBuilder.build() → `{ handoff: true, guidance }` を返却

### Step 6: ipc/index.ts の stub adapter を RuntimeResolver 経由に置換

**変更ファイル**: `apps/desktop/src/main/ipc/index.ts` (L832-844)

```typescript
// 現状（stub）
const stubLLMAdapter = {
  sendMessage: async () => ({
    success: false,
    error: { message: "LLM adapter not configured for chat-edit" },
  }),
};
const chatEditService = new ChatEditService(stubLLMAdapter, contextBuilder);
registerChatEditHandlers(mainWindow, chatEditService, fileService);

// 修正後
const runtimeResolver = new RuntimeResolver(authKeyService, authModeService);
const chatEditService = new ChatEditService(contextBuilder); // LLMAdapter は動的解決
registerChatEditHandlers(
  mainWindow,
  chatEditService,
  fileService,
  runtimeResolver,
);
```

注: ChatEditService の設計変更が必要かを検討する（RuntimeResolver を DI か、handler 側で解決するか）

### Step 7: chatEditSlice の selection state 強化確認

**変更ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts`

確認事項:

- `selection: TextSelection | null` が state に存在するか確認
- Monaco editor からの selection 更新アクション（`setSelection`）が定義されているか確認
- 「編集案を生成」CTA の disabled 条件に `selection === null` が含まれるか確認

---

## 3. bridge 実装順序（GAP-01 解決）

### Monaco selection → chatEditSlice の接続確認

1. Monaco Editor の `onDidChangeCursorSelection` イベントを確認
2. `chatEditSlice.setSelection()` アクションへの接続を確認
3. `sendWithContext` リクエスト組み立て時に `chatEditSlice.selection` を `contexts[].selection` に付与する処理を確認

---

## 4. 変更対象ファイル一覧

| 優先度 | ファイル                                            | 変更種別  | 依存する Step |
| ------ | --------------------------------------------------- | --------- | ------------- |
| 1      | `preload/chatEditApi.ts`                            | 修正      | Step 1        |
| 2      | `renderer/features/workspace-chat-edit/types.ts`    | 修正      | Step 2        |
| 3      | `main/services/chat-edit/RuntimeResolver.ts`        | 新規      | Step 3        |
| 4      | `main/services/chat-edit/TerminalHandoffBuilder.ts` | 新規      | Step 4        |
| 5      | `main/handlers/chatEditHandlers.ts`                 | 修正      | Step 5        |
| 6      | `main/ipc/index.ts`                                 | 修正      | Step 6        |
| 7      | `renderer/features/.../store/chatEditSlice.ts`      | 確認/修正 | Step 7        |

---

## 5. stub 除去手順

| stub                 | 場所                | 除去方法                              |
| -------------------- | ------------------- | ------------------------------------- |
| stubLLMAdapter       | ipc/index.ts L836   | RuntimeResolver.resolve() に置換      |
| handleGetSelection   | chatEditHandlers.ts | 廃止（renderer selection 管理へ移行） |
| TODO コメント (L373) | chatEditHandlers.ts | RuntimeResolver 委譲コードに置換      |

---

## 6. 完了条件確認

- [x] 実装順序が明確になっている（Step 1〜7）
- [x] stub 除去手順が整理されている（§5 参照）
- [x] M-01 (contextBridge) が最優先 Step として記録されている
- [x] 各 Step の変更対象ファイルが明示されている
