# Phase 12: ドキュメント更新

## メタ情報

| 項目          | 値                                                                                                                                                                                                                                                                                      |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase         | 12                                                                                                                                                                                                                                                                                      |
| 機能名        | TASK-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                                                                                                                                                                                                                                            |
| 作成日        | 2026-03-14                                                                                                                                                                                                                                                                              |
| 前Phase成果物 | outputs/phase-11/manual-test-result.md                                                                                                                                                                                                                                                  |
| 成果物        | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |

## 目的

workspacePath セキュリティ検証テスト（TC-WS-01〜06）の実装を記録し、システム仕様書を更新し、
未タスクを検出・登録する。Phase 12 は漏れが最も発生しやすい Phase であり、
全チェックリスト項目を逐次確認すること。

## 実行タスク

| #    | タスク                          | 目的                                     |
| ---- | ------------------------------- | ---------------------------------------- |
| 12-1 | 実装ガイド作成                  | 概念説明 + 技術詳細のドキュメント化      |
| 12-2 | システムドキュメント更新        | LOGS.md / topic-map.md / SKILL.md の更新 |
| 12-3 | documentation-changelog.md 記録 | 全 Step 完了後に記載（P4対策）           |
| 12-4 | 未タスク検出                    | 0件でもレポート必須（P3対策）            |
| 12-5 | スキルフィードバックレポート    | 改善点なしでもレポート必須（P28対策）    |

- Task 12-1: `implementation-guide.md` を Part 1 / Part 2 構成で作成する
- Task 12-2: `system-spec-update-summary.md` に Step 1/2 の判断を記録する
- Task 12-3: `documentation-changelog.md` に変更履歴と validator 結果を記録する
- Task 12-4: `outputs/phase-12/unassigned-task-detection.md` を 0 件でも作成する
- Task 12-5: `skill-feedback-report.md` と準拠チェックを作成する

## 参照資料

依存Phase: Phase 1 / Phase 2 / Phase 5 / Phase 6 / Phase 7 / Phase 8 / Phase 9 / Phase 10 / Phase 11

### 前Phase成果物

- `outputs/phase-11/manual-test-result.md` — 手動テスト結果

### システム仕様（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md` — 実装カテゴリから正本仕様を抽出
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md` — Workspace Chat Edit AI Runtime の読む順番
- `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md` — workspacePath 境界仕様
- `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` — `SendWithContextRequest.workspacePath?` 契約
- `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md` — `chat-edit:send-with-context` IPC 契約
- `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` — sender 検証 / contextBridge / workspace 境界
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — payload 契約ドリフト再発防止
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` — 親タスク・関連未タスク同期

### ルール参照

- `.claude/rules/05-task-execution.md` — Phase 12 必須チェックリスト
- `.claude/rules/06-known-pitfalls.md` — P1, P2, P3, P4, P28, P29 の防止策

## 実行手順

### Task 12-1: 実装ガイド作成

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 概念説明（中学生でもわかるレベル）

**workspacePath 制約とは何か？**

「お店の入口で身分証を確認するように、ファイルが正しいフォルダ内にあるか検証する仕組み」。

例えば、あなたが図書館のメンバーだとする。図書館のルールとして「借りられる本は図書館内の本だけ」とある。
図書館の外にある本（他の人の家の本）を「図書館の本だ」と言って借りようとしても断られる。
workspacePath 制約はこれと同じで「チャット編集セッションで触れるファイルは、指定されたワークスペースフォルダ内のファイルだけ」というルールをコードで実装している。

**パストラバーサル攻撃とは何か？**

「`../../../etc/passwd`」のように `..` を使って本来アクセスできない上位フォルダに抜け出そうとする攻撃。
上記の図書館で言うと「図書館の本 → 隣の書斎 → さらに奥の金庫室」と次々と扉を開けて侵入しようとするようなもの。

#### Part 2: 技術詳細（開発者向け）

**テストケース設計の解説**

| TC       | パス                       | workspacePath      | 期待結果                 | 検証ポイント             |
| -------- | -------------------------- | ------------------ | ------------------------ | ------------------------ |
| TC-WS-01 | `/workspace/file.ts`       | `/workspace`       | success: true            | 正常系の基本動作         |
| TC-WS-02 | `/other/file.ts`           | `/workspace`       | PERMISSION_DENIED        | workspace 外拒否         |
| TC-WS-03 | 任意                       | 未指定 (undefined) | isAllowedPath 未呼び出し | ガードのバイパス動作確認 |
| TC-WS-04 | `/workspace/../etc/passwd` | `/workspace`       | PERMISSION_DENIED        | パストラバーサル防止     |
| TC-WS-05 | 複数 (1つが外部)           | `/workspace`       | PERMISSION_DENIED        | 複数コンテキストの厳格性 |
| TC-WS-06 | 任意                       | 空配列 `[]`        | isAllowedPath 未呼び出し | 空配列エッジケース       |

**モック戦略の技術的詳細**

- `isAllowedPath` をモック化してパス検証ロジックを分離
- `vi.spyOn` で呼び出し回数を検証（TC-WS-03, TC-WS-06 は呼び出しなしを確認）
- `ipcMain.handle` のコールバックを直接呼び出してテスト

### Task 12-2: システムドキュメント更新

#### Step 1-A: タスク完了記録（P1/P25 対策 — 2ファイル必須）

**重要**: LOGS.md は 2 箇所にある。片方の更新忘れに注意（P1 / P25 対策）。

```bash
# 更新対象 1
.claude/skills/aiworkflow-requirements/LOGS.md

# 更新対象 2
.claude/skills/task-specification-creator/LOGS.md
```

#### Step 1-B: 実装状況テーブル更新

- 本タスクは実装・検証完了のため、Phase 1-12 完了として記録する。
- ステータス判定根拠を `system-spec-update-summary.md` に残す。

追加する記録内容:

```markdown
## UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 (2026-03-14)

- workspacePath セキュリティ検証テスト実装（TC-WS-01〜06）
- 新規ファイル: apps/desktop/src/main/ipc/**tests**/chatEditHandlers.workspace-constraint.test.ts
- GitHub Issue: #1222
```

SKILL.md 変更履歴テーブル更新（P29 対策 — LOGS.md とは別に必要）:

```bash
# 更新対象 1
.claude/skills/aiworkflow-requirements/SKILL.md

# 更新対象 2
.claude/skills/task-specification-creator/SKILL.md
```

#### Step 1-C: 関連タスクテーブル確認

```bash
grep -rn "UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001" .claude/skills/aiworkflow-requirements/references/
```

検索結果に応じて関連仕様書の参照リンクを更新する。

#### Step 1-D: topic-map.md 再生成（P2/P27 対策）

```bash
cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
```

**注意**: セクションの追加だけでなく、削除・更新も再生成トリガーに含める（P27 対策）。

#### Step 2: システム仕様更新の判断

本タスクはテストコードの追加のみであり、以下の変更は含まない:

- 新規 IPC インターフェースの追加
- 既存アーキテクチャの変更
- 新規コンポーネントの追加

**判断**: API/IPC 契約本体（interfaces-_.md, api-ipc-_.md 等）の更新は不要だが、
task workflow 系の system spec（backlog/completed/LOGS）は更新が必要。

理由: `chatEditHandlers.ts` の実装本体は無変更だが、完了状態・参照パス・Phase 11 証跡の同期漏れがあったため。

### Task 12-3: documentation-changelog.md 記録

成果物: `outputs/phase-12/documentation-changelog.md`

**P4 対策**: 全 Step 確認前に「完了」と記載しない。各 Step の実行後に結果を事後記録する。

記録フォーマット:

```markdown
# Documentation Changelog - UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001

## Step 1-A: タスク完了記録

- [ ] aiworkflow-requirements/LOGS.md: 更新完了
- [ ] task-specification-creator/LOGS.md: 更新完了
- [ ] aiworkflow-requirements/SKILL.md: 変更履歴更新完了
- [ ] task-specification-creator/SKILL.md: 変更履歴更新完了

## Step 1-C: 関連タスクテーブル

- [ ] grep 実行結果: (結果を記録)
- [ ] 関連仕様書更新: (更新した仕様書を記録、なければ「対象なし」)

## Step 1-D: topic-map.md 再生成

- [ ] generate-index.js 実行完了

## Step 2: システム仕様更新

- 判断: API/IPC 契約本体は更新不要、task workflow 系 system spec は更新あり
- 理由: 実装本体は無変更だが、完了台帳・参照path・証跡同期が必要

## Step 3: IPC 契約検証

- 判断: 不要（IPC ハンドラの変更なし）
```

### Task 12-4: 未タスク検出（P3 対策）

成果物: `outputs/phase-12/unassigned-task-detection.md`

**P3 対策**: 検出した未タスクは 3 ステップ全完了が必要:

1. `tasks/unassigned-task/` に指示書作成
2. `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-workspace-chat-lifecycle-tests.md` の残課題テーブルに登録
3. 関連仕様書に参照リンク追加

**P38 対策**: 未タスク指示書の配置先は `tasks/unassigned-task/` （`tasks/` 直下ではない）。

0件でもレポートを作成すること。フォーマット:

```markdown
# 未タスク検出レポート - UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001

## 検出日: 2026-03-14

## 検出件数: N 件

## 検出した未タスク

（0件の場合は「未タスクなし」と明記）

## 3ステップ完了確認

| #   | タスク ID | ①指示書作成 | ②task-workflow.md | ③関連仕様書リンク |
| --- | --------- | ----------- | ----------------- | ----------------- |
```

**P56 対策**: 再評価クローズした場合は対応 GitHub Issue を `gh issue close` で同時 Close する。

### Task 12-5: スキルフィードバックレポート（P28 対策）

成果物: `outputs/phase-12/skill-feedback-report.md`

**P28 対策**: 「改善点なし」でもレポートを作成すること。

フォーマット:

```markdown
# スキルフィードバックレポート - UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001

## 作成日: 2026-03-14

## ワークフロー改善点

（改善点がない場合は「本タスクにおいてワークフロー改善点なし」と明記）

## 既知の落とし穴への対応状況

| Pitfall                           | 対応                         |
| --------------------------------- | ---------------------------- |
| P1: LOGS.md 2ファイル更新漏れ     | 対応済み（Step 1-A で明示）  |
| P2: topic-map.md 再生成忘れ       | 対応済み（Step 1-D で実施）  |
| P3: 未タスク管理の3ステップ       | 対応済み（Task 12-4 で実施） |
| P4: 早期「完了」記載              | 対応済み（事後記録方式）     |
| P28: フィードバックレポート未作成 | 対応済み（本レポート）       |
| P29: SKILL.md 変更履歴更新漏れ    | 対応済み（Step 1-A で明示）  |
```

## 多角的チェック観点（AI が判断）

| 観点     | チェック内容                                                   |
| -------- | -------------------------------------------------------------- |
| P1 対策  | LOGS.md が 2 箇所とも更新されていること                        |
| P2 対策  | topic-map.md が再生成されていること                            |
| P3 対策  | 未タスクが 3 ステップ全て完了していること                      |
| P4 対策  | documentation-changelog が事後記録方式で記載されていること     |
| P29 対策 | SKILL.md の変更履歴テーブルも更新されていること                |
| P38 対策 | 未タスク指示書が `tasks/unassigned-task/` に配置されていること |

## 成果物

- `outputs/phase-12/implementation-guide.md` — 実装ガイド（Part 1 + Part 2）
- `outputs/phase-12/system-spec-update-summary.md` — Step 1 / Step 2 判定記録
- `outputs/phase-12/documentation-changelog.md` — 全 Step の実行結果記録
- `outputs/phase-12/unassigned-task-detection.md` — 未タスク検出レポート（0件でも必須）
- `outputs/phase-12/skill-feedback-report.md` — スキルフィードバックレポート
- `outputs/phase-12/phase12-task-spec-compliance-check.md` — Task 12-1〜12-5 準拠チェック

## 完了条件

- [x] `outputs/phase-12/implementation-guide.md` が作成されていること（Part 1 中学生レベル必須）
- [x] `outputs/phase-12/system-spec-update-summary.md` が作成されていること（Step 1/2 判定を記録）
- [x] LOGS.md が 2 箇所とも更新されていること（P1 対策）
- [x] SKILL.md 変更要否を判定し、今回は運用更新のみで不要と記録されていること（P29 対策）
- [x] topic-map.md が再生成されていること（P2 対策）
- [x] システム仕様更新の判断が記録されていること（workflow spec 更新を明記）
- [x] `outputs/phase-12/documentation-changelog.md` が事後記録方式で完成していること（P4 対策）
- [x] `outputs/phase-12/unassigned-task-detection.md` が作成されていること（0件でも必須）
- [x] 未タスクがある場合は 3 ステップ全て完了していること（P3 対策）
- [x] `outputs/phase-12/skill-feedback-report.md` が作成されていること（P28 対策）
- [x] `outputs/phase-12/phase12-task-spec-compliance-check.md` が作成されていること
- [x] `artifacts.json` と `outputs/artifacts.json` が同期していること
- [x] `artifacts.json` の Phase 12 ステータスが `completed` に更新されていること
- [x] 本 Phase 内の全タスクを 100% 実行完了していること

## サブタスク管理

| ID   | タスク                          | 状態      |
| ---- | ------------------------------- | --------- |
| 12-1 | 実装ガイド作成                  | completed |
| 12-2 | システムドキュメント更新        | completed |
| 12-3 | documentation-changelog.md 記録 | completed |
| 12-4 | 未タスク検出                    | completed |
| 12-5 | スキルフィードバックレポート    | completed |

## タスク 100% 実行確認【必須】

Phase 12 完了前に以下を確認すること:

- [x] Task 12-1: implementation-guide.md 作成完了
- [x] Task 12-2 Step 1-A: LOGS.md 2 箇所更新完了
- [x] Task 12-2 Step 1-B: 実装状況テーブル更新（完了判定記録）完了
- [x] Task 12-2 Step 1-A: SKILL.md は変更要否判定の結果、今回は更新不要と記録
- [x] Task 12-2 Step 1-C: 関連タスクテーブル確認完了
- [x] Task 12-2 Step 1-D: topic-map.md 再生成完了
- [x] Task 12-2 Step 2: システム仕様更新判断を記録完了
- [x] Task 12-3: documentation-changelog.md 完成（全 Step 確認後）
- [x] Task 12-4: unassigned-task-detection.md 作成完了
- [x] Task 12-5: skill-feedback-report.md 作成完了
- [x] Task 12-5: phase12-task-spec-compliance-check.md 作成完了
- [x] artifacts.json Phase 12 ステータス `completed` に更新完了

## 次の Phase

Phase 13: PR 作成 (`phase-13-pr-creation.md`)
