# Phase 12 Task 1/3/4/5 実体確認チェックリスト定義

## 概要

Phase 12 の必須成果物（Task 1/3/4/5）の物理的存在と最低要件を検証するためのチェックリスト。

## チェック項目一覧（11項目）

| #   | Task ID | チェック項目                                             | 確認対象ファイル                                                                       | 検証方法                                       |
| --- | ------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Task 1  | implementation-guide.md Part 1（中学生レベル概念説明）が存在する | outputs/phase-12/implementation-guide.md                                               | ファイル実在 + `## Part 1` セクション存在      |
| 2   | Task 1  | implementation-guide.md Part 2（開発者向け実装詳細）が存在する   | outputs/phase-12/implementation-guide.md                                               | ファイル実在 + `## Part 2` セクション存在      |
| 3   | Task 1  | API/IPC/コンポーネントドキュメントが存在する             | outputs/phase-12/api-documentation.md 等                                               | ファイル実在（該当する文書種別のみ）           |
| 4   | Task 3  | documentation-changelog.md が作成されている               | outputs/phase-12/documentation-changelog.md                                            | ファイル実在                                   |
| 5   | Task 3  | 全 Step の完了結果が記録されている                        | outputs/phase-12/documentation-changelog.md 内                                         | Step完了セクション存在                         |
| 6   | Task 4  | unassigned-task-detection.md が作成されている（0件でも必須） | outputs/phase-12/unassigned-task-detection.md                                          | ファイル実在                                   |
| 7   | Task 4  | 検出した未タスクが3ステップ全完了している                 | unassigned-task/指示書 + task-workflow.mdテーブル + 関連仕様書リンク                    | 3ステップ確認                                  |
| 8   | Task 5  | aiworkflow-requirements/LOGS.md が更新されている          | .claude/skills/aiworkflow-requirements/LOGS.md                                         | 更新確認                                       |
| 9   | Task 5  | task-specification-creator/LOGS.md が更新されている        | .claude/skills/task-specification-creator/LOGS.md                                      | 更新確認                                       |
| 10  | Task 5  | aiworkflow-requirements/SKILL.md 変更履歴が更新されている  | .claude/skills/aiworkflow-requirements/SKILL.md                                        | 変更履歴更新確認                               |
| 11  | Task 5  | task-specification-creator/SKILL.md 変更履歴が更新されている | .claude/skills/task-specification-creator/SKILL.md                                     | 変更履歴更新確認                               |

## 機械検証コマンド

### 一括存在確認

```bash
WF_DIR="docs/30-workflows/<FEATURE_NAME>"
REQUIRED=(
  "outputs/phase-12/implementation-guide.md"
  "outputs/phase-12/documentation-changelog.md"
  "outputs/phase-12/unassigned-task-detection.md"
  "outputs/phase-12/skill-feedback-report.md"
)
for f in "${REQUIRED[@]}"; do
  if [ -f "$WF_DIR/$f" ]; then echo "OK: $f"; else echo "NG: $f (MISSING)"; fi
done
```

### Part 1/2 セクション確認

```bash
GUIDE="$WF_DIR/outputs/phase-12/implementation-guide.md"
grep -c "## Part 1" "$GUIDE" && grep -c "## Part 2" "$GUIDE"
```

### LOGS.md 2ファイル更新確認（P1/P25対策）

```bash
git diff --name-only HEAD -- \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/task-specification-creator/LOGS.md
```

### SKILL.md 変更履歴更新確認

```bash
git diff --name-only HEAD -- \
  .claude/skills/aiworkflow-requirements/SKILL.md \
  .claude/skills/task-specification-creator/SKILL.md
```

## 検証結果テンプレート

```
チェックリスト検証結果:
- #1  implementation-guide.md Part 1: OK/NG
- #2  implementation-guide.md Part 2: OK/NG
- #3  API/IPC/Component文書: OK/NG/N/A
- #4  documentation-changelog.md: OK/NG
- #5  全Step完了結果記録: OK/NG
- #6  unassigned-task-detection.md: OK/NG
- #7  未タスク3ステップ完了: OK/NG/N/A(0件)
- #8  aiworkflow-requirements/LOGS.md: OK/NG
- #9  task-specification-creator/LOGS.md: OK/NG
- #10 aiworkflow-requirements/SKILL.md: OK/NG
- #11 task-specification-creator/SKILL.md: OK/NG

総合判定: PASS / FAIL (NG項目数: X/11)
```
