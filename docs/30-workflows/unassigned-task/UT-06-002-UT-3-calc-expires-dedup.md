# UT-06-002-UT-3: calcExpiresAtLocal 重複解消

| 項目     | 値             |
| -------- | -------------- |
| タスクID | UT-06-002-UT-3 |
| 優先度   | 低             |
| 元タスク | UT-06-002      |
| 検出日   | 2026-03-23     |

---

## 概要

`PermissionStore.ts` 内の `calcExpiresAtLocal` が `@repo/shared` の `calcExpiresAt` と完全に同一ロジック。ESM/CJS モジュール解決問題を調査し、`@repo/shared` からの直接インポートに切り替える。

## 背景・苦戦箇所

UT-06-002 の実装中に `@repo/shared` から `calcExpiresAt` をインポートしたところ、ESM/CJS モジュール解決の問題（Electron main process が CJS、shared が ESM ビルド）が発生。緊急回避策としてローカルコピー（`calcExpiresAtLocal`）を作成した。根本解決には shared パッケージのビルド設定（dual CJS/ESM 出力）の調整が必要。

## 対応方針

1. `packages/shared` の tsconfig.json / package.json の exports フィールドを確認する
2. CJS 互換出力が含まれるよう調整する
3. `calcExpiresAtLocal` を削除し `import { calcExpiresAt } from "@repo/shared"` に置換する

## 変更対象ファイル

| ファイル                                                  | 変更種別     |
| --------------------------------------------------------- | ------------ |
| `apps/desktop/src/main/services/skill/PermissionStore.ts` | 修正         |
| `packages/shared/package.json`                            | 修正の可能性 |

## 完了条件

- [ ] calcExpiresAtLocal が削除されている
- [ ] @repo/shared の calcExpiresAt が Electron main process で正常にインポートできる
- [ ] 関連テストが PASS する
