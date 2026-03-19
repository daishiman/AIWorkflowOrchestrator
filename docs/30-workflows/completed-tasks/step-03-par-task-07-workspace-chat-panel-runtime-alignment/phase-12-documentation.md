# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 12                                                                                                                                                                                                          |
| Phase名    | ドキュメント更新                                                                                                                                                                                            |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                                                                                                                                                                |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計）、Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認）、Phase 8（リファクタリング）、Phase 9（品質検証）、Phase 10（最終レビュー）、Phase 11（手動テスト） |
| 後続Phase  | Phase 13（PR作成）                                                                                                                                                                                          |
| ステータス | not_started                                                                                                                                                                                                 |
| 作成日     | 2026-03-13                                                                                                                                                                                                  |
| 更新日     | 2026-03-17                                                                                                                                                                                                  |
| 機能名     | workspace-chat-panel-runtime-alignment                                                                                                                                                                      |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。Workspace Chat Panel の streaming / file context / conversation / terminal transcript 同期仕様を system spec と task 台帳へ同期する。

## 事前チェック【必須】

Phase 12 実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P29: SKILL.md 変更履歴の更新漏れ
   - P43: サブエージェントの rate limit 中断
   - P51: サブエージェントの documentation-changelog 早期完了記載
   - P57: 設計タスクにおける Phase 12 システム仕様書更新の先送りパターン
   - P59: 並列エージェントによる documentation-changelog 件数不整合

## 実行タスク

| Task      | 内容                                                   | 主成果物                                                 |
| --------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成）                 | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md`                |
| Task 12-3 | ドキュメント更新履歴作成 & artifacts.json 更新         | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出（残課題の検出と記録）                     | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポート作成                       | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Task 12-1〜12-5 全完了確認（準拠チェック）             | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements 等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録 & artifacts.json 更新）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）
- Task 12-6: Task 12-1〜12-5 の全完了確認（phase12-task-spec-compliance-check.md の作成）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## 参照資料

| 参照資料                    | パス                                                                               | 内容                                  |
| --------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1（要件定義）         | `phase-1-requirements.md`                                                          | 依存する前提成果物を確認する          |
| Phase 2（設計）             | `phase-2-design.md`                                                                | 依存する前提成果物を確認する          |
| Phase 5（実装）             | `phase-5-implementation.md`                                                        | 実装対象と authority 変更点を確認する |
| Phase 6（テスト拡充）       | `phase-6-test-expansion.md`                                                        | 回帰拡張内容を確認する                |
| Phase 7（カバレッジ確認）   | `phase-7-coverage-check.md`                                                        | critical path coverage を確認する     |
| Phase 8（リファクタリング） | `phase-8-refactoring.md`                                                           | 責務整理内容を確認する                |
| Phase 9（品質検証）         | `phase-9-quality-assurance.md`                                                     | stale stream / 誤添付観点を確認する   |
| Phase 10（最終レビュー）    | `phase-10-final-review.md`                                                         | release 判定の前提を確認する          |
| Phase 11（手動テスト）      | `phase-11-manual-test.md`                                                          | 依存する前提成果物を確認する          |
| WorkspaceChatPanel          | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`             | workspace chat UI surface を確認する  |
| completed task 059a         | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md` | 既存 UI / streaming 正本を確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                 | パス                                                                            | 内容                                                                                           |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| interfaces-llm           | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`           | workspace chat と conversation の IPC 契約インデックス（詳細型定義は llm-ipc-types.md を参照） |
| llm-ipc-types            | `.claude/skills/aiworkflow-requirements/references/llm-ipc-types.md`            | AIChatRequest / LLMProvider 実型定義の更新対象（StreamChatRequest 相当型の正本）               |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream chat / cancel 契約の正本                                                                |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Workspace Chat Panel UI の正本                                                                 |
| ui-ux-navigation         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`         | workspace 導線の正本                                                                           |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | selected files / state handoff の正本                                                          |
| task-workflow            | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`            | タスク台帳の正本                                                                               |
| lessons-learned          | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`          | 技術的教訓の蓄積先                                                                             |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Workspace Chat Panel の runtime / access capability 同期の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

ドキュメント更新の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## サブフェーズ

### Task 12-1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

**Part 1 の要件**:

- 日常の例え話を含める（`たとえば` を最低1回使用する）
- 「なぜ必要か」 → 「何をするか」の順序を維持する
- Workspace Chat Panel の streaming / file context / conversation persistence を、チャットアプリの日常体験に例えて説明する

**Part 2 の要件**:

- TypeScript インターフェース / 型定義を記載する（Phase 2 の IPC 契約設計を参照）
- API シグネチャ（`llm:stream-chat` / `llm:cancel-stream` / `conversation:create` / `conversation:addMessage`）を記載する
- エラーハンドリング（StreamError の code / retryable フィールド）を記載する
- authority 配置先（Main Process / Renderer / IPC 境界）を明確に記載する

### Task 12-2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照する。
> **P57 対策**: 設計タスクでも Phase 12 完了時点で `.claude/skills/` を実更新する。先送りしない。

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加する
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加する
- [ ] 変更履歴セクションにバージョンを追記する
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加する
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加する（**2ファイル両方必須** -- P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴を更新する
- [ ] `task-specification-creator/SKILL.md` 変更履歴を更新する

##### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `api-endpoints.md` 等の実装ステータスを「完了」に更新する

##### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001" references/` で関連仕様書を検索して更新する
- [ ] 未タスクIDがある場合、配置先判定を記録する

**検索コマンド例**:

```bash
# 関連仕様書の検索（references/配下）
grep -rn "TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001" .claude/skills/aiworkflow-requirements/references/

# 残課題テーブルでの参照検索（task-workflow.md）
grep -n "TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001" .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 未タスク指示書の関連検索
grep -rn "TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001" docs/30-workflows/unassigned-task/
```

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成する
- [ ] 再生成された topic-map.md に新規セクションの行番号が正しく反映されていることを確認する

```markdown
## 完了タスク

### タスク: TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001（{{COMPLETION_DATE}}完了）

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| ステータス | **完了**                                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動）                 |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断する:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**システム仕様同期先**:

| #   | 更新対象ファイル              | 更新内容                                                                                             |
| --- | ----------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `llm-ipc-types.md`            | AIChatRequest / StreamChatRequest 実型定義の更新（interfaces-llm.md はインデックスのため更新対象外） |
| 2   | `llm-streaming.md`            | streaming cancel 契約の更新                                                                          |
| 3   | `ui-ux-feature-components.md` | Workspace Chat Panel の zero / streaming / error 状態                                                |
| 4   | `ui-ux-navigation.md`         | workspace 導線と terminal handoff                                                                    |
| 5   | `arch-state-management.md`    | selected files / conversation state の配置                                                           |
| 6   | `task-workflow.md`            | 残課題テーブル更新、完了タスクセクション追加                                                         |
| 7   | `lessons-learned.md`          | 実装教訓（新規パターン・落とし穴がある場合）                                                         |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth 遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記する

> **P43 対策**: サブエージェントに委譲する場合、更新対象を 3 ファイル以下/エージェントに分割する。

> **SKILL 検証**: `spec-update-workflow.md` Step 1-G.3 に定義された正規経路コマンドで 3 スキル全てが Error 0件であることを確認する。

**planned wording 残存確認（P57 対策 — Task 12-2 完了前に必ず実行）**:

```bash
rg -n "仕様策定のみ|実行予定|保留として記録" \
  outputs/phase-12/ || echo "planned wording なし"
```

`planned wording なし` 以外の結果が出た場合は、対象箇所を実績ログに昇格してから次の Task に進む。

### Task 12-3: ドキュメント更新履歴 & artifacts.json 更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.json を更新する:

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment

# Step 2: Phase 12 完了登録（artifacts.json 更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**artifacts.json 必須項目**:

- Phase 12 のステータスが `completed` に更新されていること
- 全 Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成する
- 手動で `artifacts.json` を作成する（TASK-4-1 形式を参照）
- 更新したドキュメントと変更内容を一覧化する

**P4/P59 対策**: documentation-changelog.md への「完了」記載は全 Task 完了後の最終ステップとする。並列エージェントで分担した場合でも、changelog は最後にメインエージェントが統合し、`unassigned-task-detection.md` の検出件数と照合してから記録する。

### Task 12-4: 未タスク検出【必須】

| #   | ソース                  | 確認項目                      |
| --- | ----------------------- | ----------------------------- |
| 1   | Phase 3 レビュー結果    | MINOR 判定の指摘事項          |
| 2   | Phase 10 レビュー結果   | MINOR 判定の指摘事項          |
| 3   | Phase 11 手動テスト結果 | スコープ外の発見事項          |
| 4   | 各 Phase 成果物         | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース            | TODO/FIXME/HACK/XXX コメント  |

**P3 準拠 3ステップ**（検出された未タスクごとに全て実行する）:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

**P56 対策**: 再評価クローズした未タスクの GitHub Issue を `gh issue close` で同時に Close する。

**0件でも `unassigned-task-detection.md` を出力する（省略不可）。**

### Task 12-5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 -- P28）。**

| セクション         | 記載内容                                                |
| ------------------ | ------------------------------------------------------- |
| ワークフロー改善点 | Phase 実行中に発見したワークフロー上の改善提案          |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                    |
| スキル改善提案     | task-specification-creator / skill-creator への改善提案 |
| 新規 Pitfall 候補  | 06-known-pitfalls.md に追加すべき新規 Pitfall           |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### IPC機能開発時の追加更新対象ファイル（該当する場合）

本タスクは IPC チャンネル（`llm:stream-chat` / `llm:cancel-stream` / `conversation:create` / `conversation:addMessage`）を伴うため、Task 12-2 Step 2 で以下のファイルの更新要否を確認する:

| #   | 更新対象ファイル                          | 更新内容                                               | 必須/任意 |
| --- | ----------------------------------------- | ------------------------------------------------------ | --------- |
| 1   | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録             | 必須      |
| 2   | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト） | 必須      |
| 3   | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）        | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                   | 必須      |
| 5   | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加           | 必須      |
| 6   | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）           | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                 | 任意      |

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイド Part 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する:

| 層               | ドキュメント内容                                      | 更新対象                                |
| ---------------- | ----------------------------------------------------- | --------------------------------------- |
| Renderer Process | WorkspaceChatPanel 設計、useWorkspaceChatController   | `ui-ux-feature-components.md`           |
| Main Process     | streaming handler、conversation repository            | `interfaces-llm.md`, `llm-streaming.md` |
| IPC 通信         | llm:stream-chat / llm:cancel-stream / conversation:\* | `interfaces-llm.md`                     |
| データ層         | conversation 永続化スキーマ                           | `arch-state-management.md`              |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点           | 適用判断                                            | 仕様参照先                                   |
| -------------- | --------------------------------------------------- | -------------------------------------------- |
| UI/UX          | Workspace Chat Panel の UI 仕様をドキュメント化する | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ | IPC 契約と authority 配置をドキュメント化する       | `aiworkflow-requirements: architecture-*.md` |
| API 設計       | streaming / conversation IPC 契約を記録する         | `aiworkflow-requirements: interfaces-*.md`   |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

📖 詳細: `references/quality-standards.md` セクション8

## 漏れやすいポイント（06-known-pitfalls.md 参照）

| ID  | ポイント                                 | 対策                                                                |
| --- | ---------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ                | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                  | セクション変更時は必ず `generate-index.js` を実行する               |
| P27 | topic-map.md 再生成トリガー判断ミス      | 追加だけでなく削除・更新も再生成トリガーとする                      |
| P29 | SKILL.md 変更履歴の更新漏れ              | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新する          |
| P3  | 未タスク管理の3ステップ不完全            | (1) 指示書 → (2) task-workflow.md 登録 → (3) 関連仕様書リンク       |
| P4  | documentation-changelog への早期完了記載 | 全 Task 完了後に事後記録する。実行前に完了と書かない                |
| P43 | サブエージェントの rate limit 中断       | 仕様書更新は 3 ファイル以下/エージェントに分割する                  |
| P57 | 設計タスクでの仕様書更新先送り           | Phase 12 完了時点で `.claude/skills/` を実更新する。先送りしない    |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成する                                                              |
| `complete-phase.js`                   | 手動で `artifacts.json` を作成する（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各 Phase のレビュー結果・発見課題を確認し、`unassigned-task-detection.md` を作成する                                   |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認する                                                                                       |

### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

判定基準: `spec-update-workflow.md` Step 1-G.3.1 を参照する。

## 成果物

| 成果物                       | パス                                                     | 必須 | 説明                               |
| ---------------------------- | -------------------------------------------------------- | ---- | ---------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | 必須 | 概念的（Part 1）+ 技術的（Part 2） |
| 仕様同期計画                 | `outputs/phase-12/spec-update-summary.md`                | 必須 | 同期対象仕様の更新方針を整理する   |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 必須 | 更新履歴                           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 必須 | 検出結果（0件でも出力する）        |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 必須 | 改善点（0件でも出力する）          |
| 準拠チェックレポート         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 必須 | Task 12-1〜12-5 全完了の確認記録   |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`                 | 条件 | 検出時のみ作成する                 |

### 成果物ファイル名の照合チェック（バリデーションスクリプト誤検出防止）

Phase 12 の成果物ファイル名がテンプレートと一致していることを確認する。名前の不一致はバリデーションスクリプトの検出漏れを引き起こす。

| テンプレート上の名前 | 正しいファイル名                        | 誤りやすい類似名                         |
| -------------------- | --------------------------------------- | ---------------------------------------- |
| 未タスク検出レポート | `unassigned-task-detection.md`          | `unassigned-task-report.md` (NG)         |
| ドキュメント更新履歴 | `documentation-changelog.md`            | `changelog.md` (NG)                      |
| 実装ガイド           | `implementation-guide.md`               | `guide.md` (NG)                          |
| スキルフィードバック | `skill-feedback-report.md`              | `feedback.md` (NG)                       |
| 仕様書更新サマリー   | `spec-update-summary.md`                | `system-spec-update-summary.md` (代替可) |
| 準拠チェックレポート | `phase12-task-spec-compliance-check.md` | `compliance-check.md` (NG)               |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド Part 1 に日常の例え話が含まれている（`たとえば` が最低1回）
- [ ] 実装ガイド Part 1 が「なぜ必要か」 → 「何をするか」の順序である
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 実装ガイド Part 2 に TypeScript インターフェース / API シグネチャが含まれている
- [ ] 実装ガイドのテストカテゴリテーブルが Phase 6 後の実測値を反映している
- [ ] **【Task 12-2 Step 1-A】該当仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 12-2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 12-2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 12-2 Step 1-A】aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した**
- [ ] **【Task 12-2 Step 1-A】task-specification-creator/LOGS.md にタスク完了記録を追加した**（P1, P25 対策）
- [ ] **【Task 12-2 Step 1-A】aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した**（P29 対策）
- [ ] **【Task 12-2 Step 1-A】task-specification-creator/SKILL.md 変更履歴テーブルを更新した**（P29 対策）
- [ ] **【Task 12-2 Step 1-D】topic-map.md を再生成した**（P2, P27 対策）
- [ ] **【Task 12-2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 12-2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.md に記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] **未タスク検出レポートが出力されている**（0件でも必須）
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定を記録した
- [ ] **スキルフィードバックレポートが出力されている**（改善点0件でも必須 -- P28 対策）
- [ ] **`phase12-task-spec-compliance-check.md` が出力されている**（Task 12-1〜12-5 の全完了確認記録）
- [ ] **planned wording 残存確認コマンドを実行し、`planned wording なし` を確認した**（P57 対策）
- [ ] 成果物ファイル名が照合チェックテーブルの正しいファイル名と一致している
- [ ] artifacts.json が更新されている
- [ ] **artifacts.json の全完了 Phase（1-12）のステータスが completed であること**
- [ ] **苦戦箇所セクションを記録した**（0件でも「苦戦箇所なし」と明記する）
- [ ] spec sync 先が workspace chat / streaming / state 正本まで定義されている
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
- **関連Pitfall**: {{該当する場合は Pitfall ID（例: P31）}}
```

### 記録が有用なケース

| ケース             | 記録すべき内容                   |
| ------------------ | -------------------------------- |
| 予期しないエラー   | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬     | 誤解の内容、正しい理解、確認方法 |
| 設計変更           | 変更前後の設計、変更理由         |
| 時間のかかった調査 | 調査内容、発見方法、参考資料     |
| 新規 Pitfall 候補  | Pitfall ID 候補、パターン、対策  |

### 苦戦箇所を未タスク化する3ステップ（P3 準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

苦戦箇所が 0 件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成（Part 1 + Part 2）
3. Task 12-2: システムドキュメント更新（Step 1-A ~ Step 1-D + Step 2）
4. Task 12-3: ドキュメント更新履歴作成 & artifacts.json 更新
5. Task 12-4: 未タスク検出
6. Task 12-5: スキルフィードバックレポート作成
7. Task 12-6: phase12-task-spec-compliance-check.md 作成（Task 12-1〜12-5 全完了確認）
8. 完了条件の検証（planned wording 残存確認コマンド実行を含む）

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase 完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-07-workspace-chat-panel-runtime-alignment \
  --phase 12
```

## 次のPhase

- [Phase 13（PR作成）](./phase-13-pr-creation.md) に進む
