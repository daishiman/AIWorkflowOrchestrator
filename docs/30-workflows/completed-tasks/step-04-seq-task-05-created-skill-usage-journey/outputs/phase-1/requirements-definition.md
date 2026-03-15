# Phase 1 要件定義書

## メタ情報

| 項目     | 値                         |
| -------- | -------------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-05    |
| タスク名 | 作成済みスキルを使う主導線 |
| Phase    | 1                          |
| 作成日   | 2026-03-15                 |

## 1. 概要

作成済みスキルをユーザーが「いつ」「どこから」「どう使うか」を定義し、`作ったが使われない`状態を防ぐ要件を固定する。

## 2. P50チェック結果

| 判定     | 根拠                                                                                                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 部分実装 | AgentView 実行履歴、SkillCenterView 一覧・検索・カードは既存。ScoringGateバッジ・お気に入り・改善フィードバックループ・Workspace連携は未実装 |

**既実装コンポーネント**:

| コンポーネント      | パス                                                                               | 状態   |
| ------------------- | ---------------------------------------------------------------------------------- | ------ |
| AgentView           | `apps/desktop/src/renderer/views/AgentView/index.tsx`                              | 実装済 |
| RecentExecutionList | `apps/desktop/src/renderer/components/organisms/AgentView/RecentExecutionList.tsx` | 実装済 |
| SkillCenterView     | `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`                        | 部分   |
| SkillCard           | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`         | 部分   |
| SkillDetailPanel    | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel.tsx`  | 部分   |
| getScoreGate()      | `packages/shared/src/types/skill-improver.ts`                                      | 実装済 |

**未実装機能**:

| 機能                             | 対応Phase |
| -------------------------------- | --------- |
| ScoreGateBadge コンポーネント    | Phase 2   |
| お気に入り（favoriteSkillNames） | Phase 2   |
| 最近使ったスキル表示             | Phase 2   |
| 改善フィードバックループUI       | Phase 2   |
| Workspace スキル選択連携         | Phase 2   |
| PostExecutionActionBar           | Phase 2   |

## 3. 利用シナリオ定義

### シナリオA: 作成直後に使う（Immediate Use）

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| 開始地点     | Skill Creator 完了 → EP-1 採点完了後                                                       |
| 前提条件     | ScoringGate が `USE_ALLOWED` (80+) または `RECOMMENDED` (100)                              |
| 主アクション | 「今すぐ使う」CTA → Workspace/Agent 実行画面へ遷移                                         |
| 完了地点     | Agent で実行完了し、結果を確認                                                             |
| 代替経路     | ScoringGate が `SAVE_ALLOWED` (60-79) の場合 → 保存後、改善推奨バナーを表示してReuse導線へ |
| ブロック条件 | ScoringGate が `NEEDS_IMPROVEMENT` (0-59) の場合 → 利用ボタン無効、改善必須                |

### シナリオB: あとから使う（Deferred Use）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| 開始地点     | Skill Center の「保存済みスキル」一覧 / お気に入り / 最近使ったスキル      |
| 前提条件     | スキルが保存済み（ScoringGate `SAVE_ALLOWED` 以上）                        |
| 主アクション | スキルカードをクリック → スキル詳細 → 「使う」CTA → Workspace/Agent へ遷移 |
| 完了地点     | Agent で実行完了し、結果を確認                                             |
| 発見導線     | Skill Center 一覧、検索、カテゴリフィルタ、おすすめ表示                    |
| 品質参照     | スキルカードに ScoringGate バッジ（色 + ラベル）を表示                     |

### シナリオC: 履歴から再利用する（History Reuse）

| 項目         | 内容                                                                         |
| ------------ | ---------------------------------------------------------------------------- |
| 開始地点     | Agent の実行履歴一覧 / Workspace の最近使ったスキル                          |
| 前提条件     | 過去に1回以上実行した記録が存在する                                          |
| 主アクション | 履歴エントリをクリック → 前回のコンテキストを復元 → 再実行 or パラメータ変更 |
| 完了地点     | Agent で再実行完了                                                           |
| 差別化       | 前回の実行パラメータ、結果サマリー、スコア変遷を表示                         |
| 改善戻り     | 実行結果が不満なら「改善する」CTA で Task03 改善フローへ遷移                 |

## 4. 主利用導線の選定

### Workspace vs Agent 比較

| 比較項目          | Workspace                            | Agent                                   |
| ----------------- | ------------------------------------ | --------------------------------------- |
| Task01 画面責務   | 文脈準備、ファイル接続（Primary）    | 実行、履歴確認、改善判断（Primary）     |
| Task01 禁止責務   | 探索一覧、最終実行判断               | 探索一覧、作成本体                      |
| 実行能力          | プレビュー（Secondary）              | 実行本体（Primary）                     |
| 文脈統合          | ファイル・プロジェクト文脈を統合可能 | 実行に集中、文脈はWorkspaceから引き継ぐ |
| 品質表示の自然さ  | 実行前の確認段階として自然           | 実行中/実行後の評価として自然           |
| 改善戻りの近さ    | 改善導線がスキル管理画面経由で遠い   | 改善判断がPrimary責務なので近い         |
| ui-ux-realization | Execute phase の入口（文脈整備）     | Execute phase の本体（実行＋結果）      |

### 導線方針

Workspace を「実行準備」、Agent を「実行本体」とする **二段構成**。

- **推奨経路**: Skill Center → Workspace（文脈準備）→ Agent（実行）
- **省略経路**: Skill Center → Agent（直接遷移）— 文脈不要時に許容
- **履歴経路**: Agent 履歴 → Agent（再実行）— Workspace 不要

## 5. 発見導線の要件

| 発見方法   | 表示場所              | ソート基準            | フィルタ条件                 |
| ---------- | --------------------- | --------------------- | ---------------------------- |
| 一覧表示   | Skill Center          | 最終更新日 / スコア順 | ScoringGate / カテゴリ       |
| 検索       | Skill Center 検索バー | 関連度                | スキル名 / 説明 / タグ       |
| おすすめ   | Skill Center トップ   | スコア × 利用頻度     | `USE_ALLOWED` 以上のみ       |
| 最近使った | Skill Center / Agent  | 最終使用日時          | なし                         |
| お気に入り | Skill Center          | お気に入り登録日      | ユーザーがスター付けしたもの |
| 履歴       | Agent 履歴タブ        | 実行日時              | 成功 / 失敗 / 全て           |

## 6. 改善フィードバックループ

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

## 7. 品質表示の利用導線組み込み

| 利用導線の地点       | 表示内容                                      | Task04 対応             |
| -------------------- | --------------------------------------------- | ----------------------- |
| Skill Center 一覧    | ScoringGate バッジ（色 + ラベル）             | getScoreVariant()       |
| スキル詳細画面       | 総合スコア + 5軸 breakdown                    | ScoreDisplay            |
| 作成直後CTA          | ゲート判定に基づくCTA有効/無効制御            | ScoringGateResult       |
| Workspace スキル選択 | EP-3 利用前評価バナー（利用はブロックしない） | ScoringGateBanner       |
| Agent 実行前         | スコアサマリー + 品質確認                     | ScoreDisplay (compact)  |
| Agent 実行後         | EP-4 利用後再評価 + delta スコア表示          | ScoreDelta              |
| 履歴一覧             | 実行時スコア + 現在スコアの変化               | ScoreDelta (if changed) |

## 8. EP-3/EP-4 仕様

### EP-3: 利用前評価（任意）

| 方向 | 項目名    | 型                  | 説明                                     |
| ---- | --------- | ------------------- | ---------------------------------------- |
| 入力 | skillName | `string`            | 利用前評価対象                           |
| 出力 | gate      | `ScoringGateResult` | 利用可否参考情報（利用ブロック機能なし） |

- **トリガー**: Workspace でスキル選択時
- **IPC**: `skill:optimize:evaluate` を再利用
- **制約**: 利用をブロックしない（確認のみ）

### EP-4: 利用後再評価（任意）

| 方向 | 項目名          | 型                  | 説明             |
| ---- | --------------- | ------------------- | ---------------- |
| 入力 | executionResult | `string`            | Agent の実行結果 |
| 出力 | evaluation      | `PromptEvaluation`  | 更新後評価       |
| 出力 | gate            | `ScoringGateResult` | 再評価後判定     |

- **トリガー**: Agent 実行完了後（ユーザーが任意で実行）
- **IPC**: `skill:optimize:evaluate` を再利用

### delta スコア表示

| 差分値            | 表示スタイル | テキスト         |
| ----------------- | ------------ | ---------------- |
| delta >= +3       | 緑・上矢印   | `+{delta}点向上` |
| -2 <= delta <= +2 | グレー       | `変化なし`       |
| delta <= -3       | 赤・下矢印   | `{delta}点低下`  |

## 9. Task01 依存契約の準拠

| 契約項目 | 内容                               | 準拠状態 |
| -------- | ---------------------------------- | -------- |
| 入力     | Phase 11/12 証跡要件               | 準拠     |
| 出力     | 履歴 / フィードバック              | 準拠     |
| 禁止     | settings 例外を一般化しない        | 準拠     |
| 画面責務 | Workspace=文脈準備、Agent=実行本体 | 準拠     |
| Chat制約 | Chat を一次導線の主入口にしない    | 準拠     |

## 10. ScoringGate 4段階定義

| スコア範囲 | ScoringGate       | canSave | canUse | UI アクション                                 |
| ---------- | ----------------- | ------- | ------ | --------------------------------------------- |
| 0-59       | NEEDS_IMPROVEMENT | false   | false  | SkillAnalysisView 必須表示、保存/利用ブロック |
| 60-79      | SAVE_ALLOWED      | true    | false  | 保存可、改善推奨バナー表示、利用ブロック      |
| 80-99      | USE_ALLOWED       | true    | true   | Workspace/Agent 導線開放、利用ボタン有効化    |
| 100        | RECOMMENDED       | true    | true   | 推奨バッジ表示、利用ボタンハイライト          |

## 11. 完了条件チェック

- [x] 3つの利用シナリオ（作成直後 / あとから / 履歴から）が定義されている
- [x] 主利用導線（Workspace → Agent 二段構成）が候補比較の上で決定されている
- [x] 発見導線（一覧 / 検索 / おすすめ / 履歴 / お気に入り）が要件として定義されている
- [x] 改善フィードバックループ（実行結果 → EP-4 → 改善 → EP-2 → 再利用）が定義されている
- [x] Task04 品質表示（ScoringGate / ScoreDisplay / ScoreDelta）の利用導線組み込みが定義されている
- [x] 仕様抽出マップで aiworkflow-requirements の参照漏れがゼロである
- [x] Task01 依存契約に準拠している
- [x] 本Phase内の全タスクを100%実行完了
