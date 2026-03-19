# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント                                                                                                                                                                                                |
| タスクID   | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001                                                                                                                                                                     |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | completed                                                                                                                                                                                                   |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 機能名     | slide-ai-runtime-alignment                                                                                                                                                                                  |
| タスク種別 | 設計タスク（spec_created）                                                                                                                                                                                  |

## 目的

Slide / Modifier / Legacy Agent 経路の runtime 整流 の内容を system spec と task 台帳へ同期する。

## docs-only モードフラグ

本タスクは設計タスクのため、以下のモードで Phase 12 を実行する:

- Step 1-B 実装状況: `spec_created`（実装コードは未完了だが、台帳・正本仕様・未タスク formalize は本 Phase で完了させる）
- Step 1-G 検証コマンド: `verify-all-specs` / `validate-phase-output` / `validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` まで実行して記録する
- implementation-guide Part 2: 型定義・IPC 契約・使用例・エラーハンドリング・エッジケースまで記述する

## docs-only 追加確認

- navigation: `phase-11-12-guide.md` と `phase-12-documentation-guide.md` を入口にする
- archive discoverability: `phase-template-phase12.md` / `spec-update-workflow.md` / `spec-update-validation-matrix.md` / `phase12-task-spec-compliance-template.md` の相互参照を残す
- mirror parity: `.claude/skills/task-specification-creator` と `.agents/skills/task-specification-creator` を `diff -qr` で比較する
- validation path: 詳細コマンド列挙は Step 1-G と `phase12-task-spec-compliance-check.md` に集約する
- Phase 11 screenshot validator も実行し、fallback capture を使った場合は metadata と changelog に理由を残す

## 実行タスク（6 必須タスク）

- T-12-1 実装ガイド作成: Part 1/Part 2 の2部構成で implementation-guide を作成する
- T-12-2 システム仕様書更新: Step 1-A〜1-G と Step 2 を分離して完了させる
- T-12-3 ドキュメント更新履歴作成: documentation-changelog に全 Step を事後記録する
- T-12-4 未タスク検出レポート作成: 0件でも unassigned-task-detection を出力する
- T-12-5 スキルフィードバックレポート作成: 改善点なしでも理由付きで記録する
- T-12-6 準拠チェック: phase12-task-spec-compliance-check に root parity / validator / artifacts sync を集約する

| Task      | T-ID   | 名称                                         | 必須 | 詳細                                                                                                                                                                                                                                                  |
| --------- | ------ | -------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task 12-1 | T-12-1 | 実装ガイド作成（2パート構成）                | 必須 | Part 1: 中学生レベル概念説明（日常例え必須）。「slide の reverse-sync は、友達のノートを写す時に先生（RuntimeResolver）に許可を取る仕組み」のような例え。Part 2: 技術詳細（TypeScript 型定義、IPC チャネル名、DI 境界、RuntimeResolver 統合パターン） |
| Task 12-2 | T-12-2 | システム仕様書更新（Step 1-A〜1-G + Step 2） | 必須 | Step 1: タスク完了記録・台帳同期・検証・`outputs/artifacts.json` 同期。Step 2: primary target 10 仕様書の実更新（`spec_created` ステータスで記録）                                                                                                    |
| Task 12-3 | T-12-3 | ドキュメント更新履歴作成                     | 必須 | documentation-changelog.md に全 Step の結果を個別に明記。各 Step 完了後に記録（事前に「完了」と書かない: P4 準拠）                                                                                                                                    |
| Task 12-4 | T-12-4 | 未タスク検出レポート作成                     | 必須 | 0 件でも出力必須。SF-03 の 4 パターン確認必須                                                                                                                                                                                                         |
| Task 12-5 | T-12-5 | スキルフィードバックレポート作成             | 必須 | 改善点なしでも出力必須                                                                                                                                                                                                                                |
| Task 12-6 | T-12-6 | phase12-task-spec-compliance-check           | 必須 | Task 12-1〜12-6、Step 1-A〜1-G、Step 2 の準拠チェックを 1 ファイルに集約する                                                                                                                                                                          |

### Task 12-2 詳細: Step 1-A〜1-G

| Step | 必須 | 内容                                                                                                                                                                                                                                                                                                                                   |
| ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1-A  | ✅   | `phase-12-documentation.md`、`task-workflow.md`、`LOGS.md` x2 を同一ターンで更新する。`SKILL.md` x2 は差分がある場合のみ更新する                                                                                                                                                                                                       |
| 1-B  | ✅   | 実装状況テーブルを `spec_created` で統一する                                                                                                                                                                                                                                                                                           |
| 1-C  | ✅   | `関連タスク` / `未タスク候補` / `残課題` テーブルを grep で横断確認する                                                                                                                                                                                                                                                                |
| 1-D  | ✅   | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` で `indexes/topic-map.md` と `indexes/keywords.json` を再生成する                                                                                                                                                                                              |
| 1-E  | ✅   | `verify-unassigned-links.js --source outputs/phase-12/unassigned-task-detection.md` と `unassigned-task-detection.md` を突合する                                                                                                                                                                                                       |
| 1-F  | ✅   | `lessons-learned-ipc-preload-runtime.md` / `lessons-learned-current.md` と `artifacts.json` / `outputs/artifacts.json` を同期する                                                                                                                                                                                                      |
| 1-G  | ✅   | `node .claude/skills/skill-creator/scripts/quick_validate.js ...` / `validate_all.js ...`（`task-specification-creator` / `skill-creator`）/ `verify-all-specs.js` / `validate-phase-output.js` / `validate-phase11-screenshot-coverage.js` / `validate-phase12-implementation-guide.js` / `diff -qr` / planned wording 確認を記録する |

> `task-workflow.md` は Step 1-A、`lessons-learned.md` は Step 1-F に寄せ、Step 2 から分離する。

### Task 12-2 詳細: Step 2 domain spec 同期先（10 ファイル）

| #   | 仕様書                                      | 更新内容                                                                                      |
| --- | ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 1   | workflow-ai-runtime-authmode-unification.md | task 09 の canonical set、artifact inventory、validator 状態、UT-SLIDE backlog を同期する     |
| 2   | api-ipc-system-core.md                      | slide invoke/push 12チャネル、rename table、current drift、security 順序を同期する            |
| 3   | interfaces-agent-sdk-skill-advanced.md      | modifier / skill-executor / handoffGuidance の責務境界を同期する                              |
| 4   | arch-electron-services-details-part2.md     | RuntimeResolver の slide 採用、agent-client 廃止、DI 配線を同期する                           |
| 5   | ui-ux-feature-components-details.md         | SlideSyncCard / SlideProgressRow / SlideWatchStatus / SlideGuidanceBlock の UI 正本を同期する |
| 6   | arch-state-management-advanced.md           | slideSlice 拡張、selector 方針、P31 follow-up を同期する                                      |
| 7   | security-electron-ipc-core.md               | validateIpcSender -> P42 -> path guard -> business の順序を同期する                           |
| 8   | task-workflow-completed.md                  | task 09 の `spec_created` 完了記録を追加する                                                  |
| 9   | task-workflow-backlog.md                    | `UT-SLIDE-*` 4件を backlog 登録する                                                           |
| 10  | lessons-learned-ipc-preload-runtime.md      | screenshot fallback、RuntimeResolver 再利用、legacy drift の教訓を同期する                    |

### Task 12-4 詳細: SF-03 未タスク 4 パターン確認

| パターン                  | 確認内容                                                 | 確認方法                                      |
| ------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| 型定義 -> 実装            | Phase 2 で定義した型が後続で実装必要か                   | grep で型定義箇所と実装箇所を照合             |
| 契約 -> テスト            | IPC 契約設計に対するテストが後続で必要か                 | Phase 4 テストケースとの差分確認              |
| UI 仕様 -> コンポーネント | UI 4 領域の設計に対する React コンポーネント実装が必要か | Phase 2 UI 設計と既存コンポーネントの差分確認 |
| 仕様書間差異 -> 設計決定  | 複数仕様書間で矛盾する記述がないか                       | cross-reference で差異を検出                  |

### Task 12-6 詳細: phase12-task-spec-compliance-check（P4対策・最終確認）

- Task 12-1〜12-6 の全完了を確認してから作成する
- `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` を突合する
- `artifacts.json` と `outputs/artifacts.json` の completed 成果物一覧が一致していることを確認する
- `phase12-task-spec-compliance-check.md` に Task 12-1〜12-6 / Step 1-A〜1-G / Step 2 / validator 結果 / mirror parity を記録する

### Phase 10 MINOR 追跡テーブル

| MINOR-ID                  | 指摘内容         | 未タスク仕様書パス | ステータス       |
| ------------------------- | ---------------- | ------------------ | ---------------- |
| （Phase 10 実行時に記入） | （実行時に記入） | （実行時に記入）   | （実行時に記入） |

### planned wording 残存確認コマンド

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"
```

## 多角的チェック観点

| 観点                    | チェック内容                                                                                                                                                   | 関連 Pitfall / ルール |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| LOGS.md 2ファイル       | aiworkflow-requirements と task-specification-creator の両方が更新されていること                                                                               | P1, P25               |
| topic-map.md            | generate-index.js が実行され、indexes/ が更新されていること                                                                                                    | P2, P27               |
| 未タスク 3ステップ      | 指示書作成 + task-workflow 登録 + 関連仕様書リンクの全ステップが完了していること                                                                               | P3, P38, P58          |
| documentation-changelog | 全 Step 完了前に「完了」と記載しないこと                                                                                                                       | P4, P51               |
| planned wording         | `.claude/skills/` 配下に「仕様策定のみ」「実行予定」等の表現が残っていないこと                                                                                 | P57                   |
| サブエージェント分割    | 仕様書更新は 3 ファイル以下/エージェントに分割すること                                                                                                         | P43                   |
| 件数整合                | documentation-changelog の未タスク件数と unassigned-task-detection.md の検出件数が一致すること                                                                 | P59                   |
| root parity             | `.claude` / `.agents` の mirror parity が `diff -qr` で一致していること                                                                                        | P43                   |
| artifacts sync          | `artifacts.json` と `outputs/artifacts.json` の completed 成果物一覧が一致していること                                                                         | P59                   |
| validation path         | `quick_validate.js` / `validate_all.js` / `verify-all-specs.js` / `validate-phase-output.js` / `validate-phase12-implementation-guide.js` が記録されていること | P1, P25, P57          |

## 参照資料

| 参照資料                    | パス                                                                                    | 内容                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                               | 依存する前提成果物を確認する                                                      |
| Phase 2（設計）             | `phase-2-design.md`                                                                     | 依存する前提成果物を確認する                                                      |
| Phase 5（実装）             | `phase-5-implementation.md`                                                             | 依存する前提成果物を確認する                                                      |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                             | 依存する前提成果物を確認する                                                      |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                             | 依存する前提成果物を確認する                                                      |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                                | 依存する前提成果物を確認する                                                      |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                          | 依存する前提成果物を確認する                                                      |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                              | 依存する前提成果物を確認する                                                      |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                               | 依存する前提成果物を確認する                                                      |
| Phase 11/12 ガイド          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | docs-only task の navigation / archive discoverability / mirror parity を確認する |
| Phase 12 ガイド             | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`  | Task 12-1〜12-6 の詳細と docs-only ルールを確認する                               |
| spec update workflow        | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Step 1 / Step 2 の境界と artifacts sync を確認する                                |
| validation matrix           | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md` | validator と pass 条件を確認する                                                  |
| slide skill-executor        | `apps/desktop/src/main/slide/skill-executor.ts`                                         | slide skill execute の current path を確認する                                    |
| slide agent-client          | `apps/desktop/src/main/slide/agent-client.ts`                                           | legacy agent client の current path を確認する                                    |
| modifier-skill              | `apps/desktop/src/main/slide/modifier-skill.ts`                                         | reverse-sync modifier の current path を確認する                                  |
| sync-manager                | `apps/desktop/src/main/slide/sync-manager.ts`                                           | watcher と sync status の authority を確認する                                    |
| SlideWorkspace              | `apps/desktop/src/renderer/slide/SlideWorkspace.tsx`                                    | slide renderer surface と reverse-sync 導線を確認する                             |

### システム仕様（aiworkflow-requirements）

> 完全な canonical set は `index.md` を正本とし、この Phase では「spec sync の入口」と「台帳同期の根拠」だけを重点確認する。Step 2 の実更新対象は上記の Step 2 テーブルを正本とする。

| 参照資料                     | パス                                                                                            | 内容                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| workflow-ai-runtime-authmode | `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md` | foundation 契約、canonical set、artifact inventory の正本 |
| task-workflow                | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                            | 完了台帳、関連タスク、未タスク導線の正本                  |
| lessons-learned              | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                          | 苦戦箇所と再発防止の正本                                  |
| legacy filename register     | `.claude/skills/aiworkflow-requirements/references/legacy-ordinal-family-register.md`           | artifact / output 名の旧名互換と drift 監査               |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、対象範囲を固定する。

### ステップ2: T-12-1 実装ガイドを作成する

Part 1（中学生レベル概念説明）と Part 2（技術詳細）の 2 部構成で作成する。

### ステップ3: T-12-2 Step 1 タスク完了記録を行う

`phase-12-documentation.md`、`task-workflow.md`、`LOGS.md` x2 を更新し、必要な差分がある場合のみ `SKILL.md` x2 を更新する。`topic-map.md` は再生成する。

### ステップ4: T-12-2 Step 2 システム仕様書を実更新する

primary target 10 仕様書を `.claude/skills/` 配下で実更新する。planned wording を残さない。

### ステップ5: T-12-3 documentation-changelog を作成する

全 Step の結果を個別に記録する。各 Step 完了後に事後記録する。

### ステップ6: T-12-4 未タスク検出レポートを作成する

SF-03 の 4 パターンを確認し、検出結果を記録する。0 件でも出力する。

### ステップ7: T-12-5 スキルフィードバックレポートを作成する

改善点を記録する。0 件でも出力する。

### ステップ8: planned wording 残存確認を行う

rg コマンドで planned wording が残っていないことを確認する。

### ステップ9: 成果物と完了条件を確認する

全成果物が存在し、`phase12-task-spec-compliance-check.md` を含めて完了条件を満たしていることを確認する。

## サブタスク管理

1. T-12-1: implementation-guide.md の Part 1 + Part 2 作成
2. T-12-2 Step 1: `phase-12-documentation.md` / `task-workflow.md` / `LOGS.md` x2 更新、必要時のみ `SKILL.md` x2 更新、`indexes/topic-map.md` / `indexes/keywords.json` 再生成
3. T-12-2 Step 2A: 更新予定ファイルと変更内容の計画記録
4. T-12-2 Step 2B: primary target 10 仕様書 + 補助 2 ファイルの実更新（3 ファイル以下/エージェント: P43 準拠）
5. T-12-3: documentation-changelog.md の作成（全 Step 事後記録）
6. T-12-4: unassigned-task-detection.md の作成（SF-03 4 パターン確認）
7. T-12-5: skill-feedback-report.md の作成
8. T-12-6: phase12-task-spec-compliance-check.md の作成
9. planned wording 残存確認
10. 全成果物の存在確認

## 成果物

| 成果物               | パス                                                     | 内容                                                                        |
| -------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1（中学生レベル概念説明）と Part 2（技術詳細）の 2 部構成              |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果、validator、artifacts 同期、mirror parity を記録する |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 仕様書更新履歴を全 Step 事後記録                                            |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | SF-03 4 パターン確認結果（0 件でも出力）                                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善観点を記録（0 件でも出力）                                              |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6、Step 1-A〜1-G、Step 2 の準拠チェックを集約する             |

## 完了条件

- [ ] T-12-1: implementation-guide.md が Part 1 + Part 2 の 2 部構成で作成されている
- [ ] T-12-2 Step 1: `phase-12-documentation.md` / `task-workflow.md` / `LOGS.md` x2 が更新され、`topic-map.md` が再生成され、必要時のみ `SKILL.md` x2 が更新されている
- [ ] T-12-2 Step 1-F: `lessons-learned-ipc-preload-runtime.md` / `lessons-learned-current.md` と `artifacts.json` / `outputs/artifacts.json` が同期されている
- [ ] T-12-2 Step 2: primary target 10 仕様書が `.claude/skills/` 配下で実更新されている
- [ ] T-12-3: documentation-changelog.md に全 Step の結果が事後記録されている
- [ ] T-12-4: unassigned-task-detection.md が作成されている（0 件でも出力）
- [ ] T-12-5: skill-feedback-report.md が作成されている（0 件でも出力）
- [ ] T-12-6: phase12-task-spec-compliance-check.md が作成されている
- [ ] planned wording が残存していない
- [ ] spec sync 先が slide reverse-sync / modifier / security / settings の正本まで定義されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の completed 成果物一覧が一致している
- [ ] validation path と root parity が明示されている

## タスク100%実行確認【必須】

- [ ] 全 T-ID（T-12-1 から T-12-6）の成果物が存在する
- [ ] LOGS.md が aiworkflow-requirements と task-specification-creator の**2ファイル両方**で更新されている（P1/P25）
- [ ] `task-workflow.md` が Step 1-A と整合して更新されている
- [ ] `lessons-learned-ipc-preload-runtime.md` / `lessons-learned-current.md` が Step 1-F と整合して更新されている
- [ ] `SKILL.md` x2 は差分がある場合のみ更新し、差分がない場合はその旨が記録されている
- [ ] topic-map.md が再生成されている（P2/P27）
- [ ] 未タスクが検出された場合、3ステップ（指示書 + task-workflow + 関連仕様書リンク）が全て完了している（P3/P38/P58）
- [ ] documentation-changelog.md に「完了」が全 Step 実行後に記録されている（P4/P51）
- [ ] `.claude/skills/` 配下に planned wording が残っていない（P57）
- [ ] documentation-changelog の未タスク件数と unassigned-task-detection.md の検出件数が一致している（P59）
- [ ] 仕様書更新が関心ごと分離されたサブエージェント監査結果と整合している（P43）
- [ ] `artifacts.json` と `outputs/artifacts.json` の completed 成果物一覧が一致している
- [ ] `phase12-task-spec-compliance-check.md` に root parity / validation path / artifacts sync が記録されている
- [ ] 成果物パスに全ファイルが存在する

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
