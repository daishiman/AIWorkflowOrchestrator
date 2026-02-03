# TASK-9B-A 受け入れ基準

## メタ情報

| 項目     | 値                          |
| -------- | --------------------------- |
| タスクID | TASK-9B-A                   |
| Phase    | 1                           |
| 作成日   | 2026-02-03                  |
| タイトル | skill-creator SKILL.md 作成 |

## 受け入れ基準一覧

| AC-ID  | 受け入れ基準                                                                                                       | 検証方法                | 優先度   |
| ------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------- | -------- |
| AC-001 | `~/.aiworkflow/skills/skill-creator/SKILL.md` が作成されている                                                     | `test -f`               | Critical |
| AC-002 | YAML Frontmatter に name, description, allowed-tools が存在する                                                    | `grep`                  | Critical |
| AC-003 | allowed-tools に Read, Write, Edit, Glob, Grep, Bash, Task, WebFetch, AskUserQuestion の9ツールが含まれる          | `grep -c`               | Critical |
| AC-004 | 12の機能セクション（chat, api, improve, execute, use, chain, fork, share, schedule, debug, docs, stats）が存在する | `grep`                  | Critical |
| AC-005 | agents/ ディレクトリへの参照パスが5つ以上存在する                                                                  | `grep -c "agents/"`     | High     |
| AC-006 | references/ ディレクトリへの参照パスが4つ以上存在する                                                              | `grep -c "references/"` | High     |

## 検証コマンド

```bash
# AC-001: ファイル存在確認
test -f ~/.aiworkflow/skills/skill-creator/SKILL.md && echo "PASS" || echo "FAIL"

# AC-002: Frontmatter 必須フィールド確認
grep -q "^name:" ~/.aiworkflow/skills/skill-creator/SKILL.md && \
grep -q "^description:" ~/.aiworkflow/skills/skill-creator/SKILL.md && \
grep -q "^allowed-tools:" ~/.aiworkflow/skills/skill-creator/SKILL.md && \
echo "PASS" || echo "FAIL"

# AC-003: 9ツール確認
for tool in Read Write Edit Glob Grep Bash Task WebFetch AskUserQuestion; do
  grep -q "  - $tool" ~/.aiworkflow/skills/skill-creator/SKILL.md || { echo "Missing: $tool"; exit 1; }
done && echo "PASS"

# AC-004: 12機能確認
for feature in chat api improve execute use chain fork share schedule debug docs stats; do
  grep -qi "/skill-creator $feature\|/skill-creator\`.*$feature" ~/.aiworkflow/skills/skill-creator/SKILL.md || \
    { echo "Missing: $feature"; exit 1; }
done && echo "PASS"

# AC-005: agents/ 参照5つ以上
count=$(grep -c "agents/" ~/.aiworkflow/skills/skill-creator/SKILL.md)
[ "$count" -ge 5 ] && echo "PASS ($count)" || echo "FAIL ($count < 5)"

# AC-006: references/ 参照4つ以上
count=$(grep -c "references/" ~/.aiworkflow/skills/skill-creator/SKILL.md)
[ "$count" -ge 4 ] && echo "PASS ($count)" || echo "FAIL ($count < 4)"
```

## FR/AC マッピング

| FR-ID  | AC-ID          |
| ------ | -------------- |
| FR-001 | AC-001         |
| FR-002 | AC-003         |
| FR-003 | AC-004         |
| FR-004 | AC-005         |
| FR-005 | AC-006         |
| FR-006 | AC-002         |
| FR-007 | AC-002（部分） |

## 作成日時

2026-02-03
