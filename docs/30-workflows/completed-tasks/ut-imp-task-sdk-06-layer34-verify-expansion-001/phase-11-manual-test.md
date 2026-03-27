# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 11                                   |
| 機能名 | task-sdk-06-layer34-verify-expansion |
| 作成日 | 2026-03-27                           |

## 目的

Layer 3 / Layer 4 verify の section traceability、delegated boundary、re-verify 導線を walkthrough で確認する。

## 実行タスク

- manual checklist を作成する
- screenshot plan と coverage を定義する
- discovered issue の記録方針を定義する

## 参照資料

| 資料名          | パス                                           | 説明               |
| --------------- | ---------------------------------------------- | ------------------ |
| contract matrix | `outputs/phase-2/layer34-contract-matrix.md`   | section 母集団     |
| implementation  | `outputs/phase-5/implementation-sequencing.md` | 実装順             |
| test matrix     | `outputs/phase-4/test-matrix.md`               | manual case 母集団 |
| test expansion  | `outputs/phase-6/test-expansion-summary.md`    | edge case          |
| coverage        | `outputs/phase-7/coverage-summary.md`          | coverage           |
| refactoring     | `outputs/phase-8/refactoring-summary.md`       | naming 一貫性      |
| qa summary      | `outputs/phase-9/qa-summary.md`                | QA gate            |
| final review    | `outputs/phase-10/final-review-summary.md`     | 最終 gate          |

## 実行手順

### ステップ1: checklist を定義する

- section 表示、provenance detail、re-verify action、delegated note の 4 系統を確認対象にする。

### ステップ2: evidence 方針を定義する

- current workflow 配下に `TC-ID ↔ screenshot artifact ↔ metadata` を残す。
- live capture が失敗した場合でも、fallback 理由・source evidence・generated-at を metadata に残す。
- discovered issue が 0 件でも結果ファイルは出力する。

## 統合テスト連携

- Phase 11 では manual walkthrough を docs QA の補完証跡として扱う。

## テストケース

| テストケース | 観点                                                                           | 証跡                                                                   |
| ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| TC-11-01     | verify detail card に status / phase / evidence / route / message が表示される | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-02     | checks list と provenance summary の対応を確認できる                           | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-03     | delegated governance / session note が参照表示に留まり owner を移さない        | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-04     | `reverifyWorkflow` 導線と disabled reason を確認できる                         | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |

## 画面カバレッジマトリクス

| テストケース | surface                               | state                         | 必須度 | 証跡                                                                   |
| ------------ | ------------------------------------- | ----------------------------- | ------ | ---------------------------------------------------------------------- |
| TC-11-01     | verify-detail-panel                   | default                       | A      | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-02     | verify-detail-panel checks/provenance | populated                     | A      | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-03     | delegated-note blocks                 | reference-only                | A      | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |
| TC-11-04     | reverify button / disabled reason     | enabled-disabled review board | B      | `outputs/phase-11/screenshots/TC-11-01-verify-detail-review-board.png` |

## 成果物

| 成果物                | パス                                                         | 説明                           |
| --------------------- | ------------------------------------------------------------ | ------------------------------ |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md`                  | walkthrough 項目               |
| manual test result    | `outputs/phase-11/manual-test-result.md`                     | 実施結果                       |
| discovered issues     | `outputs/phase-11/discovered-issues.md`                      | 発見事項または 0 件記録        |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`                      | capture / fallback 計画        |
| screenshot coverage   | `outputs/phase-11/screenshot-coverage.md`                    | TC-ID と証跡対応               |
| capture metadata      | `outputs/phase-11/screenshots/phase11-capture-metadata.json` | capture method / fallback 理由 |

## 完了条件

- [ ] walkthrough 項目が定義されている
- [ ] screenshot / fallback evidence 方針が定義されている
- [ ] discovered issues の記録先がある
- [ ] **本Phase内の全タスクを100%実行完了**
