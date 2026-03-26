# [#1529] [UT-06-002-UT-3] calcExpiresAtLocal 重複解消

## メタ情報

```yaml
issue_number: 1529
title: [UT-06-002-UT-3] calcExpiresAtLocal 重複解消
state: OPEN
priority: 低
scale: -
category: リファクタリング
status: 未実施
created_date: 2026-03-23
updated_date: 2026-03-23
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1529
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`PermissionStore.ts` 内の `calcExpiresAtLocal` が `@repo/shared` の `calcExpiresAt` と完全に同一ロジック。ESM/CJS モジュール解決問題を調査し、`@repo/shared` からの直接インポートに切り替える。

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

---

**元タスク**: UT-06-002 | **検出日**: 2026-03-23
