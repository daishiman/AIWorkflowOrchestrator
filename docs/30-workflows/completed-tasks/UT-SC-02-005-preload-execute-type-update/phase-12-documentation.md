# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 12                                       |
| 機能名 | UT-SC-02-005-preload-execute-type-update |
| 作成日 | 2026-03-25                               |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 参照資料

- `outputs/phase-7/coverage-report.md`
- `outputs/phase-8/refactoring-log.md`
- `outputs/phase-9/quality-report.md`
- `outputs/phase-10/final-review-result.md`
- `outputs/phase-11/manual-test-result.md`

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

## 実行タスク

| Task      | 内容                                                   | 主成果物                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴 & artifacts.json更新              | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録 & artifacts.json更新）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## サブフェーズ

### Task 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

#### Part 1: 中学生レベル概念説明

技術に詳しくない人でも理解できるレベルで、本タスクの背景と解決内容を説明する。

**記載すべき内容**:

- **Preload とは何か**: たとえば、Preload は受付窓口のようなもの。アプリの裏側（Main プロセス）と画面側（Renderer）の間に立って、やり取りを仲介する役割がある
- **型の不整合とは何か**: 受付窓口（Preload）が「この荷物は本です」と言っているのに、実際には「本 or 手紙」が届く状態。受け取り側が手紙を受け取れずに困ってしまう
- **何を修正したか**: 受付窓口の説明書を「本 or 手紙が届きます」に書き換えて、受け取り側にも「手紙が来たらこう処理してね」というルールを追加した

**validator 安定化ルール（Task 12-1）**:

- Part 1 の「日常の例え」段落には `たとえば` を最低1回含める
- Part 1 は「なぜ必要か」→「何をするか」の順序を維持する

#### Part 2: 技術的詳細

- **TypeScript Union 型**: `RuntimeSkillCreatorExecuteResponse` が含む型バリアントの説明
- **型ナロイング**: `"type" in result.data` パターンによる判別ユニオンの絞り込み手法
- **IPC 3層契約**: Main プロセス → Preload（contextBridge）→ Renderer の型一貫性モデル
- **変更対象ファイル一覧**: 各ファイルで何を変更したかのサマリ

---

### Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新 ⚠️ 漏れやすい（P29）
- [ ] task-specification-creator/SKILL.md 変更履歴更新 ⚠️ 漏れやすい（P29）

##### Step 1-B: 実装状況テーブル更新（該当する場合）

| AC   | 内容             | ステータス     |
| ---- | ---------------- | -------------- |
| AC-1 | Preload 型更新   | DONE / PENDING |
| AC-2 | 型ナロイング実装 | DONE / PENDING |
| AC-3 | typecheck PASS   | DONE / PENDING |
| AC-4 | テスト PASS      | DONE / PENDING |

##### Step 1-C: 関連タスクテーブル更新（該当する場合）

- [ ] `grep -rn "UT-SC-02-005" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索して更新
- [ ] 未タスクIDがある場合、配置先判定を記録（未完了=`docs/30-workflows/unassigned-task/`、completed workflow 由来の継続 backlog=`docs/30-workflows/completed-tasks/<workflow>/unassigned-task/`、完了済み standalone UT=`docs/30-workflows/completed-tasks/*.md`、legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）
- [ ] completed-only area に未完了指示書が混在していないことを確認

| タスクID                              | 関係 | 内容                             |
| ------------------------------------- | ---- | -------------------------------- |
| UT-SC-02-002-execute-terminal-handoff | 前提 | 親タスク（terminal_handoff実装） |

**検索コマンド例**:

```bash
# 関連仕様書の検索（references/配下）
grep -rn "UT-SC-02-005" .claude/skills/aiworkflow-requirements/references/

# 残課題テーブルでの参照検索（`.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`）
grep -n "UT-SC-02-005" .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
grep -n "UT-SC-02-005" .claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md

# 未タスク指示書の関連検索
grep -rn "UT-SC-02-005" docs/30-workflows/unassigned-task/
```

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新対象: `docs/00-requirements/` 配下
- 更新原則: 概要のみ記載、Single Source of Truth遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

> **SKILL 検証**: `spec-update-workflow.md` Step 1-G.3 に定義された正規経路コマンドで3スキル全てが Error 0件であることを確認する。

---

### Task 12-3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する:

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/completed-tasks/UT-SC-02-005-preload-execute-type-update

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/completed-tasks/UT-SC-02-005-preload-execute-type-update \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新
- 更新したドキュメントと変更内容を一覧化

---

### Task 12-4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**0 件でも出力必須**（「検出された未タスクはありません」と明記する）

---

### Task 12-5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

### IPC機能開発時の追加更新対象ファイル

IPC チャンネルの型変更を伴うタスクの場合、Task 12-2 Step 2 で以下のファイルの更新要否を確認する:

| #   | 更新対象ファイル                                                                                                                                              | 更新内容                                            | 必須/任意 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                                                                                                                                            | 型定義変更の記録                                    | 必須      |
| 2   | `security-electron-ipc.md`                                                                                                                                    | セキュリティ検証パターン（sender検証）              | 必須      |
| 3   | `architecture-overview.md`                                                                                                                                    | IPCハンドラー関連の型定義一覧                       | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`                                                                                                                               | インターフェース定義の型変更記録                    | 必須      |
| 5   | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` / `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` | 残課題テーブル更新、完了タスクセクション追加        | 必須      |
| 6   | `lessons-learned.md`                                                                                                                                          | 実装教訓（P44/P45パターンの追加知見がある場合）     | 任意      |
| 7   | `architecture-implementation-patterns.md`                                                                                                                     | 実装パターン（Union型ナロイングパターンがある場合） | 任意      |

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する：

| 層                 | ドキュメント内容                          | 更新対象                        | 本タスクでの適用 |
| ------------------ | ----------------------------------------- | ------------------------------- | ---------------- |
| Renderer Process   | 型ナロイングパターン、Union型ハンドリング | `interfaces-*.md`               | 適用             |
| IPC通信            | 戻り値型定義の変更記録                    | `interfaces-*.md`, `api-*.md`   | 適用             |
| Preload            | contextBridge公開API型定義の更新          | `security-api-electron.md`      | 適用             |
| Main Process       | サービス設計、ビジネスロジック            | `architecture-*.md`, `api-*.md` | 非適用           |
| データ層           | スキーマ定義                              | `database-*.md`                 | 非適用           |
| エラーハンドリング | エラーコード                              | `error-handling.md`             | 非適用           |

## 参照資料

| 参照資料              | パス                                                                           | 内容                 |
| --------------------- | ------------------------------------------------------------------------------ | -------------------- |
| Phase 2 設計書        | `phase-2-design.md`                                                            | 変更内容の詳細設計   |
| Phase 5 実装          | `phase-5-implementation.md`                                                    | 実装内容の詳細       |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`                                      | 最終レビュー結果     |
| Phase 11 手動テスト   | `outputs/phase-11/manual-test-result.md`                                       | 手動テスト結果       |
| spec-update-workflow  | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | システム仕様更新手順 |

## 統合テスト連携【必須】

ドキュメント更新の統合ポイント検証:

| 統合ポイント                  | 検証内容                                                     | ステータス |
| ----------------------------- | ------------------------------------------------------------ | ---------- |
| LOGS.md 2ファイル更新         | aiworkflow-requirements と task-specification-creator の両方 | 未実施     |
| SKILL.md 変更履歴更新         | 両スキルの変更履歴テーブルを更新                             | 未実施     |
| topic-map.md 再生成           | 仕様書変更後に generate-index.js を実行                      | 未実施     |
| artifacts.json qualityMetrics | Phase 12完了時に品質指標を記録                               | 未実施     |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| アーキテクチャ     | 適用     | `aiworkflow-requirements: architecture-*.md`           |
| API設計            | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 適用     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 非適用   | -                                                      |
| データ整合性       | 非適用   | -                                                      |
| パフォーマンス     | 非適用   | -                                                      |
| アクセシビリティ   | 非適用   | -                                                      |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断 | 仕様参照先                                             |
| -------------------------- | -------- | ------------------------------------------------------ |
| IPC通信                    | 適用     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | 適用     | `aiworkflow-requirements: security-api-electron.md`    |
| フロントエンド（Renderer） | 適用     | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | 非適用   | -                                                      |
| ローカルストレージ         | 非適用   | -                                                      |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                       |
| ---------------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | YES  | 概念的+技術的ドキュメント  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | YES  | 更新履歴                   |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | YES  | 検出結果（なしでも出力）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | YES  | 改善点（なしでも出力必須） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している
- [ ] **【Task 12-2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 12-2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 12-2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 12-2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 12-2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 12-2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 12-2 Step 1-A】task-specification-creator/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 12-2 Step 1-D】topic-map.mdを再生成した** ⚠️ 漏れやすい（P2, P27参照）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Task 12-2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 12-2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定を記録した
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] artifacts.jsonが更新されている
- [ ] **artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること**
- [ ] **苦戦箇所セクションを記録した**（下記参照）
- [ ] **本Phase内の全タスクを100%実行完了**

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下に記録する。将来の類似タスクの参考になる。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

### 記録が特に有用なケース

| ケース                | 記録すべき内容                   |
| --------------------- | -------------------------------- |
| 予期しないエラー      | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬        | 誤解の内容、正しい理解、確認方法 |
| 設計変更              | 変更前後の設計、変更理由         |
| 時間のかかった調査    | 調査内容、発見方法、参考資料     |
| Pitfall追加すべき教訓 | Pitfall ID候補、パターン、対策   |

### 苦戦箇所を未タスク化する3ステップ（P3準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する。

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` の残課題テーブル、または `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の完了タスク節へ登録する
3. 関連仕様書に未タスク参照リンクを追加する

苦戦箇所が0件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                                                                                           |
| --- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新                                                                            |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                                                                                              |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                                                                                                       |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新                                                                                         |
| P3  | 未タスク管理の3ステップ不完全       | (1)指示書 → (2)`.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` または completed ledger 登録 → (3)関連仕様書リンク |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                       |
| `complete-phase.js`                   | 手動で `artifacts.json` を更新（参照: completed-tasks内のartifacts.json）         |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成 |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                |

#### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

判定基準: `spec-update-workflow.md` Step 1-G.3.1 を参照。

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 事前チェック（known-pitfalls確認）
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2: システムドキュメント更新（Step 1-A〜1-D, Step 2）
4. Task 12-3: ドキュメント更新履歴 & artifacts.json更新
5. Task 12-4: 未タスク検出
6. Task 12-5: スキルフィードバックレポート作成
7. 苦戦箇所の記録
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

- [ ] 事前チェック（known-pitfalls確認）を実施した
- [ ] Task 12-1: 実装ガイド（Part 1 + Part 2）を作成した
- [ ] Task 12-2: システム仕様書更新（Step 1-A, 1-B, 1-C, 1-D, Step 2）を実施した
- [ ] Task 12-3: ドキュメント更新履歴を記録し、artifacts.jsonを更新した
- [ ] Task 12-4: 未タスク検出を実施した（0件でも出力した）
- [ ] Task 12-5: スキルフィードバックレポートを作成した（改善点なしでも出力した）
- [ ] 苦戦箇所の記録を行った（0件でも明記した）
- [ ] 完了条件を全て満たした

## 次Phase

Phase 13: PR作成 → `phase-13-pr-creation.md`
