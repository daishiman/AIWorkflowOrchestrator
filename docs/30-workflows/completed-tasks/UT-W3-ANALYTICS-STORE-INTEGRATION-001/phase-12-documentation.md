# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| タスクID   | UT-W3-ANALYTICS-STORE-INTEGRATION-001          |
| 機能名     | renderer analytics slice / SkillAnalytics 連携 |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13（blocked / 承認待ち）                 |
| 作成日     | 2026-04-13                                     |
| ステータス | pending                                        |

## 目的

implementation guide・spec sync・未タスク・feedback を完了する。
renderer-side `analyticsSlice` と shared `skill-analytics.ts` の実装内容を、system spec・workflow 台帳・変更履歴・未タスク・フィードバック・準拠チェックへ 1 wave で同期する。

## 事前チェック【必須】

- P1 / P25: `LOGS.md` 2 ファイルの更新漏れがないか確認する
- P2 / P27: `topic-map.md` と workflow index の再生成忘れがないか確認する
- P3: 未タスク管理の 3 ステップが崩れていないか確認する
- P4: 早期の「完了」記載をしない
- P28: `skill-feedback-report.md` を省略しない
- P29: `SKILL.md` の変更履歴更新漏れがないか確認する
- root `artifacts.json` と `outputs/artifacts.json` の parity を初手で確認する
- `outputs/phase-12/*.md` に `計画` / `予定` / `TODO` / `PR マージ後` を残さない

## 実行タスク

| Task      | 内容                          | 主成果物                                                 |
| --------- | ----------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成（2パート構成） | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新      | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成      | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出レポート作成      | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 コンプライアンス確認 | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 並列実行方針

- Task 12-2 の Step 1 を固定した後、Task 12-1 / 12-3 / 12-4 / 12-5 は並列実行できる
- Task 12-2 の Step 2 は Step 1 完了後に実施する
- Task 12-6 は全成果物が揃うまで実行しない

---

## Task 12-1: 実装ガイド作成【必須・2パート構成】

| パート | 対象読者       | 内容                                         |
| ------ | -------------- | -------------------------------------------- |
| Part 1 | 初学者・中学生 | 概念的説明（日常の例え話、専門用語なし）     |
| Part 2 | 開発者・技術者 | 技術的詳細（型、シグネチャ、使用例、エラー） |

### Part 1（中学生レベル）

「なぜ必要か」→「何をするか」の順序で記述する。日常例え話を必ず含める。

**例え話**: 「授業の出席簿のように、スキルの実行を自動的に記録する仕組み」

- たとえば、学校で先生が毎時間「今日○○さんは出席した」と記録するように、
  AIWorkflowOrchestrator ではスキルを実行するたびに「いつ・どのスキルが・どんな結果だったか」を自動記録する
- 先生が毎回手動でメモしなくても出席簿に自動記録されるように、
  開発者が毎回イベント送信の細かい処理を書かなくても、スキルの実行開始・完了・エラーが自動的に記録される
- これにより、後からスキルの使われ方や失敗率を分析できる

**記述要件**:

- `たとえば` を最低 1 回明示する
- 専門用語は使わない（使う場合は即座に日常語で説明する）
- 図表より文章を優先する

### Part 2（技術者レベル）

- `SkillAnalyticsEvent` 型定義（TypeScript interface）
- `analyticsSlice` の Zustand slice シグネチャ
- `trackSkillStart` / `trackSkillComplete` / `trackSkillError` のAPIシグネチャと使用例
- `trackEvent` 公開 API の既存シグネチャ（変更なし）
- エラーハンドリングとエッジケース
- 設定可能なパラメータと定数の一覧

**成果物**: `outputs/phase-12/implementation-guide.md`

---

## Task 12-2: システム仕様書更新【必須】

### Step 1: タスク完了記録【必須】

| Step | 要件                                                                                                            | 備考                        |
| ---- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| 1-A  | 完了タスクセクションを追加し、実装ガイドリンク・変更履歴・`LOGS.md` 2 ファイル・`SKILL.md` 2 ファイルを更新する | `completed`                 |
| 1-B  | 実装状況テーブルを `completed` に更新する（`spec_created` ではない）                                            | 実装後は `completed`        |
| 1-C  | 関連タスクテーブルを更新する（`task-workflow.md` を含む）                                                       | 関連タスク参照              |
| 1-D  | `generate-index.js` を aiworkflow-requirements と task-specification-creator の両方で実行する                   | workflow index も再生成する |
| 1-E  | 未タスクが出た場合は 3 ステップで formalize する（0 件でも検出レポートを出力）                                  | Task 12-4 と連携            |
| 1-F  | DevOps / CI 向け更新はこの task では N/A を明記する                                                             | 必要時のみ別 wave           |
| 1-G  | 検証コマンドを実行して結果を記録する                                                                            | `quick_validate.js` 等      |

**generate-index.js 実行コマンド**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
```

### Step 2: 新規インターフェース追加時のみ実施

`SkillAnalyticsEvent` 型が新規追加の場合は以下を更新する：

| 条件                           | 更新対象                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| 新規 interface / type / export | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |
| 公開 export 同期               | `packages/shared/src/types/index.ts` / `packages/shared/index.ts`                                                 |
| UI 表示や語彙参照も変わる      | 対応する `ui-ux-*` または `interfaces-*` の正本                                                                   |
| contract 変更なし              | `documentation-changelog.md` に N/A 理由を記録する                                                                |

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

---

## Task 12-3: ドキュメント更新履歴作成【必須】

記録内容：

- 変更したファイル一覧
- validator 実行結果
- current / baseline の区別
- root `artifacts.json` と `outputs/artifacts.json` の同期結果
- `implementation-guide.md` / `system-spec-update-summary.md` / `unassigned-task-detection.md` / `skill-feedback-report.md` / `phase12-task-spec-compliance-check.md` の canonical path
- planned wording の残存有無

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-STORE-INTEGRATION-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/phase12-task-spec-compliance-check.md:Phase 12 準拠チェック"
```

**成果物**: `outputs/phase-12/documentation-changelog.md`

---

## Task 12-4: 未タスク検出レポート作成【必須・0件でも出力必須】

| Source               | 確認内容                          |
| -------------------- | --------------------------------- |
| Phase 3 review       | MINOR / MAJOR の残課題            |
| Phase 10 review      | 最終レビューで残った blocker      |
| Phase 11 manual test | scope-out / non-visual findings   |
| codebase             | `TODO` / `FIXME` / `HACK` / `XXX` |

**スコープ外検出（既知）**:

- `UT-W3-ANALYTICS-DASHBOARD-001`（ダッシュボード UI）: 本タスクのスコープ外。
  `analyticsSlice` の Store 層実装に留まり、UI 表示は後続タスクの責務。

1 件以上の未タスクがある場合は 3 ステップで formalize する：

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

---

## Task 12-5: スキルフィードバックレポート作成【必須・改善点なしでも出力必須】

記録内容：

- ワークフロー改善点
- 技術的教訓
- スキル改善提案
- 新規 Pitfall 候補
- 改善点がなくても `改善点なし` と理由を記載する

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## Task 12-6: Phase 12 コンプライアンス確認【必須】

- Task 12-1〜12-5 の成果物が存在することを確認する
- Step 1-A〜1-G と Step 2 の実施結果を 1 ファイルへ束ねる
- root `artifacts.json` と `outputs/artifacts.json` の同値性を確認する
- `phase-12-documentation.md` に planned wording が残っていないことを確認する
- validator 実測値、root parity、same-wave sync の根拠を残す
- 未充足が 1 つでもある場合は `PASS` を書かず、`FAIL` または `BLOCKED` とする

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## LOGS.md 更新【必須・両方】

以下の 2 ファイルを必ず更新する：

- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/task-specification-creator/LOGS.md`

## 参照資料

| 参照資料                  | パス                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| 実装ガイド定義            | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`          |
| 技術ドキュメントガイド    | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md`         |
| システム仕様更新フロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                  |
| 検証マトリクス            | `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`         |
| Phase 12 詳細テンプレート | `.claude/skills/task-specification-creator/references/phase12-task-spec-compliance-template.md` |

## 成果物

| 成果物                       | パス                                                     | 説明                    |
| ---------------------------- | -------------------------------------------------------- | ----------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2         |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 更新履歴                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点（なしでも必須）  |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終根拠                |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] Task 12-1〜12-6 がすべて実施されている
- [ ] Step 1-A〜1-G と Step 2 の実施方針が明記されている
- [ ] root / outputs の artifacts parity が確認されている
- [ ] planned wording が残っていない
- [ ] LOGS.md 2 ファイルが更新されている
- [ ] generate-index.js が両スキルで実行されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. 事前チェック
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2: システムドキュメント更新（Step 1 + Step 2）
4. Task 12-3: ドキュメント更新履歴作成
5. Task 12-4: 未タスク検出レポート作成
6. Task 12-5: スキルフィードバックレポート作成
7. Task 12-6: Phase 12 コンプライアンス確認

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載の 6 ファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR作成（blocked / 承認待ち）
