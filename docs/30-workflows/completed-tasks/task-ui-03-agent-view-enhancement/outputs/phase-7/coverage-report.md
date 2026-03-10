# Phase 7: カバレッジレポート

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 7                      |
| 機能名 | agent-view-enhancement |
| 実施日 | 2026-03-10             |

## 実行コマンド

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/components/organisms/AgentView/__tests__/*.test.tsx \
  src/renderer/views/AgentView/__tests__/*.test.tsx \
  src/renderer/store/slices/__tests__/agentSlice*.test.ts \
  src/renderer/store/__tests__/setupSkillListeners.test.ts \
  --coverage.enabled true \
  --coverage.provider v8 \
  --coverage.reportsDirectory ../../docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/outputs/phase-7/coverage-full \
  --coverage.reporter=json-summary \
  --coverage.reporter=text-summary \
  --coverage.include='src/renderer/components/organisms/AgentView/**/*.tsx' \
  --coverage.include='src/renderer/views/AgentView/index.tsx' \
  --coverage.include='src/renderer/store/slices/agentSlice.ts'
```

結果: `579 passed | 12 skipped`

## 全体判定

| 指標       | 最低基準 | 実測値 | 判定 |
| ---------- | -------: | -----: | ---- |
| Statements |      80% | 95.02% | PASS |
| Branches   |      60% | 91.37% | PASS |
| Functions  |      80% | 88.50% | PASS |
| Lines      |      80% | 95.02% | PASS |

## ファイル別抜粋

| ファイル                    |   Lines | Branches | Functions | Statements |
| --------------------------- | ------: | -------: | --------: | ---------: |
| `SkillChip.tsx`             | 100.00% |  100.00% |   100.00% |    100.00% |
| `ExecuteButton.tsx`         | 100.00% |  100.00% |   100.00% |    100.00% |
| `FloatingExecutionBar.tsx`  |  98.76% |  100.00% |   100.00% |     98.76% |
| `AdvancedSettingsPanel.tsx` | 100.00% |   94.44% |   100.00% |    100.00% |
| `RecentExecutionList.tsx`   | 100.00% |   89.47% |   100.00% |    100.00% |
| `views/AgentView/index.tsx` |  90.74% |   78.48% |    63.63% |     90.74% |
| `agentSlice.ts`             |  95.37% |   95.51% |    90.00% |     95.37% |

## 判定

- Line / Branch / Function の全基準を満たした
- Phase 8 へ進行可能
