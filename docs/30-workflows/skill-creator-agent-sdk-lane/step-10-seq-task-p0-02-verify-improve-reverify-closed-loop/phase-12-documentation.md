# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 12                                               |
| Phase名    | ドキュメント更新                                 |
| 対象機能   | TASK-P0-02 verify→improve→re-verify 閉ループ修復 |
| 前提Phase  | Phase 11: 手動テスト                             |
| 次Phase    | Phase 13: PR作成                                 |
| ステータス | pending                                          |
| 作成日     | 2026-03-29                                       |

## 目的

task-specification-creator の Phase 12 必須 6 成果物を canonical filename で揃え、閉ループ修復の実装ガイドを中学生レベル概念説明 + 技術詳細の 2 部構成で作成する。

## 実行タスク

### Task 12-1: 実装ガイド

- `implementation-guide.md` に Part 1 / Part 2 を作成する
- **Part 1: 中学生レベルの概念説明**
  - 「検証 → 改善 → 再検証」のループを日常的な比喩で説明する
  - テストの答え合わせ → 間違い直し → 再テストの流れとして説明する
  - なぜこのループが大切なのかを平易な言葉で説明する
- **Part 2: 技術詳細**
  - `recordVerifyPass()` の追加内容と使い方
  - phase 遷移テーブルの変更点
  - improve→verify 遷移の実装詳細
  - Facade/IPC handler の更新箇所
  - UI snapshot の変更点

### Task 12-2: 仕様更新サマリ

- `system-spec-update-summary.md` に参照した正本仕様と no-op / update 判定を書く
- WorkflowEngine の phase transition spec への反映有無を記録する

### Task 12-3: 変更履歴

- `documentation-changelog.md` に今回整えたファイルを列挙する

### Task 12-4: 未タスク検出

- `unassigned-task-detection.md` に閉ループ修復から派生した未割当タスクの有無を記録する

### Task 12-5: スキルフィードバック

- `skill-feedback-report.md` に task-specification-creator スキルへの改善案を記録する

### Task 12-6: 準拠チェック

- `phase12-task-spec-compliance-check.md` で 6 成果物の存在と validator 結果を束ねる

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 設計成果物           | `outputs/phase-2/design-document.md`       | 遷移テーブル設計 |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 変更内容         |
| テスト拡充記録       | `outputs/phase-6/extended-test-record.md`  | 境界ケース       |
| カバレッジレポート   | `outputs/phase-7/coverage-report.md`       | AC 対応表        |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md`    | 最小複雑性判断   |
| 品質保証レポート     | `outputs/phase-9/quality-report.md`        | 準拠根拠         |
| 最終レビュー結果     | `outputs/phase-10/final-review-result.md`  | 総合判定         |

## 成果物

| 成果物                | パス                                                     | 説明               |
| --------------------- | -------------------------------------------------------- | ------------------ |
| 実装ガイド            | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2    |
| 仕様更新サマリ        | `outputs/phase-12/system-spec-update-summary.md`         | 参照仕様と同期判定 |
| ドキュメント変更履歴  | `outputs/phase-12/documentation-changelog.md`            | 変更一覧           |
| 未タスク検出          | `outputs/phase-12/unassigned-task-detection.md`          | 残課題有無         |
| スキルフィードバック  | `outputs/phase-12/skill-feedback-report.md`              | skill 改善案       |
| Phase 12 準拠チェック | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6 成果物確認       |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] Part 1（中学生レベル）と Part 2（技術詳細）が分離されている
- [ ] 計画系文言が除去されている
- [ ] skill 準拠結果が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
