# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 6                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 5 完了（TDD Green）                   |
| 後続Phase  | Phase 7                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | completed                                   |

## 目的

失敗パス、回帰ガード、境界値テストを追加し、テストスイートを強化する。

## 実行タスク

1. リトライロジックのテストを追加する（指数バックオフ検証）
2. タイムアウト境界値テストを追加する（29秒OK / 30秒超 TIMEOUT）
3. 連続エラー後のエラーコード一致テストを追加する
4. 既存テストの回帰ガードを確認する
5. E2E統合テスト（LLMClient → SkillDocGenerator → IPC）を追加する

## 追加テストケース

### リトライロジックテスト

| テストケース | シナリオ                             | 期待結果                                      |
| ------------ | ------------------------------------ | --------------------------------------------- |
| TC-12        | 429 → 429 → 成功（3回目で成功）      | `{ success: true, content: "..." }`           |
| TC-13        | 429 × 3（上限到達）                  | `{ success: false, errorCode: "RATE_LIMIT" }` |
| TC-14        | 500 → 成功（2回目で成功）            | `{ success: true, content: "..." }`           |
| TC-15        | バックオフ間隔が 1s/2s/4s であること | タイマーモックで検証                          |

### タイムアウト境界値テスト

| テストケース | シナリオ           | 期待結果                                   |
| ------------ | ------------------ | ------------------------------------------ |
| TC-16        | 29秒で応答         | `{ success: true, content: "..." }`        |
| TC-17        | 30001ms で応答なし | `{ success: false, errorCode: "TIMEOUT" }` |

### エラーコード一致テスト

| テストケース | シナリオ                       | 期待結果                                   |
| ------------ | ------------------------------ | ------------------------------------------ |
| TC-18        | `API_KEY_MISSING` の retryable | `retryable: false` であること              |
| TC-19        | `RATE_LIMIT` の retryable      | `retryable: true` であること               |
| TC-20        | IPC エラーメッセージが日本語   | `error` フィールドが日本語文字列であること |

### 回帰ガード

```bash
# Phase 6 完了後の全テスト実行
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
pnpm --filter @repo/desktop exec vitest run src/main/services/llm/__tests__/
```

## 実行手順

1. リトライロジックテスト（TC-12〜TC-15）を `LLMClient.test.ts` に追加する
2. タイムアウト境界値テスト（TC-16〜TC-17）を追加する
3. エラーコード一致テスト（TC-18〜TC-20）を追加する
4. 全テストを実行して全件 PASS を確認する

## 統合テスト連携

- SubAgent-A: TC-12〜TC-17 のリトライ・タイムアウトテストを担当
- SubAgent-B: TC-18〜TC-20 の IPC エラーコードテストを担当

## 参照資料

- `phase-4-test-creation.md`: TC-01〜TC-11 の基底テスト
- `phase-5-implementation.md`: Green 化した実装の前提
- `outputs/phase-5/implementation-summary.md`: Phase 5 の変更要約

## 成果物

- 拡張された `LLMClient.test.ts`（TC-12〜TC-20 追加）（コード成果物）
- `outputs/phase-6/extended-test-cases.md`: 拡張テストケースと結果ログ

## 完了条件

- [ ] TC-12〜TC-20 が全て追加されている
- [ ] 全テストケース（TC-01〜TC-20）が PASS している
- [ ] 既存テストの回帰ガードが通過している

## タスク100%実行確認【必須】

- [ ] リトライロジックテスト（TC-12〜TC-15）追加完了
- [ ] タイムアウト境界値テスト（TC-16〜TC-17）追加完了
- [ ] エラーコード一致テスト（TC-18〜TC-20）追加完了
- [ ] 全テスト PASS 確認完了
- [ ] 拡張テスト結果ログ出力完了

## 次Phase

Phase 7（カバレッジ確認）へ進む。
