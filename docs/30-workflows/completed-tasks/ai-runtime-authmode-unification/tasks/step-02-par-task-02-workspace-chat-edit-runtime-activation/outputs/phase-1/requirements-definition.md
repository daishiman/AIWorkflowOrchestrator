# Phase 1 要件定義 - workspace-chat-edit-runtime-activation

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 |
| 作成日     | 2026-03-14                                  |
| ステータス | completed                                   |

---

## 1. 現状 TODO / GAP 整理

### 1-1. selection 取得ギャップ

| 観点         | 現状                                                                                   | 必要な状態                                                       |
| ------------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 実装ファイル | `apps/desktop/src/main/handlers/chatEditHandlers.ts` L331-333                          | -                                                                |
| 現状の実装   | `handleGetSelection` が `null` を固定返却 + TODO コメント                              | Monaco selection を renderer から受け取って IPC 経由で返せる構造 |
| 根本原因     | Monaco Editor は renderer に存在するため、Main Process が直接 selection を取得できない | renderer が selection をストアし、IPC 引数として渡す設計に変更   |
| 影響範囲     | `chat-edit:get-selection` チャンネル、`chatEditSlice` の selection state               | -                                                                |

**GAP-01**: selection 取得の責務が誤って Main に割り当てられている。正しくは renderer が selection を管理し、`sendWithContext` リクエストに付与して送信すること。

### 1-2. LLM 実行ギャップ

| 観点         | 現状                                                                           | 必要な状態                                                          |
| ------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| 実装ファイル | `apps/desktop/src/main/ipc/index.ts` L836-843                                  | -                                                                   |
| 現状の実装   | `stubLLMAdapter`（常に `success: false`）が `ChatEditService` に注入されている | auth mode に応じた実 LLM adapter が注入される                       |
| 根本原因     | runtime resolver が未実装で、どの adapter を使うか決定するロジックがない       | `RuntimeResolver` が auth mode と API key を確認して adapter を選択 |
| 影響範囲     | `chat-edit:send-with-context` チャンネル全体                                   | -                                                                   |

**GAP-02**: `ChatEditService` の `LLMAdapter` DI ポイントは設計済みだが、real adapter の注入ロジック（resolver）が未実装。

### 1-3. workspacePath 制約ギャップ

| 観点             | 現状                                                              | 必要な状態                                               |
| ---------------- | ----------------------------------------------------------------- | -------------------------------------------------------- |
| read/write       | `handleReadFile`, `handleWriteFile` で制約済み                    | 維持する                                                 |
| sendWithContext  | `handleSendWithContext` で workspacePath を検証していない         | contexts の filePath が workspacePath 内であることを検証 |
| terminal handoff | terminal handoff 時にも workspacePath を context summary に含める | terminal コマンドの context に workspacePath を渡す      |

**GAP-03**: `sendWithContext` ハンドラに workspacePath 検証が未実装。

### 1-4. error policy ギャップ

| エラー種別        | 現状                          | 必要な状態                                    |
| ----------------- | ----------------------------- | --------------------------------------------- |
| selection なし    | null を返して renderer が判断 | selection なし専用エラーコードで明示          |
| API key 未設定    | LLM_ERROR で一括              | `ACCESS_NOT_CONFIGURED` + handoff guidance 付 |
| rate limit        | LLM_ERROR で一括              | `RATE_LIMIT` + retryable: true                |
| permission denied | PERMISSION_DENIED で処理済み  | 維持する                                      |
| timeout           | 未定義                        | `TIMEOUT` + retryable: true                   |

**GAP-04**: selection / API key / rate limit / timeout の各エラーが `LLM_ERROR` に集約されており、renderer 側で適切な UX 分岐ができない。

### 1-5. terminal handoff ギャップ

| 観点              | 現状   | 必要な状態                                            |
| ----------------- | ------ | ----------------------------------------------------- |
| handoff 応答型    | 未定義 | `guidance` フィールドに terminal コマンドを含む応答型 |
| context summary   | 未定義 | 現在の selection / file context をサマリー化して返す  |
| terminal launcher | 未定義 | `shell:open-terminal` IPC または OS 実行で起動可能    |

**GAP-05**: Integrated API が使えない場合の fallback（terminal handoff）の応答構造が未設計。

---

## 2. 要件整理

### 2-1. Monaco selection 要件

| ID     | 要件                                                                             | 優先度 |
| ------ | -------------------------------------------------------------------------------- | ------ |
| REQ-01 | renderer は Monaco selection を `chatEditSlice.selection` に保持する             | 必須   |
| REQ-02 | `sendWithContext` リクエストの `selection` フィールドに selection を付与して送信 | 必須   |
| REQ-03 | selection なし時は `SELECTION_REQUIRED` エラーを renderer 側で早期返却           | 必須   |
| REQ-04 | `chat-edit:get-selection` チャンネルは削除または廃止予定として記録               | 推奨   |

### 2-2. file context 要件

| ID     | 要件                                                                     | 優先度 |
| ------ | ------------------------------------------------------------------------ | ------ |
| REQ-05 | contexts の各 filePath が workspacePath 内であることを Main 側で検証する | 必須   |
| REQ-06 | contexts の合計サイズが 100KB 以下であること（既実装、維持）             | 必須   |
| REQ-07 | 複数ファイル context を受け取れること（既実装、維持）                    | 必須   |

### 2-3. workspacePath 制約要件

| ID     | 要件                                                                                          | 優先度 |
| ------ | --------------------------------------------------------------------------------------------- | ------ |
| REQ-08 | read / write / sendWithContext の全経路で workspacePath 制約を適用する                        | 必須   |
| REQ-09 | workspacePath 外アクセスは `PERMISSION_DENIED` を返す（既実装は維持、sendWithContext に追加） | 必須   |

### 2-4. access capability / runtime 選択要件

| ID     | 要件                                                                                    | 優先度 |
| ------ | --------------------------------------------------------------------------------------- | ------ |
| REQ-10 | auth mode (`integrated` / `terminal` / `hybrid`) を `RuntimeResolver` が参照する        | 必須   |
| REQ-11 | `integrated` モードで API key が設定済みの場合は Integrated API Runtime を使用する      | 必須   |
| REQ-12 | API key 未設定または `terminal` モードの場合は terminal handoff guidance を返す         | 必須   |
| REQ-13 | `hybrid` モードでは integrated を優先し、失敗時に terminal handoff へ自動フォールバック | 推奨   |

### 2-5. terminal handoff 要件

| ID     | 要件                                                                          | 優先度 |
| ------ | ----------------------------------------------------------------------------- | ------ |
| REQ-14 | handoff 応答は `guidance.terminalCommand` と `guidance.contextSummary` を含む | 必須   |
| REQ-15 | contextSummary は selection text / file path / command type をまとめる        | 必須   |
| REQ-16 | terminal handoff は success: false ではなく `handoff: true` で明確に区別する  | 推奨   |

### 2-6. error policy 要件

| ID     | 要件                                                                          | 優先度 |
| ------ | ----------------------------------------------------------------------------- | ------ |
| REQ-17 | selection 未提供: `SELECTION_REQUIRED` (retryable: false)                     | 必須   |
| REQ-18 | API key 未設定: `ACCESS_NOT_CONFIGURED` + handoff guidance (retryable: false) | 必須   |
| REQ-19 | rate limit: `RATE_LIMIT` (retryable: true, retryAfter 秒数)                   | 必須   |
| REQ-20 | timeout: `TIMEOUT` (retryable: true)                                          | 必須   |
| REQ-21 | path traversal: `PERMISSION_DENIED` (retryable: false) - 既実装維持           | 必須   |

---

## 3. 責務境界整理

### Renderer 責務

- Monaco selection を `chatEditSlice.selection` に保持する
- selection を `sendWithContext` リクエストに付与する
- `SELECTION_REQUIRED` エラーを受信した場合に「選択範囲を決めてから続ける」メッセージを表示する
- handoff guidance を受信した場合に「terminal で続ける」CTA を表示する
- diff preview と apply 前確認 UI を管理する

### IPC (Preload) 責務

- `sendWithContext` 引数を Main に安全に中継する
- `onStreamOutput` で streaming イベントを Renderer に転送する
- 全チャンネルで sender 検証をサポートする

### Main Handler 責務

- workspacePath 制約検証（全経路）
- contexts filePath の workspace 範囲検証（sendWithContext に追加）
- `RuntimeResolver` への委譲（auth mode 確認）
- error envelope の標準化と secret masking

### Service 責務

- `ChatEditService`: `LLMAdapter` DI ポイントで real/stub を差し替え
- `RuntimeResolver` (新規): auth mode と API key を確認し adapter を返す
- `ContextBuilder`: selection text の section 生成（既実装 + selection 対応）
- `TerminalHandoffBuilder` (新規): context summary と terminal コマンドを生成

---

## 4. 受入基準

| ID   | 基準                                                                    | 検証方法          |
| ---- | ----------------------------------------------------------------------- | ----------------- |
| AC-1 | selection、context、runtime の要件が分離されている                      | 本文書のレビュー  |
| AC-2 | 既存 TODO（selection / LLM stub）の吸収範囲が明確になっている           | GAP-01〜05 の記録 |
| AC-3 | workspacePath 制約が sendWithContext にも適用される要件が明記されている | REQ-05、REQ-08    |
| AC-4 | terminal handoff の応答構造要件が定義されている                         | REQ-14〜16        |
| AC-5 | error policy が selection / API key / rate limit / timeout 別に定義     | REQ-17〜21        |
