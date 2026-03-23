# Phase 13: 完了 — テスト期待値更新

## メタ情報

| 項目      | 値                            |
| --------- | ----------------------------- |
| Phase番号 | 13                            |
| 機能名    | test-update                   |
| タスクID  | TASK-LLM-MOD-04               |
| 作成日    | 2026-03-23                    |
| 前Phase   | Phase 12: ドキュメント更新    |
| 次Phase   | なし（Task05 へバトンタッチ） |

## 目的

TASK-LLM-MOD-04 の全成果物を最終確認し、Task05 への依存解除とブランチの PR 準備を行う。

## 実行タスク

### Task 13-1: 成果物最終確認

Phase 1〜12 の全成果物が揃っていることを確認する:

| Phase | 成果物                                 | 確認 |
| ----- | -------------------------------------- | ---- |
| 1     | phase-1-requirements.md                | [x]  |
| 2     | phase-2-design.md                      | [x]  |
| 3     | phase-3-design-review.md               | [x]  |
| 4     | phase-4-test-creation.md               | [x]  |
| 5     | 更新済みテストファイル群               | [ ]  |
| 6     | テスト拡充（必要に応じて）             | [ ]  |
| 7     | カバレッジ計測結果                     | [ ]  |
| 8     | リファクタリング済みテストファイル     | [ ]  |
| 9     | 品質保証結果                           | [ ]  |
| 10    | phase-10-final-review.md（判定記入）   | [ ]  |
| 11    | phase-11-manual-testing.md（結果記入） | [ ]  |
| 12    | phase-12-documentation.md（完了済み）  | [ ]  |
| 12    | unassigned-task-report.md              | [ ]  |

### Task 13-2: テスト更新の完了条件確認

```bash
# 最終テスト実行（apps/desktop から）
cd apps/desktop && pnpm vitest run
```

以下を確認する:

- [ ] 全テストが PASS している
- [ ] `inferProviderId` に o3 / o4-mini テストが含まれている
- [ ] `GoogleAdapter.test.ts` に system_instruction テスト T-03 / T-04 が含まれている
- [ ] `AnthropicAdapter.test.ts` のヘルスチェック期待値が `claude-haiku-4-5` になっている

### Task 13-3: PR 準備チェックリスト

```bash
# Lint と TypeCheck の最終確認
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop typecheck
```

PR 作成時のチェックリスト（`.claude/rules/07-git-and-tooling.md` 参照）:

- [ ] `pnpm lint` が通ること
- [ ] `pnpm typecheck` が通ること
- [ ] 関連テストが全て PASS すること
- [ ] `--no-verify` を使っていないこと

### Task 13-4: ブロック対象への通知

Task05（TASK-LLM-MOD-05）は TASK-LLM-MOD-04 の完了後に開始できる。
完了後、Task05 の担当者または実行エージェントに完了を通知する。

### Task 13-5: PR タイトルと本文の案

**タイトル（70文字以内）:**

```
test: LLM model ID期待値更新・system_instruction/o3テスト追加 (TASK-LLM-MOD-04)
```

**PR 本文:**

```markdown
## Summary

- PROVIDER_CONFIGS 変更（Task01）に合わせた llm.test.ts 期待値更新
- AnthropicAdapter ヘルスチェック期待値を `claude-haiku-4-5` に更新（Task02 対応）
- GoogleAdapter の system_instruction テスト T-03/T-04 追加（Task03 対応）
- inferProviderId に o3/o4-mini テストケース追加

## Test Plan

- `cd apps/desktop && pnpm vitest run` 全 PASS 確認済み
- P39/P40 制約（happy-dom / ディレクトリ）準拠
```

## 参照資料

| 資料                                  | 用途                     |
| ------------------------------------- | ------------------------ |
| `phase-9-quality-assurance.md`        | 品質保証結果             |
| `phase-10-final-review.md`            | 最終レビュー判定         |
| `phase-12-documentation.md`           | ドキュメント更新完了確認 |
| `.claude/rules/07-git-and-tooling.md` | PR 作成ルール            |

## 成果物

| 成果物                    | パス                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 完了記録（本ファイル）    | `phase-13-completion.md`                                                                                             |
| 更新済みテストファイル群  | `apps/desktop/src/main/handlers/__tests__/`、`apps/desktop/src/main/adapters/llm/__tests__/`                         |
| unassigned-task-report.md | `docs/30-workflows/llm-provider-model-modernization/tasks/step-03-seq-task-04-test-update/unassigned-task-report.md` |

## 完了条件

- [ ] Phase 1〜12 の全成果物が揃っている
- [ ] 最終テスト実行が全 PASS している
- [ ] Lint・TypeCheck が 0 エラー
- [ ] PR タイトル・本文が準備できている
- [ ] Task05 への完了通知が完了している

## タスク完了宣言

以下の条件が全て満たされた時点で TASK-LLM-MOD-04 を完了とする:

1. `cd apps/desktop && pnpm vitest run` が全 PASS
2. Phase 12 の全チェックリストが完了
3. unassigned-task-report.md が存在する
