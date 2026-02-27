# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                                                                       |
| --------- | ------------------------------------------------------------------------ |
| Phase     | 12                                                                       |
| 機能名    | TASK-9A-skill-editor                                                     |
| 作成日    | 2026-02-26                                                               |
| 前提Phase | Phase 11（手動テスト検証）完了                                           |
| 目的      | 実装内容をシステム仕様に反映し、技術ドキュメントを作成し、未タスクを検出 |

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
   - P29: SKILL.md 変更履歴の更新漏れ
   - P43: Phase 12 サブエージェントの rate limit 中断

## 実行タスク

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システムドキュメント更新（2ステップ）
- Task 3: ドキュメント更新履歴 & artifacts.json更新
- Task 4: 未タスク検出レポート作成
- Task 5: スキルフィードバックレポート作成

## 参照資料

| 資料名                   | パス                                                                                    | 説明                      |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物            |
| Phase 2 設計成果物       | `outputs/phase-2/`                                                                      | 設計判断根拠              |
| Phase 5 実装成果物       | `outputs/phase-5/`                                                                      | 実装コード・仕様反映対象  |
| Phase 6 テスト成果物     | `outputs/phase-6/`                                                                      | 追加テストと補強内容      |
| Phase 7 カバレッジ成果物 | `outputs/phase-7/`                                                                      | カバレッジ最終判定        |
| Phase 8 リファクタ成果物 | `outputs/phase-8/`                                                                      | 設計改善内容              |
| Phase 9 品質成果物       | `outputs/phase-9/`                                                                      | 品質保証証跡              |
| Phase 10 レビュー結果    | `outputs/phase-10/final-review-result.md`                                               | 最終レビュー判定          |
| Phase 11 ウォークスルー  | `outputs/phase-11/walkthrough-log.md`                                                   | 手順再現ログ・詰まり箇所  |
| セキュリティAPI仕様      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`            | セキュリティ検証パターン  |
| エラーハンドリング仕様   | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                   | エラーカテゴリ            |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`            | レイヤー構成・IPC登録一覧 |
| 仕様更新ワークフロー     | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | Phase 12更新手順          |
| Phase 11/12ガイド        | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | ドキュメント更新詳細      |
| 技術ドキュメントガイド   | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | 実装ガイド記述ルール      |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                    | 過去インシデントの教訓    |

---

## Task 1: 実装ガイド作成【必須・2パート構成】

### 概要

| パート | 対象読者             | 内容                                                          |
| ------ | -------------------- | ------------------------------------------------------------- |
| Part 1 | 初学者・中学生レベル | 概念説明（日常の例え話必須、専門用語なし）                    |
| Part 2 | 開発者・技術者       | 技術的詳細（TypeScript型定義、API使用例、エラーハンドリング） |

### Part 1: 概念的説明（中学生レベル）

**記述ルール**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 図表より文章での説明を優先
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**テンプレート**:

```markdown
### スキルエディターとは何か

#### 日常生活での例え

[ノートの編集に例える。ノートの各ページを開いて読んだり、書き換えたり、
書き換える前に下書きコピーを取っておいて、失敗したら元に戻せるようにする仕組み]

#### この機能でできること

| 機能               | 説明                                   | 例                     |
| ------------------ | -------------------------------------- | ---------------------- |
| ファイル読み込み   | スキルの設定ファイルを開いて中身を見る | SKILL.mdを表示         |
| ファイル編集・保存 | 設定を書き換えて保存する               | 説明文を変更           |
| バックアップ・復元 | 変更前の内容を自動保存し、元に戻せる   | 間違えた編集を取り消し |
```

### Part 2: 技術的詳細（開発者向け）

以下を含めること:

- IPCチャンネル6つの一覧と型定義
- SkillFileManagerのバックアップ・リストアの仕組み
- `~/.aiworkflow/skills/`（読み書き可能）と `~/.claude/skills/`（読み取り専用）のディレクトリ制御
- エラーハンドリング（ENOENT、EACCES、パストラバーサル防止）
- Preload APIの使用例（safeInvoke経由）
- SkillEditor UIコンポーネントの構造

### 成果物

| 成果物     | パス                                       |
| ---------- | ------------------------------------------ |
| 実装ガイド | `outputs/phase-12/implementation-guide.md` |

---

## Task 2: システムドキュメント更新【必須・Step 1-A〜1-G + Step 2】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1: タスク完了記録【必須・全タスク】

#### Step 1-A: 仕様書完了記録

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加（**2ファイル両方必須** — P1, P25）
- [ ] `aiworkflow-requirements/SKILL.md` 変更履歴更新
- [ ] `task-specification-creator/SKILL.md` 変更履歴更新

**完了タスクセクションのテンプレート**:

```markdown
## 完了タスク

### タスク: TASK-9A-skill-editor（2026-02-26完了）

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-9A                   |
| ステータス | **完了**                  |
| テスト数   | {{N}}（自動）+ 12（手動） |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `api-endpoints.md` 等の実装ステータスを「完了」に更新
- [ ] 更新対象パスを `test -f <path>` で実在確認してから更新（参照切れ誤更新の防止）

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-9A" references/` で関連仕様書を検索して更新

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** — P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/TASK-9A-skill-editor --regenerate` を実行して index/リンク情報を再同期
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）

- [ ] 検出時は `docs/30-workflows/unassigned-task/` に指示書を作成し、`task-workflow.md` と関連仕様書へリンクを追加
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れ0件を確認
- [ ] `audit-unassigned-tasks.js --json --target-file <path>` または `--diff-from <ref>` を実行し、`currentViolations.total` を記録
- [ ] scope未指定の `audit-unassigned-tasks.js --json` を実行し、baseline監視結果を別枠で記録

#### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）

- [ ] CI/CD・Lint・テスト基盤を変更した場合は `technology-devops.md`、`deployment-gha.md`、`quality-requirements.md` を更新
- [ ] 対象外の場合は `spec-update-summary.md` に「Step 1-F: 該当なし（理由）」を明記

#### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

前提: すべてのコマンドはリポジトリルート（`AIWorkflowOrchestrator/`）をカレントディレクトリとして実行する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/TASK-9A-skill-editor --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-skill-editor
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

**Step 1-G.1: baseline / current 分離監査（全体FAIL誤判定防止）**

- [ ] `audit-unassigned-tasks` の全体FAIL時は `currentViolations.total` を合否判定に使用し、`baselineViolations.total` は別記録する
- [ ] 判定結果を `spec-update-summary.md` に `baseline: N件 / current: M件` 形式で記録する

**Step 1-G.2: SKILL検証の判定基準（`spec-update-workflow.md` Step 1-G.3.1 準拠）**

| 分類   | 判定基準                                                                                   | 対応                                                  |
| ------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| 合格   | `quick_validate.js` 3スキル全てで Error 0件                                                | Phase 12継続                                          |
| 要監視 | Warning が新規発生、または前回より増加                                                     | `spec-update-summary.md` に記録し、次回対応方針を明記 |
| 要対応 | Warning がスキル構造の正確性に直接影響（必須セクション欠落、name不一致、agents形式崩れ等） | 本Phaseで修正、修正不可なら未タスク化                 |

> fallback: Node.js が使えない環境でのみ `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` を使用し、成果物に fallback 経路を明記する。

### Step 2: システム仕様更新【条件付き】

**更新判断基準**:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ     |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**TASK-9AはIPC機能開発のため、以下の追加更新対象を確認すること**:

| #   | 更新対象ファイル                          | 更新内容                                                                     | 必須/任意 |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------- | --------- |
| 1   | `api-ipc-agent.md`                        | 新規チャンネル一覧（skill:readFile等6チャンネル）、型定義、完了タスク        | 必須      |
| 2   | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト、パストラバーサル防止） | 必須      |
| 3   | `architecture-overview.md`                | IPCハンドラー登録一覧（registerSkillFileHandlers追加）                       | 必須      |
| 4   | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                                         | 必須      |
| 5   | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加                                 | 必須      |
| 6   | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）                                 | 任意      |
| 7   | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                                       | 任意      |

> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する。LOGS.mdへの「完了」記録は全ファイル更新後の最終ステップとする。

### 成果物

| 成果物           | パス                                      |
| ---------------- | ----------------------------------------- |
| 仕様更新サマリー | `outputs/phase-12/spec-update-summary.md` |

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

### 実行手順

```bash
# Step 1: ドキュメント更新履歴生成（スクリプトが存在する場合）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/TASK-9A-skill-editor

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-9A-skill-editor \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/spec-update-summary.md:仕様更新サマリー,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

**スクリプト未存在時の代替手順**:

| スクリプト                            | 代替手順                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成                                         |
| `complete-phase.js`                   | 手動で `artifacts.json` を作成（参照: `docs/30-workflows/completed-tasks/` 内の既存artifacts.json） |

**artifacts.json必須項目**:

- Phase 12のステータスが `completed` に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics` セクションに品質指標が記録されていること

### 記録上の注意

- DON'T: 全 Step 確認前に documentation-changelog.md に「完了」と記載しない（P4対策）
- DO: 各 Step の完了結果を詳細に記録すること（漏れの可視化）

### 成果物

| 成果物               | パス                                                 |
| -------------------- | ---------------------------------------------------- |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`        |
| artifacts.json       | `outputs/artifacts.json` + ルートの `artifacts.json` |

---

## Task 4: 未タスク検出レポート作成【0件でも出力必須】

### 確認ソース

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | Phase 11ウォークスルー | 手順詰まり・再現性課題        |
| 5   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 6   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

### 検出方法

```bash
# コードベース内のTODO/FIXMEスキャン
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc \
  --output docs/30-workflows/TASK-9A-skill-editor/outputs/phase-12/.tmp-unassigned-candidates.json
```

### 未タスク発見時の3ステップ（P3準拠 — 全ステップ完了必須）

1. `docs/30-workflows/unassigned-task/` に指示書を作成する（`tasks/` 直下は不可 — P38対策）
2. `task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書に未タスク参照リンクを追加する

### 0件の場合の出力形式

```markdown
## 検出結果サマリー

| ソース                     | 検出数  |
| -------------------------- | ------- |
| Phase 3レビュー結果        | 0件     |
| Phase 10レビュー結果       | 0件     |
| Phase 11手動テスト結果     | 0件     |
| コードベース（TODO/FIXME） | 0件     |
| **合計**                   | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

### 監査コマンド

```bash
# 対象監査（今回変更分の合否）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/<今回対象ファイル>.md

# 全体監査（baseline監視）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 未タスクリンク参照切れチェック
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

### 成果物

| 成果物               | パス                                                   |
| -------------------- | ------------------------------------------------------ |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`        |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/*.md`（検出時のみ） |

---

## Task 5: スキルフィードバックレポート作成【改善点なしでも出力必須】

### 確認観点

| 観点             | 確認内容                                     |
| ---------------- | -------------------------------------------- |
| テンプレート改善 | Phaseテンプレートの不足・曖昧な判定条件      |
| ワークフロー改善 | 自動検証化できるチェックポイント             |
| ドキュメント改善 | 横断ガイドライン化すべき知見                 |
| 新規Pitfall候補  | 06-known-pitfalls.mdに追加すべき新規パターン |

### 成果物

| 成果物                       | パス                                        |
| ---------------------------- | ------------------------------------------- |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md` |

---

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下のテンプレートで記録する。

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

### 記録が有用なケース

| ケース                               | 記録すべき内容                   |
| ------------------------------------ | -------------------------------- |
| 予期しないエラー                     | エラーメッセージ、原因、解決策   |
| 仕様理解の齟齬                       | 誤解の内容、正しい理解、確認方法 |
| 設計変更                             | 変更前後の設計、変更理由         |
| 時間のかかった調査                   | 調査内容、発見方法、参考資料     |
| 06-known-pitfalls.mdに追加すべき教訓 | Pitfall ID候補、パターン、対策   |

苦戦箇所を記録した場合は、P3準拠の3ステップで未タスク化する。苦戦箇所が0件の場合でも「苦戦箇所なし（0件）」を明記する。

---

## アーキテクチャ層別ドキュメント

実装ガイドPart 2（技術的詳細）では、以下の層別にドキュメントを作成する:

| 層                 | ドキュメント内容                                   | 更新対象                              |
| ------------------ | -------------------------------------------------- | ------------------------------------- |
| Renderer Process   | SkillEditorコンポーネント設計、状態管理            | `ui-ux-*.md`, `interfaces-*.md`       |
| Main Process       | SkillFileManagerサービス設計、バックアップロジック | `architecture-*.md`, `api-*.md`       |
| IPC通信            | 6チャンネル定義、リクエスト/レスポンス型           | `interfaces-*.md`, `api-ipc-agent.md` |
| Preload            | 公開API一覧、safeInvoke使用パターン                | `security-api-electron.md`            |
| エラーハンドリング | エラーコード、エラーメッセージ、復旧手順           | `error-handling.md`                   |

---

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID  | ポイント                                | 対策                                                                |
| --- | --------------------------------------- | ------------------------------------------------------------------- |
| P1  | LOGS.md 2ファイル更新漏れ               | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2  | topic-map.md 再生成忘れ                 | セクション変更時は必ず `generate-index.js` を実行                   |
| P3  | 未タスク管理の3ステップ不完全           | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 |
| P4  | documentation-changelogへの早期「完了」 | 全Step確認前に「完了」と記載しない                                  |
| P27 | topic-map.md 再生成トリガー判断ミス     | 追加だけでなく削除・更新も再生成トリガー                            |
| P29 | SKILL.md 変更履歴の更新漏れ             | LOGS.mdとは別にSKILL.mdの変更履歴テーブルも必ず更新                 |
| P38 | 未タスク配置ディレクトリ間違い          | `unassigned-task/` に配置。親タスクの `tasks/` ではない             |
| P43 | サブエージェントのrate limit中断        | 仕様書更新は3ファイル以下/エージェントに分割                        |

---

## 成果物一覧

| 成果物                       | パス                                            | 必須 | 説明                        |
| ---------------------------- | ----------------------------------------------- | ---- | --------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント   |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | Step 1-A〜Step 2の実施結果  |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                    |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力必須） |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須）  |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成              |

---

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド Part 1（中学生レベル概念説明 — 日常例え必須）が作成されている
- [ ] 実装ガイド Part 2（開発者向け技術的詳細）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している

### Task 2: システムドキュメント更新

- [ ] 【Step 1-A】該当する仕様書に「完了タスク」セクションを追加した
- [ ] 【Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] 【Step 1-A】変更履歴セクションにバージョンを追記した
- [ ] 【Step 1-A】`aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加した
- [ ] 【Step 1-A】`task-specification-creator/LOGS.md` にタスク完了記録を追加した（**2ファイル両方** — P1, P25）
- [ ] 【Step 1-A】`aiworkflow-requirements/SKILL.md` 変更履歴テーブルを更新した ⚠️ 漏れやすい（P29）
- [ ] 【Step 1-A】`task-specification-creator/SKILL.md` 変更履歴テーブルを更新した ⚠️ 漏れやすい（P29）
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル（`skill-creator` / `task-specification-creator` / `aiworkflow-requirements`）を検証し、Error 0件を確認した
- [ ] Warning が出た場合、Step 1-G.2 の3段階分類（要監視/要対応）で判定し、`spec-update-summary.md` に記録した
- [ ] 【Step 1-B】実装状況テーブルを「完了」に更新した（該当する場合）
- [ ] 【Step 1-B】更新対象パスを `test -f` で実在確認してから更新した
- [ ] 【Step 1-C】`grep -rn "TASK-9A" references/` で関連タスクテーブルを全件確認した
- [ ] 【Step 1-D】topic-map.mdを再生成した ⚠️ 漏れやすい（P2, P27）
- [ ] 【Step 1-D】`task-specification-creator/scripts/generate-index.js --regenerate` で workflow index を再同期した
- [ ] 【Step 1-E】未タスク検出時に `unassigned-task/` 作成→`task-workflow.md` 登録→関連仕様リンク更新を完了した
- [ ] 【Step 1-E】`verify-unassigned-links.js` 実行結果を記録した
- [ ] 【Step 1-E】`audit-unassigned-tasks` の `currentViolations.total` を記録し、baselineと分離した
- [ ] 【Step 1-F】DevOps関連更新の要否を判断し、`spec-update-summary.md` に結果（更新/該当なし）を記録した
- [ ] 【Step 1-G】`verify-all-specs.js` と `validate-phase-output.js` を順次実行し、PASSを確認した
- [ ] 【Step 1-G】`quick_validate.js` 3スキル実行結果（Error 0件）を記録した
- [ ] 【Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した
- [ ] 【Step 2】IPC追加更新対象7ファイルの更新要否を全件確認した
- [ ] 【Step 2】苦戦箇所をシステム仕様書（`lessons-learned.md` または関連 `interfaces-*.md`）に記録した
- [ ] `outputs/phase-12/spec-update-summary.md` を作成し、Step 1-A〜Step 2の実施結果を記録した

### Task 3: ドキュメント更新履歴

- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] 各Stepの完了結果が詳細に記録されている（漏れの可視化）
- [ ] artifacts.jsonが更新されている
- [ ] artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること
- [ ] `artifacts.json` と `outputs/artifacts.json` の両方を同期し、参照切れが0件であること
- [ ] Phase 11成果物（`manual-test-result.md` / `discovered-issues.md` / `walkthrough-log.md`）が Phase 12 更新判定の入力として参照されていること

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 検出時、未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている ⚠️（P38対策）
- [ ] 検出時、**3ステップ全完了**（①指示書作成 → ②task-workflow.md登録 → ③関連仕様書リンク）
- [ ] 検出時、**関連ファイル調査**（同様パターンの他ファイル）を実施した
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、参照切れが0件
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file <今回対象ファイル>` を実行し、`currentViolations.total = 0` を確認した
- [ ] `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行し、baseline監視結果を記録した
- [ ] 完了済み未タスク指示書が `unassigned-task/` に残置されていない（完了時は `completed-tasks/unassigned-task/` へ移管）
- [ ] **未実施**タスク指示書が `completed-tasks/unassigned-task/` に混在していない

### Task 5: スキルフィードバック

- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】

### 品質確認

- [ ] テスト数が実際の `it()` ブロック数と一致すること（実測値を使用） ⚠️ P37対策
- [ ] 【品質】ESLintキャッシュをクリアしてlintを再実行した
- [ ] 【品質】コメントフォーマット（JSDoc形式）が統一されている
- [ ] `.claude/rules/` の技術的負債テーブルが最新
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 12 自動化コマンド

```bash
# topic-map.md再生成（Step 1-D）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/TASK-9A-skill-editor \
  --regenerate

# Step 1-G: 仕様書整合検証
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/TASK-9A-skill-editor \
  --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/TASK-9A-skill-editor

# SKILL frontmatter検証（Error 0件が合格。WarningはStep 1-G.2で判定）
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done

# 未タスク監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --diff-from HEAD

# 未タスクリンク検証
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js

# TODO/FIXMEスキャン
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/ipc \
  --output docs/30-workflows/TASK-9A-skill-editor/outputs/phase-12/.tmp-unassigned-candidates.json

# ESLintキャッシュクリア
rm -rf node_modules/.cache/eslint-*
pnpm lint --cache=false

# 未使用importの自動修正
pnpm lint --fix

# 未実施タスク誤配置チェック
rg -n "^\\| ステータス\\s*\\|.*未着手|^\\| ステータス\\s*\\|.*未実施|^\\| ステータス\\s*\\|.*進行中" \
  docs/30-workflows/completed-tasks/unassigned-task -g "*.md"
```

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2: システムドキュメント更新（Step 1-A〜1-G + Step 2）
4. Task 3: ドキュメント更新履歴 & artifacts.json更新
5. Task 4: 未タスク検出レポート作成
6. Task 5: スキルフィードバックレポート作成
7. 苦戦箇所の記録
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜5）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9A-skill-editor --phase 12
```

## 次のPhase

Phase 13: PR作成
