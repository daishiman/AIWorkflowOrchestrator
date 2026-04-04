# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | fix-ipc-timeout-per-channel |
| 作成日 | 2026-04-01                  |

## 目的

実装完了後に、implementation guide / system spec update summary / documentation changelog / unassigned-task detection / skill feedback / compliance check を揃えて documentation wave を閉じる。

## 実行タスク

- Task 12-1: implementation guide を作成する
- Task 12-2: system spec update summary を作成する
- Task 12-3: documentation changelog を作成する
- Task 12-4: unassigned-task detection を作成する
- Task 12-5: skill feedback report を作成する
- Task 12-6: phase12 compliance check を作成する

## 参照資料

| 資料名                           | パス                                                                                   | 参照理由                       |
| -------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件                     | `phase-1-requirements.md`                                                              | acceptance / scope             |
| Phase 2 設計                     | `phase-2-design.md`                                                                    | current implementation summary |
| Phase 5 実装                     | `phase-5-implementation.md`                                                            | 実施した変更内容               |
| Phase 9 QA                       | `phase-9-quality-assurance.md`                                                         | validation results             |
| task-specification-creator guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 の正本         |
| spec update workflow             | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 の正本                |
| aiworkflow current facts         | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`         | current facts の更新先         |

## SubAgent 分担

| SubAgent | 担当範囲                                                                                                                                      | 実行形態           | 完了条件                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------- |
| A        | `implementation-guide.md`                                                                                                                     | 直列の起点         | Part 1 / Part 2 が揃う                  |
| B        | `system-spec-update-summary.md`                                                                                                               | A と並列可         | no-op / update の判断が明記される       |
| C        | `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` | A/B 完了後に並列可 | validator 実測値と current facts が揃う |
| D        | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                      | C 完了後に直列     | Task 12-1〜12-5 を 100% 確認            |

## 実行手順

### ステップ1: Task 12-1 implementation guide を作成する

1. Part 1 で中学生レベルの概念説明を書く
2. `たとえば` を必ず入れる
3. `ipc-utils.ts` は全チャンネルで同じタイムアウトを使っていたが、宅配便のように荷物の大きさ（処理時間）に応じて待ち時間を変える仕組みに変えた、という例えを使う
4. Part 2 で TypeScript 型定義・`getChannelTimeout` のシグネチャ・使用例・エラーハンドリング・エッジケース・設定可能パラメータを記載し、`current contract` と `target delta` を分けて書く

### ステップ2: Task 12-2 system spec update summary を作成する

1. `aiworkflow-requirements` の current facts に変更があるか判定する
2. IPC コントラクト（チャンネル名・引数型・戻り値型）の変更がないなら no-op を明記する
3. 変更があるなら対象ファイルと理由を列挙する

### ステップ3: Task 12-3〜12-5 を作成する

1. changelog に validator 実測値と current / baseline を記録する
2. unassigned detection は 0 件でも summary を残す
3. skill feedback は改善点がなくても「なし」と理由を書く

### ステップ4: Task 12-6 compliance check を作成する

1. Task 12-1〜12-5 が全て揃っていることを確認する
2. 事前予定文言が残っていないことを確認する
3. artifacts.json と outputs/artifacts.json の整合を確認する

## implementation guide のポイント

- Part 1 は「なぜ必要か」→「何をするか」の順に書く
- Part 1 は `getChannelTimeout` が登場する前に「チャンネル別タイムアウトが必要な理由」を説明する
- Part 2 は `CHANNEL_TIMEOUTS` / `getChannelTimeout` / `invokeWithTimeout` の修正を軸に説明する
- Part 2 は `current contract` と `target delta` を分離する

## system spec update summary のポイント

- IPC チャンネルの定義や型の変更がない場合は no-op
- `ipc-utils.ts` の export が `IPC_TIMEOUT_MS` + `invokeWithTimeout` + `getChannelTimeout`（新規追加）になったことを記録する

## 成果物

| 成果物                     | パス                                                     | 説明                                |
| -------------------------- | -------------------------------------------------------- | ----------------------------------- |
| implementation guide       | `outputs/phase-12/implementation-guide.md`               | 2 パート構成の実装ガイド            |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | current facts / no-op / update 判定 |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validator                |
| unassigned-task detection  | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも出力                        |
| skill feedback             | `outputs/phase-12/skill-feedback-report.md`              | 改善点または「なし」                |
| compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-5 の完了確認          |

## 完了条件

- [ ] 必須 6 成果物が揃っている
- [ ] implementation guide の Part 1 / Part 2 が揃っている
- [ ] current facts と baseline の区別が明確である
- [ ] 事前予定文言が 0 件である
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## サブタスク管理

1. implementation guide 作成
2. system spec update summary 作成
3. changelog / unassigned / feedback 作成
4. compliance check 作成

## タスク100%実行確認【必須】

- [ ] 本 Phase のタスクを 100% 実行完了
- [ ] artifacts.json と outputs/artifacts.json が整合している
- [ ] 次の Phase へ渡せる documentation wave になっている
