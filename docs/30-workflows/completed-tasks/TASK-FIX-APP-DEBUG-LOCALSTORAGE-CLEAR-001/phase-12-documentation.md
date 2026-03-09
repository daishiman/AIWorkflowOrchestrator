# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001 |
| Phase      | 12                                        |
| Phase名    | ドキュメント                              |
| カテゴリ   | fix                                       |
| ステータス | completed                                 |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13                                  |

## 目的

current workflow・system spec・skill 文書を、2026-03-09 時点の実装と検証証跡へ完全同期する。特に、Phase 11 screenshot 要求と repo-wide 残課題の formalization 漏れを潰す。

## 実行タスク

- Task 1: `implementation-guide.md` を実装事実へ同期する
- Task 2: Step 1-A〜1-G / Step 2 を実績ベースで完了させる
- Task 3: current workflow の stale status / placeholder を除去する
- Task 4: repo-wide cleanup を未タスクへ formalize する
- Task 5: system spec / task-spec / skill-creator 文書 / validator 結果を同期する

## 実施結果

### Task 1: 実装ガイド同期

- `outputs/phase-12/implementation-guide.md` の Part 1/Part 2 を維持
- Vitest 実行例を現行パス `src/renderer/__tests__/App.debug-removal.test.tsx` へ修正
- screenshot harness と metadata ベース検証の実施形態を追記

### Task 2: Step 1-A〜1-G / Step 2

| Step     | 結果 | 要点                                                                                                        |
| -------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| Step 1-A | done | `aiworkflow-requirements` / `task-specification-creator` / `skill-creator` の LOGS.md と SKILL.md を更新    |
| Step 1-B | done | `task-workflow.md` 完了タスク節に本タスクを追加                                                             |
| Step 1-C | done | `arch-state-management.md` / `development-guidelines.md` / `lessons-learned.md` / `task-workflow.md` を更新 |
| Step 1-D | done | `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行                              |
| Step 1-E | done | `UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001` を作成し、残課題導線へ登録                                    |
| Step 1-F | done | `apps/desktop/package.json` と screenshot harness 群を system spec へ反映                                   |
| Step 1-G | done | Phase 11/12 validator、Vitest、TypeScript、quick_validate を再実行                                          |
| Step 2   | done | 状態管理 / 開発ガイド / 教訓 / task-workflow / Phase 11-12 guide を実装事実へ同期                           |

### Task 3: current workflow stale 除去

- `index.md` を `in_progress`（Phase 1-12 completed, Phase 13 pending）へ更新
- `artifacts.json` の phase status と acceptanceCriteria を実績へ更新
- `phase-1`〜`phase-12` 本文の status を `completed` へ是正
- Phase 11 の `P53` / `代替` placeholder を完全除去

### Task 4: 未タスク formalization

- 新規未タスク: `UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001`
- 対象: obsolete `debug-clear-storage` workaround / stale comment / screenshot preflight / e2e global setup の棚卸し

### Task 5: system spec / skill 同期

- `arch-state-management.md`: DD-04/DD-05 と screenshot harness 検証ルールを追加
- `development-guidelines.md`: shared app shell への debug-only storage clear / forced reload 禁止と期限付き cleanup コメント規約を追加
- `lessons-learned.md`: `skipAuth=true` が bug path を guard する false negative と harness 分離パターンを追加
- `phase-11-12-guide.md`: bug path 検証と screenshot path の分離ルールを追記
- `skill-creator`: `patterns.md` と Phase 12 テンプレートへ「通常ルート metadata と dedicated harness の分離」パターンを追記

## 参照資料

| 参照資料                 | パス                                                                                                       |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-2-design.md`            |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-5-implementation.md`    |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-6-test-expansion.md`    |
| Phase 7 カバレッジ確認   | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-7-coverage-check.md`    |
| Phase 8 リファクタリング | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-8-refactoring.md`       |
| Phase 9 品質保証         | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-9-quality-assurance.md` |
| Phase 10 最終レビュー    | `docs/30-workflows/completed-tasks/TASK-FIX-APP-DEBUG-LOCALSTORAGE-CLEAR-001/phase-10-final-review.md`     |
| Step 実行ガイド          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                             |
| Phase 11/12 guide        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                                |
| system spec 正本         | `.claude/skills/aiworkflow-requirements/references/`                                                       |
| 未タスクテンプレート     | `.claude/skills/task-specification-creator/assets/unassigned-task-template.md`                             |

## 成果物

| 成果物               | パス                                                     |
| -------------------- | -------------------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`                |
| 変更履歴             | `outputs/phase-12/documentation-changelog.md`            |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              |
| 準拠確認             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 完了条件

- [x] current workflow の stale status が解消されている
- [x] Phase 11 screenshot 要求が current workflow 配下の実画像で満たされている
- [x] system spec 正本が今回の実装内容と苦戦箇所を含んでいる
- [x] 新規未タスクが formalize されている
- [x] validator / test / quick_validate の結果が記録されている

## 次Phase

Phase 13: PR作成（今回は未実施）。
