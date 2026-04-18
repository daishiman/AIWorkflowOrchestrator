# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                                |
| ------ | ------------------------------------------------- |
| Phase  | 12                                                |
| 機能名 | task-execute-async-snapshot-error-propagation-001 |
| 作成日 | 2026-04-18                                        |

## 目的

current facts と skill 準拠を両立させる close-out を行い、必須6成果物と parity を揃える。

## 参照資料

| 資料名            | パス                                                                           | 説明                                  |
| ----------------- | ------------------------------------------------------------------------------ | ------------------------------------- |
| Phase 2 成果物    | `outputs/phase-2/design-notes.md`                                              | 契約判断の引継ぎ                      |
| Phase 5 成果物    | `outputs/phase-5/implementation-notes.md`                                      | no-op / 実装修正有無                  |
| Phase 6 成果物    | `outputs/phase-6/test-expansion.md`                                            | テスト追加要否                        |
| Phase 7 成果物    | `outputs/phase-7/coverage-report.md`                                           | coverage 確認                         |
| Phase 8 成果物    | `outputs/phase-8/refactoring-notes.md`                                         | 重複説明整理結果                      |
| Phase 9 成果物    | `outputs/phase-9/quality-assurance-report.md`                                  | targeted test / typecheck / lint 証跡 |
| Phase 11 成果物   | `outputs/phase-11/manual-test-result.md`                                       | NON_VISUAL 証跡                       |
| 仕様 skill        | `.agents/skills/aiworkflow-requirements/SKILL.md`                              | 正本仕様の入口                        |
| workflow skill    | `.agents/skills/task-specification-creator/SKILL.md`                           | close-out 基準                        |
| completed ledger  | `.agents/skills/aiworkflow-requirements/references/task-workflow-completed.md` | carry-over 確認                       |
| backlog ledger    | `.agents/skills/aiworkflow-requirements/references/task-workflow-backlog.md`   | 更新要否確認                          |
| task-spec logs    | `.agents/skills/task-specification-creator/LOGS.md`                            | ログ更新先                            |
| requirements logs | `.agents/skills/aiworkflow-requirements/LOGS.md`                               | ログ更新先                            |

## 事前チェック【必須】

- P1: LOGS.md 2ファイル更新漏れ
- P2: topic-map.md 再生成忘れ
- P3: 未タスク管理の3ステップ不完全
- P4: 予定表現の残置
- P25: LOGS.md 2ファイル更新漏れの再発
- P27: topic-map.md 再生成判断ミス
- P29: SKILL.md 変更履歴更新漏れ

## 実行タスク

| Task      | 内容                       | 主成果物                                                 |
| --------- | -------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイド作成             | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec 更新判断と同期 | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出               | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバック       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12 準拠チェック      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成
- Task 12-2: system spec 更新判断と同期
- Task 12-3: ドキュメント更新履歴
- Task 12-4: 未タスク検出
- Task 12-5: スキルフィードバック
- Task 12-6: Phase 12 準拠チェック

## Task 12-1: 実装ガイド作成【必須】

### Part 1（中学生レベル）

- 「なぜ必要か」→「何をするか」の順で書く
- `たとえば` を使った日常例を入れる
- `## 視覚証跡` セクションに `UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する

### Part 2（技術者レベル）

- TypeScript の型定義または interface を含める
- API シグネチャを明記する
- TypeScript か bash の使用例を含める
- `### エラーハンドリング` / `### エッジケース` / `### 設定項目と定数一覧` / `### テスト構成` を必須とする
- `executeAsync()` の error / catch / success パスを区別して説明する
- `SkillCreatorWorkflowStateSnapshot` の変更要否判断を明記する
- `creatorHandlers.ts` relay と consumer 影響範囲を明記する
- 既存 completed task との carry-over を整理する

## Task 12-2: system spec 更新【必須】

### Step 1: 完了記録

- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する
- [ ] `task-workflow-completed.md` の最近の完了タスク index を更新する
- [ ] `task-workflow-completed-recent-2026-04*.md` の適切な recent bundle を更新する
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴更新要否を判断する
- [ ] `task-specification-creator/SKILL.md` の変更履歴更新要否を判断する
- [ ] `task-workflow-completed.md` / `task-workflow-backlog.md` の更新要否を判断する
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行し、`topic-map.md` / `keywords.json` を再生成する

### Step 1-B: 実装状況テーブル更新

- [ ] workflow root `index.md` のタスク全体ステータスを current facts に同期する
- [ ] Phase 1-12 を `completed`、Phase 13 を `blocked` に揃える
- [ ] `artifacts.json` と `outputs/artifacts.json` の phase status parity を completed / blocked で一致させる

### Step 1-C: 関連タスク・未タスク導線更新

- [ ] `docs/30-workflows/unassigned-task/TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001.md` の stale status を解消する
- [ ] 親タスク `TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001` の子タスク一覧を current facts に同期する
- [ ] 近縁完了タスク `TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001` の状態表記も completed に揃える

### Step 2: domain spec sync 判定

| 条件                                                | 判断              |
| --------------------------------------------------- | ----------------- |
| state 型が shared/public contract 変更に当たる      | 更新対象へ昇格    |
| callback 第3引数の既存契約で要件充足                | update 不要と明記 |
| runtime / IPC relay の current facts だけを確認した | update 不要と明記 |

## Task 12-3: ドキュメント更新履歴【必須】

- 予定表現を残さず、実施済み / no-op / blocked を区別して書く
- `outputs/artifacts.json` parity の判断を記録する

## Task 12-4: 未タスク検出【必須】

| ソース   | 確認項目                  |
| -------- | ------------------------- |
| Phase 3  | PENDING / MINOR 論点      |
| Phase 10 | FAIL / PENDING 論点       |
| Phase 11 | discovered issues         |
| コード   | TODO / FIXME / HACK / XXX |

- 0件でも `outputs/phase-12/unassigned-task-detection.md` を出力する
- 1件以上なら `docs/30-workflows/unassigned-task/` に formalize する

## Task 12-5: スキルフィードバック【必須】

- 改善点なしでも必ず `skill-feedback-report.md` を作成する
- `task-specification-creator` と `aiworkflow-requirements` の両方に対する提案を整理する

## Task 12-6: Phase 12 準拠チェック【必須】

- `phase-12-documentation.md` と `outputs/phase-12/*.md` の整合を確認する
- root `artifacts.json` と `outputs/artifacts.json` の status / artifacts parity を確認する
- Phase 13 が blocked のまま維持されていることを確認する

## 成果物

| 成果物                   | パス                                                     | 必須 |
| ------------------------ | -------------------------------------------------------- | ---- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | 必須 |
| system spec 更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | 必須 |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | 必須 |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | 必須 |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 必須 |
| Phase 12 準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 |

## 完了条件

- [ ] 実行タスクを表と箇条書きの両方で記載している
- [ ] 6成果物を全て定義している
- [ ] `NON_VISUAL` 視覚証跡ルールを実装ガイドに要求している
- [ ] system spec update の Step 1 / Step 2 を分けている
- [ ] `artifacts.json` / `outputs/artifacts.json` parity を確認対象に入れている
- [ ] `skill-feedback-report.md` を必須化している
- [ ] Phase 13 が blocked のままである

## 次Phase

→ [Phase 13: PR作成](phase-13-pr-creation.md)
