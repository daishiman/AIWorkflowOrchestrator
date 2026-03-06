# Phase 5 ロールバック手順確認

## ロールバック方針

- Step 1/2 の rollback はコード削除ではなく feature flag 切替で実施する。
- Step 3 の `AppDock` 削除は未実施のため、Git 復元は現時点では不要。

## Step 1: 並行稼働 rollback

| 手順 | 実施内容                                                  | 成功条件                                      |
| ---- | --------------------------------------------------------- | --------------------------------------------- |
| 1    | `VITE_USE_GLOBAL_NAV_STRIP=false` を設定する              | 起動後に新ナビではなく `AppDock` が表示される |
| 2    | desktop で `dashboard` / `chat` / `settings` を切り替える | legacy 導線が従来どおり動作する               |
| 3    | mobile 幅で起動する                                       | 下部に legacy `AppDock` が表示される          |
| 4    | `pnpm --dir apps/desktop typecheck` を実行する            | PASS                                          |

### 想定コマンド

```bash
VITE_USE_GLOBAL_NAV_STRIP=false pnpm --dir apps/desktop dev
```

## Step 2: AppLayout 導入後 rollback

| 手順 | 実施内容                                     | 判定                                            |
| ---- | -------------------------------------------- | ----------------------------------------------- |
| 1    | feature flag を `false` にして起動する       | `App.tsx` の legacy 分岐で `AppDock` が使われる |
| 2    | window resize を desktop/mobile 間で往復する | 既存ナビ経路で操作不能が起きない                |
| 3    | shortcut を入力欄外で確認する                | legacy path でも誤発火が増えていない            |

## Step 3: AppDock 削除 rollback

| 項目                            | 状態           |
| ------------------------------- | -------------- |
| `AppDock` ディレクトリ削除      | 未実施         |
| `USE_GLOBAL_NAV_STRIP` 分岐削除 | 未実施         |
| Git 復元手順                    | 現時点では不要 |

## 監視ポイント

- rollback 時は `MoreMenu` 状態が legacy path に残留しないこと。
- `uiSlice.currentView` と `navigationSlice.viewHistory` が従来経路で破綻しないこと。
- Step 3 実施前に `grep -rn "AppDock" apps/desktop/src/renderer` を再実行して依存棚卸しをやり直すこと。

## 判定

- Phase 5 時点の rollback readiness は **PASS**。
- ただし Step 3 の削除 rollback は未評価であり、Phase 8/10 の判定が必要。
