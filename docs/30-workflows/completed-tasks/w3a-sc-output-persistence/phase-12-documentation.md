# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| 機能名   | w3a-sc-output-persistence     |
| Phase    | 12                            |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

実装ガイド（SkillFileWriter の解説含む）・API ドキュメント・システム仕様書更新・未タスク検出を行い、Phase 12 チェックリストの全項目を完了する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25-P29: 各種更新漏れ

## 実行タスク

| Task      | 内容                                                   | 主成果物                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

### Task 1: 実装ガイド作成

1. `implementation-guide-part1.md` を作成する（中学生レベルの概念説明）
   - 「スキルのファイル保存はフォルダに整理して書類を入れるようなもの」という日常例えを使用する
   - アトミック書き込みを「保存ボタンを押したら全部保存される。途中で失敗したら何も保存されない」として説明する
   - パストラバーサル防止を「ファイルを開く前に必ず『この場所は安全か？』を確認する」として説明する
2. `implementation-guide-part2.md` を作成する（開発者向け実装詳細）
   - `validateSkillName()` のパストラバーサル防止ロジック（`path.resolve()` + basePath プレフィックス確認）
   - `rollback()` の実装詳細（書き込み済みファイルのリスト管理 → `fs.unlink()` で削除）
   - `persist()` の呼び出しフロー（validateSkillName → checkExistingSkill → mkdirSync → writeFiles）
3. `api-documentation.md` を作成する
   - `SkillFileWriter.persist()` のシグネチャ・パラメータ・戻り値・エラーコードを記述する
   - `SkillGeneratedContent` 型の全フィールドを記述する

### Task 2: システム仕様書更新（spec-update-workflow.md 準拠）

#### Step 1-A: タスク完了記録

- [ ] 該当する仕様書にタスク完了記録を追加する
- [ ] `aiworkflow-requirements/LOGS.md` を更新する
- [ ] `task-specification-creator/LOGS.md` を更新する（2ファイル両方: P1/P25 対策）
- [ ] `aiworkflow-requirements/SKILL.md` の変更履歴を更新する（P29 対策）
- [ ] `task-specification-creator/SKILL.md` の変更履歴を更新する

#### Step 1-B: 実装状況テーブル更新

- [ ] `api-endpoints.md` 等の実装ステータスを確認する
- [ ] SkillFileWriter は IPC チャンネル変更なし → IPC 関連テーブル更新不要と判断・記録する

#### Step 1-C: 関連タスクテーブル

- [ ] `grep -rn "TASK-SC-04-OUTPUT-PERSISTENCE" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新する

#### Step 1-D: topic-map.md 再生成

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成する（P2/P27 対策）

#### Step 2: システム仕様更新

- [ ] `SkillFileWriter` クラスの追加を該当仕様書（`interfaces-skill-*.md` 等）に記録する
- [ ] `SkillGeneratedContent` 型の追加を `interfaces-*.md` に記録する（P32 対策: shared 側も更新）

#### Step 3: IPC 契約検証（IPC 修正がある場合のみ）

- IPC チャンネルの変更がある場合は ipc-contract-checklist.md を実施する

### Task 3: documentation-changelog.md 記録

- [ ] 全 Step の完了後に `documentation-changelog.md` を更新する（P4/P51 対策: 全 Step 完了前に「完了」と書かない）

### Task 4: 未タスク検出

- [ ] `unassigned-task-report.md` を作成する（0件でも必須）
- [ ] Phase 3 設計レビューの MINOR 指摘を未タスクとして管理する:
  - UT-SC-04-001: SkillFileWriter インターフェース抽出（P61 対策）
  - UT-SC-04-002: rollback() シグネチャ改善（skillPath 引数追加）
- [ ] 検出した未タスクは3ステップ全完了する: (1) `unassigned-task/` に指示書作成 (2) `task-workflow.md` 残課題テーブルに登録 (3) 関連仕様書にリンク追加（P3/P38/P58 対策）
- [ ] `unassigned-task-detection.md` の件数・ステータスを更新する
- [ ] `artifacts.json` の Phase 12 ステータスを更新する

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## 参照資料

- `.claude/rules/05-task-execution.md`（Phase 12 チェックリスト）
- `.claude/rules/06-known-pitfalls.md`（P1-P4, P25, P27, P29, P32, P38, P43, P51, P56-P59）
- `docs/30-workflows/w3a-sc-output-persistence/phase-11-manual-testing.md`

## 成果物

| 成果物                       | パス                                             | 必須 | 説明                                     |
| ---------------------------- | ------------------------------------------------ | ---- | ---------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`       | ✅   | 概念的+技術的ドキュメント（2パート構成） |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`    | ✅   | 更新履歴                                 |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`  | ✅   | 検出結果（なしでも出力）                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`      | ✅   | 改善点（なしでも出力必須）               |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | ✅   | 仕様更新の記録                           |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`         | 条件 | 検出時のみ作成                           |

## 完了条件

- [ ] Task 1: 実装ガイド Part 1/2 と API ドキュメントを作成した
- [ ] Step 1-A: LOGS.md を2ファイル両方更新した（P1/P25 対策）
- [ ] Step 1-A: SKILL.md を2ファイル両方更新した（P29 対策）
- [ ] Step 1-C: 関連仕様書を grep で検索し更新した
- [ ] Step 1-D: topic-map.md を再生成した（P2/P27 対策）
- [ ] Step 2: SkillFileWriter / SkillGeneratedContent を仕様書に反映した（P32 対策）
- [ ] Task 3: documentation-changelog.md を全 Step 完了後に更新した（P4 対策）
- [ ] Task 4: unassigned-task-report.md を作成した（0件でも必須）
- [ ] 再評価クローズした未タスクの GitHub Issue を Close した（P56 対策）
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] **苦戦箇所セクションを記録した**（0件でも明記）
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 成果物の作成・配置
4. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 13: PR 作成
