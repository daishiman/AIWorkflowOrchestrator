# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 9                                  |
| 機能名 | ut-health-policy-runtime-injection |
| 作成日 | 2026-04-07                         |

## 目的

typecheck / lint / 全テスト実行を行い、全ての品質ゲートを通過することを確認する。
Phase 3 で記録した MINOR 指摘の解決確認も行う。

---

## 実行タスク

- **タスク1**: TypeScript typecheck の実行・PASS 確認
- **タスク2**: ESLint の実行・PASS 確認
- **タスク3**: 関連テストファイル3種の全 PASS 確認
- **タスク4**: Phase 3 MINOR 指摘の解決確認
- **タスク5**: 品質チェック結果の記録

---

## 参照資料

| 資料名                     | パス                                     | 説明                   |
| -------------------------- | ---------------------------------------- | ---------------------- |
| Phase 3 MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`      | MINOR 指摘の解決確認   |
| Phase 8 リファクタ結果     | `outputs/phase-8/refactoring-result.md`  | リファクタ完了状態確認 |
| Phase 1 受入基準           | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-7 の前確認    |

---

## 実行手順

### ステップ1: TypeScript typecheck

```bash
# @repo/desktop の typecheck（AC-6の検証）
pnpm --filter @repo/desktop typecheck

# エラーが発生した場合: 対象ファイルを特定
pnpm --filter @repo/desktop typecheck 2>&1 | grep "RuntimeSkillCreatorFacade\|index.ts\|healthPolicy"
```

**期待結果**: エラー 0 件

### ステップ2: ESLint

```bash
# 変更ファイルの lint チェック
pnpm --filter @repo/desktop exec eslint \
  src/main/services/runtime/RuntimeSkillCreatorFacade.ts \
  src/main/ipc/index.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**期待結果**: エラー 0 件（警告は許容するが記録する）

### ステップ3: 全テスト実行（AC-7の検証）

```bash
# 関連テストファイル3種の全 PASS 確認
pnpm --filter @repo/desktop exec vitest run \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.improve.test.ts
```

**期待結果**: 全テスト GREEN

**テストケース別確認**:

| TC番号   | テスト名                                                                    | 期待結果 | 実結果 |
| -------- | --------------------------------------------------------------------------- | -------- | ------ |
| TC-H-01  | `should pass healthPolicy to RuntimePolicyResolver via DI`                  | PASS     | TBD    |
| TC-H-02  | `should use undefined healthPolicy when not provided (backward compatible)` | PASS     | TBD    |
| TC-H-03  | `should return terminal_handoff when healthPolicy.isDegraded is true`       | PASS     | TBD    |
| TC-H-04  | `should not return terminal_handoff when healthPolicy.isDegraded is false`  | PASS     | TBD    |
| 後方互換 | `should work without healthPolicy (backward compatible)`                    | PASS     | TBD    |

### ステップ4: Phase 3 MINOR 指摘の解決確認

```bash
# Phase 3 の MINOR 追跡テーブルを確認
cat outputs/phase-3/minor-tracking.md
```

**確認内容**: 各 MINOR 指摘が「解決予定 Phase」までに解決済みであることを確認し、
`outputs/phase-9/quality-check-result.md` に記録する。

### ステップ5: 受入基準（AC-1〜AC-5）の事前確認

Phase 10 に向けて、AC-1〜AC-5 の充足状況を確認する:

| AC番号 | 基準                                                                              | 充足状況 |
| ------ | --------------------------------------------------------------------------------- | -------- |
| AC-1   | `RuntimeSkillCreatorFacadeDeps` に `healthPolicy?: HealthPolicy` が追加されている | TBD      |
| AC-2   | コンストラクタが3番目引数を渡している                                             | TBD      |
| AC-3   | `index.ts` で `healthPolicy` が生成・渡されている（`undefined` 不可）             | TBD      |
| AC-4   | `isDegraded: true` テストが PASS                                                  | TBD      |
| AC-5   | 後方互換性が保たれており、既存テストが全 PASS                                     | TBD      |
| AC-6   | `pnpm --filter @repo/desktop typecheck` が通る                                    | TBD      |
| AC-7   | 関連テストファイル3種が全 PASS                                                    | TBD      |

---

## 統合テスト連携

- 品質保証で統合テスト結果を確認
- typecheck / lint / test の全 PASS が Phase 10 への前提条件

---

## サブタスク管理

| ID     | タスク名             | ステータス |
| ------ | -------------------- | ---------- |
| T-09-1 | typecheck 実行       | 未実施     |
| T-09-2 | ESLint 実行          | 未実施     |
| T-09-3 | 全テスト実行         | 未実施     |
| T-09-4 | MINOR 指摘の解決確認 | 未実施     |
| T-09-5 | 品質チェック結果記録 | 未実施     |

---

## 成果物

| 成果物           | 配置先                                    | 形式     |
| ---------------- | ----------------------------------------- | -------- |
| 品質チェック結果 | `outputs/phase-9/quality-check-result.md` | Markdown |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS であること（エラー 0）
- [ ] ESLint が PASS であること（エラー 0）
- [ ] 関連テストファイル3種が全て GREEN であること
- [ ] TC-H-01〜TC-H-04 が全て PASS であること
- [ ] Phase 3 MINOR 指摘が全て解決済みであること
- [ ] AC-1〜AC-7 の充足状況が `outputs/phase-9/quality-check-result.md` に記録されていること

---

## タスク100%実行確認【必須】

- [ ] T-09-1: typecheck を実行し結果を記録済み（PASS）
- [ ] T-09-2: ESLint を実行し結果を記録済み（PASS）
- [ ] T-09-3: 全テストを実行し結果を記録済み（全 GREEN）
- [ ] T-09-4: Phase 3 MINOR 指摘の解決確認を記録済み
- [ ] T-09-5: AC-1〜AC-7 の充足状況を `outputs/phase-9/quality-check-result.md` に記録済み

---

## 次Phase

**Phase 10: 最終レビューゲート** — 受入基準との照合・PASS/FAIL 判定を行い、マージ準備完了を確定する。

**Phase 10 開始条件**: Phase 9 の全完了条件を満たすこと。
