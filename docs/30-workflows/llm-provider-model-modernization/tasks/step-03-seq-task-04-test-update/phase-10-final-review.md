# Phase 10: 最終レビュー — テスト期待値更新

## メタ情報

| 項目      | 値                   |
| --------- | -------------------- |
| Phase番号 | 10                   |
| 機能名    | test-update          |
| タスクID  | TASK-LLM-MOD-04      |
| 作成日    | 2026-03-23           |
| 前Phase   | Phase 9: 品質保証    |
| 次Phase   | Phase 11: 手動テスト |

## 目的

多角的な観点から変更全体の品質・整合性を検証し、PASS / MINOR / MAJOR / CRITICAL を判定する。

## 実行タスク

### Task 10-1: 要件充足の最終確認

| 要件ID | 要件概要                              | 実装状況 | 確認結果 |
| ------ | ------------------------------------- | -------- | -------- |
| R-01   | handleGetProviders 期待値更新         | -        | -        |
| R-02   | inferProviderId o3/o4-mini テスト追加 | -        | -        |
| R-03   | AnthropicAdapter ヘルスチェック更新   | -        | -        |
| R-04   | GoogleAdapter system_instruction 追加 | -        | -        |
| R-05   | 全テスト PASS                         | -        | -        |

### Task 10-2: テストコード品質レビュー

以下の観点でテストコードを多角的にレビューする:

#### チェック A: テスト独立性

- 各テストケースが beforeEach のリセットに依存する場合、リセットが確実に実行されているか
- P39 対応: happy-dom 環境で userEvent を使用していないか

```bash
grep -rn "userEvent" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

#### チェック B: 期待値の正確性

- PROVIDER_CONFIGS の実際の内容と llm.test.ts の期待値が一致しているか

```bash
# PROVIDER_CONFIGS の現行モデルID一覧と llm.test.ts の期待値を突き合わせる
grep -n "id:" apps/desktop/src/main/handlers/llm/providers.ts
grep -n "expect\|toEqual" apps/desktop/src/main/handlers/__tests__/llm.test.ts | head -30
```

#### チェック C: 命名の整合性

- 追加テストの describe/it 説明文が既存スタイルに合致しているか

#### チェック D: 型安全

- テストファイルに型エラーが存在しないか（Phase 9 で確認済みのはず）
- `as any` の使用がないか

```bash
grep -n "as any" apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
grep -n "as any" apps/desktop/src/main/handlers/__tests__/llm.test.ts
```

#### チェック E: スコープ外変更がないか

- Task01〜03 の変更に無関係なテストが変更されていないか

```bash
# 変更ファイルの確認
git diff --name-only
```

### Task 10-3: 最終判定

| 判定     | 対応                                           |
| -------- | ---------------------------------------------- |
| PASS     | Phase 11 へ                                    |
| MINOR    | 未タスク仕様書に変換後 Phase 11 へ（省略不可） |
| MAJOR    | 影響範囲に応じて Phase 1-5 へ戻る              |
| CRITICAL | Phase 1 へ戻り要件再確認                       |

**最終判定: （実行時に記入）**

## 参照資料

| 資料                                 | 用途                       |
| ------------------------------------ | -------------------------- |
| `phase-1-requirements.md`            | 要件 R-01〜R-05            |
| `phase-9-quality-assurance.md`       | 品質保証実行結果           |
| `.claude/rules/05-task-execution.md` | 最終レビューゲート判定基準 |
| `.claude/rules/02-code-quality.md`   | コード品質基準             |

## 統合テスト連携

最終レビューにおいて `cd apps/desktop && pnpm vitest run` を再実行し、Phase 9 以降の変更で FAIL が発生していないことを最終確認する。

## 成果物

| 成果物                     | パス                       |
| -------------------------- | -------------------------- |
| 最終レビュー（本ファイル） | `phase-10-final-review.md` |

## 完了条件

- [ ] R-01〜R-05 の要件充足確認テーブルが全項目「確認済み」になっている
- [ ] チェック A〜E が全て確認済み
- [ ] 最終判定が PASS / MINOR / MAJOR / CRITICAL で明示されている
- [ ] MINOR 指摘は全て未タスク仕様書に変換されている
- [ ] MAJOR/CRITICAL の場合は戻り先 Phase が指定されている

## 次のPhase

Phase 11: 手動テスト (`phase-11-manual-testing.md`)
