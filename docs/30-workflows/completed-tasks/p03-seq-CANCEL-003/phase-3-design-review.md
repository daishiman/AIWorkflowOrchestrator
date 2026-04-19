# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 3                                 |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 2                           |
| 後続Phase  | Phase 4                           |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

Phase 2 の差分確認設計を 4条件でレビューし、Phase 4 以降へ進めるかを判定する。

## 背景

この task の失敗パターンは、Main 層完了確認と Renderer 側未完了を同じ完了条件に混ぜることにある。設計レビューでは、矛盾なし・漏れなし・整合性あり・依存関係整合の4条件で gate を通す。

## 実行タスク

### タスク0: 4条件レビュー

**目的**: 条件ごとに設計を採点する。

**実行手順**:

1. 矛盾なし: 既実装差分確認モードと各 Phase の記述が衝突していないか確認する。
2. 漏れなし: AC、targeted test、NON_VISUAL 証跡、Phase 12 6成果物が揃っているか確認する。
3. 整合性あり: taskType、成果物名、status 表現が統一されているか確認する。
4. 依存関係整合: CANCEL-002/003/004 の境界が正しいか確認する。

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

### タスク1: 戻り先判定

**目的**: MAJOR 指摘時の戻り先を明確にする。

**実行手順**:

1. 要件起因なら Phase 1 に戻す。
2. 差分確認設計起因なら Phase 2 に戻す。
3. 軽微な wording 調整だけなら MINOR として Phase 4 に進める。

**期待される成果物**:

- `outputs/phase-3/gate-decision.md`

## 参照資料

| 参照資料                    | パス                                                             | 内容               |
| --------------------------- | ---------------------------------------------------------------- | ------------------ |
| Phase 1 仕様                | `docs/30-workflows/p03-seq-CANCEL-003/phase-1-requirements.md`   | taskType と AC     |
| Phase 2 仕様                | `docs/30-workflows/p03-seq-CANCEL-003/phase-2-design.md`         | 差分確認設計       |
| 解決策設計書                | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md` | 原設計との整合確認 |
| 設計レビュー                | `docs/30-workflows/00-task-spec-design-docs/phase-3-review.md`   | scope 補足の再確認 |
| 要件定義書                  | `outputs/phase-1/requirements-definition.md`                     | Phase 1 成果物     |
| 受け入れ基準                | `outputs/phase-1/acceptance-criteria.md`                         | Phase 1 成果物     |
| AbortSignal利用調査レポート | `outputs/phase-1/abort-signal-usage-report.md`                   | Phase 1 成果物     |
| 差分確認設計                | `outputs/phase-2/design.md`                                      | Phase 2 成果物     |

## 成果物

| 成果物           | パス                               | 内容                                |
| ---------------- | ---------------------------------- | ----------------------------------- |
| 設計レビュー結果 | `outputs/phase-3/gate-decision.md` | 4条件評価、PASS/MINOR/MAJOR、戻り先 |

## 統合テスト連携【必須】

| 判定項目                          | 基準 | 結果    |
| --------------------------------- | ---- | ------- |
| 4条件評価が記録されている         | 完了 | pending |
| PASS/MINOR/MAJOR の判定根拠がある | 完了 | pending |
| 戻り先が定義されている            | 完了 | pending |

## 完了条件

- [ ] 4条件の評価を記録している
- [ ] gate 判定を記録している
- [ ] 戻り先を定義している
- [ ] Phase 4 へ進める条件を明示している
