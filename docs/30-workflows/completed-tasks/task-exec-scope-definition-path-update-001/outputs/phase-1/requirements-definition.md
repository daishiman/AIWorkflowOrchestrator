# Phase 1 Requirements Definition

## 機能要件

| ID   | 要件                                                                              |
| ---- | --------------------------------------------------------------------------------- |
| FR-1 | source task と actual target path の差分を明示できる                              |
| FR-2 | `execution-capability.ts` の実在確認と Implementation Anchor 追記対象を固定できる |
| FR-3 | 既存 2 行の non-regression 条件を定義できる                                       |
| FR-4 | Issue #1664 が CLOSED でも execution target として扱う条件を定義できる            |
| FR-5 | duplicate source doc を false blocker にしない条件を定義できる                    |

## 非機能要件

| ID    | 要件                                            |
| ----- | ----------------------------------------------- |
| NFR-1 | docs-only task として file-only diff を維持する |
| NFR-2 | stale path を実装手順に残さない                 |
| NFR-3 | commit / push / PR を行わない                   |

## 受入基準

| ID   | 基準                                         | 検証方法                                  |
| ---- | -------------------------------------------- | ----------------------------------------- |
| AC-1 | actual target path が固定されている          | `outputs/phase-2/target-path-decision.md` |
| AC-2 | Implementation Anchor 追記が定義されている   | `outputs/phase-4/test-matrix.md`          |
| AC-3 | 既存 2 行 preservation が定義されている      | `rg`, `git diff`                          |
| AC-4 | CLOSED issue / duplicate source の扱いが明確 | Phase 3 gate                              |
