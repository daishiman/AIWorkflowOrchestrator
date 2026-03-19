# スキルライフサイクル統合 仕様書パック

## 概要

本パックは、`スキルを作る` `スキルを実行する` `スキルを改善する` `スキルを再利用する` を単一導線として再構成するためのタスク仕様書群である。現時点では実装を行わず、責務分離されたタスク仕様書の作成に専念する。

> 注記:
> ユーザージョブは `作る` `使う（実行する＋再利用する）` `改善する` の3本を中核とし、`採点/評価` は独立ジョブではなく各ジョブの遷移を制御する品質ゲートとして扱う。

## 追加成果物

| 成果物     | パス                   | 用途                                                                                       |
| ---------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| UI/UX 正本 | `ui-ux-realization.md` | create / execute / improve の導線、supporting surface、terminal handoff の見せ方を固定する |
| UI/UX 図解 | `ui-ux-diagrams.md`    | 核図、画面構成図、状態遷移図、マイコンポーネント図、CTA / handoff flow 図を固定する        |

## 目的

- ユーザーが迷わない一次導線を定義する
- `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` の責務境界を再定義する
- 会話基盤、スキル生成、実行/改善導線を分離しつつ統合可能な形で設計する
- 後続実装で `Atent Team` / `SubAgent` / `Codex` を内部オーケストレーションとして採用できる前提を仕様化する
- 信頼性、再利用性、公開可能性まで含めて、スキルをプロダクト資産として扱える設計にする

## 前提ブロッカー

- `docs/30-workflows/ai-runtime-authmode-unification/index.md` を Task02 / Task03 / Task05 の共通前提として扱う
- 特に `TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001` の Phase 1-3 と `TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001` の Phase 1-3 を PASS にするまでは、Task02 / Task03 / Task05 の Phase 4 以降へ進まない
- lifecycle 個別仕様では `subscription/api-key` toggle を再発明せず、`Integrated API Runtime` と `Claude Code terminal handoff` を上記パックの access matrix から参照して扱う
- Claude Code を使う導線は `embedded terminal transcript` を前提にし、ユーザーが自分で `claude` を実行して出力を読む構造として扱う

## UI/UX Realization 方針

- lifecycle UI は「内部オーケストレーション」ではなく「ユーザーの仕事」を主語にして設計する
- `Atent Team` `SubAgent` `Codex` は内部責務として扱い、UI には job と next action だけを出す
- chat surface と terminal transcript は primary journey を置き換えず、supporting surface として扱う
- どの lifecycle surface からでも terminal を開けるようにし、`迷ったら terminal` の避難路を固定する

## タスク一覧

| 順序 | タスクID                                    | ディレクトリ                                                          | 責務                                                                                                                                                                                                     | 実行順序                       |
| ---- | ------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1    | TASK-SKILL-LIFECYCLE-01                     | `../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation` | 一次導線、画面責務、ナビゲーション基盤の定義                                                                                                                                                             | 最優先・直列                   |
| 2    | TASK-SKILL-LIFECYCLE-02                     | `tasks/step-02-par-task-02-chat-platform-unification`                 | 会話基盤、履歴、ストリーミング、Workspace 文脈統合                                                                                                                                                       | Step 01 後、Task03 と並列可    |
| 3    | TASK-SKILL-LIFECYCLE-03                     | `tasks/step-02-par-task-03-skill-creator-execute-improve-integration` | Skill Creator の表導線化、作成/実行/改善統合、内部オーケストレーション                                                                                                                                   | Step 01 後、Task02 と並列可    |
| 4    | TASK-SKILL-LIFECYCLE-04                     | `tasks/step-03-seq-task-04-evaluation-and-scoring-gate`               | 採点、評価、改善トリガー、受け入れ基準ゲート                                                                                                                                                             | Step 02 後・直列               |
| 5    | TASK-SKILL-LIFECYCLE-05                     | `../completed-tasks/step-04-seq-task-05-created-skill-usage-journey`  | 作成済みスキルを日常導線で選ぶ・実行する・再利用する導線                                                                                                                                                 | Step 03 後・直列               |
| 6    | TASK-SKILL-LIFECYCLE-06                     | `tasks/step-05-par-task-06-trust-permission-governance`               | 権限、危険操作、承認履歴、信頼境界の統合                                                                                                                                                                 | Step 04 後、Task07 と並列可    |
| 7    | TASK-SKILL-LIFECYCLE-07                     | `tasks/step-05-par-task-07-lifecycle-history-feedback`                | 実行履歴、評価履歴、改善フィードバック、再利用学習                                                                                                                                                       | Step 04 後、Task06 と並列可    |
| 8    | TASK-SKILL-LIFECYCLE-08                     | `tasks/step-06-seq-task-08-skill-publishing-version-compatibility`    | 共有、公開、互換性、バージョニング、配布ガード                                                                                                                                                           | Step 05 後・直列               |
| 9    | TASK-IMP-LIFECYCLE-TERMINAL-INTEGRATION-001 | `tasks/step-07-par-task-09-lifecycle-terminal-integration`            | SkillLifecyclePanel と Terminal 系コンポーネントの統合                                                                                                                                                   | Step 06 後、Task10/11 と並列可 |
| 10   | TASK-IMP-LIFECYCLE-CONSTRAINT-CHIPS-001     | `tasks/step-07-par-task-10-constraint-chips-create-ui`                | create ステップの制約条件入力 UI（ConstraintChip / ConstraintChipList）                                                                                                                                  | Step 06 後、Task09/11 と並列可 |
| 11   | TASK-IMP-LIFECYCLE-QUALITY-RUNTIME-UI-001   | `tasks/step-07-par-task-11-quality-gate-runtime-banner-ui`            | 品質ゲートラベル（QualityGateLabel）と実行時バナー（RuntimeBanner）                                                                                                                                      | Step 06 後、Task09/10 と並列可 |
| 12   | TASK-IMP-LIFECYCLE-REUSE-IMPROVE-CYCLE-001  | `tasks/step-08-seq-task-12-reuse-improve-state-cycle`                 | SkillExecutionStatus 型（packages/shared/src/types/skill.ts）に "review" / "improve_ready" / "reuse_ready" を追加し、ReuseReady 状態実装 + ImproveReady → Running 再実行サイクルを完成させる（P32 準拠） | Step 07 後・直列               |

> 注記: completed-tasks/ 配置は「設計仕様書の策定完了」を意味し、プロダクションコードの実装完了ではない。
> Task09-11 は UI GAP（C-02〜C-07）の解消タスク、Task12 は状態遷移 GAP（D-01/D-03）の解消タスク。
> Task05 / Task07 は、前提タスク（Task03/04/06）の設計が確定した段階で整合性を再検証する。
> 本パックは仕様書作成専用であり（L140-141 参照）、設計策定の並行進行を許容する。

## 命名規則

- `step-XX`: 着手できる順番。小さい番号から進める
- `seq`: その step 内で直列ゲートとして扱う
- `par`: 同じ step の他タスクと並列で進められる
- `task-YY`: 論理タスク ID。仕様書本文の Task ID と一致させる

## レイヤ区分

| 区分         | タスク    | 役割                                           |
| ------------ | --------- | ---------------------------------------------- |
| 中核導線     | Task01-05 | 作る、使う、改善する、評価する、再利用する     |
| 補助レイヤ   | Task06-08 | 信頼性、観測、公開可能性を保証する             |
| UI GAP 解消  | Task09-11 | Terminal 統合、制約 UI、品質ラベル・バナー強化 |
| 状態遷移完成 | Task12    | ReuseReady 状態追加、Improve 再実行サイクル    |

## Phase 1-3 ゲート

- `TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001` と `TASK-IMP-CLAUDE-CODE-TERMINAL-SURFACE-001` の Phase 1-3 を Step 02 着手の共通前提とする
- Task02 と Task03 は、上記 2 task の Phase 1-3 成果物が確定してから着手する
- Task03 の API・UI・オーケストレーション設計は、Task02 の Phase 2 成果物を参照して整合させる
- Task04 は、Task03 の create / execute / improve フロー定義が確定してから着手する
- Task05 は、Task03 の lifecycle 統合と Task04 の評価ゲートを前提に着手する
- Task06 は、Task03 の lifecycle と Task05 の利用導線に対する信頼境界を定義する。Task06 の Phase 1-3（設計フェーズ）は、Task03 / Task05 の Phase 4（実装フェーズ）着手前に PASS とする
- Task07 は、Task04/05 の評価と利用結果を履歴・学習へ還流させる前提を確定してから着手する
- Task08 は、Task05/06/07 の結果を外部共有可能な資産へ昇格できる前提を確定してから着手する
- Task09/10/11 は Task01-08 の設計完了後に並列着手可能（Step 07）
- Task12 は Task09-11 完了後に着手する（Step 08）。状態遷移変更が他タスクの UI に影響するため直列
- 実装フェーズに進む前に、12タスクすべての Phase 3 を PASS にする

## 並列化方針

- 直列で先に確定すべき設計ゲート:
  - `ai-runtime-authmode-unification` Task01 / Task02 Phase 1-3
  - Task01 Phase 1-3
  - Step 02 の入口として Task02 / Task03 の Phase 1-2（Task03 着手前に Task02 の Phase 2 成果物が確定していること）
  - Step 03 の入口として Task04 の Phase 1-2
  - Step 04 の入口として Task05 の Phase 1-2
  - Step 05 の入口として Task06 / Task07 の Phase 1-2
  - Step 06 の入口として Task08 の Phase 1-2
- 並列可能な補助分析・仕様化:
  - Step 02 の Task02 と Task03 の詳細分析
  - Step 05 の Task06 と Task07 の詳細分析
  - Task02 / Task03 / Task04 / Task05 / Task06 / Task07 / Task08 の Phase 4-7 のテスト仕様作成
  - Task02 / Task03 / Task04 / Task05 / Task06 / Task07 / Task08 の Phase 8-12 の文書・レビュー準備

## 関心ごとの分離

| 関心ごと             | 主担当タスク | 主な判断対象                                                                                                                                                                            |
| -------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ユーザー一次導線     | Task01       | 入口、遷移、画面責務、主導線                                                                                                                                                            |
| 会話基盤             | Task02       | ストリーミング、履歴、文脈、共通セッション                                                                                                                                              |
| スキル生成/改善/実行 | Task03       | `skillCreatorAPI`、既存 wizard、内部実行エンジン                                                                                                                                        |
| 評価/採点/合否判定   | Task04       | スコア、改善トリガー、保存/利用ゲート                                                                                                                                                   |
| 作成済みスキルの利用 | Task05       | 今すぐ使う、あとで使う、再利用、改善戻り                                                                                                                                                |
| 信頼/権限/安全性     | Task06       | permission、危険操作、承認履歴、説明責任                                                                                                                                                |
| 履歴/観測/学習       | Task07       | 実行履歴、評価履歴、フィードバック、推薦材料                                                                                                                                            |
| 共有/公開/互換性     | Task08       | 公開可否、バージョン、schema、配布境界                                                                                                                                                  |
| Terminal 統合        | Task09       | TerminalHandoffCard 接続、Terminal ボタン、improve 要約転送                                                                                                                             |
| 制約条件 UI          | Task10       | ConstraintChip atom、ConstraintChipList molecule                                                                                                                                        |
| 品質/実行時 UI       | Task11       | QualityGateLabel、RuntimeBanner                                                                                                                                                         |
| 状態遷移サイクル     | Task12       | SkillExecutionStatus 型に "review" / "improve_ready" / "reuse_ready" を追加（packages/shared/src/types/skill.ts が正本、P32 準拠）。ReuseReady 状態実装、Improve→Running 再実行サイクル |

## Atent Team / SubAgent 方針

- ユーザー向け体験は単一導線として設計する
- `Atent Team` / `SubAgent` / `Codex` は内部実行方式として扱い、UI 主責務にはしない
- 実装タスクでは、以下の8役を最低単位の内部エージェント候補とする
  - Journey Agent: 導線・責務・遷移を管理
  - Chat Platform Agent: 会話基盤・履歴・文脈注入を管理
  - Skill Lifecycle Agent: スキル作成/実行/改善を管理
  - Evaluation Agent: 採点、合否判定、再評価を管理
  - Usage Agent: 作成済みスキルの再利用導線を管理
  - Trust Agent: 権限、危険操作、説明責任を管理
  - Feedback Agent: 履歴、評価記録、再利用学習を管理
  - Publishing Agent: 共有、公開、互換性ガードを管理

## システム仕様参照

| 参照資料                   | パス                                                                              | 用途                                                                                      |
| -------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | タスク仕様運用規約                                                                        |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | 全体アーキテクチャ整合                                                                    |
| ui-ux-navigation           | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | ナビゲーション責務                                                                        |
| llm-workspace-chat-edit    | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`    | Workspace 会話設計                                                                        |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連契約                                                                            |
| arch-state-management-core | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | 状態管理方針、セレクタ命名規約（Task12 で SkillExecutionStatus 型を変更する際の正本参照） |

## 作成物

- 8つの責務分離タスクディレクトリ
- 各タスクの `index.md`
- 各タスクの `artifacts.json`
- 各タスクの Phase 1-13 仕様書

## 注意事項

- 本パックは仕様書作成専用であり、コミット、PR、実装は行わない
- 後続で Phase 5 を実行する際は、各タスクの Phase 1-3 設計と依存関係を破らないこと
