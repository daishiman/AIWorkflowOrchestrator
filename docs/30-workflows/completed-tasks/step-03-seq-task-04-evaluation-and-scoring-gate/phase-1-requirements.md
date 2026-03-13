# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 1                               |
| Phase名    | 要件定義                        |
| タスクID   | TASK-SKILL-LIFECYCLE-04         |
| 前提Phase  | -                               |
| 後続Phase  | Phase 2（設計）                 |
| ステータス | completed                       |
| 作成日     | 2026-03-12                      |
| 機能名     | skill-lifecycle-evaluation-gate |

## 目的

採点を表示要素ではなく遷移制御として扱うため、評価軸、評価チェックポイント、ゲート状態、Task03 / Task05 への handoff 要件を明文化する。

## 背景

現在の実装には `PromptOptimizer.evaluate` による prompt 評価、`SkillAnalysisView` による skill 分析、`ScoreDisplay` による視覚閾値、`SkillLifecyclePanel` による create / execute / improve 導線が存在する。一方で、保存可否、再改善要否、利用開始可否を 1 回の判定へ集約する契約は未定義である。Task04 は既存資産を破棄せず、Task03 と Task05 の間に共有品質ゲートを挿入する。

## 実行タスク

- 現行資産棚卸し: `PromptOptimizer.evaluate` `SkillAnalysis` `ScoreDisplay` `SkillLifecyclePanel` `agentSlice` の評価関連責務を棚卸しする
- 評価軸定義: `prompt品質` `skill品質` `execution品質` の 3 軸と根拠データを定義する
- チェックポイント定義: `draft` `post_create` `post_execute` `post_improve` の 4 評価地点を定義する
- ゲート要件定義: `revise_required` `save_with_warning` `use_with_warning` `use_ready` `recommended` の遷移条件を定義する
- Handoff 契約定義: Task03 と Task05 に渡す評価結果、内部 role、system spec 同期対象を定義する

### 機能要件

| ID   | 要件                                                                            | 優先度 |
| ---- | ------------------------------------------------------------------------------- | ------ |
| FR-1 | create 直後に `draft` と `post_create` の 2 段階判定を取得できる                | 必須   |
| FR-2 | execute 後に `post_execute` 判定を取得し、Task05 の利用導線へ引き渡せる         | 必須   |
| FR-3 | improve 後に差分付き `post_improve` 判定を取得できる                            | 必須   |
| FR-4 | `prompt品質` `skill品質` `execution品質` の内訳を UI と履歴に同じ形で表示できる | 必須   |
| FR-5 | hard block 条件が満たされた場合は `use_ready` を返さない                        | 必須   |
| FR-6 | Task05 側から明示的に再評価を要求できる                                         | 必須   |
| FR-7 | Evaluation Agent の理由文をユーザー向け 1 文で表示できる                        | 推奨   |

### 非機能要件

| ID    | 要件                                                        | 基準                           |
| ----- | ----------------------------------------------------------- | ------------------------------ |
| NFR-1 | ボタン押下からゲート表示までの UI 反映                      | 100ms 以内                     |
| NFR-2 | Main / Renderer 間の評価関連 IPC                            | 50ms 以内                      |
| NFR-3 | 新規評価 state の読み書きは store selector 経由             | Renderer 直接 IPC 呼び出し禁止 |
| NFR-4 | security / critical risk に関する hard block は常に再現可能 | 同一入力で同一判定             |
| NFR-5 | manual test は screenshot と結果ログの両方を残す            | Phase 11 で 6 ケース以上       |

### 評価軸

| 軸            | 既存資産                                                 | 主な根拠                                                          |
| ------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| prompt品質    | `PromptOptimizer.evaluate`, `PromptEvaluation.breakdown` | clarity / specificity / completeness / reproducibility / security |
| skill品質     | `skill:analyze`, `SkillAnalysis`, `ScoreDisplay`         | overallScore / categories / suggestions / risks                   |
| execution品質 | 新規 `ExecutionQualityEvaluation`                        | 実行成功率、permission 安全性、結果明瞭性、再実行容易性           |

### チェックポイント

| ID   | タイミング     | 入力                                                               | 主担当                         | 出力               |
| ---- | -------------- | ------------------------------------------------------------------ | ------------------------------ | ------------------ |
| CP-1 | `draft`        | 作成依頼文、mode 判定結果                                          | Evaluation Agent               | 作成前 prompt 判定 |
| CP-2 | `post_create`  | `skill:create` 結果、初回 `skill:analyze`                          | Evaluation Agent               | 保存可否と改善要否 |
| CP-3 | `post_execute` | `skill:execute` 結果、実行ログ要約                                 | Evaluation Agent + Trust Agent | 利用可否と warning |
| CP-4 | `post_improve` | `skillCreator:improve` または `skill:applyImprovements` 後の再分析 | Evaluation Agent               | 差分付き再判定     |

### ゲート状態

| 状態                | 条件                                                    | 次アクション                         |
| ------------------- | ------------------------------------------------------- | ------------------------------------ |
| `revise_required`   | 総合スコア < 60、または hard block 発生                 | Task03 improve へ戻す                |
| `save_with_warning` | 総合スコア 60-79、かつ hard block なし                  | 保存は許可、Task05 では warning 表示 |
| `use_with_warning`  | `post_execute` で warning が残る                        | Agent から利用継続、改善導線も表示   |
| `use_ready`         | 総合スコア >= 80、かつ hard block なし                  | Task05 主導線へ進める                |
| `recommended`       | `post_improve` で改善差分がプラス、かつ総合スコア >= 80 | 推奨バッジを付与して Task05 へ渡す   |

## 参照資料

| 参照資料                   | パス                                                                                                                      | 説明                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| lifecycle journey contract | `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`                                                           | create / use / improve の job guide           |
| lifecycle panel            | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                                      | Task03 主導線の現行実装                       |
| analysis view              | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                                        | 改善 UI と分析表示                            |
| score display              | `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`                                                             | 60 / 80 閾値の現行表現                        |
| renderer state             | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                                                    | `currentAnalysis` `isAnalyzing` `isImproving` |
| prompt evaluator           | `apps/desktop/src/main/services/skill/PromptOptimizer.ts`                                                                 | prompt 品質評価の既存実装                     |
| evaluate IPC               | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                                              | `skill:optimize:evaluate` と `skill:create`   |
| shared types               | `packages/shared/src/types/skill-improver.ts`                                                                             | `SkillAnalysis` と `PromptEvaluation`         |
| Task03 設計                | `../../skill-lifecycle-unification/tasks/step-02-par-task-03-skill-creator-execute-improve-integration/phase-2-design.md` | create / execute / improve の主導線           |
| Task05 index               | `../../skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/index.md`                        | usage journey の受け側                        |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                                                       |
| ------------------------ | ------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | surface ownership board と lifecycle entry                                 |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state ownership と lifecycle canonicalization                              |
| api-ipc-agent            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`            | `skill:create` `skill:execute` `skill:analyze` `skillCreator:improve` 契約 |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | `SkillAnalysisView` と Store-driven lifecycle integration                  |
| security-skill-execution | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | UI 非露出原則と permission 境界                                            |
| quality-requirements     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`     | レスポンスタイム、coverage、manual test 基準                               |

## 実行手順

### ステップ1: 現行評価資産を責務単位で分解する

Task03 側の create / execute / improve と、Task05 側の use journey で参照する評価関連実装を表にまとめ、既存の責務重複と不足点を明示する。

### ステップ2: 評価軸とチェックポイントを定義する

3 軸と 4 チェックポイントを表で定義し、各 checkpoint で必要な入力、出力、担当 role を固定する。

### ステップ3: ゲート状態と hard block を定義する

60 / 80 閾値、security / critical risk / permission による hard block、改善前後差分の扱いを定義する。

### ステップ4: Task03 / Task05 handoff と system spec 同期対象を確定する

Task03 から渡すイベント、Task05 へ返す gate decision、Phase 12 で更新する system spec ファイルを確定する。

## 統合テスト連携

| 観点     | 対象                                                                     | Phase 1 で固定する内容                                    |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| API接続  | `skill:create` `skill:execute` `skill:analyze` `skill:optimize:evaluate` | 各 checkpoint の入力元と戻り値の責務                      |
| 状態管理 | `agentSlice` と新規評価 state                                            | どの判定を store に保持するか                             |
| UI連携   | `SkillLifecyclePanel` `SkillAnalysisView` `ScoreDisplay`                 | どの画面で gate badge / warning / recommendation を出すか |
| 手動検証 | Phase 11 screenshot                                                      | 低スコア / warning / recommended の撮影対象               |

## アーキテクチャ層別要件

| 層                         | 要件                                                                        |
| -------------------------- | --------------------------------------------------------------------------- |
| フロントエンド（Renderer） | gate 状態、理由文、warning、recommended を surface ごとに同一表現で表示する |
| バックエンド（Main）       | prompt 評価、skill 分析、execution 品質集約に必要な計算責務を定義する       |
| IPC通信                    | 既存 `skill:*` と `skillCreator:*` の戻り値を評価入力へ正規化する           |
| セキュリティ               | hard block は security / permission の事実から決め、UI だけで解除しない     |
| データ                     | 評価履歴と差分比較に必要な最小データを定義する                              |

## 成果物

| 成果物                 | パス                                                | 内容                        |
| ---------------------- | --------------------------------------------------- | --------------------------- |
| 現行資産棚卸し         | `outputs/phase-1/current-state-inventory.md`        | 実装アンカーと責務分解      |
| 要件マトリクス         | `outputs/phase-1/evaluation-requirements-matrix.md` | FR / NFR / AC 一覧          |
| checkpoint / gate 定義 | `outputs/phase-1/checkpoint-gate-matrix.md`         | 4 checkpoint と 5 gate 状態 |
| 受入基準               | `outputs/phase-1/acceptance-criteria.md`            | Given-When-Then 形式        |

## 完了条件

- [x] `prompt品質` `skill品質` `execution品質` の 3 軸が定義されている
- [x] `draft` `post_create` `post_execute` `post_improve` の 4 checkpoint が定義されている
- [x] 60 / 80 閾値と hard block 条件が表形式で定義されている
- [x] Task03 と Task05 の handoff 入出力が列挙されている
- [x] Phase 11 と Phase 12 の証跡対象が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

- [Phase 2: 設計](./phase-2-design.md) に進む
