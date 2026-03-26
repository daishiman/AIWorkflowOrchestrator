# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-SDK-01                        |
| Phase      | 10                                 |
| Phase名    | 最終レビュー                       |
| ステータス | spec_created                       |
| 前提Phase  | Phase 1, Phase 2, Phase 5, Phase 9 |
| 後続Phase  | Phase 11                           |
| 作成日     | 2026-03-26                         |

## 目的

AC-1 から AC-4 を最終照合し、Task02、Task03、Task04 へ渡す foundation contract に不足がないかを判定する。

## 実行タスク

- AC verification: AC-1 から AC-4 の達成状況を確認する
- downstream readiness review: Task02、Task03、Task04 の入力が揃っているかを確認する
- open decision review: Task08 へ送る session 互換論点や verify 追加論点を残課題として整理する
- final gate decision: PASS / MINOR / MAJOR / CRITICAL を記録する

## 参照資料

| 資料名                    | パス                                           | 説明                        |
| ------------------------- | ---------------------------------------------- | --------------------------- |
| Phase 1                   | `phase-1-requirements.md`                      | AC-1 / AC-4 照合元          |
| Phase 2                   | `phase-2-design.md`                            | AC-2 照合元                 |
| Phase 5                   | `phase-5-implementation.md`                    | downstream readiness 照合元 |
| Phase 9                   | `phase-9-quality-assurance.md`                 | 残リスク確認                |
| requirements-traceability | `outputs/phase-7/requirements-traceability.md` | AC trace                    |
| spec-sync-checklist       | `outputs/phase-9/spec-sync-checklist.md`       | Phase 12 handoff            |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容            |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------- |
| api-ipc-system-core                                      | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                      | public IPC 整合 |
| arch-electron-services-details-part2                     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | facade 整合     |
| task-workflow                                            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                            | same-wave sync  |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | drift 再発防止  |

## 実行手順

1. AC-1 から AC-4 を acceptance-criteria と traceability に照らして確認する。
2. Task02、Task03、Task04 の handoff が `phase topology / resource descriptor / entry-exit hook` で揃っているかを確認する。
3. Phase 9 の risk register を読み、Task08 へ回す open decision を抽出する。
4. final review result に PASS / MINOR / MAJOR / CRITICAL と戻り先を記録する。

## 統合テスト連携

- Phase 11 は final review result に基づいて manual walkthrough を行う。
- Phase 12 は final review で確定した sync 対象だけを更新する。
- MINOR 指摘は unassigned-task 候補として整理する。

## 成果物

| 成果物                   | パス                                           | 説明                 |
| ------------------------ | ---------------------------------------------- | -------------------- |
| final-review-result      | `outputs/phase-10/final-review-result.md`      | AC 判定              |
| open-decisions           | `outputs/phase-10/open-decisions.md`           | 後続へ送る論点       |
| task02-handoff-checklist | `outputs/phase-10/task02-handoff-checklist.md` | downstream readiness |

## 完了条件

- [ ] AC-1 から AC-4 の判定が記録されている
- [ ] Task02、Task03、Task04 の handoff readiness が記録されている
- [ ] open decision が Task08 向け論点とその他論点に分離されている
- [ ] PASS / MINOR / MAJOR / CRITICAL の判定と戻り先が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
