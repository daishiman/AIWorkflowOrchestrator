# [#1682] [UT] Task07 shared IPCチャンネルコントラクト同期

## メタ情報

```yaml
issue_number: 1682
title: [UT] Task07 shared IPCチャンネルコントラクト同期
state: OPEN
priority: 中
scale: -
category: -
status: 未実施
created_date: 2026-03-27
updated_date: 2026-03-27
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1682
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | -      |
| ステータス | 未実施 |

---

## タスクID

UT-SDK-07-SHARED-IPC-CHANNEL-CONTRACT-001

## 目的

`packages/shared/src/ipc/channels.ts` を desktop preload 実装と同期し、Task07 が再利用する shared channel contract を正本化する。

## 対象ファイル

- `packages/shared/src/ipc/channels.ts`
- `apps/desktop/src/preload/channels.ts`
- 関連仕様書

## 完了条件

- `approval:*` と `execution:get-disclosure-info` の contract drift が解消される
- Skill Creator runtime 系 channel の shared 正本が明文化される
- 仕様書とコードの命名が一致する

## 発生元

TASK-SDK-07 Phase 12 再監査
