# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容              |
| ---------- | ----------------- |
| Phase      | 7                 |
| Phase名    | カバレッジ確認    |
| 前提Phase  | Phase 6           |
| 後続Phase  | Phase 8           |
| ステータス | 完了              |
| 作成日     | 2026-03-25        |
| 機能名     | UT-LLM-MOD-01-005 |

---

## 目的

Phase 5 で実装し Phase 6 で拡充したテストのカバレッジを測定し、品質基準を満たしていることを確認する。カバレッジ不足箇所があれば追加テストを作成する。

---

## 背景

Phase 6 でテスト拡充が完了。カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）の達成を確認する。未達の場合は Phase 6 に戻りテストを追加する。

---

## 実行タスク

1. shared schema テストのカバレッジを測定する。
2. `provider-registry.ts` と `provider.ts` の Line / Branch / Function 基準を確認する。
3. 未到達行・未到達分岐を分析し、追加テストの必要性を判定する。
4. 最終的なカバレッジ結果を成果物へ記録する。

### Task 1: カバレッジ測定

対象ファイル:

| ファイル                                                     | 役割                        |
| ------------------------------------------------------------ | --------------------------- |
| `packages/shared/src/types/llm/schemas/provider-registry.ts` | SSoT 定義 + inferProviderId |
| `packages/shared/src/types/llm/schemas/provider.ts`          | LLMProviderIdSchema 定義    |

実行コマンド:

```bash
pnpm --filter @repo/shared test -- --run --coverage
```

### Task 2: カバレッジ基準の確認

| メトリクス | 目標値 | 測定対象                                       |
| ---------- | ------ | ---------------------------------------------- |
| Line       | 80%+   | provider-registry.ts, provider.ts              |
| Branch     | 60%+   | provider-registry.ts（inferProviderId の分岐） |
| Function   | 80%+   | provider-registry.ts, provider.ts              |

### Task 3: カバレッジ不足箇所の分析

カバレッジレポートから未カバー箇所を特定し、以下の観点で分析する:

| 分析観点                    | 確認内容                                                  |
| --------------------------- | --------------------------------------------------------- |
| 未到達行                    | テストで実行されていない行があるか                        |
| 未到達分岐                  | `inferProviderId` の if/else 分岐で未テストのパスがあるか |
| 未呼び出し関数              | export されている関数で未テストのものがあるか             |
| `specialMatcher` カバレッジ | OpenRouter の specialMatcher がテストで呼び出されているか |

### Task 4: 追加テスト作成（必要な場合）

カバレッジ基準を満たしていない場合、不足箇所を補うテストを追加する。

```bash
# 追加テスト後の再測定
pnpm --filter @repo/shared test -- --run --coverage
```

### Task 5: 最終確認

全テストスイートの PASS とカバレッジ基準の達成を最終確認する。

```bash
# shared パッケージのテスト + カバレッジ
pnpm --filter @repo/shared test -- --run --coverage

# desktop パッケージの回帰テスト
pnpm --filter @repo/desktop test -- --run

# 全パッケージの型チェック
pnpm typecheck
```

---

## 参照資料

| 参照資料           | パス                                                                        | 内容               |
| ------------------ | --------------------------------------------------------------------------- | ------------------ |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                                                  | 基本テスト仕様     |
| Phase 5 実装       | `phase-5-implementation.md`                                                 | 実装内容           |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                                 | エッジケーステスト |
| テストファイル     | `packages/shared/src/types/llm/schemas/__tests__/provider-registry.test.ts` | テスト実装         |

---

## 統合テスト連携

| 接続ポイント              | 確認内容                                            |
| ------------------------- | --------------------------------------------------- |
| provider-registry.ts 全行 | SSoT 定義の全行がテストで到達されている             |
| inferProviderId 全分岐    | specialMatcher / modelPrefixes / null 返却の全分岐  |
| provider.ts 導出ロジック  | PROVIDER_IDS → LLMProviderIdSchema の導出行がカバー |

---

## 成果物

| 成果物               | パス                                 | 内容               |
| -------------------- | ------------------------------------ | ------------------ |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md` | カバレッジ測定結果 |
| 追加テスト（該当時） | `provider-registry.test.ts`（更新）  | 不足分のテスト追加 |

---

## 完了条件

- [ ] `pnpm --filter @repo/shared test -- --run --coverage` が実行されている
- [ ] `provider-registry.ts` の Line カバレッジが 80% 以上
- [ ] `provider-registry.ts` の Branch カバレッジが 60% 以上
- [ ] `provider-registry.ts` の Function カバレッジが 80% 以上
- [ ] `provider.ts` の Line カバレッジが 80% 以上
- [ ] `provider.ts` の Function カバレッジが 80% 以上
- [ ] カバレッジ不足箇所がある場合、追加テストで補填されている
- [ ] 全テスト PASS
- [ ] `pnpm typecheck` が全パッケージで PASS
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 7
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 7 実行記録

### 実行タスク

| タスク | 結果 | 備考 |
| ------ | ---- | ---- |

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

- ***

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-8-*.md`
