# [#1718] [UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001] AdapterStatus リアルタイム更新をポーリングからサブスクリプションへ移行

## メタ情報

```yaml
issue_number: 1718
title: [UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001] AdapterStatus リアルタイム更新をポーリングからサブスクリプションへ移行
state: OPEN
priority: 低
scale: -
category: -
status: -
created_date: 2026-03-29
updated_date: 2026-03-29
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1718
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 低   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

`ApiKeysSection` が LLM アダプター状態を mount 時ポーリングで取得している現行設計を、IPC push イベント（`llm:adapter-status-changed`）によるサブスクリプション方式へ移行する。

## 背景

TASK-RT-02-API-KEY-UI-ADAPTER-STATUS で `AdapterStatusBadge` / `RetryButton` を実装した際、設計方針として「新規 IPC チャネルを追加しない（Settings 局所状態 + 既存 public IPC 再利用）」を採択した。この方針により mount 時ポーリングを選択したが、バックグラウンドでのアダプター状態変化が UI に自動反映されないトレードオフが生じている。

## 対象ファイル

- `packages/shared/src/ipc/channels.ts` — `LLM_CHANNELS` 追加
- `apps/desktop/src/main/services/runtime/LLMAdapterFactory.ts` — push イベント発火
- `apps/desktop/src/preload/skill-creator-api.ts` — `onAdapterStatusChanged` 追加
- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx` — subscription 対応

## 完了条件

- [ ] アダプター状態変化時に push イベントが発火される
- [ ] `ApiKeysSection` が手動操作なしでリアルタイム更新される
- [ ] 単体テストで push → UI 更新の経路が確認される

## 仕様書

`docs/30-workflows/unassigned-task/UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001.md`

## 苦戦箇所（前タスクからの知見）

- RuntimeSkillCreatorFacade の private 状態を Settings UI に露出すると責務汚染が起きる → Settings 側は public IPC のみを使用すること
- Settings と SkillLifecyclePanel でアダプター状態取得が重複する → Jotai atom に single source of truth を持つ設計を推奨
