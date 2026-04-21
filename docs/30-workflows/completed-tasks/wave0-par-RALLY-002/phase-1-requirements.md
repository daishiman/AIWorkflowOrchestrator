# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| タスク名   | restoredPendingRequest合成ルール明確化 |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-21                             |
| ステータス | completed                              |

## 目的

本ブランチ上の既存実装を観測し、`restoredPendingRequest` の優先規則とクリア条件が上流設計書・skill定義・RALLY-010 以降の依存条件と矛盾なく説明できる状態へ固定する。

## 実行タスク

1. P50 で実装済みコードと最近の履歴を確認する
2. `rally-phase-1-analysis.md`、`rally-phase-2-solution.md`、`rally-phase-3-review.md` を読み、RALLY-002 の責務境界を抽出する
3. `task-specification-creator` と `aiworkflow-requirements` の要求を照合し、verify_existing / NON_VISUAL 判定を確定する
4. 30種の思考法を使って 4 条件監査を行い、要件・非目標・受け入れ基準を定義する

## 実行手順

```bash
git log --oneline -20 -- apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx

rg -n "restoredPendingRequest|pendingRequest|awaitingUserInput|setRestoredPendingRequest" \
  apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx
```

現在コードで確認済みの事実:

- `pendingRequest = restoredPendingRequest ?? workflowSnapshot?.awaitingUserInput ?? null`
- `workflowSnapshot?.awaitingUserInput?.requestId` を依存とする `useEffect` が存在し、`restoredPendingRequest` を `null` に戻している
- したがって本タスクは新規ロジック追加ではなく、**既存ロジックの意味を仕様へ整流する verify_existing** が中心となる

## 統合テスト連携

- Phase 4 では新規実装前提の RED ではなく、既存挙動を固定する targeted regression test を優先する
- Phase 5 は diff 確認を主作業とし、コード変更は不一致があった場合に限定する
- Phase 11 は NON_VISUAL 手動確認として semantic behavior のみを監査する

## 多角的チェック観点（30思考法）

| カテゴリ     | 思考法                                                               | 本タスクでの使い方                                                        |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | 上流設計書と現コードの差を仮説ではなく観測ベースで詰める                  |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | comment / clear logic / downstream dependency / close-out を分離する      |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | RALLY-002 の真の責務が「新規実装」か「既存挙動の固定」かを再判定する      |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | useEffect を増やすより verify_existing へ寄せる方がエレガントかを比較する |
| システム系   | システム思考、因果関係分析、因果ループ                               | `RALLY-002 -> RALLY-010..013` の依存連鎖を明示する                        |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | 変更量を増やさず downstream の読みやすさを上げる                          |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 「何を直すか」より「何を固定し、何を触らないか」を整理する                |

## サブタスク管理

| SubAgent | 主担当                      | 並列/直列        |
| -------- | --------------------------- | ---------------- |
| A        | 現状コード観測              | 並列             |
| B        | 上流設計書 / skill 正本照合 | 並列             |
| C        | 30思考法による4条件監査     | 並列             |
| D        | 統合判断と受け入れ基準確定  | A-C 完了後に直列 |

## 受け入れ基準

- AC-1: `RALLY-002` は verify_existing タスクとして定義され、Phase 4/5 がその前提で書かれている
- AC-2: `restoredPendingRequest` 優先規則と `workflowSnapshot` 到着後のクリア条件が仕様書で説明される
- AC-3: `RALLY-002` が `ConversationalInterview.tsx` に閉じた責務であることが明記される
- AC-4: `RALLY-010` 以降への依存が index / artifacts / 本文で一致している
- AC-5: Phase 11 は NON_VISUAL、Phase 13 は approval-blocked 原則に整合している

## 参照資料

| 資料名     | パス                                                                     | 用途         |
| ---------- | ------------------------------------------------------------------------ | ------------ |
| 対象コード | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 現状観測     |
| 分析書     | `docs/30-workflows/00-task-spec-design-docs/rally-phase-1-analysis.md`   | 問題起点     |
| 解決策設計 | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md`   | 責務境界     |
| レビュー   | `docs/30-workflows/00-task-spec-design-docs/rally-phase-3-review.md`     | 依存関係整理 |

## 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/p50-check-result.md`
- `outputs/phase-1/thinking-coverage-map.md`

## 完了条件

- [ ] P50 で既存コードの事実を記録した
- [ ] verify_existing / NON_VISUAL 判定を固定した
- [ ] 30種の思考法を 4 条件監査へ割り当てた
- [ ] AC-1〜AC-5 を確定した

## タスク100%実行確認【必須】

- [ ] A〜D のサブタスクを完了
- [ ] 成果物を全件定義
- [ ] Phase 1-3 完了前に Phase 4 へ進まないことを明記

## 次のPhase

Phase 2: 設計
