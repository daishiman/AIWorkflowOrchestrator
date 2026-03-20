# Phase 9: 品質保証 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | `UT-RAG-08-002`                                             |
| Phase         | `9 - 品質保証`                                              |
| 前提Phase     | `Phase 8: リファクタリング`                                 |
| 次Phase       | `Phase 10: 最終レビュー`                                    |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-8/refactoring-log.md`                        |

## 目的

型チェック・テスト・カバレッジ・既知制約の記録を一か所にまとめ、Phase 10 最終レビューへ渡す品質ゲートを確立する。

## 実行タスク

- [ ] typecheck 実行: `pnpm --filter @repo/shared exec tsc --noEmit` を実行し結果を記録する
- [ ] lint 実行: `pnpm --filter @repo/shared lint` を実行し結果を記録する
- [ ] scoped test 実行: factory テストをスコープ実行し結果を記録する
- [ ] `@placeholder` 残存確認: 以下コマンドでゼロ件を確認する
- [ ] `FACTORY_NOT_READY` 残存確認: 以下コマンドでゼロ件を確認する
- [ ] quality report 作成: coverage / limitation / gate 判定をまとめる

## 品質確認コマンド

### 型チェック

```bash
pnpm --filter @repo/shared exec tsc --noEmit
```

期待: エラー 0 件

### Lint

```bash
pnpm --filter @repo/shared lint
```

期待: PASS

### スコープテスト

```bash
cd packages/shared && pnpm vitest run src/services/search/__tests__/hybrid-rag-factory.test.ts
```

期待: 全テスト PASS

### placeholder 残存確認

```bash
grep -rn "@placeholder" packages/shared/src/services/search/hybrid-rag-factory.ts
grep -rn "FACTORY_NOT_READY" packages/shared/src/services/search/hybrid-rag-factory.ts
```

期待: 両方ともゼロ件

### カバレッジ確認（参考）

```bash
cd packages/shared && pnpm vitest run --coverage src/services/search/__tests__/hybrid-rag-factory.test.ts
```

期待: Lines 80%以上、Functions 80%以上、Branches 60%以上

## カバレッジ目標

| 指標       | repo baseline | task target |
| ---------- | ------------- | ----------- |
| Lines      | 65%           | 80%         |
| Functions  | 80%           | 80%         |
| Branches   | 60%           | 60%         |
| Statements | 65%           | 65%         |

## 既知制約の記録

### KL-01: GraphSearchStrategy の queryType 非伝播

- `HybridRAGEngine` が graph strategy へ `queryType` を渡さない制約は本 task スコープ外とする。
- graph strategy は local mode で動作するため、この制約を defect ではなく limitation として記録する。
- follow-up 候補: `HybridRAGEngine` の queryType 伝播改善タスク

### KL-02: ILLMClient の interface 統一

- shared `ILLMClient`（`../llm/types`）と CRAG `ILLMClient`（`./crag/types`）の統一は本 task スコープ外とする。
- import alias で対応済みであり、別 follow-up として扱う。

## ゲート判定基準

| 判定  | 条件                                                           | 対応                           |
| ----- | -------------------------------------------------------------- | ------------------------------ |
| PASS  | typecheck 0 エラー + lint PASS + 全テスト PASS                 | Phase 10 へ                    |
| MINOR | lint warning あり / coverage target 未達 / limitation 記録あり | 指摘事項を Phase 10 へ引き継ぎ |
| MAJOR | typecheck エラーあり / テスト失敗あり                          | Phase 5 または Phase 8 へ戻る  |

## 統合テスト連携

- `HybridRAGFactory.createFull()` の統合観点は、classifier / 3 strategy / fusion / reranker / CRAG の一括配線が成立しているかで確認する。
- `HybridRAGFactory.createLite()` は rule-based classifier + no-op reranker + null CRAG の軽量構成を維持する。
- `HybridRAGEngine.search()` 側では filters が 3 strategy に伝播し、graph queryType 非伝播は既知制約として回帰ガードする。

## 参照資料

| 資料名                         | パス / 場所                                                                                |
| ------------------------------ | ------------------------------------------------------------------------------------------ |
| quality details                | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md`        |
| coverage baseline              | `.claude/skills/aiworkflow-requirements/references/quality-requirements-advanced.md`       |
| pitfalls                       | `.claude/rules/06-known-pitfalls.md#P19`, `.claude/rules/06-known-pitfalls.md#P62`         |
| Phase 5 実装成果物             | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-5/implementation-plan.md` |
| Phase 7 カバレッジ成果物       | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-7/coverage-report.md`     |
| Phase 8 リファクタリング成果物 | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-8/refactoring-log.md`     |

## 成果物

| 成果物       | パス                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 品質レポート | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-9/quality-report.md` |

## 完了条件

- [ ] typecheck の結果（0 エラー）が記録されている
- [ ] lint の結果（PASS）が記録されている
- [ ] scoped test の結果（全 PASS）が記録されている
- [ ] `@placeholder` / `FACTORY_NOT_READY` ゼロ件が確認されている
- [ ] coverage 数値が記録されている
- [ ] 既知制約（KL-01 / KL-02）が limitation として記録されている
- [ ] Phase 10 の入力に使えるゲート判定が明記されている

## 多角的チェック観点（AIが判断）

1. repo-wide の typecheck failure と task-specific failure を分離できているか。
2. KL-01（queryType 非伝播）を defect と混同して MAJOR 判定していないか。
3. PASS 条件を不当に緩くして coverage 未達を隠蔽していないか。
4. lint warning を MINOR として Phase 10 に正確に引き継いでいるか。

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] 品質ゲートの判定基準が明確であることを確認した
- [ ] 既知制約が defect と区別して記録されていることを確認した
- [ ] Phase 10 へのレビュー材料が揃っていることを確認した

## 次Phase

Phase 10: 最終レビュー → `phase-10-final-review.md`
