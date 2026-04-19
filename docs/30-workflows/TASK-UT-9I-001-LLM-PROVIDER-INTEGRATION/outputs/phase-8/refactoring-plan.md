# Phase 8: リファクタリング計画

## 実施日時

2026-04-18

## 重複定義チェック結果

```bash
grep -rn "DocErrorCode\|LLMQueryFn\|LLM_TIMEOUT_MS" apps/desktop/src/main/
```

### 結果

| 定義名           | 場所                                  | 重複         |
| ---------------- | ------------------------------------- | ------------ |
| `DocErrorCode`   | `services/llm/LLMClient.ts`           | 1箇所のみ ✅ |
| `LLMQueryFn`     | `services/skill/SkillDocGenerator.ts` | 1箇所のみ ✅ |
| `LLM_TIMEOUT_MS` | `services/skill/SkillDocGenerator.ts` | 1箇所のみ ✅ |

## リファクタリング対象

### Phase 8 で実施したリファクタリング

重複コードは検出されなかった。Phase 2 設計との乖離も確認されなかった。

主な確認事項:

- `LLMClient.ts` に `RETRY_BASE_DELAY_MS` / `RETRYABLE_CODES` 定数が集約されている
- `AnthropicProvider.ts` に `sanitizeErrorMessage` が独立して定義（LLMDocQueryAdapter側と重複）

### 対応措置

`sanitizeErrorMessage` は `LLMDocQueryAdapter.ts` と `AnthropicProvider.ts` の両方に存在するが、
両者の責務（アダプタ層 vs プロバイダ層）が異なるため、それぞれ独立して保持することが適切。
将来的な共通化は `services/llm/utils.ts` への切り出しで対応可能だが、現時点では DRY より
明示的な依存関係を優先する。

## 未使用インポートチェック

```bash
pnpm --filter @repo/desktop exec tsc --noEmit 2>&1 | grep "unused"
→ 出力なし（未使用インポートなし）✅
```

## 計画サマリー

| 項目                   | Before                                              | After        | 理由                         |
| ---------------------- | --------------------------------------------------- | ------------ | ---------------------------- |
| `sanitizeErrorMessage` | 両ファイルに同名関数                                | そのまま維持 | 責務層が異なるため分離が適切 |
| 定数配置               | `LLMClient.ts` に集約済み                           | 変更なし     | Phase 2 設計と一致           |
| 型定義                 | `LLMClient.ts` に `DocErrorCode` / `LLMQueryResult` | 変更なし     | 単一定義を維持               |
