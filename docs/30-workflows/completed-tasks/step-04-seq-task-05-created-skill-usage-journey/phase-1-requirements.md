# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| タスクID   | TASK-SKILL-LIFECYCLE-05                  |
| タスク名   | 作成済みスキルを使う主導線               |
| 機能名     | created-skill-usage-journey              |
| 前提Phase  | なし（本タスクの起点）                   |
| 後続Phase  | [phase-2-design.md](./phase-2-design.md) |
| ステータス | not_started                              |
| 作成日     | 2026-03-15                               |

## 目的

作成済みスキルをユーザーが「いつ」「どこから」「どう使うか」を定義し、`作ったが使われない`状態を防ぐ要件を固定する。3つの利用シナリオ、主利用導線の選定、改善フィードバックループ、品質表示の利用導線組み込みを要件化する。

## P50チェック: 既実装状態の調査

```bash
# 利用導線に関連する既存実装の確認
grep -rn "useSkill\|reuse\|usage-journey\|CreatedSkillUsage" apps/desktop/src/renderer/
git log --oneline -10 -- apps/desktop/src/renderer/views/AgentView/
git log --oneline -10 -- apps/desktop/src/renderer/views/SkillCenterView/
```

| 判定     | 条件                                           | 対応                               |
| -------- | ---------------------------------------------- | ---------------------------------- |
| 未実装   | 利用導線に関する専用コンポーネントが存在しない | Phase 4-5 で新規設計・実装を進める |
| 部分実装 | Agent / Workspace に実行導線が存在する         | Phase 4-5 で補完モードに切り替え   |

## 実行タスク

- タスク1: 3つの利用シナリオ（作成直後 / あとから / 履歴から）を定義し、各シナリオの開始地点・完了地点・前提条件を固定する
- タスク2: 主利用導線の選定として Workspace と Agent を比較し、どちらを主導線にするか候補比較する
- タスク3: 作成済みスキルの発見導線（一覧 / 検索 / おすすめ / 履歴 / お気に入り）の要件を定義する
- タスク4: 実行結果から Task03 改善導線へ戻るフィードバックループの要件を定義する
- タスク5: Task04 の品質表示（ScoringGate / ScoreDisplay）を利用導線のどの地点でどう見せるか定義する
- タスク6: aiworkflow-requirements の仕様抽出マップを作成し、参照漏れをゼロにする

## 参照資料

| 参照資料            | パス                                                                                                                         | 説明                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Task01 一次導線     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/primary-journey-sequence.md`      | 一次導線シーケンス                   |
| Task01 画面責務     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/surface-responsibility-matrix.md` | 画面別責務・禁止事項                 |
| Task01 依存契約     | `../../../completed-tasks/step-01-seq-task-01-lifecycle-journey-foundation/outputs/phase-2/dependency-contracts.md`          | Task05への入力・出力・禁止事項       |
| Task04 スコアモデル | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/scoring-gate-matrix.md`            | ScoringGate型・4段階ゲート           |
| Task04 ゲート遷移   | `../../../completed-tasks/step-03-seq-task-04-evaluation-and-scoring-gate/outputs/phase-2/gate-transition-design.md`         | EP-3/EP-4フローとTask05契約          |
| UI/UX Realization   | `../../ui-ux-realization.md`                                                                                                 | create/execute/improve/reuse導線正本 |
| UI/UX 図解          | `../../ui-ux-diagrams.md`                                                                                                    | 状態遷移・CTA flow図                 |
| App routes          | `apps/desktop/src/renderer/App.tsx`                                                                                          | 利用導線候補のルーティング           |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`                                                                        | 実行候補画面                         |
| SkillCenterView     | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                                                                  | 発見/一覧候補画面                    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保する。

| 参照資料                      | パス                                                                                 | 内容                                       |
| ----------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------ |
| ui-ux-agent-execution         | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`         | Agent実行画面の導線・権限確認・進捗surface |
| ui-ux-navigation              | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`              | ナビゲーション正本・入口設計               |
| ui-ux-feature-components      | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`      | Skill Center / Workspace / Agent catalog   |
| interfaces-agent-sdk-executor | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md` | 実行契約・IPCチャネル                      |
| interfaces-agent-sdk-skill    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`    | スキル関連インターフェース契約             |
| arch-state-management         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`         | 状態管理・Store設計                        |
| llm-workspace-chat-edit       | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`       | Workspace会話・文脈統合設計                |

## 実行手順

### ステップ1: 3つの利用シナリオ定義

#### シナリオA: 作成直後に使う（Immediate Use）

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 開始地点     | Skill Creator 完了 → EP-1 採点完了後                                                       |
| 前提条件     | ScoringGate が `USE_ALLOWED` (80+) または `RECOMMENDED` (100)                              |
| 主アクション | 「今すぐ使う」CTA → Workspace/Agent 実行画面へ遷移                                         |
| 完了地点     | Agent で実行完了し、結果を確認                                                             |
| 代替経路     | ScoringGate が `SAVE_ALLOWED` (60-79) の場合 → 保存後、改善推奨バナーを表示してReuse導線へ |
| ブロック条件 | ScoringGate が `NEEDS_IMPROVEMENT` (0-59) の場合 → 利用ボタン無効、改善必須                |

#### シナリオB: あとから使う（Deferred Use）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 開始地点     | Skill Center の「保存済みスキル」一覧 / お気に入り / 最近使ったスキル      |
| 前提条件     | スキルが保存済み（ScoringGate `SAVE_ALLOWED` 以上）                        |
| 主アクション | スキルカードをクリック → スキル詳細 → 「使う」CTA → Workspace/Agent へ遷移 |
| 完了地点     | Agent で実行完了し、結果を確認                                             |
| 発見導線     | Skill Center 一覧、検索、カテゴリフィルタ、おすすめ表示                    |
| 品質参照     | スキルカードに ScoringGate バッジ（色 + ラベル）を表示                     |

#### シナリオC: 履歴から再利用する（History Reuse）

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 開始地点     | Agent の実行履歴一覧 / Workspace の最近使ったスキル                          |
| 前提条件     | 過去に1回以上実行した記録が存在する                                          |
| 主アクション | 履歴エントリをクリック → 前回のコンテキストを復元 → 再実行 or パラメータ変更 |
| 完了地点     | Agent で再実行完了                                                           |
| 差別化       | 前回の実行パラメータ、結果サマリー、スコア変遷を表示                         |
| 改善戻り     | 実行結果が不満なら「改善する」CTA で Task03 改善フローへ遷移                 |

### ステップ2: 主利用導線の比較（Workspace vs Agent）

| 比較項目          | Workspace                            | Agent                                   |
| ----------------- | ------------------------------------ | --------------------------------------- |
| Task01 画面責務   | 文脈準備、ファイル接続（Primary）    | 実行、履歴確認、改善判断（Primary）     |
| Task01 禁止責務   | 探索一覧、最終実行判断               | 探索一覧、作成本体                      |
| 実行能力          | プレビュー（Secondary）              | 実行本体（Primary）                     |
| 文脈統合          | ファイル・プロジェクト文脈を統合可能 | 実行に集中、文脈はWorkspaceから引き継ぐ |
| 品質表示の自然さ  | 実行前の確認段階として自然           | 実行中/実行後の評価として自然           |
| 改善戻りの近さ    | 改善導線がスキル管理画面経由で遠い   | 改善判断がPrimary責務なので近い         |
| ui-ux-realization | Execute phase の入口（文脈整備）     | Execute phase の本体（実行＋結果）      |

**導線方針**: Workspace を「実行準備」、Agent を「実行本体」とする二段構成。主導線は `Workspace → Agent` の順で通過する。Workspace を省略して Skill Center → Agent への直接遷移も許容するが、推奨経路は Workspace 経由とする。

### ステップ3: 発見導線の要件

| 発見方法   | 表示場所              | ソート基準            | フィルタ条件                 |
| ---------- | --------------------- | --------------------- | ---------------------------- |
| 一覧表示   | Skill Center          | 最終更新日 / スコア順 | ScoringGate / カテゴリ       |
| 検索       | Skill Center 検索バー | 関連度                | スキル名 / 説明 / タグ       |
| おすすめ   | Skill Center トップ   | スコア × 利用頻度     | `USE_ALLOWED` 以上のみ       |
| 最近使った | Skill Center / Agent  | 最終使用日時          | なし                         |
| お気に入り | Skill Center          | お気に入り登録日      | ユーザーがスター付けしたもの |
| 履歴       | Agent 履歴タブ        | 実行日時              | 成功 / 失敗 / 全て           |

### ステップ4: 改善フィードバックループ

```
Agent 実行完了
    |
    v
[実行結果サマリー]
    |
    +--- 満足 → 完了（履歴に記録）
    |
    +--- 不満 → 「改善する」CTA
                    |
                    v
              [EP-4: 利用後再評価（任意）]
                    |
                    v
              ScoringGate 判定
                    |
                    +--- NEEDS_IMPROVEMENT → SkillAnalysisView 改善必須
                    |
                    +--- SAVE_ALLOWED → 改善推奨バナー + 改善ボタン
                    |
                    +--- USE_ALLOWED+ → 任意改善ボタン
                    |
                    v
              Skill Creator / SkillAnalysisView
              （Task03 改善フロー）
                    |
                    v
              [EP-2: 改善後再採点]
                    |
                    v
              改善完了 → 再利用導線へ戻る
```

### ステップ5: 品質表示の利用導線組み込み

| 利用導線の地点       | 表示内容                                      | Task04 対応             |
| -------------------- | --------------------------------------------- | ----------------------- |
| Skill Center 一覧    | ScoringGate バッジ（色 + ラベル）             | getScoreVariant()       |
| スキル詳細画面       | 総合スコア + 5軸 breakdown                    | ScoreDisplay            |
| 作成直後CTA          | ゲート判定に基づくCTA有効/無効制御            | ScoringGateResult       |
| Workspace スキル選択 | EP-3 利用前評価バナー（利用はブロックしない） | ScoringGateBanner       |
| Agent 実行前         | スコアサマリー + 品質確認                     | ScoreDisplay (compact)  |
| Agent 実行後         | EP-4 利用後再評価 + Δスコア表示               | ScoreDelta              |
| 履歴一覧             | 実行時スコア + 現在スコアの変化               | ScoreDelta (if changed) |

### ステップ6: 仕様抽出マップ

| 仕様                   | 参照先                             | 検索語                                    | 確認ステータス      |
| ---------------------- | ---------------------------------- | ----------------------------------------- | ------------------- |
| 利用導線UI             | `ui-ux-agent-execution.md`         | `ui-ux-agent-execution`, `execute`, `run` | 確認済み（hitあり） |
| ナビゲーション入口     | `ui-ux-navigation.md`              | `Skill Center`, `Agent`, `entry`          | 確認済み（hitあり） |
| 画面コンポーネント     | `ui-ux-feature-components.md`      | `SkillCard`, `SkillList`, `usage`         | 確認済み（hitあり） |
| 実行IPC契約            | `interfaces-agent-sdk-executor.md` | `execute`, `run`, `agent`                 | 確認済み（hitあり） |
| スキルインターフェース | `interfaces-agent-sdk-skill.md`    | `Skill`, `ImportedSkill`, `SkillAnalysis` | 確認済み（hitあり） |
| 状態管理               | `arch-state-management.md`         | `skillSlice`, `agentSlice`, `history`     | 確認済み（hitあり） |
| Workspace文脈          | `llm-workspace-chat-edit.md`       | `workspacePath`, `context`, `skill`       | 確認済み（hitあり） |

検証コマンド（抽出確認）:

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ui-ux-agent-execution" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "Skill Center" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillCard" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:optimize:evaluate" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "SkillAnalysis" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skillSlice" -c
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "workspacePath" -c
```

## 統合テスト連携

| 観点       | 連携内容                                                                 |
| ---------- | ------------------------------------------------------------------------ |
| 利用導線   | 3シナリオの開始〜完了までのE2Eフローをテスト対象にする                   |
| 品質ゲート | ScoringGate × 利用導線アクションの組み合わせマトリクスをテスト対象にする |
| 改善戻り   | 実行結果→改善→再評価→再利用のループをシナリオテスト対象にする            |
| 発見導線   | 一覧/検索/おすすめ/履歴のフィルタ・ソートをテスト対象にする              |

## 多角的チェック観点

| 観点             | 適用内容                                                                 |
| ---------------- | ------------------------------------------------------------------------ |
| UI/UX            | 3シナリオの入口が直感的か、CTAラベルが明確か                             |
| アーキテクチャ   | Workspace→Agent の二段構成がTask01画面責務と矛盾しないか                 |
| API/IPC          | EP-3/EP-4 の IPC チャネルが既存 `skill:optimize:evaluate` を再利用可能か |
| アクセシビリティ | 品質バッジが色だけでなくラベル付きか、キーボード操作可能か               |

## 成果物

| 成果物         | パス                                         | 説明                             |
| -------------- | -------------------------------------------- | -------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements-definition.md` | 3シナリオ + 導線比較 + 品質要件  |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲               |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md`     | aiworkflow-requirements 参照順序 |
| 利用シナリオ表 | `outputs/phase-1/usage-scenario-table.md`    | 3シナリオの詳細フロー            |

## 完了条件

- [ ] 3つの利用シナリオ（作成直後 / あとから / 履歴から）が定義されている
- [ ] 主利用導線（Workspace → Agent 二段構成）が候補比較の上で決定されている
- [ ] 発見導線（一覧 / 検索 / おすすめ / 履歴 / お気に入り）が要件として定義されている
- [ ] 改善フィードバックループ（実行結果 → EP-4 → 改善 → EP-2 → 再利用）が定義されている
- [ ] Task04 品質表示（ScoringGate / ScoreDisplay / ScoreDelta）の利用導線組み込みが定義されている
- [ ] 仕様抽出マップで aiworkflow-requirements の参照漏れがゼロである
- [ ] Task01 依存契約（入力: Phase 11/12 証跡要件、出力: 履歴/フィードバック、禁止: settings例外の一般化）に準拠している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

- [ ] 参照資料確認（Task01-04成果物 + システム仕様）
- [ ] タスク1: 3シナリオ定義
- [ ] タスク2: 主利用導線比較
- [ ] タスク3: 発見導線要件
- [ ] タスク4: 改善フィードバックループ
- [ ] タスク5: 品質表示組み込み
- [ ] タスク6: 仕様抽出マップ
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次のPhase

Phase 2: [phase-2-design.md](./phase-2-design.md)
