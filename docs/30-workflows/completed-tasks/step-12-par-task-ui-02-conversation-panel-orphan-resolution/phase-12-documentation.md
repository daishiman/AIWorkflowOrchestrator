# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 12                                    |
| Phase名    | ドキュメント更新                      |
| 対象機能   | TASK-UI-02 ConversationPanel 孤立解消 |
| 前提Phase  | Phase 11: 手動テスト                  |
| 次Phase    | Phase 13: PR作成                      |
| ステータス | pending                               |
| 作成日     | 2026-04-06                            |
| 更新日     | 2026-04-06                            |

## 目的

task-specification-creator の Phase 12 必須成果物を canonical filename で揃え、ConversationPanel 孤立解消の実装ガイド・仕様更新サマリー・更新履歴・未タスク検出・スキルフィードバック・準拠チェックを順序立てて作成する。

## 実行タスク

### Task 12-1: 実装ガイド

`implementation-guide.md` に Part 1 / Part 2 を作成する。

- **Part 1: 中学生レベルの概念説明**
  - 「2 つの同じような画面があって、片方は使えない状態だった」問題を平易に説明する
  - たとえば、学校に 2 つの図書室があって、1 つは鍵がかかっていて誰も入れない状態と同じ。鍵のかかった図書室にも良い本がたくさんあるのに、誰も読めない。この問題を解決するために、2 つの図書室を 1 つにまとめるか、鍵のかかった図書室にも入口を作って使えるようにした
  - なぜ「使えない画面」を放置すると問題なのかを説明する（メンテナンスコスト、混乱の原因）
  - `たとえば` を最低 1 回含めること（validator 安定化ルール準拠）

- **Part 2: 技術詳細**
  - 統合/ルート追加の具体的な変更内容
  - IPC 経路の選択理由と使い分けルール
  - 共有コンポーネントの配置と利用方法
  - クリーンアップした孤立参照の一覧

### Task 12-2: システム仕様更新サマリー

`system-spec-update-summary.md` に Phase 12 Task 2 の更新要否と同値転記をまとめる。

- 統合後のコンポーネント関係図を作成する（Mermaid 形式）
- IPC 経路のデータフロー図を作成する
- ルーティング構造の変更を図示する
- 既存ドキュメントの更新要否を明記する

### Task 12-3: ドキュメント更新履歴

`documentation-changelog.md` に今回の変更ファイルと更新判断を記録する。

- 変更ファイルの一覧を記録する
- 更新不要の判断がある場合は理由を記録する
- 同値転記した値を `system-spec-update-summary.md` と一致させる

### Task 12-4: 未タスク検出

`unassigned-task-detection.md` に残課題の有無を記録する。

- 未タスク件数が 0 件でも summary を残す
- 検出観点と確認結果を明記する
- 必要に応じて `docs/30-workflows/unassigned-task/` への移動有無を記録する

### Task 12-5: スキルフィードバック

`skill-feedback-report.md` に今回の気づきと改善提案を記録する。

- workflow / template / script の改善提案を記録する
- 改善点がない場合でも「改善点なし」を明記する
- 次回の Phase 12 で再発しやすい漏れを優先して記録する

### Task 12-6: 仕様準拠チェック

`phase12-task-spec-compliance-check.md` に 30種の思考法を含む準拠確認を集約する。

- Task 12-1〜12-5 の出力存在を確認する
- Step 1-A〜1-G / Step 2 の整合を確認する
- 30種の思考法をカテゴリ別に点検し、PASS / FAIL を記録する

## 参照資料

| 資料名               | パス                                       | 説明             |
| -------------------- | ------------------------------------------ | ---------------- |
| 設計書               | `outputs/phase-2/design-document.md`       | 変更の根拠       |
| 実装記録             | `outputs/phase-5/implementation-record.md` | 具体的な変更内容 |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`   | evidence         |
| リファクタリング記録 | `outputs/phase-8/refactoring-log.md`       | 整理内容         |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                                                  | 内容                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| UI/UX ナビゲーション契約  | `.agents/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                               | ルーティング・ナビゲーション設計の正本             |
| Skill Creator Service仕様 | `.agents/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`           | SkillCreatorService、IPC パターンの仕様            |
| IPC契約チェックリスト     | `.agents/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                         | IPC修正時の Main/Preload/型定義 同時更新チェック   |
| スキル実行IPCセキュリティ | `.agents/skills/aiworkflow-requirements/references/security-skill-ipc-core.md`                        | パストラバーサル防止、コマンドインジェクション防止 |
| テスト標準化              | `.agents/skills/aiworkflow-requirements/references/lessons-learned-skill-lifecycle-test-hardening.md` | コンポーネントテストの標準化                       |

## 成果物

| 成果物               | パス                                                     | 説明                                      |
| -------------------- | -------------------------------------------------------- | ----------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1 中学生レベル説明 + Part 2 技術詳細 |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | 同値転記と更新要否                        |
| 更新履歴             | `outputs/phase-12/documentation-changelog.md`            | 変更ファイルと更新判断                    |
| 未タスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも必須の検出結果                    |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 改善提案と学び                            |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 30種の思考法を含む root evidence          |

## 完了条件

- [ ] 実装ガイド Part 1（中学生レベル概念説明）が作成されている
- [ ] 実装ガイド Part 2（技術詳細）が作成されている
- [ ] `たとえば` が最低 1 回含まれている
- [ ] `system-spec-update-summary.md` が作成されている
- [ ] `documentation-changelog.md` が作成されている
- [ ] `unassigned-task-detection.md` が作成されている
- [ ] `skill-feedback-report.md` が作成されている
- [ ] `phase12-task-spec-compliance-check.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 13: PR作成](./phase-13-pr-creation.md)
