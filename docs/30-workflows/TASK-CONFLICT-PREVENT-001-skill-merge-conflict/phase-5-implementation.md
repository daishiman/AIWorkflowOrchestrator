# Phase 5: 実装 - TASK-CONFLICT-PREVENT-001

## ステータス: 部分完了

## 実装対象ファイル

| ファイル            | 変更種別 | 完了状態                                              |
| ------------------- | -------- | ----------------------------------------------------- |
| `.gitattributes`    | 修正     | 部分完了（SKILL.mdエントリが除去済み → 再追加が必要） |
| `.husky/post-merge` | 新規作成 | 完了                                                  |
| `.gitignore`        | 修正     | 完了                                                  |

---

## 実装詳細

### 実装1: `.gitattributes` SKILL.md エントリ追加

**現状（実装後にlinterで除去された）**:

```gitattributes
# SKILL-changelog.md: 変更履歴は追記型のため merge=union で両ブランチの追記を統合
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union
```

**実装目標**:

```gitattributes
# SKILL.md: 変更履歴テーブルへの追記が並列ブランチで競合するため merge=union で自動統合
# （各バージョン行は一意キーを持つため union による重複は実害なし）
.claude/skills/*/SKILL.md            merge=union
.agents/skills/*/SKILL.md            merge=union

# SKILL-changelog.md: 変更履歴は追記型のため merge=union で両ブランチの追記を統合
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union
```

**実装目標（settings.local.json）**:

```gitattributes
# 設定ファイル: JSON構造破壊を防ぐため merge=ours で現ブランチを優先
# コンフリクト後は手動で他ブランチの追加エントリを確認・反映すること
.claude/settings.local.json      merge=ours
```

---

### 実装2: `.husky/post-merge` 新規作成（完了済み）

```sh
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

SCRIPT=".claude/skills/aiworkflow-requirements/scripts/generate-index.js"

# indexes/*.json を merge=ours で保護後、スクリプトで再生成して最新化
if command -v node > /dev/null 2>&1 && [ -f "$SCRIPT" ]; then
  echo "[post-merge] indexes/*.json を再生成中..."
  if node "$SCRIPT" --quiet 2>&1; then
    echo "[post-merge] ✓ 再生成成功"
  else
    echo "[post-merge] ✗ 再生成失敗。手動で実行してください:"
    echo "  node $SCRIPT"
    exit 1
  fi

  # .agents/skills/ ミラーに同期（indexes ディレクトリのみ）
  AGENTS_DIR=".agents/skills/aiworkflow-requirements/indexes"
  CLAUDE_DIR=".claude/skills/aiworkflow-requirements/indexes"
  if [ -d "$CLAUDE_DIR" ] && [ -d "$AGENTS_DIR" ]; then
    cp -f "$CLAUDE_DIR"/*.json "$AGENTS_DIR"/ 2>/dev/null || true
    echo "[post-merge] ✓ .agents/ ミラー同期完了"
  fi
fi

# settings.local.json の JSON 構文検証
SETTINGS=".claude/settings.local.json"
if [ -f "$SETTINGS" ] && command -v node > /dev/null 2>&1; then
  if node -e "JSON.parse(require('fs').readFileSync('$SETTINGS', 'utf-8'))" 2>/dev/null; then
    :
  else
    echo "[post-merge] ✗ $SETTINGS が破損しています。手動修正が必要です"
    exit 1
  fi
fi
```

**注意**: husky v10では先頭2行（`#!/usr/bin/env sh` + `source`）を削除する形式に移行予定。現在はv9形式で動作確認済み。

---

### 実装3: `.gitignore` .backups/ 追加（完了済み）

```gitignore
# スキルバックアップ（タイムスタンプ付き自動バックアップ）: 追跡不要・コンフリクト源
.claude/skills/.backups/
.agents/skills/.backups/
```

---

## 残作業

### 残作業1: `.gitattributes`へのSKILL.md再追加

linterによってSKILL.mdエントリが除去された。`.gitattributes`に以下を再追加する必要がある：

```gitattributes
.claude/skills/*/SKILL.md            merge=union
.agents/skills/*/SKILL.md            merge=union
.claude/settings.local.json          merge=ours
```

**実装手順**:

```bash
# .gitattributesのSKILL-changelog.mdの前に追加
# SKILL.md: 変更履歴テーブルへの追記が並列ブランチで競合するため merge=union で自動統合
.claude/skills/*/SKILL.md            merge=union
.agents/skills/*/SKILL.md            merge=union
```

### 残作業2: `.gitattributes`へのsettings.local.json追加

```bash
# indexes/*.json の後に追加
.claude/settings.local.json          merge=ours
```

---

## 完了条件

- [ ] `.gitattributes`に`SKILL.md merge=union`エントリが存在する
- [x] `.gitattributes`に`LOGS.md merge=union`エントリが存在する
- [x] `.gitattributes`に`indexes/*.json merge=ours`エントリが存在する
- [ ] `.gitattributes`に`settings.local.json merge=ours`エントリが存在する
- [x] `.husky/post-merge`が存在し実行可能（chmod +x済み）
- [x] `.gitignore`に`.backups/`が追加されている
