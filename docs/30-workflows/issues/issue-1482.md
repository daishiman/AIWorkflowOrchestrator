# [#1482] [UT-SC-01-DIP-INTERFACE] registerSkillCreatorHandlers の DIP 準拠インターフェース化

## メタ情報

```yaml
issue_number: 1482
title: [UT-SC-01-DIP-INTERFACE] registerSkillCreatorHandlers の DIP 準拠インターフェース化
state: OPEN
priority: 低
scale: -
category: -
status: 未実施
created_date: 2026-03-22
updated_date: 2026-03-22
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1482
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

`registerSkillCreatorHandlers()` と `registerRuntimeSkillCreatorHandlers()` の引数型が具象クラス (`SkillCreatorService` / `RuntimeSkillCreatorFacade`) に依存している (P61 DIP違反)。インターフェースに変更する。

## 発生元

- タスク: TASK-SC-01-IPC-WIRING-FIX
- Phase: 10 (最終レビュー MINOR-2)
- 検出日: 2026-03-22
- 関連: P61 (`.claude/rules/06-known-pitfalls.md#P61`)

## 影響範囲

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`

## 対応方針

1. `ISkillCreatorService` / `IRuntimeSkillCreatorFacade` インターフェースを定義
2. ハンドラ登録関数の引数型をインターフェースに変更
3. 既存テストが全 PASS することを確認

## 指示書

`docs/30-workflows/unassigned-task/UT-SC-01-DIP-INTERFACE.md`
