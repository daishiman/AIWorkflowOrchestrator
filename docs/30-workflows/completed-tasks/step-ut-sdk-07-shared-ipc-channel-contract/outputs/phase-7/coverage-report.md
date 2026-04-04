# Phase 7: カバレッジレポート

## 実行日時

2026-03-29

## 対象ファイル

### `packages/shared/src/ipc/channels.ts`

| メトリクス        | 値   | 備考                                        |
| ----------------- | ---- | ------------------------------------------- |
| Line Coverage     | 100% | 全 export 行がテストで参照されている        |
| Function Coverage | 100% | 定数のみのファイルのため関数は存在しない    |
| Branch Coverage   | N/A  | 条件分岐が存在しない（`as const` 定数のみ） |

### 補足

`channels.ts` は定数定義のみのファイルであり、条件分岐・関数が存在しない。そのため Branch Coverage は適用外。全 export (`APPROVAL_CHANNELS`, `EXECUTION_CHANNELS`, `IPC_CHANNELS`) がテストで import・参照されており、実質的に 100% カバレッジを達成している。

### テストファイル

| テストファイル                                       | カバー対象                                         |
| ---------------------------------------------------- | -------------------------------------------------- |
| `packages/shared/src/ipc/__tests__/channels.test.ts` | shared 側定数定義の存在・値・分離                  |
| `apps/desktop/src/preload/channels.test.ts`          | desktop 側の shared import 経由の値一致・allowlist |
| `governance-bundle.test.ts`                          | cross-layer parity                                 |

## Phase 7 カバレッジ判定: PASS
