# Phase 7: カバレッジ確認

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. カバレッジ対象範囲（変更ファイルのみ）

| ファイル                    | 対象関数/ブロック                                                            | 目標                    |
| --------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `store/types.ts`            | ViewType 型定義（コンパイル確認のみ）                                        | 型チェック PASS         |
| `App.tsx`                   | `renderView()` の `case "skillManagement"` / dock 正規化（desktop / mobile） | line 100% / branch 100% |
| `useSkillCenter.ts`         | `navigateToSkillManagement`                                                  | line 100% / branch 100% |
| `SkillCenterView/index.tsx` | 「スキル管理」ボタンの render / onClick                                      | line 100%               |
| `SkillManagementPanel.tsx`  | `onClose` / 戻るボタン / fallback                                            | line 100% / branch 100% |

---

## 2. カバレッジコマンド

```bash
# 変更ファイルに絞ったカバレッジ計測
pnpm --filter @repo/desktop vitest run --coverage \
  --coverage.include="src/renderer/App.tsx" \
  --coverage.include="src/renderer/views/SkillCenterView/**" \
  --coverage.include="src/renderer/components/skill/SkillManagementPanel.tsx" \
  --coverage.include="src/renderer/store/types.ts"
```

---

## 3. 未カバー分析計画

| ケース                                            | 対応方針                                                        |
| ------------------------------------------------- | --------------------------------------------------------------- |
| `SkillManagementPanel` 内の lifecycle/create 切替 | `SkillManagementPanel.route-classification.test.tsx` で継続担保 |
| `skillCreate` の主導線保持                        | Phase 6 の RG-01 でカバー                                       |
| `AppDock` の active state 正規化                  | Phase 4 の TC-03 でカバー                                       |
| `header-management-cta` の表示/クリック           | Phase 4 の TC-05 でカバー                                       |

---

## Phase 7 完了確認

- [ ] 変更ブロックの line カバレッジ 100% 確認
- [ ] 変更ブロックの branch カバレッジ 100% 確認
- [ ] カバレッジレポート保存（`outputs/phase-7/coverage-report.md`）
