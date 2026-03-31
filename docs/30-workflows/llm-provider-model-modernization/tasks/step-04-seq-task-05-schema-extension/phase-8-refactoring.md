# Phase 8: リファクタリング — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase番号 | 8                         |
| 機能名    | schema-extension          |
| タスクID  | TASK-LLM-MOD-05           |
| 作成日    | 2026-03-23                |
| 依存Phase | Phase 7（カバレッジ確認） |

## 目的

Phase 5 で実装した変更を対象にコード品質を改善する。本タスクは変更量が少ない（型定義追加と値設定のみ）ため、リファクタリングの主な焦点は `PROVIDER_CONFIGS` 型定義の可読性と `LLMModel` 型との整合性確認である。

## 実行タスク

### Task 8-1: 型定義の整合性確認

`PROVIDER_CONFIGS` のインライン型が `LLMModel`（`LLMModelSchema` の推論型）と乖離していないかを確認する。

**確認コマンド:**

```bash
grep -n "PROVIDER_CONFIGS\|LLMModel\|LLMModelSchema" \
  apps/desktop/src/main/handlers/llm.ts
```

**観点:**

- `PROVIDER_CONFIGS` のモデル要素型が `LLMModel` の部分型（subset）になっているか
- 将来の `LLMModelSchema` 変更時に型の二重管理が問題になる可能性がないか

**改善候補（任意）:**

もし `PROVIDER_CONFIGS` のモデル型を `Omit<LLMModel, "isDefault"> & { isDefault: boolean }` 等で `LLMModel` 型を利用する形にリファクタリングできる場合、型の重複を削減できる。ただし、Zod スキーマの `default()` の挙動に注意する。

**判断基準**: 型の重複が将来の保守コストになると判断した場合のみ実施。現時点では任意。

### Task 8-2: description 値の整合性確認

設定した `description` 値が以下を満たしているかを確認する:

| 確認項目                        | 基準                                     |
| ------------------------------- | ---------------------------------------- |
| 空文字列が含まれていないこと    | `grep -n 'description: ""' llm.ts` で0件 |
| 各 description が英語であること | 視認確認                                 |
| 30文字以内であること            | 最も長い値をカウントして確認             |

```bash
grep -n "description:" apps/desktop/src/main/handlers/llm.ts
```

### Task 8-3: コードスタイルの確認

Prettier フォーマットが適用されていることを確認する:

```bash
pnpm --filter @repo/desktop exec prettier --check src/main/handlers/llm.ts
```

フォーマット不一致があれば修正する:

```bash
pnpm --filter @repo/desktop exec prettier --write src/main/handlers/llm.ts
```

### Task 8-4: non-null assertion の確認（P48・P52対策）

変更対象ファイルに non-null assertion (`!`) が残存していないかを確認する:

```bash
grep -n "!" apps/desktop/src/main/handlers/llm.ts | grep -v "//\|!==\|!=\|!request\|!request\|!apiKey\|!providerId\|!controller\|!isDestroyed"
```

問題のある箇所があれば Phase 5 実装時に修正する。本タスクの変更では non-null assertion を追加しないこと。

## 参照資料

| 資料                                                | 用途                         |
| --------------------------------------------------- | ---------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`             | リファクタリング対象ファイル |
| `packages/shared/src/types/llm/schemas/provider.ts` | LLMModel 型との整合確認      |
| `.claude/rules/02-code-quality.md`                  | コード品質ルール確認         |

## 成果物

| 成果物                              | パス                                    | 備考                           |
| ----------------------------------- | --------------------------------------- | ------------------------------ |
| リファクタリング済み llm.ts（任意） | `apps/desktop/src/main/handlers/llm.ts` | 型定義改善が必要な場合のみ変更 |

## 統合テスト連携

リファクタリング後に既存テストが全件 PASS であることを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm.test.ts
```

## 完了条件

- [ ] `PROVIDER_CONFIGS` インライン型と `LLMModel` 型の乖離有無を確認した
- [ ] description 値が空文字列を含まないことを確認した（`grep -n 'description: ""' llm.ts`）
- [ ] Prettier フォーマット確認を実施した（`prettier --check`）
- [ ] non-null assertion の残存確認を実施した（P48・P52対策）
- [ ] リファクタリング後に全テストが PASS であることを確認した

## 次のPhase

[Phase 9: 品質保証](./phase-9-quality-assurance.md)
