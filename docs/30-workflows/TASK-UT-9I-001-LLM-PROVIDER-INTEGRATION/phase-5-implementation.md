# Phase 5: 実装

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 5                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 4 完了（TDD Red 確立）                |
| 後続Phase  | Phase 6                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

TDD Green を達成する。Phase 4 で定義したテストを全て通過させる実装を行う。

## 新規作成ファイル一覧

| ファイルパス                                                        | 役割                     |
| ------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/llm/LLMClient.ts`                   | LLMクライアントFacade    |
| `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts` | Anthropic API プロバイダ |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`        | stub 実装の委譲先        |

## 修正対象ファイル一覧

| ファイルパス                                                 | 修正内容                                 |
| ------------------------------------------------------------ | ---------------------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts` | stub 実装を `LLMClient` 委譲に置換       |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | エラー正規化（`normalizeDocError` 追加） |

## 実行タスク

1. `LLMDocQueryAdapter.ts` の stub 実装を `LLMClient` へ委譲する
2. `LLMClient.ts` と `AnthropicProvider.ts` を current state に合わせて調整する
3. `skillHandlers.ts` にエラー正規化（`normalizeDocError`）を追加する
4. 型チェックを実行する

## 実行手順

```bash
# Step 1: 実装後の型チェック
pnpm --filter @repo/desktop exec tsc --noEmit

# Step 2: テスト実行（Green確認）
pnpm --filter @repo/desktop exec vitest run src/main/services/llm/__tests__/LLMClient.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.docs.test.ts

# Step 3: 既存テストの回帰確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillDocGenerator.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
```

## 実装方針

### LLMClient.ts の実装方針

- `ILLMClient` インターフェースを実装する
- `LLMQueryResult` 型（Phase 2 設計）を返す
- Anthropic SDK の `messages.create()` を呼び出す
- タイムアウトは `Promise.race()` で実装（既存 `LLM_TIMEOUT_MS` 定数を活用）
- リトライは指数バックオフ（1s/2s/4s）で最大3回
- リトライ対象: `RATE_LIMIT` / `SERVER_ERROR` / `TIMEOUT` / `NETWORK_ERROR`

### AnthropicProvider.ts の実装方針

- Anthropic SDK の `Anthropic` クライアントをラップ
- HTTP エラーコードを `DocErrorCode` へマッピング
- APIキーは `LLMClient` から受け取り、未設定時は `API_KEY_MISSING`
- `sanitizeErrorMessage()` でスタックトレース・APIキーをマスク

### LLMDocQueryAdapter.ts の委譲方針

```typescript
const adapter = new LLMDocQueryAdapter(
  () => authKeyService.getKey(),
  "anthropic",
);
const queryFn: LLMQueryFn = async (prompt: string) => {
  const result = await adapter.query(prompt);
  if (result.success && result.data !== undefined) {
    return { content: result.data };
  }
  throw new Error(result.error?.message ?? "LLM query failed");
};
const skillDocGenerator = new SkillDocGeneratorCls(queryFn, skillFileManager);

// 委譲先の実装イメージ
const llmClient = new LLMClient({
  provider: "anthropic",
  apiKey: authKeyService.getKey(),
  model: "claude-haiku-4-5-20251001",
  timeoutMs: LLM_TIMEOUT_MS,
  maxRetries: 3,
});
```

### skillHandlers.ts の修正方針

- `normalizeDocError` 関数を追加する
- 既存の `catch` ブロックで使用する
- 成功パスの IPC 返却形式は変更しない（後方互換性維持）

## 注意事項

- `LLMDocQueryAdapter` の stub 実装は完全に削除する（`// TODO` コメントも残さない）
- 認証キーは `authKeyService.getKey()` 経由で取得し、未設定時は呼び出し時に検知する
- `LLMQueryFn` 型（関数型注入）の契約は維持する（`SkillDocGenerator` への DI 変更なし）
- SKILL.md ルール: `.claude` 正本は変更なし（Main Process コードのみ変更）

## 統合テスト連携

- SubAgent-A: `LLMDocQueryAdapter.ts` / `LLMClient.ts` / `AnthropicProvider.ts` の調整を担当
- SubAgent-B: `skillHandlers.ts` の修正を担当

## 参照資料

- `phase-2-design.md`: 実装トポロジと型設計
- `phase-4-test-creation.md`: TC-01〜TC-11 と Red 条件
- `outputs/phase-3/gate-decision.md`: 実装着手前の合否判定

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                                       |
| ------------ | ------------------------------------------------------------------ |
| セキュリティ | APIキーがエラーメッセージ・ログに漏洩していないか                  |
| 型安全性     | `DocErrorCode` 型が全エラーケースを網羅しているか                  |
| 既存テスト   | `SkillDocGenerator.test.ts` が引き続きグリーンか                   |
| P42準拠      | `prompt` の空文字列バリデーションが LLMClient でも実施されているか |

## 成果物

- `apps/desktop/src/main/services/llm/LLMClient.ts`（コード成果物）
- `apps/desktop/src/main/services/llm/providers/AnthropicProvider.ts`（コード成果物）
- `outputs/phase-5/implementation-summary.md`: 実装サマリー（変更ファイル一覧・差分概要）
- `outputs/phase-5/changed-files.md`: 変更ファイル一覧

## 完了条件

- [ ] `LLMClient.ts` が実装され、TC-01〜TC-07 が全て PASS している
- [ ] `AnthropicProvider.ts` が実装されている
- [ ] `LLMDocQueryAdapter` の stub 実装が削除・置換されている
- [ ] `skillHandlers.ts` に `normalizeDocError` が追加されている
- [ ] `pnpm --filter @repo/desktop exec tsc --noEmit` がエラー0
- [ ] `skillHandlers.docs.test.ts` の TC-08〜TC-11 が全て PASS している

## タスク100%実行確認【必須】

- [ ] `LLMClient` / `AnthropicProvider` の wiring 完了
- [ ] `LLMClient.ts` 実装完了
- [ ] `AnthropicProvider.ts` 実装完了
- [ ] `LLMDocQueryAdapter` stub 置換完了
- [ ] `skillHandlers.ts` normalizeDocError 追加完了
- [ ] 型チェック PASS
- [ ] 全テスト（TC-01〜TC-11）GREEN
- [ ] 実装サマリー出力完了

## 次Phase

Phase 6（テスト拡充）へ進む。
