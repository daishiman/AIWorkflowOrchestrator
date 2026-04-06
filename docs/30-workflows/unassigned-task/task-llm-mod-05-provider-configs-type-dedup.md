# TASK-LLM-MOD-05-PROVIDER-CONFIGS-TYPE-DEDUP: PROVIDER_CONFIGS インライン型定義の重複解消

## メタ情報

```yaml
issue_number: 1819
```

## メタ情報

| 項目     | 値                                                  |
| -------- | --------------------------------------------------- |
| タスクID | TASK-LLM-MOD-05-PROVIDER-CONFIGS-TYPE-DEDUP         |
| 優先度   | 低                                                  |
| 発見元   | TASK-LLM-MOD-05 Phase 12 未タスク検出（2026-03-30） |
| 関連     | `packages/shared/src/types/llm/schemas/provider.ts` |

## 目的

`apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` 配列要素に使用されているインライン型定義を、`packages/shared/src/types/llm/schemas/provider.ts` の `LLMModelSchema`（Zod）から派生した共通型へ置換し、型定義のSSoT（Single Source of Truth）を確立する。

現状では `PROVIDER_CONFIGS` のインライン型と `LLMModelSchema` が二重定義になっており、TASK-LLM-MOD-05 で `description?: string` を追加した際も両箇所への手動追加が必要だった。この重複を解消することで、将来のフィールド追加を一箇所の変更で完結させる。

## 苦戦箇所

Zodスキーマから派生した型と、メインハンドラーのインライン型定義が乖離しやすい。`LLMModelSchema` は `packages/shared/` に定義されているが、`apps/desktop/src/main/` のハンドラー内でインライン型が定義されると、型の正本がどこかわかりにくくなる。パッケージ境界を越えた型依存の確立には `z.infer<T>` パターンが有効だが、既存コードがインライン型に依存している場合の移行コストが高い。具体的には、インライン型が暗黙的に使われている箇所が複数ある場合、型の置換後に型エラーが連鎖して発生するため、影響範囲の事前調査が重要になる。

## 対象ファイル

| ファイル                                            | 変更内容                                                                    |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`             | `PROVIDER_CONFIGS` のインライン型アノテーションを `LLMModel` 型で置換       |
| `packages/shared/src/types/llm/schemas/provider.ts` | `LLMModel` 型エイリアス（`z.infer<typeof LLMModelSchema>`）の公開確認・整理 |

## 実行タスク

1. `packages/shared/src/types/llm/schemas/provider.ts` を確認し、`LLMModel` 型（`z.infer<typeof LLMModelSchema>`）が export されているか検証する
2. 未 export であれば型エイリアスを追加して export する
3. `apps/desktop/src/main/handlers/llm.ts` の `PROVIDER_CONFIGS` に付与されているインライン型定義を特定する
4. インライン型を `LLMModel` 型（`@repo/shared` からのインポート）へ置換する
5. `pnpm --filter @repo/desktop typecheck` を実行して型エラーがないことを確認する

## 完了条件

- [ ] `PROVIDER_CONFIGS` のモデル配列要素型が `LLMModelSchema` から派生した型（`LLMModel`）と統一されている
- [ ] 重複したインライン型定義が削除されている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する
