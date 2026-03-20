# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                                      |
| ---------- | --------------------------------------------------------- |
| Phase      | 13                                                        |
| Phase 名   | PR作成                                                    |
| タスクID   | TASK-IMP-EXECUTION-RESPONSIBILITY-CONTRACT-FOUNDATION-001 |
| 前提 Phase | Phase 12                                                  |
| 後続 Phase | なし                                                      |
| ステータス | blocked                                                   |
| 作成日     | 2026-03-19                                                |
| 機能名     | execution-responsibility-contract-foundation              |

## 目的

PR 準備条件を整理する。ユーザーが明示的に PR 作成を指示するまで、Phase 13 は blocked 状態を維持し PR を作成しない。

## 実行タスク

### PR blocked 条件確認

PR 作成には以下の全条件が満たされていることが必要:

- ユーザーから明示的な PR 作成指示が届いている
- Phase 12 の全成果物（implementation-guide.md / system-spec-update-summary.md / documentation-changelog.md / unassigned-task-detection.md / skill-feedback-report.md / phase12-task-spec-compliance-check.md）が `outputs/phase-12/` に存在する
- documentation-changelog.md が全 Step（1-A/1-B/1-C/Step 2）の事後記録で完了している
- AC-1〜AC-4 が全て verified である（下記 AC 検証セクション参照）

上記のいずれか1つでも未達の場合、PR 作成を実施せず blocked 状態を維持する。

### evidence bundle 整理

後続レビュアーが参照すべき証跡を以下の優先順で整理する:

| 証跡                             | パス                                           | 確認する内容                                   |
| -------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| Phase 3 gate-decision            | outputs/phase-3/gate-decision.md               | 設計レビュー PASS 判定                         |
| Phase 10 final-gate-decision     | outputs/phase-10/final-gate-decision.md        | 最終レビュー PASS 判定                         |
| Phase 11 manual-test-plan        | outputs/phase-11/manual-test-plan.md           | TC-01〜TC-06 の walkthrough 結果               |
| Phase 11 discovered-issues       | outputs/phase-11/discovered-issues.md          | 発見事項と証跡取得方法                         |
| Phase 12 documentation-changelog | outputs/phase-12/documentation-changelog.md    | 仕様書同期の完了記録                           |
| Phase 12 spec-update-summary     | outputs/phase-12/system-spec-update-summary.md | LOGS.md 2ファイル更新 + topic-map 再生成の記録 |

### AC 検証

PR 作成前に AC-1〜AC-4 の verified 状態を確認する:

| AC   | 内容                                                                                   | 検証先                                                                               |
| ---- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AC-1 | capability 4状態の責務と表示契約が定義されている                                       | outputs/phase-2/contract-matrix.md                                                   |
| AC-2 | UI状態語彙と CTA契約が 1:1 で定義されている                                            | outputs/phase-2/contract-matrix.md                                                   |
| AC-3 | silent fallback / auto-send / hidden prompt injection を禁止する境界が文章化されている | outputs/phase-1/requirements-definition.md / outputs/phase-2/validation-matrix.md    |
| AC-4 | Step02以降が参照すべき canonical doc set が明示されている                              | outputs/phase-1/scope-definition.md / outputs/phase-12/system-spec-update-summary.md |

### handover 整理

後続 Task が並列着手するための前提条件を dependency graph に沿って整理する:

- Task02 が参照すべきドキュメントセット:
  - `outputs/phase-2/contract-matrix.md`（capability × state × CTA 契約）
  - `outputs/phase-12/implementation-guide.md`（既存 canonical capability 語彙と API）
  - `.claude/skills/aiworkflow-requirements/references/interfaces-auth-core.md`（transport DTO の正本）
- Task03-05 が並列着手するための前提条件:
  - Phase 12 documentation-changelog が完了していること
  - Task01 contract が `settings` public shell / `renderView()` consumer 境界まで整理されていること
- Task09 が canonical bridge を閉じるための情報:
  - AC-1〜AC-4 の verified 状態
  - Phase 11 TC-01〜TC-06 の PASS/FAIL/BLOCKED 結果

### PR 本文テンプレート

ユーザーが PR 作成を指示した際にコピー可能な形式で用意する:

```
## Summary

- capability 4状態（integratedRuntime / terminalSurface / both / none）の責務と表示契約を single source of truth として確定
- UI状態語彙（ready / blocked / unavailable）と CTA契約（primary 1個 + secondary 1個）を 1:1 で定義
- silent fallback / auto-send / hidden prompt injection を禁止する境界と、settings public shell / renderView consumer 境界を文章化

## Test Plan

- Phase 4 test-matrix: capability × state × CTA の全組み合わせを自動テストで検証
- Phase 11 manual walkthrough: TC-01〜TC-06（capability 4状態 + 遷移 + fallback 不在）

## AC Verification

| AC | 状態 | 確認先 |
| --- | --- | --- |
| AC-1 | verified | outputs/phase-2/contract-matrix.md |
| AC-2 | verified | outputs/phase-2/contract-matrix.md |
| AC-3 | verified | outputs/phase-1/requirements-definition.md |
| AC-4 | verified | outputs/phase-1/scope-definition.md / outputs/phase-12/system-spec-update-summary.md |
```

## 参照資料

| 参照資料        | パス                                                                                        | 確認する内容                                 |
| --------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 親パック index  | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                  | 依存順・並列可否・設計ゲート                 |
| Task index      | docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md | 対象 task のメタ情報と受入基準（AC-1〜AC-4） |
| Phase 2 outputs | outputs/phase-2/contract-matrix.md / outputs/phase-2/validation-matrix.md                   | AC-1〜AC-4 の直接証跡                        |
| Phase 5 outputs | outputs/phase-5/implementation-plan.md / outputs/phase-5/file-change-scope.md               | concern ownership と handoff 範囲            |
| Phase 6 outputs | outputs/phase-6/regression-expansion-plan.md / outputs/phase-6/edge-case-matrix.md          | 回帰条件と未解決 edge case                   |
| Phase 7 outputs | outputs/phase-7/coverage-targets.md / outputs/phase-7/integration-gate.md                   | coverage / integration gate                  |
| Phase 8 outputs | outputs/phase-8/refactor-boundaries.md / outputs/phase-8/simplification-candidates.md       | refactor 後 invariants                       |
| Phase 9 outputs | outputs/phase-9/quality-checklist.md / outputs/phase-9/risk-register.md                     | quality gate と residual risk                |
| Phase 3         | phase-3-design-review.md                                                                    | gate-decision PASS の証跡                    |
| Phase 10        | phase-10-final-review.md                                                                    | final-gate-decision PASS の証跡              |
| Phase 11        | phase-11-manual-test.md                                                                     | walkthrough 証跡の確認先                     |
| Phase 12        | phase-12-documentation.md                                                                   | documentation-changelog 完了の確認先         |

## 実行手順

### ステップ1: Phase 12 の全成果物を確認し PR blocked 条件をチェックする

`outputs/phase-12/` の全成果物が存在することを確認する。存在しない場合は Phase 12 に戻り完了させる。

### ステップ2: evidence bundle を成果物パスで整理する

上記「evidence bundle 整理」テーブルの各証跡ファイルが存在することを確認し、`outputs/phase-13/pr-preparation.md` に記録する。

### ステップ3: 後続 Task02-09 への handover 情報を dependency graph に沿って整理する

Task02 / Task03-05 / Task09 それぞれの前提条件と参照先を `outputs/phase-13/pr-preparation.md` に記録する。

### ステップ4: PR 本文テンプレートを作成する

`outputs/phase-13/pr-preparation.md` に PR 本文テンプレートを追加する。ユーザーが指示した時点でそのままコピー可能な形式とする。

## 統合テスト連携

Phase 13 は統合テスト実行なし。Phase 11 の TC-01〜TC-06 結果と Phase 12 の documentation-changelog を evidence bundle として参照する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                      | 仕様参照先                                                            |
| ---------------------- | --------------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | PR 本文に CTA 契約の説明を含める場合          | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | handover 情報に責務境界の変更内容を含める場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | PR 本文に IPC 契約変更を含める場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | handover で後続タスクの依存関係を整理する場合 | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 語彙 drift / state drift / simpler alternative の 3 方向で設計を叩く

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. Phase 12 全成果物の存在確認と PR blocked 条件チェック
2. AC-1〜AC-4 の verified 状態確認
3. evidence bundle の整理（成果物パス確認）
4. 後続 Task02-09 への handover 情報整理
5. PR 本文テンプレート作成
6. pr-preparation.md への記録
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物     | パス                               | 内容                                                                  |
| ---------- | ---------------------------------- | --------------------------------------------------------------------- |
| PR準備メモ | outputs/phase-13/pr-preparation.md | blocked 条件・AC 検証・evidence bundle・handover・PR 本文テンプレート |

## 完了条件

- [ ] PR blocked 条件が pr-preparation.md に明記されている（ユーザー指示なしに PR を作成しないことが記述されている）
- [ ] AC-1〜AC-4 の verified 状態が pr-preparation.md に記録されている
- [ ] evidence bundle の全パスが pr-preparation.md に記録されている
- [ ] 後続 Task02 / Task03-05 / Task09 への handover 情報が記述されている
- [ ] PR 本文テンプレート（Summary + Test Plan + AC Verification）が pr-preparation.md に含まれている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-13/` と一致している
- [ ] Phase 12 の全成果物が存在することを確認済み
- [ ] ユーザー指示前に PR を作成していないことを確認済み

## 次のPhase

- なし（ユーザー指示待ち）
