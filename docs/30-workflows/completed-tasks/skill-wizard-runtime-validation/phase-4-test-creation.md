# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase番号  | 4                                                 |
| Phase名    | テスト作成                                        |
| 前提Phase  | Phase 3                                           |
| 後続Phase  | Phase 5                                           |
| ステータス | 未実施                                            |
| 作成日     | 2026-04-08                                        |
| 機能名     | skill-wizard-runtime-validation                   |
| Issue      | #1999 (UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001) |

---

## 目的

TDD Red フェーズ。バリデーション関数のテストを先に書き、まだ実装がない状態（Red）を確認する。

テストを先行して書くことで、実装前に期待仕様を明確化し、AC-1〜AC-4 を網羅する回帰ガードを構築する。

本Phaseでは `validateSkillInfoForm` を正式名称として扱う。
`validateSkillInfoFormValues` という別名は使用しない。

---

## 実行タスク

### タスク1: テストケース設計（テストマトリクス作成）

**目的**: バリデーション仕様を網羅するテストケース一覧を作成し、`outputs/phase-4/test-matrix.md` に記録する。

**実行手順**:

1. 受入基準（AC-1〜AC-4）を再確認する
2. 下記テストケース一覧を参照してテストマトリクスを `outputs/phase-4/test-matrix.md` に作成する
3. 境界値・正常系・異常系が揃っているか確認する

**期待成果物**: `outputs/phase-4/test-matrix.md`

---

#### テストケース一覧

| TC番号 | 対象関数                | 入力                                             | 期待結果                                                                                                     | 受入基準         |
| ------ | ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ | ---------------- |
| TC-01  | `validateSkillName`     | `undefined`                                      | `{ valid: true }`                                                                                            | —                |
| TC-02  | `validateSkillName`     | `null`                                           | `{ valid: true }`                                                                                            | —                |
| TC-03  | `validateSkillName`     | `"  "` (空白のみ)                                | `{ valid: false, error: "スキル名を入力してください" }`                                                      | AC-1, AC-4       |
| TC-04  | `validateSkillName`     | `"テスト"` (通常文字列)                          | `{ valid: true }`                                                                                            | —                |
| TC-05  | `validateSkillName`     | 101文字の文字列                                  | `{ valid: false, error: "スキル名は100文字以内で入力してください" }`                                         | AC-4             |
| TC-06  | `validateSkillName`     | 100文字の文字列                                  | `{ valid: true }`                                                                                            | —                |
| TC-07  | `validatePurpose`       | 10文字以上の文字列                               | `{ valid: true }`                                                                                            | —                |
| TC-08  | `validatePurpose`       | 9文字の文字列                                    | `{ valid: false, error: "目的は10文字以上で入力してください" }`                                              | AC-2, AC-4       |
| TC-09  | `validatePurpose`       | 501文字の文字列                                  | `{ valid: false, error: "目的は500文字以内で入力してください" }`                                             | AC-4             |
| TC-10  | `validatePurpose`       | 500文字の文字列                                  | `{ valid: true }`                                                                                            | —                |
| TC-11  | `validateSkillInfoForm` | skillName: 有効, purpose: 10文字以上             | `{ isValid: true, skillName: undefined, purpose: undefined }`                                                | AC-3             |
| TC-12  | `validateSkillInfoForm` | skillName: `"  "`, purpose: `"短い"` (9文字以下) | `{ isValid: false, skillName: "スキル名を入力してください", purpose: "目的は10文字以上で入力してください" }` | AC-1, AC-2, AC-4 |

---

### タスク2: テストファイル作成

**目的**: 上記テストケースを Vitest 形式で実装し、テストファイルを作成する。

**対象ファイル**: `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`

**実行手順**:

1. `packages/shared/src/types/__tests__/` ディレクトリの存在を確認する
2. テストファイルを新規作成する
3. 各テストケース（TC-01〜TC-12）を `describe` ブロックで関数ごとにグループ化する
4. `SKILL_INFO_VALIDATION_MESSAGES` 定数もテストで参照し、エラーメッセージの一致を確認する

`SkillInfoFormData` の `category` について:

- 本タスクのランタイムバリデーション対象は `skillName` と `purpose` のみ
- `validateSkillInfoForm` の入力は `Pick<SkillInfoFormData, "skillName" | "purpose">` 相当として扱う
- `category` の妥当性検証は本タスクのスコープ外（別タスクで扱う）

**テストファイル構成**:

```
describe('validateSkillName', () => {
  // TC-01: undefined → valid
  // TC-02: null → valid
  // TC-03: 空白のみ → invalid + 日本語エラー
  // TC-04: 通常文字列 → valid
  // TC-05: 101文字 → invalid + 日本語エラー
  // TC-06: 100文字 → valid
})

describe('validatePurpose', () => {
  // TC-07: 10文字以上 → valid
  // TC-08: 9文字 → invalid + 日本語エラー
  // TC-09: 501文字 → invalid + 日本語エラー
  // TC-10: 500文字 → valid
})

describe('validateSkillInfoForm', () => {
  // TC-11: 全フィールド valid → isValid: true
  // TC-12: skillName空白 + purpose短い → isValid: false, 両エラーあり
})
```

**期待成果物**: `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts`

---

### タスク3: Red確認（テストが失敗することを確認）

**目的**: 実装ファイルが存在しない状態でテストを実行し、Red（失敗）であることを確認する。

**実行手順**:

1. 以下のコマンドを実行する:
   ```bash
   pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
   ```
2. インポートエラーまたはテスト失敗が出力されることを確認する
3. 実行結果を `outputs/phase-4/red-confirmation.md` に記録する

**期待成果物**: `outputs/phase-4/red-confirmation.md`

**TDDコマンド**:

```bash
pnpm --filter @repo/shared exec vitest run src/types/__tests__/skillInfoFormValidation.test.ts
```

**期待される出力例**:

```
FAIL packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts
  Error: Cannot find module '../skillInfoFormValidation'
```

---

## 参照資料

| 資料名                   | パス / URL                                | 参照目的                   |
| ------------------------ | ----------------------------------------- | -------------------------- |
| 設計済みインターフェース | Issue #1999 本文                          | 関数シグネチャ・型定義確認 |
| 受入基準                 | Issue #1999 AC-1〜AC-5                    | テストケース網羅確認       |
| Vitest 公式ドキュメント  | https://vitest.dev/guide/                 | テスト記述方法             |
| 既存テストファイル例     | `packages/shared/src/types/__tests__/`    | テストスタイル統一         |
| 受入基準                 | `outputs/phase-1/acceptance-criteria.md`  | Phase 1 成果物             |
| P50チェック結果          | `outputs/phase-1/p50-check-result.md`     | Phase 1 成果物             |
| スコープ定義書           | `outputs/phase-1/scope-definition.md`     | Phase 1 成果物             |
| 設計決定書               | `outputs/phase-2/design-decisions.md`     | Phase 2 成果物             |
| バリデーションI/F設計    | `outputs/phase-2/validation-interface.md` | Phase 2 成果物             |
| エラーメッセージ設計     | `outputs/phase-2/error-messages.md`       | Phase 2 成果物             |
| 設計レビュー結果         | `outputs/phase-3/design-review-result.md` | Phase 3 成果物             |
| MINOR管理表              | `outputs/phase-3/minor-tracking.md`       | Phase 3 成果物             |

---

## 成果物テーブル

| 成果物           | パス                                                                  | 種別         |
| ---------------- | --------------------------------------------------------------------- | ------------ |
| テストマトリクス | `outputs/phase-4/test-matrix.md`                                      | ドキュメント |
| テストファイル   | `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | コード       |
| Red確認記録      | `outputs/phase-4/red-confirmation.md`                                 | ドキュメント |

---

## 完了条件チェックリスト

- [ ] TC-01〜TC-12 全テストケースがテストファイルに実装されている
- [ ] テストファイルが `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` に作成されている
- [ ] テスト実行コマンドを実行し、Red（失敗）状態であることを確認した
- [ ] Red確認結果を `outputs/phase-4/red-confirmation.md` に記録した
- [ ] 日本語エラーメッセージが `SKILL_INFO_VALIDATION_MESSAGES` 定数から参照されている

---

## Phase末端アクション【必須】チェックリスト

- [ ] 成果物ファイルを `outputs/phase-4/` に保存した
- [ ] 次のPhase（Phase 5）の前提条件を満たしていることを確認した
- [ ] テストが Red 状態であることをスクリーンショットまたはログで記録した
- [ ] Phase 4 のステータスを「完了」に更新した

---

## 依存関係

| 種別 | Phase番号 | Phase名    | 依存内容                                       |
| ---- | --------- | ---------- | ---------------------------------------------- |
| 前提 | Phase 3   | 設計・調査 | バリデーション仕様・インターフェース設計の完了 |
| 後続 | Phase 5   | 実装       | テストファイルの存在（Green化の対象）          |

---

## 統合テスト連携

- `test-matrix.md` と `red-confirmation.md` の結果は Phase 5 の実装着手条件として引き継ぐ
- 失敗ケースと境界値は Phase 6 のテスト拡充で再利用できるように固定する
- 実装後は Phase 11 の手動テスト観点へ同じエッジケースを再投影する

## 次のPhase

**Phase 5: 実装（TDD Green フェーズ）**

Phase 4 で作成したテストを Green にする最小実装を `packages/shared/src/types/skillInfoFormValidation.ts` に行う。
