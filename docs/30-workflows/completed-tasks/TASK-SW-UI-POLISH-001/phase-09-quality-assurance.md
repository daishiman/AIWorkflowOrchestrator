# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 9                                                                              |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 8 完了済み（リファクタリング完了）                                       |
| 状態     | 未着手                                                                         |

## 目的

CI 相当の品質チェックを一括実施し、Phase 10（最終レビュー）に進む準備を整える。typecheck / lint / test / 静的監査の全チェックを通過させる。

---

## 実行タスク

- TypeScript 型チェック実行
- ESLint チェック実行
- テスト全件実行
- CSS 変数監査（ハードコード残存なし確認）
- `any` 型残存確認

---

## チェックコマンド

```bash
# 1. TypeScript 型チェック（エラーゼロ）
pnpm --filter @repo/desktop typecheck

# 2. ESLint チェック（エラーゼロ）
pnpm --filter @repo/desktop lint

# 3. テスト全件実行（全件パス）
pnpm --filter @repo/desktop test

# 4. bg-blue-* 残存確認（0件であること）
echo "=== CSS ハードコードカラー残存確認 ==="
grep -rn "bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx" || echo "✅ 残存なし"

# 5. hover:bg-blue-* 残存確認（0件であること）
grep -rn "hover:bg-blue-" apps/desktop/src/renderer/components/skill/ --include="*.tsx" || echo "✅ 残存なし"

# 6. any 型残存確認（修正対象ファイル）
echo "=== any 型残存確認 ==="
grep -n " any " \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx \
  apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx \
  apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx \
  2>/dev/null || echo "✅ any 型なし"
```

---

## 品質チェック結果記録

| チェック項目               | コマンド                                     | 期待結果           | 実際の結果 | 判定 |
| -------------------------- | -------------------------------------------- | ------------------ | ---------- | ---- |
| TypeScript 型チェック      | `pnpm --filter @repo/desktop typecheck`      | エラーゼロ         | -          | -    |
| ESLint                     | `pnpm --filter @repo/desktop lint`           | エラーゼロ         | -          | -    |
| テスト全件                 | `pnpm --filter @repo/desktop test`           | 全件 PASS          | -          | -    |
| `bg-blue-*` 残存確認       | `grep -rn "bg-blue-" skill/ --include=*.tsx` | 0 件               | -          | -    |
| `hover:bg-blue-*` 残存確認 | `grep -rn "hover:bg-blue-" ...`              | 0 件               | -          | -    |
| `any` 型残存確認           | `grep -n " any " ...`                        | 0 件（新規追加分） | -          | -    |

---

## 品質判定基準

| 判定 | 条件                                                  |
| ---- | ----------------------------------------------------- |
| PASS | 全チェック項目がエラーゼロ・0件・全件パス             |
| FAIL | 1つ以上のチェック項目でエラー・残存・テスト失敗がある |

FAIL の場合は Phase 5（実装）または Phase 8（リファクタリング）に差し戻す。

---

## Phase 9 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過
- [ ] `pnpm --filter @repo/desktop test` が全件パス
- [ ] `bg-blue-*` のハードコードクラスがウィザード関連ファイルに存在しない（0件）
- [ ] `hover:bg-blue-*` のハードコードクラスが存在しない（0件）
- [ ] `any` 型の新規使用がない
- [ ] 品質チェック結果記録テーブルが埋まっている
