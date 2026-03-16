# Phase 12: ドキュメント - タスク仕様書

## メタ情報

| 項目       | 内容                                |
| ---------- | ----------------------------------- |
| タスクID   | UT-06-005                           |
| Phase      | 12                                  |
| Phase名    | ドキュメント                        |
| 機能名     | UT-06-005-abort-skip-retry-fallback |
| カテゴリ   | 機能実装                            |
| ステータス | not_started                         |
| 作成日     | 2026-03-16                          |
| 前提Phase  | Phase 11（手動テスト完了）          |
| 後続Phase  | Phase 13                            |

## 目的

実装ガイドの作成、システム仕様書の更新、documentation-changelog の記録、未タスクの検出を行い、コードと仕様書の整合性を確保する。

**注意**: Phase 12 は漏れが最も発生しやすい Phase である。必ず全項目を逐次確認し、全 Step 完了前に「完了」と記載しない（P4/P51 対策）。事前に `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目（P1, P2, P3, P4, P25, P26, P27, P28, P29, P43, P51, P56, P57, P58, P59）を読んでから作業を開始すること。

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

| Task      | 内容                                                   | 主成果物                                        |
| --------- | ------------------------------------------------------ | ----------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`      |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md`       |
| Task 12-3 | ドキュメント更新履歴作成                               | `outputs/phase-12/documentation-changelog.md`   |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`     |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## Phase 10 MINOR 追跡テーブル

Phase 10 で MINOR 判定された指摘がある場合、Phase 12 で追跡結果を記録する。

| MINOR ID                  | 指摘内容 | 解決予定Phase | 解決確認Phase | 解決方法 | ステータス |
| ------------------------- | -------- | ------------- | ------------- | -------- | ---------- |
| （Phase 10 実行後に記録） | -        | -             | -             | -        | -          |

- Phase 10 MINOR は全て未タスク仕様書に変換するか、Phase 12 内で解決する（省略不可）
- `documentation-changelog.md` に追跡結果を記録する

### Task 12-1: 実装ガイド作成

**目的**: 本タスクの実装内容を概念レベルと技術レベルの両面で文書化する

#### Part 1: 中学生レベル概念説明

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 1

**必須要素**:

- 日常的な例え話: 「お店のガードマンが入口でお客さんの許可証をチェックするようなもの。許可証がない場合の対応方法が4つある: (1) abort — 入店を断ってお帰りいただく、(2) skip — その許可が必要な商品だけ買えないが他の商品は買える、(3) retry — もう一度許可証を見せてもらう（3回まで）、(4) timeout — 5分待っても許可証が出てこなければお帰りいただく」
- 何を: SkillExecutor が Permission 拒否された時の4つの対応方法を実装した
- なぜ: 拒否時にスキル実行がハングしたり、不正にリソースを使い続けたりしないため
- どう: abort で即停止、skip で部分続行、retry で再試行（最大3回）、timeout で応答待ち上限（5分）を設けた

#### Part 2: 開発者向け実装詳細

**成果物**: `outputs/phase-12/implementation-guide.md` の Part 2

**必須要素**:

- 変更ファイル一覧と変更理由
- abort/skip/retry/timeout の各フォールバックフローの実装詳細
- PermissionResolver と SkillExecutor の連携フロー
- retry の指数バックオフ戦略（設計がある場合）
- timeout 値（5分）の設計根拠
- エラーカテゴリ（Business Error 2000-2999: リトライ不可）との整合性
- IPC 通知の仕組み（abort/skip/retry 結果の Renderer への通知方法）

### Task 12-2: システム仕様書更新

**目的**: spec-update-workflow.md に準拠し、全関連仕様書を更新する

**注意事項**:

- 仕様書更新は3ファイル以下/サブエージェントに分割する（P43 対策）
- LOGS.md への「完了」記録は全ファイル更新後の最終ステップとする（P43 対策）
- 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する（P57 対策）

#### Step 1-A: タスク完了記録

**手順**:

1. 該当仕様書にタスク完了記録を追加する:
   - `interfaces-agent-sdk-skill.md` に abort/skip/retry/timeout インターフェース追加記録
   - `security-skill-execution.md` に Permission フォールバックセキュリティ更新記録
   - `error-handling.md` に Permission 拒否時のエラーカテゴリ記録（該当する場合）
2. **LOGS.md を2ファイルとも更新する**（P1/P25 対策）:
   - `.claude/skills/aiworkflow-requirements/LOGS.md` に完了記録を追加
   - `.claude/skills/task-specification-creator/LOGS.md` に完了記録を追加
3. **SKILL.md を2ファイルとも更新する**（P29 対策）:
   - `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴テーブルを更新
   - `.claude/skills/task-specification-creator/SKILL.md` の変更履歴テーブルを更新

**チェックリスト**:

- [ ] `.claude/skills/aiworkflow-requirements/LOGS.md` 更新済み
- [ ] `.claude/skills/task-specification-creator/LOGS.md` 更新済み
- [ ] `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新済み

#### Step 1-B: 実装状況テーブル更新

**手順**:

1. 該当する実装状況テーブルがある場合、ステータスを更新する
2. `grep -rn "UT-06-005\|abort.*skip.*retry\|permission.*fallback" .claude/skills/aiworkflow-requirements/references/` で関連テーブルを検索し、更新する

#### Step 1-C: 関連仕様書の検索と更新

**手順**:

1. 関連仕様書を検索する:
   ```bash
   grep -rn "UT-06-005" .claude/skills/
   grep -rn "abort.*skip.*retry\|permission.*fallback" .claude/skills/aiworkflow-requirements/references/
   ```
2. 検出された全仕様書のタスク参照・ステータスを更新する
3. `task-workflow.md` の残課題テーブルと完了タスクセクションを更新する

#### Step 1-D: topic-map.md 再生成

**手順**:

1. `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成する（P2/P27 対策）
2. 実行ログで正常完了を確認する
3. `git diff --stat -- .claude/skills/` で indexes/ ディレクトリに変更が反映されていることを確認する

**チェックリスト**:

- [ ] `node generate-index.js` 実行済み
- [ ] topic-map.md が更新されていることを確認済み

#### Step 2: システム仕様更新

**手順**:

1. `interfaces-agent-sdk-skill.md` を更新する:
   - Permission フォールバック関連のインターフェース定義を追加
   - `AbortResult`, `SkipResult`, `RetryPolicy`, `TimeoutConfig` 等の型定義を記録
2. `security-skill-execution.md` を更新する:
   - Permission 拒否時のフォールバックフローをセキュリティ観点で記録
   - retry 上限と timeout の安全性根拠を記録
3. `error-handling.md` を更新する（該当する場合）:
   - Permission 拒否のエラーカテゴリ分類を記録
4. `architecture-implementation-patterns.md` を更新する（該当する場合）:
   - フォールバックパターンの実装パターン記録

**IPC 機能開発時の追加更新対象**:

| 仕様書                          | 更新内容                                       |
| ------------------------------- | ---------------------------------------------- |
| `api-ipc-agent.md`              | abort/skip/retry/timeout の IPC チャンネル記録 |
| `security-electron-ipc.md`      | フォールバック IPC のセキュリティ検証記録      |
| `interfaces-agent-sdk-skill.md` | フォールバック関連の型定義追加                 |

### Task 12-3: documentation-changelog.md 作成

**目的**: 更新した全仕様書の変更内容を記録し、各 Step の完了結果を詳細に記録する

**成果物**: `outputs/phase-12/documentation-changelog.md`

**必須要素**:

1. 更新した全仕様書のリスト（ファイルパス + 変更概要）
2. Step 1-A〜Step 2 の各完了結果:
   - 実施内容
   - 更新したファイル
   - 確認結果
3. **全 Step 確認前に「完了」と記載しない**（P4/P51 対策）
4. 記載順序: 各 Step を実施した順に「事後記録」する
5. `unassigned-task-detection.md` の検出件数と照合する（P59 対策）

**チェックリスト**:

- [ ] Step 1-A の完了結果が記録されていること
- [ ] Step 1-B の完了結果が記録されていること
- [ ] Step 1-C の完了結果が記録されていること
- [ ] Step 1-D の完了結果が記録されていること
- [ ] Step 2 の完了結果が記録されていること
- [ ] 全 Step の完了を確認した上で最終ステータスを記載していること
- [ ] 未タスク検出件数が `unassigned-task-detection.md` と一致していること（P59 対策）

### Task 12-4: 未タスク検出

**目的**: 本タスクの実装過程で発見された未解決の課題を検出・記録する

**成果物**: `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）

**手順**:

1. 実装過程で発見した未解決課題をリストアップする
2. Phase 10 の MINOR 指摘を全て未タスク仕様書に変換する（省略不可）
3. 検出した未タスクは**3ステップ全て完了する**（P3/P38/P58 対策）:
   - [ ] `docs/30-workflows/unassigned-task/` に指示書を作成（設計タスクでも省略不可）
   - [ ] `task-workflow.md` の残課題テーブルに登録
   - [ ] 関連仕様書に参照リンクを追加
4. `artifacts.json` の Phase 12 ステータスを更新する
5. 再評価クローズした未タスクがある場合、対応する GitHub Issue を `gh issue close` で同時に Close する（P56 対策）

**チェックリスト**:

- [ ] `unassigned-task-detection.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（該当する場合）

### Task 12-5: スキルフィードバックレポート

**目的**: 本タスクの実装過程で発見されたスキル改善点を記録する

**成果物**: `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須、P28 対策）

**手順**:

1. 本タスクの実装過程で使用したスキルの改善点をリストアップする
2. ワークフロー改善点があれば記録する
3. 改善点がない場合でも「改善点なし」としてレポートを作成する

## 参照資料

| 参照資料         | パス                                                                      | 説明                        |
| ---------------- | ------------------------------------------------------------------------- | --------------------------- |
| Phase 11 成果物  | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-11/` | 手動テスト結果              |
| Phase 10 成果物  | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-10/` | 最終レビュー結果・MINOR指摘 |
| Phase 1 受入基準 | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-1/`  | 受入基準定義                |

### システム仕様（aiworkflow-requirements）

> 仕様書更新前に以下のシステム仕様を確認し、更新対象と更新内容を把握してください。

| 参照資料                        | パス                                                                                         | 内容                                                               |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| セキュリティ（スキル実行）      | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`              | スキル実行時のセキュリティ要件                                     |
| セキュリティ（スキルIPC）       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                    | スキルIPC通信セキュリティ                                          |
| Agent SDK Skillインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`            | Agent SDK Skill関連の型定義                                        |
| エラーハンドリング              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                        | エラーカテゴリとリトライ方針                                       |
| エラーハンドリング（コア）      | `.claude/skills/aiworkflow-requirements/references/error-handling-core.md`                   | エラーコード範囲（1000-5999）、ERR_2002 PERMISSION_DENIED          |
| エラーハンドリング（詳細）      | `.claude/skills/aiworkflow-requirements/references/error-handling-details.md`                | SkillExecutor実行エラーコード（PERMISSION_DENIED, TIMEOUT, ABORT） |
| 実装パターン                    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`  | 実装パターン集                                                     |
| Agent SDK Executor（コア）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`    | ExecutionState列挙型、RetryConfig、SkillExecutionErrorCode         |
| Agent SDK Executor（詳細）      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md` | PermissionResolver完全仕様、DEFAULT_TIMEOUT_MS=300000              |
| 仕様更新ワークフロー            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`               | Step 1-A〜Step 2 の手順                                            |
| Phase 12 チェックリスト         | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`       | 全チェック項目の定義                                               |
| Phase 11-12 ガイド              | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                  | Phase 12 実行ガイドライン                                          |

## 実行手順

### ステップ1: 事前チェック実行

`.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目（P1〜P59）を確認する。

### ステップ2: Task 12-1 実装ガイド作成

Part 1（中学生レベル概念説明）と Part 2（開発者向け実装詳細）の2パート構成で作成する。

### ステップ3: Task 12-2 システム仕様書更新

Step 1-A〜Step 1-D、Step 2 を順に実行する。仕様書更新は3ファイル以下/サブエージェントに分割する。

### ステップ4: Task 12-3 documentation-changelog 作成

全 Step の完了結果を事後記録する。全 Step 完了前に「完了」と記載しない。

### ステップ5: Task 12-4 未タスク検出

0件でもレポートを出力する。検出した未タスクは3ステップ全完了する。

### ステップ6: Task 12-5 スキルフィードバックレポート

改善点がなくてもレポートを作成する。

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する:

| 層                 | ドキュメント内容                         | 更新対象                        |
| ------------------ | ---------------------------------------- | ------------------------------- |
| Main Process       | サービス設計、ビジネスロジック、API仕様  | `architecture-*.md`, `api-*.md` |
| エラーハンドリング | エラーコード、エラーメッセージ、復旧手順 | `error-handling.md`             |

**本タスクでの適用**: Main Process 層（SkillExecutor フォールバック設計）とエラーハンドリング層（Permission 拒否エラーカテゴリ）が主対象。

## 多角的チェック観点（AIが判断）

Phase 12 実行時に以下の観点で漏れがないことを確認する:

| #   | チェック観点             | 確認方法                                                               |
| --- | ------------------------ | ---------------------------------------------------------------------- |
| 1   | LOGS.md 2ファイル更新    | `git diff --stat -- .claude/skills/*/LOGS.md` で2ファイルの変更を確認  |
| 2   | SKILL.md 2ファイル更新   | `git diff --stat -- .claude/skills/*/SKILL.md` で2ファイルの変更を確認 |
| 3   | topic-map.md 再生成      | `git diff --stat -- .claude/skills/*/indexes/` で変更を確認            |
| 4   | 未タスク3ステップ完了    | 指示書・task-workflow・関連仕様書リンクの3つが揃っていることを確認     |
| 5   | changelog 事後記録       | 全 Step 完了後に最終ステータスを記載していることを確認                 |
| 6   | 未タスク件数整合         | changelog の件数と `unassigned-task-detection.md` の件数が一致すること |
| 7   | IPC 関連仕様更新         | `api-ipc-agent.md`, `security-electron-ipc.md` の更新が必要か判断      |
| 8   | スキルフィードバック作成 | `skill-feedback-report.md` が作成されていること（0件でも必須）         |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物                       | パス                                                                                                           | 必須 | 説明                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------- |
| 実装ガイド                   | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/implementation-guide.md`               | 必須 | 概念的+技術的ドキュメント（Part 1/2） |
| システム仕様更新サマリー     | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/system-spec-update-summary.md`         | 必須 | Step 1/Step 2 の結果記録              |
| documentation-changelog      | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/documentation-changelog.md`            | 必須 | 更新履歴                              |
| 未タスク検出レポート         | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/unassigned-task-detection.md`          | 必須 | 検出結果（なしでも出力）              |
| スキルフィードバックレポート | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/skill-feedback-report.md`              | 必須 | 改善点（なしでも出力必須）            |
| タスク仕様準拠チェック       | `docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 | Task 12-1〜12-5 の準拠チェック結果    |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`                                                                       | 条件 | 検出時のみ作成                        |

## 完了条件

### Task 12-1: 実装ガイド

- [ ] `implementation-guide.md` Part 1 が作成されていること（中学生レベル概念説明、日常例え必須）
- [ ] `implementation-guide.md` Part 2 が作成されていること（開発者向け実装詳細）

### Task 12-2: システム仕様書更新

- [ ] Step 1-A: `.claude/skills/aiworkflow-requirements/LOGS.md` 更新済み
- [ ] Step 1-A: `.claude/skills/task-specification-creator/LOGS.md` 更新済み（P1/P25 対策）
- [ ] Step 1-A: `.claude/skills/aiworkflow-requirements/SKILL.md` 変更履歴更新済み
- [ ] Step 1-A: `.claude/skills/task-specification-creator/SKILL.md` 変更履歴更新済み（P29 対策）
- [ ] Step 1-B: 実装状況テーブルが更新されていること（該当する場合）
- [ ] Step 1-C: `grep -rn "UT-06-005"` で関連仕様書を検索し、全て更新されていること
- [ ] Step 1-D: `node generate-index.js` で topic-map.md が再生成されていること（P2/P27 対策）
- [ ] Step 1-D: `git diff --stat -- .claude/skills/` で indexes/ の変更を確認済み
- [ ] Step 2: IPC 関連仕様書が更新されていること（該当する場合）
- [ ] Step 2: `interfaces-agent-sdk-skill.md` のフォールバック型定義が記録されていること
- [ ] Step 2: `security-skill-execution.md` のフォールバックセキュリティが記録されていること

### Task 12-3: documentation-changelog

- [ ] 更新した全仕様書の変更内容が記録されていること
- [ ] 各 Step の完了結果が詳細に記録されていること
- [ ] 全 Step 完了を確認した上で最終ステータスが記載されていること（P4/P51 対策）
- [ ] 未タスク検出件数が `unassigned-task-detection.md` と一致していること（P59 対策）

### Task 12-4: 未タスク検出

- [ ] `unassigned-task-detection.md` が作成されていること（0件でも必須）
- [ ] 検出した未タスクの3ステップが全て完了していること（P3/P38/P58 対策）
- [ ] `artifacts.json` の Phase 12 ステータスが更新されていること
- [ ] 再評価クローズ時の GitHub Issue Close が実施されていること（P56 対策、該当する場合）

### Task 12-5: スキルフィードバック

- [ ] `skill-feedback-report.md` が作成されていること（改善点なしでも必須、P28 対策）

### タスク仕様準拠チェック

- [ ] `phase12-task-spec-compliance-check.md` が作成されていること（Task 12-1〜12-5 の準拠チェック結果）

### 全体

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定を記録した
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

| ケース                               | 記録すべき内容                   |
| ------------------------------------ | -------------------------------- |
| 予期しないエラー                     | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬                       | 誤解の内容、正しい理解、確認方法 |
| 設計変更                             | 変更前後の設計、変更理由         |
| 時間のかかった調査                   | 調査内容、発見方法、参考資料     |
| 06-known-pitfalls.mdに追加すべき教訓 | Pitfall ID候補、パターン、対策   |

苦戦箇所が0件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | (1)指示書 → (2)task-workflow.md登録 → (3)関連仕様書リンク           |

## planned wording 残存確認【完了前に必ず実行】

Phase 12 完了前に、`仕様策定のみ` / `実行予定` / `保留として記録` 等の planned wording が成果物に残存していないことを確認する。

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/UT-06-005-abort-skip-retry-fallback/outputs/phase-12/ || echo "planned wording なし"
```

## SF-03: 設計タスク特有の未タスク検出パターン

Task 12-4 実施時に、以下の4パターンを必ずチェックする。

| パターン                  | 候補の例                                                          | 優先度目安 |
| ------------------------- | ----------------------------------------------------------------- | ---------- |
| **型定義→実装**           | 型を定義したが、ハンドラ側のランタイム実装が未完了                | 高         |
| **契約→テスト**           | IPC契約・インターフェースを設計したが、対応する統合テストが未作成 | 中         |
| **UI仕様→コンポーネント** | 画面仕様を設計したが、Reactコンポーネントが未実装                 | 中         |
| **仕様書間差異→設計決定** | 複数仕様書で矛盾する記述が残り、どちらが正しいか決定できていない  | 高         |

**SF-03 チェック手順**:

1. Phase 1 要件定義の受入基準を再確認し「将来対応」とした項目を列挙する
2. Phase 2/3 設計・レビューの MINOR 判定事項をリストアップする
3. 上記4パターンと照合し、未タスク化対象を確定する
4. 0件でも `unassigned-task-detection.md` に「SF-03 パターン確認済み、0件」と明記する

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

判定基準: `spec-update-workflow.md` Step 1-G.3.1 を参照。

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| #   | サブタスク                    | ステータス  |
| --- | ----------------------------- | ----------- |
| 1   | 事前チェック実行              | not_started |
| 2   | Task 12-1: 実装ガイド作成     | not_started |
| 3   | Task 12-2: システム仕様書更新 | not_started |
| 4   | Task 12-3: changelog作成      | not_started |
| 5   | Task 12-4: 未タスク検出       | not_started |
| 6   | Task 12-5: フィードバック     | not_started |
| 7   | 完了条件の検証                | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-06-005-abort-skip-retry-fallback --phase 12
```

## 次のPhase

Phase 13: PR作成
