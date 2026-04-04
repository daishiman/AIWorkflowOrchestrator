# Phase 9: 品質保証

## TASK-SKILL-CENTER-LIFECYCLE-NAV-001

---

## 1. 品質チェック一覧

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# 全テスト
pnpm --filter @repo/desktop vitest run

# ビルド確認
pnpm --filter @repo/desktop build
```

---

## 2. 判定基準

| 項目                | 合格基準                                                         |
| ------------------- | ---------------------------------------------------------------- |
| TypeScript 型エラー | 0 件                                                             |
| ESLint エラー       | 0 件                                                             |
| テスト FAIL         | 0 件（TC-01〜TC-06 + EC-01〜EC-04 + RG-01〜RG-03 全13項目 PASS） |
| ビルド成功          | エラーなし                                                       |

---

## 3. リスク登録

| リスク                                                | 影響                             | 対策                                                                              |
| ----------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------- |
| `header-create-cta` を誤って `skillManagement` に流す | 主導線の回帰                     | `skillCreate` は固定し、`header-management-cta` を別 CTA として追加               |
| `dockCurrentView` の反映漏れ                          | sidebar の active state が崩れる | `App.tsx` の desktop / mobile दोनोंで `skillManagement` を `skillCenter` に正規化 |
| `SkillManagementPanel` の testid 未定義               | TC-06 が FAIL                    | `data-testid="skill-management-back-button"` を追加                               |
| `SkillManagementPanel` が `onClose` を受け取らない    | close 導線が不安定               | main-shell / advanced route の両方で `onClose` を渡す                             |

---

## Phase 9 完了確認

- [ ] typecheck PASS
- [ ] lint PASS
- [ ] vitest 全 13 項目 PASS
- [ ] build PASS
- [ ] リスク対策完了
