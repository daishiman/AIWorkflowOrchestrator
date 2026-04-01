# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 7                                                |
| 機能名 | SkillExecutor env オプション全環境変数上書き修正 |
| 作成日 | 2026-04-01                                       |

## 目的

`callSDKQuery()` の env merge が Phase 4 の回帰ケースだけで十分に守られているかを確認する。

## カバレッジ目標

| 指標                           | 目標値 | 根拠                               |
| ------------------------------ | ------ | ---------------------------------- |
| `callSDKQuery` の env 合成分岐 | 100%   | 1 行修正の本体                     |
| `PATH` 保持                    | 100%   | inherited env の復元点             |
| `ANTHROPIC_API_KEY` 上書き     | 100%   | 認証キーの優先順位が破綻しないこと |

## 確認コマンド

```bash
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts

pnpm --filter @repo/desktop exec vitest run \
  src/main/services/skill/__tests__/SkillExecutor.sdk-types.test.ts

pnpm --filter @repo/desktop exec vitest run --coverage \
  src/main/services/skill/__tests__/SkillExecutor.auth.test.ts
```

## トレーサビリティ

| 要件 ID | テストケース  | カバレッジ対象コード                               |
| ------- | ------------- | -------------------------------------------------- |
| FR-01   | TC-01         | `env.PATH` の保持                                  |
| FR-02   | TC-01 / TC-02 | `env.ANTHROPIC_API_KEY` の付与                     |
| FR-03   | TC-02         | `ANTHROPIC_API_KEY` の上書き順                     |
| FR-04   | TC-01         | `PATH` による `node` 解決                          |
| AC-4    | 既存 suite    | `SkillExecutor.sdk-types.test.ts` の baseline 維持 |
| AC-5    | Phase 3       | Main プロセス内完結のセキュリティ判断              |

## カバレッジ不足時の対応

`SkillExecutor.auth.test.ts` の追加で埋まらない分岐が残る場合は、Phase 6 に戻すのではなく Phase 4 の回帰ケースを見直す。

## 参照資料

| 資料名     | パス                          | 説明       |
| ---------- | ----------------------------- | ---------- |
| 要件定義   | `./phase-1-requirements.md`   | FR / AC    |
| テスト作成 | `./phase-4-test-creation.md`  | 回帰ケース |
| テスト拡充 | `./phase-6-test-expansion.md` | no-op 判断 |

## 成果物

| 成果物         | パス                                  | 説明               |
| -------------- | ------------------------------------- | ------------------ |
| カバレッジ確認 | `phase-7-coverage-check.md`           | 本ファイル         |
| カバレッジ出力 | `outputs/phase-7/coverage-summary.md` | トレーサビリティ表 |

## 完了条件

- [ ] `callSDKQuery` の env merge 分岐が 100% カバーされている
- [ ] Phase 6 に追加テストを戻さない方針が明記されている
- [ ] `SkillExecutor.sdk-types.test.ts` が baseline として維持されている
- [ ] **本Phase内の全タスクを100%実行完了**
