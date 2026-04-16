# needs依存グラフ確認記録 - Phase 7

## 確認日時

2026-04-16

## build依存グラフ確認

```bash
$ grep -A 20 "^  build:" .github/workflows/ci.yml | grep -E "needs|verify-ipc"
    needs:
        verify-ipc-4layer,
```

**結果**: `build` ジョブの `needs` リストに `verify-ipc-4layer` が含まれていることを確認。

## continue-on-error 削除確認

```bash
$ grep -n "continue-on-error" .github/workflows/ci.yml
409:        continue-on-error: true
```

**結果**: `verify-ipc-4layer` ジョブレベルの `continue-on-error` は存在しない（削除済み）。
409行目は `security` ジョブのステップレベル設定 → 意図的な設定のため削除対象外。

## coverage条件付き実行確認

```bash
$ grep -A 8 "^  coverage:" .github/workflows/ci.yml | grep -E "if:|needs:"
    needs: [test-shared, test-desktop]
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

**結果**: `coverage` ジョブは `push` の `main` でのみ実行される。`pull_request` では `skipped` が正常。

## ブロッキング連鎖設計

```
verify-ipc-4layer (FAIL)
     ↓ needs
build (SKIP/FAIL)   ← IPC違反があれば最終ビルドゲートがブロックされる
```

## Phase末端アクション確認

- [x] `verify-ipc-4layer` が `build` ジョブの `needs` に含まれていることを確認した
- [x] `continue-on-error` が `verify-ipc-4layer` ジョブに**存在しない**ことを確認した
- [x] `coverage` ジョブが `push` の `main` でのみ実行されることを確認した
