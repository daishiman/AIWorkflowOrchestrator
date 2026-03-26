# task-llm-adapter-factory-provider-ids-ssot - タスク指示書

## メタ情報

```yaml
issue_number: 1638
task_id: task-llm-adapter-factory-provider-ids-ssot
task_name: LLMAdapterFactory の SUPPORTED_PROVIDER_IDS を provider-registry.ts 由来に寄せる
category: リファクタリング
target_feature: LLMAdapterFactory の provider ID 検証 / provider-registry.ts の SSoT 化
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-03-25
spec_path: docs/30-workflows/unassigned-task/task-llm-adapter-factory-provider-ids-ssot.md
related_tasks: [UT-LLM-MOD-01-005]
```

| 項目         | 内容                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | `task-llm-adapter-factory-provider-ids-ssot`                                                                             |
| タスク名     | `LLMAdapterFactory` の `SUPPORTED_PROVIDER_IDS` を `provider-registry.ts` 由来に寄せる                                   |
| 分類         | リファクタリング                                                                                                         |
| 対象機能     | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` / `packages/shared/src/types/llm/schemas/provider-registry.ts` |
| 優先度       | 中                                                                                                                       |
| 見積もり規模 | 小規模                                                                                                                   |
| ステータス   | 未実施                                                                                                                   |
| 発見元       | UT-LLM-MOD-01-005 Phase 12                                                                                               |
| 発見日       | 2026-03-25                                                                                                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-LLM-MOD-01-005 で `PROVIDER_CONFIGS` を SSoT に整理したが、`LLMAdapterFactory.ts` にはまだ `SUPPORTED_PROVIDER_IDS` の手動列挙が残っている。`provider-registry.ts` の `PROVIDER_IDS` を正本に寄せ切れていないため、プロバイダー追加時に更新漏れの余地が残る。

### 1.2 問題点・課題

- `LLMAdapterFactory.ts` の `SUPPORTED_PROVIDER_IDS` は `openai`, `anthropic`, `google`, `xai`, `openrouter` を手作業で持っている。
- `provider-registry.ts` では `PROVIDER_CONFIGS` から `PROVIDER_IDS` を自動導出しているのに、アダプターファクトリー側だけ別管理になっている。
- もし新しい provider を追加しても、`PROVIDER_IDS` と `SUPPORTED_PROVIDER_IDS` の両方を更新しないと整合しない。

### 1.3 放置した場合の影響

- provider 追加時の更新箇所が増え、SSoT の効果が薄れる。
- 一方だけ更新された状態で `getAllProviderIds()` が古い一覧を返すと、UI や検証処理で不整合が起きる。
- 似た修正を今後も繰り返すことになり、ドリフトが再発しやすい。

---

## 2. 何を達成するか（What）

### 2.1 目的

`LLMAdapterFactory` の provider ID 一覧を `provider-registry.ts` の `PROVIDER_IDS` に統一し、provider ID の正本を 1 箇所に固定する。

### 2.2 最終ゴール

1. `LLMAdapterFactory.ts` から `SUPPORTED_PROVIDER_IDS` の手動列挙がなくなる。
2. `getAllProviderIds()` が `PROVIDER_IDS` 由来の値を返す。
3. provider 追加時の更新元が `provider-registry.ts` に集約される。
4. 既存テストが新しい参照経路に追従する。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` の provider ID 管理見直し
- `packages/shared/src/types/llm/schemas/index.ts` からの `PROVIDER_IDS` 利用確認
- 既存テストの期待値更新

#### 含まないもの

- `provider-registry.ts` のモデル定義そのものの変更
- 新しい provider の追加
- `handleGetProviders()` の readonly bridge 解消

### 2.4 成果物

- `LLMAdapterFactory.ts` の provider ID 正本化
- 関連テストの更新
- Phase 12 の未タスク記録

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared/src/types/llm/schemas/provider-registry.ts` が既に存在すること
- `PROVIDER_IDS` が `provider-registry.ts` から導出されていること
- `LLMAdapterFactory.ts` が `@repo/shared/types/llm/schemas` を import できること

### 3.2 依存タスク

- 依存タスク: `UT-LLM-MOD-01-005`
- 関連 follow-up: `task-llm-handle-get-providers-readonly-models`

### 3.3 必要な知識

- TypeScript の readonly 配列と `as const` の扱い
- shared package から main process への import 境界
- テストの期待値を SSoT に合わせて更新する方法

### 3.4 推奨アプローチ

1. `LLMAdapterFactory.ts` の `SUPPORTED_PROVIDER_IDS` を削除する。
2. `getAllProviderIds()` を `PROVIDER_IDS` のコピー返却に置き換える。
3. 必要なら `PROVIDER_IDS` を `@repo/shared/types/llm/schemas` から import する。
4. テストで provider ID の一覧と順序が `provider-registry.ts` と一致することを確認する。

---

## 4. 実行手順

### Phase 1: 現状確認

#### 目的

`LLMAdapterFactory.ts` に残っている手動列挙箇所を特定する。

#### 手順

1. `SUPPORTED_PROVIDER_IDS` の定義箇所を確認する。
2. `getAllProviderIds()` がどの配列を返しているか確認する。
3. `provider-registry.ts` の `PROVIDER_IDS` と比較する。

#### 成果物

- 変更対象の差分整理

#### 完了条件

- 手動列挙を置換すべき箇所が 1 箇所に絞れている。

### Phase 2: 実装

#### 目的

`LLMAdapterFactory` の provider ID を `PROVIDER_IDS` へ統一する。

#### 手順

1. `SUPPORTED_PROVIDER_IDS` 定義を削除または使用停止する。
2. `PROVIDER_IDS` を import して `getAllProviderIds()` の戻り値に使う。
3. 型が必要なら `LLMProviderId[]` と `PROVIDER_IDS` の関係を保つ。

#### 成果物

- 更新済み `LLMAdapterFactory.ts`

#### 完了条件

- `LLMAdapterFactory.ts` 内に provider ID の手動列挙が残っていない。

### Phase 3: テスト更新

#### 目的

SSoT 化後の挙動をテストで固定する。

#### 手順

1. `getAllProviderIds()` の期待値を `PROVIDER_IDS` と一致させる。
2. provider ID が `PROVIDER_CONFIGS` の追加に追従することを確認する。
3. 既存テストが手動列挙に依存していれば修正する。

#### 成果物

- 更新済みテスト

#### 完了条件

- provider 一覧の期待値が `provider-registry.ts` の正本に一致する。

### Phase 4: 検証と記録

#### 目的

変更後に整合性を確認し、Phase 12 の未タスクとして記録する。

#### 手順

1. 変更差分を確認する。
2. 必要なら関連テストを実行する。
3. 未タスク仕様書と Phase 12 記録を同期する。

#### 成果物

- 検証メモ
- Phase 12 反映記録

#### 完了条件

- `SUPPORTED_PROVIDER_IDS` の手動維持が不要になっている。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `LLMAdapterFactory.ts` に `SUPPORTED_PROVIDER_IDS` の手動列挙が残っていない
- [ ] `getAllProviderIds()` が `PROVIDER_IDS` 由来の値を返している
- [ ] provider 追加時の正本が `provider-registry.ts` に統一されている

### 品質要件

- [ ] `LLMAdapterFactory.ts` が shared の SSoT に従っている
- [ ] provider ID の重複管理がなくなっている
- [ ] 関連テストが新しい正本に追従している

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow-backlog.md` または関連 ledger に追記できる状態になっている
- [ ] 苦戦箇所が `Why` と `備考` に明示されている

---

## 6. 検証方法

### テストケース

- `LLMAdapterFactory.getAllProviderIds()` の戻り値が `PROVIDER_IDS` と一致する
- `provider-registry.ts` に provider を追加したとき、factory 側で別管理の更新が不要である
- 既存の provider 判定・生成処理が壊れていない

### 検証手順

1. `LLMAdapterFactory.ts` の import と戻り値を確認する。
2. `provider-registry.ts` の `PROVIDER_IDS` を参照することを grep で確認する。
3. テスト実行で provider 一覧の期待値が一致することを確認する。

---

## 7. リスクと対策

| リスク                                                | 影響度 | 発生確率 | 対策                                             |
| ----------------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| `getAllProviderIds()` の戻り値型が崩れる              | 中     | 低       | `LLMProviderId[]` と `PROVIDER_IDS` の関係を保つ |
| 既存テストが手動列挙順序に依存している                | 中     | 中       | 期待値を `PROVIDER_IDS` に合わせて修正する       |
| `SUPPORTED_PROVIDER_IDS` を消したことで参照漏れが出る | 高     | 低       | grep で参照箇所を確認してから削除する            |

---

## 8. 参照情報

### 関連ドキュメント

- [`docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/index.md`](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260325-104650-wt-5/docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/index.md)
- [Phase 12 未タスク検出](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260325-104650-wt-5/docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/outputs/phase-12/unassigned-task-detection.md)
- [Phase 12 システム仕様更新サマリー](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260325-104650-wt-5/docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/outputs/phase-12/system-spec-update-summary.md)
- [Phase 12 ドキュメント更新履歴](/Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260325-104650-wt-5/docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/outputs/phase-12/documentation-changelog.md)

### 参考資料

- `packages/shared/src/types/llm/schemas/provider-registry.ts`
- `packages/shared/src/types/llm/schemas/index.ts`
- `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
`apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts` の `SUPPORTED_PROVIDER_IDS` がハードコードされており、`provider-registry.ts` の `PROVIDER_IDS` から自動導出されていない。SSoT原則に反する残存箇所を解消する。
```

### 補足事項

- 本タスクは UT-LLM-MOD-01-005 の Phase 12 で見つかった follow-up である。
- `provider-registry.ts` を正本にする流れを崩さないことが重要で、`LLMAdapterFactory.ts` 側だけを局所修正しない。
- `handleGetProviders()` の readonly bridge 解消は別タスクとして切り出して扱う。
