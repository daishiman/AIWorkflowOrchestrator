# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 11                                   |
| 機能名 | user-interaction-bridge-and-phase-ui |
| 作成日 | 2026-03-26                           |

## 目的

質問に答えながら進める UX、phase summary、handoff surface、provenance summary が仕様書上で理解しやすいか walkthrough で確認する。

## 実行タスク

- manual test checklist を作成する
- walkthrough 結果と discovered issues を記録する
- screenshot plan を docs-heavy task 向けに整理する

## テストケース

| テストケース | 観点                      | 期待結果                                                                                    | 証跡                                     |
| ------------ | ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-11-01     | phase owner 表現          | `currentPhase` / `awaitingUserInput` / `verifyResult` owner が engine と明記される          | `outputs/phase-11/manual-test-result.md` |
| TC-11-02     | question kind             | `single_select` / `free_text` / `secret` / `confirm` の4種が説明される                      | `outputs/phase-11/manual-test-result.md` |
| TC-11-03     | phase UI block separation | phase badge / question host / provenance summary / handoff card が別 block として記述される | `outputs/phase-11/manual-test-result.md` |
| TC-11-04     | handoff visible 化        | `terminal_handoff` が console-only で終わらない前提がある                                   | `outputs/phase-11/manual-test-result.md` |
| TC-11-05     | downstream boundary       | Task05-08 へ境界が委譲され、Task04 が detail/governance/persistence を抱え込まない          | `outputs/phase-11/manual-test-result.md` |

## 手動テスト方針

- この task は task spec 作成であり UI 実装そのものではないため、Phase 11 は document walkthrough を主 evidence とする
- `captureRequired=false` 前提で screenshot inventory を残し、主要根拠は checklist / result / report に置く
- execute handoff visible 化、question kind、phase block separation、provenance summary を重点観点にする

## 画面カバレッジマトリクス

| テストケース | surface            | 状態                 | 証跡ファイル                             | 判定 | 備考                                                    |
| ------------ | ------------------ | -------------------- | ---------------------------------------- | ---- | ------------------------------------------------------- |
| TC-11-01     | phase badge        | owner 表示確認       | `outputs/phase-11/manual-test-result.md` | PASS | docs-heavy のため markdown walkthrough を正本証跡とする |
| TC-11-02     | question host      | 4 kind 定義確認      | `outputs/phase-11/manual-test-result.md` | PASS | screenshot は `captureRequired=false`                   |
| TC-11-03     | provenance summary | 非owner 表示確認     | `outputs/phase-11/manual-test-result.md` | PASS | source summary block を確認                             |
| TC-11-04     | handoff card       | visible handoff 確認 | `outputs/phase-11/manual-test-result.md` | PASS | `TerminalHandoffCard` を第一候補とする                  |
| TC-11-05     | boundary note      | downstream 委譲確認  | `outputs/phase-11/manual-test-result.md` | PASS | Task05-08 への handoff を確認                           |

## 参照資料

| 資料名                | パス                             | 説明             |
| --------------------- | -------------------------------- | ---------------- |
| Phase 2 設計          | `phase-2-design.md`              | bridge / UI 契約 |
| Phase 5 実装          | `phase-5-implementation.md`      | 実装対象         |
| Phase 6 拡充          | `phase-6-test-expansion.md`      | edge case        |
| Phase 7 coverage      | `phase-7-coverage-check.md`      | coverage 観点    |
| Phase 8 refactoring   | `phase-8-refactoring.md`         | 命名と責務整理   |
| Phase 9 QA            | `phase-9-quality-assurance.md`   | QA 観点          |
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

- Phase 13 の validator 記録と組み合わせて最終 evidence bundle を構成する
- walkthrough で確認した handoff visible 化と phase block separation を renderer regression 観点へ戻せるようにする

## 完了条件

- [ ] AI 質問 -> ユーザー回答の流れが明確
- [ ] handoff / provenance / phase summary の walkthrough が記録されている
- [ ] docs-heavy task に合わせた evidence bundle が揃っている
- [ ] **本Phase内の全タスクを100%実行完了**
