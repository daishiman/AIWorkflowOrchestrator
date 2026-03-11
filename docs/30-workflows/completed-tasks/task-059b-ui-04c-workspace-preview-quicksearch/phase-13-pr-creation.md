# Phase 13: PR作成

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 13                                             |
| ステータス   | pending                                        |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-D                                     |

## 目的

最終提出物を整理する。ユーザー指示に従い、このタスクでは commit と PR 作成を実行しない。

## 実行タスク

- PR本文草案作成: Summary/Testing/Spec Sync/Risks を整理する
- 提出物確認: Phase 1-12 の成果物リンクを確認する
- 制約確認: commit 禁止、PR 禁止の指示を確認する

## 参照資料

| 参照資料        | パス                                                     | 説明         |
| --------------- | -------------------------------------------------------- | ------------ |
| index           | `index.md`                                               | 全体導線     |
| Phase 2 成果物  | `outputs/phase-2/architecture-design.md`                 | 設計根拠     |
| Phase 5 成果物  | `outputs/phase-5/implementation-summary.md`              | 実装根拠     |
| Phase 6 成果物  | `outputs/phase-6/regression-matrix.md`                   | 回帰根拠     |
| Phase 7 成果物  | `outputs/phase-7/coverage-report.md`                     | 品質根拠     |
| Phase 8 成果物  | `outputs/phase-8/refactoring-log.md`                     | 整理根拠     |
| Phase 9 成果物  | `outputs/phase-9/quality-report.md`                      | QA根拠       |
| Phase 10 成果物 | `outputs/phase-10/final-review-result.md`                | ゲート根拠   |
| Phase 11 成果物 | `outputs/phase-11/manual-test-result.md`                 | 手動検証根拠 |
| Phase 12 成果物 | `outputs/phase-12/spec-update-summary.md`                | 同期根拠     |
| Phase仕様全体   | `phase-1-requirements.md` 〜 `phase-12-documentation.md` | 記載根拠     |
| traceability    | `requirements-traceability-matrix.md`                    | 要件対応表   |

## 実行手順

### ステップ1: PR本文テンプレート整理

| セクション | 記載内容                  |
| ---------- | ------------------------- |
| Summary    | 04C の追加機能            |
| Testing    | 自動/手動検証結果         |
| Spec Sync  | aiworkflow/task-spec 反映 |
| Risks      | 未タスクと残リスク        |

### ステップ2: 実行制約を固定

| 制約   | 取り扱い                       |
| ------ | ------------------------------ |
| commit | ユーザー明示指示まで実行しない |
| PR作成 | ユーザー明示指示まで実行しない |

## 成果物

| 成果物       | パス                                    | 説明               |
| ------------ | --------------------------------------- | ------------------ |
| PR情報草案   | `outputs/phase-13/pr-info.md`           | PR本文テンプレート |
| 完了報告草案 | `outputs/phase-13/completion-report.md` | 実施結果要約       |

## 完了条件

- [ ] PR本文テンプレートを定義している
- [ ] Phase 1-12 の参照導線を定義している
- [ ] commit/PR 非実行の制約を明記している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. PR本文テンプレート整理
2. 参照導線確認
3. 制約確認
4. 成果物パス定義
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-13/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

次工程なし。ユーザーの明示指示があるまで commit / PR は保留。
