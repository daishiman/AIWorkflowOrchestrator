# Phase 1 成果物: 要件定義 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## 実行日時

2026-04-06

## タスク分類確認

| 分類軸           | 判定           | 理由                                                |
| ---------------- | -------------- | --------------------------------------------------- |
| コード変更       | なし（N/A）    | SkillLifecyclePanel の実装は TASK-SDK-07 で完了済み |
| 自動テスト追加   | なし（N/A）    | コード変更がないため新規テスト不要                  |
| 手動テスト       | 必要（VISUAL） | screenshot 取得が主要成果物                         |
| ドキュメント更新 | 必要           | Phase 11 evidence chain の補完                      |

**Phase 4〜8: 全て N/A**（コード実装・自動テスト不要）

## スコープ定義

### 含むもの

- `SkillLifecyclePanel` 上の `HandoffGuidance` 表示（`terminal_handoff` 状態）
- disclosure summary セクションの表示確認（`data-testid="skill-lifecycle-disclosure-summary"`）
- `integrated_api` 成功後の状態（対照用 screenshot）
- TASK-SDK-07 Phase 11 の evidence bundle 追記（checklist / result / report / issues / visual-review / coverage / metadata）
- `screenshot-plan.json` との capture ID 対応確認

### 含まないもの

- Approval request surface（別タスク `UT-SDK-07-APPROVAL-REQUEST-SURFACE-001`）
- SkillLifecyclePanel のコード変更
- 新規テストケース追加

## 前提条件

- TASK-SDK-07 が実装完了済みであること
- desktop app が開発モードで起動可能であること（`pnpm --filter @repo/desktop dev`）
- `terminal_handoff` 状態を再現できること（API key なし または degraded 状態）

## 制約

- コード変更禁止（docs-only タスク）
- Phase 13（PR作成）はユーザー明示承認後のみ実施

## Acceptance Criteria

| AC番号 | 条件                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1   | `terminal_handoff` 状態の `HandoffGuidance` 表示 screenshot が保存されている                                                                                     |
| AC-2   | disclosure summary（`data-testid="skill-lifecycle-disclosure-summary"`）の screenshot が保存されている                                                           |
| AC-3   | `integrated_api` 成功後の screenshot（対照用）が保存されている                                                                                                   |
| AC-4   | screenshot ファイルは `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` に配置されている          |
| AC-5   | `screenshot-plan.json` に記録した capture ID と screenshot ファイルが対応している                                                                                |
| AC-6   | `outputs/phase-11/manual-test-checklist.md` / `manual-test-result.md` / `manual-test-report.md` に evidence が追記されている                                     |
| AC-7   | `outputs/phase-11/discovered-issues.md` / `ui-sanity-visual-review.md` / `screenshot-coverage.md` / `screenshots/phase11-capture-metadata.json` が作成されている |

## Artifact 命名 canonical 一覧

| artifact 名                             | 配置先                                                                                                           |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `terminal_handoff-handoff-guidance.png` | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `disclosure-summary-display.png`        | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `integrated-api-success-comparison.png` | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `manual-test-checklist.md`              | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `manual-test-result.md`                 | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `manual-test-report.md`                 | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `discovered-issues.md`                  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `ui-sanity-visual-review.md`            | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `screenshot-plan.json`                  | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `screenshot-coverage.md`                | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/`             |
| `phase11-capture-metadata.json`         | `docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/` |
| `implementation-guide.md`               | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |
| `system-spec-update-summary.md`         | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |
| `documentation-changelog.md`            | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |
| `unassigned-task-detection.md`          | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |
| `skill-feedback-report.md`              | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |
| `phase12-task-spec-compliance-check.md` | `docs/30-workflows/ut-sdk-07-phase11-screenshot-evidence-001/outputs/phase-12/`                                  |

## 完了確認

- [x] タスク分類（docs-only / VISUAL）が明記されている
- [x] スコープ（含む・含まない）が定義されている
- [x] Acceptance Criteria（AC-1〜AC-7）が定義されている
- [x] artifact 命名 canonical 一覧が確定している
- [x] Phase 4〜8 が N/A であることが記録されている
