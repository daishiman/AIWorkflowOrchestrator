# coverage-report.md

## Phase 6: テスト拡充 カバレッジレポート

### 追加テストケース一覧

| テストID                                             | カテゴリ     | 状態 |
| ---------------------------------------------------- | ------------ | ---- |
| AUTH-REGRESS-INTEGRATION-01（onOpenSkillWizard境界） | 統合境界     | PASS |
| AUTH-REGRESS-INTEGRATION-01（onOpenWizard境界）      | 統合境界     | PASS |
| AUTH-REGRESS-INTEGRATION-02（マウント直後）          | マウント境界 | PASS |
| AUTH-REGRESS-INTEGRATION-02（アンマウント後）        | マウント境界 | PASS |
| AUTH-REGRESS-EDGE-01（skillError状態）               | エッジケース | PASS |
| AUTH-REGRESS-EDGE-02（isGenerating rapid click）     | エッジケース | PASS |
| AUTH-REGRESS-EDGE-03（空 arrow function）            | エッジケース | PASS |
| AUTH-REGRESS-EDGE-04（複数回 rerender 安定性）       | エッジケース | PASS |

### 全テスト実行結果

```
Tests  20 passed (20)
Test Files  1 passed (1)
```

### カバレッジ観点整理

| 保証点                     | カバー状態 | 担当テスト                              |
| -------------------------- | ---------- | --------------------------------------- |
| rapid click 非発火         | 完全カバー | TC-06×2 + EDGE-02                       |
| rerender 非発火            | 完全カバー | TC-07×3 + EDGE-04                       |
| onOpenSkillWizard 非発火   | 完全カバー | GUARD-01a + INTEGRATION-01 + EDGE-01/03 |
| onOpenWizard 非発火        | 完全カバー | GUARD-01b + INTEGRATION-01              |
| マウント・アンマウント境界 | 完全カバー | INTEGRATION-02×2                        |
