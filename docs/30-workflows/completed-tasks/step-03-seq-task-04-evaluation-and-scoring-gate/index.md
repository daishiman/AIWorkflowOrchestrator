# TASK-SKILL-LIFECYCLE-04: 採点・評価・受け入れゲート統合

## 概要

`作る -> 評価する -> 改善する -> 再評価する -> 使う` を 1 本の品質ループとして定義するタスク。既存の `PromptOptimizer.evaluate`、`SkillAnalysisView`、`ScoreDisplay`、`agentSlice` の分析状態を再利用しつつ、Task03 の create / execute / improve フローと Task05 の usage journey を同一のゲート契約で接続する。

## メタ情報

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | TASK-SKILL-LIFECYCLE-04                                                   |
| タスク種別   | 設計                                                                      |
| 優先度       | 高                                                                        |
| ステータス   | completed                                                                 |
| 依存タスク   | TASK-SKILL-LIFECYCLE-01, TASK-SKILL-LIFECYCLE-02, TASK-SKILL-LIFECYCLE-03 |
| ブロック対象 | TASK-SKILL-LIFECYCLE-05                                                   |
| 作成日       | 2026-03-12                                                                |
| 機能名       | skill-lifecycle-evaluation-gate                                           |

## 背景

- `SkillLifecyclePanel` は create / execute / improve の一気通し導線を持つが、保存可否と利用可否を決める単一ゲートは未定義である。
- `ScoreDisplay` は 60 / 80 の視覚閾値を持つが、Task03 と Task05 をまたぐ遷移条件へ昇格していない。
- `PromptOptimizer.evaluate` と `SkillAnalysis` は別経路で存在し、改善前後の比較、利用前の再評価、履歴保存の契約が分離している。
- system spec では `skillLifecycleJourney.ts`、`ui-ux-navigation.md`、`arch-state-management.md`、`api-ipc-agent.md` が lifecycle の責務境界を定義しているため、Task04 はその正本に沿って品質判定層を追加する。

## 受入基準

| ID   | 基準                                                                                          |
| ---- | --------------------------------------------------------------------------------------------- |
| AC-1 | `draft` `post_create` `post_execute` `post_improve` の 4 評価チェックポイントが定義されている |
| AC-2 | `prompt品質` `skill品質` `execution品質` の 3 軸と、各軸の根拠データが定義されている          |
| AC-3 | 60 / 80 の閾値と hard block 条件を用いたゲート判定が定義されている                            |
| AC-4 | Task03 の create / execute / improve フローから Task04 の判定結果へ handoff できる            |
| AC-5 | Task05 の usage journey が Task04 の評価結果を再利用し、再評価も実行できる                    |
| AC-6 | `Atent Team` / `SubAgent` / `Codex` は内部役割として定義され、ユーザー向け主導線へ露出しない  |

## スコープ

**含む**

- 評価軸、閾値、hard block、改善前後差分の定義
- Task03 から Task04 へのイベント handoff 契約
- Task04 から Task05 への use-ready / warning / revise 戻り契約
- 評価履歴の状態管理責務、画面表示責務、Phase 11/12 証跡要件
- 内部 Evaluation Agent / Usage Agent / Trust Agent の責務分離

**含まない**

- Chat 基盤そのものの再設計
- Skill 作成 UI そのものの再設計
- permission 実装詳細そのものの更新
- publishing / version compatibility の設計

## Task03 / Task05 handoff 契約

| 接続元         | Task04 への入力                                                         | Task04 の出力                                    | 接続先                          |
| -------------- | ----------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| Task03 create  | 作成依頼文、`skill:create` 結果、初回 `skill:analyze` 結果              | `draft` / `post_create` の評価スナップショット   | Task03 improve / Task05 save    |
| Task03 execute | `skill:execute` 結果、permission 情報、実行ログ要約                     | `post_execute` の利用判定                        | Task05 use journey              |
| Task03 improve | `skillCreator:improve` 結果、`skill:applyImprovements` 結果、再分析結果 | `post_improve` の差分判定                        | Task03 再実行 / Task05 推奨利用 |
| Task05 use     | 直近評価履歴、実行面での再評価要求                                      | `use_with_warning` / `use_ready` / `recommended` | usage journey 継続              |

## 関心ごとの分離と内部チーム

| 役割              | 主責務                                       | Task04 で扱う成果                                               |
| ----------------- | -------------------------------------------- | --------------------------------------------------------------- |
| Evaluation Agent  | スコア集約、ゲート判定、理由文生成           | `LifecycleEvaluationSnapshot`, `LifecycleGateDecision`          |
| Integration Agent | Task03 / Task05 handoff と state 同期        | create / execute / improve / use のイベント接続                 |
| Trust Agent       | permission と hard block の境界維持          | security / critical risk / permission block 判定                |
| Evidence Agent    | 履歴、Phase 11 screenshot、Phase 12 同期管理 | `evaluation-history.md`, screenshot plan, system spec sync plan |

## システム仕様反映ポイント

| 参照資料                   | パス                                                                              | 反映内容                                                                         |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| ui-ux-navigation           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | Skill Center / Workspace / Agent の責務境界                                      |
| arch-state-management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | lifecycle state ownership、legacy canonicalization                               |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:create` `skill:execute` `skill:analyze` `skillCreator:improve` の接続契約 |
| ui-ux-feature-components   | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | `SkillAnalysisView` / `ScoreDisplay` / Store-driven lifecycle integration        |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `window.electronAPI.skill` 統一前提と型境界                                      |
| security-skill-execution   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`   | create / execute / improve の権限境界と UI 非露出原則                            |
| quality-requirements       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | レスポンスタイム、coverage、manual test 期待値                                   |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | completed  |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | completed  |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | completed  |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | completed  |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | completed  |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | completed  |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | completed  |

## 実施結果サマリー

- Task04 の実装、Phase 11 screenshot 6 件、Phase 12 system spec 同期は 2026-03-12 時点で完了。
- `window.electronAPI.skill.evaluatePrompt()`、`skillEvaluationSlice`、`SkillEvaluationPanel` を追加し、Task03 と Task05 を同一 gate 契約で接続した。
- 2026-03-13 に `origin/main` 取り込み後の競合を解消し、Phase 13 の `pr-summary.md` / `review-checklist.md` を作成して PR 作成まで完了した。

## 注意事項

- `Atent Team` / `SubAgent` / `Codex` は内部実行モデルとして扱い、主導線の UI 文言へ露出しない。
- manual test は `outputs/phase-11/` の screenshot 6 件と `capture-results.json` を正本とする。
- system spec の正本は `.claude/skills/...`、`.agents/skills/...` は mirror として同期する。
