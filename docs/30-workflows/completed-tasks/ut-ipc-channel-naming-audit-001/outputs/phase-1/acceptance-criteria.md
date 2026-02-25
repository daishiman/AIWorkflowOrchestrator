# Phase 1 受け入れ基準

## 受け入れ基準（機械検証接続済み）

| ID    | 基準             | 検証方法                                                                                            | 合格条件                                                                          |
| ----- | ---------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------ |
| AC-01 | 監査対象の固定   | `test -f apps/desktop/src/preload/channels.ts`                                                      | 0終了                                                                             |
| AC-02 | チャネル抽出可能 | `rg -n '^[[:space:]]+[A-Z0-9_]+:\s*"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts \| wc -l` | 1以上                                                                             |
| AC-03 | 重複なし         | `rg -o '"[a-zA-Z0-9:-]+"' apps/desktop/src/preload/channels.ts \| sort \| uniq -d \| wc -l`         | 0                                                                                 |
| AC-04 | 命名規則判定実施 | `node` 集計スクリプト（Phase 5で固定化）                                                            | 全`skill:`に判定付与                                                              |
| AC-05 | 3層参照追跡可能  | `rg -n 'IPC_CHANNELS\.                                                                              | skill:' apps/desktop/src/main apps/desktop/src/preload apps/desktop/src/renderer` | 根拠採取可能 |

## 判定ゲート

- PASS: AC-01〜AC-05が全て満たされる。
- MINOR: 対象パス差分があるが代替参照が明示済み。
- MAJOR: 監査対象が特定不能。

## 次Phase連携

- Phase 2 の `audit-design.md` に AC-ID をそのまま継承する。
