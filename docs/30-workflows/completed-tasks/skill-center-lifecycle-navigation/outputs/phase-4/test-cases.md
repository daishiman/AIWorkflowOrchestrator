# Phase 4 出力: テスト作成

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

### 追加・修正テストファイル

| ファイル                            | 変更内容                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useSkillCenter.navigation.test.ts` | TC-05/TC-06 追加（navigateToSkillManagement）                                                                                                    |
| `SkillCenterView.cta.test.tsx`      | TC-04/TC-04b〜f/TC-05 追加、createBaseHookValue に navigateToSkillManagement・importedSkillNames 追加、TC-CTA-08 を header-row testid 参照に更新 |
| `App.renderView.viewtype.test.tsx`  | TC-02/TC-03 追加（skillManagement case / dock 正規化）、AppLayout mock に data-current-view 属性追加                                             |

### テスト結果

```
Test Files  5 passed (5)
Tests       75 passed (75)
```

- useSkillCenter.navigation.test.ts: 6 PASS
- SkillCenterView.cta.test.tsx: 35 PASS
- App.renderView.viewtype.test.tsx: 18 PASS
- SkillManagementPanel.integration.test.tsx: 既存 PASS
- SkillManagementPanel.route-classification.test.tsx: 既存 PASS
