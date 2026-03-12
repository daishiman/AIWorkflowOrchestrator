# Acceptance Criteria

> P50パターン該当: 検証・補完モード。既存 light theme 実装に対して guard 仕様が成立するかを受入基準で固定する。

## 受入基準一覧

| ID   | 受入基準                                                                  | 検証方法                                    | 主な参照先                             |
| ---- | ------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------- |
| AC-1 | representative 4 surface と TC-ID の対応が定義されている                  | screenshot matrix と Phase 11 testcase 照合 | `outputs/phase-2/screenshot-matrix.md` |
| AC-2 | hardcoded color drift の pattern / exclusion / priority が定義されている  | audit spec 照合                             | `outputs/phase-2/audit-spec.md`        |
| AC-3 | current build static serve と selector-based capture が標準手順として残る | Phase 11 / quick-reference 照合             | `phase-11-manual-test.md`              |
| AC-4 | current violations と baseline backlog が分離されている                   | evidence policy / Phase 12 照合             | `outputs/phase-2/evidence-policy.md`   |
| AC-5 | `.claude` 正本と `.agents` mirror drift の確認導線が Phase 12 にある      | documentation phase 照合                    | `phase-12-documentation.md`            |

## Gate 条件

1. いずれかの AC が未定義なら Phase 2 に進めない
2. routing 先が token-foundation / shared-color-migration / 本 guard のいずれかへ決まらない場合は Phase 1 に戻す
3. 受入基準は「0件報告」ではなく「どう検証したか」まで記録できる粒度にする
