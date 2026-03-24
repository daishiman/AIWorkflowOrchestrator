# Task04: テスト期待値更新

## メタ情報

| 項目         | 値                                           |
| ------------ | -------------------------------------------- |
| タスクID     | TASK-LLM-MOD-04                              |
| 責務         | Test lane                                    |
| 実行順序     | step-03-seq（Task01, Task02, Task03 完了後） |
| 依存先       | Task01, Task02, Task03                       |
| ブロック対象 | Task05                                       |

## 目的

PROVIDER_CONFIGS の変更と Adapter の更新に合わせて、テストの期待値を新モデル定義に更新する。

## 対象ファイル

| ファイル                                                                 | 変更内容                                |
| ------------------------------------------------------------------------ | --------------------------------------- |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts`                   | handleGetProviders のモデルID期待値更新 |
| `apps/desktop/src/main/handlers/__tests__/llm-stream.test.ts`            | ストリーミングテストのモデルID更新      |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts`  | ヘルスチェックモデルID期待値更新        |
| `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`     | system_instruction対応のテスト追加      |
| `apps/desktop/src/main/adapters/llm/__tests__/OpenAIAdapter.test.ts`     | モデルID期待値更新（必要に応じて）      |
| `apps/desktop/src/main/adapters/llm/__tests__/xAIAdapter.test.ts`        | モデルID期待値更新（必要に応じて）      |
| `apps/desktop/src/main/adapters/llm/__tests__/LLMAdapterFactory.test.ts` | ファクトリーテストの整合性確認          |
| `packages/shared/src/types/llm/schemas/__tests__/provider.test.ts`       | スキーマテスト（description追加時）     |

## 実行タスク

### Task 4-1: llm.test.ts のモデルID期待値更新

- `handleGetProviders` が返すプロバイダーリストの期待値を更新
- `inferProviderId` のテストケースに `o3`/`o4-mini` を追加
- `handleSetSelectedConfig` のバリデーションテスト更新

### Task 4-2: AnthropicAdapter.test.ts のヘルスチェックテスト更新

- ヘルスチェックリクエストの `model` フィールド期待値を `claude-haiku-4-5` に更新

### Task 4-3: GoogleAdapter.test.ts の system_instruction テスト追加

- `system_instruction` フィールドが正しく送信されるテスト追加
- systemPrompt なしの場合に `system_instruction` が省略されるテスト追加
- 既存のワークアラウンド（user ロール埋め込み）テストの更新

### Task 4-4: 全テスト実行確認

```bash
cd apps/desktop && pnpm vitest run src/main/handlers/__tests__/llm.test.ts
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/
```

## 参照資料

- [06-known-pitfalls.md#P40](../../../../.claude/rules/06-known-pitfalls.md): テスト実行ディレクトリ依存（モノレポ）
- [06-known-pitfalls.md#P39](../../../../.claude/rules/06-known-pitfalls.md): happy-dom環境でのuserEvent非互換

## 成果物

| 成果物                   | パス                                                  |
| ------------------------ | ----------------------------------------------------- |
| タスク概要（本ファイル） | `index.md`                                            |
| Phase 1-13 仕様書        | `phase-1-requirements.md` 〜 `phase-13-completion.md` |
| 未タスク検出レポート     | `unassigned-task-report.md`                           |
| artifacts.json           | `artifacts.json`                                      |

## 完了条件

- [ ] 全テストファイルのモデルID期待値が新定義に合致している
- [ ] `inferProviderId` のテストケースに `o3`/`o4-mini` が含まれている
- [ ] GoogleAdapter の system_instruction テストが追加されている
- [ ] `pnpm vitest run` で全テストが PASS する
