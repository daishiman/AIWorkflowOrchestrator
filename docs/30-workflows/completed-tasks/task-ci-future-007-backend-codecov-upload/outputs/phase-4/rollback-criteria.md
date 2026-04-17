# Phase 4: ロールバック基準 (rollback-criteria)

## 作成日

2026-04-16

---

## ロールバック判定基準

| 条件                                                                 | 対応                                                         |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| `ci.yml` の YAML 構文エラー                                          | 変更を元に戻す（git restore）                                |
| PR の CI で `--coverage` が付与されていた                            | 条件分岐の実装を修正（AC-5 違反）                            |
| `desktop` フラグのアップロードが消失した                             | coverage ジョブの変更を元に戻す（desktop 回帰）              |
| main push で `backend-coverage-*` アーティファクトが生成されなかった | `vitest.config.ts` の `enabled` フラグまたは reporter を確認 |
| `coverage` ジョブが `timeout-minutes: 5` を超過した                  | アーティファクトサイズ削減または timeout-minutes を引き上げ  |

---

## ロールバック対象ファイル

1. `apps/backend/vitest.config.ts`
2. `.github/workflows/ci.yml`

---

## ロールバックコマンド（参考）

```bash
# 変更を確認してから戻す場合
git diff apps/backend/vitest.config.ts
git diff .github/workflows/ci.yml

# ロールバック（必要な場合のみ）
git restore apps/backend/vitest.config.ts
git restore .github/workflows/ci.yml
```
