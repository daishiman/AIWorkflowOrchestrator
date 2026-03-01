# Phase 12: ドキュメント更新 — IPCハンドラ単位カバレッジ測定基盤構築

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 12（ドキュメント更新）                                                 |
| タスクID   | UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001                               |
| 機能名     | ut-imp-ipc-handler-coverage-granular-001                               |
| 前提Phase  | Phase 11                                                               |
| 後続Phase  | Phase 13                                                               |
| ステータス | 完了（2026-02-28）                                                     |
| Issue      | [#854](https://github.com/daishiman/AIWorkflowOrchestrator/issues/854) |
| 作成日     | 2026-02-28                                                             |

## 目的

Phase 12 必須5タスク（実装ガイド、仕様更新、更新履歴、未タスク検出、スキル改善）を完了し、実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 背景

Phase 11までの全成果を文書化し、システム仕様との整合を確定する最終文書化工程。必須5タスク（実装ガイド/仕様更新/更新履歴/未タスク検出/スキル改善）を全て完了する。Phase 12は漏れが最も発生しやすいPhaseであり、チェックリストの逐次確認が必須。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する。
2. 特に以下の再発ポイントをチェックする。
   - P1 / P25: `LOGS.md` 2ファイル更新漏れ
   - P2 / P27: `topic-map.md` 再生成漏れ
   - P3: 未タスク管理3ステップ（指示書/台帳登録/関連仕様登録）の未完了
   - P4: 全Step完了前の早期「完了」記載
   - P28: `skill-feedback-report.md` 未作成
   - P43: サブエージェントのrate limit中断（仕様書更新は3ファイル以下/エージェントに分割する）

## 実行タスク

- SubAgent-A（Task 1）: `implementation-guide.md`をPart 1（中学生向け）/Part 2（技術者向け）で作成する。
- SubAgent-B（Task 2 Step 1-A〜1-C）: タスク完了記録、LOGS.md x2、SKILL.md x2の更新、関連タスクテーブル更新を実施する。
- SubAgent-C（Task 2 Step 1-D〜Step 2）: topic-map.md再生成と、システム仕様更新（Phase 7判定ルール追加）を実施する。
- SubAgent-D（Task 3）: 更新履歴（`documentation-changelog.md`）と`artifacts.json`を更新する。
- Lead（Task 4 + Task 5）: 未タスク検出を実施し（0件時も出力）、スキルフィードバックレポートを作成する。

## サブフェーズ（Task 1〜5）

### Task 1: 実装ガイド作成【必須】

| パート | 対象読者             | 必須要件                                                                                |
| ------ | -------------------- | --------------------------------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 日常例えを含む / 専門用語は即時説明 / 「なぜ必要か」を先に説明                          |
| Part 2 | 開発者・技術者       | v8カバレッジJSONフォーマット / TypeScript AST解析 / APIシグネチャ / エッジケース / 設定 |

#### Part 1: 初学者・非技術者向け（中学生でもわかる版）

- **日常例え**: 「テストの成績表を科目ごとに分けるようなもの」
  - ファイル全体のカバレッジ = 全科目の平均点
  - ハンドラ単位のカバレッジ = 科目ごとの点数
  - 平均点が低くても、修正した科目の点数が高ければOK
- **なぜハンドラ単位が必要か**: ファイル全体のカバレッジだけでは、修正した部分が本当にテストされたか分からないから
- **ファイル全体カバレッジとの違い**: 23個のIPCハンドラがあるファイルで、1つだけテストしても全体は低い値になる。修正した科目の点数を見ないと本当の実力が分からない

#### Part 2: 開発者・技術者向け

- **v8カバレッジJSONフォーマットの技術解説**: `functions[]`配列内の`ranges[]`が行範囲とカバレッジカウントを持つ構造
- **TypeScript AST解析（ts-morph）の使い方**: `ipcMain.handle()`呼び出しの検出方法、ハンドラ名と行番号範囲の抽出
- **スクリプトのAPI仕様と使用例**: CLI引数（`--file`）、出力フォーマット（Markdownテーブル）、終了コード
- **Phase 7判定ルールの詳細解説**: ハンドラ単位カバレッジ基準値、PASS/FAIL判定条件、P41注記
- **エッジケース**: インラインアロー関数（P41）、ハンドラなしファイル、カバレッジJSONなし

### Task 2: システム仕様更新【必須】

#### Step 1-A: タスク完了記録（必須）

- 該当仕様書（`quality-requirements.md`）にタスク完了記録を追加する。
- 関連ドキュメントに実装ガイドへのリンクを追加する。
- 変更履歴を更新する。
- `aiworkflow-requirements/LOGS.md`にタスク完了エントリを追加する。
- `task-specification-creator/LOGS.md`にタスク完了記録を追加する（**2ファイル両方必須** — P1, P25対策）。
- `aiworkflow-requirements/SKILL.md`の変更履歴を更新する（P29対策）。
- `task-specification-creator/SKILL.md`の変更履歴を更新する（P29対策）。

#### Step 1-B: 実装状況テーブル更新（該当時必須）

- 実装完了なら`完了`、仕様書作成のみなら`spec_created`を設定する。
- `quality-requirements.md`にハンドラ単位カバレッジ判定ルールを追記する。
- Phase 7テンプレートに「ハンドラ単位カバレッジレポート」セクションを追加する。

#### Step 1-C: 関連タスクテーブル更新（該当時必須）

- `grep -rn "UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001" .claude/skills/aiworkflow-requirements/references/`で関連記載を検索し、ステータスを同期する。

#### Step 1-D: topic-map再生成（仕様更新時必須）

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`を実行し、`topic-map.md`の行番号同期を確認する。
- **仕様書に変更があれば必ず実行する**（P2, P27対策。セクション追加だけでなく、削除・更新も再生成トリガーに含める）。

#### Step 1-E: 未タスク登録の3ステップ完了（検出時必須）

1. `docs/30-workflows/unassigned-task/`に指示書を作成する。
2. `task-workflow.md`残課題テーブルへ登録する。
3. 関連仕様書の残課題テーブルへ登録し、`verify-unassigned-links.js`で整合を確認する。

#### Step 2: システム仕様更新（Phase 7判定ルール追加のため更新あり）

本タスクではPhase 7判定ルールの新規追加があるため、システム仕様更新が必要。

**更新判定前に必ず確認する抽出仕様書（aiworkflow-requirements）**

| SubAgent   | 仕様書                          | 確認観点                                                 | 本タスクでの判定                     |
| ---------- | ------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| SubAgent-A | `quality-requirements.md`       | 判定ルール/カバレッジ閾値の更新有無                      | 更新あり                             |
| SubAgent-B | `api-ipc-agent.md`              | IPCチャンネル契約（request/response/validation）変更有無 | 参照のみ（契約変更なし）             |
| SubAgent-C | `interfaces-agent-sdk-skill.md` | Skill型・戻り値契約の変更有無                            | 参照のみ（型変更なし）               |
| SubAgent-D | `security-electron-ipc.md`      | sender検証・登録ライフサイクル要件の変更有無             | 参照のみ（新規セキュリティ仕様なし） |
| SubAgent-E | `error-handling.md`             | 異常系分類/エラーメッセージ仕様の変更有無                | 参照のみ（既存ルール準拠）           |
| SubAgent-F | `arch-ipc-persistence.md`       | IPC登録パターンの変更有無                                | 参照のみ（実装変更なし）             |
| SubAgent-G | `ipc-contract-checklist.md`     | チャンネル名/引数/戻り値/エラー契約の監査観点の追加要否  | 参照のみ（既存チェックリストを適用） |
| SubAgent-H | `task-workflow-rules.md`        | Rule-3未タスク運用（検出時3ステップ）の適用要否          | 参照のみ（0件のため登録不要）        |

| 更新対象                  | 更新内容                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `quality-requirements.md` | ハンドラ単位カバレッジ判定ルールを追記                      |
| `phase-templates.md`      | Phase 7テンプレートにハンドラ単位カバレッジセクションを追加 |

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| API仕様変更                 | テスト追加のみ             |

### Task 3: ドキュメント更新履歴作成【必須】

- `documentation-changelog.md`を生成し、Step 1-A〜1-E / Step 2の実施結果を記録する。
- `artifacts.json`を更新し、Phase 12成果物を登録する。
- **全Step確認前に「完了」と記載しないこと（P4対策）**。

### Task 4: 未タスク検出【必須・0件でも出力】

| ソース               | 確認項目                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Phase 3レビュー結果  | MINOR判定の指摘事項                                                                          |
| Phase 10レビュー結果 | MINOR判定の指摘事項                                                                          |
| Phase 11手動テスト   | スコープ外の発見事項                                                                         |
| 各Phase成果物        | TODO/FIXME/将来対応                                                                          |
| コードベース         | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/scripts/coverage-by-handler.ts` で未対応検出 |

検出された未タスクの3ステップ管理（P3準拠）:

1. `docs/30-workflows/unassigned-task/`に指示書を作成する
2. `task-workflow.md`残課題テーブルに登録する
3. 関連仕様書に参照リンクを追加する

**0件でも`unassigned-task-detection.md`は作成必須。**

### Task 5: スキルフィードバックレポート【必須】

| セクション         | 記載内容                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見した改善提案（Phase 7判定ルールの運用性改善等）                            |
| 技術的教訓         | v8カバレッジJSON解析の知見、ts-morphによるAST解析パターン、ハンドラ検出の精度と限界         |
| スキル改善提案     | task-specification-creator/aiworkflow-requirementsへの改善案（Phase 7テンプレートの拡充等） |
| 新規Pitfall候補    | `.claude/rules/06-known-pitfalls.md`への追加候補                                            |

**改善点がなくても「改善点なし」としてレポートを作成する（P28対策）。**

## 参照資料

| 参照資料             | パス                                                                                        | 内容                   |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 1              | `phase-1-requirements.md`                                                                   | 目的と受入基準の再確認 |
| Phase 2              | `phase-2-design.md`                                                                         | 設計反映内容           |
| Phase 5              | `phase-5-implementation.md`                                                                 | 実装反映内容           |
| Phase 6              | `phase-6-test-expansion.md`                                                                 | 追加検証の反映内容     |
| Phase 7              | `phase-7-coverage-check.md`                                                                 | 網羅判定の反映内容     |
| Phase 8              | `phase-8-refactoring.md`                                                                    | 構造変更の反映内容     |
| Phase 9              | `phase-9-quality-assurance.md`                                                              | 品質保証結果の反映内容 |
| Phase 10             | `phase-10-final-review.md`                                                                  | レビュー結果           |
| Phase 11             | `phase-11-manual-test.md`                                                                   | 手動確認結果           |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                 | 必須タスク定義         |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1/2 実施規約      |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`        | 未タスク検出と登録手順 |
| 残課題台帳           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 登録先                 |
| 残課題運用規則       | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 品質ゲート             |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 苦戦箇所の記録方針     |
| 実装パターン集       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンと再発防止 |
| Phase 1 要件定義     | `outputs/phase-1/requirements-definition.md`                                                | Phase 1 成果物         |
| Phase 1 受入基準     | `outputs/phase-1/acceptance-criteria.md`                                                    | Phase 1 成果物         |
| Phase 1 スコープ     | `outputs/phase-1/scope-definition.md`                                                       | Phase 1 成果物         |
| Phase 2 設計書       | `outputs/phase-2/architecture-design.md`                                                    | Phase 2 成果物         |
| Phase 2 API仕様      | `outputs/phase-2/api-specification.md`                                                      | Phase 2 成果物         |
| Phase 3 レビュー結果 | `outputs/phase-3/design-review-result.md`                                                   | Phase 3 成果物         |
| Phase 5 実装ログ     | `outputs/phase-5/implementation-summary.md`                                                 | Phase 5 成果物         |
| Phase 9 品質レポート | `outputs/phase-9/quality-report.md`                                                         | Phase 9 成果物         |
| Phase 10 結果        | `outputs/phase-10/final-review-result.md`                                                   | Phase 10 成果物        |
| Phase 11 結果        | `outputs/phase-11/manual-test-result.md`                                                    | Phase 11 成果物        |
| Phase 11 発見事項    | `outputs/phase-11/manual-findings.md`                                                       | Phase 11 成果物        |
| Phase 11 実行証跡    | `outputs/phase-11/command-transcript.md`                                                    | Phase 11 成果物        |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存運用との整合を確保してください。

| 参照資料                             | パス                                                                                        | 内容                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 未タスク登録先の台帳                              |
| task-workflow-rules                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-rules.md`                  | 仕様更新時の品質ゲートと更新ルール                |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | ドキュメント品質基準・カバレッジ閾値              |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | Phase 12漏れパターンの教訓（P1-P4, P25-P28, P43） |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 実装パターンと落とし穴対策                        |

## 漏れやすいポイント（再発防止チェックリスト）

| ID  | チェック項目                                | 対策Pitfall | 確認 |
| --- | ------------------------------------------- | ----------- | ---- |
| C1  | LOGS.md 2ファイル更新                       | P1, P25     | [x]  |
| C2  | topic-map.md 再生成                         | P2, P27     | [x]  |
| C3  | 未タスク3ステップ完了（指示書/台帳/リンク） | P3          | [x]  |
| C4  | 全Step完了前に「完了」を書かない            | P4          | [x]  |
| C5  | SKILL.md 変更履歴の更新                     | P29         | [x]  |
| C6  | スキルフィードバックレポートの作成          | P28         | [x]  |

## 実行手順

1. Task 1として実装ガイドを2パートで作成する（Part 1: 日常例え、Part 2: v8カバレッジJSON/AST解析/API仕様/Phase 7判定ルール）。
2. Task 2 Step 1-Aを実施する（完了タスク記録、関連ドキュメント追記、`LOGS.md` x2、`SKILL.md` x2 更新）。
3. Task 2 Step 1-Bを実施する（`quality-requirements.md`にPhase 7判定ルール追記、Phase 7テンプレートにセクション追加）。
4. Task 2 Step 1-Cを実施する（`grep -rn "UT-IMP-IPC-HANDLER-COVERAGE-GRANULAR-001" .claude/skills/aiworkflow-requirements/references/`で関連タスク表を検索し更新）。
5. Task 2 Step 1-Dを実施する（`node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`で`topic-map.md`を再生成）。
6. Task 2 Step 2を実施する（`quality-requirements.md`へのハンドラ単位カバレッジ判定ルール追記、`phase-templates.md`へのPhase 7テンプレート更新）。
7. Task 3としてドキュメント更新履歴を作成し、`artifacts.json`を更新する。
8. Task 4として未タスク検出を実施する（0件時も出力）。
9. Task 5としてスキル改善レポートを作成する（改善点なしの場合も「改善点なし」と明記）。
10. 未タスクが検出された場合は、指示書作成・`task-workflow.md`登録・関連仕様登録・`verify-unassigned-links.js`実行まで完了する。
11. 仕様変更がある場合は`quick_validate.js`を実行してSKILL frontmatter検証を行う。

### Task 3 実行コマンド（推奨）

```bash
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001

node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出,outputs/phase-12/skill-feedback-report.md:スキル改善レポート,outputs/phase-12/spec-update-summary.md:仕様更新サマリー"

node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                    | 仕様参照先                                                                                                                        |
| ------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| セキュリティ       | 適用（参照のみ・仕様変更なし）              | `.claude/skills/aiworkflow-requirements/references/security-*.md`                                                                 |
| アーキテクチャ     | 適用（参照のみ・仕様変更なし）              | `.claude/skills/aiworkflow-requirements/references/architecture-*.md`                                                             |
| API/IPC契約        | 適用（参照のみ・契約変更なし）              | `.claude/skills/aiworkflow-requirements/references/api-*.md`, `.claude/skills/aiworkflow-requirements/references/interfaces-*.md` |
| エラーハンドリング | 適用（参照のみ・既存ルール準拠）            | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                             |
| 品質保証           | Phase 12必須5タスクの完了と成果物整合性確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                       |

## 成果物

| 成果物             | パス                                            | 説明                    |
| ------------------ | ----------------------------------------------- | ----------------------- |
| 実装ガイド         | `outputs/phase-12/implementation-guide.md`      | Part 1/Part 2 構成      |
| 仕様更新サマリー   | `outputs/phase-12/spec-update-summary.md`       | Step実施記録            |
| 更新履歴           | `outputs/phase-12/documentation-changelog.md`   | 変更履歴                |
| 未タスク検出       | `outputs/phase-12/unassigned-task-detection.md` | 検出結果（0件でも必須） |
| スキル改善レポート | `outputs/phase-12/skill-feedback-report.md`     | スキル改善提案          |
| リンク整合ログ     | `outputs/phase-12/verify-unassigned-links.log`  | 参照整合検証            |
| 未完了タスク指示書 | `docs/30-workflows/unassigned-task/*.md`        | 検出時のみ作成          |

## 完了条件

- [x] 実装ガイド（Part 1: 中学生向け）が日常例え（テストの成績表）を含み、専門用語の即時説明を満たす
- [x] 実装ガイド（Part 2: 技術者向け）がv8カバレッジJSON/AST解析/API仕様/Phase 7判定ルールを含む
- [x] 【Task 2 Step 1-A】完了タスク記録・関連ドキュメント追記・変更履歴追記を完了
- [x] 【Task 2 Step 1-A】`aiworkflow-requirements/LOGS.md`と`task-specification-creator/LOGS.md`の2ファイル更新を完了
- [x] 【Task 2 Step 1-A】`aiworkflow-requirements/SKILL.md`と`task-specification-creator/SKILL.md`の変更履歴更新を完了
- [x] 【Task 2 Step 1-B】`quality-requirements.md`にPhase 7ハンドラ単位カバレッジ判定ルールが追記されている
- [x] 【Task 2 Step 1-B】Phase 7テンプレートにハンドラ単位カバレッジセクションが追加されている
- [x] 【Task 2 Step 1-C】関連タスクテーブルのステータス更新を完了（該当時）
- [x] 【Task 2 Step 1-D】`topic-map.md`再生成済み
- [x] 【Task 2 Step 1-E】未タスク検出時に指示書作成・台帳登録・関連仕様登録を完了
- [x] 【Task 2 Step 2】`quality-requirements.md`にハンドラ単位カバレッジ判定ルールを追記済み
- [x] 【Task 2 Step 2】`phase-templates.md`にPhase 7テンプレートのハンドラ単位カバレッジセクションを追加済み
- [x] `documentation-changelog.md`と`artifacts.json`が更新されている
- [x] 未タスク検出レポートが出力され、0件時も明記されている
- [x] 未タスク検出時は指示書作成・台帳登録・関連仕様登録・リンク検証を完了
- [x] `verify-unassigned-links.js`が`ALL_LINKS_EXIST`を返している
- [x] `quick_validate.js`で更新したSKILLが`Skill is valid!`を満たす
- [x] スキル改善レポートが作成され、改善点なしの場合も明記されている
- [x] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物が所定パスに生成済み
- [x] 実行結果と完了条件の一致を確認済み

## 依存関係

- **前提**: Phase 11
- **後続**: Phase 13

## サブタスク管理

- [x] 参照資料の確認を完了
- [x] 実行タスク（SubAgent担当）を完了
- [x] 成果物作成と配置を完了
- [x] 完了条件の自己検証を完了

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各タスク成果物が生成済み
- [x] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-imp-ipc-handler-coverage-granular-001 12` 実行で問題なし

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録する。

- 実行タスク別の完了可否
- 発見事項（良かった点 / 問題点 / 改善提案）
- 次Phaseへの引き継ぎ事項

## 次のPhase

Phase 13: PR作成（phase-13-pr-creation.md）
