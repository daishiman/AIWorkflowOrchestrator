# Phase 7: カバレッジ確認 — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 7                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

`AnthropicAdapter.ts` の変更箇所（`checkHealth` メソッド）に対して、カバレッジ基準（Line: 80%、Branch: 60%）を満たしているか確認する。

## 実行タスク

### Task 7-1: カバレッジ計測の実行

```bash
cd apps/desktop && pnpm vitest run --coverage src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

### Task 7-2: カバレッジ結果の評価

評価対象ファイル: `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`

| 指標              | 基準値   | 期待値   | 判定基準                      |
| ----------------- | -------- | -------- | ----------------------------- |
| Line Coverage     | 80% 以上 | 80% 以上 | 満たさなければ Phase 6 へ戻る |
| Branch Coverage   | 60% 以上 | 60% 以上 | 満たさなければ Phase 6 へ戻る |
| Function Coverage | 80% 以上 | 80% 以上 | 満たさなければ Phase 6 へ戻る |

### Task 7-3: カバレッジ基準の充足確認と分岐判断

| 結果           | 対応                                       |
| -------------- | ------------------------------------------ |
| 全基準を満たす | Phase 8 へ進む                             |
| 未達基準あり   | Phase 6 へ戻り、未達箇所のテストを追加する |

### Task 7-4: カバレッジ未達時の対象範囲

カバレッジ未達が発生する可能性のある箇所（参考）:

| 箇所                                | 説明                                                                  |
| ----------------------------------- | --------------------------------------------------------------------- |
| `checkHealth` の try/catch ブロック | エラー応答テスト（既存）がカバー                                      |
| リトライロジック（BaseLLMAdapter）  | 本タスクのスコープ外。BaseLLMAdapter のカバレッジ未達は別タスクで対応 |

## 参照資料

| ドキュメント                       | 用途                                     |
| ---------------------------------- | ---------------------------------------- |
| `phase-6-test-expansion.md`        | 拡充後テストの内容確認                   |
| `.claude/rules/02-code-quality.md` | カバレッジ基準（Line: 80%、Branch: 60%） |

## 統合テスト連携

Adapter 単体のカバレッジ確認のみを行う。統合テストカバレッジは Task04 のスコープ。

## 成果物

| 成果物                     | パス                                                                                 | 備考                             |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| Phase 7 カバレッジ確認記録 | `docs/30-workflows/step-02-par-task-02-anthropic-adapter-update/phase-7-coverage.md` | 本ファイル（結果は実行後に記入） |

## 完了条件

- [ ] `pnpm vitest run --coverage` コマンドを実行した
- [ ] Line Coverage が 80% 以上である
- [ ] Branch Coverage が 60% 以上である
- [ ] Function Coverage が 80% 以上である
- [ ] 基準未達がある場合は Phase 6 へ戻ったことを記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（`phase-8-refactoring.md`）
