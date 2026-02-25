# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 11                               |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 10                         |
| 後続Phase  | Phase 12                         |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

自動テストで拾いにくい実運用観点を確認し、Phase 12更新に必要な事実を記録する。

## 実行タスク

- SubAgent-D: 手動検証シナリオを実行し結果を記録する。
- SubAgent-B: 自動テストとの差分観点を整理する。
- Lead: 未タスク候補の有無を確定する。

## 参照資料

| 参照資料                  | パス                                                                   | 内容             |
| ------------------------- | ---------------------------------------------------------------------- | ---------------- |
| Phase 1                   | `phase-1-requirements.md`                                              | 受入条件         |
| Phase 2                   | `phase-2-design.md`                                                    | 設計条件         |
| Phase 5                   | `phase-5-implementation.md`                                            | 実装条件         |
| Phase 6                   | `phase-6-test-expansion.md`                                            | 拡張テスト結果   |
| Phase 7                   | `phase-7-coverage-check.md`                                            | 網羅不足情報     |
| Phase 8                   | `phase-8-refactoring.md`                                               | 最終構造         |
| Phase 9                   | `phase-9-quality-assurance.md`                                         | 品質判定         |
| Phase 10                  | `phase-10-final-review.md`                                             | 最終判定         |
| 認証IPC仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`    | 期待挙動         |
| 教訓集                    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` | 手動検証時の観点 |
| final-review-findings.md  | `outputs/phase-10/final-review-findings.md`                            | Phase 10 成果物  |
| final-review-result.md    | `outputs/phase-10/final-review-result.md`                              | Phase 10 成果物  |
| spec-planned-artifacts.md | `outputs/phase-10/spec-planned-artifacts.md`                           | Phase 10 成果物  |

## 実行手順

1. 正常系シナリオを実行する。
2. 異常系シナリオを実行する。
3. 差分と追加課題候補を記録する。

## 統合テスト連携

| テスト項目  | 期待結果                         |
| ----------- | -------------------------------- |
| 認証操作    | 既存操作フローが継続する         |
| エラー表示  | 想定エラーが既存仕様で表示される |
| IPC登録状態 | 重複登録起因の異常が再発しない   |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` | 実行結果     |
| 発見事項       | `outputs/phase-11/manual-findings.md`    | 追加課題候補 |

## 完了条件

- [ ] 手動テスト結果が記録済み
- [ ] 発見事項の分類が完了している
- [ ] 未タスク候補の有無が確定している
- [ ] 統合テスト連携観点の記録が完了している
- [ ] 本Phase内の全タスクを100%実行完了
