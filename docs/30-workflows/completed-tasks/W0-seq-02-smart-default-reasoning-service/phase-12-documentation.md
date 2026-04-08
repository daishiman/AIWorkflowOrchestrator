# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| タスクID   | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 |
| 機能名     | スマートデフォルト推論サービス実装             |
| 前提Phase  | Phase 11                                       |
| 後続Phase  | Phase 13                                       |
| 作成日     | 2026-04-07                                     |
| ステータス | completed                                      |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物を揃え、ドキュメントとシステム仕様を最新状態に維持する。

## 実行タスク

| Task      | 内容                               | 主成果物                                                 |
| --------- | ---------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                     | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システム仕様更新                   | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴作成           | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                       | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバック作成           | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | phase12-task-spec-compliance-check | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成
- Task 12-2: システム仕様更新
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバック作成
- Task 12-6: phase12-task-spec-compliance-check

### 進行方針

1. canonical 6 成果物を揃える。
2. Phase 11 の非 visual 証跡を current facts に同期する。
3. workflow root と lane index の完了記録を整合させる。
4. 30 思考法の改善根拠を 2 つの skill 定義と突合する。

## 統合テスト連携

- Phase 11 の manual-test-checklist / manual-test-result / discovered-issues を同一 wave で参照する。
- Phase 13 は user 承認前提の blocked 状態を維持し、PR 作成は実施しない。
- `artifacts.json` と `outputs/artifacts.json` の parity を最初に確認する。

## 検証ゲート

| ゲート         | 判定条件                                      | 主コマンド                                                                                                                                                                                                                                                                  |
| -------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 実装ガイド検証 | Part 1 / Part 2 がテンプレート要件を満たす    | `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/W0-seq-02-smart-default-reasoning-service`                                                                                                    |
| スキル検証     | 3スキル全てが Error 0件                       | `for skill in skill-creator task-specification-creator aiworkflow-requirements; do node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/$skill; done`                                                                                                 |
| 参照整合       | unassigned link / current diff が 0 件        | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md && node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` |
| mirror parity  | `.claude` 正本と `.agents` mirror の差分 0 件 | `diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator`                                                                                                                                                                              |

## 実行オーケストレーション

| SubAgent | 主担当                                                   | 並列条件                        |
| -------- | -------------------------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案                    | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案                    | A と並列可                      |
| C        | `system-spec-update-summary.md`                          | Part 2 の更新対象確定後に並列可 |
| D        | `documentation-changelog.md`                             | C と並列可                      |
| E        | `outputs/phase-12/unassigned-task-detection.md`          | D と並列可                      |
| F        | `skill-feedback-report.md`                               | E と並列可                      |
| G        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## タスク詳細

### Task 12-1: 実装ガイド作成

#### Part 1: 中学生向け説明

**スマートデフォルト推論サービスとは何か？**

スキルを作るウィザードで、ユーザーが入力した「スキル名」「目的」「カテゴリ」を受け取り、
主に「目的」と「カテゴリ」から AI のおすすめ設定を自動で予測するサービスの話です。

たとえば「目的に Slack と書いてあれば、使うツールは自動で slack にする」
「毎日・毎週・定期という言葉があれば、実行タイミングは自動でスケジュール実行にする」
という感じで、ユーザーが毎回同じことを入力する手間を省きます。

**例えば：**

- 「毎日 Slack に通知を送る」と入力 → ツール：slack、タイミング：scheduled が自動選択
- カテゴリを「code-support（コードサポート）」にする → 出力形式：code が自動選択
- 推論できない場合は空欄（null）で返す（エラーにならない）

**専門用語の説明：**

- **推論（inference）**: 入力されたテキストから答えを予測すること
- **フォールバック**: 推論できなかった場合の「安全なデフォルト動作」
- **inferenceLog**: 「なぜこの値を選んだか」の理由を記録するリスト
- **SmartDefaultResult**: 推論結果を格納する型（データの入れ物）

#### Part 2: 技術者向け説明

**変更概要：**

`packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` を新規作成し、
`inferSmartDefaults(input: SkillInfoFormData): SmartDefaultResult` 関数を実装した。

Part 2 では次を必ず含める。

- `SkillInfoFormData` / `SmartDefaultResult` の TypeScript 型定義
- `@repo/shared` からの import と使用例
- エラーハンドリング / エッジケース / フォールバック
- 設定可能なパラメータ / 定数一覧

W0-seq-01 で定義済みの型を利用し、規則ベースの推論（キーワードマッチング）を実装。
推論できなかったフィールドは `null` を返し、エラーにしない（AC-4 フォールバック）。

**推論ルール：**

- `purpose` テキストに "Slack"/"GitHub"/"Notion" → `tool` フィールドを推論（先勝ち）
- `purpose` テキストに "毎日"/"毎週"/"定期"/"スケジュール" → `timing = "scheduled"`
- `purpose` テキストに "リアルタイム"/"即座"/"すぐに" → `timing = "realtime"`
- `category` が "code-support" → `format = "code"`
- `category` が "data-analysis" → `format = "structured"`

**API シグネチャ：**

```typescript
export function inferSmartDefaults(
  input: SkillInfoFormData,
): SmartDefaultResult;
```

**エッジケース：**

- `purpose` が runtime 不正入力（null/undefined/空文字）: tool/timing は null（category が有効なら format 推論は継続）
- `category` が runtime 不正入力（null/undefined）: `format = null`
- 複数のツール名が含まれる: 先に一致したツールのみ採用（先勝ちルール）
- 推論0件: tool/timing/format がすべて未推論のときのみ `inferenceLog = []`（エラーにならない）

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク・LOGS.md 更新

- `docs/30-workflows/W0-seq-02-smart-default-reasoning-service/index.md` のステータスを `completed` へ更新
- `docs/30-workflows/skill-wizard-redesign-lane/index.md` に W0-seq-02 の完了記録を追加し、W0 行を新規追加する
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の完了記録を更新し、`.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` も同期する
- 関連レーンの LOGS.md（2ファイル）に完了記録を追加
- 関連 skill の `SKILL.md` history（2ファイル）を更新し、canonical / mirror の差分を確認する
- `topic-map.md` の skill-wizard-redesign 項目を更新
- Phase 11 の `outputs/phase-11/manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` も同一 wave で参照する

#### Step 1-B: 実装状況テーブル更新

- W0-seq-02 の実装状況を `pending` → `completed` へ更新

#### Step 1-C: 関連タスクテーブル更新

| タスク     | 依存関係                         | ステータス更新                    |
| ---------- | -------------------------------- | --------------------------------- |
| W2-seq-03a | W0-seq-02 完了後にインポート可能 | `inferSmartDefaults` 利用可を明記 |

#### Step 2: 新規 I/F 追加の仕様更新判定

`inferSmartDefaults` は `packages/shared/` の新規 public API であるため、
`system-spec-update-summary.md` に以下を記録する：

- 新規エクスポート: `inferSmartDefaults` from `@repo/shared`
- 追加先: `packages/shared/src/services/skillCreator/index.ts` と `packages/shared/index.ts`
- 関数シグネチャ・引数型・返り値型
- W2-seq-03a での利用方法（`SkillCreateWizard.tsx` からの `@repo/shared` import 例）
- `artifacts.json` / `outputs/artifacts.json` の title / type / status / phase artifact 名 parity
- canonical root / mirror policy と Step 2 要否判定の根拠
- Phase 11 の manual-test-checklist / manual-test-result / discovered-issues との参照整合

### Task 12-3: 更新履歴作成

`documentation-changelog.md` を生成し、全 Step 結果を記録する。

- `index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の同期結果
- current / baseline の区別
- 検証コマンド結果
- 変更ファイル一覧（`.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` を含む）
- Step 1-A で更新した `aiworkflow-requirements` / `task-specification-creator` の
  `LOGS.md` / `SKILL.md` を canonical path で列挙する
- `outputs/phase-11/manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` への参照も残す

### Task 12-4: 未タスク検出

プロジェクト全体で UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 に関連する
未着手タスクを検出し、0件でも `outputs/phase-12/unassigned-task-detection.md` を出力する。
0件でも current / baseline を分けて記録し、1件以上なら formalize path を明記する。

### Task 12-5: スキルフィードバック作成

実装・テスト・設計を通じて発見した改善点を記録する。
改善点が0件でも `skill-feedback-report.md` を出力し、`なし` と理由を記載する。

### Task 12-6: phase12-task-spec-compliance-check

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、
Task 12-1〜12-5 が task-specification-creator と aiworkflow-requirements の
両方に対して準拠しているかを最終確認する。
確認対象は以下を含む：

- `implementation-guide.md` の Part 1/2 要件（型定義・API・使用例・エラー・エッジケース・設定/定数）
- `system-spec-update-summary.md` の Step 1-A/1-B/1-C/Step 2 と `artifacts.json` parity
- `documentation-changelog.md` の current / baseline 分離、変更ファイル一覧、検証結果
- `outputs/phase-12/unassigned-task-detection.md` の 0件出力と formalize 判断
- `skill-feedback-report.md` の出力有無と理由
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `LOGS.md` / `SKILL.md` history / mirror parity
- `outputs/phase-12/*.md` に計画表現が残っていないこと
- validator 実測値、artifact existence、mirror parity、Phase 11 evidence のファイル根拠

## 参照資料

| 資料名                   | パス                                                 | 用途              |
| ------------------------ | ---------------------------------------------------- | ----------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`             | Phase 11 成果物   |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`          | Phase 11 成果物   |
| 検出事項                 | `outputs/phase-11/discovered-issues.md`              | Phase 11 成果物   |
| API 設計                 | `outputs/phase-2/api-design.md`                      | Phase 2 成果物    |
| 回帰テスト結果           | `outputs/phase-6/regression-test-result.md`          | Phase 6 成果物    |
| 網羅率レポート           | `outputs/phase-7/traceability-coverage-report.md`    | Phase 7 成果物    |
| 責務境界マップ           | `outputs/phase-8/responsibility-boundary-map.md`     | Phase 8 成果物    |
| 品質レポート             | `outputs/phase-9/quality-report.md`                  | Phase 9 成果物    |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`            | Phase 10 成果物   |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物    |
| task-spec 正本           | `.claude/skills/task-specification-creator/SKILL.md` | Phase 12 判定基準 |
| system spec 正本         | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 更新対象基準      |

## 実行手順

1. Task 12-1: `implementation-guide.md` を Part 1/Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了タスク記録・LOGS.md（2ファイル）・topic-map.md を更新する。
3. Task 12-2 Step 1-B: W0-seq-02 実装状況を `pending` から `completed` へ更新する。
4. Task 12-2 Step 1-C: W2-seq-03a への利用可能通知を記録する。
5. Task 12-2 Step 2: `inferSmartDefaults` 新規 API を `system-spec-update-summary.md` に記録する。
6. Task 12-3: `documentation-changelog.md` を作成する。
7. Task 12-4: `outputs/phase-12/unassigned-task-detection.md` を作成する。
8. Task 12-5: `skill-feedback-report.md` を作成する。
9. Task 12-6: `outputs/phase-12/phase12-task-spec-compliance-check.md` を作成する。

## 成果物

| 成果物                   | パス                                                     | 説明                         |
| ------------------------ | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1/Part 2 構成           |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C/Step 2 記録 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴         |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0件でも作成）      |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0件でも作成）        |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6成果物の整合確認            |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 実装ガイドが Part 1/Part 2 で完成していること
- [ ] Task 12-2 Step 1-A/1-B/1-C が全て実施されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0件でも）
- [ ] Task 12-6 仕様準拠チェックが PASS であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様更新（Step 1-A/1-B/1-C/Step 2）
4. Task 12-3/12-4/12-5/12-6: changelog・未タスク・フィードバック・準拠チェック出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成
