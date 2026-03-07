# Phase 8 再利用ガードパターン

## パターン名

`canonical-active-set -> derived-ledger-sync -> current-only-audit`

## 手順

1. canonical ledger から active/completed を導出する
2. derived ledger を同じ集合へ同期する
3. validator で集合一致を確認する
4. `verify-unassigned-links` で参照切れを確認する
5. `audit --diff-from HEAD` で current 判定だけを合否に使う
