# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 3                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

Phase 2 で確定した設計の整合性・後方互換性・型安全性をレビューし、
PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: 型互換性検証テーブルの最終確認（Phase 2 下書きを確定）
- **タスク2**: 後方互換性チェック（`healthPolicy` optional の動作確認）
- **タスク3**: DI設計の責務境界チェック
- **タスク4**: Phase 4 開始条件の確定
- **タスク5**: MINOR 追跡テーブルの作成（発見された指摘がある場合）

---

## 参照資料

| 資料名                     | パス                                                              | 説明                 |
| -------------------------- | ----------------------------------------------------------------- | -------------------- |
| Phase 2 設計決定記録       | `outputs/phase-2/design-decisions.md`                             | レビュー対象設計     |
| Phase 2 型互換性テーブル   | `outputs/phase-2/type-compatibility.md`                           | 型整合確認インプット |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`                          | AC-1〜AC-7 との照合  |
| RuntimePolicyResolver 実装 | `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts` | 3番目引数定義確認    |
| HealthPolicy 型            | `packages/shared/src/types/health-policy.ts`                      | 型定義確認           |

---

## 実行手順

### ステップ1: 型互換性検証

```bash
# 1. RuntimePolicyResolver の第3引数型を最終確認
grep -n "healthPolicy\|HealthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts

# 2. HealthPolicy の export 確認（packages/shared から正しく export されているか）
grep -n "export.*HealthPolicy\|export.*resolveHealthPolicy" \
  packages/shared/src/types/health-policy.ts \
  packages/shared/src/types/index.ts

# 3. RuntimeSkillCreatorFacade の既存 shared import パターン確認
grep -n "from \"@repo/shared" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 4. 型互換性: resolveHealthPolicy() の戻り値が HealthPolicy 型と一致するか
grep -n "resolveHealthPolicy\|HealthPolicy\|HealthCheckInput" \
  packages/shared/src/types/health-policy.ts
```

**型互換性検証テーブル（最終確認）**:

| DI 渡し元                    | 渡す型                      | 受け取り先引数型              | 互換性 |
| ---------------------------- | --------------------------- | ----------------------------- | ------ |
| `resolveHealthPolicy({...})` | `HealthPolicy`              | `healthPolicy?: HealthPolicy` | ✅ TBD |
| `deps.healthPolicy`          | `HealthPolicy \| undefined` | `healthPolicy?: HealthPolicy` | ✅ TBD |

### ステップ2: 後方互換性チェック

```bash
# healthPolicy を渡していない既存の RuntimeSkillCreatorFacade 使用箇所を確認
grep -rn "new RuntimeSkillCreatorFacade" apps/ packages/

# RuntimeSkillCreatorFacadeDeps を spread/利用している箇所を確認
grep -rn "RuntimeSkillCreatorFacadeDeps" apps/ packages/
```

**確認観点**:

- [ ] `healthPolicy?: HealthPolicy` が optional なため、既存の呼び出し箇所への変更は不要
- [ ] `healthPolicy` が `undefined` の場合、`RuntimePolicyResolver` は `healthPolicy` 引数が存在しない場合と同等に動作
- [ ] 既存テスト3種への変更は「追加」のみであり、既存テストケースは削除・変更しない

### ステップ3: DI設計の責務境界チェック

| 責務                        | 担当クラス/ファイル                   | 判定 |
| --------------------------- | ------------------------------------- | ---- |
| `HealthPolicy` の生成       | `index.ts`（DI 組み立て層）           | ✅   |
| `HealthPolicy` の保持・判断 | `RuntimePolicyResolver`（ポリシー層） | ✅   |
| `HealthPolicy` の DI 渡し   | `RuntimeSkillCreatorFacade`（Facade） | ✅   |
| `isDegraded` チェック実行   | `RuntimePolicyResolver`               | ✅   |

**責務混在チェック**:

- `Facade` が `HealthPolicy` の意味を解釈しない（単純 DI 渡しのみ）→ ✅ 責務分離OK
- `index.ts` が `resolveHealthPolicy()` を呼ぶのは適切か → ✅ DI 組み立て層の責務

### ステップ4: simpler alternative の検討

より単純な代替案を検討し、採用しない理由を記録する:

| 代替案                                               | 検討結果                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `RuntimePolicyResolver` で `HealthPolicy` を内部生成 | 否定: 外部からの DI を断ち切り、テスタビリティが低下する   |
| `Facade` に `isDegraded` チェックを持たせる          | 否定: ポリシー判断を Facade に持ち込み、責務境界を破壊する |
| `healthPolicy` を `required` にする                  | 否定: 後方互換性を破壊する。`optional` が適切              |

---

## レビュー判定

### PASS / MINOR / MAJOR 判定基準

| 判定  | 条件                                                 |
| ----- | ---------------------------------------------------- |
| PASS  | 全チェック項目が ✅。Phase 4 へ進める                |
| MINOR | 軽微な指摘あり。Phase 5-8 で解決予定。Phase 4 継続可 |
| MAJOR | 設計の根本的問題。Phase 2（または Phase 1）へ戻る    |

### チェックリスト

**型安全性**:

- [ ] `HealthPolicy` 型が `packages/shared/src/types` から正しく export されていること
- [ ] `RuntimeSkillCreatorFacadeDeps.healthPolicy?: HealthPolicy` の型定義が正確であること
- [ ] `RuntimePolicyResolver` 第3引数との型互換性が確認済みであること

**後方互換性**:

- [ ] `healthPolicy` が optional であり、省略時は既存動作と同等であること
- [ ] 既存テスト3種が `mockHealthPolicy` 追加後も PASS であること（Phase 6 で確認予定）

**責務境界**:

- [ ] DI 組み立て（index.ts）→ Facade → Resolver の責務分離が適切であること
- [ ] `Facade` が `HealthPolicy` の意味を解釈せず、単純に渡すのみであること

**設計選択**:

- [ ] アプローチB（即時生成）の採用理由が記録済みであること
- [ ] Setter Injection を将来タスクとして記録済みであること

### MINOR 追跡テーブル

Phase 3 で MINOR 判定された指摘を追跡する（指摘がある場合のみ記入）:

| MINOR ID  | 指摘内容                 | 解決予定Phase | 解決確認Phase | 備考 |
| --------- | ------------------------ | ------------- | ------------- | ---- |
| TECH-M-01 | （指摘がある場合に記入） | -             | Phase 9/10    | -    |

---

## 統合テスト連携

- 型互換性・後方互換性のレビューゲートを実施済み
- Phase 4 の統合テストシナリオ（`isDegraded: true` → `terminal_handoff`）が設計と整合していることを確認

---

## サブタスク管理

| ID     | タスク名                 | ステータス |
| ------ | ------------------------ | ---------- |
| T-03-1 | 型互換性検証             | 未実施     |
| T-03-2 | 後方互換性チェック       | 未実施     |
| T-03-3 | DI設計の責務境界チェック | 未実施     |
| T-03-4 | Phase 4 開始条件確定     | 未実施     |
| T-03-5 | MINOR 追跡テーブル作成   | 未実施     |

---

## 成果物

| 成果物                       | 配置先                                        | 形式     |
| ---------------------------- | --------------------------------------------- | -------- |
| 設計レビュー結果             | `outputs/phase-3/design-review-result.md`     | Markdown |
| 型互換性検証テーブル（確定） | `outputs/phase-3/type-compatibility-final.md` | Markdown |
| MINOR 追跡テーブル           | `outputs/phase-3/minor-tracking.md`           | Markdown |

---

## 完了条件

- [ ] 型互換性検証テーブルが確定（PASS/FAIL が全行に記入済み）していること
- [ ] 後方互換性チェックが完了し、既存呼び出し箇所への影響がないことが確認済みであること
- [ ] DI 設計の責務境界チェックが PASS であること
- [ ] レビュー判定（PASS/MINOR/MAJOR）が確定していること
- [ ] Phase 4 開始条件（「PASS」または「MINORのみで PASS」）が満たされていること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: 型互換性検証を実行し `outputs/phase-3/type-compatibility-final.md` に記録済み
- [ ] T-03-2: 後方互換性チェックを実行し `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-3: 責務境界チェック結果を記録済み
- [ ] T-03-4: Phase 4 開始条件を明示的に確定済み（「PASS: Phase 4 へ進む」等）
- [ ] T-03-5: MINOR 追跡テーブルを記録済み（指摘なしの場合は「なし」と記録）

---

## 次Phase

**Phase 4: テスト作成（Red段階）** — TDD に従い、実装前にテストを先行作成する。
特に `isDegraded: true` シナリオのテストを作成し、RED 状態を確認する。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
