# Phase 5 変更ファイル一覧

| パス                                                                                                   | 種別 | 変更内容                                              |
| ------------------------------------------------------------------------------------------------------ | ---- | ----------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecycleSessionCard.tsx`                             | 新規 | session card UI と create / execute / improve handoff |
| `apps/desktop/src/renderer/components/skill/skillButtonStyles.ts`                                      | 新規 | panel と session card の共通 button style             |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`                                  | 更新 | list view 上部へ session card を追加                  |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-session.test.tsx` | 新規 | session card の統合テスト                             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx`                   | 更新 | session card child mock を追加                        |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx`       | 更新 | session card 経由の wizard 遷移に更新                 |
