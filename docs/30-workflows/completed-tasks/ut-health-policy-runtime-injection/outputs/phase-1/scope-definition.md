# Phase 1: スコープ定義書

## 問題の根本原因

`RuntimeSkillCreatorFacade` が `RuntimePolicyResolver` を生成する際に、
`healthPolicy` を渡していなかった（2引数のみ）。

その結果、`RuntimePolicyResolver` 内の `isDegraded` チェックロジックが
永遠に `false` を返し続ける**デッドコード**状態になっていた。

```
[問題の因果ループ]
healthPolicy 未注入
  → isDegraded 常時 false
  → ヘルスチェック機能デッドコード
  → LLM ヘルス劣化時も正常フロー継続（強化ループ：デッドコードの固定化）
```

---

## 修正スコープ

### 変更ファイル（コード）

| ファイル                                                              | 変更種別 | 変更内容                                      |
| --------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 修正     | `Deps` に `healthPolicy?` 追加、3番目引数渡し |
| `apps/desktop/src/main/ipc/index.ts`                                  | 修正     | `healthPolicy` を生成して `Facade` に渡す     |

### 変更ファイル（テスト）

| ファイル                                                                                     | 変更種別 | 変更内容                                     |
| -------------------------------------------------------------------------------------------- | -------- | -------------------------------------------- |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`         | 修正     | `mockHealthPolicy` 追加、DI テストケース追加 |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`    | 修正     | `isDegraded: true` シナリオテスト追加        |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts` | 修正     | 必要に応じて `mockHealthPolicy` モック追加   |

### スコープ外（変更しない）

- `RuntimePolicyResolver.ts` — 修正不要（3番目引数受け取り済み）
- `packages/shared/src/types/health-policy.ts` — 修正不要（型定義済み）
- Renderer 側のコード — 本タスクのスコープ外

---

## 依存関係・前提条件

| 前提タスク                              | 状態       | 説明                                                                |
| --------------------------------------- | ---------- | ------------------------------------------------------------------- |
| TASK-IMP-HEALTH-POLICY-UNIFICATION-001  | completed  | RuntimePolicyResolver への3番目引数追加・resolveHealthPolicy() 実装 |
| UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 | unassigned | Renderer 側 useMainlineExecutionAccess 移行タスク（本タスクと独立） |

---

## 責務境界

| 責務                        | 担当クラス/ファイル                   |
| --------------------------- | ------------------------------------- |
| `HealthPolicy` の生成       | `index.ts`（DI 組み立て層）           |
| `HealthPolicy` の保持・判断 | `RuntimePolicyResolver`（ポリシー層） |
| `HealthPolicy` の DI 渡し   | `RuntimeSkillCreatorFacade`（Facade） |
| `isDegraded` チェック実行   | `RuntimePolicyResolver`               |
