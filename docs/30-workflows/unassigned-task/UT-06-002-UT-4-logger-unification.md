# UT-06-002-UT-4: permission-store-handlers ロガー統一

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-4 |
| 優先度   | 低             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`permission-store-handlers.ts` 内の `console.error`/`console.info` を `electron-log` に統一する。PermissionStore.ts 側は既に electron-log を使用しており、ハンドラ側だけ console が残っている。

## 背景・苦戦箇所

既存コードが console を使用しており、UT-06-002 の新規ハンドラ（clear-session）も既存パターンに合わせて console を使用した。一貫性のため全ハンドラを electron-log に統一する必要がある。PermissionStore.ts 側では既に `import log from "electron-log"` が導入済みであるのに対し、ハンドラ側だけが `console.error`/`console.info` を使用している状態が継続している。

## 対応方針

`import log from "electron-log"` を追加し、`console.error` → `log.error`、`console.info` → `log.info` に置換する。ログレベルは元のコンテキストに合わせて適切に維持する（エラー系は `log.error`、情報系は `log.info`）。

## 変更対象ファイル

| ファイル                                                 | 変更種別 |
| -------------------------------------------------------- | -------- |
| `apps/desktop/src/main/ipc/permission-store-handlers.ts` | 修正     |

## 完了条件

- [ ] `console.error`/`console.info` が全て `electron-log` の対応メソッドに置換されている
- [ ] ログレベルが適切である（error は `log.error`、info は `log.info`）
- [ ] 関連テストが PASS する
