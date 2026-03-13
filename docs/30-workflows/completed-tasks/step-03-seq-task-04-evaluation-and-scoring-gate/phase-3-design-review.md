# Phase 3: 設計レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase名    | 設計レビューゲート                   |
| タスクID   | TASK-SKILL-LIFECYCLE-04              |
| 前提Phase  | Phase 1（要件定義）, Phase 2（設計） |
| 後続Phase  | Phase 4（テスト作成）                |
| ステータス | completed                            |
| 作成日     | 2026-03-12                           |
| 機能名     | skill-lifecycle-evaluation-gate      |

## 目的

Task04 の評価設計が、Task03 の主導線を壊さず、Task05 の利用導線で再利用でき、かつ security / permission block を確実に保持しているかを判定する。

## 実行タスク

- 要件整合レビュー: Phase 1 の FR / NFR / AC が Phase 2 の型と gate engine に反映されているか確認する
- 責務境界レビュー: `agentSlice` と `skillEvaluationSlice`、Task03 / Task05 surface、内部 role の責務分離を確認する
- Hard block レビュー: security / critical risk / permissionSafety の block 条件が UI bypass 不能になっているか確認する
- Handoff レビュー: Task03 create / execute / improve と Task05 use の入出力が定義済みか確認する
- 検証計画レビュー: Phase 4 以降で unit / integration / manual / documentation が追跡可能か確認する

### 判定基準

| 判定     | 条件                                      | 対応                    |
| -------- | ----------------------------------------- | ----------------------- |
| PASS     | 重大指摘なし                              | Phase 4 へ進行          |
| MINOR    | 表記揺れ、説明不足、補助資料不足のみ      | 修正後に Phase 4 へ進行 |
| MAJOR    | gate 条件、責務境界、handoff の欠落がある | Phase 2 へ戻る          |
| CRITICAL | security / permission block の欠落がある  | Phase 1 へ戻る          |

### レビュー観点

| 観点               | 確認内容                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| 要件カバレッジ     | FR-1〜FR-7、NFR-1〜NFR-5、AC-1〜AC-6 の対応表が埋まっているか               |
| 閾値整合           | `ScoreDisplay` の 60 / 80 閾値と gate design が矛盾していないか             |
| state ownership    | Renderer direct IPC を増やさず、slice 境界が明確か                          |
| cross-task handoff | Task03 / Task05 の依存契約が 1 方向ではなく往復で定義されているか           |
| UI 非露出          | `Atent Team` / `SubAgent` / `Codex` がユーザー向け主要 CTA になっていないか |
| 証跡準備           | Phase 11 screenshot plan と Phase 12 sync plan が追跡可能か                 |

## 参照資料

| 参照資料             | パス                                                                                                                             | 説明                       |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 1 要件         | `phase-1-requirements.md`                                                                                                        | 受入基準と checkpoint      |
| Phase 2 設計         | `phase-2-design.md`                                                                                                              | 型設計と gate engine       |
| Phase 1 要件成果物   | `outputs/phase-1/evaluation-requirements-matrix.md`                                                                              | FR / NFR / AC 一覧         |
| Phase 2 設計成果物   | `outputs/phase-2/gate-decision-design.md`                                                                                        | threshold と hard block    |
| Phase 2 handoff 契約 | `outputs/phase-2/task03-task05-handoff-contract.md`                                                                              | Task03 / Task05 入出力     |
| Task03 設計レビュー  | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-3-design-review.md` | 単一導線と内部 role 非露出 |
| Task05 index         | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                               | usage journey 受け側       |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                                |
| ------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | Skill Center / Workspace / Agent の責務             |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | lifecycle entry canonicalization と state ownership |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | Task03 の Renderer 統合契約                         |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | permission 境界と UI 非露出原則                     |

## 実行手順

### ステップ1: 要件と設計の対応表を確認する

FR / NFR / AC ごとに設計成果物の対応箇所を確認し、抜けがあれば issue ledger に記録する。

### ステップ2: gate engine と hard block をレビューする

60 / 80 閾値、critical risk、permissionSafety block が矛盾なく記述されているかを確認する。

### ステップ3: state / UI / cross-task handoff をレビューする

Task03 / Task05 の接続表、slice ownership、surface ごとの表示責務を確認する。

### ステップ4: 後続 phase の検証可能性をレビューする

Phase 4〜12 の成果物が、unit / integration / manual / documentation の 4 系統を確実に追跡できるかを確認する。

## 統合テスト連携

| 観点             | レビュー内容                                                              |
| ---------------- | ------------------------------------------------------------------------- |
| unit test        | gate engine と hard block の最小ケースが設計されているか                  |
| integration test | Task03 event -> Task04 decision -> Task05 banner の接続が設計されているか |
| manual test      | warning / block / recommended の 3 系統が画面で確認できるか               |
| documentation    | Phase 12 で system spec 更新先が明示されているか                          |

## 成果物

| 成果物           | パス                                      | 内容                          |
| ---------------- | ----------------------------------------- | ----------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 判定、指摘、戻り先            |
| issue ledger     | `outputs/phase-3/issue-ledger.md`         | MINOR / MAJOR / CRITICAL 一覧 |

## 完了条件

- [x] FR / NFR / AC の対応表に未割当がない（AC-1〜AC-6）
- [x] hard block 条件の欠落がない
- [x] Task03 / Task05 handoff に未定義項目がない
- [x] Renderer direct IPC 増加が設計に含まれていない
- [x] Phase 4〜12 の成果物追跡が可能である
- [x] MAJOR 指摘が 0 件である
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 4: テスト作成](./phase-4-test-creation.md) に進む
