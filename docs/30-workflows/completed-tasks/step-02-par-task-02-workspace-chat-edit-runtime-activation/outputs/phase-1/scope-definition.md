# Phase 1 スコープ定義 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| Phase      | 1                                           |
| 成果物種別 | スコープ定義                                |
| 作成日     | 2026-03-14                                  |
| 前提       | Task01 foundation（design-summary.md）      |
| 後続       | Phase 2（設計）                             |

---

## 1. スコープ（対象範囲）

### 1-A. 本タスクで扱う範囲

| 対象                              | 具体的な内容                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| stub adapter の置換設計           | `ipc/index.ts` の `stubLLMAdapter` を `AIRuntimeResolver` 経由の real adapter に置換する設計を定義する              |
| selection 取得の責務境界設計      | `handleGetSelection` の TODO を解消し、Monaco selection を IPC 経由で受け取る設計パターンを確定する                 |
| capability チェックの挿入位置設計 | `chat-edit:send-with-context` ハンドラーに `AIAccessCapabilityResolver` を呼び出す箇所と fail-fast ルールを定義する |
| terminal handoff 導線の設計       | `terminalSurface` capability 利用時のコンテキスト summary 生成と handoff CTA の設計を定義する                       |
| chatEditSlice の型安全化          | `approveResult` 内の `window as unknown as {...}` を Preload 型定義経由に変更する設計を定義する                     |
| IPC 契約の更新設計                | `chat-edit:send-with-context` のリクエスト/レスポンスに capability エラー情報を加える設計を定義する                 |

### 1-B. 調査・分析対象ファイル（本タスクで読んだもの）

| ファイル                                                                        | 調査内容                                     |
| ------------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | TODO 箇所の特定と stub の把握                |
| `apps/desktop/src/main/services/chat-edit/ChatEditService.ts`                   | `LLMAdapter` インターフェースの現状把握      |
| `apps/desktop/src/main/services/chat-edit/ContextBuilder.ts`                    | context 構築ロジックとサイズ制限の確認       |
| `apps/desktop/src/main/services/chat-edit/prompts.ts`                           | プロンプトテンプレートの現状確認             |
| `apps/desktop/src/main/ipc/index.ts`                                            | stub adapter 注入の現状確認                  |
| `apps/desktop/src/preload/chatEditApi.ts`                                       | Preload 契約と IPC チャンネル名の確認        |
| `apps/desktop/src/renderer/features/workspace-chat-edit/store/chatEditSlice.ts` | Renderer 状態管理と writeFile handoff の確認 |
| `apps/desktop/src/main/handlers/llm.ts`                                         | streaming/selected config の既存契約確認     |

---

## 2. 除外範囲（本タスクで扱わない範囲）

| 除外対象                                                  | 理由                                                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| プロダクションコードの実装                                | 本タスクは「設計」フェーズ（Phase 1-3）のみ。実際のコード変更は Phase 5 以降で行う                        |
| Monaco Editor 本体の変更                                  | Monaco Editor 自体の設定変更はこのタスクのスコープ外。selection 情報の受け渡し設計のみを扱う              |
| LLM Adapter の新規実装                                    | `LLMAdapterFactory` と各プロバイダー adapter は既存実装を利用する。新規 adapter 作成はスコープ外          |
| streaming（`chat-edit:stream-output`）の接続              | ストリーミング実装は複雑度が高く、別タスクで扱う。本タスクは非ストリーミングの `sendWithContext` のみ対象 |
| Settings 画面の認証方式カード改善                         | Task06（step-03-par-task-06）が担当。本タスクは capability 判定の消費側設計のみ                           |
| Supabase 認証との連携変更                                 | 認証システムの変更は本タスクのスコープ外                                                                  |
| `chat-edit:read-file` / `chat-edit:write-file` の機能追加 | ファイル操作ハンドラーは既に正常動作。workspacePath 制約も実装済み。変更は不要                            |
| RAG/embedding 機能との統合                                | Task08（step-04-par-task-08）が担当                                                                       |
| diff UI コンポーネントの変更                              | UI コンポーネント変更は Phase 5-8 で実施。本タスクは設計仕様のみ                                          |

---

## 3. 境界定義（renderer / main / IPC の責務境界）

### 3-A. Renderer 側の責務

| 責務                       | 内容                                                                                | 制約                                        |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------- |
| Monaco selection の保持    | Monaco Editor の現在の選択範囲（startLine/endLine/selectedText）を store に保持する | selection の authority は Renderer 側にある |
| capability 表示            | Main Process から IPC で受信した capability 値に基づき UI 状態を更新する            | 独自の capability 算出は禁止                |
| CTA 活性制御               | capability 値に基づき「LLM 実行」ボタンと「terminal handoff」CTA を制御する         | 独自の fallback 判定は禁止                  |
| guidance 表示              | Main Process が返した reason/guidance を画面に表示する                              | 独自エラー文の生成は禁止                    |
| file context の管理        | `addFileContext` / `removeFileContext` / `clearAllContexts` を管理する              | credential への直接アクセスは禁止           |
| `approveResult` の書き込み | Preload API の `writeFile` を呼び出してファイル書き込みを実行する                   | 型安全な Preload 型定義経由で呼び出す       |

### 3-B. Preload 層の責務

| 責務         | 内容                                                                  | 制約                                       |
| ------------ | --------------------------------------------------------------------- | ------------------------------------------ |
| IPC ブリッジ | `ipcRenderer.invoke` を `chatEditAPI` として contextBridge に公開する | チャンネル名は定数 `CHANNELS` を参照する   |
| sender 境界  | `contextIsolation: true` 環境で安全な API ブリッジを提供する          | `ipcRenderer` を Renderer に直接公開しない |
| 型定義の公開 | `FileReadResult` / `FileWriteResult` 等の型を Renderer に提供する     | 実装は Main Process に委譲する             |
| stream 購読  | `onStreamOutput` で `ipcRenderer.on` を管理し、解除関数を返す         | リスナーの二重登録を防止する               |

### 3-C. Main Process 側の責務

| 責務                              | 内容                                                                       | 制約                                           |
| --------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------- |
| capability 判定（最終 authority） | `AIAccessCapabilityResolver` を呼び出して surface 別 capability を判定する | Renderer に判定を委譲しない                    |
| LLM 実行                          | `AIRuntimeResolver` で provider/model/adapter を解決してから実行する       | stub adapter を本番環境で使用しない            |
| credential 管理                   | `CredentialProvider` 経由で SecureStorage から API key を取得する          | credential を Renderer に渡さない              |
| パス検証                          | `isWithinWorkspace()` / `hasPathTraversal()` でファイルアクセスを制限する  | workspacePath 制約は Main Process 側で適用する |
| エラー envelope                   | 内部エラーをサニタイズして Renderer に返す                                 | システムパスやスタックトレースを漏洩させない   |
| capability 変更通知               | `ai:capability-changed` イベントで Renderer に broadcast する              | capability 変更は即座に通知する                |

---

## 4. 依存関係

### 4-A. Task01 foundation 契約との関係

本タスク（Task02）は Task01（TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001）の Phase 2 設計サマリーで確定した以下の契約を **全面的に継承** する。

| Task01 成果物                                                                | Task02 での利用方法                                                             |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `AIAccessCapabilityResolver`                                                 | `chat-edit:send-with-context` 前の capability チェックに使用する                |
| `AIRuntimeResolver`                                                          | stub adapter を置き換え、provider/model/adapter を解決する                      |
| `CredentialProvider`                                                         | LLM 実行に使用する API key を Main Process 内で安全に取得する                   |
| `integratedRuntime` / `terminalSurface` / `both` / `none` の 4 capability 値 | Chat Edit での capability 判定に使用する                                        |
| fail-fast ルール                                                             | capability=none / credential 不足時は guidance 付きエラーを返す                 |
| terminal boundary（禁止事項）                                                | auto-send / hidden prompt injection / silent fallback を Chat Edit にも適用する |
| `ai:capability-changed` イベント                                             | capability 変更時に chatEditSlice の状態を更新する                              |

Task01 foundation の成果物パス:

- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-2/design-summary.md`

### 4-B. 並列タスクとの関係

| 並列タスク                            | 関係                                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| Task03 (skill-agent-runtime-routing)  | 同じ `AIAccessCapabilityResolver` / `AIRuntimeResolver` を利用する。設計パターンを共有する |
| Task10 (claude-code-terminal-surface) | terminal handoff の受け側。Task02 が context summary を送り、Task10 が terminal を起動する |

### 4-C. 後続タスクとの関係

| 後続タスク                                      | 本タスクが提供するもの                                                         |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| Task04 (skill-docs-runtime-integration)         | 本タスクで確定した capability チェックパターンの設計を参照する                 |
| Task06 (main-chat-settings-runtime-sync)        | Settings 画面の access card 改善。本タスクは capability の消費側設計を確定する |
| Task07 (workspace-chat-panel-runtime-alignment) | Chat Panel の runtime 連携。本タスクの設計パターンを参照する                   |

### 4-D. 既存システムとの関係

| 既存コンポーネント                    | 関係                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------- |
| `llm.ts` の `LLMAdapterFactory`       | `AIRuntimeResolver` が内部的に `LLMAdapterFactory` を利用して adapter を解決する |
| `llm.ts` の `setSelectedLLMConfig`    | selectedConfig は `AIRuntimeResolver` の解決順（優先度 2）で参照される           |
| `SecureStorage`                       | `CredentialProvider` が `SecureStorage.getApiKey()` をラップして使用する         |
| `chatEditSlice.ts` の `approveResult` | 設計変更後は型安全な Preload API 経由で `writeFile` を呼び出す                   |

---

## 5. スコープ境界の判定基準

本タスクがスコープ内か外かを判断する基準を明示する。

### スコープ内（設計が必要なもの）

- Chat Edit の LLM 実行パスに直接関係する stub / TODO の解消設計
- `AIAccessCapabilityResolver` / `AIRuntimeResolver` の接続点設計
- selection 情報の IPC 経由受け渡し設計
- terminal handoff の context summary と CTA 設計
- chatEditSlice の window 直接参照を型安全化する設計

### スコープ外（判定基準：本タスクで変更しないもの）

- ファイル I/O（read/write）の機能そのもの（既に動作している）
- LLM Adapter の内部実装（既存の `LLMAdapterFactory` を利用）
- Settings 画面 UI の改善（Task06 が担当）
- streaming ハンドラー（`chat-edit:stream-output`）の LLM 接続（将来タスク）
- Monaco Editor 本体の設定変更
- 認証システム（Supabase）への変更

---

## 6. 成果物一覧

| 成果物       | パス                                                                                                                                      | ステータス |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 要件定義     | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/outputs/phase-1/requirements-definition.md` | 完了       |
| スコープ定義 | `docs/30-workflows/completed-tasks/step-02-par-task-02-workspace-chat-edit-runtime-activation/outputs/phase-1/scope-definition.md`        | 完了       |

---

## 7. Phase 1 完了条件チェック

- [x] selection、context、runtime の要件が分離されている
  - REQ-01（selection）/ REQ-02（context）/ REQ-04（runtime）として分離済み
- [x] 既存 TODO の吸収範囲が明確になっている
  - TODO 一覧（section 1）で 5 件の TODO/stub を特定し、各要件に対応付けた
- [x] Task01 foundation との継承契約が明文化されている
  - section 4-A および 6（requirements-definition.md）で継承関係を記載済み
- [x] スコープ内・スコープ外が明確になっている
  - section 1（対象範囲）/ section 2（除外範囲）/ section 5（判定基準）で定義済み
