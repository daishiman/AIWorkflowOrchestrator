# 実装ガイド - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 12                                          |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| 依存成果物 | Phase 1〜11 の全成果物                      |

---

## Part 1: 概念説明（中学生レベル）

### まず、なぜこの機能が必要か

この機能でいちばん大事なのは、**「AIに直接頼めるとき」と「terminalへ安全に引き継ぐとき」を混ぜないこと**です。  
今までは見た目上はボタンがあっても、内部は仮実装だったため、ユーザーが何をしても安定して結果を得られませんでした。
ここまでで「なぜ必要か」を整理したので、次に「何をするか」を説明します。

### 「AIに文章を直してもらう窓口」をちゃんと開ける仕組み

#### このタスクは何をするの？

たとえば、学校で作文を書いているとします。
「この部分をもっとうまく書き直して」とAI先生に頼みたいとき、いくつかの方法がありますよね。

1. **直接頼む方法（integrated）**: AI先生がそこにいて、すぐに書き直してくれる
2. **メモを渡す方法（terminal handoff）**: AI先生がいないとき、「こういう内容で直してほしい」というメモを書いて、後でターミナルから頼める形にしてくれる

このプログラムは、アプリの中のエディター（文章を書く場所）で文章を選んで「AIに編集してもらう」ボタンを押したときに、**どちらの方法で頼むかを自動的に判断して動かす仕組み**を作ります。

#### なぜ今まで動いていなかったの？

実は、このボタンは見た目はあったのに、中身が「仮の部品（スタブ）」のままでした。
喫茶店で「本日のコーヒー」メニューがあるのに、実際には「すみません、今は提供できません」と言われてしまう状態です。

このタスクでは、その仮の部品を本物に取り替えます。

#### 3つの重要なルール

1. **選択範囲がないと動かない**: 文章のどこかを選んでから頼まないとエラーになる
2. **APIキーがなければメモ方式に切り替わる**: AIに直接頼めないときは、ターミナルで続けるためのコマンドを教えてくれる
3. **ワークスペース外のファイルは触れない**: セキュリティのため、許可されたフォルダ内のファイルしか扱えない

---

## Part 2: 開発者向け実装詳細

### 1. 設計概要

#### 1.1 対象コンポーネント

| コンポーネント         | ファイルパス                                                                    | 変更種別  |
| ---------------------- | ------------------------------------------------------------------------------- | --------- |
| chatEditApi.ts         | `apps/desktop/src/preload/chatEditApi.ts`                                       | 修正      |
| types.ts               | `apps/desktop/src/renderer/features/workspace-chat-edit/types.ts`               | 修正      |
| RuntimeResolver.ts     | `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`                   | 新規      |
| TerminalHandoffBuilder | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`            | 新規      |
| chatEditHandlers.ts    | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | 修正      |
| ipc/index.ts           | `apps/desktop/src/main/ipc/index.ts`                                            | 修正      |
| chatEditSlice.ts       | `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 確認/修正 |

#### 1.2 アーキテクチャ図

```
Renderer (React)
  chatEditSlice.selection: TextSelection | null
       ↓ sendWithContext({ contexts[].selection, workspacePath })
Preload (contextBridge)
  window.chatEditAPI.sendWithContext()
       ↓ ipcRenderer.invoke('chat-edit:send-with-context')
Main Process
  handleSendWithContext()
    ├─ workspacePath 検証 (isWithinWorkspace)
    ├─ RuntimeResolver.resolve(authMode, hasApiKey)
    │   ├─ integrated → ChatEditService.sendWithContext(adapter)
    │   ├─ handoff    → TerminalHandoffBuilder.build()
    │   └─ hybrid     → integrated → fallback to handoff
    └─ レスポンス返却
```

### 2. 実装手順

#### Step 1: Preload contextBridge 修正（M-01 最優先対応）

**ファイル**: `apps/desktop/src/preload/chatEditApi.ts`

```typescript
// 修正前（セキュリティ上の問題）
(window as unknown as Record<string, unknown>).chatEditAPI = chatEditAPI;

// 修正後（contextBridge経由の安全な公開）
contextBridge.exposeInMainWorld("chatEditAPI", chatEditAPI);
```

確認事項:

- `preload/index.ts` で `exposeChatEditAPI()` が呼ばれているか
- `contextIsolation: true` 環境でアクセス可能か（TC-PREL-01で確認）

#### Step 2: 型定義の拡張

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/types.ts`

新規追加する型:

```typescript
// 新エラーコード
type SendErrorCode =
  | "SELECTION_REQUIRED" // 新規: 選択範囲なしで実行しようとした
  | "ACCESS_NOT_CONFIGURED" // 新規: APIキー未設定
  | "RATE_LIMIT" // 新規: レート制限
  | "TIMEOUT" // 新規: タイムアウト
  | "CONTEXT_TOO_LARGE" // 既存
  | "PERMISSION_DENIED" // 既存
  | "INVALID_COMMAND" // 既存
  | "LLM_ERROR"; // 既存

// HandoffGuidance（新規）
interface HandoffGuidance {
  terminalCommand: string; // Claude Codeで実行するコマンド例
  contextSummary: string; // ファイル名・選択行範囲・コマンドタイプの要約
  reason: string; // handoffになった理由
}

// SendWithContextResponse の拡張
interface SendWithContextResponse {
  success: boolean;
  result?: GeneratedResult;
  error?: SendError;
  handoff?: boolean; // 新規
  guidance?: HandoffGuidance; // 新規
}

// SendWithContextRequest の拡張
interface SendWithContextRequest {
  contexts: FileContextInput[];
  command: EditCommand;
  message?: string;
  options?: SendOptions;
  workspacePath?: string; // 新規: workspace制約検証に使用
}
```

#### Step 3: RuntimeResolver の実装

**新規ファイル**: `apps/desktop/src/main/services/chat-edit/RuntimeResolver.ts`

```typescript
interface RuntimeResolver {
  resolve(authMode: AuthMode, hasApiKey: boolean): RuntimeResolution;
}

type RuntimeResolution =
  | { type: "integrated"; adapter: LLMAdapter }
  | { type: "handoff"; reason: string }
  | { type: "hybrid"; adapter: LLMAdapter; fallbackToHandoff: boolean };
```

解決ロジック表:

| authMode   | hasApiKey | 結果       |
| ---------- | --------- | ---------- |
| integrated | true      | integrated |
| integrated | false     | handoff    |
| terminal   | any       | handoff    |
| hybrid     | true      | hybrid     |
| hybrid     | false     | handoff    |

DI設計: `AuthKeyService` と `AuthModeService` をコンストラクタ注入。
必要に応じてSetter Injectionも検討（P34対策）。

#### Step 4: TerminalHandoffBuilder の実装

**新規ファイル**: `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`

```typescript
interface TerminalHandoffBuilder {
  build(request: SendWithContextRequest, reason: string): HandoffGuidance;
}
```

`contextSummary` 生成内容:

- 対象ファイルのbasename
- 選択行範囲（selection がある場合）
- コマンドタイプ（refactor / generate-test 等）
- workspacePath

`terminalCommand` 生成内容:

- `claude` コマンドに workspacePath と contextSummary を付与
- **APIキー値は絶対に含めない**（secret masking、TC-SEND-08）

#### Step 5: handleSendWithContext の修正

**ファイル**: `apps/desktop/src/main/handlers/chatEditHandlers.ts`

追加するロジック:

```typescript
// 1. workspacePath 検証ブロック（冒頭の既存検証後に追加）
if (request.workspacePath) {
  for (const ctx of request.contexts) {
    if (!isWithinWorkspace(ctx.filePath, request.workspacePath)) {
      return {
        success: false,
        error: {
          code: "PERMISSION_DENIED",
          message: "File path is outside the workspace",
          retryable: false,
        },
      };
    }
  }
}

// 2. RuntimeResolver への委譲
const resolution = runtimeResolver.resolve(authMode, hasApiKey);

// 3. 分岐処理
if (resolution.type === "handoff" || resolution.type === "terminal") {
  const guidance = terminalHandoffBuilder.build(request, resolution.reason);
  return { success: true, handoff: true, guidance };
} else {
  return chatEditService.sendWithContext(request, resolution.adapter);
}
```

#### Step 6: ipc/index.ts の stub 除去

**ファイル**: `apps/desktop/src/main/ipc/index.ts`（L836-843）

```typescript
// 除去前（stub）
const stubLLMAdapter = {
  sendMessage: async () => ({
    success: false,
    error: { message: "LLM adapter not configured for chat-edit" },
  }),
};
const chatEditService = new ChatEditService(stubLLMAdapter, contextBuilder);

// 修正後（RuntimeResolver DI）
const runtimeResolver = new RuntimeResolver(authKeyService, authModeService);
const chatEditService = new ChatEditService(contextBuilder);
registerChatEditHandlers(
  mainWindow,
  chatEditService,
  fileService,
  runtimeResolver,
);
```

#### Step 7: chatEditSlice の selection state 確認

**ファイル**: `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts`

確認チェックリスト:

- [ ] `selection: TextSelection | null` が state に存在する
- [ ] `setSelection(selection)` アクションが定義されている
- [ ] 「編集案を生成」CTAの `disabled` 条件に `selection === null` が含まれる
- [ ] Monaco の `onDidChangeCursorSelection` が `setSelection` を呼んでいる

### 3. テストカバレッジ目標

| コンポーネント          | Line | Branch | Function |
| ----------------------- | ---- | ------ | -------- |
| handleSendWithContext   | 90%  | 70%    | 100%     |
| RuntimeResolver         | 90%  | 80%    | 100%     |
| TerminalHandoffBuilder  | 85%  | 70%    | 100%     |
| ChatEditService（既存） | 80%  | 60%    | 90%      |

### 4. セキュリティチェックリスト

実装時に必ず確認すること:

- [ ] `contextBridge.exposeInMainWorld` を使用している（M-01対応）
- [ ] `guidance.terminalCommand` にAPIキー値が含まれない
- [ ] `isWithinWorkspace` が `..` と `//` を含むpath traversalを拒否する
- [ ] 全IPC ハンドラで sender 検証が動作する
- [ ] エラーメッセージに内部パスや認証情報を含めない

### 5. UX仕様まとめ

#### 状態遷移

```
idle
  → (エディターで選択) → selection-ready
  → (「編集案を生成」クリック) → generating
  → (LLM成功) → diff-ready
  → (API未設定/terminal mode) → handoff
  → (エラー) → selection-ready（retryable）/ blocked（non-retryable）
```

#### マイクロコピー

| 状態           | 表示テキスト                                   |
| -------------- | ---------------------------------------------- |
| selection なし | 「選択範囲を決めてから続ける」                 |
| API未設定      | 「この画面では自動実行せず terminal で続ける」 |
| rate limit     | 「しばらくしてから再試行してください」         |
| timeout        | 「応答がタイムアウトしました。再試行できます」 |

#### Apple HIG 準拠ポイント

- 「編集案を生成」ボタン: `#007AFF`（systemBlue）、コントラスト比 4.5:1 以上
- Inline Guidance Block ボーダー: `#FF9500`（systemOrange）
- 選択行数バッジ: `rgba(60,60,67,0.6)`（secondaryLabel）
- 8pxグリッドによるスペーシング
- 全CTAにARIA role + keyboard navigation

### 6. MINOR 指摘対応（F-M01/F-M02）

#### F-M01: workspacePath テスト実装確認

実装タスクで TC-WS-01〜06 を必ず実装すること:

- TC-WS-02: `/etc/passwd` アクセス → PERMISSION_DENIED
- TC-WS-04: `../../../etc/passwd` path traversal → PERMISSION_DENIED
- TC-WS-06: contexts複数のうち1件が範囲外 → PERMISSION_DENIED（早期リターン）

未タスク番号: `UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001`

#### F-M02: IPC正本への型同期

Phase 12 system spec sync で以下を実施:

- `api-ipc-agent.md`: HandoffGuidance 型と新エラーコードを追記
- `interfaces-llm.md`: RuntimeResolution 型を追記

### 7. APIシグネチャ / CLIシグネチャ

```typescript
// Preload API
window.chatEditAPI.sendWithContext(request: SendWithContextRequest): Promise<SendWithContextResponse>
window.chatEditAPI.readFile(filePath: string, workspacePath?: string): Promise<FileReadResult>
window.chatEditAPI.writeFile(filePath: string, content: string, workspacePath?: string): Promise<FileWriteResult>
```

```bash
# terminal handoff で生成される例
claude --add-dir "/path/to/workspace" "Please refactor the selected code. Context: command=refactor files=foo.ts:10-30"
```

### 8. 使用例

使用例（Renderer から send-with-context を呼び出す）:

```ts
const response = await window.chatEditAPI.sendWithContext({
  contexts: [
    {
      filePath: "/workspace/src/foo.ts",
      content: sourceText,
      language: "typescript",
      selection: {
        startLine: 10,
        endLine: 30,
        startColumn: 1,
        endColumn: 20,
        selectedText,
      },
    },
  ],
  command: { type: "refactor" },
  workspacePath: "/workspace",
});

if (response.handoff && response.guidance) {
  console.info("handoff command:", response.guidance.terminalCommand);
}
```

### 9. エラーハンドリング

| 条件             | 返却                        | retryable |
| ---------------- | --------------------------- | --------- |
| workspace 外パス | `PERMISSION_DENIED`         | false     |
| API key 未設定   | `handoff=true` + `guidance` | -         |
| コマンド不正     | `INVALID_COMMAND`           | false     |
| LLM 応答失敗     | `LLM_ERROR`                 | true      |
| タイムアウト     | `TIMEOUT`                   | true      |

補足:

- エラー処理では API キーや内部パスをメッセージへ含めない。
- sender 検証失敗時は `toIPCValidationError` を返し、処理を継続しない。

### 10. エッジケース

| ケース                                    | 期待動作                                      |
| ----------------------------------------- | --------------------------------------------- |
| `contexts` が空                           | `INVALID_COMMAND` か validation error を返す  |
| `selection` が null                       | UI で CTA を disabled、Main 側でも防御        |
| 複数 context のうち 1 件だけ workspace 外 | 早期に `PERMISSION_DENIED` で失敗             |
| `message` 未指定                          | `TerminalHandoffBuilder` がデフォルト文を生成 |
| auth mode が `subscription`               | integrated 呼び出しを行わず handoff を返す    |

### 11. 設定と定数一覧

| 設定項目 / 定数          | 値                                      | 用途                          |
| ------------------------ | --------------------------------------- | ----------------------------- |
| `ANTHROPIC_API_ENDPOINT` | `https://api.anthropic.com/v1/messages` | integrated runtime 呼び出し先 |
| `ANTHROPIC_API_VERSION`  | `2023-06-01`                            | Anthropic API ヘッダ          |
| `model`                  | `claude-sonnet-4-6`                     | Chat Edit の生成モデル        |
| `max_tokens`             | `4096`                                  | 1 回の応答上限                |
| `MAX_CONTEXT_SIZE`       | `100KB`                                 | context 文字列サイズ上限      |
| `MAX_FILE_CONTEXTS`      | `10`                                    | 添付可能ファイル数上限        |
