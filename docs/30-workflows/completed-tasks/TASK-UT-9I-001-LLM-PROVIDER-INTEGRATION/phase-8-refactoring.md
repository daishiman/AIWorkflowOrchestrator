# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 8                                           |
| 機能名     | TASK-UT-9I-001-LLM-PROVIDER-INTEGRATION     |
| タスク名   | SkillDocGenerator の LLM プロバイダ連携実装 |
| 前提Phase  | Phase 7 完了（カバレッジ確認）              |
| 後続Phase  | Phase 9                                     |
| 作成日     | 2026-04-17                                  |
| ステータス | pending                                     |

## 目的

Phase 5〜6 で実装したコードの重複排除・設計ドリフト修正を行い、保守性を高める。

## 実行タスク

1. コード重複を検出し排除する
2. Phase 2 設計との乖離（ナビゲーションドリフト）を修正する
3. 定数・型定義の配置を整理する
4. 変更内容を `対象/Before/After/理由` テーブルで記録する
5. リファクタリング後の全テスト PASS を確認する

## リファクタリング対象チェック

```bash
# 重複定義の検出
grep -rn "DocErrorCode\|LLMQueryFn\|LLM_TIMEOUT_MS" apps/desktop/src/main/
grep -rn "Generated content for:" apps/desktop/src/main/services/skill/  # 完全排除確認

# 未使用インポートの検出
pnpm --filter @repo/desktop exec tsc --noEmit 2>&1 | grep "unused"
```

## 変更記録テーブル（Before/After 形式）

| 対象                  | Before                                 | After                                | 理由                       |
| --------------------- | -------------------------------------- | ------------------------------------ | -------------------------- |
| `LLM_TIMEOUT_MS` 定数 | `SkillDocGenerator.ts` に定義          | `services/llm/LLMClient.ts` に移動   | LLMClient が責務を持つため |
| エラーメッセージ定数  | `normalizeDocError` 内インライン文字列 | `services/llm/LLMClient.ts` に定数化 | 重複排除・一元管理         |
| （実装後に追記）      | （具体的な Before を記入）             | （具体的な After を記入）            | （理由を記入）             |

## 注意事項

- 動作を変更するリファクタリングは行わない（テスト Green を維持）
- `LLMQueryFn` 型の契約は変更しない（`SkillDocGenerator` への影響を避ける）
- 変更後は必ず全テストを実行して PASS を確認する

## 実行手順

```bash
# リファクタリング後の確認
pnpm --filter @repo/desktop exec tsc --noEmit
pnpm --filter @repo/desktop exec vitest run src/main/services/llm/
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
```

## 統合テスト連携

- 全テストがリファクタリング後も PASS であることを SubAgent-D が確認する

## 成果物

- `outputs/phase-8/refactoring-plan.md`: リファクタリング計画と変更記録テーブル

## 完了条件

- [ ] コード重複が排除されている
- [ ] 変更記録テーブルが `対象/Before/After/理由` 形式で完成している
- [ ] 全テストが PASS している

## タスク100%実行確認【必須】

- [ ] 重複コード検出・排除完了
- [ ] 変更記録テーブル作成完了
- [ ] 型チェック PASS
- [ ] 全テスト PASS
- [ ] リファクタリング計画書出力完了

## 次Phase

Phase 9（品質保証）へ進む。
