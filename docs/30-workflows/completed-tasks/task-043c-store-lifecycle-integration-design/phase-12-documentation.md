# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスク ID  | TASK-10A-E-C                                        |
| Phase      | 12                                                  |
| 機能名     | store-lifecycle-integration-design                  |
| 作成日     | 2026-03-06                                          |
| 前提Phase  | Phase 11（手動テスト検証 完了）                     |
| 後続Phase  | Phase 13（完了・PR準備）                            |
| 使用スキル | aiworkflow-requirements, task-specification-creator |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P43: サブエージェントのrate limit中断（3ファイル以下/エージェントに分割）

## 実行タスク

- 技術ドキュメント作成: 実装ガイド（Part 1: 概念的 + Part 2: 技術的）の作成
- コンポーネントドキュメント作成: Store統合設計のAPI仕様
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録
- スキルフィードバックレポート作成: ワークフロー改善点と技術的教訓の記録

## 参照資料

| 資料名               | パス                                                                                    | 説明                               |
| -------------------- | --------------------------------------------------------------------------------------- | ---------------------------------- |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | 手動テスト・ドキュメント作成ガイド |
| 仕様更新フロー       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新ワークフロー               |
| 未タスクガイド       | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出・管理                 |
| 技術ドキュメント作成 | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド作成ガイド               |
| 成果物命名規則       | `.claude/skills/task-specification-creator/references/artifact-naming-conventions.md`   | ファイル命名                       |
| 06-known-pitfalls    | `.claude/rules/06-known-pitfalls.md`                                                    | 既知の落とし穴                     |
| 05-task-execution    | `.claude/rules/05-task-execution.md`                                                    | Phase 12チェックリスト             |
| 設計書               | `phase-2-design.md`                                                                     | 設計仕様                           |
| 実装サマリー         | `phase-5-implementation.md`                                                             | 実装サマリー                       |
| 最終レビュー結果     | `outputs/phase-10/final-review-report.md`                                               | Phase 10成果物                     |
| 手動テスト結果       | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物                     |
| 発見課題リスト       | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11成果物                     |
| Phase 6 成果物       | `outputs/phase-6/coverage-report.md`                                                    | テスト拡充結果                     |
| Phase 7 成果物       | `outputs/phase-7/coverage-report.md`                                                    | カバレッジ検証結果                 |
| Phase 8 成果物       | `outputs/phase-8/refactoring-log.md`                                                    | リファクタリング記録               |
| Phase 9 成果物       | `outputs/phase-9/quality-report.md`                                                     | 品質レポート                       |

## aiworkflow-requirements 必須仕様の抽出（resource-map起点）

`indexes/resource-map.md` の「UI実装」「状態管理」「API設計」から、今回の仕様更新対象を確定する。

| 更新カテゴリ     | 参照先仕様書                                                                                | Task 2 での扱い                           |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 抽出起点         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | まず読む（参照漏れ防止）                  |
| 即時照会         | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`                         | IPC/Store/品質基準の再確認                |
| 状態管理         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Step 2で更新（selector/action追加）       |
| Skill API契約    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Step 2で要否判定（契約変更時に更新）      |
| IPC契約          | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | Step 2で要否判定（チャネル/戻り値変更時） |
| Electron API境界 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Step 2で要否判定（preload公開変更時）     |
| UI責務境界       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Step 1-Cで関連タスク表と整合              |
| テスト設計       | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | Step 1-Aで検証観点に反映                  |
| 実装パターン     | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | Step 2で要否判定                          |
| エラー仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Step 1-Aの完了記録へ反映                  |
| 品質基準         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | Step 1-Aの完了記録へ反映                  |

### 仕様書別 SubAgent 分担（関心ごと分離）

| SubAgent          | 担当仕様書                                                                                                            | 責務                          | 完了条件                        |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------- |
| A（状態管理仕様） | `arch-state-management.md`                                                                                            | selector/action設計の仕様反映 | Step 2 完了                     |
| B（台帳同期）     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `LOGS.md`（2ファイル）, `SKILL.md`（2ファイル） | 台帳・履歴・索引同期          | Step 1-C/1-D + 検証コマンド完了 |

---

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生レベル）【必須】

日常の例えを使って Store駆動ライフサイクル統合の概念を説明する:

- **Store（倉庫）**: 「アプリの中にある共有倉庫みたいなもの。画面の部品が『今どんな状態？』と聞くと、倉庫が最新の情報を教えてくれる」
- **Selector（取り出し口）**: 「倉庫から必要な情報だけを取り出す窓口。全部の情報を一度に持ち出すと混乱するから、『インポート済みスキル一覧だけ頂戴』みたいに必要なものだけ取り出す」
- **Action（操作指示）**: 「倉庫に『このスキルをインポートして！』と指示を出すボタン。指示を出すと、倉庫が自動的に中身を更新して、画面にも反映される」
- **Import中フラグ**: 「お店のレジで『処理中』の看板が出ているのと同じ。処理中は他のお客さんが同じレジに並べないようにする仕組み」
- **エラー状態**: 「注文した商品が届かなかったとき、レシートに『配送失敗』と書いてあるようなもの。何が問題だったかが記録に残る」

#### Part 2: 開発者向け技術詳細

- Zustand Slice設計（SkillImportSlice の状態定義）
- Selector設計（imported / available / filtered の算出ロジック）
- Action設計（importSkills / removeSkill の状態遷移フロー）
- P31対策（個別セレクタパターン、useEffect依存配列の制約）
- TASK-10A-F境界（create/analyze経路との責務分離）
- エラー遷移（error-handling.md準拠のエラーカテゴリ）
- テスト設計（状態遷移テスト、P31回避テスト）

#### 成果物

| 成果物     | パス                                       | 説明                                    |
| ---------- | ------------------------------------------ | --------------------------------------- |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` | Part 1: 中学生向け + Part 2: 技術者向け |

---

### Task 2: システム仕様書更新【必須】

`spec-update-workflow.md` に準拠して更新する。

#### Step 1-A: タスク完了記録

- [x] `arch-state-management.md` にタスク完了記録を追加
- [x] `aiworkflow-requirements/LOGS.md` 更新
- [x] `task-specification-creator/LOGS.md` 更新（**2ファイル両方** — P1/P25対策）
- [x] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [x] `task-specification-creator/SKILL.md` 変更履歴更新

#### Step 1-B: 実装状況テーブル（該当する場合）

- [x] `arch-state-management.md` の selector/action 実装ステータス更新

#### Step 1-C: 関連タスクテーブル

- [x] `grep -rn "TASK-10A-E-C" references/` で関連仕様書を検索して更新
- [x] `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルと完了タスクセクション更新

#### Step 1-D: topic-map.md 再生成

- [x] `node generate-index.js` を実行して topic-map.md を再生成（P2/P27対策）

#### Step 2: システム仕様更新（該当する場合）

- [x] `arch-state-management.md` に新規selector/action定義を追加（該当時のみ）

#### 成果物

| 成果物           | パス                                      | 説明           |
| ---------------- | ----------------------------------------- | -------------- |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md` | 更新内容の記録 |

---

### Task 3: documentation-changelog.md【必須】

- [x] 更新した全仕様書の変更内容を記録
- [x] 各 Step の完了結果を詳細に記録（漏れの可視化）
- [x] 全 Step 確認前に「完了」と記載しない（**P4対策**）

#### 成果物

| 成果物               | パス                                          | 説明     |
| -------------------- | --------------------------------------------- | -------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 変更履歴 |

---

### Task 4: 未タスク検出レポート【必須 — 0件でも作成】

- [x] `outputs/phase-12/unassigned-task-detection.md` 作成（**0件でも必須**）
- [x] 検出した未タスクは3ステップ全完了（**P3対策**）:
  1. `unassigned-task/` に指示書作成（**P38対策: tasks/直下ではなくunassigned-task/配下**）
  2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [x] `outputs/phase-12/unassigned-task-detection.md` の件数・ステータス更新
- [x] `artifacts.json` の Phase 12 ステータスを更新

#### 成果物

| 成果物               | パス                                            | 説明             |
| -------------------- | ----------------------------------------------- | ---------------- |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果 |

---

### Task 5: スキルフィードバックレポート【必須 — 改善点なしでも作成】

- [x] ワークフロー改善点の洗い出し（P28対策: 改善点がなくても「改善点なし」としてレポート作成）
- [x] 技術的教訓の記録（P31対策の有効性評価を含む）

#### 成果物

| 成果物                       | パス                                        | 説明                     |
| ---------------------------- | ------------------------------------------- | ------------------------ |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` | ワークフロー改善点・教訓 |

---

## 統合テスト連携

| 観点                  | 検証内容                                                     |
| --------------------- | ------------------------------------------------------------ |
| 仕様書整合性          | 更新した仕様書が実装と一致していることを最終確認             |
| TASK-10A-E-D 引き渡し | テスト観点のドキュメントがTASK-10A-E-Dから参照可能であること |

---

## 多角的チェック観点

| カテゴリ                | チェック項目                                                  |
| ----------------------- | ------------------------------------------------------------- |
| LOGS.md同期             | 2ファイル両方が更新されていること（P1/P25対策）               |
| topic-map再生成         | 仕様書変更後にtopic-mapが再生成されていること（P2/P27対策）   |
| 未タスク3ステップ       | 指示書・残課題テーブル・関連仕様書リンクの3点が揃っていること |
| changelog完了タイミング | 全Step完了後にのみ「完了」と記載（P4対策）                    |
| スキルフィードバック    | 改善点なしでもレポートが作成されていること（P28対策）         |
| SubAgent分割            | 仕様書更新は3ファイル以下/エージェントに分割（P43対策）       |

---

## 成果物

| 成果物                       | パス                                            | 説明                                    |
| ---------------------------- | ----------------------------------------------- | --------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | Part 1: 中学生向け + Part 2: 技術者向け |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | 仕様更新内容の記録                      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 変更履歴                                |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果                        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ワークフロー改善点・教訓                |

---

## 完了条件

- [x] Task 1: 実装ガイド（Part 1 中学生レベル + Part 2 技術者向け）を作成した
- [x] Task 2-Step 1-A: LOGS.md 2ファイル、SKILL.md 2ファイルを更新した
- [x] Task 2-Step 1-C: `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を更新した
- [x] Task 2-Step 1-D: `topic-map.md` を再生成した
- [x] Task 2-Step 2: 該当する仕様書を更新した（該当なしの場合はその旨記載）
- [x] Task 3: `documentation-changelog.md` に全Step完了後の結果を記録した
- [x] Task 4: `outputs/phase-12/unassigned-task-detection.md` を作成した（0件でも必須）
- [x] Task 5: `skill-feedback-report.md` を作成した（改善点なしでも必須）
- [x] `artifacts.json` の Phase 12 ステータスを更新した

## 次のPhase

Phase 13: 完了・PR準備 → `phase-13-pr-creation.md`
