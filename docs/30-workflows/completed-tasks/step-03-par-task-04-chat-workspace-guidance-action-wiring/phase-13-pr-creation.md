# Phase 13: PR作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 13                                                 |
| Phase 名   | PR作成                                             |
| タスクID   | TASK-IMP-CHAT-WORKSPACE-GUIDANCE-ACTION-WIRING-001 |
| 前提 Phase | Phase 12                                           |
| 後続 Phase | なし                                               |
| ステータス | blocked                                            |
| 作成日     | 2026-03-19                                         |
| 機能名     | chat-workspace-guidance-action-wiring              |

## 目的

PR 準備条件を整理する。ユーザーが明示的に PR 作成を指示するまで、Phase 13 は blocked 状態を維持し PR を作成しない。

## 実行タスク

- PR blocked 条件確認: user approval なしでは PR を作成しない
- evidence bundle 整理: Phase 10-12 の証跡パスを `pr-preparation.md` にまとめる
- handover 準備: 後続レビュアーが見るべき docs / screenshots / follow-up を一覧化する

## PR blocked 条件

- ユーザーから明示的な PR 作成指示が届いていない
- Phase 12 の required 6 artifacts がそろっていない場合は PR を作成しない
- same-wave sync（workflow / backlog / lessons / mirror parity）が未完了の場合は PR を作成しない
- 未タスク 4件の formalization が欠けている場合は PR を作成しない

## evidence bundle

| 証跡                   | パス                                                   | 確認内容                                   |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------ |
| Phase 10 final gate    | outputs/phase-10/final-gate-decision.md                | 最終レビュー PASS                          |
| Phase 11 manual result | outputs/phase-11/manual-test-result.md                 | TC-11-01〜TC-11-04 の結果                  |
| Phase 11 screenshots   | outputs/phase-11/screenshots/                          | Chat / Settings / Workspace の visual diff |
| Phase 12 spec sync     | outputs/phase-12/system-spec-update-summary.md         | workflow / backlog / lessons / mirror 同期 |
| Phase 12 changelog     | outputs/phase-12/documentation-changelog.md            | 同ターン更新履歴                           |
| Phase 12 compliance    | outputs/phase-12/phase12-task-spec-compliance-check.md | required artifacts / validator 結果        |

## 参照資料

| 参照資料         | パス                                                                                 | 用途                      |
| ---------------- | ------------------------------------------------------------------------------------ | ------------------------- |
| Task index       | docs/30-workflows/step-03-par-task-04-chat-workspace-guidance-action-wiring/index.md | workflow status / AC 確認 |
| Phase 11 result  | outputs/phase-11/manual-test-result.md                                               | visual evidence 参照      |
| Phase 12 summary | outputs/phase-12/system-spec-update-summary.md                                       | same-wave sync 参照       |
| unassigned       | outputs/phase-12/unassigned-task-detection.md                                        | residual follow-up 確認   |

## 成果物

| 成果物     | パス                               | 内容                                |
| ---------- | ---------------------------------- | ----------------------------------- |
| PR準備メモ | outputs/phase-13/pr-preparation.md | blocked 条件、証跡、handover の整理 |

## 完了条件

- [ ] ユーザーから PR 作成の明示指示がある
- [ ] evidence bundle が `outputs/phase-13/pr-preparation.md` に整理されている
- [ ] same-wave sync と mirror parity が確認済みである
- [ ] **指示前に PR を作成していない**

## タスク100%実行確認【必須】

- [x] Phase 13 は blocked と記録した
- [x] 各成果物パスが `outputs/phase-13/` と一致している
- [x] ユーザー指示前に PR を作成していない
- [x] blocked 条件を明文化した

## 次のPhase

- なし（ユーザー指示待ち）
