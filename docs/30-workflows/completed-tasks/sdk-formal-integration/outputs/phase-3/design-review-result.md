# Phase 3: 設計レビュー結果 - Agent SDK 正式統合

## メタ情報

| 項目     | 内容                                            |
| -------- | ----------------------------------------------- |
| タスクID | TASK-9B-I-SDK-FORMAL-INTEGRATION                |
| Phase    | 3（設計レビュー）                               |
| 作成日   | 2026-02-12                                      |
| 作成者   | Claude Agent (Phase 1-3)                        |
| 前Phase  | Phase 2 設計                                    |
| 参照資料 | Phase 2 architecture-design.md, type-mapping.md |

---

## ゲート判定

### 結果: PASS

設計は5つの評価観点すべてで合格。Phase 4（テスト作成）に進行可能。

---

## 1. 型定義の正確性

### 評価: PASS

#### 検証項目

| 項目                              | 結果 | 詳細                                                                                                                     |
| --------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------ |
| query() の引数型                  | OK   | `QueryFunctionArgs` は SDK 実 API の `{ prompt: string, options?: Options }` と整合                                      |
| query() の戻り値型                | OK   | `QueryConversation` の `stream(): AsyncIterable<unknown>` は実際の使用パターンと一致                                     |
| QueryFunctionOptions のプロパティ | OK   | `tools`, `permissionMode`, `signal`, `apiKey` が SDK 実 API の Options と整合                                            |
| permissionMode の値               | OK   | `"auto" \| "ask" \| "deny" \| "default"` は SDK 実 API と一致（現行の `"plan" \| "bypassPermissions"` は不正値）         |
| 型名の衝突回避                    | OK   | 既存の `QueryOptions`（ClaudeSDKクラスメソッド用）と新設の `QueryFunctionOptions`（query関数用）は名前が異なり衝突しない |

#### 詳細検証

**query() 引数**:

- SDK実API: `{ prompt: string | AsyncIterable<SDKUserMessage>; options?: Options }`
- 型宣言: `{ prompt: string; options?: QueryFunctionOptions }`
- `AsyncIterable<SDKUserMessage>` を省略しているのは適切（SkillExecutor は文字列プロンプトのみ使用するため）

**query() 戻り値**:

- SDK実API: `Query extends AsyncGenerator<SDKMessage, void>` + `.stream()` メソッド
- 型宣言: `QueryConversation` with `stream(): AsyncIterable<unknown>`
- `stream()` の要素型を `unknown` にしているのは適切（既存の `handleStreamMessage` が `message: unknown` を受け取り、`isValidSDKMessage()` で型ガードする設計と一致）

---

## 2. 後方互換性

### 評価: PASS

#### 検証項目

| 項目                                              | 結果 | 詳細                                                                                    |
| ------------------------------------------------- | ---- | --------------------------------------------------------------------------------------- |
| ClaudeSDK default export                          | 不変 | `agent-client.ts` への影響ゼロ。既存の `import ClaudeSDK from "..."` が型解決に成功する |
| 既存 QueryOptions 型                              | 不変 | ClaudeSDK クラスメソッド用の `QueryOptions` は変更しない                                |
| 既存 QueryMessage 型                              | 不変 | 変更しない                                                                              |
| 既存 QueryResult 型                               | 不変 | 変更しない                                                                              |
| SkillExecutor.callSDKQuery の戻り値型             | 互換 | `{ stream: () => AsyncIterable<SDKMessage> }` のまま                                    |
| SkillExecutor.executeWithRetry のインターフェース | 不変 | コード変更なし                                                                          |

#### agent-client.ts 互換性

`agent-client.ts` は `import ClaudeSDK from "@anthropic-ai/claude-agent-sdk"` を使用しており、型宣言の `export default class ClaudeSDK` は変更しないため、コンパイル・ランタイムともに影響なし。これは設計の最重要制約であり、正しく守られている。

#### AgentExecutor.ts 互換性

`AgentExecutor.ts` は `import { query } from "@anthropic-ai/claude-agent-sdk"` を使用しており、型宣言に `export function query` が追加されることで型解決が改善する方向の変更。ただし AgentExecutor.ts は `tsconfig.json` の `exclude` に含まれているため、実質的な影響はない。AgentExecutor.ts のコード自体には触れない設計で問題ない。

---

## 3. 動的 import 型付けの妥当性

### 評価: PASS

#### 検証項目

| 項目                       | 結果 | 詳細                                                                                    |
| -------------------------- | ---- | --------------------------------------------------------------------------------------- |
| `await import()` の型解決  | OK   | TypeScript は `declare module` の型宣言を `import()` 式にも適用する                     |
| 分割代入 `const { query }` | OK   | 名前付きエクスポートとして `query` が型宣言に定義されていれば、分割代入で型が推論される |
| `as any` 除去後の型安全性  | OK   | `query` は `(args: QueryFunctionArgs) => QueryConversation` として推論される            |
| ランタイム動作への影響     | なし | `as any` は TypeScript のコンパイル時のみの処理であり、除去してもランタイム動作は不変   |

#### 技術的根拠

TypeScript の `import()` 式（dynamic import）は、`declare module` で宣言されたモジュールの型情報を使って型推論を行う。以下のコードは型安全に動作する:

```typescript
// 型宣言に export function query(args: QueryFunctionArgs): QueryConversation; がある場合
const { query } = await import("@anthropic-ai/claude-agent-sdk");
// → query: (args: QueryFunctionArgs) => QueryConversation として推論される
```

これは TypeScript の標準的な動作であり、特殊な設定や追加の型アノテーションは不要。

---

## 4. 既存テストとの互換性

### 評価: PASS

#### 検証項目

| 項目                                     | 結果 | 詳細                                                                                                                          |
| ---------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| テストモック形式                         | 互換 | 全テストが `vi.mock("@anthropic-ai/claude-agent-sdk", () => ({ query: ... }))` でモック化。型宣言変更はモック解決に影響しない |
| mockQuery の引数型                       | 互換 | テストモックは `(args: unknown)` または `vi.fn()` で定義されており、`QueryFunctionArgs` の型チェックには影響されない          |
| mockStreamGenerator                      | 互換 | `stream()` メソッドの戻り値をモック化しており、`QueryConversation` 型との互換性あり                                           |
| SkillExecutor インスタンス生成           | 互換 | コンストラクタ引数に変更なし                                                                                                  |
| SkillExecutionRequest / SkillMetadata 型 | 互換 | 変更なし                                                                                                                      |

#### 全テストファイルの影響分析

| テストファイル                      | モック形式                         | 影響 | 理由                   |
| ----------------------------------- | ---------------------------------- | ---- | ---------------------- |
| `SkillExecutor.test.ts`             | `query: (args) => mockQuery(args)` | なし | vi.mock は型宣言と独立 |
| `SkillExecutor.auth.test.ts`        | `query: (args) => mockQuery(args)` | なし | 同上                   |
| `SkillExecutor.retry.test.ts`       | `query: (args) => mockQuery(args)` | なし | 同上                   |
| `SkillExecutor.integration.test.ts` | `query: vi.fn(...)`                | なし | 同上                   |
| `SkillExecutor.permission.test.ts`  | `query: vi.fn(...)`                | なし | 同上                   |
| `SkillService.delegate.test.ts`     | `query: vi.fn(...)`                | なし | 同上                   |

---

## 5. スコープ遵守

### 評価: PASS

#### 検証項目

| 項目                                             | 結果 | 詳細                                             |
| ------------------------------------------------ | ---- | ------------------------------------------------ |
| 変更対象が SkillExecutor.ts と型宣言ファイルのみ | OK   | 他のファイルへのコード変更は設計に含まれていない |
| AgentExecutor.ts への変更がない                  | OK   | 明示的に「触れない」と設計されている             |
| agent-client.ts への変更がない                   | OK   | ClaudeSDK default export 維持により影響なし      |
| @repo/shared の QueryOptions 型への変更がない    | OK   | 設計に含まれていない                             |
| SDK の機能追加が含まれていない                   | OK   | 型安全化のみ                                     |
| ビジネスロジックの変更がない                     | OK   | `as any` 除去と permissionMode 型修正のみ        |
| 他ファイル（PromptOptimizer等）の変更がない      | OK   | スコープ外として明記                             |

#### スコープ外項目の確認

設計が以下のスコープ外項目に触れていないことを確認:

- SkillExecutor のビジネスロジック変更: 触れていない
- AgentExecutor.ts の `@ts-expect-error` 除去: 触れていない
- PromptOptimizer.ts, SkillImprover.ts, SkillAnalyzer.ts の `require()` パターン: 触れていない
- SDK のインストールやバージョンアップ: 触れていない

---

## 6. 追加評価

### 6.1 SDKQueryOptions の permissionMode 修正について

**変更**: `"default" | "plan" | "bypassPermissions"` → `"auto" | "ask" | "deny" | "default"`

**評価**: 適切。

理由:

1. `"plan"` と `"bypassPermissions"` は SDK 実 API に存在しない値
2. SkillExecutor の `callSDKQuery` で実際に渡されるのは `"default"` のみ
3. 型を SDK 実 API に合わせることで、将来の permissionMode 変更時にコンパイルエラーで検出可能になる

### 6.2 stream() の要素型を unknown にする設計について

**評価**: 適切。

理由:

1. SDK 実 API の `SDKMessage` は複雑な Union 型であり、型宣言ファイルで完全に再現するのは過剰
2. SkillExecutor は独自の `isValidSDKMessage()` 型ガードで SDK メッセージを処理する設計
3. `handleStreamMessage(executionId: string, message: unknown)` が既に `unknown` を受け取る設計
4. 将来 SDK がインストールされた際に、型宣言ファイルを削除するだけで SDK 本体の型に移行可能

### 6.3 実装のシンプルさについて

**評価**: 優良。

変更箇所が2ファイル・4箇所に限定されており、リスクが低い:

1. 型宣言ファイルへの追加（新規型+関数宣言）
2. SkillExecutor.ts の `as any` 除去（1行変更）
3. SkillExecutor.ts の eslint-disable コメント除去（1行削除）
4. SkillExecutor.ts の SDKQueryOptions permissionMode 修正（1行変更）

---

## 7. レビュー指摘事項

### 指摘なし

設計は全5観点で合格しており、Phase 4 に進行可能な品質。

---

## 8. 判定サマリ

| 評価観点                      | 判定 | 備考                                          |
| ----------------------------- | ---- | --------------------------------------------- |
| 1. 型定義の正確性             | PASS | SDK 実 API と整合、型名衝突なし               |
| 2. 後方互換性                 | PASS | 既存の default export, 型定義を一切変更しない |
| 3. 動的 import 型付けの妥当性 | PASS | TypeScript 標準の型推論メカニズムに依拠       |
| 4. 既存テストとの互換性       | PASS | vi.mock は型宣言と独立、全6テスト互換         |
| 5. スコープ遵守               | PASS | 変更は2ファイル・4箇所に限定                  |

### 最終判定: PASS -- Phase 4 へ進行

---

## 9. 次 Phase への申し送り

### Phase 4（テスト作成）への留意事項

1. **型安全性テスト**: `pnpm typecheck` で SkillExecutor.ts のコンパイル成功を確認する
2. **既存テスト**: 全6テストファイルの PASS を確認する（変更は不要のはず）
3. **permissionMode 変更の影響確認**: `callSDKQuery` に `"plan"` や `"bypassPermissions"` を渡す箇所がないことを `grep` で確認する

### Phase 5（実装）への留意事項

1. **実装順序を厳守**: 型宣言ファイル追加 → SkillExecutor.ts 変更 の順序で実施（逆順だと一時的に型エラーが発生）
2. **コメント更新**: callSDKQuery メソッドの上のコメント（`NOTE: SDK型定義が不完全なため、anyキャストを使用`）を更新する
