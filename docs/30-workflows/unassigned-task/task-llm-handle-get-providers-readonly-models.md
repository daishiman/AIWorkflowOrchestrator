# task-llm-handle-get-providers-readonly-models - タスク指示書

## メタ情報

```yaml
issue_number: 1639
task_id: task-llm-handle-get-providers-readonly-models
task_name: handleGetProviders の readonly models bridge 解消
category: 改善
target_feature: LLM provider readonly surface / handleGetProviders bridge
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-LLM-MOD-01-005 Phase 12 未タスク検出
created_date: 2026-03-25
spec_path: docs/30-workflows/unassigned-task/task-llm-handle-get-providers-readonly-models.md
related_tasks: [UT-LLM-MOD-01-005, task-llm-adapter-factory-provider-ids-ssot]
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | task-llm-handle-get-providers-readonly-models                |
| タスク名     | handleGetProviders の readonly models bridge 解消            |
| 分類         | 改善                                                         |
| 対象機能     | `apps/desktop/src/main/handlers/llm.ts` の provider 取得処理 |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | UT-LLM-MOD-01-005 Phase 12 未タスク検出                      |
| 発見日       | 2026-03-25                                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`UT-LLM-MOD-01-005` で `PROVIDER_CONFIGS` を SSoT に集約した結果、`handleGetProviders()` の実装は `provider-registry.ts` 由来の `readonly models` を Main 側で返す境界に変わった。現状は `models: [...config.models]` により mutable 配列へ橋渡ししており、型と実装の間に余計な変換が残っている。

### 1.2 問題点・課題

- `provider-registry.ts` 側は `readonly ProviderModelEntry[]` を採用している一方、`LLMProvider` 側は mutable 配列を前提にしているため、Main 側で毎回 spread が必要になっている。
- `handleGetProviders()` は読み取り専用のデータを返すだけなのに、実装上は「コピーして mutable 化する」意図が入り込み、表面契約が見えにくい。
- readonly 化の方針を固めないままだと、今後も似た bridge が他の IPC / API surface に増えやすい。

### 1.3 放置した場合の影響

- provider 取得処理が「単純な参照返却」ではなくなり、読み手が本質的な責務を追いづらくなる。
- 型変換が残ることで、将来 `provider-registry.ts` と `LLMProvider` の契約差が再び広がる可能性がある。
- bridge の存在理由がドキュメント化されないと、後続の修正で不要なコピー削除や型変更を誤って行いやすい。

---

## 2. 何を達成するか（What）

### 2.1 目的

`handleGetProviders()` の provider 返却を、readonly を正とするか surface 側で mutable を維持するかを明確に決めたうえで、不要な spread bridge を解消する。

### 2.2 最終ゴール

1. `handleGetProviders()` の `models: [...config.models]` が、設計上必要な理由を持っているか、不要なら削除されている。
2. `LLMProvider` 型と `provider-registry.ts` の `ProviderModelEntry` の責務境界が明文化されている。
3. 変更後も `getProviders` の利用側が型エラーなく動作し、provider 一覧の表示・選択に影響しない。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/handlers/llm.ts` の `handleGetProviders()` から `models: [...config.models]` bridge を見直す
- `packages/shared/src/types/llm/schemas/provider.ts` の `LLMProvider` / schema 側の readonly 方針検討
- 必要なら `packages/shared/src/types/llm/schemas/provider-registry.ts` と `index.ts` の契約確認
- 関連テストの更新

#### 含まないもの

- `PROVIDER_CONFIGS` のモデル一覧そのものの改変
- 新規 provider 追加
- `LLMAdapterFactory` の `SUPPORTED_PROVIDER_IDS` 置換

### 2.4 成果物

- `handleGetProviders()` の bridge 方針が反映されたコード
- `LLMProvider` / `ProviderModelEntry` の契約方針が明確な型定義
- 関連テスト更新
- 必要なら Phase 12 未タスク検出レポートへの反映

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `UT-LLM-MOD-01-005` が Phase 12 まで完了している
- `provider-registry.ts` が `PROVIDER_CONFIGS` の正本である
- `handleGetProviders()` は provider 一覧の読み取り用途に限定される

### 3.2 依存タスク

- 依存必須: `UT-LLM-MOD-01-005`
- 参考タスク: `task-llm-adapter-factory-provider-ids-ssot`

### 3.3 必要な知識

- TypeScript の `readonly` と mutable 配列の違い
- Electron Main Process の IPC 返却契約
- shared schema と renderer 利用側の型整合

### 3.4 推奨アプローチ

1. `LLMProvider` の models を readonly に寄せるか、Main surface だけ mutable を保持するかを決める。
2. readonly 化できるなら `handleGetProviders()` の spread を削除し、返却をそのまま流す。
3. mutable surface を維持するなら、その理由を `provider.ts` と実装コメントで明文化する。
4. 変更後に型チェックと provider schema テストを実行する。

### 3.5 分岐の判断基準

| 選択肢       | 採用条件                                  | 利点                | 注意点                                      |
| ------------ | ----------------------------------------- | ------------------- | ------------------------------------------- |
| readonly 化  | 利用側が provider list を破壊的変更しない | bridge を削除できる | 既存 UI 側で mutable 前提が残ると修正が必要 |
| surface 維持 | 既存利用側の互換性を最優先する            | 影響範囲が小さい    | spread bridge が残り、責務境界はやや弱い    |

---

## 4. 実行手順

### Phase構成

- Phase 1: 契約確認
- Phase 2: 型方針決定
- Phase 3: 実装修正
- Phase 4: テスト・検証

### Phase 1: 契約確認

#### 目的

`handleGetProviders()` が何を返すべきかを型境界から確認する。

#### 手順

1. `packages/shared/src/types/llm/schemas/provider.ts` の `LLMProvider` 定義を確認する。
2. `packages/shared/src/types/llm/schemas/provider-registry.ts` の `models` 型と整合を確認する。
3. `apps/desktop/src/main/handlers/llm.ts` の返却値の用途を確認する。

#### 成果物

- 方針メモ

#### 完了条件

- readonly 化するか surface 維持するかを決められる状態になっている。

### Phase 2: 型方針決定

#### 目的

bridge を消すか残すかを実装方針として固定する。

#### 手順

1. 利用側で models の破壊的変更が必要かを確認する。
2. 不要なら `LLMProvider` を readonly 寄りに変更する。
3. 必要なら `handleGetProviders()` の bridge を残し、その理由を明文化する。

#### 成果物

- 型方針の確定

#### 完了条件

- 実装方針が 1 つに固定されている。

### Phase 3: 実装修正

#### 目的

選択した方針をコードへ反映する。

#### 手順

1. readonly 化する場合は `handleGetProviders()` の `[...config.models]` を削除する。
2. surface 維持する場合は bridge を残し、理由をコメントまたは型で補強する。
3. `provider.ts` の schema / 型定義を方針に合わせて更新する。

#### 成果物

- `llm.ts`
- `provider.ts`

#### 完了条件

- 返却契約と実装が一致している。

### Phase 4: テスト・検証

#### 目的

変更後も provider 一覧取得が安定していることを確認する。

#### 手順

1. provider schema 関連テストを更新する。
2. 必要なら `handleGetProviders()` のテスト観点を追加する。
3. typecheck と対象テストを実行する。

#### 成果物

- 更新済みテスト
- 検証結果

#### 完了条件

- 型チェックと provider 関連テストが PASS する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `handleGetProviders()` の bridge 方針が確定している
- [ ] `models: [...config.models]` の要否が明確になっている
- [ ] `provider.ts` の契約が方針と整合している

### 品質要件

- [ ] 型変換の理由がコード上で追える
- [ ] 返却契約が renderer 側と矛盾しない
- [ ] 必要なテストが PASS している

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に存在する
- [ ] `task-workflow` または関連 ledger への登録が可能な粒度で書かれている
- [ ] 苦戦箇所と選択肢が明記されている

---

## 6. 検証方法

### テストケース

- Case 1: `handleGetProviders()` が provider 一覧を返し、UI が変わらず表示できる
- Case 2: readonly 化した場合、models の破壊的変更がコンパイルで防がれる
- Case 3: surface 維持した場合、bridge の意図が明文化されている

### 検証手順

1. `provider.ts` と `provider-registry.ts` の型整合を確認する。
2. `apps/desktop/src/main/handlers/llm.ts` の返却値を確認する。
3. `pnpm` 系の typecheck と provider schema テストを実行する。

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                               |
| ---------------------------------------------- | ------ | -------- | ---------------------------------- |
| readonly 化で既存 UI が mutable 前提のまま残る | 中     | 中       | 利用側の参照パターンを先に確認する |
| bridge を残したまま責務が曖昧になる            | 低     | 中       | コメントと型で理由を明示する       |
| provider schema の変更が renderer 側へ波及する | 中     | 低       | 関連テストを更新して回帰を防ぐ     |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/index.md`
- `docs/30-workflows/completed-tasks/UT-LLM-MOD-01-005/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`
- `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`

### 参考資料

- `apps/desktop/src/main/handlers/llm.ts`
- `packages/shared/src/types/llm/schemas/provider.ts`
- `packages/shared/src/types/llm/schemas/provider-registry.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
`handleGetProviders()` の `models: [...config.models]` spread を除去するか、readonly surface を維持する理由を明文化する。
```

### 苦戦箇所

- `provider-registry.ts` 側は readonly を正とする設計に寄っているのに、Main 側の返却 surface は mutable を前提にしているため、どこで橋渡しするかが曖昧になりやすい。
- spread を消すだけでは終わらず、`provider.ts` の schema と UI 側利用の整合まで確認しないと、型だけ先に崩れる可能性がある。
- 「readonly に寄せる」か「surface を維持する」かは単純な好みではなく、今後の provider 返却 API 全体の方針に影響する。

### 補足事項

- Issue manager で同期する場合は、`task_id` と `task_name` をそのまま使用できる。
- `UT-LLM-MOD-01-005` の派生未タスクとして扱う。
