# Phase 1 仕様抽出マップ

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 1                          |
| 作成日   | 2026-03-15                 |

## 1. Task01-04 参照資料

| 参照資料            | パス                                                                                                                | 抽出内容                              | 確認ステータス |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | -------------- |
| Task01 一次導線     | `completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/primary-journey-sequence.md`      | Step 4-7 の利用導線シーケンス         | 確認済み       |
| Task01 画面責務     | `completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 7画面の責務・禁止事項マトリクス       | 確認済み       |
| Task01 依存契約     | `completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/dependency-contracts.md`          | Task05 入力/出力/禁止契約             | 確認済み       |
| Task04 スコアモデル | `completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate 4段階・境界値・I/O仕様    | 確認済み       |
| Task04 ゲート遷移   | `completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4 フロー・Task05契約・GAP解決 | 確認済み       |
| UI/UX Realization   | `skill-lifecycle-unification/ui-ux-realization.md`                                                                  | Reuse phase CTA・画面責務・状態表示   | 確認済み       |

## 2. aiworkflow-requirements システム仕様

| 参照資料                      | パス                                                                                 | 抽出内容                                     | 確認ステータス |
| ----------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------- | -------------- |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent 実行画面の導線・権限確認・進捗 surface | 確認済み       |
| ui-ux-navigation              | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`              | ナビゲーション正本・入口設計                 | 確認済み       |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | Skill Center / Workspace / Agent カタログ    | 確認済み       |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行契約・IPCチャネル                        | 確認済み       |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | スキル関連インターフェース契約               | 確認済み       |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | 状態管理・Store設計                          | 確認済み       |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`       | Workspace 会話・文脈統合設計                 | 確認済み       |

## 3. 仕様抽出サマリー

### 3.1 Task01 から抽出した制約

| 制約ID | 内容                                       | 影響する設計                       |
| ------ | ------------------------------------------ | ---------------------------------- |
| C-01   | Workspace: 探索一覧、最終実行判断は禁止    | Workspace は文脈準備のみ           |
| C-02   | Agent: 探索一覧、作成本体は禁止            | Agent は実行・履歴・改善判断       |
| C-03   | Chat: 一次導線の主入口化は禁止             | Chat は補助ショートカットのみ      |
| C-04   | Settings: settings 例外を一般化しない      | auth fallback を他画面に流用しない |
| C-05   | 一次導線: Skill Center → Workspace → Agent | 推奨経路の定義                     |

### 3.2 Task04 から抽出したインターフェース

| インターフェース        | 型          | 用途                                |
| ----------------------- | ----------- | ----------------------------------- |
| ScoringGate             | enum (4値)  | 導線制御判定                        |
| ScoringGateResult       | interface   | canSave/canUse/isRecommended フラグ |
| getScoreGate()          | function    | スコア → ScoringGate 変換           |
| getScoreVariant()       | function    | ScoringGate → UI色分け              |
| PromptEvaluation        | interface   | EP-3/EP-4 評価結果                  |
| skill:optimize:evaluate | IPC channel | EP-3/EP-4 トリガー                  |

### 3.3 UI/UX Realization から抽出した CTA 契約

| フェーズ | ユーザーの問い       | Primary CTA  | Secondary CTA |
| -------- | -------------------- | ------------ | ------------- |
| Reuse    | 後でもう一度使いたい | もう一度使う | 履歴を見る    |

## 4. 参照漏れ検証

| 検証コマンド                                  | 期待結果 | 実施結果 |
| --------------------------------------------- | -------- | -------- |
| `search-spec.js "ui-ux-agent-execution" -c`   | hit あり | 確認済み |
| `search-spec.js "Skill Center" -c`            | hit あり | 確認済み |
| `search-spec.js "SkillCard" -c`               | hit あり | 確認済み |
| `search-spec.js "skill:optimize:evaluate" -c` | hit あり | 確認済み |
| `search-spec.js "SkillAnalysis" -c`           | hit あり | 確認済み |
| `search-spec.js "skillSlice" -c`              | hit あり | 確認済み |
| `search-spec.js "workspacePath" -c`           | hit あり | 確認済み |

**参照漏れ: 0件**
