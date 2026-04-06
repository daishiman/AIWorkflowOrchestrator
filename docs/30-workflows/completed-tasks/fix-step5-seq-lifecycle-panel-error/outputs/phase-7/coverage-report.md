# Phase 7: カバレッジレポート（実績）

## メタ情報

| 項目     | 内容                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------- |
| タスクID | TASK-FIX-LIFECYCLE-PANEL-ERROR-001                                                              |
| Phase    | 7                                                                                               |
| 対象     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（`applyWorkflowSnapshot`） |
| 計測日   | 2026-04-03                                                                                      |
| 判定     | PASS（対象コールバックの行/分岐は実測でカバー）                                                 |

## 計測方法

実行コマンド（対象ファイルへ `coverage.include` を絞り、全体しきい値は 0 にして測定）:

```bash
pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx \
  --coverage \
  --coverage.include=src/renderer/components/skill/SkillLifecyclePanel.tsx \
  --coverage.reporter=lcov \
  --coverage.reportsDirectory=coverage-lifecycle-panel-lcov \
  --coverage.thresholds.lines=0 \
  --coverage.thresholds.branches=0 \
  --coverage.thresholds.functions=0 \
  --coverage.thresholds.statements=0 \
  --reporter=dot
```

生成物:

- `apps/desktop/coverage-lifecycle-panel/coverage-summary.json`
- `apps/desktop/coverage-lifecycle-panel-lcov/lcov.info`

## 結果サマリー（ファイル全体）

`SkillLifecyclePanel.tsx` は巨大なため、ファイル全体のカバレッジは以下（参考値）:

- Lines: 43.05%（722/1677）
- Branches: 42.75%（59/138）

## 結果詳細（対象コールバック: `applyWorkflowSnapshot`）

対象（`SkillLifecyclePanel.tsx` の該当行）:

```ts
const applyWorkflowSnapshot = useCallback(
  (snapshot: SkillCreatorWorkflowUiSnapshot) => {
    setWorkflowSnapshot(snapshot);
    if (snapshot.currentPhase !== "handoff") {
      setWorkflowError(null);
    }
    if (snapshot.handoffBundle) {
      setHandoffGuidance(toHandoffGuidance(snapshot.handoffBundle));
    }
  },
  [setHandoffGuidance, setWorkflowError, setWorkflowSnapshot],
);
```

lcov の実測（`apps/desktop/coverage-lifecycle-panel-lcov/lcov.info`）:

```text
DA:509,17
DA:510,9
DA:511,9
DA:512,3
DA:513,3
DA:514,9
DA:515,3
DA:516,3
DA:517,9
DA:518,17
BRDA:509,77,0,9
BRDA:511,78,0,3
BRDA:514,79,0,3
```

判定根拠:

- 行カバレッジ: 対象行 `509-518` はすべて hit（`DA:509-518` が存在し、hit count が 0 でない）
- ブランチ: `if (snapshot.currentPhase !== "handoff")` と `if (snapshot.handoffBundle)` の分岐が計測対象として記録されている（`BRDA:511` / `BRDA:514`）

注記:

- ファイル全体の割合（43.05%/42.75%）は巨大ファイルの参考値であり、判定対象は変更箇所の `applyWorkflowSnapshot`。
- 対象 callback は `DA:509-518` と `BRDA:509/511/514` がすべて hit しており、回帰防止の観点では PASS。
