# coverage-report.md

## Phase 7: カバレッジ確認

### vitest 実行結果

```
Tests  20 passed (20)
Test Files  1 passed (1)
```

### 受入基準 AC-001〜AC-006 確認

| AC     | 基準                                                                        | 状態                           |
| ------ | --------------------------------------------------------------------------- | ------------------------------ |
| AC-001 | responsibility-boundary.md に単体/統合境界が明文化されている                | 完了                           |
| AC-002 | rapid click 再現テスト（TC-06相当）が実装済みで PASS                        | 完了                           |
| AC-003 | rerender 回帰テスト（TC-07相当）が実装済みで PASS                           | 完了                           |
| AC-004 | onOpenSkillWizard/onOpenWizard/handleSessionStartNew 非発火保証テストが存在 | 完了                           |
| AC-005 | 新規テストケースが CI で PASS                                               | 完了（20/20 PASS）             |
| AC-006 | traceability マトリクス更新済み                                             | 完了（spec-extraction-map.md） |

### 保証点カバレッジ

| 保証点                     | テスト数 | カバレッジ |
| -------------------------- | -------- | ---------- |
| GP-01（rapid click）       | 3        | 100%       |
| GP-02（rerender）          | 4        | 100%       |
| GP-03（onOpenSkillWizard） | 4        | 100%       |
| GP-04（onOpenWizard）      | 3        | 100%       |
| GP-05（マウント境界）      | 2        | 100%       |
