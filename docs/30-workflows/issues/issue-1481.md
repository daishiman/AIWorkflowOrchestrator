# [#1481] [UT-SC-01-IPCRESULT-DEDUP] IpcResult<T> 型の二重定義解消

## メタ情報

```yaml
issue_number: 1481
title: [UT-SC-01-IPCRESULT-DEDUP] IpcResult<T> 型の二重定義解消
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1481
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`IpcResult<T>` インターフェースが `skillCreatorHandlers.ts` と `creatorHandlers.ts` の両方に定義されている。共通の場所に抽出して一元管理する。

## 発生元

- タスク: TASK-SC-01-IPC-WIRING-FIX
- Phase: 10 (最終レビュー MINOR-1)
- 検出日: 2026-03-22

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `apps/desktop/src/main/ipc/types.ts` に `IpcResult<T>` を定義
2. 両ファイルから重複定義を削除し、共通型をインポート
3. 既存テストが全 PASS することを確認

## 指示書

`docs/30-workflows/unassigned-task/UT-SC-01-IPCRESULT-DEDUP.md`
