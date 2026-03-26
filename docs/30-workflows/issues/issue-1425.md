# [#1425] [UT-CLEANUP-RUNTIME-RESOLVER-001] RuntimeResolver deprecated 削除

## タスク概要

全 surface の IRuntimePolicyResolver 移行完了後に `RuntimeResolver.ts` を削除する。

## メタ情報

- **タスクID**: UT-CLEANUP-RUNTIME-RESOLVER-001
- **優先度**: 低
- **分類**: cleanup
- **依存**: 全 surface の IRuntimePolicyResolver 移行完了
- **関連**: DD-1、contract-matrix.md § 5

## 廃止トリガー

`grep -rn "RuntimeResolver" apps/desktop/src/` の結果が RuntimeResolver.ts 本体のみ

## 仕様書

`docs/30-workflows/unassigned-task/UT-CLEANUP-RUNTIME-RESOLVER-001.md`
