# Phase 7 カバレッジ確認計画書 - Chat Edit AI Runtime 有効化

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001                    |
| Phase      | 7                                                              |
| 成果物種別 | カバレッジ確認計画書                                           |
| 作成日     | 2026-03-14                                                     |
| 前提       | Phase 4 テストマトリクス（TC-04-01〜TC-04-52、19件）           |
| 前提       | Phase 5 実装計画書                                             |
| 前提       | Phase 6 回帰・Edge Case 拡充計画書（TC-06-01〜TC-06-20、20件） |
| 後続       | Phase 8（リファクタリング）                                    |

---

## 1. カバレッジ目標

Phase 4 テストマトリクスで設定されたカバレッジ基準（`02-code-quality.md` 推奨値）に準拠する。

| 指標              | 最低基準 | 推奨基準（目標） |
| ----------------- | -------- | ---------------- |
| Line Coverage     | 80%      | **90%以上**      |
| Branch Coverage   | 60%      | **70%以上**      |
| Function Coverage | 80%      | **90%以上**      |

---

## 2. ファイル別カバレッジ目標と不足箇所

### 2-1. `chatEditHandlers.ts`

**現状コード構造分析（Phase 5 実装計画書を基に評価）**

現状の `chatEditHandlers.ts` は Phase 5 実装計画書が定義する「5 ステップのロジック」を実装する予定だが、現時点のコードはまだ stub 段階（`handleSendWithContext` 内に TODO コメントあり、`validateIpcSender` 未追加）。Phase 5 実装完了後の想定コードを前提にカバレッジを評価する。

#### ハンドラー別カバレッジ目標

| ハンドラー              | カバレッジ目標 | カバーすべき主要分岐                                                                                        |
| ----------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `handleReadFile`        | Line 90%以上   | 絶対パス検証、パストラバーサル検出、workspacePath あり/なし、ファイルサイズ超過、ENOENT/EACCES/その他エラー |
| `handleWriteFile`       | Line 90%以上   | 絶対パス検証、パストラバーサル検出、workspacePath あり/なし、バックアップ作成あり/なし、EACCES/その他エラー |
| `handleGetSelection`    | Line 100%      | 常に null 返却のみ（単純だが sender validation 追加後も確認）                                               |
| `handleDetectLanguage`  | Line 100%      | 既知拡張子/未知拡張子の 2 ブランチ                                                                          |
| `handleSendWithContext` | Line 90%以上   | 以下の詳細を参照                                                                                            |

#### `handleSendWithContext` の分岐カバレッジ詳細

Phase 5 実装後の 5 ステップそれぞれに対応するブランチを確認する。

| ステップ | 分岐                                                          | 対応テスト（Phase 4 + 6）      | カバレッジ評価 |
| -------- | ------------------------------------------------------------- | ------------------------------ | -------------- |
| Step 1   | sender validation 成功                                        | TC-04-10（正常系）             | ✅ カバー済み  |
| Step 1   | sender validation 失敗 → PERMISSION_DENIED/UNAUTHORIZED       | TC-04-30                       | ✅ カバー済み  |
| Step 2   | selection 必須コマンドかつ selection=null → INVALID_SELECTION | TC-04-02, TC-04-11, TC-06-08   | ✅ カバー済み  |
| Step 2   | selection=null かつ whitespace のみ → INVALID_SELECTION       | TC-06-09                       | ✅ カバー済み  |
| Step 2   | selection 不要コマンドかつ selection=null → 正常続行          | TC-06-07, TC-06-19             | ✅ カバー済み  |
| Step 3   | capability = integratedRuntime → LLM 実行へ                   | TC-04-10, TC-04-01             | ✅ カバー済み  |
| Step 3   | capability = terminalSurface → HandoffContext 生成            | TC-04-21                       | ✅ カバー済み  |
| Step 3   | capability = none → CAPABILITY_UNAVAILABLE                    | TC-04-22                       | ✅ カバー済み  |
| Step 3   | capability = both → integratedRuntime 優先                    | **不足（Phase 4/6 に未定義）** | ❌ カバー不足  |
| Step 4   | runtimeResolver 成功 → adapter 生成へ                         | TC-04-10                       | ✅ カバー済み  |
| Step 4   | credential 取得失敗 → CREDENTIAL_MISSING                      | TC-04-20                       | ✅ カバー済み  |
| Step 4   | provider 解決不能 → PROVIDER_UNKNOWN                          | **不足（Phase 4/6 に未定義）** | ❌ カバー不足  |
| Step 4   | adapter 生成失敗 → ADAPTER_CREATION_FAILED                    | **不足（Phase 4/6 に未定義）** | ❌ カバー不足  |
| Step 5   | LLM 成功 → GeneratedResult 返却                               | TC-04-10, TC-04-01             | ✅ カバー済み  |
| Step 5   | CONTEXT_TOO_LARGE → エラー返却                                | TC-04-14, TC-06-02, TC-06-05   | ✅ カバー済み  |
| Step 5   | LLM_ERROR → エラー返却（retryable）                           | TC-06-12                       | ✅ カバー済み  |
| Step 5   | TIMEOUT（30秒超過）→ エラー返却                               | TC-04-12, TC-06-10, TC-06-11   | ✅ カバー済み  |
| Step 5   | RATE_LIMIT → エラー返却（retryAfter 付き）                    | TC-04-13                       | ✅ カバー済み  |

#### sender validation のコールバック Function Coverage（P41 / P48 対応）

v8 カバレッジプロバイダーはインライン arrow function を独立した関数としてカウントする（P41）。各ハンドラーで渡す `getAllowedWindows: () => [mainWindow]` コールバックを明示的に呼び出さないと Function Coverage が低下する。

- TC-04-30 のテストで `mockValidateIpcSender.mock.calls[0][2].getAllowedWindows()` を明示的に呼び出すことで対応済み（P48 対策）。
- 5 ハンドラー分（ReadFile / WriteFile / GetSelection / SendWithContext / DetectLanguage）すべてのコールバックを確認する必要がある。

---

### 2-2. `ChatEditService.ts`

**コード構造分析**

| メソッド                  | カバレッジ目標 | カバーすべき主要分岐                                                                |
| ------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| `sendWithContext`         | Line 95%以上   | validateSize 成功/失敗、isValidCommandType 成功/失敗、LLM 成功/失敗、catch ブランチ |
| `buildPrompt`             | Line 100%      | `buildPromptFromTemplate` 委譲（単純委譲のため 1 行）                               |
| `parseResponse`           | Line 90%以上   | コードブロックあり/なし、diff hunk 生成                                             |
| `findTargetContext`       | Line 90%以上   | targetContextId 一致/不一致（最初のコンテキストへのフォールバック）                 |
| `extractCodeFromResponse` | Line 90%以上   | コードブロック正規表現マッチあり/なし                                               |
| `calculateDiff`           | Line 100%      | original === generated（差分なし）/ 異なる（差分あり）の 2 ブランチ                 |

#### `sendWithContext` のブランチ詳細

Phase 5 実装計画書では `sendWithContext(request, adapter)` にシグネチャが変更される予定。変更後のカバレッジを評価する。

| 分岐                                              | 対応テスト                         | カバレッジ評価                                                    |
| ------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------- |
| `validateSize` → false → CONTEXT_TOO_LARGE        | TC-04-14, TC-06-02, TC-06-05       | ✅ カバー済み                                                     |
| `isValidCommandType` → false → INVALID_COMMAND    | TC-04-52（無効コマンド）           | ✅ カバー済み（isValidCommandType に "unknown" を渡すテストあり） |
| LLM success → `llmResponse.success = true`        | TC-04-10, TC-06-17, TC-06-18       | ✅ カバー済み                                                     |
| LLM failure → `llmResponse.success = false`       | TC-04-12, TC-04-13                 | ✅ カバー済み                                                     |
| catch → unknown exception                         | TC-06-12                           | ✅ カバー済み                                                     |
| `findTargetContext` で targetContextId 一致       | TC-04-10（targetContextId を設定） | ⚠️ 要確認（テストで targetContextId を明示的に設定しているか）    |
| `findTargetContext` で一致なし → contexts[0] 返却 | **不足（Phase 4/6 に未定義）**     | ❌ カバー不足                                                     |

#### `validateSize` の境界値テスト

| 境界値                                           | 対応テスト                   | 評価          |
| ------------------------------------------------ | ---------------------------- | ------------- |
| MAX_CONTEXT_SIZE ちょうど（102,400 bytes）→ true | TC-04-51                     | ✅ カバー済み |
| MAX_CONTEXT_SIZE - 1 byte → true                 | TC-06-05                     | ✅ カバー済み |
| MAX_CONTEXT_SIZE + 1 byte → false                | TC-04-14（101KB コンテンツ） | ✅ カバー済み |

---

### 2-3. `ContextBuilder.ts`

**コード構造分析**

| メソッド           | カバレッジ目標 | カバーすべき主要分岐                                                |
| ------------------ | -------------- | ------------------------------------------------------------------- |
| `build`            | Line 95%以上   | contexts が空配列、1 件、複数件                                     |
| `buildFileSection` | Line 95%以上   | selection あり（selectedText 使用）、selection なし（content 使用） |
| `calculateSize`    | Line 100%      | 純粋計算（分岐なし）                                                |
| `validateSize`     | Line 100%      | true/false の 2 値（calculateSize を呼ぶのみ）                      |

#### ブランチ詳細

| 分岐                                   | 対応テスト                 | カバレッジ評価 |
| -------------------------------------- | -------------------------- | -------------- |
| `contexts.length === 0` → `""` 返却    | TC-06-06（パターン A）     | ✅ カバー済み  |
| contexts が 1 件 → 単一セクション      | TC-04-01（基本正常系）     | ✅ カバー済み  |
| contexts が複数件 → 複数セクション     | TC-06-01（5件）            | ✅ カバー済み  |
| selection あり → `selectedText` を使用 | TC-04-01, TC-06-01         | ✅ カバー済み  |
| selection なし → `content` を使用      | TC-04-51（selection なし） | ✅ カバー済み  |
| calculateSize → 複数ファイルの合計     | TC-06-01                   | ✅ カバー済み  |
| validateSize → true（制限内）          | TC-04-51（50KB）           | ✅ カバー済み  |
| validateSize → false（超過）           | TC-04-14, TC-06-02         | ✅ カバー済み  |

**注意点（P41 対応）**: `calculateSize` の `reduce` コールバック `(total, ctx) => {...}` は v8 カバレッジプロバイダーがインライン関数としてカウントする可能性がある。複数ファイルコンテキストを使用するテスト（TC-06-01 等）で必ず実行されることを確認する。

---

### 2-4. `prompts.ts`

**コード構造分析**

| 関数                      | カバレッジ目標 | カバーすべき主要分岐                                                                                                              |
| ------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `isValidCommandType`      | Line 100%      | 有効コマンド 5 種（true）、無効コマンド（false）                                                                                  |
| `buildPromptFromTemplate` | Line 100%      | custom かつ instruction あり（replace 実行）、custom かつ instruction なし（replace スキップ）、custom 以外（instruction 不使用） |

#### `buildPromptFromTemplate` の分岐詳細

| 分岐                                               | 対応テスト                             | カバレッジ評価 |
| -------------------------------------------------- | -------------------------------------- | -------------- |
| `commandType === "custom" && instruction` → true   | TC-04-52（instruction あり）           | ✅ カバー済み  |
| `commandType === "custom" && !instruction` → false | TC-06-20（instruction なし）           | ✅ カバー済み  |
| `commandType !== "custom"` → instruction 不使用    | TC-04-52（continue 等 4 種）           | ✅ カバー済み  |
| `continue` テンプレート置換                        | TC-06-16                               | ✅ カバー済み  |
| `refactor` テンプレート置換                        | TC-06-17                               | ✅ カバー済み  |
| `generate-test` テンプレート置換                   | TC-06-18, TC-04-52                     | ✅ カバー済み  |
| `add-comment` テンプレート置換                     | TC-06-19                               | ✅ カバー済み  |
| `custom` + instruction あり → 置換済み             | TC-04-52, TC-06-20（instruction あり） | ✅ カバー済み  |

**不足箇所**: `custom` コマンドで `instruction` が `undefined` の場合に `{instruction}` が未置換のまま残るかどうかの確認が TC-06-20 のテストケースとなっており、バグ確認テストとして重要。現状の `prompts.ts` L88 の実装では `instruction` が falsy の場合に `replace` が実行されないため、テンプレートに `{instruction}` が残る可能性があり、Function Coverage とは別にバグ検出の役割を持つ。

---

## 3. Phase 4 + Phase 6 のテストカバー率評価

Phase 4（19件）+ Phase 6（20件）= 合計 39件で以下の要件を満たしているかを確認する。

### 3-1. 全エラーコードのカバレッジ確認

| エラーコード                         | 対応テスト                                                | カバー状況                                                                       |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| INVALID_SELECTION                    | TC-04-02, TC-04-11, TC-06-08, TC-06-09                    | ✅ 4件以上でカバー                                                               |
| TIMEOUT                              | TC-04-12, TC-06-10, TC-06-11                              | ✅ 3件でカバー                                                                   |
| RATE_LIMIT / RATE_LIMITED            | TC-04-13                                                  | ✅ 1件でカバー                                                                   |
| CONTEXT_TOO_LARGE                    | TC-04-14, TC-06-02, TC-06-05                              | ✅ 3件でカバー                                                                   |
| CREDENTIAL_MISSING / MISSING_API_KEY | TC-04-20                                                  | ✅ 1件でカバー                                                                   |
| PERMISSION_DENIED                    | TC-04-30（sender validation）、TC-04-31（path traversal） | ✅ 2件でカバー                                                                   |
| UNAUTHORIZED                         | TC-04-30（不正 sender）                                   | ✅ 1件でカバー（PERMISSION_DENIED と UNAUTHORIZED は実装依存で同一の場合もある） |
| INVALID_PATH                         | TC-04-31（path traversal）                                | ✅ 1件でカバー                                                                   |
| CAPABILITY_UNAVAILABLE               | TC-04-21, TC-04-22                                        | ✅ 2件でカバー                                                                   |
| PROVIDER_UNKNOWN                     | **不足（Phase 4/6 に未定義）**                            | ❌ カバー不足                                                                    |
| ADAPTER_CREATION_FAILED              | **不足（Phase 4/6 に未定義）**                            | ❌ カバー不足                                                                    |
| LLM_ERROR                            | TC-06-12                                                  | ✅ 1件でカバー                                                                   |
| INVALID_COMMAND                      | TC-04-52（isValidCommandType false）                      | ✅ 1件でカバー                                                                   |

### 3-2. 全ブランチ（capability 値）のカバレッジ確認

| capability 値     | 対応テスト         | カバー状況    |
| ----------------- | ------------------ | ------------- |
| integratedRuntime | TC-04-10, TC-04-01 | ✅ カバー済み |
| terminalSurface   | TC-04-21           | ✅ カバー済み |
| both              | **不足（未定義）** | ❌ カバー不足 |
| none              | TC-04-22           | ✅ カバー済み |

### 3-3. 全コマンドタイプのカバレッジ確認

| コマンドタイプ | 対応テスト（Phase 4 + 6）              | カバー状況    |
| -------------- | -------------------------------------- | ------------- |
| continue       | TC-04-52, TC-06-16                     | ✅ カバー済み |
| refactor       | TC-04-10, TC-04-02, TC-06-08, TC-06-17 | ✅ カバー済み |
| generate-test  | TC-04-52, TC-06-18                     | ✅ カバー済み |
| add-comment    | TC-06-07, TC-06-19                     | ✅ カバー済み |
| custom         | TC-04-52, TC-06-20                     | ✅ カバー済み |

---

## 4. カバレッジ不足箇所と補完策

### 4-1. 不足箇所一覧

| #   | 不足箇所                                                                          | 不足の種別                        | 優先度 |
| --- | --------------------------------------------------------------------------------- | --------------------------------- | ------ |
| 1   | capability = `both` ブランチ                                                      | Branch Coverage 不足              | P1     |
| 2   | PROVIDER_UNKNOWN エラーコード                                                     | Branch / Line Coverage 不足       | P1     |
| 3   | ADAPTER_CREATION_FAILED エラーコード                                              | Branch / Line Coverage 不足       | P1     |
| 4   | `findTargetContext` で targetContextId が一致しない（contexts[0] フォールバック） | Branch Coverage 不足              | P2     |
| 5   | 5 ハンドラー全ての `getAllowedWindows` コールバック呼び出し                       | Function Coverage 不足（P41/P48） | P2     |

### 4-2. 補完テストケース提案

#### 補完 TC-07-01: capability = `both` → integratedRuntime を優先する

```
対象: handleSendWithContext（capability = both のブランチ）
前提: capabilityResolver.resolve('chat-edit') が "both" を返す。
      runtimeResolver が有効な adapter を返す。
      LLM adapter が成功レスポンスを返す。
入力: 正常な SendWithContextRequest（selection あり、command: "refactor"）
期待: integratedRuntime 経路が実行される（terminalSurface ではない）。
      { success: true, result: { ... } } が返る。
優先度: P1（Branch Coverage を確保するため必須）
```

#### 補完 TC-07-02: runtimeResolver.resolve → PROVIDER_UNKNOWN エラー

```
対象: handleSendWithContext（PROVIDER_UNKNOWN のブランチ）
前提: capabilityResolver が "integratedRuntime" を返す。
      runtimeResolver.resolve が { success: false, error: { code: "PROVIDER_UNKNOWN", message: "..." } } を返す。
入力: 正常な SendWithContextRequest
期待: { success: false, error: { code: "PROVIDER_UNKNOWN", retryable: false, ... } } を返す。
      LLM adapter は呼び出されない。
優先度: P1
```

#### 補完 TC-07-03: LLMAdapterFactory → ADAPTER_CREATION_FAILED エラー

```
対象: handleSendWithContext（ADAPTER_CREATION_FAILED のブランチ）
前提: capabilityResolver が "integratedRuntime" を返す。
      runtimeResolver は PROVIDER_UNKNOWN は返さないが、adapter 生成段階で失敗する。
入力: 正常な SendWithContextRequest
期待: { success: false, error: { code: "ADAPTER_CREATION_FAILED", retryable: false, ... } } を返す。
      LLM adapter は呼び出されない。
優先度: P1
```

#### 補完 TC-07-04: findTargetContext で targetContextId が一致しない → contexts[0] フォールバック

```
対象: ChatEditService.findTargetContext（フォールバック分岐）
前提: request.command.targetContextId に contexts に存在しないパスを設定する。
      request.contexts[0] のファイルパスは targetContextId と異なる。
入力: request.contexts = [{ filePath: "/other/file.ts", content: "..." }]
      request.command.targetContextId = "/target/file.ts"
期待: parseResponse に contexts[0] の filePath と content が渡される（フォールバック確認）。
      generatedResult.targetFilePath が "/other/file.ts" になる。
優先度: P2
```

#### 補完 TC-07-05: 全 5 ハンドラーの getAllowedWindows コールバック確認（P41/P48 対応）

```
対象: handleReadFile, handleWriteFile, handleGetSelection, handleDetectLanguage の各ハンドラーの getAllowedWindows コールバック
前提: validateIpcSender をモック化し、各ハンドラーで呼び出す。
実施: 各テストで mockValidateIpcSender.mock.calls[0][2].getAllowedWindows() を明示的に呼び出す。
期待: [mainWindow] が返る（コールバックが実行される = Function Coverage 確保）。
優先度: P2（TC-04-30 は handleSendWithContext のみカバー済みのため、残り 4 ハンドラー分を補完）
```

---

## 5. カバレッジ未達の場合の対処方針

### Phase 6 に戻す判定基準

以下のいずれかが確認された場合、Phase 6 に戻してテストを追加する。

| 判定条件                                                   | 対処                                         |
| ---------------------------------------------------------- | -------------------------------------------- |
| Line Coverage が 80%（最低基準）を下回るファイルがある     | Phase 6 に戻し、不足ラインを特定して追加     |
| Branch Coverage が 60%（最低基準）を下回るファイルがある   | Phase 6 に戻し、未カバーブランチのテスト追加 |
| Function Coverage が 80%（最低基準）を下回るファイルがある | Phase 6 に戻し、未テスト関数のカバーを追加   |

### Phase 7 での追加対処（Phase 6 に戻さない軽微な場合）

不足数が 3 件以内かつ最低基準（80% / 60% / 80%）を満たしている場合は、Phase 7 内で補完テストを追加する（Section 4-2 の補完 TC-07-xx が該当）。

- 補完 TC-07-01〜03（P1）: `capability = both` / PROVIDER_UNKNOWN / ADAPTER_CREATION_FAILED → Phase 8 前に追加
- 補完 TC-07-04〜05（P2）: findTargetContext フォールバック / getAllowedWindows コールバック → Phase 8 後でも可

### カバレッジ計測コマンド

```bash
# apps/desktop パッケージ配下でテストを実行（P40 対策: ディレクトリ指定必須）
cd apps/desktop && pnpm vitest run --coverage \
  src/main/handlers/__tests__/chatEditHandlers*.test.ts \
  src/main/services/chat-edit/__tests__/*.test.ts
```

**v8 カバレッジプロバイダー使用時の注意（P41）**:

- インライン arrow function（例: `() => [mainWindow]`、`reduce` のコールバック）は独立した関数としてカウントされる。
- Function Coverage が低下している場合は、これらのコールバックが実際に呼び出されているかを確認する。
- `vitest.config.ts` の `provider: 'v8'` が設定されている場合に発生する。

---

## 6. カバレッジ確認結果サマリー

### 達成見込み評価

Phase 4（19件）+ Phase 6（20件）= 合計 39件のテストが実装された場合の、ファイル別カバレッジ見込みを評価する。

| ファイル              | Line Coverage（見込み） | Branch Coverage（見込み） | Function Coverage（見込み） | 目標達成    |
| --------------------- | ----------------------- | ------------------------- | --------------------------- | ----------- |
| `chatEditHandlers.ts` | 85〜90%                 | 65〜70%                   | 80〜85%                     | ⚠️ 要補完   |
| `ChatEditService.ts`  | 90〜95%                 | 75〜80%                   | 90〜95%                     | ✅ 目標達成 |
| `ContextBuilder.ts`   | 95〜100%                | 90〜95%                   | 100%                        | ✅ 目標達成 |
| `prompts.ts`          | 100%                    | 85〜90%                   | 100%                        | ✅ 目標達成 |

**評価根拠**:

- `chatEditHandlers.ts` は capability = `both` / PROVIDER_UNKNOWN / ADAPTER_CREATION_FAILED の 3 ブランチが未カバーのため、Branch Coverage が若干不足する可能性がある。補完 TC-07-01〜03 を追加することで 70% 目標を達成できる見込み。
- `ChatEditService.ts` は `findTargetContext` のフォールバック分岐が不足しているが、他の分岐カバレッジが充実しているため 70% は超える見込み。
- `ContextBuilder.ts` と `prompts.ts` は Pure Function が多く、テストケースが充実しているため目標を十分達成できる見込み。

### Phase 8（リファクタリング）への進行判定

**判定: Phase 8 へ進行可能（条件付き）**

条件: 補完テスト TC-07-01〜03（P1）を Phase 8 前に追加し、全ファイルで最低基準（Line 80%、Branch 60%、Function 80%）を達成していることを実際のカバレッジ計測で確認すること。

補完 TC-07-01〜03 を追加した場合、`chatEditHandlers.ts` のカバレッジが目標（Line 90%、Branch 70%、Function 90%）に到達する見込みがある。補完 TC-07-04〜05（P2）は Phase 8 後でも可とする。

### 特記事項

1. **P41 対策の実施確認**: 各テストで `getAllowedWindows` コールバックを明示的に呼び出していないと、Function Coverage が大幅に低下する（P41 事例では 44.44%まで低下した）。TC-04-30 以外のハンドラーテストでも補完 TC-07-05 の実施を推奨する。

2. **Phase 5 実装確認が前提**: 本カバレッジ計画は Phase 5 実装計画書に基づく想定実装を前提としている。Phase 5 で実際に実装されたコードが計画と異なる場合（例: stub adapter が残っている、capability チェックの 5 ステップが異なる実装になっている）、カバレッジ目標の再評価が必要になる。

3. **既存テスト（TASK-WCE-WORKSPACE-001）との統合**: `llm-workspace-chat-edit.md` の記録によれば、前タスク（TASK-WCE-WORKSPACE-001）で Line 95%、Branch 90%、Function 100% が達成済みの実績がある。本タスクの変更（ChatEditService シグネチャ変更、capability チェック追加、sender validation 追加）によりカバレッジが低下する可能性があるため、既存テストとの整合性確認が必要。

---

## 付録: テストケース全件サマリー

### Phase 4 テストケース（19件）

| テストID | 対象ファイル                       | エラーコード / ブランチ               |
| -------- | ---------------------------------- | ------------------------------------- |
| TC-04-01 | chatEditHandlers, ContextBuilder   | selection あり（正常系）              |
| TC-04-02 | chatEditHandlers                   | INVALID_SELECTION（null）             |
| TC-04-03 | chatEditHandlers                   | sender validation（get-selection）    |
| TC-04-10 | chatEditHandlers + ChatEditService | integratedRuntime 正常系              |
| TC-04-11 | chatEditHandlers                   | integratedRuntime + INVALID_SELECTION |
| TC-04-12 | chatEditHandlers                   | TIMEOUT（30秒超過）                   |
| TC-04-13 | chatEditHandlers                   | RATE_LIMIT                            |
| TC-04-14 | chatEditHandlers + ContextBuilder  | CONTEXT_TOO_LARGE                     |
| TC-04-20 | chatEditHandlers                   | CREDENTIAL_MISSING                    |
| TC-04-21 | chatEditHandlers                   | terminalSurface → HandoffContext      |
| TC-04-22 | chatEditHandlers                   | capability = none                     |
| TC-04-30 | chatEditHandlers                   | 不正 sender → UNAUTHORIZED            |
| TC-04-31 | chatEditHandlers                   | path traversal → INVALID_PATH         |
| TC-04-32 | chatEditHandlers                   | secret masking                        |
| TC-04-40 | chatEditApi + chatEditHandlers     | IPC 引数型一致（MINOR-02）            |
| TC-04-41 | chatEditApi + chatEditHandlers     | IPC チャンネル名定数                  |
| TC-04-50 | chatEditHandlers                   | workspacePath 未指定デフォルト動作    |
| TC-04-51 | ContextBuilder                     | サイズ制限境界値                      |
| TC-04-52 | prompts.ts + ChatEditService       | 5コマンドタイプ全件                   |

### Phase 6 テストケース（20件）

| テストID | 対象ファイル                      | エラーコード / ブランチ                            |
| -------- | --------------------------------- | -------------------------------------------------- |
| TC-06-01 | ContextBuilder                    | 複数ファイル・selection あり                       |
| TC-06-02 | chatEditHandlers + ContextBuilder | CONTEXT_TOO_LARGE（複数ファイル）                  |
| TC-06-03 | chatEditHandlers                  | バイナリファイル（仕様確認）                       |
| TC-06-04 | ChatEditService + ContextBuilder  | 8000 tokens 超過（LLM 層の責務）                   |
| TC-06-05 | ContextBuilder                    | 境界値（MAX_CONTEXT_SIZE - 1 byte）                |
| TC-06-06 | ContextBuilder + chatEditHandlers | 空コンテキスト / 空配列                            |
| TC-06-07 | chatEditHandlers + ContextBuilder | selection 不要コマンド                             |
| TC-06-08 | chatEditHandlers                  | INVALID_SELECTION（refactor）                      |
| TC-06-09 | chatEditHandlers                  | INVALID_SELECTION（whitespace のみ）               |
| TC-06-10 | chatEditHandlers                  | TIMEOUT 境界値（30秒ちょうど・タイムアウトしない） |
| TC-06-11 | chatEditHandlers                  | TIMEOUT（30秒 + 1ms）                              |
| TC-06-12 | ChatEditService                   | ネットワーク切断 → LLM_ERROR                       |
| TC-06-13 | chatEditHandlers                  | concurrent リクエスト（仕様確認）                  |
| TC-06-14 | chatEditHandlers                  | symlink workspacePath（仕様確認）                  |
| TC-06-15 | chatEditHandlers                  | workspacePath 存在しない                           |
| TC-06-16 | ChatEditService + prompts.ts      | continue コマンド                                  |
| TC-06-17 | ChatEditService + prompts.ts      | refactor コマンド + diff hunk                      |
| TC-06-18 | ChatEditService + prompts.ts      | generate-test コマンド                             |
| TC-06-19 | ChatEditService + prompts.ts      | add-comment コマンド                               |
| TC-06-20 | prompts.ts                        | custom コマンド + instruction なし                 |

### Phase 7 補完テストケース（5件、条件付き追加）

| テストID | 優先度 | 対象ファイル     | 補完内容                                                         |
| -------- | ------ | ---------------- | ---------------------------------------------------------------- |
| TC-07-01 | P1     | chatEditHandlers | capability = `both` ブランチカバー                               |
| TC-07-02 | P1     | chatEditHandlers | PROVIDER_UNKNOWN エラーコードカバー                              |
| TC-07-03 | P1     | chatEditHandlers | ADAPTER_CREATION_FAILED エラーコードカバー                       |
| TC-07-04 | P2     | ChatEditService  | findTargetContext フォールバック分岐カバー                       |
| TC-07-05 | P2     | chatEditHandlers | 全 5 ハンドラーの getAllowedWindows コールバック（P41/P48 対応） |
