---
name: github-issue-manager
description: |
  GitHub Issueを`gh` CLIで管理し、タスク仕様書との双方向連携・ローカル同期・スコアリング選択を実現するスキル。

  Anchors:
  • task-specification-creator / 適用: メタ情報・Issue構造 / 目的: フォーマット互換性確保
  • gh CLI (GitHub CLI) / 適用: Issue操作 / 目的: create/list/edit/close
  • Progressive Disclosure / 適用: 必要時のみリソース読み込み / 目的: コンテキスト効率化

  Trigger:
  GitHub Issue管理, Issue作成, Issue選択, 最適タスク選定, タスク仕様書→Issue化
  Use when managing GitHub issues, creating issues from task specs, or selecting optimal next task.
tags:
  - github
  - issue
  - task-management
  - gh-cli
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# GitHub Issue Manager

## 概要

GitHub Issueを`gh` CLIで操作し、タスク仕様書との双方向連携を実現するスキル。
ローカル同期（`docs/30-workflows/issues/`）により高速検索が可能。

## モード一覧

| モード       | 用途                       | スクリプト            |
| ------------ | -------------------------- | --------------------- |
| **sync**     | GitHub↔ローカル同期        | `sync_issues.js`      |
| **sync-new** | 未同期仕様書→Issue一括作成 | `sync_new_issues.js`  |
| **create**   | 仕様書→Issue作成           | `create_issue.js`     |
| **select**   | 最適Issue選択              | `select_issue.js`     |
| **list**     | Issue一覧（フィルタ対応）  | `list_issues.js`      |
| **update**   | Issue更新                  | `update_issue.js`     |
| **close**    | Issueクローズ              | `close_issue.js`      |
| **relink**   | Issue↔仕様書再リンク       | `relink_issues.js`    |
| **label**    | 全Issueにラベル一括付与    | `label_all_issues.js` |

---

# Part 1: クイックスタート

## 初期セットアップ（初回のみ）

```bash
# ラベル作成
node .claude/skills/github-issue-manager/scripts/init_labels.js

# GitHub→ローカル同期
node .claude/skills/github-issue-manager/scripts/sync_issues.js
```

## 基本ワークフロー

```
1. /task-specification-creator で仕様書作成
   → docs/30-workflows/unassigned-task/task-xxx.md
       ↓
2. 【自動】Claude Code Hookにより自動Issue作成/更新
   → GitHub Issue作成 + ラベル自動付与
   → issue_number が仕様書に自動書き戻し
       ↓
3. 仕様書編集 → 自動でGitHub Issue更新
       ↓
4. 最適Issue選択: node scripts/select_issue.js
   → スコア上位5件を表示、推奨理由付き
       ↓
5. 選択後、実装開始
```

## 双方向同期

タスク仕様書（`docs/30-workflows/unassigned-task/task-*.md`）とGitHub Issueが双方向に連動。

### 仕様書 → GitHub（自動）

```
仕様書作成/編集
    ↓ Claude Code Hook
GitHub Issue 作成/更新
    ↓
issue_number を仕様書に書き戻し
```

### GitHub → 仕様書（手動）

```bash
node .claude/skills/github-issue-manager/scripts/sync_issues.js
# GitHub上のステータス変更を仕様書に反映
```

## 自動Issue同期（Claude Code Hook）

`docs/30-workflows/unassigned-task/task-*.md` へのWrite/Edit操作時に自動でIssue作成/更新。

- **フックファイル**: `.claude/hooks/auto-create-issue.sh`
- **設定場所**: `.claude/settings.local.json` の PostToolUse
- **動作**:
  - `issue_number` なし → Issue新規作成、番号を書き戻し
  - `issue_number` あり → 既存Issue更新

## 自動Issueクローズ（削除時）

仕様書ファイルが削除されると、対応するIssueが自動でクローズされる。

- **フックファイル**:
  - `.claude/hooks/pre-delete-spec.sh` (PreToolUse)
  - `.claude/hooks/post-delete-spec.sh` (PostToolUse)
- **動作**:
  - 削除前: `issue_number`をキャッシュ
  - 削除後: Issueをクローズ、`status:completed`ラベル付与

---

# Part 2: コマンドリファレンス

## sync: GitHub↔ローカル同期

```bash
node .claude/skills/github-issue-manager/scripts/sync_issues.js           # GitHub→ローカル
node .claude/skills/github-issue-manager/scripts/sync_issues.js --all     # 閉じたIssue含む
node .claude/skills/github-issue-manager/scripts/sync_issues.js --push    # ローカル→GitHub
```

## sync-new: 未同期仕様書→Issue一括作成

`issue_number`を持たないタスク仕様書を検出し、GitHub Issueを一括作成。
**PR作成前**や**git merge/stash後**に実行推奨（Claude Code Hookが発火しないケース対応）。

```bash
node .claude/skills/github-issue-manager/scripts/sync_new_issues.js           # 新規Issue作成
node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --dry-run # 変更内容を確認のみ
node .claude/skills/github-issue-manager/scripts/sync_new_issues.js --check   # CI用：未同期があれば終了コード1
```

**ユースケース**:

- `git merge main` 後に新規仕様書が含まれていた場合
- `git stash pop` で仕様書ファイルが復元された場合
- PR作成前のIssue同期確認

## create: Issue作成

```bash
node .claude/skills/github-issue-manager/scripts/create_issue.js --spec <path>
node .claude/skills/github-issue-manager/scripts/create_issue.js --all    # 全仕様書
```

## select: 最適Issue選択

```bash
node .claude/skills/github-issue-manager/scripts/select_issue.js
node .claude/skills/github-issue-manager/scripts/select_issue.js --priority high
node .claude/skills/github-issue-manager/scripts/select_issue.js --category bugfix
node .claude/skills/github-issue-manager/scripts/select_issue.js --remote  # GitHub直接
```

## list: Issue一覧

```bash
node .claude/skills/github-issue-manager/scripts/list_issues.js
node .claude/skills/github-issue-manager/scripts/list_issues.js --priority high --status unassigned
node .claude/skills/github-issue-manager/scripts/list_issues.js --json
```

## update: Issue更新

```bash
node .claude/skills/github-issue-manager/scripts/update_issue.js -n 123 --status in-progress
node .claude/skills/github-issue-manager/scripts/update_issue.js -n 123 --priority high
node .claude/skills/github-issue-manager/scripts/update_issue.js -n 123 --close
```

## close: Issueクローズ

```bash
node .claude/skills/github-issue-manager/scripts/close_issue.js --number 123
node .claude/skills/github-issue-manager/scripts/close_issue.js --spec docs/30-workflows/unassigned-task/task-xxx.md
node .claude/skills/github-issue-manager/scripts/close_issue.js --number 123 --reason "完了しました"
```

## relink: Issue↔仕様書再リンク

既存のIssueと仕様書ファイルをタスクIDでマッチングし、`issue_number`を書き戻す。

```bash
node .claude/skills/github-issue-manager/scripts/relink_issues.js            # 全Issueを再リンク
node .claude/skills/github-issue-manager/scripts/relink_issues.js --dry-run  # 変更内容を確認
```

## cleanup: 孤立Issue検出・クローズ

仕様書ファイルが削除されたが、Issueが残っている「孤立Issue」を検出し、クローズする。
**手動削除時**など、Claude Code Hook が発火しない場合に使用。

```bash
node .claude/skills/github-issue-manager/scripts/cleanup_orphaned.js           # 孤立Issue検出（確認のみ）
node .claude/skills/github-issue-manager/scripts/cleanup_orphaned.js --close   # 孤立Issueをクローズ
node .claude/skills/github-issue-manager/scripts/cleanup_orphaned.js --dry-run # 変更内容を表示
```

## label: 全Issueにラベル一括付与

オープン中の全Issueにメタ情報（優先度・規模・分類・ステータス）からラベルを付与。

```bash
node .claude/skills/github-issue-manager/scripts/label_all_issues.js           # 全Issueにラベル付与
node .claude/skills/github-issue-manager/scripts/label_all_issues.js --dry-run # 変更内容を確認
node .claude/skills/github-issue-manager/scripts/label_all_issues.js --force   # 既存ラベルを上書き
```

**注意**: Issue作成時(`create_issue.js`)は自動でラベル付与されます。このコマンドは既存Issueの一括ラベル付与に使用。

---

# Part 3: スコアリング＆ラベル

## スコアリング計算

| 要素     | 値          | スコア       |
| -------- | ----------- | ------------ |
| 優先度   | 高/中/低    | +100/+50/+25 |
| 規模     | 小/中/大    | +30/+20/+10  |
| 依存関係 | 満足/未満足 | +50/-100     |
| 経過日数 | 1日あたり   | +1 (max 30)  |

## 自動付与ラベル

| カテゴリ   | ラベル例                                                                                                        |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| 優先度     | `priority:high`, `priority:medium`, `priority:low`                                                              |
| 規模       | `scale:large`, `scale:medium`, `scale:small`                                                                    |
| 分類       | `type:requirements`, `type:improvement`, `type:bugfix`, `type:refactoring`, `type:security`, `type:performance` |
| ステータス | `status:unassigned`, `status:in-progress`, `status:completed`                                                   |

---

# Part 4: リソースマップ

## scripts/

| Script                | 用途                         |
| --------------------- | ---------------------------- |
| `sync_issues.js`      | GitHub↔ローカル同期          |
| `sync_new_issues.js`  | 未同期仕様書→Issue一括作成   |
| `create_issue.js`     | 仕様書→Issue作成             |
| `select_issue.js`     | 最適Issue選択+スコアリング   |
| `list_issues.js`      | Issue一覧（ローカル優先）    |
| `update_issue.js`     | Issue更新（ローカル+GitHub） |
| `close_issue.js`      | Issueクローズ                |
| `relink_issues.js`    | Issue↔仕様書再リンク         |
| `cleanup_orphaned.js` | 孤立Issue検出・クローズ      |
| `label_all_issues.js` | 全Issueラベル一括付与        |
| `init_labels.js`      | ラベル初期化                 |
| `utils.js`            | 共通ユーティリティ           |
| `log_usage.js`        | 使用ログ記録                 |

## agents/

| Agent                     | 用途                    |
| ------------------------- | ----------------------- |
| `select-optimal-issue.md` | 最適Issue推奨・理由説明 |

## assets/

| Asset               | 用途                    |
| ------------------- | ----------------------- |
| `issue-template.md` | Issueボディテンプレート |

---

## メタ情報構造（YAML形式）

```yaml
task_id: FR-011
task_name: ファイルタイプアイコン表示
category: 改善
target_feature: FileSelectorPanel
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 11
created_date: 2026-01-21
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

**解析**: YAML優先、Markdownテーブルはフォールバック

---
