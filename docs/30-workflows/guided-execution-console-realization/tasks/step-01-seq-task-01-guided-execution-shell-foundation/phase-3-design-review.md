# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 3                                              |
| Phase名    | 設計レビュー                                   |
| タスクID   | TASK-IMP-GUIDED-EXECUTION-SHELL-FOUNDATION-001 |
| 前提Phase  | Phase 2                                        |
| 後続Phase  | Phase 4（テスト作成）                          |
| ステータス | not_started                                    |
| 作成日     | 2026-03-23                                     |
| 機能名     | guided-execution-shell-foundation              |

## 目的

label drift、route drift、CTA drift、fallback drift をレビューし、Phase 4 着手条件を確定する。

## 実行タスク

- naming review
- route review
- CTA review
- gate decision

## 参照資料

| 参照資料   | パス                                                                            | 内容     |
| ---------- | ------------------------------------------------------------------------------- | -------- |
| Phase 1    | `phase-1-requirements.md`                                                       | 要件確認 |
| Phase 2    | `phase-2-design.md`                                                             | 設計確認 |
| root audit | `docs/30-workflows/guided-execution-console-realization/design-audit-matrix.md` | 判断根拠 |

## 実行手順

### ステップ1: drift を判定する

front に `terminal` を残してよい箇所と、高度な表示へ退避すべき箇所を判定する。

### ステップ2: fallback を判定する

`agent` 代替や no-op CTA を許容しない gate を確定する。

### ステップ3: Phase 4 条件を確定する

shared action、route、label の 3 点が揃うまで Phase 5 実装に進まない。

## 統合テスト連携

Phase 4 では route / CTA / label の 3 群に最低 1 つずつ integration case を置く。

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定と指摘       |
| gate 決定        | `outputs/phase-3/gate-decision.md`        | Phase 4 着手条件 |

## 完了条件

- [ ] no-op CTA を禁止条件として明記している
- [ ] `agent` 代替を許容しないと明記している
- [ ] naming / route / CTA の review 結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md)
