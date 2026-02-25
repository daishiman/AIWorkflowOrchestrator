# Phase 13: PR作成

## メタ情報

| 項目       | 値                               |
| ---------- | -------------------------------- |
| Phase      | 13                               |
| タスクID   | UT-IPC-AUTH-HANDLE-DUPLICATE-001 |
| 機能名     | ut-ipc-auth-handle-duplicate-001 |
| 前提Phase  | Phase 12                         |
| 後続Phase  | なし                             |
| ステータス | 未実施                           |
| 作成日     | 2026-02-25                       |

## 目的

レビューしやすいPR資料を整理する。  
実際のPR作成は、ローカル確認結果の取得とユーザーの明示許可がある場合のみ実行する。

## 実行タスク

- Lead: ローカル確認項目を整理し、ユーザーへ確認依頼を行う。
- Lead: PR本文ドラフトを作成する。
- SubAgent-D: 仕様更新差分と検証結果を添付形式へ整理する。
- SubAgent-A: 受入基準達成状況を要約する。
- Lead: PR実行要否を確認し、許可がない場合はドラフト出力のみで完了する。

## 参照資料

| 参照資料                     | パス                                                                         | 内容                 |
| ---------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 1                      | `phase-1-requirements.md`                                                    | 受入基準要約         |
| Phase 2                      | `phase-2-design.md`                                                          | 設計要約             |
| Phase 5                      | `phase-5-implementation.md`                                                  | 実装差分要約         |
| Phase 6                      | `phase-6-test-expansion.md`                                                  | 追加検証要約         |
| Phase 7                      | `phase-7-coverage-check.md`                                                  | 網羅結果要約         |
| Phase 8                      | `phase-8-refactoring.md`                                                     | リファクタ要約       |
| Phase 9                      | `phase-9-quality-assurance.md`                                               | 品質判定要約         |
| Phase 10                     | `phase-10-final-review.md`                                                   | 最終判定             |
| Phase 11                     | `phase-11-manual-test.md`                                                    | 手動確認要約         |
| Phase 12                     | `phase-12-documentation.md`                                                  | 仕様更新結果         |
| index                        | `index.md`                                                                   | 仕様全体の入口       |
| 認証IPC仕様                  | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`          | PR本文の契約根拠     |
| IPCセキュリティ              | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | 設計根拠             |
| タスク台帳仕様               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 未タスク連携根拠     |
| 品質ゲート                   | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`   | PR前チェック観点     |
| 実行フロー                   | `.claude/skills/task-specification-creator/references/execute-workflow.md`   | PR自動実行禁止ルール |
| final-review-findings.md     | `outputs/phase-10/final-review-findings.md`                                  | Phase 10 成果物      |
| final-review-result.md       | `outputs/phase-10/final-review-result.md`                                    | Phase 10 成果物      |
| spec-planned-artifacts.md    | `outputs/phase-10/spec-planned-artifacts.md`                                 | Phase 10 成果物      |
| manual-findings.md           | `outputs/phase-11/manual-findings.md`                                        | Phase 11 成果物      |
| manual-test-result.md        | `outputs/phase-11/manual-test-result.md`                                     | Phase 11 成果物      |
| spec-planned-artifacts.md    | `outputs/phase-11/spec-planned-artifacts.md`                                 | Phase 11 成果物      |
| documentation-changelog.md   | `outputs/phase-12/documentation-changelog.md`                                | Phase 12 成果物      |
| implementation-guide.md      | `outputs/phase-12/implementation-guide.md`                                   | Phase 12 成果物      |
| skill-feedback-report.md     | `outputs/phase-12/skill-feedback-report.md`                                  | Phase 12 成果物      |
| spec-planned-artifacts.md    | `outputs/phase-12/spec-planned-artifacts.md`                                 | Phase 12 成果物      |
| spec-update-summary.md       | `outputs/phase-12/spec-update-summary.md`                                    | Phase 12 成果物      |
| unassigned-task-detection.md | `outputs/phase-12/unassigned-task-detection.md`                              | Phase 12 成果物      |
| verify-unassigned-links.log  | `outputs/phase-12/verify-unassigned-links.log`                               | Phase 12 成果物      |
| recheck-compliance-report.md | `outputs/phase-12/recheck-compliance-report.md`                              | Phase 12 成果物      |

## 実行手順

1. 変更要約と背景をPR本文に整理する。
2. テスト結果と検証ログを添付する。
3. ユーザーのローカル確認結果を反映する。
4. 未タスクとフォローアップを明記する。
5. PR作成許可がない場合は `pr-draft.md` と `pr-checklist.md` の出力のみで完了する。

## 成果物

| 成果物           | パス                                             | 説明             |
| ---------------- | ------------------------------------------------ | ---------------- |
| PRドラフト       | `outputs/phase-13/pr-draft.md`                   | 提出用本文       |
| チェックリスト   | `outputs/phase-13/pr-checklist.md`               | レビュー観点     |
| ローカル確認記録 | `outputs/phase-13/local-verification-request.md` | ユーザー確認項目 |

## 完了条件

- [ ] ローカル確認依頼項目が整理されている
- [ ] PRドラフトが作成済み
- [ ] 添付情報（検証・仕様更新）が整理済み
- [ ] 未タスクとフォローアップが明記済み
- [ ] PR実行はユーザー明示許可がある場合のみ実施する方針が明記済み
- [ ] 本Phase内の全タスクを100%実行完了
