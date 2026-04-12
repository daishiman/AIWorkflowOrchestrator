# Phase 1 受け入れ基準

## メタ情報

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| タスクID | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001 |
| 作成日   | 2026-04-11                                     |

---

## 受け入れ基準（AC-1〜AC-6）

| ID   | 受け入れ基準                                                                             | 検証方法         | 優先度 |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- | ------ |
| AC-1 | `SKILL.md` の「よくある漏れ」テーブルに `[FB-04]` エントリが追加されていること           | ファイル内容確認 | 必須   |
| AC-2 | `phase12-task-spec-compliance-template.md` に三者同期チェックリストが追加されていること  | ファイル内容確認 | 必須   |
| AC-3 | 同期対象ファイル（backlog/completed/lane-index/artifacts × 2）が全件明示されていること   | ファイル内容確認 | 必須   |
| AC-4 | チェックリストが Phase 12 の必須完了条件として組み込まれていること                       | 構造確認         | 必須   |
| AC-5 | `phase-12-documentation-guide.md` の Step 1-A 手順に三者同期ステップが追記されていること | ファイル内容確認 | 必須   |
| AC-6 | `.agents/skills/` mirror が `.claude/skills/` と同期されていること                       | diff確認         | 必須   |

---

## AC詳細

### AC-1: SKILL.md FB-04エントリ

- **確認コマンド**: `grep -n "\[FB-04\]" .claude/skills/task-specification-creator/SKILL.md`
- **期待結果**: `[FB-04]` を含む行が1件以上存在すること
- **確認基準**: 漏れパターン欄に具体的な同期漏れが記述されていること

### AC-2: 三者同期チェックリスト

- **確認コマンド**: `grep -n "三者同期" .claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md`
- **期待結果**: 三者同期チェックリストセクションが存在すること
- **確認基準**: Step 1-A 完了条件の近傍に配置されていること

### AC-3: 5ファイルの明示

- **確認方法**: phase12-task-spec-compliance-template.md の三者同期セクションに5ファイル全て記載確認
- **5件一覧**:
  1. `task-workflow.md`（backlog ledger）
  2. `task-workflow-completed.md`（completed ledger）
  3. `lane/index.md`（lane index）
  4. `outputs/artifacts.json`（workflow artifacts）
  5. `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts）

### AC-4: Phase 12 必須完了条件への組み込み

- **確認方法**: phase12-task-spec-compliance-template.md の完了条件セクション確認
- **期待結果**: 三者同期チェックが完了条件として記載されていること

### AC-5: Step 1-A 手順追記

- **確認コマンド**: `grep -n "三者同期\|FB-04" .claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`
- **期待結果**: Step 1-A に三者同期手順が存在すること

### AC-6: mirror同期

- **確認コマンド**: `diff -qr .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/`
- **期待結果**: 差分0件（出力なし）
