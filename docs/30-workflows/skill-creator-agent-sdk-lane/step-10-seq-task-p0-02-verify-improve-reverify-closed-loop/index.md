# TASK-P0-02: verify→improve→re-verify 閉ループ修復

## メタ情報

| 項目           | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| タスクID       | TASK-P0-02                                                 |
| タスク名       | verify→improve→re-verify 閉ループ修復                      |
| 分類           | バグ修正・実装改善                                         |
| 対象機能       | SkillCreatorWorkflowEngine phase transition                |
| 優先度         | P0（最高）                                                 |
| 見積もり規模   | 中規模                                                     |
| ステータス     | spec_created                                               |
| 発見元         | p0-verify-manifest-remediation-pack 監査                   |
| 作成日         | 2026-03-29                                                 |
| 依存タスク     | TASK-P0-01（verify engine 本体）                           |
| 後続タスク     | なし                                                       |
| 親ワークフロー | step-10-seq-task-p0-02-verify-improve-reverify-closed-loop |

---

## タスク概要

### 目的

verify→improve→re-verify の閉ループが実装上成立しない問題を修正する。`recordVerifyPass()` が存在せず verify 成功時の状態遷移が未定義であり、improve 後の re-verify 経路も不完全である。

### 背景

WorkflowEngine は execute→verify→improve の前半経路を持つが、以下の欠陥がある:

1. `recordVerifyPass()` メソッドが存在しない — verify 成功時の phase 遷移が未定義
2. improve→execute は存在するが improve→verify（re-verify）への直接遷移がない
3. `requestReverify()` は存在するが eligibility check が厳しく実用的な閉ループにならない
4. SkillCreatorVerifyResult の status `"pass"` に対応するハンドラがない

### 最終ゴール

1. `recordVerifyPass()` を WorkflowEngine に追加し verify 成功時の phase 遷移を定義する
2. improve→verify 遷移を追加し re-verify ループを成立させる
3. execute→verify(fail)→improve→verify(pass) の完全サイクルをテスト可能にする
4. UI snapshot が verify の pass/fail/pending 状態を正しく反映する

---

## 受入条件

| AC   | 条件                                                                 | 検証方法       |
| ---- | -------------------------------------------------------------------- | -------------- |
| AC-1 | `recordVerifyPass()` メソッドが WorkflowEngine に存在する            | ユニットテスト |
| AC-2 | verify→improve phase 遷移が正しく動作する                            | ユニットテスト |
| AC-3 | improve→verify (re-verify) phase 遷移が動作する                      | ユニットテスト |
| AC-4 | execute→verify(fail)→improve→verify(pass) の完全サイクルがテスト可能 | 統合テスト     |
| AC-5 | UI snapshot が verify の pass/fail/pending 状態を正しく反映する      | 手動テスト     |
| AC-6 | `requestReverify()` が verification engine 結果と統合される          | ユニットテスト |

---

## スコープ

- **含む**: 閉ループの phase 遷移修復、`recordVerifyPass()` 実装、improve→verify 遷移追加、IPC handler 更新、UI snapshot 連携
- **含まない**: verify engine 本体（P0-01）、manifest 配置（P0-03/04）、WorkflowEngine の全面再設計

---

## 依存関係

| 種別       | 参照先                                      | 役割                                     |
| ---------- | ------------------------------------------- | ---------------------------------------- |
| upstream   | `../requirements-draft.md`                  | FR-04 verify / FR-05 improve 契約の要件  |
| upstream   | `../root-workflow-pack/index.md`            | lane 共通不変条件と責務分離方針          |
| upstream   | `../p0-verify-manifest-remediation-pack.md` | P0 是正パックの背景と設計原則            |
| upstream   | TASK-P0-01 (verify engine layer1/2)         | verification engine 本体の実装           |
| peer       | TASK-SDK-02 (WorkflowEngine)                | verify phase の state owner              |
| downstream | なし                                        | 本タスクは閉ループ修復の最終ピースとなる |

## 現行コードアンカー

| ファイル                                                               | 現状の役割                                                        | TASK-P0-02 での扱い                                            |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | verify phase の状態遷移管理。`recordVerifyPass()` が存在しない    | `recordVerifyPass()` を追加し verify 成功時の phase 遷移を定義 |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | plan / execute / improve の public bridge。re-verify 経路が不完全 | improve→verify 遷移を追加し閉ループを成立させる                |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                         | IPC handler。verify/improve の IPC エントリポイント               | 閉ループに対応した handler 更新                                |
| `packages/shared/src/types/skillCreator.ts`                            | `SkillCreatorVerifyResult` 型。status `"pass"` のハンドラが未実装 | `"pass"` status に対応するハンドラを追加                       |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | verify 成功時の状態遷移が未定義で閉ループが成立しない問題を、`recordVerifyPass()` と improve→verify 遷移の追加で閉じること           |
| 依存関係・責務境界   | WorkflowEngine は状態遷移 owner。VerificationEngine（P0-01）は検証ロジック owner。本タスクは両者をつなぐ閉ループ遷移の修復に集中する |
| 価値とコストの不均衡 | メソッド追加と遷移テーブル拡張で実装可能。コスト低・価値高（verify が機能しなければ品質保証が成立しない）                            |
| 改善優先順位         | 1. `recordVerifyPass()` 追加 2. improve→verify 遷移追加 3. `requestReverify()` 統合 4. IPC handler 更新 5. UI snapshot 連携          |
| 4条件評価            | 価値性: P0（品質保証の前提）/ 実現性: 高（遷移テーブル拡張）/ 整合性: P0-01 の engine を利用 / 運用性: 完全サイクルテスト可能        |

---

## 成果物一覧

| Phase | 名称             | 成果物                                        |
| ----- | ---------------- | --------------------------------------------- |
| 1     | 要件定義         | `outputs/phase-1/requirements-definition.md`  |
| 2     | 設計             | `outputs/phase-2/design-document.md`          |
| 3     | 設計レビュー     | `outputs/phase-3/review-result.md`            |
| 4     | テスト作成       | `outputs/phase-4/test-specifications.md`      |
| 5     | 実装             | `outputs/phase-5/implementation-record.md`    |
| 6     | テスト拡充       | `outputs/phase-6/extended-test-record.md`     |
| 7     | カバレッジ確認   | `outputs/phase-7/coverage-report.md`          |
| 8     | リファクタリング | `outputs/phase-8/refactoring-record.md`       |
| 9     | 品質保証         | `outputs/phase-9/quality-report.md`           |
| 10    | 最終レビュー     | `outputs/phase-10/final-review-result.md`     |
| 11    | 手動テスト       | `outputs/phase-11/manual-test-result.md`      |
| 12    | ドキュメント更新 | `outputs/phase-12/implementation-guide.md` 他 |
| 13    | PR作成           | `outputs/phase-13/change-summary.md`          |

---

## タスク分解サマリ（Phase 1-13）

```mermaid
graph TD
    P1[Phase 1: 要件定義] --> P2[Phase 2: 設計]
    P2 --> P3{Phase 3: 設計レビュー}
    P3 -->|PASS/MINOR| P4[Phase 4: テスト作成]
    P3 -->|MAJOR/CRITICAL| P2
    P4 --> P5[Phase 5: 実装]
    P5 --> P6[Phase 6: テスト拡充]
    P6 --> P7[Phase 7: カバレッジ確認]
    P7 --> P8[Phase 8: リファクタリング]
    P8 --> P9[Phase 9: 品質保証]
    P9 --> P10{Phase 10: 最終レビュー}
    P10 -->|PASS/MINOR| P11[Phase 11: 手動テスト]
    P10 -->|MAJOR| P8
    P11 --> P12[Phase 12: ドキュメント更新]
    P12 --> P13[Phase 13: PR作成]
```

| Phase | 名称             | パターン | 依存     | ゲート |
| ----- | ---------------- | -------- | -------- | ------ |
| 1     | 要件定義         | seq      | -        | -      |
| 2     | 設計             | seq      | Phase 1  | -      |
| 3     | 設計レビュー     | seq      | Phase 2  | GATE   |
| 4     | テスト作成       | seq      | Phase 3  | -      |
| 5     | 実装             | seq      | Phase 4  | -      |
| 6     | テスト拡充       | seq      | Phase 5  | -      |
| 7     | カバレッジ確認   | seq      | Phase 6  | -      |
| 8     | リファクタリング | seq      | Phase 7  | -      |
| 9     | 品質保証         | seq      | Phase 8  | -      |
| 10    | 最終レビュー     | seq      | Phase 9  | GATE   |
| 11    | 手動テスト       | seq      | Phase 10 | -      |
| 12    | ドキュメント更新 | par      | Phase 11 | -      |
| 13    | PR作成           | seq      | Phase 12 | -      |

---

## テストカバレッジ目標

| カテゴリ | 対象                                                        | 目標     |
| -------- | ----------------------------------------------------------- | -------- |
| ユニット | `recordVerifyPass()` phase 遷移                             | 100%     |
| ユニット | verify→improve / improve→verify 遷移                        | 100%     |
| ユニット | `requestReverify()` eligibility と verification engine 統合 | 100%     |
| 統合     | execute→verify(fail)→improve→verify(pass) 完全サイクル      | E2E 検出 |

---

## Phase 完了時アクション

各 Phase 完了時に以下を実行:

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow step-10-seq-task-p0-02-verify-improve-reverify-closed-loop \
  --phase <PHASE_NUMBER>
```

---

## 出力ファイル構成

```
docs/30-workflows/skill-creator-agent-sdk-lane/step-10-seq-task-p0-02-verify-improve-reverify-closed-loop/
├── index.md
├── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
├── phase-13-pr-creation.md
└── outputs/
    ├── phase-1/ ~ phase-13/
    └── phase-11/screenshots/
```
