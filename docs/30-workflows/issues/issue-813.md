# [#813] fix: IPC レスポンスラッパー未展開修正（importedSkills.forEach クラッシュ）

## メタ情報

```yaml
issue_number: 813
title: fix: IPC レスポンスラッパー未展開修正（importedSkills.forEach クラッシュ）
state: CLOSED
priority: 高
scale: -
category: -
status: -
created_date: 2026-02-13
updated_date: 2026-02-13
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/813
dependencies: []
```

| 項目       | 内容 |
| ---------- | ---- |
| 優先度     | 高   |
| 規模       | -    |
| ステータス | -    |

---

## タスクID

UT-FIX-IPC-RESPONSE-UNWRAP-001

## 優先度

🔴 高

## 概要

AgentView コンポーネントで `importedSkills.forEach is not a function` ランタイムエラーが発生。

## 根本原因

Main Process の IPC ハンドラ（`skillHandlers.ts`）が `{ success: true, data: skills }` 形式でレスポンスを返すが、Preload 層の `safeInvoke<T>()` がこのラッパーオブジェクトをそのまま通過させる。型注釈は `Promise<ImportedSkill[]>` と宣言しているが、実行時の値は `{ success: boolean, data: ImportedSkill[] }` である。

## 影響範囲

- `skill.getImported()` → `importedSkills` が配列でない → AgentView クラッシュ
- `skill.list()` → `availableSkillsMetadata` も同様の問題の可能性
- `skill.import()`, `skill.rescan()` も同じパターン

## 修正方針

Preload 層の `skill-api.ts` でレスポンスラッパーを展開して `data` フィールドを返す。

## 関連ファイル

- `apps/desktop/src/renderer/views/AgentView/index.tsx:151`
- `apps/desktop/src/preload/skill-api.ts:192-200`
- `apps/desktop/src/main/ipc/skillHandlers.ts:94-115`
- `apps/desktop/src/renderer/store/slices/agentSlice.ts:556-577`

## 関連Pitfall

P19（型キャスト）, P23（API二重定義の型管理）, P24（Store型定義不統一）

## タスク仕様書

`docs/30-workflows/unassigned-task/task-ut-fix-ipc-response-unwrap-001.md`

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
