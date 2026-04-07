# Phase 1 成果物: 要件定義書

## タスク概要

TASK-UI-03-REMAINING: IPC renderer 移行完了

## P50チェック結果: 既実装状態の調査

### 旧経路使用箇所（grep結果）

```
apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx:73:
  await window.electronAPI.skillCreator.applyRuntimeImprovement(

apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx:93:
  "window.electronAPI.skillCreator.getGovernanceState が利用できません"
  （エラーメッセージ文字列）
```

### skillCreatorAPI 公開状況（preload/index.ts）

```
630: contextBridge.exposeInMainWorld("electronAPI", electronAPI);
640: contextBridge.exposeInMainWorld("skillCreatorAPI", skillCreatorAPI);
427: skillCreator: skillCreatorAPI,  ← electronAPI内の互換シム
663: window.skillCreatorAPI = skillCreatorAPI;
```

### 移行先API存在確認（skill-creator-api.ts）

- `applyRuntimeImprovement`: line 196, 552 に存在 ✅
- `getGovernanceState`: line 228, 582 に存在 ✅

## Task 1: 旧経路使用箇所の完全列挙

| ファイル                                                                              | 行        | 使用メソッド                                 | コンテキスト        |
| ------------------------------------------------------------------------------------- | --------- | -------------------------------------------- | ------------------- |
| `apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx`             | 73        | `applyRuntimeImprovement`                    | Skill改善提案の適用 |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx` | 18-23, 93 | `getGovernanceState` 参照 + エラーメッセージ | ガバナンス状態取得  |

追加使用箇所: **なし**（rendererディレクトリ内のテストファイルを除く）

## Task 2: 移行先API存在確認

| メソッド                  | 存在確認 | 型定義場所                                            |
| ------------------------- | -------- | ----------------------------------------------------- |
| `applyRuntimeImprovement` | ✅ 存在  | `SkillCreatorAPI` interface (skill-creator-api.ts:60) |
| `getGovernanceState`      | ✅ 存在  | `SkillCreatorAPI` interface (skill-creator-api.ts:60) |

Phase 2 でのインターフェース追加は **不要**。

## Task 3: 受入条件の確定

| AC   | 条件                                                                            | 検証方法       |
| ---- | ------------------------------------------------------------------------------- | -------------- |
| AC-1 | `ImprovementProposalPanel.tsx` が `window.skillCreatorAPI` 経路を使用           | コードレビュー |
| AC-2 | `GovernanceSummaryPanel.tsx` が `window.skillCreatorAPI` 経路を使用             | コードレビュー |
| AC-3 | `grep "window.electronAPI.skillCreator" renderer/` の結果が0件                  | grep検索       |
| AC-4 | IPC分離契約設計ドキュメントが `outputs/phase-2/design-document.md` に存在       | ファイル確認   |
| AC-5 | チャネル命名規則ガイドラインが `outputs/phase-6/channel-naming-guide.md` に存在 | ファイル確認   |
| AC-6 | `pnpm --filter @repo/desktop typecheck` がエラーなし                            | typecheck      |
| AC-7 | `pnpm --filter @repo/desktop lint` がエラーなし                                 | lint           |
| AC-8 | 既存テスト全て PASS                                                             | CI             |

## スコープ

- **含む**: 2コンポーネントのIPC経路移行、IPC分離契約設計ドキュメント作成、チャネル命名規則ガイドライン作成
- **含まない**: 新規IPCチャネルの追加、UIコンポーネントのリデザイン、WorkflowEngine変更

## 完了確認

- [x] 旧経路使用箇所の完全列挙（2ファイル確認、追加箇所なし確認）
- [x] 移行先API（`applyRuntimeImprovement`、`getGovernanceState`）の存在確認
- [x] AC-1〜AC-8 が定義されている
- [x] 含む/含まないが明確
