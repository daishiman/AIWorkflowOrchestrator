# [#1599] [TASK-SC-14] SkillCreatorRuntimeApi 型の共有パッケージ移行

## メタ情報

```yaml
issue_number: 1599
title: [TASK-SC-14] SkillCreatorRuntimeApi 型の共有パッケージ移行
state: OPEN
priority: 低
scale: -
category: -
status: -
created_date: 2026-03-25
updated_date: 2026-03-25
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1599
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 低   |
| 規模       | -    |
| ステータス | -    |

---

## 概要

`SkillCreatorRuntimeApi` インターフェースをコンポーネントローカルの型定義から `packages/shared` に移行し、Single Source of Truth を確立する。

## 背景

TASK-SC-07 で SkillCreateWizard に LLM 接続を追加した際、`SkillCreatorRuntimeApi` 型をコンポーネント内でローカル定義した。SkillLifecyclePanel にも同様の型が存在し、二重定義による不整合リスクがある。TASK-SC-06 の C-1/C-4 教訓の再発防止策。

## 対応内容

- SkillCreateWizard と SkillLifecyclePanel のローカル型を比較・統合
- `packages/shared/src/types/skill-creator-api.ts` に統一型を定義
- Preload API との完全一致を確認
- 両コンポーネントを shared パッケージからの import に切り替え

## 仕様書

`docs/30-workflows/unassigned-task/TASK-SC-14-SKILL-CREATOR-RUNTIME-API-TYPE-SHARING.md`

## 関連

- 検出元: TASK-SC-07 レビュー（P6: 型の二重管理）
- 関連 Issue: #1588 (TASK-SC-07)
