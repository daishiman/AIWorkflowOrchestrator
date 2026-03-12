# 影響分析

## 影響範囲

| 影響先                  | 影響内容                                                                   | リスク | 判定   |
| ----------------------- | -------------------------------------------------------------------------- | ------ | ------ |
| task 探索導線           | parent pointer と index から 04A/04B/04C の正本へ到達しやすくなる          | 低     | 改善   |
| system spec 読み取り    | Workspace 04B の証跡 path が completed root にそろう                       | 低     | 改善   |
| Phase 11 capture 再利用 | 04A capture script の workflow root が現実の completed workflow と一致する | 低     | 改善   |
| skill dual-root 運用    | `.claude` / `.agents` の mirror drift を明示的に監査できる                 | 中     | 改善   |
| child workflow 実装     | 影響なし                                                                   | 低     | 非対象 |

## 非影響確認

- `apps/desktop/src/**` の Renderer / Main 実装には変更を加えていない。
- Workspace 04A/04B/04C の screenshot 証跡ファイル自体は変更していない。
- API、IPC、shared types の外部契約は変更していない。

## 残留リスク

| リスク                                              | 条件                                                 | 緩和策                                                                     |
| --------------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- |
| aiworkflow indexes の再生成後に mirror が再びずれる | `generate-index.js` 実行後に rsync を省略する        | `generate-index -> rsync -> diff -qr -> guard` の順を運用手順として固定    |
| pointer docs が再び stale status へ戻る             | completed workflow 移管後に legacy docs だけ更新漏れ | root validator に status-drift を残し、`pending` / `未着手` を fail に固定 |
