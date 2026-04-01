# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 12                                         |
| 機能名 | auth:login IPCハンドラーの非ブロッキング化 |
| 作成日 | 2026-04-01                                 |

## 目的

実装内容を canonical 仕様へ同期し、`auth:login` の 500ms 制約と `AUTH_STATE_CHANGED` の責務分離を workflow / lessons / task ledger に残す。

## 実行タスク

- implementation-guide.md を作成し、500ms 制約と fire-and-forget の理由を整理する
- system-spec-update-summary.md を作成し、current / baseline と no-op / update の判定を分けて記録する
- documentation-changelog.md を作成し、変更した canonical file を 1 行ずつ記録する
- unassigned-task-detection.md を作成し、0件でも current gap を記録する
- skill-feedback-report.md を作成し、改善点がなくても評価を残す
- phase12-task-spec-compliance-check.md を作成し、6 成果物と artifacts 同期を確認する

## ドキュメント更新対象

### 1. implementation-guide.md への追記

- Part 1 は「なぜ必要か」→「何をするか」の順で説明する
- 例え話を 1 つ入れる
- Part 2 では `auth:login` の public contract、`AUTH_STATE_CHANGED` の state ownership、`500ms` timeout 前提を整理する
- `preload` が変わらないことも明記する
- `spec_created` workflow なので、Part 2 は `current contract` と `target delta` を分けて書く

### 2. system-spec-update-summary.md への追記

`system-spec-update-summary.md` では Step 2 の判定を必ず残す。

| 観点            | 判定     | 同期先                                                                                 |
| --------------- | -------- | -------------------------------------------------------------------------------------- |
| public IPC      | 更新あり | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                    |
| preload         | 変更なし | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`  |
| state semantics | 更新あり | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security-core.md` |
| lessons-learned | 更新あり | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`         |
| task-workflow   | 更新あり | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   |
| topic-map       | 更新あり | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                          |

**Step 2 判定**: 必要

- `auth:login` の応答タイミングと completion semantics は public contract なので、API 記述へ同期する
- `preload` surface と response 型は変えない
- 「更新あり / 変更なし」を同じファイル内で明示する

### 3. documentation-changelog.md への追記

- 変更した file 一覧
- それぞれの変更結果（updated / no-op）
- current / baseline の区別
- `preload` が no-op である理由
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` への完了記録
- `topic-map.md` 再生成の有無

### 4. unassigned-task-detection.md への追記

- 0件でも出力する
- current と baseline を分ける
- 今回の current gap がない項目は formalize しない

今回の扱い方:

| 候補                                   | 扱い                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `IPC_TIMEOUT_MS` 見直し                | formalize しない。`auth:login` は channel-specific 500ms を使うため、この task の gap ではない |
| 他の auth IPC handler の blocking 調査 | この task の current gap ではない。別 task として evidence が揃った時だけ formalize する       |

### 5. skill-feedback-report.md への追記

- 改善点があれば next action を書く
- 改善点がなくても「なし」と理由を書く
- fire-and-forget と event ownership の分離を学びとして残す
- Phase 11 は `NON_VISUAL` として扱うことを記録する
- Step 2 の有無を skill への改善提案として残す

### 6. phase12-task-spec-compliance-check.md の作成

このファイルは最終 gate であり、以下を確認する。

- Task 12-1 〜 12-5 が全て完了していること
- documentation-changelog.md に future wording が残っていないこと
- system-spec-update-summary.md に Step 2 判定が残っていること
- preload no-op の理由が残っていること
- phase-11-manual-test.md が `NON_VISUAL` として扱われていること
- `artifacts.json` と `outputs/artifacts.json` が一致していること

## 概念解説（中学生レベル）

### IPC と fire-and-forget とは？

**IPC (Inter-Process Communication)** とは、アプリの中の別々の場所がメッセージをやり取りする仕組みです。

**fire-and-forget** とは、処理を始めたら返事を待たずに次へ進むやり方です。

たとえば、受付で番号札をもらったら、受付係は「準備開始しました」とすぐ伝えて、裏で作業を続けます。
作業が終わったかどうかは、別の案内板で知らせます。

このタスクでは:

- `auth:login` は「開始しました」をすぐ返す
- 完了や失敗は `AUTH_STATE_CHANGED` で別に知らせる
- 受付係（handler）は結果の通知を二重に送らない

## 参照資料

| 資料名                          | パス                                                                                   | 説明                  |
| ------------------------------- | -------------------------------------------------------------------------------------- | --------------------- |
| 設計書                          | `./phase-2-design.md`                                                                  | fire-and-forget 設計  |
| 実装                            | `./phase-5-implementation.md`                                                          | handler 側の修正内容  |
| 手動テスト                      | `./phase-11-manual-test.md`                                                            | NON_VISUAL 手動確認   |
| 品質保証                        | `./phase-9-quality-assurance.md`                                                       | 既存テストの回帰確認  |
| task-workflow                   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                   | 完了記録の正本        |
| lessons-learned-current         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`         | current lesson の正本 |
| api-ipc-auth                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`                    | public IPC contract   |
| architecture-auth-security-core | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security-core.md` | state ownership       |
| security-electron-ipc-advanced  | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`  | IPC security boundary |

## SubAgent 分担

| SubAgent | 担当範囲                                                                                                                                      | 実行形態           | 完了条件                                |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | --------------------------------------- |
| A        | `outputs/phase-12/implementation-guide.md`                                                                                                    | 先行               | Part 1 / Part 2 が揃う                  |
| B        | `outputs/phase-12/system-spec-update-summary.md`                                                                                              | A と並列可         | current / baseline と Step 2 判定が揃う |
| C        | `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` | A/B 完了後に並列可 | 変更履歴と 0件記録が揃う                |
| D        | `outputs/phase-12/phase12-task-spec-compliance-check.md`                                                                                      | C 完了後に直列     | 6 成果物と artifacts 同期が揃う         |

## 統合テスト連携

コード変更なし。Phase 11 の手動テスト結果を、Phase 12 の current facts として反映する。

## 多角的チェック観点

| 観点                  | 判断     | 確認内容                                                               |
| --------------------- | -------- | ---------------------------------------------------------------------- |
| current/baseline 分離 | **必須** | 更新あり / なしを同じファイル内で分けて書く                            |
| canonical sync        | **必須** | task-workflow / lessons / api / architecture / security の正本を揃える |
| artifacts parity      | **必須** | `artifacts.json` と `outputs/artifacts.json` が一致する                |

## システム仕様同期チェックリスト

- [ ] `implementation-guide.md` が Part 1 / Part 2 で完成している
- [ ] `system-spec-update-summary.md` に Step 2 判定と no-op / update が書かれている
- [ ] `documentation-changelog.md` に変更ファイル一覧と current / baseline の区別がある
- [ ] `outputs/phase-12/unassigned-task-detection.md` が 0件でも出力されている
- [ ] `skill-feedback-report.md` が改善点なしでも作成されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されている
- [ ] `artifacts.json` と `outputs/artifacts.json` が同期されている

## 成果物

| 成果物                       | パス                                                     | 説明                                       |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 の 2 パート構成            |
| 仕様同期サマリー             | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 判定と同期先一覧           |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル一覧と current / baseline 記録 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                            |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                     |
| 準拠チェック                 | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 最終 gate / PASS 条件                      |

## 完了条件

- [ ] `implementation-guide.md` の Part 1 / Part 2 が定義されている
- [ ] `system-spec-update-summary.md` に Step 2 判定が定義されている
- [ ] `documentation-changelog.md` の記載ルールが定義されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` の current / baseline 分離が定義されている
- [ ] `skill-feedback-report.md` の記載ルールが定義されている
- [ ] `outputs/phase-12/phase12-task-spec-compliance-check.md` が最終 gate として定義されている
- [ ] `AUTH_STATE_CHANGED` の責務が orchestrator に残ることが明記されている
- [ ] `preload` が no-op であることが明記されている
- [ ] **本Phase内の全タスクを100%実行完了**
