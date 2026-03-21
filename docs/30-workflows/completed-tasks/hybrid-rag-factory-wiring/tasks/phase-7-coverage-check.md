# Phase 7: カバレッジ確認 - HybridRAGFactory.createFull/createLite 実配線

## メタ情報

| 項目          | 値                                                          |
| ------------- | ----------------------------------------------------------- |
| タスクID      | UT-RAG-08-002                                               |
| Phase         | 7 - カバレッジ確認                                          |
| 前提Phase     | Phase 6: テスト拡充                                         |
| 次Phase       | Phase 8: リファクタリング                                   |
| 対象ファイル  | `packages/shared/src/services/search/hybrid-rag-factory.ts` |
| 作成日        | 2026-03-20                                                  |
| 前Phase成果物 | `outputs/phase-6/regression-plan.md`                        |

## 目的

Phase 6 までに作成したテストで、タスク対象ファイルのカバレッジ基準を達成しているかを測定する。未達の場合は Phase 6 に戻って追加テストを作成する。

## 実行タスク

- scoped coverage 実行: `hybrid-rag-factory.ts` を対象に Line / Branch / Function カバレッジを測定する
- baseline 比較: タスク基準とリポジトリ baseline の両方を判定する
- 統合テスト再実行: createFull() / createLite() で生成した Engine の search() 疎通を確認する
- 未達記録: カバレッジ未達の場合は Phase 6 に戻る判定を行う

## カバレッジ基準

| 指標              | タスク最低基準 | タスク推奨基準 | リポジトリ baseline |
| ----------------- | -------------- | -------------- | ------------------- |
| Line Coverage     | 80%            | 90%            | 80%                 |
| Branch Coverage   | 60%            | 70%            | 60%                 |
| Function Coverage | 80%            | 90%            | 80%                 |

## 実行手順

### Step 1: scoped coverage 測定

```bash
cd packages/shared && pnpm vitest run \
  --coverage \
  --coverage.include="src/services/search/hybrid-rag-factory.ts" \
  src/services/search/__tests__/hybrid-rag-factory.test.ts
```

### Step 2: カバレッジ結果の記録

以下のフォーマットで結果を記録する:

| 指標              | 測定値 | 最低基準 | 判定        |
| ----------------- | ------ | -------- | ----------- |
| Line Coverage     | \_\_%  | 80%      | PASS / FAIL |
| Branch Coverage   | \_\_%  | 60%      | PASS / FAIL |
| Function Coverage | \_\_%  | 80%      | PASS / FAIL |

### Step 3: 統合テスト再実行

```bash
cd packages/shared && pnpm vitest run \
  src/services/search/__tests__/hybrid-rag-factory.test.ts
```

全テスト（TC-01〜TC-16 + ETC-01〜ETC-10）が PASS していることを確認する。

### Step 4: 判定

| 判定          | 対応                                           |
| ------------- | ---------------------------------------------- |
| 全基準 PASS   | Phase 8（リファクタリング）へ進む              |
| いずれか FAIL | Phase 6 に戻り、未カバー分岐のテストを追加する |

### Step 5: 未カバー分岐の特定（FAIL の場合）

```bash
cd packages/shared && pnpm vitest run \
  --coverage \
  --coverage.include="src/services/search/hybrid-rag-factory.ts" \
  --coverage.reporter=text \
  src/services/search/__tests__/hybrid-rag-factory.test.ts
```

`Uncovered Line #s` カラムから未カバー行を特定し、Phase 6 への戻り指示に含める。

## カバレッジ不足が予測される箇所

Phase 4-6 のテスト設計に基づき、以下の箇所がカバレッジ不足になる可能性がある:

| 箇所                             | 理由                                                     | 対策                                 |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| createCRAG() 内部                | CRAG の全オプション組み合わせをテストしていない可能性    | ETC-01 で主要オプションは検証済み    |
| createReranker() の Voyage 分岐  | VoyageReranker のオプション渡しが未検証の可能性          | TC-03 で基本検証済み、ETC で拡充可能 |
| adapter ロジック（該当する場合） | DT-01 選択肢未確定のため、adapter テストが未実装の可能性 | ETC-10 で対応予定                    |

## 参照資料

| 資料名                        | パス / 場所                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| Phase 4 テスト仕様            | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-4-test-creation.md`         |
| Phase 5 実装仕様              | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-5-implementation.md`        |
| Phase 6 テスト拡充仕様        | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/phase-6-test-expansion.md`        |
| quality-requirements-details  | `.claude/skills/aiworkflow-requirements/references/quality-requirements-details.md`  |
| quality-requirements-advanced | `.claude/skills/aiworkflow-requirements/references/quality-requirements-advanced.md` |

## 成果物

| 成果物             | パス                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------- |
| カバレッジレポート | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-7/coverage-report.md`  |
| 統合テスト結果     | `docs/30-workflows/hybrid-rag-factory-wiring/tasks/outputs/phase-7/integration-test.md` |

## 完了条件

- [ ] scoped coverage（hybrid-rag-factory.ts 対象）の測定結果が取得されている
- [ ] Line Coverage 80%+、Branch Coverage 60%+、Function Coverage 80%+ の全基準を満たしている
- [ ] 全テスト（TC + ETC）が PASS している
- [ ] カバレッジ未達の場合、未カバー行が特定され Phase 6 への戻り指示が記録されている
- [ ] 統合テスト（createFull() / createLite() → search() 疎通）の結果が記録されている

## 統合テスト連携

- createFull() / createLite() で生成した Engine の search() 疎通を確認する
- Engine contract の limitation（graph queryType 非伝播）がテスト期待値と一致していることを確認する
- scoped coverage が repo-wide ノイズと混同されていないことを確認する

## 多角的チェック観点（AIが判断）

1. **scoped coverage の include path**: `--coverage.include` パスが実在する `hybrid-rag-factory.ts` のみを対象としているか。adapter ファイルが別ファイルに分離された場合は、そのファイルも include に追加する必要がある
2. **repo-wide ノイズ**: scoped coverage と repo-wide coverage を混同しないこと。本 Phase ではタスク対象ファイルのみを測定する
3. **v8 カバレッジプロバイダの特性（P41）**: インライン arrow function が独立した関数としてカウントされるため、Function Coverage が想定より低くなる可能性がある。Config のオプションオブジェクト内のコールバックが該当しないかを確認する

## タスク100%実行確認【必須】

- [ ] 本仕様書の全セクションを読み通し、漏れがないことを確認した
- [ ] カバレッジ判定の基準が明確であることを確認した
- [ ] 未達時の Phase 6 への戻り手順が明確であることを確認した
- [ ] 次 Phase（Phase 8: リファクタリング）への引き継ぎ情報が十分であることを確認した

## 次Phase

Phase 8: リファクタリング → `phase-8-refactoring.md`
