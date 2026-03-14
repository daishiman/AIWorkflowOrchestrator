# Phase 8 リファクタリング計画書 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001  |
| Phase      | 8                                            |
| 成果物種別 | リファクタリング計画書                       |
| 作成日     | 2026-03-14                                   |
| 前提       | Phase 1-5 成果物（要件定義・設計・実装計画） |
| 後続       | Phase 9（品質検証）                          |

---

## 1. 責務重複の特定と再配置方針

### 1-A. prompt build 責務

#### 現状の問題

コードを調査した結果、プロンプト生成ロジックが **2 箇所**に分散している（設計当初の懸念より少ないが依然として重複がある）。

| ファイル              | 該当箇所                                             | 内容                                                                                              |
| --------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `chatEditHandlers.ts` | L415-454（`buildPrompt` 関数）                       | `command.type` をスイッチして日本語インストラクションを組み立て、コンテキストを連結するフリー関数 |
| `prompts.ts`          | L21-93（`EDIT_PROMPTS` + `buildPromptFromTemplate`） | `{context}` プレースホルダーを持つテンプレート文字列 + プレースホルダー置換関数                   |
| `ChatEditService.ts`  | L148-154（`buildPrompt` メソッド）                   | `buildPromptFromTemplate` の薄いラッパー（実質的に `prompts.ts` に委譲済み）                      |

**重複の詳細**:

- `chatEditHandlers.ts` の `buildPrompt` は `prompts.ts` を **import していない**独自実装であり、同じ 5 コマンドタイプを独自スイッチで処理している。
- `ChatEditService.buildPrompt` は `prompts.ts` の `buildPromptFromTemplate` をラップしているだけで、独自ロジックを持たない。
- `chatEditHandlers.ts` の `buildPrompt` は `handleSendWithContext` 内から呼び出されているが、**戻り値を変数に束縛していない**（デッドコード状態）。

#### 再配置方針

| 方針                                                             | 内容                                                                                                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatEditHandlers.ts` の `buildPrompt` を削除                    | デッドコードかつ `prompts.ts` との重複。Phase 5 実装完了後に `handleSendWithContext` 内の呼び出し行ごと除去する                                                                               |
| `prompts.ts` を唯一のプロンプトテンプレート定義場所とする        | `EDIT_PROMPTS` レコードと `buildPromptFromTemplate` 関数がここにあれば十分                                                                                                                    |
| `ChatEditService.buildPrompt` は `prompts.ts` への委譲として維持 | handler 層から直接 `buildPromptFromTemplate` を呼ぶより、Service を経由させることで依存方向を維持できる。ただし `public` である必要はないため `private` に変更することも可                    |
| 将来の selection 情報組み込み                                    | `buildPromptFromTemplate` の `context` 文字列は `ContextBuilder.build()` が生成する。`ContextBuilder.buildFileSection` がすでに selection 情報を組み込んでいるため、`prompts.ts` 側は変更不要 |

---

### 1-B. runtime resolution 責務

#### 現状の問題

Phase 5 実装後の **stub 除去設計**においては、以下の問題が残らないよう注意が必要である。

| 懸念                              | 内容                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| handler と service の二重判定     | 設計では capability チェックは handler 入口で行い、`ChatEditService` は持たない方針。しかし `ChatEditService.sendWithContext` は現在も `validateSize` / `isValidCommandType` による独自バリデーションを持っており、handler 層でも同様のサイズチェック（`MAX_CONTEXT_SIZE` 比較）が `handleSendWithContext` に存在する（L357-371）。これが **二重バリデーション**の状態になっている |
| `MAX_CONTEXT_SIZE` 定数の重複定義 | `chatEditHandlers.ts` L63 と `ContextBuilder.ts` L4 の両方に `const MAX_CONTEXT_SIZE = 100 * 1024` が定義されている                                                                                                                                                                                                                                                                |

#### 再配置方針

| 責務                                                    | 配置先                                    | 根拠                                                                                                                                                       |
| ------------------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| capability 判定（`AIAccessCapabilityResolver.resolve`） | handler 層のみ                            | preflight として IPC 受信直後に実行する。`ChatEditService` は capability を知らなくてよい                                                                  |
| runtime 解決（`AIRuntimeResolver.resolve`）             | handler 層のみ                            | adapter は request ごとに解決し引数で注入する（Phase 5 設計準拠）                                                                                          |
| コンテキストサイズ検証（`validateSize`）                | `ChatEditService` のみ                    | `ContextBuilder.validateSize` を持つのは Service の責務として適切。handler 層の重複チェック（L357-371）は除去する                                          |
| コマンドタイプ検証（`isValidCommandType`）              | `ChatEditService` のみ                    | `prompts.ts` の `EDIT_PROMPTS` レコードを参照する検証は Service 層に留める                                                                                 |
| `MAX_CONTEXT_SIZE` 定数                                 | `ContextBuilder.ts` のみ（`export` 済み） | `chatEditHandlers.ts` の重複定義を削除し、`ContextBuilder.ts` の export を使う。現在すでに `export { MAX_CONTEXT_SIZE }` が `ContextBuilder.ts` 末尾にある |

---

### 1-C. response parse 責務

#### 現状の問題

| ファイル              | 該当箇所                                                                | 内容                                                                                        |
| --------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `ChatEditService.ts`  | L165-216（`parseResponse`, `extractCodeFromResponse`, `calculateDiff`） | コードブロック抽出・差分計算が Service 内に実装済み                                         |
| `chatEditHandlers.ts` | L383-396（仮の生成結果組み立て）                                        | `result-${Date.now()}` 形式の ID 生成と仮 `GeneratedResult` 構築が handler 内に存在している |

**問題の詳細**:

- `chatEditHandlers.ts` の `handleSendWithContext` が直接 `GeneratedResult` オブジェクトを組み立てている（L383-396）。これは Phase 5 で stub 実装として残った仮コードだが、リファクタリング時に明示的に除去する必要がある。
- `ChatEditService.parseResponse` が `GeneratedResult` を組み立てる責務を持っており、handler 層が同様の処理を持つことは責務の逸脱である。

#### 再配置方針

- `chatEditHandlers.ts` の仮 `GeneratedResult` 組み立てコード（L383-396）は Phase 5 実装（stub 除去後に `ChatEditService.sendWithContext` 経由になる）で自動的に除去される。
- `ChatEditService` の `parseResponse` / `extractCodeFromResponse` / `calculateDiff` は Service 層に留める。
- Phase 8 では「handler 層のレスポンス組み立てが完全に除去されていること」を確認するチェックポイントとする。

---

## 2. コードの重複・デッドコード一覧

Phase 1 の調査結果をコードの実態調査結果と照合し、以下にまとめる。

### 2-A. 除去対象のデッドコード・重複コード

| #   | ファイル              | 行（現状）                       | 種別                    | 内容                                                                                                                                                                  | 対応フェーズ                  |
| --- | --------------------- | -------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| D1  | `chatEditHandlers.ts` | L415-454                         | 重複 + デッドコード     | `buildPrompt` フリー関数。`prompts.ts` と独自重複実装であり、呼び出し元（L377）が戻り値を束縛しておらず実質デッドコード                                               | Phase 5 stub 除去と同時に削除 |
| D2  | `chatEditHandlers.ts` | L377                             | デッドコード            | `buildPrompt(request)` 呼び出し行。戻り値未使用                                                                                                                       | Phase 5 stub 除去と同時に削除 |
| D3  | `chatEditHandlers.ts` | L63                              | 重複定義                | `const MAX_CONTEXT_SIZE = 100 * 1024`。`ContextBuilder.ts` L4 に同一定義あり、かつ `export` 済み                                                                      | Phase 8 で import に差し替え  |
| D4  | `chatEditHandlers.ts` | L357-371                         | 重複バリデーション      | handler 内の `totalSize > MAX_CONTEXT_SIZE` チェック。`ChatEditService.validateSize` と重複                                                                           | Phase 8 で除去                |
| D5  | `chatEditHandlers.ts` | L383-396                         | 仮実装（stub 除去対象） | 仮の `GeneratedResult` 直接組み立て（`result-${Date.now()}` 等）。`ChatEditService.sendWithContext` 経由に置換                                                        | Phase 5 stub 除去で解消       |
| D6  | `ipc/index.ts`        | L836-842（現在の設計番号 12 内） | stub                    | `stubLLMAdapter` 定義と `ChatEditService(stubLLMAdapter, contextBuilder)` 呼び出し。`registerChatEditHandlers` に渡している `chatEditService` と `fileService` も含む | Phase 5 実装で削除            |
| D7  | `chatEditSlice.ts`    | L190-204                         | アンチパターン          | `window as unknown as { chatEditAPI?: ... }` キャスト。型安全でない                                                                                                   | Phase 5 実装で除去            |

### 2-B. stub adapter 除去後の空メソッド・dead branch の確認対象

Phase 5 実装完了後、以下の確認が必要である。

| 確認対象                                | 確認内容                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `registerChatEditHandlers` のシグネチャ | `(mainWindow, chatEditService, fileService)` → `(mainWindow, contextBuilder, { capabilityResolver, runtimeResolver })` への変更が完了しているか   |
| `FileService` の使用箇所                | handler シグネチャ変更後に `FileService` が `ipc/index.ts` 内で参照されていないか。grep で `FileService` を検索して未使用 import がないか確認する |
| `ChatEditService` のコンストラクタ      | `LLMAdapter` の DI が除去され `contextBuilder` のみになっているか                                                                                 |
| `handleGetSelection` の TODO コメント   | 設計説明コメントに差し替えられているか（L331-333）                                                                                                |

---

## 3. 責務境界チェックリスト

Phase 8 リファクタリング完了の判定に使用するチェックリスト。

### 3-A. `ChatEditHandler`（`chatEditHandlers.ts`）

- [ ] IPC 受信後、sender 検証 (`validateIpcSender`) のみを先頭で実行している
- [ ] リクエストバリデーション（`selection` 存在確認、`contexts` 空チェック）を行っている
- [ ] capability チェック（`capabilityResolver.resolve`）を呼び出している
- [ ] runtime 解決（`runtimeResolver.resolve`）と credential 取得を行っている
- [ ] `ChatEditService.sendWithContext(request, adapter)` を呼び出しているだけであり、プロンプト生成・LLM 実行・レスポンス解析ロジックを直接持っていない
- [ ] `buildPrompt` フリー関数（D1）が削除されている
- [ ] handler 内の重複 `MAX_CONTEXT_SIZE` チェック（D4）が削除されている
- [ ] ローカルの `MAX_CONTEXT_SIZE` 定数定義（D3）が削除され、`ContextBuilder.ts` からの import に変更されているか、またはサイズチェックは Service 層に委譲されているため handler 内に定数が不要になっている

### 3-B. `ChatEditService`

- [ ] コンストラクタが `contextBuilder` のみを受け取っている（`llmAdapter` を受け取っていない）
- [ ] `sendWithContext(request, adapter)` のシグネチャで adapter を引数として受け取っている
- [ ] コンテキストサイズ検証（`validateSize`）を保持している
- [ ] コマンドタイプ検証（`isValidCommandType`）を保持している
- [ ] プロンプト生成（`buildPrompt` → `buildPromptFromTemplate`）を担っている
- [ ] LLM 実行（`adapter.sendMessage`）を担っている
- [ ] レスポンス解析（`parseResponse`）を担っている
- [ ] capability 判定ロジックを持っていない（handler 層に委譲済み）

### 3-C. `ContextBuilder`

- [ ] `build(contexts)` でファイルコンテキスト文字列を構築している
- [ ] `validateSize` でサイズ上限チェックを行っている
- [ ] `MAX_CONTEXT_SIZE` を export しており、他ファイルが import できる
- [ ] selection 情報の組み込み（`buildFileSection` 内 `ctx.selection` 参照）が機能している
- [ ] LLM 実行・capability 判定・ファイル操作などの副作用を持っていない

### 3-D. `prompts.ts`

- [ ] `EDIT_PROMPTS` レコードがコマンドタイプ別テンプレートを定義している
- [ ] `buildPromptFromTemplate` がプレースホルダー置換を行っている
- [ ] `isValidCommandType` でコマンドタイプ検証を行っている
- [ ] LLM 呼び出し・ファイル操作などの副作用を持っていない

### 3-E. `chatEditSlice`（`chatEditSlice.ts`）

- [ ] `approveResult` から `window as unknown as {...}` キャスト（D7）が除去されている
- [ ] `approveResult` が「承認意図の記録のみ」に責務が限定されている（`writeFile` 呼び出しを持たない）
- [ ] `initialState` に `currentSelection`, `chatEditCapability`, `handoffContext` フィールドが追加されている
- [ ] `setSelection`, `setCapability`, `setHandoffContext` アクションが追加されている
- [ ] `window` オブジェクトへの直接参照が存在しない

---

## 4. 命名・型の整理方針

### 4-A. `LLMAdapter` インターフェースの命名確認

| 現状                                                                                                       | 確認内容                                                                             | 対応方針                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ChatEditService.ts` L23-35 に `export interface LLMAdapter { sendMessage(prompt: string): Promise<...> }` | Task01 foundation の `AIRuntimeResolver` が解決する adapter との命名の一致を確認する | Task01 実装後に `AIRuntimeResolver` が返す adapter 型が `LLMAdapter` と互換があるかを検証する。互換がない場合は `ChatEditService` 内の `LLMAdapter` インターフェースを Task01 の型に統一するか、adapter wrapper を追加する |

**現状の `LLMAdapter` の問題**:

- `sendMessage(prompt: string)` という単純な文字列ベースのインターフェースは、Task01 の adapter が持つより複雑な型（provider ID・model ID・credential 情報等）と乖離する可能性がある。
- Phase 8 では `LLMAdapter` インターフェースが `ChatEditService` で定義されているか Task01 側で定義されているかを明確にし、**二重定義を避ける**。

### 4-B. `ChatEditRequest` / `ChatEditResponse` の型と contract-matrix.md の整合確認

| 型                        | 現状の定義場所                | contract-matrix.md との整合                                                                                                                                                                                            |
| ------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SendWithContextRequest`  | `types/index.ts`              | Phase 5 で `selection?: TextSelection \| null` フィールドが追加される予定。追加後に contract-matrix.md § 1-B と一致するか確認する                                                                                      |
| `SendWithContextResponse` | `types/index.ts`              | `HandoffContext` 型フィールドが `error` オブジェクト内に追加される予定。追加後に contract-matrix.md § 1-C と一致するか確認する                                                                                         |
| `SendError.code`          | `types/index.ts`              | Phase 5 で `CAPABILITY_UNAVAILABLE` / `CREDENTIAL_MISSING` / `PROVIDER_UNKNOWN` / `ADAPTER_CREATION_FAILED` / `INVALID_SELECTION` / `PERMISSION_DENIED` が追加される予定                                               |
| `EditCommand.type`        | `services/chat-edit/types.ts` | `continue / refactor / generate-test / add-comment / custom` の 5 値。`api-ipc-agent-core.md` の `mode` フィールド（`generate / edit / refactor`）と乖離している（MINOR-03 指摘）。Phase 12 でシステム仕様書を更新する |

### 4-C. IPC チャンネル名の定数化確認

| 確認項目                                     | 現状                                                                                                                              | 対応方針                                                                                                                                                       |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CHAT_EDIT_CHANNELS` 定数                    | `chatEditHandlers.ts` L481-488 に定義済み                                                                                         | 定数として定義されているが、これは `preload/channels.ts` の `IPC_CHANNELS` 定数と統合されているか確認が必要                                                    |
| `ipc/index.ts` の `unregisterAllIpcHandlers` | `Object.values(IPC_CHANNELS)` で全チャンネルを解除しているが、`CHAT_EDIT_CHANNELS` が `IPC_CHANNELS` に含まれているかは調査が必要 | `CHAT_EDIT_CHANNELS` の値が `IPC_CHANNELS` に登録されていない場合、`unregisterAllIpcHandlers` で解除されないため、P5（リスナー二重登録）が発生するリスクがある |
| Preload 側チャンネル名                       | `chatEditApi.ts` 内でチャンネル名がハードコードされていないか確認                                                                 | P27 対策（`safeInvoke` 等でハードコード文字列を使っていないか）を確認する                                                                                      |

---

## 5. リファクタリングの実施タイミング

Phase 5（実装）完了後、以下の順序でリファクタリングを実施する。

### ステップ 1: stub 除去（Phase 5 と同時実施）

依存関係: なし（Phase 5 実装の一部として行う）

| 対象                     | 内容                                                                                                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `ipc/index.ts` D6        | `stubLLMAdapter` と `ChatEditService(stubLLMAdapter, ...)` を削除。`registerChatEditHandlers` のシグネチャ変更 |
| `chatEditSlice.ts` D7    | `window as unknown as {...}` キャストを除去。`approveResult` を「承認意図記録のみ」に変更                      |
| `chatEditHandlers.ts` D2 | `buildPrompt(request)` の戻り値未使用の呼び出し行を削除                                                        |

### ステップ 2: デッドコード除去（Phase 8 の主要作業）

依存関係: ステップ 1 の完了後

| 対象                     | 内容                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `chatEditHandlers.ts` D1 | `buildPrompt` フリー関数（L415-454）を削除。`prompts.ts` の `buildPromptFromTemplate` が唯一の実装になる                                                     |
| `chatEditHandlers.ts` D3 | `const MAX_CONTEXT_SIZE = 100 * 1024` ローカル定数を削除。`ContextBuilder.ts` からの import 済み export を使うか、handler 内でのサイズチェック自体を除去する |
| `chatEditHandlers.ts` D4 | handler 内の重複 `totalSize > MAX_CONTEXT_SIZE` チェックを除去。`ChatEditService.validateSize` に一本化する                                                  |

### ステップ 3: 型・命名の整理（Phase 8 の仕上げ）

依存関係: ステップ 2 の完了後、かつ Task01 実装状況の確認後

| 対象                                              | 内容                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `LLMAdapter` インターフェース                     | Task01 の adapter 型との整合を確認。不一致があれば wrapper または統一を行う                           |
| `ChatEditService.buildPrompt` の可視性            | `public` から `private` または `protected` への変更を検討（外部から直接呼ばれる必要がなくなった場合） |
| `CHAT_EDIT_CHANNELS` と `IPC_CHANNELS` の統合確認 | `unregisterAllIpcHandlers` が chat-edit チャンネルも解除できていることを確認                          |

### ステップ 4: コンポーネント層への writeFile 移動（Phase 5 と同時または直後）

依存関係: `chatEditSlice.ts` D7 の除去後

| 対象                                | 内容                                                                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `useDiffApply.ts`（修正または新規） | `window.chatEditAPI.writeFile` の呼び出しをフック層に移動。書き込み成功後に `chatEditSlice.approveResult` を dispatch |
| `window.d.ts`（修正または新規）     | `interface Window { chatEditAPI: ChatEditAPI }` を追加して型安全な参照を確立                                          |

---

## 6. リファクタリングによる regression リスク

### リスク R1: handler 内の重複 `MAX_CONTEXT_SIZE` チェック除去による動作変化

| 項目                   | 内容                                                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `chatEditHandlers.ts` D4 を除去した場合、handler 層でのサイズチェックが `ChatEditService.validateSize` のみになる。handler が直接サイズエラーを返す現在の実装と `ChatEditService` がエラーを返す実装でエラーコードが異なる可能性がある |
| regression テスト      | `handleSendWithContext` のコンテキストサイズ超過テスト（`CONTEXT_TOO_LARGE` エラーを返すことを確認）                                                                                                                                   |
| 回帰テストのマッピング | `chatEditHandlers.test.ts` の「context size exceeds 100KB → returns CONTEXT_TOO_LARGE」テストケース                                                                                                                                    |

### リスク R2: `buildPrompt` フリー関数除去によるプロンプト生成の変化

| 項目                   | 内容                                                                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `chatEditHandlers.ts` の `buildPrompt` が独自の日本語インストラクションを使用しているのに対し、`prompts.ts` の `EDIT_PROMPTS` テンプレートは異なるフォーマットを使用している。除去後は `ChatEditService.buildPrompt → buildPromptFromTemplate` 経由になるため、プロンプト内容が変化する |
| 現状の差異             | `chatEditHandlers.ts` L418: `"以下のファイルコンテキストに基づいて、"` というプレフィックス + switch-case で命令文を追加する方式 vs `prompts.ts` のテンプレート方式（`{context}` プレースホルダー使用）                                                                                 |
| 対応方針               | D1 を除去する際に `prompts.ts` のテンプレートが適切な出力を生成することを確認する。テストで LLM レスポンスをモックしているため、プロンプト内容の変化は単体テストには影響しないが、手動テスト（Phase 11）で確認が必要                                                                    |
| 回帰テストのマッピング | `ChatEditService.test.ts` の `buildPrompt` テストケース（各コマンドタイプで適切なプロンプトが生成されるか）                                                                                                                                                                             |

### リスク R3: `approveResult` の writeFile 除去による Renderer 動作変化

| 項目                   | 内容                                                                                                                                                                                                                                    |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `chatEditSlice.ts` の `approveResult` から `writeFile` 呼び出しを除去した後、コンポーネント層（`useDiffApply.ts`）に `writeFile` が移動する。移動前の期間や実装ミスにより、承認操作でファイルが書き込まれないバグが発生する可能性がある |
| 対応方針               | ステップ 4 の `useDiffApply.ts` 実装は D7 の除去と**同一 commit** で行う。`approveResult` から `writeFile` が除去された状態で `useDiffApply.ts` の実装が未完了な期間が生じないようにする                                                |
| 回帰テストのマッピング | `chatEditSlice.test.ts` の `approveResult` テストケース（書き込み成功・失敗の両パターン）。ただしテストのモック対象が `window.chatEditAPI` から `useDiffApply` 内の `chatEditAPI.writeFile` に変わるため、テストの修正も同時に必要      |

### リスク R4: `ChatEditService` コンストラクタ変更による DI 破壊

| 項目                   | 内容                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `constructor(llmAdapter, contextBuilder)` → `constructor(contextBuilder)` への変更後、既存テストが `new ChatEditService(mockAdapter, contextBuilder)` でインスタンス化しているため、すべてのテストがコンパイルエラーになる |
| 影響ファイル           | `ChatEditService.test.ts` および `ChatEditService` をテストする統合テストファイル                                                                                                                                          |
| 対応方針               | P21・P35 対策として、コンストラクタ変更前にすべてのテストファイルを grep で特定する（`grep -rn "new ChatEditService" apps/desktop/`）。変更と同時にすべてのテストを修正する                                                |
| 回帰テストのマッピング | `ChatEditService.test.ts` 全件（`sendWithContext` の各テストケース、`buildPrompt` テスト、`parseResponse` テスト）                                                                                                         |

### リスク R5: `CHAT_EDIT_CHANNELS` と `IPC_CHANNELS` 未統合による二重登録（P5 パターン）

| 項目                   | 内容                                                                                                                                                                                                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `unregisterAllIpcHandlers` が `IPC_CHANNELS` の値のみを解除対象とするため、`CHAT_EDIT_CHANNELS` の値が `IPC_CHANNELS` に含まれていない場合、macOS `activate` イベント等で `registerAllIpcHandlers` が再呼び出しされると chat-edit ハンドラーが二重登録される（P5 パターン） |
| 確認方法               | `grep -rn "CHAT_EDIT_CHANNELS" apps/desktop/src/preload/channels.ts` で `IPC_CHANNELS` への組み込みを確認する                                                                                                                                                               |
| 対応方針               | `CHAT_EDIT_CHANNELS` の各値を `IPC_CHANNELS` に追加するか、`unregisterChatEditHandlers` を `unregisterAllIpcHandlers` から呼び出すようにする                                                                                                                                |
| 回帰テストのマッピング | `ipc/index.test.ts`（または統合テスト）の `unregisterAllIpcHandlers` 呼び出し後の再登録テスト                                                                                                                                                                               |

### リスク R6: `LLMAdapter` インターフェースの型不整合（P44 パターン）

| 項目                   | 内容                                                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク                 | `ChatEditService.ts` の `LLMAdapter.sendMessage(prompt: string)` と Task01 の adapter が返す型が異なる場合、`handler → ChatEditService.sendWithContext(request, adapter)` の型チェックがコンパイルエラーになるか、または型アサーションが必要になる |
| 対応方針               | Task01 の adapter インターフェースを確認後、`LLMAdapter` の型を統一する。型アサーション（`as LLMAdapter`）は禁止（P19 対策）                                                                                                                       |
| 回帰テストのマッピング | TypeScript 型チェック（`pnpm typecheck`）で検出可能。テストは `mockAdapter` の型が `LLMAdapter` と互換があるかを確認                                                                                                                               |

---

## 付録: リファクタリング前後の責務マップ

```
【リファクタリング前】
chatEditHandlers.ts
  - handleSendWithContext
    - MAX_CONTEXT_SIZE チェック（重複）← D4
    - buildPrompt 呼び出し（戻り値未使用）← D2
    - 仮 GeneratedResult 組み立て（stub）← D5
  - buildPrompt 関数（フリー関数）← D1
  - MAX_CONTEXT_SIZE 定数（重複）← D3

ipc/index.ts
  - stubLLMAdapter 定義 ← D6
  - ChatEditService(stubLLMAdapter, ...) ← D6
  - registerChatEditHandlers(mainWindow, chatEditService, fileService) ← D6

chatEditSlice.ts
  - approveResult
    - window as unknown as {...} キャスト ← D7
    - writeFile 直接呼び出し ← D7

【リファクタリング後】
chatEditHandlers.ts（handler のみ）
  - handleSendWithContext
    - validateIpcSender（sender 検証）
    - request バリデーション（selection, contexts 空チェック）
    - capabilityResolver.resolve（capability チェック）
    - runtimeResolver.resolve（runtime 解決）
    - ChatEditService.sendWithContext(request, adapter) 呼び出し
  ※ buildPrompt なし、MAX_CONTEXT_SIZE なし、GeneratedResult 組み立てなし

ipc/index.ts（DI のみ）
  - registerChatEditHandlers(mainWindow, contextBuilder, { capabilityResolver, runtimeResolver })
  ※ stubLLMAdapter なし、FileService なし

ChatEditService（orchestration のみ）
  - constructor(contextBuilder)
  - sendWithContext(request, adapter)
    - validateSize（コンテキストサイズ検証）
    - isValidCommandType（コマンドタイプ検証）
    - contextBuilder.build（コンテキスト構築）
    - buildPrompt → buildPromptFromTemplate（プロンプト生成）
    - adapter.sendMessage（LLM 実行）
    - parseResponse（レスポンス解析）

ContextBuilder（context 収集のみ）
  - build, validateSize, calculateSize
  - MAX_CONTEXT_SIZE を export

prompts.ts（テンプレートのみ）
  - EDIT_PROMPTS, buildPromptFromTemplate, isValidCommandType

chatEditSlice.ts（状態管理のみ）
  - approveResult（承認意図の記録のみ）
  - setSelection, setCapability, setHandoffContext（新規）
  ※ window 直接参照なし

useDiffApply.ts（副作用フックのみ）
  - approveAndWrite
    - window.chatEditAPI.writeFile（型安全な参照）
    - 成功後: chatEditSlice.approveResult dispatch
```
