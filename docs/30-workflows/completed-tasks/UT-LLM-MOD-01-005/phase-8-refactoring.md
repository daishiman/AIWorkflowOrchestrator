# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング（TDD: Refactor） |
| 前提Phase  | Phase 7                           |
| 後続Phase  | Phase 9                           |
| ステータス | 完了                              |
| 作成日     | 2026-03-25                        |
| 機能名     | UT-LLM-MOD-01-005                 |

---

## 目的

TDD の Refactor フェーズとして、Phase 5〜7 で実装した provider-registry.ts のコード品質を改善する。llm.ts から削除された PROVIDER_CONFIGS / inferProviderId の残骸を確認し、重複排除とコードの構造的改善を行う。

---

## 背景

Phase 7 でカバレッジ基準を達成済み。TDD の Refactor フェーズとして、機能を変えずにコード品質を改善する。llm.ts の残骸削除、命名・構造の最適化、重複排除を行い、リファクタリング後もテストが全て PASS することを確認する。

---

## 実行タスク

### Task 8-1: llm.ts の残骸確認・クリーンアップ

llm.ts から `PROVIDER_CONFIGS` と `inferProviderId` のローカル定義が完全に削除されていることを確認する。

```bash
# PROVIDER_CONFIGS のローカル定義が残っていないことを確認
grep -n "PROVIDER_CONFIGS" apps/desktop/src/main/handlers/llm.ts

# inferProviderId のローカル定義が残っていないことを確認
grep -n "function inferProviderId" apps/desktop/src/main/handlers/llm.ts

# import 文で shared から正しく import されていることを確認
grep -n "import.*PROVIDER_CONFIGS\|import.*inferProviderId" apps/desktop/src/main/handlers/llm.ts
```

**確認事項**:

- `PROVIDER_CONFIGS` は import 文でのみ参照されていること
- `inferProviderId` は import 文でのみ参照されていること
- ローカル関数・定数定義として残っていないこと
- コメントアウトされた旧コードが残っていないこと

### Task 8-2: provider-registry.ts のコード品質改善

以下の観点でコード品質を改善する:

1. **命名の一貫性**:
   - `ProviderConfigEntry` / `ProviderModelEntry` の命名が適切か
   - `PROVIDER_IDS` の命名が明確か（`PROVIDER_ID_TUPLE` への変更を検討）
   - export された関数・型名がドメインコンテキストで理解しやすいか

2. **構造の改善**:
   - JSDoc コメントが全 export に記載されているか
   - `as const satisfies` の型アサーションが適切か
   - `[string, ...string[]]` のキャストが最小限であるか

3. **定数の整理**:
   - `modelPrefixes` の順序が論理的か（長い prefix → 短い prefix の順）
   - OpenRouter の `specialMatcher` が明確にドキュメントされているか

### Task 8-3: 重複排除の確認

プロジェクト全体で以下の重複がないことを確認する:

```bash
# 手動の provider ID enum 定義がないことを確認
grep -rn "z.enum\[" packages/shared/src/types/llm/

# inferProviderId の手動実装がないことを確認
grep -rn "function inferProviderId" apps/desktop/ packages/shared/

# PROVIDER_CONFIGS の手動定義がないことを確認
grep -rn "PROVIDER_CONFIGS\s*=" apps/desktop/ packages/shared/
```

### Task 8-4: リファクタリング後のテスト実行

全テストが引き続きPASSすることを確認する:

```bash
pnpm test
```

---

## 参照資料

| 参照資料          | パス                                                         | 内容                 |
| ----------------- | ------------------------------------------------------------ | -------------------- |
| Phase 2 設計      | `phase-2-design.md`                                          | アーキテクチャ設計   |
| Phase 5 実装      | `phase-5-implementation.md`                                  | 実装内容             |
| Provider Registry | `packages/shared/src/types/llm/schemas/provider-registry.ts` | SSoT 定義ファイル    |
| LLM Handlers      | `apps/desktop/src/main/handlers/llm.ts`                      | リファクタリング対象 |

---

## 統合テスト連携

| 確認事項                               | 基準                                                 | 判定 |
| -------------------------------------- | ---------------------------------------------------- | ---- |
| 既存 import パスが不変であること       | `LLMProviderIdSchema` の import 元が変更されていない | -    |
| `inferProviderId` の呼び出し箇所の整合 | llm.ts 内の全呼び出し箇所が正常に動作すること        | -    |
| re-export チェーンの検証               | index.ts → provider-registry.ts の re-export が正常  | -    |

---

## 成果物

| 成果物               | パス                                    | 内容                 |
| -------------------- | --------------------------------------- | -------------------- |
| リファクタリング結果 | `outputs/phase-8/refactoring-record.md` | コード品質改善の記録 |

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test -- --run provider-registry
pnpm --filter @repo/desktop test -- --run llm
pnpm test
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認
- [ ] テストの実行結果がPhase 6/7と同一であることを確認

---

## 完了条件

- [ ] llm.ts から PROVIDER_CONFIGS / inferProviderId のローカル定義が完全に削除されている
- [ ] provider-registry.ts の命名・構造が改善されている
- [ ] JSDoc コメントが全 export に記載されている
- [ ] プロジェクト全体で手動の provider ID enum 定義が存在しない
- [ ] プロジェクト全体で inferProviderId の手動実装が存在しない
- [ ] PROVIDER_CONFIGS の定義が provider-registry.ts のみに存在する
- [ ] `pnpm test` が全PASS
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005 --phase 8
```

---

## Phase実行記録

Phase完了後、以下を記録してください:

## Phase 8 実行記録

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

Phase 9: 品質保証

`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/phase-9-*.md`
