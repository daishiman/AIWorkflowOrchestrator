# [#1513] "[UT-SC-01-IPCRESULT-DEDUP] IpcResult 型の二重定義解消"

## メタ情報

```yaml
task_id: UT-SC-01-IPCRESULT-DEDUP
task_name: IpcResult 型の二重定義解消
category: リファクタリング
target_feature: -
priority: 低
scale: 小規模
status: 未着手
source_phase: -
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/UT-SC-01-IPCRESULT-DEDUP.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 概要

`IpcResult<T>` インターフェースが `skillCreatorHandlers.ts` と `creatorHandlers.ts` の両方に定義されている。共通の場所に抽出して一元管理すべき。

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `apps/desktop/src/main/ipc/types.ts` に `IpcResult<T>` を定義
2. 両ファイルから重複定義を削除し、共通型をインポート
3. 既存テストが全 PASS することを確認
