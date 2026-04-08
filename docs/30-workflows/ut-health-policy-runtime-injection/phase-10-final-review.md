# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 10                                 |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

受入基準 AC-1〜AC-7 との完全な照合を行い、PASS/FAIL を判定する。
MAJOR 指摘が残存している場合は該当 Phase に戻る。PASS の場合は Phase 11 へ進む。

---

## 実行タスク

- **タスク1**: 受入基準 AC-1〜AC-7 の最終照合
- **タスク2**: コードレビュー観点のチェック
- **タスク3**: PASS/FAIL 判定と戻り先の決定
- **タスク4**: 最終レビュー結果の記録

---

## 参照資料

| 資料名                     | パス                                      | 説明              |
| -------------------------- | ----------------------------------------- | ----------------- |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md`  | AC-1〜AC-7 の定義 |
| Phase 9 品質チェック結果   | `outputs/phase-9/quality-check-result.md` | 品質ゲート結果    |
| Phase 3 MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | MINOR 解決確認    |

---

## 実行手順

### ステップ1: 受入基準 AC-1〜AC-7 の最終照合

```bash
# AC-1: RuntimeSkillCreatorFacadeDeps に healthPolicy? が追加されているか
grep -n "healthPolicy\?: HealthPolicy" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# AC-2: コンストラクタが3番目引数を渡しているか
grep -n "new RuntimePolicyResolver" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# AC-3: index.ts で healthPolicy が生成・渡されているか（undefined 不可）
grep -n "healthPolicy\|resolveHealthPolicy" \
  apps/desktop/src/main/ipc/index.ts

# AC-4: isDegraded: true テストが PASS か（Phase 9 結果で確認）

# AC-5: 後方互換テストが PASS か（Phase 9 結果で確認）

# AC-6: typecheck が通るか（Phase 9 結果で確認）
pnpm --filter @repo/desktop typecheck

# AC-7: 3テストファイルが全 PASS か（Phase 9 結果で確認）
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**受入基準照合テーブル**:

| AC番号 | 基準                                                                              | 判定 | 証拠                   |
| ------ | --------------------------------------------------------------------------------- | ---- | ---------------------- |
| AC-1   | `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている | TBD  | grep 結果              |
| AC-2   | コンストラクタが `RuntimePolicyResolver` に3番目引数を渡している                  | TBD  | grep 結果              |
| AC-3   | `index.ts` で `healthPolicy` が生成・渡されている（`undefined` 不可）             | TBD  | grep 結果              |
| AC-4   | `isDegraded: true` テスト（TC-H-03）が PASS                                       | TBD  | Phase 9 テスト結果     |
| AC-5   | `healthPolicy` 省略時に既存テストが全 PASS（後方互換）                            | TBD  | Phase 9 テスト結果     |
| AC-6   | `pnpm --filter @repo/desktop typecheck` が PASS                                   | TBD  | Phase 9 typecheck 結果 |
| AC-7   | 関連テストファイル3種が全 PASS                                                    | TBD  | Phase 9 テスト結果     |

### ステップ2: コードレビュー観点チェック

| 観点                             | チェック内容                                                                | 判定 |
| -------------------------------- | --------------------------------------------------------------------------- | ---- |
| 型安全性                         | `healthPolicy?: HealthPolicy` が正確な型で定義されているか                  | TBD  |
| optional の適切な使用            | `undefined` チェックなしで `RuntimePolicyResolver` に渡せるか               | TBD  |
| import の整合性                  | `HealthPolicy` / `resolveHealthPolicy` が正しい箇所から import されているか | TBD  |
| `lastHealthCheck: null` の初期値 | `isDegraded: false` として動作することが設計書に記録済みか                  | TBD  |
| テストの意図明確性               | テスト名が「何を検証するか」を明示しているか                                | TBD  |
| 不要コードの除去                 | Phase 8 リファクタで不要コードが除去済みか                                  | TBD  |

### ステップ3: PASS/FAIL 判定

| 判定          | 条件                                         | 戻り先                         |
| ------------- | -------------------------------------------- | ------------------------------ |
| PASS          | AC-1〜AC-7 が全て ✅、コードレビュー問題なし | Phase 11 へ進む                |
| MINOR         | 軽微な指摘（テスト名の変更など）             | Phase 11 継続・Phase 12 で解決 |
| MAJOR: 実装   | AC-1〜AC-3 のいずれかが ❌                   | Phase 5 へ戻る                 |
| MAJOR: テスト | AC-4〜AC-5, AC-7 のいずれかが ❌             | Phase 4/6 へ戻る               |
| MAJOR: 設計   | 設計の根本的問題                             | Phase 2 へ戻る                 |
| CRITICAL      | 要件の再定義が必要                           | Phase 1 へ戻る                 |

---

## 統合テスト連携

- 最終レビューで統合テスト結果（TC-H-01〜04 の PASS）を確認
- AC-4（`isDegraded: true` → `terminal_handoff` 系レスポンス）が「デッドコード解消の証明」として記録済み

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-10-1 | 受入基準 AC-1〜AC-7 照合   | 未実施     |
| T-10-2 | コードレビュー観点チェック | 未実施     |
| T-10-3 | PASS/FAIL 判定             | 未実施     |
| T-10-4 | 最終レビュー結果記録       | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Markdown |
| AC 検証記録      | `outputs/phase-10/ac-verification.md`     | Markdown |

---

## 完了条件

- [ ] AC-1〜AC-7 が全て ✅ であること
- [ ] コードレビュー観点の全チェック項目が ✅ であること
- [ ] PASS/FAIL 判定が「PASS」であること
- [ ] `outputs/phase-10/final-review-result.md` に判定結果が記録されていること
- [ ] `outputs/phase-10/ac-verification.md` に AC-1〜AC-7 の証拠が記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-10-1: AC-1〜AC-7 の照合を実行し `outputs/phase-10/ac-verification.md` に記録済み
- [ ] T-10-2: コードレビュー観点チェックを実行し結果を記録済み
- [ ] T-10-3: PASS/FAIL 判定を確定し `outputs/phase-10/final-review-result.md` に記録済み
- [ ] T-10-4: 最終レビュー結果サマリを記録済み

---

## 次Phase

**Phase 11: 手動テスト** — デスクトップアプリでの動作確認を行う。

**Phase 11 開始条件**: Phase 10 の判定が「PASS」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。
