# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 11                                                                          |
| 機能名     | TASK-SC-08                                                                  |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 前提Phase  | Phase 10                                                                    |
| 後続Phase  | Phase 12                                                                    |
| 作成日     | 2026-04-19                                                                  |
| ステータス | pending                                                                     |

## 目的

本タスクは `useStreamingProgress.ts` の内部マッピング拡張が中心であり、UI コンポーネント自体の視覚変更はない。
そのため Phase 11 では NON_VISUAL として、手動確認の要否判定と代替証跡を固定する。判定の一次ソースは
`manual-test-result.md` とし、補助証跡を checklist / issues / screenshot plan / capture metadata に分離する。

## 実行タスク

- NON_VISUAL 判定: `GenerateStep.tsx` / `SkillCreateWizard.tsx` / `useStreamingProgress.ts` の差分から視覚変更の有無を判定する
- evidence 設計: `screenshot-plan.json` と `phase11-capture-metadata.json` に「撮影不要」の根拠と代替証跡を記録する
- 判定記録: PASS / FAIL / BLOCKED / N/A を `manual-test-result.md` と `discovered-issues.md` に記録する

## シナリオ

| TC-ID       | モード         | 検証対象            | 期待結果                                                                         |
| ----------- | -------------- | ------------------- | -------------------------------------------------------------------------------- |
| TC-11-SC-01 | create         | 基本 progress 遷移  | 自動テストと実装差分確認により視覚変更なしと判断できる                           |
| TC-11-SC-02 | update         | mode-specific phase | `loading-skill` / `analyzing` の内部マッピング変更が UI レイアウト変更を伴わない |
| TC-11-SC-03 | collaborative  | 退行確認            | 既存 UI を壊さず hook 内部のみが変わっている                                     |
| TC-11-SC-04 | orchestrate    | engine-selection    | `engine-selection` 対応が stage 解決のみで視覚変更を伴わない                     |
| TC-11-SC-05 | improve-prompt | improving           | `improving` 対応が `message` 文言受け渡しを変えない                              |
| TC-11-SC-06 | cancel / retry | 状態リセット        | キャンセル系 UI は今回の差分対象外である                                         |

## 証跡方針

| 成果物                     | パス                                             | 用途                                         |
| -------------------------- | ------------------------------------------------ | -------------------------------------------- |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`         | TC ごとの判定・根拠・実行ログの正本          |
| 手動テストチェックリスト   | `outputs/phase-11/manual-test-checklist.md`      | 実施可否・前提条件・capture preflight        |
| 発見事項一覧               | `outputs/phase-11/discovered-issues.md`          | blocker / note / info の分類                 |
| スクリーンショット計画JSON | `outputs/phase-11/screenshot-plan.json`          | capture 対象・期待状態・ファイル名 canonical |
| capture metadata           | `outputs/phase-11/phase11-capture-metadata.json` | NON_VISUAL 判定と代替証跡 inventory          |
| screenshots                | `outputs/phase-11/screenshots/`                  | validator 整合用プレースホルダ               |

## スクリーンショット計画

`screenshot-plan.json` では `mode: "SKIP"` を前提にし、以下の状態はすべて「撮影不要」として管理する。

| 画面状態                     | canonical ファイル名                               |
| ---------------------------- | -------------------------------------------------- |
| create planning              | `skill-lifecycle-create-planning.png`              |
| update analyzing             | `skill-lifecycle-update-analyzing.png`             |
| collaborative active         | `skill-lifecycle-collaborative-progress.png`       |
| orchestrate engine-selection | `skill-lifecycle-orchestrate-engine-selection.png` |
| improve-prompt improving     | `skill-lifecycle-improve-prompt-improving.png`     |
| cancel reset                 | `skill-lifecycle-cancel-reset.png`                 |

## 統合テスト連携

- `useStreamingProgress.test.ts` を一次根拠とし、モード別 phase マッピングと cleanup の回帰を担保する
- `manual-test-result.md` では自動テスト実測値と差分監査結果を手動テストの代替証跡として参照する
- `implementation-guide.md` には `screenshot-plan.json` と `phase11-capture-metadata.json` を明記し、NON_VISUAL 判定の理由を引き継ぐ

## 参照資料

| 参照資料           | パス                                         | 説明            |
| ------------------ | -------------------------------------------- | --------------- |
| 要件定義書         | `outputs/phase-1/requirements-definition.md` | Phase 1 成果物  |
| 受け入れ基準       | `outputs/phase-1/acceptance-criteria.md`     | Phase 1 成果物  |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     | Phase 2 成果物  |
| テスト戦略         | `outputs/phase-2/test-strategy.md`           | Phase 2 成果物  |
| 実装サマリー       | `outputs/phase-5/implementation-summary.md`  | Phase 5 成果物  |
| 回帰テスト結果     | `outputs/phase-6/regression-test-result.md`  | Phase 6 成果物  |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md`    | Phase 10 成果物 |

## 実行手順

1. `manual-test-checklist.md` で preflight を確認する。
2. create / update / collaborative / orchestrate / improve-prompt を並列に観察可能な範囲で検証する。
3. cancel / retry を直列で確認し、state reset を最終判定する。
4. 判定結果を `manual-test-result.md`、発見事項を `discovered-issues.md` へ記録する。

## 成果物

| 成果物                     | パス                                        | 説明                  |
| -------------------------- | ------------------------------------------- | --------------------- |
| 手動テスト結果             | `outputs/phase-11/manual-test-result.md`    | 実測値と判定の正本    |
| 手動テストチェックリスト   | `outputs/phase-11/manual-test-checklist.md` | 実施確認              |
| 発見事項一覧               | `outputs/phase-11/discovered-issues.md`     | blocker / note / info |
| スクリーンショット計画JSON | `outputs/phase-11/screenshot-plan.json`     | visual capture plan   |

## 完了条件

- [ ] `manual-test-result.md` / `manual-test-checklist.md` / `discovered-issues.md` / `screenshot-plan.json` が存在する
- [ ] create / update / collaborative / orchestrate / improve-prompt の各モード判定が記録されている
- [ ] `phase11-capture-metadata.json` の `taskId` が `TASK-SC-08` と一致している
- [ ] `screenshots/` が placeholder として存在し、`screenshot-plan.json` の SKIP 判定と矛盾しない
- [ ] blocker があれば `discovered-issues.md` と未タスク化方針へ反映している

## 次のPhase

Phase 12: ドキュメント更新
