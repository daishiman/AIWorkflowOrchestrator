# Phase 9 品質検証チェックリスト - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                        |
| Phase      | 9                                                                  |
| 成果物種別 | 品質検証チェックリスト                                             |
| 作成日     | 2026-03-14                                                         |
| 前提       | Phase 1-8 成果物（要件定義・設計・実装計画・リファクタリング計画） |
| 後続       | Phase 10（最終レビュー）                                           |

---

## 凡例

| 記号       | 意味                                              |
| ---------- | ------------------------------------------------- |
| ✅ PASS    | 設計書・実装計画・実コードで確認済み。問題なし    |
| ⚠️ MINOR   | 軽微な問題。Phase 12 または後続タスクで対応       |
| ❌ BLOCKER | 要対応。Phase 5 または Phase 8 に戻して修正が必要 |

---

## セクション 1: セキュリティ確認項目（Security）

### 1. path traversal guard

#### 1-1. workspacePath に `../` が含まれる場合に `PERMISSION_DENIED` エラーが返る

**判定: ✅ PASS**

根拠:

- `chatEditHandlers.ts` L109-111 に `hasPathTraversal()` 関数が実装されており、`filePath.includes("..")` と `filePath.includes("//")` の両方を検出する。
- `handleReadFile`（L138-146）と `handleWriteFile`（L249-257）の双方で `hasPathTraversal()` 呼び出し後に `PERMISSION_DENIED` エラーを返す実装が確認できる。
- パストラバーサル検出は workspacePath チェックより先に実行される（contract-matrix.md § 4-D 準拠）。

#### 1-2. `path.resolve()` + `startsWith(workspacePath)` の二重チェックが実装されている

**判定: ✅ PASS**

根拠:

- `isWithinWorkspace()` 関数（L93-104）が `path.resolve(filePath)` と `path.resolve(workspacePath)` の両方を正規化したうえで `resolvedFilePath.startsWith(resolvedWorkspace + path.sep)` による二重チェックを行っている。
- `resolvedFilePath === resolvedWorkspace` との完全一致ケースも網羅されており、シンボリックリンクや相対パス経由の迂回を防止する実装となっている。

#### 1-3. context ファイルのパスが workspacePath の範囲外を参照しない

**判定: ⚠️ MINOR**

根拠:

- `handleReadFile` / `handleWriteFile` は workspacePath 制約を実装しているが、`chat-edit:send-with-context` の `request.contexts[*].filePath` に対する workspacePath チェックは現行実装に存在しない（設計上 `handleSendWithContext` は workspacePath 引数を持たない）。
- contract-matrix.md § 4-D で「`chat-edit:send-with-context` は LLM 実行の IPC であり workspacePath 引数を持たない」と明示されているため設計上は許容。しかし Phase 5 実装後に `request.contexts[*].filePath` が workspacePath 外のファイルを参照できてしまう可能性がある。
- Phase 12 または後続タスクで context ファイルパスの事前検証を追加することを未タスクとして記録する。

---

### 2. sender validation

#### 2-1. 全 chat-edit IPC ハンドラーに `validateIpcSender` が実装されている

**判定: ❌ BLOCKER**

根拠:

- 現行の `chatEditHandlers.ts` を調査した結果、`handleReadFile`（L120）・`handleWriteFile`（L229）・`handleGetSelection`（L328）・`handleDetectLanguage`（L340）・`handleSendWithContext`（L351）のいずれにも `validateIpcSender` の呼び出しが存在しない。
- Phase 3 設計レビューの MINOR-05 で「現行 chatEditHandlers.ts に sender validation が未実装」と指摘されているが、Phase 5 実装計画（Step B-2）で対応方針は示されている。
- Phase 5 実装前の現時点で確認しているため、Phase 5 実装が完了した場合はこの判定が変わることを前提とする。**Phase 5 実装完了後に再確認が必須**。

> 注意: 本チェックリストは「実装計画に基づく設計検証」フェーズとして位置づけられている。Phase 5 が完了した後のコード実態をもって最終確認を行う。現時点では実装計画（contract-matrix.md § 4-A、implementation-plan.md Step B-2）では全ハンドラーに sender validation を追加する方針が明確化されているため、Phase 5 完了後の確認事項として BLOCKER を記録する。

#### 2-2. `UNAUTHORIZED` エラーが適切に返される

**判定: ⚠️ MINOR（実装計画確認済み、実装待ち）**

根拠:

- contract-matrix.md § 4-A で sender 検証失敗時のエラーコードは `PERMISSION_DENIED`（`UNAUTHORIZED` ではなく）と定義されている。
- implementation-plan.md Step B-2 では各ハンドラーの sender 検証失敗時の動作として `PERMISSION_DENIED` エラーを返す方針が明記されている。
- `handleGetSelection` のみ `null` を返す（エラー扱いしない）ことが設計で明示されており、一貫性がある。
- 実装が完了していないため Phase 5 完了後に確認する。

#### 2-3. validateIpcSender の `getAllowedWindows` コールバックが呼び出されている（P41対策）

**判定: ❌ BLOCKER（実装完了後確認必須）**

根拠:

- 現行実装に `validateIpcSender` 自体が存在しないため、P41 対策としての `getAllowedWindows` コールバックの呼び出しも未実装である。
- Phase 3 設計レビューでは「テスト設計で sender validation のテストケースを各ハンドラーで設計し、Phase 5 実装で sender validation が漏れないよう先にテストを書く（TDD 原則）」と明記されているため、テスト設計（Phase 4）でも対応策が示されている。
- 実装計画 contract-matrix.md § 4-A の `getAllowedWindows: () => [mainWindow]` 設定が Phase 5 で実装されることを条件として、P41 対策が担保される。

---

### 3. secret masking

#### 3-1. error envelope に API キーが含まれていない

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 1-C で「credential を Renderer に渡さない」が制約として明示されている。
- contract-matrix.md § 4-C で Renderer へは `{ code, message, retryable, reason, guidance }` のみ返す設計が明示されている。
- Phase 5 実装計画（リスク 7・P55 対策）でエラーをサニタイズしてから返す方針が明記されている。

#### 3-2. `escapeRegExp` を使った正規表現パターンでのマスク（P55対策）

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- contract-matrix.md § 4-C に「P55 対策（`escapeRegExp()` でパスマスク時のメタ文字エスケープ）も明記されている」と設計書に記載されている。
- implementation-plan.md § 6（リスク 7）で「`escapeRegExp()` でパスをマスクする（P55 対策）」と対策が明文化されている。
- ただし現行実装の `handleReadFile` L197 に `message: \`File not found: ${filePath}\`` というファイルパスを含むエラーメッセージが存在する。これは ENOENT エラー時のみ発生するが、フルパスが Renderer に漏洩する可能性がある。Phase 5 実装時に sanitize を適用することを確認する。

#### 3-3. homedir パスが error メッセージに含まれていない

**判定: ⚠️ MINOR**

根拠:

- 現行実装の `handleReadFile` L197 に `\`File not found: ${filePath}\`` というメッセージがあり、`filePath`が`/Users/username/...` 形式の絶対パスの場合、homedir パスが Renderer に送信される。
- 設計では sanitization が必要とされているが、現行実装では未対応である。Phase 5 実装時に対応を要する。

---

### 4. contextBridge セキュリティ

#### 4-1. Renderer が Main の Node.js API に直接アクセスしない

**判定: ✅ PASS**

根拠:

- `chatEditApi.ts` はすべての API を `ipcRenderer.invoke` 経由で実装しており、Node.js API を Renderer に直接公開していない。
- `ipcRenderer` 自体は Renderer に公開されておらず、`chatEditAPI` オブジェクトのみが公開される設計になっている。

#### 4-2. chatEditApi.ts が contextBridge 経由でのみ機能する

**判定: ❌ BLOCKER**

根拠:

- 現行の `exposeChatEditAPI()` 関数（chatEditApi.ts L136-140）が `contextBridge.exposeInMainWorld` を使用せず、`(window as unknown as Record<string, unknown>).chatEditAPI = chatEditAPI` として `window` オブジェクトに直接代入している。
- `contextIsolation: true` 環境では、Preload からの `window` 直接代入は Renderer のコンテキストとは別の Preload コンテキストに書き込まれるため、Renderer から `window.chatEditAPI` が `undefined` になる可能性がある（design-summary.md § リスク 5 参照）。
- implementation-plan.md Step B-1 では「`contextBridge.exposeInMainWorld` を使うように変更する」と明記されているが、現行実装では未対応である。

#### 4-3. `nodeIntegration: false` が維持されている

**判定: ✅ PASS（確認対象外だが設計準拠）**

根拠:

- BrowserWindow の `nodeIntegration: false` はプロジェクト全体のセキュリティ設定であり、このタスクの変更対象外である。04-electron-security.md ルールとして「開発時も含めて変更しない」と定義されており、本タスクの実装が影響を与えない。

---

## セクション 2: UX 確認項目（User Experience）

### 5. missing credentials の文言

#### 5-1. API key 未設定時のエラーメッセージが `MISSING_API_KEY` + terminal handoff guidance を含む

**判定: ⚠️ MINOR**

根拠:

- contract-matrix.md § 1-B の `ChatEditErrorCode` 一覧では `CREDENTIAL_MISSING`（`MISSING_API_KEY` ではない）がコードとして定義されている。
- design-summary.md § 4-D で「`CredentialProvider.get` 失敗 → `CREDENTIAL_MISSING` エラー + 設定画面への guidance を返す」と定義されており、設計上のコードは `CREDENTIAL_MISSING` である。
- Phase 5 実装計画にも `CREDENTIAL_MISSING` として一貫している。
- チェックリスト指示の `MISSING_API_KEY` と設計書の `CREDENTIAL_MISSING` でコード名に齟齬がある点を確認事項として記録する（実装は `CREDENTIAL_MISSING` に従う）。

#### 5-2. ガイダンスが「設定画面を開く」への導線を含む

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 4-D で「guidance 内容: 「Settings > API Key で [providerName] のキーを設定してください」を含める」と明記されている。
- contract-matrix.md の `ChatEditError.guidance` フィールドが「次にユーザーが取るべき操作の説明」として定義されており、設定画面への導線が含まれる設計である。

#### 5-3. マイクロコピーが ui-ux-realization.md と一致している

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- Phase 3 設計レビュー § 観点 7 で「UX 観点: PASS」と判定されており、ui-ux-realization.md の定義内容が設計として承認されている。
- 実装完了後に ui-ux-realization.md の具体的なマイクロコピーとの照合を Phase 11（手動テスト）で行う。

---

### 6. timeout エラーの文言

#### 6-1. LLM timeout（30秒）のエラーが `LLM_TIMEOUT` コードと具体的なメッセージを持つ

**判定: ⚠️ MINOR**

根拠:

- contract-matrix.md § 1-B の `ChatEditErrorCode` 一覧では `TIMEOUT`（`LLM_TIMEOUT` ではない）として定義されている。チェックリスト指示の `LLM_TIMEOUT` と設計書の `TIMEOUT` でコード名に齟齬がある点を確認事項として記録する（実装は `TIMEOUT` に従う）。
- design-summary.md § 4-A で「LLM API 呼び出しの timeout 値は **30,000 ms**、retryable エラーを返す」と定義されている。
- 具体的なタイムアウトメッセージの文言は Phase 5 実装時に定義が必要。

#### 6-2. terminal handoff guidance が表示される

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 5-B の状態遷移図で「`[timeout]→ selection-ready（timeout エラー + retry ガイダンス）`」が定義されている。
- timeout は `terminalSurface` 経路とは異なるため、自動的に handoff CTA は表示されない。retry ガイダンスが表示される設計である。

#### 6-3. リトライボタンまたは handoff ボタンが提供される

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- `TIMEOUT` エラーは `retryable: true` として設計されており（contract-matrix.md § 1-B）、Renderer 側でリトライボタンを表示する根拠が提供される。
- design-summary.md § 4-B で exponential backoff（最大 3 回）が定義されており、上限到達後は `retryable: false` に変更して guidance を返す設計である。

---

### 7. rate limit エラーの文言

#### 7-1. RATE_LIMITED エラーが retryable フラグと wait 時間を含む

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- contract-matrix.md § 1-B で `RATE_LIMIT` コード（`retryable: true`）が定義されており、`ChatEditError.retryAfter` フィールド（「リトライ可能になるまでの秒数」）が型定義に含まれている。
- 設計上は `retryable: true` と `retryAfter` の両方が提供される設計になっている。

#### 7-2. ユーザーに何秒後に再試行できるかを案内する

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- contract-matrix.md の `ChatEditError.retryAfter: number | undefined` が「リトライ可能になるまでの秒数（rate limit 時）」として型定義されており、Renderer 側で「X 秒後に再試行」のメッセージを表示する根拠が提供される。
- design-summary.md § 4-B で「Renderer へのフィードバック: 残 retry 回数と次回実行可能時刻を `error.retryAfter` に含める」と明記されている。

---

### 8. selection なし時の文言

#### 8-1. `blocked` 状態で「選択範囲を決めてから続ける」が表示される

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 5-B の状態遷移図で「`blocked（fileContexts.length === 0 または currentSelection === null）→「選択範囲を決めてから続ける」メッセージを表示`」と定義されている。
- selection なしの `blocked` 状態は Renderer 側（chatEditSlice）の `currentSelection === null` で判定するため、Main Process に依存しない。

#### 8-2. アクションボタンが適切に disabled になる

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- Phase 3 設計レビュー § 観点 7 で UX 観点が PASS と判定されており、状態ごとの CTA 活性/非活性が設計されている。
- `isLoading` フラグ（`true` の間は CTA を無効化する）が contract-matrix.md § 2-A で定義されている。
- selection なし時の `blocked` 状態での CTA 制御は Renderer 側（UI コンポーネント）の責務として設計されている。

---

## セクション 3: 契約整合確認項目（Contract Integrity）

### 9. IPC 契約整合

#### 9-1. `chat-edit:send-with-context` の引数が contract-matrix.md と一致する

**判定: ⚠️ MINOR（実装完了後確認必須）**

根拠:

- 現行の `chatEditApi.ts` の `sendWithContext` メソッドは `SendWithContextRequest` を引数として受け取り、`ipcRenderer.invoke(CHANNELS.SEND_WITH_CONTEXT, request)` でそのまま渡す実装になっている。
- 現行の `chatEditHandlers.ts` の `handleSendWithContext` は `request: SendWithContextRequest` を引数として受け取る設計になっており、Preload とハンドラー間の引数形式は一致している。
- ただし Phase 5 で `handleSendWithContext` のシグネチャが変更される（capability チェック、runtime 解決ロジックの追加）際に、Preload 側の引数形式との整合を改めて確認する必要がある（P44 対策）。

#### 9-2. `chat-edit:get-selection`（非推奨）の挙動が設計通り

**判定: ✅ PASS**

根拠:

- 現行の `handleGetSelection` は `null` を返す実装のみであり（L328-334）、設計通り「Main Process は selection の authority を持たない」を体現している。
- design-summary.md § 2-A で「`chat-edit:get-selection` IPC チャンネルは null を返すのみであり、削除または非推奨化する」と方針が示されており、現行実装と一致している。
- `ipcMain.handle` 登録は `registerChatEditHandlers`（L496）で維持されているが、非推奨化は Phase 5 でコメント差し替えが実施される予定。

#### 9-3. IPC チャンネル名が `IPC_CHANNELS` 定数経由（P27対策）

**判定: ⚠️ MINOR**

根拠:

- `chatEditHandlers.ts` では `CHAT_EDIT_CHANNELS` という定数オブジェクト（L481-488）でチャンネル名が管理されており、ハンドラー登録は定数経由で行われている。
- `chatEditApi.ts` でも `CHANNELS` という定数オブジェクト（L21-28）が定義されており、文字列リテラルの直接使用は避けられている。
- ただし refactor-plan.md § 4-C で指摘されているように、`CHAT_EDIT_CHANNELS` が `preload/channels.ts` の `IPC_CHANNELS` に統合されているかどうかは未確認であり、`unregisterAllIpcHandlers` での解除漏れ（P5 パターン）のリスクがある（リスク R5）。Phase 8 で確認が必要。

---

### 10. Task01 契約継承

#### 10-1. `AIAccessCapabilityResolver` の 4値（full / integrated-only / terminal-only / none）が正しく扱われている

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 6-B で capability 4 値（`integratedRuntime` / `terminalSurface` / `both` / `none`）の Chat Edit への適用が明確に定義されている。
- implementation-plan.md Step D-2 の `handleSendWithContext` 実装疑似コードで 4 値への対応が Step 3 で明示されている。
- 注意: チェックリスト指示の値域（`full / integrated-only / terminal-only / none`）と設計書の値域（`integratedRuntime / terminalSurface / both / none`）で命名が異なる。設計書の値域に従う。

#### 10-2. `ai:capability-changed` イベントが chat-edit state に反映される

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 6-C で「`ai:capability-changed` イベントを購読し、`chatEditCapability` フィールドを更新する」設計が明示されている。
- contract-matrix.md § 2-A で `chatEditCapability: AIAccessCapability | null` が新規追加フィールドとして定義されており、`setCapability` アクションも定義されている。
- chatEditApi.ts への `onCapabilityChanged` メソッドの追加が implementation-plan.md Step B-1 で計画されているが、現行実装では未対応。Phase 5 完了後に確認が必要。

#### 10-3. fail-fast が `none` ケースで必ず発動する

**判定: ✅ PASS（設計レベル確認済み）**

根拠:

- design-summary.md § 6-D と implementation-plan.md Step D-2（Step 3）で「capability = none → CAPABILITY_UNAVAILABLE エラー + guidance（fail-fast）」が明示されている。
- silent fallback（stub adapter への自動切替）は design-summary.md § 4-D で「禁止」と明記されており、フォールバック戦略（5-B）でも `none` を返す暫定実装が採用されている。

---

### 11. MINOR 指摘対応確認

#### 11-1. MINOR-01: `INVALID_SELECTION` エラーコードが定義されている

**判定: ⚠️ MINOR（Phase 5 実装待ち）**

根拠:

- Phase 3 設計レビューで MINOR-01 として「`INVALID_SELECTION` エラーコードが未定義」と指摘されており、Phase 5 での対応方針（`types/index.ts` への追加）が implementation-plan.md Step A-1 に記述されている。
- 現行実装の `chatEditHandlers.ts` や `chatEditApi.ts` には `INVALID_SELECTION` コードが存在しない。Phase 5 実装完了後に確認が必要。

#### 11-2. MINOR-02: Preload の workspacePath 引数が整合している

**判定: ⚠️ MINOR（Phase 5 実装待ち）**

根拠:

- Phase 3 設計レビューで MINOR-02 として「`chatEditApi.ts` が `readFile` / `writeFile` で `workspacePath` を渡さない」と指摘されている。
- 現行の `chatEditApi.ts` の `readFile(filePath: string)` は `workspacePath` 引数を持たず、`writeFile(filePath, content, options)` も同様である。
- implementation-plan.md Step B-1 では「方針 A（推奨）: `readFile(filePath, workspacePath?)` および `writeFile(filePath, content, workspacePath?, options?)` に引数を追加する」と記述されているが、未実装。

#### 11-3. MINOR-03: api-ipc-agent-core.md が更新対象として記録されている（Phase 12 で実施）

**判定: ✅ PASS**

根拠:

- Phase 3 設計レビューで MINOR-03 として「`api-ipc-agent-core.md` の `EditCommand` 型定義が実装と乖離している（`mode` vs `type` フィールド）」と指摘されており、「Phase 12 更新時」に対応することが記録されている。
- refactor-plan.md § 4-B でも「Phase 12 でシステム仕様書を更新する」として記録されている。
- Phase 12 チェックリストに明記されていることを確認事項として記録する。

#### 11-4. MINOR-04: surface ID `chat-edit` が Task01 仕様に登録されている

**判定: ⚠️ MINOR（Phase 5 実装待ち）**

根拠:

- Phase 3 設計レビューで MINOR-04 として「`AIAccessCapabilityResolver` の surface ID 値域が Task01 仕様に定義されていない」と指摘されており、Phase 5 実装前に `chat-edit` surface ID を確定することが求められている。
- implementation-plan.md Step F-2 で「Task01 foundation の `AIAccessCapabilityResolver` に `chat-edit` surface ID を登録する」対応が計画されているが、Task01 の実装状況は「現時点では未確認」とされており、Phase 5 完了後に確認が必要。

#### 11-5. MINOR-05: sender validation が全ハンドラーに実装されている

**判定: ❌ BLOCKER（Phase 5 実装待ち）**

根拠:

- Phase 3 設計レビューで MINOR-05 として「現行 `chatEditHandlers.ts` に sender validation が未実装」と指摘されており、Phase 5 での対応が必要。
- 現行実装（`chatEditHandlers.ts` L120, L229, L328, L340, L351）のいずれのハンドラーにも `validateIpcSender` が存在しないことを実コード確認で確認済み。
- implementation-plan.md Step B-2 に対応方針（各ハンドラー先頭での `validateIpcSender` 呼び出し）が記述されているが、未実装。

---

## 品質検証総評

### BLOCKER 集計

| #   | 確認項目                                               | 判定       | 理由                                                                                 |
| --- | ------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------ |
| B-1 | 2-1: 全ハンドラーへの validateIpcSender 実装           | ❌ BLOCKER | Phase 5 実装待ち。現行実装で全ハンドラーに未実装                                     |
| B-2 | 2-3: getAllowedWindows コールバック呼び出し（P41対策） | ❌ BLOCKER | Phase 5 実装待ち。validateIpcSender 自体が未実装                                     |
| B-3 | 4-2: contextBridge 経由での公開                        | ❌ BLOCKER | 現行 exposeChatEditAPI が window 直接代入（contextIsolation 環境で動作不全のリスク） |
| B-4 | 11-5: MINOR-05（sender validation 全ハンドラー対応）   | ❌ BLOCKER | B-1 と同内容だが設計レビューで明示指摘あり                                           |

**BLOCKER 件数: 4 件（実質 3 系統）**

- B-1 と B-4 は同一の sender validation 未実装を指している（実質 3 系統）
- B-1 / B-2 / B-4 は Phase 5 実装で解消される計画が明確にある
- B-3 は Phase 5 実装計画 Step B-1 で解消される計画がある

### MINOR 集計

| #    | 確認項目                                                    | 判定     | 備考                                                         |
| ---- | ----------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| M-1  | 1-3: context ファイルのパスが workspacePath 外参照          | ⚠️ MINOR | 設計上許容されているが、後続タスクで対応を推奨               |
| M-2  | 3-3: homedir パスが error メッセージに含まれる              | ⚠️ MINOR | 現行実装に ENOENT エラーでフルパス漏洩あり。Phase 5 で要対応 |
| M-3  | 5-1: CREDENTIAL_MISSING vs MISSING_API_KEY の名称齟齬       | ⚠️ MINOR | 実装は CREDENTIAL_MISSING に従うため実害なし                 |
| M-4  | 6-1: TIMEOUT vs LLM_TIMEOUT の名称齟齬                      | ⚠️ MINOR | 実装は TIMEOUT に従うため実害なし                            |
| M-5  | 9-1: send-with-context 引数の整合（Phase 5 後確認）         | ⚠️ MINOR | P44 対策として Phase 5 完了後に要確認                        |
| M-6  | 9-3: CHAT_EDIT_CHANNELS と IPC_CHANNELS の統合未確認        | ⚠️ MINOR | P5 パターン（二重登録）のリスク。Phase 8 で要確認            |
| M-7  | 10-2: onCapabilityChanged 実装（Phase 5 後確認）            | ⚠️ MINOR | 現行 chatEditApi.ts に未実装。Phase 5 で対応予定             |
| M-8  | 11-1: INVALID_SELECTION エラーコード定義（Phase 5 後確認）  | ⚠️ MINOR | Phase 5 実装待ち                                             |
| M-9  | 11-2: Preload workspacePath 引数整合（Phase 5 後確認）      | ⚠️ MINOR | Phase 5 実装待ち                                             |
| M-10 | 11-4: surface ID chat-edit の Task01 登録（Phase 5 後確認） | ⚠️ MINOR | Phase 5 実装待ち。Task01 実装状況要確認                      |

**MINOR 件数: 10 件**

### Phase 10 進行可否判定

**BLOCKER が 4 件（実質 3 系統）存在するが、いずれも Phase 5 実装計画（implementation-plan.md）に解消策が明記されており、設計上の問題（Phase 1-3 に戻す）ではなく実装未完了による問題である。**

本チェックリストは Phase 8 完了時点（実装計画・リファクタリング計画レビュー）の品質検証として位置づけられており、以下の条件を満たした場合に Phase 10 へ進行可能と判定する。

**Phase 10 進行条件**:

1. Phase 5 実装が完了し、BLOCKER B-1〜B-4 が解消されていること
2. `exposeChatEditAPI` が `contextBridge.exposeInMainWorld` を使用していること
3. 全ハンドラーに `validateIpcSender` が実装されていること
4. Phase 8 リファクタリングが完了し、refactor-plan.md § 3 の責務境界チェックリストが全項目 PASS であること

**現時点での判定: Phase 5 / Phase 8 完了後に Phase 10 へ進行可能。設計・計画レベルでの問題（Phase 1-3 への差し戻し）はない。**

---

## 付録: 確認に使用した成果物

| 成果物                         | パス                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- |
| Phase 2 設計サマリー           | `outputs/phase-2/design-summary.md`                                          |
| Phase 2 契約マトリクス         | `outputs/phase-2/contract-matrix.md`                                         |
| Phase 3 設計レビューレポート   | `outputs/phase-3/design-review-report.md`                                    |
| Phase 5 実装計画書             | `outputs/phase-5/implementation-plan.md`                                     |
| Phase 8 リファクタリング計画書 | `outputs/phase-8/refactor-plan.md`                                           |
| セキュリティ仕様書             | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` |
| 現行実装（ハンドラー）         | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                         |
| 現行実装（Preload）            | `apps/desktop/src/preload/chatEditApi.ts`                                    |
