# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| Phase      | 12                                                |
| 機能名     | UT-IPC-HANDLER-CI-001                             |
| タスク名   | ipcMain.handle() の重複・欠損を CI で自動検出する |
| 前提Phase  | Phase 11                                          |
| 後続Phase  | Phase 13                                          |
| 作成日     | 2026-04-18                                        |
| ステータス | pending                                           |

## 目的

実装内容をドキュメント化し、`task-specification-creator` と `aiworkflow-requirements` の両 skill に対して説明責任が立つ状態へ同期する。単なる差分サマリーではなく、Step 1 完了記録、Step 2 要否判断、未タスク formalize、feedback、準拠チェックまで完了させる。

## 中学生レベル解説

たとえば、学校の持ち物チェック表を毎朝見直すと、「ノートを 2 冊入れた」「定規を入れ忘れた」にすぐ気づけます。今回のスナップショットテストも同じで、登録する IPC チャンネルの一覧を基準として残し、あとから増減や重複が起きたときに自動で見つけるために必要です。

## docs-only / NON_VISUAL 前提

- 本タスクは UI/UX 変更を伴わない `NON_VISUAL` タスクとして扱う
- Phase 11 の一次証跡は `docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-11/manual-test-result.md`
- `implementation-guide.md` には `## 視覚証跡` セクションを必ず設け、`UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する
- `ui-sanity-visual-review.md` は N/A 記録として扱い、環境要因と製品要因を分離して残す

## 実行タスク

| Task      | 内容                                         | 主成果物                                                 |
| --------- | -------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成                               | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec 更新と Step 1/2 記録             | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴と artifacts parity 記録 | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出と formalize                     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | 2 skill 向けフィードバック記録               | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Task 12-1〜12-5 の準拠チェック               | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成
- Task 12-2: system spec 更新と Step 1/2 記録
- Task 12-3: ドキュメント更新履歴と artifacts parity 記録
- Task 12-4: 未タスク検出と formalize
- Task 12-5: 2 skill 向けフィードバック記録
- Task 12-6: Task 12-1〜12-5 の準拠チェック

## Task 12-1: 実装ガイド作成【必須】

`outputs/phase-12/implementation-guide.md` は 2 パート構成とする。

| パート | 対象読者             | 必須内容                                                                           |
| ------ | -------------------- | ---------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | なぜ必要か → 何をするか の順で説明し、日常の例えを含める                           |
| Part 2 | 開発者・技術者       | 型定義、API シグネチャ、使用例、エラーハンドリング、設定値一覧、更新判断を記録する |

Part 2 では最低限以下を含める。

- チャンネル収集・重複検出の型定義
- `pnpm --filter @repo/desktop test`
- `pnpm --filter @repo/desktop test -- --updateSnapshot`
- スナップショット更新が許可される条件 / 禁止される条件
- テスト失敗時の対処手順
- `## 視覚証跡` セクション
  - `UI/UX変更なしのため Phase 11 スクリーンショット不要`
  - 代替証跡: `manual-test-result.md`, `ui-sanity-visual-review.md`, CI ログ

## Task 12-2: system spec 更新【必須】

`outputs/phase-12/system-spec-update-summary.md` に Step 1 と Step 2 を分けて記録する。

### Step 1: 完了記録【全タスク必須】

- Step 1-A: 完了タスク記録、関連リンク、変更履歴、`LOGS.md` x2 更新、`topic-map.md` / `keywords.json` 更新有無を記録する
- Step 1-B: 実装状況テーブル更新要否を記録する
- Step 1-C: 関連タスク・未タスク候補テーブル更新要否を記録する
- Step 1-D: `topic-map.md` / `keywords.json` 再生成結果を記録する
- Step 1-E: `resource-map.md` 更新要否を記録する
- Step 1-F: baseline / current の差分説明を記録する
- Step 1-G: validator 実行結果を記録する

### Step 2: domain spec sync【条件付き】

今回のタスクは test / CI ガード中心であり、API / IPC 契約自体を増やさない想定である。したがって Step 2 は原則 `no-op` 判定になり得るが、以下を必ず記録する。

- 更新不要と判断した根拠
- `topic-map.md` / `keywords.json` の更新は Step 1-D の一部であり、Step 2 完了を意味しないこと
- `resource-map.md` が不要な場合の理由

### 計画系文言の禁止

`仕様策定のみ` / `実行予定` / `保留として記録` の文言を残さない。Task 12-6 で残存確認する。

## Task 12-3: 更新履歴作成【必須】

`outputs/phase-12/documentation-changelog.md` に以下を記録する。

- 変更ファイル一覧
- current / baseline 比較
- validator 実行結果
- `artifacts.json` と `outputs/artifacts.json` の parity 確認方法
- Step 2 を no-op とした場合の判断根拠

## Task 12-4: 未タスク検出【必須】

`outputs/phase-12/unassigned-task-detection.md` に検出結果をまとめ、必要な場合は `docs/30-workflows/unassigned-task/` に指示書を作成する。

検出対象:

- 他の `register*Handlers()` 関数へのスナップショットテスト拡張
  - 例: `registerSkillHandlers()`, `registerLLMHandlers()`
- `ipcMain.handle()` 以外の IPC 登録方式への対応
- 既存の register 関数に対するカバレッジ確認
- Phase 10 / 11 で Note または Blocker となった項目

未タスクが 0 件でも、その旨を明記する。

## Task 12-5: スキルフィードバックレポート【必須】

`outputs/phase-12/skill-feedback-report.md` では `task-specification-creator` と `aiworkflow-requirements` の両方を対象にする。

- 良かった点
- 改善が必要な点
- 新規 Pitfall 候補
- 今後のスキル改善提案

改善点がなくても「改善点なし」と明記する。

## Task 12-6: 準拠チェック【必須】

`outputs/phase-12/phase12-task-spec-compliance-check.md` に、Task 12-1〜12-5 の完了確認、計画系文言の残存確認、validator 実行結果、未タスク配置先確認を記録する。

## 参照資料

- `outputs/phase-11/` — Phase 11 成果物（手動テスト結果、視覚証跡 N/A 記録）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

## 実行手順

1. Phase 11 の一次証跡を確認し、`NON_VISUAL` 方針を固定する。
2. 実装ガイドを 2 パート構成で作成する。
3. Step 1-A〜1-G を整理し、Step 2 の要否を判断する。
4. changelog、未タスク検出、スキルフィードバックを作成する。
5. Task 12-6 で Phase 12 全体の準拠チェックを行う。
6. 成果物を `outputs/phase-12/` に保存し、完了条件を判定する。

## 成果物

`outputs/phase-12/` 配下に以下のファイルを作成する:

| ファイル名                              | 内容                            |
| --------------------------------------- | ------------------------------- |
| `implementation-guide.md`               | 実装ガイド・運用手順            |
| `system-spec-update-summary.md`         | system spec 更新サマリー        |
| `documentation-changelog.md`            | 更新履歴                        |
| `unassigned-task-detection.md`          | 未タスク検出（0件でも出力必須） |
| `skill-feedback-report.md`              | 2 skill 向けフィードバック      |
| `phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の準拠チェック  |

## 統合テスト連携

- `manual-test-result.md` を Phase 12 の一次証跡として扱う。
- `ui-sanity-visual-review.md` は `NON_VISUAL` の N/A 記録として参照し、スクリーンショット不要判断の根拠に使う。
- validator / audit 結果は `documentation-changelog.md` と `phase12-task-spec-compliance-check.md` の両方で参照可能にする。

## 多角的チェック観点

| 観点     | 確認内容                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| 矛盾     | Step 1 / Step 2 の判断と changelog、feedback、未タスクの結論が食い違っていないか確認する                           |
| 漏れ     | Task 12-1〜12-6、`LOGS.md` x2、topic-map / keywords、unassigned formalize、feedback が全て記録されているか確認する |
| 整合性   | 成果物名、validator 名、`NON_VISUAL` 判定、current / baseline の語彙が統一されているか確認する                     |
| 依存関係 | aiworkflow-requirements 側の更新要否判断と workflow 側の成果物参照が矛盾なく接続しているか確認する                 |

## 完了条件

- [ ] `implementation-guide.md` が Part 1 / Part 2 の 2 パート構成になっている
- [ ] `implementation-guide.md` に `## 視覚証跡` セクションがあり、`NON_VISUAL` の N/A 理由と代替証跡が記録されている
- [ ] `system-spec-update-summary.md` に Step 1-A〜1-G と Step 2 の判断結果が記録されている
- [ ] `topic-map.md` / `keywords.json` 更新は Step 1-D の一部であり、完了条件そのものではないと明記されている
- [ ] `documentation-changelog.md` に current / baseline と validator 結果が記録されている
- [ ] `unassigned-task-detection.md` が 0 件でも出力され、必要時は `docs/30-workflows/unassigned-task/` への配置方針が記録されている
- [ ] `skill-feedback-report.md` が `task-specification-creator` と `aiworkflow-requirements` の両方を対象にしている
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] 計画系文言の残存確認方法が定義されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity 確認方法が記録されている

## サブタスク管理

1. Phase 11 成果物の確認
2. 実装ガイド作成
3. Step 1 / Step 2 記録
4. changelog 作成
5. 未タスク検出
6. フィードバック記録
7. 準拠チェック
8. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-IPC-HANDLER-CI-001
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/UT-IPC-HANDLER-CI-001/outputs/phase-12/unassigned-task-detection.md
```

## 次のPhase

Phase 13: PR 作成
