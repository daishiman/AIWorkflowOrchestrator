# Phase 6 回帰・Edge Case 拡充計画書 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001    |
| Phase      | 6                                              |
| 成果物種別 | 回帰・Edge Case 拡充計画書                     |
| 作成日     | 2026-03-14                                     |
| 前提       | Phase 4 テストマトリクス（TC-04-01〜TC-04-52） |
| 前提       | Phase 5 実装計画書                             |
| 前提       | Phase 2 設計サマリー                           |
| 後続       | Phase 7（カバレッジ確認）                      |

---

## 1. Edge Case テストケース一覧（Phase 4 テストマトリクスの追加分）

Phase 4 の TC-04-xx（19件）でカバーされていない Edge Case・境界値・回帰観点を以下に定義する。
各テストは `apps/desktop/src/main/handlers/__tests__/chatEditHandlers.edge.test.ts` または
`apps/desktop/src/main/services/chat-edit/__tests__/ContextBuilder.edge.test.ts` に追加する。

---

### 複数ファイルコンテキスト系

#### TC-06-01: 複数ファイル（5件）context で selection あり → ContextBuilder がサイズ制限内に収める

| 項目               | 内容                                                                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-01                                                                                                                                                                                                                                                                            |
| テスト分類         | unit                                                                                                                                                                                                                                                                                |
| 対象コンポーネント | `ContextBuilder.build()`（複数ファイルセクション構築）、`ContextBuilder.calculateSize()`（合計サイズ計算）                                                                                                                                                                          |
| 前提条件           | 5件のファイルコンテキストを作成し、各ファイルのコンテンツが 10KB 程度（合計 50KB 以内）になるよう設定する。各ファイルに `selection` オブジェクトを設定し、selectedText が 500 bytes 程度になるよう設定する。                                                                        |
| 入力               | `contexts` 配列に 5 件の `FileContextInput`（各10KB コンテンツ、selection あり）を設定。合計サイズが `MAX_CONTEXT_SIZE`（100KB）以内。                                                                                                                                              |
| 期待結果           | `build()` が 5 件のファイルセクションを含む文字列を返す。各セクションに `選択範囲: L{start}-L{end}` が含まれる。`validateSize()` が `true` を返す。`calculateSize()` の戻り値が合計ファイルコンテンツのバイト数と一致する（selectedText ではなく content 基準でサイズ計算される）。 |
| 補足               | `calculateSize()` は `ctx.content` を使ってサイズを計算する。表示は `selectedText` を使うが、サイズ計算は元ファイル全体で行われることを確認する（大きなファイルから小さな選択を行う場合の動作確認）。                                                                               |
| 優先度             | P1                                                                                                                                                                                                                                                                                  |

---

#### TC-06-02: 複数ファイル context でサイズオーバー → 最重要ファイルだけが残る

| 項目               | 内容                                                                                                                                                                                                                                                        |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-02                                                                                                                                                                                                                                                    |
| テスト分類         | unit                                                                                                                                                                                                                                                        |
| 対象コンポーネント | `handleSendWithContext`（CONTEXT_TOO_LARGE 時の動作）、`ContextBuilder.validateSize()`                                                                                                                                                                      |
| 前提条件           | 3件のファイルコンテキストを用意し、合計サイズが `MAX_CONTEXT_SIZE`（100KB）を超えるよう設定する（例: 各 40KB）。`capabilityResolver` が `integratedRuntime` を返す。                                                                                        |
| 入力               | `SendWithContextRequest` の `contexts` に合計 120KB のファイルを設定。`targetContextId` に最初のファイルを設定。                                                                                                                                            |
| 期待結果           | `{ success: false, error: { code: "CONTEXT_TOO_LARGE", retryable: false } }` を返す。LLM adapter は呼び出されない。現在の `ContextBuilder` は自動的な削減機能を持たないため、エラーで終了することを確認する（将来の自動削減機能のベースラインとして記録）。 |
| 補足               | 現在の実装では「最重要ファイルだけが残る」自動削減は未実装。このテストはエラーが正しく返ることを確認し、将来の削減機能追加時の回帰テストとして機能する。                                                                                                    |
| 優先度             | P1                                                                                                                                                                                                                                                          |

---

#### TC-06-03: context ファイルの一部がバイナリ → バイナリは除外される

| 項目               | 内容                                                                                                                                                                                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-06-03                                                                                                                                                                                                                                                                                                                                   |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                                                       |
| 対象コンポーネント | `handleReadFile`（バイナリファイル検出ロジック）、`ContextBuilder.build()`（バイナリ除外後のビルド）                                                                                                                                                                                                                                       |
| 前提条件           | `handleReadFile` で PNG 形式のバイナリファイルを読み込もうとする状況を模擬する。ファイル名が `.png` / `.jpg` / `.exe` など、バイナリとして扱われる拡張子を持つ。                                                                                                                                                                           |
| 入力               | `filePath` が `"/workspace/image.png"` のファイル読み込みリクエスト（バイナリファイル）。                                                                                                                                                                                                                                                  |
| 期待結果           | バイナリ検出時に `{ success: false, error: { code: "BINARY_FILE_NOT_SUPPORTED", ... } }` または `{ success: true, content: "", language: "binary" }` のいずれかを返す（実装依存）。`ContextBuilder.build()` にバイナリコンテンツが渡された場合でも、セクションとして出力される（除外ロジックは現状未実装のため、将来実装時の回帰テスト）。 |
| 補足               | 現状のファイル読み込み実装でのバイナリ扱いの仕様を確認・記録する目的のテスト。バイナリ除外が未実装の場合は、動作を確認してドキュメント化し、未タスクとして記録する。                                                                                                                                                                       |
| 優先度             | P2                                                                                                                                                                                                                                                                                                                                         |

---

### 大量コンテキスト系

#### TC-06-04: context が 8000 tokens 超過 → CONTEXT_TOO_LARGE エラーが返る

| 項目               | 内容                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-04                                                                                                                                                                                                                                                                              |
| テスト分類         | unit                                                                                                                                                                                                                                                                                  |
| 対象コンポーネント | `ContextBuilder.validateSize()`、`ChatEditService.sendWithContext()`（サイズ検証分岐）                                                                                                                                                                                                |
| 前提条件           | `MAX_CONTEXT_SIZE` は現在 100KB（バイト）で定義されている。LLM のトークン制限（8000 tokens 相当 ≒ 32,000 bytes）を超える大量コンテンツを設定する（例: 33,000 bytes のコンテンツ）。LLM adapter はモック化する。                                                                       |
| 入力               | `contexts[0].content` に 33,000 bytes（`"あ".repeat(11000)` 相当で UTF-8 換算）のコンテンツを設定。これは `MAX_CONTEXT_SIZE`（100KB）以内だが、LLM のトークン制限を超える可能性がある。                                                                                               |
| 期待結果           | `validateSize()` が `true` を返す（100KB 以内のため）。LLM adapter が `sendMessage` を呼び出す。LLM adapter 側がエラーを返した場合は `LLM_ERROR` として処理される。LLM のトークン制限は LLM adapter 層の責務であることを確認する（`ContextBuilder` はバイトサイズのみ確認する設計）。 |
| 補足               | `MAX_CONTEXT_SIZE` の 100KB という設定と、LLM のトークン上限（8000 tokens ≒ 32KB程度）の違いを設計ドキュメントに記録する。将来的に tokens ベースの制限に変更する場合の回帰テストとして機能する。                                                                                      |
| 優先度             | P2                                                                                                                                                                                                                                                                                    |

---

#### TC-06-05: context が境界値（MAX_CONTEXT_SIZE - 1 byte）→ 正常に処理される

| 項目               | 内容                                                                                                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-05                                                                                                                                                                               |
| テスト分類         | unit                                                                                                                                                                                   |
| 対象コンポーネント | `ContextBuilder.validateSize()`、`ContextBuilder.calculateSize()`                                                                                                                      |
| 前提条件           | `MAX_CONTEXT_SIZE = 100 * 1024`（102,400 bytes）。コンテキストの合計サイズを 102,399 bytes（1 byte 手前）に設定する。                                                                  |
| 入力               | `contexts[0].content = "a".repeat(102,395)`（filePath = `/w/a.ts` = 5 bytes + コンテンツ = 102,395 bytes = 合計 102,400 - 1 bytes）。                                                  |
| 期待結果           | `calculateSize()` が 102,399 を返す。`validateSize()` が `true` を返す（`<=` 比較のため境界値 102,400 も含む）。TC-04-51 の境界値テスト（100KBちょうど）と合わせた境界値群を形成する。 |
| 補足               | TC-04-51（100KBちょうど）が PASS するので、その隣接値（100KB - 1 byte）の動作を確認する。`<=` vs `<` の境界値バグを防ぐ目的。                                                          |
| 優先度             | P1                                                                                                                                                                                     |

---

#### TC-06-06: context が 0 bytes（空ファイルのみ）→ 適切なエラーまたはスキップ

| 項目               | 内容                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-06-06                                                                                                                                                                                                                                                                                                                                                                 |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                                                                                     |
| 対象コンポーネント | `ContextBuilder.build()`（空コンテキスト処理）、`handleSendWithContext`（空 contexts[] への対応）                                                                                                                                                                                                                                                                        |
| 前提条件           | `contexts` 配列に 1 件のファイルコンテキストを設定し、そのコンテンツを `""` （空文字列）にする。                                                                                                                                                                                                                                                                         |
| 入力               | パターン A: `contexts = []`（空配列）。パターン B: `contexts = [{ content: "", filePath: "/w/empty.ts", language: "typescript" }]`（コンテンツ空）。                                                                                                                                                                                                                     |
| 期待結果           | パターン A: `ContextBuilder.build([])` が `""` を返す。`handleSendWithContext` が `contexts` 空配列でリクエストを受けた場合に `CONTEXT_TOO_LARGE` または `INVALID_REQUEST`（実装依存）エラーを返す。 パターン B: `build()` がファイルセクションを出力するが、コンテンツが空のセクションになる。LLM はコンテンツなしのプロンプトを受け取り、正常または LLM_ERROR を返す。 |
| 補足               | 現状の `ContextBuilder.build([])` は `""` を返す。空コンテキストでの LLM 呼び出しは意味をなさないため、handler 層でのバリデーション追加が必要かを確認する。未実装の場合は未タスクとして記録する。                                                                                                                                                                        |
| 優先度             | P2                                                                                                                                                                                                                                                                                                                                                                       |

---

### selection なし系

#### TC-06-07: command タイプが `add-comment` かつ selection なし → 全ファイルを context に使用

| 項目               | 内容                                                                                                                                                                                                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-07                                                                                                                                                                                                                                                                                              |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                  |
| 対象コンポーネント | `handleSendWithContext`（selection 不要コマンドの処理）、`ContextBuilder.build()`（selection なし時の全コンテンツ使用）                                                                                                                                                                               |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。`request.selection` が `null`。コマンドタイプが `add-comment`（selection 不要）。LLM adapter が成功を返す。                                                                                                                                       |
| 入力               | `{ command: { type: "add-comment" }, selection: null, contexts: [{ content: "function foo() {}", ... }] }`                                                                                                                                                                                            |
| 期待結果           | `INVALID_SELECTION` エラーを返さない（`add-comment` は selection 不要コマンドのため）。`ContextBuilder.build()` が `ctx.content`（全コンテンツ）を使用してセクションを構築する（`selectedText` なし時のデフォルト動作確認）。LLM adapter が 1 回呼び出され、成功レスポンスを返す。                    |
| 補足               | TC-04-02 / TC-04-11 で確認した「selection 必須コマンド（`refactor` / `generate-test`）」の対になるテスト。selection 不要コマンド（`add-comment` / `continue` / `custom`）では selection が null でも INVALID_SELECTION にならないことを確認する。実装時に「selection 必須コマンドの一覧」を明示する。 |
| 優先度             | P1                                                                                                                                                                                                                                                                                                    |

---

#### TC-06-08: command タイプが `refactor` かつ selection なし → INVALID_SELECTION エラー

| 項目               | 内容                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-08                                                                                                                                                                                                                                 |
| テスト分類         | unit                                                                                                                                                                                                                                     |
| 対象コンポーネント | `handleSendWithContext`（selection 必須コマンドの検証ロジック）                                                                                                                                                                          |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。`request.selection` が `null`。コマンドタイプが `refactor`。                                                                                                                         |
| 入力               | `{ command: { type: "refactor" }, selection: null, contexts: [...] }`                                                                                                                                                                    |
| 期待結果           | `{ success: false, error: { code: "INVALID_SELECTION", message: "refactor コマンドには selection が必要です", retryable: false } }` を返す。LLM adapter は呼び出されない。                                                               |
| 補足               | TC-04-02 の明示的な再確認。selection 必須コマンド一覧が `chatEditHandlers.ts` 内に定数として定義されていることを確認する（例: `const SELECTION_REQUIRED_COMMANDS = ["refactor", "generate-test"] as const`）。この定数のテストも含める。 |
| 優先度             | P1                                                                                                                                                                                                                                       |

---

#### TC-06-09: selection が whitespace のみ → INVALID_SELECTION エラー（trim 後に空）

| 項目               | 内容                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-09                                                                                                                                                                                        |
| テスト分類         | unit                                                                                                                                                                                            |
| 対象コンポーネント | `handleSendWithContext`（selection の内容バリデーション）                                                                                                                                       |
| 前提条件           | `capabilityResolver` が `integratedRuntime` を返す。`request.selection.selectedText` が `"   "`（スペースのみ）。コマンドタイプが `refactor`（selection 必須）。                                |
| 入力               | `{ command: { type: "refactor" }, selection: { startLine: 1, endLine: 1, selectedText: "   " }, contexts: [...] }`                                                                              |
| 期待結果           | `selection.selectedText.trim() === ""` となるため `INVALID_SELECTION` エラーを返す。LLM adapter は呼び出されない。P42 パターン（文字列の `.trim()` バリデーション）の適用確認。                 |
| 補足               | P42 準拠: `selectedText` の検証は「`typeof !== "string"` → `=== ""` → `.trim() === ""`」の 3 段バリデーションで行う。`"   "` は 2 番目のチェックを通過するが 3 番目で拒否されることを確認する。 |
| 優先度             | P1                                                                                                                                                                                              |

---

### ネットワーク・タイムアウト系

#### TC-06-10: LLM が 30 秒ちょうどで応答 → 境界値テスト（timeout しないこと）

| 項目               | 内容                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-10                                                                                                                                                                                           |
| テスト分類         | unit                                                                                                                                                                                               |
| 対象コンポーネント | `handleSendWithContext`（LLM 呼び出しのタイムアウト制御）                                                                                                                                          |
| 前提条件           | Vitest fake timers を使用（`vi.useFakeTimers()`）。LLM adapter の `sendMessage` が `vi.advanceTimersByTime(30000)` のタイミングで成功レスポンスを返すよう設定する。設計上の timeout 値: 30,000ms。 |
| 入力               | 正常な `SendWithContextRequest`（selection あり、contexts あり）                                                                                                                                   |
| 期待結果           | `Promise.race` で 30,000ms ちょうどの場合に LLM の結果が返る（timeout が先に発火しない）。`{ success: true, result: { ... } }` を返す。timeout カウンタが 30,001ms 未満でキャンセルされる。        |
| テスト実装上の注意 | P13 対策: `vi.runAllTimers()` は使用しない。`vi.advanceTimersByTime(30000)` を使い、その直後に Promise の resolve を確認する。`Promise.race` の勝者が LLM レスポンスであることを検証する。         |
| 優先度             | P2                                                                                                                                                                                                 |

---

#### TC-06-11: LLM が 30 秒 + 1ms で応答 → timeout エラー

| 項目               | 内容                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-11                                                                                                                                                                                                                                     |
| テスト分類         | unit                                                                                                                                                                                                                                         |
| 対象コンポーネント | `handleSendWithContext`（LLM 呼び出しのタイムアウト制御）                                                                                                                                                                                    |
| 前提条件           | Vitest fake timers を使用。LLM adapter の `sendMessage` が 30,001ms 後にレスポンスを返すよう設定（timeout よりも後に解決する）。TC-04-12 と同条件。                                                                                          |
| 入力               | 正常な `SendWithContextRequest`（selection あり、contexts あり）                                                                                                                                                                             |
| 期待結果           | `vi.advanceTimersByTime(30001)` 後に `{ success: false, error: { code: "TIMEOUT", retryable: true, guidance: "..." } }` が返る。guidance フィールドに terminal handoff への誘導が含まれる。LLM の遅延レスポンスは無視される（race の敗者）。 |
| テスト実装上の注意 | P13 対策: `vi.advanceTimersByTime(30001)` を使い、setTimeout の内部カウンタを 1 ステップずつ進める。`runAllTimers` による無限ループを防ぐ。TC-06-10（境界値 30000ms）と組み合わせて `>=` / `>` の境界バグを防ぐ。                            |
| 優先度             | P2                                                                                                                                                                                                                                           |

---

#### TC-06-12: ストリーミング途中でネットワーク切断 → 適切なエラー + handoff guidance

| 項目               | 内容                                                                                                                                                                                                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-06-12                                                                                                                                                                                                                                                                                               |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                   |
| 対象コンポーネント | `handleSendWithContext`（LLM adapter の例外ハンドリング）                                                                                                                                                                                                                                              |
| 前提条件           | LLM adapter の `sendMessage` が `new Error("Network disconnected")` をスローするよう設定する。`capabilityResolver` が `integratedRuntime` を返す。                                                                                                                                                     |
| 入力               | 正常な `SendWithContextRequest`（selection あり、contexts あり）                                                                                                                                                                                                                                       |
| 期待結果           | `ChatEditService.sendWithContext` の catch ブロックで例外が捕捉される。Renderer へ `{ success: false, error: { code: "LLM_ERROR", message: "LLMリクエストに失敗しました", retryable: true } }` が返る。エラーメッセージに "Network disconnected" 等の詳細情報は含まれない（error sanitization 確認）。 |
| 補足               | P55 対策の一環。`error.message` がサニタイズされ、内部エラー詳細が Renderer に漏洩しないことを確認する。`ChatEditService.ts` の catch ブロック（L128-138）の動作確認。                                                                                                                                 |
| 優先度             | P2                                                                                                                                                                                                                                                                                                     |

---

### concurrent 実行系

#### TC-06-13: 同一ワークスペースから 2 つの concurrent な chat-edit リクエスト → 2 つ目は queued または rejected

| 項目               | 内容                                                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-13                                                                                                                                                                                                   |
| テスト分類         | integration                                                                                                                                                                                                |
| 対象コンポーネント | `handleSendWithContext`（concurrent リクエスト制御）                                                                                                                                                       |
| 前提条件           | LLM adapter の `sendMessage` が解決されない Promise を返すよう設定し、1 件目のリクエストを処理中の状態を作る。2 件目のリクエストを即座に送信する。                                                         |
| 入力               | `handleSendWithContext` を 2 回連続で呼び出す（await せずに並列実行）。各リクエストは正常な `SendWithContextRequest`。                                                                                     |
| 期待結果           | 現在の実装では concurrent 制御が未実装の場合、2 件が同時に LLM を呼び出す動作を確認する（現状の仕様を記録）。concurrent 制御が実装済みの場合、2 つ目は `CONCURRENT_REQUEST_REJECTED` または queue に入る。 |
| 補足               | 現状の `chatEditHandlers.ts` に concurrent 制御がない可能性が高い。このテストは「現状の仕様を記録する」目的で作成し、未実装の場合は concurrent 制御を未タスクとして記録する。                              |
| 優先度             | P3                                                                                                                                                                                                         |

---

### workspacePath 制約系

#### TC-06-14: workspacePath が symlink → resolved path が使われる

| 項目               | 内容                                                                                                                                                                                                                                 |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| テストID           | TC-06-14                                                                                                                                                                                                                             |
| テスト分類         | unit                                                                                                                                                                                                                                 |
| 対象コンポーネント | `handleReadFile`（workspacePath の path resolution）、`isWithinWorkspace()` 関数                                                                                                                                                     |
| 前提条件           | `fs.realpath` をモック化し、symlink の解決をシミュレートする。`workspacePath = "/workspace-link"` が `/actual/workspace` に解決されるよう設定。`filePath = "/workspace-link/src/app.ts"` を使用。                                    |
| 入力               | `handleReadFile(event, "/workspace-link/src/app.ts", "/workspace-link")`                                                                                                                                                             |
| 期待結果           | symlink 解決後の実際のパス（`/actual/workspace/src/app.ts`）でファイルアクセスが行われる。または symlink 解決が未実装の場合、通常の `path.resolve` / `startsWith` でのパス検証を行い、正常にアクセスできる（現状の仕様を記録する）。 |
| 補足               | symlink の扱いは OS によって挙動が異なる場合がある。このテストは「symlink を含むパスで予期しないアクセス拒否が起きないこと」を確認するためのテストとして機能する。symlink 解決が未実装の場合は未タスクとして記録する。               |
| 優先度             | P3                                                                                                                                                                                                                                   |

---

#### TC-06-15: workspacePath が存在しないディレクトリ → INVALID_PATH エラー

| 項目               | 内容                                                                                                                                                                                                                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-15                                                                                                                                                                                                                      |
| テスト分類         | unit                                                                                                                                                                                                                          |
| 対象コンポーネント | `handleReadFile`（workspacePath の存在確認）、`handleWriteFile`（同）                                                                                                                                                         |
| 前提条件           | `fs.stat` をモック化し、`workspacePath = "/nonexistent/workspace"` に対して `ENOENT` エラーをスローするよう設定する。                                                                                                         |
| 入力               | `handleReadFile(event, "/nonexistent/workspace/src/app.ts", "/nonexistent/workspace")`                                                                                                                                        |
| 期待結果           | `{ success: false, error: { code: "PERMISSION_DENIED", message: "Workspace path does not exist" } }` または `{ success: false, error: { code: "FILE_NOT_FOUND", ... } }` を返す（実装依存）。`fs.readFile` は呼び出されない。 |
| 補足               | TC-04-31（path traversal）と組み合わせて、workspacePath 自体が不正な場合の検証を行う。workspacePath の存在確認を先に行うか、filePath のアクセス試行で ENOENT を捕捉するかは実装依存。現状の仕様を記録する。                   |
| 優先度             | P2                                                                                                                                                                                                                            |

---

### prompt タイプ回帰系（5 コマンドタイプ全部）

#### TC-06-16: `continue` コマンド → コードの続きが返る

| 項目               | 内容                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-16                                                                                                                                                                                       |
| テスト分類         | unit                                                                                                                                                                                           |
| 対象コンポーネント | `ChatEditService.buildPrompt()`（`continue` コマンドのプロンプト生成）                                                                                                                         |
| 前提条件           | LLM adapter をモック化し、成功レスポンスを返すよう設定する。                                                                                                                                   |
| 入力               | `{ command: { type: "continue" }, contexts: [{ content: "function foo() {" }], selection: null }`                                                                                              |
| 期待結果           | `buildPromptFromTemplate("continue", contextString)` が「コードの続きを書いてください」を含むプロンプトを生成する。LLM adapter に渡されるプロンプトに `{context}` が未置換のまま残っていない。 |
| 優先度             | P2                                                                                                                                                                                             |

---

#### TC-06-17: `refactor` コマンド + selection あり → diff 形式の提案が返る

| 項目               | 内容                                                                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-17                                                                                                                                                                        |
| テスト分類         | unit                                                                                                                                                                            |
| 対象コンポーネント | `ChatEditService.buildPrompt()`（`refactor` コマンド）、`ChatEditService.parseResponse()`（diff hunk 生成）                                                                     |
| 前提条件           | LLM adapter が `typescript\nconst bar = 2;\n` 形式の成功レスポンスを返す。selection あり（selectedText がある）。                                                               |
| 入力               | `{ command: { type: "refactor" }, selection: { startLine: 1, endLine: 1, selectedText: "const foo = 1;" }, contexts: [{ content: "const foo = 1;", ... }] }`                    |
| 期待結果           | `{ success: true, result: { generatedContent: "const bar = 2;", diffHunks: [{ type: "modify", ... }], status: "pending" } }` を返す。`diffHunks` が空でない（変更があるため）。 |
| 優先度             | P2                                                                                                                                                                              |

---

#### TC-06-18: `generate-test` コマンド + selection あり → テストコードが返る

| 項目               | 内容                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-18                                                                                                                                                                    |
| テスト分類         | unit                                                                                                                                                                        |
| 対象コンポーネント | `ChatEditService.buildPrompt()`（`generate-test` コマンド）                                                                                                                 |
| 前提条件           | LLM adapter が `it("should work", () => { ... })` を含む成功レスポンスを返す。selection あり。                                                                              |
| 入力               | `{ command: { type: "generate-test" }, selection: { startLine: 1, endLine: 5, selectedText: "function add(a, b) { return a + b; }" }, contexts: [...] }`                    |
| 期待結果           | `buildPromptFromTemplate("generate-test", ...)` が「テストを生成してください」を含むプロンプトを返す。LLM レスポンスから `extractCodeFromResponse()` でコードが抽出される。 |
| 優先度             | P2                                                                                                                                                                          |

---

#### TC-06-19: `add-comment` コマンド + selection なし → ドキュメントコメントが返る

| 項目               | 内容                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-19                                                                                                                                            |
| テスト分類         | unit                                                                                                                                                |
| 対象コンポーネント | `ChatEditService.buildPrompt()`（`add-comment` コマンド）                                                                                           |
| 前提条件           | LLM adapter が `/** @param ... */` を含む成功レスポンスを返す。selection が `null`（`add-comment` は selection 不要）。                             |
| 入力               | `{ command: { type: "add-comment" }, selection: null, contexts: [{ content: "function greet(name) { return \"Hello, \" + name; }" }] }`             |
| 期待結果           | INVALID_SELECTION エラーを返さない（TC-06-07 との連携確認）。`buildPromptFromTemplate("add-comment", ...)` が「コメントを追加してください」を含む。 |
| 優先度             | P2                                                                                                                                                  |

---

#### TC-06-20: `custom` コマンド + instruction なし → `{instruction}` が未置換で残らない

| 項目               | 内容                                                                                                                                                                                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| テストID           | TC-06-20                                                                                                                                                                                                                                                                                            |
| テスト分類         | unit                                                                                                                                                                                                                                                                                                |
| 対象コンポーネント | `buildPromptFromTemplate()`（`custom` コマンドの instruction 未設定時処理）                                                                                                                                                                                                                         |
| 前提条件           | `command.type = "custom"`、`command.instruction = undefined`（未設定）。TC-04-52 で言及された境界値のテスト。                                                                                                                                                                                       |
| 入力               | `buildPromptFromTemplate("custom", "context text", undefined)` を呼び出す。                                                                                                                                                                                                                         |
| 期待結果           | 戻り値に `"{instruction}"` が未置換のまま含まれないこと（graceful fallback が動作していること）。現状の実装では `instruction` が `undefined` の場合は `replace("{instruction}", undefined)` となり `"{instruction}"` が残る可能性がある（バグ確認）。バグが確認された場合は未タスクとして記録する。 |
| 補足               | TC-04-52 の「`buildPromptFromTemplate("custom", "ctx", undefined)` が `"{instruction}"` を未置換のまま含まないこと」を詳細化したテスト。現状の `prompts.ts` L88 `if (commandType === "custom" && instruction)` の実装では `instruction` が falsy の場合 replace が実行されない。                    |
| 優先度             | P1                                                                                                                                                                                                                                                                                                  |

---

## 2. 既知の落とし穴（Pitfalls）への対応

Phase 3 MINOR 指摘および `known-pitfalls.md` を参照し、各テストへの適用方針を記述する。

### P13: タイマーテスト無限ループ（TC-06-10 / TC-06-11 に適用）

- **対象**: TC-06-10（30 秒ちょうど境界値）、TC-06-11（30 秒 + 1ms タイムアウト）
- **症状**: `vi.runAllTimers()` を使用すると `setTimeout + Promise + 再スケジュール` のパターンで無限ループが発生する
- **適用方針**:
  - `vi.useFakeTimers()` で fake timers を有効化する
  - `vi.advanceTimersByTime(30000)` / `vi.advanceTimersByTime(30001)` で 1 ステップずつ進める
  - `vi.runAllTimers()` は一切使用しない
  - テスト終了後に `vi.useRealTimers()` でリセットする（`afterEach` に追記）

### P9: テスト間状態リーク（全テストケースに適用）

- **対象**: TC-06-01 から TC-06-20 の全テスト
- **症状**: `capabilityResolver` / `runtimeResolver` / `llmAdapter` のモックが前のテストの状態を引き継ぐ
- **適用方針**:
  - 全モックを `beforeEach` で `vi.clearAllMocks()` してリセットする
  - `capabilityResolver.resolve` のデフォルト返却値は `beforeEach` 内で設定する
  - テスト固有のモック設定は各 `it` ブロック内で上書きする
  - モジュールスコープの変数（例: concurrent 制御用のフラグ）は `beforeEach` でリセットする

### P39: happy-dom userEvent 非互換（UI コンポーネントテストに適用）

- **対象**: TC-06-07 / TC-06-19 などで UI 操作が必要な場合
- **症状**: `@testing-library/user-event` の `userEvent.setup()` が happy-dom 環境でエラーを起こす
- **適用方針**:
  - Main Process のハンドラーテストでは UI 操作は不要のため非該当
  - Renderer 側（`chatEditSlice` / コンポーネント）のテストで操作が必要な場合は `fireEvent` を使用する
  - 非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む

### P55: エラーメッセージ中の正規表現メタ文字（TC-06-12 に適用）

- **対象**: TC-06-12（ネットワーク切断エラーのサニタイズ確認）
- **症状**: `os.homedir()` が返すパス（例: `/Users/user.name`）をそのまま `new RegExp()` に渡すと `.` がワイルドカードとして扱われる
- **適用方針**:
  - `handleSendWithContext` が返す `error.message` にホームディレクトリパスが含まれないことを確認する
  - テストで `escapeRegExp()` を使用してパスのパターンを作成する場合は、メタ文字をエスケープする
  - テストケース TC-04-32（secret masking）と合わせて、エラーメッセージのサニタイズを確認する

### P42: `.trim()` バリデーション漏れ（TC-06-09 に直接関連）

- **対象**: TC-06-09（whitespace のみ selection の検出）
- **症状**: `selectedText === ""` チェックだけでは `"   "`（スペースのみ）が通過する
- **適用方針**:
  - `handleSendWithContext` の selection バリデーションで 3 段チェックを確認する:
    1. `typeof selectedText !== "string"` チェック
    2. `selectedText === ""` チェック
    3. `selectedText.trim() === ""` チェック
  - テストで `"   "`（スペース 3 つ）を入力として使用し、3 番目のチェックで拒否されることを確認する

---

## 3. 回帰確認順序

Phase 5 実装完了後に、以下の順序で回帰を確認する（依存関係順）。

### Step 1: 純粋関数層（依存なし）

最初に依存関係のない純粋関数から確認する。

```
ContextBuilder.ts
  └── TC-06-01: 複数ファイル・selection あり
  └── TC-06-02: サイズオーバー
  └── TC-06-05: 境界値（MAX_CONTEXT_SIZE - 1 byte）
  └── TC-06-06: 0 bytes コンテキスト

prompts.ts
  └── TC-06-16: continue コマンド
  └── TC-06-17: refactor コマンド
  └── TC-06-18: generate-test コマンド
  └── TC-06-19: add-comment コマンド
  └── TC-06-20: custom コマンド（instruction なし）
```

### Step 2: ChatEditService 層（ContextBuilder / prompts に依存）

```
ChatEditService.ts
  └── TC-06-12: ネットワーク切断エラー
  └── TC-06-03: バイナリファイル（読み込み段階の確認）
```

### Step 3: handler 層のバリデーション（ChatEditService / resolvers に依存）

```
chatEditHandlers.ts
  └── TC-06-07: add-comment + selection なし（INVALID_SELECTION 非該当確認）
  └── TC-06-08: refactor + selection なし（INVALID_SELECTION 該当確認）
  └── TC-06-09: whitespace のみ selection（P42 対策）
  └── TC-06-04: 8000 tokens 超過（LLM 層の責務確認）
  └── TC-06-15: workspacePath が存在しない
```

### Step 4: タイムアウト系（fake timers が必要）

```
chatEditHandlers.ts（タイムアウト分岐）
  └── TC-06-10: 30 秒ちょうど（タイムアウトしない）
  └── TC-06-11: 30 秒 + 1ms（タイムアウトする）
```

### Step 5: 複合・高度なケース

```
chatEditHandlers.ts（複合条件）
  └── TC-06-13: concurrent リクエスト
  └── TC-06-14: symlink workspacePath
```

### Step 6: 既存テスト（Phase 4 TC-04-xx）の回帰確認

Phase 5 の変更による既存テストの破損を確認する。特に以下が影響を受ける可能性がある:

- `ChatEditService.sendWithContext` のシグネチャ変更（`adapter` を引数に追加）→ TC-04-10 が失敗する可能性
- `stub adapter` 除去 → `ipc/index.ts` のテストが影響を受ける可能性
- `validateIpcSender` 追加 → TC-04-30 / TC-04-03 が PASS になる（TDD で先行作成済みのテスト）

---

## 4. 優先度マトリクス

各 TC の優先度と実施タイミングを記述する。

| テストID | 優先度 | 実施タイミング | 対象コンポーネント               | 理由                                                         |
| -------- | ------ | -------------- | -------------------------------- | ------------------------------------------------------------ |
| TC-06-01 | P1     | Phase 5 直後   | ContextBuilder（複数ファイル）   | 複数ファイルは最も一般的なユースケース。必須確認。           |
| TC-06-02 | P1     | Phase 5 直後   | handler（サイズオーバー）        | CONTEXT_TOO_LARGE の動作が複数ファイル時も正確なことを確認。 |
| TC-06-05 | P1     | Phase 5 直後   | ContextBuilder（境界値）         | TC-04-51 との対で境界値バグを防ぐ。                          |
| TC-06-07 | P1     | Phase 5 直後   | handler（selection 不要確認）    | selection 必須コマンドの一覧定義の正確さを確認。             |
| TC-06-08 | P1     | Phase 5 直後   | handler（selection 必須確認）    | TC-04-02 の明示的な再確認。TC-06-07 と対で確認。             |
| TC-06-09 | P1     | Phase 5 直後   | handler（P42 対策）              | P42 違反のバグを防ぐための最重要テスト。                     |
| TC-06-20 | P1     | Phase 5 直後   | prompts.ts（custom 未置換）      | `{instruction}` 未置換バグは LLM に悪影響を与える。          |
| TC-06-06 | P2     | Phase 5 直後   | ContextBuilder / handler（空）   | 空コンテキストは稀なケースだが crash につながる可能性。      |
| TC-06-10 | P2     | Phase 5 直後   | handler（タイムアウト境界値）    | TC-06-11 と対で境界値を完全にカバーする。                    |
| TC-06-11 | P2     | Phase 5 直後   | handler（タイムアウト）          | TC-04-12 の補完。30001ms 境界を正確に確認。                  |
| TC-06-12 | P2     | Phase 5 直後   | ChatEditService（例外）          | error sanitization の確認（P55 対策）。                      |
| TC-06-15 | P2     | Phase 5 直後   | handler（workspacePath 不在）    | セキュリティ関連のパス検証の確認。                           |
| TC-06-16 | P2     | Phase 8 後     | prompts.ts（continue）           | Phase 4 TC-04-52 で基本確認済み。Phase 8 後に拡充。          |
| TC-06-17 | P2     | Phase 8 後     | ChatEditService（refactor diff） | diff hunk 生成の詳細確認。Phase 8 リファクタ後に確認。       |
| TC-06-18 | P2     | Phase 8 後     | prompts.ts（generate-test）      | Phase 4 TC-04-52 で基本確認済み。Phase 8 後に拡充。          |
| TC-06-19 | P2     | Phase 8 後     | prompts.ts（add-comment）        | TC-06-07 との連携確認。Phase 8 後に拡充。                    |
| TC-06-03 | P2     | Phase 10 後    | handler（バイナリ）              | バイナリ除外は現状未実装の可能性。Phase 10 後に確認。        |
| TC-06-04 | P2     | Phase 10 後    | handler（token 制限）            | LLM 層の責務確認。設計ドキュメントとして記録。               |
| TC-06-13 | P3     | Phase 10 後    | handler（concurrent）            | concurrent 制御は現状未実装の可能性。仕様確認目的。          |
| TC-06-14 | P3     | Phase 10 後    | handler（symlink）               | OS 依存の動作確認。環境セットアップが必要。                  |

---

## 付録: Phase 4 テストケースとの対応関係

| Phase 6 テストID   | 対応する Phase 4 テスト                  | 拡充の観点                                  |
| ------------------ | ---------------------------------------- | ------------------------------------------- |
| TC-06-01           | TC-04-51（ContextBuilder サイズ制限）    | 複数ファイル・selection ありの組み合わせ    |
| TC-06-02           | TC-04-14（CONTEXT_TOO_LARGE）            | 複数ファイル・部分超過のケース              |
| TC-06-05           | TC-04-51（境界値 100KB）                 | 100KB - 1 byte の隣接境界値                 |
| TC-06-07           | TC-04-02 / TC-04-11（INVALID_SELECTION） | selection 不要コマンドの対照テスト          |
| TC-06-08           | TC-04-02 / TC-04-11                      | selection 必須コマンドの明示的再確認        |
| TC-06-09           | TC-04-02（selection null チェック）      | P42 対策（whitespace のみ）の拡充           |
| TC-06-10           | TC-04-12（LLM timeout 30 秒）            | 30 秒ちょうどの境界値（タイムアウトしない） |
| TC-06-11           | TC-04-12（LLM timeout 30 秒）            | 30 秒 + 1ms の境界値（タイムアウトする）    |
| TC-06-12           | TC-04-32（secret masking）               | ネットワーク切断エラーのサニタイズ          |
| TC-06-13           | なし                                     | concurrent 実行の新規観点                   |
| TC-06-14           | TC-04-31（path traversal）               | symlink による workspacePath 迂回の観点     |
| TC-06-15           | TC-04-31（path traversal）               | workspacePath 不在の観点                    |
| TC-06-16〜TC-06-20 | TC-04-52（5 コマンドタイプ）             | 各コマンドの詳細動作確認                    |
| TC-06-06           | TC-04-14 / TC-04-50                      | 0 bytes コンテキストの観点                  |
| TC-06-03           | TC-04-31（PERMISSION_DENIED）            | バイナリファイルアクセスの観点              |
| TC-06-04           | TC-04-14（CONTEXT_TOO_LARGE）            | LLM トークン制限 vs. バイト制限の観点       |
