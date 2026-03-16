# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| Phase名    | ドキュメント                           |
| 前提Phase  | Phase 11（手動テスト）                 |
| 後続Phase  | Phase 13（PR作成）                     |
| ステータス | 実施済み                               |
| 作成日     | 2026-03-16                             |
| 機能名     | ライフサイクル履歴・フィードバック統合 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                |
| タスク種別 | 設計（docs-only）                      |

---

## 目的

履歴モデル、観測指標、フィードバック還流ルールを system spec に同期し、実装ガイド・変更履歴・未タスク検出レポートを作成する。

## 背景

Phase 1-11 で定義・設計・検証したライフサイクル履歴・フィードバック統合の仕様を、システム仕様書（aiworkflow-requirements）に反映する。設計タスクのため、実装状況テーブルのステータスは `spec_created`（仕様書作成のみ完了）を使用する。

---

## 実行タスク

> 以下の5タスクを全て実行してください。省略不可。

| #   | タスク名                     | 必須 | 成果物                                                                              |
| --- | ---------------------------- | ---- | ----------------------------------------------------------------------------------- |
| 1   | 実装ガイド作成               | 必須 | `outputs/phase-12/implementation-guide.md`                                          |
| 2   | システム仕様書更新           | 必須 | `outputs/phase-12/system-spec-update-summary.md`（`spec-update-summary.md` 互換名） |
| 3   | documentation-changelog      | 必須 | `outputs/phase-12/documentation-changelog.md`                                       |
| 4   | 未タスク検出レポート         | 必須 | `outputs/phase-12/unassigned-task-detection.md`                                     |
| 5   | スキルフィードバックレポート | 必須 | `outputs/phase-12/skill-feedback-report.md`                                         |

---

### Task 12-1: 実装ガイド作成

**目的**: ライフサイクル履歴・フィードバック統合の概念と技術詳細をドキュメント化する。

**実行手順**:

1. **Part 1: 概念説明（中学生レベル）** を作成する:
   - 「なぜライフサイクル履歴が必要か」を日常の例えで説明する
     - 例: 「料理の記録帳」のように、作ったレシピ（スキル）の評価・改善・再利用の履歴を残すことで、次に何を改善すべきかが分かる
   - 5つのイベントカテゴリ（作成/評価/実行/改善/再利用）を日常の例えで説明する
   - フィードバック還流の概念を「改善サイクル」として説明する
   - Task05/Task08 との連携を「スキルの成長と公開」として説明する

2. **Part 2: 技術者向け実装詳細** を作成する:
   - `SkillLifecycleEvent` 型定義とメタデータスキーマ
   - `SkillAggregateView` の集約ロジック（成功率、トレンド、推薦スコア計算式）
   - `SkillFeedback` 型と還流ルール（自動メトリクス→改善推奨アラートの条件）
   - `PublishReadinessMetrics` インターフェースと Task08 契約境界
   - データフロー（Renderer → IPC → Main → SQLite → 集約ビュー → UI）
   - 設計上の決定事項と根拠（イベントソーシング採用理由、集約の更新タイミング選択根拠）

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2）

---

### Task 12-2: システム仕様書更新

**目的**: spec-update-workflow.md に準拠してシステム仕様書を更新する。

**実行手順**:

#### Step 0: 必要仕様の抽出固定（aiworkflow-requirements）

- [ ] `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` の以下3カテゴリを起点に読む:
  - 設計仕様（Skill Lifecycle 作成済みスキル利用導線 / CTA制御マトリクス）
  - UI実装（HistorySearch timeline / あなたの記録）
  - 会話履歴機能
- [ ] `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` で以下セクションを確認する:
  - Skill Lifecycle 評価・採点ゲート
  - 作成済みスキル利用導線
- [ ] `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` で下記実体を確認する:
  - `workflow-skill-lifecycle-created-skill-usage-journey.md`
  - `workflow-skill-lifecycle-evaluation-scoring-gate.md`
  - `interfaces-agent-sdk-skill.md`
  - `interfaces-agent-sdk-history.md`
  - `arch-state-management.md`
  - `ui-history-search-view.md`
  - `ui-ux-history-panel.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`
- [ ] `.claude/skills/aiworkflow-requirements/indexes/keywords.json` で `lifecycle` / `history` / `feedback` / `score` / `timeline` の関連キーを検索し、参照漏れ候補を補完確認する

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書（`interfaces-agent-sdk-skill.md`）にタスク完了記録を追加する
  - 「タスク完了ステータス更新」セクションの詳細テンプレートで記録する
  - テスト結果サマリー表・成果物テーブルを含める
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加する
- [ ] `.claude/skills/task-specification-creator/LOGS.md` にタスク完了記録を追加する
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴にバージョンを追記する
- [ ] `.claude/skills/task-specification-creator/SKILL.md` の変更履歴にバージョンを追記する

> P1/P25 注意: LOGS.md は aiworkflow-requirements と task-specification-creator の**2ファイル両方**を更新すること。

#### Step 1-B: 実装状況テーブル更新

- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を `spec_created` に更新する（設計タスクのため `completed` ではなく `spec_created`）
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認する

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rl "TASK-SKILL-LIFECYCLE-07" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索する
- [ ] 該当する仕様書の関連タスクテーブルのステータスを更新する
- [ ] 以下のファイルを確認する:
  - `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
  - `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`
  - `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
  - `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
  - `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認する

> P2/P27 注意: セクションの追加だけでなく、削除・更新も再生成トリガーに含める。仕様書に変更があれば必ず再生成を実行すること。

#### Step 1-E: 未タスク指示書作成・登録（Task 12-4 で検出した場合）

- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置する
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに新規未タスクを登録する
- [ ] 関連仕様書に参照リンクを追加する
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` で `ALL_LINKS_EXIST` を確認する

> P3/P38 注意: 未タスク管理は3ステップ全完了が必要。指示書作成だけでは不十分。

#### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）

- [ ] 今回タスクに CI/CD・lint・typecheck・ビルドパイプライン変更が含まれる場合、`.claude/skills/aiworkflow-requirements/references/technology-devops.md` を更新する
- [ ] 今回タスクが docs-only / 設計のみで DevOps 変更がない場合、`documentation-changelog.md` と `system-spec-update-summary.md` に「Step 1-F: 該当なし（根拠: DevOps変更なし）」を記録する

#### Step 1-G: 検証コマンド順次実行

以下を順番に実行する:

```bash
# 1. 未タスク参照リンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# 2. 索引再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json

# 3. SKILL検証（3スキル）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

- [ ] `quick_validate.js` の Warning を `許容 / 要監視 / 要対応` に分類し、`outputs/phase-12/system-spec-update-summary.md` と `outputs/phase-12/documentation-changelog.md` に同値で記録する
- [ ] `quick_validate.js` の Error が 0 件であることを確認する

#### Step 2: システム仕様更新（条件付き）

本タスクは設計タスクであり、以下の新規インターフェース/型を定義しているため、Step 2 が必要:

- `SkillLifecycleEvent` 型（イベントモデル）
- `SkillAggregateView` 型（集約ビュー）
- `SkillFeedback` 型（フィードバックモデル）
- `PublishReadinessMetrics` 型（公開判断メトリクス）

更新対象ファイル:

| #   | 更新対象ファイル                                                                                            | 更新内容                                     |
| --- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                           | 新規型定義セクション追加                     |
| 2   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`                         | 履歴イベントモデルセクション追加             |
| 3   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                | lifecycleHistorySlice 設計セクション追加     |
| 4   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Task05 利用導線との依存契約追記              |
| 5   | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | Task04 評価依存契約の参照追記                |
| 6   | `.claude/skills/aiworkflow-requirements/references/ui-history-search-view.md`                               | 履歴timeline 観測項目の追記                  |
| 7   | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`                                  | 履歴UI family 参照導線の追記                 |
| 8   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | 完了タスクセクション追加、残課題テーブル更新 |
| 9   | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                              | 苦戦箇所と再利用手順の追記                   |

> Step 2 不要と判断した場合でも、判断根拠を documentation-changelog.md と `system-spec-update-summary.md`（`spec-update-summary.md` 互換名）に明記すること。

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`（Step 1 / Step 2 の実施結果、`spec-update-summary.md` 互換名）

---

### Task 12-3: documentation-changelog.md 作成

**目的**: 変更した全仕様書の変更内容を記録する。

**実行手順**:

1. 更新した全ファイルの変更内容を記録する
2. 各 Step の完了結果を詳細に記録する
3. 検証コマンドの実行結果を記録する（current / baseline の区別を含む）
4. `artifacts.json` と `outputs/artifacts.json` の同期結果を記録する

> P4/P51 注意: 全 Step 確認前に「完了」と記載しない。各 Step の実行結果は「事後記録」すること。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

---

### Task 12-4: 未タスク検出レポート

**目的**: Phase 1-11 の成果物から未タスク候補を検出し、レポートを作成する。0件でも出力必須。

**実行手順**:

1. Phase 10 の MINOR 指摘がある場合、全て未タスク仕様書に変換する
2. Phase 11 の発見事項（Note カテゴリ）を未タスク候補として評価する
3. 以下の観点で未タスク候補を検出する:
   - 設計で定義したが実装タスクが未作成のコンポーネント
   - Task05/Task08 との連携で追加実装が必要な箇所
   - テストで発見された改善点
4. 検出した未タスクは3ステップ全完了する:
   - `unassigned-task/` に指示書作成
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録
   - 関連仕様書に参照リンク追加
5. 検出件数が0件の場合も、「0件: 検出なし」としてサマリーを残す
6. `audit-unassigned-tasks.js` を実行し、baseline / current を分離記録する

> P56 注意: 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close すること。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

---

### Task 12-5: スキルフィードバックレポート

**目的**: Phase 1-12 のワークフロー実行を通じて得られたスキル改善の知見を記録する。改善点がなくても出力必須。

**実行手順**:

1. task-specification-creator スキルの改善点を検討する:
   - 設計タスク向けの Phase テンプレートの改善点はあるか
   - docs-only タスクの Phase 11 テンプレート（ウォークスルーシナリオ）の有効性
   - Phase 12 の Step 2 判定基準の明確さ
2. aiworkflow-requirements スキルの改善点を検討する:
   - ライフサイクル履歴関連の仕様書構造は適切か
   - 新規型定義の仕様書配置ルールに改善の余地はあるか
3. 改善点がある場合は next action を記録する
4. 改善点がない場合は「改善点なし」と理由を明記する

> P28 注意: 「スキル改善なし」と即断しない。必ず改善検討を実施してから結論を出すこと。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

---

## Phase 12 準拠チェック

Task 12-1 から Task 12-5 の全完了後、以下の準拠チェックを実施する:

- [ ] `outputs/phase-12/implementation-guide.md` が存在し、Part 1 / Part 2 の両方を含む
- [ ] `outputs/phase-12/system-spec-update-summary.md` が存在し、Step 1 / Step 2 の結果を含む（`spec-update-summary.md` 互換名）
- [ ] `outputs/phase-12/documentation-changelog.md` が存在し、全 Step の事後記録を含む
- [ ] `outputs/phase-12/unassigned-task-detection.md` が存在する（0件でもサマリーあり）
- [ ] `outputs/phase-12/skill-feedback-report.md` が存在する（改善点なしでも理由あり）
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が存在し、全タスクの準拠結果を含む

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 参照資料

| 参照資料                        | パス                                                                                   | 内容                               |
| ------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 2 成果物                  | `outputs/phase-2/`                                                                     | 設計根拠                           |
| Phase 5 成果物                  | `outputs/phase-5/`                                                                     | 実装仕様                           |
| Phase 6 成果物                  | `outputs/phase-6/`                                                                     | テスト拡充結果                     |
| Phase 7 成果物                  | `outputs/phase-7/`                                                                     | カバレッジ判定                     |
| Phase 8 成果物                  | `outputs/phase-8/`                                                                     | リファクタリング結果               |
| Phase 9 成果物                  | `outputs/phase-9/`                                                                     | 品質検証結果                       |
| Phase 10 成果物                 | `outputs/phase-10/`                                                                    | 最終レビュー判定                   |
| Phase 11 成果物                 | `outputs/phase-11/`                                                                    | 手動テスト結果                     |
| phase-template-phase12          | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`       | Phase 12 テンプレート              |
| phase-12-documentation-guide    | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Phase 12 ドキュメントガイド        |
| spec-update-workflow            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | システム仕様更新ワークフロー       |
| aiworkflow resource-map         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                       | 仕様抽出の起点                     |
| aiworkflow quick-reference      | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                    | 分割検索ルール                     |
| aiworkflow topic-map            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          | 参照実体確認                       |
| aiworkflow keywords             | `.claude/skills/aiworkflow-requirements/indexes/keywords.json`                         | キーワード逆引きによる抽出漏れ防止 |
| ライフサイクルイベント一覧      | `outputs/phase-1/lifecycle-event-catalog.md`                                           | Phase 1 成果物                     |
| フィードバック収集要件          | `outputs/phase-1/feedback-collection-spec.md`                                          | Phase 1 成果物                     |
| Task05連携要件                  | `outputs/phase-1/task05-integration-contract.md`                                       | Phase 1 成果物                     |
| Task08メトリクス定義            | `outputs/phase-1/task08-metrics-definition.md`                                         | Phase 1 成果物                     |
| 受入基準検証マトリクス          | `outputs/phase-1/acceptance-criteria-matrix.md`                                        | Phase 1 成果物                     |
| イベントモデル設計書            | `outputs/phase-2/event-model-design.md`                                                | Phase 2 成果物                     |
| 集約ビュー設計書                | `outputs/phase-2/aggregate-view-design.md`                                             | Phase 2 成果物                     |
| フィードバック還流設計書        | `outputs/phase-2/feedback-loop-design.md`                                              | Phase 2 成果物                     |
| 公開メトリクスIF設計書          | `outputs/phase-2/publish-metrics-interface-design.md`                                  | Phase 2 成果物                     |
| データフロー設計書              | `outputs/phase-2/data-flow-design.md`                                                  | Phase 2 成果物                     |
| SkillLifecycleEvent実装仕様書   | `outputs/phase-5/event-model-impl-spec.md`                                             | Phase 5 成果物                     |
| lifecycleHistorySlice設計仕様書 | `outputs/phase-5/lifecycle-history-slice-spec.md`                                      | Phase 5 成果物                     |
| 集約ロジック実装仕様書          | `outputs/phase-5/aggregate-logic-impl-spec.md`                                         | Phase 5 成果物                     |
| フィードバックモデル実装仕様書  | `outputs/phase-5/feedback-model-impl-spec.md`                                          | Phase 5 成果物                     |
| Task08メトリクスAPI実装仕様書   | `outputs/phase-5/publish-metrics-api-impl-spec.md`                                     | Phase 5 成果物                     |
| 命名統一レポート                | `outputs/phase-8/naming-unification-report.md`                                         | Phase 8 成果物                     |
| 重複除去レポート                | `outputs/phase-8/deduplication-report.md`                                              | Phase 8 成果物                     |
| データフロー最適化記録          | `outputs/phase-8/data-flow-optimi                                                      |
| 仕様書品質検証レポート          | `outputs/phase-9/spec-quality-report.md`                                               | Phase 9 成果物                     |
| 型整合性検証レポート            | `outputs/phase-9/type-consistency-report.md`                                           | Phase 9 成果物                     |
| リンク有効性検証レポート        | `outputs/phase-9/link-validity-report.md`                                              | Phase 9 成果物                     |
| 品質ゲート判定レポート          | `outputs/phase-9/quality-gate-report.md`                                               | Phase 9 成果物                     |
| 受入基準充足マトリクス          | `outputs/phase-10/acceptance-criteria-fulfillment.md`                                  | Phase 10 成果物                    |
| 設計-実装差分レポート           | `outputs/phase-10/design-implementation-gap-report.md`                                 | Phase 10 成果物                    |
| 連携最終検証レポート            | `outputs/phase-10/integration-final-verification.md`                                   | Phase 10 成果物                    |
| 最終レビュー判定書              | `outputs/phase-10/final-review-decision.md`                                            | Phase 10 成果物                    |
| ウォークスルーシナリオA         | `outputs/phase-11/walkthrough-scenario-a.md`                                           | Phase 11 成果物                    |
| ウォークスルーシナリオB         | `outputs/phase-11/walkthrough-scenario-b.md`                                           | Phase 11 成果物                    |
| ウォークスルーシナリオC         | `outputs/phase-11/walkthrough-scenario-c.md`                                           | Phase 11 成果物                    |
| 手動テスト結果レポート          | `outputs/phase-11/manual-test-report.md`                                               | Phase 11 成果物                    |
| 発見事項リスト                  | `outputs/phase-11/discovered-issues.md`                                                | Phase 11 成果物                    |

zation-report.md`| Phase 8 成果物 |
| テスト再実行レポート |`outputs/phase-8/test-rerun-report.md` | Phase 8 成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料                                             | パス                                                                                                        | 内容                       |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill                           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                           | スキル管理インターフェース |
| interfaces-agent-sdk-history                         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md`                         | SDK履歴インターフェース    |
| arch-state-management                                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                | Zustand state 契約         |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Task05 依存導線            |
| workflow-skill-lifecycle-evaluation-scoring-gate     | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-evaluation-scoring-gate.md`     | Task04 評価依存            |
| task-workflow                                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                        | 完了/未タスク台帳          |
| lessons-learned-current                              | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                              | 最新教訓                   |

---

## 成果物

| 成果物                       | パス                                                     | 内容                                                          |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1（概念）+ Part 2（技術詳細）                            |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の実施結果（`spec-update-summary.md` 互換名） |
| ドキュメント変更履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧と検証結果                                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 未タスク候補の検出結果（0件でも必須）                         |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | スキル改善の知見（なしでも必須）                              |
| Phase 12 準拠チェック結果    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の準拠結果                                    |

---

## 統合テスト連携

- Phase 11 の手動テスト結果（発見事項）を Task 12-4 の未タスク検出の入力とする
- Phase 10 の MINOR 指摘を Task 12-4 で未タスク仕様書に変換する
- Task 12-2 の仕様書更新は後続タスク（TASK-SKILL-LIFECYCLE-08）の入力となる

---

## 完了条件

- [ ] Task 12-1: 実装ガイドが Part 1（概念説明）+ Part 2（技術詳細）を含む
- [ ] Task 12-2: Step 1-A〜1-G と Step 2 が全て実施され、検証コマンドがエラー0件で通過している
- [ ] Task 12-2: LOGS.md が aiworkflow-requirements と task-specification-creator の2ファイル両方更新されている
- [ ] Task 12-2: topic-map.md が再生成されている
- [ ] Task 12-2: `quick_validate.js` Warning の `許容 / 要監視 / 要対応` 分類が `system-spec-update-summary.md` と `documentation-changelog.md` で一致している
- [ ] Task 12-3: documentation-changelog.md に全 Step の事後記録が含まれている
- [ ] Task 12-4: 未タスク検出レポートが作成されている（0件でもサマリーあり）
- [ ] Task 12-4: 検出した未タスクの3ステップ（指示書+テーブル+リンク）が全完了している
- [ ] Task 12-5: スキルフィードバックレポートが作成されている（改善点なしでも理由あり）
- [ ] Phase 12 準拠チェックが実施され、全6成果物が `outputs/phase-12/` に存在する
- [ ] `quick_validate.js` で3スキル全てが Error 0件である

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/phase-13-pr-creation.md`
