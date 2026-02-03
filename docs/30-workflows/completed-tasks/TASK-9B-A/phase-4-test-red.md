# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 4                           |
| タスク | TASK-9B-A                   |
| 機能名 | skill-creator SKILL.md 作成 |
| 作成日 | 2026-02-03                  |

## 目的

SKILL.md ファイルの構造・内容を検証するテストを作成する（Red状態）。

> **Note**: このタスクはMarkdownファイル作成であり、コード実装ではないため、
> テストは主に構造検証・フォーマット検証を行うシェルスクリプトまたは検証ツールとなる。

## 実行タスク

### Task 1: 構造検証テスト作成

**検証スクリプト**: skill-fixture-runner の検証機能を利用

```bash
# SKILL.md 存在確認テスト
test -f ~/.aiworkflow/skills/skill-creator/SKILL.md || exit 1

# YAML Frontmatter 検証
grep -q "^name: skill-creator" ~/.aiworkflow/skills/skill-creator/SKILL.md || exit 1
grep -q "^description:" ~/.aiworkflow/skills/skill-creator/SKILL.md || exit 1
grep -q "^allowed-tools:" ~/.aiworkflow/skills/skill-creator/SKILL.md || exit 1
```

### Task 2: allowed-tools 検証テスト

```bash
# 必須ツール確認
required_tools=("Read" "Write" "Edit" "Glob" "Grep" "Bash" "Task" "WebFetch" "AskUserQuestion")

for tool in "${required_tools[@]}"; do
  grep -q "  - $tool" ~/.aiworkflow/skills/skill-creator/SKILL.md || {
    echo "Missing tool: $tool"
    exit 1
  }
done
```

### Task 3: 機能セクション検証テスト

```bash
# 12機能の存在確認
features=("chat" "api" "improve" "execute" "use" "chain" "fork" "share" "schedule" "debug" "docs" "stats")

for feature in "${features[@]}"; do
  grep -qi "/skill-creator $feature\|/skill-creator\` .*$feature" ~/.aiworkflow/skills/skill-creator/SKILL.md || {
    echo "Missing feature: $feature"
    exit 1
  }
done
```

### Task 4: 参照パス検証テスト

```bash
# agents/ 参照確認（5つ以上）
agent_count=$(grep -c "agents/" ~/.aiworkflow/skills/skill-creator/SKILL.md)
[ "$agent_count" -ge 5 ] || {
  echo "Need at least 5 agent references, found: $agent_count"
  exit 1
}

# references/ 参照確認（4つ以上）
ref_count=$(grep -c "references/" ~/.aiworkflow/skills/skill-creator/SKILL.md)
[ "$ref_count" -ge 4 ] || {
  echo "Need at least 4 reference paths, found: $ref_count"
  exit 1
}
```

### Task 5: description 形式検証テスト

```bash
# Anchors セクション存在確認
grep -q "Anchors:" ~/.aiworkflow/skills/skill-creator/SKILL.md || {
  echo "Missing Anchors section in description"
  exit 1
}

# Trigger セクション存在確認
grep -q "Trigger:" ~/.aiworkflow/skills/skill-creator/SKILL.md || {
  echo "Missing Trigger section in description"
  exit 1
}
```

## 参照資料

| 資料名               | パス                                      | 説明             |
| -------------------- | ----------------------------------------- | ---------------- |
| Phase 2成果物        | `outputs/phase-2/structure-design.md`     | 構造設計         |
| Phase 3成果物        | `outputs/phase-3/design-review-result.md` | 設計レビュー結果 |
| skill-fixture-runner | `~/.claude/skills/skill-fixture-runner/`  | 検証ツール       |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                                | テストファイル           |
| ------------------ | --------------------------------------- | ------------------------ |
| ファイル存在テスト | SKILL.md が正しいパスに存在             | `validate-structure.sh`  |
| 構造検証テスト     | YAML Frontmatter + Markdown Body の構造 | `validate-format.sh`     |
| 内容検証テスト     | 必須要素（ツール・機能・参照）の存在    | `validate-content.sh`    |
| 整合性テスト       | 参照パスの実ファイルとの整合性          | `validate-references.sh` |

## 成果物

| 成果物         | パス                                    | 説明               |
| -------------- | --------------------------------------- | ------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md` | テスト設計         |
| テストケース   | `outputs/phase-4/test-cases.md`         | ケース一覧         |
| 検証スクリプト | `outputs/phase-4/validate-skill-md.sh`  | 構造検証スクリプト |

## 完了条件

- [ ] 構造検証テストが作成されている
- [ ] allowed-tools検証テストが作成されている
- [ ] 機能セクション検証テストが作成されている
- [ ] 参照パス検証テストが作成されている
- [ ] description形式検証テストが作成されている
- [ ] すべてのテストが失敗状態（Red）（SKILL.mdがまだ存在しないため）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド（この時点で失敗することを確認）
bash outputs/phase-4/validate-skill-md.sh

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
#       → SKILL.mdが存在しないため失敗
```

## 次のPhase

Phase 5: 実装（TDD: Green）
