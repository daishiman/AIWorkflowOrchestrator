# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 6                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

Phase 5の実装に対してテストを拡充し、品質基準を達成する。

> **Note**: このタスクはMarkdownファイル作成であり、コードカバレッジは適用されない。
> 代わりに、構造・内容・整合性の検証を網羅的に行う。

## 実行タスク

### Task 1: 詳細構造検証テスト追加

```bash
# YAML Frontmatter の完全性検証
# - name フィールドがハイフンケースであること
# - description が複数行であること
# - allowed-tools が配列形式であること

validate_frontmatter() {
  local file="$1"

  # name がハイフンケース
  name=$(grep "^name:" "$file" | cut -d: -f2 | tr -d ' ')
  [[ "$name" =~ ^[a-z0-9-]+$ ]] || return 1

  # description が | で始まる複数行
  grep -q "^description: |" "$file" || return 1

  # allowed-tools が配列
  grep -q "^allowed-tools:" "$file" && \
  grep -A20 "^allowed-tools:" "$file" | grep -q "  - " || return 1

  return 0
}
```

### Task 2: 機能セクション詳細検証

```bash
# 各機能に使用例が含まれていることを検証
validate_feature_examples() {
  local file="$1"
  local features=("chat" "api" "improve" "execute" "use" "chain" "fork" "share" "schedule" "debug" "docs" "stats")

  for feature in "${features[@]}"; do
    # 機能ヘッダーと使用例（コードブロックまたは\`記法）の存在確認
    section_start=$(grep -n "### .*$feature\|/skill-creator $feature" "$file" | head -1 | cut -d: -f1)
    if [ -z "$section_start" ]; then
      echo "Missing feature section: $feature"
      return 1
    fi
  done

  return 0
}
```

### Task 3: 参照整合性検証

```bash
# 参照パスが実際に存在するファイルを指しているか検証
# （TASK-9B-B〜Fで作成されるファイルへの参照は、存在しなくてもOK）
validate_reference_format() {
  local file="$1"

  # agents/ 参照の形式確認
  grep "agents/" "$file" | while read -r line; do
    # `agents/xxx.md` 形式であること
    [[ "$line" =~ agents/[a-z-]+\.md ]] || {
      echo "Invalid agent reference format: $line"
      return 1
    }
  done

  # references/ 参照の形式確認
  grep "references/" "$file" | while read -r line; do
    # `references/xxx.md` 形式であること
    [[ "$line" =~ references/[a-z-]+\.md ]] || {
      echo "Invalid reference format: $line"
      return 1
    }
  done

  return 0
}
```

### Task 4: description セクション詳細検証

```bash
# Anchors の形式検証
validate_anchors() {
  local file="$1"

  # Anchors: セクションの存在
  grep -q "Anchors:" "$file" || return 1

  # アンカーの形式: • xxx / 適用: xxx / 目的: xxx
  anchors_section=$(sed -n '/Anchors:/,/Trigger:/p' "$file")
  anchor_count=$(echo "$anchors_section" | grep -c "•")

  # 最低3つのアンカー
  [ "$anchor_count" -ge 3 ] || {
    echo "Need at least 3 anchors, found: $anchor_count"
    return 1
  }

  return 0
}

# Trigger の形式検証
validate_trigger() {
  local file="$1"

  # Trigger: セクションの存在
  grep -q "Trigger:" "$file" || return 1

  # Use when または 日本語トリガーの存在
  trigger_section=$(sed -n '/Trigger:/,/^allowed-tools:/p' "$file")
  echo "$trigger_section" | grep -qE "Use when|スキル作成|skill creation" || {
    echo "Invalid trigger format"
    return 1
  }

  return 0
}
```

### Task 5: 統合検証テスト

```bash
# skill-fixture-runner を使用した統合検証
# （skill-fixture-runnerが利用可能な場合）

run_fixture_validation() {
  local skill_dir="$HOME/.aiworkflow/skills/skill-creator"

  # skill-fixture-runner の検証スクリプトを実行
  if [ -f "$HOME/.claude/skills/skill-fixture-runner/scripts/validate-skill.sh" ]; then
    bash "$HOME/.claude/skills/skill-fixture-runner/scripts/validate-skill.sh" "$skill_dir"
  else
    echo "skill-fixture-runner not available, skipping integration validation"
  fi
}
```

## 検証カバレッジ基準

| 検証カテゴリ | 目標 | 説明                                   |
| ------------ | ---- | -------------------------------------- |
| 構造検証     | 100% | Frontmatter + Body の全項目            |
| 必須要素検証 | 100% | ツール・機能・参照の全項目             |
| 形式検証     | 100% | YAML・Markdown の形式                  |
| 整合性検証   | 80%+ | 参照パスの形式（実ファイルは条件付き） |

## 参照資料

| 資料名               | パス                                          | 説明       |
| -------------------- | --------------------------------------------- | ---------- |
| Phase 4成果物        | `outputs/phase-4/test-specification.md`       | テスト仕様 |
| Phase 5成果物        | `~/.aiworkflow/skills/skill-creator/SKILL.md` | 実装成果物 |
| skill-fixture-runner | `~/.claude/skills/skill-fixture-runner/`      | 検証ツール |

## 統合テスト連携【必須】

| テストカテゴリ | 検証項目                          | 目標 |
| -------------- | --------------------------------- | ---- |
| 構造検証       | YAML Frontmatter + Markdown Body  | 100% |
| 必須要素検証   | allowed-tools, 機能, 参照         | 100% |
| 形式検証       | ハイフンケース, 複数行description | 100% |
| 整合性検証     | 参照パス形式                      | 80%+ |

## 成果物

| 成果物                 | パス                                            | 説明               |
| ---------------------- | ----------------------------------------------- | ------------------ |
| 検証カバレッジレポート | `outputs/phase-6/validation-coverage-report.md` | 検証網羅性レポート |
| 拡充テストスクリプト   | `outputs/phase-6/validate-skill-md-extended.sh` | 拡充検証スクリプト |

## 完了条件

- [ ] 詳細構造検証テストが追加されている
- [ ] 機能セクション詳細検証が追加されている
- [ ] 参照整合性検証が追加されている
- [ ] description セクション詳細検証が追加されている
- [ ] 統合検証テストが追加されている（利用可能な場合）
- [ ] 検証カバレッジ基準を達成
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
