# Phase 12: ドキュメント

## メタ情報

| 項目     | 値                     |
| -------- | ---------------------- |
| Phase    | 12                     |
| 機能名   | w3b-sc-improve-llm     |
| タスクID | TASK-SC-05-IMPROVE-LLM |
| 作成日   | 2026-03-22             |

## 目的

improve() LLM 実装の実装ガイドと改善フローの解説を作成する。システム仕様書を更新し、未タスクを検出・記録する。

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

| Task      | 内容                               | 主成果物                                         |
| --------- | ---------------------------------- | ------------------------------------------------ |
| Task 12-1 | 技術ドキュメント作成（実装ガイド） | `outputs/phase-12/implementation-guide.md`       |
| Task 12-2 | システムドキュメント更新           | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成           | `outputs/phase-12/documentation-changelog.md`    |
| Task 12-4 | 未タスク検出                       | `outputs/phase-12/unassigned-task-detection.md`  |
| Task 12-5 | スキルフィードバックレポート作成   | `outputs/phase-12/skill-feedback-report.md`      |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## 参照資料

| 資料名                      | パス                                                                           | 説明                          |
| --------------------------- | ------------------------------------------------------------------------------ | ----------------------------- |
| Phase 12 必須チェックリスト | `.claude/rules/05-task-execution.md`                                           | Phase 12 の全タスク・完了条件 |
| 既知の落とし穴              | `.claude/rules/06-known-pitfalls.md`                                           | P1〜P4, P43, P51, P59         |
| 仕様書更新ワークフロー      | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1/2 の実行フロー         |
| Phase 11 手動テスト結果     | `outputs/phase-11/manual-test-result.md`                                       | Phase 11 成果物               |
| Phase 10 最終レビュー結果   | `outputs/phase-10/final-review-result.md`                                      | Phase 10 成果物               |

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

**validator 安定化ルール（Task 1）**:

- Part 1 の「日常の例え」段落には `たとえば` を最低1回含める
- Part 1 は「なぜ必要か」→「何をするか」の順序を維持する

#### Part 1: 概念的説明（中学生レベル）

1. `implementation-guide.md` Part 1（中学生レベル概念説明）
   - 「スキル改善提案」を日常的な比喩で説明（例: 「先生への報告書を AI が添削するイメージ」）
   - improve() フローを図解（テキスト形式）
   - `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` が何のためにあるか（LLM に JSON 形式で返答させるための指示文）を平易な言葉で説明する

#### Part 2: 開発者向け実装詳細

2. `implementation-guide.md` Part 2（開発者向け実装詳細）
   - AnthropicAdapter の使用方法
   - `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` の役割（JSON Schema 形式の出力を LLM に強制する仕組み）と `improvePromptConstants.ts` での定義場所を説明する
   - `parseImproveResponse()` / `mapToSuggestion()` / `buildImproveUserPrompt()` / `isValidImproveResponse()` の各関数の責務と入出力を説明する
   - `stripMarkdownCodeBlock()` を plan() と共有している理由（DRY 原則）を説明する
   - 改善提案 JSON Schema の詳細（`section`, `before`, `after`, `reason` の各フィールド）
   - SkillFileManager 連携の実装パターン（DI 注入された `skillFileManager` を使う理由）

#### IPC ドキュメント

3. `ipc-documentation.md`（IPC ハンドラの引数・戻り値仕様）
   - `skill-creator:improve-skill` ハンドラの仕様を明記する:
     - リクエスト: `{ skillName: string; feedback: string }`
     - レスポンス（成功時）: `{ success: true; data: { suggestions: RuntimeSkillCreatorImproveSuggestion[] } }`
     - レスポンス（失敗時）: `{ success: false; error: { code: "SKILL_NOT_FOUND" | "READ_ERROR" | "VALIDATION_ERROR" | "PARSE_ERROR" | "LLM_ERROR"; message: string } }`
     - `RuntimeSkillCreatorImproveSuggestion` の型定義: `{ section: string; before: string; after: string; reason: string }`

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当仕様書（skill-creator 関連）にタスク完了記録を追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` 更新
- [ ] `task-specification-creator/LOGS.md` 更新（**2ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

##### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] api-endpoints.md等の実装ステータスを「完了」に更新
- 該当なしの場合: N/A（本タスクは新規IPC追加なし、既存ハンドラの実装拡充のため）

##### Step 1-C: 関連タスクテーブル更新（該当する場合）

- [ ] `grep -rn "TASK-SC-05" references/` で関連仕様書を検索して更新
- [ ] 未タスクIDがある場合、配置先判定を記録（未完了=`docs/30-workflows/unassigned-task/`、completed workflow 由来の継続 backlog=`docs/30-workflows/completed-tasks/<workflow>/unassigned-task/`、完了済み standalone UT=`docs/30-workflows/completed-tasks/*.md`、legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）
- [ ] completed-only area（`docs/30-workflows/completed-tasks/*.md` と `docs/30-workflows/completed-tasks/unassigned-task/`）に未完了指示書（`未実施` / `未着手`）が混在していないことを確認

**検索コマンド例**:

```bash
# 関連仕様書の検索（references/配下）
grep -rn "TASK-SC-05" .claude/skills/aiworkflow-requirements/references/

# 残課題テーブルでの参照検索（task-workflow.md）
grep -n "TASK-SC-05" .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 未タスク指示書の関連検索
grep -rn "TASK-SC-05" docs/30-workflows/unassigned-task/

# 完了タスク配下の関連検索
grep -rn "TASK-SC-05" docs/30-workflows/completed-tasks/
```

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【条件付き】

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

本タスクでは `RuntimeSkillCreatorImproveSuggestion` 型の新規追加と `RuntimeSkillCreatorImproveResult.suggestions` の型変更があるため、**更新必要**。
更新対象: `interfaces-agent-sdk-skill.md`、`architecture-implementation-patterns.md`

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新対象: `docs/00-requirements/` 配下
- 更新原則: 概要のみ記載、Single Source of Truth遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する:

- [ ] 更新した全仕様書の変更内容を記録
- [ ] 各 Step の完了結果を詳細に記録（漏れの可視化）
- [ ] 全 Step 完了前に「完了」と記載しない（P4対策）

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/w3b-sc-improve-llm

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/w3b-sc-improve-llm \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（TASK-4-1形式を参照）
- 更新したドキュメントと変更内容を一覧化

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

- [ ] `unassigned-task-detection.md` 作成（0件でも必須）
- [ ] 以下の観点で未タスクを検出する:
  - `RuntimeSkillCreatorFacadeDeps` への `skillFileManager` DI 追加に伴い、既存の plan() 関係コードや他の Facade 利用箇所への影響範囲に未対応の箇所がないか
  - `RuntimeSkillCreatorImproveSuggestion` 型の変更（`string[]` → 構造体配列）に伴い、Preload 層・Renderer 層・テストで対応が漏れている箇所がないか（`grep -rn "ImproveResult\|suggestions" apps/ packages/`）
  - `applyImprovement()` または SKILL.md 反映フローの UI 統合（Renderer 側での承認 UI）が未実装のままであれば未タスク化する
- [ ] 検出した未タスクは3ステップ全完了（P3対策）:
  1. `unassigned-task/` に指示書作成
  2. `task-workflow.md` 残課題テーブルに登録
  3. 関連仕様書に参照リンク追加
- [ ] `unassigned-task-detection.md` の件数・ステータス更新
- [ ] 未タスク指示書の物理ファイル存在を確認（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定を記録（未完了=`docs/30-workflows/unassigned-task/` / completed workflow 由来の継続 backlog=`docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` / 完了済み standalone UT=`docs/30-workflows/completed-tasks/*.md` / legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                                            |
| ------------------ | ------------------------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案                       |
| 技術的教訓         | improve() LLM統合で得られた技術的な知見（promptエンジニアリング等） |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案                |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall                         |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

## 多角的チェック観点

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |

## 成果物

| 成果物                       | パス                                            | 必須 | 説明               |
| ---------------------------- | ----------------------------------------------- | ---- | ------------------ |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | 必須 | Part 1 + Part 2    |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | 必須 | 更新履歴           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | 必須 | 0件でも出力        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | 必須 | 改善点なしでも出力 |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ         |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
  - Part 1 に `IMPROVE_RESPONSE_SCHEMA_INSTRUCTION` の平易な説明を含む
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
  - Part 2 に `parseImproveResponse()` / `mapToSuggestion()` / `buildImproveUserPrompt()` / `isValidImproveResponse()` の説明を含む
  - Part 2 に DI設計・`stripMarkdownCodeBlock` 共有の説明を含む
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している
- [ ] IPC ドキュメントを作成した（`skill-creator:improve-skill` のリクエスト/レスポンス型定義、エラーコード一覧を含む）
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した（2ファイル両方必須 -- P1, P25）**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した** -- 漏れやすい（P29）
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴テーブルを更新した** -- 漏れやすい（P29）
- [ ] **【Task 2 Step 1-B】実装状況テーブルの更新要否を判断した（該当する場合のみ）**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した** -- 漏れやすい（P2, P27）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定を記録した
- [ ] 未タスクの3ステップを全て完了した（P3対策: 指示書作成 → task-workflow.md登録 → 関連仕様書リンク追加）
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] artifacts.jsonが更新されている
- [ ] **artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること**
- [ ] **苦戦箇所セクションを記録した**
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

### 苦戦箇所を未タスク化する3ステップ（P3準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する。

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

苦戦箇所が0件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                            | 対策                                                                |
| --- | ----------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ           | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ             | セクション変更時は必ず `generate-index.js` を実行                   |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ         | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新              |
| P3  | 未タスク管理の3ステップ不完全       | 指示書 → task-workflow.md登録 → 関連仕様書リンク                    |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システムドキュメント更新
4. Task 12-3: ドキュメント更新履歴 & artifacts.json更新
5. Task 12-4: 未タスク検出
6. Task 12-5: スキルフィードバックレポート作成
7. 成果物の配置確認
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/w3b-sc-improve-llm --phase 12
```

## 次のPhase

Phase 13: PR 作成
