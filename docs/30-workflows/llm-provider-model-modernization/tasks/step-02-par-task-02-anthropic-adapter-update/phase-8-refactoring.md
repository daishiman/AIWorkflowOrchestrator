# Phase 8: リファクタリング（TDD: Refactor） — AnthropicAdapter ヘルスチェックモデル更新

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 8                        |
| 機能名     | anthropic-adapter-update |
| タスクID   | TASK-LLM-MOD-02          |
| 作成日     | 2026-03-23               |
| ステータス | 未着手                   |

## 目的

Green 状態を維持しながら、変更コードとテストコードの品質を改善する。本タスクの変更量は極小（1行）のため、リファクタリング対象は限定的である。

## 実行タスク

### Task 8-1: 変更コードのリファクタリング評価

`AnthropicAdapter.ts` L207 の変更後コードを評価する。

```typescript
model: "claude-haiku-4-5", // 最安・最速モデル
```

| 評価項目                         | 現状                                    | 対応方針                                            |
| -------------------------------- | --------------------------------------- | --------------------------------------------------- |
| モデルIDがハードコードされている | 許容（他の Adapter と統一したパターン） | 変更不要。定数化は全 Adapter 一括で行う未タスク候補 |
| コメントが実装意図を表している   | 「最安・最速モデル」で明確              | 変更不要                                            |
| 型安全性                         | `string` リテラル、型推論有効           | 変更不要                                            |

**結論: 実装コードに対してリファクタリング不要。**

### Task 8-2: テストコード HC-001 のリファクタリング評価

```typescript
it("should use claude-haiku-4-5 as health check model", async () => {
  let capturedBody: Record<string, unknown> = {};
  // ... MSW ハンドラ設定 ...
  await adapter.checkHealth();
  expect(capturedBody.model).toBe("claude-haiku-4-5");
});
```

| 評価項目                                     | 現状                                      | 対応方針 |
| -------------------------------------------- | ----------------------------------------- | -------- |
| テスト名が検証内容を明確に表している         | 「should use claude-haiku-4-5」で明確     | 変更不要 |
| `capturedBody` の型が適切である              | `Record<string, unknown>` で安全          | 変更不要 |
| MSW ハンドラの記述が既存テストと一貫している | 既存の `checkHealth` テストパターンを踏襲 | 変更不要 |

**結論: テストコードに対してリファクタリング不要。**

### Task 8-3: Green 状態の維持確認

リファクタリング（変更なし）後も Green 状態であることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts
```

期待される出力: 全テスト **PASS**

### Task 8-4: 未タスク候補の記録

リファクタリング評価で発見した将来の改善候補を記録する。

| 候補                                                              | 理由                                                          | 優先度 |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| ヘルスチェックモデルIDの定数化                                    | `AnthropicAdapter` / `GoogleAdapter` 等で共通の設計パターン化 | 低     |
| `checkHealth` リクエストの `max_tokens` / `messages` 固定値テスト | Phase 6 で検討済み未タスク候補                                | 低     |

これらは Phase 12 にて未タスク指示書として登録する。

## 参照資料

| ドキュメント                                                            | 用途                               |
| ----------------------------------------------------------------------- | ---------------------------------- |
| `phase-7-coverage.md`                                                   | カバレッジ基準充足の確認（前提）   |
| `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                | リファクタリング評価対象           |
| `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | テストコードのリファクタリング評価 |

## 統合テスト連携

リファクタリング（変更なし）のため統合テストへの影響はない。

## 成果物

| 成果物                               | パス                                                                    | 備考                     |
| ------------------------------------ | ----------------------------------------------------------------------- | ------------------------ |
| AnthropicAdapter.ts（確認済み）      | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                | リファクタリング変更なし |
| AnthropicAdapter.test.ts（確認済み） | `apps/desktop/src/main/adapters/llm/__tests__/AnthropicAdapter.test.ts` | リファクタリング変更なし |

## 完了条件

- [ ] 実装コードのリファクタリング評価を実施した（変更不要と判断）
- [ ] テストコードのリファクタリング評価を実施した（変更不要と判断）
- [ ] Green 状態が維持されていることを `pnpm vitest run` で確認した
- [ ] 未タスク候補（定数化・追加テスト）を記録した

## 次のPhase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）
