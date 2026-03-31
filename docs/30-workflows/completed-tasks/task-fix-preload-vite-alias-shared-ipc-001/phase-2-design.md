# Phase 2: 設計

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 2                                          |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 目的

build/test の alias parity を最小差分で回復する設計を確定する。

## 設計方針

### preload build

`externalizeDepsPlugin({ exclude: ["@repo/shared"] })` を使って shared subpath の external 化を止め、
`resolve.alias` で `@repo/shared/src/ipc/channels` を `../../packages/shared/src/ipc/channels.ts` へ固定する。

### test runtime

`vitest.config.ts` にも同じ alias を追加し、`governance-bundle.test.ts` の relative import workaround を shared alias へ戻す。

## 変更対象

| ファイル                                                                     | 変更内容                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/electron.vite.config.ts`                                       | preload に `exclude + resolve.alias` を追加 |
| `apps/desktop/vitest.config.ts`                                              | `resolve.alias` に shared IPC path を追加   |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 相対 import を shared alias へ置換          |

## 副作用分析

| 観点              | 判定     | 理由                                   |
| ----------------- | -------- | -------------------------------------- |
| main / renderer   | 影響なし | preload / test 設定のみを変更          |
| shared 他サブパス | 影響なし | alias は `channels.ts` 完全一致のみ    |
| 型安全性          | 影響なし | tsconfig の path 定義は既存利用        |
| 保守性            | 改善     | 7 階層相対パス workaround を除去できる |

## テスト戦略

1. build 出力で `require("@repo/shared/src/ipc/channels")` が 0 件であることを確認する
2. build 出力で `skill:list` が残ることを確認する
3. targeted vitest で static / dynamic の両 import が PASS することを確認する

## 成果物

| 成果物 | パス                                     |
| ------ | ---------------------------------------- |
| 設計書 | `outputs/phase-2/architecture-design.md` |
