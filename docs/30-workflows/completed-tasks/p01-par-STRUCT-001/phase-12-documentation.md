# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 12                   |
| Phase名    | ドキュメント更新     |
| 対象機能   | TASK-SW-STRUCT-001   |
| 前提Phase  | Phase 11: 手動テスト |
| 次Phase    | Phase 13: PR作成     |
| ステータス | completed            |
| 作成日     | 2026-04-15           |
| 更新日     | 2026-04-16           |

## 目的

`SkillCreatorService` の current facts を Phase 12 成果物へ固定し、`task-specification-creator` の Phase 12 契約に合わせて、実装ガイド・system spec・変更履歴・未タスク検出・skill feedback・準拠チェックを同 wave で閉じる。

## 実行タスク

### Task 12-1: 実装ガイド

- `outputs/phase-12/TASK-SW-STRUCT-001-implementation-guide.md` を作成する
- `Part 1` では日常の例えと「なぜ必要か → 何をするか」の順序を維持する
- `Part 2` では型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定項目を記録する

### Task 12-2: system spec update summary

- `outputs/phase-12/TASK-SW-STRUCT-001-system-spec-update-summary.md` を作成する
- `createSkill() -> runCreateWorkflow() -> init_skill.js -> generateSkillMd()` の current facts を明記する
- `task-workflow.md` と `lessons-learned-current-2026-04.md` に整合する形で current / baseline を記録する

### Task 12-3: documentation changelog

- `outputs/phase-12/TASK-SW-STRUCT-001-documentation-changelog.md` を作成する
- 変更ファイル、validator 結果、current / baseline、Step 完了結果を記録する

### Task 12-4: unassigned task detection

- `outputs/phase-12/TASK-SW-STRUCT-001-unassigned-task-detection.md` を作成する
- current facts では formalized な未タスクは 0 件として記録する

### Task 12-5: skill feedback report

- `outputs/phase-12/TASK-SW-STRUCT-001-skill-feedback-report.md` を作成する
- 今後の同系タスクで再利用できる学びを 1 ファイルに集約する

### Task 12-6: phase12-task-spec-compliance-check

- `outputs/phase-12/TASK-SW-STRUCT-001-phase12-task-spec-compliance-check.md` を作成する
- 6 成果物、planned wording、artifact parity、validator 実測値を確認する

## Step 1: current facts の固定

### Step 1-A

- `runCreateWorkflow()` は `purpose = options.description` / `agents = ["extract-purpose", "plan-structure"]` を返す
- `createSkill()` は create モードで `runCreateWorkflow()` の結果を `generateSkillMd()` に渡す

### Step 1-B

- `SkillCreatorService` の公開 API に変更はない
- `loadAgent` は create モードから外し、collaborative モードのみに残す

### Step 1-C

- future wording は current facts から除去する
- Phase 12 成果物は task prefix 付きファイル名を canonical とする

### Step 1-D

- `docs/30-workflows/p01-par-STRUCT-001/artifacts.json` を canonical manifest として確認し、`outputs/artifacts.json` は別 workflow の ledger として扱う
- Phase 9 / 11 / 12 / 13 の status を current facts に合わせて同期する

## Step 2: aiworkflow-requirements への反映

### Step 2A

- `task-workflow.md`
- `task-workflow-backlog.md`
- `lessons-learned-current-2026-04.md`

### Step 2B

- `phase-12-documentation-guide.md`
- `spec-update-workflow.md`
- `spec-update-validation-matrix.md`
- `phase-11-12-guide.md`

## 参照資料

- `outputs/phase-11/TASK-SW-STRUCT-001-manual-test-result.md` — 手動テスト結果
- `outputs/phase-10/TASK-SW-STRUCT-001-final-review-result.md` — 最終レビュー結果
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — current facts の正本
- `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part1.md` — `SkillCreatorService` の current contract
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current-2026-04.md` — current lessons

## 関連ガイド

- [phase-12-documentation-guide.md](../../../../.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md)
- [phase-template-phase12.md](../../../../.claude/skills/task-specification-creator/references/phase-template-phase12.md)
- [phase12-checklist-definition.md](../../../../.claude/skills/task-specification-creator/references/phase12-checklist-definition.md)
- [phase-11-12-guide.md](../../../../.claude/skills/task-specification-creator/references/phase-11-12-guide.md)

## 完了条件

- [x] Task 12-1〜12-6 が全て完了している
- [x] `task-specification-creator` の Phase 12 契約に沿っている
- [x] current facts と baseline の差分が整理されている
- [x] future wording が残っていない
- [x] Phase 13 へ進める

## 次 Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
