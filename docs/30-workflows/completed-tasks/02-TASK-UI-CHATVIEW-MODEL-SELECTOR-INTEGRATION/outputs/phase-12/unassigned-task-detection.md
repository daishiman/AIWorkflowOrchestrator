# Unassigned Task Detection: TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION

## Detection Date: 2026-03-22

## Detected Tasks: 1 item

### UT-CHATVIEW-MODEL-SELECTOR-DATA-TESTID-001

| Item     | Value                                                                                                                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Title    | InlineModelSelector に data-testid 属性を追加                                                                                                                                                                           |
| Priority | Low                                                                                                                                                                                                                     |
| Reason   | Phase 4 仕様書では `data-testid="inline-model-selector"` を期待していたが、コンポーネントには存在しない。テストは `role="combobox"` で代替しているが、E2E テストや Playwright での要素特定に `data-testid` があると便利 |
| Impact   | テストの明示性向上。機能影響なし                                                                                                                                                                                        |
| Related  | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT (Task 01)                                                                                                                                                                       |
| Status   | Unassigned                                                                                                                                                                                                              |

## Summary

- Total detected: 1
- High priority: 0
- Medium priority: 0
- Low priority: 1
