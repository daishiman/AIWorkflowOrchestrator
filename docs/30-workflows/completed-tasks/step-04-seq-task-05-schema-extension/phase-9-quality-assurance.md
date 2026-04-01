# Phase 9: 品質保証 — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                          |
| --------- | --------------------------- |
| Phase番号 | 9                           |
| 機能名    | schema-extension            |
| タスクID  | TASK-LLM-MOD-05             |
| 作成日    | 2026-03-23                  |
| 依存Phase | Phase 8（リファクタリング） |

## 目的

変更対象ファイルに対して Lint・型チェック・全テストを実行し、Phase 10 最終レビューに向けた品質基準を満たしていることを確認する。

## 実行タスク

### Task 9-1: ESLint チェック

```bash
pnpm --filter @repo/desktop exec eslint src/main/handlers/llm.ts --max-warnings=0
pnpm --filter @repo/shared exec eslint src/types/llm/schemas/provider.ts --max-warnings=0
```

**期待される結果**: エラー0件、警告0件。

### Task 9-2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

**確認する観点:**

- `PROVIDER_CONFIGS` の `description?: string` が `LLMModel` 型と整合していることの型システムによる証明
- 既存のインポート型に変更なし

**期待される結果**: 型エラー0件。

### Task 9-3: 全テスト実行

```bash
# packages/shared のテスト（スキーマ全体）
pnpm --filter @repo/shared exec vitest run src/types/llm/schemas/__tests__/

# apps/desktop の関連テスト
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm.test.ts
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm-stream.test.ts
```

**期待される結果**: 全テスト PASS。新規追加テスト（TS-A 系、TS-B 系）を含むすべてが PASS。

### Task 9-4: 品質チェックリスト確認

| 項目                                 | 確認内容                                                  |
| ------------------------------------ | --------------------------------------------------------- |
| `any` 型の不使用                     | `grep -n ": any\|as any" llm.ts` で変更箇所に0件          |
| `@ts-ignore` の不使用                | `grep -n "@ts-ignore\|@ts-expect-error" llm.ts` で0件     |
| `description` 値が空文字列でないこと | `grep -n 'description: ""' llm.ts` で0件                  |
| 未使用インポートがないこと           | ESLint の `no-unused-vars` ルールでカバー                 |
| boolean 変数名プレフィックス準拠     | `isDefault`, `isAvailable` — 既存フィールドのため変更なし |

### Task 9-5: 既存テストの回帰確認

`llm.ts` の変更が既存テストに影響を与えていないことを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/
```

**確認対象テスト:**

- `llm.test.ts`: 既存テストが全件 PASS
- `llm-stream.test.ts`: ストリーミング関連テストが全件 PASS
- `llm.runtime-sync.test.ts`: ランタイム同期テストが全件 PASS

## 参照資料

| 資料                                                | 用途                             |
| --------------------------------------------------- | -------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`             | 品質確認対象ファイル             |
| `packages/shared/src/types/llm/schemas/provider.ts` | 品質確認対象ファイル             |
| `.claude/rules/02-code-quality.md`                  | コード品質ルール（`any` 禁止等） |

## 成果物

| 成果物                       | パス                                      | 備考           |
| ---------------------------- | ----------------------------------------- | -------------- |
| 品質保証レポート（確認結果） | 本ファイル内（Task 9-4 のチェックリスト） | 実行結果を記録 |

## 統合テスト連携

Phase 9 で全テスト PASS・型エラー0件・Lint エラー0件が確認されれば Phase 10 最終レビューに移行する。

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] `pnpm --filter @repo/shared typecheck` が PASS した
- [ ] ESLint チェックでエラー・警告が0件であった
- [ ] `packages/shared` の provider.test.ts テストが全件 PASS した
- [ ] `apps/desktop` の llm.test.ts テストが全件 PASS した（既存テストの回帰なし）
- [ ] `any` 型・`@ts-ignore`・空文字列 description がないことを確認した
- [ ] Task 9-4 の品質チェックリスト全項目を確認した

## 次のPhase

[Phase 10: 最終レビュー](./phase-10-final-review.md)
