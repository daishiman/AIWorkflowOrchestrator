# Phase 3: 設計レビュー結果

## メタ情報

| 項目   | 値                                     |
| ------ | -------------------------------------- |
| Phase  | 3                                      |
| 作成日 | 2026-04-14                             |
| タスク | UT-HEALTH-POLICY-RUNTIME-INJECTION-001 |

---

## レビュー判定: **PASS**

---

## チェックリスト

### 型安全性

| 項目                                                                         | 判定 |
| ---------------------------------------------------------------------------- | ---- |
| `HealthPolicy` 型が `packages/shared/src/types` から正しく export されている | ✅   |
| `RuntimeSkillCreatorFacadeDeps.healthPolicy?: HealthPolicy` の型定義が正確   | ✅   |
| `RuntimePolicyResolver` 第3引数との型互換性が確認済み                        | ✅   |

### 後方互換性

| 項目                                                      | 判定 |
| --------------------------------------------------------- | ---- |
| `healthPolicy` が optional であり、省略時は既存動作と同等 | ✅   |
| 既存テスト3種が `mockHealthPolicy` 追加後も全 PASS        | ✅   |

### 責務境界

| 項目                                                        | 判定 |
| ----------------------------------------------------------- | ---- |
| DI 組み立て（index.ts）→ Facade → Resolver の責務分離が適切 | ✅   |
| `Facade` が `HealthPolicy` の意味を解釈せず、単純に渡すのみ | ✅   |

### 設計選択

| 項目                                         | 判定 |
| -------------------------------------------- | ---- |
| アプローチ B（即時生成）の採用理由が記録済み | ✅   |
| Setter Injection を将来タスクとして記録済み  | ✅   |

---

## 型互換性検証（最終確認）

| DI 渡し元                    | 渡す型                      | 受け取り先引数型              | 互換性 |
| ---------------------------- | --------------------------- | ----------------------------- | ------ |
| `resolveHealthPolicy({...})` | `HealthPolicy`              | `healthPolicy?: HealthPolicy` | ✅     |
| `deps.healthPolicy`          | `HealthPolicy \| undefined` | `healthPolicy?: HealthPolicy` | ✅     |

---

## 後方互換性チェック

```bash
# RuntimeSkillCreatorFacade を生成している箇所
apps/desktop/src/main/ipc/index.ts:1045  # 唯一の生成箇所
```

- `healthPolicy?: HealthPolicy` は optional → 既存の呼び出し箇所への変更は不要 ✅
- `healthPolicy` が `undefined` の場合、`RuntimePolicyResolver` は `isDegraded: false` で動作 ✅
- 既存テスト3種への変更は「追加」のみ（既存テストケースは削除・変更なし）✅

---

## DI 設計責務境界チェック

| 責務                        | 担当クラス/ファイル                   | 判定 |
| --------------------------- | ------------------------------------- | ---- |
| `HealthPolicy` の生成       | `index.ts`（DI 組み立て層）           | ✅   |
| `HealthPolicy` の保持・判断 | `RuntimePolicyResolver`（ポリシー層） | ✅   |
| `HealthPolicy` の DI 渡し   | `RuntimeSkillCreatorFacade`（Facade） | ✅   |
| `isDegraded` チェック実行   | `RuntimePolicyResolver`               | ✅   |

---

## simpler alternative の検討

| 代替案                                               | 検討結果                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `RuntimePolicyResolver` で `HealthPolicy` を内部生成 | 否定: 外部からの DI を断ち切り、テスタビリティが低下する   |
| `Facade` に `isDegraded` チェックを持たせる          | 否定: ポリシー判断を Facade に持ち込み、責務境界を破壊する |
| `healthPolicy` を `required` にする                  | 否定: 後方互換性を破壊する。`optional` が適切              |

---

## MINOR 追跡テーブル

指摘事項: **なし**（`outputs/phase-3/minor-tracking.md` 参照）

---

## Phase 4 開始条件

**判定: PASS → Phase 4 へ進む**

全チェック項目が ✅ であることを確認。設計の根本的問題なし。
