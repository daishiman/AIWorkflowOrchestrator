# Phase 1 要件定義 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 1                                           |
| 成果物種別 | 要件定義                                    |
| 作成日     | 2026-03-14                                  |
| 前提       | Task01 foundation（design-summary.md）      |
| 後続       | Phase 2（設計）                             |

---

## 1. 現状 TODO 一覧（コードから抽出）

コードベースを調査した結果、以下の TODO および stub が確認された。

### 1-A. chatEditHandlers.ts の TODO

| ファイル                                             | 行番号  | TODO 内容                                                                                                                                                                                 |
| ---------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | 331-333 | `handleGetSelection`: 「TODO: Monaco Editorとの連携を実装」コメントあり。レンダラープロセスからの情報が必要で現状は `null` を返すのみ                                                     |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | 373-384 | `handleSendWithContext`: 「TODO: 実際のLLM連携を実装」コメントあり。プロンプトを構築するが LLM API 呼び出し行がコメントアウトされており、仮実装として最初のコンテキスト内容をそのまま返す |

### 1-B. ipc/index.ts の stub adapter 注入

| ファイル                             | 行番号  | 内容                                                                                                                                                  |
| ------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/ipc/index.ts` | 836-842 | `stubLLMAdapter` を定義し、`sendMessage` が常に失敗（"LLM adapter not configured for chat-edit"）を返す。`ChatEditService` にこの stub を注入している |

### 1-C. chatEditSlice.ts の window.chatEditAPI 直接参照

| ファイル                                                                        | 行番号  | 内容                                                                                                                                                    |
| ------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | 190-204 | `approveResult` 内で `window as unknown as {...}` でキャストして `chatEditAPI.writeFile` を直接参照。Preload 型定義との整合がランタイム依存になっている |

### 1-D. chatEditHandlers.ts の buildPrompt 関数

| ファイル                                             | 行番号 | 内容                                                                                                                                          |
| ---------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | 377    | `handleSendWithContext` 内で `buildPrompt(request)` を呼び出すが、戻り値を変数に束縛せず LLM への実際の送信も行っていない（デッドコード状態） |

### 1-E. ChatEditService の LLMAdapter 契約

| ファイル                                                      | 内容                                                                                                                                     |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts` | `LLMAdapter` インターフェースは定義済みで `sendMessage(prompt)` を受け付ける。ただし注入される実装は ipc/index.ts の stub adapter である |

---

## 2. 要件一覧

### REQ-01: Monaco Selection 取得

| 項目     | 内容                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------- |
| 要件ID   | REQ-01                                                                                                                  |
| 分類     | 機能                                                                                                                    |
| 説明     | `chat-edit:get-selection` IPC ハンドラーが Monaco Editor の現在の選択範囲（startLine/endLine/selectedText）を返せること |
| 現状     | `handleGetSelection` が常に `null` を返す（TODO コメントあり）                                                          |
| 期待動作 | Renderer 側の Monaco Editor の selection 情報を Main Process 経由で取得できる設計を確立する                             |
| 制約     | selection 取得の authority は Renderer 側にある。Main Process は Renderer から selection を受け取る形に設計する         |

### REQ-02: file context 構築とサイズ制約

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 要件ID   | REQ-02                                                                                                   |
| 分類     | 機能・非機能                                                                                             |
| 説明     | `ContextBuilder` が file context を構築し、100KB 上限を超える場合は `CONTEXT_TOO_LARGE` エラーを返すこと |
| 現状     | `ContextBuilder` は実装済みでサイズ検証ロジックも動作している                                            |
| 期待動作 | selection がある場合は `selectedText` を優先してコンテキストに含める。ファイル全体は必要に応じて添付する |
| 制約     | `MAX_CONTEXT_SIZE = 100KB`、`MAX_FILE_CONTEXTS = 10`（型定義による）                                     |

### REQ-03: workspacePath 制約

| 項目     | 内容                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| 要件ID   | REQ-03                                                                                                                                           |
| 分類     | セキュリティ                                                                                                                                     |
| 説明     | `chat-edit:read-file` / `chat-edit:write-file` において `workspacePath` が指定された場合、アクセス対象ファイルがワークスペース内に限定されること |
| 現状     | `isWithinWorkspace()` 実装済み、パストラバーサル検出も実装済み                                                                                   |
| 期待動作 | `workspacePath` 未指定・null・空文字の場合は検証スキップ（後方互換性維持）。指定時は `PERMISSION_DENIED` エラーで拒否                            |
| 制約     | パストラバーサル（`..` / `//` 含む）は無条件で拒否                                                                                               |

### REQ-04: Access Capability 判定と LLM 実行

| 項目     | 内容                                                                                                                                                                    |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件ID   | REQ-04                                                                                                                                                                  |
| 分類     | 機能                                                                                                                                                                    |
| 説明     | `chat-edit:send-with-context` が実際の LLM アダプタを介して AI 推論を実行できること。Task01 foundation の `AIRuntimeResolver` / `AIAccessCapabilityResolver` を利用する |
| 現状     | `ipc/index.ts` が stub adapter（常に失敗）を `ChatEditService` に注入しており、LLM 実行は機能しない                                                                     |
| 期待動作 | `AIAccessCapabilityResolver` で `integratedRuntime` capability が確認できた場合のみ LLM 実行を行う。capability が `none` の場合は `CAPABILITY_UNAVAILABLE` エラーを返す |
| 制約     | Task01 foundation の `AIRuntimeResolver` で provider/model/adapter を解決してから実行する。silent stub fallback は禁止                                                  |

### REQ-05: terminal handoff

| 項目     | 内容                                                                                                                                                                         |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 要件ID   | REQ-05                                                                                                                                                                       |
| 分類     | 機能                                                                                                                                                                         |
| 説明     | `integratedRuntime` capability が使えない場合（API key 不在 / capability=none）、Claude Code terminal surface へ file context の summary を handoff できる導線を提供すること |
| 現状     | terminal handoff の仕組みが Chat Edit には存在しない                                                                                                                         |
| 期待動作 | terminal が利用可能（`terminalSurface` capability）な場合、file context の要約をターミナルに渡す CTA を表示する。auto-send / hidden prompt injection は禁止                  |
| 制約     | user-operated 境界を維持する。コマンドの自動送信・自動リトライは禁止                                                                                                         |

---

## 3. 受入基準（Acceptance Criteria）

### AC-1: Selection 取得が設計済みであること

- `handleGetSelection` が selection 情報を返す設計（責務境界）が文書化されている
- Renderer 側の Monaco Editor が selection を store に保持し、Main Process はその値を IPC 経由で取得できる設計が定義されている
- `null` 返却が意図的な「未選択」を意味し、エラーとは区別されている

### AC-2: Context 構築が正しく機能すること

- `ContextBuilder.build()` が selection 優先でコンテキストを構築する
- 100KB 超で `CONTEXT_TOO_LARGE` を返す
- 10 ファイル超で `MAX_CONTEXTS_EXCEEDED` を返す（chatEditSlice.ts のチェック）

### AC-3: workspacePath 制約が機能すること

- `isWithinWorkspace()` による境界チェックが read / write 両方で動作する
- パストラバーサルは `PERMISSION_DENIED` で拒否される
- workspacePath 未指定時は従来通り動作する（後方互換性）

### AC-4: LLM 実行が real adapter に接続されること

- stub adapter が取り除かれ、Task01 foundation の `AIRuntimeResolver` 経由で provider が解決される
- `integratedRuntime` capability なしで LLM 実行しようとした場合、`CAPABILITY_UNAVAILABLE` エラー（reason/guidance 付き）が返される
- silent stub fallback は発生しない

### AC-5: terminal handoff の導線が設計されていること

- `terminalSurface` capability が有効な場合の handoff CTA 定義が設計書に含まれる
- auto-send / hidden prompt injection が設計上禁止されていることが明文化される
- context summary の形式が定義されている

---

## 4. 制約事項

### 4-A. セキュリティ制約

| 制約                                | 内容                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------- |
| credential は Main Process に留める | API key / token は Renderer に渡さない。credential は Main Process 内で完結させる |
| IPC sender 検証                     | すべての chat-edit IPC ハンドラーで sender 検証を実施する                         |
| パストラバーサル防止                | `../` `//` を含むパスは問答無用で拒否する                                         |
| error sanitization                  | ファイルパスやシステム情報を含む内部エラーは Renderer に漏洩させない              |

### 4-B. UX 制約

| 制約                         | 内容                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| auto-send 禁止               | terminal への自動コマンド送信は行わない                                              |
| hidden prompt injection 禁止 | terminal へ暗黙のプロンプトを注入しない                                              |
| silent fallback 禁止         | integrated runtime 失敗時に自動で terminal へ切り替えない。guidance 付きエラーを返す |
| fail-fast                    | provider/credential 解決失敗時は即座にエラーを返し、stub で成功を偽装しない          |

### 4-C. パフォーマンス制約

| 制約                   | 内容                                                       |
| ---------------------- | ---------------------------------------------------------- |
| ファイルサイズ上限     | 1 ファイルあたり 10MB を超えるファイルは読み込みを拒否する |
| コンテキストサイズ上限 | 全コンテキスト合計 100KB を超える場合は LLM 送信を拒否する |
| 最大添付ファイル数     | 1 回の Chat Edit セッションで 10 ファイルを上限とする      |

### 4-D. Task01 foundation 継承制約

| 制約                         | 内容                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| capability 型固定            | `AIAccessCapability` は `integratedRuntime` / `terminalSurface` / `both` / `none` の 4 値のみを使用する |
| resolver 経由必須            | LLM 実行は必ず `AIRuntimeResolver` 経由で行う。直接 adapter を生成しない                                |
| UI 語彙統一                  | Settings 表示語彙は `ready` / `blocked` / `unavailable` に統一する                                      |
| `ai:capability-changed` 購読 | capability 変更イベントを subscribe して UI 状態を更新する                                              |

---

## 5. 既存コードとの整合確認

### 5-A. 既に実装済みで問題ない部分

| 項目                             | 根拠                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| ファイル読み込み（read-file）    | `handleReadFile` が正常動作。パス検証・サイズ制限・言語検出が実装済み                        |
| ファイル書き込み（write-file）   | `handleWriteFile` が正常動作。バックアップ・ディレクトリ作成が実装済み                       |
| ContextBuilder の build/validate | 実装済みで 100KB 上限チェックも動作                                                          |
| chatEditSlice の状態管理         | `addFileContext` / `approveResult` / `rejectResult` が実装済み                               |
| prompts.ts のテンプレート        | 5 コマンドタイプ（continue/refactor/generate-test/add-comment/custom）のプロンプトが実装済み |

### 5-B. 設計変更が必要な部分

| 項目                             | 現状                                         | 必要な変更                                                     |
| -------------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| stub LLM adapter                 | 常に失敗する stub が注入されている           | `AIRuntimeResolver` 経由の real adapter に置換する             |
| handleGetSelection               | 常に null を返す                             | Renderer side の selection を IPC 経由で受け取る設計を確立する |
| handleSendWithContext            | 仮実装（LLM 実行なし）                       | ChatEditService を通じて real LLM 実行を行う                   |
| chatEditSlice の window 直接参照 | `window as unknown as` でキャストしてAPI参照 | 型安全な Preload 型定義経由に変更する                          |
| terminal handoff 導線            | 存在しない                                   | capability チェックと handoff CTA を設計する                   |

---

## 6. Task01 foundation との依存関係

本タスクは Task01（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001）で確定した以下の契約を継承する。

| 継承する契約                     | 本タスクでの適用                                             |
| -------------------------------- | ------------------------------------------------------------ |
| `AIAccessCapabilityResolver`     | `chat-edit:send-with-context` 実行前に capability を判定する |
| `AIRuntimeResolver`              | stub adapter に代わり provider/model/adapter を解決する      |
| `CredentialProvider`             | API key は Main Process 内で SecureStorage 経由に取得する    |
| fail-fast ルール                 | capability/credential 不足時は guidance 付きエラーを返す     |
| terminal boundary                | auto-send / hidden injection 禁止を Chat Edit にも適用する   |
| `ai:capability-changed` イベント | capability 変更時に Renderer 側の UI 状態を更新する          |
