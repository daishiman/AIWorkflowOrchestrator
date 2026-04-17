# Phase 12: Unassigned Task Detection

## 作成日

2026-04-16

---

## TODO/FIXME/HACK/XXX スキャン結果

```bash
rg -n "TODO|FIXME|HACK|XXX" .github/workflows/ci.yml apps/backend/vitest.config.ts codecov.yml
# → 0件
```

**結果**: 対象ファイルに TODO/FIXME/HACK/XXX なし

---

## 未タスク判定

- `codecov.yml` の backend flag は追加済み
- `artifacts.json` / `outputs/artifacts.json` の parity も実装済み
- Phase 11/12 の内容で新規の unassigned task は不要

---

## 将来の改善候補（未タスク）

| 改善案                                        | 優先度 | 備考                            |
| --------------------------------------------- | ------ | ------------------------------- |
| coverage ジョブの timeout 観測を継続する      | 低     | 実際の main push CI を見て調整  |
| `test-web` main push 実行時間の推移を記録する | 低     | 初回 main push の観測結果を残す |
| Codecov の PR コメント自動投稿                | 低     | 必要になった場合のみ検討        |

**未タスクとして正式登録するものは現時点でなし。**
