# UT-SC-05-APPLY-IMPROVEMENT-UI: 改善提案 承認/適用 UI

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | UT-SC-05-APPLY-IMPROVEMENT-UI   |
| 優先度     | Medium                          |
| 検出元     | TASK-SC-05-IMPROVE-LLM Phase 12 |
| ステータス | 未実施                          |

## 概要

`RuntimeSkillCreatorFacade.applyImprovement()` は Main Process に実装済みだが、Renderer 側で改善提案の一覧表示・個別承認・適用を行う UI コンポーネントが未実装。また IPC ハンドラ `skill-creator:apply-improvement` も未登録。

## 実装内容

1. IPC ハンドラ `skill-creator:apply-improvement` を `skillCreatorHandlers.ts` に追加
2. Preload API に `applyImprovement` メソッドを追加
3. Renderer 側に改善提案一覧コンポーネント（section/before/after/reason 表示 + チェックボックス選択）を作成
4. 選択した提案のみを適用する UI フローを実装

## 修正対象ファイル

- `apps/desktop/src/main/handlers/skillCreatorHandlers.ts`
- `apps/desktop/src/preload/skill-api.ts`
- `apps/desktop/src/preload/channels.ts`
- `apps/desktop/src/renderer/` 配下（新規コンポーネント）

## 受入基準

- [ ] 改善提案一覧が diff 形式で表示される
- [ ] 個別提案の承認/拒否が選択できる
- [ ] 承認した提案のみが SKILL.md に適用される
- [ ] 適用結果（applied/skipped）がユーザーに表示される
