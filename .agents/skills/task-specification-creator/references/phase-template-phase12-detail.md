# Phase Template Phase12 詳細

> 親ファイル: [phase-templates.md](phase-templates.md)
> 補足: [phase-template-phase12.md](phase-template-phase12.md)

## 対象

Phase 12: ドキュメント更新の詳細テンプレート（5タスク全体の手順・成果物・完了条件）。

---

## 詳細テンプレート

`````markdown
# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 12               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

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

## 実行タスク

| Task | 内容 | 主成果物 |
| ---- | ---- | -------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md` |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/system-spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成 | `outputs/phase-12/documentation-changelog.md` |
| Task 12-4 | 未タスク検出（残課題の検出と記録） | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成 | `outputs/phase-12/skill-feedback-report.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと。

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

**validator 安定化ルール**:
- Part 1 の「日常の例え」段落には `たとえば` を最低1回含める
- Part 1 は「なぜ必要か」→「何をするか」の順序を維持する

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録
- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

##### Step 1-B: 実装状況テーブル更新（該当する場合）
- [ ] api-endpoints.md等の実装ステータスを「完了」に更新

##### Step 1-C: 関連タスクテーブル更新（該当する場合）
- [ ] `grep -rn "TASK_ID" references/` で関連仕様書を検索して更新
- [ ] 未タスクIDがある場合、配置先判定を記録

**検索コマンド例**:
```bash
grep -rn "TASK-UI-03" .claude/skills/aiworkflow-requirements/references/
grep -n "TASK-UI-03" .claude/skills/aiworkflow-requirements/references/task-workflow.md
grep -rn "TASK-UI-03" docs/30-workflows/unassigned-task/
```

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

```markdown
## 完了タスク

### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | {{TASK_ID}}                  |
| ステータス | **完了**                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動） |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。
```

#### Step 2: システム仕様更新【条件付き】

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

**設計タスク（type: design）の場合（P57 対策）**:
- 設計で確定した仕様（型定義・状態遷移・インターフェース）は、対応する仕様書に**設計確定セクション**として実反映する
- 「実装タスク完了後に更新」と先送りしない（P57 再発防止）
- 型定義ファイルが未作成で `arch-state-management.md` 等への追記が困難な場合は、UI/UX 仕様書（`ui-ux-*.md`）に設計仕様セクションを追加する
- `system-spec-update-summary.md` には実施状態を「実施済み」「一部実施済み」等の実績で記録する（「計画のみ」は原則不可）

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/{{FEATURE_NAME}}

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**: 手動で `outputs/phase-12/documentation-changelog.md` と `artifacts.json` を作成。

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

### Task 5: スキルフィードバックレポート作成【必須】

**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案         |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                  |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案  |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall           |

### IPC機能開発時の追加更新対象ファイル（該当する場合）

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン                                 | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧                                    | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

## アーキテクチャ層別ドキュメント（AIが判断）

| 層                 | ドキュメント内容                            | 更新対象                        |
| ------------------ | ------------------------------------------- | ------------------------------- |
| Renderer Process   | コンポーネント設計、状態管理、Hooks使用方法 | `ui-ux-*.md`, `interfaces-*.md` |
| Main Process       | サービス設計、ビジネスロジック、API仕様     | `architecture-*.md`, `api-*.md` |
| IPC通信            | チャンネル定義、リクエスト/レスポンス型     | `interfaces-*.md`, `api-*.md`   |
| Preload            | 公開API一覧、セキュリティ考慮事項           | `security-api-electron.md`      |
| データ層           | スキーマ定義、リポジトリパターン            | `database-*.md`                 |
| エラーハンドリング | エラーコード、エラーメッセージ、復旧手順    | `error-handling.md`             |

## 苦戦箇所の記録【推奨】

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

苦戦箇所を未タスク化する3ステップ（P3準拠）:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

## 成果物

| 成果物                     | パス                                            | 必須 | 説明                         |
| -------------------------- | ----------------------------------------------- | ---- | ---------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント    |
| ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                     |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須）   |
| 未完了タスク指示書         | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成               |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1】task-specification-creator/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した** ⚠️ 漏れやすい（P2, P27参照）
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] artifacts.jsonが更新されている
- [ ] **苦戦箇所セクションを記録した**
- [ ] **本Phase内の全タスクを100%実行完了**

## フォールバック手順

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成                                                                               |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成                                                                                           |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |

#### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

## 次のPhase

Phase 13: PR作成
`````

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID | ポイント | 対策 |
| -- | -------- | ---- |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2 | topic-map.md 再生成忘れ | セクション変更時は必ず `generate-index.js` を実行 |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー |
| P29 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P3 | 未タスク管理の3ステップ不完全 | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク |

## 関連ガイド

- [phase-template-phase12.md](phase-template-phase12.md) — 設計タスク向け補足（SF-02, SF-03対応）
- [phase-12-documentation-guide.md](phase-12-documentation-guide.md) — Task 12-1〜12-6 の詳細手順
- [spec-update-workflow.md](spec-update-workflow.md) — Step 1/2 の実行フロー
