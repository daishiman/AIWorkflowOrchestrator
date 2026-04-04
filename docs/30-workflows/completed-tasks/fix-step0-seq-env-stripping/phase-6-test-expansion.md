# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 6                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

Phase 4 で定義した回帰ケースだけで十分に bugfix を守れるかを確認し、不要な edge case を増やさない。

## 結論

**追加テストは作成しない。**

この修正の本質は `callSDKQuery()` の `env` 合成 1 行にあるため、`SkillExecutor.auth.test.ts` の Phase 4 ケースで

- `PATH` が保持されること
- `ANTHROPIC_API_KEY` が渡されること
- `process.env.ANTHROPIC_API_KEY` より AuthKeyService の値が優先されること

をまとめて押さえれば十分である。

## 採用しない edge cases

| edge case                  | 理由                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| `apiKey` が `undefined`    | `getApiKey()` が `AUTHENTICATION_ERROR` を返すため、`callSDKQuery()` に到達しない |
| 空文字の API key           | 同上                                                                              |
| 長大な API key             | env merge の bugfix とは無関係                                                    |
| Unicode を含む API key     | env merge の bugfix とは無関係                                                    |
| `process.env` の他キー比較 | `PATH` 保持で十分に inherited env の復元を検証できる                              |

## 実行手順

```bash
# Phase 4 の auth suite を再実行
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts

# 型安全 baseline をそのまま確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts
```

## 参照資料

| 資料名       | パス                          | 説明                      |
| ------------ | ----------------------------- | ------------------------- |
| テスト作成   | `./phase-4-test-creation.md`  | 回帰ケースの定義          |
| 実装         | `./phase-5-implementation.md` | 1 行修正                  |
| 設計レビュー | `./phase-3-design-review.md`  | 追加 edge case 不要の判断 |

## 成果物

| 成果物         | パス                                        | 説明                 |
| -------------- | ------------------------------------------- | -------------------- |
| テスト拡充仕様 | `phase-6-test-expansion.md`                 | 本ファイル           |
| 回帰確認出力   | `outputs/phase-6/test-expansion-summary.md` | no-op 判断と確認結果 |

## 完了条件

- [ ] 追加テストが 0 件であることが明記されている
- [ ] `apiKey undefined` 系を採用しない理由が明記されている
- [ ] `SkillExecutor.auth.test.ts` の Phase 4 ケースで十分と判断されている
- [ ] **本Phase内の全タスクを100%実行完了**
