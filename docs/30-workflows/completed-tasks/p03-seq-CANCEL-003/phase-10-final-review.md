# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 10                                |
| タスクID   | TASK-SW-CANCEL-003                |
| 機能名     | skill-creator-cancel-main-handler |
| 前提Phase  | Phase 9                           |
| 後続Phase  | Phase 11                          |
| 作成日     | 2026-04-15                        |
| ステータス | pending                           |

## 目的

Phase 1〜9 の結果を統合し、CANCEL-003 が Main 層として完了可能か、または補修/未タスク化が必要かを判定する。

## 背景

本 task は E2E 完了ではなく Main 層完了をレビュー対象とする。したがって最終レビューでは、「Main 層完了」と「CANCEL-004 依存の残課題」を矛盾なく同時に記録する必要がある。

## 実行タスク

### タスク0: 4条件の最終評価

**目的**: 4条件で最終判定する。

**実行手順**:

1. 矛盾なし: Phase 間で既実装差分確認モードが崩れていないか確認する。
2. 漏れなし: AC、test、quality、manual-test 入力が揃っているか確認する。
3. 整合性あり: taskType、artifact 名、status 表現が一致しているか確認する。
4. 依存関係整合: CANCEL-002/003/004 の境界が正しく残っているか確認する。

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

### タスク1: gate 判定

**目的**: Phase 11/12 へ進めるかを確定する。

**実行手順**:

1. PASS なら Phase 11 へ進む。
2. MINOR は Phase 12 で補足可能なものに限定する。
3. MAJOR は Phase 5 または Phase 8 へ戻す。

**期待される成果物**:

- `outputs/phase-10/final-review-result.md`

## 参照資料

| 参照資料                         | パス                                                          | 内容               |
| -------------------------------- | ------------------------------------------------------------- | ------------------ |
| Phase 3 gate                     | `outputs/phase-3/gate-decision.md`                            | 初回 gate 判定     |
| Phase 2 差分確認設計             | `outputs/phase-2/design.md`                                   | 責務境界と完了定義 |
| Phase 7 coverage                 | `outputs/phase-7/coverage-report.md`                          | coverage 観点      |
| Phase 9 quality                  | `outputs/phase-9/quality-report.md`                           | 品質と残存リスク   |
| 要件定義書                       | `outputs/phase-1/requirements-definition.md`                  | Phase 1 成果物     |
| 受け入れ基準                     | `outputs/phase-1/acceptance-criteria.md`                      | Phase 1 成果物     |
| AbortSignal利用調査レポート      | `outputs/phase-1/abort-signal-usage-report.md`                | Phase 1 成果物     |
| 差分確認サマリー                 | `outputs/phase-5/implementation-summary.md`                   | Phase 5 成果物     |
| SkillCreatorService実装確認対象  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` | Phase 5 成果物     |
| skillCreatorHandlers実装確認対象 | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           | Phase 5 成果物     |
| リファクタリング記録             | `outputs/phase-8/refactoring-log.md`                          | Phase 8 成果物     |

## 成果物

| 成果物           | パス                                      | 内容                                               |
| ---------------- | ----------------------------------------- | -------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 4条件評価、PASS/MINOR/MAJOR、戻り先、Phase 12 入力 |

## 統合テスト連携【必須】

| 判定項目                         | 基準 | 結果    |
| -------------------------------- | ---- | ------- |
| 4条件最終評価がある              | 完了 | pending |
| gate 判定がある                  | 完了 | pending |
| Phase 11/12 への入力が揃っている | 完了 | pending |

## 完了条件

- [ ] 4条件の最終評価を記録している
- [ ] gate 判定を記録している
- [ ] 戻り先または進行条件を明記している
- [ ] Phase 11/12 へ渡す入力を整理している
