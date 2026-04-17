# Phase 2: 設計 - TASK-CONFLICT-PREVENT-001

## ステータス: 完了

## 設計方針

30種の思考法（論理分析系・構造分解系・メタ抽象系・システム系・問題解決系）による多角的検証から導出した設計。

---

## 設計1: `.gitattributes` マージ戦略

### 戦略分類

| 戦略          | 適用対象             | 動作                 | 安全性                   |
| ------------- | -------------------- | -------------------- | ------------------------ |
| `merge=union` | Markdown追記ファイル | 両ブランチの行を統合 | 重複行リスクあり（許容） |
| `merge=ours`  | JSON・自動生成       | 現ブランチ版を保持   | JSON構造を保護           |

### 追加対象

```gitattributes
# SKILL.md: 版管理テーブルへの追記を自動統合
.claude/skills/*/SKILL.md            merge=union
.agents/skills/*/SKILL.md            merge=union

# 設定ファイル: JSON構造保護のため現ブランチ優先
.claude/settings.local.json          merge=ours
```

### 設計根拠

- `SKILL.md` → 各バージョン行は一意（v10.09.xx形式）のため、`union`による重複行の実害は軽微
- `settings.local.json` → JSONに`merge=union`を適用すると構造が破壊されるため`merge=ours`

---

## 設計2: `.husky/post-merge` フック

### 責務

1. `merge=ours`で保護した`indexes/*.json`をマージ後に再生成
2. `.agents/skills/`ミラーの`indexes/`を同期
3. `settings.local.json`のJSON構文を検証

### フロー

```
git merge 完了
    ↓
post-merge フック実行
    ↓
generate-index.js 実行
    ├─ 成功 → .agents/ ミラー同期 → settings.local.json 検証
    └─ 失敗 → エラーメッセージ表示 → exit 1（フック失敗を明示）
```

### 失敗時動作の変更

| 変更前                          | 変更後                                   |
| ------------------------------- | ---------------------------------------- |
| `\|\| true`（失敗を無音で無視） | `exit 1`（失敗を明示して気付けるように） |

### husky v10 互換性

husky v10では`.husky/post-merge`先頭の以下2行が非推奨：

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
```

v10では削除し、直接コマンドを記述する形式に変更する。

---

## 設計3: `.gitignore` 追加

```gitignore
# スキルバックアップ: 追跡不要・コンフリクト源
.claude/skills/.backups/
.agents/skills/.backups/
```

**根拠**: タイムスタンプ付きバックアップ（例: `claude-agent-sdk.backup.2026-03-20T23-39-27-404Z/`）はdelete/modify競合を生成するため追跡対象外にする。

---

## 設計4: 中長期ロードマップ（今回スコープ外）

| 優先度 | 対策                                | 効果                            |
| ------ | ----------------------------------- | ------------------------------- |
| 中期   | `keywords.json`を`.gitignore`に移動 | 15000行JSONコンフリクト完全排除 |
| 中期   | LOGS.md月別アーカイブ化             | 肥大化防止                      |
| 長期   | Event Sourcing + JSONL形式移行      | append-onlyで競合ゼロ           |

---

## トレードオフ分析

| 対策                             | メリット                 | デメリット                             |
| -------------------------------- | ------------------------ | -------------------------------------- |
| `SKILL.md merge=union`           | コンフリクト自動解消     | 同一バージョン行の重複リスク           |
| `settings.local.json merge=ours` | JSON構造保護             | 他ブランチのallow追加が手動反映必要    |
| post-merge `exit 1`              | 失敗を気付けるようになる | マージ完了後にフック失敗でworktree汚染 |

---

## 変更ファイル一覧

| ファイル            | 変更種別 | 内容                                          |
| ------------------- | -------- | --------------------------------------------- |
| `.gitattributes`    | 修正     | SKILL.md・settings.local.json戦略追加         |
| `.husky/post-merge` | 新規作成 | keywords.json再生成 + .agents/同期 + JSON検証 |
| `.gitignore`        | 修正     | .backups/追加                                 |
