# 検証コマンド集

> Phase 4 タスク3 成果物
> 作成日: 2026-04-21

## フィールド存在確認コマンド（Phase 5 完了後に実行）

```bash
TARGET_FILE=".claude/skills/aiworkflow-requirements/references/evals-schema-spec.md"

FIELDS=(
  "qualityInsights.patternAdoptionRate"
  "qualityInsights.coverageTargetHitRate"
  "qualityInsights.unassignedTaskDetectionRate"
  "qualityInsights.notes"
  "qualityInsights.taskMetrics"
  "TASK_ID"
  "completedPhases"
  "totalTests"
  "avgCoverage"
  "systemSpecsUpdated"
  "unassignedTasksDetected"
)

for field in "${FIELDS[@]}"; do
  if grep -q "$field" "$TARGET_FILE"; then
    echo "OK: $field"
  else
    echo "MISSING: $field"
  fi
done
```

## 削除確認コマンド（誤記述が残っていないか）

```bash
TARGET_FILE=".claude/skills/aiworkflow-requirements/references/evals-schema-spec.md"

OLD_FIELDS=(
  "taskMetrics.createdCount"
  "taskMetrics.completedCount"
  "taskMetrics.failedCount"
  "taskMetrics.retriedCount"
  "taskMetrics.cancelRate"
  "taskMetrics.blockedCount"
  "taskMetrics.lastUpdated"
)

for field in "${OLD_FIELDS[@]}"; do
  if grep -q "$field" "$TARGET_FILE"; then
    echo "残存（削除漏れ）: $field"
  else
    echo "OK（削除済み）: $field"
  fi
done
```

## writer・運用責任の記載確認コマンド

```bash
grep -n "writer\|運用責任\|更新タイミング\|手動" "$TARGET_FILE"
```

## 差分確認コマンド（追記前後の比較）

```bash
git diff HEAD -- "$TARGET_FILE" > outputs/phase-5/diff-result.md
```

## 型定義整合確認コマンド

```bash
grep -A 3 "qualityInsights\." "$TARGET_FILE" | grep -E "number|string|Record|整数|0\\.0"
```

## 索引確認コマンド

```bash
grep -n "qualityInsights" .claude/skills/aiworkflow-requirements/indexes/topic-map.md
grep -n "qualityInsights" .claude/skills/aiworkflow-requirements/indexes/quick-reference.md
```

## mirror sync 確認コマンド

```bash
diff -qr .claude/skills/ .agents/skills/
```

## 実行タイミング

| コマンド           | 実行タイミング                     |
| ------------------ | ---------------------------------- |
| フィールド存在確認 | Phase 5 完了後                     |
| 削除確認           | Phase 5 完了後                     |
| writer 記載確認    | Phase 5 完了後                     |
| 差分確認           | Phase 5 直後                       |
| 索引確認           | Phase 6 cross-reference チェック時 |
| mirror sync 確認   | Phase 9 品質保証時                 |
