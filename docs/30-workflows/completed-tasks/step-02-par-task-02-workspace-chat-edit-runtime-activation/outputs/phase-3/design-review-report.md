# Phase 3 設計レビューレポート - Chat Edit AI Runtime 有効化

## メタ情報

| 項目         | 内容                                                                                    |
| ------------ | --------------------------------------------------------------------------------------- |
| タスクID     | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                                             |
| Phase        | 3                                                                                       |
| 成果物種別   | 設計レビューレポート                                                                    |
| 作成日       | 2026-03-14                                                                              |
| レビュー対象 | Phase 1 要件定義・スコープ定義、Phase 2 設計サマリー・契約マトリクス・UI/UX Realization |
| 判定         | **MINOR**                                                                               |

---

## 1. レビュー総括

**最終判定: MINOR**

Phase 2 設計は全体として整合性が高く、Task01 foundation 契約の継承も明確に定義されている。設計の核心部分（stub 除去方針・fail-fast ルール・workspacePath 制約の独立性・handoff 境界・UX マイクロコピー）は PASS 判定できる。

ただし、以下の 5 件の MINOR 指摘が存在する。実装フェーズ（Phase 5）での対応が必要だが、Phase 4 への進行を妨げるものではない。

---

## 2. 観点別評価

### 観点 1: production stub が残らない設計か

**判定: PASS**

- `ipc/index.ts` L836-842 の `stubLLMAdapter` および `ChatEditService` への stub 注入が除去対象として明示されている（design-summary.md § 3-B）。
- 除去後の設計として `getOrCreateCapabilityResolver()` / `getOrCreateRuntimeResolver()` で共有インスタンスを DI する方針が示されている。
- `ChatEditService` の責務を `ContextBuilder` と `parseResponse` / `buildPrompt` のみに限定し、adapter は handler 層で都度取得する設計変更も明文化されている。
- 現在の `registerChatEditHandlers` シグネチャが `(mainWindow, chatEditService, fileService)` を受け取る形になっているが、設計では `registerChatEditHandlers(mainWindow, contextBuilder, { capabilityResolver, runtimeResolver })` に変更する方針が示されており、stub fallback が残る余地がない設計となっている。

**確認済み根拠**:

- design-summary.md § 3-A および § 3-B で DI 方針と stub 除去方針の両方が記述されている。
- ipc/index.ts 実コード（L836-842）と設計の除去対象が一致している。

---

### 観点 2: selection 失敗と LLM 実行失敗が別メッセージで扱えるか

**判定: MINOR（MINOR-01）**

設計は selection 失敗と LLM 実行失敗を一定程度分離しているが、**selection 固有のエラーコードが定義されていない**。

- contract-matrix.md § 1-B の `ChatEditErrorCode` 一覧に selection 失敗を示すコードが存在しない。
- 設計方針では「selection の authority は Renderer 側にあり、`null` 返却は未選択を意味しエラーとは区別される」とされているが、Renderer 側で selection が `null` のまま送信された場合のハンドラー側の挙動が設計に明記されていない。
- `CONTEXT_TOO_LARGE` はコンテキストサイズ起因であり、selection が空の場合はどのエラーコードが返るかが未規定。

**影響**: UI が「selection がないため実行できない」というメッセージを表示する根拠がコード上で判別できない。Renderer 側で事前チェックを行う設計（selection-ready 状態でのみ CTA を active にする）で補完されるが、Main Process 側からも `INVALID_SELECTION` 相当のエラーを返す設計が必要。

**対応方針（Phase 5 での対応）**: `INVALID_SELECTION` エラーコードを `ChatEditErrorCode` に追加し、`handleSendWithContext` で `request.selection === null` かつ selection が必須のコマンドタイプ（`refactor` / `generate-test` 等）の場合に返却する設計を補完する。

---

### 観点 3: workspacePath 制約が両経路で維持されるか

**判定: PASS**

- contract-matrix.md § 4-D で workspacePath 制約は `chat-edit:read-file` / `chat-edit:write-file` にのみ適用されることが明示されている。
- `chat-edit:send-with-context` は LLM 実行の IPC であり workspacePath 引数を持たないことが明記されている（これは正しい設計）。
- `AIAccessCapabilityResolver` の結果に依存しない独立した制約として設計されており、capability が `none` であっても read / write のパス検証は常に実行される。
- integratedRuntime 経路でも terminal handoff 経路でも、ファイル操作は `handleReadFile` / `handleWriteFile` を経由するため、workspacePath 制約は両経路で維持される。
- 実コードで `isWithinWorkspace()` と `hasPathTraversal()` が read / write 両方のハンドラーで実装されていることを確認済み。

---

### 観点 4: Chat Edit 専用 IPC 契約が drift していないか

**判定: MINOR（MINOR-02 / MINOR-03）**

**MINOR-02: `chatEditApi.ts` と design-summary.md の引数形式の部分不一致**

- 現行の `chatEditApi.ts` の `readFile(filePath: string)` は `workspacePath` 引数を受け取らない。
- 一方、contract-matrix.md § 1-C および chatEditHandlers.ts の `handleReadFile` は `(filePath: string, workspacePath?: string | null)` を引数として定義している。
- Phase 2 設計では read-file / write-file は「変更なし」とされているが、Preload 側（chatEditApi.ts）と Main ハンドラー側の引数が一致していない。
- 実コード調査: `chatEditApi.ts` の `writeFile` も `workspacePath` を受け取らない（`(filePath, content, options)` のみ）。

**影響**: workspacePath を渡さないと、Preload から `handleWriteFile` に `workspacePath` が渡されず、workspace 境界チェックが常にスキップされる（後方互換として設計上は許容されているが、contract として明示的に文書化が必要）。

**対応方針**: chatEditApi.ts の `readFile` / `writeFile` に `workspacePath` パラメータを追加するか、「workspacePath は現時点で Preload 経由では渡さない設計」として明示的に contract-matrix.md に記録する。

**MINOR-03: `api-ipc-agent-core.md` の `EditCommand` 型定義が design-summary.md と乖離**

- `api-ipc-agent-core.md` § Workspace Chat Edit IPC の `EditCommand` は `{ instruction: string, targetFiles: string[], mode: string }` と定義されているが、
- design-summary.md / contract-matrix.md の `EditCommand` は `{ type: EditCommandType, targetContextId: string, instruction?: string }` と定義されている。
- `mode` フィールド（`generate / edit / refactor`）と `type` フィールド（`continue / refactor / generate-test / add-comment / custom`）が異なるエニュメレーション体系を持っている。
- 実コードの `chatEditHandlers.ts` と `ChatEditService.ts` では contract-matrix.md の `type` ベースを採用しているが、システム仕様書（api-ipc-agent-core.md）が古い定義のまま残っている。

**影響**: Phase 12 のシステム仕様書更新漏れになりやすい箇所（P31 パターン）。実装との乖離がある。

**対応方針**: Phase 5 実装時に `api-ipc-agent-core.md` の `EditCommand` 型定義を実装に合わせて更新することを Phase 12 チェックリストに明記する。

---

### 観点 5: Task01 foundation 契約との整合性

**判定: PASS with MINOR（MINOR-04）**

**全体整合性（PASS）**:

- `AIAccessCapabilityResolver` / `AIRuntimeResolver` の DI 方式が Task01 design-summary.md の「Step 3: Task03-Task08 への契約」と一致している。
- fail-fast ルール（4 エラーコード: `CAPABILITY_UNAVAILABLE` / `CREDENTIAL_MISSING` / `PROVIDER_UNKNOWN` / `ADAPTER_CREATION_FAILED`）が Task01 仕様と一致している。
- `ai:capability-changed` イベント購読が設計に含まれており、Task01 の「capability 変更通知」仕様と整合している。
- capability 4 値（`integratedRuntime` / `terminalSurface` / `both` / `none`）が正しく継承されている。

**MINOR-04: `AIAccessCapabilityResolver` の surface ID が未定義**

- design-summary.md § 6-A で `surface ID` として `chat-edit` を使用しているが、Task01 design-summary.md には surface ID の体系が明示されていない。
- 他の並列タスク（Task03 / Task04 等）が同じ `AIAccessCapabilityResolver` を使う際に surface ID の命名規則が定まっていないと、実装時に齟齬が発生するリスクがある。
- Task01 の「Resolver 設計」には `surfaceId` を入力として受け取ることは明記されているが、surface ID の値域（どんな文字列を使うか）が未定義。

**対応方針**: Phase 5 実装前に `chat-edit` surface ID を確定し、Task01 foundation の `AIAccessCapabilityResolver` の surface ID 定義に登録する。Task03 / Task04 等の並列タスクとの重複排除も確認する。

---

### 観点 6: security 観点

**判定: MINOR（MINOR-05）**

**sender validation（条件付き PASS）**:

- contract-matrix.md § 4-A に各ハンドラーの sender validation 方針が記述されており、`validateIpcSender(event, 'chat-edit:xxx', { getAllowedWindows: () => [mainWindow] })` を使用する設計は security-electron-ipc-core.md の要件と整合している。
- `handleGetSelection` の sender 検証失敗時に `null` を返すことが明記されている（エラー扱いしない設計）。

**secret masking（PASS）**:

- contract-matrix.md § 4-C で API key / credential を Main Process 内に留め、Renderer に送信しない方針が明示されている。
- P55 対策（`escapeRegExp()` でパスマスク時のメタ文字エスケープ）も明記されている。
- Renderer へは `{ code, message, retryable, reason, guidance }` のみ返す制約が設計されている。

**MINOR-05: 現行 chatEditHandlers.ts に sender validation が未実装**

- 実コードを確認したところ、`handleReadFile` / `handleWriteFile` / `handleSendWithContext` のいずれにも `validateIpcSender` 呼び出しが存在しない（現行実装）。
- 設計では sender validation を実装する方針が示されているが、Phase 2 設計サマリーに「既存ハンドラーに sender validation を追加する」という変更が変更影響サマリー（§ 5）に明示的に含まれていない。
- contract-matrix.md § 4-A には sender validation の方針が示されているものの、変更影響サマリーの「変更なし」の項目（`handleReadFile` / `handleWriteFile`）と矛盾している。

**影響**: Phase 5 実装時に sender validation の追加が見落とされるリスクがある。

**対応方針**: contract-matrix.md § 5 の変更影響サマリーに `chatEditHandlers.ts` への sender validation 追加を明示的に記載する（現在「変更なし（既に正常動作）」に留まっている）。Phase 4 テスト設計で sender validation のテストケースを作成する。

---

### 観点 7: UX 観点

**判定: PASS**

- ui-ux-realization.md で 4 領域の画面構成が明確に定義されている。
- 状態ごとの CTA（selection-ready / generating / diff-ready / handoff / blocked）と Primary/Secondary/Tertiary CTA の使い分けが設計されている。
- handoff 時のマイクロコピーが明確：「この画面では自動実行しません。terminal で手動実行してください。」
- Apple HIG 準拠（Clarity / Deference / Depth）が観点ごとに表で定義されている。
- WCAG 2.1 AA 準拠のコントラスト要件とアクセシビリティ要件（ARIA 属性 / Tab 順序）が設計されている。
- auto-send 禁止・hidden prompt injection 禁止・silent fallback 禁止が Handoff Card 設計に明記されている。

---

## 3. MINOR 指摘一覧

| ID       | 観点 | 指摘内容                                                                                      | 重要度 | 対応タイミング                       |
| -------- | ---- | --------------------------------------------------------------------------------------------- | ------ | ------------------------------------ |
| MINOR-01 | 2    | selection 固有のエラーコード（`INVALID_SELECTION` 相当）が未定義                              | 中     | Phase 5 実装時                       |
| MINOR-02 | 4    | `chatEditApi.ts` が `readFile` / `writeFile` で `workspacePath` を渡さない（contract 未明示） | 低     | Phase 5 実装時                       |
| MINOR-03 | 4    | `api-ipc-agent-core.md` の `EditCommand` 型定義が実装と乖離している                           | 中     | Phase 12 更新時                      |
| MINOR-04 | 5    | `AIAccessCapabilityResolver` の surface ID 値域が Task01 仕様に定義されていない               | 低     | Phase 5 実装前                       |
| MINOR-05 | 6    | 現行 `chatEditHandlers.ts` に sender validation が未実装。変更影響サマリーに明示がない        | 中     | Phase 5 実装時・Phase 4 テスト設計時 |

---

## 4. MAJOR 指摘一覧

**なし**

Phase 2 設計に戻すべき重大な問題は検出されなかった。

---

## 5. Phase 4 への handoff 事項

Phase 4（テスト設計・テストコード作成）で留意すべき点を以下に示す。

### 5-A. 必須テストケース

| テストカテゴリ      | テスト対象                           | テストケース                                                                   | MINOR 対応 |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------ | ---------- |
| capability チェック | `handleSendWithContext`              | `CAPABILITY_UNAVAILABLE` エラー（none / terminalSurface 両方）を正しく返すこと | -          |
| capability チェック | `handleSendWithContext`              | integratedRuntime / both 時に LLM 実行に進むこと                               | -          |
| stub 除去           | `ipc/index.ts`                       | stub adapter が注入されていないこと（integration test）                        | -          |
| fail-fast           | `handleSendWithContext`              | `CREDENTIAL_MISSING` で guidance 付きエラーを返すこと                          | -          |
| fail-fast           | `handleSendWithContext`              | `PROVIDER_UNKNOWN` で fail-fast すること                                       | -          |
| selection           | `handleSendWithContext`              | `request.selection = null` でエラーか警告が返ること                            | MINOR-01   |
| LLM エラー          | `ChatEditService.sendWithContext`    | LLM API 失敗時に `LLM_ERROR` (retryable: true) を返すこと                      | -          |
| timeout             | `handleSendWithContext`              | 30,000 ms を超えた場合に `TIMEOUT` エラーを返すこと                            | -          |
| workspacePath       | `handleReadFile` / `handleWriteFile` | `workspacePath` 指定時にワークスペース外アクセスを拒否すること                 | -          |
| workspacePath       | `handleReadFile` / `handleWriteFile` | `workspacePath` 未指定時は制約スキップすること                                 | -          |
| パストラバーサル    | `handleReadFile` / `handleWriteFile` | `..` / `//` を含むパスを `PERMISSION_DENIED` で拒否すること                    | -          |
| sender validation   | 全ハンドラー                         | 不正 sender からの呼び出しを拒否すること                                       | MINOR-05   |
| handoff context     | `handleSendWithContext`              | terminalSurface 時に `HandoffContext` 付きエラーを返すこと                     | -          |
| handoff context     | `handoff`                            | `contextSummary` / `suggestedCommand` / `fileList` が正しく生成されること      | -          |
| error sanitization  | 全ハンドラー                         | Renderer に API key / ファイルパスが漏洩しないこと                             | -          |

### 5-B. テスト設計の留意点

1. **P39 対策**: happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用する。
2. **P13 対策**: timeout テストでは `advanceTimersByTime` で 1 ステップずつ進める（`runAllTimers` による無限ループを避ける）。
3. **P48 対策**: sender validation テストでは `mockValidateIpcSender.mock.calls[i][2].getAllowedWindows()` を明示的に呼び出し、callback の関数カバレッジを確保する。
4. **capabilityResolver / runtimeResolver のモック**: DI によって注入される resolver インスタンスはモック化して各テストケースで独立した挙動を設定する（P9 対策）。
5. **MINOR-05 対応**: sender validation のテストケースを各ハンドラーで設計し、Phase 5 実装で sender validation が漏れないよう先にテストを書く（TDD 原則）。

### 5-C. カバレッジ基準

| 指標              | 最低基準 |
| ----------------- | -------- |
| Line Coverage     | 80%      |
| Branch Coverage   | 60%      |
| Function Coverage | 80%      |

特に以下の分岐を重点的にカバーすること：

- capability 判定の 4 値（integratedRuntime / terminalSurface / both / none）
- fail-fast 条件の各段階（capability → credential → provider → adapter）
- workspacePath 指定あり / なし / パストラバーサルの 3 分岐
- retryable / non-retryable エラーの両方
