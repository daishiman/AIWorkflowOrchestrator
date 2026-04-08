# Phase 12 Task 1/3/4/5 実体確認チェックリスト定義

## 概要

Phase 12 の必須成果物（Task 1/3/4/5）の物理的存在と最低要件を検証するためのチェックリスト。

## チェック項目一覧（20項目）

| #   | Task ID | チェック項目                                                                 | 確認対象ファイル                                                                       | 検証方法                                                                                  |
| --- | ------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 1   | Task 1  | implementation-guide.md Part 1（中学生レベル概念説明）が存在する           | outputs/phase-12/implementation-guide.md                                               | ファイル実在 + `## Part 1` セクション存在                                                 |
| 2   | Task 1  | implementation-guide.md Part 2（開発者向け実装詳細）が存在する             | outputs/phase-12/implementation-guide.md                                               | ファイル実在 + `## Part 2` セクション存在                                                 |
| 3   | Task 1  | Part 1 で「なぜ必要か」を先に説明している                                   | outputs/phase-12/implementation-guide.md                                               | `## Part 1` 内に `なぜ`/`必要` の説明ブロックがある                                       |
| 4   | Task 1  | Part 1 に日常生活の例え話が含まれている                                     | outputs/phase-12/implementation-guide.md                                               | `## Part 1` 内に `例え`/`たとえば`/`イメージ` のいずれかを含む                           |
| 5   | Task 1  | Part 2 に型定義（TypeScript）が含まれている                                | outputs/phase-12/implementation-guide.md                                               | `interface` または `type` を含むコードブロック                                            |
| 6   | Task 1  | Part 2 に APIシグネチャ/使用例が含まれている                               | outputs/phase-12/implementation-guide.md                                               | `onXxx` などのシグネチャ記述 + 使用例コードブロック                                       |
| 7   | Task 1  | Part 2 にエラーハンドリング/エッジケース/設定項目が記載されている          | outputs/phase-12/implementation-guide.md                                               | 「エラーハンドリング」「エッジケース」「設定」系見出し or 表の存在                        |
| 8   | Task 3  | documentation-changelog.md が作成されている                                | outputs/phase-12/documentation-changelog.md                                            | ファイル実在                                                                              |
| 9   | Task 3  | 全 Step の完了結果が記録されている                                           | outputs/phase-12/documentation-changelog.md 内                                         | Step完了セクション存在                                                                    |
| 10  | Task 4  | unassigned-task-detection.md が作成されている（0件でも必須）               | outputs/phase-12/unassigned-task-detection.md                                          | ファイル実在                                                                              |
| 11  | Task 4  | 検出した未タスクが3ステップ全完了している                                    | unassigned-task/指示書 + task-workflow.mdテーブル + 関連仕様書リンク                    | 3ステップ確認                                                                             |
| 12  | Task 5  | aiworkflow-requirements/LOGS.md が更新されている                             | .claude/skills/aiworkflow-requirements/LOGS.md                                         | 更新確認                                                                                  |
| 13  | Task 5  | task-specification-creator/LOGS.md が更新されている                           | .claude/skills/task-specification-creator/LOGS.md                                      | 更新確認                                                                                  |
| 14  | Task 5  | aiworkflow-requirements/SKILL.md / task-specification-creator/SKILL.md 変更履歴が更新されている | .claude/skills/aiworkflow-requirements/SKILL.md / .claude/skills/task-specification-creator/SKILL.md | 変更履歴更新確認                                                                          |
| 15  | Task 4  | 未タスク指示書で `## メタ情報` が1件のみである（重複なし）                              | docs/30-workflows/unassigned-task/*.md                                                 | `rg -n "^## メタ情報$"` で対象ファイルを確認し、1件であることを検証                     |
| 16  | Task 2/4 | system spec に今回実装の苦戦箇所が残っている                                  | `references/lessons-learned.md` または更新対象 domain spec                              | `苦戦箇所` / `5分解決カード` / 等価な lessons 参照があることを確認                        |
| 17  | Task 4  | 未実施の未タスクが completed-only area に混在していない                         | `docs/30-workflows/completed-tasks/*.md`, `docs/30-workflows/completed-tasks/**/unassigned-task/*.md`, `docs/30-workflows/completed-tasks/unassigned-task/*.md` | direct completed spec は `未実施|未着手|進行中` を持たないこと、継続 backlog は実際の parent workflow 配下にあることを確認 |
| 18  | Task 2/5 | user 指定の skill root が正本として更新され、mirror root との drift がない      | `.claude/skills/**` と `.agents/skills/**` などの mirror root                          | user 指定rootで validator 実行 + `diff -qr` または等価手段で mirror sync を検証 |
| 19  | Task 2/5 | completed workflow の `phase-12-documentation.md` と `outputs/phase-12/*.md` に `仕様策定のみ` / `実行予定` などの planned wording が残っていない | `phase-12-documentation.md`, `outputs/phase-12/*.md` | `rg -n "仕様策定のみ|実行予定|保留として記録|計画|予定|TODO|will be|を予定" <workflow>/phase-12-documentation.md <workflow>/outputs/phase-12/*.md` で 0件確認 |
| 20  | Task 2/5 | `artifacts.json` と `outputs/artifacts.json` の title / type / status / phase artifact 名が一致している | `<workflow>/artifacts.json`, `<workflow>/outputs/artifacts.json` | JSON 実体を比較し、片側だけ `spec_created` / `completed` などにずれていないことを確認 |
| 21  | Task 2/5 | ledger 4点（task-workflow-backlog.md / task-workflow-completed.md / lane index / artifacts.json）がsame-waveで同期されている | 上記4ファイル全て | 各ファイルのタスク状態・ステータスが一致していることを確認 |

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

### Part 1/2 内容要件の簡易確認

```bash
GUIDE="$WF_DIR/outputs/phase-12/implementation-guide.md"

# Part 1: 理由先行 + 例え
rg -n "なぜ|必要|例え|たとえば|イメージ" "$GUIDE"

# Part 2: 型/API/エッジケース/設定
rg -n "interface|type|API|シグネチャ|エッジケース|エラー|設定" "$GUIDE"
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
- #3  Part 1 理由先行: OK/NG
- #4  Part 1 日常例え: OK/NG
- #5  Part 2 型定義: OK/NG
- #6  Part 2 APIシグネチャ/使用例: OK/NG
- #7  Part 2 エッジケース/設定項目: OK/NG
- #8  documentation-changelog.md: OK/NG
- #9  全Step完了結果記録: OK/NG
- #10 unassigned-task-detection.md: OK/NG
- #11 未タスク3ステップ完了: OK/NG/N/A(0件)
- #12 aiworkflow-requirements/LOGS.md: OK/NG
- #13 task-specification-creator/LOGS.md: OK/NG
- #14 aiworkflow-requirements/SKILL.md + task-specification-creator/SKILL.md: OK/NG
- #15 未タスク `## メタ情報` 重複なし: OK/NG
- #16 system spec に苦戦箇所記録: OK/NG
- #17 未実施UTの completed-only area 混在なし: OK/NG
- #18 canonical root + mirror sync: OK/NG/N/A
- #19 completed workflow に planned wording 残置なし: OK/NG

総合判定: PASS / FAIL (NG項目数: X/20)
```
