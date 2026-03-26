# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 11                                         |
| 機能名 | execution-governance-and-handoff-alignment |
| 作成日 | 2026-03-26                                 |

## 目的

design task として、governance bundle、visible handoff、approval/disclosure separation、Task08 への handoff 前提が仕様書上で誤読されないか walkthrough で確認する。

## 実行タスク

- manual test checklist を作成する
- walkthrough 結果と discovered issues を記録する
- docs-heavy task 向け screenshot plan を整理する

## テストケース

| テストケース | 観点                             | 期待結果                                                             | 証跡                                     |
| ------------ | -------------------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| TC-11-01     | route priority                   | `integrated_api` primary / `terminal_handoff` secondary が明記される | `outputs/phase-11/manual-test-result.md` |
| TC-11-02     | consumer auth guard              | `sess-` 系 token 非流用が明記される                                  | `outputs/phase-11/manual-test-result.md` |
| TC-11-03     | manual boundary                  | MB-1〜MB-4 が Skill Creator に適用される                             | `outputs/phase-11/manual-test-result.md` |
| TC-11-04     | approval / disclosure separation | enforcement と説明責務が分離されている                               | `outputs/phase-11/manual-test-result.md` |
| TC-11-05     | downstream boundary              | Task05/06/08 への handoff が明確                                     | `outputs/phase-11/manual-test-result.md` |

## 手動テスト方針

- 本 task は設計 task のため、Phase 11 は design walkthrough を主 evidence とする
- screenshot は `captureRequired=false` を基本とし、主要根拠は checklist / result / report に置く
- visible handoff と shared governance 再利用を重点観点にする

## 画面カバレッジマトリクス

| テストケース | surface                  | 状態                 | 証跡ファイル                             | 判定 | 備考                            |
| ------------ | ------------------------ | -------------------- | ---------------------------------------- | ---- | ------------------------------- |
| TC-11-01     | policy summary           | route priority 確認  | `outputs/phase-11/manual-test-result.md` | PASS | docs-heavy task                 |
| TC-11-02     | guard note               | consumer token guard | `outputs/phase-11/manual-test-result.md` | PASS | screenshot 不要                 |
| TC-11-03     | handoff block            | Manual Boundary      | `outputs/phase-11/manual-test-result.md` | PASS | shared `HandoffGuidance` を確認 |
| TC-11-04     | approval/disclosure note | separation 確認      | `outputs/phase-11/manual-test-result.md` | PASS | existing shared channel を確認  |
| TC-11-05     | downstream note          | Task08 前提確認      | `outputs/phase-11/manual-test-result.md` | PASS | boundary walkthrough            |

## 参照資料

| 資料名                | パス                             | 説明             |
| --------------------- | -------------------------------- | ---------------- |
| Phase 2 設計          | `phase-2-design.md`              | topology / owner |
| Phase 5 実装          | `phase-5-implementation.md`      | 実装対象         |
| Phase 6 拡充          | `phase-6-test-expansion.md`      | edge case        |
| Phase 7 coverage      | `phase-7-coverage-check.md`      | coverage 観点    |
| Phase 8 refactoring   | `phase-8-refactoring.md`         | 命名と責務整理   |
| Phase 9 QA            | `phase-9-quality-assurance.md`   | 品質観点         |
| Phase 10 final review | `phase-10-final-review.md`       | gate 条件        |
| test matrix           | `outputs/phase-4/test-matrix.md` | walkthrough 観点 |

## 成果物

| 成果物                | パス                                        | 説明                         |
| --------------------- | ------------------------------------------- | ---------------------------- |
| manual test checklist | `outputs/phase-11/manual-test-checklist.md` | walkthrough 観点             |
| manual test result    | `outputs/phase-11/manual-test-result.md`    | 実施結果                     |
| manual test report    | `outputs/phase-11/manual-test-report.md`    | 総括                         |
| discovered issues     | `outputs/phase-11/discovered-issues.md`     | 発見事項                     |
| screenshot plan       | `outputs/phase-11/screenshot-plan.json`     | docs-heavy task 用 inventory |

## 統合テスト連携

- Phase 13 validation と組み合わせて governance evidence bundle を構成する
- visible handoff と consumer auth guard を regression 観点へ戻せるようにする

## 完了条件

- [ ] governance bundle の walkthrough が記録されている
- [ ] approval / disclosure / manual boundary の結論が追跡できる
- [ ] docs-heavy task に合わせた evidence bundle が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
