# Phase 12: System Spec Update Summary

## 作成日

2026-04-16

---

## Step 1-A: 参照・同期対象

| ファイル                                            | 更新観点       |
| --------------------------------------------------- | -------------- |
| `.claude/skills/task-specification-creator/LOGS.md` | 参照・同期対象 |
| `.agents/skills/task-specification-creator/LOGS.md` | 参照・同期対象 |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | 参照・同期対象 |
| `.agents/skills/aiworkflow-requirements/LOGS.md`    | 参照・同期対象 |

このワークツリーでは workflow 文書と成果物の整合を優先し、LOGS 系は参照対象として維持する。

---

## Step 1-B: artifacts.json / outputs/artifacts.json 同期

| 項目                     | 現状                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `artifacts.json`         | `phase12_completed` / `phase-11` に `manual-test-report.md` と `ci-timing-measurements.md` を追加 |
| `outputs/artifacts.json` | `phase12_completed` / `phase-1` 〜 `phase-12` を completed に同期                                 |

変更内容:

- `phase-11` の成果物に `outputs/phase-11/manual-test-report.md` と `outputs/phase-11/ci-timing-measurements.md` を追加
- `phase-12` の成果物を `implementation-guide.md` / `system-spec-update-summary.md` / `documentation-changelog.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` で揃えた
- `outputs/artifacts.json` を root `artifacts.json` と同じ completed 状態に同期した

---

## Step 1-C: 実装の正本

| ファイル                        | 更新内容                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | `push` の main ブランチ時のみ backend coverage を収集                                              |
| `apps/backend/vitest.config.ts` | `provider: "v8"` / `reporter: ["json", "lcov"]` / `enabled: !!process.env.VITEST_SHARDED_COVERAGE` |
| `codecov.yml`                   | `backend` flag を追加し、`shared` / `desktop` / `backend` の 3 系統へ整理                          |

---

## Step 2: 新規インターフェース追加なし

今回の変更は CI 設定ファイル、Codecov 設定ファイル、Workflow 文書、成果物台帳の更新のみ。
新規インターフェース / 型 / 定数 / API 変更はないため、仕様書の API 定義セクションの更新は不要。

---

## 補足

- Phase 11 の実測値は `outputs/phase-11/manual-test-report.md` と `outputs/phase-11/ci-timing-measurements.md` に記録済み
- `UI/UX` 変更なしのため、Phase 11 スクリーンショットは不要
