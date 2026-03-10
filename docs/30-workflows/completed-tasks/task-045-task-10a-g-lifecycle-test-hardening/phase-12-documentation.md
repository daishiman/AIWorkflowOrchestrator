# Phase 12: ドキュメント - スキルライフサイクル統合テスト強化

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 12 - ドキュメント                   |
| 機能名     | task-10a-g-lifecycle-test-hardening |
| タスクID   | TASK-10A-G                          |
| 作成日     | 2026-03-10                          |
| 前Phase    | Phase 11 - 手動テスト               |
| ステータス | completed                           |

## 目的

実装ガイド・システム仕様更新・未タスク検出を実施する。Phase 12 は漏れが最も発生しやすい Phase のため、全チェックリストを逐次確認する。

## 実行タスク

- Task 1: `outputs/phase-12/implementation-guide.md` を Part 1/2 構成で作成する
- Task 2: Step 1-A〜Step 2 に従って system spec を同期する
- Task 3: `outputs/phase-12/spec-update-summary.md` と `outputs/phase-12/documentation-changelog.md` を実績ベースで記録する
- Task 4: `outputs/phase-12/unassigned-task-detection.md` を 0件でも出力する
- Task 5: `outputs/phase-12/skill-feedback-report.md` を改善有無にかかわらず作成する

## 成果物

| 成果物               | パス                                            | 必須 | 用途                               |
| -------------------- | ----------------------------------------------- | ---- | ---------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | Part 1/2 構成の実装ガイド          |
| 仕様更新サマリー     | `outputs/phase-12/spec-update-summary.md`       | ✅   | Step 1-A〜Step 2 の更新結果要約    |
| ドキュメント変更記録 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新ファイルと各Stepの詳細記録     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 0件でも必須の未タスク検出結果      |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`     | ✅   | スキル改善提案または改善不要の記録 |

### Task 1: 実装ガイド

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 中学生レベル概念説明

以下の概念を日常的な例えを用いて説明する。

| 概念                      | 日常の例え                       | 説明内容                                                                             |
| ------------------------- | -------------------------------- | ------------------------------------------------------------------------------------ |
| テストの品質ゲート        | 工場の品質検査ライン             | 製品（コード）が各工程で検査を通過しないと次に進めない仕組み                         |
| 3層テスト構造（G1/G2/G3） | レンガの検査→壁の検査→建物の検査 | G1: 部品レベル（IPC契約）、G2: 組み立てレベル（Store連携）、G3: 完成品レベル（統合） |
| 障害切り分け              | 車の故障診断                     | エンジン・タイヤ・ブレーキのどこが壊れたかを特定する手順                             |
| IPC契約テスト             | 郵便の書式チェック               | 封筒の宛先・差出人・切手が正しくないと配達されない                                   |

#### Part 2: 開発者向け実装詳細

以下の項目を記載する。

1. **G1/G2/G3 テストの実行方法**
   - 各グループの個別実行コマンド
   - 全体一括実行コマンド
   - カバレッジ付き実行コマンド

2. **障害切り分け手順**
   - Phase 11 Task 3 の障害切り分け表を参照
   - 各失敗パターンでの確認ファイルと修正アプローチ

3. **テスト追加時のガイドライン**
   - 新しいIPCハンドラ追加時のG1テスト追加手順
   - 新しいライフサイクル遷移追加時のG2テスト追加手順
   - 既存テスト整合確認のG3テスト更新手順

### Task 2: システム仕様書更新（task-specification-creator `spec-update-workflow.md` 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当仕様書にタスク完了記録を追加
- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` 更新
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新（**2ファイル両方** - P1/P25対策）
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新

> **P1/P25対策**: LOGS.md は2箇所あり片方の更新忘れが発生しやすい。必ず両方を更新すること。

#### Step 1-B: 実装状況テーブル

- [ ] `ui-ux-feature-components.md` / `interfaces-agent-sdk-ui.md` / `interfaces-agent-sdk-skill.md` の実装ステータス更新（該当する場合）
- [ ] `testing-component-patterns.md` / `architecture-implementation-patterns.md` のテスト戦略・パターン更新（該当する場合）

#### Step 1-C: 関連タスクテーブル

- [ ] `rg -n "TASK-10A-G|skill:create|ChatPanel|SkillAnalysisView|SkillCreateWizard" .claude/skills/aiworkflow-requirements/references` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成（P2/P27対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して `indexes/topic-map.md` を再生成
- [ ] 実行ログで `indexes/` ディレクトリに変更があることを確認

> **P2/P27対策**: セクションの追加だけでなく、削除・更新も再生成トリガーに含める。仕様書に変更があれば必ず再生成を実行する。

#### Step 2: システム仕様更新

- [ ] `ui-ux-feature-components.md` に G2/G3 が依存する画面責務・遷移契約の変更を同期する（該当する場合）
- [ ] `interfaces-agent-sdk-ui.md` に ChatPanel 統合境界の変更を同期する（該当する場合）
- [ ] `interfaces-agent-sdk-skill.md` に `createSkill` / ChatPanel / SkillManagementPanel 契約差分を同期する（該当する場合）
- [ ] `testing-component-patterns.md` に G1/G2/G3 テスト構造を追加（該当する場合）
- [ ] `architecture-implementation-patterns.md` にテストパターンを追加（該当する場合）
- [ ] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` / `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` に TASK-10A-G の完了記録・苦戦箇所・再利用手順を同期する

> **P26対策**: 仕様書の「PRマージ後に更新」は禁止。Phase 12完了時点で更新する。

#### Step 3: IPC契約検証（該当する場合）

- [ ] `skill:create` の引数・戻り値型が正本仕様と一致していることを確認
- [ ] テストで使用しているモックの型がハンドラ実装と一致していることを確認

### Task 3: spec-update-summary.md / documentation-changelog.md

成果物:

- `outputs/phase-12/spec-update-summary.md`
- `outputs/phase-12/documentation-changelog.md`

- [ ] `spec-update-summary.md` を作成し、Step 1-A〜Step 2 の更新結果/更新不要判定/対象仕様を要約する
- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録

> **P4/P51対策**: 全 Step 確認前に「完了」と記載しない。各 Step は実行後に「事後記録」する。サブエージェント完了後は `git diff --stat -- .claude/skills/` で実際の変更ファイル数を検証する。

### Task 4: 未タスク検出

成果物: `outputs/phase-12/unassigned-task-detection.md`

- [ ] `outputs/phase-12/unassigned-task-detection.md` 作成（**0件でも必須**）
- [ ] 検出した未タスクは3ステップ全完了（P3/P38対策）:
  1. `unassigned-task/` に指示書作成（**tasks/ 直下ではない** - P38対策）
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータス更新
- [x] `artifacts.json` の Phase 12 ステータスを更新
- [ ] 再評価クローズした未タスクの GitHub Issue を更新する必要がある場合は、**ユーザーの明示指示があるときのみ** 実施する

> **P3/P38対策**: 未タスクの指示書は必ず `unassigned-task/` 配下に配置する。`tasks/` 直下に配置してはならない。

### Task 5: スキルフィードバック

成果物: `outputs/phase-12/skill-feedback-report.md`

- [ ] `skill-feedback-report.md` を作成する（改善点なしでも必須）
- [ ] 改善点がない場合も「改善点なし」の理由を記録する
- [ ] 今回の task spec / requirements skill から次回再利用できる改善点を抽出する

## 統合テスト連携

| #    | 確認項目                                                     | 確認方法         | 期待結果                                     |
| ---- | ------------------------------------------------------------ | ---------------- | -------------------------------------------- |
| DC-1 | implementation-guide がG1/G2/G3の3層構造を正確に説明している | 目視確認         | 各層の役割・実行コマンド・障害切り分けが記載 |
| DC-2 | documentation-changelog が全Step の実行結果を記録している    | Step数カウント   | Step 1-A〜Step 3 + Task 3〜4 の全項目        |
| DC-3 | unassigned-task-detection が作成されている                   | ファイル存在確認 | 0件の場合も「未検出タスク: 0件」と記載       |
| DC-4 | skill-feedback-report が作成されている                       | ファイル存在確認 | 改善なしでも出力されている                   |

## サブタスク管理

Phase 12 の各 Task をサブエージェントに委譲する場合の制約。

| 制約                       | 理由                     | 対策                                     |
| -------------------------- | ------------------------ | ---------------------------------------- |
| 3ファイル以下/エージェント | P43: rate limit 中断防止 | Task 2 の仕様書更新は3ファイル以下に分割 |
| LOGS.md は最終ステップ     | P43: 中断後の検出困難    | 全ファイル更新後に LOGS.md 記録          |
| 事後記録のみ               | P4/P51: 早期完了記載禁止 | 実行完了を確認してから記録               |

## 参照資料

| 参照資料                     | パス                                                                              | 使用目的                       |
| ---------------------------- | --------------------------------------------------------------------------------- | ------------------------------ |
| 仕様更新ワークフロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`    | Step 1-2 手順                  |
| タスク運用台帳               | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | 未タスク管理                   |
| 教訓                         | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | Step 1-A〜2 の再発防止         |
| UI機能別実装記録             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | 画面責務・状態遷移の同期先確認 |
| UI統合インターフェース       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`    | ChatPanel 統合境界の同期先確認 |
| Skillインターフェース        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | `createSkill` 契約の同期先確認 |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | ドキュメント品質               |
| Phase 11 手動テスト          | `phase-11-manual-test.md`                                                         | テスト結果の参照               |
| Phase 2 設計検証             | `outputs/phase-2/design-verification.md`                                          | 仕様同期の設計根拠             |
| Phase 5 Green レポート       | `outputs/phase-5/g1-g2-g3-green-report.md`                                        | 実装済み前提の固定             |
| Phase 6 カバレッジレポート   | `outputs/phase-6/coverage-report.md`                                              | 補強テストの到達範囲           |
| Phase 7 最終カバレッジ       | `outputs/phase-7/coverage-final-report.md`                                        | coverage 総括                  |
| Phase 8 refactoring レポート | `outputs/phase-8/refactoring-report.md`                                           | 文書化対象の構造変更確認       |
| Phase 9 品質検証レポート     | `outputs/phase-9/quality-verification-report.md`                                  | quality gate 総括              |
| Phase 10 最終レビュー        | `outputs/phase-10/final-review-report.md`                                         | Phase 12 着手可否の根拠        |

## 落とし穴対策（Phase 12 固有）

| Pitfall | 対策                                                                          |
| ------- | ----------------------------------------------------------------------------- |
| P1/P25  | LOGS.md 2ファイル更新（aiworkflow-requirements + task-specification-creator） |
| P2/P27  | topic-map.md 再生成（セクション追加/削除/変更を全てトリガーに）               |
| P3/P38  | 未タスク管理3ステップ + `unassigned-task/` 配下に配置                         |
| P4/P51  | documentation-changelog への早期「完了」記載禁止。事後記録のみ                |
| P26     | システム仕様書はPhase 12完了時点で更新。PRマージを待たない                    |
| P29     | SKILL.md 変更履歴の更新漏れ防止                                               |
| P43     | サブエージェントは3ファイル以下/エージェントに分割                            |
| P56     | GitHub Issue 更新が必要でも、ユーザー明示指示なしに外部更新しない             |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1（中学生レベル概念説明）が作成されている
- [ ] Task 1: 実装ガイド Part 2（開発者向け実装詳細）が作成されている
- [ ] Task 2: Step 1-A（タスク完了記録）の全5項目が確認されている
- [ ] Task 2: Step 1-B（実装状況テーブル）が確認されている
- [ ] Task 2: Step 1-C（関連タスクテーブル）が確認されている
- [ ] Task 2: Step 1-D（topic-map.md 再生成）が確認されている
- [ ] Task 2: Step 2（システム仕様更新）が確認されている
- [ ] Task 2: Step 3（IPC契約検証）が確認されている
- [ ] Task 3: spec-update-summary.md と documentation-changelog.md が作成されている
- [ ] Task 4: `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも）
- [ ] Task 5: skill-feedback-report.md が作成されている
- [ ] 本 Phase 内の全タスク（Task 1〜Task 5）を100%実行完了

## 次Phase

Phase 13: PR作成（`phase-13-pr-creation.md`）
