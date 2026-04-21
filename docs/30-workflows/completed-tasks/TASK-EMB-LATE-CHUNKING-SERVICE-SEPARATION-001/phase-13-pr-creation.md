# Phase 13: PR作成

## メタ情報

| 項目       | 値                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| Phase      | 13                                                                      |
| タスクID   | TASK-EMB-LATE-CHUNKING-SERVICE-SEPARATION-001                           |
| タスク種別 | NON_VISUAL code task                                                    |
| 目的       | user 明示承認がある場合のみ close-out 情報を整え、PR 作成可否を判定する |
| 前提Phase  | Phase 12（ドキュメント更新）                                            |
| 後続Phase  | なし                                                                    |
| 作成日     | 2026-04-20                                                              |
| 機能名     | emb-late-chunking-service-separation                                    |

---

## 目的

Phase 13 は user の明示承認がある場合のみ実施する。今回は commit / push / PR 作成がスコープ外であるため、blocked 条件と必要成果物だけを固定し、実行可能な終端仕様としてワークフローを閉じる。

## 実行タスク

### タスク1: blocked 条件の確認

1. user から commit / push / PR 作成の明示承認があるか確認する。
2. 承認がない場合は `blocked` を維持し、`outputs/phase-13/pr-creation-result.md` に未実施理由を記録する。
3. 承認がある場合のみ local check、change summary、PR 情報整理へ進む。

### タスク2: close-out 情報の整理

1. `outputs/phase-13/local-check-result.md` に Phase 9〜12 の evidence 参照先をまとめる。
2. `outputs/phase-13/change-summary.md` に変更概要、依存関係、残課題を要約する。
3. `outputs/phase-13/pr-info.md` に PR タイトル案、本文案、review 観点を整理する。

### タスク3: PR 作成結果の記録

1. user 承認がない場合は `outputs/phase-13/pr-creation-result.md` に `blocked` を記録する。
2. user 承認がある場合のみ、実施した commit / push / PR 作成結果を同ファイルに残す。

## 実行手順

1. Phase 12 の mandatory 6 tasks と追加 Task 12-7 が完了していることを確認する。
2. user 承認の有無で `blocked` か `go` を判定する。
3. `blocked` の場合は close-out artifacts のみ更新して終了する。
4. `go` の場合のみ commit / push / PR 作成へ進む。

## 統合テスト連携

- Phase 13 では新規テストを追加しない。
- Phase 9〜11 の `LateChunkingService` 単体テストと `chunking-service.integration.test.ts` の evidence を close-out の根拠として参照する。
- 統合テスト evidence が欠けている場合は PR 作成へ進まない。

## 参照資料

| 参照資料                  | パス                                                     | 内容                                 |
| ------------------------- | -------------------------------------------------------- | ------------------------------------ |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                | PASS / MINOR / MAJOR / CRITICAL 判定 |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                 | NON_VISUAL evidence                  |
| Phase 12 compliance check | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 13 進行条件                    |

## Canonical Artifacts

| 成果物             | パス                                     | 内容                      |
| ------------------ | ---------------------------------------- | ------------------------- |
| local check result | `outputs/phase-13/local-check-result.md` | Phase 9〜12 evidence 集約 |
| change summary     | `outputs/phase-13/change-summary.md`     | 変更要約と残課題          |
| pr info            | `outputs/phase-13/pr-info.md`            | PR タイトル案と本文案     |
| pr creation result | `outputs/phase-13/pr-creation-result.md` | blocked / 実施結果        |

## 成果物

| 成果物             | パス                                     | 内容                     |
| ------------------ | ---------------------------------------- | ------------------------ |
| local check result | `outputs/phase-13/local-check-result.md` | close-out 前提確認       |
| change summary     | `outputs/phase-13/change-summary.md`     | 実装と文書更新の要約     |
| pr info            | `outputs/phase-13/pr-info.md`            | PR 用メタ情報            |
| pr creation result | `outputs/phase-13/pr-creation-result.md` | user 承認待ち / 実施結果 |

## 完了条件

- [ ] user 明示承認の有無が記録されている
- [ ] 承認なしの場合、`pr-creation-result.md` に `blocked` 理由が記録されている
- [ ] 承認ありの場合のみ commit / push / PR 作成結果が記録されている
- [ ] Phase 9〜12 の evidence 参照先が `local-check-result.md` に集約されている

## タスク100%実行確認【必須】

- [ ] Task 1: blocked 条件確認 完了
- [ ] Task 2: close-out 情報整理 完了
- [ ] Task 3: PR 作成結果記録 完了

## Phase末端アクション【必須】

- [ ] 本 Phase の全タスクを 100% 実行完了
- [ ] user 承認がない場合は `blocked` を維持
- [ ] 承認がある場合のみ commit / push / PR 作成を実施

## 依存関係

- 前提: Phase 12 の mandatory 6 tasks と Task 12-7 が完了していること
- 制約: commit / push / PR 作成は user の明示承認がある場合のみ実施する

## 次のPhase

なし。Phase 13 がワークフロー終端。
