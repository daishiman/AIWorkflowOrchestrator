# Phase 11: 手動テスト

## メタ情報

| 項目       | 値                                                       |
| ---------- | -------------------------------------------------------- |
| Phase      | 11                                                       |
| Phase名    | 手動テスト                                               |
| タスクID   | TASK-SKILL-LIFECYCLE-02                                  |
| タスク名   | 会話基盤・セッション統合                                 |
| 前提Phase  | [phase-10-final-review.md](./phase-10-final-review.md)   |
| 後続Phase  | [phase-12-documentation.md](./phase-12-documentation.md) |
| ステータス | completed                                                |
| 作成日     | 2026-03-12                                               |

## 目的

3 モードの会話体験を実機で確認し、モード差分だけが見え、基盤差分がユーザー体験に漏れていないことを確認する。

## 実行タスク

- general chat: 開始と応答を確認する
- workspace handoff: 文脈付き会話の開始、保存、ChatView への引き継ぎを確認する
- skill-lifecycle handoff: `SkillCenterView` / Task03 接続前提の handoff を確認する
- revive: reload 後の recent session / active session 復元を確認する
- streaming cancel / end: 非永続 state が revive されないことを確認する
- representative screenshot: current build 基準で取得する

## 参照資料

| 参照資料           | パス                                                                        | 内容            |
| ------------------ | --------------------------------------------------------------------------- | --------------- |
| session model      | `outputs/phase-2/session-model.md`                                          | session 契約    |
| implementation log | `outputs/phase-5/implementation-log.md`                                     | 実装差分        |
| final review       | `outputs/phase-10/final-review-result.md`                                   | 持ち込み論点    |
| test cases         | `outputs/phase-4/test-cases.md`                                             | TC-ID 基本表    |
| coverage report    | `outputs/phase-7/coverage-report.md`                                        | coverage 結果   |
| refactoring log    | `outputs/phase-8/refactoring-log.md`                                        | 最終構造        |
| quality report     | `outputs/phase-9/quality-report.md`                                         | 品質判定        |
| mode regression    | `outputs/phase-6/mode-regression-matrix.md`                                 | mode 切替観点   |
| phase 11/12 guide  | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | screenshot 条件 |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                          |
| ------------------------ | ------------------------------------------------------------------------------- | ----------------------------- |
| quick-reference          | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`             | current code anchors          |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | ownership 正本                |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream 契約                   |
| interfaces-chat-history  | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`  | history 契約                  |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Skill Center / Task03 handoff |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | follow-up 未タスク導線        |

## テストケース

| テストケース | 対象                    | 期待結果                                                             | 証跡ファイル                                 |
| ------------ | ----------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| TC-11-01     | general chat            | current general chat が既存 UX を維持する                            | `TC-11-01-general-chat-light.png`            |
| TC-11-02     | workspace handoff       | workspace 文脈と persistence が成立し ChatView へ渡せる              | `TC-11-02-workspace-handoff-light.png`       |
| TC-11-03     | skill-lifecycle handoff | `SkillCenterView` / Task03 接続前提の mode handoff が確認できる      | `TC-11-03-skill-lifecycle-handoff-light.png` |
| TC-11-04     | revive / recent rail    | reload 後に recent session と active session が崩れない              | `TC-11-04-revive-recent-rail-light.png`      |
| TC-11-05     | streaming cancel        | cancel / end / error の挙動が破綻せず非永続 state が revive されない | `TC-11-05-streaming-cancel-light.png`        |

## 画面カバレッジマトリクス

| テストケース | route                                                                | selector                                         | theme | 優先度 | 証跡ファイル                                 |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------ | ----- | ------ | -------------------------------------------- |
| TC-11-01     | `/phase11-chat-platform.html?scenario=general&theme=light`           | `[data-testid='chat-view']`                      | light | A      | `TC-11-01-general-chat-light.png`            |
| TC-11-02     | `/phase11-chat-platform.html?scenario=workspace-handoff&theme=light` | `[data-testid='workspace-view']`                 | light | A      | `TC-11-02-workspace-handoff-light.png`       |
| TC-11-03     | `/phase11-chat-platform.html?scenario=skill-lifecycle&theme=light`   | `[data-testid='skill-lifecycle-panel']`          | light | A      | `TC-11-03-skill-lifecycle-handoff-light.png` |
| TC-11-04     | `/phase11-chat-platform.html?scenario=revive&theme=light`            | `[data-testid='phase11-revive-evidence']`        | light | A      | `TC-11-04-revive-recent-rail-light.png`      |
| TC-11-05     | `/phase11-chat-platform.html?scenario=stream-cancel&theme=light`     | `[data-testid='phase11-stream-cancel-evidence']` | light | A      | `TC-11-05-streaming-cancel-light.png`        |

## 統合テスト連携

| 観点        | 連携内容                                                      |
| ----------- | ------------------------------------------------------------- |
| TC-ID reuse | Phase 4 の TC-ID を手動テストへ再利用する                     |
| screenshot  | current build の representative screenshot を Phase 12 へ渡す |
| follow-up   | revive / handoff の不足を未タスク検出へ渡す                   |

## 成果物

| 成果物                | パス                                      | 説明           |
| --------------------- | ----------------------------------------- | -------------- |
| 手動テスト結果        | `outputs/phase-11/manual-test-result.md`  | TC-ID 結果     |
| 発見事項              | `outputs/phase-11/discovered-issues.md`   | 問題一覧       |
| screenshot 計画       | `outputs/phase-11/screenshot-plan.json`   | 撮影対象       |
| screenshot カバレッジ | `outputs/phase-11/screenshot-coverage.md` | カバレッジ集計 |

## 完了条件

- [x] 3 モードの体験差分が意図どおり記録されている
- [x] current build の representative screenshot 証跡がある
- [x] revive / recent rail の確認結果がある
- [x] cancel / end / error と非永続 state 非復元の確認結果がある
- [x] 発見事項が 0 件でも記録されている
